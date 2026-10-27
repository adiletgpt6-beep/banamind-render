#!/usr/bin/env python3
"""Local draft narration for IslamicFinanceShort01 (Kokoro-82M via kokoro-onnx).

Used by scripts/generate-if01-voice.mjs when no premium TTS provider is
configured. For every narration line it synthesizes a WAV (24 kHz mono) and
force-aligns the written words to the audio with PocketSphinx, so captions can
follow the actual speech word by word.

  python3 scripts/if01_tts.py --lines lines.json --out DIR --model kokoro-v1.0.onnx \
      --voices voices-v1.0.bin [--voice am_michael] [--speed 1.0]

Input lines.json: [{"id": "l1", "text": "..."}, ...]
Output DIR/<id>.wav and DIR/<id>.json: {"durationSec", "speechStart", "speechEnd",
"words": [{"text", "start", "end"}], "aligner": "pocketsphinx" | "estimate"}
"""
import argparse
import json
import os
import re
import sys

import numpy as np
import soundfile as sf

# Pronunciations the phonemizer gets wrong (Kokoro / misaki IPA set).
PHONEME_OVERRIDES = {
    "riba": "ɹˈiːbɑ",            # REE-bah
    "murabaha": "mʊɹˈɑːbɑhɑ",   # moo-RAH-bah-hah
}
# CMU-style pronunciations for words missing from the PocketSphinx dictionary.
ALIGN_DICT = {
    "riba": "R IY B AA",
    "murabaha": "M UH R AA B AA HH AA",
    "resells": "R IY S EH L Z",
    "financier": "F IH N AE N S IH R",
    "installments": "IH N S T AO L M AH N T S",
}

SR = 24000


def norm_word(w: str) -> str:
    """Lowercase word without punctuation; inner hyphens are kept (twenty-two)."""
    return re.sub(r"[^a-z'\-]", "", w.lower().replace("’", "'")).strip("-")


def phonemize_line(tokenizer, text: str) -> str:
    """Phonemize word groups separately so overrides can be applied per word."""
    out = []
    for token in re.findall(r"\S+", text):
        core = norm_word(token)
        if core.replace("-", "") in PHONEME_OVERRIDES:
            core = core.replace("-", "")
            trail = re.sub(r"^[^\W]*", "", token.rstrip("—"))  # punctuation after the word
            trail = re.sub(r"[^,.;:!?]", "", trail)
            out.append(PHONEME_OVERRIDES[core] + trail)
        else:
            out.append(None)
    # phonemize whole text for natural prosody, then substitute overridden words
    full = tokenizer.phonemize(text, lang="en-us")
    for token, override in zip(re.findall(r"\S+", text), out):
        if override is None:
            continue
        word_ph = tokenizer.phonemize(norm_word(token), lang="en-us")
        if word_ph and word_ph in full:
            full = full.replace(word_ph, PHONEME_OVERRIDES[norm_word(token)], 1)
        else:
            print(f"  ! could not substitute phonemes for {token!r} ({word_ph!r})", file=sys.stderr)
    return full


def trim(audio: np.ndarray, thr_db=-45.0, pad=0.06):
    thr = 10 ** (thr_db / 20)
    idx = np.where(np.abs(audio) > thr)[0]
    if len(idx) == 0:
        return audio, 0.0
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(audio), idx[-1] + int(pad * SR))
    return audio[a:b], a / SR


def speech_bounds(audio: np.ndarray, thr_db=-40.0):
    thr = 10 ** (thr_db / 20)
    idx = np.where(np.abs(audio) > thr)[0]
    if len(idx) == 0:
        return 0.0, len(audio) / SR
    return idx[0] / SR, idx[-1] / SR


def align(audio: np.ndarray, words):
    """Force-align words (list of str) with PocketSphinx; returns [(start,end)] or None."""
    try:
        from pocketsphinx import Config, Decoder
    except Exception as e:  # pragma: no cover
        print(f"  ! pocketsphinx unavailable: {e}", file=sys.stderr)
        return None
    # resample 24k -> 16k
    n16 = int(len(audio) * 16000 / SR)
    x16 = np.interp(np.linspace(0, len(audio) - 1, n16), np.arange(len(audio)), audio)
    pcm = (np.clip(x16, -1, 1) * 32767).astype("<i2").tobytes()
    cfg = Config(samprate=16000, loglevel="ERROR")
    dec = Decoder(cfg)
    # hyphenated words become several dictionary words
    expanded = []  # (orig_index, token)
    for i, w in enumerate(words):
        parts = [p for p in w.split("-") if p]
        for p in parts:
            expanded.append((i, p))
    for _, tok in expanded:
        if dec.lookup_word(tok) is None:
            if tok in ALIGN_DICT:
                dec.add_word(tok, ALIGN_DICT[tok], True)
            else:
                print(f"  ! no pronunciation for {tok!r}; estimating timings", file=sys.stderr)
                return None
    dec.set_align_text(" ".join(t for _, t in expanded))
    dec.start_utt()
    dec.process_raw(pcm, full_utt=True)
    dec.end_utt()
    segs = [(s.word, s.start_frame / 100.0, (s.end_frame + 1) / 100.0) for s in dec.seg()]
    segs = [s for s in segs if not s[0].startswith("<") and not s[0].startswith("[") and s[0] != "(NULL)"]
    if len(segs) != len(expanded):
        print(f"  ! alignment returned {len(segs)} segments for {len(expanded)} words", file=sys.stderr)
        return None
    out = [[None, None] for _ in words]
    for (i, _), (_, a, b) in zip(expanded, segs):
        if out[i][0] is None:
            out[i][0] = a
        out[i][1] = b
    return [(a, b) for a, b in out]


def estimate(words, start, end):
    weights = [max(1, len(norm_word(w)) + 1.5) for w in words]
    total = sum(weights)
    t = start
    out = []
    for w in weights:
        d = (end - start) * w / total
        out.append((t, t + d))
        t += d
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lines", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", required=True)
    ap.add_argument("--voices", required=True)
    ap.add_argument("--voice", default="am_michael")
    ap.add_argument("--speed", type=float, default=1.0)
    args = ap.parse_args()

    from kokoro_onnx import Kokoro
    from kokoro_onnx.tokenizer import Tokenizer

    os.makedirs(args.out, exist_ok=True)
    tokenizer = Tokenizer()
    kokoro = Kokoro(args.model, args.voices)
    lines = json.load(open(args.lines))
    for line in lines:
        text = line["text"]
        phonemes = phonemize_line(tokenizer, text)
        audio, sr = kokoro.create(phonemes, voice=args.voice, speed=args.speed, lang="en-us", is_phonemes=True)
        assert sr == SR
        audio = np.asarray(audio, dtype=np.float32)
        audio, _ = trim(audio)
        words = [w for w in re.findall(r"\S+", text) if norm_word(w)]
        clean = [norm_word(w) for w in words]
        spans = align(audio, clean)
        aligner = "pocketsphinx"
        s0, s1 = speech_bounds(audio)
        if spans is None:
            spans = estimate(clean, s0, s1)
            aligner = "estimate"
        else:
            # sanity: monotonic and inside the clip
            ok = all(a <= b for a, b in spans) and all(spans[i][1] <= spans[i + 1][0] + 0.05 for i in range(len(spans) - 1))
            if not ok or spans[-1][1] > len(audio) / SR + 0.1:
                spans = estimate(clean, s0, s1)
                aligner = "estimate"
        sf.write(os.path.join(args.out, f"{line['id']}.wav"), audio, SR)
        info = {
            "id": line["id"],
            "text": text,
            "phonemes": phonemes,
            "voice": args.voice,
            "speed": args.speed,
            "durationSec": round(len(audio) / SR, 3),
            "speechStart": round(s0, 3),
            "speechEnd": round(s1, 3),
            "aligner": aligner,
            "words": [{"text": w, "start": round(a, 3), "end": round(b, 3)} for w, (a, b) in zip(words, spans)],
        }
        json.dump(info, open(os.path.join(args.out, f"{line['id']}.json"), "w"), indent=2, ensure_ascii=False)
        print(f"✓ {line['id']}: {info['durationSec']:.2f}s, {aligner}: " + " ".join(f"{w['text']}@{w['start']:.2f}" for w in info["words"]))


if __name__ == "__main__":
    main()
