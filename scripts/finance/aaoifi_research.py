"""Сбор выдержек из доступных текстов шариатских стандартов AAOIFI.

Скачивает открытые страницы/PDF (официальный сайт AAOIFI и публично размещённые
регуляторами копии), извлекает текст и выписывает короткие фрагменты вокруг
ключевых терминов (interest/riba, bonds, shares, gharar, gambling, profit
share, guarantee of capital). Результат — служебный файл для отчёта о проверке
сценария, а не публикация стандартов: фрагменты короткие, с указанием источника.

Запуск: python scripts/finance/aaoifi_research.py
Выход:  finance/research/aaoifi-excerpts.md
"""
import os
import re
import subprocess
import tempfile
from urllib.parse import urljoin

import requests

OUT = "finance/research/aaoifi-excerpts.md"
UA = {"User-Agent": "Mozilla/5.0 (research for script compliance check)"}
SEEDS = [
    "https://aaoifi.com/shariaa-standards/?lang=en",
    "https://aaoifi.com/shariah-standards-3/?lang=en",
    "https://aaoifi.com/announcement/draft-english-translation-of-aaoifi-shariah-standards-1-61/?lang=en",
    "https://aaoifi.com/announcement/in-historic-move-aaoifi-under-sponsorship-of-sabbs-financial-services-provides-free-access-to-online-version-of-its-shariah-standards/?lang=en",
    "https://cis.aaoifi.com/ar/?p=1714",
    "https://cis.aaoifi.com/ru/?p=1712",
]
PDFS = [
    "https://www.iefpedia.com/english/wp-content/uploads/2017/12/Shariaa-Standards-ENG.pdf",
    "https://documents.pse.com.ph/wp-content/uploads/sites/15/2021/04/AAOIFI-Sharia-Standard-No-21-Financial-Paper-1.pdf",
]
TERMS = [
    r"interest[- ]bearing bonds?", r"(stipulat\w+|condition\w*) (of )?(any )?(increase|increment|excess|benefit)",
    r"lump[- ]sum", r"percentage of (the )?capital", r"loss(es)? (shall|is|are|must) (be )?borne",
    r"guarantee(s|d)? (of )?(the )?capital", r"prohibited activit\w+", r"main activity",
    r"gharar is", r"definition of gharar", r"gambling", r"maysir|qimar", r"margin", r"short[- ]sell",
]


def text_of(url, data):
    if url.lower().endswith(".pdf") or data[:4] == b"%PDF":
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(data)
        return subprocess.run(["pdftotext", "-layout", f.name, "-"], capture_output=True).stdout.decode("utf-8", "ignore")
    html = data.decode("utf-8", "ignore")
    html = re.sub(r"(?is)<(script|style).*?</\1>", " ", html)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


def get(url):
    try:
        r = requests.get(url, headers=UA, timeout=60)
        print(f"{r.status_code} {url} ({len(r.content)} B)", flush=True)
        return r.content if r.ok else None
    except Exception as e:  # noqa: BLE001
        print(f"ERR {url}: {e}", flush=True)
        return None


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    found = list(PDFS)
    pages = {}
    for s in SEEDS:
        data = get(s)
        if not data:
            continue
        html = data.decode("utf-8", "ignore")
        pages[s] = text_of(s, data)
        for href in re.findall(r'href="([^"]+\.pdf)"', html, flags=re.I):
            u = urljoin(s, href)
            if re.search(r"shari|standard|SS[-_ ]?\d", u, re.I) and u not in found:
                found.append(u)
    for u in found[:40]:
        data = get(u)
        if data:
            pages[u] = text_of(u, data)
    lines = ["# Выдержки из доступных текстов AAOIFI (служебный файл проверки)", "",
             "Короткие фрагменты вокруг ключевых терминов. Источник указан у каждого блока.", ""]
    for u, txt in pages.items():
        flat = re.sub(r"\s+", " ", txt)
        hits = []
        for t in TERMS:
            for m in list(re.finditer(t, flat, re.I))[:6]:
                a, b = max(0, m.start() - 260), min(len(flat), m.end() + 260)
                hits.append((m.start(), flat[a:b]))
        if not hits:
            lines += [f"## {u}", "", f"_Текст получен ({len(flat)} симв.), ключевых терминов нет._", ""]
            continue
        hits.sort()
        lines += [f"## {u}", ""]
        last = -1000
        for pos, frag in hits:
            if pos - last < 300:
                continue
            last = pos
            lines.append(f"> …{frag.strip()}…")
            lines.append("")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"Источников с текстом: {len(pages)}; файл {OUT}")


if __name__ == "__main__":
    main()
