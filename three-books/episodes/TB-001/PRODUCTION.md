# TB-001 — где лежит производство Нокса

Исходный проект не утерян и не пересоздавался. Он живёт в рабочей ветке Claude Code, связанной с этим выпуском.

| Что | Где |
|---|---|
| Ветка производства | `ccr-431ff063-5lzbg4` (adiletzainidinov/balago-video) |
| Коммит финального рендера (версия без атрибуций) | `83431a3982c0ef7bc687c62e50a90578a2733a9b` |
| Коммит пяти обложек и контакт-листа | `283b46aa` (только материалы, без перерендера) |
| Каталог проекта | `films/nox/` в ветке производства |
| Канонический сценарий | `films/nox/script/script.md` (15 глав × 120 с, 116 блоков речи) |
| Озвучка по блокам | `films/nox/voice/blocks/*.mp3` + посимвольные тайминги `*.json`, `manifest.json`, `asr.json` |
| Настройки голоса | `films/nox/voice/voice_settings.json` (копия без секретов: [VOICE_SETTINGS.json](VOICE_SETTINGS.json)) |
| Пробы голосов | `films/nox/voice/pilot/` (10 голосов, F0, Whisper) |
| Движок частиц | `films/nox/engine/` (`gl.py`, `fox.py`, `shapes.py`, `film.py`, `stage.py`, `text.py`, `render.py`) |
| Постановка глав | `films/nox/engine/scenes/ch01.py … ch15.py` |
| Звук, субтитры, проверка, обложки, документы | `films/nox/tools/` (`voice.py`, `asr.py`, `asr_check.py`, `mix.py`, `subs.py`, `verify.py`, `thumbs.py`, `docs.py`) |
| Внутренние документы | `films/nox/docs/` (`source_map.md`, `ledger.md`, `storyboard.md`, `timeline.json`, `asr_report.md`, `qa_report.md`, `asset_licenses.md`) |
| Файлы для релиза | `films/nox/release/` |
| CI | `.github/workflows/nox-film.yml` в ветке производства |
| Релиз с результатами | https://github.com/adiletzainidinov/balago-video/releases/tag/nox-film |

## Как продолжать без повторного производства
Метки в сообщении коммита ветки производства:
- `[nox:voice]` — синтезирует только блоки с изменённым текстом (кэш по тексту и настройкам) и проверяет их Whisper;
- `[nox:render]` — полный рендер 15 параллельными сегментами по 3600 кадров, склейка без перекодирования,
  сведение, SRT/VTT, `verify.py`, публикация в `nox-film`;
- `[nox:assets]` — только дозагрузка `films/nox/release/*` в релиз, без рендера.
Локально: `cd films/nox/engine && python3 render.py --stills 5,90 --outdir ../out/stills` (кадры),
`python3 render.py --from 7200 --to 10800 --out ../out/part.mp4` (отрезок). Подробно: `films/nox/README.md`.

Секрет `ELEVENLABS_API_KEY` хранится только в секретах GitHub Actions; в репозитории ключей нет.
Ветка производства не слита в main. До решения владельца о merge её нельзя удалять: это единственное место кода TB-001.
