// Состав класса фильма 80-1-11: те же 25 мальчиков и учитель Мухаммад, что в
// предыдущих частях (characterConfig.ts: внешность, возраст, постоянные ID
// yusuf, amir, bilal, pupil01 … pupil22). В этот день три друга сидят слева
// на ковре у прохода от двери, 22 ученика — рядами в центре (младшие ближе к
// камере, старшие сзади), справа свободны проход и зона окна и столика.
// Каждый фоновый ученик занят своим делом: книга, рисунок или тетрадь;
// небольшие действия (перевернуть страницу, поправить тетрадь, рисовать)
// происходят в разное время по своему расписанию (seed).
import { heightForAge, PUPILS, TEACHER, type Pupil } from "../characters/characterConfig.ts";
import { depth, ROOM } from "../sets/roomLayout.ts";
import type { Place } from "../rig/Actor.tsx";

export type Activity = "read" | "draw" | "write" | "rest";
export type Seat = { readonly x: number; readonly row: number };
export type BgPlan = { readonly seat: Seat; readonly activity: Activity; readonly item: string };

// Места и занятия 22 учеников. Ряд 0 — ближний к камере (y = ROOM.rowY[0]).
const BG: Readonly<Record<string, BgPlan>> = {
  // ряд 0 — самые младшие (5–6 лет), правее трёх друзей
  pupil01: { seat: { x: 1170, row: 0 }, activity: "draw", item: "#F2D06B" },
  pupil03: { seat: { x: 1350, row: 0 }, activity: "read", item: "#E59A8A" },
  pupil02: { seat: { x: 1530, row: 0 }, activity: "draw", item: "#6FA3C8" },
  // ряд 1 — 6–8 лет
  pupil05: { seat: { x: 500, row: 1 }, activity: "read", item: "#8FC28A" },
  pupil04: { seat: { x: 700, row: 1 }, activity: "draw", item: "#C9A0D8" },
  pupil07: { seat: { x: 900, row: 1 }, activity: "read", item: "#E7B36A" },
  pupil10: { seat: { x: 1100, row: 1 }, activity: "write", item: "#7FB5A2" },
  pupil06: { seat: { x: 1300, row: 1 }, activity: "read", item: "#9EC3E6" },
  pupil09: { seat: { x: 1500, row: 1 }, activity: "draw", item: "#F0E1A0" },
  // ряд 2 — 9–11 лет
  pupil08: { seat: { x: 400, row: 2 }, activity: "write", item: "#D7A9A0" },
  pupil11: { seat: { x: 600, row: 2 }, activity: "read", item: "#B4C7E8" },
  pupil13: { seat: { x: 800, row: 2 }, activity: "write", item: "#D98F5C" },
  pupil12: { seat: { x: 1000, row: 2 }, activity: "rest", item: "#5E7FA8" },
  pupil15: { seat: { x: 1200, row: 2 }, activity: "read", item: "#A8C686" },
  pupil17: { seat: { x: 1400, row: 2 }, activity: "write", item: "#E3C8A0" },
  pupil14: { seat: { x: 1600, row: 2 }, activity: "read", item: "#B57D9E" },
  // ряд 3 — старшие (11–12 лет), у стены
  pupil18: { seat: { x: 500, row: 3 }, activity: "draw", item: "#EFD8A8" },
  pupil20: { seat: { x: 700, row: 3 }, activity: "read", item: "#9DBF9A" },
  pupil16: { seat: { x: 900, row: 3 }, activity: "write", item: "#7C93B8" },
  pupil19: { seat: { x: 1100, row: 3 }, activity: "read", item: "#C27B62" },
  pupil21: { seat: { x: 1300, row: 3 }, activity: "rest", item: "#8D8FBF" },
  pupil22: { seat: { x: 1500, row: 3 }, activity: "read", item: "#D6A35C" },
};

export type CastPupil = Pupil & { readonly plan: BgPlan | null };

export const CAST: readonly CastPupil[] = PUPILS.map((p) => {
  if (p.main) return { ...p, plan: null };
  const plan = BG[p.id];
  if (!plan) throw new Error(`Нет места для ${p.id}`);
  return { ...p, plan };
});

export const MAIN_IDS = ["yusuf", "amir", "bilal"] as const;
export type MainId = (typeof MAIN_IDS)[number];
export const castById = (id: string): CastPupil => {
  const p = CAST.find((x) => x.id === id);
  if (!p) throw new Error(`Нет ученика ${id}`);
  return p;
};

export const heightAt = (age: number, y: number) => heightForAge(age) * depth(y);
export const placeAt = (age: number, x: number, y: number): Place => ({ x, y, h: heightAt(age, y) });

// Место фонового ученика (ступни) и рост с учётом глубины.
export const bgPlace = (p: CastPupil): Place => {
  const plan = p.plan!;
  const y = ROOM.rowY[plan.seat.row];
  return placeAt(p.age, plan.seat.x, y);
};

export const TEACHER_H = 760;
export const teacherPlaceAt = (x: number, y: number): Place => ({ x, y, h: TEACHER_H * depth(y) });
export { TEACHER };
