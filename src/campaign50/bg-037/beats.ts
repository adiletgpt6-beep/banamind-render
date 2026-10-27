// Ключевые моменты анимации (абсолютные секунды) — общие для картинки и
// звуковых эффектов. Надписи и предметы появляются вместе со словами речи.
import { cueOf, sceneOf, wordTime, type Bg37Timeline } from "./timing.ts";

export type Bg37Beats = ReturnType<typeof bg37Beats>;

export const bg37Beats = (tl: Bg37Timeline) => {
  const hook = sceneOf(tl, "hook");
  const rules = sceneOf(tl, "rules");
  const group = sceneOf(tl, "group");
  const trial = sceneOf(tl, "trial");
  const decide = sceneOf(tl, "decide");
  const cta = sceneOf(tl, "cta");
  const m01 = cueOf(tl, "m01");
  const f02 = cueOf(tl, "f02");
  const n03 = cueOf(tl, "n03");
  const n04 = cueOf(tl, "n04");
  const n05 = cueOf(tl, "n05");
  return {
    hook: {
      ...hook,
      line: m01,
      // мама поднимает карту и протягивает её — слишком рано
      reach: hook.from + 0.35,
      // слово «ТӨЛӨМ» (в речи — «төлөшүм»)
      pay: wordTime(m01, "төлөш", 0.6),
      // вставка: конверты на столе, карта над «Төлөм»
      insert: Math.min(m01.to + 0.25, hook.to - 1.6),
    },
    rules: {
      ...rules,
      line: f02,
      sit: rules.from + 0.05, // мама садится напротив папы
      // папа раскладывает три конверта
      envs: [0, 1, 2].map((k) => rules.from + 0.55 + k * 0.42),
      read: wordTime(f02, "шарттарын", 0.25), // папа читает «Шарттар»
      // мама бережно убирает руку с картой
      withdraw: wordTime(f02, "дароо", 0.6),
      notTaxi: wordTime(f02, "эмес", 0.85),
      // камера к первому конверту «Топ»
      push: Math.max(f02.to + 0.4, rules.to - 1.9),
    },
    group: {
      ...group,
      line: n03,
      open: group.from + 0.15,
      cards: [wordTime(n03, "дарек", 0.18), wordTime(n03, "мектеп", 0.24), wordTime(n03, "убакыт", 0.3)],
      match: wordTime(n03, "ылайыктуу", 0.36),
      team: wordTime(n03, "топ", 0.42),
      apply: wordTime(n03, "арыз", 0.55),
      noPay: wordTime(n03, "төлөмдү", 0.68),
      tomorrow: wordTime(n03, "эртеңки", 0.82),
    },
    trial: {
      ...trial,
      line: n04,
      open: trial.from + 0.15,
      team: wordTime(n04, "топ", 0.05),
      morning: wordTime(n04, "биринчи", 0.25),
      afternoon: Math.max(wordTime(n04, "сапары", 0.45) + 0.4, wordTime(n04, "биринчи", 0.25) + 2.6),
      free: wordTime(n04, "акысыз", 0.9),
    },
    decide: {
      ...decide,
      line: n05,
      open: decide.from + 0.15,
      choices: wordTime(n05, "чечим", 0.2),
      yours: wordTime(n05, "сиздики", 0.3),
      pick: wordTime(n05, "тандасаңыз", 0.55),
      chain: wordTime(n05, "андан", 0.65),
      pack: wordTime(n05, "топтому", 0.8),
      pay: wordTime(n05, "төлөйсүз", 0.92),
      // снова кухня: родители спокойно кивают
      kitchen: Math.min(n05.to + 0.5, decide.to - 2.0),
    },
    cta,
  };
};
