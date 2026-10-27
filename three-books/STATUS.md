# Состояние серии TB
Дата: 2026-10-21, Asia/Bishkek. Системная ветка `docs/three-books-production-system`, [PR #133](https://github.com/adiletzainidinov/balago-video/pull/133) открыт при проверке. Живые HEAD и статусы проверять в GitHub.

## Текущий запуск — TB-003, DELIVERED
Фильм «Ты создал своё дело — или вторую работу?» 30:00, 1920×1080, 30 fps, H.264/AAC, 54 000 кадров, −16 LUFS; пять обложек, субтитры, тексты и галерея в приватном пререлизе [tb-003-film](https://github.com/adiletzainidinov/balago-video/releases/tag/tb-003-film). Ревизия `7e5638f`. [STATUS](episodes/TB-003/STATUS.md), [DELIVERY](episodes/TB-003/DELIVERY.json), [QA](episodes/TB-003/QA.md). Ожидает просмотра и приёмки владельцем; YouTube не публиковался.

## Другие выпуски
TB-001 DELIVERED: подтверждённый исправленный Full HD 30:00 без книжных атрибуций, 5 названий и 5 обложек в приватном [nox-film](https://github.com/adiletzainidinov/balago-video/releases/tag/nox-film). [Состояние](episodes/TB-001/STATUS.md), [производство](episodes/TB-001/PRODUCTION.md). Ожидает приёмки владельцем, заново не производить.

TB-002 IN_PRODUCTION по наблюдению коммита `9e4737454c6e224b16817e7f89090364a8297a1d`: runtime, голосовые блоки и workflow существуют в `feature/three-books-tb-002-tiko`, [PR #137](https://github.com/adiletzainidinov/balago-video/pull/137). Эпизодный STATUS в наблюдавшемся снимке ещё READY и координатором не переписан. Готовый полный MP4 этим не подтверждён; его производство не менять.

## Постоянная память
REGISTRY задаёт реальные ветки/PR и следующий ID TB-004. HANDOFF хранит контекст. У каждого выпуска отдельный STATUS, после этапа commit/push и фактическое доказательство. Источники доступны Claude из GitHub, распаковка проверяется в каждой среде. Готовое не перегенерировать без причины.

Измерения и Node validate подтверждают документы, не качество будущего видео. Публикация файлов через собственный CI/приватный релиз, без изменения существующих релизов; YouTube самостоятельно не публиковать.
