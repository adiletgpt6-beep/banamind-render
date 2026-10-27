"""Обратная проверка озвучки BM-036: каждая реплика распознаётся Whisper large-v3-turbo
(sherpa-onnx, int8, CPU) и сравнивается с текстом сценария (WER по словам).
Тексты реплик — из сценария через node (scripts/books/bm036/lib.mjs).
Запуск (из корня): python3 scripts/books/bm036/voice_qa.py MODEL_DIR [out.json]
Модель: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2
"""
import json
import re
import subprocess
import sys

import numpy as np
import sherpa_onnx

M = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else "books/richest-man-in-babylon-clason/scripts/voice_qa.json"
VOICE = "public/bm036/voice"
man = json.load(open(f"{VOICE}/manifest.json", encoding="utf-8"))
texts = json.loads(subprocess.check_output(["node", "-e", "import('./scripts/books/bm036/lib.mjs').then(m=>console.log(JSON.stringify(Object.fromEntries(m.SCENES.flatMap(s=>s.lines).map(l=>[l.id,l.text])))))"]))
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{M}/turbo-encoder.int8.onnx", decoder=f"{M}/turbo-decoder.int8.onnx", tokens=f"{M}/turbo-tokens.txt",
    language="ru", task="transcribe", num_threads=8)


def norm(s):
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^\w\s-]", " ", s)
    return [w for w in re.split(r"[\s-]+", s) if w]


def wer(a, b):
    d = np.zeros((len(a) + 1, len(b) + 1), dtype=int)
    d[:, 0] = range(len(a) + 1)
    d[0, :] = range(len(b) + 1)
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (a[i - 1] != b[j - 1]))
    return d[len(a), len(b)] / max(1, len(a))


res = []
for ln in man["lines"]:
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f"{VOICE}/{ln['file']}", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"])
    audio = np.frombuffer(raw, dtype=np.float32)
    st = rec.create_stream()
    st.accept_waveform(16000, audio)
    rec.decode_stream(st)
    heard = st.result.text.strip()
    want = texts.get(ln["id"], "")
    w = wer(norm(want), norm(heard))
    res.append({"id": ln["id"], "wer": round(float(w), 3), "text": want, "heard": heard})
    print(f"{ln['id']:7s} WER {w:.2f}  {heard[:90]}", flush=True)
bad = [r for r in res if r["wer"] > 0.2]
summary = {"lines": len(res), "mean_wer": round(float(np.mean([r["wer"] for r in res])), 3), "over_0_2": [r["id"] for r in bad]}
json.dump({"summary": summary, "lines": res}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps(summary, ensure_ascii=False))
