# BM-037 · видео «Двигатель прорыва»

Тяжёлые MP4 не хранятся в git. Выдача в этой сессии — **вложенными файлами** в чат Claude Code (приватный репозиторий; GitHub Release создать нельзя: Actions отвечает `startup_failure`, а у агента нет инструмента публикации релизов).

| Файл | Параметры | Проверка |
|---|---|---|
| `final-youtube-preview-960x540.mp4` — **посмотреть** (вложение с предпросмотром) | 960×540, 30 fps, H.264/AAC, 30:00, 80,3 МБ | SHA-256 `e0fd2dacf0b88d8d3e2f723fabfaa5225a378b963466c3f1875ba6b1e9db64c2` |
| `final-youtube-1080p.mp4` — **скачать в хорошем качестве** (вложение) | **1920×1080, 30 fps, H.264 + AAC 48 кГц, 30:00 (1800,03 с)**, 367,7 МБ, faststart | verify ✓ (−18,6 LUFS, без чёрных кадров), PSNR 47,9 дБ к мастеру; SHA-256 `4eab265a8acf0b96593dcd8a0214ed9324287471f1a02a4b8ae04fde92f78c78` |
| `final-youtube.mp4` — мастер рендера | 1920×1080, 30 fps, H.264 crf 18 / AAC 192k, 30:00, 523,9 МБ | не вложен: больше лимита вложения 400 МиБ; SHA-256 `49595cc709a5f5b09c406b3514eed874c2e5ff80e0816924114ecb14c3b42b8c` |
| `final-youtube.srt` | 617 блоков | копия в этой папке; также вложение |

Обложки: оригиналы в `../thumbnails/` (коммит `392bb39`), приватная страница выбора https://claude.ai/artifact/XfzrYhGami7zPqzAPTKBHw.

QA: [QA.md](QA.md). Пересборка: локально — `VOICE_ENGINE=local … node scripts/lesson-collins/voice.mjs`, затем Remotion `CollinsLesson` (4 части), `mixdown.mjs`, `srt.mjs`, `verify.mjs`; в CI с голосом Eric — workflow `.github/workflows/lesson-collins.yml`, `mode=full` (после восстановления GitHub Actions; публикует приватный pre-release `book-good-to-great-collins`).
