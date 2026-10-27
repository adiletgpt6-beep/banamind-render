# Трек лица живого ролика для монтажа: где лицо в каждый момент (чтобы
# субтитры и графика его не закрывали, а приближения шли к лицу) и какого оно
# цвета под ночной подсветкой (основа цветокоррекции по лицу).
#
# Детектор — OpenCV YuNet (face_detection_yunet_2023mar.onnx из opencv_zoo),
# каждый кадр облегчённой копии исходника. Выбросы (руки, прохожие) отсекаются
# по непрерывности внутри плана, трек сглаживается в пределах плана (через
# склейку — никогда) и прореживается до шага 0,1 с.
#
#   pip install opencv-python-headless numpy
#   python scripts/live-videos/facetrack.py proxy.mp4 yunet.onnx out.ts 3.7333333333333334,6.866666666666666,...
# Склейки — точные времена первых кадров новых планов (кадр / 30), без округления:
# иначе кадр склейки отнесётся к прошлому плану.
#
# Результат — TS-модуль: FACE_SAMPLES = [t, cx, cy, w, h, r, g, b][]
# (координаты кадра 1080×1920, цвет — средний RGB внутренней части лица 0–255).
import json
import sys

import cv2
import numpy as np

src, model, out, cuts_arg = sys.argv[1:5]
cuts = [float(c) for c in cuts_arg.split(",")]

cap = cv2.VideoCapture(src)
W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
det = cv2.FaceDetectorYN.create(model, "", (W, H), 0.6, 0.3, 50)
k = 1080 / W

raw = []
while True:
    ok, frame = cap.read()
    if not ok:
        break
    t = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0
    _, faces = det.detect(frame)
    if faces is None or len(faces) == 0:
        raw.append((t, None))
        continue
    cand = []
    for f in faces:
        x, y, w, h = [float(v) for v in f[:4]]
        x0, y0 = int(x + w * 0.2), int(y + h * 0.25)
        x1, y1 = int(x + w * 0.8), int(y + h * 0.85)
        patch = frame[max(0, y0):y1, max(0, x0):x1]
        b, g, r = patch.reshape(-1, 3).mean(axis=0) if patch.size else (0, 0, 0)
        cand.append((t, (x + w / 2) * k, (y + h / 2) * k, w * k, h * k, r, g, b))
    raw.append((t, cand))


def shot_of(t):
    return sum(1 for c in cuts if t >= c)


# Внутри плана: из кандидатов кадра — ближайший к медиане плана (говорящий).
track = []
for s in range(len(cuts) + 1):
    frames = [(t, c) for t, c in raw if shot_of(t) == s and c]
    if not frames:
        continue
    big = [max(c, key=lambda v: v[3] * v[4]) for _, c in frames]
    mx, my = np.median([v[1] for v in big]), np.median([v[2] for v in big])
    pts = []
    for t, c in frames:
        v = min(c, key=lambda v: (v[1] - mx) ** 2 + (v[2] - my) ** 2)
        if abs(v[2] - my) > 260:  # рука/колено вместо лица
            continue
        pts.append(v)
    arr = np.array(pts)
    # сглаживание ±3 кадра внутри плана
    sm = arr.copy()
    for i in range(len(arr)):
        a, b = max(0, i - 3), min(len(arr), i + 4)
        sm[i, 1:] = arr[a:b, 1:].mean(axis=0)
    track.extend(sm.tolist())

track.sort(key=lambda v: v[0])
samples = []
next_t = 0.0
for v in track:
    if v[0] + 1e-6 >= next_t:
        samples.append(v)
        next_t = round(v[0] + 0.1, 3)
# первый кадр каждого плана — обязательно (интерполяция не пересекает склейку)
for c in cuts:
    first = next((v for v in track if v[0] >= c - 1e-6), None)
    if first and all(abs(s[0] - first[0]) > 1e-6 for s in samples):
        samples.append(first)
samples.sort(key=lambda v: v[0])

rows = ",\n".join(
    "  [" + ", ".join(f"{x:.3f}".rstrip("0").rstrip(".") if i == 0 else str(round(x)) for i, x in enumerate(v)) + "]"
    for v in samples
)
open(out, "w", encoding="utf-8").write(
    "// Сгенерировано scripts/live-videos/facetrack.py (YuNet по копии исходника 720×1280).\n"
    "// [t, cx, cy, w, h, r, g, b]: время (с), центр и размер лица в кадре 1080×1920,\n"
    "// средний цвет внутренней части лица 0–255. Не редактировать вручную.\n"
    f"export const FACE_CUTS = {json.dumps(cuts)} as const;\n\n"
    "export const FACE_SAMPLES: readonly (readonly number[])[] = [\n" + rows + ",\n];\n"
)
print(f"{len(raw)} кадров, {len(track)} с лицом, {len(samples)} отсчётов → {out}")
