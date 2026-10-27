# MUSLIM KIDS — эксперимент 010 «Зеркальные миры» (MIRROR DIMENSIONS)

Мультфильм **«Удивительный мир в отражениях»** — 60 с, 1080×1920 (9:16), 30 fps,
H.264 + AAC. Русский язык, дети 5–12 лет. Основа — сура «Аль-Имран», 3:190–191
(перевод смысла Э. Кулиева). Зеркала — исключительно художественный приём.

Отдельный проект внутри репозитория: BalaGo и другие проекты не затрагиваются.

## Технология: Mirror Transformation, а не частицы

| Компонент | Файл | Что делает |
|---|---|---|
| MirrorDimensionsEngine | `src/engines/MirrorDimensionsEngine.ts` | таблица сцен и «миров», ключевые моменты, привязанные к речи |
| MirrorReflectionEngine | `src/engines/MirrorReflectionEngine.ts` | настоящее планарное отражение: отражённая камера, render target, проективная выборка, плоскость отсечения, слои «гостевых миров» |
| ReflectionMorphEngine | `src/engines/ReflectionMorphEngine.ts` + `src/shaders/mirrorSurface.ts` | изгиб поверхности, искажение, смешивание двух отражений расходящимся кругом, переход серебро → вода (волна, рябь, Френель) |
| MirrorKaleidoscopeEngine | `src/engines/MirrorKaleidoscopeEngine.ts` | раскладка панелей кульминации: появление «из ребра», V-пара, разведение, складывание |
| InfiniteReflectionEngine | `src/engines/InfiniteReflectionEngine.ts` | взаимные отражения двух зеркал с ограниченной глубиной (5 уровней) в пределах одного кадра |
| MirrorCameraController | `src/engines/MirrorCameraController.ts` | камера по ключам: кубические кривые Эрмита, C1-непрерывная скорость |
| MirrorLightingSystem | `src/engines/MirrorLightingSystem.ts` | палитра MIRRORVERSE, PMREM-окружение с «софтбоксами», схемы key/fill/rim |
| ReflectionSceneComposer | `src/compositions/ReflectionSceneComposer.tsx` | миры на отдельных ThreeCanvas и оптические переходы масками |
| TypographySystem | `src/components/Typography.tsx`, `Overlay.tsx` | неподвижный текстовый слой (цитата никогда не отражается и не искажается) |
| AudioSyncSystem | `src/engines/AudioSyncSystem.ts` | фактические тайминги речи и ключевых слов из `src/data/voice-manifest.json` |

Компоненты: `Mirror` (объёмная рама с фаской, золотой кант, стеклянная задняя
панель), `MirrorSurface`, `MirrorEarth` (наклон оси 23,4°, вращение, ночные огни),
`MirrorMountains` (процедурная долина), `ReflectiveLake`, `GrowingTree`
(ветви и листва появляются последовательно), `SkyDome` (космос/день/вечер/ночь,
звёзды, Луна), `MirrorComposition`, `Boy`.

Миры (`src/worlds`): космическая студия → горное озеро → зеркальная вселенная →
ночное озеро. Сценарные файлы — `src/scenes/Scene01…Scene07`.

Всё детерминировано: анимация считается только из номера кадра Remotion,
шум — с фиксированным сидом, без `Math.random`, `Date` и `requestAnimationFrame`.

## Сцены

1. 00:00–00:06 Загадочное отражение — блик в темноте, зеркало, Земля только в отражении.
2. 00:06–00:15 Земля в зеркале — отражение → объёмная Земля, ДЕНЬ / НОЧЬ от вращения.
3. 00:15–00:24 Зеркало становится озером — смена отражения, изгиб, волна, вода, долина вокруг.
4. 00:24–00:34 Отражение жизни — отражение дерева, само дерево, ускоренный рост ростка.
5. 00:34–00:45 Зеркальная вселенная — три мира в трёх панелях, V-пара, повторные отражения.
6. 00:45–00:54 Слова из Корана — движение замедляется, цитата на отдельном слое.
7. 00:54–01:00 Финальное отражение — ночное озеро, мальчик, Луна в воде, MUSLIM KIDS.

## Запуск

```bash
cd muslimkids-mirror-dimensions
npm ci
# если Chromium Remotion не скачивается, укажите локальный:
export REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell
npm run studio                 # предпросмотр
npm run stills                 # контрольные кадры (по умолчанию 540×960)
node scripts/stills.mjs 1      # контрольные кадры 1080×1920 → output/control-frames
npm run render                 # финал → output/final/MuslimKids_MirrorDimensions_010.mp4
```

WebGL работает и без видеокарты (`--gl=swangle`, программный рендер).

### Озвучка и звук (без платных API)

```bash
pip install sherpa-onnx soundfile scipy
python3 -I scripts/voice.py     # Piper ru_RU «ruslan» + проверка распознаванием (GigaAM)
python3 -I scripts/sfx_mix.py   # процедурные звуки без музыки + сведение −16 LUFS
```

Текст озвучки — `src/data/narration.json`. Скрипт озвучки измеряет фактическую
длительность реплик и время ключевых слов; анимация берёт их из
`src/data/voice-manifest.json`. Модели скачиваются с GitHub Releases
`k2-fsa/sherpa-onnx` в `~/.cache/mk-tts`.

## Переиспользование

- новый сценарий: `src/data/narration.json` + ключевые моменты в `MirrorDimensionsEngine.BEATS`;
- траектории камеры: массивы `CameraKey[]` в `src/scenes/*`;
- отражающие поверхности: `<Mirror>` / `<MirrorSurface>` с любым набором слоёв;
- переходы: состояния `MorphState` (изгиб, волна, вода, смешивание отражений);
- палитра и свет: `MirrorLightingSystem.PALETTE`, `RIGS`.

## Ассеты и лицензии

- Текстуры Земли и карта нормалей воды — из примеров three.js (`examples/textures`, MIT;
  исходные снимки Земли — NASA Blue Marble / Black Marble, общественное достояние).
- Шрифты Manrope и PT Serif — SIL Open Font License (`public/assets/fonts`).
- Голос — нейронная модель Piper ru_RU «ruslan» (локально, через sherpa-onnx).
- Все звуки синтезированы процедурно. Музыки нет.
- Кадры и звук референса не используются.
