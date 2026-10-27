# BM-016 · видео «Преступление и наказание» (BanaMind)

Большие файлы не хранятся в Git — они в приватном pre-release **`book-crime-and-punishment-dostoevsky`** (нужен вход в GitHub с доступом к репозиторию):

| Файл | Что | Проверка |
|---|---|---|
| [final-youtube.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-crime-and-punishment-dostoevsky/final-youtube.mp4) | фильм целиком | 1920×1080, H.264 yuv420p, 30 fps, AAC 48 кГц, 1799,97 с (30:00), −17 LUFS, 541 174 430 байт, sha256 `90430b075bc80dca125308ebe6e9ca67d5f35ddc7a9c7e1ce851002006872bf1` |
| [final-youtube-preview-960x540.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-crime-and-punishment-dostoevsky/final-youtube-preview-960x540.mp4) | облегчённое превью 960×540 | 80 453 013 байт |
| [final-youtube.srt](https://github.com/adiletzainidinov/balago-video/releases/download/book-crime-and-punishment-dostoevsky/final-youtube.srt) | субтитры (те же, что в кадре; копия — [final-youtube.srt](final-youtube.srt)) | 554 титра, ≤ 2 строк |
| [pilot.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-crime-and-punishment-dostoevsky/pilot.mp4) | пилот 46,6 с | 1920×1080, 30 fps, AAC, −17 LUFS |

Контроль качества в этой папке: `qa-full/` (ffprobe.json, verify.txt, 36 кадров по всему фильму), `qa-pilot/`, `qa-voice/voice-asr.md` (распознавание каждой реплики faster-whisper: среднее совпадение со сценарием 0,966).

Сборка: `.github/workflows/lesson-crime.yml` (прогон рендера 39624492625, сборка 39632507220). На YouTube не опубликовано — публикует владелец вручную.
