#!/usr/bin/env bash
# Одна команда повторного рендера выпуска финансового канала:
#   bash scripts/finance/render.sh [out/finance-horse-money-system.mp4] [en|ru]
# 1920×1080, 30 fps, H.264 (yuv420p, BT.709) + AAC 192k, faststart.
# Нужны: npm ci, FFmpeg, озвучка public/finance/voice (scripts/finance/voice.mjs).
# В закрытой сети можно указать Chromium: REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell
set -euo pipefail
OUT="${1:-out/finance-horse-money-system.mp4}"
LANG_ID="${2:-en}"
case "$LANG_ID" in en) COMP=FinanceHorseEp01 ;; ru) COMP=FinanceHorseEp01Ru ;; *) echo "язык en|ru" >&2; exit 1 ;; esac
mkdir -p "$(dirname "$OUT")"
TMP="${OUT%.mp4}.raw.mp4"
npx remotion render src/finance/index.ts "$COMP" "$TMP" \
  --codec=h264 --pixel-format=yuv420p --color-space=bt709 \
  --audio-codec=aac --audio-bitrate=192k --crf=17 --x264-preset=slow \
  --concurrency="${FINANCE_CONCURRENCY:-100%}" --log=warn
# faststart без повторного сжатия
ffmpeg -hide_banner -loglevel error -y -i "$TMP" -c copy -movflags +faststart "$OUT"
rm -f "$TMP"
node scripts/finance/captions.mjs "$LANG_ID"
echo "✓ $OUT"
