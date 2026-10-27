import type { MoodName, PoseName } from "../../../banana-host";

// Смысловые части фильма «Масштаб выбора» (подпись вверху кадра, фон).
export type PartId =
  | "intro" | "society" | "austerlitz" | "pierre" | "natasha" | "families" | "plan"
  | "moscow" | "captivity" | "generals" | "recovery" | "theory" | "end";

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
  // опора в тексте романа: «part-NN:L<строки>» по books/500-series/sources/BM-030/part-NN.txt
  // или «метафора» для авторской визуальной схемы фильма
  src: string[];
  // что взято из книги (book) и что — авторский анализ видео (analysis)
  book?: string;
  analysis?: string;
  gap?: number;
  tight?: boolean;
  lines: Line[];
};
