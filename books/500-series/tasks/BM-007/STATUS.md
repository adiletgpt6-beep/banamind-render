# BanaMind BM-007 — STATUS / состояние и передача контекста

**Книга:** Робин Шарма — «Лидер без титула. Современная притча о настоящем успехе в жизни и в бизнесе».
**Ветка:** `feature/banamind-bm-007-robin-sharma` · **PR:** https://github.com/adiletzainidinov/balago-video/pull/128
**Текущая стадия:** `QA_REVIEW` — фильм, SRT, сценарий, 5 обложек и метаданные готовы и проверены; ждут решения владельца. Публикация на YouTube **не** выполнялась и не одобрена (права на книгу/перевод не подтверждены).
**Полномочия:** владелец заранее утвердил отбор идей, сценарий и пилот (2026-10-19).

## Источник
- TXT владельца 2026-10-19: **733 325 байт, 2 303 строки, SHA-256 `4c2b6fe8f7cce7d64b04dfc86bf0fc89cea367e8b53cb7156c274738aa6cd070`** — совпадает с TASK. Приватная копия: `books/500-series/tasks/BM-007/source/` (не выкладывать публично).
- Прочитан целиком. Акронимы сверены с итоговыми карточками глав: IMAGE 979–991, SPARK 1429–1441, HUMAN 1673/1769–1781, SHINE 1985/2209–2221.

## DONE (проверено)
- [x] TXT получен, checksum, приватная копия.
- [x] `books/lider-bez-titula/BRIEF.md`; полный `scripts/SCRIPT.md`; `scripts/SOURCE_MAP.md` (глава + строки TXT + дословные якоря).
- [x] Сценарий `src/lesson-leader/script.ts`: 43 сцены, 216 реплик, 3 319 слов, 5 вопросов для размышления.
- [x] 39 видов анимированных сцен (`src/lesson-leader/visuals/`), тот же банан `src/banana-host/`, титры `BanaMindAnimatedCaptions` по таймкодам букв ElevenLabs.
- [x] Озвучка ElevenLabs Eric (multilingual v2, темп 0.9): 216 файлов, речь 24,9 мин; обратная проверка Whisper small — средний WER 5 % (`scripts/voice_qa.json`).
- [x] Пилот 60 с (прогон 39252126811) — QC пройден: формат, звук −17 LUFS, титры синхронны.
- [x] Полный фильм (workflow_dispatch full, run от 2026-10-19 ~12:45 UTC): `verify.mjs` ✓ — 1920×1080 H.264 30 fps, AAC 48 кГц, **30:00**, −17 LUFS, 482 МБ, нет чёрных кадров; кадры каждые 75 с просмотрены.
- [x] SRT (`video/final-youtube.srt`, 533 титра) — из тех же титров, что в кадре.
- [x] 5 названий + фаворит №2, описание, теги, 20 глав с реальными таймкодами — `metadata/YOUTUBE_TITLES.md`, `youtube.md/json` (проверки длины и орфографии ✓).
- [x] 5 обложек 1280×720 (≤2 МБ, орфография ✓, различие ≥55.9) + `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`; рекомендация №5.

## Ссылки (приватный релиз, нужен вход в GitHub)
- Смотреть (облегчённая 960×540): https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/preview-960x540.mp4
- Скачать Full HD MP4: https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/final-youtube.mp4
- SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/final-youtube.srt · Сценарий: https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/SCRIPT.md · Пилот: https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/pilot-60s.mp4
- Обложки: https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/thumbnail-0N.jpg (N=1…5), лист: https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/thumbnail-contact-sheet.jpg (загружает `book-assets.yml`)

## BLOCKERS
- Публикация/монетизация: права на книгу и русский перевод не подтверждены — решает владелец.

## NEXT_STEP
Владелец смотрит фильм и обложки, выбирает название/обложку и подтверждает права; после этого — ручная публикация владельцем. Для правок: изменить `src/lesson-leader/script.ts` или визуалы → пуш (озвучка переиспользует неизменённые реплики) → workflow_dispatch `mode=full`.

## Затраты
- ElevenLabs: ≈ 21 000 знаков (один раз). Actions: пилот 1 прогон, полный рендер 1 прогон (8 частей).
