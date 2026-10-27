// Палитра фильма BM-016 «Преступление и наказание» (банан-ведущий, 16:9).
// Условный Петербург и «лаборатория совести» — сумеречные сине-лиловые тона,
// старое золото и бумага. Кадр никогда не уходит в чёрное: фон всегда освещён.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2440",
  inkSoft: "#4b5272",
  night: "#2b3158",
  dusk: "#4a4f86",
  violet: "#6c5ea8",
  fog: "#c9cde6",
  paper: "#f6efdf",
  paperDark: "#e3d6b8",
  gold: "#e8b84a",
  goldDeep: "#c08f22",
  yellow: "#ffd23f",
  ochre: "#d9a441", // «жёлтые» стены каморки
  wall: "#e6cf8a",
  brick: "#b86b4b",
  green: "#4f9a78", // платок Сони
  greenDeep: "#2f6e55",
  sky: "#8fb6e0",
  dawn: "#ffc98a",
  rose: "#f2a0a0",
  red: "#c94a4a", // только для зачёркиваний, не для крови
  steel: "#8a93b5",
  white: "#ffffff",
};

// Фон каждой части фильма — своя освещённая гамма (без чёрного).
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#3d4378", "#6a5f9e"],
  city: ["#5b6aa0", "#c9a87a"],
  theory: ["#3f4a7c", "#7a6aa8"],
  after: ["#4b4f7a", "#8c7a9e"],
  people: ["#5a6f9a", "#d2b48c"],
  duel: ["#394872", "#6f7fae"],
  sonya: ["#4f6a8a", "#b9c79a"],
  mirrors: ["#47406e", "#8a6f9a"],
  turn: ["#55638f", "#c7a37e"],
  siberia: ["#8fb0d6", "#ffd8a8"],
  end: ["#6d86b8", "#ffe1b0"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
