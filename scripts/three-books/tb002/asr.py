"""Local speech recognition (faster-whisper) for checking synthesized Russian narration:
numbers, names and negations (G087, G095). Usage: asr.py OUT.json FILE [FILE ...]"""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel


def load(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32)


def main():
    import os
    out, files = sys.argv[1], sys.argv[2:]
    res = json.load(open(out)) if os.path.exists(out) else {}
    todo = [f for f in files if res.get(f, {}).get("bytes") != os.path.getsize(f)]
    if not todo:
        print("nothing new to transcribe")
        return
    model = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=4)  # CI runner: 4 vCPU
    for f in todo:
        segs, _ = model.transcribe(load(f), language="ru", beam_size=5, word_timestamps=True, vad_filter=False,
                                   condition_on_previous_text=False)
        words, text = [], []
        for s in segs:
            text.append(s.text.strip())
            for w in s.words or []:
                words.append([w.word.strip(), round(w.start, 3), round(w.end, 3), round(w.probability, 3)])
        res[f] = {"text": " ".join(text), "words": words, "bytes": os.path.getsize(f)}
        json.dump(res, open(out, "w"), ensure_ascii=False, indent=0)
        print(f, "|", res[f]["text"], flush=True)
    json.dump(res, open(out, "w"), ensure_ascii=False, indent=0)


if __name__ == "__main__":
    main()
