"""Проверка английской озвучки обратным распознаванием (Whisper).

Каждая реплика public/finance/voice/*.mp3 распознаётся и сравнивается с текстом
сценария (WER по словам после нормализации чисел и пунктуации). Реплики с
WER > 0.15 выписываются для ручной проверки — косвенная проверка произношения
финансовых терминов, сумм и отсутствия обрезанных окончаний.

Запуск: python scripts/finance/voice_qa.py [en|ru] → public/finance/voice[-ru]/qa.json
Для русской версии эталон — произносимый текст (числа словами), цифры в
распознанном тексте переводятся в слова (num2words); падежные расхождения чисел
дают небольшой WER и проверяются по полю heard.
"""
import json
import re
import sys

from faster_whisper import WhisperModel

LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
DIR = "public/finance/voice-ru" if LANG == "ru" else "public/finance/voice"
MAN = f"{DIR}/manifest.json"
OUT = f"{DIR}/qa.json"
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def num_words(n):
    n = int(n)
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000:
        return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + num_words(n % 100))
    return num_words(n // 1000) + " thousand" + ("" if n % 1000 == 0 else " " + num_words(n % 1000))


def norm_ru(s):
    from num2words import num2words

    s = s.lower().replace("ё", "е").replace("-", " ")
    s = re.sub(r"\$?(\d[\d\s,]*\d|\d)", lambda m: " " + num2words(int(re.sub(r"\D", "", m.group(0))), lang="ru") + " ", s)
    s = re.sub(r"[^а-яa-z ]+", " ", s)
    return s.replace("ё", "е").split()


def norm(s):
    if LANG == "ru":
        return norm_ru(s)
    s = s.lower().replace("-", " ")
    s = re.sub(r"\$?(\d[\d,]*)", lambda m: num_words(m.group(1).replace(",", "")) + (" dollars" if m.group(0).startswith("$") else ""), s)
    s = re.sub(r"[^a-z' ]+", " ", s).replace("'", "")
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
    m = json.load(open(MAN))
    texts = {}
    # тексты реплик — из слов манифеста (совпадают с текстом сценария)
    for l in m["lines"]:
        texts[l["id"]] = l.get("spoken") or " ".join(w["text"] for w in l["words"])
    prev = {}
    try:
        prev = {r["id"]: r for r in json.load(open(OUT))["lines"]}
    except (OSError, ValueError, KeyError):
        pass
    model = None
    res = []
    for l in m["lines"]:
        old = prev.get(l["id"])
        if old and old.get("hash") == l["hash"]:
            res.append(old)  # реплика не менялась — проверка уже есть
            continue
        model = model or WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
        segs, _ = model.transcribe(f"{DIR}/{l['file']}", language=LANG, beam_size=5, vad_filter=False)
        heard = " ".join(s.text.strip() for s in segs)
        w = wer(norm(texts[l["id"]]), norm(heard))
        res.append({"id": l["id"], "hash": l["hash"], "wer": round(w, 3), "heard": heard})
        print(f"{'⚠' if w > 0.15 else '✓'} {l['id']}: WER {w:.2f} | {heard}", flush=True)
    json.dump({"model": "large-v3-turbo", "lines": res}, open(OUT, "w"), ensure_ascii=False, indent=1)
    bad = [r for r in res if r["wer"] > 0.15]
    print(f"Реплик: {len(res)}; с WER > 0.15: {len(bad)}; средний WER {sum(r['wer'] for r in res) / len(res):.3f}")


if __name__ == "__main__":
    main()
