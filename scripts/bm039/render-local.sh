#!/usr/bin/env bash
# Полный локальный рендер BM-039 (когда GitHub Actions недоступны): кадры частями
# (готовые части не перерендериваются), склейка без пережатия, звук по тайм-лайну,
# AAC 192k + faststart, SRT, проверка. Результат: out/bm039/final-youtube.{mp4,srt}
#   REMOTION_BROWSER_EXECUTABLE=… bash scripts/bm039/render-local.sh [частей=6]
set -euo pipefail
N=${1:-6}
OUT=out/bm039
mkdir -p "$OUT/parts"
BR=()
[ -n "${REMOTION_BROWSER_EXECUTABLE:-}" ] && BR=(--browser-executable="$REMOTION_BROWSER_EXECUTABLE")
npx remotion bundle src/bm039-republic/index.ts --out-dir=out/bm039-bundle --log=error
RANGES=$(node scripts/bm039/frames.mjs "$N" | python3 -c 'import sys,json; print(" ".join(json.load(sys.stdin)["ranges"]))')
for R in $RANGES; do
  A=${R%-*}
  F="$OUT/parts/part-$(printf %06d "$A").mp4"
  if [ -s "$F.done" ] && [ "$(cat "$F.done")" = "$R" ]; then echo "= $R готово"; continue; fi
  echo "→ кадры $R"
  npx remotion render out/bm039-bundle RepublicFilm "$F" --frames="$R" --muted --codec=h264 --pixel-format=yuv420p \
    --color-space=bt709 --crf=19 --x264-preset=medium --concurrency=4 --log=error "${BR[@]}"
  echo "$R" > "$F.done"
done
ls "$OUT"/parts/part-*.mp4 | sort | sed "s/^/file '/; s/$/'/; s#$OUT/parts/##" > "$OUT/parts/list.txt"
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$OUT/parts/list.txt" -c copy "$OUT/video.mp4"
node scripts/bm039/mixdown.mjs "$OUT/audio.wav"
ffmpeg -hide_banner -loglevel error -y -i "$OUT/video.mp4" -i "$OUT/audio.wav" -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT/final-youtube.mp4"
node scripts/bm039/srt.mjs "$OUT/final-youtube.srt"
node scripts/bm039/chapters.mjs > "$OUT/chapters.txt"
node scripts/bm039/verify.mjs "$OUT/final-youtube.mp4"
