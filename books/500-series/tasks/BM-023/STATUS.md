# BM-023 — STATUS / контрольная точка

**Дата:** 2026-10-22, Asia/Bishkek
**Книга:** Роберт Т. Кийосаки — «Богатый папа, бедный папа»
**Ветка:** `feature/banamind-bm-023-rich-dad-poor-dad`
**PR:** https://github.com/adiletzainidinov/balago-video/pull/148
**TASK:** `books/500-series/tasks/BM-023/TASK.md`
**Источник:** `books/500-series/sources/BM-023/`
**Slug:** `rich-dad-poor-dad-kiyosaki`
**CURRENT_STAGE:** `QA_REVIEW` — полный фильм 30:00, SRT, 5 обложек, метаданные готовы и проверены; ждёт решения владельца (публикация заблокирована до проверки прав)
**Публикация:** `BLOCKED_UNVERIFIED_COPYRIGHT`, владелец не разрешал auto-YouTube.

## DONE — ingestion

- [x] Реальный исходный ZIP: 643695 байт, SHA-256 `0528329863482f5cb94c277551d279848c68c0d5bd0c0cddcf359117a8bed77a`; `testzip() == None` (CRC OK).
- [x] Один русский UTF-8 TXT 650558 байт, 1396 исходных строк, SHA-256 `e19d2050ff61f17dd65b4986c3945e98e4a2a7f427d8185c1816c1560a4095e4` и 19 изображений внутри ZIP.
- [x] Подготовлен полный текст строк 1–1395 (9 глав и сноски), без строки 1396 от сайта распространения. Изображения не переносились.
- [x] 15 TXT part-01…part-15, суммарно 650495 байт, плюс `manifest.json`, `source-checksums.sha256`, `README.md` и book-specific TASK.
- [x] Источник и задания подтверждены приватным GitHub Contents API: Git Blob SHA **20/20** совпали с локальными SHA после загрузки; базовый источник commit `40ed60d433fd14cc928ef64d54a10419e8f40e56`; PR #148 OPEN.
- [x] Claude Code прочитал все 15 частей (строки 1–1395), проверил SHA (`sha256sum -c` 15/15 OK, склейка `ade8ac11…6729757`, 1395 строк, финал L1366–L1367 на месте) и создал SOURCE_MAP/COVERAGE/BRIEF/SCRIPT/STORYBOARD/CLAIMS_AND_ETHICS_AUDIT в `books/rich-dad-poor-dad-kiyosaki/scripts/`.
- [x] Пилот: прогон https://github.com/adiletzainidinov/balago-video/actions/runs/39790979184 (success). `rddp-pilot.mp4` — 1920×1080, H.264, 30 fps, AAC 48 кГц, **1:11 (71.10 с)**, −16.3 LUFS, 22.1 МБ, без чёрных кадров (`verify.mjs`); 10 реплик ElevenLabs Eric, речь 59.2 с, 136 слов (2.30 слова/с), титры по таймкодам букв, SRT. Приватный pre-release: https://github.com/adiletzainidinov/balago-video/releases/tag/book-rich-dad-poor-dad-kiyosaki (нужен вход в GitHub).
- [x] Полный MP4: прогон https://github.com/adiletzainidinov/balago-video/actions/runs/39808754145 (success; первый прогон 39796784336 перерисован после правки реплики z05a). `final-youtube.mp4` — 1920×1080, H.264, 30/1 fps, yuv420p, AAC 48 кГц моно, **30:00 (1800.00 с)**, −16.2 LUFS, 508 167 117 байт, faststart (moov перед mdat), чёрных участков нет, SHA-256 `628f5a5c7f744814568131221e1431f57807eb607b86b110ca96d2b17a8235ef`. Естественная длина по озвучке 27:26, паузы между сценами растянуты до 30:00 (речь не ускорялась). 203 реплики ElevenLabs Eric.
- [x] `final-youtube.srt` — 560 титров, побайтно совпадает с локальной генерацией из тех же таймкодов; тесты сценария/титров 12/12.
- [x] QA речи: Whisper large-v3-turbo (sherpa-onnx, локально) по всем 203 репликам — средний WER 2.5 %, превышений 0.2 нет (`scripts/voice_qa.json`); единственное первичное превышение (z05a «о выборе» → «до выбора») исправлено переформулировкой и перезаписью. OpenAI API без кредитов — не использовался.
- [x] Визуальная проверка: кадры каждые 90 с по всему фильму + контрольные кадры всех 73 сцен; шесть пауз-вопросов (самые длинные тихие участки 6–7 с — карточки вопросов и финальный хвост).
- [x] 5 разных JPG 1280×720 (131–174 КБ, sRGB), `comparison-sheet.jpg`, `readability-320x180.jpg`, `thumbnail-contact-sheet.jpg`; Hunspell ✓, различие мин. 51.1 (порог 25) ✓; рекомендация №5 «ВАШ ДОМ — ПАССИВ?». 5 названий + фаворит №1, описание, теги, 11 глав — `books/rich-dad-poor-dad-kiyosaki/metadata/` (таймкоды обновятся по финальной озвучке). Локальная галерея проверена: 5/5 view 200 image/jpeg, 5/5 download `Content-Disposition: attachment`, байты = оригиналы.
- [x] Приватные ссылки (pre-release `book-rich-dad-poor-dad-kiyosaki`, репозиторий приватный — **нужен вход в GitHub**; каждый файл скачан через API и проверен ffprobe/размером):
  - Релиз: https://github.com/adiletzainidinov/balago-video/releases/tag/book-rich-dad-poor-dad-kiyosaki
  - Оригинал MP4: https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/final-youtube.mp4 · предпросмотр 960×540: https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/final-youtube-preview-960x540.mp4 · первые 60 с: https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/final-youtube-pilot-60s.mp4 · SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/final-youtube.srt
  - Обложки 1280×720: https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/thumbnail-01.jpg · https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/thumbnail-02.jpg · https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/thumbnail-03.jpg · https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/thumbnail-04.jpg · https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/thumbnail-05.jpg (GitHub отдаёт release-assets как скачивание; просмотр — открыть файл после скачивания или в галерее)
  - Листы: https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/comparison-sheet.jpg · https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/readability-320x180.jpg · https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/thumbnail-contact-sheet.jpg (через `[assets]`) · метаданные: https://github.com/adiletzainidinov/balago-video/releases/download/book-rich-dad-poor-dad-kiyosaki/youtube.md
  - Локальная галерея `node books/500-series/tools/thumbnail-gallery.mjs --dir books/rich-dad-poor-dad-kiyosaki/thumbnails --port 8765` проверена в облачной машине (5/5 view, 5/5 download attachment, байты = оригиналы), но `localhost` облачной машины владельцу недоступен — устойчивые ссылки только релизные.

## PRODUCTION — Claude Code, 2026-10-22

- Концепция «Путь одной монеты»: 73 сцены, 11 глав фильма, ~3300 слов, 6 вопросов для размышления, 60 оригинальных анимированных схем (`src/books/rich-dad-poor-dad-kiyosaki/film/`), тот же банан `src/banana-host/` (ходит по кадру, очки в сценах-разборах), голос Eric (ElevenLabs), `BanaMindAnimatedCaptions`.
- Тест сценария `node --test scripts/books/rddp/script.test.mjs`: опоры L1–L1395 у каждой сцены, все 10 диапазонов TASK §1 покрыты, цитаты ≥ 3 слов дословно найдены в источнике, обязательные оговорки (бухгалтерская модель, «Не бросайте основную работу», «играть по правилам», не юридическая/налоговая инструкция, без долгов, «не призывает быть безответственными»), «вы», без таймеров — 12/12 pass.
- Контрольные кадры всех 73 сцен отрендерены локально и проверены глазами; исправлены переполнения текста (автоподгонка шрифта в карточках), наложения.
- CI: `.github/workflows/rddp-film.yml` — метки `[pilot]` / `[full]` / `[voice]` в заголовке коммита; озвучка → рендер 8 частями → `final-youtube.mp4` + SRT + превью 960×540 → приватный pre-release `book-rich-dad-poor-dad-kiyosaki`.
- Пилот: сцены i01, i02, i03, b03 (хук, одинаковый доход, книга, «актив/пассив — карман»), 30–75 с.

## Источник

```bash
git fetch origin feature/banamind-bm-023-rich-dad-poor-dad
git checkout feature/banamind-bm-023-rich-dad-poor-dad
(cd books/500-series/sources/BM-023 && sha256sum -c source-checksums.sha256)
```

Ожидаются 15 строк `OK`. Склеенная текстовая последовательность — SHA-256 `ade8ac11fbbe52dc8755b0923a910ecddb35dae78698a4ed35f0876fd6729757`. **Книгу не прикреплять в Claude второй раз**, если чтение указанной ветки подтверждено.

## Риски/блокеры

- Производство в PRIVATE разрешено начать по полученному файлу и стандартам; это не обещание готового фильма.
- Права оригинала и русского перевода для коммерческой адаптации не установлены: нельзя публично передавать текст/делать авто-публикацию; публикация фильма ждёт проверки прав владельцем.
- Финансовые кейсы и «актив/пассив» — авторская модель; налоги/инвестиции не выдавать за актуальную консультацию или гарантии; не поощрять процентные займы/обман.
- Смена рабочего чата только через этот STATUS. Не трогать BM-018–022.

## YouTube-пакет (не опубликован)

Названия (`metadata/meta.json` → `youtube.md`):
1. **МОЙ ФАВОРИТ:** «Богатый папа, бедный папа: главные идеи Кийосаки простыми словами | BanaMind» — название книги и автора для поиска, точное обещание формата, без цифр дохода и гарантий; в паре с обложкой №5.
2. «Одна зарплата — два пути: чему на самом деле учит «Богатый папа, бедный папа»»
3. «Ваш дом — актив или пассив? Честный разбор спорной идеи Кийосаки»
4. «6 уроков богатого папы: что полезно сегодня, а что нельзя понимать буквально»
5. «Почему одинаковая зарплата ведёт к разным решениям? Разбор книги Кийосаки»

Обложки: №1 «БОГАТЫЙ ПАПА, БЕДНЫЙ ПАПА» (классика) · №2 «ОДНА ЗАРПЛАТА — ДВА ПУТИ» (интрига) · №3 «АКТИВ / ПАССИВ» + «Простое объяснение» (профессор) · №4 «НЕ МОГУ ПОЗВОЛИТЬ / КАК МОГУ ПОЗВОЛИТЬ?» (противопоставление) · №5 **«ВАШ ДОМ — ПАССИВ?»** (рекомендую: самый сильный и честный вопрос). Главы: 0:00, 1:03, 2:56, 6:47, 11:44, 14:17, 16:23, 19:05, 21:24, 24:13, 27:23.

## NEXT_STEP

Владелец: посмотреть фильм и обложки, выбрать название/обложку, решить вопрос прав на коммерческую адаптацию. PR не мержить и на YouTube не публиковать без явного решения владельца. Повторный рендер после правок сценария — коммит с `[full]` в заголовке (готовые реплики переиспользуются); документы в релиз — `[assets]`.

## Короткий запуск

```text
Начинай BanaMind BM-023 («Богатый папа, бедный папа») в adiletzainidinov/balago-video, ветка feature/banamind-bm-023-rich-dad-poor-dad. Прочитай books/500-series/tasks/BM-023/TASK.md, STATUS.md, правила проекта и все 15 частей в sources/BM-023; проверь SHA-256 и сразу начинай приватное производство и checkpoints. Источник уже в GitHub, книгу повторно не проси. Чужие BM не трогай, PR не мержи, YouTube не публикуй.
```
