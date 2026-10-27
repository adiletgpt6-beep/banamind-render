"""Check viewer files for any source attribution (private lexicon) and service markers.

  python3 check_viewer.py FILE [FILE ...]    (text files are read; MP4/PNG/JPG metadata via ffprobe)"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LEX = json.load(open(os.path.join(HERE, "..", "..", "..", "three-books", "episodes", "TB-002", "PRIVATE_LEXICON.json"),
                     encoding="utf-8"))["aliases"]
EXTRA = ["NOX", "Нокс", "nox-film", "SOURCE_MAP", "S01.txt", "S02.txt", "S03.txt"]


def text_of(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in (".txt", ".srt", ".vtt", ".json", ".html", ".md"):
        return open(path, encoding="utf-8", errors="replace").read()
    r = subprocess.run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", path],
                       capture_output=True, text=True)
    return r.stdout


def main():
    bad = []
    for f in sys.argv[1:]:
        s = os.path.basename(f) + "\n" + text_of(f)
        low = s.lower()
        for a in LEX + EXTRA:
            if a.lower() in low:
                bad.append((f, a))
    if bad:
        for f, a in bad:
            print(f"FOUND in {os.path.basename(f)}: <alias #{(LEX + EXTRA).index(a)}>")
        raise SystemExit(1)
    print(f"OK: {len(sys.argv) - 1} files, no source names or service markers")


if __name__ == "__main__":
    main()
