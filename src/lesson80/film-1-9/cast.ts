// Постановка класса для фильма 80-1-9: те же 25 учеников и учитель, что в
// предыдущих частях (characterConfig.ts: внешность, возраст, ID). Реестр
// фильма: yusuf, amir, bilal и bg01…bg22 — фоновые ученики; bgNN — это
// ученик серии pupilNN (те же лицо, одежда и возраст, что в 80-1-6…80-1-8).
// Три главных мальчика сидят за низким столиком (места — layout.ts,
// AT_TABLE); 22 ученика — в три ряда на ковре с проходами для Билала.
// Номер bgNN совпадает с порядком раздачи салфеток (маршрут Билала):
// ряд A слева направо (bg01–bg07), ряд B справа налево (bg08–bg15),
// ряд C слева направо (bg16–bg22) — младшие ближе к камере, старшие сзади.
import { heightForAge, PUPILS, TEACHER as SERIES_TEACHER, type Pupil } from "../characters/characterConfig.ts";
import { depth } from "../sets/roomLayout.ts";
import type { Place } from "../rig/Actor.tsx";
import type { Look } from "../rig/looks.ts";
import { AT_TABLE, ROWS } from "./layout.ts";

export type RowId = "A" | "B" | "C" | "table";
export type Seat = { readonly x: number; readonly row: RowId };

// Места фоновых учеников: x и ряд (порядок = порядок раздачи).
const BG_SEATS: readonly Seat[] = [
  // ряд A (ближний, младшие), слева направо
  { x: 330, row: "A" },
  { x: 520, row: "A" },
  { x: 710, row: "A" },
  { x: 900, row: "A" },
  { x: 1090, row: "A" },
  { x: 1280, row: "A" },
  { x: 1470, row: "A" },
  // ряд B, справа налево (в шахматном порядке относительно ряда A)
  { x: 1565, row: "B" },
  { x: 1375, row: "B" },
  { x: 1185, row: "B" },
  { x: 995, row: "B" },
  { x: 805, row: "B" },
  { x: 615, row: "B" },
  { x: 425, row: "B" },
  { x: 240, row: "B" },
  // ряд C (дальний, старшие), слева направо
  { x: 330, row: "C" },
  { x: 520, row: "C" },
  { x: 710, row: "C" },
  { x: 900, row: "C" },
  { x: 1090, row: "C" },
  { x: 1280, row: "C" },
  { x: 1470, row: "C" },
];

export const bgId = (i: number) => `bg${String(i + 1).padStart(2, "0")}`;
const pupilIdOf = (bg: string) => `pupil${bg.slice(2)}`;

export type CastPupil = Omit<Pupil, "seat"> & { readonly seat: Seat; readonly castId: string };

// Рисунок рук стиля 2 (looks.ts, rigStyle): кисти с ладонью и пальцами для
// передач салфеток, тарелки и еды. Лица, одежда и пропорции — прежние.
const style2 = (look: Look): Look => ({ ...look, rigStyle: 2 });

export const MAIN_IDS = ["yusuf", "amir", "bilal"] as const;
export type MainId = (typeof MAIN_IDS)[number];

export const CAST: readonly CastPupil[] = [
  ...MAIN_IDS.map((id) => {
    const p = PUPILS.find((x) => x.id === id)!;
    return { ...p, look: style2(p.look), castId: id, seat: { x: AT_TABLE[id].x, row: "table" as const } };
  }),
  ...BG_SEATS.map((seat, i) => {
    const id = bgId(i);
    const p = PUPILS.find((x) => x.id === pupilIdOf(id));
    if (!p) throw new Error(`Нет ученика серии для ${id}`);
    return { ...p, look: style2(p.look), castId: id, seat };
  }),
];

export const BG_IDS: readonly string[] = BG_SEATS.map((_, i) => bgId(i));

export const castById = (id: string): CastPupil => {
  const p = CAST.find((x) => x.castId === id);
  if (!p) throw new Error(`Нет ученика ${id}`);
  return p;
};

export const heightAt = (age: number, y: number) => heightForAge(age) * depth(y);

// Место ученика (точка между ступнями) и рост с учётом глубины.
export const seatPlace = (p: CastPupil): Place => {
  if (p.seat.row === "table") {
    const at = AT_TABLE[p.castId as MainId];
    return { x: at.x, y: at.y, h: heightAt(p.age, at.y) };
  }
  const y = ROWS[p.seat.row];
  return { x: p.seat.x, y, h: heightAt(p.age, y) };
};

export const TEACHER_H = 760;
export const teacherPlaceAt = (x: number, y: number): Place => ({ x, y, h: TEACHER_H * depth(y) });
export const TEACHER = { ...SERIES_TEACHER, look: style2(SERIES_TEACHER.look) };
