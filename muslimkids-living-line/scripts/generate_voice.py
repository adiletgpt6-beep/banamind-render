"""Offline Russian narration for MUSLIM KIDS episodes (AudioSyncSystem input).

Synthesises every line of src/episodes/<ep>/narration.json with a Piper VITS
voice through sherpa-onnx, masters it with FFmpeg (48 kHz, gentle warmth EQ,
-16 LUFS / -1.5 dBTP) and writes public/audio/<ep>/voice/manifest.json with
the exact duration of every line. Remotion reads that manifest to place
the lines and to stretch scene timing when a line is longer than planned.

Optional: --verify runs an offline Russian ASR model (GigaAM via sherpa-onnx)
over each line and prints the recognised text — a quick pronunciation check.

Usage:
  python scripts/generate_voice.py --models /path/to/models [--verify]

Models (GitHub releases of k2-fsa/sherpa-onnx):
  tts-models/vits-piper-ru_RU-dmitri-medium.tar.bz2
  asr-models/sherpa-onnx-nemo-transducer-giga-am-v2-russian-2025-04-19.tar.bz2
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import sherpa_onnx
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def build_tts(models: str, model: str) -> sherpa_onnx.OfflineTts:
    d = os.path.join(models, f"vits-piper-{model}")
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=os.path.join(d, f"{model}.onnx"),
                tokens=os.path.join(d, "tokens.txt"),
                data_dir=os.path.join(d, "espeak-ng-data"),
                noise_scale=0.6,
                noise_scale_w=0.75,
            ),
            num_threads=4,
        ),
        max_num_sentences=1,
    )
    return sherpa_onnx.OfflineTts(cfg)


def build_asr(models: str):
    d = os.path.join(models, "sherpa-onnx-nemo-transducer-giga-am-v2-russian-2025-04-19")
    if not os.path.isdir(d):
        return None
    return sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=os.path.join(d, "encoder.int8.onnx"),
        decoder=os.path.join(d, "decoder.onnx"),
        joiner=os.path.join(d, "joiner.onnx"),
        tokens=os.path.join(d, "tokens.txt"),
        model_type="nemo_transducer",
        num_threads=4,
    )


def split_sentences(text: str) -> list[str]:
    """Splits on . ? ! and on an explicit pause marker "|" (used in ttsText)."""
    out, cur = [], ""
    for ch in text:
        if ch == "|":
            out.append(cur.strip())
            cur = ""
            continue
        cur += ch
        if ch in ".?!":
            out.append(cur.strip())
            cur = ""
    if cur.strip(" »«"):
        out.append(cur.strip())
    # Merge trailing quote marks into the previous sentence.
    merged: list[str] = []
    for s in out:
        if merged and s.strip("»«. ") == "":
            merged[-1] += s
        else:
            merged.append(s)
    return merged


def speak(tts, text: str, length_scale: float, gap: float) -> tuple[np.ndarray, int, list]:
    """Returns samples, sample rate and [start, end] seconds of every sentence."""
    chunks, marks, cursor = [], [], 0
    sr = tts.sample_rate
    for i, sentence in enumerate(split_sentences(text)):
        audio = tts.generate(sentence.replace("«", "").replace("»", ""), sid=0, speed=1.0 / length_scale)
        samples = np.array(audio.samples, dtype=np.float32)
        # Trim synthesis silence so pauses are controlled by `gap` only.
        idx = np.where(np.abs(samples) > 0.012)[0]
        if len(idx):
            samples = samples[max(0, idx[0] - 200): idx[-1] + int(0.06 * sr)]
        if i:
            chunks.append(np.zeros(int(gap * sr), dtype=np.float32))
            cursor += int(gap * sr)
        marks.append([round(cursor / sr, 3), round((cursor + len(samples)) / sr, 3)])
        cursor += len(samples)
        chunks.append(samples)
    return np.concatenate(chunks), sr, marks


def master(src: str, dst: str) -> None:
    af = ",".join([
        "aresample=48000",
        "highpass=f=70",
        "equalizer=f=180:t=q:w=1.0:g=2.0",   # warmth
        "equalizer=f=3200:t=q:w=1.2:g=1.5",  # presence / clarity
        "deesser=i=0.35",
        "acompressor=threshold=-20dB:ratio=2.2:attack=8:release=120:makeup=2",
        "loudnorm=I=-16:TP=-1.5:LRA=7",
        "aresample=48000",
        "afade=t=in:d=0.015",
        "areverse,afade=t=in:d=0.04,areverse",
    ])
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ac", "1", "-c:a", "pcm_s16le", dst],
        check=True,
    )


def duration(path: str) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        check=True, capture_output=True, text=True,
    )
    return float(out.stdout.strip())


def recognise(asr, path: str) -> str:
    data, sr = sf.read(path, dtype="float32")
    stream = asr.create_stream()
    stream.accept_waveform(sr, data)
    asr.decode_stream(stream)
    return stream.result.text


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="ep001")
    ap.add_argument("--models", required=True)
    ap.add_argument("--verify", action="store_true")
    args = ap.parse_args()

    spec_path = os.path.join(ROOT, "src", "episodes", args.episode, "narration.json")
    spec = json.load(open(spec_path, encoding="utf-8"))
    voice = spec["voice"]
    out_dir = os.path.join(ROOT, "public", "audio", args.episode, "voice")
    os.makedirs(out_dir, exist_ok=True)

    tts = build_tts(args.models, voice["model"])
    asr = build_asr(args.models) if args.verify else None

    manifest = {"episode": spec["episode"], "voice": voice, "lines": []}
    with tempfile.TemporaryDirectory() as tmp:
        for line in spec["lines"]:
            samples, sr, marks = speak(tts, line.get("ttsText", line["text"]), voice["lengthScale"], voice["sentenceSilenceSec"])
            raw = os.path.join(tmp, f"{line['id']}.wav")
            sf.write(raw, samples, sr)
            name = f"{line['id']}.wav"
            master(raw, os.path.join(out_dir, name))
            dur = duration(os.path.join(out_dir, name))
            entry = {"id": line["id"], "scene": line["scene"], "file": f"audio/{args.episode}/voice/{name}",
                     "durationSec": round(dur, 3), "text": line["text"], "sentences": marks}
            if asr:
                entry["asr"] = recognise(asr, os.path.join(out_dir, name))
            manifest["lines"].append(entry)
            print(f"{line['id']}: {dur:5.2f}s  {line['text']}")
            if asr:
                print(f"      ASR: {entry['asr']}")

    with open(os.path.join(out_dir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    total = sum(l["durationSec"] for l in manifest["lines"])
    print(f"Total speech: {total:.2f}s", file=sys.stderr)


if __name__ == "__main__":
    main()
