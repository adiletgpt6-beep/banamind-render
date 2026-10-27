# Черновой синтез реплики голосом Piper (ru_RU, через sherpa-onnx) — только
# для местной проверки монтажа: длительности, губы, паузы. Итоговая озвучка
# фильма делается ElevenLabs в CI. Тон и темп не меняются (speed ≈ 1).
#   python scripts/lesson80/piper_tts.py --voice irina --text "…" --out l.wav --json l.json
# Модели: $PIPER_MODELS_DIR/vits-piper-ru_RU-<voice>-medium/ (релизы sherpa-onnx).
# Границы слов оцениваются: речь делится по паузам огибающей на фрагменты,
# слова распределяются по фрагментам пропорционально числу букв.
import argparse
import json
import os
import re
import wave

import numpy as np
import sherpa_onnx

ap = argparse.ArgumentParser()
ap.add_argument("--voice", required=True)
ap.add_argument("--speed", type=float, default=1.0)
ap.add_argument("--text", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--json", required=True)
a = ap.parse_args()

root = os.environ["PIPER_MODELS_DIR"]
d = os.path.join(root, f"vits-piper-ru_RU-{a.voice}-medium")
cfg = sherpa_onnx.OfflineTtsConfig(
    model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=os.path.join(d, f"ru_RU-{a.voice}-medium.onnx"),
            lexicon="",
            tokens=os.path.join(d, "tokens.txt"),
            data_dir=os.path.join(d, "espeak-ng-data"),
        ),
        num_threads=2,
        provider="cpu",
    )
)
tts = sherpa_onnx.OfflineTts(cfg)
# «…» и многоточие Piper читает плохо — оставляем паузу через точку с запятой
text = a.text.replace("...", ";").replace("«", "").replace("»", "")
res = tts.generate(text, sid=0, speed=a.speed)
x = np.asarray(res.samples, dtype=np.float32)
sr = res.sample_rate
with wave.open(a.out, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

# огибающая 10 мс → фрагменты речи
hop = sr // 100
n = len(x) // hop
env = np.array([np.sqrt(np.mean(x[i * hop : (i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
thr = max(env.max() * 0.06, 1e-4)
loud = env > thr
segs = []
i = 0
while i < n:
    if loud[i]:
        j = i
        while j < n and (loud[j] or (j + 8 < n and loud[j + 1 : j + 9].any())):
            j += 1
        segs.append([i, j])
        i = j
    else:
        i += 1
if not segs:
    segs = [[0, n]]
words = [w for w in a.text.split() if re.search(r"\w", w)]
letters = [len(re.findall(r"\w", w)) for w in words]
total = sum(letters) or 1
# слова распределяются по «звучащему времени» (сумма фрагментов без пауз)
# пропорционально числу букв; паузы между фрагментами попадают на границы слов
loud_total = sum(s1 - s0 for s0, s1 in segs) or 1


def map_loud(u):
    """u — позиция в звучащем времени (в окнах) → абсолютное время (с)."""
    acc = 0
    for s0, s1 in segs:
        ln = s1 - s0
        if u <= acc + ln or (s0, s1) == segs[-1]:
            return (s0 + min(ln, max(0.0, u - acc))) * hop / sr
        acc += ln
    return segs[-1][1] * hop / sr


out = []
acc_letters = 0
for w, n_letters in zip(words, letters):
    u0 = loud_total * acc_letters / total
    u1 = loud_total * (acc_letters + n_letters) / total
    out.append({"text": w, "start": round(map_loud(u0), 3), "end": round(map_loud(u1), 3)})
    acc_letters += n_letters
json.dump({"words": out, "durationSec": len(x) / sr}, open(a.json, "w"), ensure_ascii=False)
