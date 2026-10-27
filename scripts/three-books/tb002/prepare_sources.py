#!/usr/bin/env python3
"""Verify the three private inputs and unpack them outside public/release paths."""
import gzip
import hashlib
import json
from pathlib import Path


def main():
    root = Path(__file__).resolve().parents[3]
    episode = root / "three-books/episodes/TB-002"
    manifest = json.loads((episode / "SOURCE_MANIFEST.json").read_text("utf-8"))
    sources = manifest["sources"]
    if len(sources) != 3:
        raise SystemExit("Expected exactly three private sources")
    verified = []
    for source in sources:
        packed = (root / source["repository_path"]).read_bytes()
        if hashlib.sha256(packed).hexdigest() != source["archive_sha256"]:
            raise SystemExit(f"Archive checksum mismatch: {source['id']}")
        data = gzip.decompress(packed)
        if len(data) != source["bytes"] or hashlib.sha256(data).hexdigest() != source["sha256"]:
            raise SystemExit(f"Source checksum mismatch: {source['id']}")
        text = data.decode("utf-8")
        if len(text.splitlines()) != source["lines"]:
            raise SystemExit(f"Line count mismatch: {source['id']}")
        verified.append((source["id"], data))
    work = root / ".tb002-work"
    work.mkdir(parents=True, exist_ok=True)
    (work / ".gitignore").write_text("*\n", encoding="utf-8")
    target = work / "sources"
    target.mkdir(parents=True, exist_ok=True)
    for source_id, data in verified:
        (target / (source_id + ".txt")).write_bytes(data)
        print(f"{source_id}: verified UTF-8, {len(data)} bytes -> .tb002-work/sources/{source_id}.txt")
    print("Three private inputs are ready. Do not copy these files to public or release assets.")


if __name__ == "__main__":
    main()
