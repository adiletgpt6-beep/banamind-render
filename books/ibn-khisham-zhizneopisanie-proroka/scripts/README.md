# Сценарий и источники — BM-002

- [BRIEF.md](../BRIEF.md) — выбор эпизодов, тон, визуальные и религиозные ограничения, что не вошло и почему.
- [SCRIPT.md](../SCRIPT.md) — полный сценарий с фактическими таймкодами озвучки и страницами книги у каждой сцены.
- [SOURCE_MAP.md](../SOURCE_MAP.md) — карта источников: сцена → страницы книги → что именно взято.
- Источник: `books/500-series/tasks/BM-002/source-text/part-001…032.txt` (текст 656-страничного PDF).
- Код: `src/books/ibn-khisham-zhizneopisanie-proroka/` (`script.ts` — единственный источник текста; `visuals/` — сцены),
  `scripts/books/ibn-khisham/` (озвучка, тайм-лайн, титры, SRT, сборка, проверки), `.github/workflows/book-ibn-khisham.yml`.
- Проверка озвучки распознаванием речи: `../video/voice_qa.json`.
