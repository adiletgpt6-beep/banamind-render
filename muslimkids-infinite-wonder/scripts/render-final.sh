#!/usr/bin/env bash
# Финальный рендер 1080×1920/30 fps частями (без звука), склейка без
# перекодирования и сведение с master.wav (AAC), faststart.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=output/final
mkdir -p "$OUT/parts"
CONC=${CONC:-3}
for range in 0-599 600-1199 1200-1799; do
  part="$OUT/parts/part_${range}.mp4"
  [ -s "$part" ] && continue
  npx remotion render src/index.ts MuslimKidsInfiniteWonder013 "$part.tmp.mp4" \
    --frames="$range" --muted --gl=swangle --concurrency="$CONC" --crf=16 \
    --props='{"withAudio":false}'
  mv "$part.tmp.mp4" "$part"
done
ls "$OUT"/parts/part_*.mp4 | sort -t_ -k2 -n | sed "s|^$OUT/parts/|file '|; s|$|'|" > "$OUT/parts/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/parts/list.txt" -i public/audio/master.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart \
  "$OUT/MuslimKids_InfiniteWonder_013.mp4"
echo "ГОТОВО"
