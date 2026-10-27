// Персонажи урока: учитель Мухаммад и ровно 25 мальчиков (Юсуф, Амир, Билал
// и 22 ученика). У каждого постоянные внешность, одежда, рост, место в
// комнате и идентификатор — одинаковые во всех планах. Таблицу проверяют
// тесты (ровно 25 учеников, три главных, 22 фоновых, без повторов ID).
import { ADULT, buildForAge, shadeOf, type HairStyle, type Look, type Top } from "../rig/looks.ts";

export type Pupil = {
  readonly id: string;
  readonly name: string;
  readonly age: number; // 4…12
  readonly main: boolean;
  readonly look: Look;
  // место на ковре: x по ширине комнаты, row — ряд (0 — ближний к окну/столу)
  readonly seat: { readonly x: number; readonly row: number };
  readonly seed: number;
};

const SKINS: readonly [string, string][] = [
  ["#E8B48D", "#D29A73"],
  ["#E3B08A", "#CF9873"],
  ["#D9A67E", "#C38E66"],
  ["#EBBE9A", "#D8A57F"],
  ["#D8A070", "#BE885A"],
  ["#F0C9A6", "#DCAE88"],
];
const HAIRS = ["#221B19", "#2A1F1C", "#3B2B24", "#1F1A19", "#4A3426", "#2E2522"] as const;
const STYLES: readonly HairStyle[] = ["boyShort", "boyCrop", "boyCurly", "boySide"];
// одежда скромная, повседневная, спокойных цветов, без одинаковой формы
const TOPS: readonly { top: Top; color: string; stripe?: string }[] = [
  { top: "tee", color: "#C85A4A" },
  { top: "sweater", color: "#5E7A6B" },
  { top: "shirt", color: "#DCE6EE" },
  { top: "hoodie", color: "#6D7FA3" },
  { top: "tee", color: "#8A6BB4", stripe: "#F2EEE6" },
  { top: "sweater", color: "#B98A4A" },
  { top: "shirt", color: "#C9D7B8" },
  { top: "tee", color: "#3F7E8C" },
  { top: "vest", color: "#7A4E3B" },
  { top: "sweater", color: "#8E3B46" },
  { top: "tee", color: "#E2B04A", stripe: "#2F4A7A" },
  { top: "hoodie", color: "#4A6D5A" },
  { top: "shirt", color: "#EAD9C9" },
  { top: "tee", color: "#5B6D9E" },
  { top: "sweater", color: "#A05A3C" },
  { top: "tee", color: "#7FAF63" },
  { top: "hoodie", color: "#8C8A9E" },
  { top: "shirt", color: "#CFE3E8" },
  { top: "tee", color: "#D1795F", stripe: "#F7F3EE" },
  { top: "sweater", color: "#3F5E8C" },
  { top: "tee", color: "#9C7A5A" },
  { top: "vest", color: "#5E6F5A" },
];
const BOTTOMS = ["#4A5163", "#3A3E48", "#5A4A40", "#33405F", "#6B5B4B", "#2F3A4A", "#4D5A4F"] as const;
const SOCKS = ["#F2EEE6", "#D9D2C2", "#9FB6CE", "#C9C3B6", "#E6E0D2"] as const;

const r = (seed: number) => {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const mkLook = (age: number, i: number, over: Partial<Look> = {}): Look => {
  const [skin, skinShade] = SKINS[i % SKINS.length];
  const t = TOPS[i % TOPS.length];
  return {
    build: buildForAge(age),
    skin,
    skinShade,
    hair: HAIRS[Math.floor(r(i + 1) * HAIRS.length)],
    hairStyle: STYLES[Math.floor(r(i + 7) * STYLES.length)],
    top: t.top,
    topColor: t.color,
    topShade: shadeOf(t.color, 0.84),
    inner: "#F6F2EA",
    bottom: BOTTOMS[Math.floor(r(i + 3) * BOTTOMS.length)],
    socks: SOCKS[Math.floor(r(i + 11) * SOCKS.length)],
    brow: HAIRS[Math.floor(r(i + 1) * HAIRS.length)],
    lips: "#B86A62",
    stripe: t.stripe,
    ...over,
  };
};

// ---------- Учитель ----------
export const TEACHER: { readonly id: string; readonly name: string; readonly look: Look } = {
  id: "muhammad",
  name: "Мухаммад",
  look: {
    build: ADULT,
    skin: "#E0AF8B",
    skinShade: "#CA9772",
    hair: "#221B19",
    hairStyle: "manShort",
    top: "suit",
    topColor: "#2F4A7A",
    topShade: "#243B63",
    inner: "#FFFFFF",
    bottom: "#2B4270",
    socks: "#2B2B30",
    brow: "#221B19",
    lips: "#A9675E",
    beard: "#2A2220",
    cap: "tubeteika",
  },
};

// ---------- Главные мальчики ----------
const YUSUF: Pupil = {
  id: "yusuf",
  name: "Юсуф",
  age: 4,
  main: true,
  look: mkLook(4, 0, { hair: "#221B19", brow: "#221B19", hairStyle: "boyShort", top: "tee", topColor: "#F2C53D", topShade: "#D9A92C", bottom: "#4A5163", socks: "#F2EEE6", stripe: undefined }),
  seat: { x: 1230, row: 0 },
  seed: 11,
};
const AMIR: Pupil = {
  id: "amir",
  name: "Амир",
  age: 8,
  main: true,
  look: mkLook(8, 3, { hair: "#2A1F1C", brow: "#2A1F1C", hairStyle: "boySide", top: "sweater", topColor: "#3E6FB5", topShade: "#2F5590", bottom: "#3A3E48", socks: "#D9D2C2", stripe: undefined }),
  seat: { x: 1030, row: 0 },
  seed: 12,
};
const BILAL: Pupil = {
  id: "bilal",
  name: "Билал",
  age: 11,
  main: true,
  look: mkLook(11, 2, { hair: "#1F1A19", brow: "#1F1A19", hairStyle: "boyCrop", top: "shirt", topColor: "#4E8F5E", topShade: "#3E7449", bottom: "#33405F", socks: "#C9C3B6", stripe: undefined }),
  seat: { x: 1440, row: 0 },
  seed: 13,
};

// ---------- 22 ученика ----------
// Возраст, ряд и место: младшие ближе к учителю (ряд 0–1), старшие сзади.
const OTHERS: readonly { age: number; x: number; row: number }[] = [
  { age: 5, x: 640, row: 0 },
  { age: 6, x: 830, row: 0 },
  { age: 5, x: 1640, row: 0 },
  { age: 7, x: 540, row: 1 },
  { age: 6, x: 730, row: 1 },
  { age: 8, x: 920, row: 1 },
  { age: 7, x: 1120, row: 1 },
  { age: 9, x: 1330, row: 1 },
  { age: 8, x: 1540, row: 1 },
  { age: 7, x: 1740, row: 1 },
  { age: 9, x: 460, row: 2 },
  { age: 10, x: 650, row: 2 },
  { age: 9, x: 840, row: 2 },
  { age: 11, x: 1040, row: 2 },
  { age: 10, x: 1250, row: 2 },
  { age: 12, x: 1460, row: 2 },
  { age: 10, x: 1660, row: 2 },
  { age: 11, x: 1860, row: 2 },
  { age: 12, x: 560, row: 3 },
  { age: 11, x: 790, row: 3 },
  { age: 12, x: 1140, row: 3 },
  { age: 12, x: 1560, row: 3 },
];

export const PUPILS: readonly Pupil[] = [
  YUSUF,
  AMIR,
  BILAL,
  ...OTHERS.map((o, i) => ({
    id: `pupil${String(i + 1).padStart(2, "0")}`,
    name: `Ученик ${i + 1}`,
    age: o.age,
    main: false,
    look: mkLook(o.age, i + 4),
    seat: { x: o.x, row: o.row },
    seed: 100 + i * 7,
  })),
];

export const pupilById = (id: string): Pupil => {
  const p = PUPILS.find((x) => x.id === id);
  if (!p) throw new Error(`Нет ученика ${id}`);
  return p;
};

export const MAIN = { yusuf: YUSUF, amir: AMIR, bilal: BILAL } as const;

// Рост в мире (px) по возрасту: учитель 760 на линии пола сцены.
export const heightForAge = (age: number) => Math.round(760 * (0.56 + ((Math.min(12, Math.max(4, age)) - 4) / 8) * 0.24));
