# BM-030 — STATUS / Л. Н. Толстой «Война и мир»

**CURRENT_STAGE: IN_PRODUCTION — сценарий и анимация готовы; CI: озвучка → пилот (2026-10-22, Claude Code)**

- Repository PRIVATE: `adiletzainidinov/balago-video`.
- Branch: `feature/banamind-bm-030-war-and-peace-tolstoy` (рабочая копия Claude: `claude/banamind-bm-030-animation-buqj94`).
- PR: **#156 — https://github.com/adiletzainidinov/balago-video/pull/156**, OPEN, не мержить автоматически.
- Task: `books/500-series/tasks/BM-030/TASK.md`. Output: `books/war-and-peace-tolstoy/`, Remotion: `src/books/war-and-peace-tolstoy/film/`.

## Сделано Claude Code (2026-10-22)
- [x] Источник проверен после checkout: `sha256sum -c source-checksums.sha256` — **63/63 OK**; `cat part-*.txt | sha256sum` = `bb711e80cbaae40bb451458575e624677c23034c2f31d0299f96e67841467907` (совпадает). Книга повторно не запрашивалась.
- [x] Прочитаны **все 63 TXT** построчно (10 параллельных чтецов, каждая цитата сверена `grep -F`); структура подтверждена: Том I 65 глав, Том II 98, Том III 96, Том IV 74, Эпилог 28 (16+12) = **361**; примечания 1–961 без пропусков (489 и 492 склеены с текстом в одной строке). Нумерация глав в этом издании сквозная внутри тома.
- [x] Оригинальный сценарий «Масштаб выбора»: 101 сцена, 239 реплик, ≈3330 слов, 7 вопросов зрителю; у каждой сцены `src: part-NN:Lxxx` — `src/books/war-and-peace-tolstoy/film/script.ts`. Все цитаты в «» сверены с текстом источника скриптом.
- [x] Remotion-фильм `WarPeaceFilm` / `WarPeacePilot`: тот же банан `src/banana-host`, `BanaMindAnimatedCaptions`, три слоя карты (личный выбор / война / история), 57 собственных схем. Контрольные кадры всех сцен проверены глазами.
- [x] Скрипты `scripts/war-and-peace/` (voice ElevenLabs Eric — тот же голос банана, mixdown, srt, verify, frames, stills, export-docs, тесты 11/11), CI `.github/workflows/war-and-peace-film.yml` (метки `[pilot]`/`[full]`/`[voice]` в заголовке коммита).
- [ ] Пилот (CI) → прослушивание и QA → полный рендер → 5 обложек, 5 названий, метаданные, документы.

## Exact next action
1. Дождаться прогона `war-and-peace-film.yml` по коммиту с `[pilot]`, скачать `wp-pilot.mp4` из приватного pre-release `book-war-and-peace-tolstoy`, проверить звук/синхронность/кадры.
2. Затем коммит с `[full]` в заголовке.

---

## (история) Приём источника координатором

Прежняя стадия: SOURCE_READY_IN_PRIVATE_GITHUB / READY_FOR_CLAUDE

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
