"""QA озвучки BM-031 без сети к Hugging Face: каждая реплика распознаётся русской
моделью GigaAM v2 (sherpa-onnx, NeMo transducer, int8, CPU; релиз k2-fsa/sherpa-onnx
на GitHub) и сравнивается с текстом сценария по словам (ё=е, без знаков препинания).

Запуск: python3 voice_asr_sherpa.py lines.json VOICE_DIR MODEL_DIR OUT_DIR
Результат: OUT_DIR/voice-asr.json и OUT_DIR/voice-asr.md (реплики < 0.85 — послушать).
"""
import json
import re
import subprocess
import sys
from difflib import SequenceMatcher
from pathlib import Path

import numpy as np
import sherpa_onnx

lines_path, voice_dir, model_dir, out_dir = sys.argv[1:5]
lines = json.loads(Path(lines_path).read_text("utf8"))
out = Path(out_dir)
out.mkdir(parents=True, exist_ok=True)
m = Path(model_dir)
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=str(m / "encoder.int8.onnx"), decoder=str(m / "decoder.onnx"), joiner=str(m / "joiner.onnx"),
    tokens=str(m / "tokens.txt"), model_type="nemo_transducer", num_threads=2, sample_rate=16000, feature_dim=64,
)


def load(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0


def words(s):
    return re.sub(r"[^\w\s]", " ", s.lower().replace("ё", "е")).split()


res = []
for ln in lines:
    f = Path(voice_dir) / f"{ln['id']}.mp3"
    st = rec.create_stream()
    st.accept_waveform(16000, load(f))
    rec.decode_stream(st)
    heard = st.result.text.strip()
    a, b = words(ln["text"]), words(heard)
    score = SequenceMatcher(None, a, b).ratio() if a else 1.0
    res.append({"id": ln["id"], "score": round(score, 3), "text": ln["text"], "heard": heard})
    print(f"{ln['id']} {score:.2f}", flush=True)

mean = sum(r["score"] for r in res) / len(res)
low = [r for r in res if r["score"] < 0.85]
Path(out / "voice-asr.json").write_text(json.dumps({"model": m.name, "mean": round(mean, 3), "lines": res}, ensure_ascii=False, indent=1), "utf8")
md = [f"# QA озвучки BM-031 — распознавание GigaAM v2 ({m.name})", "", f"Реплик: {len(res)}, среднее совпадение слов: **{mean:.3f}**, ниже 0.85: **{len(low)}**.", ""]
if low:
    md += ["| id | совпадение | сценарий | распознано |", "|---|---|---|---|"]
    md += [f"| {r['id']} | {r['score']} | {r['text']} | {r['heard']} |" for r in low]
Path(out / "voice-asr.md").write_text("\n".join(md) + "\n", "utf8")
print(f"mean {mean:.3f}, low {len(low)}")
