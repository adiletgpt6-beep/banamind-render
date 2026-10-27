import type { MoodName, PoseName } from "../banana-host";

export type PartId = "intro" | "basics" | "obvious" | "attractive" | "easy" | "satisfying" | "master" | "end";

// Где стоит банан: по центру крупно, слева/справа от доски, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

export type Line = {
  id: string;
  text: string; // то, что слышит и читает зритель (субтитры)
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
  // источник: глава и диапазон строк TXT книги («гл. 5, стр. 793–833»), или «фильм» —
  // связка/повтор уже сказанного без новых утверждений
  src: string[];
  srcNote?: string; // что именно взято из книги / что упрощено / что — наш пример
  gap?: number; // фиксированная пауза перед сценой, с (без растяжки до 30:00)
  tight?: boolean; // короткие паузы между репликами без растяжки (динамичное вступление)
  lines: Line[];
};
