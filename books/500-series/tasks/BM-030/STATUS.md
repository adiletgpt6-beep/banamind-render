# BM-030 — STATUS / Л. Н. Толстой «Война и мир»

**CURRENT_STAGE: QA_REVIEW — фильм 30:00, SRT, 5 обложек, 5 названий и метаданные готовы; ждут владельца. Блокер выдачи MP4 в релиз: GitHub Actions заблокирован по оплате.**

## Итог (2026-10-22, Claude Code)

- **Фильм:** `final-youtube.mp4` 1920×1080, H.264 yuv420p, 30 fps, AAC 48 кГц 192k, **1799,97 с (30:00)**, −17 LUFS, без чёрных кадров, 601 317 526 байт, sha256 `3af9f8a611beda68aa3618efea37582f7b7364e1e4f5a4f9bb0fa84be3b3803d`. Естественная длительность озвучки 29:21, до 30:00 — паузы ≤ 0,6 с на сцену, речь не ускорялась.
- **Выдача:** оригинал передан владельцу в чат Claude Code двумя частями без пережатия + превью 960×540 (85,6 МБ). Пилот 40,6 с — в приватном pre-release: https://github.com/adiletzainidinov/balago-video/releases/download/book-war-and-peace-tolstoy/pilot.mp4 (нужен вход в GitHub).
- **Блокер:** прогон CI 39845611718 отрендерил 8/8 частей, но сборка не стартовала: «account is locked due to a billing issue». Прокси среды Claude Code не пропускает бинарную загрузку в релизы (HTTP 415) и скачивание артефактов (blob 403), поэтому фильм собран локально из того же коммита и тех же параметров. **После оплаты:** Actions → прогон 39845611718 → «Re-run failed jobs» (артефакты частей живут до ~25.10) или push в `src/books/war-and-peace-tolstoy/film/**` → релиз `book-war-and-peace-tolstoy` получит `final-youtube.mp4`, превью и SRT; push в `books/**` запустит `book-assets.yml` (обложки и метаданные в тот же релиз).
- **SRT:** `books/war-and-peace-tolstoy/video/final-youtube.srt` (576 титров, тот же расчёт, что в кадре).
- **Обложки:** `books/war-and-peace-tolstoy/thumbnails/thumbnail-01…05.jpg` (1280×720, JPEG, ICC sRGB), `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`, `checks.json` (Hunspell ✓, различие мин. 48). Рекомендация №1 «КТО ПИШЕТ ИСТОРИЮ?».
- **Просмотр/скачивание обложек:** приватная страница claude.ai https://claude.ai/artifact/JDZ96ue8iaEYKAtG646FRm — «Просмотреть №1–5» (оригинал в полном размере) и «Скачать №1–5» (оригинальный JPG; sha256 опубликованных файлов = файлам ветки). Постоянные копии — в ветке (raw-ссылки GitHub, нужен вход). Локальная галерея `thumbnail-gallery.mjs` проверена по HTTP (`thumbnails/gallery-http-check.txt`), но с телефона недоступна (облачный контейнер).
- **Названия:** фаворит — «Война и мир: почему герои не управляют своей судьбой?»; ещё 4 — `metadata/YOUTUBE_TITLES.md`. Описание, 16 тегов, 13 глав по реальной озвучке — `metadata/youtube.md`.
- **QA:** тесты сценария 10/10 (95 цитат дословно, вопросы, «вы», нет таймеров, титры = сценарий), `captions-check` без ошибок, ASR всех 161 реплик (среднее 0,945), независимая сверка фактов `scripts/FIDELITY_REVIEW.md` (12 обязательных правок внесены до озвучки), 36 контрольных кадров `video/qa-full/frames/`.
- **Параллельная работа:** в репозитории есть ещё ветки `claude/banamind-bm-030-animation-buqj94` (её CI загружает `wp-pilot-*` в тот же релиз `book-war-and-peace-tolstoy`) и `claude/banamind-bm-030-war-peace-6awnth` (припаркована). Они не трогались; координатору стоит закрыть дубли, чтобы общий релиз не перезаписывался.
- Не опубликовано на YouTube; PR #156 не мержился.


## Журнал Claude Code

- 2026-10-22 — checkout `feature/banamind-bm-030-war-and-peace-tolstoy` (HEAD `bf728f0`). `sha256sum -c source-checksums.sha256` → **63/63 OK**; `cat part-*.txt | sha256sum` → `bb711e80cbaae40bb451458575e624677c23034c2f31d0299f96e67841467907` ✓; `git hash-object` каждой части = `git_blob_sha` из manifest = blob в `origin/feature/...` → **63/63**. Структура пересчитана скриптом: **361** заголовок «Глава» (индекс `books/war-and-peace-tolstoy/scripts/chapter-index.json`), **961** маркер `[N]`, блок «Примечания» с `part-60.txt:L28`. Эпилог II в этом издании нумерован гл. 17–28.
- Все 63 части прочитаны построчно → `books/war-and-peace-tolstoy/scripts/source-map/part-01…63.md` (407 коротких цитат сверены `grep`), `NOTES_AUDIT.md`: 961 примечание 1…961 без пропусков, 961 маркер `[N]` 1:1.
- Конвейер фильма: `src/books/war-and-peace-tolstoy/film/` (Remotion, композиция `WarLesson`), `scripts/lesson-war/`, `.github/workflows/lesson-war.yml` (озвучка ElevenLabs Eric → ASR-проверка → рендер 8 частями или «[pilot]» → сборка → приватный pre-release `book-war-and-peace-tolstoy`).
- Сценарий `film/script.ts`: 65 сцен, 156 реплик, ≈3100 слов, 6 вопросов, 95 цитат дословно (тест), визуальная концепция «Масштаб выбора» (45 видов анимированных SVG-сцен). Тесты 10/10, captions-check без ошибок. Контрольные кадры всех сцен отрендерены локально и проверены глазами.
- Документы `books/war-and-peace-tolstoy/scripts/`: BRIEF, SOURCE_MAP (142 привязки + место каждой цитаты), VOLUME_AND_CHAPTER_AUDIT (361 глава), CHARACTER_ARCS, HISTORICAL_FRAME, VO_GLOSSARY, EDITORIAL_AUDIT, SCRIPT, STORYBOARD (`node scripts/lesson-war/docs.mjs`).
- Обложки `books/war-and-peace-tolstoy/thumbnails/thumbnail-01…05.jpg` (1280×720, JPEG, встроенный ICC sRGB, 120–210 КБ), `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`, `checks.json` (Hunspell ✓, различие мин. 48 ≥ 25). Рекомендация №1 «КТО ПИШЕТ ИСТОРИЮ?».
- Метаданные: `metadata/YOUTUBE_TITLES.md` (5 названий, фаворит №1), `meta.json` → `youtube.md/json` (описание, 16 тегов, 13 глав; таймкоды пересчитаются после озвучки).


- Repository PRIVATE: `adiletzainidinov/balago-video`.
- Branch: `feature/banamind-bm-030-war-and-peace-tolstoy`.
- PR: **#156 — https://github.com/adiletzainidinov/balago-video/pull/156**, OPEN, не мержить автоматически.
- Task: `books/500-series/tasks/BM-030/TASK.md`.
- Source folder: `books/500-series/sources/BM-030/`.
- Источник: `Tolstoy_Voyna-i-Mir.620066.txt.zip`, ZIP CRC OK; ZIP SHA-256 `faa92aa255f471017b8200435e295617097b8eeacf011c8a7f4ec540b9da9aa7`.
- Основной художественный TXT: **63 UTF-8 частей / 5381645 байт**, SHA-256 конкатенации `bb711e80cbaae40bb451458575e624677c23034c2f31d0299f96e67841467907`.
- Структура: 4 тома, 361 размеченная глава, 2 части эпилога, нумерованные 961 примечаний. Полный текст сохранён, исключены декоративная иллюстрация и строка интернет-источника; все JPG/PNG исключены.
- Проверено локально: ZIP/CRC, UTF-8, все границы строк, последовательность и SHA-256 63 локальных частей. **Удалённые Git Blob SHA + размеры сверены: 63/63 совпадают с локальными**. Дерево Git SHA `107d35a8162c190d899c2bbb88080beddd065e6b`, source commit `fd5f88ed665dd4866fdd8969641ebeaac1f4a698`, remote tree `truncated=false`; checksum manifest имеет 63 строки. **Claude Code после checkout обязан выполнить** `sha256sum -c source-checksums.sha256` и `cat part-*.txt | sha256sum`.
- Сценарий, пилот, видео, озвучка, SRT, настоящие 5 обложек **ещё не созданы**.
- Rights: текст Толстого в общем случае public domain; частные издательские/редакторские добавления и публичная монетизация требуют отдельной проверки. Без публикации и merge.

**Next:** Claude Code читает 63 файла из приватной ветки, выполняет `sha256sum -c`, делает SOURCE_MAP, сценарий/пилот и production по TASK. Источник повторно прикладывать не нужно. Затем Claude делает оригинальный 30-минутный фильм, QA и thumbnails по TASK.
