import type { MoodName, PoseName } from "../banana-host";

export type PartId = "intro" | "roots" | "garage" | "mac" | "exile" | "return" | "system" | "iphone" | "price" | "end";

// Где стоит банан: по центру крупно, слева/справа от схемы, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

// Что за утверждение звучит в сцене — зритель видит метку в углу кадра:
// book — так описывает Айзексон (по книге), jobs — слова/воспоминание самого Джобса в книге,
// witness — версия другого очевидца, dispute — свидетельства расходятся,
// opinion — оценка Айзексона, model — учебная метафора фильма (не история),
// recon — художественная реконструкция по книге (условные фигуры, не документ),
// film — вывод и вопрос фильма BanaMind.
export type Claim = "book" | "jobs" | "witness" | "dispute" | "opinion" | "model" | "recon" | "film";

export type Line = {
  id: string;
  text: string; // то, что слышит и читает зритель (субтитры)
  say?: string; // особое произношение для синтеза (ударения, имена)
  pose?: PoseName;
  mood?: MoodName;
  pause?: number; // доп. пауза после реплики, с
  wait?: number; // пауза «вопрос для размышления» после вопроса, с
  expr?: boolean; // более эмоциональная интонация (вступление)
};

export type Visual = { kind: string; [key: string]: unknown };

export type Scene = {
  id: string;
  title: string; // смысловой блок (для сценария, раскадровки и глав)
  part: PartId;
  host: HostSpot;
  claim: Claim;
  visual: Visual;
  // источник: строки присланного TXT (L123 или L123–L140), на которые опирается сцена;
  // "модель" — оригинальная учебная сцена фильма, "фильм" — вывод/вопрос BanaMind
  src: string[];
  srcNote?: string; // что именно взято из книги / что упрощено
  gap?: number; // фиксированная пауза перед сценой, с (без растяжки до 30:00)
  tight?: boolean; // короткие паузы между репликами без растяжки (динамичное вступление)
  lines: Line[];
};
