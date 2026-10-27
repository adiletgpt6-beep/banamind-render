# BM-032 — Шарлотта Бронте «Джейн Эйр» — STATUS / 2026-10-22

**CURRENT_STAGE:** `QA_REVIEW — фильм 30:00, SRT, 5 обложек, 5 названий и метаданные готовы; ждут владельца. Публикация релиза в CI заблокирована startup_failure Actions (см. ниже)`

PR #157 не мержится, на YouTube ничего не публикуется — решения владельца.

## Результат (Claude Code, 2026-10-22)
- **Фильм:** «Джейн Эйр: цена собственного голоса» — 1920×1080, 30 fps, H.264 High yuv420p BT.709, AAC 48 кГц, **30:00 (1800,03 с)**, −17 LUFS, без чёрных кадров и тишины ≥ 7 с. Голос — постоянный банан BanaMind (ElevenLabs Eric). 68 сцен, 195 реплик, 6 пауз-вопросов, анимированные титры BanaMind по таймингам слов.
- **Выдача видео:** превью 960×540 (98,7 МБ) и полный `final-youtube.mp4` 1920×1080 (382 МБ, sha256 `e68857d1…bad8`; x264 2-pass `-tune animation`, SSIM 0,997 к исходному рендеру 540 МБ — лимит вложения 400 МиБ) + `final-youtube.srt` переданы владельцу вложениями в чате Claude Code (сессия https://claude.ai/code/session_011oh26AjYuhWoaZbQm5MqS5). Рендер — в контейнере Claude Code из коммита `922fec1` (полная озвучка), тем же кодом, что в CI.
- **Почему не GitHub Release:** CI-прогон 39837767890 озвучил и отрендерил все 8 частей (артефакты `jane-part-*`, 3 дня), но assemble не получил раннер; с ~20:40 UTC **все** Actions репозитория (и других BM) завершаются `startup_failure` — ограничение аккаунта/минут. `gh`-токена в контейнере нет, MCP GitHub не загружает release assets.
  - **Когда Actions работают:** Actions → «BanaMind BM-032 — Джейн Эйр» → Run workflow → `mode=assemble`, `run_id=39837767890` → приватный pre-release `book-jane-eyre-bronte` (`final-youtube.mp4`, `final-youtube-preview-960x540.mp4`, `final-youtube.srt`). Если артефакты истекли — `mode=full` (озвучка из кэша). После появления видео в релизе переименовать готовый `books/jane-eyre-bronte/book.pending.json` в `book.json` — `book-assets.yml` выложит обложки и метаданные в тот же релиз.
- **SRT:** `books/jane-eyre-bronte/video/final-youtube.srt` (589 титров; синхрон проверен).
- **Обложки:** `books/jane-eyre-bronte/thumbnails/thumbnail-01…05.jpg` + `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`, `checks.json` (1280×720, ≤ 2 МБ, Hunspell ✓, различие ✓). Рекомендация **№5 «ЦЕНА СВОЕГО ГОЛОСА»**.
  - **Приватная страница просмотра/скачивания:** https://claude.ai/artifact/TqpeGy6aBS9DtYiUbU6cn3 — 5 × «Просмотреть №N» (оригиналы встроены) + 5 × «Скачать №N» (оригинальные JPG из ветки, нужен вход в GitHub) + лист.
  - Прямые ссылки (вход в GitHub): `https://github.com/adiletzainidinov/balago-video/raw/feature/banamind-bm-032-jane-eyre-bronte/books/jane-eyre-bronte/thumbnails/thumbnail-0N.jpg` (N=1…5), `…/thumbnail-contact-sheet.jpg`. Байт-в-байт = локальные файлы (sha256 сверены). Анонимно — 404 (репозиторий приватный).
  - Локальная галерея `thumbnail-gallery.mjs` проверена по HTTP: 6 × view 200 image/jpeg, 6 × download с `Content-Disposition: attachment`, байты совпадают; localhost контейнера владельцу недоступен — поэтому страница claude.ai.
- **5 названий** (`metadata/YOUTUBE_TITLES.md`): 1 ★ МОЙ ФАВОРИТ «Джейн Эйр: сколько стоит собственный голос?»; 2 «Почему Джейн Эйр ушла от любимого? Разбор романа Шарлотты Бронте»; 3 «Любовь или свобода: главный выбор Джейн Эйр»; 4 (SEO) «Шарлотта Бронте «Джейн Эйр»: смысл романа простыми словами»; 5 «Сироту назвали лгуньей. Как Джейн Эйр отстояла своё «нет»». Тексты обложек: «ДЖЕЙН ЭЙР», «ЛЮБОВЬ ИЛИ СВОБОДА?», «ПОЧЕМУ ОНА УШЛА?», «20 000 НА ЧЕТВЕРЫХ», «ЦЕНА СВОЕГО ГОЛОСА».
- **Метаданные:** `metadata/youtube.md/json` — описание (спойлер-предупреждение, разграничение голосов, права), 14 тегов, 13 глав по реальной озвучке (0:00 … 28:40).
- **Документы:** `scripts/source-map/part-01…25.md`, `SOURCE_MAP.md` (106 опор), `COVERAGE.md` (38 глав; 37 — прямые опоры), `BRIEF.md`, `SCRIPT.md` и `STORYBOARD.md` с таймкодами, `FACT_CHECK.md`, `QA.md`.

## Проверено
- Источник 25/25 SHA-256; сценарий: тесты 10/10, 152 цитаты дословно, опоры внутри глав по manifest; обращение на «вы».
- Озвучка: ASR среднее 0,953 (`video/qa-voice/voice-asr.md`), расхождения — ошибки распознавателя.
- Видео: `video/qa-full/` (ffprobe, verify, captions-check, 36 кадров), пилот `video/qa-pilot/` (53,5 с), 68 кадров сцен просмотрены.

## Ограничения и права
- Права на предоставленный русский перевод не подтверждены: только приватная подготовка; цитаты короткие и разрозненные (≈1080 слов, ≈0,6 % романа), но решение о публикации — за владельцем.
- Звук моно (как в других BanaMind). Порт фикса валидатора реестра из базовой ветки (статусы CLAIMED/PREPARING), иначе PR-проверка падала из-за записей других BM.

**NEXT_STEP (владелец):** посмотреть фильм, выбрать название и обложку, решить вопрос прав. Для правок: `src/lesson-jane/script.ts` / `visuals/*` → push (озвучиваются только изменённые реплики); `[pilot]` в сообщении коммита — пилот, `[no render]` — только озвучка.

**Repository:** `adiletzainidinov/balago-video` (PRIVATE).
**Branch:** `feature/banamind-bm-032-jane-eyre-bronte`.
**PR:** https://github.com/adiletzainidinov/balago-video/pull/157
**TASK:** `books/500-series/tasks/BM-032/TASK.md`.
**Source:** `books/500-series/sources/BM-032/`.

## DONE — подтверждено
- [x] Реальный live REGISTRY/HANDOFF/ветки/PR проверены; BM-032 закреплён именно за книгой Шарлотты Бронте. BM-030, BM-031, BM-033, BM-034 принадлежат другим рабочим чатам, их ветки/PR не изменять.
- [x] ZIP `Bronte_Dzheyn-Eyr.228199.txt.zip`, 596117 байт, CRC OK, SHA-256 `c459fc2b96c34082330950f493027fa07f41717c6d335f1eaaf429bdd4113d2f`. UTF-8 TXT, 1832460 байт, 4405 строк, SHA-256 `3cc373c36b1a506da99c845f554612c4b41060881a82ec17ef5cab8927163fb8`.
- [x] Полный основной роман: **38 глав, авторское предисловие, финал, примечания**. 25 упорядоченных UTF-8 `part-01.txt`…`part-25.txt`, **1832397 байт**, SHA-256 объединённого текста `a5deb366a7f12c8b44138f56d2305d1caf391fec10bd5d9314d006de571b1e8c`. Исключены только JPG и последняя строка с URL чужого ресурса.
- [x] **Источник ФАКТИЧЕСКИ В GitHub**: Git commit `53d2dc0b5b0b1136415f5079210e736b71d6728a`. Директория прочитана после обновления branch; все **25 TXT и 3 метафайла (28/28)** присутствуют, размеры и Git Blob SHA совпадают с байтовыми оригиналами. Промежуточный сбой передачи `container_session_expired` обойдён через защищённую передачу source blobs, проблемы с наличием GitHub source **больше нет**.
- [x] Локальный `sha256sum -c source-checksums.sha256` показывает **25/25 OK**; контроль общего текста сверился с README. Claude должен независимо повторить после checkout.
- [x] Подробный book-specific TASK и паспорт источника написаны, PR #157 открыт.
- [ ] Claude Code SOURCE_MAP на 38 глав / COVERAGE / BRIEF / SCRIPT / STORYBOARD; pilot 30–60s; озвучка и титры; финальный MP4/SRT; 5 YouTube названий и 5 оригинальных JPG 1280×720, contact sheet и подтверждённая PRIVATE галерея просмотра/скачивания — **пока не произведены**.
- [ ] Права на конкретный русский перевод и коммерческую адаптацию не проверены; никакого публичного релиза, auto-merge, auto-YouTube-upload.

## Проверка в Claude Code
```bash
git fetch origin feature/banamind-bm-032-jane-eyre-bronte
git checkout feature/banamind-bm-032-jane-eyre-bronte
(cd books/500-series/sources/BM-032 && sha256sum -c source-checksums.sha256)
(cd books/500-series/sources/BM-032 && cat part-*.txt | sha256sum)
```

Должно быть 25/25 OK; итог `a5deb366a7f12c8b44138f56d2305d1caf391fec10bd5d9314d006de571b1e8c`.
Если есть конфликты локального checkout — использовать отдельный git worktree, не сбрасывать чужой прогресс.

## NEXT_STEP
Немедленно начинать PRIVATE производство по TASK: прочитать MASTER_CLAUDE, PRODUCTION, WORKFLOW, SOURCE_INGESTION, README, **все 25 TXT**, сверить SHA, создать SOURCE_MAP и COVERAGE по всем 38 главам, написать самостоятельный сценарий и раскадровку, затем пилот и QA. Не просить книгу повторно: **SOURCE_AVAILABILITY = TRUE IN PRIVATE GITHUB**. Сохранять чекпоинты сюда после каждого этапа. Не публиковать ролик/источник и не объединять PR.

## Запуск Claude Code
```text
BanaMind BM-032, «Джейн Эйр», PR #157, ветка feature/banamind-bm-032-jane-eyre-bronte. Прочитай books/500-series/tasks/BM-032/TASK.md и STATUS.md, MASTER_CLAUDE/PRODUCTION/WORKFLOW, README + все 25 TXT из books/500-series/sources/BM-032/. Проверь SHA256 25/25 и начинай приватное производство 30-минутного оригинального анимационного фильма по TASK, включая пилот, озвучку, SRT, 5 названий и 5 JPG с приватным просмотром/скачиванием. Сохраняй прогресс STATUS; книгу не запрашивай, чужие BM не трогай, не merge, не публикуй на YouTube.
```
