# Проверка всех дублей озвучки ролика 80-1-4 до выбора (pick в voices.json):
#   • распознавание тела реплики (OpenAI gpt-4o-transcribe, ru) и доля ошибок
#     по буквам (CER) относительно сценария;
#   • медиана основного тона (F0) и темп (букв в секунду) по таймингам синтеза;
#   • «слепое» прослушивание аудиомоделью (gpt-audio-1.5): модель получает
#     только звук и нейтральное задание — без сценария и ожидаемого текста —
#     и описывает возраст и пол говорящего, естественность, интонацию и
#     дефекты (обрезанное начало или конец, роботизированность, щелчки).
# Это технический замер и мнение модели, а не прослушивание человеком.
#
#   python3 scripts/lesson80-1-4-takes-qa.py out/lesson80-1-4-takes-qa.json [--no-listen] [id …]
import base64, json, os, re, subprocess, sys, tempfile, time, urllib.error, urllib.request, uuid
from concurrent.futures import ThreadPoolExecutor
import numpy as np

RAW = "public/audio/lesson80-1-4/raw"
args = [a for a in sys.argv[1:] if not a.startswith("--")]
out_path = args[0] if args else "out/lesson80-1-4-takes-qa.json"
only = set(args[1:])
listen = "--no-listen" not in sys.argv


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


def body_wav(meta, mp3, path):
    # тело реплики без страховочного слова (по таймингам синтеза) + 0,15 с запаса
    al = meta["alignment"]
    chars = "".join(al["characters"])
    st, en = al["character_start_times_seconds"], al["character_end_times_seconds"]
    pad = meta["pad"].replace(".", "")
    i0 = max(0, chars.find(meta["text"][:6]))
    p = chars.rfind(pad)
    end = st[p] - 0.03 if p > i0 else en[-1] + 0.3
    start = max(0.0, st[i0] - 0.12)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", mp3, "-ss", f"{start:.3f}", "-to", f"{end:.3f}", "-ac", "1", "-ar", "24000", path], check=True)
    return start, end, (en[p - 2] if p > i0 + 2 else en[-1]) - st[i0]


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


def post(url, body, headers):
    h = dict(headers)
    if os.environ.get("OPENAI_API_KEY"):
        h["Authorization"] = "Bearer " + os.environ["OPENAI_API_KEY"]
    # повтор при ограничении частоты запросов (429) и временных ошибках сервера
    for attempt in range(8):
        try:
            req = urllib.request.Request(url, data=body, headers=h)
            return json.load(urllib.request.urlopen(req, timeout=180))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503) or attempt == 7:
                raise
            time.sleep(min(60, 4 * 2 ** attempt))


def transcribe(path):
    boundary = uuid.uuid4().hex
    data = open(path, "rb").read()
    parts = []
    for k, v in (("model", "gpt-4o-transcribe"), ("language", "ru"), ("response_format", "json")):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode())
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.wav\"\r\nContent-Type: audio/wav\r\n\r\n".encode() + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    return post("https://api.openai.com/v1/audio/transcriptions", b"".join(parts), {"Content-Type": f"multipart/form-data; boundary={boundary}"})["text"]


PROMPT = (
    "Listen to this short Russian speech clip (one speaker). Do not guess any script. "
    "Answer ONLY with compact JSON: {\"transcript_ru\": str, \"perceived_gender\": \"male|female|unclear\", "
    "\"perceived_age_years\": int, \"sounds_like_child\": bool, \"natural\": 1-5, "
    "\"intonation\": \"question|statement|exclamation\", \"tempo\": \"slow|normal|fast\", "
    "\"artifacts\": [str], \"start_cut\": bool, \"end_cut\": bool, \"notes\": str}"
)


def blind(path):
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    body = {
        "model": "gpt-audio-1.5",
        "modalities": ["text"],
        "store": False,
        "max_completion_tokens": 600,
        "messages": [{"role": "user", "content": [{"type": "text", "text": PROMPT}, {"type": "input_audio", "input_audio": {"data": b64, "format": "wav"}}]}],
    }
    r = post("https://api.openai.com/v1/chat/completions", json.dumps(body).encode(), {"Content-Type": "application/json"})
    txt = r["choices"][0]["message"]["content"]
    m = re.search(r"\{.*\}", txt, re.S)
    try:
        return json.loads(m.group(0)) if m else {"raw": txt}
    except Exception:
        return {"raw": txt}


def one(meta_path):
    meta = json.load(open(meta_path))
    key = os.path.basename(meta_path)[:-5]
    wav = os.path.join(tempfile.gettempdir(), f"l4qa-{key}.wav")
    s, e, dur = body_wav(meta, os.path.join(RAW, key + ".mp3"), wav)
    heard = transcribe(wav)
    r = norm(meta["text"])
    res = {"segId": meta["segId"], "role": meta["role"], "take": meta["take"], "key": key, "text": meta["text"], "heard": heard, "cer": round(lev(r, norm(heard)) / max(1, len(r)), 3), "f0": f0(wav), "speech": round(dur, 2), "rate": round(len(meta["text"]) / max(0.1, dur), 1), "tag": meta.get("tag")}
    if listen:
        try:
            res["blind"] = blind(wav)
        except Exception as ex:  # noqa: BLE001
            res["blind"] = {"error": str(ex)[:200]}
    return res


metas = sorted(os.path.join(RAW, f) for f in os.listdir(RAW) if f.endswith(".json"))
metas = [m for m in metas if not only or json.load(open(m))["segId"] in only]
# кэш: уже проверенные дубли (по ключу) повторно не отправляются; ошибка одного
# дубля не прерывает проверку остальных — повторный запуск дозаполнит пропуски
cache = {}
if os.path.exists(out_path):
    try:
        cache = {x["key"]: x for x in json.load(open(out_path)) if "error" not in x and (not listen or "error" not in x.get("blind", {"error": 1}))}
    except Exception:  # noqa: BLE001
        cache = {}


def safe(m):
    key = os.path.basename(m)[:-5]
    if key in cache:
        return cache[key]
    try:
        return one(m)
    except Exception as ex:  # noqa: BLE001
        meta = json.load(open(m))
        return {"segId": meta["segId"], "role": meta["role"], "take": meta["take"], "key": key, "text": meta["text"], "heard": "", "cer": 1.0, "f0": 0, "speech": 0, "rate": 0, "error": str(ex)[:200]}


with ThreadPoolExecutor(2) as ex:
    res = list(ex.map(safe, metas))
res.sort(key=lambda x: (x["segId"], x["take"]))
os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
json.dump(res, open(out_path, "w"), ensure_ascii=False, indent=1)
for x in res:
    flag = "ER" if "error" in x else "  " if x["cer"] < 0.08 else "!!"
    b = x.get("blind", {})
    bl = f"| {b.get('perceived_gender')} ~{b.get('perceived_age_years')} child={b.get('sounds_like_child')} nat={b.get('natural')} {b.get('intonation')} {b.get('tempo')} art={b.get('artifacts')}" if listen else ""
    print(f"{flag} {x['segId']} {x['role']:7} t{x['take']} cer={x['cer']:.3f} f0={x['f0']:5} {x['speech']:5}s {x['rate']:4}ch/s | {x['heard']} {bl}")
