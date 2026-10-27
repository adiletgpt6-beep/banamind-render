# Видео BM-008 «Атомные привычки»

Приватный релиз [`book-james-clear-atomic-habits`](https://github.com/adiletzainidinov/balago-video/releases/tag/book-james-clear-atomic-habits) (нужен вход в GitHub с доступом к репозиторию).

| Файл | Что это |
|---|---|
| [final-youtube.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/final-youtube.mp4) | финал: 1920×1080, 16:9, 30 fps, H.264 High + AAC 48 кГц, 29:59.99, −17 LUFS, faststart, 450,6 МБ |
| [preview-960x540.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/preview-960x540.mp4) | облегчённая копия для просмотра (960×540), 68,4 МБ |
| [final-youtube.srt](https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/final-youtube.srt) | субтитры для YouTube (те же титры, что в кадре, 602 титра); копия — `final-youtube.srt` рядом |
| [pilot-60s.mp4](https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/pilot-60s.mp4) | пилот (первые 60 с), прошёл внутренний QC |
| [SCRIPT.md](https://github.com/adiletzainidinov/balago-video/releases/download/book-james-clear-atomic-habits/SCRIPT.md) | полный сценарий с таймкодами |

Проверки: `node scripts/lesson-habits/verify.mjs` — формат, длительность, звук, нет чёрных кадров ✓ (по скачанному из релиза файлу); громкость −17 LUFS в начале, середине и конце; кадры каждые ~2,5 мин просмотрены; обратная проверка озвучки — `../scripts/voice_qa.json` (Whisper small, средний WER 4,9 %; расхождения — цифры вместо слов и ошибки распознавания имён).
Сборка — `.github/workflows/lesson-habits.yml` (озвучка ElevenLabs Eric → 8 частей рендера → склейка → релиз), полный прогон: https://github.com/adiletzainidinov/balago-video/actions/runs/39325393136
