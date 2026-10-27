"""QA озвучки BM-031: каждая реплика распознаётся faster-whisper (CPU, int8)
и сравнивается с текстом сценария по словам (ё=е, без знаков препинания).

Запуск (CI): python3 scripts/hp-stone/voice_asr.py lines.json public/hp-stone/voice OUT_DIR [model]
lines.json — [{"id","text"}] (готовит workflow из script.ts).
Результат: OUT_DIR/voice-asr.json и OUT_DIR/voice-asr.md (реплики < 0.85 и все имена собственные).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

lines_path, voice_dir, out_dir = sys.argv[1:4]
model_name = sys.argv[4] if len(sys.argv) > 4 else "small"
lines = json.loads(Path(lines_path).read_text("utf8"))
out = Path(out_dir)
out.mkdir(parents=True, exist_ok=True)
PROMPT = "Гарри Поттер, Дж. К. Роулинг, Дёрсли, Петуния, Дадли, Хагрид, Дамблдор, Рон, Гермиона Грейнджер, Невилл, Драко Малфой, Снейп, Квиррелл, МакГонагалл, Слизерин, Гриффиндор, Фламель, Фиренц, Бейн, Волдеморт, БанаМайнд."
NAMES = ["гарри", "поттер", "роулинг", "дёрсли", "дерсли", "петуни", "хагрид", "дамблдор", "гермион", "невилл", "малфо", "снейп", "квиррелл", "макгонагалл", "слизерин", "гриффиндор", "фламел", "фиренц", "бейн", "волдеморт", "банан"]


def load(path):
    """16 кГц моно float32 через ffmpeg (не зависит от версии PyAV)."""
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0


def norm(s):
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^\w\s-]", " ", s).replace("-", " ")
    return [w for w in s.split() if w]


def lcs(a, b):
    d = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            d[i][j] = d[i - 1][j - 1] + 1 if a[i - 1] == b[j - 1] else max(d[i - 1][j], d[i][j - 1])
    return d[-1][-1]


model = WhisperModel(model_name, device="cpu", compute_type="int8")
res = []
for ln in lines:
    if not (Path(voice_dir) / f"{ln['id']}.mp3").exists():
        continue  # пилот: озвучены не все реплики
    segs, _ = model.transcribe(load(Path(voice_dir) / f"{ln['id']}.mp3"), language="ru", initial_prompt=PROMPT, beam_size=5, vad_filter=False)
    heard = " ".join(s.text.strip() for s in segs)
    want, got = norm(ln["text"]), norm(heard)
    score = 2 * lcs(want, got) / max(1, len(want) + len(got))
    names = sorted({w for w in want if any(w.startswith(n) for n in NAMES)})
    missing = [w for w in names if w not in got]
    res.append({"id": ln["id"], "score": round(score, 3), "text": ln["text"], "heard": heard, "names": names, "names_missing": missing})
    print(f"{ln['id']} {score:.3f}", flush=True)

(out / "voice-asr.json").write_text(json.dumps(res, ensure_ascii=False, indent=1), "utf8")
avg = sum(r["score"] for r in res) / len(res)
low = [r for r in res if r["score"] < 0.85]
miss = [r for r in res if r["names_missing"]]
md = [f"# BM-025 · проверка озвучки распознаванием (faster-whisper {model_name})", "",
      f"Реплик: {len(res)}; среднее совпадение со сценарием: **{avg:.3f}**; ниже 0.85: **{len(low)}**; реплик с неузнанным именем: **{len(miss)}**.",
      "Совпадение — доля общих слов (LCS) между текстом сценария и распознанным; ошибки распознавателя тоже снижают оценку, поэтому строки ниже проверяются вручную.", ""]
for title, rows in (("## Реплики с совпадением < 0.85", low), ("## Имена, которых распознаватель не услышал", miss)):
    md += [title, ""]
    for r in rows:
        md += [f"- **{r['id']}** {r['score']} — сценарий: {r['text']}", f"  - слышно: {r['heard']}" + (f" · не узнано: {', '.join(r['names_missing'])}" if r["names_missing"] else "")]
    md.append("")
(out / "voice-asr.md").write_text("\n".join(md), "utf8")
print(f"avg {avg:.3f}, low {len(low)}, names missing {len(miss)}")
