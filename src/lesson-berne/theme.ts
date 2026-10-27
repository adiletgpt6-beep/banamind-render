// Палитра фильма BM-034 «Игры, в которые играют люди» (банан-ведущий, 16:9).
// «Монтажный стол»: светлые тёплые и сине-зелёные фоны, три дорожки стола
// (видимые реплики · интерпретация Берна · итог) и три условных состояния Я.
// Цвет различает состояние Я или уровень обмена — НЕ «хорошего» и «плохого»
// человека. Кадр никогда не уходит в чёрное.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1d2340",
  inkSoft: "#4a5378",
  navy: "#27306a",
  fog: "#d7dcf2",
  paper: "#f7f3ea",
  paperDark: "#e6dcc6",
  yellow: "#ffd23f",
  gold: "#f2b636",
  red: "#e5484d", // только зачёркивания и «стоп»
  green: "#2fb36a",
  white: "#ffffff",
  skin: "#f2d5bb",
  skinShade: "#e0b896",
  desk: "#8a5a3c",
  deskTop: "#a8724c",
  // дорожки монтажного стола
  said: "#ffffff", // то, что сказано вслух
  hidden: "#b9a8ff", // интерпретация Берна (пунктир)
  outcome: "#ff8f70", // знакомый итог разговора
  film: "#2b2f52", // корпус стола
};

// Три состояния Я модели Берна — равноправные цвета, без оценки.
export type EgoId = "P" | "A" | "C";
export const EGO: Record<EgoId, { id: EgoId; name: string; short: string; color: string; deep: string; light: string }> = {
  P: { id: "P", name: "Родитель", short: "Р", color: "#5b8def", deep: "#3a68c4", light: "#d4e2ff" },
  A: { id: "A", name: "Взрослый", short: "В", color: "#22b59a", deep: "#138a74", light: "#c8f2e8" },
  C: { id: "C", name: "Ребёнок", short: "Ре", color: "#ff9f43", deep: "#d9771a", light: "#ffe3c4" },
};
export const EGOS: EgoId[] = ["P", "A", "C"];

// Фон каждой части фильма — освещённая гамма.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#2f3a7c", "#6a63b8"],
  time: ["#26507a", "#5f9ac0"],
  game: ["#3a3d82", "#7f73c4"],
  states: ["#24566e", "#4fa0a8"],
  trans: ["#2b4a86", "#5d86cc"],
  yesbut: ["#5a3f7a", "#a878b4"],
  caught: ["#6a4248", "#c48a6a"],
  guest: ["#3e5a46", "#7fae86"],
  help: ["#30507e", "#7aa0cc"],
  good: ["#5e5230", "#c4a45a"],
  free: ["#2a6a6a", "#7ec0b0"],
  end: ["#4a5aa0", "#e0b48a"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const DISPLAY = "Rubik, Nunito, 'Segoe UI', sans-serif";
