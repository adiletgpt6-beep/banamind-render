"""Русская озвучка «Удивительная картина мира» офлайн-голосом Piper ru_RU-denis-medium (датасет CC0).

Каждая сцена синтезируется по фразам, фразы склеиваются с естественными паузами.
Результат:
  public/audio/voice/sNN.wav           — фраза сцены (48 кГц, моно)
  src/data/voice-timings.json          — длительности сцен и начала фраз (сек от начала реплики)
Модель скачивается скриптом scripts/fetch-voice.sh в tools/voices/.
"""
import json, os, subprocess, sys, wave, tempfile
import numpy as np
from piper import PiperVoice, SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.path.join(ROOT, "tools/voices/vits-piper-ru_RU-denis-medium/ru_RU-denis-medium.onnx")
OUT = os.path.join(ROOT, "public/audio/voice")
os.makedirs(OUT, exist_ok=True)

# (текст фразы, пауза после неё в секундах). Сцены соответствуют сценарию 1–7.
SCRIPT = {
    "s1": [("Смотри!", 0.35), ("Одна маленькая нить.", 0.45), ("А что из неё можно сплести?", 0.0)],
    "s2": [("Вот наша Земля!", 0.35), ("Она вращается.", 0.4), ("Там, где светит Солнце, — день.", 0.35),
           ("А на другой стороне — ночь.", 0.0)],
    "s3": [("Теперь взгляни на горы!", 0.4), ("Высокие вершины,", 0.2), ("облака и реки —", 0.25),
           ("сколько удивительного!", 0.0)],
    "s4": [("А из маленького семечка", 0.1), ("со временем вырастает дерево.", 0.45),
           ("У него появляются ветви", 0.15), ("и множество листьев.", 0.0)],
    "s5": [("В суре «Аль-Имра́н» говорится:", 0.35), ("в сотворении небес и земли,", 0.2),
           ("в смене ночи и дня", 0.2), ("есть знамения для обладающих разумом.", 0.0)],
    "s6": [("И верующие говорят:", 0.55), ("«Господь наш!", 0.45), ("Ты не сотворил это понапрасну».", 0.0)],
    "s7": [("А что в мире удивляет тебя?", 0.5), ("Посмотри вокруг!", 0.0)],
}
# Темп: спокойнее во время цитаты аята.
LENGTH = {"s1": 1.12, "s2": 1.08, "s3": 1.08, "s4": 1.08, "s5": 1.1, "s6": 1.22, "s7": 1.1}

voice = PiperVoice.load(MODEL)
SR = voice.config.sample_rate

def synth(text, length):
    cfg = SynthesisConfig(length_scale=length, noise_scale=0.62, noise_w_scale=0.75)
    chunks = [c.audio_float_array for c in voice.synthesize(text, syn_config=cfg)]
    a = np.concatenate(chunks)
    # обрезаем тишину по краям (порог -45 дБ), оставляя 30 мс
    thr = 10 ** (-45 / 20) * np.max(np.abs(a))
    idx = np.where(np.abs(a) > thr)[0]
    pad = int(0.03 * SR)
    return a[max(0, idx[0] - pad): idx[-1] + pad]

timings = {}
for scene, phrases in SCRIPT.items():
    parts, starts, t = [], [], 0.0
    for text, pause in phrases:
        a = synth(text, LENGTH[scene])
        starts.append({"text": text.replace("́", ""), "start": round(t, 3), "dur": round(len(a) / SR, 3)})
        parts += [a, np.zeros(int(pause * SR), dtype=np.float32)]
        t += len(a) / SR + pause
    audio = np.concatenate(parts)
    raw = tempfile.mktemp(suffix=".wav")
    with wave.open(raw, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
    dst = os.path.join(OUT, f"{scene}.wav")
    # Тёплая обработка: срез низа, лёгкая компрессия, «воздух», ресемпл 48 кГц.
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                    "highpass=f=75,equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=1.2,"
                    "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,aresample=48000",
                    "-ar", "48000", "-ac", "1", dst], check=True)
    os.remove(raw)
    timings[scene] = {"duration": round(t, 3), "phrases": starts}
    print(scene, round(t, 2), "с")

with open(os.path.join(ROOT, "src/data/voice-timings.json"), "w") as f:
    json.dump(timings, f, ensure_ascii=False, indent=1)
