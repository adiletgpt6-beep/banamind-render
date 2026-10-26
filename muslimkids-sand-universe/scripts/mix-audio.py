"""Final mix: narration clips at their timeline cues + ducked sand SFX.
Writes public/audio/mix.wav (48 kHz stereo, -16 LUFS, true peak -1.5 dB).
"""
import json, subprocess
import numpy as np
import soundfile as sf

SR = 48000
tl = json.load(open("src/timeline.json"))
total = tl["durationInFrames"] / tl["fps"]
n = int(total * SR)
voice = np.zeros(n)
active = np.zeros(n)
for sid, start in tl["voice"].items():
    clip, sr = sf.read(f"public/audio/voice/{sid}.wav", dtype="float64")
    assert sr == SR
    a = int(start * SR)
    b = min(n, a + len(clip))
    voice[a:b] += clip[: b - a]
    active[max(0, a - SR // 5): min(n, b + SR // 4)] = 1
sfx, sr = sf.read("public/audio/sfx.wav", dtype="float64")
assert sr == SR
sfx = sfx[:n]
# Smooth ducking: the narrator is always the main sound.
k = SR // 4
w = np.hanning(2 * k + 1)
w /= w.sum()
duck = 1 - 0.45 * np.convolve(active, w, mode="same")
voice_gain = 10 ** (-1 / 20) / np.max(np.abs(voice))
sfx_gain = 10 ** (-17 / 20) / np.max(np.abs(sfx))  # SFX ≈16 dB under the voice peak
mix = np.stack([voice * voice_gain] * 2, 1) + sfx * sfx_gain * duck[:, None]
sf.write("public/audio/mix.pre.wav", mix.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/audio/mix.pre.wav", "-af",
                "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "pcm_s16le", "public/audio/mix.wav"], check=True)
import os
os.remove("public/audio/mix.pre.wav")
print("mix.wav ready")
