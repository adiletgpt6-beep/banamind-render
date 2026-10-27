# Проверка озвучки распознаванием речи (faster-whisper, русский):
# каждая реплика распознаётся и сравнивается с текстом сценария (CER по буквам).
# Только отчёт: в CI пишет таблицу в GITHUB_STEP_SUMMARY.
#
# Запуск: python -I scripts/muslim-kids/asr_check.py public/muslim-kids/ali-imran/voice
import json
import os
import re
import sys

from faster_whisper import WhisperModel

voice_dir = sys.argv[1]
manifest = json.load(open(os.path.join(voice_dir, "manifest.json"), encoding="utf-8"))
model = WhisperModel(os.environ.get("ASR_MODEL", "medium"), device="cpu", compute_type="int8")


def norm(s):
    return re.sub(r"[^а-яё0-9]", "", s.lower().replace("ё", "е"))


def cer(a, b):
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        prev, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (ca != cb))
    return d[len(b)] / max(1, len(a))


rows = []
worst = 0.0
for line in manifest["lines"]:
    segs, _ = model.transcribe(os.path.join(voice_dir, line["file"]), language="ru", beam_size=5)
    heard = " ".join(s.text.strip() for s in segs)
    e = cer(norm(line["text"]), norm(heard))
    worst = max(worst, e)
    rows.append(f"| {line['id']} | {line['text']} | {heard} | {e:.2f} |")
    print(f"{line['id']}: CER {e:.2f} — {heard}")

report = "\n".join(["### Проверка озвучки (Whisper)", "", "| реплика | сценарий | распознано | CER |", "|---|---|---|---|", *rows, "", f"Худший CER: {worst:.2f}"])
# цитата аята — дополнительно точной моделью, по словам
check = os.environ.get("ASR_STRICT_LINES", "")
strict = WhisperModel("large-v3", device="cpu", compute_type="int8") if check else None
for line in manifest["lines"]:
    if line["id"] not in check.split(","):
        continue
    segs, _ = strict.transcribe(os.path.join(voice_dir, line["file"]), language="ru", beam_size=5, word_timestamps=True)
    words = [f"{w.word.strip()}@{w.start:.2f}-{w.end:.2f}" for s in segs for w in s.words]
    msg = f"large-v3 {line['id']}: " + " ".join(words)
    print(msg)
    report += "\n\n" + msg

summary = os.environ.get("GITHUB_STEP_SUMMARY")
if summary:
    open(summary, "a", encoding="utf-8").write(report + "\n")
