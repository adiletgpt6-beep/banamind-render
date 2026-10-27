# AudioSyncSystem (звуковая часть): сведение дорожки «Когда краски оживают».
# Голос — по таймингам src/timeline.json; БЕЗ МУЗЫКИ (правило Muslim Kids);
# деликатные процедурные шумы: кисть, море, ветер, дождь, капля, листья.
# Запуск: python3 scripts/sound.py  → public/audio/soundtrack.wav (48 кГц, стерео, 60 с)
import json, subprocess, wave
import numpy as np

SR = 48000
T = json.load(open("src/timeline.json"))
DUR = T["durationInFrames"] / T["fps"]
N = int(round(DUR * SR))
rng = np.random.default_rng(5)
mixL = np.zeros(N); mixR = np.zeros(N)

def db(x): return 10 ** (x / 20)

def read_wav(path):
    with wave.open(path) as w:
        assert w.getframerate() == SR, path
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2: a = a.reshape(-1, 2).mean(axis=1)
    return a

def fft_filter(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))

def norm(x): return x / (np.max(np.abs(x)) + 1e-9)

def place(sig, t, gain_db, pan=0.0):
    i = int(t * SR); j = min(N, i + len(sig))
    if i >= N: return
    s = sig[: j - i] * db(gain_db)
    mixL[i:j] += s * np.sqrt(0.5 * (1 - pan)); mixR[i:j] += s * np.sqrt(0.5 * (1 + pan))

def bed(t0, t1, lo, hi, gain_db, fade_in=1.0, fade_out=1.5, mod_hz=0.0, mod_depth=0.0, pan=0.0, seed=0):
    n = int((t1 - t0) * SR)
    r = np.random.default_rng(seed)
    x = norm(fft_filter(r.standard_normal(n), lo, hi))
    t = np.arange(n) / SR
    if mod_hz:
        x *= 1 - mod_depth + mod_depth * (0.5 + 0.5 * np.sin(2 * np.pi * mod_hz * t + seed))
    e = np.minimum(np.clip(t / fade_in, 0, 1), np.clip((t[-1] - t) / fade_out, 0, 1))
    place(x * e ** 1.5, t0, gain_db, pan)

def swish(t, gain_db=-33, length=0.55, pan=0.0, seed=1):
    n = int(length * SR)
    r = np.random.default_rng(seed)
    x = norm(fft_filter(r.standard_normal(n), 700, 4200))
    tt = np.arange(n) / SR
    e = np.clip(tt / 0.09, 0, 1) * np.exp(-np.maximum(tt - 0.09, 0) / (length * 0.35))
    place(x * e, t, gain_db, pan)

def plip(t, gain_db=-24):
    n = int(0.22 * SR); tt = np.arange(n) / SR
    fr = 1400 * np.exp(-tt * 9) + 520
    ph = 2 * np.pi * np.cumsum(fr) / SR
    x = np.sin(ph) * np.exp(-tt * 22)
    place(x, t, gain_db)

def rain(t0, t1, gain_db):
    n = int((t1 - t0) * SR)
    x = norm(fft_filter(rng.standard_normal(n), 2500, 9000)) * 0.35
    ticks = np.zeros(n)
    for _ in range(int((t1 - t0) * 70)):
        k = rng.integers(0, n - 800)
        L = 300
        ticks[k:k + L] += rng.uniform(0.2, 1) * np.exp(-np.arange(L) / 50) * rng.standard_normal(L)
    x = x + norm(fft_filter(ticks, 1500, 8000)) * 0.6
    tt = np.arange(n) / SR
    e = np.minimum(np.clip(tt / 0.8, 0, 1), np.clip((tt[-1] - tt) / 1.0, 0, 1))
    place(x * e, t0, gain_db)

f2s = lambda f: f / T["fps"]
# ——— кисть: только на ключевых мазках, не на каждом ———
for f, g, p in [(15, -36, 0), (52, -38, -0.3), (68, -38, 0.3), (96, -35, 0), (200, -36, 0.2), (240, -38, 0.1),
                (462, -36, 0), (558, -38, -0.2), (594, -38, 0.2), (604, -39, -0.4), (900, -37, -0.1), (945, -38, 0.1),
                (1640, -38, 0.2), (1670, -39, 0.1)]:
    swish(f2s(f), g, pan=p, seed=f)
# ——— море ———
bed(f2s(458), f2s(800), 60, 650, -29, fade_in=1.2, fade_out=2.5, mod_hz=0.13, mod_depth=0.55, seed=2)
bed(f2s(470), f2s(780), 900, 3500, -42, fade_in=1.5, fade_out=2.0, mod_hz=0.21, mod_depth=0.7, pan=0.3, seed=3)
# ——— ветер ———
bed(f2s(640), f2s(1030), 180, 900, -37, fade_in=2.0, fade_out=2.5, mod_hz=0.09, mod_depth=0.6, pan=-0.3, seed=4)
# ——— дождь и капля ———
rain(f2s(752), f2s(840), -31)
plip(f2s(805), -25)
# ——— листья ———
bed(f2s(935), f2s(1050), 2200, 7000, -40, fade_in=1.0, fade_out=1.5, mod_hz=0.7, mod_depth=0.8, pan=-0.2, seed=6)
# ——— ночь: едва слышный воздух; во время перевода смысла — тишина ———
bed(f2s(1040), f2s(1340), 120, 600, -47, fade_in=2.0, fade_out=2.5, seed=7)
bed(f2s(1630), f2s(1800), 150, 800, -44, fade_in=1.5, fade_out=1.2, mod_hz=0.1, mod_depth=0.5, seed=8)

# ——— голос ———
voice = json.load(open("public/audio/voice.json"))["lines"]
starts = {v["id"]: v["start"] for v in T["voice"]}
for v in voice:
    a = read_wav(f"public/{v['file']}")
    end = starts[v["id"]] + len(a) / SR
    print(f"{v['id']}: {starts[v['id']]:.2f}–{end:.2f} s")
    place(a, starts[v["id"]], 0.0)
    assert end <= DUR, v['id']

st = np.stack([mixL, mixR], axis=1)
# мягкий хвост в конце
fade = int(0.6 * SR)
st[-fade:] *= np.linspace(1, 0, fade)[:, None]
st = st / max(1.0, np.max(np.abs(st)) / 0.89)
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("public/audio/mix_raw.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
# статическое усиление до −16 LUFS (без динамической «накачки» тихих мест) + лимитер
meas = subprocess.run(["ffmpeg", "-i", "public/audio/mix_raw.wav", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(meas.rsplit("I:", 1)[1].split("LUFS")[0])
gain = -16.0 - I
print(f"integrated {I:.1f} LUFS → gain {gain:+.1f} dB")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "public/audio/mix_raw.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:level=false", "-ar", str(SR), "-t", f"{DUR:.3f}", "public/audio/soundtrack.wav"], check=True)
print("ok", DUR)
