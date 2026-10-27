#!/usr/bin/env bash
# Негромкие немелодические эффекты выпуска (без музыки и тонов): фильтрованный
# шум с короткими огибающими. Детерминированно (фиксированный seed шума).
set -euo pipefail
OUT=public/finance/sfx
mkdir -p "$OUT"
F="ffmpeg -hide_banner -loglevel error -y"
# «поп» появления карточки: 70 мс полосового шума с быстрым спадом
$F -f lavfi -i "anoisesrc=d=0.09:c=pink:r=44100:a=0.9:s=11" -af "bandpass=f=1800:w=1.2,afade=t=out:st=0.005:d=0.08:curve=exp,volume=0.9" -ac 1 -c:a libmp3lame -b:a 128k "$OUT/pop.mp3"
# «вжух» смены сцены: 0.45 с шума с нарастанием и спадом, низкочастотный
$F -f lavfi -i "anoisesrc=d=0.45:c=brown:r=44100:a=0.9:s=23" -af "highpass=f=150,lowpass=f=2400,afade=t=in:d=0.18:curve=qsin,afade=t=out:st=0.2:d=0.25:curve=qsin,volume=1.4" -ac 1 -c:a libmp3lame -b:a 128k "$OUT/whoosh.mp3"
# «тик» счёта/цифры: 25 мс щелчок
$F -f lavfi -i "anoisesrc=d=0.03:c=white:r=44100:a=0.8:s=5" -af "highpass=f=2500,afade=t=out:st=0.002:d=0.026:curve=exp,volume=0.7" -ac 1 -c:a libmp3lame -b:a 128k "$OUT/tick.mp3"
# мягкий «тук» (ошибка/предупреждение): низкий шум 120 мс
$F -f lavfi -i "anoisesrc=d=0.14:c=brown:r=44100:a=1:s=41" -af "lowpass=f=400,afade=t=out:st=0.01:d=0.13:curve=exp,volume=2.2" -ac 1 -c:a libmp3lame -b:a 128k "$OUT/thud.mp3"
ls -la "$OUT"
