import type { MoodName, PoseName } from "../banana-host";

export type PartId = "intro" | "first" | "word" | "ladder" | "focus" | "time" | "ego" | "hype" | "end";

// Где стоит банан: по центру, слева/справа от схемы, крупно, в углу, «выглядывает» справа.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

export type Line = {
  id: string;
  text: string; // то, что слышит и читает зритель (субтитры)
  say?: string; // особое произношение для синтеза
  pose?: PoseName;
  mood?: MoodName;
  pause?: number; // доп. пауза после реплики, с
  wait?: number; // пауза «подумайте» после вопроса, с (карточка без таймера)
  expr?: boolean; // более живая интонация (вступление)
};

export type Visual = { kind: string; enter?: "slide"; [key: string]: unknown };

export type Scene = {
  id: string;
  title: string; // смысловой блок (для сценария и глав YouTube)
  part: PartId;
  host: HostSpot;
  visual: Visual;
  // источник: строки TXT книги («L31», «L71–L84») или «BanaMind» — комментарий канала
  src: string[];
  srcNote?: string;
  gap?: number;
  tight?: boolean;
  chapter?: string; // начало главы YouTube (название главы)
  law?: number; // номер закона книги (значок «Закон №N» в углу кадра)
  lines: Line[];
};
