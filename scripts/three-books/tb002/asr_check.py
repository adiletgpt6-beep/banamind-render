"""TB-002: compare Whisper transcripts of the narration with the final script: word error rate, number words,
negations («не», «ни», «нет»), the names Тико/Ная. Writes three-books/episodes/TB-002/ASR_REPORT.md.

  python3 asr_check.py"""
import json
import os
import re
import sys

HERE = os.path.dirname(__file__)
sys.path.insert(0, HERE)
import script  # noqa: E402
from wer import norm, wer  # noqa: E402

NUM = re.compile(r"^(ноль|один|одна|одно|два|две|три|четыре|пять|шесть|семь|восемь|девять|десять|"
                 r"одиннадцать|двенадцать|шестнадцать|двадцать|тридцать|сорок|сто|двести|триста|четыреста|пятьсот|семьсот|восемьсот|"
                 r"тысяч\w*|сорока|первый|второй|третий|десятую)$")
NEG = {"не", "ни", "нет"}
NAMES = ("тико", "ная", "нае", "наю", "наи")


UNITS = {"ноль": 0, "один": 1, "одна": 1, "одно": 1, "два": 2, "две": 2, "три": 3, "четыре": 4, "пять": 5,
         "шесть": 6, "семь": 7, "восемь": 8, "девять": 9, "десять": 10, "одиннадцать": 11, "двенадцать": 12,
         "шестнадцать": 16, "двух": 2, "двое": 2, "пятеро": 5, "двенадцатью": 12}
TENS = {"двадцать": 20, "тридцать": 30, "сорок": 40, "сорока": 40, "пятьдесят": 50, "шестьдесят": 60,
        "семьдесят": 70, "восемьдесят": 80, "девяносто": 90}
HUND = {"сто": 100, "двести": 200, "триста": 300, "четыреста": 400, "пятьсот": 500, "семьсот": 700, "восемьсот": 800}


def values(words):
    """Cardinal numbers in a normalised word list: words (сто двадцать → 120) and digits."""
    out, cur = [], None
    for w in words + ["."]:
        if w.isdigit():
            if cur is not None:
                out.append(cur)
                cur = None
            out.append(int(w))
            continue
        v = None
        if w in HUND:
            v = HUND[w]
        elif w.startswith("тысяч"):
            v = 1000
        elif w in TENS:
            v = TENS[w]
        elif w in UNITS:
            v = UNITS[w]
        if v is not None and (cur is None or (cur % 100 == 0 and v < 100) or (cur % 10 == 0 and v < 10)) \
                and not (cur == 1000):
            cur = v if cur is None else cur + v
        else:
            if cur is not None:
                out.append(cur)
            cur = v
    return sorted(out)


def counts(words, pred):
    out = {}
    for w in words:
        if pred(w):
            out[w] = out.get(w, 0) + 1
    return out


def main():
    asr = json.load(open(os.path.join(script.VOICE_DIR, "blocks", "asr.json")))
    by = {os.path.basename(k)[:-4]: v for k, v in asr.items()}
    rows, flags = [], []
    total_ref, total_err = 0, 0.0
    for b in script.all_blocks():
        a = by.get(b["id"])
        if not a:
            flags.append((b["id"], "нет распознавания"))
            continue
        ref, hyp = norm(b["text"]), norm(a["text"])
        w = wer(b["text"], a["text"])
        total_ref += len(ref)
        total_err += w * len(ref)
        issues = []
        rv, hv = values(ref), values(hyp)
        if rv != hv:
            issues.append(f"числа: сценарий {rv} / распознано {hv}")
        rneg = sum(1 for x in ref if x in NEG)
        hneg = sum(1 for x in hyp if x in NEG)
        if rneg != hneg:
            issues.append(f"отрицания: {rneg} / {hneg}")
        # Whisper spells the reduced unstressed final vowel of Ти́ко as «Тика», and Ная as «Найя»
        hyp = [{"тика": "тико", "найя": "ная", "найи": "наи", "найе": "нае", "найю": "наю"}.get(x, x) for x in hyp]
        for nm in NAMES:
            r_ = sum(1 for x in ref if x == nm)
            h_ = sum(1 for x in hyp if x == nm)
            if r_ != h_:
                issues.append(f"имя «{nm}»: {r_} / {h_}")
        rows.append((b["id"], w, issues, a["text"]))
        if issues or w > 0.12:
            flags.append((b["id"], "; ".join(issues) or f"WER {w:.2f}"))
    md = ["# Проверка озвучки распознаванием (Whisper medium, faster-whisper)", "",
          "Автоматическое распознавание помогает найти смысловые ошибки (числа, отрицания, имена), но не доказывает "
          "приятность тембра и естественность исполнения. Расхождения ниже разобраны вручную по тексту.", "",
          f"Блоков: {len(rows)}; общий WER ≈ {total_err / max(1, total_ref):.3f}", "",
          "## Блоки с замечаниями автоматической проверки", ""]
    for bid, msg in flags:
        md.append(f"- **{bid}** — {msg}")
    md += ["", "## Все блоки", "", "| Блок | WER | Распознанный текст |", "|---|---|---|"]
    for bid, w, issues, txt in rows:
        md.append(f"| {bid} | {w:.2f} | {txt.replace('|', '/')} |")
    open(os.path.join(script.EPISODE, "ASR_REPORT.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(f"blocks {len(rows)}, WER {total_err / max(1, total_ref):.3f}, flagged {len(flags)}")
    for f in flags:
        print(" ", f)


if __name__ == "__main__":
    main()
