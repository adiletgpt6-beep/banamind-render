#!/usr/bin/env python3
"""Phoneme-level lip-sync data for IslamicFinanceShort01 / IslamicFinanceHorseV2.

Reads the finished narration (never re-synthesizes it) and the manifest with
line timings, force-aligns every line with PocketSphinx in two passes (words,
then phones) and writes

  public/audio/islamic-finance-01/lipsync.json
    { version, fps, env: [0..1 per video frame], lines: [{ id, words: [{ text,
      start, end, phones: [{ p: "AH", start, end }] }] }] }

Times are absolute seconds in the narration file. Phones are CMU/ARPAbet
symbols (the rig maps them to visemes). Falls back to one vowel phone per
word (from the manifest word timing) when a line cannot be aligned.

  python3 scripts/if01_phones.py [--narration FILE] [--manifest FILE] [--out FILE]
"""
import argparse
import json
import re
import subprocess
import sys

import numpy as np

SR = 16000
FPS = 30
ALIGN_DICT = {
    "riba": "R IY B AA",
    "murabaha": "M UH R AA B AA HH AA",
    "resells": "R IY S EH L Z",
    "financier": "F IH N AE N S IH R",
    "installments": "IH N S T AO L M AH N T S",
}


def norm(w):
    return re.sub(r"[^a-z'\-]", "", w.lower().replace("’", "'")).strip("-")


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "pipe:1"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0


def envelope(pcm):
    per = SR / FPS
    n = int(np.ceil(len(pcm) / per))
    out = []
    for i in range(n):
        a = int(i * per)
        b = min(len(pcm), int((i + 1) * per))
        seg = pcm[a:b]
        rms = float(np.sqrt(np.mean(seg * seg))) if len(seg) else 0.0
        db = 20 * np.log10(rms + 1e-9)
        out.append(round(float(np.clip((db + 45) / 33, 0, 1)), 3))
    return out


def align_line(pcm, line):
    from pocketsphinx import Config, Decoder

    pad0, pad1 = 0.05, 0.12
    a = max(0, int((line["start"] - pad0) * SR))
    b = min(len(pcm), int((line["end"] + pad1) * SR))
    seg = (np.clip(pcm[a:b], -1, 1) * 32767).astype("<i2").tobytes()
    base = a / SR
    dec = Decoder(Config(samprate=SR, loglevel="ERROR"))
    words = [w["text"] for w in line["words"]]
    expanded = []  # (word index, token)
    for i, w in enumerate(words):
        for part in [p for p in norm(w).split("-") if p]:
            expanded.append((i, part))
    for _, tok in expanded:
        if dec.lookup_word(tok) is None:
            if tok in ALIGN_DICT:
                dec.add_word(tok, ALIGN_DICT[tok], True)
            else:
                print(f"  ! {line['id']}: no pronunciation for {tok!r}", file=sys.stderr)
                return None
    dec.set_align_text(" ".join(t for _, t in expanded))
    dec.start_utt()
    dec.process_raw(seg, full_utt=True)
    dec.end_utt()
    dec.set_alignment()
    dec.start_utt()
    dec.process_raw(seg, full_utt=True)
    dec.end_utt()
    al = dec.get_alignment()
    # read everything while iterating: entries must not outlive the iterator
    got = []
    for w in al.words():
        if w.name.startswith("<") or w.name == "(NULL)":
            continue
        got.append((w.name, w.start, w.duration, [(p.name, p.start, p.duration) for p in w]))
    if len(got) != len(expanded):
        print(f"  ! {line['id']}: {len(got)} aligned words for {len(expanded)} tokens", file=sys.stderr)
        return None
    out = [{"text": w, "start": None, "end": None, "phones": []} for w in words]
    for (i, _), (_, start, dur, phones) in zip(expanded, got):
        ws = base + start / 100.0
        we = base + (start + dur) / 100.0
        if out[i]["start"] is None:
            out[i]["start"] = ws
        out[i]["end"] = we
        for name, ps, pd in phones:
            if name in ("SIL", "<sil>", "+SPN+", "+NSN+"):
                continue
            out[i]["phones"].append({"p": name, "start": round(base + ps / 100.0, 3), "end": round(base + (ps + pd) / 100.0, 3)})
    for w in out:
        w["start"] = round(w["start"], 3)
        w["end"] = round(w["end"], 3)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--narration", default="public/audio/islamic-finance-01/narration.mp3")
    ap.add_argument("--manifest", default="public/audio/islamic-finance-01/manifest.json")
    ap.add_argument("--out", default="public/audio/islamic-finance-01/lipsync.json")
    args = ap.parse_args()
    manifest = json.load(open(args.manifest))
    pcm = decode(args.narration)
    lines = []
    for line in manifest["lines"]:
        words = align_line(pcm, line)
        aligner = "pocketsphinx-phones"
        if words is None:
            aligner = "estimate"
            words = [{"text": w["text"], "start": w["start"], "end": w["end"], "phones": [{"p": "AH", "start": w["start"], "end": w["end"]}]} for w in line["words"]]
        n = sum(len(w["phones"]) for w in words)
        print(f"✓ {line['id']}: {len(words)} words, {n} phones ({aligner})")
        lines.append({"id": line["id"], "aligner": aligner, "words": words})
    data = {"version": 1, "fps": FPS, "source": manifest["file"], "durationSec": manifest["durationSec"], "env": envelope(pcm), "lines": lines}
    json.dump(data, open(args.out, "w"), separators=(",", ":"))
    print(f"+ {args.out} ({len(data['env'])} envelope frames)")


if __name__ == "__main__":
    main()
