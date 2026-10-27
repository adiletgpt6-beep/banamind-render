#!/usr/bin/env bash
# Final 1080×1920 render in resumable chunks (video), one audio pass, lossless concat + faststart.
set -e
cd "$(dirname "$0")/.."
OUT=output/final/MuslimKids_InfiniteDiscovery_001.mp4
TMP=output/final/chunks; mkdir -p $TMP
npx remotion bundle --out-dir=.remotion-bundle >/dev/null
CH=300
for s in $(seq 0 $CH 1799); do
  e=$((s + CH - 1)); f=$TMP/v_$(printf %04d $s).mp4
  [ -s "$f" ] && continue
  echo "chunk $s-$e $(date +%T)"
  npx remotion render .remotion-bundle InfiniteDiscovery001 "$f.tmp.mp4" --frames=$s-$e --muted \
    --codec=h264 --pixel-format=yuv420p --color-space=bt709 --crf=16 --concurrency=4 --log=error
  mv "$f.tmp.mp4" "$f"
done
echo "audio $(date +%T)"
npx remotion render .remotion-bundle InfiniteDiscovery001 $TMP/audio.m4a --codec=aac --audio-bitrate=192k --log=error
ls $TMP/v_*.mp4 | sed "s|^$TMP/|file '|; s|$|'|" > $TMP/list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i $TMP/list.txt -i $TMP/audio.m4a -map 0:v -map 1:a -c copy -movflags +faststart -t 60 "$OUT"
echo "done $(date +%T)"
