# BM-038 — STATUS — Йона Бергер «Заразительный»

- CURRENT_STAGE: `QA_COMPLETE / VIDEO_READY_LOCAL` — фильм 30:00, SRT, 5 обложек, 5 названий готовы; голос — резервный Piper (CI/ElevenLabs недоступны); релиз GitHub не создан (Actions заблокированы биллингом). См. CHECKPOINT 2.
- Repository PRIVATE: `adiletzainidinov/balago-video`.
- Working branch: `feature/banamind-bm-038-contagious-berger`.
- Base: `docs/banamind-500-production-system`.
- PR: **#162 — https://github.com/adiletzainidinov/balago-video/pull/162** (OPEN, не объединять автоматически).
- Source: `books/500-series/sources/BM-038/part-01.txt`…`part-16.txt`.
- GitHub `REGISTRY.csv`: BM-038 закреплён; другие BM не тронуты.
- User ZIP SHA-256 `c5c5ac0fd0d6933697add63304370987b482f881bee0a35ae8b35ca7eef51445`; CRC ZIP PASS; 1 UTF-8 TXT + 9 изображений.
- Normalized source: 16 UTF-8 TXT, 683935 байт, concatenated SHA-256 `da6bdf39e2560bc90d7d18c064a1d5a750b335c3d8d0a256c1268152fd3b2566`.
- All chapters: Введение + 6/6 глав + выводы + благодарности + 157 сносок.
- Local source integrity: PASS (all 16 parts concatenate to original main text after removing only archive footer).
- GitHub remote source integrity: **PASS 16/16**; все 16 файлов отдельно повторно прочитаны через GitHub Contents API; их Git Blob SHA точно совпадают с локальными SHA из `manifest.json`. SHA-256 каждого файла указан в `source-checksums.sha256`; итоговый SHA-256 конкатенации подтверждён локально. После checkout в Claude Code повторить `sha256sum -c source-checksums.sha256`.
- Film, script, voice, SRT, pilot, 5 covers: NOT STARTED.
- Claude Code must first check all source files and the `TASK.md`, then proceed with independent production; no repeated upload if GitHub source verified.
- Do not merge PR or publish to YouTube automatically.


---

## CLAUDE CODE CHECKPOINT 1 — 2026-10-22 ~23:20 UTC

- Ветка `feature/banamind-bm-038-contagious-berger` (зеркало сессии `claude/bm-038-contagious-film-zedqlk`), PR #162 открыт, не объединён.
- Источник: `sha256sum -c` **16/16 OK**, конкатенация `da6bdf39…2566` ✓. Все 16 TXT прочитаны построчно: карты `books/contagious-berger/scripts/source-map/part-01…16.md` (1 414 пунктов; 157/157 концевых сносок). Книга повторно не запрашивалась.
- SCRIPT_READY ✓: `src/lesson-berger/script.ts` — 61 сцена, 171 реплика, 3 397 слов, 6 пауз-вопросов; тесты `node --test scripts/lesson-berger/script.test.mjs` 9/9 (числа и цитаты сверены с книгой). Документы: BRIEF, COVERAGE, SOURCE_MAP, CLAIM_AUDIT, SCRIPT, STORYBOARD, VISUAL_SYSTEM, 100_IMPROVEMENTS.
- Движок «Лаборатория цепной реакции»: `src/lesson-berger/` (47 видов сцен, точечные предметы через Path2D, сеть разговоров), тот же банан `src/banana-host/` (риг не менялся), `BanaMindAnimatedCaptions`.
- Голос: **ElevenLabs (Eric) недоступен** — Actions заблокированы биллингом аккаунта (все прогоны `startup_failure` с ~20:39 UTC), сетевой доступ к api.elevenlabs.io из сессии закрыт, у ключа OpenAI нет кредитов. Озвучено локально: Piper ru_RU «Denis» (sherpa-onnx, темп 0,9), тайминги слов и рот — распознаватель GigaAM v2. Речь 23,5 мин, естественная длина 26:34, тайм-лайн 30:00. Проверка речи: совпадение букв 0,982, WER 5,8 % (`books/contagious-berger/video/qa-voice/`).
- PILOT_READY ✓: `out/pilot/pilot.mp4` 1920×1080 H.264 30 fps, AAC 48 кГц, 58,13 с, −17,3 LUFS, без чёрных кадров, sha256 `0edfb467…82d5`; 12 кадров `video/qa-pilot/` просмотрены.
- THUMBNAILS_READY ✓: `books/contagious-berger/thumbnails/thumbnail-01…05.jpg` 1280×720 sRGB 132–187 КБ, Hunspell ✓, различие мин. 52,7 (порог 25), contact sheet и 320×180. Рекомендация №1 «ПОЧЕМУ ВСЕ ДЕЛЯТСЯ?».
  - Приватная галерея (просмотр + скачивание): https://claude.ai/artifact/8Z2im3m3X22hivwUitHL1n — SHA-256 опубликованных копий = оригиналы.
  - Оригиналы в ветке (нужен вход в GitHub): `https://github.com/adiletzainidinov/balago-video/raw/feature/banamind-bm-038-contagious-berger/books/contagious-berger/thumbnails/thumbnail-0N.jpg`; Git blob SHA сверены через API.
  - Локальная `thumbnail-gallery.mjs`: 5/5 view 200 image/jpeg, 5/5 download `Content-Disposition: attachment`, байты = оригиналы, лист 200 (localhost контейнера владельцу недоступен).
- Названия (`metadata/YOUTUBE_TITLES.md`, `meta.json`, `youtube.md/json`, 11 глав по реальной озвучке): №1 **МОЙ ФАВОРИТ** «Почему одной историей делятся все, а другую забывают?»; №2 «6 причин, по которым люди рассказывают друг другу об идеях»; №3 «Почему одни идеи распространяются сами — а другим не помогает реклама?»; №4 «Как обычная история запускает цепную реакцию разговоров»; №5 «Что заставляет нас делиться: эмоции, польза или случайность? Йона Бергер «Заразительный»».
- Полный рендер — локально в контейнере (тот же код, `npx remotion render src/lesson-berger/index.ts BergerLesson`).

## CLAUDE CODE CHECKPOINT 2 — 2026-10-23 ~01:00 UTC · VIDEO_READY · QA_COMPLETE

- Полный фильм отрендерен локально тем же кодом: `final-youtube.mp4` 1920×1080 H.264 (CRF 18) 30 fps, AAC 48 кГц 192k, **30:00 (1800,00 с)**, −17,2 LUFS, faststart, без чёрных участков, 617,3 МБ, sha256 `e10cf101a8c3ceb59388e4ddb48882288d1fb8f280053eee38b39b5002fda95d`. Естественная речь 26:34, остаток распределён по паузам между сценами (речь не ускорялась).
- QA: тесты сценария 9/9; captions-check 0 ошибок (531 титр, ≤ 2 строк, 10 кинетических слов); речь — совпадение 0,982, WER 5,8 %; 36 кадров по фильму + 61 контрольный кадр сцен просмотрены (`books/contagious-berger/video/qa-full/`). Мелочи: в начале s43/s44 около 3–4 с без новой графики; «виральность» (s09c, s47c) синтез произносит нечётко.
- Субтитры: `books/contagious-berger/video/final-youtube.srt` (531 титр).
- Выдача владельцу (вложения в чат Claude Code): превью 960×540 30 fps 30:00 88,0 МБ (sha256 `a389eafe…92d1da`); копия **1920×1080 30 fps H.264/AAC 30:00 350,6 МБ** (CRF 22, звук без перекодирования, sha256 `46f9648e…7b42`); SRT; контактный лист. Оригинал 617 МБ не прикрепляется (лимит 500 МиБ).
- Метаданные: `metadata/youtube.md/json` — 11 глав по реальному тайм-лайну (0:00, 1:51, 4:04, 4:42, 9:24, 13:24, 17:03, 20:36, 23:42, 26:32, 28:45).

### NEXT_STEP
1. Когда GitHub Actions снова запускаются (Settings → Billing): коммит с `[full]` в заголовке → `lesson-berger.yml` переозвучит 171 реплику голосом банана Eric (ElevenLabs), отрендерит 12 частей и положит `final-youtube.mp4`, превью, SRT и обложки в приватный pre-release `book-contagious-berger`. Сценарий не менять.
2. После появления релиза переименовать `books/contagious-berger/book.json.template` → `book.json` (для book-assets.yml).
3. Владелец: прослушать реплики из `video/qa-voice/voice-asr.md`, выбрать название и обложку. PR #162 не объединять, на YouTube не публиковать без решения владельца.
