# BanaMind BM-003 — STATUS / checkpoint

**Обновлено:** 2026-10-18 (Claude Code).
**Книга:** «Исламское вероучение (Акыда)», проф. Ахмед Саим Кылавуз (пер. А. Разоренова, ИГ «САД», 2010).
**Стадия:** QA_REVIEW — готов фильм 30:00 (1920×1080, 30 fps, H.264/AAC), SRT, 5 обложек, YouTube-пакет; ждёт решения владельца и проверки прав (публикация заблокирована).
**Ветка задания:** `feature/banamind-bm-003-akaida` (PR #124) · **рабочая ветка Claude Code со всем результатом:** `ccr-e10c4814-hjeu4w` (основана на голове PR #124 `0807e927`).
**Задание:** `books/500-series/tasks/BM-003/TASK.md` · **PR задания:** https://github.com/adiletzainidinov/balago-video/pull/124

## Источник
`books/500-series/tasks/BM-003/source-text/islam_akaida_full_text.txt` — 907 043 байт, 8309 строк, 221 метка «СТРАНИЦА PDF N», SHA256 `79a94ebf5dd47006a0784abb74a97e9a596e805ce5bf6d9ea4b0457884e781f3` (совпадает с паспортом). Хранится в приватном репозитории, не публиковать. Арабский текст повреждён кодировкой — в фильме не используется.
**Права:** русское издание «Все права защищены»; публичная публикация/монетизация — только после проверки прав владельцем.

## DONE (проверенные)
- [x] TXT получен Claude Code и сохранён, хеш совпадает.
- [x] Вся книга прочитана: 8 конспектов с номерами страниц — `notes/digest-01…08-*.md`.
- [x] `books/islamskoe-verouchenie-akyda/`: BRIEF.md, SOURCE_MAP.md, SCRIPT.md (с фактическими таймкодами), 66 сцен, 188 реплик, ≈3440 слов; 43 цитаты в «кавычках» дословно найдены в TXT (`node scripts/books/akyda/quotes.mjs`).
- [x] Код фильма `src/books/islamskoe-verouchenie-akyda/` (script.ts — единый текст озвучки/титров/документов), 51 вид анимированных схем без изображений Аллаха, пророков, ангелов, джиннов и людей; скрипты `scripts/books/akyda/`; workflow `.github/workflows/book-akyda.yml`.
- [x] Озвучка CI ElevenLabs (голос Eric, тот же банан): 188 реплик → `public/akyda/voice/` (коммит a63637a); естественная длительность 29:42, итог 30:00.
- [x] Полный рендер CI (прогон 39138072318) → приватный пре-релиз `book-akyda-film`; MP4 скачан и проверен: 1920×1080, 30 fps, H.264, AAC 48 кГц, 1799,98 с, −17 LUFS, без чёрных кадров, 624,9 МБ. Пилот — первые 60 с (`final-youtube-first-60s.mp4`); контактный лист проверен.
- [x] Анимированные титры BanaMind (630 титров, ≤2 строк, без перекрытий, текст = сценарий) и SRT (`video/final-youtube.srt` = SRT из релиза).
- [x] 5 разных обложек 1280×720 (`books/islamskoe-verouchenie-akyda/thumbnails/`): формат, ≤2 МБ, орфография, различие ✓; лист сравнения и 320×180; рекомендация №5 (выбор — за владельцем).
- [x] YouTube-пакет `metadata/youtube.md`, `youtube.json`: 5 названий (рекомендация №1), описание, теги, 12 глав с таймкодами из тайм-лайна, орфография ✓.
- [ ] Права публичного релиза подтверждены владельцем.
- [ ] Владелец выбрал обложку/название и одобрил публикацию.

## BLOCKERS
1. Публичная публикация требует проверки прав на русский перевод («Все права защищены»).
2. Ветка задания `feature/banamind-bm-003-akaida` не обновлена: результат лежит в `ccr-e10c4814-hjeu4w` (правило сессии Claude Code — пушить только в свою ветку). Чтобы собрать в PR #124 — смерджить `ccr-e10c4814-hjeu4w` в `feature/banamind-bm-003-akaida` или открыть PR из неё.

## NEXT_STEP
**Владелец:** посмотреть фильм и обложки, выбрать обложку/название, решить вопрос прав. До этого — не публиковать.
Правки текста: `src/books/islamskoe-verouchenie-akyda/script.ts` → пуш (CI переозвучит только изменённые реплики) → коммит с маркером полного рендера `[render-bm003]` в сообщении (НЕ упоминать маркер в других коммитах — первый пуш по ошибке сразу запустил рендер) → новый релиз. После правок: `node scripts/books/akyda/export-docs.mjs`, `node scripts/books/youtube-meta.mjs islamskoe-verouchenie-akyda`.

## ARTIFACTS
- Фильм Full HD: https://github.com/adiletzainidinov/balago-video/releases/download/book-akyda-film/final-youtube.mp4
- Предпросмотр 960×540: https://github.com/adiletzainidinov/balago-video/releases/download/book-akyda-film/final-youtube-preview-960x540.mp4 · пилот 60 с: https://github.com/adiletzainidinov/balago-video/releases/download/book-akyda-film/final-youtube-first-60s.mp4
- SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-akyda-film/final-youtube.srt · контактный лист: https://github.com/adiletzainidinov/balago-video/releases/download/book-akyda-film/contact-sheet.jpg
- Релиз книги (видео-копия, 5 обложек, листы, метаданные): https://github.com/adiletzainidinov/balago-video/releases/tag/book-islamskoe-verouchenie-akyda (публикует `book-assets.yml`)
- BRIEF / SOURCE_MAP / SCRIPT: `books/islamskoe-verouchenie-akyda/`
- QA: `video/voice_qa.json` (Whisper turbo, средний WER 4,5 %; расхождения — цифры «Часть 6» вместо «шестая», термины), `thumbnails/checks.json`, verify.mjs

## ЖУРНАЛ
- 2026-10-18 · этап 1: TXT, хеш, копия в ветке.
- 2026-10-18 · этап 2: 8 параллельных полных прочтений по главам → конспекты; BRIEF, сценарий, SOURCE_MAP.
- 2026-10-18 · этап 3: анимация (51 вид), контрольные кадры 66 сцен, исправления наложений.
- 2026-10-18 · этап 4: CI-озвучка + (случайно запущенный маркером в тексте коммита) полный рендер; MP4 проверен.
- 2026-10-18 · этап 5: обложки, YouTube-пакет, ASR-проверка озвучки, релиз книги.
