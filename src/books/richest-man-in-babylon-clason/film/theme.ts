// Палитра фильма BM-036 «Десятая монета». Светлая тёплая мастерская: глиняные и песочные тона
// Вавилона, золото монет, бирюза собственного запаса (цвет изразцов), коралл расходов,
// индиго обязательств, зелень дохода. Кадр всегда светлый и контрастный, у главы — свой мягкий фон.
import type { ChapterId } from "./types";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#2a2140",
  inkSoft: "#5a5070",
  paper: "#fffaf0",
  clay: "#eba55c", // глина табличек
  clayDeep: "#c4733a",
  clayLight: "#f6dcbc",
  sand: "#f3e2c0",
  gold: "#f7b928",
  goldDeep: "#c98410",
  goldLight: "#ffe59a",
  income: "#2fb36f", // доход — зелёный
  incomeDeep: "#1d8650",
  incomeLight: "#cdf1dc",
  spend: "#ff6f5e", // расходы — коралл
  spendDeep: "#d8483a",
  spendLight: "#ffdcd6",
  keep: "#16a8b8", // собственный запас — бирюза изразцов
  keepDeep: "#0b7f8c",
  keepLight: "#c7f0f3",
  debt: "#6a5cd8", // обязательства — индиго
  debtDeep: "#4a3db3",
  debtLight: "#e2ddff",
  sky: "#3d9df0",
  skyLight: "#d6ebff",
  lapis: "#2f5bd3", // ляпис-лазурь ворот
  rose: "#ff8fb1",
  orange: "#ff9b3d",
  green: "#3fb67c",
  greenDeep: "#23895a",
  red: "#e5484d",
  grey: "#a39cb3",
  greyLight: "#efecf4",
  wood: "#dc9450",
  woodDeep: "#a9632c",
  white: "#ffffff",
};

// Зоны стола мастерской (сквозная схема фильма)
export const ZONES = {
  income: { label: "Доход", color: C.income, deep: C.incomeDeep, light: C.incomeLight },
  spend: { label: "Расходы", color: C.spend, deep: C.spendDeep, light: C.spendLight },
  keep: { label: "Запас", color: C.keep, deep: C.keepDeep, light: C.keepLight },
  debt: { label: "Долги", color: C.debt, deep: C.debtDeep, light: C.debtLight },
} as const;
export type ZoneId = keyof typeof ZONES;

// Фон каждой главы (верх → низ градиента)
export const CHAPTER_BG: Record<ChapterId, [string, string]> = {
  c00: ["#fff6e4", "#fde4bd"], // мастерская: тёплый свет
  c01: ["#fff3e8", "#f8dcc6"], // мастер с пустым кошельком
  c02: ["#fffbe6", "#fbeab0"], // десятая монета: золото
  c03: ["#fff1ef", "#fbd9d2"], // нужды и желания: коралл
  c04: ["#ecf9fb", "#cdebf0"], // как не потерять: бирюза
  c05: ["#eef6ff", "#d3e5fb"], // возможность: небо
  c06: ["#f2f0ff", "#ddd8fb"], // план Дабасира: индиго
  c07: ["#eefaf1", "#d0eedb"], // работа и свобода: зелень
  c08: ["#fff6e4", "#fde4bd"], // возврат к столу
};

export const CHAPTERS: { id: ChapterId; label: string }[] = [
  { id: "c00", label: "Начало" },
  { id: "c01", label: "Мастер с пустым кошельком" },
  { id: "c02", label: "Десятая монета" },
  { id: "c03", label: "Нужды и желания" },
  { id: "c04", label: "Как не потерять" },
  { id: "c05", label: "Возможность без чудес" },
  { id: "c06", label: "План Дабасира" },
  { id: "c07", label: "Работа и свобода" },
  { id: "c08", label: "Задача каждой монеты" },
];

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
export const DISPLAY = "'Russo One', Rubik, sans-serif";
