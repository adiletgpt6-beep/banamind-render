# Распознавание озвучки ролика 80-1-3 в CI локальной моделью Whisper
# (faster-whisper, CPU): независимая проверка, что сырые дубли и готовые
# файлы реплик произносят утверждённый текст — без пропусков, лишних и
# обрезанных слов. Результат кэшируется по SHA-1 файла:
#   public/audio/lesson80-1-3/stt/<sha1>.json  { file, id, take, text, words }
# Сравнение со сценарием — локально: node scripts/lesson80-1-3-stt-qa.mjs --report
# Это технический замер распознавателем, а не прослушивание человеком.
#
#   pip install faster-whisper && python3 scripts/lesson80-1-3-asr.py [--model medium] [--takes]
import hashlib, json, os, subprocess, sys

DIR = "public/audio/lesson80-1-3"
OUT = os.path.join(DIR, "stt")
os.makedirs(OUT, exist_ok=True)
model_name = sys.argv[sys.argv.index("--model") + 1] if "--model" in sys.argv else "medium"


def sha(p):
    return hashlib.sha1(open(p, "rb").read()).hexdigest()[:16]


targets = []
for f in sorted(os.listdir(DIR)):
    if f.startswith("80-1-3-") and f.endswith(".mp3"):
        targets.append({"file": os.path.join(DIR, f), "id": f[:-4], "take": None})
# сырые дубли — по флагу --takes (CI передаёт его; результаты кэшируются по
# хэшу файла, поэтому распознаются только новые дубли)
raw = os.path.join(DIR, "raw")
if "--takes" in sys.argv and os.path.isdir(raw):
    for f in sorted(os.listdir(raw)):
        if f.endswith(".json"):
            meta = json.load(open(os.path.join(raw, f)))
            mp3 = os.path.join(raw, f[:-5] + ".mp3")
            if os.path.exists(mp3):
                targets.append({"file": mp3, "id": meta["segId"], "take": meta["take"]})
todo = [t for t in targets if not os.path.exists(os.path.join(OUT, sha(t["file"]) + ".json"))]
print(f"Распознать: {len(todo)} из {len(targets)}")
if not todo:
    sys.exit(0)

import numpy as np  # noqa: E402
from faster_whisper import WhisperModel  # noqa: E402

model = WhisperModel(model_name, device="cpu", compute_type="int8")
for t in todo:
    # декодирование своим ffmpeg (16 кГц, моно): не зависит от версии PyAV
    pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", t["file"], "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, dtype=np.float32)
    segs, _ = model.transcribe(audio, language="ru", beam_size=5, word_timestamps=True, condition_on_previous_text=False, vad_filter=False)
    segs = list(segs)
    text = " ".join(s.text.strip() for s in segs).strip()
    words = [{"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in (s.words or [])]
    json.dump({"file": t["file"], "id": t["id"], "take": t["take"], "model": f"whisper-{model_name}", "text": text, "words": words}, open(os.path.join(OUT, sha(t["file"]) + ".json"), "w"), ensure_ascii=False)
    print(f"✓ {t['id']} {t['take'] if t['take'] is not None else 'ФАЙЛ'}: {text}", flush=True)
