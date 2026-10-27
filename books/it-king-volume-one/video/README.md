# BM-020 — видео «Оно», первый том (BanaMind)

Приватный prerelease **book-it-king-volume-one** (нужен вход в GitHub с доступом к репозиторию):
https://github.com/adiletzainidinov/balago-video/releases/tag/book-it-king-volume-one

| Файл | Что | Проверено |
|---|---|---|
| [final-youtube.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-it-king-volume-one/final-youtube.mp4) | оригинал для YouTube | 1920×1080, H.264, 30 fps, AAC 48 кГц, 30:00 (1800,00 с), −17 LUFS, 388,9 МБ, чёрных кадров нет (`scripts/it-king/verify.mjs`, CI 39786722869) |
| [final-youtube-preview-960x540.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-it-king-volume-one/final-youtube-preview-960x540.mp4) | облегчённое превью 960×540 | 73 МБ |
| [final-youtube.srt](https://github.com/adiletzainidinov/balago-video/releases/download/book-it-king-volume-one/final-youtube.srt) | русские субтитры (590 титров, тот же расчёт, что в кадре) | `captions-check`: 0 ошибок |
| thumbnail-01…05.jpg, thumbnail-contact-sheet.jpg, readability-320x180.jpg | обложки | см. `../thumbnails/checks.json` |

Рендер: коммит озвучки `24ed69b` (код сцен + `public/it-king/voice`), CI `.github/workflows/it-king-volume-one.yml`.
Артефакт прогона `it-king-final-youtube` (MP4, превью, SRT, кадры, SCRIPT/STORYBOARD) хранится до 2026-11-21.
Не публиковать на YouTube без подтверждения прав (см. `../scripts/CONTENT_AND_RIGHTS_REVIEW.md`).
