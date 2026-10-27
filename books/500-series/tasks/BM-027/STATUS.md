# BanaMind BM-027 — STATUS / переход для нового чата Claude Code

**Дата:** 2026-10-22 (Asia/Bishkek).
**Книга:** Джаред Даймонд — «Ружья, микробы и сталь».
**ID:** BM-027.
**Ветка:** `feature/banamind-bm-027-guns-germs-and-steel`.
**PR:** https://github.com/adiletzainidinov/balago-video/pull/152.
**TASK:** `books/500-series/tasks/BM-027/TASK.md`.
**SOURCE:** `books/500-series/sources/BM-027/README.md`, `manifest.json`, `source-checksums.sha256`, `part-01.txt`…`part-26.txt`.
**OUTPUT:** `books/guns-germs-and-steel-diamond/`.

## CURRENT_STAGE: QA_REVIEW — фильм 30:00, SRT, 5 обложек, метаданные готовы; ждёт решения владельца о правах

**Продакшен выполнен Claude Code 2026-10-22** (ветка `feature/banamind-bm-027-guns-germs-and-steel`, зеркало `claude/banamind-bm-027-guns-germs-steel-cuh8z3`, PR #152 — НЕ мержить без владельца). Книгу повторно не запрашивать.

### Готовые файлы (приватный pre-release, нужен вход в GitHub с доступом к репозиторию)
- Релиз: https://github.com/adiletzainidinov/balago-video/releases/tag/book-guns-germs-and-steel-diamond
- Видео (оригинал): https://github.com/adiletzainidinov/balago-video/releases/download/book-guns-germs-and-steel-diamond/final-youtube.mp4 — 1920×1080, 30 fps, H.264 High/AAC 48 кГц, **30:00**, 477,9 МБ, −17 LUFS; превью 960×540: https://github.com/adiletzainidinov/balago-video/releases/download/book-guns-germs-and-steel-diamond/final-youtube-preview-960x540.mp4
- SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-guns-germs-and-steel-diamond/final-youtube.srt (537 титров; копия `books/guns-germs-and-steel-diamond/video/final-youtube.srt`)
- Обложки: https://github.com/adiletzainidinov/balago-video/releases/download/book-guns-germs-and-steel-diamond/thumbnail-01.jpg … thumbnail-05.jpg, https://github.com/adiletzainidinov/balago-video/releases/download/book-guns-germs-and-steel-diamond/thumbnail-contact-sheet.jpg, https://github.com/adiletzainidinov/balago-video/releases/download/book-guns-germs-and-steel-diamond/readability-320x180.jpg
- Приватная страница просмотра обложек (claude.ai, только владелец): https://claude.ai/artifact/Wy2uywLmkUAiv5cvGYs1FH
- Прогоны CI: пилот https://github.com/adiletzainidinov/balago-video/actions/runs/39833949096, полный https://github.com/adiletzainidinov/balago-video/actions/runs/39837879143

### Пять названий (фаворит — №1)
1. **Ружья, микробы и сталь: почему одни общества получили историческое преимущество?** — МОЙ ФАВОРИТ
2. Как география меняла историю? Главная гипотеза Джареда Даймонда
3. Почему у одних появились сталь и большие армии? Разбираем Даймонда
4. Ружья, микробы и сталь за 30 минут: что объясняет книга — и чего не объясняет
5. Земледелие, микробы и власть: цепочки причин, изменившие историю
Обложки: №1 ПОЧЕМУ ИМ ПОВЕЗЛО? · №2 ГЕОГРАФИЯ РЕШАЕТ? (рекомендую) · №3 РУЖЬЯ • МИКРОБЫ • СТАЛЬ · №4 ГДЕ НАЧИНАЕТСЯ ВЛАСТЬ? · №5 ТАЙНА ВЕЛИКОГО НЕРАВЕНСТВА. Метаданные с главами по реальному тайм-лайну: `books/guns-germs-and-steel-diamond/metadata/youtube.md`.

### Сделано
- [x] `sha256sum -c` → 26/26 OK; все 26 частей прочитаны; карты `scripts/source-map/part-01…26.md` (≈ 930 якорей, цитаты сверены побайтно).
- [x] BRIEF, SOURCE_MAP, COVERAGE (пролог, 19 глав, эпилог, послесловие 2003 — у всех есть опоры), SCIENCE_AND_HISTORY_AUDIT, GEOGRAPHY_CAUSAL_MAP, HUMAN_DIGNITY_REVIEW, RELIGIOUS_EDITORIAL_AUDIT, COPYRIGHT_AND_YOUTUBE_AUDIT, SCRIPT, STORYBOARD, VOICE_CUE_SHEET, REVIEW_NOTES.
- [x] Сценарий 59 сцен / 162 реплики / ≈ 3 000 слов / 53 дословные цитаты / 5 вопросов-пауз; тесты 11/11.
- [x] Анимация `src/lesson-diamond/` (общий банан, BanaMindAnimatedCaptions, метки типа утверждения, 28 видов сцен); пилот 0:47 принят; полный рендер 30:00 проверен (ffprobe, громкость, чёрные кадры, 36 кадров, независимая перепроверка скачанного файла).
- [x] Озвучка ElevenLabs (голос банана), ASR-проверка 162 реплик: среднее 0,947, имена распознаны.
- [x] 5 обложек 1280×720 (орфография ✓, различие ✓, 320×180), галерея `thumbnail-gallery.mjs` проверена HTTP: 5×200 просмотр, 5× `Content-Disposition: attachment`, байты = оригиналы (локальный сервер в облачном контейнере владельцу недоступен — постоянные ссылки в релизе и приватная страница claude.ai).
- [ ] **Решение владельца:** права на книгу/перевод, выбор названия и обложки. Без этого — не мержить PR и не публиковать на YouTube.

## EXACT NEXT ACTION
Ничего не рендерить заново. Владелец смотрит фильм и обложки, проверяет права. Если нужны правки — менять `src/lesson-diamond/script.ts` / визуалы, пуш с «[pilot]» или «[full]» в сообщении коммита (озвучка кэшируется по хэшу реплики).

### Реальный файл и очистка
- ZIP `Daymond_Ruzhya-mikroby-i-stal.237834.txt.zip`, размер 3 386 168 bytes, SHA256 `42df84f40ad1d5146f0ae0a7e17272175601eb3fa04f41fa01dbe7acffa24398`, архив CRC OK.
- 65 членов ZIP: один русский `Daymond_Ruzhya-mikroby-i-stal.237834.txt` 2 183 780 bytes, SHA256 `57f846fb834f8ec4ee76202f17971dc51ce37f89a49471b090d7b9a49b18ae65`; **64 изображения** не загружены.
- Исходник TXT 1592 lines; исключён иллюстративный блок подписей к фото 1409–1480 и итоговый watermark/атрибуция книги по стороннему порталу на строке 1592. Удалены inline `[Картинка: ...]` placeholders. **Предисловие, пролог «Вопрос Яли», 4 части, 19 глав, эпилог, послесловие 2003 года, благодарности, справочная литература и примечания — сохранены**.
- Автор/переводчик коммерческого русского перевода не атрибутирован надёжно по файлу. Книга современная, оригинал и перевод защищены авторским правом; публичная коммерческая адаптация, выпуск на YouTube, иллюстрации и схема пользовательского ZIP не лицензированы автоматически. Нельзя выкладывать raw book в public CDN или производить заместительную аудиокнигу.
- Рамка: самостоятельно критически исследовать **модель Даймонда** (вопрос Яли → география и биогеография → производящие хозяйства → плотность/власть/письменность/технологии → исторические болезни/столкновения), объяснять «позиция книги», не выдавать географический детерминизм за установленную науку или расовые различия за причину; отдельный аудит достоинства/колониализма и исторической научной точности.

## DONE — фактические шаги
- [x] Проверена актуальная общая нумерация GitHub, BM-027 был первый свободный после занятых BM-025, BM-026; ID BM-027 закреплён через новую feature branch.
- [x] Строка BM-027 временно `CLAIMED` в общем реестре (commit `c2784e152930a1dfdfefd061b75a089632c0fee8`); после PR координатор переведёт SOURCE_READY.
- [x] ZIP прочитан, crc OK, SHA256 сохранён; источник с 19 реальными главами, не путать с библиографией.
- [x] 26 TXT-фрагментов в исходном порядке записаны и побайтно сверены с Git Blob SHA по отдельности; 26/26.
- [x] Исходники `manifest.json` и `source-checksums.sha256` записаны, отдельно `README.md`.
- [x] Подробный book-specific производственный `TASK.md` с содержательным фильмом, картой причин, роликами и пятью превью.
- [x] PR #152 открыт, URL записан; REGISTRY переведён в SOURCE_READY (commit 784dd1107a24282047993f715ff080ab87583231), HANDOFF обновлён (commit cac5172f011858a91235b39b8e6e36f6d9ac1505).\n- [x] Проверка GitHub Actions `BanaMind — validate 500-book registry (docs only)` для PR #152 завершилась SUCCESS; PR OPEN, mergeable true (2026-10-22).
