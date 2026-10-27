// Раскладка кадра по времени ролика: активная тема (вкладка), размер
// основной карточки (в сцене рисунка — крупнее), присутствие ведущего,
// переход ведущего из центра наверх в начале, метка дня, «второй слой»
// письма за календарём. Без зависимостей от Remotion.
import { UL2_SCENES, UL2_TEXT, type Ul2SceneId, type Ul2Topic } from "./script.ts";
import { LAYOUT } from "./theme.ts";

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
export const sceneById = (id: Ul2SceneId) => UL2_SCENES.find((s) => s.id === id)!;
export const sceneOf = (t: number) => UL2_SCENES.find((s) => t >= s.from && t < s.to) ?? UL2_SCENES[UL2_SCENES.length - 1];

// ---------- Моменты, общие для сцен и оформления (с от начала ролика) ----------
const S = (id: Ul2SceneId, sec: number) => sceneById(id).from + sec;
export const MOMENTS = {
  // ведущий: из центра (кольцо иконок) в компактный верхний круг
  hostShrink: [0.5, 1.5] as const,
  // напоминание «Мектепке баруу» и смена темы на «Мектеп»
  reminder: S("draft", 3.4),
  toSchool: S("draft", 6.45),
  // смена дней в сцене повторения
  day2: S("days", 4.6),
  day3: S("days", 6.2),
  // письмо уходит вторым слоем, вперёд выходит календарь
  toCalendar: S("husband", 8.3),
} as const;

// ---------- Активная тема ----------
export const topicAt = (t: number): Ul2Topic | null => {
  const s = sceneOf(t);
  switch (s.id) {
    case "intro":
    case "offer":
      return "letter";
    case "draft":
      return t >= MOMENTS.toSchool ? "school" : "letter";
    case "car":
    case "days":
      return "school";
    case "husband":
      return t >= MOMENTS.toCalendar ? "calendar" : "letter";
    case "calendar":
    case "options":
      return "calendar";
    case "drawing":
      return "drawing";
    case "request":
      return "school";
    case "reply":
      return "reply";
    default:
      return null;
  }
};

// Тема следующей карточки (приглушённый слой под основной).
const NEXT: Record<Ul2SceneId, Ul2Topic | null> = {
  intro: "school",
  offer: "school",
  draft: "school",
  car: "letter",
  days: "letter",
  husband: "calendar",
  calendar: "drawing",
  options: "drawing",
  drawing: "school",
  request: "reply",
  reply: null,
  contact: null,
};
export const peekTopicAt = (t: number): Ul2Topic | null => NEXT[sceneOf(t).id];

// ---------- Карточка ----------
const BIG: ReadonlySet<Ul2SceneId> = new Set(["drawing"]);
const T = 0.6; // переход размеров, с
export const bigAt = (t: number) => {
  let v = 0;
  for (const s of UL2_SCENES) {
    if (!BIG.has(s.id)) continue;
    v = Math.max(v, Math.min(smooth((t - s.from + T / 2) / T), 1 - smooth((t - s.to + T / 2) / T)));
  }
  return v;
};

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export const panelAt = (t: number): Rect => {
  const a = LAYOUT.card;
  const b = LAYOUT.cardBig;
  const k = bigAt(t);
  // в начале карточка письма поднимается снизу, пока ведущий уходит наверх
  const intro = 1 - smooth((t - MOMENTS.hostShrink[0]) / (MOMENTS.hostShrink[1] - MOMENTS.hostShrink[0]));
  return { x: a.x, y: a.y + (b.y - a.y) * k + 330 * intro, w: a.w, h: a.h + (b.h - a.h) * k };
};

// Ведущий: 0 — в центре с кольцом иконок, 1 — компактно наверху.
export const hostDockAt = (t: number) => smooth((t - MOMENTS.hostShrink[0]) / (MOMENTS.hostShrink[1] - MOMENTS.hostShrink[0]));

// Присутствие ведущего: в эпизоде с рисунком — меньше, на контактной
// карточке ведущего нет.
export const hostPresence = (t: number) => {
  const contact = sceneById("contact").from;
  return (1 - 0.55 * bigAt(t)) * (1 - smooth((t - contact + 0.3) / 0.3));
};

// «Второй слой» письма за календарём (вечер 3-го дня → обсуждение).
export const letterBehindAt = (t: number) => {
  const a = smooth((t - MOMENTS.toCalendar) / 0.6);
  const end = sceneById("options").to;
  return a * (1 - smooth((t - end + 0.5) / 0.5));
};

// ---------- Метка дня ----------
export const dayLabelAt = (t: number): string => {
  const s = sceneOf(t);
  switch (s.id) {
    case "intro":
      return "";
    case "offer":
    case "draft":
    case "car":
      return UL2_TEXT.day1;
    case "days":
      return t >= MOMENTS.day3 ? UL2_TEXT.day3 : t >= MOMENTS.day2 ? UL2_TEXT.day2 : UL2_TEXT.day1;
    case "husband":
    case "calendar":
    case "options":
    case "drawing":
      return `${UL2_TEXT.day3} · ${UL2_TEXT.evening}`;
    case "request":
    case "reply":
      return UL2_TEXT.nextDay;
    default:
      return "";
  }
};

// ---------- Смена карточек при смене темы ----------
// Старая карточка уходит (обычно вверх, письмо перед поездкой — вниз),
// следующая поднимается с места приглушённого слоя и становится чёткой.
export type TopicChange = { readonly t: number; readonly from: Ul2Topic | null; readonly to: Ul2Topic | null; readonly dir: 1 | -1 };
export const TOPIC_CHANGES: readonly TopicChange[] = (() => {
  const out: TopicChange[] = [];
  let prev = topicAt(0);
  for (let f = 1; f < sceneById("contact").from * 30; f++) {
    const t = f / 30;
    const cur = topicAt(t);
    if (cur !== prev) out.push({ t, from: prev, to: cur, dir: Math.abs(t - MOMENTS.toSchool) < 0.02 ? 1 : -1 });
    prev = cur;
  }
  return out;
})();
const OUT = 0.28; // уход, с
const IN = 0.42; // приход, с
export const cardShiftAt = (t: number): { readonly dy: number; readonly opacity: number; readonly scale: number } => {
  for (const c of TOPIC_CHANGES) {
    if (t >= c.t - OUT && t < c.t) {
      const u = smooth((t - (c.t - OUT)) / OUT);
      return { dy: c.dir * 170 * u, opacity: 1 - u, scale: 1 - 0.04 * u };
    }
    if (t >= c.t && t < c.t + IN) {
      const u = smooth((t - c.t) / IN);
      return { dy: (1 - u) * (c.dir > 0 ? -60 : 420), opacity: 0.35 + 0.65 * u, scale: 0.94 + 0.06 * u };
    }
  }
  return { dy: 0, opacity: 1, scale: 1 };
};
// Прямоугольник карточки со смещением смены тем.
export const cardRectAt = (t: number): Rect & { readonly opacity: number; readonly scale: number } => {
  const r = panelAt(t);
  const s = cardShiftAt(t);
  return { ...r, y: r.y + s.dy, opacity: s.opacity, scale: s.scale };
};
