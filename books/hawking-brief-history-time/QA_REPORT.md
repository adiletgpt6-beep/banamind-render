# BM-014 — QA_REPORT «Краткая история времени» (2026-10-21)

## Видео — `final-youtube.mp4` (prerelease `lesson-hawking-bm014` и `book-hawking-brief-history-time`)
- ffprobe: H.264 High, 1920×1080, yuv420p, 30/1 fps; AAC LC 48 кГц; **30:16 (1816,16 с)** — в целевом диапазоне 29:30–30:30; 505,8 МБ; SHA-256 `2c2e9fb38beced1b0e69e05810e50f73c3a2bb01166cf484d44ac6da295d7616` (одинаков в обоих релизах).
- `scripts/lesson-hawking/verify.mjs`: ✓ формат, длительность, громкость −17 LUFS, нет чёрных участков > 1 с.
- Тишина ≥ 4 с: 6 мест — 5 карточек «Вопрос для размышления» и финальная пауза; звук от начала до конца.
- Без таймеров и обратных отсчётов (тест `script.test.mjs`, карточка вопроса не считает время).
- Визуальный QA: кадр середины каждой из 64 сцен готового MP4 просмотрен (листы сцен); наложения, найденные на черновых кадрах (поезд, близнецы, башня, затмение, сумма по историям, инфляция, финал), исправлены до рендера.

## Озвучка
- ElevenLabs Eric (`eleven_multilingual_v2`, seed 23) — тот же голос BanaMind; 235 реплик, речь 26,7 мин.
- Обратная проверка Whisper large-v3-turbo (sherpa-onnx, локально; ключ OpenAI «BalaGo Audio QA» — insufficient_quota): **средний WER 4,1 %**; все реплики с WER > 0,2 — годы и дроби, распознанные цифрами («1922» ↔ «тысяча девятьсот двадцать втором»). Отчёт — `out/voice_qa.json` (локально, не в Git).

## Титры и SRT
- `BanaMindAnimatedCaptions` по таймкодам букв ElevenLabs: 595 титров, ≤ 2 строк, без перекрытий, текст титров = сценарий слово в слово, выделено 8,2 % слов, 12 редких кинетических слов (≥ 45 с друг от друга) — `captions-check.mjs` без ошибок.
- `final-youtube.srt`: 595 записей, 00:00:00,450 → 00:30:10,859, тот же расчёт, что и в кадре.

## Сценарий, наука, религия
- `node --test scripts/lesson-hawking/script.test.mjs` — 11/11: источники Lnnn/«лаборатория»/«дополнение» у каждой сцены, дополнения со ссылкой на `SCIENCE_UPDATE_REFERENCES.md`, метки эпохи книги, гипотезы помечены, религиозные ограничения и атрибуция голосов, обращение на «вы», числа словами.
- `SCIENCE_TIME_AUDIT.md`, `SCIENCE_UPDATE_REFERENCES.md` (8 дополнений с URL, проверено 2026-10-21), `RELIGIOUS_EDITORIAL_AUDIT.md`.
- Спорное место книги, отмеченное для владельца: опыт «1962 г., часы на водонапорной башне» (L198) — фильм передаёт его как описание книги; исторически ближе к опыту Паунда — Ребки (1959–60).

## Обложки и метаданные
- 5 JPG 1280×720 sRGB (122–159 КБ), орфография Hunspell ✓, различие мин. 42,7 (порог 25) ✓, лист 320×180 — `thumbnails/checks.json`.
- Галерея `books/500-series/tools/thumbnail-gallery.mjs` (локально в контейнере): 5 «Просмотреть» (200, image/jpeg), 5 «Скачать» (200, `Content-Disposition: attachment`, байты идентичны, 1280×720), контакт-лист ✓. Порт облачного контейнера владельцу недоступен → постоянная **приватная** галерея: https://claude.ai/artifact/MKPjBy2DTVhLf9YeA8uMLJ (обложки байт-в-байт как в релизе, скачивание через сохранение файла в claude.ai).
- `metadata/youtube.md`: 5 названий ≤ 100 символов, описание 2,9 тыс. зн., теги ≤ 500, 42 главы по реальной озвучке (0:00 … 28:59), орфография ✓.

## Проверенные ссылки (приватный репозиторий — нужен вход в GitHub)
- Фильм 1080p: https://github.com/adiletzainidinov/balago-video/releases/download/book-hawking-brief-history-time/final-youtube.mp4
- Превью 960×540: https://github.com/adiletzainidinov/balago-video/releases/download/lesson-hawking-bm014/hawking_bm014_30min-preview-960x540.mp4
- SRT: https://github.com/adiletzainidinov/balago-video/releases/download/lesson-hawking-bm014/final-youtube.srt
- Обложки: https://github.com/adiletzainidinov/balago-video/releases/download/book-hawking-brief-history-time/thumbnail-01.jpg … thumbnail-05.jpg; лист: https://github.com/adiletzainidinov/balago-video/releases/download/book-hawking-brief-history-time/comparison-sheet.jpg
Каждый файл скачан через GitHub REST API (тот же доступ, что у владельца): размеры, хэши и параметры совпали.

## Ограничения
- `PUBLICATION_RIGHTS_UNVERIFIED`: только приватный предпросмотр; публикация на YouTube и монетизация — после проверки прав владельцем.
- Открытие ссылок с телефона владельца из этой среды проверить нельзя; ссылки GitHub требуют входа, галерея claude.ai — входа в аккаунт владельца.
