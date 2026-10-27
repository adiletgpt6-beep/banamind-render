// Общие размеры и движения персонажей: рост в мире кадра, посадка и
// вставание (сначала смена опоры и корпус, затем таз), высота сидений.
import type { Place } from "../rig/Actor";

// Рост персонажей (px мира) в обычном плане при масштабе 1 (взрослый
// мужчина ≈ 1,78 м → 800 px). Сыну 9 лет (≈ 1,33 м): 600 px — 0,75 роста
// отца, школьные (не младенческие) пропорции. Один и тот же рост во всех
// планах; крупность меняет камера, а не рост.
export const H = {
  dad: 800,
  mom: 770,
  son: 600,
  assistant: 765,
  grandma: 715,
  client: 795,
  colleagueW: 760,
  colleagueM: 785,
  // совместимость с ригом №30
  boy: 600,
  nanny: 750,
  sister: 400,
  colleague: 780,
} as const;

// Седан семьи (props/Car.tsx, длина 1000 единиц ≈ 4,4 м) в масштабе
// персонажей H: 1 единица машины = CAR_SCALE px (рост отца 1,78 м = 800 px).
export const CAR_SCALE = 1.98;

// Сиденье стула: доля роста (взрослый / ребёнок).
export const seatOf = (h: number, child = false) => (child ? 0.33 : 0.27) * h;

export const placeAt = (x: number, y: number, h: number): Place => ({ x, y, h });

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
// Посадка: корпус вперёд (вес на стопы), затем таз опускается на сиденье,
// корпус выпрямляется. t0 — начало движения.
export const sitDown = (t: number, t0: number, dur = 34) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.25 ? 0 : u >= 1 ? 1 : smooth((u - 0.25) / 0.75);
  const lean = u <= 0 ? 0 : u >= 1.25 ? 0 : u < 0.35 ? 16 * smooth(u / 0.35) : 16 - 16 * smooth((u - 0.35) / 0.9);
  return { sit, lean };
};
// Вставание: корпус вперёд, вес на стопы, затем выпрямление.
export const standUp = (t: number, t0: number, dur = 34) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.3 ? 1 : u >= 1 ? 0 : 1 - smooth((u - 0.3) / 0.7);
  const lean = u <= 0 ? 0 : u >= 1.2 ? 0 : u < 0.35 ? 18 * smooth(u / 0.35) : 18 - 18 * smooth((u - 0.35) / 0.85);
  return { sit, lean };
};

// Цвета рук крупных планов (CloseHand): кожа и рукав героя в этой сцене.
export const HANDS = {
  mom: { skin: "#E6B590", shade: "#C99470", sleeve: "#2E5F6B", cuff: "#F4F1EA" },
  momHome: { skin: "#E6B590", shade: "#C99470", sleeve: "#3F7380", cuff: "#F4ECDD" },
  dad: { skin: "#DCAA84", shade: "#B9845F", sleeve: "#8FAFC8", cuff: "#7896B0" },
  boy: { skin: "#E3B08A", shade: "#C2916C", sleeve: "#F4F1EA", cuff: "#D9D3C6" },
  boySchool: { skin: "#E3B08A", shade: "#C2916C", sleeve: "#2B4570", cuff: "#22385C" },
} as const;
