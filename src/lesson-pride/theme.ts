// Палитра фильма BM-019 «Гордость и предубеждение» (банан-ведущий, 16:9).
// «Кабинет наблюдения» — тёплая светлая бумага, контрастные тёмные линии,
// чистые акценты: розовая линза Элизабет, сине-зелёная линза Дарси, золото
// выводов. Конфликтные сцены меняют гамму, но кадр всегда светлый и читаемый.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2a3d",
  inkSoft: "#4a5670",
  paper: "#fbf5e8",
  paperDark: "#efe2c6",
  cream: "#fff9ee",
  gold: "#e3a93a",
  goldDeep: "#b9821c",
  yellow: "#ffd23f",
  rose: "#e0697a", // линза Элизабет
  roseSoft: "#f6c3c7",
  teal: "#2f8f9d", // линза Дарси
  tealSoft: "#b8dfe3",
  sage: "#6c9a6e", // Пемберли, сад
  sageSoft: "#cfe3c4",
  plum: "#7d4f86", // давление, леди Кэтрин
  plumSoft: "#dcc6e2",
  sky: "#9cc6e8",
  brick: "#b8664a",
  red: "#cc4646", // только для зачёркиваний
  green: "#3f9b5a", // подтверждено
  steel: "#8892ab",
  white: "#ffffff",
};

// Фон каждой части фильма — своя освещённая гамма (без чёрного и тёмных кадров).
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fdf3e1", "#f3dcc0"],
  money: ["#f8f0dc", "#e8d6ae"],
  first: ["#fdeee8", "#f1d2cb"],
  wickham: ["#fbefe4", "#e9cdb8"],
  charlotte: ["#f4f1e6", "#dcd6bd"],
  jane: ["#eef4f6", "#cfe0e6"],
  proposal: ["#f7e9ec", "#dcc0cb"],
  letter: ["#fbf6ea", "#e9dcc0"],
  pemberley: ["#eef5e8", "#cfe1c3"],
  crisis: ["#f1ecf3", "#d6cce0"],
  catherine: ["#f3ecf5", "#dccbe3"],
  second: ["#fdf2e6", "#f4d8b8"],
  end: ["#fff6e4", "#f7dfb2"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
