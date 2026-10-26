// Постановка класса для фильма 80-1-7: те же 25 учеников и учитель, что в
// предыдущих частях (characterConfig.ts: внешность, возраст, ID), но места
// на ковре расставлены так, чтобы всем было видно столик с глобусом у окна и
// ни один ребёнок не оказался за шаром или лампой. Главные мальчики — ближний
// ряд слева от столика (их места из 80-1-6), остальные — ряды полукругом.
import { heightForAge, PUPILS, TEACHER, type Pupil } from "../characters/characterConfig.ts";
import { depth, ROOM } from "../sets/roomLayout.ts";
import type { Place } from "../rig/Actor.tsx";

export type Seat = { readonly x: number; readonly row: number };

const SEATS: Readonly<Record<string, Seat>> = {
  yusuf: { x: 1230, row: 0 },
  amir: { x: 1030, row: 0 },
  bilal: { x: 1440, row: 0 },
  pupil01: { x: 620, row: 0 },
  pupil02: { x: 820, row: 0 },
  pupil03: { x: 1690, row: 1 },
  pupil04: { x: 520, row: 1 },
  pupil05: { x: 710, row: 1 },
  pupil06: { x: 900, row: 1 },
  pupil07: { x: 1100, row: 1 },
  pupil08: { x: 1300, row: 1 },
  pupil09: { x: 1500, row: 1 },
  pupil10: { x: 2420, row: 1 },
  pupil11: { x: 460, row: 2 },
  pupil12: { x: 650, row: 2 },
  pupil13: { x: 840, row: 2 },
  pupil14: { x: 1040, row: 2 },
  pupil15: { x: 1250, row: 2 },
  pupil16: { x: 1460, row: 2 },
  pupil17: { x: 1660, row: 2 },
  pupil18: { x: 1850, row: 2 },
  pupil19: { x: 560, row: 3 },
  pupil20: { x: 790, row: 3 },
  pupil21: { x: 1140, row: 3 },
  pupil22: { x: 2300, row: 3 },
};

export type CastPupil = Pupil & { readonly seat: Seat };

export const CAST: readonly CastPupil[] = PUPILS.map((p) => {
  const seat = SEATS[p.id];
  if (!seat) throw new Error(`Нет места для ${p.id}`);
  return { ...p, seat };
});

export const MAIN_IDS = ["yusuf", "amir", "bilal"] as const;
export type MainId = (typeof MAIN_IDS)[number];
export const castById = (id: string): CastPupil => {
  const p = CAST.find((x) => x.id === id);
  if (!p) throw new Error(`Нет ученика ${id}`);
  return p;
};

// Место ученика на ковре (ступни) и рост с учётом глубины.
export const seatPlace = (p: CastPupil): Place => {
  const y = ROOM.rowY[p.seat.row];
  return { x: p.seat.x, y, h: heightForAge(p.age) * depth(y) };
};
export const heightAt = (age: number, y: number) => heightForAge(age) * depth(y);
export const TEACHER_H = 760;
export const teacherPlaceAt = (x: number, y: number): Place => ({ x, y, h: TEACHER_H * depth(y) });
export { TEACHER };
