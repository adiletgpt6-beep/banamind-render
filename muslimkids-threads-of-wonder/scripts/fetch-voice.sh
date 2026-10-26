#!/usr/bin/env bash
# Скачивает бесплатную офлайн-модель Piper ru_RU-denis-medium (датасет CC0) в tools/voices/.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p tools/voices && cd tools/voices
curl -sSL -o denis.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-denis-medium.tar.bz2
tar xjf denis.tar.bz2 && rm denis.tar.bz2
