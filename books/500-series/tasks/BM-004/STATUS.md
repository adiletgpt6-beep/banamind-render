# BanaMind BM-004 — STATUS / checkpoint
**Создано:** 2026-10-18.
**Книга:** Даниэль Канеман, «Думай медленно... решай быстро».
**Стадия:** QA_REVIEW — фильм 30:00 готов и проверен, ждёт просмотра владельцем; публикация заблокирована до проверки прав.
**Рабочая ветка:** `feature/banamind-bm-004-kahneman`
**TASK:** `books/500-series/tasks/BM-004/TASK.md`
**PR:** https://github.com/adiletzainidinov/balago-video/pull/125
**TXT:** `kahneman_dumay_medlenno_reshay_bystro.txt`, 2 014 175 байт, 17 752 строк, 657 PDF-страниц.
**SHA256 оригинального TXT (проверен ChatGPT):** `5f70d9476ace06f67e7a638114926d888969174314626a0bd6b211fdf305234c`.
**Источник в Claude (подтверждён 2026-10-18):** вложение чата `kahneman_dumay_medlenno_reshay_bystro.txt` — 2 014 175 байт, 17 752 строки, 657 маркеров страниц, SHA256 совпадает (`5f70d947…5234c`). Полный текст в Git НЕ хранится (авторское право); для продолжения достаточно конспектов со страницами `books/kahneman-thinking-fast-and-slow/research/notes-part1..5.md`. Если понадобится перечитать книгу — владелец прикладывает TXT снова.
**Редакторские утверждения:** владелец заранее утвердил самостоятельный отбор основных идей и разрешил сразу выполнить полный **30-минутный анимационный фильм**, не останавливаясь после сценария/пилота; публиковать на YouTube без проверки прав нельзя.
**Новое постоянное правило:** 5 названий YouTube + 1 фаворит + 5 текстов к превью для BM-004 и всех следующих книг BanaMind (см. MASTER_CLAUDE).

**Условие готовности превью:** 5 разных JPG/PNG + контакт-лист + по две **проверенные** ссылки (просмотр и скачивание оригинала) для каждого, доступ с телефона и ПК. Готовность без рабочих ссылок не подтверждать.

## DONE (ТОЛЬКО ТО, ЧТО РЕАЛЬНО СДЕЛАНО)
- [x] Материал идентифицирован: Канеман, русское издание АСТ 2016, 657 PDF-страниц.
- [x] TXT реально передан в Claude; размер, строки, страницы и SHA256 проверены (совпадают с ChatGPT).
- [x] Прочитан весь TXT (введение, части I–V, выводы, приложения, примечания бегло) → `books/kahneman-thinking-fast-and-slow/research/notes-part1..5.md`.
- [x] `BRIEF.md`, `SOURCE_MAP.md` (генерирует `scripts/lesson-kahneman/source-map.mjs`), `SCRIPT.md` с таймкодами (генерирует `export-docs.mjs`).
- [x] Сценарий `src/lesson-kahneman/script.ts`: 44 сцены, 161 реплика, 3302 слова, 6 задач-пауз, страницы PDF у каждой сцены.
- [x] Озвучка ElevenLabs (голос банана Eric, как в BM-001): 161 файл в `public/lesson-kahneman/voice/`, речь 25:48, фильм по тайм-лайну **30:00** (естественная длительность 28:23).
- [x] Тесты сценария 9/9, `captions-check` без ошибок (570 титров, 4,9 % выделений, 8 кинетических моментов).
- [x] 44 анимированные схемы `src/lesson-kahneman/visuals/*.tsx` + персонажи-метафоры Система 1/Система 2 (`chars.tsx`); кадры каждой сцены проверены.
- [x] Пять обложек 1280×720 + `comparison-sheet.jpg` (= `thumbnail-contact-sheet.jpg` в релизе) + `readability-320x180.jpg`; `checks.json` ok (орфография, формат, различие ≥ 66 при пороге 25).
- [x] YouTube: 5 названий + фаворит №1 (`metadata/YOUTUBE_TITLES.md`), описание, теги, 32 главы с реальными таймкодами (`metadata/youtube.md`).
- [x] Пилот 60 с (прогон 39140227895): 1920×1080, 30 fps, H.264/AAC, 60,0 с, −17 LUFS — кадры проверены.
- [x] Полный рендер (прогон 39140871681, коммит 73df853): `final-youtube.mp4` 1920×1080 H.264 30 fps, AAC 48 кГц, **30:00**, −17 LUFS, 503,7 МБ, без чёрных кадров (`verify.mjs` ✓); тишина ≥ 4 с только в 6 паузах-задачах, 2 переходах и финале. SRT 570 титров.
- [x] Все ассеты релиза скачаны через API и проверены (MP4, превью 960×540, SRT, кадры, 5 обложек, лист).
- [ ] Право публичного/коммерческого релиза подтверждено (по умолчанию НЕТ).

## BLOCKERS
- **Для публичного коммерческого релиза:** нужны подтверждённые права на использование произведения/перевода; публичный доступ не открывать, на YouTube не загружать.
- OpenAI-ключ среды без кредитов (ASR-проверка озвучки недоступна); озвучка проверена посимвольным выравниванием ElevenLabs = текст сценария.

## NEXT_STEP
Владелец смотрит фильм и обложки, выбирает название/обложку, проверяет права. Повторный рендер нужен только при правках
(любой коммит в `src/lesson-kahneman/**` без `[pilot]`/`[no render]` или workflow_dispatch; озвучка кэшируется). Ничего не пересоздавать.

## ARTIFACTS
- PR: https://github.com/adiletzainidinov/balago-video/pull/125 · ветка `feature/banamind-bm-004-kahneman`
- Сценарий для чтения: `books/kahneman-thinking-fast-and-slow/SCRIPT.md`; бриф `BRIEF.md`; карта `SOURCE_MAP.md`
- Обложки: `books/kahneman-thinking-fast-and-slow/thumbnails/` и релиз `book-kahneman-thinking-fast-and-slow`
- Названия: `books/kahneman-thinking-fast-and-slow/metadata/YOUTUBE_TITLES.md`, метаданные `youtube.md`
- Релиз (приватный, нужен вход в GitHub): https://github.com/adiletzainidinov/balago-video/releases/tag/book-kahneman-thinking-fast-and-slow
- Видео: `books/kahneman-thinking-fast-and-slow/video/README.md` (ссылки на final-youtube.mp4, превью, SRT)

## Правило при переполнении контекста
Сначала обновить этот STATUS в GitHub (DONE, BLOCKERS, NEXT_STEP, SHA и реальные артефакты) и закоммитить. Новый Claude Code по ID BM-004 читает GitHub и **не начинает работу заново**.
