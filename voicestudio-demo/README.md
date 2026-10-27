# VoiceStudio + Claude Code: ролик на 60 секунд

Вертикальное анимационное видео 1080×1920, 30 fps, 60 с, H.264 + AAC.
Remotion-композиция `VoiceStudioDemo60s`, исходники лежат в `src/voicestudio-demo/`.
Вся речь генерируется только в **VoiceStudio** через MCP-инструмент `generate_speech`.
ElevenLabs и другие TTS в проекте не используются.

## Что где лежит

| Путь | Что там |
|---|---|
| `voicestudio-demo/script.json` | сценарий по сценам: экранный текст, текст для синтеза (`tts`), ключевые слова |
| `voicestudio-demo/voice-profile.json` | профиль голоса в VoiceStudio (Voice Design, не клон) |
| `voicestudio-demo/scripts/generate_voice.py` | генерация озвучки через MCP, проверка каждого файла, склейка с паузами, `timing.json` |
| `voicestudio-demo/scripts/mcp_call.py` | минимальный MCP-клиент: `tools`, `call <tool> '<json>'` |
| `voicestudio-demo/scripts/make_sfx.py` | собственные звуковые эффекты (синтез, без сэмплов) |
| `voicestudio-demo/scripts/render_and_check.sh` | финальный рендер и QC: ffprobe, длительность, кадры сцен, `preview.jpg` |
| `src/voicestudio-demo/` | Remotion: `VoiceStudioDemo.tsx`, сцены `scenes/*`, робот, волны, субтитры, `FitGuard` |
| `public/voicestudio-demo/` | шрифты (OFL), звуковые эффекты, `voiceover.wav` |
| `output/` | `voicestudio-demo-60s.mp4`, `voiceover.wav`, `script.txt`, `preview.jpg`, `frames/` |

## 1. VoiceStudio (стабильная v0.5.6, бэкенд без окна)

На машине с рабочим столом ставьте Electron-приложение из Releases.
В облачном контейнере без дисплея запускайте только бэкенд из исходников:

```bash
git clone https://github.com/debpalash/VoiceStudio.git && cd VoiceStudio
git checkout v0.5.6
uv sync --no-sources        # --no-sources: torch с PyPI, если download.pytorch.org закрыт
OMNIVOICE_ANALYTICS_DISABLED=1 \
OMNIVOICE_MCP_OUTPUT_MODE=both OMNIVOICE_MCP_BASE_PATH=/path/to/vs-out \
OMNIVOICE_CPU_GENERATE_TIMEOUT_S=1800 \
uv run --no-sources uvicorn main:app --app-dir backend --host 127.0.0.1 --port 3900
curl http://localhost:3900/health      # {"status":"ok","device":"cpu",...}
```

Слушайте только `127.0.0.1`. Не открывайте MCP в интернет.

### Движок: VoxCPM2 (коммерческое использование разрешено)

OmniVoice (по умолчанию в VoiceStudio) **не используется**: его веса — CC-BY-NC.
Ролик озвучивается движком VoiceStudio **VoxCPM2** (`openbmb/VoxCPM2`, 2B, около 5 GB):

| Компонент | Лицензия | Коммерция |
|---|---|---|
| VoxCPM2: код и веса (MiniCPM-4 backbone, AudioVAE V2 внутри того же релиза) | Apache-2.0 («Weights and code… free for commercial use», README OpenBMB/VoxCPM) | да |
| пакет `voxcpm` 2.0.3 (PyPI) | Apache-2.0 | да |
| VoiceStudio (приложение) | AGPL-3.0, «includes commercial and internal business use» | да |
| AudioSeal: невидимый водяной знак VoiceStudio | MIT, включая веса | да |
| faster-whisper small (только QC-распознавание, в аудио не попадает) | MIT | да |
| Сгенерированное аудио | Apache-2.0 не ограничивает выходные данные; голос синтетический, не клон человека | да |

```bash
uv pip install --python .venv/bin/python "voxcpm>=2.0.3"
OMNIVOICE_TTS_BACKEND=voxcpm2 ... uvicorn ...   # см. команду запуска выше
curl localhost:3900/engines/tts                 # active: voxcpm2, available: true
```

Веса качаются с Hugging Face при первой генерации. Для этого нужны домены:
`huggingface.co`, `cdn-lfs.huggingface.co`, `cdn-lfs.hf.co`, `cas-bridge.xethub.hf.co`,
`cas-server.xethub.hf.co`, `transfer.xethub.hf.co` (или маска `*.hf.co`).

Есть второй путь: workflow `.github/workflows/voicestudio-demo.yml` запускает те же шаги
на раннере GitHub (там интернет открыт), сохраняет озвучку в ветку, рендерит MP4
и публикует пре-релиз `voicestudio-demo-60s`.

## 2. MCP в Claude Code

```bash
claude mcp add --transport http -s user voicestudio http://localhost:3900/mcp/ \
  -H "X-OmniVoice-Client-Id: claude-code"
claude mcp list        # voicestudio: ... - ✓ Connected
```

Проверка инструментов без перезапуска сессии:

```bash
VS_PY=/path/to/VoiceStudio/.venv/bin/python
$VS_PY voicestudio-demo/scripts/mcp_call.py tools
$VS_PY voicestudio-demo/scripts/mcp_call.py call check_health
$VS_PY voicestudio-demo/scripts/mcp_call.py call list_voices
```

## 3. Голос

`generate_voice.py` создаёт голос сам, только через MCP VoiceStudio:

1. `generate_speech` с описанием из `script.json → voice.description` без профиля.
   Это VoxCPM2 Voice Design: новый голос по описанию. Получаются три кандидата.
2. Каждый кандидат проверяется: длительность, клиппинг, темп, F0 в женском диапазоне
   155–300 Гц, распознавание через `transcribe`. Лучший сохраняется как
   `audio/voice-design-sample.wav`.
3. `clone_voice` из этого синтетического образца создаёт профиль, чтобы все сцены
   звучали одним голосом. Результат пишется в `voice-profile.json`.

Голос в исходном ролике мужской (F0 ≈ 126 Гц). Он нигде не используется.

## 4. Озвучка → тайминг → рендер

```bash
npm ci
$VS_PY voicestudio-demo/scripts/make_sfx.py
$VS_PY voicestudio-demo/scripts/generate_voice.py          # все сцены через VoiceStudio MCP
$VS_PY voicestudio-demo/scripts/generate_voice.py --only mcp   # перегенерировать одну сцену
voicestudio-demo/scripts/render_and_check.sh               # финальный MP4 + проверки
```

`generate_voice.py` проверяет каждый клип: длительность, тишину, клиппинг, темп
9–17.5 символов/с, внутренние паузы. При ошибке он повторяет генерацию до трёх раз.
Произношение правится в поле `tts` в `script.json`: латиница записывается кириллицей
(«Клод Код», «Войс Студио», «эм-си-пи»), экранный текст при этом не меняется.

Визуальный ряд подстраивается под фактическую длительность речи. Границы сцен,
подсветка слов, мини-анимации и движение «рта» робота берутся из `timing.json`:
из огибающей и пауз реальной озвучки.

`--estimate` строит черновой тайминг без аудио. Такой рендер помечен на экране
плашкой «ЧЕРНОВИК», а `render_and_check.sh` откажется его делать.

## Проверка выхода текста за кадр

`FitGuard` проверяет каждый видимый элемент с атрибутом `data-fit` на каждом кадре.
Если текст выходит за поля 24 px или переполняет свой блок, рендер падает с указанием
кадра и текста.
