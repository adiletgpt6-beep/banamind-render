// Ключевые моменты сцен (кадры от начала своей сцены), рассчитанные по
// фактической шкале озвучки. Один источник для анимации сцен и для
// звуковых эффектов (Bg46Audio): шаги, щелчки и шорохи совпадают с
// действиями в кадре, даже если длина реплик изменится.
// Без зависимостей от Remotion.
import { BG46_CONTACTS_IN, BG46_VIDEO, type Bg46SceneId } from "./script.ts";
import type { Bg46Cue, Bg46Timeline } from "./timing.ts";

const FPS = BG46_VIDEO.fps;

const sceneFrom = (tl: Bg46Timeline, id: Bg46SceneId) => tl.scenes.find((s) => s.id === id)!.from;
const cueOf = (tl: Bg46Timeline, id: string) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return c;
};

// Начало и конец реплики в кадрах сцены.
export const lineIn = (tl: Bg46Timeline, scene: Bg46SceneId, id: string) => {
  const c = cueOf(tl, id);
  const s0 = sceneFrom(tl, scene);
  return { from: Math.round(c.from * FPS) - s0, to: Math.round(c.to * FPS) - s0 };
};

// Кадр сцены, когда звучит слово, начинающееся с prefix (по фактическим
// таймингам озвучки), иначе — доля fallback длины реплики.
export const wordAt = (cue: Bg46Cue, prefix: string, fallback: number, s0: number) => {
  const w = cue.words.find((x) => x.text.toLowerCase().replace(/[^\p{L}]/gu, "").startsWith(prefix.toLowerCase()));
  const t = w ? w.start : cue.from + (cue.to - cue.from) * fallback;
  return Math.round(t * FPS) - s0;
};

// 1. хук: проснулся, подпрыгнул, тянется к двери, повернулся к зрителю
export const HK = { wake: 12, hop: 22, reach: 30, back: 44 } as const;

export const hookBeats = (tl: Bg46Timeline) => {
  const b01 = lineIn(tl, "hook", "b01");
  return { ...HK, b01, q: Math.round(b01.from + (b01.to - b01.from) * 0.48) };
};

// 2. утро: дочь входит, просит; мама подходит и поднимает рюкзак
export const morningBeats = (tl: Bg46Timeline) => {
  const c01 = lineIn(tl, "morning", "c01");
  const b02 = lineIn(tl, "morning", "b02");
  const walkIn = [0, 62] as const;
  // мама подходит сразу после просьбы (b02 начинается не раньше чем через
  // 2 с после c01 — script.ts, gap), берёт рюкзак за ручку и поднимает
  const momGo = c01.to + 6;
  const momAt = momGo + 26;
  const grab = momAt + 4;
  const lift = grab + 14;
  const cutB = Math.max(lift + 4, Math.min(b02.from - 4, lift + 16));
  const ready = Math.round(b02.from + (b02.to - b02.from) * 0.4); // «Мектепке…»
  const cutC = b02.to + 8;
  return { c01, b02, walkIn, momGo, momAt, grab, lift, cutB, ready, cutC, wink: cutC + 34 };
};

// 3. пять дней монтажа, потом вопрос мамы
export const repeatBeats = (tl: Bg46Timeline) => {
  const m01 = lineIn(tl, "repeat", "m01");
  const d0 = 6;
  const day = 30;
  const dayStart = (i: number) => d0 + i * day;
  return { m01, d0, day, dayStart, cut: Math.max(150, m01.from - 26) };
};

// 4. записка → поиск → страница → WhatsApp → правило
export const noteBeats = (tl: Bg46Timeline) => {
  const s0 = sceneFrom(tl, "note");
  const n01 = cueOf(tl, "n01");
  const n0 = Math.round(n01.from * FPS) - s0;
  const pop = 8;
  const fly0 = 14;
  const catchAt = 34;
  const unfold = [38, 54] as const;
  // записка читается ≈ 1 с, затем поиск: набор → результаты → нажатие →
  // страница BalaGo открывается до начала реплики диктора
  const S = 80;
  const siteAt = Math.max(S + 44, Math.min(S + 50, n0 - 2));
  const resTap = siteAt - 8;
  const typeFrom = S + 4;
  const typeTo = Math.min(S + 28, resTap - 12);
  const wHome = wordAt(n01, "үйдүн", 0.12, s0);
  const wSchool = wordAt(n01, "мектеп", 0.3, s0);
  const wTime = wordAt(n01, "убакыт", 0.42, s0);
  const wThat = wordAt(n01, "ошол", 0.55, s0);
  const wFit = wordAt(n01, "ылайыктуу", 0.75, s0);
  const btnTap = Math.max(wTime + 18, wThat - 6);
  const chatAt = btnTap + 8;
  const sendAt = chatAt + 18;
  const cardAt = Math.max(sendAt + 10, wFit - 6);
  return { n01, pop, fly0, catchAt, unfold, S, typeFrom, typeTo, resTap, siteAt, wHome, wSchool, wTime, btnTap, chatAt, sendAt, cardAt };
};

// 5. условный пример: улица → машина → дома
export const futureBeats = (tl: Bg46Timeline) => {
  const s0 = sceneFrom(tl, "future");
  const b03c = cueOf(tl, "b03");
  const b03 = lineIn(tl, "future", "b03");
  const wFree = wordAt(b03c, "акысыз", 0.45, s0);
  const wTrial = wordAt(b03c, "биринчи", 0.2, s0);
  const wRest = wordAt(b03c, "калганын", 0.62, s0);
  const cut1 = Math.max(54, b03.from - 12);
  return { b03, b03c, wFree, wTrial, wRest, cut1, cut2: wRest - 6, carStop: 46 };
};

// 6. финал: застёгивание молнии, подмигивание, карточка контактов
export const ctaBeats = (tl: Bg46Timeline) => {
  const s0 = sceneFrom(tl, "cta");
  const n03 = cueOf(tl, "n03");
  return {
    n04: lineIn(tl, "cta", "n04"),
    wProfile: wordAt(n03, "профилдеги", 0.3, s0),
    wWa: wordAt(n03, "ватсап", 0.75, s0),
    contactsIn: Math.round(BG46_CONTACTS_IN * FPS),
    zip0: 3,
    zip1: 16,
    wink: 17,
    up0: 18,
    up1: 34,
  };
};
