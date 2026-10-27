#!/usr/bin/env bash
# Final render + QC for VoiceStudioDemo60s. Run from the repository root.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
OUT=output/voicestudio-demo-60s.mp4
TIMING=src/voicestudio-demo/timing.json

python3 - "$TIMING" <<'PY'
import json, sys
t = json.load(open(sys.argv[1]))
if t["estimated"]:
    sys.exit("timing.json is ESTIMATED: generate the voiceover with VoiceStudio first (generate_voice.py)")
prov = t.get("provenance", {})
assert prov.get("tool") == "VoiceStudio MCP generate_speech", prov
assert prov.get("engine") == "voxcpm2", f"engine {prov.get('engine')!r}: only VoxCPM2 (Apache-2.0) is allowed"
assert all(s.get("audio_id") for s in prov["scenes"].values()), "scene without VoiceStudio audio_id"
print("voice provenance: VoiceStudio MCP, profile", prov["profile_id"], "scenes", list(prov["scenes"]))
PY

if grep -rniE "eleven ?labs" src/voicestudio-demo voicestudio-demo/scripts voicestudio-demo/script.json >/dev/null; then
  echo "FAIL: ElevenLabs reference found in the video sources"; exit 1
fi

PW_SHELL=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
if [ -z "${REMOTION_BROWSER_EXECUTABLE:-}" ] && [ -x "$PW_SHELL" ]; then
  export REMOTION_BROWSER_EXECUTABLE="$PW_SHELL"
fi
npx remotion render VoiceStudioDemo60s "$OUT.tmp.mp4" --codec=h264 --pixel-format=yuv420p \
  --color-space=bt709 --audio-codec=aac --audio-bitrate=192k --crf=18
# faststart without re-encoding
ffmpeg -v error -y -i "$OUT.tmp.mp4" -c copy -movflags +faststart "$OUT" && rm "$OUT.tmp.mp4"

python3 - "$OUT" <<'PY'
import json, subprocess, sys
p = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", sys.argv[1]]))
v = next(s for s in p["streams"] if s["codec_type"] == "video")
a = next(s for s in p["streams"] if s["codec_type"] == "audio")
dur = float(p["format"]["duration"])
checks = {
    "1080x1920": (v["width"], v["height"]) == (1080, 1920),
    "30 fps": v["r_frame_rate"] == "30/1",
    "h264": v["codec_name"] == "h264",
    "aac": a["codec_name"] == "aac",
    "58-62 s": 58 <= dur <= 62,
}
print(json.dumps({"duration": dur, "video": v["codec_name"], "size": f'{v["width"]}x{v["height"]}', "fps": v["r_frame_rate"], "audio": a["codec_name"], "sample_rate": a["sample_rate"]}))
for k, ok in checks.items():
    print(("OK  " if ok else "FAIL"), k)
if not all(checks.values()):
    sys.exit(1)
PY

# loudness / audio presence
ffmpeg -v info -i "$OUT" -af "volumedetect" -vn -f null - 2>&1 | grep -E "mean_volume|max_volume"

# control frames for every scene + preview.jpg
mkdir -p output/frames
python3 - <<'PY'
import json, subprocess
t = json.load(open("src/voicestudio-demo/timing.json"))
for s in t["scenes"]:
    mid = (s["speechStart"] + s["speechEnd"]) / 2
    for tag, sec in (("start", s["speechStart"] + 0.8), ("mid", mid), ("end", s["speechEnd"] - 0.2)):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{sec:.2f}", "-i", "output/voicestudio-demo-60s.mp4",
                        "-frames:v", "1", "-q:v", "3", f"output/frames/{s['id']}-{tag}.jpg"], check=True)
fin = next(s for s in t["scenes"] if s["id"] == "finale")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{fin['speechEnd'] + 0.6:.2f}", "-i", "output/voicestudio-demo-60s.mp4",
                "-frames:v", "1", "-q:v", "2", "output/preview.jpg"], check=True)
print("frames → output/frames, preview → output/preview.jpg")
PY
echo "DONE: $OUT"
