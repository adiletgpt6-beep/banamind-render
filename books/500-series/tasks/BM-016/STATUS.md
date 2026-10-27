# BanaMind BM-016 — STATUS / самодостаточная контрольная точка

**Дата загрузки/проверки:** 2026-10-21 (Asia/Bishkek).
**Книга:** Фёдор Михайлович Достоевский — «Преступление и наказание».
**BM-ID:** BM-016.
**Ветка:** `feature/banamind-bm-016-crime-and-punishment`.
**PR:** https://github.com/adiletzainidinov/balago-video/pull/139
**TASK:** `books/500-series/tasks/BM-016/TASK.md`.
**SOURCE:** `books/500-series/sources/BM-016/README.md` + `part-01.txt`…`part-07.txt`.
**OUTPUT:** `books/crime-and-punishment-dostoevsky/`.

## CURRENT_STAGE: QA_REVIEW — фильм, SRT, 5 обложек, 5 названий и метаданные готовы; ждут владельца

**Обновлено Claude Code 2026-10-21.** PR #139 не мержится и на YouTube ничего не публикуется — это решения владельца.

### Видео (приватный pre-release `book-crime-and-punishment-dostoevsky`, нужен вход в GitHub)
- **Скачать в хорошем качестве:** https://github.com/adiletzainidinov/balago-video/releases/download/book-crime-and-punishment-dostoevsky/final-youtube.mp4 — 1920×1080, H.264 yuv420p, 30 fps, AAC 48 кГц 192k, **1799,97 с (30:00)**, −17 LUFS, без чёрных кадров, 541 174 430 байт, sha256 `90430b075bc80dca125308ebe6e9ca67d5f35ddc7a9c7e1ce851002006872bf1` (ffprobe: `books/crime-and-punishment-dostoevsky/video/qa-full/`).
- **Посмотреть (облегчённое превью 960×540):** https://github.com/adiletzainidinov/balago-video/releases/download/book-crime-and-punishment-dostoevsky/final-youtube-preview-960x540.mp4
- **SRT:** https://github.com/adiletzainidinov/balago-video/releases/download/book-crime-and-punishment-dostoevsky/final-youtube.srt (554 титра, тот же расчёт, что и в кадре; копия в `video/final-youtube.srt`).
- **Пилот 46,6 с:** https://github.com/adiletzainidinov/balago-video/releases/download/book-crime-and-punishment-dostoevsky/pilot.mp4 (проверен до полного рендера: формат, звук, титры).
- Сборка: рендер — прогон 39624492625, итоговая сборка — 39632507220 (`.github/workflows/lesson-crime.yml`).

### Проверено
- Источник: 7 SHA-256 и размеры совпали, 41 глава + эпилог; все 7 частей прочитаны полностью → `scripts/source-map/part-0N.md`, 181 цитата карт сверена дословно.
- `SOURCE_MAP.md` (114 событий + привязка каждой из 62 сцен), `CHARACTER_ARCS.md`, `RELIGIOUS_EDITORIAL_AUDIT.md`, `SAFETY_CLAIMS_AUDIT.md`, `BRIEF.md`, `SCRIPT.md` и `STORYBOARD.md` с таймкодами реальной озвучки.
- Сценарий: 62 сцены, 199 реплик, ≈3300 слов, 5 вопросов-пауз; **103 цитаты в «ёлочках» найдены в романе дословно** (`scripts/lesson-crime/quotes.mjs`, тесты 10/10 в CI).
- Озвучка: тот же голос банана (ElevenLabs Eric, multilingual v2), все 199 реплик; распознавание faster-whisper каждой реплики — среднее совпадение со сценарием 0,966 (`video/qa-voice/voice-asr.md`; оставшиеся расхождения — ошибки модели small: «Ястаруху», «Дуничка»).
- Титры BanaMind по таймингам букв ElevenLabs: ≤ 2 строк, без перекрытий, текст = сценарий, 5,8 % выделений, кинетика 6 раз (≥ 45 с).
- Кадры: 36 контрольных кадров по всему фильму (`video/qa-full/frames`) — банан, сцены, титры, без насилия и священных образов.
- Обложки: `thumbnails/thumbnail-01…05.jpg` 1280×720, ≤ 2 МБ, Hunspell ✓, различие ✓ (мин. 48), `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`; рекомендация №1 «ТЕОРИЯ УБИЙСТВА?».
- Галерея: локальный `thumbnail-gallery.mjs` проверен по HTTP (5 × просмотр 200, 5 × скачивание байт-в-байт, attachment; лист — тоже). Для владельца — **приватная страница claude.ai**: https://claude.ai/artifact/HwMN2UqPubpn9dGdmSh6wW (5 «Просмотреть №N» + 5 «Скачать №N» оригиналов; размеры файлов совпадают с оригиналами байт-в-байт), там же названия и ссылки на видео. Долговременные копии обложек и метаданных — в том же релизе (через `book-assets.yml`).
- Метаданные: `metadata/YOUTUBE_TITLES.md` (5 названий, фаворит №1), `youtube.md/json` — описание с предупреждением о спойлерах, 16 тегов, 15 глав по реальной озвучке; проверки ✓.

### Известные мелочи (не блокируют)
- В сцене c46 «дорога в Сибирь» (≈25:30) банан частично заслоняет идущую Соню — правка в `visuals/end.tsx` + перерендер, если владелец захочет.
- OpenAI API в среде без кредитов — проверка озвучки перенесена в CI (faster-whisper).

### Следующий шаг (владелец)
Посмотреть фильм, выбрать название и обложку, подтвердить публикацию. Для правок: изменить `src/lesson-crime/script.ts` / `visuals/*` → push (озвучиваются только изменённые реплики; полный рендер ~12 мин в 8 частях). Режим `workflow_dispatch mode=assemble run_id=…` пересобирает без рендера.

## SOURCE (физически создан и проверен, не ожидание)

Исходный upload владельца: `Не подтвержден 780673(1).crdownload` — фактически полноценный читаемый ZIP (SHA-256 `f4938c2c9e945d625f88a3806475e955eb6abf951623150131ad900e78196e3d`) с одним FB2 6 556 998 байт. Удалены все материалы 2024 коммерческого издания (вступление Ольги Саленко, комментарии/примечания 2024, иллюстрации Елены Белоусовой, обложки, оформление), оставлен только текст романа Достоевского в общественном достоянии.

7 UTF-8 файлов:
| Файл | Байты | SHA256 | Git Blob SHA (проверен в приватном GitHub) |
|---|---:|---|---|
| part-01.txt | 312338 | `fe5c2f09490b6863f46cd7332d82f2d031fa124721ff3d5ab70d3cd054866802` | `12474a248cae09a1069193e0a2bd17501d600504` |
| part-02.txt | 364802 | `f7a1bef58cb193984fa0e17c9aaa435732e7c0544765d94a8842c8e4de076561` | `2696030067132cc3adc78c1fc1b22fd6ad91d930` |
| part-03.txt | 292168 | `349582a0bef2e8c866d287edb47525db41d2b9b3130c4e40dd1dc338cda2a90d` | `166d5ab0bda167232e7558a91d66a761cdf3eda8` |
| part-04.txt | 278512 | `6c8c88187a2fecbda4373bcaea0d9b1bf5bcffc5ad166f247f06d2b86f8ddbfc` | `c4ed208870086ed35ffcab84be291714138d33df` |
| part-05.txt | 280235 | `63e1f3b5de676cf8e6b7dbf07d04eb1e5e56442344b104c6d659dac9cacd7df2` | `8a845aed4e5e10df5ae29f65e9b0e25968cb968f` |
| part-06.txt | 339958 | `b002342a94479c00511dccd6ea2207aa03b9bdcec0442e96e08aed7b3455f9e2` | `58f17e3685aab4e856b588b0ad98fd832dc40787` |
| part-07.txt | 64589 | `f8789562d06826c6e64fa214d3cdf44e80f2527fb4a914cce3ed84127eb47562` | `c63bab057dedb078455c06b3d1d3fbd5728814e2` |

Итого **1 932 602 байта чистого текста**, 7 частей (6 частей+эпилог), **41 глава (7+7+6+6+5+8+2)**. Каждая загруженная часть сверена по **Git Blob SHA** с её исходным локальным TXT без различий байт (2026-10-21). У Claude Code повторно проверить `sha256sum`.

## DONE — реальное

- [x] Подтверждено, что `.crdownload` — полный ZIP, integrity OK; FB2 обнаружен, заголовок/автор/структура/2024 rights review.
- [x] Очистка от современных редакционных материалов 2024; текст разбит в логическом порядке на 7 автономных UTF-8 файлов по частям.
- [x] Все семь файлов записаны в GitHub именно в назначенную отдельную ветку BM-016.
- [x] Все семь Git Blob SHA совпали байт-в-байт с локальной подготовленной книгой, общий размер подтверждён.
- [x] Подробная инструкция в `sources/BM-016/README.md`, отдельный production `TASK.md`.
- [x] PR #139 открыт и закреплён координатором.
- [x] Глобальный REGISTRY/HANDOFF и правило auto-ingest обновлены на docs base: `REGISTRY.csv`, `HANDOFF.md`, `SOURCE_INGESTION.md`, `MASTER_CLAUDE.md`, `WORKFLOW.md`. Следующий BM-017.

## TODO Claude Code (исходный список — выполнен, см. CURRENT_STAGE)

- [x] После клонирования/checkout Claude сверил 7 SHA и прочитал текст всех 41 глав.
- [x] SOURCE_MAP (45–60 опорных фрагментов), CHARACTER_ARCS, RELIGIOUS_EDITORIAL_AUDIT, SAFETY_CLAIMS_AUDIT.
- [x] Оригинальный психологический 30-минутный SCRIPT, BRIEF и STORYBOARD, не дословное чтение романа.
- [x] Оригинальный проверенный пилот 30–60 секунд с прежним бананом и word-aligned captions/VO.
- [x] Фильм 29:30–30:30 H.264/AAC 1920×1080 30 fps, реальный ffprobe и QA.
- [x] Синхронный `final-youtube.srt`.
- [x] 5 действительно разных YouTube-заголовков и фаворит.
- [x] 5 настоящих JPG 1280×720 + contact-sheet и mobile proof; оригинальные обложки без чужих издательских рисунков.
- [x] PRIVATE gallery in Claude Code/Codespaces, проверить по отдельности пять preview/download файлов, приватный MP4/SRT preview/download.
- [x] Чистый текст романа не должен случайно выкладываться через публичный dev server; не повторять современные комментарии/издательскую графику из FB2.
- [x] QA по всему фильму, сохранённые ссылки/результаты проверок/коммиты/следующий checkpoint.
- [x] Не мержить PR, не публиковать видео автоматически на YouTube.

## RESTART FROM ZERO? НЕТ

При переполнении контекста заново прочитать `MASTER_CLAUDE.md`, `TASK.md`, этот `STATUS.md`, последние коммиты/PR. Производство/контент должен сохраняться в коммитах и STATUS, не пересоздавать BM-016.

## EXACT NEXT ACTION

**Claude Code:** перейди на BM-016 ветку → прочитай `sources/BM-016/README.md` и все семь `part-*.txt` из GitHub → сверь SHA → составь source map и оригинальную сценарную структуру → автономно начинай пилот/фильм и 5 обложек, экономно проверяя каждый шаг. **НЕ ПРОСИ пользователя приложить файл — книга уже в репозитории.**
