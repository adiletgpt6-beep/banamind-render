import type { MoodName, PoseName } from "../banana-host";

export type PartId = "intro" | "power" | "words" | "people" | "strategy" | "flex" | "end";

// Где стоит банан: по центру крупно, слева/справа от доски, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

export type Line = {
  id: string;
  text: string; // то, что слышит и читает ребёнок (субтитры)
  say?: string; // особое произношение для синтеза (ударения, имена)
  pose?: PoseName;
  mood?: MoodName;
  pause?: number; // доп. пауза после реплики, с
  wait?: number; // интерактивная пауза «подумай» после вопроса, с
  expr?: boolean; // более эмоциональная интонация (вступление)
};

export type Visual = { kind: string; [key: string]: unknown };

export type Scene = {
  id: string;
  title: string; // название смыслового блока (для сценария и карты источников)
  part: PartId;
  host: HostSpot;
  visual: Visual;
  // источник: страницы PDF и глава приложенного TXT («PDF 63–64 (гл. 3)»)
  src: string[];
  srcNote?: string; // что именно взято из книги / что упрощено
  gap?: number; // фиксированная пауза перед сценой, с (без растяжки до 30:00)
  tight?: boolean; // короткие паузы между репликами без растяжки (динамичное вступление)
  lines: Line[];
};
