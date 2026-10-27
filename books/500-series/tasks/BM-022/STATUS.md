# BM-022 — STATUS / контрольная точка

**Дата:** 2026-10-22 (Asia/Bishkek)
**Книга:** Стивен Р. Кови — «7 навыков высокоэффективных людей».
**Ветка:** `feature/banamind-bm-022-seven-habits-covey` (зеркало: `claude/bm-022-seven-habits-film-8mrfpk`)
**PR:** https://github.com/adiletzainidinov/balago-video/pull/147 (не мержить)
**Slug:** `seven-habits-covey` · материалы `books/seven-habits-covey/` · код `src/lesson-covey/`, `scripts/lesson-covey/`, `.github/workflows/lesson-covey.yml`, обложки `src/books/seven-habits-covey/thumbnails.tsx`
**CURRENT_STAGE:** **QA_REVIEW — фильм, SRT, 5 обложек, 5 названий и метаданные готовы; ждут владельца**
**Коммерческая публикация:** BLOCKED_UNVERIFIED_COPYRIGHT; на YouTube ничего не публиковалось, PR не мержится.

## Ссылки (приватный pre-release `book-seven-habits-covey`, нужен вход в GitHub)

- **Скачать фильм в хорошем качестве:** https://github.com/adiletzainidinov/balago-video/releases/download/book-seven-habits-covey/final-youtube.mp4 — 1920×1080, H.264 yuv420p, 30 fps, AAC 48 кГц, **30:03 (1803,39 с)**, −17 LUFS, без чёрных кадров, 567 237 522 байта (sha256 `25b61c36ca47f8a957139b1468cc8aec787dae0361827f7c652df04fbba64dbe`).
- **Посмотреть (превью 960×540):** https://github.com/adiletzainidinov/balago-video/releases/download/book-seven-habits-covey/final-youtube-preview-960x540.mp4
- **SRT:** https://github.com/adiletzainidinov/balago-video/releases/download/book-seven-habits-covey/final-youtube.srt (627 титров; копия `books/seven-habits-covey/video/final-youtube.srt`)
- **Пилот 41,9 с:** https://github.com/adiletzainidinov/balago-video/releases/download/book-seven-habits-covey/pilot.mp4
- **Обложки:** `…/releases/download/book-seven-habits-covey/thumbnail-01.jpg … thumbnail-05.jpg`, `thumbnail-contact-sheet.jpg`, `comparison-sheet.jpg`, `readability-320x180.jpg`; метаданные `youtube.md`, `youtube.json`, `YOUTUBE_TITLES.md`.
- **Приватная страница claude.ai** (просмотр 5 обложек, кнопки «Просмотреть №N» и «Скачать №N», ссылки на фильм, 5 названий): https://claude.ai/artifact/ED5ye1vTUGTDo6oV1yQiaZ
- CI: пилот — прогон 39789261420; полный фильм — 39792444095; пересборка с загрузкой обложек — 39804598950.

## DONE — проверено фактически

- [x] 21/21 SHA-256 OK; **все 21 часть прочитаны полностью** → `scripts/source-map/` (8 карт), `SOURCE_MAP.md` (сцена → строки части и исходного TXT), `COVERAGE.md`, `CLAIMS_AND_ETHICS_AUDIT.md`, `BRIEF.md`.
- [x] Сценарий: 65 сцен, 171 реплика, 3558 слов, 6 пауз-вопросов; `SCRIPT.md` и `STORYBOARD.md` с реальными таймкодами. Тесты 11/11 (52 цитаты дословно, «вы», ребёнок → родитель на «вы», без BalaGo/таймеров, титры).
- [x] Анимация: 49 видов сцен, авторская метафора «Семь развилок одного дня», тот же банан; кадры всех 65 сцен проверены локально; 36 контрольных кадров финала (`video/qa-full/frames`) просмотрены.
- [x] Озвучка: ElevenLabs Eric, все 171 реплика; ASR faster-whisper small — среднее 0,965; 6 реплик < 0,85 — по тексту ошибки распознавателя (цифры вместо «четвёртый», «Достигайтесь энергии» вместо «Достигайте синергии»), рекомендуется прослушать s20b, s21a, s27a, s28c, s51a, s58c (OpenAI в среде без кредитов, HuggingFace закрыт — повторная проверка более точной моделью невозможна).
- [x] Пилот проверен перед полным рендером (формат, звук, ASR 0,983, титры, кадры).
- [x] 5 обложек 1280×720 (141–198 КБ), Hunspell ✓, различие мин. 53 ✓, листы; рекомендация №5 «7 РАЗВИЛОК ОДНОГО ДНЯ».
- [x] Локальная галерея `thumbnail-gallery.mjs`: 5 × просмотр HTTP 200, 5 × скачивание байт-в-байт с `Content-Disposition: attachment` (порт контейнера с телефона недоступен — для владельца сделана страница claude.ai и релиз).
- [x] Метаданные: 5 названий (фаворит №1), описание 1871/5000, 16 тегов (243/500), 12 глав по реальной озвучке, орфография ✓ — `metadata/youtube.md`.

## Пять названий

1. **7 навыков высокоэффективных людей: почему проблемы возвращаются, даже когда вы спешите?** — МОЙ ФАВОРИТ (главный вопрос фильма, полное название для поиска).
2. Семь развилок одного дня: как работают навыки Стивена Кови
3. Стивен Кови за 30 минут: 7 навыков без лайфхаков и мотивационных обещаний
4. Срочное или важное? Как 7 навыков Кови меняют не скорость, а способ выбирать
5. Автопилот или выбор: простой разбор книги «7 навыков высокоэффективных людей»

Хуки обложек: №1 «7 НАВЫКОВ», №2 «ПОЧЕМУ ВСЁ СНОВА?», №3 «ВАЖНОЕ ≠ СРОЧНОЕ», №4 «АВТОПИЛОТ / ВЫБОР», №5 «7 РАЗВИЛОК ОДНОГО ДНЯ» (рекомендую).

## Shared-изменения (минимальные)

- `src/thumbnails/Root.tsx` — книга добавлена в `BOOKS` одной строкой.
- `books/dictionary.txt` — слова BM-022 для орфографии (блок в конце файла).

## NEXT_STEP (владелец)

Посмотреть фильм, прослушать 6 отмеченных реплик, выбрать название и обложку, решить вопрос прав и публикации. Для правок: изменить `src/lesson-covey/script.ts` / `visuals/*` → коммит с меткой `[full]` (озвучиваются только изменённые реплики) или `workflow_dispatch mode=full`; `mode=assemble run_id=…` — пересборка без рендера.
