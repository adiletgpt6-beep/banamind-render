"""Synthesize the video's original, unobtrusive sound effects (no samples)."""
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
OUT = Path(__file__).resolve().parents[2] / "public" / "voicestudio-demo" / "sfx"
rng = np.random.default_rng(7)


def env(n, attack, release):
    a = int(attack * SR)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[a:] = np.exp(-np.linspace(0, release, n - a))
    return e


def lowpass(x, alpha):
    y = np.zeros_like(x)
    for i in range(1, len(x)):
        y[i] = y[i - 1] + alpha[i] * (x[i] - y[i - 1])
    return y


def pop():
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 18) + 380
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 9)
    return x * 0.8


def whoosh():
    n = int(0.55 * SR)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    alpha = 0.02 + 0.25 * np.sin(np.pi * t) ** 2
    x = lowpass(noise, alpha) * np.sin(np.pi * t) ** 1.5
    return x / np.max(np.abs(x)) * 0.7


def chime():
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for k, (f, d) in enumerate([(784, 0.0), (1046.5, 0.12), (1318.5, 0.24)]):
        s = int(d * SR)
        tt = t[: n - s]
        x[s:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4) * (0.5 + 0.2 * np.sin(2 * np.pi * 2 * f * tt))
    return x / np.max(np.abs(x)) * 0.6


OUT.mkdir(parents=True, exist_ok=True)
for name, fn in {"pop": pop, "whoosh": whoosh, "chime": chime}.items():
    sf.write(OUT / f"{name}.wav", fn().astype(np.float32), SR, subtype="PCM_16")
    print("wrote", OUT / f"{name}.wav")
