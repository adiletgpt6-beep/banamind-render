#!/usr/bin/env bash
# Загружает нужные исходники MakeHuman (CC0) в tools/characters/.cache/makehuman.
# Версия закреплена коммитом: результат сборки персонажей воспроизводим.
set -euo pipefail
COMMIT=a8bc2d54ff0ac92e78ff71431b1023eda42bf482
DIR="$(dirname "$0")/.cache/makehuman"
BASE="https://raw.githubusercontent.com/makehumancommunity/makehuman/$COMMIT/makehuman/data"
mkdir -p "$DIR"
get() { mkdir -p "$DIR/$(dirname "$1")"; [ -s "$DIR/$1" ] || curl -sSfL --retry 4 -o "$DIR/$1" "$BASE/$1"; }
get 3dobjs/base.obj
get rigs/default.mhskel
get rigs/default_weights.mhw
get eyes/high-poly/high-poly.obj
get eyes/high-poly/high-poly.mhclo
get eyes/materials/brown_eye.png
for g in female male; do
  for a in baby child young old; do
    for m in minmuscle averagemuscle maxmuscle; do
      for w in minweight averageweight maxweight; do
        get "targets/macrodetails/universal-$g-$a-$m-$w.target"
      done
    done
    for r in african asian caucasian; do get "targets/macrodetails/$r-$g-$a.target"; done
  done
done
for t in eye-left-closure eye-right-closure eye-left-opened-up eye-right-opened-up eye-left-slit eye-right-slit \
  eyebrows-left-down eyebrows-right-down eyebrows-left-inner-up eyebrows-right-inner-up eyebrows-left-up eyebrows-right-up \
  mouth-open mouth-corner-puller mouth-depression mouth-pursing mouth-retraction mouth-compression mouth-protusion mouth-elevation; do
  get "targets/expression/units/asian/$t.target"
done
echo "MakeHuman data: $DIR"
