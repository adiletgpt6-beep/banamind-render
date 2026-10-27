import type { MoodName, PoseName } from "../banana-host";

// Части фильма — «отделы» Бюро невозможных доказательств (подпись вверху кадра, фон).
export type PartId =
  | "intro" | "harker" | "castle" | "england" | "friends" | "seward" | "lucy"
  | "helsing" | "editor" | "tech" | "threat" | "pursuit" | "lessons" | "end";

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
  // опора в книге: «гл.4 p02 L120» — глава русской редакции, файл part-NN.txt,
  // строка этого файла (books/500-series/sources/BM-033/);
  // «метафора» — авторский образ/пример фильма, не текст романа
  src: string[];
  // что происходит в романе (book) и что — авторский анализ BanaMind (analysis)
  book?: string;
  analysis?: string;
  gap?: number;
  tight?: boolean;
  lines: Line[];
};
