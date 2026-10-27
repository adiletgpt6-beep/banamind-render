import type { MoodName, PoseName } from "../../banana-host";

// Части фильма (смена фона и подпись главы вверху кадра).
export type PartId = "intro" | "arabia" | "revelation" | "mecca" | "hijra" | "medina" | "trials" | "hudaybiya" | "conquest" | "farewell";

// Где стоит банан: слева/справа от иллюстрации, маленький в углу, крупно по центру, вне кадра.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "cornerRight" | "off";

export type Line = {
  id: string;
  text: string; // то, что слышит и читает зритель (субтитры)
  say?: string; // особое произношение для синтеза (ударения, имена)
  pose?: PoseName;
  mood?: MoodName;
  pause?: number; // доп. пауза после реплики, с
  wait?: number; // пауза «подумайте» после вопроса, с (спокойная карточка, без таймера)
  expr?: boolean; // более живая интонация (вступление)
};

export type Visual = { kind: string; [key: string]: unknown };

export type Scene = {
  id: string;
  title: string; // смысловой блок (для сценария, карты источников и глав YouTube)
  part: PartId;
  host: HostSpot;
  visual: Visual;
  // источник: страницы PDF книги (печатные номера совпадают с номерами страниц PDF)
  src: string[];
  srcNote?: string; // что взято из книги и как пересказано
  gap?: number; // фиксированная пауза перед сценой, с
  tight?: boolean; // короткие паузы между репликами (динамичное вступление)
  lines: Line[];
};
