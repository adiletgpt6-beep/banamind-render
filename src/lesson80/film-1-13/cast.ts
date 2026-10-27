// Состав класса фильма 80-1-13: те же 25 мальчиков и учитель Мухаммад, что в
// предыдущих частях (characterConfig.ts: внешность, возраст, постоянные ID
// yusuf, amir, bilal, pupil01 … pupil22). Юсуф и Амир — у низкого стола и
// полки, Билал сидит у прохода, 22 ученика — четырьмя рядами на ковре слева
// и в центре (младшие ближе к камере, старшие у стены), со сдвигом рядов —
// в общем плане видна голова каждого. Каждый занят своим тихим делом и
// время от времени смотрит на разговор — по своему расписанию (seed).
import { heightForAge, PUPILS, TEACHER, type Pupil } from "../characters/characterConfig.ts";
import { depth, ROOM } from "../sets/roomLayout.ts";
import type { Place } from "../rig/Actor.tsx";

export type Activity = "read" | "draw" | "write" | "cards" | "listen";
export type Seat = { readonly x: number; readonly row: number };
export type BgPlan = { readonly seat: Seat; readonly activity: Activity; readonly item: string };

// Места и занятия 22 учеников. Ряд 0 — ближний к камере (y = ROOM.rowY[0]).
// Класс сидит слева и в центре; проход у правого края доски (x ≈ 980–1430)
// свободен: там стоит учитель и разговаривают главные герои.
const BG: Readonly<Record<string, BgPlan>> = {
  // ряд 0 — младшие (5–7 лет)
  pupil07: { seat: { x: 130, row: 0 }, activity: "read", item: "#E7B36A" },
  pupil01: { seat: { x: 270, row: 0 }, activity: "draw", item: "#F2D06B" },
  pupil03: { seat: { x: 410, row: 0 }, activity: "cards", item: "#E59A8A" },
  pupil02: { seat: { x: 550, row: 0 }, activity: "draw", item: "#6FA3C8" },
  pupil05: { seat: { x: 690, row: 0 }, activity: "read", item: "#8FC28A" },
  pupil04: { seat: { x: 830, row: 0 }, activity: "draw", item: "#C9A0D8" },
  // ряд 1 — 7–9 лет
  pupil10: { seat: { x: 200, row: 1 }, activity: "write", item: "#7FB5A2" },
  pupil06: { seat: { x: 340, row: 1 }, activity: "read", item: "#9EC3E6" },
  pupil09: { seat: { x: 480, row: 1 }, activity: "draw", item: "#F0E1A0" },
  pupil08: { seat: { x: 620, row: 1 }, activity: "write", item: "#D7A9A0" },
  pupil11: { seat: { x: 760, row: 1 }, activity: "read", item: "#B4C7E8" },
  pupil13: { seat: { x: 900, row: 1 }, activity: "write", item: "#D98F5C" },
  // ряд 2 — 10–11 лет
  pupil12: { seat: { x: 270, row: 2 }, activity: "listen", item: "#5E7FA8" },
  pupil15: { seat: { x: 410, row: 2 }, activity: "read", item: "#A8C686" },
  pupil17: { seat: { x: 550, row: 2 }, activity: "write", item: "#E3C8A0" },
  pupil14: { seat: { x: 690, row: 2 }, activity: "read", item: "#B57D9E" },
  pupil18: { seat: { x: 830, row: 2 }, activity: "draw", item: "#EFD8A8" },
  // ряд 3 — старшие (11–12 лет), у стены под доской
  pupil20: { seat: { x: 200, row: 3 }, activity: "read", item: "#9DBF9A" },
  pupil16: { seat: { x: 340, row: 3 }, activity: "write", item: "#7C93B8" },
  pupil19: { seat: { x: 480, row: 3 }, activity: "read", item: "#C27B62" },
  pupil21: { seat: { x: 620, row: 3 }, activity: "cards", item: "#8D8FBF" },
  pupil22: { seat: { x: 760, row: 3 }, activity: "read", item: "#D6A35C" },
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
