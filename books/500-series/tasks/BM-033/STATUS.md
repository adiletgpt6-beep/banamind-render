# BanaMind BM-033 — STATUS

## CURRENT_STAGE: FILM_READY_LOCAL / RELEASE_BLOCKED_BY_GITHUB_BILLING — фильм 30:00 готов и проверен; приватный релиз не создан (Actions заблокированы биллингом)
Обновлено Claude Code: 2026-10-22. Ветка `feature/banamind-bm-033-dracula-stoker`, PR #158 (OPEN, не мержить, не публиковать).

### Сделано Claude Code
- [x] Checkout, `sha256sum -c` **12/12 OK**; 23 главы редакции 2013 и финал (part-12 L63–71) проверены; 23 vs 27 — EDITION_COMPARISON_AUDIT.md (27 глав — только внешняя справка).
- [x] Все 12 TXT прочитаны полностью; **65 опор** по всем 23 главам (`scripts/lesson-dracula/anchors.mjs`, тест дословности).
- [x] `books/dracula-stoker/scripts/`: SOURCE_MAP, EDITION_COMPARISON_AUDIT, CHARACTER_AND_TESTIMONY_MAP, RELIGIOUS_EDITORIAL_AUDIT, SAFETY_AND_DIGNITY_AUDIT, COPYRIGHT_AND_YOUTUBE_AUDIT, BRIEF, SCRIPT, STORYBOARD, VOICE_CUE_SHEET.
- [x] Сценарий «Бюро невозможных доказательств»: 68 сцен, 166 реплик, 3217 слов, 5 вопросов-пауз, 95 коротких цитат (дословно, в своих опорах). Тесты 12/12, captions-check 0 ошибок.
- [x] Озвучка ElevenLabs Eric (голос банана) 166/166 — CI run 39831973277, коммит `ed27a56`; ASR-проверка (faster-whisper) среднее 0,961, низкие оценки разобраны — артефакты распознавания (`video/qa-voice/`).
- [x] Пилот 0:38 — 1920×1080 H.264 30 fps, AAC 48 кГц, −17 LUFS, без чёрных кадров (`video/qa-pilot/`).
- [x] **Финальный фильм 30:00** (код `8e406a0`): 54 001 кадр, 1920×1080, 30 fps, H.264/AAC, −17 LUFS, 0 клиппированных сэмплов (мягкое колено в mixdown), без чёрных кадров; 36 контрольных кадров `video/qa-full/`, SRT `video/final-youtube.srt` (584 титра). Мастер 499 МБ SHA-256 `f9d90345…17e9`. Отрендерен в облачной сессии (тот же код и голос, что CI); передан владельцу вложением.
- [x] 5 обложек 1280×720 + contact sheet + 320×180; Hunspell ✓; различие ✓ (мин. 49,4); рекомендация №1 «ПОЧЕМУ МЫ БОИМСЯ?». Приватная галерея Claude (просмотр + ссылки на оригиналы в приватном репо): https://claude.ai/artifact/677V8SivoPJxxpbtzPswZJ; прямые оригиналы: `https://github.com/adiletzainidinov/balago-video/raw/feature/banamind-bm-033-dracula-stoker/books/dracula-stoker/thumbnails/thumbnail-0N.jpg` (нужен вход в GitHub; байты проверены = оригиналы). Локальная `thumbnail-gallery.mjs`: 6 view 200 / 6 download attachment, байты = оригиналы (localhost владельцу недоступен).
- [x] 5 названий + фаворит «Дракула: почему самый страшный вампир почти не рассказывает свою историю?» (`metadata/YOUTUBE_TITLES.md`), `meta.json`, `youtube.md/json` — 14 глав по реальной озвучке.

### Блокеры
- **GitHub Actions заблокирован биллингом аккаунта** (финальный CI run 39843954273: 8/8 частей рендера ✓, assemble — «account is locked due to a billing issue»). Релиз `book-dracula-stoker` не создан; из облачной сессии создание релизов запрещено (403), артефакты CI скачать нельзя (прокси).
- Права на публичный выпуск русского перевода 2013 не подтверждены; без auto-merge и YouTube.

**EXACT NEXT ACTION:** после восстановления биллинга — Actions → `lesson-dracula.yml` → Run workflow (`mode=full`) на этой ветке: озвучка из кэша, 8 частей, приватный pre-release `book-dracula-stoker` с `final-youtube.mp4`, превью 960×540, SRT и обложками. Затем добавить `books/dracula-stoker/book.json` (готовый шаблон — `books/dracula-stoker/book.json.template`, переименовать). Сценарий/озвучку не пересоздавать.

## Исходная постановка координатора (история)

**Дата:** 2026-10-22, Asia/Bishkek
**Книга:** Брэм Стокер — «Дракула» (переданная пользователем русская редакция 2013, 23 главы).
**Номер:** BM-033.
**Feature branch:** `feature/banamind-bm-033-dracula-stoker`.
**PR:** https://github.com/adiletzainidinov/balago-video/pull/158.
**TASK:** `books/500-series/tasks/BM-033/TASK.md`.
**SOURCE:** `books/500-series/sources/BM-033/README.md`, `manifest.json`, `source-checksums.sha256`, `part-01.txt`…`part-12.txt`.
**OUTPUT:** `books/dracula-stoker/`.

## CURRENT_STAGE: SOURCE_READY_IN_PRIVATE_GITHUB / PRODUCTION_NOT_STARTED

**Книга в конкретном русском издании 2013 реально загрузилась в приватный GitHub**, подготовленные главы 1–23, включая сюжетный финал, разбиты на **12 UTF-8 TXT**. **Каждый Git Blob SHA (12/12) отдельно проверен после GitHub upload и совпадает с локальной подготовкой; суммарно 627447 байт**. Это не placeholder. Claude Code после checkout читать source непосредственно из ветки, пользователь **не прикрепляет** книгу повторно.

**ВАЖНО**: английский оригинал 1897 имеет **27 глав**, наш русскоязычный файл 2013 — **23 главы с завершением повествования**. Не объявлять предоставленный русский текст полноценным несокращённым переводом оригинала. Вероятно сокращённое/переструктурированное издание. Не дополнять текст отсутствующими «главами» из памяти или нарушающих права внешних источников. В TASK есть отдельный `EDITION_COMPARISON_AUDIT.md`. Исторические и современные source assertions разделять.

## Подтверждённый источник

- Файл владельца: `Stoker_Drakula.459021.txt.zip`, **1 824 337 байт**, SHA256 `45338cd1766c128ea5847f1e3f660d1b3ca065b593992710cafffcac55685ea7`; ZIP CRC OK, 22 члена (один русский TXT + 21 JPG/PNG), графика не переносилась.
- Русский TXT `Stoker_Drakula.459021.txt`, **632927 байт**, SHA256 `5ea493380e046117e0dc9614c39cff4643b9f8a1ef0113f6b7c289a047da0a48`, 1883 строки, UTF-8. В нём © русского издания 2013 / Книжный Клуб «Клуб Семейного Досуга»; переводчик не установлен по данному тексту.
- Удалены **современная вступительная статья «Английская готика»**, строки copyright 2013, встроенные маркеры иллюстраций, обложка/изображения 21 штука, строка с ссылкой на сетевую библиотеку в конце. **Сами главы 1–23 и заключительная запись Джонатана Харкера сохранены в порядке присланного русского файла**. Документальная/письменная структура рассказа сохранена.
- 12 source части с техническими строками BanaMind по 2 главы (последняя глава 23 отдельно), общий **627447 UTF-8 bytes**; `manifest.json` содержит expected blob sha + SHA256 и исходные диапазоны; `source-checksums.sha256` — 12 записей. GitHub Contents API верифицировал каждую фактическую запись по Git blob SHA.
- Оригинал Стокера опубликован в 1897; русская редакция/перевод 2013 могут оставаться copyright protected. Не делать коммерческую замену чтения книги, не публиковать озвученный полный перевод/иллюстрации, не публиковать source на CDN. Отдельная проверка commercial publication rights / YouTube policies до релиза.

## DONE — координатор ChatGPT

- [x] Проверены LIVE `REGISTRY.csv`, HANDOFF, ветки и PR; BM-030, BM-031, BM-032 заняты параллельными чатами.
- [x] BM-033 назначен, отдельная feature branch создана от docs base, строка `CLAIMED` занята в REGISTRY (commit `bc6bd401ae35f2f05868a2fbef14f956ba282ff9`).
- [x] Проверен архив 22 файла, CRC OK, UTF-8 TXT, 23 главы и финал; отмечено отличие от английского 27-главного оригинала.
- [x] 12 TXT source parts подготовлены, все 12 физически записаны в GitHub и **12/12 Git Blob SHA подтверждены** (последняя часть commit `468bf71c28eab253fa1b8a954af5eb5f46c541aa`).
- [x] В GitHub создан `sources/BM-033/manifest.json`, `source-checksums.sha256`, `README.md` с полными checksum/rights/source оговорками.
- [x] Создан `tasks/BM-033/TASK.md` с оригинальной литературно-критической 30-минутной производственной задачей, пятью названиями и пятью JPG-концептами.
- [x] PR #158 открыт и URL закреплён; REGISTRY=SOURCE_READY (commit `d2c5b8418399706541078555fba3e7aeb7c69f85`), HANDOFF обновлён (commit `cfbc04d032ec3a6de3dc9890ada4c7af1ef0cfee`).
- [ ] GitHub Actions registry validation confirmed after PR.

## NEXT CLAUDE CODE ACTIONS (автономно, без повторной отправки книги)

- [ ] Checkout `feature/banamind-bm-033-dracula-stoker`, читать MASTER/PRODUCTION/WORKFLOW/SOURCE_INGESTION/source README/manifest/TASK/STATUS, затем все 12 parts.
- [ ] Из `books/500-series/sources/BM-033` запустить `sha256sum -c source-checksums.sha256` → 12/12 OK; отметить 23 главы предоставленного издания и отличие от 27 глав оригинала.
- [ ] Сделать 50–65 source anchors, `EDITION_COMPARISON_AUDIT.md`, `CHARACTER_AND_TESTIMONY_MAP.md`, `RELIGIOUS_EDITORIAL_AUDIT.md`, `SAFETY_AND_DIGNITY_AUDIT.md`, `COPYRIGHT_AND_YOUTUBE_AUDIT.md`.
- [ ] `BRIEF.md`, самостоятельный `SCRIPT.md`, `STORYBOARD.md` — оригинальное Бюро невозможных доказательств, не «краткая аудиокнига в 30 минут».
- [ ] Оригинальный PRIVATE 30–60 sec pilot: существующий banana host, гладкая Remotion-анимация архивных свидетельств, русская качественная VO, word-aligned captions, реальные QA и cost checkpoints.
- [ ] После QA/прав/бюджета оригинальный 29:30–30:30 H.264/AAC 1920×1080 30fps MP4, word-synced SRT, ffprobe и audio/video review.
- [ ] Пять непохожих добросовестных русских названий/фаворит, пять реально созданных JPG 1280×720 + contact sheet и proof 320×180. PRIVATE просмотр+скачивание каждой обложки и owner-only MP4/SRT с проверенными ссылками, без localhost fake URL.
- [ ] Сохранять настоящие коммиты/пути/links/QA в `STATUS.md`, не перезапускать уже сделанное и не трогать чужие BM.
- [ ] Никакого auto-merge или auto-YouTube publish; публикационные права не подтверждены.

**EXACT NEXT ACTION:** после checkout BM-033 открыть и проверить все 12 готовых TXT из GitHub, затем автономно строить source map, оригинальный сценарий и частный пилот. **Фильма, аудио и обложек на момент создания STATUS нет.**
