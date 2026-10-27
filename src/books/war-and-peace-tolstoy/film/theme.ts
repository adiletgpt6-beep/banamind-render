// Палитра фильма BM-030 «Война и мир: масштаб выбора» — собственная визуальная концепция BanaMind.
// Три слоя одной карты, у каждого свой свет:
//   слой 1 — личный выбор: тёплая бумага, тушь-силуэты, свечи и окна;
//   слой 2 — война: холодная карта-кальки, сетка, горизонтали рельефа, стрелки;
//   слой 3 — история: глубокий индиго и плотная сеть ярких чётких точек-решений.
// Цвета точек — насыщенные, без размытия и «грязного» свечения: читаемы в H.264 и на смартфоне.
import type { ActId, LayerId } from "./types";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2440",
  inkSoft: "#4a5276",
  paper: "#fbf4e6",
  paperDeep: "#efe2c8",
  white: "#ffffff",
  gold: "#f2b630",
  goldDeep: "#c98a12",
  goldLight: "#ffe39a",
  yellow: "#ffd23f",
  red: "#e5484d",
  coral: "#ff7a6b",
  ember: "#f0622f",
  green: "#3fae6a",
  greenDeep: "#2b7d4c",
  sky: "#7cc4ea",
  skyDeep: "#2f7fb8",
  steel: "#5d7591",
  frost: "#dfe9f3",
  violet: "#8a6ce8",
  rose: "#e86a9a",
  night: "#141a3a",
  nightSoft: "#232c5c",
  // точки «сети решений» — яркие, различимые между собой
  dots: ["#ffd23f", "#ff7a6b", "#4fd1c5", "#7c9cff", "#ff9f43", "#a3e635", "#f472b6", "#38bdf8"],
};

// Фон слоя: верх → низ градиента
export const LAYER_BG: Record<LayerId, [string, string]> = {
  l1: ["#fdf6e8", "#f1e1c3"], // личный выбор: тёплая бумага
  l2: ["#eef3f8", "#cfdcea"], // война: холодная карта
  l3: ["#1a2150", "#0f1433"], // история: индиго, сеть точек
};

export const LAYERS: { id: LayerId; n: number; label: string; color: string }[] = [
  { id: "l1", n: 1, label: "Личный выбор", color: "#e0a23a" },
  { id: "l2", n: 2, label: "Война", color: "#2f7fb8" },
  { id: "l3", n: 3, label: "История", color: "#8a6ce8" },
];

// Акты фильма: смысловой блок + слой карты, на котором он идёт
export const ACTS: { id: ActId; label: string; layer: LayerId }[] = [
  { id: "a00", label: "Масштаб выбора", layer: "l3" },
  { id: "a01", label: "1805 · Свет и слава", layer: "l1" },
  { id: "a02", label: "Аустерлиц", layer: "l2" },
  { id: "a03", label: "Пьер и наследство", layer: "l1" },
  { id: "a04", label: "Наташа", layer: "l1" },
  { id: "a05", label: "Семьи и долг", layer: "l1" },
  { id: "a06", label: "1812 · План и поле", layer: "l2" },
  { id: "a07", label: "Москва", layer: "l2" },
  { id: "a08", label: "Плен", layer: "l1" },
  { id: "a09", label: "Кутузов и Наполеон", layer: "l3" },
  { id: "a10", label: "Потери и возвращение", layer: "l1" },
  { id: "a11", label: "Эпилог · Свобода", layer: "l3" },
  { id: "a12", label: "Новая карта", layer: "l3" },
];

export const actLayer = (id: ActId): LayerId => ACTS.find((a) => a.id === id)!.layer;
export const isDark = (layer: LayerId) => layer === "l3";

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const DISPLAY = "'Russo One', Rubik, sans-serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
export const COND = "Oswald, 'Arial Narrow', sans-serif";
