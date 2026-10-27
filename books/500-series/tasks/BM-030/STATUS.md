# BM-030 — STATUS / Л. Н. Толстой «Война и мир»

**CURRENT_STAGE: IN_PRODUCTION — источник проверен Claude Code, идёт полное чтение и карта источников**

## Журнал Claude Code

- 2026-10-22 — checkout `feature/banamind-bm-030-war-and-peace-tolstoy` (HEAD `bf728f0`). `sha256sum -c source-checksums.sha256` → **63/63 OK**; `cat part-*.txt | sha256sum` → `bb711e80cbaae40bb451458575e624677c23034c2f31d0299f96e67841467907` ✓; `git hash-object` каждой части = `git_blob_sha` из manifest = blob в `origin/feature/...` → **63/63**. Структура пересчитана скриптом: **361** заголовок «Глава» (индекс `books/war-and-peace-tolstoy/scripts/chapter-index.json`), **961** маркер `[N]`, блок «Примечания» с `part-60.txt:L28`. Эпилог II в этом издании нумерован гл. 17–28.
- Чтение всех 63 частей построчно → `books/war-and-peace-tolstoy/scripts/source-map/part-NN.md` (в работе).


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
