// Единый неизменный состав фильма 80-1-10: ровно 25 мальчиков (Юсуф, Амир,
// Билал и 22 ученика из общей таблицы серии characterConfig.ts — их ID,
// возраст, внешность и одежда не меняются) и ровно 25 детских карточек, по
// одной на каждого. Учитель хранится отдельно (TEACHER) и в состав не входит.
// Здесь же — место каждого в этом фильме и постоянная ячейка его карточки на
// плакате (сетка 5 × 5). Файл без React — его читают тесты.
import { PUPILS, type Pupil } from "../characters/characterConfig.ts";
import { AT_TABLE } from "./layout.ts";

export type DrawingKind =
  | "apple"
  | "tree"
  | "earth"
  | "sun"
  | "tulip"
  | "cloud"
  | "bird"
  | "daisy"
  | "mountains"
  | "river"
  | "lake"
  | "leaf"
  | "rainbow"
  | "grass"
  | "berryBush"
  | "butterfly"
  | "shell"
  | "stone"
  | "rain"
  | "hills"
  | "snowflake"
  | "moon"
  | "sea"
  | "stars"
  | "waterfall";

export const DRAWING_NAME: Record<DrawingKind, string> = {
  apple: "красное яблоко",
  tree: "дерево",
  earth: "Земля",
  sun: "солнце",
  tulip: "тюльпан",
  cloud: "облако",
  bird: "птица",
  daisy: "ромашка",
  mountains: "горы",
  river: "река",
  lake: "озеро",
  leaf: "зелёный лист",
  rainbow: "радуга",
  grass: "трава",
  berryBush: "куст с ягодами",
  butterfly: "бабочка",
  shell: "ракушка",
  stone: "камень",
  rain: "дождевые капли под тучей",
  hills: "зелёные холмы",
  snowflake: "снежинка",
  moon: "луна",
  sea: "море",
  stars: "звёзды",
  waterfall: "водопад",
};

// Ряды ковра в этом фильме (y ступней; 0 — ближний к камере). Сзади вдоль
// стены оставлен проход: в сцене 8 по нему идут к доске; в двух задних рядах
// против правой части доски (x 860…1120) свободно — там в финале стоят
// Юсуф, Амир и Билал, и их не закрывают сидящие.
export const FILM_ROW_Y = [1268, 1180, 1104, 1046] as const;

export type RosterEntry = {
  readonly id: string; // ID ученика из characterConfig.ts
  readonly name: string;
  readonly age: number;
  readonly main: boolean;
  readonly cardId: string; // устойчивый ID карточки
  readonly drawing: DrawingKind;
  readonly cell: { readonly row: number; readonly col: number }; // ячейка на плакате
  readonly seat: { readonly x: number; readonly y: number; readonly row: number }; // row −1 — за столиком
  readonly pupil: Pupil;
};

type Spec = { readonly id: string; readonly drawing: DrawingKind; readonly cell: readonly [number, number]; readonly seat: readonly [number, number] | "table" };

// Порядок — как в задании: главные, затем 22 ученика по возрасту (младшие —
// простые рисунки). Ячейки: верхний ряд — небо, второй — погода и горы,
// центр — птица и три рисунка главных героев (Земля, дерево, яблоко — как
// сидят Билал, Амир и Юсуф), ниже — растения и вода.
const SPECS: readonly Spec[] = [
  { id: "yusuf", drawing: "apple", cell: [2, 3], seat: "table" },
  { id: "amir", drawing: "tree", cell: [2, 2], seat: "table" },
  { id: "bilal", drawing: "earth", cell: [2, 1], seat: "table" },
  { id: "pupil01", drawing: "sun", cell: [0, 0], seat: [0, 470] },
  { id: "pupil03", drawing: "tulip", cell: [2, 4], seat: [0, 670] },
  { id: "pupil02", drawing: "cloud", cell: [0, 1], seat: [0, 870] },
  { id: "pupil05", drawing: "bird", cell: [2, 0], seat: [0, 1560] },
  { id: "pupil04", drawing: "daisy", cell: [3, 0], seat: [0, 1070] },
  { id: "pupil07", drawing: "mountains", cell: [1, 3], seat: [0, 1300] },
  { id: "pupil10", drawing: "river", cell: [4, 0], seat: [1, 400] },
  { id: "pupil06", drawing: "lake", cell: [4, 1], seat: [1, 600] },
  { id: "pupil09", drawing: "leaf", cell: [3, 1], seat: [1, 790] },
  { id: "pupil08", drawing: "rainbow", cell: [0, 2], seat: [1, 980] },
  { id: "pupil11", drawing: "grass", cell: [3, 2], seat: [1, 1180] },
  { id: "pupil13", drawing: "berryBush", cell: [3, 3], seat: [1, 1400] },
  { id: "pupil12", drawing: "butterfly", cell: [1, 2], seat: [1, 1640] },
  { id: "pupil15", drawing: "shell", cell: [4, 4], seat: [2, 440] },
  { id: "pupil17", drawing: "stone", cell: [3, 4], seat: [2, 640] },
  { id: "pupil14", drawing: "rain", cell: [1, 0], seat: [2, 1180] },
  { id: "pupil18", drawing: "hills", cell: [1, 4], seat: [2, 1370] },
  { id: "pupil20", drawing: "snowflake", cell: [1, 1], seat: [2, 1560] },
  { id: "pupil16", drawing: "moon", cell: [0, 3], seat: [2, 1740] },
  { id: "pupil19", drawing: "sea", cell: [4, 2], seat: [3, 560] },
  { id: "pupil21", drawing: "stars", cell: [0, 4], seat: [3, 1290] },
  { id: "pupil22", drawing: "waterfall", cell: [4, 3], seat: [3, 1470] },
];

const pupilOf = (id: string): Pupil => {
  const p = PUPILS.find((x) => x.id === id);
  if (!p) throw new Error(`Нет ученика ${id}`);
  return p;
};

export const classRoster: readonly RosterEntry[] = SPECS.map((s) => {
  const p = pupilOf(s.id);
  const seat =
    s.seat === "table"
      ? { ...AT_TABLE[s.id as "yusuf" | "amir" | "bilal"], row: -1 }
      : { x: s.seat[1], y: FILM_ROW_Y[s.seat[0]], row: s.seat[0] };
  return { id: p.id, name: p.name, age: p.age, main: p.main, cardId: `card-${p.id}`, drawing: s.drawing, cell: { row: s.cell[0], col: s.cell[1] }, seat, pupil: p };
});

export type DrawingCard = {
  readonly id: string;
  readonly owner: string;
  readonly kind: DrawingKind;
  readonly cell: { readonly row: number; readonly col: number };
};

export const drawingCards: readonly DrawingCard[] = classRoster.map((r) => ({ id: r.cardId, owner: r.id, kind: r.drawing, cell: r.cell }));

export const rosterById = (id: string): RosterEntry => {
  const r = classRoster.find((x) => x.id === id);
  if (!r) throw new Error(`Нет в составе: ${id}`);
  return r;
};
export const cardByOwner = (id: string): DrawingCard => {
  const c = drawingCards.find((x) => x.owner === id);
  if (!c) throw new Error(`Нет карточки у ${id}`);
  return c;
};
export const BIRD_OWNER = "pupil05";

// Проверки состава: 25 разных мальчиков (3 главных + 22), 25 разных
// карточек и рисунков, каждая ячейка 5 × 5 занята ровно одной карточкой,
// учителя в составе нет, возраст 4–12.
export const checkRoster = (): string[] => {
  const p: string[] = [];
  if (classRoster.length !== 25) p.push(`в составе ${classRoster.length}, нужно 25`);
  if (new Set(classRoster.map((r) => r.id)).size !== 25) p.push("ID учеников повторяются");
  if (classRoster.filter((r) => r.main).length !== 3) p.push("главных не три");
  if (classRoster.some((r) => r.id === "muhammad")) p.push("учитель попал в состав класса");
  if (classRoster.some((r) => r.age < 4 || r.age > 12)) p.push("возраст вне 4–12");
  if (drawingCards.length !== 25 || new Set(drawingCards.map((c) => c.id)).size !== 25) p.push("карточек не 25 или ID повторяются");
  if (new Set(drawingCards.map((c) => c.kind)).size !== 25) p.push("рисунки повторяются");
  const cells = new Set(drawingCards.map((c) => `${c.cell.row}:${c.cell.col}`));
  if (cells.size !== 25 || drawingCards.some((c) => c.cell.row < 0 || c.cell.row > 4 || c.cell.col < 0 || c.cell.col > 4)) p.push("ячейки сетки 5 × 5 заняты не по одной");
  const seats = new Set(classRoster.map((r) => `${Math.round(r.seat.x)}:${Math.round(r.seat.y)}`));
  if (seats.size !== 25) p.push("места повторяются");
  for (const row of [0, 1, 2, 3]) {
    const xs = classRoster.filter((r) => r.seat.row === row).map((r) => r.seat.x).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] < 180) p.push(`ряд ${row}: соседи ближе 180 px`);
  }
  if (cardByOwner("yusuf").kind !== "apple" || cardByOwner("amir").kind !== "tree" || cardByOwner("bilal").kind !== "earth") p.push("рисунки главных героев не те");
  return p;
};
