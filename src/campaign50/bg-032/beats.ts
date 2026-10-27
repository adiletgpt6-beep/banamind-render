// Ключевые моменты анимации (абсолютные секунды) — общие для картинки и
// звуковых эффектов. Цифры и ценники появляются вместе со словами диктора.
import { cueOf, sceneOf, wordTime, type Bg32Timeline } from "./timing.ts";

export type Bg32Beats = ReturnType<typeof bg32Beats>;

export const bg32Beats = (tl: Bg32Timeline) => {
  const hook = sceneOf(tl, "hook");
  const t1 = sceneOf(tl, "t1");
  const t2 = sceneOf(tl, "t2");
  const t3 = sceneOf(tl, "t3");
  const full = sceneOf(tl, "full");
  const cta = sceneOf(tl, "cta");
  const n02 = cueOf(tl, "n02");
  const n03 = cueOf(tl, "n03");
  const n04 = cueOf(tl, "n04");
  const n05 = cueOf(tl, "n05");
  // машина: от дома к школе и обратно (сцены тарифов)
  const drive = (from: number, to: number, legSec: number) => {
    const room = to - from - 1.2;
    const leg = Math.min(legSec, (room - 0.5) / 2);
    const go = from + 0.9;
    return { go, arrive: go + leg, back: go + leg + 0.5, home: go + 2 * leg + 0.5 };
  };
  return {
    hook: { ...hook, lines: [0.3, 0.6, 0.9].map((d) => hook.from + d), pills: [1.4, 1.7, 2.0].map((d) => hook.from + d), pull: hook.from + 1.0 },
    t1: {
      ...t1,
      pins: n02.from,
      bracket: wordTime(n02, "аралык", 0.25),
      range: wordTime(n02, "жети", 0.4),
      price: wordTime(n02, "миң", 0.85),
      trip: wordTime(n02, "толук", 0.7),
      drive: drive(t1.from, t1.to, 2.4),
    },
    t2: {
      ...t2,
      grow: wordTime(n03, "жетиден", 0.05),
      range: wordTime(n03, "он", 0.35),
      price: wordTime(n03, "миң", 0.75),
      drive: drive(t2.from, t2.to, 2.0),
    },
    t3: {
      ...t3,
      grow: wordTime(n04, "он", 0.05),
      range: wordTime(n04, "жыйырма", 0.4),
      price: wordTime(n04, "миң", 0.75),
      over: n04.to + 0.35,
      drive: drive(t3.from, t3.to - 0.6, 2.0),
    },
    full: {
      ...full,
      notOneWay: wordTime(n05, "бир", 0.12),
      morning: wordTime(n05, "эртең", 0.45),
      afternoon: wordTime(n05, "сабактан", 0.7),
      onePrice: n05.to + 0.1,
    },
    cta,
  };
};
