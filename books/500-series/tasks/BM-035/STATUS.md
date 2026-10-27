# BanaMind BM-035 — STATUS / точка передачи Claude Code

**Дата координации:** 2026-10-23 (Asia/Bishkek).
**Название:** Чарлз Дахигг «Сила привычки».
**BM-ID:** BM-035 (уже предварительно CLAIMED другим ChatGPT-чатом для этой же книги; не занимать отдельный BM-номер).
**Branch:** `feature/banamind-bm-035-power-of-habit-duhigg`.
**PR:** https://github.com/adiletzainidinov/balago-video/pull/161
**TASK:** `books/500-series/tasks/BM-035/TASK.md`.
**SOURCE:** `books/500-series/sources/BM-035/part-01.txt`…`part-16.txt`, `README.md`, `manifest.json`, `source-checksums.sha256`.

## CURRENT_STAGE = IN_PRODUCTION — сценарий, анимация, 5 обложек, документы готовы; чистовая озвучка и финальный MP4 BLOCKED (GitHub Actions не стартуют)

**Обновлено Claude Code:** 2026-10-23 (UTC 22:5x 2026-10-22). Работа идёт в этой ветке и PR #161; книгу повторно не запрашивать.

### Сделано (проверено)
- [x] `sha256sum -c source-checksums.sha256` → **16/16 OK**; все 16 частей прочитаны полностью; карты `books/power-of-habit-duhigg/scripts/source-map/part-01…16.md` — **915 якорей**, цитаты карт сверены побайтно.
- [x] Документы: `BRIEF.md`, `SOURCE_MAP.md` (67 сцен → строки источника, 53 цитаты), `COVERAGE.md` (вступление, все 9 глав трёх частей, приложение, примечания), `HABIT_LOOP_MAP.md`, `CLAIM_AND_EXPERIMENT_AUDIT.md`, `RELIGIOUS_EDITORIAL_AUDIT.md`, `SCRIPT.md`, `STORYBOARD.md`, `VOICE_CUE_SHEET.md` (папка `books/power-of-habit-duhigg/scripts/`).
- [x] Фильм «Лаборатория невидимых кнопок»: `src/lesson-duhigg/` (тот же банан, `BanaMindAnimatedCaptions`, метки типа утверждения), 67 сцен / 164 реплики / ≈ 3 230 слов, 6 пауз-вопросов, 27 видов анимированных сцен; `scripts/lesson-duhigg/` (тесты **11/11**: цитаты дословны, охват всех глав, ≥ 60 опор, «вы», нет таймеров, титры = сценарий); CI `.github/workflows/lesson-duhigg.yml` (ElevenLabs Eric → пилот/полный рендер → релиз `book-power-of-habit-duhigg`).
- [x] Тайм-лайн собирается ровно в **30:00** (проверено на черновом голосе: естественная речь 26:15 + паузы; итог для ElevenLabs пересчитается автоматически).
- [x] **Полный черновой фильм отрендерен в контейнере** (все 54 000 кадров, ≈ 45 мин): 1920×1080, 30 fps, H.264/AAC 48 кГц, **30:00 (1799,97 с)**, −17,1 LUFS, без чёрных кадров (`books/power-of-habit-duhigg/video/qa-draft/`: verify, ffprobe, 36 кадров, черновой SRT 506 титров). Голос — RHVoice, только для проверки; превью 960×540 отправлено владельцу файлом в чат. Финальный MP4 с голосом банана — после восстановления Actions.
- [x] Черновой пилот 0:37 отрендерен в контейнере: 1920×1080, 30 fps, H.264/AAC 48 кГц, −17 LUFS, без чёрных кадров (`verify.mjs` ✓). **Голос черновой RHVoice, не голос банана — не для публикации.**
- [x] 5 обложек `books/power-of-habit-duhigg/thumbnails/thumbnail-01…05.jpg` (1280×720 JPEG sRGB, 128–176 КБ), `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`, `checks.json` (орфография ✓, различие ✓ мин. 38 при пороге 25). Рекомендую №2 «ПОЧЕМУ ОПЯТЬ?».
- [x] Галерея `thumbnail-gallery.mjs` проверена по HTTP: 5× просмотр 200, 5× скачивание 200 с `Content-Disposition: attachment`, байты = оригиналам (локальный сервер облачного контейнера владельцу недоступен).
- [x] Приватная страница просмотра (claude.ai, только владелец): https://claude.ai/artifact/VvJVCcZHSJRygb1DfGR2rf — 5 обложек «Просмотреть №N», контакт-лист, 320×180, черновой пилот 1080p.
- [x] Скачать оригиналы JPG (нужен вход в GitHub с доступом к репозиторию): https://github.com/adiletzainidinov/balago-video/raw/feature/banamind-bm-035-power-of-habit-duhigg/books/power-of-habit-duhigg/thumbnails/thumbnail-01.jpg … `thumbnail-05.jpg`, `thumbnail-contact-sheet.jpg` (наличие в ветке и совпадение байтов проверены через API).
- [x] 5 названий + фаворит, описание, теги, 15 глав: `books/power-of-habit-duhigg/metadata/meta.json`, `YOUTUBE_TITLES.md` (таймкоды глав → `youtube-meta.mjs` после финальной озвучки).

### Пять названий (фаворит — №1)
1. **Почему мы повторяем одни и те же ошибки? Сила привычки за 30 минут** — МОЙ ФАВОРИТ
2. Как формируются привычки? Три шага, которые мы не замечаем
3. Сила привычки: что происходит в мозге, когда мы действуем автоматически
4. Почему одной силы воли мало? Разбираем Чарлза Дахигга
5. Как привычки управляют компаниями и обществом? Неожиданная сторона книги
Обложки: №1 КТО УПРАВЛЯЕТ? · №2 ПОЧЕМУ ОПЯТЬ? (рекомендую) · №3 3 НЕВИДИМЫХ ШАГА · №4 ВОЛЯ НЕ ПОМОЖЕТ? · №5 МЕНЯЕТСЯ ВСЁ.

### BLOCKED — что мешает финалу
1. **GitHub Actions не стартуют во всём репозитории** с ≈ 22:25 UTC 2026-10-22: каждый запуск (main, BM-035, BM-037, BM-040, docs) — `startup_failure` без единого шага (например https://github.com/adiletzainidinov/balago-video/actions/runs/39867737904). Workflow-файлы валидны (actionlint чистый). Так обычно выглядит исчерпанный лимит минут/расходов Actions или проблема с оплатой — проверить в Settings → Billing / Actions владельцу.
2. **ElevenLabs** (голос банана Eric) доступен только через секрет в CI; из контейнера `api.elevenlabs.io` запрещён прокси.
3. **OpenAI API** (`BalaGo Audio QA`): `credit_balance_exhausted`.
4. Этой сессии запрещено создавать GitHub Releases — финальные MP4/SRT публикует workflow.

## EXACT NEXT ACTION
Когда Actions снова стартуют: запустить workflow «BanaMind BM-035 — Дахигг, Сила привычки» вручную (`mode=pilot`) или запушить коммит в `src/lesson-duhigg/**`. Он озвучит все 164 реплики голосом ElevenLabs Eric (кэш по хэшу), сделает ASR-проверку, пилот и релиз `book-power-of-habit-duhigg`. После проверки пилота — коммит с «[full]» (8 параллельных частей) → `final-youtube.mp4`, SRT, QA-кадры, превью 960×540 в приватном релизе. Затем `node scripts/lesson-duhigg/docs.mjs` и `node scripts/books/youtube-meta.mjs power-of-habit-duhigg` — таймкоды. Не мержить PR и не публиковать на YouTube без владельца.
Альтернатива без Actions: при доступе к ElevenLabs из другой среды — `ELEVENLABS_API_KEY=… node scripts/lesson-duhigg/voice.mjs`, затем локальный рендер (в контейнере ≈ 18 кадров/с → полный фильм ≈ 50 мин).

---

## История подготовки источника (координатор)


**Книга уже в приватном GitHub:** все 16 source TXT созданы и **16/16 проверены по actual Git Blob SHA после Github fetch**, включая ранее выложенные части 01–04. Суммарно **1 066 349 байт** с короткими служебными заголовками; original source file UTF-8 1 064 028 байт, 1517 строк. Основной текст **строки 2–1516**: вступление, индивидуальные привычки, организационные привычки, общественные привычки, приложение и примечания. Последний watermark распространителя исключён, встроенные картинки-метки исключены, вложенные 46 изображений не загружались.

ZIP `Dahigg_Sila-privychki.389992.txt.zip`, **5 864 498 байт**, SHA256 `e61ea386ce8a2304c8e1f394bf058fef92400fb4f6d6f2e1ae0c90d7f6bfa3df`, проверка ZIP CRC OK. Основной TXT SHA256 `75588c0cf359d18fd40f70da0c35614354e34158c70e4551006167b4792d4189`.

### Что уже реально сделано

- [x] Live `REGISTRY.csv`, `HANDOFF.md`, ветки и PR проверены; обнаружено **BM-035 уже закреплён за этой же книгой**. Дублирующую BM-036 не создавать — она занята отдельной книгой «Самый богатый человек в Вавилоне».
- [x] Найдена существующая ветка `feature/banamind-bm-035-power-of-habit-duhigg` и исходные части 01–04, их content не перезаписан.
- [x] Проверен исходный ZIP, CRC OK, source SHA и структура.
- [x] Реально дополнены части 05–16, затем remote SHA Git Blob 16/16 проверен по байтовым оригиналам. Для исходных частей 1–4 установлена точная нормализация картинок и пробельной строки, получено идентичное байтовое соответствие remote SHA.
- [x] Подготовлены `manifest.json` со всеми range, bytes, Git Blob SHA и SHA256; `source-checksums.sha256` для повторной проверки.
- [x] README с описанием и обязательной последовательностью работы в приватном GitHub.
- [x] Составлен подробный book-specific `TASK.md` на оригинальный 30-минутный научно-популярный анимационный фильм, прежний BanaMind банан, естественный русский голос, word-captions, SRT, 5 разных настоящих thumbnails и галерея.
- [x] PR #161 открыт; REGISTRY=SOURCE_READY (commit `abebb051f2acddf7c647459d71827aab352ffcd0`) и HANDOFF обновлён (commit `c3724445bf3c2d6b2e79d821a13ff914c7bd74d0`).
- [x] GitHub Actions `BanaMind — validate 500-book registry (docs only)` завершилась `success` для PR #161 (проверено 2026-10-23).\n- [x] Независимая повторная проверка в GitHub: 16/16 Git Blob SHA точно совпали с `sources/BM-035/manifest.json`, суммарно 1 066 349 байт.\n- [x] PR #161 открыт, при повторной проверке GitHub сообщил `mergeable: true`; автоматическое объединение не выполнялось.

### Claude Code — сразу после короткого промпта

- [ ] Checkout этой feature branch; прочитать MASTER_CLAUDE, PRODUCTION, WORKFLOW, TASK, STATUS, README, manifest и **все 16 TXT**.
- [ ] `cd books/500-series/sources/BM-035 && sha256sum -c source-checksums.sha256` → **16/16 OK**.
- [ ] Создать 60 проверенных source anchors, `HABIT_LOOP_MAP.md`, `CLAIM_AND_EXPERIMENT_AUDIT.md`, `BRIEF.md`, `SCRIPT.md`, `STORYBOARD.md`, `VOICE_CUE_SHEET.md`. Разделить факты исходника от собственного примера BanaMind.
- [ ] Сделать **реальный** 30–60с пилот с бананом, цветными точками, приятным русским голосом и анимированными синхронными субтитрами; провести визуальный/аудио QA.
- [ ] Собрать оригинальный **29:30–30:30** Full HD 1920×1080 H.264/AAC 30FPS MP4, естественная русская VO, word-aligned captions и SRT.
- [ ] Подготовить 5 разных русских заголовков с фаворитом и 5 действительно разных профессиональных JPG 1280×720, contact sheet, мобильное QC 320×180; проверить приватные ссылки просмотра и скачивания JPG/MP4/SRT.
- [ ] Сохранять реальный progress/коммиты/файлы/результаты QA в STATUS; не выдумывать готовые MP4, TTS и обложки.
- [ ] Не перезапускать прочитку файла из другого чата, не трогать чужие BM; не делать auto-merge или auto-publish.

**ТЕКУЩАЯ ИСТИНА:** весь исходник доступен в GitHub и сверяется по SHA; **готового фильма, озвучки и пяти обложек пока нет**. Claude Code должен начать работу **без повторного вложения книги**.
