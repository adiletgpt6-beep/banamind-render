"""TB-003 Russian narration via ElevenLabs: one file per speech block, cached by hash of everything that
changes the sound (text actually sent, voice, model, settings, seed, format).

  python3 voice.py            all speech blocks (cached blocks are not synthesized again)
  python3 voice.py --pilot    the coherent voice pilot only (B001–B003 B029 B042 B045 B062)
  python3 voice.py B012 B013  force re-synthesis of the listed blocks

Writes src/three-books/tb003/voice/blocks/<ID>.mp3 + <ID>.json (character alignment) and manifest.json.
Neighbouring blocks are passed as previous_text / next_text for natural intonation."""
import hashlib
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
import el  # noqa: E402
import script  # noqa: E402

OUT = os.path.join(script.VOICE_DIR, "blocks")
MANIFEST = os.path.join(OUT, "manifest.json")
VOICE = json.load(open(os.path.join(script.VOICE_DIR, "voice_settings.json"), encoding="utf-8"))
PILOT = ["B001", "B002", "B003", "B029", "B042", "B045", "B062"]


def spoken(text):
    """Text sent to TTS: optional pronunciation replacements (exact words only)."""
    for a, b in VOICE.get("say", {}).items():
        text = re.sub(rf"(?<!\w){re.escape(a)}(?!\w)", b, text)
    return text


def block_hash(text):
    key = json.dumps({"v": 1, "text": spoken(text), "voice": VOICE["voice_id"], "model": VOICE["model_id"],
                      "settings": VOICE["settings"], "seed": VOICE["seed"], "fmt": VOICE["output_format"],
                      "lang": VOICE.get("language_code")}, ensure_ascii=False, sort_keys=True)
    return hashlib.sha1(key.encode()).hexdigest()[:16]


def main():
    os.makedirs(OUT, exist_ok=True)
    blocks = script.all_blocks()
    man = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {"blocks": {}}
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = set(args)
    want = set(PILOT) if "--pilot" in sys.argv else ({b["id"] for b in blocks} if not args else force)
    made = 0
    for i, b in enumerate(blocks):
        if b["id"] not in want:
            continue
        prev = spoken(blocks[i - 1]["text"]) if i else None
        nxt = spoken(blocks[i + 1]["text"]) if i + 1 < len(blocks) else None
        h = block_hash(b["text"])
        mp3 = os.path.join(OUT, f"{b['id']}.mp3")
        old = man["blocks"].get(b["id"])
        if old and old.get("hash") == h and os.path.exists(mp3) and b["id"] not in force:
            continue
        audio, al = el.tts(VOICE["voice_id"], spoken(b["text"]), VOICE["model_id"], VOICE["settings"],
                           seed=VOICE["seed"], previous_text=prev, next_text=nxt,
                           output_format=VOICE["output_format"], language_code=VOICE.get("language_code"))
        open(mp3, "wb").write(audio)
        json.dump(al, open(os.path.join(OUT, f"{b['id']}.json"), "w"), ensure_ascii=False)
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                             "-of", "csv=p=0", mp3]).decode())
        st, en = al["start"], al["end"]
        man["blocks"][b["id"]] = {"hash": h, "text": b["text"], "spoken": spoken(b["text"]), "duration": round(dur, 3),
                                  "speech_start": round(min(st) if st else 0, 3),
                                  "speech_end": round(max(en) if en else dur, 3)}
        made += 1
        print(f"{b['id']}: {dur:.2f}s", flush=True)
        json.dump(man, open(MANIFEST, "w"), ensure_ascii=False, indent=1)
    man["voice"] = {k: VOICE[k] for k in ("name", "voice_id", "model_id", "language_code", "seed", "output_format",
                                          "settings")}
    json.dump(man, open(MANIFEST, "w"), ensure_ascii=False, indent=1)
    have = [v for v in man["blocks"].values()]
    tot = sum(v["speech_end"] - v["speech_start"] for v in have)
    words = sum(len(v["text"].split()) for v in have)
    print(f"synthesized {made}; blocks in manifest {len(have)}; active speech {tot / 60:.2f} min; "
          f"{words / max(tot, 1) * 60:.1f} words/min")


if __name__ == "__main__":
    main()
