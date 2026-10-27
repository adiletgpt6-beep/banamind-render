"""Full Russian narration via ElevenLabs (one file per screenplay block, cached by hash).

films/nox/voice/blocks/<ID>.mp3 + <ID>.json (character alignment), manifest.json.
Neighbouring blocks are passed as previous_text / next_text for natural intonation (G057)."""
import hashlib
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
import el  # noqa: E402
import script  # noqa: E402

OUT = os.path.join(script.ROOT, "voice", "blocks")
MANIFEST = os.path.join(OUT, "manifest.json")
VOICE = json.load(open(os.path.join(script.ROOT, "voice", "voice_settings.json"), encoding="utf-8"))


def block_hash(b, prev=None, nxt=None):
    # neighbours are sent as context but are not part of the cache key: a block is re-synthesized
    # only when its own text or the voice settings change
    key = json.dumps({"v": 2, "text": b["text"], "voice": VOICE["voice_id"],
                      "model": VOICE["model_id"], "settings": VOICE["settings"], "seed": VOICE["seed"],
                      "fmt": VOICE["output_format"]}, ensure_ascii=False, sort_keys=True)
    return hashlib.sha1(key.encode()).hexdigest()[:16]


def main():
    os.makedirs(OUT, exist_ok=True)
    blocks = script.all_blocks()
    man = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {"blocks": {}}
    only = set(sys.argv[1:])
    made = 0
    for i, b in enumerate(blocks):
        prev = blocks[i - 1]["text"] if i else None
        nxt = blocks[i + 1]["text"] if i + 1 < len(blocks) else None
        h = block_hash(b, prev, nxt)
        mp3 = os.path.join(OUT, f"{b['id']}.mp3")
        old = man["blocks"].get(b["id"])
        if old and os.path.exists(mp3) and b["id"] not in only and (
                old["hash"] == h or (old.get("text") == b["text"] and man.get("voice") == VOICE)):
            old["hash"] = h
            continue
        audio, al = el.tts(VOICE["voice_id"], b["text"], VOICE["model_id"], VOICE["settings"], seed=VOICE["seed"],
                           previous_text=prev, next_text=nxt, output_format=VOICE["output_format"],
                           language_code=VOICE.get("language_code"))
        open(mp3, "wb").write(audio)
        json.dump(al, open(os.path.join(OUT, f"{b['id']}.json"), "w"), ensure_ascii=False)
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                             "-of", "csv=p=0", mp3]).decode())
        st = al["start"]
        en = al["end"]
        man["blocks"][b["id"]] = {"hash": h, "text": b["text"], "duration": round(dur, 3),
                                  "speech_start": round(min(st) if st else 0, 3),
                                  "speech_end": round(max(en) if en else dur, 3)}
        made += 1
        print(f"{b['id']}: {dur:.2f}s", flush=True)
        json.dump(man, open(MANIFEST, "w"), ensure_ascii=False, indent=1)
    man["voice"] = VOICE
    json.dump(man, open(MANIFEST, "w"), ensure_ascii=False, indent=1)
    tot = sum(v["duration"] for v in man["blocks"].values())
    print(f"synthesized {made}, total speech {tot / 60:.1f} min")


if __name__ == "__main__":
    main()
