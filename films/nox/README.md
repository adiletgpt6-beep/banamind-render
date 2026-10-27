# НОКС — цена бесконечного «ещё»

Авторский анимационный фильм из цветных частиц (30:00, 1920×1080, 30 fps, русская озвучка) по идеям трёх книг:
Наполеон Хилл «Думай и богатей», Джордж С. Клейсон «Самый богатый человек в Вавилоне», Морган Хаузел
«Психология денег». Отдельный проект: правила рекламных роликов BalaGo (кыргызская озвучка, Бишкек, WhatsApp)
к нему не применяются; существующие ролики не затронуты.

## Где что лежит

```
films/nox/
  script/script.md        КАНОНИЧЕСКИЙ сценарий (главы по 120 с, блоки речи, заметки, паузы)
  voice/voice_settings.json  голос, модель и настройки синтеза
  voice/pilot/            пробы 10 голосов (mp3, F0, Whisper)
  voice/blocks/           озвучка по блокам (mp3 + посимвольные тайминги ElevenLabs), manifest.json, asr.json
  engine/                 движок частиц: gl.py (OpenGL), shapes.py, fox.py (риг Нокса), film.py (таймлайн,
                          актёры), stage.py, text.py, render.py, scenes/chNN.py (постановка глав)
  tools/                  voice.py, asr.py, mix.py (звук), subs.py (SRT/VTT/расшифровка), verify.py,
                          thumbs.py (обложки), docs.py (сценарий/раскадровка/таймлайн)
  docs/                   source_map, storyboard, timeline, ledger, asset_licenses, qa_report
  release/                файлы, которые прикладываются к релизу (сценарий, YouTube-тексты, обложки, index.html)
  fonts/                  Inter (OFL)
.github/workflows/nox-film.yml   CI: озвучка, пилот, полный рендер, сборка, проверка, релиз nox-film
```

## Команды

Зависимости: Python 3.11+, `pip install -r films/nox/requirements.txt`, FFmpeg, Mesa EGL
(`apt-get install libegl1 libegl-mesa0 libgl1-mesa-dri`).

```bash
# озвучка (нужен ELEVENLABS_API_KEY; готовые блоки с тем же текстом не синтезируются повторно)
python3 films/nox/tools/voice.py
# контрольные кадры
cd films/nox/engine && python3 render.py --stills 5,20,61 --outdir ../out/stills
# отрезок фильма (кадры [from, to)), например глава 3
python3 render.py --from 7200 --to 10800 --out ../out/parts/part-007200.mp4
# звук, субтитры, документы, обложки
python3 films/nox/tools/mix.py films/nox/out/audio
python3 films/nox/tools/subs.py films/nox/out/rel
python3 films/nox/tools/docs.py
python3 films/nox/tools/thumbs.py films/nox/release
# проверка готового файла
python3 films/nox/tools/verify.py NOX_finance_30min_RU.mp4 --frames 54000
```

В CI: коммит с меткой `[nox:voice]` — озвучка и проверка Whisper; `[nox:pilot]` — пилот 90 с;
`[nox:render]` — полный фильм (15 параллельных задач по 3600 кадров, склейка без перекодирования, звук,
субтитры, проверка, пререлиз `nox-film`). Каждый кадр вычисляется только из абсолютного номера кадра,
поэтому упавшую главу можно перерендерить отдельно (`render.py --from --to`), не трогая остальные.
