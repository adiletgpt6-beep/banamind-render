# BanaMind BM-018 — STATUS / durable next-step checkpoint

**Дата:** 2026-10-22 (Asia/Bishkek)
**Книга:** Джон Р. Р. Толкин — «Властелин колец».
**ID:** BM-018
**Branch:** `feature/banamind-bm-018-lord-of-the-rings`
**PR:** https://github.com/adiletzainidinov/balago-video/pull/142
**TASK:** `books/500-series/tasks/BM-018/TASK.md`.
**SOURCE:** `books/500-series/sources/BM-018/README.md`, `source-checksums.sha256`, `part-01.txt`…`part-12.txt`
**OUTPUT TARGET:** `books/lord-of-the-rings-tolkien/`

## CURRENT_STAGE: QA_REVIEW — полный фильм 30:00, SRT, 5 обложек и метаданные готовы (частный QA; права не подтверждены)

Обновлено Claude Code 2026-10-22 (UTC). Предыдущая история (приём источника) — ниже.

### Готовые файлы (приватный pre-release `book-lord-of-the-rings-tolkien`, нужен вход в GitHub)
- `final-youtube.mp4` — 1920×1080, 30 fps, H.264/AAC 48 кГц, **30:00 (1800,03 с)**, −16,2 LUFS, 524,5 МБ, без чёрных кадров (verify по скачанному файлу).
- `final-youtube-preview-960x540.mp4`, `final-youtube-pilot-60s.mp4`, `final-youtube.srt` (580 титров), 11 контрольных кадров.
- Ссылки: `books/lord-of-the-rings-tolkien/video/README.md`. CI: https://github.com/adiletzainidinov/balago-video/actions/runs/39786085116 (success).
- Озвучка: 200 реплик ElevenLabs Eric (тот же голос банана), 24,5 мин речи, естественная длина 27:57 → паузы растянуты до 30:00. `public/lotr/voice/`.
- Пилот LotrPilot 0:56 отрендерен и проверен до полного рендера.
- Обложки и метаданные: `books/lord-of-the-rings-tolkien/thumbnails/`, `metadata/youtube.md` (главы по реальному тайм-лайну). `book.json` добавлен → `book-assets.yml` выкладывает обложки/метаданные в тот же релиз.
- Галерея `thumbnail-gallery.mjs --dir books/lord-of-the-rings-tolkien/thumbnails`: проверено по HTTP — 5× просмотр 200 image/jpeg, 5× скачивание `Content-Disposition: attachment`, байт-в-байт с оригиналами, контакт-лист 200. Ограничение: порт контейнера облачной сессии недоступен с телефона владельца → постоянные ссылки — pre-release.


### Ссылки (приватный pre-release, нужен вход в GitHub; без входа — 404)
- Видео: https://github.com/adiletzainidinov/balago-video/releases/download/book-lord-of-the-rings-tolkien/final-youtube.mp4 · превью 960×540: https://github.com/adiletzainidinov/balago-video/releases/download/book-lord-of-the-rings-tolkien/final-youtube-preview-960x540.mp4 · пилот 60 с: https://github.com/adiletzainidinov/balago-video/releases/download/book-lord-of-the-rings-tolkien/final-youtube-pilot-60s.mp4 · SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-lord-of-the-rings-tolkien/final-youtube.srt
- Обложки (оригиналы): https://github.com/adiletzainidinov/balago-video/releases/download/book-lord-of-the-rings-tolkien/thumbnail-01.jpg … thumbnail-05.jpg · лист: https://github.com/adiletzainidinov/balago-video/releases/download/book-lord-of-the-rings-tolkien/comparison-sheet.jpg · 320×180: https://github.com/adiletzainidinov/balago-video/releases/download/book-lord-of-the-rings-tolkien/readability-320x180.jpg · метаданные: https://github.com/adiletzainidinov/balago-video/releases/download/book-lord-of-the-rings-tolkien/youtube.md
- Проверено: 5 оригиналов из релиза 1280×720, побайтно равны файлам репозитория; `book-assets.yml` прогон 39797892834 — success.
- Приватная страница-галерея (крупный просмотр 5 обложек + ссылки): https://claude.ai/artifact/3xSRjEnvQfbnqkrCxrRb3P

### Сделано в производстве
- [x] `sha256sum -c` — **12/12 OK**; все 12 частей прочитаны целиком; 62 главы подтверждены `grep` (12+10+11+10+10+9) + пролог; финал «Серые гавани», последняя строка part-12:L900.
- [x] `books/lord-of-the-rings-tolkien/scripts/`: `SOURCE_MAP.md` (**219 опор**, все 12 частей), `CHARACTER_ARCS.md`, `PLOT_AND_TRANSLATION_AUDIT.md`, `RELIGIOUS_AND_SAFETY_AUDIT.md`, `EDITORIAL_RIGHTS_AUDIT.md`, `BRIEF.md`, `SCRIPT.md`, `STORYBOARD.md` (`node scripts/lotr/export-docs.mjs`).
- [x] Оригинальный сценарий «Музей искушений»: 82 сцены, 13 залов, 200 реплик, ≈3300 слов, 5 вопросов зрителю, у каждой сцены `src: part-NN:Lxxx` — `src/books/lord-of-the-rings-tolkien/film/script.ts`.
- [x] Remotion-фильм: `src/books/lord-of-the-rings-tolkien/film/` (композиции `LotrFilm`, `LotrPilot`), тот же банан `src/banana-host`, `BanaMindAnimatedCaptions` (словарь книги — `film/captions.ts`), 50 собственных экспонатов; все кадры сцен проверены глазами (`node scripts/lotr/stills.mjs`).
- [x] Скрипты: `scripts/lotr/` (voice ElevenLabs — тот же голос Eric, mixdown, srt, verify, frames, stills, export-docs, тесты `script.test.mjs` 11/11).
- [x] CI: `.github/workflows/lotr-film.yml` — запуск только меткой `[pilot]` / `[full]` / `[voice]` в коммите; результат — приватный pre-release `book-lord-of-the-rings-tolkien`.
- [x] 5 обложек `books/lord-of-the-rings-tolkien/thumbnails/thumbnail-01…05.jpg` (1280×720, ≤ 2 МБ, орфография ✓, различие 41.6 ≥ 25), `comparison-sheet.jpg`, `readability-320x180.jpg`; рекомендация №2 «СЛАБЫЙ СПАС МИР?».
- [x] YouTube-метаданные: `books/lord-of-the-rings-tolkien/metadata/meta.json` → `youtube.md/json` (5 названий, фаворит №1, описание, теги, 13 глав).

### Пять названий YouTube
1. **МОЙ ФАВОРИТ:** «Властелин колец: почему Кольцо доверили самым слабым? | BanaMind» — точно формулирует центральный парадокс фильма и содержит название книги для поиска; «слабые» — литературный парадокс, который фильм честно разбирает.
2. «Почему самые сильные в Средиземье боялись Кольца? Разбор Толкина»
3. «Властелин колец: как жалость к Горлуму решила исход войны»
4. «Толкин и власть: самая опасная ловушка — желание сделать добро»
5. «Почему победа Фродо не похожа на обычную победу? Разбор «Властелина колец»»

Тексты обложек: №1 «ПОЧЕМУ ВСЕ БОЯЛИСЬ?», №2 «СЛАБЫЙ СПАС МИР?» (рекомендую), №3 «ОПАСНАЯ ВЛАСТЬ», №4 «ЗАЧЕМ НУЖНА ЖАЛОСТЬ?», №5 «ЦЕНА ПОБЕДЫ».

### Права
Права на коммерческую публикацию **не подтверждены** (`EDITORIAL_RIGHTS_AUDIT.md`). Только приватный QA; YouTube-загрузки нет; PR не мержить.

### EXACT NEXT ACTION
1. Владелец: просмотр фильма и выбор обложки/названия; решение по правам (`EDITORIAL_RIGHTS_AUDIT.md`).
2. Правки по замечаниям: `script.ts` → коммит с `[full]` в ЗАГОЛОВКЕ (готовые реплики с тем же хэшем не переозвучиваются).
3. Не мержить PR #142, не загружать на YouTube без явного решения владельца.

## Приём источника (история)

Прежняя стадия: SOURCE_READY_IN_PRIVATE_GITHUB / PRODUCTION_NOT_STARTED

**ВЕСЬ ОСНОВНОЙ РОМАН УЖЕ В GITHUB.** Владельцу **не нужно снова загружать текст в Claude Code**. В репозитории проверены по Git Blob SHA ВСЕ **12 TXT частей**, включая пролог, **6 внутренних книг, 62 главы** и последнее повествовательное окончание `Серые гавани`. Удалены вложенные PNG и отдельный конец с примечаниями/маркером Flibusta. Указанный в TXT переводчик не верифицирован. **Не выдумывать право на публикацию/установленный перевод**.

Сами `part-*.txt` — подготовленный текст пользовательского исходника в приватной рабочей ветке, не просто манифест, не placeholders. Общий объём **4 473 484 байта UTF-8**. Их порядок и индивидуальные SHA-256 зафиксированы в `source-checksums.sha256`, полная таблица в `README.md`. После checkout запусти `sha256sum -c books/500-series/sources/BM-018/source-checksums.sha256` из соответствующей директории `sources/BM-018`.

## Проверка предоставленного источника

- Файл `Tolkin_Vlastelin-Kolec.264749.txt.zip`, 6 552 258 байт, ZIP SHA-256 `c1ec3a3ccfebb71e46b42d266bcabefeea776665aecb5f0f83f7ec6e316f01c4`.
- В ZIP CRC error нет; 13 членов: `Tolkin_Vlastelin-Kolec.264749.txt` (4 475 975 байт, UTF-8-sig) + 12 изображений PNG. Изображения **не передавались в GitHub**.
- 10 190 строк исходного TXT, 2 483 273 Unicode code points. Пролог + 6 `КНИГА I–VI` и **главы 12 + 10 + 11 + 10 + 10 + 9 = 62**. Финал main text до строки 10159; после отдельные `Примечания` и исходная помета библиотеки.
- 12 подготовленных по полукнигам UTF-8 TXT: `part-01`–`part-12`, полный narrative, удалены метки картинок, не включён отдельный блок примечаний; к каждой части короткий служебный заголовок. Размеры/sha256 в README. **Все 12 частей успешно фактически добавлены в приватный GitHub** и отдельными fetch Git blob SHA подтверждены, сравнены с SHA blob локальных подготовленных файлов (2026-10-22).
- Исходный русский перевод **НЕ атрибутирован уверенно по предоставленному тексту**; содержит написания `Торбинс`, `Скромби` и т. д. Книга Толкина и перевод охраняются авторскими правами в значимых юрисдикциях; это не публичная лицензия. Из источника следует, что сетевое происхождение — Флибуста, **НЕ считать разрешением для коммерческой адаптации**.

## DONE

- [x] Архив ZIP проверен, CRC OK, извлечён TXT, распознана структура и обязательное окончание.
- [x] Назначен свободный BM-018 после проверки текущих REGISTRY/branch/PR.
- [x] Создана новая feature branch от `docs/banamind-500-production-system`.
- [x] Подготовлено 12 чистых UTF-8 файлов в верном порядке, 4 473 484 байт.
- [x] В приватный GitHub успешно загружены **все 12 файлов**, проверены byte-perfect Git blob SHA на КАЖДОМ файле.
- [x] Добавлен `source-checksums.sha256` и оригинальный подробный `sources/BM-018/README.md`.
- [x] Создана специфическая полная производственная инструкция `TASK.md` для 30-минутного аналитического фильма.
- [x] PR #142 создан, URL закреплён в STATUS.\n- [x] REGISTRY.csv изменён в docs base, BM-018 SOURCE_READY.\n- [x] HANDOFF обновлён в docs base, next ID BM-019.\n- [x] GitHub Actions `BanaMind — validate 500-book registry (docs only)` SUCCESS, status completed; PR #142 OPEN, mergeable true (2026-10-22).

## (история) План, выданный координатором

- [ ] `git checkout feature/banamind-bm-018-lord-of-the-rings`, читать MASTER/WORKFLOW/SOURCE_INGESTION/TASK/STATUS/README.
- [ ] `cd books/500-series/sources/BM-018 && sha256sum -c source-checksums.sha256`; проверить 12/12 OK; прочитать пролог и 62 главы/6 внутренних книг.
- [ ] Подготовить оригинальную `SOURCE_MAP.md` 65+ точных опор, `CHARACTER_ARCS.md`, `PLOT_AND_TRANSLATION_AUDIT.md`, `RELIGIOUS_AND_SAFETY_AUDIT.md`, `EDITORIAL_RIGHTS_AUDIT.md`, `BRIEF.md`, `SCRIPT.md`, `STORYBOARD.md`.
- [ ] Написать **собственный критический фильм** на 29:30–30:30 с existing BanaMind бананом, без слепого пересказа книги и копирования дизайна фильмов Джексона; сначала приватный проверенный пилот 30–60 сек, проверить права и бюджет.
- [ ] Собрать оригинальные Remotion сцены, естественную русскую VO, динамические word-aligned animated captions + SRT и Full-HD 30fps H.264/AAC MP4, `ffprobe` и визуальное/аудио QA.
- [ ] Сгенерировать **5 разных** реальных JPG 1280×720, contact-sheet, mobile proof и **5 разных заголовков**/фаворит/description; в PRIVATE preview gallery проверить просмотр+скачивание каждого файла.
- [ ] Всё сохранить и коммитить с чётким STATUS; не печатать мнимые ссылки и не выдумывать артефакты. Отдельно фиксировать условия/результат проверки коммерческих прав и политики YouTube; **не публиковать автоматически**.
- [ ] **Не мержить PR**, не делать auto-YouTube upload.

## (история) Прежняя точка входа — выполнено, см. выше

Зайди в ветку BM-018 и **сразу начни** по TASK; проверенный полный source pack лежит в GitHub. При ошибке доступа сначала проверь git branch/checkout, не проси у пользователя дублировать ранее размещённую книгу. Начни со сценарной `SOURCE_MAP` и 30–60-секундного технического пилота, сохраняя checkpoints.
