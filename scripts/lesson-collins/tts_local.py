"""Локальная озвучка BM-037 (резерв, когда облачный ElevenLabs недоступен):
Piper ru_RU (sherpa-onnx, офлайн) → WAV 22 кГц, затем распознавание zipformer-ru
(sherpa-onnx) → токены с таймкодами для выравнивания слов титров по реальному звуку.

Запуск: python3 -I tts_local.py PIPER_DIR ASR_DIR jobs.json [length_scale]
jobs.json — [{"id","text","out"}]; рядом с каждым out пишется <out>.asr.json.
"""
import json
import sys
import wave

import numpy as np
import sherpa_onnx

piper_dir, asr_dir, jobs_path = sys.argv[1:4]
length_scale = float(sys.argv[4]) if len(sys.argv) > 4 else 1.05
name = piper_dir.rstrip("/").split("/")[-1].replace("vits-piper-", "")
tts = sherpa_onnx.OfflineTts(
    sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=f"{piper_dir}/{name}.onnx", tokens=f"{piper_dir}/tokens.txt", data_dir=f"{piper_dir}/espeak-ng-data", length_scale=length_scale
            ),
            num_threads=4,
        )
    )
)
asr = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{asr_dir}/encoder.int8.onnx", decoder=f"{asr_dir}/decoder.onnx", joiner=f"{asr_dir}/joiner.int8.onnx", tokens=f"{asr_dir}/tokens.txt", num_threads=4
)
jobs = json.load(open(jobs_path, encoding="utf8"))
for i, job in enumerate(jobs):
    a = tts.generate(job["text"], sid=0, speed=1.0)
    x = np.array(a.samples, dtype=np.float32)
    with wave.open(job["out"], "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(a.sample_rate)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    y = np.interp(np.arange(0, len(x), a.sample_rate / 16000), np.arange(len(x)), x).astype(np.float32)
    st = asr.create_stream()
    st.accept_waveform(16000, y)
    asr.decode_stream(st)
    r = st.result
    json.dump({"text": r.text, "tokens": list(r.tokens), "timestamps": [round(t, 3) for t in r.timestamps], "duration": len(x) / a.sample_rate}, open(job["out"] + ".asr.json", "w", encoding="utf8"), ensure_ascii=False)
    print(f"{i + 1}/{len(jobs)} {job['id']}: {len(x) / a.sample_rate:.1f} с", flush=True)
