"""Русская озвучка «Зеркальные миры» — локальный нейронный TTS (Piper ru_RU-denis,
через sherpa-onnx), без платных API.

Каждая реплика синтезируется по фразам; паузы между фразами задаются вручную,
чтобы интонация была спокойной, «учительской». Затем:
  * лёгкая обработка (срез НЧ-гула, мягкая «теплота», компрессия, -16 LUFS);
  * обратное распознавание (GigaAM CTC) — проверка произношения и
    тайминги ключевых слов («Земля», «горы», «дерево»…);
  * src/data/voice-manifest.json — фактические длительности и тайминги,
    по которым Remotion строит монтаж (AudioSyncSystem).

Модели скачиваются с GitHub Releases k2-fsa/sherpa-onnx в ~/.cache/mk-tts.
Запуск: python3 -I scripts/voice.py   (pip: sherpa-onnx soundfile scipy)
"""
import json, os, re, subprocess, sys, tarfile, urllib.request
import numpy as np, soundfile as sf, scipy.signal as ss
import sherpa_onnx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.expanduser("~/.cache/mk-tts")
REL = "https://github.com/k2-fsa/sherpa-onnx/releases/download"
TTS_DIR = "vits-piper-ru_RU-denis-medium"  # датасет CC0 (NabuCasa)
ASR_DIR = "sherpa-onnx-nemo-ctc-giga-am-russian-2024-10-24"
SR = 44100
TAKES = 6

# Реплики: (id, время начала в ролике, [(фраза, пауза после, скорость)], ключевые слова)
SCRIPT = json.load(open(os.path.join(ROOT, "src/data/narration.json"), encoding="utf-8"))


def fetch(name, kind):
    d = os.path.join(CACHE, name)
    if not os.path.isdir(d):
        os.makedirs(CACHE, exist_ok=True)
        arc = d + ".tar.bz2"
        print("download", name)
        urllib.request.urlretrieve(f"{REL}/{kind}/{name}.tar.bz2", arc)
        with tarfile.open(arc) as t:
            t.extractall(CACHE, filter="data")
        os.remove(arc)
    return d


def tts_engine():
    d = fetch(TTS_DIR, "tts-models")
    onnx = [f for f in os.listdir(d) if f.endswith(".onnx")][0]
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=os.path.join(d, onnx), tokens=os.path.join(d, "tokens.txt"),
            data_dir=os.path.join(d, "espeak-ng-data"), noise_scale=0.6, noise_scale_w=0.75),
        num_threads=4))
    return sherpa_onnx.OfflineTts(cfg)


def asr_engine():
    d = fetch(ASR_DIR, "asr-models")
    return sherpa_onnx.OfflineRecognizer.from_nemo_ctc(
        model=os.path.join(d, "model.int8.onnx"), tokens=os.path.join(d, "tokens.txt"), num_threads=4)


def trim(x, thr=0.004):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.06 * SR)); b = min(len(x), idx[-1] + int(0.06 * SR))
    return x[a:b]


def synth(tts, text, speed):
    a = tts.generate(text, sid=0, speed=speed)
    x = np.asarray(a.samples, dtype=np.float32)
    if a.sample_rate != SR:
        x = ss.resample_poly(x, SR, a.sample_rate).astype(np.float32)
    return trim(x)


def polish(x):
    # срез гула < 70 Гц, мягкий подъём «тела» ~180 Гц, лёгкое смягчение верхов
    b, a = ss.butter(2, 70 / (SR / 2), "high"); x = ss.lfilter(b, a, x)
    b, a = ss.butter(2, [140 / (SR / 2), 260 / (SR / 2)], "band"); x = x + 0.18 * ss.lfilter(b, a, x)
    b, a = ss.butter(2, 9000 / (SR / 2), "low"); x = 0.85 * ss.lfilter(b, a, x) + 0.15 * x
    return x.astype(np.float32)


def recognize(rec, x):
    y = ss.resample_poly(x, 16000, SR).astype(np.float32)
    s = rec.create_stream(); s.accept_waveform(16000, y); rec.decode_stream(s)
    r = s.result
    # слова и их времена по символьным токенам CTC
    words, cur, t0 = [], "", None
    for tok, t in zip(r.tokens, r.timestamps):
        if tok.strip() == "" or tok == "▁":
            if cur: words.append((cur, t0)); cur = ""
            continue
        if not cur: t0 = t
        cur += tok.replace("▁", "")
    if cur: words.append((cur, t0))
    return r.text, words


def norm(s):
    return re.sub(r"[^а-яё ]", "", s.lower().replace("ё", "е").replace("-", " ")).split()


def cer(a, b):
    a, b = " ".join(norm(a)), " ".join(norm(b))
    d = np.arange(len(b) + 1)
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[len(b)] / max(1, len(a))


def main():
    tts, rec = tts_engine(), asr_engine()
    out_dir = os.path.join(ROOT, "public/audio/voice"); os.makedirs(out_dir, exist_ok=True)
    manifest = {"sampleRate": SR, "voice": "Piper ru_RU denis (medium, CC0 dataset), sherpa-onnx", "lines": []}
    for line in SCRIPT["lines"]:
        # синтез стохастичен: делаем несколько дублей и берём самый разборчивый
        best = None
        for take in range(TAKES):
            parts = []
            for ph in line["phrases"]:
                # "say" — фонетическая запись для синтезатора (ударение «Имра́н»), "text" — как пишется
                parts.append(synth(tts, ph.get("say", ph["text"]), ph.get("speed", SCRIPT["speed"])))
                parts.append(np.zeros(int(ph.get("pause", 0.0) * SR), np.float32))
            x = polish(np.concatenate(parts))
            text = " ".join(p["text"] for p in line["phrases"])
            heard, words = recognize(rec, x)
            e = cer(text, heard)
            if best is None or e < best[0]:
                best = (e, x, heard, words, take)
            if e == 0:
                break
        e, x, heard, words, take = best
        kw = {}
        for k in line.get("keywords", []):
            stem = k.lower()
            hit = next((t for w, t in words if w.lower().replace("ё", "е").startswith(stem)), None)
            kw[k] = None if hit is None else round(line["start"] + hit, 3)
        dur = len(x) / SR
        sf.write(os.path.join(out_dir, f"{line['id']}.wav"), x, SR, subtype="PCM_16")
        manifest["lines"].append({"id": line["id"], "start": line["start"], "duration": round(dur, 3),
                                  "end": round(line["start"] + dur, 3), "text": text,
                                  "heard": heard, "cer": round(e, 3), "keywords": kw})
        print(f"{line['id']}: {line['start']:6.2f}–{line['start']+dur:6.2f}s  CER {e:.2f} (дубль {take + 1})  | {heard}")
        print("   keywords:", kw)
    with open(os.path.join(ROOT, "src/data/voice-manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    ends = [(l["id"], l["end"]) for l in manifest["lines"]]
    starts = [l["start"] for l in manifest["lines"]][1:] + [SCRIPT["durationSec"]]
    for (i, e), s in zip(ends, starts):
        if e > s - 0.2:
            print(f"!! {i} ends at {e:.2f}s — overlaps next slot at {s:.2f}s", file=sys.stderr); sys.exit(1)


if __name__ == "__main__":
    main()
