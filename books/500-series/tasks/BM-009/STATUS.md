# BanaMind BM-009 — STATUS / точка возобновления

**Книга:** Морган Хаузел — «Психология денег. Вечные уроки богатства, жадности и счастья» (оригинал 2020, рус. изд. «Попурри» 2021).
**Ветка:** `feature/banamind-bm-009-psychology-of-money` · **PR:** https://github.com/adiletzainidinov/balago-video/pull/130 · **TASK:** `books/500-series/tasks/BM-009/TASK.md`
**Стадия:** `QA_REVIEW` — фильм 30:00, SRT, сценарий, 5 названий, 5 обложек, метаданные готовы и проверены; ждут решения владельца. Публикация на YouTube **не выполнялась** (права на книгу/перевод не подтверждены).
**Согласование:** владелец заранее утвердил отбор идей, сценарий и пилот (TASK.md §0; запуск 2026-10-19: «Я заранее утверждаю твой выбор»).

## Источник
- TXT получен в Claude Code 2026-10-19: **624 942 байта, 1697 строк, 349 054 символа, SHA-256 `885c854b2f075c3f526090ddc9e59cd6a9e2f3a30c33cdf19cd588306f70d64c`** — совпадает с TASK. Иллюстрации из архива не использовались.
- Полный текст в Git **не загружен**. Для пересборки `SOURCE_MAP.md`: `BOOK_TXT=<путь> node scripts/lesson-money/export-docs.mjs` (проверяет SHA).
- Прочитан целиком: введение, гл. 1–20, постскриптум, благодарности.

## DONE (проверено)
- [x] `BRIEF.md` (14 идей из 20 глав, границы), `scripts/SCRIPT.md` + `SCRIPT.html`, `scripts/SOURCE_MAP.md` (глава + строка TXT + 460 дословных якорей).
- [x] Сценарий `src/lesson-money/script.ts`: 49 сцен, 180 реплик, 3348 слов, 5 вопросов для размышления (пауза без таймера).
- [x] Озвучка ElevenLabs Eric (multilingual v2, темп 0.9, тот же голос банана): 180 файлов, речь 25,0 мин, естественная длительность 27:53 → 30:00 паузами между сценами; тесты сценария и титров ✓ (run 39318371316).
- [x] 49 анимированных визуалов (`src/lesson-money/visuals/a–d.tsx`, ~6 300 строк), тот же банан `src/banana-host/`, титры `BanaMindAnimatedCaptions` по таймкодам букв; кадры каждой сцены просмотрены.
- [x] Пилот 60 с (run 39321903027): 1920×1080 H.264 30 fps, AAC 48 кГц, 60,0 с, −17 LUFS, кадры ✓.
- [x] **Полный фильм** (run 39323268769, workflow_dispatch full): скачан и проверен `verify.mjs` — **1920×1080 h264 30 fps, AAC 48 кГц, 30:00 (1800,01 с), −17 LUFS, 545,1 МБ, без чёрных кадров, faststart (moov в начале)**; тишина ≥ 8 с только в 5 паузах-вопросах; 12 кадров по всему фильму просмотрены.
- [x] SRT: 554 титра (`video/final-youtube.srt`), из тех же титров, что в кадре.
- [x] 5 названий + фаворит №2 — `metadata/YOUTUBE_TITLES.md`; описание (2079/5000), теги (263/500), 19 глав с реальными таймкодами — `metadata/youtube.md/json`.
- [x] 5 обложек 1280×720 (136–195 КБ, орфография Hunspell ✓ в CI, различие мин. 60,4 ≥ 25) + `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`; рекомендация №2.
- [x] Галерея `books/500-series/tools/thumbnail-gallery.mjs --dir books/morgan-housel-psychology-of-money/thumbnails --port 8765` запущена в облачном контейнере Claude Code: `/` 200; `/view/thumbnail-0N.jpg` 200 ×5; `/download/thumbnail-0N.jpg` — `Content-Disposition: attachment`, байт-в-байт равны оригиналам, 1280×720 ×5; лист 200. **Ограничение:** это localhost облачного контейнера, порт наружу не пробрасывается — с телефона используется приватная страница ниже и релиз.
- [x] Приватная страница просмотра в Claude (все 5 обложек крупно, кнопки «Просмотреть №N» / «Скачать №N», лист, фильм, сценарий, названия): https://claude.ai/artifact/Ek7CqnZ642eTHDb86XjgTF (видна только владельцу).
- [x] `book-assets.yml`: ветка BM-NNN обрабатывает только свою книгу; публикует контакт-лист; при нерендеренном видео — предупреждение.

## Ссылки (приватный релиз `book-morgan-housel-psychology-of-money`, нужен вход в GitHub)
- Смотреть (облегчённая 960×540): https://github.com/adiletzainidinov/balago-video/releases/download/book-morgan-housel-psychology-of-money/preview-960x540.mp4
- Скачать Full HD MP4: https://github.com/adiletzainidinov/balago-video/releases/download/book-morgan-housel-psychology-of-money/final-youtube.mp4
- Сценарий: …/SCRIPT.html · …/SCRIPT.md · SRT: …/final-youtube.srt · Пилот: …/pilot-60s.mp4
- Обложки: …/thumbnail-01.jpg … …/thumbnail-05.jpg · лист: …/thumbnail-contact-sheet.jpg (префикс `https://github.com/adiletzainidinov/balago-video/releases/download/book-morgan-housel-psychology-of-money/`)

## BLOCKERS
- Публикация/монетизация: права на книгу и русский перевод не подтверждены — решает владелец.
- Обратная проверка озвучки распознаванием речи (OpenAI Whisper) не выполнена: на ключе «BalaGo Audio QA» нет кредитов. Синхронность титров обеспечена таймкодами букв ElevenLabs и тестом.

## NEXT_STEP
Владелец смотрит фильм и обложки, выбирает название/обложку и решает вопрос прав; публикация — вручную владельцем. Для правок: изменить `src/lesson-money/script.ts` или визуалы → пуш (неизменённые реплики не переозвучиваются) → workflow_dispatch `lesson-money.yml` mode=full.

## Затраты
- ElevenLabs: ≈ 21 400 знаков (один раз). Actions: озвучка 1 прогон, пилот 1, полный рендер 1 (8 частей).
