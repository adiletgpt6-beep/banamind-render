"""Обратная проверка озвучки BM-002: каждая реплика распознаётся Whisper large-v3-turbo
(sherpa-onnx, локально) и сравнивается с текстом сценария (WER по словам).
Запуск (из корня репозитория): python scripts/books/ibn-khisham/voice_qa.py MODEL_DIR [out.json]
"""
import json
import re
import subprocess
import sys

import numpy as np
import sherpa_onnx

M = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else "books/ibn-khisham-zhizneopisanie-proroka/video/voice_qa.json"
V = "public/ibn-khisham/voice"
man = json.load(open(f"{V}/manifest.json", encoding="utf-8"))
texts = dict(json.loads(subprocess.check_output(["node", "-e", 'import("./src/books/ibn-khisham-zhizneopisanie-proroka/script.ts").then(m=>console.log(JSON.stringify(m.SCENES.flatMap(s=>s.lines.map(l=>[l.id,l.text])))))'])))
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{M}/turbo-encoder.int8.onnx", decoder=f"{M}/turbo-decoder.int8.onnx", tokens=f"{M}/turbo-tokens.txt",
    language="ru", task="transcribe", num_threads=3)


def words(s):
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^а-яa-z0-9\s-]", " ", s).replace("-", " ")
    return s.split()


def wer(a, b):
    d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(b) + 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] != b[j - 1]))
            prev, d[j] = d[j], cur
    return d[len(b)] / max(1, len(a))


rows = []
for ln in man["lines"]:
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f"{V}/{ln['file']}", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"])
    audio = np.frombuffer(raw, dtype=np.float32)
    st = rec.create_stream()
    st.accept_waveform(16000, audio)
    rec.decode_stream(st)
    hyp = st.result.text.strip()
    w = wer(words(texts[ln["id"]]), words(hyp))
    rows.append({"id": ln["id"], "wer": round(w, 3), "text": texts[ln["id"]], "asr": hyp})
    print(f"{ln['id']:7s} {w:.2f}", flush=True)
rows.sort(key=lambda r: -r["wer"])
mean = sum(r["wer"] for r in rows) / len(rows)
json.dump({"model": "whisper large-v3-turbo int8 (sherpa-onnx)", "lines": len(rows), "meanWER": round(mean, 4), "worst": rows[:30], "all": rows}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"mean WER {mean:.3f}; > 0.25: {sum(r['wer'] > 0.25 for r in rows)}")
