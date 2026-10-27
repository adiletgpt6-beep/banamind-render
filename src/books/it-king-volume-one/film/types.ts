import type { MoodName, PoseName } from "../../../banana-host";

// Где стоит банан: слева/справа от схемы, крупно, в углу, за кадром.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

export type Line = {
  id: string;
  text: string; // то, что слышит и читает зритель (субтитры)
  say?: string; // особое произношение для синтеза (ударения, имена)
  pose?: PoseName;
  mood?: MoodName;
  pause?: number; // доп. пауза после реплики, с
  expr?: boolean; // живее интонация (вступление)
};

export type Visual = { kind: string; [key: string]: unknown };

export type Scene = {
  id: string;
  title: string; // смысловой блок (сценарий, раскадровка, главы YouTube)
  block: string; // аналитический блок маршрута TASK §3
  host: HostSpot;
  visual: Visual;
  tag?: string; // маленькая подпись-источник в углу кадра: «Глава 3 · 1985»
  src: string[]; // ID опор SOURCE_MAP (S01…)
  gap?: number; // фиксированная пауза перед сценой, с
  tight?: boolean; // короткие паузы между репликами (вступление)
  lines: Line[];
};
