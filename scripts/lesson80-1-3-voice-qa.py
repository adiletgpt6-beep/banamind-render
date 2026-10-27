# Проверка озвучки ролика 80-1-3 (тот же замер, что для урока 1): распознавание каждого файла реплики (OpenAI
# gpt-4o-transcribe, ru) и доля ошибок по буквам (CER) относительно сценария,
# плюс медиана основного тона (F0). Нужен доступ к api.openai.com
# (ключ OPENAI_API_KEY или прокси окружения). Это технический замер, а не
# прослушивание: он ловит пропущенные, обрезанные и искажённые слова.
#
#   python3 scripts/lesson80-1-3-voice-qa.py public/audio/lesson80-1-3/manifest.json out.json
import json, os, re, subprocess, sys, time, urllib.error, urllib.request, uuid
import numpy as np


def norm(s):
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def lev(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def f0(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32)
    sr, win, hop = 16000, 640, 160
    lo, hi = sr // 500, sr // 65
    rms = np.sqrt(np.mean(a ** 2) + 1e-12)
    out = []
    for i in range(0, len(a) - win, hop):
        fr = a[i:i + win] * np.hanning(win)
        if np.sqrt(np.mean(fr ** 2)) < rms * 0.5:
            continue
        c = np.correlate(fr, fr, "full")[win - 1:]
        if c[0] <= 0:
            continue
        k = lo + int(np.argmax(c[lo:hi]))
        if c[k] / c[0] > 0.45:
            out.append(sr / k)
    return round(float(np.median(out)), 1) if out else 0.0


def transcribe(path):
    boundary = uuid.uuid4().hex
    data = open(path, "rb").read()
    parts = []
    for k, v in (("model", "gpt-4o-transcribe"), ("language", "ru"), ("response_format", "json")):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode())
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.mp3\"\r\nContent-Type: audio/mpeg\r\n\r\n".encode() + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    if os.environ.get("OPENAI_API_KEY"):
        headers["Authorization"] = "Bearer " + os.environ["OPENAI_API_KEY"]
    # лимит запросов (429) и временные ошибки — повтор с нарастающей паузой
    for i in range(6):
        try:
            req = urllib.request.Request("https://api.openai.com/v1/audio/transcriptions", data=b"".join(parts), headers=headers)
            return json.load(urllib.request.urlopen(req, timeout=120))["text"]
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503) or i == 5:
                raise
            time.sleep(2 ** i * 1.5)


man = json.load(open(sys.argv[1]))
base = os.path.dirname(sys.argv[1])
res = []
from concurrent.futures import ThreadPoolExecutor
def one(l):
    p = os.path.join(base, l["file"])
    heard = transcribe(p)
    r = norm(l["text"])
    return {"segId": l["segId"], "role": l["role"], "text": l["text"], "heard": heard, "cer": round(lev(r, norm(heard)) / max(1, len(r)), 3), "f0": f0(p), "dur": l["durationSec"], "take": l.get("take")}
with ThreadPoolExecutor(4) as ex:
    res = list(ex.map(one, man["lines"]))
json.dump(res, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
for x in res:
    flag = "  " if x["cer"] < 0.08 else "!!"
    print(f"{flag} {x['segId']:5} {x['role']:8} take={x['take']} cer={x['cer']:.3f} f0={x['f0']:5} | {x['heard']}")
