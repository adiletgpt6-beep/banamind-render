# BanaMind BM-008 — STATUS / checkpoint

**Книга:** Джеймс Клир, «Атомные привычки. Как приобрести хорошие привычки и избавиться от плохих» (пер. «Питер», 2020).
**Ветка:** `feature/banamind-bm-008-atomic-habits` · **PR:** https://github.com/adiletzainidinov/balago-video/pull/129
**TASK:** `books/500-series/tasks/BM-008/TASK.md`
**Текущая стадия:** `QA_REVIEW` — фильм, SRT, сценарий, 5 обложек, галерея и метаданные готовы и проверены; ждут решения владельца. Публикация на YouTube **не** выполнялась.
**Полномочия:** владелец заранее утвердил отбор идей, сценарий, художественную концепцию и пилот (TASK §0, сообщение 2026-10-19). Публикация на YouTube — НЕ выполняется и не одобрена (права не подтверждены).

## Источник
- TXT передан в Claude Code 2026-10-19: **721 581 байт, 3 013 строк, SHA-256 `ebda6310322f8e44c28612d87e61eaa39cb646d892c33d779928e9c7cfab4104`** — совпадает с TASK. UTF-8, кириллица в порядке, есть главы 1–20, заключение (стр. 2669), приложения и примечания.
- Приватная копия (репозиторий приватный): `books/500-series/tasks/BM-008/source/BanaMind_BM-008_Atomnye_privychki.txt`. Не выкладывать публично.
- Прочитан целиком (главы, резюме, заключение, приложение «Небольшие уроки»).

## DONE (проверено)
- [x] TXT получен, checksum, приватная копия для следующих сессий.
- [x] `books/james-clear-atomic-habits/BRIEF.md`, полный `scripts/SCRIPT.md`, `scripts/SOURCE_MAP.md` (глава + строки TXT + дословные якоря) — с реальными таймкодами.
- [x] Сценарий `src/lesson-habits/script.ts`: 45 сцен, 185 реплик, 3 379 слов, 5 вопросов; 45 видов анимированных схем, тот же банан, титры `BanaMindAnimatedCaptions`.
- [x] Озвучка ElevenLabs Eric (multilingual v2, темп 0.9): 185 файлов, речь 26,4 мин; обратная проверка Whisper small — средний WER 4,9 % (`scripts/voice_qa.json`).
- [x] Пилот 60 с (прогон 39319002276) — QC: 1920×1080 H.264 30 fps, AAC 48 кГц, −17 LUFS, титры синхронны.
- [x] Полный фильм (прогон 39325393136, workflow_dispatch full): `verify.mjs` по скачанному файлу ✓ — 1920×1080 H.264 High yuv420p 30 fps, AAC 48 кГц, **29:59.99**, −17 LUFS (начало/середина/конец), faststart, нет чёрных кадров, 450,6 МБ; 12 кадров по всей длине просмотрены.
- [x] SRT `video/final-youtube.srt` — 602 титра, из тех же титров, что в кадре.
- [x] 5 названий + фаворит №2, описание, теги, 19 глав с реальными таймкодами — `metadata/YOUTUBE_TITLES.md`, `youtube.md/json` (длины и орфография ✓).
- [x] 5 обложек 1280×720 (≤ 2 МБ, орфография ✓, различие ≥ 61,6) + `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`; рекомендация №5.
- [x] Галерея `thumbnail-gallery.mjs --dir books/james-clear-atomic-habits/thumbnails --port 8765`: проверено curl — главная 200, 5 «Просмотреть» 200, 5 «Скачать» с `Content-Disposition: attachment`, байты идентичны оригиналам, 1280×720, лист 200. Ограничение: облачный контейнер без проброса портов — 127.0.0.1 с телефона владельца не открыть.
- [x] Поэтому опубликована приватная страница-галерея claude.ai: https://claude.ai/artifact/5D9X7k4oFihKAYdgGa55gb (5 оригиналов + лист, SHA-256 совпадают с файлами в репозитории).

## Ссылки (приватный релиз, нужен вход в GitHub)
- Смотреть (облегчённая 960×540): https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/preview-960x540.mp4
- Скачать Full HD MP4: https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/final-youtube.mp4
- SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/final-youtube.srt · Сценарий: https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/SCRIPT.md · Пилот: https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/pilot-60s.mp4
- Обложки: https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/thumbnail-0N.jpg (N=1…5), лист: https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/thumbnail-contact-sheet.jpg (загружает `book-assets.yml`)

## BLOCKERS
- Публикация/монетизация: права на книгу и перевод не подтверждены — решает владелец.

## NEXT_STEP
Владелец смотрит фильм и обложки, выбирает название/обложку и подтверждает права; после этого — ручная публикация владельцем. Для правок: изменить `src/lesson-habits/script.ts` или визуалы → пуш (озвучка переиспользует неизменённые реплики) → workflow_dispatch `mode=full`.

## Затраты
- ElevenLabs: ≈ 23 000 знаков (один раз). Actions: пилот 1 прогон, полный рендер 1 прогон (8 частей).

## Команды
```bash
node --test scripts/lesson-habits/*.test.mjs
node scripts/lesson-habits/captions-check.mjs
REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell node scripts/lesson-habits/stills.mjs s01,s30
node scripts/lesson-habits/export-docs.mjs
```
