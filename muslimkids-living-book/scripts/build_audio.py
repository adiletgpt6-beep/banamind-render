#!/usr/bin/env python3
"""Звук ролика «Книга удивительного мира»: озвучка + звуковой дизайн.

Источник правды — src/story/timeline.json (тот же файл читает анимация).

1. Каждая фраза диктора синтезируется локальной нейросетью Piper
   (ru_RU-ruslan-medium через sherpa-onnx), без ускорения темпа.
   Тишина по краям обрезается, фраза ставится на своё время из timeline.json.
   Если фраза не помещается до следующей — сборка останавливается.
2. Звуковые эффекты бумаги синтезируются процедурно из тех же событий
   (обложка, перелистывания, раскрытие/складывание pop-up, ветер, вода, дождь).
   Музыки нет — правило Muslim Kids.
3. Сведение: голос −16 LUFS, эффекты заметно тише, лимитер −1.5 dBTP.
4. Необязательная проверка: распознавание речи обратно (ASR_MODEL_DIR,
   GigaAM v2 через sherpa-onnx) и доля несовпадающих символов (CER).

Переменные окружения:
  PIPER_VOICE_DIR — папка vits-piper-ru_RU-ruslan-medium (onnx, tokens, espeak-ng-data)
  ASR_MODEL_DIR   — (необязательно) sherpa-onnx-nemo-transducer-giga-am-v2-russian

Запуск: python3 scripts/build_audio.py
Выход:  public/audio/narration.wav, public/audio/soundtrack.wav,
        public/audio/narration.json (фактические тайминги фраз и отчёт ASR)
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

ROOT = Path(__file__).resolve().parent.parent
TIMELINE = json.loads((ROOT / "src/story/timeline.json").read_text("utf-8"))
OUT = ROOT / "public/audio"
SR = 48000
DUR = TIMELINE["durationSec"]
RNG = np.random.default_rng(3)


# ---------------------------------------------------------------- голос
def synth_phrases() -> list[dict]:
    import sherpa_onnx

    vdir = Path(os.environ.get("PIPER_VOICE_DIR", ""))
    model = TIMELINE["voice"]["model"]
    onnx = vdir / f"{model}.onnx"
    if not onnx.exists():
        sys.exit(f"Нет модели голоса {onnx}. Укажите PIPER_VOICE_DIR.")
    v = TIMELINE["voice"]
    tts = sherpa_onnx.OfflineTts(
        sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                    model=str(onnx),
                    tokens=str(vdir / "tokens.txt"),
                    data_dir=str(vdir / "espeak-ng-data"),
                    length_scale=v["lengthScale"],
                    noise_scale=v["noiseScale"],
                    noise_scale_w=v["noiseW"],
                ),
                num_threads=4,
            )
        )
    )
    asr = make_asr()
    out = []
    for p in TIMELINE["narration"]:
        # VITS стохастичен: до 6 дублей фразы, берём самый разборчивый по ASR.
        best = None
        for _take in range(6 if asr else 1):
            x = trim(tts.generate(p.get("tts", p["text"]), sid=0, speed=1.0))
            heard, c = asr(x, p["text"]) if asr else ("", 0.0)
            if best is None or c < best["cer"]:
                best = {"audio": x, "heard": heard, "cer": c}
            if c <= 0.02:
                break
        out.append({**p, **best, "duration": len(best["audio"]) / SR})
    return out


def trim(a) -> np.ndarray:
    x = np.asarray(a.samples, dtype=np.float32)
    x = resample_poly(x, SR, a.sample_rate).astype(np.float32)
    # Обрезка тишины по краям (порог −45 дБ от пика, мягкие края 15 мс).
    env = np.abs(x)
    thr = env.max() * 10 ** (-45 / 20)
    idx = np.where(env > thr)[0]
    x = x[max(idx[0] - int(0.02 * SR), 0) : idx[-1] + int(0.06 * SR)]
    f = int(0.015 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    return x


def place_voice(phrases: list[dict]) -> np.ndarray:
    track = np.zeros(int(DUR * SR), dtype=np.float32)
    for i, p in enumerate(phrases):
        end = p["start"] + p["duration"]
        nxt = phrases[i + 1]["start"] if i + 1 < len(phrases) else DUR - 1.0
        if end > nxt - 0.12:
            sys.exit(
                f"Фраза {p['id']} заканчивается в {end:.2f} c и наезжает на "
                f"следующее событие ({nxt:.2f} c). Поправьте timeline.json."
            )
        s = int(p["start"] * SR)
        track[s : s + len(p["audio"])] += p["audio"]
        p["end"] = round(end, 3)
    return track


# ---------------------------------------------------------- эффекты
def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, hi, order=2):
    return sosfilt(butter(order, hi, btype="low", fs=SR, output="sos"), x)


def hp(x, lo, order=2):
    return sosfilt(butter(order, lo, btype="high", fs=SR, output="sos"), x)


def noise(sec):
    return noise_n(int(sec * SR))


def noise_n(n):
    return RNG.standard_normal(n).astype(np.float32)


def env_ad(n, attack, release_shape=2.0):
    t = np.linspace(0, 1, n)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    r = (1 - t) ** release_shape
    return (a * r).astype(np.float32)


def norm(x, peak_db):
    m = np.abs(x).max() or 1.0
    return (x / m * 10 ** (peak_db / 20)).astype(np.float32)


def paper_grains(sec, density, lo=1800, hi=7000):
    """Мягкие хрусты бумаги: короткие отфильтрованные зёрна шума."""
    n = int(sec * SR)
    y = np.zeros(n, dtype=np.float32)
    count = max(1, int(sec * density))
    for _ in range(count):
        L = int(RNG.uniform(0.006, 0.03) * SR)
        g = noise_n(L) * env_ad(L, 0.15, 3.0) * RNG.uniform(0.3, 1.0)
        s = int(RNG.uniform(0, max(n - L, 1)))
        y[s : s + L] += g
    return bp(y, lo, hi)


def sfx_page_turn(sec, heavy=False):
    n = int(sec * SR)
    t = np.linspace(0, 1, n)
    swoosh = bp(noise(sec), 500 if heavy else 900, 4200)
    shape = np.sin(np.pi * np.clip(t, 0, 1)) ** 1.6
    flutter = 1 + 0.35 * np.sin(2 * np.pi * 14 * t * sec) * (1 - t)
    y = swoosh * shape * flutter + 0.35 * paper_grains(sec, 18) * shape
    # мягкое касание страницы в конце
    land = lp(noise(0.12), 900) * env_ad(int(0.12 * SR), 0.05, 4)
    s = max(n - len(land) - int(0.02 * SR), 0)
    y[s : s + len(land)] += land * (1.6 if heavy else 0.8)
    return norm(y, -20 if heavy else -22)


def sfx_cover(sec):
    n = int(sec * SR)
    t = np.linspace(0, 1, n)
    rub = lp(noise(sec), 2200) * (np.sin(np.pi * t) ** 2)
    creak = bp(noise(sec), 300, 1200) * (np.sin(np.pi * t) ** 6) * 0.6
    y = rub + creak + 0.3 * paper_grains(sec, 10)
    thump = sfx_thump(0.35)
    y[-len(thump) :] += thump * 1.4
    return norm(y, -21)


def sfx_thump(sec):
    n = int(sec * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 85 * t) * np.exp(-t * 18)
    air = lp(noise(sec), 700) * np.exp(-t * 25) * 0.6
    return (body + air).astype(np.float32)


def sfx_unfold(sec, brightness=1.0):
    """Мягкое раскрытие бумажной конструкции: шорох + редкие сгибы."""
    n = int(sec * SR)
    t = np.linspace(0, 1, n)
    air = bp(noise(sec), 1200 * brightness, 6500) * (np.sin(np.pi * t) ** 1.2) * 0.55
    y = air + paper_grains(sec, 22 * brightness, 1500, 6000) * (0.4 + 0.6 * t)
    return norm(y, -27)


def sfx_fold(sec):
    return norm(sfx_unfold(sec, 0.8)[::-1].copy() * 0.9, -28)


def sfx_bed(kind, sec):
    n = int(sec * SR)
    t = np.arange(n) / SR
    fade = np.minimum(1, np.minimum(t / 1.2, (sec - t) / 1.2)).astype(np.float32)
    if kind == "wind":
        lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t + 1.3) * np.sin(2 * np.pi * 0.11 * t)
        y = lp(noise(sec), 520) * lfo + 0.15 * bp(noise(sec), 900, 1600) * lfo
        return norm(y * fade, -33)
    if kind == "water":
        y = bp(noise(sec), 1500, 5200) * 0.25
        bubbles = np.zeros(n, dtype=np.float32)
        for _ in range(int(sec * 26)):
            L = int(RNG.uniform(0.02, 0.06) * SR)
            f0 = RNG.uniform(500, 1300)
            tt = np.arange(L) / SR
            b = np.sin(2 * np.pi * f0 * tt * (1 + 2.2 * tt)) * np.exp(-tt * 70)
            s = int(RNG.uniform(0, n - L))
            bubbles[s : s + L] += b * RNG.uniform(0.2, 0.7)
        return norm((y + 0.5 * bubbles) * fade, -34)
    if kind == "rain":
        hiss = bp(noise(sec), 2500, 9000) * 0.35
        drops = np.zeros(n, dtype=np.float32)
        for _ in range(int(sec * 38)):
            L = int(0.025 * SR)
            tt = np.arange(L) / SR
            d = bp(noise_n(L), 2000, 7000) * np.exp(-tt * 160)
            s = int(RNG.uniform(0, n - L))
            drops[s : s + L] += d * RNG.uniform(0.2, 1.0)
        return norm((hiss + drops) * fade, -31)
    if kind == "leaves":
        y = paper_grains(sec, 40, 2000, 8000) + 0.3 * bp(noise(sec), 3000, 8000)
        return norm(y * fade, -31)
    raise ValueError(kind)


def build_sfx() -> tuple[np.ndarray, list[dict]]:
    track = np.zeros(int(DUR * SR), dtype=np.float32)
    cues: list[dict] = []

    def add(name, at, sig, gain=1.0):
        s = int(at * SR)
        e = min(s + len(sig), len(track))
        track[s:e] += sig[: e - s] * gain
        cues.append({"t": round(at, 2), "sfx": name, "sec": round(len(sig) / SR, 2)})

    book = TIMELINE["book"]
    a, b = book["coverOpen"]
    add("cover-open", a, sfx_cover(b - a + 0.15))
    for sh in book["sheets"]:
        for s0, s1, _d in sh["turns"]:
            add(f"turn:{sh['id']}", s0, sfx_page_turn(s1 - s0 + 0.1, heavy=sh["thickness"] > 0.01))
    a, b = book["coverClose"]
    add("cover-close", a, sfx_cover(b - a + 0.15), 1.1)

    P = TIMELINE["popups"]
    unfold_keys = {
        "earth": ["rise", "expand", "orbits", "sun"],
        "mountains": ["rise", "hills", "clouds"],
        "tree": ["cloud", "sprout"],
        "universe": ["arch", "orbits", "planets", "stars"],
        "frame": ["rise"],
    }
    for world, keys in unfold_keys.items():
        for k in keys:
            s0, s1 = P[world][k]
            add(f"unfold:{world}.{k}", s0, sfx_unfold(s1 - s0, 1.0 if k != "stars" else 1.3), 0.8)
        s0, s1 = P[world]["collapse"]
        add(f"fold:{world}", s0, sfx_fold(s1 - s0))

    m = P["mountains"]
    add("bed:wind", m["rise"][0], sfx_bed("wind", m["collapse"][1] - m["rise"][0]))
    add("bed:water", m["river"][0], sfx_bed("water", m["collapse"][1] - m["river"][0]))
    tr = P["tree"]
    add("bed:rain", tr["rain"][0] - 0.2, sfx_bed("rain", tr["rain"][1] - tr["rain"][0] + 0.6))
    add("bed:leaves", tr["grow"][0] + 0.4, sfx_bed("leaves", tr["grow"][1] - tr["grow"][0]))
    return track, cues


# ---------------------------------------------------------- сведение
def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def loudnorm(src: Path, dst: Path, lufs: float):
    ffmpeg("-i", str(src), "-af", f"loudnorm=I={lufs}:TP=-2:LRA=9", "-ar", str(SR), str(dst))


def make_asr():
    """Распознавание речи обратно (GigaAM v2) → (текст, CER). None без модели."""
    mdir = os.environ.get("ASR_MODEL_DIR")
    if not mdir:
        return None
    import re
    import sherpa_onnx

    r = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f"{mdir}/encoder.int8.onnx",
        decoder=f"{mdir}/decoder.onnx",
        joiner=f"{mdir}/joiner.onnx",
        tokens=f"{mdir}/tokens.txt",
        model_type="nemo_transducer",
        num_threads=4,
    )

    def clean(s):
        s = s.lower().replace("ё", "е").replace("аль-имран", "аль имран")
        return re.sub(r"\s+", " ", re.sub(r"[^а-яa-z ]", " ", s)).strip()

    def cer(a, b):
        d = list(range(len(b) + 1))
        for i, ca in enumerate(a, 1):
            prev, d[0] = d[0], i
            for j, cb in enumerate(b, 1):
                prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (ca != cb))
        return d[-1] / max(len(a), 1)

    def run(audio, text):
        x = resample_poly(audio, 16000, SR).astype(np.float32)
        s = r.create_stream()
        s.accept_waveform(16000, x)
        r.decode_stream(s)
        heard = s.result.text
        return heard, round(cer(clean(text), clean(heard)), 3)

    return run


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    phrases = synth_phrases()
    voice = place_voice(phrases)
    sfx, cues = build_sfx()
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        sf.write(td / "v.wav", voice, SR, subtype="FLOAT")
        loudnorm(td / "v.wav", td / "vn.wav", -16)
        v, _ = sf.read(td / "vn.wav", dtype="float32")
        v = v[: len(voice)] if v.ndim == 1 else v[: len(voice), 0]
        v = np.pad(v, (0, len(voice) - len(v)))
        sf.write(OUT / "narration.wav", v, SR, subtype="PCM_16")
        mix = v + sfx
        sf.write(td / "mix.wav", mix, SR, subtype="FLOAT")
        ffmpeg(
            "-i", str(td / "mix.wav"),
            "-af", "alimiter=limit=0.84:attack=3:release=60:level=disabled",
            "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(OUT / "soundtrack.wav"),
        )
    asr = [{"id": p["id"], "heard": p["heard"], "cer": p["cer"]} for p in phrases] if phrases[0]["heard"] else None
    meta = {
        "voice": TIMELINE["voice"],
        "phrases": [
            {k: p[k] for k in ("id", "scene", "start", "end", "duration", "text")} for p in phrases
        ],
        "sfx": cues,
        "asr": asr,
    }
    for p in meta["phrases"]:
        p["duration"] = round(p["duration"], 3)
    (OUT / "narration.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), "utf-8")
    for p in meta["phrases"]:
        print(f"{p['id']} {p['start']:6.2f}–{p['end']:6.2f}  {p['text']}")
    if asr:
        for a in asr:
            print(f"ASR {a['id']} CER={a['cer']:.3f}  «{a['heard']}»")
    print(f"SFX cues: {len(cues)}  →  {OUT / 'soundtrack.wav'}")


if __name__ == "__main__":
    main()
