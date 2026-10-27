"""Parser for the TB-003 screenplay (three-books/episodes/TB-003/SCRIPT.md) and scene plan (SCENES.json).

SCRIPT.md: "## Axx — mm:ss–mm:ss — Title" parts, "### Bnnn" speech blocks, plain paragraphs of speech.
SCENES.json: 45 scenes in 9 parts, each lists its speech blocks; the preliminary times are only a plan."""
import json
import os
import re
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
EPISODE = os.path.join(REPO, "three-books", "episodes", "TB-003")
SCRIPT = os.path.join(EPISODE, "SCRIPT.md")
SCENES = os.path.join(EPISODE, "SCENES.json")
SRC = os.path.join(REPO, "src", "three-books", "tb003")
VOICE_DIR = os.path.join(SRC, "voice")


def _mmss(s):
    m, sec = s.split(":")
    return int(m) * 60 + int(sec)


def load(path=SCRIPT):
    text = open(path, encoding="utf-8").read()
    parts = []
    for m in re.finditer(r"^## (A\d\d) — (\d\d:\d\d)–(\d\d:\d\d) — (.+?)\n(.*?)(?=^## A|\Z)", text, re.M | re.S):
        pid, t0, t1, title, body = m.group(1), m.group(2), m.group(3), m.group(4).strip(), m.group(5)
        blocks = []
        for bm in re.finditer(r"^### (B\d{3})\n(.*?)(?=^### |\Z)", body, re.M | re.S):
            paras = [p.strip() for p in bm.group(2).strip().split("\n\n") if p.strip()]
            speech = " ".join(" ".join(p.split()) for p in paras)
            blocks.append({"id": bm.group(1), "part": pid, "text": speech})
        parts.append({"id": pid, "index": int(pid[1:]), "title": title, "plan": (_mmss(t0), _mmss(t1)),
                      "blocks": blocks})
    return parts


def all_blocks(parts=None):
    parts = parts or load()
    return [b for p in parts for b in p["blocks"]]


def scenes(path=SCENES):
    return json.load(open(path, encoding="utf-8"))["scenes"]


def plain_text(parts=None):
    """Exact spoken text without service headings (B/A ids, timecodes)."""
    parts = parts or load()
    return "\n\n".join(b["text"] for p in parts for b in p["blocks"]) + "\n"


def check():
    parts = load()
    blocks = all_blocks(parts)
    ids = [b["id"] for b in blocks]
    assert len(set(ids)) == len(ids), "block ids must be unique"
    meta = json.load(open(SCENES, encoding="utf-8"))
    assert len(ids) == meta["speech_block_count"], f"SCENES.json expects {meta['speech_block_count']} blocks, SCRIPT has {len(ids)}"
    assert len(parts) == meta["part_count"], "part count differs from SCENES.json"
    sc = scenes()
    used = [b for s in sc for b in s["speech_blocks"]]
    assert sorted(used) == sorted(ids), "every block must belong to exactly one scene"
    assert used == ids, "scene order must follow block order"
    return parts, blocks, sc


if __name__ == "__main__":
    parts, blocks, sc = check()
    n = 0
    for p in parts:
        w = sum(len(b["text"].split()) for b in p["blocks"])
        n += w
        print(p["id"], len(p["blocks"]), w, p["plan"], p["title"])
    print("total words", n, "blocks", len(blocks), "scenes", len(sc))
    if "--plain" in sys.argv:
        sys.stdout.write(plain_text(parts))
