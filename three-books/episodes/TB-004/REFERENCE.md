# TB-004 — референс уже в GitHub

Проверено 2026-10-22. Ничего повторно не просить у владельца. Репозиторий private; доступ не менять. Текст и внешность старых персонажей не переносятся.

## Предпочтительная техническая база — произведённый TB-003

Ветка `feature/three-books-tb-003-rin`, [PR #141](https://github.com/adiletzainidinov/balago-video/pull/141). Проверенный снимок `990ec5c838d91e4a0400508b7bf733cd373f946f`. Собственный STATUS говорит DELIVERED, релиз [tb-003-film](https://github.com/adiletzainidinov/balago-video/releases/tag/tb-003-film) существует. Это подтверждено чтением GitHub и списка файлов, не новым полным просмотром/прослушиванием в этой подготовке.

Прочитаны engine/gl.py и начало engine/film.py. Фильм использует 1920×1080/30, абсолютное время, измеренную TTS и список сцен. У gl светящиеся ядра и halo, bloom и текстовый проход. Код доступен по `src/three-books/tb003/engine/`. Сопутствующие скрипты — `scripts/three-books/tb003/`, workflow `.github/workflows/three-books-tb003.yml`. Прежде чем копировать файл, проверить его наличие и API в этом commit.

STATUS TB-003 сообщает: 62 речевых блока, 45 сцен, 54 000 кадров, measured timing, George, отдельные режимы voice-pilot/voice/pilot/render/assets, 18 сегментов. В сообщённом QA есть неполное прослушивание. Не выдавать это за собственный слуховой контроль и не переносить статус PASS в TB-004.

Перенести выбранные renderer, voice, ASR, mix, render/verify и gallery-компоненты в свои пути с IMPORTS.md. Приспособить **8 частей, 60 блоков, 40 сцен**. Старые риги и параметры glow не становятся качественными только из-за переименования; выполнить VISUAL_QUALITY_SPEC.

## Дополнительные опоры

TB-002: commit `9e4737454c6e224b16817e7f89090364a8297a1d`, `src/three-books/tb002/engine/`, `scripts/three-books/tb002/`, `.github/workflows/three-books-tb002.yml`; есть реальный голос/manifest. Не импортировать старые B001 по совпадению номера.

TB-001: ветка `ccr-431ff063-5lzbg4`, ассеты `283b46aa3e1087b5d379e6274af53645e3fd6619`, исправленный фильм `83431a3982c0ef7bc687c62e50a90578a2733a9b`. Код `films/nox/` живёт в этом ref, а не в системной ветке. [Релиз nox-film](https://github.com/adiletzainidinov/balago-video/releases/tag/nox-film), внутренние [PRODUCTION](../TB-001/PRODUCTION.md) и [DELIVERY](../TB-001/DELIVERY.json).

Наличие полного старого MP4 не даёт права перерендеривать его ради просмотра кода. Не менять старые релизы, секреты и чужие ветки. Новый output/кэш/релиз только TB-004.
