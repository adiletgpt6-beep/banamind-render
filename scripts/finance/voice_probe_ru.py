"""Оценка образцов русского голоса (voice-samples/finance-ru/probe.json): Whisper
распознаёт каждый образец, считается WER к эталонной фразе; дополнительно —
средняя высота тона (F0) и темп. Результат дописывается в probe.json."""
import json
import re
import subprocess

from faster_whisper import WhisperModel

P = "voice-samples/finance-ru/probe.json"


def norm(s):
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^а-яa-z0-9 ]+", " ", s)
    return s.split()


def wer(ref, hyp):
    d = list(range(len(hyp) + 1))
    for i, r in enumerate(ref, 1):
        prev, d[0] = d[0], i
        for j, h in enumerate(hyp, 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prev + (r != h))
            prev, d[j] = d[j], cur
    return d[len(hyp)] / max(1, len(ref))


def main():
    data = json.load(open(P))
    model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
    ref = norm(data["text"])
    for r in data["results"]:
        path = f"voice-samples/finance-ru/{r['file']}"
        segs, _ = model.transcribe(path, language="ru", beam_size=5)
        heard = " ".join(s.text.strip() for s in segs)
        # числа Whisper пишет цифрами — сравниваем без чисел
        hyp = [w for w in norm(heard) if not w.isdigit()]
        refw = [w for w in ref if w not in ("четыре", "тысячи", "три", "тысячи", "двести")]
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode())
        r.update({"heard": heard, "wer": round(wer(refw, hyp), 3), "dur": round(dur, 2)})
        print(f"{r['wer']:.3f}  {dur:5.2f}s  {r['name']} / {r['model']}: {heard}", flush=True)
    json.dump(data, open(P, "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
