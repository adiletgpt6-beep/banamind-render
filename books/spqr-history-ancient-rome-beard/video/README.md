# Видео BM-040 — final-youtube.mp4

**Статус: НЕ ГОТОВО.** Финальный MP4 и SRT ещё не созданы: озвучка банана (ElevenLabs, голос Eric — ключ только в секретах CI) и рендер в CI заблокированы — все запуски GitHub Actions в репозитории завершаются `startup_failure` (блокировка аккаунта по биллингу, наблюдается с ~20:39 UTC 2026-10-22).

Когда Actions снова работают:

1. Actions → «BanaMind BM-040 — Кого Рим считал своим?» → Run workflow (ветка `feature/banamind-bm-040-spqr-ancient-rome-beard`, mode `pilot`) — озвучка всех 166 реплик (кэш по хэшу) + пилот ≈57 с со сцены r04 → приватный релиз `book-spqr-history-ancient-rome-beard` (`pilot.mp4`, превью 960×540), QA-кадры в `video/qa-pilot/`.
2. После проверки пилота: mode `full` — 8 частей рендера, `final-youtube.mp4` (1920×1080, 30 fps, H.264/AAC, faststart), `final-youtube.srt`, превью 960×540, 36 контрольных кадров в `video/qa-full/`.
3. Пересобрать документы и главы с реальным временем: `node scripts/lesson-spqr/docs.mjs && node scripts/books/youtube-meta.mjs spqr-history-ancient-rome-beard`.

Ссылки появятся здесь (нужен вход в GitHub с доступом к приватному репозиторию):

- Скачать оригинал: `https://github.com/adiletzainidinov/balago-video/releases/download/book-spqr-history-ancient-rome-beard/final-youtube.mp4`
- Превью 960×540: `…/final-youtube-preview-960x540.mp4`
- SRT: `…/final-youtube.srt`

Пока этих файлов нет, ссылки выше не работают — не выдавать их за готовый фильм.
