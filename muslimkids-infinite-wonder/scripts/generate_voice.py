"""Русская озвучка «Бесконечного чуда» — бесплатно и офлайн.

Голос: Piper ru_RU-ruslan-medium (мужской, корпус RUSLAN) через sherpa-onnx.
Модели берутся из GitHub Releases sherpa-onnx и кэшируются в ~/.cache.
Каждая реплика синтезируется отдельно: её длительность точно известна,
и видеоряд синхронизируется с фактическим звуком (src/voice.json).

Контроль: каждая реплика распознаётся обратно офлайн-моделью GigaAM v2
(русская ASR) — проверка, что все слова произнесены и разборчивы.

Запуск: python3 scripts/generate_voice.py [--force]
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np
import sherpa_onnx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "audio", "voice")
MANIFEST = os.path.join(ROOT, "src", "voice.json")
CACHE = os.path.expanduser(os.environ.get("TTS_CACHE", "~/.cache/muslimkids-tts"))
REL = "https://github.com/k2-fsa/sherpa-onnx/releases/download"
VOICE = os.environ.get("TTS_VOICE", "ruslan")
TTS_DIR = f"vits-piper-ru_RU-{VOICE}-medium"
ASR_DIR = "sherpa-onnx-nemo-transducer-giga-am-v2-russian-2025-04-19"

# (ключ, текст, темп: >1 — медленнее). Ударения в «трудных» словах
# отмечены знаком U+0301, чтобы eSpeak-фонемизатор не ошибся.
LINES = [
    ("v1", "Представь: один мазо́к кра́ски — и перед нами целый удиви́тельный мир!", 1.16),
    ("v2a", "Вот Земля.", 1.18),
    ("v2b", "Она вращается, и день сменяет ночь.", 1.16),
    ("v3a", "Приблизимся.", 1.16),
    ("v3b", "Внизу — высокие горы, леса и красивые деревья.", 1.14),
    ("v4a", "Посмотри на лист.", 1.16),
    ("v4b", "Внутри него есть прожилки, ткани и крошечные клетки.", 1.14),
    ("v5", "Клетки настолько маленькие, что без увеличения их не разглядеть!", 1.12),
    ("v6", "Даже маленький лист — часть огромного мира, созданного Алла́хом.", 1.16),
    ("v7", "Господь наш! Ты не сотворил это понапрасну.", 1.32),
]
# Для проверки распознаванием знаки ударения не нужны.
CLEAN = {k: t.replace("́", "") for k, t, _ in LINES}


def fetch(name):
    path = os.path.join(CACHE, name)
    if not os.path.isdir(path):
        os.makedirs(CACHE, exist_ok=True)
        kind = "tts-models" if name.startswith("vits") else "asr-models"
        arc = path + ".tar.bz2"
        subprocess.run(["curl", "-sSL", "-o", arc, f"{REL}/{kind}/{name}.tar.bz2"], check=True)
        subprocess.run(["tar", "xjf", arc, "-C", CACHE], check=True)
        os.unlink(arc)
    return path


def make_tts():
    d = fetch(TTS_DIR)
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=os.path.join(d, f"ru_RU-{VOICE}-medium.onnx"),
                tokens=os.path.join(d, "tokens.txt"),
                data_dir=os.path.join(d, "espeak-ng-data"),
                noise_scale=0.6, noise_scale_w=0.7),
            num_threads=4),
        max_num_sentences=4)
    return sherpa_onnx.OfflineTts(cfg)


def make_asr():
    d = fetch(ASR_DIR)
    return sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=os.path.join(d, "encoder.int8.onnx"),
        decoder=os.path.join(d, "decoder.onnx"),
        joiner=os.path.join(d, "joiner.onnx"),
        tokens=os.path.join(d, "tokens.txt"),
        model_type="nemo_transducer", num_threads=4)


def read_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    return a.astype(np.float32) / 32768, sr


def recognize(asr, path):
    a, sr = read_wav(path)
    s = asr.create_stream()
    s.accept_waveform(sr, a)
    asr.decode_stream(s)
    return s.result.text.strip()


def norm(t):
    t = t.lower().replace("ё", "е")
    return "".join(c for c in t if c.isalpha() or c == " ").split()


def main():
    force = "--force" in sys.argv
    os.makedirs(OUT, exist_ok=True)
    tts, asr = make_tts(), make_asr()
    manifest, ok = {}, True
    for key, text, slow in LINES:
        wav = os.path.join(OUT, f"{key}.wav")
        if force or not os.path.exists(wav):
            audio = tts.generate(text, sid=0, speed=1 / slow)
            raw = wav + ".raw.wav"
            sherpa_onnx.write_wave(raw, audio.samples, audio.sample_rate)
            # Тёплая обработка без изменения темпа: срез шумов, лёгкая
            # «грудь» в низах, мягкая компрессия, едва заметная комната,
            # обрезка тишины, громкость −18 LUFS, 48 кГц моно.
            subprocess.run([
                "ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                "highpass=f=70,equalizer=f=180:t=q:w=1:g=2.5,"
                "equalizer=f=3200:t=q:w=1.5:g=1.5,lowpass=f=11000,"
                "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,"
                "aecho=0.8:0.85:23|41:0.12|0.07,"
                "silenceremove=start_periods=1:start_threshold=-58dB,"
                "areverse,silenceremove=start_periods=1:start_threshold=-58dB,areverse,"
                "apad=pad_dur=0.12,loudnorm=I=-18:TP=-2:LRA=9,aresample=48000",
                "-ac", "1", "-c:a", "pcm_s16le", wav], check=True)
            os.unlink(raw)
        heard = recognize(asr, wav)
        a, sr = read_wav(wav)
        dur = len(a) / sr
        miss = sorted(set(norm(CLEAN[key])) - set(norm(heard)))
        ok &= not miss
        manifest[key] = {"text": CLEAN[key], "file": f"audio/voice/{key}.wav",
                         "duration": round(dur, 3), "heard": heard, "missing": miss}
        print(f"{key} {dur:5.2f}s | {CLEAN[key]}\n           ↳ {heard}{'   ✗ ' + str(miss) if miss else '   ✓'}")
    with open(MANIFEST, "w") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("Итого речи:", round(sum(v["duration"] for v in manifest.values()), 2), "с",
          "| распознавание:", "все слова" if ok else "есть расхождения")


if __name__ == "__main__":
    main()
