// Постоянный состав 80-1-14: ровно 25 мальчиков (c01…c25) и один учитель (t01).
// Юсуф (c01), Амир (c02) и Билал (c03) входят в число 25; c04…c25 — 22 фоновых
// участника без озвученных реплик. Внешность, одежда и место каждого ребёнка
// заданы здесь один раз и не меняются между планами. Мелкие вариации
// (моргание, дыхание) берутся из детерминированного хэша ID — без Math.random().

export type HairStyle = "short" | "crop" | "wavy" | "spiky" | "side" | "curly" | "buzz";
export type TopStyle = "tee" | "hoodie" | "shirt" | "sweater" | "stripes" | "polo" | "vest";

export type Kid = {
  readonly id: string;
  readonly name?: "Юсуф" | "Амир" | "Билал";
  readonly age: number;
  // место в комнате (мировые координаты): точка на полу под центром посадки
  readonly x: number;
  readonly y: number;
  // разворот головы и корпуса: −1 — к левому краю кадра, +1 — к правому
  readonly turn: number;
  readonly skin: string;
  readonly hair: string;
  readonly hairStyle: HairStyle;
  readonly top: string;
  readonly topAccent: string;
  readonly topStyle: TopStyle;
  readonly pants: string;
  readonly socks: string;
  // цвет ненавязчивой отметки на личном стакане
  readonly cupMark: string;
  readonly behindTable?: boolean;
};

const SK = ["#F2C9A0", "#E8B88E", "#DDA97C", "#F5D2AE", "#E3B184", "#D69E72"];
const HR = ["#2B1D14", "#3A2717", "#1F1712", "#4A3220", "#2F2219"];

// Главные герои сидят за низким столиком лицом к классу и зрителю:
// Амир — Юсуф — учитель — Билал (слева направо).
const MAIN: Kid[] = [
  {
    id: "c01", name: "Юсуф", age: 4, x: 1340, y: 1215, turn: 0.1, skin: SK[3], hair: HR[1], hairStyle: "wavy",
    top: "#F7C948", topAccent: "#E9B21F", topStyle: "tee", pants: "#5B6E8C", socks: "#F4F1EA", cupMark: "#F2B705", behindTable: true,
  },
  {
    id: "c02", name: "Амир", age: 8, x: 1160, y: 1205, turn: 0.2, skin: SK[1], hair: HR[0], hairStyle: "side",
    top: "#3E78C9", topAccent: "#2F62A8", topStyle: "hoodie", pants: "#4B4B58", socks: "#DDE3EA", cupMark: "#3E78C9", behindTable: true,
  },
  {
    id: "c03", name: "Билал", age: 11, x: 1770, y: 1195, turn: -0.15, skin: SK[4], hair: HR[2], hairStyle: "short",
    top: "#4FA36B", topAccent: "#3C8756", topStyle: "shirt", pants: "#6B5A48", socks: "#ECE6DA", cupMark: "#4FA36B", behindTable: true,
  },
];

// 22 фоновых мальчика 4–12 лет: две группы на ковре по сторонам столика.
// Возраст задаёт рост, пропорции головы и длину конечностей.
type Bg = [age: number, x: number, y: number, turn: number, hairStyle: HairStyle, topStyle: TopStyle, top: string, accent: string, pants: string];
const BG: Bg[] = [
  // левая группа, задний ряд (5)
  [10, 170, 1010, 0.55, "short", "sweater", "#C96F53", "#A9553D", "#4E4A57"],
  [6, 345, 1000, 0.55, "curly", "tee", "#8FB8DE", "#6E9CC7", "#5C5146"],
  [12, 525, 1012, 0.5, "side", "polo", "#E6E1D3", "#C9C2AE", "#3F4A5E"],
  [7, 705, 1003, 0.5, "spiky", "stripes", "#F09C6B", "#FFF3E2", "#516078"],
  [9, 880, 1010, 0.45, "crop", "hoodie", "#9C7FC1", "#7F63A6", "#3E3E46"],
  // левая группа, средний ряд (5)
  [5, 250, 1180, 0.55, "wavy", "tee", "#7DC4B2", "#5AAA97", "#6A5D4E"],
  [11, 440, 1192, 0.5, "buzz", "shirt", "#D9C27A", "#BFA65C", "#4A4F5A"],
  [8, 625, 1185, 0.5, "short", "sweater", "#B04F5E", "#8E3C4A", "#3D4250"],
  [4, 790, 1175, 0.45, "curly", "stripes", "#F3D9A7", "#C98E5E", "#5F6E86"],
  [10, 960, 1190, 0.4, "side", "vest", "#5E7B9A", "#E9E4D8", "#47423C"],
  // левая группа, передний ряд (4)
  [6, 180, 1385, 0.5, "spiky", "hoodie", "#E58A8A", "#C86E6E", "#4F5463"],
  [12, 400, 1400, 0.45, "crop", "polo", "#6C8F5A", "#557646", "#3B3B44"],
  [9, 630, 1392, 0.4, "wavy", "tee", "#F2A93B", "#D18C22", "#55606F"],
  [7, 850, 1388, 0.35, "buzz", "sweater", "#8A9BB0", "#6F8098", "#5A4C42"],
  // правая группа, задний ряд (3)
  [11, 2700, 1010, -0.5, "short", "stripes", "#4C8CA8", "#E8F0F2", "#3E4048"],
  [5, 2870, 1003, -0.55, "wavy", "tee", "#F4B9C4", "#DD97A6", "#5D6B7D"],
  [8, 3040, 1012, -0.55, "side", "hoodie", "#7E6B58", "#64523F", "#3B3E47"],
  // правая группа, средний ряд (3)
  [9, 2620, 1190, -0.45, "curly", "shirt", "#C4D5E8", "#9FB6D0", "#4A4540"],
  [4, 2800, 1180, -0.5, "crop", "sweater", "#A7C77A", "#88A95C", "#5B5F6E"],
  [12, 2985, 1195, -0.5, "buzz", "polo", "#3F5D7A", "#2E4A64", "#45403A"],
  // правая группа, передний ряд (2)
  [7, 2720, 1395, -0.4, "spiky", "vest", "#D98A4E", "#F2EDE1", "#4E5566"],
  [10, 2960, 1400, -0.45, "short", "tee", "#8C6BB3", "#704F98", "#3D3B44"],
];

export const KIDS: readonly Kid[] = [
  ...MAIN,
  ...BG.map(([age, x, y, turn, hairStyle, topStyle, top, topAccent, pants], i): Kid => ({
    id: `c${String(i + 4).padStart(2, "0")}`,
    age,
    x,
    y,
    turn,
    skin: SK[(i * 5 + 2) % SK.length],
    hair: HR[(i * 3 + 1) % HR.length],
    hairStyle,
    top,
    topAccent,
    topStyle,
    pants,
    socks: ["#F4F1EA", "#DCE3E8", "#EDE2CF", "#E5E5E5"][i % 4],
    cupMark: top,
  })),
];

export const TEACHER = {
  id: "t01",
  name: "Мухаммад",
  skin: "#E2B48A",
  hair: "#2A1C13",
  beard: "#2E2017",
  suit: "#2F4F8F",
  suitDark: "#243F75",
  shirt: "#FBFBF8",
  cap: "#FBFAF5",
  // место на подушке за серединой столика, между Юсуфом и Билалом
  x: 1540,
  y: 1215,
} as const;

export const KID_BY_ID = new Map(KIDS.map((k) => [k.id, k]));
export const YUSUF = KIDS[0];
export const AMIR = KIDS[1];
export const BILAL = KIDS[2];

// Детерминированное число 0…1 из строки (FNV-1a).
export const hash01 = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
};

// Пропорции по возрасту (сидя): рост посадки, размер головы, длина рук.
export const kidDims = (age: number) => {
  const seated = 168 + age * 13.5; // 4 г → 222, 12 л → 330
  const headH = seated * (0.4 - age * 0.0105);
  const headW = headH * (0.92 - age * 0.006);
  return {
    seated,
    headH,
    headW,
    shoulderW: seated * (0.34 + age * 0.004),
    // рука ≈ 0,7 роста сидя (реальные детские пропорции): до стакана и листа
    // на низком столике дотягиваются без вытягивания конечностей
    upper: seated * 0.335,
    fore: seated * 0.315,
    hand: seated * 0.052,
  };
};

// Глубина: дальше от зрителя (меньше y) — чуть мельче.
export const depthScale = (y: number) => 0.8 + ((y - 1000) / 420) * 0.17;
