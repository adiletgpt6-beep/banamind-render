"""Расшифровка исходной аудиокниги локальной моделью Whisper large-v3-turbo
(sherpa-onnx, int8, CPU) с разбиением по паузам (Silero VAD).

OpenAI API недоступен (нет кредитов), HuggingFace закрыт сетью среды — поэтому
модели берутся из релизов k2-fsa/sherpa-onnx на GitHub.
Каждый фрагмент речи ≤ 28 с распознаётся отдельно; таймкоды — границы VAD.

Запуск: python asr_sherpa.py SRC.mp3 MODEL_DIR VAD.onnx OUT.json [WORKERS]
"""
import json
import subprocess
import sys
import time
from multiprocessing import Pool

import numpy as np
import sherpa_onnx

SRC, MODEL_DIR, VAD, OUT = sys.argv[1:5]
WORKERS = int(sys.argv[5]) if len(sys.argv) > 5 else 2
SR = 16000


def load(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, dtype=np.float32).copy()


def vad_segments(audio):
    cfg = sherpa_onnx.VadModelConfig()
    cfg.silero_vad.model = VAD
    cfg.silero_vad.min_silence_duration = 0.35
    cfg.silero_vad.min_speech_duration = 0.25
    cfg.silero_vad.max_speech_duration = 28
    cfg.silero_vad.threshold = 0.4
    cfg.sample_rate = SR
    vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=120)
    win = cfg.silero_vad.window_size
    segs = []
    for i in range(0, len(audio), win):
        vad.accept_waveform(audio[i:i + win])
        while not vad.empty():
            s = vad.front
            segs.append((s.start, s.start + len(s.samples)))
            vad.pop()
    vad.flush()
    while not vad.empty():
        s = vad.front
        segs.append((s.start, s.start + len(s.samples)))
        vad.pop()
    # склейка коротких соседних отрезков до ~25 с
    merged = []
    for a, b in segs:
        if merged and (b - merged[-1][0]) <= 25 * SR and (a - merged[-1][1]) <= 1.2 * SR:
            merged[-1] = (merged[-1][0], b)
        else:
            merged.append((a, b))
    return merged


_rec = None


def init():
    global _rec
    _rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=f"{MODEL_DIR}/turbo-encoder.int8.onnx", decoder=f"{MODEL_DIR}/turbo-decoder.int8.onnx",
        tokens=f"{MODEL_DIR}/turbo-tokens.txt", language="ru", task="transcribe", num_threads=2, tail_paddings=800)


def work(item):
    idx, a, b, samples = item
    st = _rec.create_stream()
    pad = np.zeros(int(0.15 * SR), dtype=np.float32)
    st.accept_waveform(SR, np.concatenate([pad, samples, pad]))
    _rec.decode_stream(st)
    return {"i": idx, "start": round(a / SR, 2), "end": round(b / SR, 2), "text": st.result.text.strip()}


if __name__ == "__main__":
    t0 = time.time()
    audio = load(SRC)
    segs = vad_segments(audio)
    print(f"Длительность {len(audio)/SR:.1f} с; фрагментов речи {len(segs)}", flush=True)
    items = [(i, a, b, audio[a:b]) for i, (a, b) in enumerate(segs)]
    out = []
    with Pool(WORKERS, initializer=init) as pool:
        for r in pool.imap(work, items, chunksize=1):
            out.append(r)
            if r["i"] % 20 == 0:
                print(f"[{time.time()-t0:6.0f} с] {r['i']}/{len(items)} {r['start']:.0f}s: {r['text'][:70]}", flush=True)
    json.dump({"source": SRC, "model": "whisper large-v3-turbo (sherpa-onnx int8)", "vad": "silero",
               "duration": round(len(audio) / SR, 2), "segments": out}, open(OUT, "w", encoding="utf-8"),
              ensure_ascii=False, indent=0)
    print(f"Готово за {time.time()-t0:.0f} с")
