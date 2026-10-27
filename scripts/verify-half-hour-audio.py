"""Check actual final AAC against each cached dialogue waveform; not pronunciation."""
import array
import json
import math
import subprocess
import sys
from pathlib import Path

RATE = 48000

def decode(path):
    channels = int(json.loads(subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels",
         "-of", "json", str(path)], check=True, capture_output=True, text=True
    ).stdout)["streams"][0]["channels"])
    assert channels in (1, 2), (path, channels)
    # Preserve each source channel. FFmpeg's automatic -ac 1 downmix can add
    # 3 dB to centred stereo speech and falsely report a clipped source.
    raw = subprocess.run(["ffmpeg", "-v", "error", "-xerror", "-i", str(path), "-vn", "-map", "0:a:0",
                          "-ar", str(RATE), "-f", "f32le", "pipe:1"],
                         check=True, capture_output=True).stdout
    samples = array.array("f")
    samples.frombytes(raw)
    assert len(samples) % channels == 0
    source_peak = max(abs(x) for x in samples)
    decoded_seconds = len(samples) / channels / RATE
    mono = samples if channels == 1 else array.array(
        "f", ((samples[i] + samples[i+1]) * 0.5 for i in range(0, len(samples), 2))
    )
    return mono, source_peak, decoded_seconds, channels

film, sample_peak, decoded_seconds, channels = decode(sys.argv[1])
assert len(film) >= 120 * RATE - 1024
print("HH_AUDIO_PCM " + json.dumps({"sample_peak": sample_peak, "decoded_seconds": decoded_seconds,
                                   "source_channels": channels}), file=sys.stderr, flush=True)
assert sample_peak < 0.995, ("Clipped original audio channel", sample_peak)
timing_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("pieces/audio-timing.json")
lines = json.loads(timing_path.read_text())
assert len(lines) == 15
previous_end = 0
checks = []

def correlation(reference, at, indices):
    dot = sum(reference[i] * film[at+i] for i in indices)
    a = sum(reference[i] ** 2 for i in indices)
    b = sum(film[at+i] ** 2 for i in indices)
    return dot / math.sqrt(a * b) if a and b else 0

for line in lines:
    base = round(line["startSec"] * 30) * RATE // 30
    ref, _, _, _ = decode(Path("public/audio/half-hour") / line["file"])
    assert base / RATE >= previous_end - 1 / RATE, line["id"]
    previous_end = base / RATE + len(ref) / RATE
    assert previous_end < 114, line["id"]
    peak = max(abs(x) for x in ref)
    active = [i for i, x in enumerate(ref) if abs(x) > peak * 0.02]
    count = min(2048, len(active))
    assert count > 100, line["id"]
    indices = [active[round(k * (len(active)-1) / (count-1))] for k in range(count)]
    coarse = max(range(-2400, 2401, 48), key=lambda lag: correlation(ref, base+lag, indices))
    lag = max(range(coarse-48, coarse+49), key=lambda d: correlation(ref, base+d, indices))
    score = correlation(ref, base+lag, indices)
    tail_active = [i for i in active if i >= active[-1] - RATE // 4]
    tail = tail_active[::max(1, len(tail_active)//1024)]
    tail_score = correlation(ref, base+lag, tail)
    print("HH_AUDIO_CHECK " + json.dumps({"id": line["id"], "correlation": score, "tail_correlation": tail_score, "alignment_shift_ms": lag/RATE*1000}), file=sys.stderr, flush=True)
    assert score >= 0.80, (line["id"], score, lag)
    assert tail_score >= 0.60, ("Missing dialogue tail", line["id"], tail_score)
    checks.append({"id": line["id"], "start_sec": base/RATE, "waveform_correlation": score,
                   "tail_correlation": tail_score, "alignment_shift_ms": lag/RATE*1000,
                   "speech_end_sec": line["speechToSec"], "file_end_sec": previous_end})
print(json.dumps({"lines": checks, "sample_peak": sample_peak, "decoded_seconds": decoded_seconds, "source_channels": channels, "clipping_check_passed": True, "last_speech_end_sec": max(l["speechToSec"] for l in lines),
                  "method": "Source-channel PCM peak check; equal-weight mono waveform correlation at 48 kHz against all 15 original MP3s, including tails",
                  "pronunciation_confirmed_by_listening": False}, indent=2))
