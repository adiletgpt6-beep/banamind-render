"""Procedural sound design for MUSLIM KIDS episodes (no music).

Every sound is synthesised from noise and simple oscillators — soft, natural,
never percussive — and placed at the cue frames of
src/episodes/<ep>/timing.json. The bed is ducked under the narration so
speech always stays in front. Output: public/audio/<ep>/sfx/sound-design.wav

Usage: python scripts/generate_sfx.py [--episode ep001]
"""

import argparse
import json
import os
import wave

import numpy as np
from scipy import signal

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(190191)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def band(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lowpass(x, hi, order=2):
    return signal.sosfilt(signal.butter(order, hi, btype="low", fs=SR, output="sos"), x)


def highpass(x, lo, order=2):
    return signal.sosfilt(signal.butter(order, lo, btype="high", fs=SR, output="sos"), x)


def swell(n, attack=0.4, release=0.6):
    """Smooth envelope: sine rise (attack share) and cosine fall."""
    t = np.linspace(0, 1, n)
    env = np.ones(n)
    a = max(1, int(n * attack))
    r = max(1, int(n * release))
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    env[-r:] *= np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return env


def sweep_noise(sec, f0, f1, f2=None, q=1.6):
    """Noise through a band-pass whose centre glides f0 → f1 (→ f2)."""
    n = int(sec * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    hop = 1024
    win = np.hanning(hop * 2)
    centres = np.geomspace(f0, f1, n) if f2 is None else np.concatenate(
        [np.geomspace(f0, f1, n // 2), np.geomspace(f1, f2, n - n // 2)]
    )
    for start in range(0, n - hop * 2, hop):
        seg = noise[start : start + hop * 2]
        c = centres[start + hop]
        lo, hi = c / q, min(c * q, SR / 2 - 100)
        out[start : start + hop * 2] += band(seg, lo, hi) * win
    return out


def stereo(x, pan=0.0):
    """pan -1..1 (constant power) → (n, 2)."""
    if np.ndim(pan) == 0:
        pan = np.full(len(x), pan)
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def norm(x, peak_db):
    m = np.max(np.abs(x)) or 1
    return x / m * 10 ** (peak_db / 20)


# ── sound recipes ────────────────────────────────────────────────────────
def s_breath(len_=1.3):
    n = int(len_ * SR)
    x = band(rng.standard_normal(n), 700, 3200) * swell(n, 0.45, 0.55)
    t = t_axis(len_)
    shimmer = sum(np.sin(2 * np.pi * f * t + p) * np.exp(-t * d) for f, p, d in [(2349, 0.3, 3), (3137, 1.1, 4), (4703, 2.0, 5)])
    x = x + 0.12 * shimmer * swell(n, 0.3, 0.7)
    return stereo(x, 0.0)


def s_whoosh(len_=0.8):
    n = int(len_ * SR)
    x = sweep_noise(len_, 260, 2400, 700) * swell(n, 0.42, 0.58)
    return stereo(x, np.linspace(-0.6, 0.6, n))


def s_sunrise(len_=2.4):
    n = int(len_ * SR)
    t = t_axis(len_)
    air = band(rng.standard_normal(n), 180, 900) * 0.6
    tone = 0.25 * (np.sin(2 * np.pi * 219.5 * t) + 0.7 * np.sin(2 * np.pi * 220.8 * t + 1))
    glow = 0.08 * np.sin(2 * np.pi * 1318 * t) * np.exp(-t * 1.2)
    return stereo((air + tone + glow) * swell(n, 0.5, 0.5), 0.0)


def s_nightfall(len_=2.6):
    n = int(len_ * SR)
    return stereo(sweep_noise(len_, 2200, 380) * swell(n, 0.3, 0.7), np.linspace(0.3, -0.3, n))


def s_wind(len_=9.5):
    n = int(len_ * SR)
    t = t_axis(len_)
    base = lowpass(rng.standard_normal(n), 650, 3)
    gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * t + 0.4) * np.sin(2 * np.pi * 0.31 * t + 1.3)
    whistle = band(rng.standard_normal(n), 900, 1300) * 0.12 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.2 * t))
    x = (base * gust + whistle) * swell(n, 0.18, 0.2)
    return stereo(x, 0.35 * np.sin(2 * np.pi * 0.07 * t))


def s_tink(len_=0.7):
    t = t_axis(len_)
    f = 2400 + 500 * (1 - np.exp(-t * 40))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    return stereo(x * swell(len(t), 0.02, 0.6), -0.1)


def s_drop(len_=1.4):
    t = t_axis(len_)
    # resonant bubble: frequency rises quickly — the classic "plip"
    f = 700 + 1100 * (1 - np.exp(-t * 55))
    bubble = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26)
    splash = highpass(rng.standard_normal(len(t)), 2500) * np.exp(-t * 60) * 0.35
    thump = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 30) * 0.5
    tail = band(rng.standard_normal(len(t)), 1500, 5000) * np.exp(-t * 7) * 0.04
    second = np.zeros_like(t)
    k = int(0.11 * SR)
    second[k:] = 0.35 * bubble[: len(t) - k] * 0.8
    return stereo(bubble + second + splash + thump + tail, 0.05)


def s_growth(len_=4.2):
    n = int(len_ * SR)
    x = sweep_noise(len_, 260, 1700, q=1.4) * swell(n, 0.6, 0.35) * 0.8
    # tiny soft "fibre" crackles of a growing stem
    cr = np.zeros(n)
    for k in rng.choice(np.arange(int(0.6 * SR), n - 2000), 26, replace=False):
        cr[k : k + 400] += np.hanning(400) * rng.uniform(0.2, 0.6)
    x += band(cr * rng.standard_normal(n), 1500, 4500) * 0.5
    return stereo(x, np.linspace(-0.15, 0.15, n))


def s_rustle(len_=1.6):
    n = int(len_ * SR)
    grains = np.zeros(n)
    for k in rng.choice(np.arange(0, n - 3000), 60, replace=False):
        grains[k : k + 2400] += np.hanning(2400) * rng.uniform(0.2, 1)
    x = band(rng.standard_normal(n), 2000, 7500) * grains * swell(n, 0.3, 0.5)
    return stereo(x, 0.1)


def s_sparkle(len_=1.1):
    t = t_axis(len_)
    base = rng.uniform(2600, 3400)
    x = sum(np.sin(2 * np.pi * base * r * t + p) * np.exp(-t * d) for r, p, d in [(1, 0, 5), (1.47, 1, 6), (2.21, 2, 8)])
    x += band(rng.standard_normal(len(t)), 5000, 11000) * np.exp(-t * 10) * 0.2
    return stereo(x * swell(len(t), 0.01, 0.8), rng.uniform(-0.5, 0.5))


def s_air(len_=2.4):
    n = int(len_ * SR)
    x = band(rng.standard_normal(n), 140, 700) * swell(n, 0.5, 0.5)
    return stereo(x, np.linspace(-0.25, 0.25, n))


RECIPES = {
    "breath": s_breath, "whoosh": s_whoosh, "sunrise": s_sunrise, "nightfall": s_nightfall,
    "wind": s_wind, "tink": s_tink, "drop": s_drop, "growth": s_growth, "rustle": s_rustle,
    "sparkle": s_sparkle, "air": s_air,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="ep001")
    args = ap.parse_args()
    timing = json.load(open(os.path.join(ROOT, "src", "episodes", args.episode, "timing.json")))
    manifest = json.load(open(os.path.join(ROOT, "public", "audio", args.episode, "voice", "manifest.json")))
    fps, dur = timing["fps"], timing["durationSec"]
    n = int(dur * SR)
    bed = np.zeros((n, 2))
    for cue in timing["sfx"]:
        fn = RECIPES[cue["id"]]
        snd = fn(cue["len"]) if "len" in cue else fn()
        snd = norm(snd, cue["gain"] + 12)  # peak ≈ gain + 12 dB (soft sounds have high crest factor)
        start = int(cue["f"] / fps * SR)
        end = min(n, start + len(snd))
        bed[start:end] += snd[: end - start]
    # Duck the bed by 5 dB under narration (smooth 120 ms ramps).
    duck = np.ones(n)
    for line in manifest["lines"]:
        s = timing["voiceStartSec"][line["id"]]
        a, b = int((s - 0.1) * SR), int((s + line["durationSec"] + 0.2) * SR)
        duck[max(0, a) : min(n, b)] = 10 ** (-5 / 20)
    duck = np.convolve(duck, np.ones(int(0.12 * SR)) / int(0.12 * SR), mode="same")
    bed *= duck[:, None]
    peak = np.max(np.abs(bed))
    if peak > 10 ** (-3 / 20):
        bed *= 10 ** (-3 / 20) / peak
    out = os.path.join(ROOT, "public", "audio", args.episode, "sfx", "sound-design.wav")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(bed, -1, 1) * 32767).astype("<i2").tobytes())
    print(f"wrote {out}  peak {20 * np.log10(np.max(np.abs(bed)) + 1e-9):.1f} dBFS")


if __name__ == "__main__":
    main()
