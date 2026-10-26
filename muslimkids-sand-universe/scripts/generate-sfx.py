"""Delicate sand sound design for Sand Universe — no music (Muslim Kids rule).

Driven by public/audio/motion-envelope.json (exported from the real
animation by scripts/analyze-motion.ts), so every rustle is synchronised
with grains that are actually moving on screen:
  * grain rustle  — thousands of micro-clicks, density ∝ grains in flight
  * settling      — softer, lower patter when grains land + a gentle "shhh"
  * air           — very quiet band-limited air that follows the big flows
  * wind bed      — barely audible natural wind under everything
Output: public/audio/sfx.wav (48 kHz stereo).
"""
import json
import numpy as np
from scipy.signal import butter, sosfilt
import soundfile as sf

SR = 48000
rng = np.random.default_rng(14)
env = json.load(open("public/audio/motion-envelope.json"))
fps, frames = env["fps"], env["frames"]
n = int(frames / fps * SR)


def frame_curve(values, smooth_s=0.12):
    v = np.asarray(values, dtype=np.float64)
    t = np.arange(n) / SR * fps
    c = np.interp(t, np.arange(len(v)), v)
    k = max(1, int(smooth_s * SR))
    w = np.hanning(2 * k + 1)
    w /= w.sum()
    return np.convolve(c, w, mode="same")


def band(x, lo, hi, order=4):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def clicks(rate_curve, lo, hi, amp_scale):
    """Poisson micro-clicks (sand grains touching), stereo-panned."""
    p = np.clip(rate_curve / SR, 0, 1)
    hits = rng.random(n) < p
    amps = rng.exponential(1.0, n) * hits
    out = np.zeros((n, 2))
    pan = rng.random(n)
    out[:, 0] = amps * np.sqrt(1 - pan)
    out[:, 1] = amps * np.sqrt(pan)
    # Each click: a tiny decaying burst (≈1 ms) then band-limited.
    kern = rng.standard_normal(64) * np.exp(-np.arange(64) / 9.0)
    for ch in range(2):
        out[:, ch] = band(np.convolve(out[:, ch], kern, mode="same"), lo, hi)
    return out * amp_scale


flight = frame_curve(env["flight"], 0.15)
land = frame_curve(env["land"], 0.08) * fps  # fraction of all grains landing per second
depart = frame_curve(env["depart"], 0.08) * fps

rustle = clicks(220 + 2600 * np.sqrt(flight), 1800, 9500, 0.05)
patter = clicks(9000 * np.sqrt(np.clip(land, 0, None)), 500, 3200, 0.06)

noise = rng.standard_normal((n, 2))
air = np.stack([band(noise[:, c], 250, 1400, 2) for c in range(2)], 1) * (0.012 * np.sqrt(flight))[:, None]
shh = np.stack([band(noise[::-1, c], 2500, 8000, 2) for c in range(2)], 1) * (0.02 * np.sqrt(np.clip(land + depart * 0.5, 0, None) / 3))[:, None]

# Natural wind bed: slowly breathing low-passed noise, barely audible.
t = np.arange(n) / SR
lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t) * np.sin(2 * np.pi * 0.031 * t + 1)
wind_src = rng.standard_normal((n, 2))
wind = np.stack([sosfilt(butter(2, 420, btype="low", fs=SR, output="sos"), wind_src[:, c]) for c in range(2)], 1)
wind *= (0.012 * lfo)[:, None]

mix = rustle + patter + air + shh + wind
# Quiet, calm ending for the Quran quote and the end card.
calm = np.interp(t, [0, 52.0, 53.0, 60.0], [1.0, 1.0, 0.45, 0.35])
fade = np.interp(t, [0, 0.3, 58.8, 60.0], [0, 1, 1, 0])
mix *= (calm * fade)[:, None]
peak = np.max(np.abs(mix))
mix *= 10 ** (-12 / 20) / peak  # sfx stem peaks at -12 dBFS before the final mix
sf.write("public/audio/sfx.wav", mix.astype(np.float32), SR, subtype="PCM_24")
print("sfx.wav", f"{n / SR:.2f}s")
