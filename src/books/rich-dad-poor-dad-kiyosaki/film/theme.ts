// Палитра фильма BM-023 «Богатый папа, бедный папа» — «Путь одной монеты».
// Светлый «финансовый» мир: бумага-миллиметровка, золото монет, мятный цвет притока,
// коралловый — оттока, небесный — дохода, фиолетовый — навыков. Кадр всегда светлый
// и контрастный; у каждой главы свой мягкий фон.
import type { ChapterId } from "./types";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2a44",
  inkSoft: "#4a5675",
  paper: "#fffdf6",
  grid: "#dfe6f3",
  gold: "#f5b52e",
  goldDeep: "#c98612",
  goldLight: "#ffe39a",
  yellow: "#ffd23f",
  mint: "#2fbf8f", // приток, актив
  mintDeep: "#1c8f69",
  mintLight: "#c9f2e2",
  coral: "#ff6b5e", // отток, пассив
  coralDeep: "#d8433a",
  coralLight: "#ffd9d4",
  sky: "#47a8f0", // доход
  skyDeep: "#1f78c4",
  skyLight: "#d3ebff",
  violet: "#8a63e8", // навыки, знания
  violetLight: "#e6dcff",
  orange: "#ff9f43", // риск
  orangeLight: "#ffe6cc",
  grey: "#9aa3b5",
  greyLight: "#eef1f6",
  green: "#3fb67c",
  greenDeep: "#23895a",
  red: "#e5484d",
  white: "#ffffff",
};

// Фон каждой главы (верх → низ градиента)
export const CHAPTER_BG: Record<ChapterId, [string, string]> = {
  c00: ["#fff6dc", "#ffe7a8"], // вступление: золотой свет
  c01: ["#eef6ff", "#d3e6fb"], // два папы
  c02: ["#fff1ea", "#ffd8c7"], // урок 1: страх и желание
  c03: ["#eafaf3", "#c9eedf"], // урок 2: грамотность
  c04: ["#f1efff", "#dcd5fb"], // урок 3: свой бизнес
  c05: ["#f3f4f8", "#dde1ea"], // урок 4: налоги (история)
  c06: ["#fff8e6", "#ffe9b5"], // урок 5: изобретать
  c07: ["#ecf7ff", "#cde6f8"], // урок 6: опыт
  c08: ["#fbefef", "#f1d4d4"], // препятствия
  c09: ["#eefaea", "#d2efc6"], // шаги
  c10: ["#fff4e2", "#ffdfb0"], // итог
};

export const CHAPTERS: { id: ChapterId; label: string }[] = [
  { id: "c00", label: "Начало" },
  { id: "c01", label: "Два папы" },
  { id: "c02", label: "Урок 1 · Страх и желание" },
  { id: "c03", label: "Урок 2 · Финансовая грамотность" },
  { id: "c04", label: "Урок 3 · Своё дело" },
  { id: "c05", label: "Урок 4 · Налоги: история" },
  { id: "c06", label: "Урок 5 · Изобретать деньги" },
  { id: "c07", label: "Урок 6 · Учиться ради опыта" },
  { id: "c08", label: "Препятствия" },
  { id: "c09", label: "С чего начать" },
  { id: "c10", label: "Итог" },
];

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const DISPLAY = "'Russo One', Rubik, sans-serif";
