"""Звуковой дизайн без музыки + сведение с озвучкой → public/audio/mix.wav (60 с, 48 кГц, стерео).

Все эффекты синтезируются процедурно (детерминированно, фиксированное зерно):
  • шелест шёлковой нити — полосовой шум 2–7 кГц с мягкой огибающей;
  • тихий звук переплетения — короткие мягкие «шорохи» ткани (без щелчков);
  • воздушный переход — шум с плавно сдвигающейся полосой;
  • ветер в горах — низкочастотный шум с медленной модуляцией;
  • шелест листьев — зернистый высокочастотный шум.
Во время цитаты аята — только голос. Главное — голос диктора (эффекты на −24…−34 дБ ниже).
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 60.0
FPS = 30
N = int(SR * DUR)
rng = np.random.default_rng(11)

def fr(f):  # кадр → отсчёт
    return int(round(f / FPS * SR))

def stft_filter(x, center_fn, width_fn):
    """Полосовой фильтр с изменяющейся во времени полосой (STFT, окно Ханна, OLA)."""
    W, H = 2048, 512
    win = np.hanning(W)
    out = np.zeros(len(x) + W)
    norm = np.zeros(len(x) + W)
    freqs = np.fft.rfftfreq(W, 1 / SR)
    for start in range(0, len(x), H):
        seg = x[start:start + W]
        if len(seg) < W:
            seg = np.pad(seg, (0, W - len(seg)))
        t = (start + W / 2) / SR
        c, w = center_fn(t), width_fn(t)
        mask = np.exp(-0.5 * ((np.log2(np.maximum(freqs, 1)) - np.log2(c)) / w) ** 2)
        spec = np.fft.rfft(seg * win) * mask
        out[start:start + W] += np.fft.irfft(spec) * win
        norm[start:start + W] += win ** 2
    return (out / np.maximum(norm, 1e-3))[: len(x)]

def env(n, attack, release, shape=2.0):
    a = int(attack * SR); r = int(release * SR)
    e = np.ones(n)
    if a > 0: e[:a] = np.linspace(0, 1, a) ** shape
    if r > 0: e[-r:] = np.linspace(1, 0, r) ** shape
    return e

def silk_swish(dur=0.9, c0=3200, c1=5200, gain=0.06):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    y = stft_filter(x, lambda t: c0 + (c1 - c0) * min(1, t / dur), lambda t: 0.55)
    return y * env(n, dur * 0.45, dur * 0.5) * gain

def fabric_rustle(dur=0.35, gain=0.035):
    n = int(dur * SR)
    x = rng.standard_normal(n) * (0.6 + 0.4 * np.abs(np.sin(np.linspace(0, 9, n))))
    y = stft_filter(x, lambda t: 1800, lambda t: 0.9)
    return y * env(n, 0.06, dur * 0.7) * gain

def air_whoosh(dur=1.6, c0=280, c1=1400, gain=0.07):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    y = stft_filter(x, lambda t: c0 * (c1 / c0) ** min(1, t / dur), lambda t: 0.8)
    return y * env(n, dur * 0.55, dur * 0.45, 1.6) * gain

def wind(dur, gain=0.03):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    y = stft_filter(x, lambda t: 380 + 160 * np.sin(t * 0.9), lambda t: 0.9)
    mod = 0.65 + 0.35 * np.sin(np.linspace(0, dur * 1.3, n)) * np.sin(np.linspace(0, dur * 0.37, n))
    return y * mod * env(n, 1.4, 1.6, 1.5) * gain

def leaves(dur, gain=0.025):
    n = int(dur * SR)
    grains = np.zeros(n)
    for _ in range(int(dur * 38)):
        p = rng.integers(0, n - 2400)
        L = rng.integers(500, 2400)
        grains[p:p + L] += rng.standard_normal(L) * np.hanning(L) * rng.uniform(0.3, 1)
    y = stft_filter(grains, lambda t: 5200, lambda t: 0.7)
    return y * env(n, 0.8, 1.0) * gain

track = np.zeros(N)
def place(sig, frame):
    s = fr(frame)
    e = min(N, s + len(sig))
    track[s:e] += sig[: e - s]

# Сцена 1: первая нить, петля, присоединение нитей, переплетение
place(silk_swish(1.4, 2600, 5200, 0.05), 4)
place(silk_swish(1.0, 4200, 3000, 0.04), 34)
place(silk_swish(0.8, 3000, 4800, 0.035), 68)
place(silk_swish(0.8, 3200, 5000, 0.032), 80)
for f in (100, 116, 130, 146, 158):
    place(fabric_rustle(0.32, 0.028), f)
# Сцена 2: полотно сворачивается в Землю, нить уходит в Солнце
place(air_whoosh(1.9, 220, 1100, 0.06), 166)
place(silk_swish(1.6, 2400, 4600, 0.035), 212)
# Расплетение и рост гор
place(silk_swish(1.2, 5000, 2800, 0.04), 432)
place(air_whoosh(2.2, 300, 1500, 0.06), 452)
place(wind(7.4, 0.028), 500)
# Нити лугов взлетают к дереву
place(silk_swish(1.1, 3000, 5200, 0.03), 668)
# Дерево: семечко, рост, листья
for f in (724, 742):
    place(fabric_rustle(0.4, 0.022), f)
place(air_whoosh(1.4, 200, 700, 0.03), 846)
place(leaves(3.2, 0.024), 926)
# Небо и большая картина
place(silk_swish(1.6, 2600, 4800, 0.032), 1034)
place(air_whoosh(2.6, 180, 900, 0.055), 1150)
# Сцена 6 — только голос. Сцена 7: золотая нить выходит из Солнца
place(silk_swish(2.4, 2400, 4400, 0.035), 1646)

# стерео: эффекты чуть шире, голос по центру
L = track.copy(); R = np.roll(track, 240) * 0.96

# озвучка
src = open(os.path.join(ROOT, "src/timeline.ts"), encoding="utf-8").read()
block = re.search(r"VOICE_START[^{]*\{([^}]*)\}", src).group(1)
starts = {k: int(v) for k, v in re.findall(r"(s\d):\s*(\d+)", block)}
voice = np.zeros(N)
for sc, f0 in starts.items():
    with wave.open(os.path.join(ROOT, f"public/audio/voice/{sc}.wav")) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    s = fr(f0); e = min(N, s + len(a))
    voice[s:e] += a[: e - s]
peak = np.max(np.abs(voice)) or 1
voice = voice / peak * 0.8
mix = np.stack([voice + L, voice + R], axis=1)
mix = np.clip(mix, -0.99, 0.99)
raw = os.path.join(ROOT, "public/audio/mix_raw.wav")
with wave.open(raw, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
dst = os.path.join(ROOT, "public/audio/mix.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-t", "60", dst], check=True)
os.remove(raw)
print("mix.wav готов, старт реплик:", starts)
