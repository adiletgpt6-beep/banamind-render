"""Voice casting pilot (G052–G055): same Russian test text for several available
ElevenLabs voices; Scribe transcript + median F0 + speech rate per candidate.
Output: films/nox/voice/pilot/<name>.mp3 and pilot.json."""
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import el  # noqa: E402

OUT = "films/nox/voice/pilot"
TEXT = ("Это восемьсот огоньков. Месяц работы Нокса. К последнему вечеру не остаётся ни одного. "
        "Если эту вещь никто не увидит, Нокс всё ещё её захочет? "
        "Триста минус сто восемьдесят — остаётся сто двадцать. "
        "Цель помогает двигаться. А чувство достаточности напоминает, ради какой жизни всё это затевалось.")
PREMADE = {  # premade male voices to try if present in the account
    "Eric": "cjVigY5qzO86Huf0OWal", "George": "JBFqnCBsd6RMkjVDRZzb", "Brian": "nPczCjzI2devNBz1zQrb",
    "Daniel": "onwK4e9ZLuTAKqWW03F9", "Bill": "pqHfZKP75CvOlQylNhV4", "Chris": "iP95p4xoKVk53GoZ742B",
    "Roger": "CwhRBWXzGAHq8TQ4Fs17", "Will": "bIHbv24MWmeRgasZH58o", "Liam": "TX3LPaxmHKxFdv7VOQHJ",
    "Callum": "N2lVS1w4EtoT3dr4eOWO",
}
SETTINGS = {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True, "speed": 0.92}


def f0_median(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    fr, hop, f0s = 640, 160, []
    for i in range(0, len(x) - fr, hop):
        seg = x[i:i + fr] - x[i:i + fr].mean()
        if np.sqrt((seg ** 2).mean()) < 0.02:
            continue
        ac = np.correlate(seg, seg, "full")[fr - 1:]
        lo, hi = 16000 // 300, 16000 // 60
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.45 * ac[0]:
            f0s.append(16000 / lag)
    return round(float(np.median(f0s)), 1) if f0s else None


def main():
    os.makedirs(OUT, exist_ok=True)
    info = {}
    try:
        sub = el.get_json("/v1/user/subscription")
        info["subscription"] = {k: sub.get(k) for k in ("tier", "character_count", "character_limit",
                                                         "next_character_count_reset_unix")}
    except Exception as e:  # noqa: BLE001
        info["subscription_error"] = str(e)
    try:
        voices = el.get_json("/v1/voices").get("voices", [])
    except Exception as e:  # noqa: BLE001  (key may lack voices_read)
        info["voices_error"] = str(e)
        voices = [{"name": n, "voice_id": i, "category": "premade"} for n, i in PREMADE.items()]
    info["account_voices"] = [{"name": v["name"], "id": v["voice_id"], "category": v.get("category"),
                               "labels": v.get("labels")} for v in voices]
    have = {v["voice_id"] for v in voices}
    cands = [(n, i) for n, i in PREMADE.items() if i in have]
    for v in voices:  # account voices labelled Russian / male narration
        lab = v.get("labels") or {}
        if v.get("category") != "premade" and (lab.get("language") in ("ru", "russian") or
                                                "ru" in str(lab.get("accent", "")).lower()):
            cands.append((v["name"], v["voice_id"]))
    print("candidates:", cands, flush=True)
    res = []
    for name, vid in cands[:12]:
        safe = "".join(c if c.isalnum() else "_" for c in name)[:24]
        path = f"{OUT}/{safe}.mp3"
        try:
            audio, _ = el.tts(vid, TEXT, "eleven_multilingual_v2", SETTINGS, seed=7, language_code="ru")
        except Exception as e:  # noqa: BLE001
            res.append({"name": name, "id": vid, "error": str(e)})
            continue
        open(path, "wb").write(audio)
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                             "-of", "csv=p=0", path]).decode())
        try:
            tr = el.stt(path).get("text", "")
        except Exception as e:  # noqa: BLE001
            tr = f"STT error {e}"
        r = {"name": name, "id": vid, "file": path, "duration": round(dur, 2), "f0_median_hz": f0_median(path),
             "words_per_min": round(len(TEXT.split()) / dur * 60, 1), "transcript": tr}
        print(json.dumps(r, ensure_ascii=False), flush=True)
        res.append(r)
    info["text"] = TEXT
    info["settings"] = SETTINGS
    info["results"] = res
    json.dump(info, open(f"{OUT}/pilot.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
