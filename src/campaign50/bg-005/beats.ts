// Ключевые моменты анимации (абсолютные секунды) — общие для картинки и
// звуковых эффектов. Метки карты, машина, поля заявки и шаги группы
// появляются вместе со словами диктора и мамы.
import { cueOf, sceneOf, wordTime, type Bg05Timeline } from "./timing.ts";

export type Bg05Beats = ReturnType<typeof bg05Beats>;

export const bg05Beats = (tl: Bg05Timeline) => {
  const hook = sceneOf(tl, "hook");
  const detour = sceneOf(tl, "detour");
  const compare = sceneOf(tl, "compare");
  const apply = sceneOf(tl, "apply");
  const group = sceneOf(tl, "group");
  const cta = sceneOf(tl, "cta");
  const n01 = cueOf(tl, "n01");
  const n02 = cueOf(tl, "n02");
  const m01 = cueOf(tl, "m01");
  const n03 = cueOf(tl, "n03");
  const n04 = cueOf(tl, "n04");

  // 2. крюк: три отрезка пути машины мамы
  const D = detour.to - detour.from;
  const leg1 = [detour.from + 0.35, detour.from + 0.35 + D * 0.36] as const;
  const pickup = [leg1[1], leg1[1] + 0.9] as const;
  const leg2 = [pickup[1], pickup[1] + D * 0.12] as const;
  const leg3 = [leg2[1] + 0.15, detour.to - 0.7] as const;

  // 3. телефон: после вопроса мамы
  const raise = m01.to + 0.25;
  const phone = m01.to + 0.75;
  const typeFrom = phone + 0.45;
  const typeTo = typeFrom + 1.5;
  const results = typeTo + 0.35;
  const tap = results + 1.15;

  // 4. заявка
  const fHome = wordTime(n03, "үй", 0.45);
  const fSchool = wordTime(n03, "мектеп", 0.55);
  const fTime = wordTime(n03, "убакыт", 0.65);
  const send = Math.max(fTime + 0.9, wordTime(n03, "каттам", 0.8) - 0.2);
  const mapBack = send + 0.45;

  return {
    hook: {
      ...hook,
      tap: hook.from + 0.25,
      drawFrom: hook.from + 0.55,
      drawTo: Math.max(hook.from + 3.2, n01.to - 0.2),
      districtA: wordTime(n01, "райондо", 0.35),
      districtB: wordTime(n01, "башкасындабы", 0.75),
    },
    detour: {
      ...detour,
      leg1,
      pickup,
      leg2,
      leg3,
      // полоса рабочего дня рвётся на слове «экиге»
      split: wordTime(n02, "экиге", 0.65),
      long: wordTime(n02, "узак", 0.35),
    },
    compare: {
      ...compare,
      cards: compare.from + 0.25,
      speak: m01.from,
      speakTo: m01.to,
      raise,
      phone,
      typeFrom,
      typeTo,
      results,
      tap,
    },
    apply: {
      ...apply,
      brand: n03.from,
      fields: [fHome, fSchool, fTime] as const,
      send,
      mapBack,
      loopTo: mapBack + 1.9,
      dayWhole: mapBack + 1.4,
    },
    group: {
      ...group,
      homes: [group.from + 0.35, group.from + 0.6, group.from + 0.85] as const,
      converge: group.from + 1.0,
      step1: wordTime(n04, "топ", 0.15),
      step2: wordTime(n04, "сыноо", 0.65),
      free: wordTime(n04, "акысыз", 0.9),
      carFrom: wordTime(n04, "сыноо", 0.65),
    },
    cta,
  };
};
