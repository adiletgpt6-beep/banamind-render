# BanaMind BM-024 — STATUS

**Дата:** 2026-10-22, Бишкек UTC+06:00.
**Книга:** Эрик Рис «Бизнес с нуля. Метод Lean Startup для быстрого тестирования идей и выбора бизнес-модели».
**Номер:** BM-024 · **slug:** `lean-startup-eric-ries` · **код CI:** `lsr`.
**Ветка:** `feature/banamind-bm-024-lean-startup-ries` · **PR:** https://github.com/adiletzainidinov/balago-video/pull/149
**TASK:** `books/500-series/tasks/BM-024/TASK.md` · **SOURCE:** `books/500-series/sources/BM-024/`

## CURRENT_STAGE: QA_REVIEW (фильм, обложки, метаданные готовы; ждёт решения владельца)

Публикация: `BLOCKED_UNVERIFIED_RIGHTS` — права на перевод и коммерческую адаптацию не подтверждены; auto-merge и auto-YouTube запрещены.

## Источник — проверено Claude Code

- [x] `cd books/500-series/sources/BM-024 && sha256sum -c source-checksums.sha256` → **21/21 OK** (2026-10-22).
- [x] Все 21 часть прочитаны полностью (8 параллельных читателей), подробные заметки с номерами строк, точными цитатами, историческими кейсами и спорными местами: `books/lean-startup-eric-ries/scripts/source-notes/L0068-…L1262.md` (8 файлов, ~600 КБ; все цитаты проверены поиском подстроки).
- [x] Нумерация: строка исходного TXT = A + (локальная − 4), A — начало диапазона из manifest; служебные строки 1–3 каждой части — не текст автора. `scripts/books/lsr/source.mjs`.
- Замечание: в part-02 заголовок обещает 111–148 (38 строк), а текстовых строк 35 — возможен сдвиг до 3 строк в гл. 1 (на опоры фильма не влияет: m03 L136–L139, r01 L141).
- Термины этого перевода: «экономичный стартап», «подтверждение фактами», «минимально рабочий продукт», «вираж», «учет инноваций», «показатели тщеславия», «действенные показатели», «механизм роста», «соразмерные инвестиции», «остров свободы», «песочница».

## DONE — производство (Claude Code)

- [x] Концепция «Почему умные стартапы проваливаются — и что проверять до масштабирования?» / «Лаборатория гипотез BanaMind» (четыре двери: предположение → эксперимент → честная метрика → решение), учебный пример «Утренний хлеб» (вымышленный).
- [x] Сценарий `src/books/lean-startup-eric-ries/film/script.ts`: **83 сцены, 183 реплики, 3343 слова, 14 глав, 6 вопросов для размышления**; у каждой сцены опоры `Lnnn`; ярлыки «исторический пример из книги» / «учебный пример BanaMind».
- [x] 83 оригинальные анимированные схемы (`film/visuals/*.tsx`), тот же банан `src/banana-host/`, титры `BanaMindAnimatedCaptions` (акцент #5fd6ff, 11 кинетических моментов).
- [x] Тест `node --test scripts/books/lsr/script.test.mjs` — 12/12: источник L68–L1262 и эпилог, опоры у всех сцен и покрытие введения/12 глав/эпилога, цитаты ≥ 3 слов дословно в источнике и ≤ 16 слов, обязательные оговорки («не гарантирует», «исторический пример», «учебный пример»), нет «90 %», «fail fast», рекламы и обещаний дохода, «вы», без таймеров, титры по озвучке.
- [x] Контрольные кадры всех 83 сцен отрендерены локально (headless shell) и проверены глазами; исправлены наложения на титры, перекрытия ведущим, переполнения текста.
- [x] Документы: `books/lean-startup-eric-ries/scripts/` — BRIEF, SOURCE_MAP (83 сцены → строки → part:строка), COVERAGE, FACT_VS_INTERPRETATION, RIGHTS_AND_YOUTUBE_AUDIT, SCRIPT, STORYBOARD, VOICE_CUE_SHEET (таймкоды обновятся по финальной озвучке).
- [x] 5 обложек `books/lean-startup-eric-ries/thumbnails/thumbnail-01…05.jpg` (1280×720, sRGB, 126–153 КБ) + `comparison-sheet.jpg`, `readability-320x180.jpg`, `thumbnail-contact-sheet.jpg`; Hunspell ✓; различие мин. 53.1 (порог 25); рекомендация №5 «ОПАСНЫЕ МЕТРИКИ».
- [x] Метаданные: `metadata/meta.json` → `youtube.md/json` — 5 названий (фаворит №1), описание с оговорками, теги, 14 глав.
- [x] Пилот и полный фильм проверены (см. ниже).
- [x] CI `.github/workflows/lsr-film.yml` (метки в заголовке коммита: `[pilot]`, `[full]`, `[voice]`, `[assets]`) → приватный pre-release `book-lean-startup-eric-ries`.
- [x] Пилот, прогон 1: озвучка 10 реплик ElevenLabs (Eric, multilingual v2) сохранена ботом (commit `10f8add`); рендер упал на `apt-get` (403 стороннего репозитория Microsoft в раннере) → исправлено в workflow.
- [x] **Пилот, прогон 2 — успех:** https://github.com/adiletzainidinov/balago-video/actions/runs/39820399579 · `lsr-pilot.mp4` 1920×1080 H.264 30 fps, AAC 48 кГц, **1:12 (72.03 с)**, −16.2 LUFS, 23.5 МБ, без чёрных кадров (`verify.mjs`); SRT по таймкодам букв; кадры просмотрены. Обратная проверка речи (Whisper turbo, sherpa-onnx): 10 реплик, **средний WER 2.3 %**, ни одной > 20 %. Приватный pre-release: https://github.com/adiletzainidinov/balago-video/releases/tag/book-lean-startup-eric-ries (нужен вход в GitHub).

## Пять названий YouTube

1. **МОЙ ФАВОРИТ:** «Почему хорошие идеи не взлетают? Разбираем «Бизнес с нуля» Эрика Риса» — точно повторяет хук фильма, даёт поиск по книге и автору, без цифр и обещаний.
2. «Как проверить бизнес-идею до больших затрат? Метод Lean Startup простыми словами»
3. «Почему понимание клиента важнее идеального продукта — идеи Эрика Риса»
4. «MVP, метрики и вираж: как стартап узнаёт правду о своей идее»
5. «Почему красивые цифры могут обмануть стартап? «Бизнес с нуля» Эрика Риса»

Тексты обложек: №1 «ИДЕЯ НЕ ПРОДАЁТСЯ?», №2 «КЛИЕНТЫ НЕ ПРИХОДЯТ?», №3 «НАЧНИТЕ С ТЕСТА», №4 «МЕНЯТЬ КУРС?», №5 «ОПАСНЫЕ МЕТРИКИ» (рекомендую).

## Полный фильм — готов и проверен

- Прогон `[full]`: https://github.com/adiletzainidinov/balago-video/actions/runs/39821910315 — success (озвучка 173 новых реплик, рендер 8 частями, сборка).
- `final-youtube.mp4`: **1920×1080, 16:9, 30 fps, H.264 High yuv420p, AAC-LC 48 кГц, 30:00 (1800.00 с), −16.2 LUFS, пик −1.0 dBFS, 590.8 МБ**; `verify.mjs` ✓ (формат, длительность 29:30–30:30, звук, нет чёрных кадров); паузы > 6 с — только 5 запланированных вопросов (~7 с); 16 кадров просмотрены.
- Естественная длительность по озвучке 29:56 → 30:00 почти без растяжки пауз; речь не ускорялась.
- Обратная проверка речи `scripts/voice_qa.json`: 183 реплики, **средний WER 2.4 %**; > 20 % — l04a («генти генбуцу», японский термин), b01a («создать-оценить-научиться»), n02b («песочница» после тире) — ошибки распознавателя на составных/иностранных словах, текст озвучки совпадает со сценарием.
- `final-youtube.srt` — 61 КБ, из тех же таймкодов, что и титры в кадре.

## Ссылки (приватный репозиторий — нужен вход в GitHub)

- Посмотреть (лёгкий предпросмотр 960×540): https://github.com/adiletzainidinov/balago-video/releases/download/book-lean-startup-eric-ries/final-youtube-preview-960x540.mp4
- Скачать оригинал 1920×1080: https://github.com/adiletzainidinov/balago-video/releases/download/book-lean-startup-eric-ries/final-youtube.mp4
- SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-lean-startup-eric-ries/final-youtube.srt · первые 60 с: https://github.com/adiletzainidinov/balago-video/releases/download/book-lean-startup-eric-ries/final-youtube-pilot-60s.mp4 · пилот: https://github.com/adiletzainidinov/balago-video/releases/download/book-lean-startup-eric-ries/lsr-pilot.mp4
- Обложки: https://github.com/adiletzainidinov/balago-video/releases/download/book-lean-startup-eric-ries/thumbnail-01.jpg … thumbnail-05.jpg · лист: https://github.com/adiletzainidinov/balago-video/releases/download/book-lean-startup-eric-ries/thumbnail-contact-sheet.jpg (загружаются job `[assets]`)
- Релиз: https://github.com/adiletzainidinov/balago-video/releases/tag/book-lean-startup-eric-ries

## Галерея обложек

`node books/500-series/tools/thumbnail-gallery.mjs --dir books/lean-startup-eric-ries/thumbnails --port 8765` проверена по HTTP 2026-10-22: 5/5 `/view` → 200 image/jpeg; 5/5 + лист `/download` → `Content-Disposition: attachment`, байты = оригиналы 1280×720. Ограничение: облачный контейнер Claude Code без проброса портов — `localhost` недоступен владельцу; постоянный доступ — через приватный релиз.

## Осталось (владелец)

- [ ] Решение по правам на перевод/коммерческую адаптацию и политике YouTube (см. `scripts/RIGHTS_AND_YOUTUBE_AUDIT.md`).
- [ ] Выбор названия и обложки; ручная публикация. PR #149 не мержить без владельца.

## Следующий шаг

Ждать решения владельца. При правках — изменить `script.ts`/схемы и коммит с `[full]` (готовые реплики переиспользуются); документы — `[assets]`.

## Короткий запуск

```text
Продолжай BanaMind BM-024 («Бизнес с нуля», Э. Рис) в adiletzainidinov/balago-video, ветка feature/banamind-bm-024-lean-startup-ries, PR #149. Прочитай books/500-series/tasks/BM-024/STATUS.md и продолжай с «Следующего шага». Источник уже в GitHub, книгу повторно не проси. PR не мержи, YouTube не публикуй.
```
