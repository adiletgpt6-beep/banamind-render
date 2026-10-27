// Палитра фильма «Жизнеописание Пророка Мухаммада» (Ибн Хишам): тёплая пустыня,
// песок, терракота, глубокий ночной синий, золото и бирюза; геометрический орнамент.
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
  green: "#3d9a62",
  greenDeep: "#2a6e47",
  palm: "#4f8a3c",
  sky: "#8fd0f0",
  skyDeep: "#3b8fd0",
  sea: "#3c8cc4",
  red: "#d9534f",
  paper: "#fbf3df",
  parchment: "#f1dfb6",
  parchmentDeep: "#d8bd85",
  white: "#ffffff",
  yellow: "#ffd23f",
  kaaba: "#1d1d22",
};

// Фон каждой части — свой мягкий цвет, зритель чувствует смену эпохи и места.
export const PART_BG: Record<PartId, [string, string]> = {
  intro: ["#1c2a4f", "#3d4f80"],
  arabia: ["#fff1d6", "#f6d59a"],
  revelation: ["#1b2747", "#33467a"],
  mecca: ["#fbe6d2", "#efc3a0"],
  hijra: ["#e8f1fb", "#c9dcf1"],
  medina: ["#eaf7ec", "#c6e8cf"],
  trials: ["#f6ece2", "#e3cbb3"],
  hudaybiya: ["#eef6f1", "#cfe7dc"],
  conquest: ["#fff4dc", "#ffdfa0"],
  farewell: ["#f1ecfb", "#d7cdef"],
};

export const PART_LABEL: Record<PartId, string> = {
  intro: "Начало",
  arabia: "Аравия и детство",
  revelation: "Начало откровения",
  mecca: "Испытания в Мекке",
  hijra: "Переселение",
  medina: "Медина",
  trials: "Годы испытаний",
  hudaybiya: "Аль-Худайбия",
  conquest: "Возвращение в Мекку",
  farewell: "Прощание и наследие",
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
