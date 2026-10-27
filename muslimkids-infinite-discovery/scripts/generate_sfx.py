"""Gentle procedural sound design (no music) → public/audio/sfx.wav (48 kHz stereo).

Every cue comes from src/content/timeline.json ("sfx"), so retiming the film retimes the sound.
Cue types are soft by design: filtered-noise air, a water-drop "plink", glassy chimes.
Usage: python3 scripts/generate_sfx.py
"""
import json, pathlib
import numpy as np
import soundfile as sf

ROOT = pathlib.Path(__file__).resolve().parent.parent
tl = json.loads((ROOT / "src/content/timeline.json").read_text())
SR = 48000
N = int(tl["durationSec"] * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(7)

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    # vectorised enough for our short cues
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y

def band_noise(n, lo, hi):
    """noise shaped in the frequency domain (fast, smooth)"""
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    lo = np.broadcast_to(lo, f.shape) if np.ndim(lo) == 0 else lo
    w = np.exp(-0.5 * ((np.log(np.maximum(f, 1)) - np.log(np.sqrt(lo * hi))) / (np.log(hi / lo) / 2.2)) ** 2)
    y = np.fft.irfft(spec * w, n)
    return y / (np.abs(y).max() + 1e-9)

def env(n, a, r, shape=2.0):
    t = np.linspace(0, 1, n)
    e = np.minimum(1, t / max(a, 1e-4)) ** shape * np.minimum(1, (1 - t) / max(r, 1e-4)) ** shape
    return e

def stereo(x, width=0.3):
    d = int(SR * 0.012)
    l = x; r = np.concatenate([np.zeros(d), x[:-d]]) if d < len(x) else x
    return np.stack([l * (1 - width / 2) + r * width / 2, r * (1 - width / 2) + l * width / 2], 1)

def sweep_noise(n, f0, f1):
    """noise whose centre frequency sweeps f0 → f1 (cross-fade of 6 bands)"""
    y = np.zeros(n); t = np.linspace(0, 1, n)
    cs = np.geomspace(f0, f1, 6)
    for k, c in enumerate(cs):
        w = np.exp(-0.5 * ((t * 5 - k) / 0.9) ** 2)
        y += band_noise(n, c / 1.8, c * 1.8) * w
    return y / (np.abs(y).max() + 1e-9)

def cue(kind, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    if kind == "shimmer":
        x = sum(np.sin(2 * np.pi * f * t + p) * np.exp(-t * 1.2) for f, p in [(1568, 0), (2093, 1), (2637, 2)]) / 3
        x *= env(n, 0.25, 0.6, 1.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t))
        return stereo(x * 0.5 + band_noise(n, 3000, 9000) * env(n, 0.4, 0.5) * 0.25, 0.6)
    if kind == "bloom":
        x = band_noise(n, 60, 240) * env(n, 0.45, 0.5, 1.6)
        x += np.sin(2 * np.pi * 73 * t) * env(n, 0.5, 0.5, 2) * 0.5
        return stereo(x, 0.2)
    if kind == "whoosh":
        return stereo(sweep_noise(n, 200, 2600) * env(n, 0.55, 0.35, 1.8), 0.5)
    if kind == "wind":
        x = band_noise(n, 300, 1800) * env(n, 0.4, 0.45, 1.6) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.7 * t))
        return stereo(x, 0.7)
    if kind == "rustle":
        g = (rng.random(n) < 0.004).astype(float)
        g = np.convolve(g, np.exp(-np.arange(int(0.02 * SR)) / (0.004 * SR)), "same")
        x = band_noise(n, 2500, 8000) * (0.3 + g) * env(n, 0.3, 0.4)
        return stereo(x / (np.abs(x).max() + 1e-9), 0.8)
    if kind == "drop":
        f = 1350 * np.exp(-t * 9) + 520
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = np.sin(ph) * np.exp(-t * 9) + 0.25 * np.sin(2 * ph) * np.exp(-t * 14)
        x[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
        x += band_noise(n, 1500, 6000) * np.exp(-t * 40) * 0.15
        return stereo(x, 0.2)
    if kind == "chime":
        x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(1046.5, 1, 2.2), (1568, 0.55, 2.8), (2093, 0.3, 3.5)])
        x[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
        return stereo(x * env(n, 0.001, 0.25, 1), 0.5)
    if kind == "dive":
        return stereo(sweep_noise(n, 1800, 140) * env(n, 0.5, 0.4, 1.7) + np.sin(2 * np.pi * 55 * t) * env(n, 0.6, 0.4) * 0.3, 0.4)
    if kind == "turn":
        return stereo(sweep_noise(n, 400, 1500) * env(n, 0.45, 0.45, 2), 0.6)
    if kind == "reverse":
        x = sweep_noise(n, 120, 3200) * env(n, 0.3, 0.25, 1.5)
        x += np.sin(2 * np.pi * np.cumsum(np.linspace(55, 110, n)) / SR) * env(n, 0.4, 0.4) * 0.25
        return stereo(x, 0.6)
    if kind == "air":
        return stereo(band_noise(n, 150, 900) * env(n, 0.45, 0.45, 2), 0.7)
    if kind == "night":
        x = band_noise(n, 200, 1200) * env(n, 0.4, 0.3, 2)
        # very soft distant crickets
        c = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > 0.6) * (np.sin(2 * np.pi * 0.9 * t) > 0) * 0.12
        return stereo(x + c * env(n, 0.5, 0.3), 0.8)
    raise ValueError(kind)

for c in tl["sfx"]:
    x = cue(c["type"], c["dur"])
    peak = np.abs(x).max() + 1e-9
    x = x / peak * 10 ** (c["gain"] / 20) * 2.2  # gain ≈ RMS-ish level under the -20 dBFS voice
    i0 = int(c["at"] * SR); i1 = min(N, i0 + len(x))
    out[i0:i1] += x[: i1 - i0]

out = np.clip(out, -0.9, 0.9)
sf.write(ROOT / "public/audio/sfx.wav", out, SR, subtype="PCM_16")
print("sfx peak dBFS", 20 * np.log10(np.abs(out).max() + 1e-9))
