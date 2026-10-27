// Постановка класса для фильма 80-1-8: те же 25 учеников и учитель, что в
// предыдущих частях (characterConfig.ts: внешность, возраст, ID). Три
// главных мальчика в этом фильме сидят за низким столиком рядом с учителем
// (их места — layout.ts, AT_TABLE), а 22 ученика — полукругом на ковре,
// так, чтобы всем был виден столик у окна; места без «дыр» в первом ряду.
import { heightForAge, PUPILS, TEACHER, type Pupil } from "../characters/characterConfig.ts";
import { depth, ROOM } from "../sets/roomLayout.ts";
import type { Place } from "../rig/Actor.tsx";
import { AT_TABLE } from "./layout.ts";

export type Seat = { readonly x: number; readonly row: number };

// Главные — за столиком (row −1: точка задаётся в layout.ts), остальные — ряды на ковре.
const SEATS: Readonly<Record<string, Seat>> = {
  // за столиком: Билал, Амир, Юсуф (рядом с учителем)
  yusuf: { x: AT_TABLE.yusuf.x, row: -1 },
  amir: { x: AT_TABLE.amir.x, row: -1 },
  bilal: { x: AT_TABLE.bilal.x, row: -1 },
  pupil01: { x: 640, row: 0 },
  pupil02: { x: 880, row: 0 },
  pupil03: { x: 1120, row: 0 },
  pupil04: { x: 520, row: 1 },
  pupil05: { x: 730, row: 1 },
  pupil06: { x: 940, row: 1 },
  pupil07: { x: 1150, row: 1 },
  pupil08: { x: 1360, row: 0 },
  pupil09: { x: 1370, row: 1 },
  pupil10: { x: 1580, row: 1 },
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
  pupil22: { x: 1520, row: 3 },
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

export const heightAt = (age: number, y: number) => heightForAge(age) * depth(y);

// Место ученика (ступни) и рост с учётом глубины.
export const seatPlace = (p: CastPupil): Place => {
  if (p.seat.row < 0) {
    const at = AT_TABLE[p.id as MainId];
    return { x: at.x, y: at.y, h: heightAt(p.age, at.y) };
  }
  const y = ROOM.rowY[p.seat.row];
  return { x: p.seat.x, y, h: heightAt(p.age, y) };
};
export const TEACHER_H = 760;
export const teacherPlaceAt = (x: number, y: number): Place => ({ x, y, h: TEACHER_H * depth(y) });
export { TEACHER };
