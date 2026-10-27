# Muslim Kids — Эксперимент №13 «Бесконечное чудо» (INFINITE WONDER)

60-секундный образовательный мультфильм (5–12 лет) по суре «Аль-Имран», 3:190–191.
Гибрид трёх технологий в одном непрерывном мире:

1. **PAINT-TO-LIFE** — капля краски растекается в акварельную Землю, и рисунок
   становится объёмной планетой (один меш: сфера, сплющенная ортографической
   проекцией на холст, плавно «надувается»; акварель → освещённый материал).
2. **INFINITE CAMERA JOURNEY** — путешествие по масштабам: орбита → облака →
   горы → долина → дерево → лист → срез → клетка и обратно. Камера задана
   одной «осью масштаба» `s` и интерполирует расстояние в логарифме.
3. **3D EXPLODED VIEW** — увеличенная модель поперечного среза листа из
   настоящих 3D-клеток раздвигается по слоям и собирается обратно.

Финал: «Великое возвращение» — та же ось `s` в обратную сторону, Земля
совершает ровно полный оборот и снова становится той же акварелью на холсте,
которую «дописывают» небом, горами, лесом и деревом.

## Технологии

React · TypeScript · Remotion 4 · Three.js · React Three Fiber (`@remotion/three`) ·
собственные GLSL-шейдеры · Python/NumPy (текстуры, звук) · FFmpeg.

## Структура

```
src/
  engines/
    InfiniteWonderDirector.ts   — дирижёр: кадр → всё состояние мира
    InfiniteJourneyEngine.ts    — ось масштаба s(t), позы камеры, вращение Земли
    CameraTransitionEngine.ts   — InfiniteCameraController: монотонные кривые, позы
    PaintToLifeEngine.ts        — капля, растекание, сплющивание, лессировки
    LayerDiscoveryEngine.ts     — модель среза листа, раскрытие слоёв
    LightingSystem.ts           — палитра и свет
  components/                   — PaintingCanvas, LivingEarth, CloudVeil,
                                  MountainWorld, ForestWorld, LivingTree,
                                  LeafCutaway, PlantCell, Typography …
  scenes/                       — Worlds (космос/природа), Overlays (подписи, цитата, финал)
  shaders/                      — акварель, Земля, небо, вода, облака, клетки
  geometry/                     — рельеф, дерево, лист
  compositions/                 — MuslimKidsInfiniteWonder013
  timeline.json                 — тайминги речи, сцен, кривые прямого пути и возвращения
scripts/
  generate_voice.py  — русская озвучка офлайн (Piper «Ruslan» через sherpa-onnx)
                       + проверка распознаванием (GigaAM v2)
  make_textures.py   — Земля (контуры Natural Earth), облака, бумага, лист
  make_sfx.py        — деликатные звуки без музыки + мастер-сведение −16 LUFS
  render-stills.mjs  — контрольные кадры из настоящей анимации
  verify.mjs         — проверка готового MP4
output/
  tests/   — прототипы A–D (540×960)
  final/   — MuslimKids_InfiniteWonder_013.mp4, контрольные кадры
```

## Запуск

```bash
npm install
npm run textures        # текстуры (уже сгенерированы в public/textures)
npm run voice           # озвучка (уже в public/audio/voice), нужен pip install sherpa-onnx
npm run sfx             # звуки и master.wav
npm run studio          # предпросмотр
# Рендер без GPU (SwiftShader); в облачном контейнере указать Chromium:
REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  npm run render
npm run verify
```

Прототип перехода: `npx remotion render MuslimKidsInfiniteWonder013 out.mp4 --frames=0-209 --scale=0.5 --gl=swangle`.

## Корректность

- **Ислам:** Аллах и пророки не изображаются; краска — художественная метафора,
  а не процесс сотворения. Цитата — перевод смысла Э. Кулиева (3:191, часть аята),
  сверена с tanzil.net (`ru.kuliev`); отдельный неподвижный слой, без деформаций.
- **Наука:** день и ночь — от вращения Земли вокруг оси (Солнце неподвижно, показаны
  ось и направление вращения); прожилка — сосудистый пучок (ксилема и флоэма);
  хлоропласты — в клетках палисадной и губчатой ткани и в замыкающих клетках устьиц;
  клетки — внутри ткани листа, с пометками «УВЕЛИЧЕННАЯ СХЕМА / МОДЕЛЬ».
- **Звук:** без музыки; голос — офлайн-синтез (платные API не использовались).

Шрифт Nunito — SIL OFL (`public/fonts/OFL.txt`). Контуры суши — Natural Earth (public domain).
