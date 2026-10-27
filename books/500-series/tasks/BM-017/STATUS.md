# BM-017 — STATUS / handoff Claude Code

**Дата:** 2026-10-21 (Asia/Bishkek).
**Автор/произведение:** Агата Кристи — «И тогда никого не осталось», перевод Владиславы Селиной.
**Branch:** `feature/banamind-bm-017-and-then-there-were-none`.
**PR:** https://github.com/adiletzainidinov/balago-video/pull/140
**TASK:** `books/500-series/tasks/BM-017/TASK.md`.
**SOURCE:** `books/500-series/sources/BM-017/README.md`, `SOURCE_DIGEST.md`, `manifest.json` и `part-01.txt` — все эти файлы фактически размещены в GitHub.

## CURRENT_STAGE: BRIEF_READY + PILOT / SOURCE_READY_IN_GITHUB / RIGHTS_UNVERIFIED

**Обновление Claude Code 2026-10-21:** владелец прикрепил полный текст напрямую в Claude Code.
`part-02.txt`…`part-06.txt` выделены без правки текста и записаны в `sources/BM-017/`;
все 6 SHA256 и размеры совпали с manifest. Блокер источника снят. Блокер прав остаётся:
без решения владельца — никакого финального 30-минутного рендера и публикации.

### Историческая запись (до обновления)
PARTIAL_SOURCE_IN_GITHUB / BLOCKED_FULL_SOURCE

Этот статус НЕ равен «полная книга доступна в GitHub». Был предоставлен целый ZIP/FB2, но с файловой передачей произошёл блокер. В GitHub фактически в исходном виде есть **только part-01.txt (главы 1–4)**. Есть отдельная **оригинальная, фактологическая карта всех 18 разделов в SOURCE_DIGEST.md**, но она НЕ заменяет полный текст и НЕ подтверждает чтение всех глав Claude Code. `manifest.json` содержит 6 записей для локально сформированных файлов, но пути part-02…06 пока отсутствуют в repo.

**Что удалось проверить в ChatGPT:** ZIP `Не подтвержден 279892.crdownload` целый, sha256 `bf14132c2c65d9c3280adae703882a1290e2beba4d671f49e734af391e061941`. FB2 747479 байт; разделы: **16 глав + эпилог + заключительная рукопись**. Переводчик из FB2: Владислава Владимировна Селина. Издание в метаданных: Царицын, Волгоград, 1992 (ISBN 5-88462-014-4); документ FB2 создан на основе OCR. Локально подготовлены 6 TXT суммарно **527252 байта**; исключены cover, separate translation-notes body и publisher annotation; 6 SHA256 записаны в source README/manifest.

**Техническая передача:** `part-01.txt` (132395 bytes; sha256 `66b76baf5a5453a4bdc8fd77d3f8ad1542fac42ce3cfdabe85d7312ec11428cd`, git blob sha `afa88943b4db7a1630dfa5b3e3f4047ba3f23d32`) загружен и повторно проверен по GitHub SHA. Попытка записи `part-02.txt` была остановлена системой безопасности инструмента; не было попыток обхода блокировки через маскировку/кодирование. Остальные полные части 02…06 НЕ загружены. Локальный `BM-017-source-pack.zip` доступен владельцу только как прямое вложение/скачивание ChatGPT, не Claude Code.

## DONE — реальное
- [x] Источник распознан по байтам (ZIP despite .crdownload), ZIP целый, FB2 XML корректен.
- [x] Сверены автор, переводчик, происхождение, главы 1–16, эпилог и заключительная рукопись.
- [x] 6 отдельных чистых UTF-8 TXT реально созданы **локально**, отдельно локальный ZIP pack/manifest.
- [x] Рабочая ветка BM-017 создана от docs base; GitHub регистр и PR проверены на дубль.
- [x] `sources/BM-017/part-01.txt` (главы 1–4) записан в GitHub и проверен по blob-SHA.
- [x] В GitHub есть подробный **SOURCE_DIGEST.md** по 18 частям, включая разгадку; `manifest.json`/README описывают именно частичную передачу.
- [x] Специфический `TASK.md` на оригинальную анимационную аналитическую историю подготовлен.
- [x] PR #140 открыт и URL записан.\n- [x] Глобальный REGISTRY/HANDOFF обновлены координатором в docs base (registry commit `c2616149d67b853c0f6b709b193c5e8c35526fb0`; handoff commit `130c2a289e18e83ae38d2e0691daee7962edf910`). Следующий BM-018.

## CLAUDE CODE — сделано 2026-10-21 (ветка `feature/banamind-bm-017-and-then-there-were-none`)

Папка фильма: `books/and-then-there-were-none-christie/`.

- [x] **Источник полный:** владелец прикрепил полный текст в Claude Code; `part-02…06.txt` выделены без правки текста; **все 6 SHA256 и размеры совпали с manifest** → `SOURCE_READY_IN_GITHUB`. Обхода блокировок не было.
- [x] Все 18 разделов прочитаны по сырому тексту (три прохода по частям 01–02, 03–04, 05–06) + выборочная перепроверка строк.
- [x] `SOURCE_MAP.md` — 167 фактов с `file:line`, сводка порядка уходов и фигурок, таблица обвинений (обвинение ≠ подтверждено), строки с исторической дискриминационной лексикой (не цитировать).
- [x] `BRIEF.md` — концепт, пропорции (≈ 50 % анализа), визуальная система «театр закрытых дверей», 13 блоков, этика.
- [x] `SPOILER_LOGIC_AUDIT.md` — роли, знание персонажей, 8 точек ложной уверенности, подсказки, границы, спойлер-режим.
- [x] `SOURCE_RIGHTS_AUDIT.md` — источник OK; права **не проверены** (Кристи † 1976, охрана «жизнь + 70» до конца 2046 в РФ/КР/UK; перевод Селиной 1992 — отдельный объект).
- [x] `SCRIPT_DRAFT.md` v1 — 13 блоков, 158 реплик, ≈ 3 280 слов (≈ 29:30–31:00 по калибровке «Трактата»); развязка только в блоке 12; без названия острова, считалки, способов смертей. Проверен по SOURCE_MAP (исправлены 7 неточностей и 4 преждевременных намёка на развязку).
- [x] `STORYBOARD.md` — 30 сцен, визуальная система, выбор пилота.
- [x] `metadata/YOUTUBE_TITLES.md` — 5 названий, **фаворит №3** «„И тогда никого не осталось“: как Кристи обманывает наше внимание».
- [x] 5 обложек 1280×720 (`thumbnails/thumbnail-01…05.jpg`) + `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`, `checks.json`: формат ✓, ≤ 2 МБ ✓, орфография Hunspell ✓, попарное различие мин. 48.3 (порог 25) ✓. Рекомендация — №5 «НИКОГО НЕ ОСТАЛОСЬ». Код: `src/books/and-then-there-were-none-christie/{draw,thumbnails}.tsx`, книга добавлена в `src/thumbnails/Root.tsx`.
- [x] Пилот: модуль фильма `src/books/and-then-there-were-none-christie/film/` (3 сцены блока 3, ≈ 58 с по черновой оценке), общие скрипты `scripts/books/film/{voice,mixdown,srt}.mjs` (параметризованная копия движка «Трактата», сам «Трактат» не изменён), workflow `.github/workflows/bm-017-pilot.yml` → приватный пререлиз `bm-017-pilot`. Результат прогона — ниже.
- [ ] `book.json` для BM-017 **намеренно не создан**: иначе `book-assets.yml` потребует готовый финальный MP4.

### Пилот — прогон CI
- Прогон: https://github.com/adiletzainidinov/balago-video/actions/runs/39633245610 — **success**.
- Озвучка: ElevenLabs Eric (тот же голос банана), 6 реплик; файлы сохранены ботом в `public/books/and-then-there-were-none-christie/voice/`.
- Приватный пререлиз (нужен вход в GitHub): https://github.com/adiletzainidinov/balago-video/releases/tag/bm-017-pilot
  - `bm-017-pilot.mp4` — https://github.com/adiletzainidinov/balago-video/releases/download/bm-017-pilot/bm-017-pilot.mp4
  - `bm-017-pilot-preview-960x540.mp4`, `bm-017-pilot.srt`, `thumbnail-01…05.jpg`, `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`
- Проверено Claude Code после скачивания ассета: ffprobe **H.264 1920×1080 30/1, AAC 48 кГц, 50.37 с**; mean −17.5 dB / max −0.4 dB; тишины > 2 с нет; кадры 4/13/24/33/43/48 с просмотрены (титры в такт речи, акценты, карточка «ВЫВОД №1», таймеров нет, название острова и текст считалки не показаны).
- Замечания к доработке в полном фильме: в сцене «голос» банан улыбается (нужна эмоция тревоги); добавить очки/бабочку в блоках анализа (Host «Трактата» их не поддерживает — сделать свой Host-обёртку).

## AVAILABLE ACTIONS CLAUDE CODE — начинать сейчас без повторного запроса файла

- [ ] Clone/checkout верной branch, прочесть MASTER/WORKFLOW/TASK/STATUS/source README/part-01/DIGEST.
- [ ] `SOURCE_MAP.md`: сырой текст гл. 1–4 VERIFIED, детали гл. 5–16/эпилога/рукописи DIGEST_DERIVED_UNVERIFIED_IN_CLAUDE. Сверить точный состав 18 частей.
- [ ] `BRIEF.md`, `SCRIPT_DRAFT.md` с полностью авторским критическим анализом, а не пересказом/аудиокнигой.
- [ ] `SPOILER_LOGIC_AUDIT.md` и `RIGHTS_AUDIT.md` — как имя судьи и сюжетная ложная уверенность используются, без инструктивной детализации вреда.
- [ ] `STORYBOARD.md`: драматургия острова, карта ролей, психологические допущения, узнаваемый банан; 5 разных YouTube названий, 5 thumbnail concepts.
- [ ] По бюджету возможен короткий **30–60 сек proof-of-concept** на проверенных событиях из первых четырёх глав, только private.
- [ ] Проверить полноту остальных source parts через безопасный разрешённый канал; если не получено, остаётся `BLOCKED_FULL_SOURCE`, не заявлять фильм готовым.
- [ ] После source+rights checks: полный фильм 29:30–30:30 Full HD 1920×1080 H.264/AAC 30fps, natural Russian VO, real word-aligned captions and separate SRT, 5 final JPG 1280×720, contact sheet, PRIVATE gallery with 5 preview+download, ffprobe/QA.
- [ ] No auto-merge/YouTube release; source rights (English Christie original and Russian translation) must be checked for commercial adaptation. Older FB2 includes historical discriminatory terms; do not voice or display slurs.

## EXACT NEXT STEP

1. **Владелец:** утвердить `BRIEF.md` и `SCRIPT_DRAFT.md` (3 открытых вопроса в конце сценария), посмотреть пилот и 5 обложек.
2. **Владелец:** решение по правам (`SOURCE_RIGHTS_AUDIT.md` §3). Без него — только private-производство.
3. **Claude Code после 1–2:** перенести все 13 блоков в `film/script.ts` (+ визуалы 30 сцен из STORYBOARD), `TARGET = 1800`, полная озвучка, рендер частями (как `lesson-traktat.yml`), SRT, `book.json`, метаданные, финальная проверка 29:30–30:30.
4. Не мержить PR, не публиковать на YouTube.

### Историческая версия «следующего шага»

**Не проси книгу для начала работы.** Прочитай `sources/BM-017/SOURCE_DIGEST.md` и `part-01.txt`, сформируй SOURCE_MAP/BRIEF/SCRIPT_DRAFT/STORYBOARD, сохрани коммиты и checkpoint. Полный исходник в GitHub не доступен; отсутствие фиксировать, не изобретать ссылки и не начинать финальный дорогой рендер до проверки полноты/прав.
