"""Звуковой дизайн «Бесконечного чуда» и мастер-сведение. Без музыки.

Только деликатные процедурные звуки (детерминированно, seed фиксирован):
капля краски, растекание пигмента, воздух при подъёме Земли, облака,
ветер в долине, шелест листьев, мягкое раскрытие слоёв, обратный полёт,
кисть, дописывающая картину. Во время цитаты — тишина под голосом.

Голос: public/audio/voice/*.wav, моменты старта — src/timeline.json.
Выход: public/audio/sfx.wav, public/audio/master.wav (48 кГц, стерео).
Запуск: python3 scripts/make_sfx.py
"""
import json
import os
import subprocess
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
DUR = TL["durationSec"]
N = SR * DUR
rng = np.random.default_rng(13)


def band(x, lo, hi):
    f = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.clip((fr - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - fr) / (hi * 0.3), 0, 1)
    return np.fft.irfft(f * g, len(x))


def env(t, a, b, c, d):
    """Плавное окно: нарастание a→b, спад c→d (секунды)."""
    up = np.clip((t - a) / max(b - a, 1e-6), 0, 1)
    dn = 1 - np.clip((t - c) / max(d - c, 1e-6), 0, 1)
    w = up * dn
    return w * w * (3 - 2 * w)


def noise(sec):
    return rng.standard_normal(int(SR * sec))


def place(buf, sig, at, gain, pan=0.0):
    i = int(at * SR)
    j = min(N, i + len(sig))
    if j <= i:
        return
    s = sig[: j - i] * gain
    buf[0, i:j] += s * np.sqrt(0.5 * (1 - pan))
    buf[1, i:j] += s * np.sqrt(0.5 * (1 + pan))


def db(x):
    return 10 ** (x / 20)


def main():
    fx = TL["sfx"]
    out = np.zeros((2, N))
    t = np.arange(N) / SR

    # Капля: мягкий «плюх» — короткий тон с падающей высотой + влажный щелчок.
    d = 0.35
    tt = np.arange(int(SR * d)) / SR
    tone = np.sin(2 * np.pi * (780 * tt - 900 * tt * tt)) * np.exp(-tt * 22)
    tick = band(noise(d), 2000, 7000) * np.exp(-tt * 70) * 0.5
    place(out, tone + tick, fx["drop"], db(-20))

    # Растекание пигмента по бумаге: шуршание с медленными «вдохами».
    sp = band(noise(4.2), 1800, 6500)
    ts = np.arange(len(sp)) / SR
    sp *= env(ts, 0, 0.6, 2.8, 4.2) * (0.7 + 0.3 * np.sin(ts * 2.3))
    place(out, sp, fx["drop"] + 0.05, db(-36))

    # Земля поднимается с холста: тихий воздушный подъём.
    lf = noise(2.4)
    lf = band(lf, 300, 2400)
    tl = np.arange(len(lf)) / SR
    place(out, lf * env(tl, 0, 1.2, 1.6, 2.4), fx["lift"], db(-34))

    # Космос: едва слышный низкий воздух.
    sp_amb = band(noise(9.0), 60, 380)
    ta = np.arange(len(sp_amb)) / SR
    place(out, sp_amb * env(ta, 0, 2.0, 7.0, 9.0), 6.0, db(-40))

    # Облака на подлёте и при возвращении: мягкий порыв.
    for at, length in ((fx["cloudsIn"], 2.6), (fx["cloudsOut"], 2.2)):
        w = band(noise(length), 250, 2200)
        tw = np.arange(len(w)) / SR
        place(out, w * env(tw, 0, length * 0.55, length * 0.6, length), at, db(-29), pan=-0.2)
        place(out, band(noise(length), 250, 2200) * env(tw, 0, length * 0.5, length * 0.6, length), at, db(-29), pan=0.2)

    # Ветер в долине: медленная модуляция, стерео-разнос.
    for pan, seed in ((-0.5, 0.0), (0.5, 1.7)):
        w = band(noise(11.0), 120, 1400)
        tw = np.arange(len(w)) / SR
        mod = 0.6 + 0.4 * np.sin(tw * 0.7 + seed) * np.sin(tw * 0.23 + seed * 2)
        place(out, w * mod * env(tw, 0, 1.5, 8.5, 11.0), fx["windFrom"], db(-33), pan)

    # Шелест листьев: зернистые всплески в высоком диапазоне.
    def rustle(length, at, gain):
        r = band(noise(length), 2500, 9000)
        tr = np.arange(len(r)) / SR
        grains = np.zeros_like(r)
        for _ in range(int(length * 9)):
            c = rng.uniform(0, length)
            grains += np.exp(-((tr - c) / rng.uniform(0.04, 0.16)) ** 2) * rng.uniform(0.3, 1)
        place(out, r * grains * env(tr, 0, 0.8, length - 1.2, length), at, gain, pan=rng.uniform(-0.4, 0.4))

    rustle(5.5, fx["leafFrom"], db(-34))
    rustle(1.8, 46.2, db(-36))

    # Слои листа расходятся: мягкий «бумажный» шорох вверх.
    for k, at in enumerate((fx["layers"], fx["layers"] + 0.9)):
        s = band(noise(1.1), 900, 5000)
        ts2 = np.arange(len(s)) / SR
        place(out, s * env(ts2, 0, 0.5, 0.6, 1.1), at, db(-35), pan=-0.3 + 0.6 * k)

    # Великое возвращение: плавно нарастающий воздух.
    r = band(noise(6.5), 200, 3000)
    tr = np.arange(len(r)) / SR
    place(out, r * env(tr, 0, 4.5, 5.0, 6.5) ** 1.5, fx["returnFrom"], db(-31))

    # Кисть дописывает картину: несколько мягких мазков.
    for k in range(5):
        s = band(noise(0.55), 1500, 6000)
        ts3 = np.arange(len(s)) / SR
        place(out, s * env(ts3, 0, 0.2, 0.25, 0.55), fx["paintSettle"] + k * 0.36, db(-35), pan=-0.4 + 0.2 * k)

    # Перед цитатой всё затихает.
    out *= 1 - env(t, 52.0, 52.6, 99, 100)
    write(os.path.join(ROOT, "public", "audio", "sfx.wav"), out)

    # Сведение: голос по центру поверх звуков.
    mix = out.copy()
    voice = np.zeros(N)
    for v in TL["voice"]:
        a = read_mono(os.path.join(ROOT, "public", "audio", "voice", f"{v['key']}.wav"))
        i = int(v["start"] * SR)
        voice[i : i + len(a)] += a[: N - i]
    mix += voice
    # Мягкое затухание в самом конце.
    mix *= 1 - env(t, DUR - 0.6, DUR - 0.05, 999, 1000)
    tmp = os.path.join(ROOT, "public", "audio", "master.raw.wav")
    write(tmp, mix)
    stats = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-16:TP=-1.5:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    measured = json.loads(stats[stats.rindex("{"):stats.rindex("}") + 1])
    gain = -16 - float(measured["input_i"])
    peak = float(measured["input_tp"]) + gain
    if peak > -1.5:
        gain -= peak + 1.5
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"volume={gain:.2f}dB", "-c:a", "pcm_s16le",
                    os.path.join(ROOT, "public", "audio", "master.wav")], check=True)
    os.unlink(tmp)
    print(f"master.wav: {DUR} с, усиление {gain:+.2f} дБ (было {measured['input_i']} LUFS)")


def read_mono(path):
    with wave.open(path) as w:
        assert w.getframerate() == SR, path
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768


def write(path, st):
    a = np.clip(st.T, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


if __name__ == "__main__":
    main()
