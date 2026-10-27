"""Audio assembly: narration blocks on the film timeline + sparse soft non-melodic effects.

  python3 mix.py OUTDIR
writes OUTDIR/NOX_narration_RU.wav (voice only) and OUTDIR/mix.wav (voice + effects),
both 48 kHz, exactly 1800 s, loudness-normalised (two-pass EBU R128, target −16 LUFS, TP −1.5)."""
import json
import os
import re
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(HERE, "..", "engine"))
import film  # noqa: E402

SR = 48000
N = int(film.TOTAL * SR)
VOICE_DIR = os.path.join(HERE, "..", "voice", "blocks")


def decode(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).copy()


def fade(x, n_in, n_out):
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def build_voice(timing):
    v = np.zeros(N, np.float32)
    report = []
    for bid, b in timing.blocks.items():
        f = os.path.join(VOICE_DIR, f"{bid}.mp3")
        if not os.path.exists(f) or b["al"] is None:
            print(f"WARNING: no narration for {bid} (text changed or not synthesized)")
            report.append({"id": bid, "missing": True})
            continue
        x = decode(f)
        pre, post = 0.08, 0.30
        s0 = max(0, int((b["trim"] - pre) * SR))
        s1 = min(len(x), int((b["trim"] + b["dur"] + post) * SR))
        seg = fade(x[s0:s1].copy(), int(0.012 * SR), int(0.06 * SR))
        at = int((b["start"] - (b["trim"] - s0 / SR)) * SR)
        if at < 0:
            seg = seg[-at:]
            at = 0
        end = min(N, at + len(seg))
        v[at:end] += seg[:end - at]
        report.append({"id": bid, "start": round(at / SR, 3), "end": round(end / SR, 3)})
    return v, report


# ------------------------------------------------------------------ soft effects (noise based)
def _noise(n, seed):
    return np.random.default_rng(seed).normal(0, 1, n).astype(np.float32)


def _lp(x, a):
    from scipy.signal import lfilter
    return lfilter([a], [1, -(1 - a)], x).astype(np.float32)


def _lpf(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    # vectorised one-pole via lfilter-like cumulative approach (short signals)
    return _lp(x, a)


def _env(n, att, dec):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(att, 1e-4)) * np.exp(-np.maximum(0, t - att) / max(dec, 1e-4))
    return e.astype(np.float32)


def sfx(kind, seed):
    """Short soft effect (mono float32). Non-melodic: filtered noise and clicks only."""
    if kind in ("tick", "click"):
        n = int(0.05 * SR)
        x = _noise(n, seed) * _env(n, 0.0005, 0.006)
        x = x - _lpf(x, 2500)            # bright, tiny
        return x * 0.5
    if kind == "ticks10":
        out = np.zeros(int(1.4 * SR), np.float32)
        for k in range(10):
            t = sfx("tick", seed + k)
            i = int(k * 0.12 * SR)
            out[i:i + len(t)] += t * 0.8
        return out
    if kind in ("drop", "pop", "out"):
        n = int(0.18 * SR)
        x = _lpf(_noise(n, seed), 700 if kind == "drop" else 1400) * _env(n, 0.003, 0.04)
        return x * 2.2
    if kind in ("flow", "whoosh", "morph", "shimmer", "rise", "dim", "lit", "neon", "spark", "fizzle",
                "deflate", "paper", "chime_soft"):
        dur = {"flow": 1.6, "whoosh": 0.9, "morph": 1.2, "shimmer": 1.8, "rise": 1.8, "dim": 1.6, "lit": 1.0,
               "neon": 1.2, "spark": 0.35, "fizzle": 0.7, "deflate": 0.8, "paper": 0.5, "chime_soft": 1.2}[kind]
        n = int(dur * SR)
        x = _noise(n, seed)
        bright = {"flow": 3000, "whoosh": 2000, "morph": 2500, "shimmer": 6000, "rise": 1800, "dim": 1200, "lit": 4000,
                  "neon": 3500, "spark": 7000, "fizzle": 5000, "deflate": 900, "paper": 3500, "chime_soft": 5000}[kind]
        x = _lpf(x, bright)
        x = x - _lpf(x, 250)
        t = np.linspace(0, 1, n, dtype=np.float32)
        if kind in ("rise", "lit"):
            env = t ** 1.5 * np.exp(-((t - 0.85) ** 2) / 0.02) + t * 0.3
        elif kind in ("dim", "deflate"):
            env = (1 - t) ** 2
        elif kind in ("spark", "fizzle"):
            env = np.exp(-t * 8)
        else:
            env = np.sin(np.pi * t) ** 2
        return (x * env * 0.9).astype(np.float32)
    if kind in ("clunk", "locked", "creak", "chain", "crumble", "fixed", "unlock", "pulse"):
        dur = {"clunk": 0.5, "locked": 0.35, "creak": 0.9, "chain": 0.8, "crumble": 1.6, "fixed": 0.5, "unlock": 0.6,
               "pulse": 1.2}[kind]
        n = int(dur * SR)
        out = np.zeros(n, np.float32)
        hits = {"clunk": [0.0], "locked": [0.0, 0.12], "creak": [0.0, 0.25, 0.5], "chain": [0, .1, .2, .3, .4],
                "crumble": list(np.linspace(0, 1.2, 14)), "fixed": [0.0, 0.15], "unlock": [0.0, 0.3],
                "pulse": [0.0, 0.4, 0.8]}[kind]
        rng = np.random.default_rng(seed)
        for h in hits:
            m = int(0.12 * SR)
            hx = _lpf(_noise(m, seed + int(h * 100)), 900 if kind in ("clunk", "crumble") else 2200)
            hx = hx * _env(m, 0.001, 0.025) * rng.uniform(0.6, 1.0)
            i = int(h * SR)
            out[i:i + m] += hx[:max(0, min(m, n - i))]
        return out * 1.8
    raise KeyError(kind)


def build_fx(st, voice):
    fx = np.zeros((N, 2), np.float32)
    for k, (t, kind, gain) in enumerate(sorted(st.sfx)):
        x = sfx(kind, 1000 + k)
        i = int(t * SR)
        if i >= N:
            continue
        x = x[:N - i]
        pan = np.random.default_rng(k).uniform(-0.25, 0.25)
        fx[i:i + len(x), 0] += x * gain * (1 - pan)
        fx[i:i + len(x), 1] += x * gain * (1 + pan)
    # duck effects under speech (smoothed voice envelope)
    hop = 480
    e = np.sqrt(np.convolve(voice[: N // hop * hop].reshape(-1, hop).__pow__(2).mean(1), np.ones(10) / 10, "same"))
    duck = np.repeat(np.where(e > 0.01, 0.45, 1.0), hop)
    duck = np.convolve(duck, np.ones(4800) / 4800, "same")[:N]
    fx[: len(duck)] *= duck[:, None]
    return fx * 0.06   # effects sit well below the voice


def loudnorm(inp, out, target=-16.0, tp=-1.5, lra=9):
    """Two-pass ffmpeg loudnorm (linear), PCM 24-bit 48 kHz."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", inp, "-af",
                        f"loudnorm=I={target}:TP={tp}:LRA={lra}:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S)[-1])
    af = (f"loudnorm=I={target}:TP={tp}:LRA={lra}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:"
          f"linear=true:print_format=json")
    r2 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", inp, "-af", af, "-ar", str(SR),
                         "-c:a", "pcm_s24le", out], capture_output=True, text=True)
    m2 = json.loads(re.findall(r"\{[^{}]*\"output_i\"[^{}]*\}", r2.stderr, re.S)[-1])
    return m, m2


def write_wav(path, x):
    import wave
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = x[:, None]
    pcm = (x * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(x.shape[1])
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    import scenes
    from stage import Stage
    timing = film.Timing()
    st = Stage(timing)
    scenes.build_all(st)
    voice, rep = build_voice(timing)
    # gentle cleanup: high-pass 60 Hz and a very light compressor (no pumping)
    raw_v = os.path.join(out, "voice_raw.wav")
    write_wav(raw_v, voice * 0.9)
    fx = build_fx(st, voice)
    stereo = np.stack([voice * 0.9, voice * 0.9], 1) + fx
    raw_m = os.path.join(out, "mix_raw.wav")
    write_wav(raw_m, stereo)
    proc = "highpass=f=60,acompressor=threshold=0.125:ratio=2:attack=15:release=250:makeup=1"
    for a, b in ((raw_v, "voice_proc.wav"), (raw_m, "mix_proc.wav")):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a, "-af", proc, "-c:a", "pcm_s24le",
                        os.path.join(out, b)], check=True)
    m_in, m_out = loudnorm(os.path.join(out, "mix_proc.wav"), os.path.join(out, "mix.wav"))
    v_in, v_out = loudnorm(os.path.join(out, "voice_proc.wav"), os.path.join(out, "NOX_narration_RU.wav"))
    for f in ("voice_raw.wav", "mix_raw.wav", "voice_proc.wav", "mix_proc.wav"):
        os.remove(os.path.join(out, f))
    rep_all = {"mix_measured_before": m_in, "mix_after": m_out, "narration_after": v_out, "blocks": rep,
               "sfx_events": len(st.sfx)}
    json.dump(rep_all, open(os.path.join(out, "audio_report.json"), "w"), ensure_ascii=False, indent=1)
    print("mix:", {k: m_out[k] for k in ("output_i", "output_tp", "output_lra")})
    print("narration:", {k: v_out[k] for k in ("output_i", "output_tp", "output_lra")})


if __name__ == "__main__":
    main()
