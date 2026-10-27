"""Полная расшифровка русского исходника открытой моделью Whisper (faster-whisper).

Используется, когда у ключа ElevenLabs нет права speech_to_text. Аудио делится
на последовательные 5-минутные фрагменты без перекрытия; метки сдвигаются на
начало фрагмента. VAD выключен, чтобы не терять тихие места; длинные паузы без
слов выписываются отдельно (transcript-ru-gaps.txt) для ручной проверки.

Запуск: python scripts/finance/asr_whisper.py
Выход: finance/source/transcript-ru.{json,txt}, transcript-ru-gaps.txt
"""
import json
import os
import subprocess
import tempfile

from faster_whisper import WhisperModel

SRC = "finance/source/source-ru.opus"
OUT = "finance/source"
CHUNK = 300
MODEL = os.environ.get("FINANCE_WHISPER_MODEL", "large-v3-turbo")


def duration(path):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode().strip())


def ts(t):
    return f"{int(t // 60):02d}:{t % 60:04.1f}"


def main():
    total = duration(SRC)
    tmp = tempfile.mkdtemp()
    subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-ac", "1", "-ar", "16000", "-f", "segment",
                           "-segment_time", str(CHUNK), "-c:a", "pcm_s16le", os.path.join(tmp, "c_%02d.wav")])
    chunks = sorted(f for f in os.listdir(tmp) if f.endswith(".wav"))
    model = WhisperModel(MODEL, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
    words, segments = [], []
    offset = 0.0
    prompt = "Финансовая грамотность: доход, расходы, активы, пассивы, денежный поток, цели, капитал."
    for c in chunks:
        path = os.path.join(tmp, c)
        d = duration(path)
        segs, _ = model.transcribe(path, language="ru", beam_size=5, word_timestamps=True, vad_filter=False,
                                   condition_on_previous_text=True, initial_prompt=prompt)
        n = 0
        for s in segs:
            segments.append({"start": round(s.start + offset, 2), "end": round(s.end + offset, 2), "text": s.text.strip(),
                             "avg_logprob": round(s.avg_logprob, 3), "no_speech_prob": round(s.no_speech_prob, 3)})
            for w in s.words or []:
                words.append({"text": w.word.strip(), "start": round(w.start + offset, 3), "end": round(w.end + offset, 3),
                              "p": round(w.probability, 3)})
                n += 1
        print(f"✓ {c}: {offset:.1f}–{offset + d:.1f} с, слов {n}", flush=True)
        offset += d
    print(f"Фрагментов: {len(chunks)}, сумма {offset:.2f} с, исходник {total:.2f} с")
    if abs(offset - total) > 1:
        raise SystemExit("Фрагменты не покрывают исходник целиком.")

    lines = [f"[{ts(s['start'])}–{ts(s['end'])}] {s['text']}" + ("  ⟨низкая уверенность⟩" if s["avg_logprob"] < -1 else "")
             for s in segments]
    gaps, last = [], 0.0
    for w in words:
        if w["start"] - last > 4:
            gaps.append(f"{ts(last)} → {ts(w['start'])}: {w['start'] - last:.1f} с без слов")
        last = w["end"]
    if total - last > 4:
        gaps.append(f"{ts(last)} → {ts(total)}: {total - last:.1f} с без слов (конец)")
    with open(os.path.join(OUT, "transcript-ru.json"), "w", encoding="utf-8") as f:
        json.dump({"source": SRC, "model": MODEL, "duration": total, "chunkSec": CHUNK, "segments": segments, "words": words},
                  f, ensure_ascii=False, indent=0)
    with open(os.path.join(OUT, "transcript-ru.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    with open(os.path.join(OUT, "transcript-ru-gaps.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(gaps) + "\n" if gaps else "Пауз длиннее 4 с без слов нет.\n")
    print(f"Сегментов: {len(segments)}; длинных пауз: {len(gaps)}")


if __name__ == "__main__":
    main()
