"""Parser for the canonical screenplay films/nox/script/script.md."""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SCRIPT = os.path.join(ROOT, "script", "script.md")
CHAPTER_SEC = 120.0


def load(path=SCRIPT):
    text = open(path, encoding="utf-8").read()
    chapters = []
    for m in re.finditer(r"^## (CH\d\d) \| (.+?)\n(.*?)(?=^## CH|\Z)", text, re.M | re.S):
        cid, title, body = m.group(1), m.group(2).strip(), m.group(3)
        intro = body.split("\n### ")[0]
        notes = " ".join(l[1:].strip() for l in intro.splitlines() if l.startswith(">"))
        blocks = []
        for bm in re.finditer(r"^### (CH\d\d-[A-Z]\d?)\n(.*?)(?=^### |\Z)", body, re.M | re.S):
            bid, b = bm.group(1), bm.group(2)
            visual, speech, gap, flex = [], [], 0.7, False
            for line in b.splitlines():
                s = line.strip()
                if not s:
                    continue
                if s.startswith(">"):
                    visual.append(s[1:].strip())
                elif s.startswith("@"):
                    g = re.search(r"@gap\s+([\d.]+)", s)
                    if g:
                        gap = float(g.group(1))
                    flex = flex or "@flex" in s
                else:
                    speech.append(s)
            blocks.append({"id": bid, "chapter": cid, "text": " ".join(speech), "visual": " ".join(visual),
                           "gap": gap, "flex": flex})
        chapters.append({"id": cid, "index": int(cid[2:]), "title": title, "notes": notes, "blocks": blocks})
    return chapters


def all_blocks(chapters=None):
    chapters = chapters or load()
    return [b for c in chapters for b in c["blocks"]]


if __name__ == "__main__":
    ch = load()
    n = 0
    for c in ch:
        w = sum(len(b["text"].split()) for b in c["blocks"])
        n += w
        print(c["id"], len(c["blocks"]), w, c["title"])
    print("total words", n, "blocks", sum(len(c["blocks"]) for c in ch))
