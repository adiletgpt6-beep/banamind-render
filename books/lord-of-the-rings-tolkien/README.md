# BM-018 · «Властелин колец» — BanaMind «Музей искушений»

Оригинальный 30-минутный анимационный разбор романа Дж. Р. Р. Толкина с бананом-ведущим.
Задание — `books/500-series/tasks/BM-018/TASK.md`, статус — `.../STATUS.md`.

| Что | Где |
|---|---|
| Источник (приватно) | `books/500-series/sources/BM-018/part-01…12.txt` + `source-checksums.sha256` |
| Карта источников, арки, аудиты, бриф, сценарий, раскадровка | `scripts/` |
| Фильм (Remotion) | `src/books/lord-of-the-rings-tolkien/film/` · композиции `LotrFilm`, `LotrPilot` |
| Озвучка | `public/lotr/voice/` (ElevenLabs Eric, `scripts/lotr/voice.mjs`) |
| Рендер в CI | `.github/workflows/lotr-film.yml` (метки `[pilot]` / `[full]` / `[voice]`) |
| Обложки | `thumbnails/` (рисунки — `src/books/lord-of-the-rings-tolkien/thumbnails.tsx`) |
| YouTube-метаданные | `metadata/meta.json` → `metadata/youtube.md` |
| Видео | `video/README.md` — ссылки на pre-release `book-lord-of-the-rings-tolkien` |

**Права на публикацию не подтверждены** — только приватный QA (`scripts/EDITORIAL_RIGHTS_AUDIT.md`).

Локально:
```bash
cd books/500-series/sources/BM-018 && sha256sum -c source-checksums.sha256 && cd -
node --test scripts/lotr/*.test.mjs
REMOTION_BROWSER_EXECUTABLE=… node scripts/lotr/stills.mjs        # кадр каждой сцены → out/lotr-frames
node scripts/lotr/export-docs.mjs                                  # SCRIPT.md, STORYBOARD.md
node scripts/books/thumbnails.mjs lord-of-the-rings-tolkien        # 5 обложек + листы
node scripts/books/youtube-meta.mjs lord-of-the-rings-tolkien      # метаданные
```
