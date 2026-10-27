# BanaMind BM-031 — STATUS / точка возобновления

**Книга:** Дж. К. Роулинг — «Гарри Поттер и философский камень» (предоставленная неофициальная русская версия).
**Проверено:** 2026-10-22, приватный GitHub, 25/25 parts.
**PR:** https://github.com/adiletzainidinov/balago-video/pull/155
**Ветка:** `feature/banamind-bm-031-harry-potter-philosophers-stone` (PR #155); рабочая ветка Claude Code — `claude/banamind-bm-031-production-uvwe0p` (создана от feature-ветки, CI фильма запускается на ней)
**TASK:** `books/500-series/tasks/BM-031/TASK.md`
**README источника:** `books/500-series/sources/BM-031/README.md`
**SOURCE_STATUS:** **SOURCE_READY_IN_PRIVATE_GITHUB ✅**
**PRODUCTION_STATUS:** **QA_REVIEW (черновой голос) — фильм 30:00 собран и проверен** (Claude Code, 2026-10-22): сценарий, визуал, обложки, метаданные и документы готовы; полный фильм собирается локально с ЧЕРНОВОЙ озвучкой. Финальная озвучка голосом банана (ElevenLabs) заблокирована: GitHub Actions не стартует.
**PUBLIC_RELEASE:** **NOT_AUTHORIZED**; требования публичного использования и публикации отдельно перед релизом.


## Журнал Claude Code (2026-10-22)

1. **Источник.** `sha256sum -c source-checksums.sha256` — **25/25 OK**; `cat part-*.txt | sha256sum` = `77179544…26181`, 820138 байт / 6021 строк — совпадает с manifest. Все 25 частей прочитаны целиком (по 5 частей параллельно), карты со ссылками `part-XX:Lnnn` + `orig Lnnnn` — `books/harry-potter-philosophers-stone/scripts/source-map/01…05-*.md` (≈150 КБ, 17 глав, опоры по темам, написание имён в этом переводе, спорные места). Повторно книга у владельца не запрашивалась.
2. **Сценарий.** `src/books/harry-potter-philosophers-stone/film/script.ts`: 95 сцен, 253 реплики, ≈3 490 слов, 8 вопросов-пауз; рамка «Мастерская решений» с компасом (происхождение / ожидания / страх / поступок) — **метафора фильма**, не предмет романа. Каждая сцена привязана к строкам `part-NN:a–b` или помечена «анализ/метафора». Текст — пересказ своими словами: тест проверяет, что **ни одна реплика не совпадает с переводом фрагментом из 7+ слов** и в «ёлочках» нет фрагментов длиннее 6 слов.
3. **Визуал.** Собственная графика: компас, фишки-участники (точечный силуэт + имя; **героев книги не рисуем**), карточки ситуаций «Книга · Глава N» с пометкой «Наш анализ», доска улик, весы, рамка зеркала, лестница страха, счёт баллов без гербов и цветов факультетов. Чёткие цветные точки на шестиугольной сетке. Контрольные кадры 36 сцен просмотрены, исправлены наложения.
4. **Пайплайн.** `.github/workflows/hp-stone-film.yml` (на базе проверенного BM-025): ElevenLabs Eric (тот же голос банана) → ASR-проверка (faster-whisper) → рендер 8 частей → сборка, SRT, ffprobe, превью 960×540, приватный pre-release `book-harry-potter-philosophers-stone`. Бюджет: без метки `[pilot]`/`[full]` в коммите ничего не синтезируется. Тесты `node --test scripts/hp-stone/script.test.mjs` — 10/10; `captions-check.mjs` — 526 титров, ошибок нет.
5. **Блокеры среды (2026-10-22, ~23:08 UTC).** (а) GitHub Actions: **все** прогоны репозитория (и других веток, и `main`) завершаются `startup_failure` / `BuildFailed` ещё до старта задач — наш workflow валиден (actionlint без замечаний), проблема на уровне репозитория/аккаунта (вероятно, лимит/биллинг Actions — проверить владельцу в Settings → Billing/Actions). (б) Ключ ElevenLabs есть только в секретах CI. (в) OpenAI API: `insufficient_quota`. (г) Hugging Face закрыт сетью. (д) Создание GitHub Releases из этой сессии запрещено политикой (403).
6. **Пилот (40 с).** Локально: черновая озвучка Piper ru_RU dmitri (резервный движок проекта, `VOICE_ENGINE=piper`), рендер Remotion 1920×1080 30 fps, −17,2 LUFS, без чёрных кадров. Передан владельцу файлом в чате.
7. **Добавлены 5 сцен по опорам книги** (s04b палочка/шляпа, p02b Невилл отвечает Малфою, p04b наказан тот, кто хотел предупредить, r03b «только сила» против выбора, r08b чего первый том не объясняет) + реплика r08c: 100 сцен, 264 реплики, ≈3 750 слов. Проверки 10/10, оригинальность 0 совпадений, титры 0 ошибок.
8. **Обложки.** 5 JPG 1280×720 (115–246 КБ), Hunspell ✓, различие мин. 42,5 (порог 25), contact sheet и 320×180 — `books/harry-potter-philosophers-stone/thumbnails/`. Рекомендация №5 «СВОЙ ПО РОЖДЕНИЮ ИЛИ ПО ВЫБОРУ?». Галерея `thumbnail-gallery.mjs`: 5×просмотр HTTP 200, 5×скачивание с `Content-Disposition: attachment`, байт-в-байт (порт контейнера с телефона недоступен; постоянные ссылки — файлы в ветке на GitHub).
9. **Метаданные.** 5 названий (фаворит №1), описание 1 609/5 000, теги 198/500, 11 глав с таймкодами по тайм-лайну, орфография ✓ — `metadata/youtube.md`, `YOUTUBE_TITLES.md`.
10. **QA черновой озвучки** (GigaAM v2, sherpa-onnx, локально): среднее совпадение слов 0,934, ниже 0,85 — 40 реплик, в основном имена (Снейп, Квиррелл, Фламель) — `video/qa-voice-draft/`. Вывод: локальный голос годится только как черновик.
11. **Полный фильм v2 (локально, черновая озвучка).** 100 сцен, 264 реплики; рендер Remotion 4 частями по 13 500 кадров, склейка без пережатия, звук по тайм-лайну. Мастер `final-youtube.mp4`: 1920×1080, H.264 yuv420p, 30 fps, AAC 48 кГц, **30:00** (54 000 кадров), −17,3 LUFS, без чёрных кадров, 564,6 МБ, SHA-256 `d994d8aa90bf5eaa312c94148ae9b9aaed1f3e068127d9e801ee572a7781894b`. SRT 562 титра — `video/final-youtube.srt`. 36 контрольных кадров + проверка исправленных сцен. Передано в чат: превью 960×540 (89 МБ), мастер без пережатия двумя частями (288 + 276 МБ) и SRT. Страница обложек (приватный claude.ai artifact): https://claude.ai/artifact/YJc3tShd3KxtwGZft6shGs — «Просмотреть №1–5» на странице, «Скачать №1–5» ведут на оригинальные JPG в ветке (нужен вход в GitHub).

## Верифицированные выполненные этапы

- [x] Исходный ZIP пользователя **259777 байт**, SHA-256 `9464eae362e15495a1458093e967e93634a019448ccc73259973b63eeab75231`, ZIP CRC OK.
- [x] TXT в ZIP **820202 байта / 6023 строки**, UTF-8, SHA-256 `d1f8ae914edf364401e9af3207dec23bcdb8f22b48785eb110b955864a3c0409`.
- [x] Сохранён весь текст романа — **17 глав + посвящение**, исходные строки 2–6022; исключены первая пустая строка и служебный конечный интернет-футер. ZIP JPEG в production source не переносился.
- [x] Разделение на **25 UTF-8 TXT / 820138 байт / 6021 строк**, части `books/500-series/sources/BM-031/part-01.txt…part-25.txt`, порядок в `manifest.json`.
- [x] Локально проверены 25/25 SHA-256 из `source-checksums.sha256`; полная конкатенация **SHA-256 `77179544663437083cb01ba803c219f77de4c94a5aa01f57d2c7be1733726181`**.
- [x] **Все 25 частей реально загружены в PRIVATE GitHub** в указанную feature branch, вместе с `manifest.json` и `source-checksums.sha256`.
- [x] После завершения загрузки 25/25 файлов снова независимо прочитаны из GitHub API по содержимому первой строки/полученному SHA; **25/25 Git Blob SHA полностью совпали с `manifest.json`**. Нет пропусков или обнаруженных несовпадений. Ранее существовавшая `container_session_expired` блокировка **устранена**.
- [x] `README.md`, `TASK.md` обновлены в этой ветке. PR #155 существует и открыт.
- [x] Claude Code прочитал все 25 TXT, сделал SOURCE_MAP (+ подробные карты), COVERAGE, CHARACTER_AND_TWIST_AUDIT, RIGHTS_AND_CLAIMS_AUDIT, BRIEF, SCRIPT, STORYBOARD — `books/harry-potter-philosophers-stone/scripts/`.
- [x] Пилот 40 с (черновая озвучка Piper, word-level captions) — передан владельцу файлом; SRT полного фильма — `video/final-youtube.srt`.
- [~] Полный фильм 30:00, 1920×1080, 30 fps, H.264/AAC собран и проверен **локально с черновой озвучкой**; финальная озвучка голосом банана ждёт GitHub Actions (`[full]`).
- [x] Пять разных JPG 1280×720, contact sheet, 320×180, пять названий и рекомендация — `thumbnails/`, `metadata/`.
- [~] Галерея проверена локально (5×просмотр, 5×скачивание байт-в-байт); постоянные ссылки — файлы в ветке GitHub (вход обязателен); pre-release недоступен этой сессии.

## Проверка Claude Code после checkout

```bash
git fetch origin feature/banamind-bm-031-harry-potter-philosophers-stone
git checkout feature/banamind-bm-031-harry-potter-philosophers-stone
cd books/500-series/sources/BM-031
sha256sum -c source-checksums.sha256
cat part-*.txt | sha256sum
```

Ожидается **25/25 OK**, суммарные **820138 байт**, concat SHA-256 `77179544663437083cb01ba803c219f77de4c94a5aa01f57d2c7be1733726181`. При работе в общем checkout не стирай чужую незакоммиченную работу — создай отдельный Git worktree. **Книгу повторно прикреплять в Claude Code не нужно.**

## ARTIFACTS

- **Исходник:** готов, `books/500-series/sources/BM-031/part-01.txt…part-25.txt`, контрольные суммы рядом.
- **TASK:** `books/500-series/tasks/BM-031/TASK.md`.
- **Preview MP4:** ещё нет.
- **Final MP4:** ещё нет.
- **SRT:** ещё нет.
- **5 JPG, thumbnails gallery:** ещё нет.
- **Metadata/QA:** ещё нет.

## NEXT_STEP (актуально с 2026-10-23)

1. **Владелец:** восстановить GitHub Actions в репозитории (все прогоны падают `startup_failure`; проверить Settings → Billing / Actions → General, лимиты минут и политику Actions).
2. **Claude Code:** после восстановления — пустых коммитов не делать; закоммитить любую правку сценария/визуала в `claude/banamind-bm-031-production-uvwe0p` с меткой `[pilot]` (проверить голос банана ElevenLabs Eric на пилоте), затем `[full]`. Workflow `hp-stone-film.yml`: озвучка → ASR → рендер 8 частей → сборка, SRT, ffprobe, превью → приватный pre-release `book-harry-potter-philosophers-stone` (с обложками и метаданными). Обновить таймкоды глав (`node scripts/books/youtube-meta.mjs harry-potter-philosophers-stone`) и `node scripts/hp-stone/docs.mjs` по реальной озвучке.
3. **Локальное воспроизведение черновика:** `VOICE_ENGINE=piper PIPER_SPEED=0.82 PIPER_MODEL=<vits-piper-ru_RU-dmitri-medium> node scripts/hp-stone/voice.mjs` → `npx remotion render src/books/harry-potter-philosophers-stone/film/index.ts PotterStoneFilm …` → `node scripts/hp-stone/mixdown.mjs` → mux/`srt.mjs`/`verify.mjs`. Черновую озвучку в Git не коммитить.
4. Права на публичную адаптацию не подтверждены. Не мержить PR, не публиковать на YouTube автоматически.

## (исторический) NEXT_STEP — исполнителю Claude Code

Прочитать `MASTER_CLAUDE.md`, `books/PRODUCTION.md`, `WORKFLOW.md`, `SOURCE_INGESTION.md`, `TASK.md`, `STATUS.md`, source `README.md`, затем проверить 25 checksum и прочесть **все 25 TXT по порядку**. Самостоятельно сделать оригинальные `SOURCE_MAP → COVERAGE → BRIEF → SCRIPT → STORYBOARD`, затем пилот 30–60с/QA и технический продакшен в рамках TASK. Подготовить 5 реальных разных JPG и приватный просмотр/скачивание каждого. Регулярно обновлять STATUS. Обычные промежуточные планы уже делегированы, не запрашивать повторно файл или команду на старт. Чужие книги/ветки/PR не изменять; PR и публикацию автоматически не выполнять.

## HISTORY: технический сбой исправлен

Изначально на 2026-10-22 подготовка происходила локально, а перенос 25 частей блокировался ошибкой `container_session_expired`. Позднее при повторной проверке удалось безопасно перенести все 25 сегментов и два метафайла в приватный GitHub; каждый Git Blob SHA проверен дважды (после отдельной загрузки и после завершения всего пакета). Старые метки `BLOCKED_SOURCE_UPLOAD` из истории PR более не являются текущим состоянием.

## Краткий запуск нового Claude Code

```text
BM-031 — «Гарри Поттер и философский камень». PR #155, ветка feature/banamind-bm-031-harry-potter-philosophers-stone. GitHub source готов: проверь все 25 TXT в books/500-series/sources/BM-031/ и sha256sum -c source-checksums.sha256; затем читай TASK.md, STATUS.md и инструкции, начинай автономно производить оригинальный аналитический фильм BanaMind (29:30–30:30), пилот/QA, русскую VO, word-aligned captions/SRT, пять профессиональных JPG и пять названий, рабочие приватные ссылки просмотра/скачивания. Сохраняй прогресс в STATUS. Не проси книгу заново, не трогай другие BM, без автоматического merge и публикации.
```
