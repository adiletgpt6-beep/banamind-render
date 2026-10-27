// Моменты событий сцен (кадры от начала сцены) по фактическим таймингам
// озвучки. Без зависимостей от Remotion: их читают и сцены, и звук, и
// тест scripts/campaign50/bg-047/bg047.test.mjs (порядок событий и то,
// что всё успевает случиться до конца сцены при любой скорости речи).
import { lineFramesIn, wordFrameIn, type Bg47Timeline } from "./timing.ts";

// 1. Хук: волна раскрытия, точка отклеивается, оживает, прыгает.
export const HOOK = { pop: 2, wobble: 14, peel: 24, alive: 30, jump: 42, land: 56 } as const;

// 2. Поля: дом, школа, время, маршрут — по словам реплики n1.
export const fieldsBeats = (tl: Bg47Timeline) => {
  const n1 = lineFramesIn(tl, "n1");
  const w = (i: number) => wordFrameIn(tl, "n1", i);
  const home = w(6);
  const school = Math.max(home + 10, w(7));
  const write = Math.max(school + 14, w(9));
  const route = Math.max(write + 28, w(11));
  return { n1, flip: 12, shrug: w(4), home, school, write, writeEnd: write + 26, route, glow: route + 16 };
};

// 3. Гости с другой школой и другим временем, затем лупа.
export const mismatchBeats = (tl: Bg47Timeline) => {
  const d2 = lineFramesIn(tl, "d2");
  const n2 = lineFramesIn(tl, "n2");
  const leave = d2.from + 22;
  // лупа появляется не раньше, чем гости ушли (взгляд героя не прыгает)
  const lens = Math.max(n2.from - 8, leave + 32);
  return { d2, n2, blueIn: 6, coralIn: 12, arrive: 44, link: 50, tags: 56, neq: 66, guestWave: d2.from + 4, wave: d2.to, leave, lens, lensEnd: Math.max(n2.to + 24, lens + 60) };
};

// Момент, когда лупа проходит над кандидатом i. Лупа движется с плавным
// разгоном (easeInOut), поэтому доли — по времени, а не по пути:
// фиолетовый на 0,39 пути (t ≈ 0,47), мятный на 0,82 пути (t ≈ 0,64).
export const foundAtOf = (b: ReturnType<typeof mismatchBeats>, i: number) => b.lens + Math.round((i === 0 ? 0.64 : 0.47) * (b.lensEnd - b.lens));

// 4. Заявка на сайте → WhatsApp → мама отправляет сама; наклейка «не GPS».
export const applyBeats = (tl: Bg47Timeline) => {
  const n3 = lineFramesIn(tl, "n3");
  const w = (i: number) => wordFrameIn(tl, "n3", i);
  const fills = [34, 44, 54, 64];
  const submit = Math.max(fills[3] + 12, w(2) + 2);
  const send = Math.max(submit + 24, w(3) + 4);
  const gps = Math.max(send + 8, w(7) - 3);
  return { n3, fills, submit, chat: submit + 8, send, sent: send + 3, gps, back: n3.to + 16 };
};

// 5. Группа → мини-пейзаж → полная пробная поездка → решение родителя.
export const trialBeats = (tl: Bg47Timeline) => {
  const n4 = lineFramesIn(tl, "n4");
  const w = (i: number) => wordFrameIn(tl, "n4", i);
  const formed = Math.max(60, w(1));
  const pop = Math.max(formed + 8, w(2));
  const board = Math.max(pop + 18, w(4));
  const go = Math.max(board + 22, w(6));
  // полная поездка укладывается до слов «ата-эне өзү чечет»
  const trip = Math.max(96, w(12) - 6 - go);
  const atSchool = go + Math.round(trip * 0.39);
  const back = atSchool + Math.round(trip * 0.22);
  const atHome = back + Math.round(trip * 0.39);
  return { n4, gather: 44, formed, pop, board, go, free: w(5), atSchool, back, atHome, meet: atHome + 6, decide: Math.max(atHome + 10, w(12)), said: w(12) };
};

// 6. Финал: точка встаёт на место «•» и звучит мягкий звон.
export const CTA_LAND = 20;
export const CTA_CHIME = 14;
