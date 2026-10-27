// Палитра фильма «Исламское вероучение (Акыда)»: спокойная ночная лазурь, изумруд,
// золото и пергамент; геометрический орнамент (восьмиконечные звёзды). Без людей.
import type { PartId } from "./types";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#24324a",
  inkSoft: "#4a5874",
  night: "#14213d",
  nightSoft: "#253a66",
  sand: "#f3d9a4",
  sandDeep: "#e2b56c",
  dune: "#d79a52",
  duneDeep: "#b9763a",
  terracotta: "#c8643b",
  clay: "#a9693f",
  stone: "#8c7a66",
  gold: "#f2b632",
  goldSoft: "#ffe08a",
  teal: "#1f8a8a",
  tealSoft: "#7fd0c8",
  emerald: "#1f7a5c",
  emeraldSoft: "#9fdcc0",
  green: "#3d9a62",
  greenDeep: "#2a6e47",
  palm: "#4f8a3c",
  sky: "#8fd0f0",
  skyDeep: "#3b8fd0",
  sea: "#3c8cc4",
  violet: "#7a6cf0",
  red: "#d9534f",
  coral: "#ff7a6b",
  paper: "#fbf3df",
  parchment: "#f1dfb6",
  parchmentDeep: "#d8bd85",
  white: "#ffffff",
  yellow: "#ffd23f",
  kaaba: "#1d1d22",
};

// Фон каждой части — свой мягкий цвет: зритель чувствует смену темы книги.
export const PART_BG: Record<PartId, [string, string]> = {
  intro: ["#14213d", "#2c4475"],
  religion: ["#fff4dc", "#f7dca6"],
  iman: ["#eaf7f0", "#c3e8d4"],
  allah: ["#e8f1fb", "#c5dbf2"],
  attributes: ["#f3effc", "#d9cff2"],
  qadar: ["#fdf0e4", "#f3cfae"],
  prophets: ["#fff6e0", "#f5dfa8"],
  books: ["#f4efe2", "#e3d3ad"],
  unseen: ["#16234a", "#2f3f78"],
  akhira: ["#1b2a4a", "#3c5583"],
  finale: ["#fff3dc", "#ffd99a"],
};

// тёмные части: светлые подписи и орнамент
export const DARK_PARTS: PartId[] = ["intro", "unseen", "akhira"];

export const PART_LABEL: Record<PartId, string> = {
  intro: "Начало",
  religion: "Религия и вероучение",
  iman: "Что такое вера",
  allah: "Вера в Аллаха",
  attributes: "Имена и атрибуты",
  qadar: "Судьба и выбор",
  prophets: "Пророки",
  books: "Священные Писания",
  unseen: "Ангелы и джинны",
  akhira: "Вечная жизнь",
  finale: "Итоги",
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
