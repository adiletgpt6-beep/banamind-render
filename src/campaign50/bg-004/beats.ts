// Ключевые моменты анимации (абсолютные секунды) — общие для картинки и
// звуковых эффектов. Строки таблицы, выделения курсора и карточка BalaGo
// появляются вместе со словами диктора.
import { cueOf, sceneOf, wordTime, type Bg04Timeline } from "./timing.ts";

export type Bg04Beats = ReturnType<typeof bg04Beats>;

export const bg04Beats = (tl: Bg04Timeline) => {
  const hook = sceneOf(tl, "hook");
  const rows = sceneOf(tl, "rows");
  const week = sceneOf(tl, "week");
  const plan = sceneOf(tl, "plan");
  const trial = sceneOf(tl, "trial");
  const cta = sceneOf(tl, "cta");
  const n01 = cueOf(tl, "n01");
  const n02 = cueOf(tl, "n02");
  const n03 = cueOf(tl, "n03");
  const n04 = cueOf(tl, "n04");
  const n05 = cueOf(tl, "n05");
  const n06 = cueOf(tl, "n06");
  const go = wordTime(n02, "баруу", 0.1);
  const wait = wordTime(n02, "күтүү", 0.3);
  const back = wordTime(n02, "кайра", 0.45);
  const all = wordTime(n02, "баары", 0.75);
  const daily = wordTime(n03, "күн", 0.25);
  const fillFrom = week.from + 0.35;
  return {
    hook: {
      ...hook,
      // клавиши калькулятора: «1», «сапар», затем «=» и пустая графа «Убакыт»
      keys: [0.25, 0.55, 0.85].map((d) => hook.from + d),
      count: wordTime(n01, "убакытты", 0.25),
      ask: wordTime(n01, "эсептеп", 0.55),
      equals: n01.to + 0.1,
    },
    rows: {
      ...rows,
      // строки печатаются на словах диктора
      typed: [go - 0.25, wait - 0.2, back - 0.2],
      bars: [go + 0.25, wait + 0.2, back + 0.45],
      sum: all,
    },
    week: {
      ...week,
      // курсор тянет маркер заполнения от «Дүй» до «Жум» — строки копируются
      fillFrom,
      fillTo: Math.max(fillFrom + 1.6, wordTime(n03, "эмес", 0.2) + 0.2),
      once: wordTime(n03, "бир", 0.05),
      onceStrike: wordTime(n03, "эмес", 0.2),
      daily,
      calendar: wordTime(n03, "календарь", 0.75),
      total: n03.to + 0.2,
    },
    plan: {
      ...plan,
      select: plan.from + 0.35,
      grab: wordTime(n04, "каттамды", 0.2),
      drop: wordTime(n04, "уюштурууга", 0.7),
      formula: wordTime(n04, "алдын", 0.45),
      brand: n05.from - 0.15,
      offer: wordTime(n05, "үйдөн", 0.35),
      back: wordTime(n05, "кайра", 0.65),
    },
    trial: {
      ...trial,
      ring: trial.from + 0.2,
      steps: [n06.from - 0.1, wordTime(n06, "топ", 0.15), wordTime(n06, "сыноо", 0.65)],
      free: wordTime(n06, "акысыз", 0.9),
    },
    cta,
  };
};
