"""Render frames of the NOX film to an H.264 MP4 segment (video only) or to still PNGs.

  python3 render.py --from 0 --to 3600 --out out/parts/part-000000.mp4
  python3 render.py --stills 3.5,20,61 --outdir out/stills
Frame state depends only on the absolute frame number, so segments join seamlessly."""
import argparse
import os
import subprocess
import sys
import time

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import film  # noqa: E402
import scenes  # noqa: E402
from gl import Renderer  # noqa: E402
from stage import Stage  # noqa: E402


def build():
    timing = film.Timing()
    st = Stage(timing)
    scenes.build_all(st)
    return st


def draw(r, st, T):
    pts, overlay, look, cam = st.frame(T)
    return r.frame(pts, light=look["light"], bloom=look["bloom"], halo=look["halo"], grid=look["grid"],
                   overlay=overlay, tint=look["tint"], tint_k=look["tint_k"],
                   cam=(cam["cx"] - 960, cam["cy"] - 540), cam_z=cam["z"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="f0", type=int, default=0)
    ap.add_argument("--to", dest="f1", type=int, default=None, help="exclusive")
    ap.add_argument("--out")
    ap.add_argument("--crf", type=int, default=17)
    ap.add_argument("--preset", default="medium")
    ap.add_argument("--stills")
    ap.add_argument("--outdir", default="out/stills")
    ap.add_argument("--scale", type=float, default=1.0, help="output downscale for quick previews")
    a = ap.parse_args()
    st = build()
    r = Renderer()
    if a.stills:
        from PIL import Image
        os.makedirs(a.outdir, exist_ok=True)
        for s in a.stills.split(","):
            T = float(s)
            buf = draw(r, st, T)
            im = Image.frombytes("RGB", (film.W, film.H), buf).transpose(Image.FLIP_TOP_BOTTOM)
            if a.scale != 1:
                im = im.resize((int(film.W * a.scale), int(film.H * a.scale)), Image.LANCZOS)
            im.save(os.path.join(a.outdir, f"t{T:07.2f}.png"))
        return
    f1 = a.f1 if a.f1 is not None else int(film.TOTAL * film.FPS)
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    vf = "vflip"
    if a.scale != 1:
        vf += f",scale={int(film.W * a.scale)}:{int(film.H * a.scale)}:flags=lanczos"
    vf += ",scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{film.W}x{film.H}", "-r", str(film.FPS), "-i", "-", "-vf", vf,
           "-c:v", "libx264", "-preset", a.preset, "-crf", str(a.crf), "-pix_fmt", "yuv420p",
           "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
           "-g", "60", "-bf", "2", "-movflags", "+faststart", "-r", str(film.FPS), a.out]
    enc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    t0 = time.time()
    for fr in range(a.f0, f1):
        T = fr / film.FPS
        enc.stdin.write(draw(r, st, T))
        if (fr - a.f0) % 300 == 0:
            el = time.time() - t0
            print(f"frame {fr} ({fr - a.f0}/{f1 - a.f0}) {((fr - a.f0) / el if el else 0):.1f} fps", flush=True)
    enc.stdin.close()
    if enc.wait() != 0:
        raise SystemExit("ffmpeg failed")
    print(f"done {a.out}: {f1 - a.f0} frames in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
