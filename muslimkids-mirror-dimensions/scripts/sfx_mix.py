"""Звуковой дизайн «Зеркальные миры» (без музыки — правило Muslim Kids) и сведение.

Все звуки синтезируются процедурно (детерминированный сид): мягкие воздушные
переходы при движении зеркал, деликатный «блик», капля и тихая вода, лёгкий
ветер и шелест листьев. Голос диктора — главный: фон приглушается под речью.

Вход:  public/audio/voice/*.wav + src/data/voice-manifest.json (scripts/voice.py)
Выход: public/audio/sfx.wav (стерео-стем), public/audio/mix.wav (48 кГц, −16 LUFS)
Запуск: python3 -I scripts/sfx_mix.py
"""
import json, os, subprocess, tempfile
import numpy as np, soundfile as sf, scipy.signal as ss

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 60.0
N = int(SR * DUR)
rng = np.random.default_rng(10)


def env_hann(n, attack=0.5):
    a = max(1, int(n * attack)); r = max(1, n - a)
    return np.concatenate([0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a)), 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, r))])


def band(x, lo, hi, order=2):
    b, a = ss.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return ss.lfilter(b, a, x)


def lowp(x, f, order=2):
    b, a = ss.butter(order, f / (SR / 2), "low")
    return ss.lfilter(b, a, x)


def highp(x, f, order=2):
    b, a = ss.butter(order, f / (SR / 2), "high")
    return ss.lfilter(b, a, x)


out = np.zeros((N, 2))


def place(sig, t0, gain=1.0, pan=0.0):
    """pan: -1 лево … 1 право; sig моно или стерео."""
    i0 = int(t0 * SR)
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], 1) * np.sqrt(2)
    i1 = min(N, i0 + len(sig))
    if i1 > i0:
        out[i0:i1] += sig[: i1 - i0] * gain


def whoosh(t0, dur, gain, lo=250, hi=2400, pan_from=-0.4, pan_to=0.4):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    # движение центральной частоты: смешиваем два банда
    a = band(x, lo, lo * 3); b = band(x, hi / 3, hi)
    k = np.linspace(0, 1, n) ** 1.2
    y = (a * (1 - k) + b * k) * env_hann(n, 0.55)
    pans = np.linspace(pan_from, pan_to, n)
    l, r = np.cos((pans + 1) * np.pi / 4), np.sin((pans + 1) * np.pi / 4)
    place(np.stack([y * l, y * r], 1) * np.sqrt(2), t0, gain)


def shimmer(t0, gain, base=1318.5):
    n = int(3.2 * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for k, (m, d) in enumerate([(1, 0), (1.5, 0.7), (2, -0.4), (3, 0.3)]):
        y += np.sin(2 * np.pi * base * m * t + d) * (0.5 ** k)
    e = (1 - np.exp(-t / 0.25)) * np.exp(-t / 0.9)
    y = lowp(y * e, 6000)
    place(np.stack([y, np.roll(y, int(0.012 * SR))], 1), t0, gain)


def drop(t0, gain):
    n = int(0.6 * SR); t = np.arange(n) / SR
    f = 320 + 700 * np.exp(-t / 0.035)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09)
    y += band(rng.standard_normal(n), 1500, 6000) * np.exp(-t / 0.05) * 0.15
    place(y, t0, gain, 0.1)


def bed(t0, t1, gain, kind):
    n = int((t1 - t0) * SR)
    x = rng.standard_normal((n, 2))
    t = np.arange(n) / SR
    if kind == "air":  # мягкий «воздух» пространства
        y = lowp(lowp(x, 380), 380) * 0.9
        lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t)[:, None]
    elif kind == "water":  # тихое течение и лёгкие волны
        y = band(x, 180, 1200) * 0.6 + highp(lowp(x, 3500), 1500) * 0.08
        lfo = (0.65 + 0.35 * np.sin(2 * np.pi * 0.23 * t[:, None] + np.array([0, 1.7])) * np.sin(2 * np.pi * 0.09 * t)[:, None])
    elif kind == "wind":
        y = band(x, 120, 900) * 0.8
        lfo = (0.55 + 0.45 * np.sin(2 * np.pi * 0.05 * t[:, None] + np.array([0, 0.8])) ** 2)
    else:  # leaves — шелест
        y = highp(x, 2500) * 0.35
        g = np.abs(lowp(rng.standard_normal(n), 2.5))
        lfo = (g / (g.max() + 1e-9))[:, None] ** 1.5
    y = y * lfo
    fade = np.minimum(1, np.minimum(t / 1.5, (t[-1] - t) / 1.5))[:, None]
    place(y * fade, t0, gain)


def plips(t0, t1, rate, gain):
    t = t0
    while True:
        t += rng.exponential(1 / rate)
        if t > t1:
            break
        n = int(0.12 * SR); tt = np.arange(n) / SR
        f = rng.uniform(500, 1100) * (1 + 0.6 * np.exp(-tt / 0.02))
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.03)
        place(y, t, gain * rng.uniform(0.4, 1), rng.uniform(-0.6, 0.6))


# --- партитура звуков (секунды совпадают с MirrorDimensionsEngine) ---
bed(0, 17.8, 0.05, "air")
shimmer(0.35, 0.02)
whoosh(0.9, 4.8, 0.025, 160, 900, -0.3, 0.3)  # зеркало поворачивается
whoosh(2.4, 2.2, 0.03, 200, 1500, 0.2, -0.2)  # камера отъезжает
shimmer(4.2, 0.012, 1567.98)  # Земля в отражении
whoosh(8.4, 2.6, 0.035, 220, 1800, -0.5, 0.5)
whoosh(10.9, 1.8, 0.03, 200, 1400, 0.3, 0.0)
whoosh(15.1, 1.9, 0.04, 220, 2000, 0.5, -0.4)  # к зеркалу
whoosh(17.0, 2.1, 0.035, 150, 1000, -0.2, 0.2)  # зеркало ложится
drop(17.88, 0.05)  # волна по поверхности
bed(18.4, 38.6, 0.035, "water")
plips(19.5, 38.0, 0.6, 0.006)
bed(19.6, 37.8, 0.03, "wind")
bed(24.8, 34.6, 0.05, "leaves")
whoosh(34.8, 3.0, 0.02, 150, 900, 0, 0)  # подъём к небу
bed(36.8, 55.5, 0.035, "air")
for i, t in enumerate([37.7, 37.95, 38.2]):
    whoosh(t, 1.9, 0.03, 200, 1700, [-0.5, 0.3, -0.2][i], [0.1, -0.1, 0.4][i])
    shimmer(t + 1.2, 0.006, [1318.5, 1567.98, 1760.0][i])
whoosh(41.3, 2.8, 0.035, 180, 1500, 0.4, -0.4)  # V-пара складывается
whoosh(43.5, 1.8, 0.03, 160, 1100, -0.2, 0.2)  # камера отдаляется
whoosh(54.4, 1.6, 0.025, 160, 1000, 0.3, -0.3)  # панели складываются
bed(55.0, 60.0, 0.03, "water")
bed(55.0, 60.0, 0.02, "wind")
plips(55.5, 59.0, 0.5, 0.004)

SFX_GAIN = 2.8  # фон ≈ на 14 дБ тише голоса
sfx = out * SFX_GAIN

# --- голос ---
man = json.load(open(os.path.join(ROOT, "src/data/voice-manifest.json"), encoding="utf-8"))
voice = np.zeros(N)
for l in man["lines"]:
    x, sr = sf.read(os.path.join(ROOT, "public/audio/voice", f"{l['id']}.wav"), dtype="float64")
    x = ss.resample_poly(x, SR, sr)
    i0 = int(l["start"] * SR)
    voice[i0 : i0 + len(x)] += x[: N - i0]
# лёгкая «комната»: короткое раннее отражение для естественности
room = np.zeros(int(0.06 * SR)); room[0] = 1; room[int(0.019 * SR)] = 0.12; room[int(0.041 * SR)] = 0.06
voice = ss.fftconvolve(voice, room)[:N]

# приглушение фона под речью (−5 дБ), плавно
venv = np.abs(lowp(np.abs(voice), 4))
duck = 1 - 0.44 * np.clip(venv / (venv.max() * 0.15 + 1e-9), 0, 1)
duck = lowp(duck, 3)
 # хвост: мягкое затухание фона в последнюю секунду
tail = np.ones(N); tail[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)) ** 2
mix = np.stack([voice, voice], 1) + sfx * (duck * tail)[:, None]

os.makedirs(os.path.join(ROOT, "public/audio"), exist_ok=True)
sf.write(os.path.join(ROOT, "public/audio/sfx.wav"), sfx.astype(np.float32), SR, subtype="PCM_16")
raw = os.path.join(tempfile.mkdtemp(), "mix_raw.wav")
sf.write(raw, (mix / max(1e-9, np.abs(mix).max()) * 0.5).astype(np.float32), SR, subtype="FLOAT")
# громкость: −16 LUFS, пик ≤ −1.5 dBTP (двухпроходный loudnorm)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{") : m.rindex("}") + 1])
af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
      f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-af", af, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le",
                os.path.join(ROOT, "public/audio/mix.wav")], check=True)
os.remove(raw)
print("mix.wav готов:", js["input_i"], "LUFS →", "-16")
