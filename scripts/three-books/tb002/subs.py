"""TB-002 full Russian subtitles (SRT + VTT) and the exact transcript, timed by the final narration
(ElevenLabs character alignment mapped onto the film timeline).

  python3 subs.py OUTDIR"""
import os
import re
import sys

HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "src", "three-books", "tb002", "engine"))
import film  # noqa: E402

MAXL = 42          # characters per line
WEAK = {"в", "во", "и", "а", "но", "не", "ни", "на", "с", "со", "к", "ко", "о", "об", "у", "по", "за", "из", "от",
        "до", "для", "без", "при", "что", "как", "же", "ли", "или", "это", "его", "её", "их", "то", "так", "тот",
        "та", "те", "всё", "все", "ещё", "уже", "под", "над", "про", "через"}


def ts(t, vtt=False):
    t = max(0.0, t)
    h, r = divmod(int(round(t * 1000)), 3600000)
    m, r = divmod(r, 60000)
    s, ms = divmod(r, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{'.' if vtt else ','}{ms:03d}"


def phrases(words):
    """Group (word, t0, t1) into subtitle chunks: sentence/clause ends, ≤ 2 lines."""
    out, cur = [], []
    for w in words:
        cur.append(w)
        txt = " ".join(x[0] for x in cur)
        end_sentence = re.search(r"[.!?…]$|[.!?…][»”]$", w[0])
        end_clause = re.search(r"[,:;—]$", w[0]) or w[0] == "—"
        if end_sentence or len(txt) > 2 * MAXL - 12 or (end_clause and len(txt) > MAXL):
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    # never leave a 1–2 word fragment alone if it can join the previous chunk
    merged = []
    for ch in out:
        if merged and len(ch) <= 2 and len(" ".join(x[0] for x in merged[-1] + ch)) <= 2 * MAXL:
            merged[-1] = merged[-1] + ch
        else:
            merged.append(ch)
    return merged


def two_lines(text):
    if len(text) <= MAXL:
        return text
    toks = text.split()
    best, best_cost = text, 1e9
    for i in range(1, len(toks)):
        a, b = " ".join(toks[:i]), " ".join(toks[i:])
        if len(a) > MAXL + 4 or len(b) > MAXL + 4:
            continue
        cost = abs(len(a) - len(b)) + (40 if toks[i - 1].lower().strip("«»,.") in WEAK else 0) + \
            (30 if toks[i] in ("—",) else 0)
        if cost < best_cost:
            best, best_cost = a + "\n" + b, cost
    return best


def build(timing):
    cues = []
    for bid in sorted(timing.blocks, key=lambda b: timing.blocks[b]["start"]):
        for ch in phrases(timing.words(bid)):
            cues.append([ch[0][1], ch[-1][2], two_lines(" ".join(x[0] for x in ch)), bid])
    for c in cues:
        c[0] = max(0.0, c[0] - 0.05)
    for i, c in enumerate(cues):
        nxt = cues[i + 1][0] if i + 1 < len(cues) else c[1] + 3
        c[1] = min(max(c[1] + 0.35, c[0] + 1.0), nxt - 0.04, film.TOTAL - 0.05)
    return cues


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    timing = film.Timing()
    cues = build(timing)
    with open(os.path.join(out, "TB002_subtitles_RU.srt"), "w", encoding="utf-8") as f:
        for i, (a, b, txt, _) in enumerate(cues, 1):
            f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{txt}\n\n")
    with open(os.path.join(out, "TB002_subtitles_RU.vtt"), "w", encoding="utf-8") as f:
        f.write("WEBVTT\nLanguage: ru\n\n")
        for i, (a, b, txt, _) in enumerate(cues, 1):
            f.write(f"{i}\n{ts(a, True)} --> {ts(b, True)}\n{txt}\n\n")
    with open(os.path.join(out, "TB002_transcript_RU.txt"), "w", encoding="utf-8") as f:
        f.write("ПОЧЕМУ У ТЕБЯ НЕ ПОКУПАЮТ\nТочный текст итоговой русской дорожки (время начала каждого абзаца речи "
                "по финальному таймлайну)\n")
        for p in timing.parts:
            f.write(f"\n== {ts(timing.part_times[p['id']])[:8]}  {p['title']} ==\n\n")
            for b in p["blocks"]:
                bb = timing.blocks[b["id"]]
                f.write(f"[{ts(bb['start'])[:8]}] {b['text']}\n\n")
    print(f"{len(cues)} cues; longest line {max(len(l) for c in cues for l in c[2].splitlines())} chars")


if __name__ == "__main__":
    main()
