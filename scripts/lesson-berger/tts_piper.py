# Локальная озвучка BM-038 (резервный движок, когда ElevenLabs/CI недоступны):
# Piper ru_RU через sherpa-onnx + побуквенные таймкоды распознавателем GigaAM v2
# (sherpa-onnx, NeMo transducer). Для каждой реплики пишет <out>.wav и <out>.json
# {"text": распознанный текст, "chars": [{"c","start","end"}]} — по ним строятся
# слова субтитров и рот банана, а также проверка речи (WER).
#
# python3 tts_piper.py <piper_dir> <jobs.json> <speed> [<giga_dir>]
import json
import os
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf

piper_dir, jobs_path, speed = sys.argv[1], sys.argv[2], float(sys.argv[3])
giga_dir = sys.argv[4] if len(sys.argv) > 4 else os.environ.get("GIGA_DIR", "")
name = os.path.basename(piper_dir.rstrip("/")).replace("vits-piper-", "")
threads = int(os.environ.get("TTS_THREADS", "4"))

tts = sherpa_onnx.OfflineTts(
    sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=f"{piper_dir}/{name}.onnx",
                tokens=f"{piper_dir}/tokens.txt",
                data_dir=f"{piper_dir}/espeak-ng-data",
                noise_scale=0.6,
                noise_scale_w=0.75,
            ),
            num_threads=threads,
        ),
        max_num_sentences=4,
    )
)
asr = None
if giga_dir:
    asr = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f"{giga_dir}/encoder.int8.onnx",
        decoder=f"{giga_dir}/decoder.onnx",
        joiner=f"{giga_dir}/joiner.onnx",
        tokens=f"{giga_dir}/tokens.txt",
        num_threads=threads,
        model_type="nemo_transducer",
    )


def recognise(samples, sr):
    # тишина по краям: без неё распознаватель теряет последний слог
    lead = 0.25
    padded = np.concatenate([np.zeros(int(sr * lead), np.float32), samples, np.zeros(int(sr * 0.8), np.float32)])
    s = asr.create_stream()
    s.accept_waveform(sr, padded)
    asr.decode_stream(s)
    r = s.result
    toks, ts = list(r.tokens), [x - lead for x in r.timestamps]
    chars = []
    for i, (c, t0) in enumerate(zip(toks, ts)):
        t1 = ts[i + 1] if i + 1 < len(ts) else t0 + 0.08
        for k, ch in enumerate(c.replace("▁", " ")):
            if ch.strip():
                chars.append({"c": ch.lower(), "start": round(t0 + (t1 - t0) * k / max(1, len(c)), 3), "end": round(min(t1, t0 + 0.12), 3)})
    return r.text.strip(), chars


jobs = json.load(open(jobs_path, encoding="utf-8"))
for n, job in enumerate(jobs, 1):
    audio = tts.generate(job["text"], sid=0, speed=speed)
    samples = np.asarray(audio.samples, dtype=np.float32)
    sf.write(job["out"], samples, audio.sample_rate)
    meta = {"text": "", "chars": []}
    if asr is not None:
        meta["text"], meta["chars"] = recognise(samples, audio.sample_rate)
    with open(job["out"][:-4] + ".json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False)
    print(f"  piper {n}/{len(jobs)} {job['id']}: {len(samples) / audio.sample_rate:.1f} с", flush=True)
