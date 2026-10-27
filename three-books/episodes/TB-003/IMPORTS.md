# TB-003 — импортированные технические компоненты

Каждый компонент взят из закреплённого снимка и адаптирован под данные TB-003. Голосовые блоки, риги персонажей и сцены TB-002 не копировались.

| Источник (commit:path) | Новый путь | Что изменено |
|---|---|---|
| c98e27c (`feature/three-books-tb-002-tiko`, содержит 9e47374):scripts/three-books/tb002/script.py | scripts/three-books/tb003/script.py | пути TB-003; жёсткий assert 65 заменён проверкой против `speech_block_count`/`part_count` из SCENES.json (62/9) |
| c98e27c:scripts/three-books/tb002/voice.py | scripts/three-books/tb003/voice.py | пути TB-003, пилот B001–B003, B029, B042, B045, B062 |
| c98e27c:scripts/three-books/tb002/el.py, quota.py, asr.py, wer.py | scripts/three-books/tb003/ | без изменений логики |
| c98e27c:scripts/three-books/tb002/asr_check.py | scripts/three-books/tb003/asr_check.py | имена Рин/Тая/Сай, отчёт TB-003 |
| c98e27c:src/three-books/tb002/voice/voice_settings.json | src/three-books/tb003/voice/voice_settings.json | те же George/eleven_multilingual_v2 и параметры; обновлено обоснование |
| c98e27c:.github/workflows/three-books-tb002.yml | .github/workflows/three-books-tb003.yml | метки `[tb003:*]`, релиз `tb-003-film`, кадры пилота из `src/three-books/tb003/pilot.json` |
