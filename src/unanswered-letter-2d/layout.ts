// Раскладка кадра по времени ролика: активная тема, метка дня, смена
// карточки при смене темы. Карточка одна и та же во всех сценах (крупная,
// почти на весь кадр); без приглушённых «следующих» карточек и вторых
// слоёв. Без зависимостей от Remotion.
import { UL2_SCENES, UL2_TEXT, type Ul2SceneId, type Ul2Topic } from "./script.ts";
import { LAYOUT } from "./theme.ts";

export const sceneById = (id: Ul2SceneId) => UL2_SCENES.find((s) => s.id === id)!;
export const sceneOf = (t: number) => UL2_SCENES.find((s) => t >= s.from && t < s.to) ?? UL2_SCENES[UL2_SCENES.length - 1];

// ---------- Моменты, общие для сцен, звука и оформления (с от начала ролика) ----------
const S = (id: Ul2SceneId, sec: number) => sceneById(id).from + sec;
export const MOMENTS = {
  // напоминание «Мектепке баруу»; черновик сохраняется; Айжан уходит
  reminder: S("draft", 2.1),
  saved: S("draft", 3.5),
  toSchool: S("draft", 6.2),
  // смена дней в сцене повторения
  day2: S("days", 3.9),
  day3: S("days", 5.1),
  // вечер: вперёд выходит календарь
  toCalendar: S("husband", 7.3),
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

// ---------- Смена темы ----------
// Карточка остаётся на месте и непрозрачной: смена темы — это смена плана
// внутри карточки (монтажная склейка сцены), а не уход карточки в
// прозрачность. Раньше карточка на 0,2 с уходила и на 0,3 с приходила —
// на стыке оставался почти чёрный кадр с одной плашкой темы (мигание).
export type TopicChange = { readonly t: number; readonly from: Ul2Topic | null; readonly to: Ul2Topic | null };
export const TOPIC_CHANGES: readonly TopicChange[] = (() => {
  const out: TopicChange[] = [];
  let prev = topicAt(0);
  for (let f = 1; f < sceneById("contact").from * 30; f++) {
    const t = f / 30;
    const cur = topicAt(t);
    if (cur !== prev) out.push({ t, from: prev, to: cur });
    prev = cur;
  }
  return out;
})();
export const cardShiftAt = (): { readonly dy: number; readonly opacity: number; readonly scale: number } => ({ dy: 0, opacity: 1, scale: 1 });

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
// Прямоугольник карточки (px кадра) со смещением смены тем.
export const cardRectAt = (t: number): Rect & { readonly opacity: number; readonly scale: number } => {
  const r = LAYOUT.card;
  const s = cardShiftAt();
  void t;
  return { ...r, y: r.y + s.dy, opacity: s.opacity, scale: s.scale };
};
