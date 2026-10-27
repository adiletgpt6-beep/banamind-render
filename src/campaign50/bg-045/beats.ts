// Моменты действий, привязанные к словам озвучки (кадры сцены). Без
// зависимостей от Remotion и React — их проверяет и node --test
// (scripts/campaign50/bg-045/check.test.mjs): каждый момент должен
// уложиться в свою сцену при фактических таймингах голоса.
import { BG45_VIDEO } from "./script.ts";
import type { Bg45Cue } from "./timing.ts";

const FPS = BG45_VIDEO.fps;

// Кадр сцены, когда звучит слово, начинающееся с prefix (по фактическим
// таймингам озвучки), иначе — доля fallback длины реплики.
export const wordFrame = (cue: Bg45Cue, prefix: string, fallback: number, sceneFrom: number, nth = 0) => {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}]/gu, "");
  const hits = cue.words.filter((x) => norm(x.text).startsWith(norm(prefix)));
  const w = hits[nth];
  const t = w ? w.start : cue.from + (cue.to - cue.from) * fallback;
  return Math.round(t * FPS) - sceneFrom;
};

type W = (prefix: string, fallback: number, nth?: number) => number;

// Хук: раскол зеркала и момент, когда мамы впервые расходятся («эки»).
export const HK = { line: 14, split0: 22, split1: 52, open0: 28, open1: 54, labels: 46 } as const;
export const hookDiverge = (w: W) => Math.max(HK.open1 + 6, w("эки", 0.4));

// Сцена «решение»: телефон, поиск, форма (поля на словах мамы), «Арыз
// калтыруу», WhatsApp и отправка самой мамой.
export const decideBeats = (m01: { from: number; to: number }, w: W) => {
  const home = w("үйдү", 0.55);
  const phoneIn = Math.min(m01.from + 46, home - 56);
  const formIn = Math.min(phoneIn + 44, home - 18);
  const fills = [home, w("мектепти", 0.66), w("убакытты", 0.78), w("убакытты", 0.78) + 8];
  const check = Math.max(fills[3] + 10, w("так", 0.88));
  const formTap = Math.max(m01.to + 12, fills[3] + 26);
  const sendAt = formTap + 44;
  return { phoneIn, searchTap: formIn - 6, formIn, fills, check, formTap, chatIn: formTap + 8, sendAt };
};

// Сцена «условия»: доска до mir0, затем снова раскрывается условное зеркало.
export const groupBeats = (frames: number, w: W) => ({
  notNow: w("дароо", 0.25),
  title: w("адегенде", 0.5),
  fit: w("ылайыктуу", 0.6),
  noG: w("кепил", 0.88),
  mir0: frames - 52,
});

// Сцена «условный пример» (правая половина) по словам диктора.
export const trialBeats = (w: W) => {
  const formed = w("топ", 0.02);
  const first = w("биринчи", 0.12);
  const free = w("акысыз", 0.3);
  const back = Math.max(w("өтөт", 0.36), free + 12);
  const choose = w("улантууну", 0.5) - 8;
  const tap = w("тандаса", 0.58);
  const office = Math.max(w("жолду", 0.65), tap + 22);
  return { formed, first, free, back, choose, tap, office };
};
