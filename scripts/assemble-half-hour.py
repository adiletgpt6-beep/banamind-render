"""Assemble silent frame-accurate pieces with one continuous audio master."""
import json
import hashlib
import base64
import math
import os
import re
import subprocess
from pathlib import Path

def run(args):
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode:
        print(result.stdout, flush=True)
        print(result.stderr, flush=True)
        raise subprocess.CalledProcessError(result.returncode, args, output=result.stdout, stderr=result.stderr)
    return result

pieces = Path("pieces")
out = Path("out")
out.mkdir(exist_ok=True)
parts = [pieces / f"part-{i}.mp4" for i in range(8)]
provenance = [json.loads((pieces / f"part-{i}.provenance.json").read_text()) for i in range(8)]
audio_provenance = json.loads((pieces / "audio.provenance.json").read_text())
commits = {p["commit"] for p in [*provenance, audio_provenance]}
assert len(commits) == 1, ("Mixed render commits", commits)
expected_render_commit = os.environ.get("HH_RENDER_COMMIT") or os.environ.get("GITHUB_SHA")
if expected_render_commit:
    assert commits == {expected_render_commit}, ("Stale render commit", commits, expected_render_commit)
for i, p in enumerate(provenance):
    assert p["frameRange"] == [i * 450, (i + 1) * 450 - 1], p
    assert p["inputProps"]["visualOnly"] is True, p
    assert p["inputProps"]["renderScale"] == 1, p
assert audio_provenance["inputProps"]["audioOnly"] is True
for part in parts:
    info = json.loads(run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
                          "-show_entries", "stream=nb_read_frames,width,height,r_frame_rate", "-of", "json", str(part)]).stdout)["streams"][0]
    assert info["nb_read_frames"] == "450", (part, info)
    assert (info["width"], info["height"], info["r_frame_rate"]) == (1080, 1920, "30/1"), info
concat = out / "parts.txt"
concat.write_text("".join(f"file '{p.resolve()}'\n" for p in parts))
audio = pieces / "half-hour-master.wav"
stats = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(audio), "-af",
             "loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr
levels = json.loads(re.search(r'\{\s*"input_i".*?\}', stats, re.S)[0])
integrated, peak = float(levels["input_i"]), float(levels["input_tp"])
assert math.isfinite(integrated) and math.isfinite(peak)
# A constant gain preserves the intended quiet pauses and music ducking.
gain = min(-18 - integrated, -2.5 - peak)
movie = out / "BalaGo_10_3D.mp4"
mobile = out / "BalaGo_10_3D_mobile.mp4"

def measure_audio(path):
    log = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-vn", "-af",
               "loudnorm=I=-18:TP=-2:LRA=11:print_format=json", "-f", "null", "-"]).stderr
    result = json.loads(re.search(r'\{\s*"input_i".*?\}', log, re.S)[0])
    assert math.isfinite(float(result["input_tp"])) and math.isfinite(float(result["input_i"]))
    return result

def encode_full(current_gain):
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-i", str(audio),
         "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-af", f"volume={10 ** (current_gain / 20):.10f}",
         "-c:a", "aac", "-b:a", "192k", "-t", "120", "-movflags", "+faststart", str(movie)])

full_attempts = []
print("HH_MASTER_LEVELS " + json.dumps({"input": levels, "initial_gain_db": gain}), flush=True)
for attempt in range(3):
    encode_full(gain)
    actual = measure_audio(movie)
    full_attempts.append({"gain_db": gain, "levels": actual})
    print("HH_ENCODED_LEVELS " + json.dumps({"file": movie.name, "attempt": attempt, "gain_db": gain, "levels": actual}), flush=True)
    encoded_peak = float(actual["input_tp"])
    if encoded_peak <= -2.0:
        break
    gain += -2.2 - encoded_peak
else:
    raise AssertionError(("AAC full peak correction failed", full_attempts))

# Encode the phone's sound directly from the original WAV, avoiding a second AAC generation.
mobile_gain = gain
run(["ffmpeg", "-v", "error", "-y", "-i", str(movie), "-i", str(audio), "-map", "0:v:0", "-map", "1:a:0",
     "-vf", "scale=540:960", "-c:v", "libx264", "-crf", "26", "-preset", "medium",
     "-af", f"volume={10 ** (mobile_gain / 20):.10f}", "-c:a", "aac", "-b:a", "128k",
     "-t", "120", "-movflags", "+faststart", str(mobile)])
mobile_attempts = []
for attempt in range(3):
    actual = measure_audio(mobile)
    mobile_attempts.append({"gain_db": mobile_gain, "levels": actual})
    print("HH_ENCODED_LEVELS " + json.dumps({"file": mobile.name, "attempt": attempt, "gain_db": mobile_gain, "levels": actual}), flush=True)
    encoded_peak = float(actual["input_tp"])
    if encoded_peak <= -2.0:
        break
    mobile_gain += -2.2 - encoded_peak
    corrected = out / "mobile-corrected.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", str(mobile), "-i", str(audio), "-map", "0:v:0", "-map", "1:a:0",
         "-c:v", "copy", "-af", f"volume={10 ** (mobile_gain / 20):.10f}", "-c:a", "aac", "-b:a", "128k",
         "-t", "120", "-movflags", "+faststart", str(corrected)])
    corrected.replace(mobile)
else:
    raise AssertionError(("AAC phone peak correction failed", mobile_attempts))

def validate_video(path, size):
    run(["ffmpeg", "-v", "error", "-xerror", "-i", str(path), "-f", "null", "-"])
    info = json.loads(run(["ffprobe", "-v", "error", "-count_frames", "-show_entries",
                          "stream=codec_name,pix_fmt,width,height,r_frame_rate,nb_read_frames:format=duration", "-of", "json", str(path)]).stdout)
    assert float(info["format"]["duration"]) == 120.0, info
    v, a = info["streams"]
    assert (v["codec_name"], v["pix_fmt"], v["width"], v["height"], v["r_frame_rate"], v["nb_read_frames"]) == ("h264", "yuv420p", *size, "30/1", "3600"), info
    assert a["codec_name"] == "aac", info
    black_log = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-an", "-vf",
                     "blackdetect=d=0.001:pix_th=0.1:pic_th=0.98", "-f", "null", "-"]).stderr
    black_segments = re.findall(r"black_start:[^\n]+", black_log)
    assert not black_segments, (path, black_segments)
    return info

info = validate_video(movie, (1080, 1920))
mobile_info = validate_video(out / "BalaGo_10_3D_mobile.mp4", (540, 960))
print("Both new MP4s decode fully with 3600 frames and no black frames", flush=True)
dialogue_checks = json.loads(run(["python3", "scripts/verify-half-hour-audio.py", str(movie)]).stdout)
mobile_dialogue_checks = json.loads(run(["python3", "scripts/verify-half-hour-audio.py", str(mobile)]).stdout)
final_audio_log = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(movie), "-vn", "-af",
                       "loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr
final_audio = json.loads(re.search(r'\{\s*"input_i".*?\}', final_audio_log, re.S)[0])
assert float(final_audio["input_tp"]) < -0.8, final_audio
mobile_audio_log = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(out / "BalaGo_10_3D_mobile.mp4"), "-vn", "-af",
                        "loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr
mobile_audio = json.loads(re.search(r'\{\s*"input_i".*?\}', mobile_audio_log, re.S)[0])
assert float(mobile_audio["input_tp"]) < -0.8, mobile_audio
levels.update({"master_gain_db": gain, "final_integrated_expected": integrated + gain, "final_peak_expected": peak + gain})
(out / "validation.json").write_text(json.dumps({"video": info, "mobile": mobile_info, "audio": levels, "final_audio": final_audio, "mobile_audio": mobile_audio, "dialogue_checks": dialogue_checks, "mobile_dialogue_checks": mobile_dialogue_checks, "aac_peak_adjustments": {"full": full_attempts, "mobile": mobile_attempts},
                                                "sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in [movie, out / "BalaGo_10_3D_mobile.mp4"]},
                                                "provenance": provenance, "audio_provenance": audio_provenance, "assembly_commit": os.environ.get("GITHUB_SHA"), "render_commit": expected_render_commit}, indent=2))
print(json.dumps({"video": info, "audio": levels}, indent=2))
# A dense contact sheet review of every half-second of the completed film.
for half in range(2):
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(half * 60), "-i", str(movie), "-t", "60", "-vf",
         "fps=2,scale=108:192,tile=12x10:padding=2:margin=2", "-frames:v", "1", str(out / f"overview-{half}.jpg")])
# Individual files keep downloads below the client's 32 MiB limit.
chunk_dir = out / "full-parts"
chunk_dir.mkdir(exist_ok=True)
with movie.open("rb") as f:
    i = 0
    while chunk := f.read(28 * 1024 * 1024):
        (chunk_dir / f"full-{i:02}.bin").write_bytes(chunk)
        i += 1

# Native final overview images are also available through the authenticated job log.
for block in range(12):
    path = out / f"timeline-{block:02}.jpg"
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(block * 10), "-i", str(movie), "-t", "10", "-vf",
         f"fps=2,scale=180:320,drawtext=fontfile=public/fonts/Nunito-Variable.ttf:text='{block*10}s+':fontcolor=white:fontsize=12:box=1:boxcolor=black@0.6:x=4:y=4,tile=4x5:padding=2:margin=2",
         "-frames:v", "1", "-q:v", "3", str(path)])
    print("HH_FINAL_IMAGE " + json.dumps({"caption": f"Final native timeline {block*10}–{(block+1)*10}s, 2 fps chronological",
                                         "image": base64.b64encode(path.read_bytes()).decode()}), flush=True)

# Exact adjacent frames at all seven part joins, plus the first CTA and last frame.
seam_frames = sorted([f for part in range(1, 8) for f in [part * 450 - 1, part * 450]] + [3420, 3599])
seam_path = out / "final-seams.jpg"
selector = "+".join(f"eq(n,{f})" for f in seam_frames)
run(["ffmpeg", "-v", "error", "-y", "-i", str(movie), "-vf",
     f"select='{selector}',scale=240:426,tile=4x4:padding=2:margin=2", "-frames:v", "1", "-q:v", "3", str(seam_path)])
print("HH_FINAL_IMAGE " + json.dumps({"caption": "Exact native join frames, chronological: " + ", ".join(f"{f / 30:.3f}s" for f in seam_frames),
                                     "image": base64.b64encode(seam_path.read_bytes()).decode()}), flush=True)
# Full-width portraits keep the form and end card readable in the log review.
closing_frames = [3330, 3396, 3420, 3599]
closing_path = out / "final-closing.jpg"
selector = "+".join(f"eq(n,{f})" for f in closing_frames)
run(["ffmpeg", "-v", "error", "-y", "-i", str(movie), "-vf",
     f"select='{selector}',scale=540:960,tile=2x2:padding=2:margin=2", "-frames:v", "1", "-q:v", "2", str(closing_path)])
print("HH_FINAL_IMAGE " + json.dumps({"caption": "Native final form and CTA: 111.000, 113.200, 114.000, 119.967s",
                                     "image": base64.b64encode(closing_path.read_bytes()).decode()}), flush=True)
# Inspect movements from the actual finished movie, in addition to source previews.
for name, start, end in [("opening", 0, 4), ("arrival", 65, 68.2), ("teacher", 68.2, 72.1),
                         ("fatigue", 91, 95), ("phone", 103.4, 109)]:
    block = 0
    while start + block * 2 < end - 0.001:
        at = start + block * 2
        duration = min(2, end - at)
        path = out / f"final-motion-{name}-{block}.jpg"
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{at:.6f}", "-i", str(movie), "-t", f"{duration:.6f}", "-vf",
             "fps=8,scale=180:320,tile=4x4:padding=2:margin=2", "-frames:v", "1", "-q:v", "3", str(path)])
        print("HH_FINAL_IMAGE " + json.dumps({"caption": f"Actual final {name}, {at:.3f}–{at + duration:.3f}s, chronological at 8 fps",
                                             "image": base64.b64encode(path.read_bytes()).decode()}), flush=True)
        block += 1

print("HH_FINAL_VALIDATION " + (out / "validation.json").read_text().replace("\n", " "))
