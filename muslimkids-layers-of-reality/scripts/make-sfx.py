"""Delicate sound design for Layers of Reality — no music (Muslim Kids rule).

Everything is synthesised from seeded noise and sines (no samples):
soft airy swells when layers separate, quiet low "settle" touches when
layers rejoin, mountain wind, leaf rustle, a barely audible air bed.
Event times mirror src/engines/ExplodedViewController.ts.
Run: python3 scripts/make-sfx.py  → public/audio/sfx.wav (60 s, 48 kHz stereo)
"""
import json
import numpy as np

SR = 48000
T = 60.0
N = int(SR * T)
rng = np.random.default_rng(1207)
out = np.zeros((N, 2), np.float32)
tl = json.load(open("src/timeline.json"))
S = tl["sentences"]


def band(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X = np.fft.rfft(x)
    m = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    return np.fft.irfft(X * m, len(x)).astype(np.float32)


def place(sig, t0, gain):
    i0 = int(t0 * SR)
    n = min(len(sig), N - i0)
    if n > 0:
        out[i0:i0 + n] += sig[:n] * gain


def db(x):
    return 10 ** (x / 20)


def swell(t0, dur, lo=250, hi=2600, level=-27):
    n = int(dur * SR)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    st = np.stack([band(rng.standard_normal(n), lo, hi), band(rng.standard_normal(n), lo, hi)], 1)
    st /= np.abs(st).max() + 1e-9
    place(st * env[:, None], t0, db(level))


def settle(t0, level=-28, f0=120):
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    tone = np.sin(2 * np.pi * (f0 * tt - 30 * tt * tt)) * np.exp(-tt * 11) * (1 - np.exp(-tt * 400))
    click = band(rng.standard_normal(n), 1800, 5000) * np.exp(-tt * 70) * 0.25
    s = (tone + click).astype(np.float32)
    s /= np.abs(s).max()
    place(np.stack([s, s * 0.92], 1), t0, db(level))


def bed(t0, t1, lo, hi, level, mod_hz=0.15, fade=1.5, crackle=False):
    n = int((t1 - t0) * SR)
    tt = np.arange(n) / SR
    st = np.stack([band(rng.standard_normal(n), lo, hi), band(rng.standard_normal(n), lo, hi)], 1)
    st /= np.abs(st).max() + 1e-9
    env = np.minimum(np.clip(tt / fade, 0, 1), np.clip((tt[-1] - tt) / fade, 0, 1))
    env = env * (0.65 + 0.35 * np.sin(2 * np.pi * mod_hz * tt + 1.3))
    if crackle:  # leaves: sparse rustling bursts
        g = np.repeat(rng.random(n // 2400 + 1), 2400)[:n]
        env = env * np.clip((g - 0.55) * 3, 0, 1) ** 1.5
        k = np.exp(-np.arange(1200) / 300)
        env = np.convolve(env, k / k.sum(), "same")
    place(st * env[:, None], t0, db(level))


# air bed (very quiet, ducked under the Qur'an quote)
bed(0, 44.4, 60, 240, -46, 0.05, 2.0)
bed(44.4, 53.4, 60, 200, -50, 0.04, 1.5)
bed(53.4, 60, 60, 240, -47, 0.05, 1.2)

# Earth
swell(S[1]["start"] - 0.1, 1.2, 400, 3000, -34)       # hook: segment lifts
settle(6.6, -36)
swell(9.8, 2.4, 250, 2200, -28)                        # layers separate
for k in range(5):
    settle(13.0 + k * 0.15 + 0.9, -31 - k * 0.5, 115 + k * 6)
swell(14.4, 1.6, 300, 4000, -33)                       # dive into the mountains

# mountains
bed(15.2, 25.2, 120, 900, -36, 0.12, 2.0)              # wind
swell(19.15, 2.2, 160, 1500, -28)                      # rock layers slide out
for k in range(6):
    settle(22.75 + k * 0.16 + 0.95, -30 - k * 0.4, 95 + k * 5)
bed(24.4, 27.6, 1800, 8000, -37, 0.3, 0.8, crackle=True)  # leaf rustle
swell(26.2, 1.4, 600, 5000, -36)                       # match-dissolve

# leaf
swell(29.3, 1.0, 1200, 6000, -38)                      # x-ray
swell(30.0, 1.8, 500, 3500, -30)                       # tissues separate
swell(31.3, 1.4, 900, 4500, -34)                       # magnified cells
swell(34.6, 1.0, 900, 4500, -38)

# grand composition (quiet, the narration matters most)
swell(36.0, 2.6, 200, 1800, -36)
for k in range(5):
    settle(40.35 + k * 0.24 + 1.4, -31 - k * 0.6, 105 + k * 7)

# ending
bed(53.6, 59.8, 1800, 7000, -42, 0.3, 0.8, crackle=True)
swell(S[14]["start"] + 1.25, 1.0, 600, 4000, -33)
settle(S[14]["start"] + 2.65 + 0.9, -32)

out = np.clip(out * db(5), -0.95, 0.95)
pcm = (out * 32767).astype("<i2")
import wave
with wave.open("public/audio/sfx.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("sfx peak dBFS", round(20 * np.log10(np.abs(out).max() + 1e-9), 1))
