// Ключевые моменты анимации (абсолютные секунды) — общие для картинки и
// звуковых эффектов. Сцена 2 растягивается под фактическую длину (k).
import { cueOf, sceneOf, wordTime, type Bg3Timeline } from "./timing.ts";

export type Bg3Beats = ReturnType<typeof bg3Beats>;

export const bg3Beats = (tl: Bg3Timeline) => {
  const hook = sceneOf(tl, "hook");
  const drive = sceneOf(tl, "drive");
  const week = sceneOf(tl, "week");
  const search = sceneOf(tl, "search");
  const steps = sceneOf(tl, "steps");
  const cta = sceneOf(tl, "cta");
  const n01 = cueOf(tl, "n01");
  const m01 = cueOf(tl, "m01");
  const n03 = cueOf(tl, "n03");
  const n04 = cueOf(tl, "n04");
  const k = (drive.to - drive.from) / 12.5;
  const d = (x: number) => drive.from + x * k;
  return {
    hook: {
      ...hook,
      clock: hook.from + 0.2, // часы 12:30 → 13:30 (таймлапс)
      plate: hook.from + 0.5,
      morph: Math.max(hook.from + 1.6, wordTime(n01, "ал", 0.55) - 0.2), // тарелка → песочные часы
      toBar: hook.to - 0.75, // часы улетают в шкалу
    },
    drive: {
      ...drive,
      // таймлапс: мама выходит → едет в школу → сын садится → домой (бабушка
      // встречает) → обратно в кеңсе; шкала обеда съедается сегментами
      exit: d(0.3),
      inCar: d(1.5),
      go1: d(1.9),
      atSchool: d(4.4),
      kidIn: d(5.5),
      go2: d(6.0),
      atHome: d(8.2),
      kidOut: d(9.1),
      go3: d(9.4),
      atOffice: d(11.3),
      over: d(11.6),
    },
    week: {
      ...week,
      rows: [0.35, 1.35, 2.35].map((x) => week.from + x),
      more: week.from + 3.5,
      lookUp: m01.from - 0.9,
      think: m01.from - 0.2,
      phone: m01.to + 0.35, // берёт телефон — связующее действие
      zoom: week.to - 0.7,
    },
    search: {
      ...search,
      type: search.from + 0.35,
      typed: search.from + 2.55,
      submit: search.from + 2.75,
      results: search.from + 3.05,
      tap: search.from + 3.9,
      open: search.from + 4.2,
      plan: Math.max(search.from + 5.2, wordTime(n03, "алдын", 0.45) - 0.2),
      route: wordTime(n03, "үйдөн", 0.7) - 0.15,
      back: wordTime(n03, "кайра", 0.88) - 0.1,
    },
    steps: {
      ...steps,
      s1: wordTime(n04, "алгач", 0.02) - 0.15,
      s2: wordTime(n04, "биринчи", 0.38) - 0.15,
      s3: wordTime(n04, "улантуу", 0.72) - 0.15,
    },
    cta,
  };
};
