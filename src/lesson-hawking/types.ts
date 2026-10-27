import type { MoodName, PoseName } from "../banana-host";

export type PartId = "intro" | "models" | "light" | "expand" | "quantum" | "holes" | "arrows" | "unity" | "end";

// Где стоит банан: по центру крупно, слева/справа от схемы, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

// Что за утверждение звучит в сцене — зритель видит метку в углу кадра:
// book — Хокинг пишет (по книге, эпоха издания 1988 г.),
// fact — подтверждено опытами и наблюдениями (общепринятая физика),
// model — научная модель при определённых допущениях,
// hypo — гипотеза / открытый вопрос (квантовая гравитация и т. п.),
// opinion — философская мысль автора (или автора предисловия/послесловия — названо в реплике),
// update — дополнение 2026 года, не из книги (источники — SCIENCE_UPDATE_REFERENCES.md),
// lab — наша учебная лаборатория, мысленный образ (не реальный опыт и не сцена книги),
// film — вывод и вопрос фильма BanaMind.
export type Claim = "book" | "fact" | "model" | "hypo" | "opinion" | "update" | "lab" | "film";

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
  // "лаборатория" — оригинальная учебная сцена фильма, "фильм" — вывод/вопрос BanaMind,
  // "дополнение" — внешний научный факт после книги (см. SCIENCE_UPDATE_REFERENCES.md)
  src: string[];
  srcNote?: string; // что именно взято из книги / что упрощено / откуда дополнение
  gap?: number; // фиксированная пауза перед сценой, с (без растяжки до 30:00)
  tight?: boolean; // короткие паузы между репликами без растяжки (динамичное вступление)
  lines: Line[];
};
