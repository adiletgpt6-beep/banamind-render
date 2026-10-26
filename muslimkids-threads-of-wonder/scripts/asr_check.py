"""Проверка разборчивости озвучки локальным ASR (sherpa-onnx GigaAM v2, офлайн).
Использование: python3 -I scripts/asr_check.py <model_dir> file1.wav [file2.wav ...]"""
import sys, wave
import numpy as np
import sherpa_onnx

model_dir = sys.argv[1]
rec = sherpa_onnx.OfflineRecognizer.from_nemo_ctc(
    model=f"{model_dir}/model.int8.onnx", tokens=f"{model_dir}/tokens.txt", num_threads=4)
for path in sys.argv[2:]:
    with wave.open(path) as w:
        sr = w.getframerate(); ch = w.getnchannels()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if ch > 1: a = a.reshape(-1, ch).mean(axis=1)
    s = rec.create_stream(); s.accept_waveform(sr, a); rec.decode_stream(s)
    print(f"{path.split('/')[-1]}: {s.result.text}")
