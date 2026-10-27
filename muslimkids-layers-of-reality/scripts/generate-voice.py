"""Russian narration for Layers of Reality — free local neural TTS.

Voice: Piper «ru_RU-denis-medium» (VITS, run through sherpa-onnx; model from
github.com/k2-fsa/sherpa-onnx releases, tts-models). Each sentence is
synthesised separately, measured, and placed into its scene slot; the
resulting timings are written to src/timeline.json which drives every
animation (AudioSyncSystem). Speech tempo is never altered after synthesis.

Run: python3 scripts/generate-voice.py
"""
import glob, json, os, re, subprocess
import numpy as np
import sherpa_onnx
import soundfile as sf

VOICE_DIR = "scripts/.cache/tts/vits-piper-ru_RU-" + os.environ.get("VOICE", "denis") + "-medium"
FPS = 30
TOTAL = 60.0
SR = 48000

# (scene id, nominal start s, sentences, key words: (sentence idx, word, position 0..1))
SCRIPT = [
    ("earth", 0.0, ["Ты когда-нибудь задумывался, что скрывается внутри знакомых вещей?", "Посмотри!"]),
    ("earthLayers", 6.0, ["Земля вращается: поэтому день сменяет ночь.", "А внутри у планеты есть разные слои!"]),
    ("mountains", 15.0, ["Теперь взгляни на горы!", "Мы видим их вершины.", "Но под поверхностью тоже скрываются горные породы."]),
    ("leaf", 25.0, ["А теперь — маленький листочек.", "Снаружи он зелёный.", "Но внутри него есть прожилки и множество крошечных клеток!"]),
    ("grand", 35.0, ["В суре Аль-Имран говорится:", "в сотворении небес и земли, в смене ночи и дня есть знамения для обладающих разумом."]),
    ("quran", 44.6, ["И верующие говорят:", "Господь наш! Ты не сотворил это понапрасну."]),
    ("ending", 53.2, ["А что удивительного заметишь сегодня ты?", "Посмотри вокруг!"]),
]
LEAD = 0.35      # silence before a scene's first sentence
GAP = 0.38       # pause between sentences
MIN_SCENE_GAP = 0.55

model = glob.glob(VOICE_DIR + "/*.onnx")[0]
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(
    model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=model, tokens=VOICE_DIR + "/tokens.txt",
            data_dir=VOICE_DIR + "/espeak-ng-data",
            noise_scale=0.6, noise_scale_w=0.75, length_scale=1.04),
        num_threads=4)))


ASR_DIR = "scripts/.cache/tts/sherpa-onnx-whisper-small/"
asr = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=ASR_DIR + "small-encoder.int8.onnx", decoder=ASR_DIR + "small-decoder.int8.onnx",
    tokens=ASR_DIR + "small-tokens.txt", language="ru", task="transcribe", num_threads=4)
TAKES = 6
norm = lambda s: " ".join(re.sub(r"[^а-я ]", " ", s.lower().replace("ё", "е")).split())


def lev(x, y):
    d = list(range(len(y) + 1))
    for i, cx in enumerate(x, 1):
        p, d[0] = d[0], i
        for j, cy in enumerate(y, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (cx != cy))
    return d[-1]


def synth(text):
    """VITS is stochastic: synthesise several takes, keep the one Whisper
    understands best (lowest CER), i.e. the clearest pronunciation."""
    best = None
    for k in range(TAKES):
        a = tts.generate(text, sid=0, speed=1.0)
        x = np.asarray(a.samples, dtype=np.float32)
        pad = np.zeros(a.sample_rate // 3, np.float32)
        st = asr.create_stream(); st.accept_waveform(a.sample_rate, np.concatenate([pad, x, pad]))
        asr.decode_stream(st)
        cer = lev(norm(text), norm(st.result.text)) / len(norm(text))
        if best is None or cer < best[0]:
            best = (cer, x, st.result.text)
    print(f"   take CER {best[0]:.2f}  {text}  ->  {best[2]}")
    x = best[1]
    # trim leading / trailing silence
    env = np.convolve(np.abs(x), np.ones(256) / 256, mode="same")
    idx = np.where(env > 0.01)[0]
    x = x[max(idx[0] - 1600, 0): idx[-1] + 2400]
    # resample 22.05k -> 48k (linear is fine after ffmpeg polish below)
    n = int(len(x) * SR / a.sample_rate)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


track = np.zeros(int(TOTAL * SR), dtype=np.float32)
timeline = {"fps": FPS, "durationInFrames": int(TOTAL * FPS), "scenes": [], "sentences": []}
cursor = 0.0
for sid, nominal, sentences in SCRIPT:
    start = max(nominal + LEAD, cursor + MIN_SCENE_GAP)
    t = start
    sents = []
    for text in sentences:
        x = synth(text)
        d = len(x) / SR
        i0 = int(t * SR)
        track[i0:i0 + len(x)] += x[: len(track) - i0]
        sents.append({"scene": sid, "text": text, "start": round(t, 3), "end": round(t + d, 3)})
        t += d + GAP
    cursor = t - GAP
    timeline["sentences"] += sents
    timeline["scenes"].append({"id": sid, "nominalStart": nominal, "voiceStart": round(start, 3), "voiceEnd": round(cursor, 3)})
    print(f"{sid:12s} voice {start:6.2f} – {cursor:6.2f}")

assert cursor < TOTAL - 2.5, f"narration too long: ends at {cursor:.2f}s"

os.makedirs("scripts/.cache", exist_ok=True)
sf.write("scripts/.cache/voice_raw.wav", track, SR)
# gentle polish: rumble filter, slight warmth, light de-harsh, loudness -16 LUFS
subprocess.run([
    "ffmpeg", "-y", "-v", "error", "-i", "scripts/.cache/voice_raw.wav", "-af",
    "highpass=f=70,equalizer=f=180:t=q:w=1:g=2,equalizer=f=6500:t=q:w=2:g=-2.5,"
    "aecho=0.8:0.5:28:0.06,loudnorm=I=-16:TP=-1.5:LRA=9",
    "-ar", str(SR), "-ac", "1", "public/audio/voice.wav"], check=True)
json.dump(timeline, open("src/timeline.json", "w"), ensure_ascii=False, indent=1)
print("written public/audio/voice.wav, src/timeline.json")
