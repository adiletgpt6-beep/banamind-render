# BM-037 — STATUS

- **CURRENT_STAGE: QA_REVIEW** — полный фильм готов и проверен; озвучка временная (локальный голос), замена на Eric ждёт восстановления GitHub Actions
- **SOURCE_READY_IN_GITHUB: TRUE**
- Книга: Джим Коллинз — «От хорошего к великому».
- Ветка: `feature/banamind-bm-037-good-to-great-collins`.
- **PR #165:** https://github.com/adiletzainidinov/balago-video/pull/165 (draft, не объединён).
- Проверено UTC: `2026-10-22T22:42:52.011Z` (2026-10-23 по Бишкеку).
- Источник: `books/500-series/sources/BM-037/`; source commit `2e6c4483d9c37539eeeeced440af32e7f853ed26`.
- Порядок: `PRODUCTION_RULES.md` → `TASK.md` → этот STATUS → source README/manifest/SOURCE_QUALITY/FIGURE_INDEX и все TXT/JPG.

## Подтверждено

- BM-037 закреплён после живой проверки REGISTRY/HANDOFF/веток/PR, с проверкой ожидаемого SHA ветки. BM-035/036 уже заняты; их задания не менялись.
- ZIP: 3251310 байт, CRC 70/70 OK, SHA-256 `7d0dfe950077031feb17e72ce8e7616d03355270243882373abe63e0e951b6ba`.
- **25 UTF-8 TXT / 968646 байт / 2251 строка**: весь текст присланной копии 1–2251, девять глав с примечаниями, предисловия, эпилог/FAQ, восемь приложений, все 62 завершающих примечания. Исключён только интернет-футер 2252; внешняя сверка издания не выполнялась.
- Все **68/68 оригинальных JPEG таблиц/схем/графиков**, 3317129 байт. Маркеры TXT разрешаются через figures/. Не включён только cover.jpg.
- **98/98 файлов** source pack независимо прочитаны обратно из GitHub: содержимое и Git Blob SHA точно совпали. JPEG проверены по полному base64. Удалённое дерево дополнительно подтвердило все размеры/SHA.
- Локально `sha256sum -c source-checksums.sha256`: **93/93 OK**. SHA-256 конкатенации TXT: `7580ae6b28f6ae6b08f8db18959cf00c1e79886d0975b79607efe83d95e47810`.
- Доказательство: `SOURCE_VERIFICATION.json` рядом с этим файлом. TASK/PRODUCTION_RULES готовы: концепция «Двигатель прорыва», план 30 минут, источниковая карта и требования ко всем результатам.
- **Повторно прикреплять книгу в Claude Code НЕ НУЖНО.** Читать её прямо из feature-ветки после повторной проверки checksum.

## Производство (Claude Code)

- 2026-10-22: checkout ветки, `sha256sum -c source-checksums.sha256` — **93/93 OK**, SHA-256 конкатенации TXT `7580ae6b…5e47810` совпал.
- Pipeline повторяет проверенный BM-025: `src/lesson-collins/` (Remotion, тайм-лайн по озвучке, банан `src/banana-host/`, `BanaMindAnimatedCaptions`), `scripts/lesson-collins/` (ElevenLabs Eric с таймкодами букв, SRT, микс, проверки), `.github/workflows/lesson-collins.yml` (voice → voice-qa → 8×render → assemble → приватный pre-release `book-good-to-great-collins`).
- **Источник прочитан полностью:** все 25 TXT (2251 строка) построчно и все 68 JPG открыты и расшифрованы → `books/good-to-great-collins/scripts/source-map/01…05-*.md` (факты со ссылками `part-NN.txt:Lx (orig Ly)`, рисунки с осями/периодами/значениями, опечатки, решения по каждому разделу).
- Сценарий `src/lesson-collins/script.ts`: 68 сцен, 198 реплик, ≈3770 слов; 11 автоматических проверок (`scripts/lesson-collins/script.test.mjs`): числа ↔ строки книги/рисунки, дословность цитат, «вы», без латиницы в речи (точные таймкоды титров), без рекламы и таймеров — **11/11 pass**.

### Блокер CI и обход (2026-10-22, 23:13 UTC)

- Пуш `3b04727` с меткой `[pilot]`: **GitHub Actions ответил `startup_failure` без создания jobs** (run 39870346714). Так же падают **все** прогоны репозитория на всех ветках (main, BM-031, BM-034, BM-041, BM-042…) примерно с **2026-10-22 21:12 UTC**; последний успешный — book-assets 39847424067 в 20:16 UTC. Вероятная причина — лимит минут/расходов Actions аккаунта; проверить может только владелец (Settings → Billing → Actions).
- Голос ElevenLabs Eric синтезируется только в CI (ключ — секрет репозитория); `api.elevenlabs.io` закрыт сетевой политикой этой среды; у OpenAI-ключа среды `insufficient_quota`.
- **Обход:** локальная озвучка Piper ru_RU **ruslan** (sherpa-onnx, модель с GitHub-релиза) + распознавание **zipformer-ru** для реальных таймкодов слов (`scripts/lesson-collins/tts_local.py`, `align.mjs`): 93 % слов сопоставлены с распознанной речью напрямую, остальные — между соседними опорами. Числа произносятся с падежами по `src/lesson-collins/say.ts`. Рендер Remotion — локально (Chromium headless, 4 потока, ≈23 кадра/с).
- **Это не установленный голос банана.** Чтобы заменить на Eric: восстановить Actions и запустить workflow `lesson-collins.yml` с `mode=full` (озвучка ElevenLabs по тем же сценарию/таймлайну, voice-qa, 8 частей рендера, сборка, приватный pre-release `book-good-to-great-collins`).

### Сделано

- [x] Сценарий 71 сцена / 206 реплик / ≈3900 слов, 11/11 тестов, титры 0 ошибок.
- [x] Пилот 60 с (локально): 1920×1080, 30 fps, H.264/AAC 48 кГц, −17,5 LUFS, без чёрных кадров; кадры и SRT проверены.
- [x] Пять названий (фаворит №4) и пять обложек 1280×720 (орфография ✓, различие ✓, 320×180 ✓, контакт-лист); галерея `thumbnail-gallery.mjs` на 127.0.0.1:8765 — 10/10 эндпоинтов 200, SHA совпали, download = attachment (доступна только внутри облачной машины, владельцу не выдаётся). Долговременно: оригиналы в git (коммит `392bb39`) и приватная страница https://claude.ai/artifact/XfzrYhGami7zPqzAPTKBHw.
- [x] Документы: BRIEF, SCRIPT, STORYBOARD, SOURCE_MAP, CONTENT_REVIEW, IMPROVEMENTS_100, metadata (главы по реальному тайм-лайну), `video/voice-words.json`.
- [x] **Полный MP4** (локальный рендер, 2026-10-23 00:16 UTC): 1920×1080, 30 fps, H.264/AAC 48 кГц, **30:00 (1800,02 с)**, 54 000 кадров, −18,6 LUFS, faststart, без чёрных кадров; стыки 4 частей проверены кадрами; SRT 617 блоков без пересечений. Подробно — `books/good-to-great-collins/video/QA.md`.
- [x] Выдача (вложения в чат Claude Code): превью 960×540 (80 МБ, «Посмотреть») и оригинал `final-youtube-1080p.mp4` 1920×1080/30 fps/H.264/AAC 30:00, 367,7 МБ (SHA-256 `4eab265a…`; мастер 523,9 МБ, SHA-256 `49595cc7…` не вложен из-за лимита 400 МиБ). GitHub Release не создан (Actions не стартует, инструмента публикации релизов нет).
- [x] REGISTRY: BM-037 → `QA_REVIEW` (validate-registry OK).

## Точка продолжения

1. Владельцу: проверить GitHub → Settings → Billing → Actions (лимит минут/расходов); `startup_failure` у всех workflow с 2026-10-22 21:12 UTC.
2. После восстановления: Actions → «BanaMind BM-037 — От хорошего к великому» → Run workflow, ветка `feature/banamind-bm-037-good-to-great-collins`, `mode=full`. Озвучка ElevenLabs Eric (кэш по хэшу пересинтезирует все 206 реплик), voice-qa, 8 частей рендера, сборка, приватный pre-release `book-good-to-great-collins` с MP4, превью, SRT, обложками.
3. После этого прогона — сверить `video/qa-full/` и `qa-voice/`, обновить ссылки в `video/README.md` на релиз, `QA.md`, главы `metadata/youtube.json` (`node scripts/lesson-collins/meta.mjs` по новому тайм-лайну).

## Следующие этапы Claude Code

- [x] Подготовка, загрузка и проверка полного source pack.
- [x] Индивидуальные TASK и PRODUCTION_RULES, ветка и PR.
- [x] Полное чтение 25 TXT и соответствующих изображений; SOURCE_MAP (карты по частям).
- [ ] BRIEF, SCRIPT, STORYBOARD, CONTENT_REVIEW и 100 конкретных улучшений.
- [ ] Настоящая VO, выравнивание слов, липсинк, динамические captions и SRT.
- [ ] Пилот 30–60 секунд с QA/исправлениями.
- [ ] Полный 29:30–30:30 MP4, Full HD 30 fps H.264/AAC, QA/ffprobe.
- [ ] Пять разных названий/фаворит и пять готовых JPG 1280×720, контакт-лист, читаемость/орфография.
- [ ] Пять проверенных пар view/download, PRIVATE gallery URL и долговременные оригиналы.
- [ ] Ссылки просмотра/скачивания видео, метаданные/главы и итоговый QA.

**Фильм, сценарий Claude, пилот, VO, SRT, JPG и ссылки на них пока не созданы.** Текущая готовность относится к источнику и заданию.

## Точная точка продолжения

1. Checkout `feature/banamind-bm-037-good-to-great-collins`, прочитать PRODUCTION_RULES/TASK и source README.
2. В `books/500-series/sources/BM-037/` выполнить `sha256sum -c source-checksums.sha256` и `cat part-*.txt | sha256sum`.
3. Прочитать все 25 частей с контролем непрочитанных диапазонов, открыть JPG по FIGURE_INDEX; SOURCE_MAP привязать к локальным и исходным строкам, периодам и осям графиков.
4. Автономно пройти сценарий → пилот/исправления → полный фильм → пять обложек/галерея → QA и реальные ссылки. После каждого этапа обновлять STATUS и коммиты, продолжать с последнего подтверждённого результата.

Блокеров источника нет. TTS/рендер проверяет Claude при запуске; при реальной ошибке сохранить текст ошибки и точку продолжения. Не публиковать видео и не объединять PR автоматически; другие BM не изменять.

