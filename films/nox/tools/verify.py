"""Technical verification of the finished MP4 (G098/V098/V100): format, exact frame count,
durations, audio, loudness of the final file, decode errors, black / frozen intervals (as hints).

  python3 verify.py FILE.mp4 [--frames 54000] [--json out.json]"""
import argparse
import json
import re
import subprocess


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--frames", type=int, default=54000)
    ap.add_argument("--json")
    a = ap.parse_args()
    f = a.file
    r = {}
    p = json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", f]).stdout)
    v = [s for s in p["streams"] if s["codec_type"] == "video"][0]
    au = [s for s in p["streams"] if s["codec_type"] == "audio"]
    r["video"] = {k: v.get(k) for k in ("codec_name", "profile", "width", "height", "r_frame_rate", "avg_frame_rate",
                                        "pix_fmt", "color_space", "color_primaries", "color_transfer", "duration")}
    r["audio"] = [{k: s.get(k) for k in ("codec_name", "sample_rate", "channels", "bit_rate", "duration")} for s in au]
    r["format"] = {k: p["format"].get(k) for k in ("duration", "size", "bit_rate")}
    cnt = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries",
               "stream=nb_read_packets", "-of", "csv=p=0", f]).stdout.strip()
    r["video_packets"] = int(cnt)
    # faststart: moov before mdat
    with open(f, "rb") as fh:
        head = fh.read(1 << 16)
    r["faststart"] = head.find(b"moov") != -1 and (head.find(b"mdat") == -1 or head.find(b"moov") < head.find(b"mdat"))
    # full decode (errors), loudness, black/freeze hints
    dec = run(["ffmpeg", "-hide_banner", "-v", "error", "-i", f, "-f", "null", "-"])
    r["decode_errors"] = dec.stderr.strip().splitlines()[:20]
    lo = run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null",
              "-"]).stderr
    summ = lo[lo.rfind("Summary:"):]
    r["loudness"] = {
        "integrated_lufs": float(re.search(r"I:\s*(-?[\d.]+) LUFS", summ).group(1)),
        "lra_lu": float(re.search(r"LRA:\s*(-?[\d.]+) LU", summ).group(1)),
        "true_peak_dbfs": float(re.search(r"Peak:\s*(-?[\d.]+) dBFS", summ).group(1)),
    }
    bd = run(["ffmpeg", "-hide_banner", "-i", f, "-vf", "blackdetect=d=1.5:pix_th=0.04,freezedetect=n=0.0005:d=6",
              "-an", "-f", "null", "-"]).stderr
    r["black_intervals"] = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", bd)
    r["freeze_starts"] = re.findall(r"freeze_start: ([\d.]+)", bd)
    ok = (r["video"]["codec_name"] == "h264" and r["video"]["width"] == 1920 and r["video"]["height"] == 1080 and
          r["video"]["r_frame_rate"] == "30/1" and r["video"]["pix_fmt"] == "yuv420p" and
          r["video_packets"] == a.frames and au and au[0]["codec_name"] == "aac" and au[0]["sample_rate"] == "48000"
          and not r["decode_errors"] and r["faststart"])
    r["ok"] = bool(ok)
    out = json.dumps(r, ensure_ascii=False, indent=1)
    print(out)
    if a.json:
        open(a.json, "w").write(out)
    if not ok:
        raise SystemExit("verification failed")


if __name__ == "__main__":
    main()
