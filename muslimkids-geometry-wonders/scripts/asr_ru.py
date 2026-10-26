"""Распознавание русской речи (faster-whisper) для проверки дублей озвучки.

python scripts/asr_ru.py a.mp3 b.mp3 ... → JSON {"a.mp3": "текст", ...}
"""
import json
import sys

from faster_whisper import WhisperModel

model = WhisperModel("small", device="cpu", compute_type="int8")
out = {}
for path in sys.argv[1:]:
    segments, _ = model.transcribe(path, language="ru", beam_size=5, vad_filter=False)
    out[path] = " ".join(s.text.strip() for s in segments)
print(json.dumps(out, ensure_ascii=False))
