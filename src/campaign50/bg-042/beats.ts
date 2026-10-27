// Опорные моменты действий BG-042 (абсолютные секунды ролика). Один источник
// для анимации сцен и звуковых эффектов: всё привязано к началам сцен и к
// фактическим таймингам слов озвучки. Без зависимостей от Remotion.
import { cueOf, sceneOf, wordEnd, wordTime, type Timeline } from "./timeline.ts";

/** Длина переходной «шторки» (с); середина — ровно на стыке сцен. */
export const STINGER_SEC = 0.9;

export const beats = (tl: Timeline) => {
  const sc = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id);
  const H = sc("hook");
  const I = sc("interview");
  const S = sc("search");
  const U = sc("rules");
  const T = sc("trial");
  const X = sc("cta");
  const a1 = cueOf(tl, "a1");
  const r1 = cueOf(tl, "r1");
  const m1 = cueOf(tl, "m1");
  const r2 = cueOf(tl, "r2");
  const m2 = cueOf(tl, "m2");
  const a2 = cueOf(tl, "a2");
  const a3 = cueOf(tl, "a3");
  const n1 = cueOf(tl, "n1");
  const n2 = cueOf(tl, "n2");

  // ---------- 1. студия в кружке ----------
  const hook = {
    from: H.from,
    to: H.to,
    banner: H.from + 0.12,
    diveStart: H.from + 0.6,
    diveEnd: H.from + 1.5,
    // драматичный жест к часам на видеостене
    point: wordTime(a1, 1) - 0.15,
    pointEnd: wordTime(a1, 5),
    lower: H.from + 1.7,
    // слово «кайра көтөрүлдү»: ведущий разводит руками
    shrug: wordTime(a1, 6) - 0.1,
  };

  // ---------- 2. интервью из монитора ----------
  const interview = {
    from: I.from,
    to: I.to,
    window: I.from + 0.35,
    lower: I.from + 0.9,
    micOut: r1.from - 0.35,
    micBack: m1.to + 0.2,
    momTurn: r1.from + 0.1,
    glanceMeeting: wordTime(m1, 0) - 0.05,
    glanceClock: wordTime(m1, 3) - 0.05,
    backToReporter: wordTime(m1, 7),
    camPush: m1.from - 0.3,
  };

  // ---------- 3. мама сама ищет ----------
  // окно новостей мама закрывает уже на словах «...издеп көрөйүн»
  const closeNews = Math.max(wordTime(m2, 8), m2.to - 1.0);
  const zoomStart = closeNews + 0.4;
  const zoomEnd = zoomStart + 0.8;
  const typeStart = zoomEnd + 0.1;
  const query = 26; // символов в «Бишкекте мектепке жеткирүү»
  const typeEnd = typeStart + query * 0.045;
  const results = typeEnd + 0.25;
  const openSite = results + 0.6;
  const search = {
    from: S.from,
    to: S.to,
    micOut: r2.from - 0.3,
    micBack: r2.to + 0.2,
    momToScreen: wordTime(m2, 6),
    lower: m2.from,
    closeNews,
    zoomStart,
    zoomEnd,
    typeStart,
    typeEnd,
    results,
    openSite,
    // поля формы подсвечиваются по очереди (до перехода в студию)
    fields: openSite + 0.4,
  };

  // ---------- 4. студийная графика правил ----------
  const rules = {
    from: U.from,
    to: U.to,
    lower: U.from + 0.55,
    address: wordTime(a2, 2) - 0.08,
    school: wordTime(a2, 3) - 0.08,
    time: wordTime(a2, 5) - 0.08,
    map: wordTime(a3, 0) - 0.1,
    radar: wordTime(a3, 1) - 0.05,
    match: wordTime(a3, 3) - 0.05,
    noStart: wordTime(a3, 4) - 0.1,
  };

  // ---------- 5. «если группа сложится» → телевизор выключен ----------
  const pullStart = n2.from - 0.15;
  const pullEnd = pullStart + 1.1;
  const tap = Math.max(pullEnd + 0.15, wordEnd(n2, 6) - 0.2);
  const trial = {
    from: T.from,
    to: T.to,
    wall: T.from + 0.15,
    morning: wordTime(n1, 2) - 0.1,
    afternoon: wordTime(n1, 4),
    free: wordTime(n1, 6) - 0.1,
    decision: wordTime(n1, 8) - 0.1,
    pullStart,
    pullEnd,
    tap,
    off: tap + 0.12,
    offEnd: tap + 0.62,
    toMonitor: tap + 0.5,
  };

  // ---------- 6. финал ----------
  const cta = { from: X.from, to: X.to };

  return { hook, interview, search, rules, trial, cta };
};

export type Beats = ReturnType<typeof beats>;
