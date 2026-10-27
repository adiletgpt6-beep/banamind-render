import type { MoodName, PoseName } from "../banana-host";

export type PartId = "intro" | "diary" | "control" | "anger" | "service" | "fame" | "obstacle" | "time" | "end";

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
  // источник: строки TXT книги («L62», «L79–L80») или «BanaMind» — комментарий канала
  src: string[];
  srcNote?: string;
  gap?: number;
  tight?: boolean;
  chapter?: string; // начало главы YouTube (название главы)
  book?: number; // номер книги записок (значок «Книга N» в углу кадра)
  lines: Line[];
};
