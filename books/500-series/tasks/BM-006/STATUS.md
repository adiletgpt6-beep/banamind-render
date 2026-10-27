# BanaMind BM-006 — STATUS (checkpoint)

**Снимок состояния:** 2026-10-18; новая Claude-сессия обязана перепроверить GitHub/PR/Actions.
**Книга:** Айн Рэнд, «Атлант расправил плечи» — **только ознакомительный фрагмент** (часть I, главы I–IX, IX — частично), не весь роман.
**Задание:** `books/500-series/tasks/BM-006/TASK.md` · **Ветка:** `feature/banamind-bm-006-ayn-rand` · **PR:** https://github.com/adiletzainidinov/balago-video/pull/127
**Стадия:** QA_REVIEW — фильм, SRT, сценарий, 5 обложек и YouTube-пакет готовы и проверены; ждут решения владельца. **Не опубликовано.**
**Авторские права:** роман и перевод охраняются. Только закрытый прототип (приватный репозиторий, pre-release). Публикация на YouTube не выполнялась и требует проверки прав владельцем.

## Источник (проверен в Claude Code)
- TXT получен во вложении чата Claude Code: 1 319 141 байт, 9 125 строк, SHA256 `67bcbe816f4b98ba12a16fc44caf254b9f66f97dd0fc947feeaec686416a78da` — **совпадает** с TASK.
- Начало: «ОЗНАКОМИТЕЛЬНЫЙ ФРАГМЕНТ (не полная книга)»; конец — строка 9119 «Конец ознакомительного фрагмента» (монолог Моуэна, гл. IX).
- **Сам TXT в репозиторий не коммитится.** Для правки SOURCE_MAP прикрепите файл снова и запустите `SOURCE_TXT=/path/atlas.txt node scripts/lesson-atlas/export-docs.mjs` (скрипт сверяет SHA256).
- Прочитан весь фрагмент (гл. I–IX, конспекты с номерами строк), ключевые цитаты сверены вручную.

## DONE — подтверждено
- [x] TXT получен, SHA/размер/строки/обрыв проверены.
- [x] `BRIEF.md` (отбор тем), `SOURCE_MAP.md` (48 сцен → строки файла, глава, поисковая выдержка), `SCRIPT.md` (полная речь, кадр, действия, реальные таймкоды; 48 сцен, 212 реплик, 3 457 слов, 5 вопросов).
- [x] Фильм Remotion `src/lesson-atlas/`: тот же банан, `BanaMindAnimatedCaptions` по таймингам букв ElevenLabs, 41 вид анимированных схем, без таймеров; «только фрагмент» — в начале (сцена i02), плашке частей на весь фильм и финале (e04).
- [x] Озвучка ElevenLabs Eric (голос BM-001), 212 реплик, речь 26,9 мин. Обратная проверка Whisper large-v3-turbo (локально; OpenAI API без кредитов): средний WER 3,8 % (цифры/написание имён), 4 нечёткие реплики переписаны, переозвучены и перепроверены — `voice_qa.json`.
- [x] Пилот 60 с проверен (1920×1080, 30 fps, H.264/AAC, −17 LUFS).
- [x] **Полный MP4** (прогон https://github.com/adiletzainidinov/balago-video/actions/runs/39154076924, success): скачан и проверен `verify.mjs` — 1920×1080, H.264 yuv420p, 30 fps, AAC 48 кГц, **30:00 (1799,98 с)**, −17 LUFS, 462,4 МБ, без чёрных участков; 15 кадров по всему фильму просмотрены.
- [x] SRT `final-youtube.srt` (из тех же титров; ≤ 2 строк, без перекрытий — `captions-check.mjs` ✓).
- [x] 5 обложек 1280×720 JPEG ≤ 2 МБ, Hunspell ✓, различие ≥ 25 (мин. 56) ✓, лист сравнения и лист 320×180; рекомендация №5.
- [x] 5 названий + фаворит №1 (`metadata/YOUTUBE_TITLES.md`), описание с пометкой «по ознакомительному фрагменту», 15 тегов, 34 главы по финальному тайм-лайну (`metadata/youtube.md`, проверки ✓).
- [x] `book-assets.yml` обрабатывает только изменённые книги (BM-001 не перевыпускается), добавляет `thumbnail-contact-sheet.jpg`.
- [ ] Права на публичную публикацию — не проверены (блокер публикации).
- [ ] Решение владельца: финальная обложка/название, публикация.

## Ссылки (приватный репозиторий — нужен вход в GitHub)
- Фильм MP4 1920×1080: https://github.com/adiletzainidinov/balago-video/releases/download/book-ayn-rand-atlas-shrugged-fragment/final-youtube.mp4 (то же: `lesson-atlas-fragment/atlas_fragment_banamind_30min.mp4`)
- Превью 960×540: https://github.com/adiletzainidinov/balago-video/releases/download/lesson-atlas-fragment/atlas_fragment_banamind_30min-preview-960x540.mp4
- SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-ayn-rand-atlas-shrugged-fragment/final-youtube.srt
- Сценарий: https://github.com/adiletzainidinov/balago-video/blob/feature/banamind-bm-006-ayn-rand/books/ayn-rand-atlas-shrugged-fragment/SCRIPT.md
- Релиз книги (всё вместе): https://github.com/adiletzainidinov/balago-video/releases/tag/book-ayn-rand-atlas-shrugged-fragment
- Обложки: просмотр — `blob/feature/banamind-bm-006-ayn-rand/books/ayn-rand-atlas-shrugged-fragment/thumbnails/thumbnail-0N.jpg`; скачать — `releases/download/book-ayn-rand-atlas-shrugged-fragment/thumbnail-0N.jpg`; все 5 — `thumbnail-contact-sheet.jpg` / `comparison-sheet.jpg`.

## Расходы
- ElevenLabs: ≈23 тыс. символов (полная озвучка) + 4 реплики.
- GitHub Actions: пилот (2 части) + полный рендер (10 частей ≈ 30 мин).

## NEXT_STEP
Владелец: посмотреть фильм, выбрать обложку и название, подтвердить права. Если нужны правки — менять `src/lesson-atlas/script.ts` / `visuals/`, пушить (озвучка кэшируется по хэшу реплики; `[pilot]` — только 60 с, `[no render]` — без рендера).

## Команды
```bash
node --test scripts/lesson-atlas/*.test.mjs
node scripts/lesson-atlas/captions-check.mjs
SOURCE_TXT=… node scripts/lesson-atlas/export-docs.mjs
node scripts/books/thumbnails.mjs ayn-rand-atlas-shrugged-fragment
node scripts/books/youtube-meta.mjs ayn-rand-atlas-shrugged-fragment
gh api -H "Accept: application/octet-stream" repos/adiletzainidinov/balago-video/releases/assets/<id> > file   # скачать ассет
```

## Команда новому Claude после переполнения контекста
Продолжи BM-006 в `adiletzainidinov/balago-video`, ветка `feature/banamind-bm-006-ayn-rand`; прочитай TASK, этот STATUS и `books/PRODUCTION.md`, сверь PR #127, Actions и релизы `lesson-atlas-fragment` / `book-ayn-rand-atlas-shrugged-fragment`. Не перерендеривай готовое без правок. **Не выдавай ознакомительный фрагмент Айн Рэнд за весь роман.**
