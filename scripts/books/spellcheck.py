"""Орфография русских надписей и метаданных канала BanaMind.

stdin: JSON-массив строк. stdout: {"checked": N, "unknown": [...]}.
Hunspell ru_RU (apt: hunspell hunspell-ru) + слова проекта из books/dictionary.txt
(названия книг, имена, термины). Хэштеги (#...) не проверяются. Ё приравнивается к Е.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

texts = json.load(sys.stdin)
extra = Path(__file__).resolve().parents[2] / "books" / "dictionary.txt"
own = set()
if extra.exists():
    own = {w.strip().lower().replace("ё", "е") for w in extra.read_text("utf8").splitlines() if w.strip() and not w.startswith("#")}

plain = [re.sub(r"#\S+", " ", t) for t in texts]
words = sorted({w.lower().replace("ё", "е") for t in plain for w in re.findall(r"[А-Яа-яЁё]+", t)})
todo = [w for w in words if w not in own]
res = subprocess.run(["hunspell", "-d", "ru_RU", "-l"], input="\n".join(todo), capture_output=True, text=True, check=True)
unknown = sorted(set(res.stdout.split()))
print(json.dumps({"checked": len(words), "unknown": unknown}, ensure_ascii=False))
