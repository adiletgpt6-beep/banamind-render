#!/usr/bin/env python3
"""Verify the three normalized books; prepare searchable text, indexes and optional originals."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
from zipfile import ZipFile


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    args = argparse.ArgumentParser()
    args.add_argument("--originals", action="store_true", help="Also reconstruct verified original archives")
    opts = args.parse_args()
    root = Path(__file__).resolve().parents[3]
    episode = root / "three-books/episodes/TB-003"
    manifest = json.loads((episode / "SOURCE_MANIFEST.json").read_text("utf-8"))
    converter = (root / manifest["conversion_tool"]).read_bytes()
    if sha(converter) != manifest["conversion_tool_sha256"]:
        raise SystemExit("Converter version does not match the stored source indexes")
    if len(manifest["sources"]) != 3:
        raise SystemExit("Expected three normalized sources")
    ready = []
    for source in manifest["sources"]:
        packed = (root / source["repository_path"]).read_bytes()
        if len(packed) != source["archive_bytes"] or sha(packed) != source["archive_sha256"]:
            raise SystemExit(f'{source["id"]}: normalized archive mismatch')
        data = gzip.decompress(packed)
        if len(data) != source["bytes"] or sha(data) != source["sha256"]:
            raise SystemExit(f'{source["id"]}: normalized text mismatch')
        text = data.decode("utf-8")
        if len(text.splitlines()) != source["lines"]:
            raise SystemExit(f'{source["id"]}: line count mismatch')
        index_data = (episode / source["index_file"]).read_bytes()
        if sha(index_data) != source["index_sha256"]:
            raise SystemExit(f'{source["id"]}: index checksum mismatch')
        metadata = json.loads(index_data)
        actual_headings = [{"line": i, "title": line[3:]}
                           for i, line in enumerate(text.splitlines(), 1) if line.startswith("## ")]
        if metadata["headings"] != actual_headings:
            raise SystemExit(f'{source["id"]}: stale heading line numbers')
        original = b""
        for part in source["original_parts"]:
            chunk = (root / part["repository_path"]).read_bytes()
            if len(chunk) != part["bytes"] or sha(chunk) != part["sha256"]:
                raise SystemExit(f'{source["id"]}: original part mismatch')
            original += chunk
        if len(original) != source["input_bytes"] or sha(original) != source["input_sha256"]:
            raise SystemExit(f'{source["id"]}: original reconstruction mismatch')
        with ZipFile(io.BytesIO(original)) as archive:
            if archive.testzip() is not None:
                raise SystemExit(f'{source["id"]}: original CRC failed')
            fb2 = archive.read(source["archive_member_name"])
            if len(fb2) != source["fb2_bytes"] or sha(fb2) != source["fb2_sha256"]:
                raise SystemExit(f'{source["id"]}: FB2 member mismatch')
        ready.append((source, data, original))
    work = root / ".tb003-work"
    work.mkdir(exist_ok=True)
    (work / ".gitignore").write_text("*\n", encoding="utf-8")
    target = work / "sources"
    target.mkdir(exist_ok=True)
    index = ["# TB-003: source navigation", "", "Canonical line numbers are in S01/S02/S03.txt.", ""]
    for source, data, original in ready:
        sid = source["id"]
        (target / (sid + ".txt")).write_bytes(data)
        meta = json.loads((episode / source["index_file"]).read_text("utf-8"))
        index.extend(["## " + sid, ""])
        index.extend(f'{h["line"]}: {h["title"]}' for h in meta["headings"])
        index.append("")
        if opts.originals:
            path = work / "originals" / (sid + ".zip")
            path.parent.mkdir(exist_ok=True)
            path.write_bytes(original)
        print(f'{sid}: UTF-8 verified, {source["lines"]} lines; original CRC/SHA verified')
    (target / "INDEX.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    print("Read .tb003-work/sources/INDEX.md, then selected ranges from the canonical TXT files.")
    print("Private books and indexes are excluded from viewer release assets.")


if __name__ == "__main__":
    main()
