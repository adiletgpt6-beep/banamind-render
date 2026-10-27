import type { MoodName, PoseName } from "../banana-host";

// Части фильма — «столы» Лаборатории развилок истории (подпись вверху кадра, фон, гармония фона).
export type PartId =
  | "intro" | "yali" | "cajamarca" | "start" | "food" | "domestic" | "axes" | "germs"
  | "writing" | "tech" | "power" | "regions" | "cost" | "limits" | "end";

// Где стоит банан: по центру крупно, слева/справа от сцены, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

// Что звучит в сцене (метка в правом верхнем углу кадра).
export type Claim = "book" | "hypo" | "limit" | "model" | "film";

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
  claim?: Claim;
  host: HostSpot;
  visual: Visual;
  // опора в книге: «p05 L17» — файл part-NN.txt и строка этого файла
  // (books/500-series/sources/BM-027/); «метафора» — образ/пример фильма, не слова Даймонда
  src: string[];
  // что утверждает Даймонд (book) и что — авторский анализ/пример фильма (analysis)
  book?: string;
  analysis?: string;
  gap?: number;
  tight?: boolean;
  lines: Line[];
};
