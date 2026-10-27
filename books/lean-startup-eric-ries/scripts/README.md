# BM-024 — сценарий, источник, проверки

- [BRIEF.md](BRIEF.md) — замысел, структура, тон, ограничения
- [SCRIPT.md](SCRIPT.md) — полный текст с таймкодами финальной озвучки (из `src/books/lean-startup-eric-ries/film/script.ts`)
- [STORYBOARD.md](STORYBOARD.md) — 83 сцены: время, глава, схема, ведущий
- [VOICE_CUE_SHEET.md](VOICE_CUE_SHEET.md) — голос, настройки, произношение каждой реплики
- [SOURCE_MAP.md](SOURCE_MAP.md) — сцена → строки исходного TXT → part:строка; [COVERAGE.md](COVERAGE.md) — охват введения, 12 глав, эпилога
- [source-notes/](source-notes/) — подробная карта всех строк книги (8 файлов)
- [FACT_VS_INTERPRETATION.md](FACT_VS_INTERPRETATION.md) — книга / мнение автора / исторические примеры / материалы BanaMind
- [RIGHTS_AND_YOUTUBE_AUDIT.md](RIGHTS_AND_YOUTUBE_AUDIT.md) — права и чек-лист перед публикацией
- [voice_qa.json](voice_qa.json) — обратная проверка речи (Whisper turbo)

Тест сценария: `node --test scripts/books/lsr/*.test.mjs`; карта: `node scripts/books/lsr/source-map.mjs`; документы: `node scripts/books/lsr/export-docs.mjs`.
