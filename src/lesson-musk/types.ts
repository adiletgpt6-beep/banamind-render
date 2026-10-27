import type { MoodName, PoseName } from "../banana-host";

// Части фильма «Цена невозможного» (подпись вверху кадра, фон).
export type PartId = "intro" | "author" | "early" | "zip2" | "paypal" | "spacex" | "tesla" | "crisis" | "launch" | "factory" | "horizon" | "cost" | "end";

// Где стоит банан: по центру крупно, слева/справа от сцены, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

export type Line = {
  id: string;
  text: string; // то, что слышит и читает зритель (субтитры)
  say?: string; // особое произношение для синтеза (ударения в именах)
  pose?: PoseName;
  mood?: MoodName;
  pause?: number; // доп. пауза после реплики, с
  wait?: number; // пауза «подумайте» после вопроса, с (спокойная карточка, без таймера)
  expr?: boolean; // более эмоциональная интонация (холодный старт)
};

export type Visual = { kind: string; [key: string]: unknown };

export type Scene = {
  id: string;
  title: string; // смысловой блок (для сценария и карты источников)
  part: PartId;
  host: HostSpot;
  visual: Visual;
  // опора в книге: «part-NN:строка» или «part-NN:a–b» по books/500-series/sources/BM-029/part-NN.txt,
  // «метафора» — авторская визуальная метафора фильма, «анализ» — собственный вывод фильма без новых фактов
  src: string[];
  // что взято из книги (book) и что — авторский анализ видео (analysis)
  book?: string;
  analysis?: string;
  gap?: number;
  tight?: boolean;
  lines: Line[];
};
