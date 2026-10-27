# Видео BM-007 «Лидер без титула»

Приватный релиз [`book-lider-bez-titula`](https://github.com/adiletzainidinov/balago-video/releases/tag/book-lider-bez-titula) (нужен вход в GitHub с доступом к репозиторию).

| Файл | Что это |
|---|---|
| [final-youtube.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/final-youtube.mp4) | финал: 1920×1080, 16:9, 30 fps, H.264 + AAC 48 кГц, 30:00, −17 LUFS, ≈482 МБ |
| [preview-960x540.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/preview-960x540.mp4) | облегчённая копия для просмотра (960×540), ≈69 МБ |
| [final-youtube.srt](https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/final-youtube.srt) | субтитры для YouTube (те же титры, что в кадре); копия — `final-youtube.srt` рядом |
| [pilot-60s.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/pilot-60s.mp4) | пилот (первые 60 с), прошёл внутренний QC |
| [SCRIPT.md](https://github.com/adiletzainidinov/balago-video/releases/download/book-lider-bez-titula/SCRIPT.md) | полный сценарий с таймкодами |

Проверки: `node scripts/lesson-leader/verify.mjs` — формат, 30:00, звук, нет чёрных кадров ✓; кадры каждые 75 с просмотрены; обратная проверка озвучки — `../scripts/voice_qa.json` (Whisper small, средний WER 5%, расхождения — ошибки распознавания английских слов и имён).
Сборка — `.github/workflows/lesson-leader.yml` (озвучка ElevenLabs Eric → 8 частей рендера → склейка → релиз).
