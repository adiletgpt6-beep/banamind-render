#!/usr/bin/env bash
# Локальные (резервные) голоса Lesson80_1_5 — временная дорожка, когда внешний
# синтез недоступен: Piper (нейросетевой русский голос ru-irinia из релиза
# rhasspy/piper v0.0.2 на GitHub) и RHVoice (пакеты rhvoice, rhvoice-russian).
# Запуск: bash scripts/l815-local-voices.sh  → scripts/l815-voices/*.onnx,
# виртуальное окружение .venv-piper (python3 -m venv). Затем:
#   L815_PIPER_PY=.venv-piper/bin/python npm run audio:voice:lesson-80-1-5 -- --provider local
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p scripts/l815-voices
if [ ! -f scripts/l815-voices/ru-irinia-medium.onnx ]; then
  curl -sSL -o /tmp/voice-ru-irinia-medium.tar.gz https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-ru-irinia-medium.tar.gz
  tar -xzf /tmp/voice-ru-irinia-medium.tar.gz -C scripts/l815-voices
  rm -f /tmp/voice-ru-irinia-medium.tar.gz
fi
if [ ! -x .venv-piper/bin/python ]; then
  python3 -m venv .venv-piper
  .venv-piper/bin/pip install --quiet piper-tts
fi
if ! command -v RHVoice-test >/dev/null 2>&1; then
  echo "RHVoice не установлен: sudo apt-get install -y rhvoice rhvoice-russian" >&2
fi
echo "Готово: scripts/l815-voices/, .venv-piper/"
