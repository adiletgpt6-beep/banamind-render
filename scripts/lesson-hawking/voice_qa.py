"""Обратная проверка озвучки: каждая реплика распознаётся Whisper large-v3-turbo
(sherpa-onnx) и сравнивается с текстом сценария (WER по словам).
Запуск: python voice_qa.py MODEL_DIR [out.json]  (из корня репозитория)
"""
import json
import re
import subprocess
import sys

import numpy as np
import sherpa_onnx

M = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else "out/voice_qa.json"
man = json.load(open("public/lesson-hawking/voice/manifest.json", encoding="utf-8"))
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{M}/turbo-encoder.int8.onnx", decoder=f"{M}/turbo-decoder.int8.onnx", tokens=f"{M}/turbo-tokens.txt",
    language="ru", task="transcribe", num_threads=4)
texts = {}
src = open("src/lesson-hawking/script.ts", encoding="utf-8").read()
for m in re.finditer(r'(?:L|Q)\("([a-z]\d+\w*)",\s*"((?:[^"\\]|\\.)*)"', src):
    texts[m.group(1)] = m.group(2)


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
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f"public/lesson-hawking/voice/{ln['file']}", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"])
    st = rec.create_stream()
    st.accept_waveform(16000, np.frombuffer(raw, dtype=np.float32))
    rec.decode_stream(st)
    heard = st.result.text.strip()
    ref = texts.get(ln["id"], "")
    w = wer(norm(ref), norm(heard))
    res.append({"id": ln["id"], "wer": round(w, 3), "text": ref, "heard": heard})
    print(f"{ln['id']:7s} {w:5.2f} {heard[:90]}", flush=True)
res.sort(key=lambda r: -r["wer"])
json.dump({"model": "whisper large-v3-turbo (sherpa-onnx)", "mean_wer": round(sum(r["wer"] for r in res) / len(res), 4), "lines": res},
          open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("mean WER", sum(r["wer"] for r in res) / len(res))
