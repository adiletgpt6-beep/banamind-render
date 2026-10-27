import type { MoodName, PoseName } from "../banana-host";

export type PartId = "intro" | "cognitive" | "agrarian" | "order" | "unity" | "science" | "future" | "end";

// Где стоит банан: по центру крупно, слева/справа от схемы, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

// Что за утверждение звучит в сцене — зритель видит метку в углу кадра:
// book — Харари описывает (по книге), hypo — гипотеза/спорная версия в книге,
// opinion — философская позиция автора, model — наш учебный остров (не история),
// forecast — прогноз автора на момент написания книги (не факт 2026 года),
// film — вывод и вопрос фильма BanaMind.
export type Claim = "book" | "hypo" | "opinion" | "forecast" | "model" | "film";

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
