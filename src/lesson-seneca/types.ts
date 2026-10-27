import type { MoodName, PoseName } from "../banana-host";

// Части фильма — «столы» Мастерской внутренней свободы (подпись вверху кадра, фон, гармония фона).
export type PartId =
  | "intro" | "time" | "student" | "crowd" | "fear" | "enough" | "friends"
  | "dignity" | "noise" | "precepts" | "storm" | "good" | "end";

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
  // опора в письмах: «XIII §4 p02 L12» — письмо (римская цифра), параграф(ы), файл
  // part-NN.txt, строка этого файла (books/500-series/sources/BM-026/);
  // «метафора» — авторский образ/пример фильма, не слова Сенеки
  src: string[];
  // что утверждает Сенека (book) и что — авторский анализ/пример фильма (analysis)
  book?: string;
  analysis?: string;
  gap?: number;
  tight?: boolean;
  lines: Line[];
};
