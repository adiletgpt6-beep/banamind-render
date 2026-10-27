"""Дорасшифровка стыков 5-минутных фрагментов (контроль пропусков).

Основная расшифровка делит аудио на фрагменты по 300 с; на стыках модель может
потерять несколько слов. Здесь каждое окно ±25 с вокруг стыка распознаётся
целиком (без разреза), чтобы заполнить пропуски.

Запуск: python scripts/finance/asr_windows.py → finance/source/transcript-ru-boundaries.txt
"""
import os
import subprocess
import tempfile

from faster_whisper import WhisperModel

SRC = "finance/source/source-ru.opus"
OUT = "finance/source/transcript-ru-boundaries.txt"
WINDOWS = [(275, 325), (575, 625), (875, 925), (1170, 1240)]


def ts(t):
    return f"{int(t // 60):02d}:{t % 60:04.1f}"


def main():
    model = WhisperModel(os.environ.get("FINANCE_WHISPER_MODEL", "large-v3-turbo"), device="cpu", compute_type="int8")
    tmp = tempfile.mkdtemp()
    lines = ["# Окна вокруг стыков фрагментов основной расшифровки", ""]
    for a, b in WINDOWS:
        path = os.path.join(tmp, f"w{a}.wav")
        subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-to", str(b), "-i", SRC, "-ac", "1", "-ar", "16000", path])
        segs, _ = model.transcribe(path, language="ru", beam_size=5, vad_filter=False, condition_on_previous_text=False)
        lines.append(f"## {ts(a)}–{ts(b)}")
        for s in segs:
            lines.append(f"[{ts(s.start + a)}–{ts(s.end + a)}] {s.text.strip()}")
        lines.append("")
        print(f"✓ окно {ts(a)}–{ts(b)}", flush=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
