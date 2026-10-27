"""Русская озвучка Muslim Kids 015 — бесплатный офлайн-синтез Piper (голос ru_RU-denis-medium)
через sherpa-onnx. Каждое предложение синтезируется отдельно, затем склеивается с паузами:
так мы знаем точные тайминги предложений, а внутри предложения — оценку времени слов
(пропорционально длине слов). Ударения: собственный словарь espeak-ng (ru_extra), см. README.

Выход: public/audio/narration.wav (80 с, 48 кГц моно) + src/voice.json (тайминги).
Запуск: python3 scripts/generate-voice.py  (переменная TTS_DIR — папка с моделями)."""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf, sherpa_onnx

TTS = os.environ.get("TTS_DIR", "/tmp/claude-0/tts")
VOICE = os.environ.get("TTS_VOICE", "denis")
D = f"{TTS}/vits-piper-ru_RU-{VOICE}-medium"
N = json.load(open("scripts/narration.json", encoding="utf8"))
SR = 22050
TOTAL = 80.0

tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f"{D}/ru_RU-{VOICE}-medium.onnx", tokens=f"{D}/tokens.txt",
        data_dir=f"{D}/espeak-ng-data", noise_scale=0.72, noise_scale_w=0.85, length_scale=1.0), num_threads=4)))

def trim(a, thr=0.004):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 900): idx[-1] + 1200] if len(idx) else a

track = np.zeros(int(TOTAL * SR), dtype=np.float32)
out = {"voice": f"piper ru_RU-{VOICE}-medium", "segments": []}
prev_end = 0.0
for seg in N["segments"]:
    t = max(seg["start"], prev_end + 0.45)
    sents = []
    for s in [x.strip() for x in re.split(r"(?<=[.?!])\s+", seg["say"]) if x.strip()]:
        a = trim(np.asarray(tts.generate(s, sid=0, speed=seg.get("speed", 0.94)).samples, dtype=np.float32))
        i = int(t * SR)
        track[i:i + len(a)] += a[: len(track) - i]
        d = len(a) / SR
        words = re.findall(r"[\wёЁ-]+", s)
        w8 = [len(w) + 2 for w in words]; tot = sum(w8); acc = 0; wl = []
        for w, k in zip(words, w8):
            wl.append({"w": w, "s": round(t + d * acc / tot, 3)}); acc += k
        sents.append({"text": s, "start": round(t, 3), "end": round(t + d, 3), "words": wl})
        t += d + seg.get("gap", 0.38)
    prev_end = sents[-1]["end"]
    out["segments"].append({"id": seg["id"], "planned": seg["start"], "start": sents[0]["start"], "end": prev_end, "sentences": sents})
    print(f'{seg["id"]}: {sents[0]["start"]:6.2f} → {prev_end:6.2f}  ({prev_end - sents[0]["start"]:.2f}s)')
if prev_end > TOTAL - 1.5:
    sys.exit(f"Озвучка заканчивается слишком поздно: {prev_end:.2f}s")
os.makedirs("public/audio", exist_ok=True)
sf.write("/tmp/claude-0/narration_raw.wav", track, SR)
# мягкая обработка: срез низа, лёгкое тепло, компрессия, громкость -16 LUFS, 48 кГц
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "/tmp/claude-0/narration_raw.wav", "-af",
    "highpass=f=70,equalizer=f=220:t=q:w=1.0:g=1.5,equalizer=f=5200:t=q:w=1.2:g=-1.5,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,"
    "aecho=0.8:0.5:28:0.06,loudnorm=I=-16:TP=-1.5:LRA=9,aresample=48000", "-ac", "1", "-t", str(TOTAL), "public/audio/narration.wav"], check=True)
json.dump(out, open("src/voice.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
