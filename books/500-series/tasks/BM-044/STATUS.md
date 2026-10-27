# BanaMind BM-044 — STATUS / точка передачи Claude Code

**Название:** Энди Вейр — «Марсианин».
**ID:** BM-044; **slug:** `martian-andy-weir`.
**Repo:** PRIVATE `adiletzainidinov/balago-video`.
**Feature:** `feature/banamind-bm-044-martian-andy-weir`.
**Base:** `docs/banamind-500-production-system`.
**PR:** https://github.com/adiletzainidinov/balago-video/pull/168 (OPEN, не merged).
**TASK:** `books/500-series/tasks/BM-044/TASK.md`.
**SOURCE:** `books/500-series/sources/BM-044/`.

## Текущий этап: SOURCE_READY_IN_PRIVATE_GITHUB ✅

**PRODUCTION_NOT_STARTED.** На момент этого checkpoint Claude Code ещё не выполнил сценарий, TTS, пилот, видео, thumbnails, gallery.

| Этап | Статус | Подтверждение |
|---|---|---|
| Проверка живого REGISTRY/HANDOFF, BM-веток и PR | DONE | BM-042 занят другой книгой, BM-043 занят «Собакой Баскервилей», BM-044 найден свободным; зарезервирован CAS-обновлением `REGISTRY.csv` |
| ZIP проверка | DONE | `Uir_Marsianin.348577.txt.zip` 417110 байт, CRC OK, SHA256 `0122ca6a54d0d192bc8cc6f57fc9724668923292c0209eb62830d9ef48df895c` |
| Исходный русский TXT | DONE | 1133528 байт / 4501 строка, SHA256 `42c6a1335338930f41750a666cc04b1a6c958cc9ba21cf14c98623a698863786` |
| Сохранение текста | DONE | главы **1–26**, финал и 5 примечаний переводчика; исходные строки **2–4499**, без начальной пустой строки, конечной пустой строки, watermark и стороннего JPEG |
| Приватные UTF-8 parts | **DONE** | **34/34 `part-01.txt`…`part-34.txt` в GitHub**; **1133463 байта / 4498 строк** |
| Checksums и manifest | **DONE** | `manifest.json`, `source-checksums.sha256`; **34/34 реальных Git Blob SHA совпали** с локальными SHA1 (каждый проверен после индивидуальной записи И 34/34 повторно после полной загрузки) |
| Итоговая concat SHA256 | DONE | `dc1f150f2b4fa85f64d9651afcc79f8a58ee883821ff2c16123b20f26cbe3e3a` |
| Source README + book-specific TASK | DONE | оба реально существуют в feature |
| PR + запись общего HANDOFF/REGISTRY SOURCE_READY | **DONE** | PR #168 создан; docs REGISTRY BM-044 SOURCE_READY и HANDOFF обновлены с CAS по актуальному GitHub SHA |
| Прочитать SOURCE_MAP, COVERAGE, BRIEF, SCRIPT, STORYBOARD | TODO (Claude) | |
| 100 реальных улучшений, научный/фактологический аудит | TODO (Claude) | |
| Пилот 30–60с, русский voice/captions/SRT QA | TODO (Claude) | |
| Реальный полный фильм 29:30–30:30 и ffprobe QA | TODO (Claude) | |
| 5 оригинальных JPG 1280×720, 5 названий, contact sheet | TODO (Claude) | |
| Галерея PRIVATE с пятью preview и пятью download ссылками, реальные проверенные URL | TODO (Claude) | |

**SOURCE_READY не равно VIDEO_READY.** PR не объединён, видео не опубликовано, ни одна ссылка на ещё не созданный MP4/JPG не должна быть придумана.

## Как Claude Code приступает сейчас

```bash
git fetch origin feature/banamind-bm-044-martian-andy-weir
git checkout feature/banamind-bm-044-martian-andy-weir
cd books/500-series/sources/BM-044
sha256sum -c source-checksums.sha256
cat part-*.txt | sha256sum
# dc1f150f2b4fa85f64d9651afcc79f8a58ee883821ff2c16123b20f26cbe3e3a
```

Если не видно файлов — проверить ветку/remote/worktree, не просить книгу снова. Все 34 источника уже доступны из **этой** приватной GitHub branch. Далее читать MASTER_CLAUDE → PRODUCTION → WORKFLOW/SOURCE_INGESTION → TASK/STATUS → README/manifest → 34 источника.

**Сразу начинать производство:** source map с 26 главами, авторский аналитический 30-мин сценарий «Умнее следующей аварии», banana host, Full HD красивые чёткие цветные точки, естественный русский VO, word-timed animated subtitles и final-youtube.srt, реальные 5 различных JPG, приватная галерея и отдельные preview/download каждого, QA. Делать пилот до полноценного затратного рендера и отслеживать бюджет/качество.

**Ограничения:** независимая работа в своей feature branch; никакого изменения заданий других BM, auto-merge или auto-upload. Приватная подготовка не означает права на публичную коммерческую адаптацию исходного романа/перевода; не делать аудиокнигу или сценическую близкую экранизацию, публиковать только после отдельной проверки.

## NEXT_STEP

CLAUDE CODE → `books/500-series/tasks/BM-044/TASK.md` → все 34 TXT → производство. После каждого подтверждённого этапа обновлять этот STATUS коммитами, реальными артефактами/ссылками и текущей блокировкой либо следующим действием.
