# BM-041 — STATUS — Ричард Докинз «Эгоистичный ген»

**Дата регистрации:** 2026-10-23.
**Репозиторий:** `adiletzainidinov/balago-video`.
**Branch:** `feature/banamind-bm-041-selfish-gene-dawkins`.
**PR:** https://github.com/adiletzainidinov/balago-video/pull/166
**TASK:** `books/500-series/tasks/BM-041/TASK.md`.
**SOURCE:** `books/500-series/sources/BM-041/part-01.txt`…`part-24.txt`, `README.md`, `manifest.json`, `source-checksums.sha256`.
**OUTPUT:** `books/selfish-gene-dawkins/`, `src/books/selfish-gene-dawkins/`.

## CURRENT_STAGE: SOURCE_READY_IN_PRIVATE_GITHUB / FILM_NOT_STARTED

**Книга УЖЕ полностью подготовлена и реально загружена в PRIVATE GitHub.** Основной текст 13 глав, предисловия, дополнения и переводческие сведения сохранены в **24 UTF-8 TXT**, общей длиной **1 744 237 байт**; у **всех 24 файлов** после записи получен фактический Git Blob SHA и сверено совпадение с локальной подготовкой. Владелец НЕ должен дублировать книгу в Claude Code. Это не сценарий, фильм или обложки; они **ещё НЕ произведены**.

ZIP: `Dokinz_Egoistichnyy-gen.379420.txt.zip`, **1 032 062 байта**, SHA256 `959775124db8b7be501dd961801f30e5f1d805952ec9c031637129fb73038840`, zip CRC OK, **14 файлов**: 1 русский UTF-8-sig TXT **1 744 480 байт**, SHA256 `bdb23fe2e8285363ee6496ebf9690b2d800104f2682ab478461fdc6bcc5a7b87`, 13 изображений. В TXT 1161 логическая строка. В GitHub сохранены original lines 2–1159, кроме шести отдельных placeholders изображений, стартовой/финальной пустых строк и заключительного сетевого footer. Никакие основные главы, авторские дополнения и примечания не опущены. Русская переводчица указана непосредственно в присланном файле: **Фомина Н. О., 1993**; книга представляет материалы оригинального текста 1976 и дополнений 1989, как подписано в издании.

## Фактически выполнено

- [x] Проверена **LIVE** `books/500-series/REGISTRY.csv`, HANDOFF, feature branches, PR: заняты BM-001–BM-040, следующий RESERVED — BM-041.
- [x] Проверены отдельный BM-041 branch / PR lookup и отсутствие дубля книги в REGISTRY.
- [x] Создана новая уникальная ветка `feature/banamind-bm-041-selfish-gene-dawkins` и резерв BM-041 с исходным актуальным SHA в общей docs ветке (commit `06354fb962fe8f6f81fff83eb968f5da658c2dba`).
- [x] ZIP проверен (CRC OK, структура), сконвертирован в 24 последовательных целых UTF-8 TXT, с сохранением русских предисловий, глав 1–13 и раздела «ДОПОЛНЕНИЯ».
- [x] Каждый `part-01.txt` … `part-24.txt` создан в GitHub и немедленно сверен **по реальному Git Blob SHA, 24/24 OK**; подготовлено `manifest.json` с SHA/байтами/оригинальными строками, `source-checksums.sha256`.
- [x] SOURCE README подробно объясняет структуру и разницу между 13 реальными главами и повторными заголовками в разделе дополнений.
- [x] Подготовлен `books/500-series/tasks/BM-041/TASK.md` для Claude Code — яркий оригинальный 29:30–30:30 аналитический фильм BanaMind, базовый банан, естественный русский голос, word captions/SRT, 5 titles, 5 JPG и приватный просмотр/скачивание.
- [x] Открыт PR #166 https://github.com/adiletzainidinov/balago-video/pull/166; REGISTRY=SOURCE_READY (commit `11c150a3272853ce8dab396d250ce5f2f530f8d4`), HANDOFF обновлен (commit `ac5f462914cbd23103097c6ad2a8308dc11360ae`).
- [x] GitHub Actions запуск #109 (run ID 39869919342) проверен: результат **startup_failure**, workflow даже не создал jobs. Это **не подтверждение провала проверки файлов или тестов**, а сбой до запуска шагов; дополнительной CI-проверки пока нет.\n- [x] PR #166 OPEN, mergeable true (последнее наблюдение), **24 из 24 файлов** вручную отдельно сверены GitHub Blob SHA с исходной подготовкой.

## Сценарный фокус и проверки

- Источник: 13 глав (1–13) + дополнения, НЕ 24 главы; примечания 1989 могут уточнять ранние спорные формулировки.
- «Эгоистичный» ген — **научно-популярная метафора описания**, не моральная инструкция или доказательство неизбежной эгоистичности людей. Некоторые картины происхождения жизни, поведения и культурных «мимов» — модели/аналогии, а не отдельные текущие факты без научной сверки.
- Соблюдать редакционные правила BanaMind при историко-научных темах и различать `DAWKINS_CLAIM` / `SOURCE_MODEL` / `OUR_ILLUSTRATION`; не выдумывать факты или современный научный консенсус по памяти.

## Следующее реальное действие Claude Code

1. Checkout BM-041 feature branch; прочитать `books/500-series/MASTER_CLAUDE.md`, `books/PRODUCTION.md`, `books/500-series/WORKFLOW.md`, источник README/manifest, `TASK.md`, STATUS, все 24 TXT.
2. `cd books/500-series/sources/BM-041 && sha256sum -c source-checksums.sha256` — **24/24 OK**, итог 1 744 237 байт. Действовать по текущим GitHub артефактам, не просить повторно TXT/ZIP.
3. Создать SOURCE_MAP 70–90+ проверенных anchors с главами и source ranges, `SCIENCE_METAPHOR_AUDIT.md`, `BRIEF.md`, `SCRIPT.md`, `STORYBOARD.md`, `VOICE_CUE_SHEET.md`.
4. Реальный 30–60сек анимационный пилот с русской VO, существующим BanaMind host и word-sync captions; QA/расходы.
5. Затем реальный приватный 29:30–30:30 MP4 FullHD 30fps H.264/AAC, естественная русская VO, word-aligned animated captions + SRT; ffprobe и аудио/визуальный QC.
6. Пять действительно разных названий, пять настоящих JPG 1280×720, contact-sheet, проверяемая PRIVATE галерея просмотра/скачивания каждой обложки, owner-only MP4/SRT.
7. Сохранять фактический прогресс и пути в STATUS, не трогать другие BM. Не auto-merge и не auto-publish. **Пока нет готового MP4/озвучки/JPG.**
