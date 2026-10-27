# MUSLIM KIDS — INFINITE DISCOVERY · Experiment 002

**«Большой мир в маленькой капле»** — 60-секундный образовательный мультфильм (5–12 лет, русский),
основа — сура «Аль-Имран», 3:190–191. Формат 1080×1920 (9:16), 30 fps, H.264 + AAC.

Весь видеоряд — процедурная анимация в Remotion (React + TypeScript): ни одной готовой
картинки. Каждый кадр — чистая функция номера кадра, поэтому рендер детерминирован.

## Две авторские идеи

* **THE LIVING LINE** — одна золотая линия (голова со свечением + хвост из её собственной
  истории движения). Рисует окружность → Землю, отмечает день и ночь, выбирает место
  посадки, обводит каплю, бежит по прожилке, делает «разрез», обводит клетку, ведёт камеру
  обратно, рисует орнамент, мальчика, вопрос и финальную дугу. Никогда не телепортируется:
  перелёты строятся от текущего конца предыдущего движения к началу следующего.
* **WORLD WITHIN A WORLD** — непрерывная «глубина путешествия» J(t) (логарифм увеличения)
  и вложенные миры: Земля → (облака) → лес → крона → лист → капля-линза → поверхность
  листа → срез листа → клетка, и обратно до космоса.

## Архитектура

```
src/
  engines/
    InfiniteCameraEngine.ts   J(t): монотонный кубический сплайн по ключам из timeline.json
    NestedWorldEngine.ts      мультимасштабный граф сцены: масштаб/центр камеры всех миров,
                              LOD-кроссфейды, переход-«поворот» поверхность → срез
    EarthRenderer.ts          CPU-«шейдер» планеты: сфера, текстуры из контуров материков,
                              одно солнце, блик океана, облака, огни городов, атмосфера,
                              рельеф с уровнем детализации (горы Тянь-Шаня, лесной пояс)
    DepthComposer.ts          параллакс слоёв над землёй (пролёт сквозь облака)
    RefractionEngine.ts       оптика капли: увеличение + «рыбий глаз» (feDisplacementMap),
                              ослабление линзы при входе камеры в каплю
    LivingLineEngine.ts       программа линии: stroke / orbit / travel, хвост из истории
    ShapeMorphEngine.ts       геометрия: ресемплинг, морфинг, окружность, скруглённый прямоугольник
    SpaceMap.ts               перевод точки из любой системы координат в экран в момент t
    LeafGeometry.ts           единая геометрия листа для всех масштабов
    math.ts                   easing, seeded RNG, value/Perlin noise, сплайны
  components/                 EarthCanvas, CloudLayer, ForestCanvas, CrownCanvas, Leaf, WaterDrop,
                              LeafSurface, LeafSection, PlantCell, LivingLine, Typography,
                              Starfield, Ornament, BoyOnHill, Soundtrack, sprites
  scenes/                     WorldJourney (сцены 1–5), QuranScene (6), EndingScene (7), captions
  content/                    script.json (текст диктора), timeline.json (голос, камера, звуки),
                              voice-timing.json (длительности и слова), lineProgram.ts, geo.ts,
                              director.ts (вращение Земли, кадрирование)
  compositions/InfiniteDiscovery001.tsx
scripts/
  generate_voice.py           офлайн-озвучка (Piper TTS через sherpa-onnx) + распознавание слов
  generate_sfx.py             деликатные процедурные звуки по таймингам timeline.json
  sheet.sh                    контрольные листы ключевых кадров
  verify.mjs                  ffprobe-проверка финального MP4
```

## Команды

```bash
npm install
pip install sherpa-onnx soundfile numpy
npm run voice        # python3 scripts/generate_voice.py  → public/audio/voice/*.wav
npm run sfx          # python3 scripts/generate_sfx.py    → public/audio/sfx.wav
npm run studio       # интерактивный просмотр
scripts/sheet.sh keys 90 300 570 870 1200 1530 1740   # ключевые кадры
npm run preview      # 540×960
npm run render       # 1080×1920 → output/final/MuslimKids_InfiniteDiscovery_001.mp4
npm run verify
```

(`npm run voice` / `npm run sfx` вызывают Python-скрипты; модели TTS/ASR скачиваются один раз
с GitHub Releases проекта sherpa-onnx в `~/.cache/muslimkids-tts`.)

## Как сделать следующий мультфильм

1. Текст диктора — `src/content/script.json`; `npm run voice` пересчитает длительности.
2. Время фраз, ключи камеры J(t) и звуки — `src/content/timeline.json`.
3. Миры и их вложенность (якорь, коэффициент масштаба, путь камеры) — `WORLDS`
   в `NestedWorldEngine.ts`; содержимое мира — любой SVG/Canvas-компонент в его координатах.
4. Хореография линии — `src/content/lineProgram.ts` (stroke/orbit/travel в любой системе координат).
5. Надписи — `src/scenes/captions.ts`; цвета и шрифт — `src/styles/theme.ts`.

## Содержание и корректность

* День и ночь объясняются только вращением Земли (запад → восток); направление солнца в
  кадре неизменно весь фильм.
* Капля показана как линза над поверхностью листа; клетки — в ткани листа (срез: кутикула,
  эпидермис, столбчатый и губчатый мезофилл, проводящий пучок, устьице), с подписью
  «увеличенная схема». Клетки не приписываются аятам.
* Аяты: 3:190 — пересказ смысла (подписано), 3:191 — часть аята «Господь наш! Ты не сотворил
  это понапрасну» (перевод смысла, совпадает с переводом Э. Кулиева). Арабский текст не используется.
  Аллах никак не изображается; линия — только инструмент рассказа.
