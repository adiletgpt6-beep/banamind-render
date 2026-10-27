#!/usr/bin/env bash
# Проверка готового MP4: формат, длительность, звук, громкость, контрольные кадры
# из НАСТОЯЩЕГО рендера (00:02 … 00:59) и промежуточные кадры сложных переходов.
# Запуск: bash scripts/verify.sh [путь к mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
MP4="${1:-output/final/MuslimKids_MirrorDimensions_010.mp4}"
OUT=output/control-frames
mkdir -p "$OUT"

echo "== ffprobe"
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,nb_frames,sample_rate,channels -of default=nw=1 "$MP4"
echo "== громкость (EBU R128)"
ffmpeg -hide_banner -nostats -i "$MP4" -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | grep -E "I:|LRA:|Peak:" || true
echo "== декодирование целиком (ошибки)"
ffmpeg -v error -i "$MP4" -f null - && echo "без ошибок"

shot() { ffmpeg -v error -y -ss "$1" -i "$MP4" -frames:v 1 -q:v 2 "$OUT/$2.jpg"; }
# контрольные точки из ТЗ
shot 2 "00-02_mirror"; shot 5 "00-05_earth_in_mirror"; shot 10 "00-10_earth_3d"; shot 14 "00-14_day_night"
shot 19 "00-19_mirror_to_lake"; shot 22 "00-22_mountains_in_water"; shot 27 "00-27_tree_reflection"
shot 31 "00-31_tree_growth"; shot 38 "00-38_mirrors"; shot 43 "00-43_main_composition"
shot 49 "00-49_quran_quote"; shot 57 "00-57_boy_at_lake"; shot 59.5 "00-59_muslim_kids"
# промежуточные кадры переходов
for s in 4.3 4.8 9.6 10.6 15.9 16.6 17.6 18.2 18.8 19.3 19.6 26.0 28.6 37.8 39.6 41.8 42.6 44.6 52.0 55.4 56.2; do shot "$s" "transition_$(printf '%05.1f' "$s")"; done
ffmpeg -v error -y -pattern_type glob -i "$OUT/00-*.jpg" -vf "scale=270:-1,tile=13x1" -frames:v 1 "$OUT/_contact_sheet.jpg"
echo "кадры: $OUT"
