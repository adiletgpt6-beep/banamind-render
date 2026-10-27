// Палитра фильма BM-038 «Почему мы рассказываем?» (Йона Бергер «Заразительный»).
// «Лаборатория цепной реакции»: светлый спокойный фон, шесть прозрачных камер
// с чистыми насыщенными цветами (по одной на принцип книги), тёмный контур.
// Цвет различает принцип, а не «хорошее» и «плохое». Кадр никогда не уходит в чёрное.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1d2340",
  inkSoft: "#4a5378",
  navy: "#27306a",
  fog: "#dfe5f3",
  paper: "#fbf8f1",
  paperDark: "#ece3cf",
  glass: "#eaf4ff",
  yellow: "#ffd23f",
  gold: "#f2b636",
  red: "#e5484d", // только зачёркивания, «стоп» и сбой гипотезы
  green: "#22b35e",
  teal: "#17b3a3",
  white: "#ffffff",
  skin: "#f2d5bb",
  skinShade: "#e0b896",
  desk: "#8a5a3c",
  deskTop: "#a8724c",
  spark: "#ffb020", // идея-искра
  grey: "#a7aec6", // «не передали»: погасшая точка
};

// Шесть камер STEPPS — русские названия глав этого издания.
export type CellId = "currency" | "triggers" | "emotion" | "public" | "value" | "stories";
export const CELL: Record<CellId, { n: number; name: string; short: string; color: string; deep: string; light: string; en: string }> = {
  currency: { n: 1, name: "Социальная валюта", short: "Валюта", color: "#f5a524", deep: "#c97c00", light: "#ffeccc", en: "S" },
  triggers: { n: 2, name: "Триггеры", short: "Триггеры", color: "#17b3a3", deep: "#0b8478", light: "#cdf3ee", en: "T" },
  emotion: { n: 3, name: "Эмоции", short: "Эмоции", color: "#ff4f7b", deep: "#d22a57", light: "#ffd9e3", en: "E" },
  public: { n: 4, name: "Общество", short: "Общество", color: "#3b82f6", deep: "#1f5fcf", light: "#d6e5ff", en: "P" },
  value: { n: 5, name: "Практическая ценность", short: "Польза", color: "#22b35e", deep: "#148a43", light: "#d3f5e1", en: "P" },
  stories: { n: 6, name: "Истории", short: "Истории", color: "#8b5cf6", deep: "#6537d6", light: "#e7dcff", en: "S" },
};
export const CELLS: CellId[] = ["currency", "triggers", "emotion", "public", "value", "stories"];

// Фон каждой части фильма — светлая гамма (сверху → снизу), лёгкий оттенок камеры.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#eef2fb", "#dbe4f6"],
  talk: ["#f1eefb", "#e0dbf3"],
  currency: ["#fff7e8", "#fbe6c2"],
  triggers: ["#eafaf7", "#cdeee8"],
  emotion: ["#fff0f3", "#fbd9e1"],
  public: ["#edf3ff", "#d6e3fb"],
  value: ["#eefaf2", "#d3efdd"],
  stories: ["#f4effe", "#e1d6fa"],
  mix: ["#f3f4f8", "#dfe3ee"],
  end: ["#fdf6ea", "#e9e2f6"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const DISPLAY = "Rubik, Nunito, 'Segoe UI', sans-serif";
