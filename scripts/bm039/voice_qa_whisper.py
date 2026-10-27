"""Проверка произношения озвучки BM-039: каждая реплика распознаётся локальным
Whisper large-v3-turbo (sherpa-onnx, int8) и сравнивается со сценарием по словам.
Запуск: python -I voice_qa_whisper.py WHISPER_DIR VOICE_DIR lines.json out.json
lines.json: [{id, text, file}]; out: [{id, wer, heard, missed}] (по убыванию ошибок)."""
import difflib, json, re, subprocess, sys
import numpy as np, sherpa_onnx

wd, vdir, lines_path, out_path = sys.argv[1:5]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{wd}/turbo-encoder.int8.onnx", decoder=f"{wd}/turbo-decoder.int8.onnx", tokens=f"{wd}/turbo-tokens.txt", language="ru", task="transcribe", num_threads=4)
norm = lambda t: [w for w in re.findall(r"[а-яё0-9]+", t.lower().replace("ё", "е"))]
res = []
for ln in json.load(open(lines_path, encoding="utf-8")):
    pcm = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f"{vdir}/{ln['file']}", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"])
    s = rec.create_stream(); s.accept_waveform(16000, np.frombuffer(pcm, dtype=np.float32)); rec.decode_stream(s)
    heard = s.result.text.strip()
    a, b = norm(ln["text"]), norm(heard)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    missed = [" ".join(a[i1:i2]) + " → " + " ".join(b[j1:j2]) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
    err = sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal")
    res.append({"id": ln["id"], "wer": round(err / max(1, len(a)), 3), "heard": heard, "missed": missed})
    print(ln["id"], res[-1]["wer"], flush=True)
res.sort(key=lambda r: -r["wer"])
json.dump(res, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
