# BM-026 · видео

Приватный pre-release GitHub [book-seneca-letters-lucilius](https://github.com/adiletzainidinov/balago-video/releases/tag/book-seneca-letters-lucilius) (нужен вход в GitHub с доступом к репозиторию; на YouTube не публиковалось). Сборка: прогон [39822735851](https://github.com/adiletzainidinov/balago-video/actions/runs/39822735851), код 1dd6325, озвучка 0676b46.

| Файл | Что | Проверено |
|---|---|---|
| [final-youtube.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-seneca-letters-lucilius/final-youtube.mp4) | оригинал для YouTube, 532 610 681 байт | 1920×1080, H.264 yuv420p, 30 fps, AAC 48 кГц, 30:00 (1800,02 с), −17 LUFS, без чёрных кадров (qa-full/verify.txt, ffprobe.json) |
| [final-youtube-preview-960x540.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-seneca-letters-lucilius/final-youtube-preview-960x540.mp4) | облегчённая копия 960×540 | тот же монтаж |
| [final-youtube.srt](https://github.com/adiletzainidinov/balago-video/releases/download/book-seneca-letters-lucilius/final-youtube.srt) | субтитры, 569 титров | = video/final-youtube.srt (SHA-256 e01cafd2…), из того же выравнивания, что и титры в кадре |
| [pilot.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-seneca-letters-lucilius/pilot.mp4) | пилот 0:41 | qa-pilot/ |

Контроль: 36 кадров по всей длине — qa-full/frames; озвучка 183/183, распознавание faster-whisper — qa-voice/voice-asr.md (среднее совпадение 0,936, расхождения — ошибки распознавателя, пропусков текста нет). Главы — metadata/youtube.md.
