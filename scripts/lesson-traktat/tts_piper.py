"""Черновая/резервная локальная озвучка (Piper ru_RU через sherpa-onnx).
Используется, когда ElevenLabs недоступен. Вход — JSON [{id, text, out}].
Запуск: python tts_piper.py MODEL_DIR jobs.json [speed]
"""
import json
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf

model_dir, jobs_path = sys.argv[1:3]
speed = float(sys.argv[3]) if len(sys.argv) > 3 else 0.92
name = model_dir.rstrip("/").split("/")[-1].replace("vits-piper-", "")
cfg = sherpa_onnx.OfflineTtsConfig(
    model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=f"{model_dir}/{name}.onnx", tokens=f"{model_dir}/tokens.txt", data_dir=f"{model_dir}/espeak-ng-data"),
        num_threads=4),
    max_num_sentences=1)
tts = sherpa_onnx.OfflineTts(cfg)
for job in json.load(open(jobs_path, encoding="utf-8")):
    audio = tts.generate(job["text"], sid=0, speed=speed)
    sf.write(job["out"], np.array(audio.samples, dtype=np.float32), audio.sample_rate)
    print("✓", job["id"], flush=True)
