"""Create labelled chronological review sheets without changing scene rendering."""
import base64
import json
import math
import os
import subprocess
from pathlib import Path

OUT = Path("out/contact-review")
OUT.mkdir(parents=True, exist_ok=True)
FONT = "public/fonts/Nunito-Variable.ttf"
STARTS = {"opening": 0, "teacher": 68.2, "pickup": 78.5, "phone": 103.5,
          "walk": 30.4, "seat": 84.6, "fatigue": 91, "transfer": 106.8, "colleague": 16.2, "arrival": 65}

def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True)

def emit(path, caption):
    print("HH_REVIEW_IMAGE " + json.dumps({"caption": caption, "image": base64.b64encode(path.read_bytes()).decode()}), flush=True)

def stills(root, tag):
    images = sorted(root.rglob("t*.png"), key=lambda p: float(p.stem[1:]))
    for block in range(math.ceil(len(images) / 9)):
        subset = images[block * 9:(block + 1) * 9]
        tmp = OUT / f"{tag}-still-{block}-cells"
        tmp.mkdir(exist_ok=True)
        for i, p in enumerate(subset):
            vf = f"scale=240:426,drawtext=fontfile={FONT}:text='{p.stem}s':fontcolor=white:fontsize=16:box=1:boxcolor=black@0.6:x=6:y=6"
            run(["ffmpeg", "-v", "error", "-y", "-i", str(p), "-vf", vf, "-frames:v", "1", str(tmp / f"{i:03}.png")])
        dest = OUT / f"{tag}-stills-{block}.jpg"
        run(["ffmpeg", "-v", "error", "-y", "-framerate", "1", "-i", str(tmp / "%03d.png"),
             "-vf", "tile=3x3:padding=2:margin=2", "-frames:v", "1", "-q:v", "3", str(dest)])
        emit(dest, f"{tag}: native stills " + ", ".join(p.stem[1:] for p in subset))

def motion(root, tag):
    for p in sorted(root.rglob("polish-*.mp4")):
        name = p.stem.removeprefix("polish-")
        if name not in STARTS:
            continue
        video = json.loads(run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=nb_frames,r_frame_rate", "-of", "json", str(p)]).stdout)["streams"][0]
        num, den = map(int, video["r_frame_rate"].split("/"))
        duration = int(video["nb_frames"]) * den / num
        for i in range(math.ceil(duration / 2)):
            offset = i * 2
            absolute = STARTS[name] + offset
            dest = OUT / f"{tag}-{name}-{i}.jpg"
            vf = f"fps=8,scale=180:320,drawtext=fontfile={FONT}:text='{name} {absolute:.2f}s+':fontcolor=white:fontsize=12:box=1:boxcolor=black@0.6:x=4:y=4,tile=4x4:padding=2:margin=2"
            run(["ffmpeg", "-v", "error", "-y", "-ss", str(offset), "-i", str(p), "-t", str(min(2, duration-offset)),
                 "-vf", vf, "-frames:v", "1", "-q:v", "3", str(dest)])
            emit(dest, f"{tag}: native {name}, absolute {absolute:.3f}–{min(STARTS[name]+duration, absolute+2):.3f}s, chronological left-to-right then top-to-bottom at 8 fps")

for root, tag in [(Path("out/previous-review"), os.environ.get("HH_PREVIOUS_TAG", "dd16")), (Path("out/polish-frames"), "current")]:
    if root.exists():
        stills(root, tag)
motion(Path("out/previous-review"), os.environ.get("HH_PREVIOUS_TAG", "dd16"))
# Avoid recursive duplication of previous clips.
current_root = OUT / "current-clips"
current_root.mkdir(exist_ok=True)
for p in Path("out").glob("polish-*.mp4"):
    target = current_root / p.name
    if not target.exists():
        target.symlink_to(p.resolve())
motion(current_root, "current")
