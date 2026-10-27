import type { MoodName, PoseName } from "../../../banana-host";

// Части фильма — участки «Мастерской городских ворот» (подпись вверху кадра, фон, гармония фона).
export type PartId =
  | "intro" | "cicero" | "origins" | "inside" | "conquest" | "power" | "lives" | "provinces" | "end";

// Где стоит банан: по центру крупно, слева/справа от сцены, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

// Что звучит в сцене (метка в правом верхнем углу кадра): римская легенда,
// голос античного автора, находка/документ, вывод историка-автора, наша
// условная схема, вывод фильма.
export type Claim = "legend" | "ancient" | "find" | "author" | "model" | "film";

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
  // (books/500-series/sources/BM-040/), «png _126» — изображение reference/; «метафора» — образ фильма, не слова книги
  src: string[];
  // что говорит книга (book) и что — наш способ объяснения (analysis)
  book?: string;
  analysis?: string;
  gap?: number;
  tight?: boolean;
  lines: Line[];
};
