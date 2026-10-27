import type { MoodName, PoseName } from "../banana-host";

// части фильма — по книгам «Государства»
export type PartId = "intro" | "b1" | "b23" | "b4" | "b5" | "b67" | "b89" | "b10" | "end";

// где стоит банан: по центру, слева/справа от схемы, крупно, маленький в углу, за кадром
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

export type Line = {
  id: string;
  text: string; // то, что звучит и читается в титрах
  say?: string; // особое произношение для синтеза (ударения)
  pose?: PoseName;
  mood?: MoodName;
  pause?: number; // доп. пауза после реплики, с
  wait?: number; // пауза «подумайте» после вопроса, с
  expr?: boolean; // живее интонация
};

// фигура из точек: вид + параметры; at — номер реплики сцены (дробная часть — доля речи)
export type ShapeSpec = { kind: string; x?: number; y?: number; s?: number; [key: string]: unknown };
export type DotKey = { at: number; shape: ShapeSpec };

// надписи и схемы поверх точек
export type Overlay = { at: number; until?: number; kind: string; [key: string]: unknown };

export type Visual = { dots: DotKey[]; ov?: Overlay[] };

export type Scene = {
  id: string;
  title: string; // смысловой блок (сценарий, главы)
  part: PartId;
  host: HostSpot;
  visual: Visual;
  // опора в источнике: исходные строки TXT (см. SOURCE_MAP), «L120–L160»
  src: string[];
  srcNote?: string; // что взято из книги / что — интерпретация ведущего
  gap?: number;
  tight?: boolean;
  lines: Line[];
};
