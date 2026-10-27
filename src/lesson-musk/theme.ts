// Палитра фильма BM-029 «Илон Маск: цена невозможного» (банан-ведущий, 16:9).
// «Мастерская невозможного»: светлые небесно-сталистые фоны и три прозрачных
// рабочих стола — инженерия (бирюза), ресурсы/деньги и время (янтарь),
// люди и доверие (коралл). По цвету зритель узнаёт стол в любой сцене.
// Кадр никогда не уходит в чёрное.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1b2340",
  inkSoft: "#4a5576",
  navy: "#233061",
  steel: "#5d6f93",
  fog: "#dbe3f2",
  paper: "#f7f3ea",
  paperDark: "#e6dcc6",
  glass: "#eaf4ff",
  glassEdge: "#ffffff",
  yellow: "#ffd23f",
  gold: "#f2b636",
  red: "#e5484d", // только места отказа и зачёркивания, без драматизма
  green: "#2fb36a",
  white: "#ffffff",
  metal: "#c9d3e3",
  metalDark: "#8996ad",
  flame: "#ff9a3c",
  skin: "#f2d5bb",
  skinShade: "#e0b896",
  sky: "#bfe3ff",
};

// Три рабочих стола фильма (авторская модель BanaMind, не схема из книги).
export type DeskId = "eng" | "res" | "ppl";
export const DESKS: { id: DeskId; name: string; short: string; color: string; deep: string; light: string }[] = [
  { id: "eng", name: "Инженерное ограничение", short: "физика и проверки", color: "#17b8b0", deep: "#0b8580", light: "#c2f2ee" },
  { id: "res", name: "Деньги и время", short: "запас и сроки", color: "#f2a531", deep: "#c87708", light: "#ffe6bd" },
  { id: "ppl", name: "Люди и доверие", short: "команда и цена", color: "#ff6f61", deep: "#d4473b", light: "#ffd6d1" },
];
export const DC = Object.fromEntries(DESKS.map((d) => [d.id, d])) as Record<DeskId, (typeof DESKS)[number]>;

// Фон каждой части фильма — светлая гамма; части подкрашены цветом главного стола.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#2c3f7a", "#5f86c4"],
  author: ["#33437e", "#7a86c0"],
  early: ["#3a4a78", "#8c9cc4"],
  zip2: ["#25507a", "#5c9ac0"],
  paypal: ["#3e3f7e", "#8a7ac0"],
  spacex: ["#1f4f78", "#4f9ec8"],
  tesla: ["#1f5a62", "#4fa8a0"],
  crisis: ["#5a3d52", "#c07c6c"],
  launch: ["#24497e", "#5fa0d8"],
  factory: ["#265a58", "#62a89a"],
  horizon: ["#45457e", "#a28ac0"],
  cost: ["#5c4058", "#c78a7c"],
  end: ["#3c5a9a", "#e0b48a"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const DISPLAY = "Rubik, Nunito, 'Segoe UI', sans-serif";
