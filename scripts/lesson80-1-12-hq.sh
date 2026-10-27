#!/usr/bin/env bash
# Файл 1080p повышенного качества для скачивания (≈ 29 МБ). Источник — почти
# без потерь: мастер Remotion из PNG-кадров с CRF 4 (без звука) и звук WAV.
# Двухпроходное x264 veryslow + tune animation даёт при меньшем размере
# более чистую картинку, чем основной MP4 (один проход по JPEG-кадрам).
# В конце — сравнение с мастером (PSNR/SSIM по каждому третьему кадру):
# SSIM ниже 0,99 считается ошибкой.
#
#   scripts/lesson80-1-12-hq.sh <master-video.mp4> <master-audio.wav> <out.mp4>
set -euo pipefail
VIDEO=$1
AUDIO=$2
OUT=$3
FPS=30
TARGET_BYTES=30408704 # 29,0 МиБ: файл помещается в лимит 30 МиБ чата Claude
ABR=160               # кбит/с, AAC (речь и тихие звуки)
OVERHEAD=120000       # контейнер, байт

FRAMES=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 "$VIDEO")
DUR=$(python3 -c "print(${FRAMES}/${FPS})")
VBR=$(python3 -c "print(int(((${TARGET_BYTES}-${OVERHEAD})*8/${DUR}-${ABR}*1000)/1000))")
echo "мастер: ${FRAMES} кадров, ${DUR} с; видео ${VBR} кбит/с, звук ${ABR} кбит/с"

PASSLOG=$(mktemp -d)/x264pass
trap 'rm -rf "$(dirname "$PASSLOG")"' EXIT
COMMON=(-c:v libx264 -preset veryslow -tune animation -profile:v high -level:v 4.0 -pix_fmt yuv420p
  -b:v "${VBR}k" -maxrate 4000k -bufsize 8000k -g 300
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv)
ffmpeg -hide_banner -loglevel error -y -i "$VIDEO" -map 0:v "${COMMON[@]}" \
  -pass 1 -passlogfile "$PASSLOG" -an -frames:v "$FRAMES" -f null /dev/null
ffmpeg -hide_banner -loglevel error -y -i "$VIDEO" -i "$AUDIO" -map 0:v -map 1:a "${COMMON[@]}" \
  -pass 2 -passlogfile "$PASSLOG" -c:a aac -b:a "${ABR}k" -ar 48000 -ac 2 \
  -movflags +faststart -frames:v "$FRAMES" -t "$DUR" "$OUT"

SIZE=$(stat -c %s "$OUT")
echo "$OUT: $SIZE байт ($(python3 -c "print(round(${SIZE}/1048576, 1))") МиБ)"
CMP=$(ffmpeg -hide_banner -nostats -i "$OUT" -i "$VIDEO" \
  -lavfi "[0:v]framestep=3,split[a0][a1];[1:v]framestep=3,split[b0][b1];[a0][b0]psnr;[a1][b1]ssim" \
  -f null - 2>&1 | grep -E "Parsed_(psnr|ssim)" || true)
echo "$CMP"
SSIM=$(sed -n 's/.*SSIM .* All:\([0-9.]*\).*/\1/p' <<<"$CMP")
if [ -z "$SSIM" ] || ! python3 -c "import sys; sys.exit(0 if float('${SSIM}') >= 0.99 else 1)"; then
  echo "::error::$OUT: SSIM относительно мастера ${SSIM:-не измерен} (нужно ≥ 0,99)"
  exit 1
fi
