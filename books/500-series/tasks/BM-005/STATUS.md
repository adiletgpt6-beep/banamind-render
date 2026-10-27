# BanaMind BM-005 — STATUS (точка возобновления)

**Создано:** 2026-10-18 (не живой статус после этой даты).
**Книга:** Роберт Грин — «48 законов власти», РИПОЛ КЛАССИК, русский перевод Е. Я. Мигуновой, 2003.
**Задача:** `books/500-series/tasks/BM-005/TASK.md`
**Ветка:** `feature/banamind-bm-005-robert-greene`
**PR:** https://github.com/adiletzainidinov/balago-video/pull/126
**Стадия:** QA_REVIEW — фильм 30:00, SRT, сценарий, 5 обложек и метаданные готовы и проверены; ждёт проверки владельцем и решения по правам. На YouTube не публиковалось.
**Источник:** пользователь загрузил в ChatGPT `robert_grin_48_zakonov_vlasti_full_text.txt`. **Нужно прикрепить ЭТОТ ЖЕ TXT к новому чату Claude Code.** Он не получает вложения ChatGPT автоматически.
**TXT-атрибуты (проверены в ChatGPT):** 2 314 273 байта UTF-8, 18 587 строк, `SHA256=30d75837d113b6b4bd6c880d07c89727ea19ae23580891b311e3fc1860845577`; 390 меток страниц от PDF 1 до 390.
**КРИТИЧЕСКОЕ:** PDF-страницы **137–151** повреждены в исходном документе и TXT содержит заглушки. Не додумывать, не подменять сторонним изданием. Законы 20–21 по оглавлению затрагивают эту область — не строить по их отсутствующему содержанию сценарий.
**Формат:** ~30 минут 1920×1080 16:9 30fps H.264/AAC, русский фильм с бананом, динамические субтитры + SRT.
**Авторские права:** перевод и книга защищены, публичная коммерческая публикация не утверждена. Разрешена закрытая подготовка, **не автоматическая публикация на YouTube**.
**Редакторское разрешение:** для BM-005 владелец заранее делегировал выбор сцен/сценария/пилота; дополнительных подтверждений по редакционным этапам не требовать (внутренний смысловой QA обязателен).
**Постоянные требования:** 5 разных названий YouTube + фаворит; 5 разных готовых 1280×720 превью + контакт-лист; **отдельные проверенные ссылки просмотра и скачивания оригинала каждой обложки и MP4**.

## DONE (факт, не планы)
- [x] BM-005 зарезервирован в GitHub-реестре 500 книг.
- [x] TXT в ChatGPT изучен на предмет метаданных/полноты маркеров и повреждения страниц.
- [x] Подробный TASK.md и данный STATUS.md записаны в отдельную GitHub-ветку.
- [x] TXT доставлен в Claude Code (вложение чата `robert_grin_48_zakonov_vlasti_full_text.txt`): 2 314 273 байта, 18 587 строк, SHA256 `30d75837…845577` совпадает, 390 маркеров PDF 1–390, 15 маркеров повреждения на PDF 137–151. Полный текст в Git НЕ хранится (авторское право); конспекты со страницами — `books/robert-greene-48-laws-of-power/research/` (после этапа чтения). Если нужно перечитать — владелец прикладывает TXT снова.
- [x] Прочитан весь доступный TXT (PDF 1–136 и 152–390) → `books/robert-greene-48-laws-of-power/research/notes-part1..5.md`; `BRIEF.md` (24 закона + рамка книги), сценарий `src/lesson-greene/script.ts` (48 сцен, 145 реплик, ~3220 слов, 6 вопросов-пауз, страницы PDF у каждой сцены; тест гарантирует отсутствие ссылок на PDF 137–151); `SOURCE_MAP.md` и `SCRIPT.md` генерируются скриптами.
- [x] Озвучка ElevenLabs (голос банана Eric, как в BM-001…004): 145 файлов `public/lesson-greene/voice/`, речь 25:56, фильм по тайм-лайну **30:00** (естественная 28:26). Обратная проверка локальным Whisper large-v3-turbo (sherpa-onnx): средний WER 5,7 % — расхождения только в записи цифр/имён (`books/robert-greene-48-laws-of-power/voice_qa.json`).
- [x] 48 анимированных схем `src/lesson-greene/visuals/*.tsx` + набор «двора» `court.tsx`; кадры всех сцен проверены; tsc/eslint/тесты (10/10)/captions-check — без ошибок.
- [x] Внутренний пилот 60 с: релиз → `pilot-60s.mp4` (1920×1080, 30 fps, H.264/AAC, −17 LUFS) проверен.
- [x] Полный рендер `final-youtube.mp4` 30:00 + `final-youtube.srt` (прогон 39147431976) — скачан и проверен: 1920×1080, 30 fps, H.264/AAC 48 кГц, 1800,02 с, −17 LUFS, без чёрных кадров и длинной тишины; кадры по всей длине просмотрены.
- [x] 5 YouTube-названий + фаворит №1 (`metadata/YOUTUBE_TITLES.md`), описание, теги, 34 главы (`metadata/meta.json` → `youtube.md`; таймкоды обновляются после озвучки).
- [x] 5 обложек 1280×720 + `thumbnail-contact-sheet.jpg` + `readability-320x180.jpg`, `checks.json` ок (орфография, формат, различие ≥ 61). Рекомендация №2 «КАК НЕ СТАТЬ ПЕШКОЙ?».
- [x] Обложки в релизе: все пять скачаны через API — 1280×720 JPEG; контакт-лист и 320×180 на месте.
- [x] Финальный технический QA и реальные ссылки на Full HD MP4, SRT и сценарий (ARTIFACTS).
- [ ] Право публичного релиза подтверждено (по умолчанию НЕТ).

## BLOCKERS
1. Для запуска производства: передача **TXT-файла именно в Claude Code**. Это единственный подтверждённый текущий технический блокер.
2. Для публикации/монетизации: подтвердить права либо иную правовую основу.
3. Для точности: страницы 137–151 недоступны из исходника; пропустить, без домыслов. Это ограничение, но не причина останавливать весь фильм.

## NEXT_STEP
Владелец: посмотреть фильм и обложки, выбрать название/обложку (рекомендации: название №1, обложка №2), решить вопрос прав. Правки — точечно: текст реплики в `src/lesson-greene/script.ts` → push (CI переозвучит только изменённые реплики) → полный рендер без метки. Ничего не делать заново.

## ARTIFACTS (проверено 2026-10-18: файлы скачаны через GitHub API и проверены ffprobe; браузерные ссылки требуют входа в GitHub)
- PR: https://github.com/adiletzainidinov/balago-video/pull/126 · ветка `feature/banamind-bm-005-robert-greene`
- Релиз (prerelease, приватный): https://github.com/adiletzainidinov/balago-video/releases/tag/book-robert-greene-48-laws-of-power
- **Скачать Full HD MP4** (1920×1080, 30 fps, H.264/AAC, 30:00, 620 МБ): https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/final-youtube.mp4
- **Смотреть** (960×540, 77 МБ): https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/final-youtube-preview-960x540.mp4
- SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/final-youtube.srt · сценарий: https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/SCRIPT.md · кадры: https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/film-frames.jpg · пилот: https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/pilot-60s.mp4
- Сценарий в репо: `books/robert-greene-48-laws-of-power/SCRIPT.md`; бриф `BRIEF.md`; карта `SOURCE_MAP.md`; конспекты `research/`
- Обложки 1280×720 (просмотр = открыть в браузере, скачать = та же ссылка, файл-оригинал): №1 https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/thumbnail-01.jpg · №2 ★ https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/thumbnail-02.jpg · №3 https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/thumbnail-03.jpg · №4 https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/thumbnail-04.jpg · №5 https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/thumbnail-05.jpg
- Все 5: https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/thumbnail-contact-sheet.jpg · читаемость 320×180: https://github.com/adiletzainidinov/balago-video/releases/download/book-robert-greene-48-laws-of-power/readability-320x180.jpg
- Названия/метаданные: `metadata/YOUTUBE_TITLES.md`, `metadata/youtube.md` (и в релизе)
- Расходы: ElevenLabs ≈ 145 реплик (~3 220 слов) один раз; CI: пилот + один полный рендер (8 частей). Повторно не синтезировать и не рендерить без изменений.

## Короткий restart для нового Claude
Продолжай BanaMind BM-005 в `adiletzainidinov/balago-video`. Прочитай TASK и этот STATUS в ветке `feature/banamind-bm-005-robert-greene`, MASTER_CLAUDE, проверь PR/CI, начинай с NEXT_STEP. Не повторяй DONE и не выдумывай содержимое повреждённых PDF-страниц 137–151.
