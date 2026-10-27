"""Narration: offline neural TTS (Piper via sherpa-onnx) + word timestamps (offline Zipformer ASR).

Usage:  python3 scripts/generate_voice.py [--force]
Needs:  pip install sherpa-onnx soundfile numpy
Writes: public/audio/voice/<id>.wav (48 kHz mono, loudness-normalised)
        src/content/voice-timing.json (duration + recognised words with start times)
Models are downloaded once from the sherpa-onnx GitHub releases into ~/.cache/muslimkids-tts.
"""
import glob, hashlib, json, pathlib, subprocess, sys, tarfile, urllib.request
import numpy as np, sherpa_onnx, soundfile as sf

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = pathlib.Path.home() / ".cache/muslimkids-tts"
REL = "https://github.com/k2-fsa/sherpa-onnx/releases/download"

def fetch(kind, name):
    d = CACHE / name
    if not d.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        arc = CACHE / f"{name}.tar.bz2"
        subprocess.run(["curl", "-sSL", "--fail", "-o", str(arc), f"{REL}/{kind}/{name}.tar.bz2"], check=True)
        tarfile.open(arc).extractall(CACHE); arc.unlink()
    return d

script = json.loads((ROOT / "src/content/script.json").read_text())
v = script["voice"]
voice_dir = fetch("tts-models", v["model"])
asr_dir = fetch("asr-models", "sherpa-onnx-zipformer-ru-2024-09-18")

tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=glob.glob(f"{voice_dir}/*.onnx")[0], tokens=f"{voice_dir}/tokens.txt",
        data_dir=f"{voice_dir}/espeak-ng-data", noise_scale=0.6, noise_scale_w=0.8), num_threads=4)))
pick = lambda p: sorted(glob.glob(f"{asr_dir}/{p}*int8.onnx"))[0]
asr = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=pick("encoder"), decoder=pick("decoder"), joiner=pick("joiner"),
    tokens=f"{asr_dir}/tokens.txt", num_threads=4, decoding_method="greedy_search")

out_dir = ROOT / "public/audio/voice"; out_dir.mkdir(parents=True, exist_ok=True)
timing_path = ROOT / "src/content/voice-timing.json"
old = json.loads(timing_path.read_text()) if timing_path.exists() else {}
force = "--force" in sys.argv
result = {}

def recognise(path):
    a, sr = sf.read(path, dtype="float32")
    a16 = np.interp(np.linspace(0, len(a) - 1, int(len(a) * 16000 / sr)), np.arange(len(a)), a).astype("float32")
    a16 = np.concatenate([a16, np.zeros(16000, "float32")])  # tail padding so the last word is decoded
    s = asr.create_stream(); s.accept_waveform(16000, a16); asr.decode_stream(s)
    words = []
    for t, ts in zip(s.result.tokens, s.result.timestamps):
        if t[:1] in ("▁", " ") or not words: words.append({"w": t.strip("▁ "), "s": round(float(ts), 2)})
        else: words[-1]["w"] += t
    return s.result.text, words

for line in script["lines"]:
    lid, text = line["id"], line["text"]
    speed = line.get("speed", v["speed"])
    h = hashlib.sha1(f"{text}|{v['model']}|{speed}|rms2".encode()).hexdigest()[:12]
    wav = out_dir / f"{lid}.wav"
    if not force and wav.exists() and old.get(lid, {}).get("hash") == h:
        result[lid] = old[lid]; continue
    audio = tts.generate(text, sid=0, speed=speed)
    raw = out_dir / f"{lid}.raw.wav"; sf.write(raw, audio.samples, audio.sample_rate)
    # trim silence, gentle warmth EQ, 48 kHz; then linear RMS normalisation (no dynamic compression)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
        "equalizer=f=180:t=q:w=1:g=2,equalizer=f=6500:t=q:w=1.5:g=-2,aresample=48000",
        "-ac", "1", str(wav)], check=True)
    raw.unlink()
    a, sr = sf.read(str(wav), dtype="float32")
    a *= min(10 ** (-20 / 20) / max(np.sqrt(np.mean(a ** 2)), 1e-6), 0.89 / max(np.abs(a).max(), 1e-6))
    sf.write(str(wav), a, sr, subtype="PCM_16")
    dur = sf.info(str(wav)).duration
    heard, words = recognise(str(wav))
    result[lid] = {"hash": h, "duration": round(dur, 3), "text": text, "heard": heard, "words": words}
    print(f"{lid} {dur:5.2f}s | {heard}")

timing_path.write_text(json.dumps(result, ensure_ascii=False, indent=1))
