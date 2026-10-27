#!/usr/bin/env python3
"""Reproducible FB2/ZIP to UTF-8 conversion. No extraction to member paths."""
import argparse
import json
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

NS = {"f": "http://www.gribuser.ru/xml/fictionbook/2.0"}
XLINK = "{http://www.w3.org/1999/xlink}href"


class NoDoctype(ET.TreeBuilder):
    def doctype(self, name, pubid, system):
        raise ValueError("DTD is not part of the accepted book input")


def convert(path, source_id):
    data = path.read_bytes()
    member_name = None
    if data.startswith(b"PK\x03\x04"):
        with ZipFile(path) as archive:
            members = archive.infolist()
            if sum(m.file_size for m in members) > 128 * 1024 * 1024:
                raise ValueError("Archive is larger than the conversion limit")
            if archive.testzip() is not None:
                raise ValueError("Archive CRC check failed")
            candidates = [m for m in members if not m.is_dir() and m.filename.lower().endswith(".fb2")]
            if len(candidates) != 1:
                raise ValueError("Expected exactly one FB2 book; select members explicitly for another archive")
            member_name = candidates[0].filename
            data = archive.read(candidates[0])
    tree = ET.fromstring(data, parser=ET.XMLParser(target=NoDoctype()))
    if tree.tag != "{" + NS["f"] + "}FictionBook":
        raise ValueError("Not a supported FictionBook document")
    info = tree.find("f:description/f:title-info", NS)
    if info is None:
        raise ValueError("No title-info")
    title = info.findtext("f:book-title", namespaces=NS) or "Не указано"
    authors = [" ".join("".join(a.itertext()).split()) for a in info.findall("f:author", NS)]
    lines = [f"ИСТОЧНИК {source_id}", f"Название: {title}", f'Автор: {", ".join(authors)}', ""]
    stats = {"paragraphs": 0, "sections": 0, "body_count": 0, "images": 0,
             "embedded_binary_count": len(tree.findall("f:binary", NS)), "tables": 0, "note_links": 0}
    image_ids, note_ids = [], []

    def inline(node):
        value = node.text or ""
        for child in node:
            tag = child.tag.rsplit("}", 1)[-1]
            if tag == "image":
                ref = child.get(XLINK, "unknown")
                image_ids.append(ref)
                value += f" [ИЗОБРАЖЕНИЕ НЕ ВКЛЮЧЕНО В TXT: {ref}] "
            else:
                value += inline(child)
                if tag == "a" and child.get("type") == "note":
                    ref = child.get(XLINK, "")
                    note_ids.append(ref)
                    value += f" [ПРИМЕЧАНИЕ {ref}] "
            value += child.tail or ""
        return value

    def clean(node):
        return " ".join(inline(node).split())

    def walk(node):
        tag = node.tag.rsplit("}", 1)[-1]
        if tag == "binary":
            return
        if tag == "section":
            stats["sections"] += 1
            if node.get("id"):
                lines.extend(["", f'[SECTION {node.get("id")}]'])
        if tag == "title":
            text = clean(node)
            if text:
                lines.extend(["", "## " + text, ""])
            return
        if tag == "table":
            stats["tables"] += 1
        if tag == "tr":
            lines.extend([" | ".join(clean(c) for c in node), ""])
            return
        if tag in {"p", "v", "subtitle", "text-author", "date", "th", "td"}:
            text = clean(node)
            if text:
                lines.extend([text, ""])
                stats["paragraphs"] += 1
            return
        if tag == "image":
            ref = node.get(XLINK, "unknown")
            image_ids.append(ref)
            lines.extend([f"[ИЗОБРАЖЕНИЕ НЕ ВКЛЮЧЕНО В TXT: {ref}]", ""])
            return
        if tag == "empty-line":
            lines.append("")
            return
        for child in node:
            walk(child)

    bodies = tree.findall("f:body", NS)
    if not bodies:
        raise ValueError("No book bodies")
    for body in bodies:
        stats["body_count"] += 1
        lines.extend(["", f'=== BODY {body.get("name", "main")} ===', ""])
        walk(body)
    text = "\n".join(lines).rstrip() + "\n"
    stats["images"] = len(image_ids)
    stats["note_links"] = len(note_ids)
    expected_images = sum(len(b.findall(".//f:image", NS)) for b in bodies)
    if stats["images"] != expected_images:
        raise ValueError("Image placeholders were lost or counted twice")
    headings = [{"line": i, "title": line[3:]} for i, line in enumerate(text.splitlines(), 1)
                if line.startswith("## ")]
    return text, {"title": title, "authors": authors, "member_name": member_name, "fb2_bytes": len(data),
                  "stats": stats, "headings": headings, "image_refs": image_ids, "note_refs": note_ids}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--source-id", required=True)
    args = parser.parse_args()
    text, metadata = convert(args.input, args.source_id)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(text, encoding="utf-8")
    args.output.with_suffix(".conversion.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f'{args.source_id}: UTF-8 text, {len(text.splitlines())} lines, {len(metadata["headings"])} headings')


if __name__ == "__main__":
    main()
