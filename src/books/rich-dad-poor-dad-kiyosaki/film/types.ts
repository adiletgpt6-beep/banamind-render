import type { MoodName, PoseName } from "../../../banana-host";

// Главы фильма «Путь одной монеты»: вступление, два папы, шесть уроков, препятствия, шаги, итог.
export type ChapterId = "c00" | "c01" | "c02" | "c03" | "c04" | "c05" | "c06" | "c07" | "c08" | "c09" | "c10";

// Где стоит банан: по центру крупно, слева/справа от схемы, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

export type Line = {
  id: string;
  text: string; // то, что слышит и читает зритель (субтитры)
  say?: string; // особое произношение для синтеза (ударения, имена)
  pose?: PoseName;
  mood?: MoodName;
  pause?: number; // доп. пауза после реплики, с
  wait?: number; // пауза «подумайте» после вопроса, с (спокойная карточка, без таймера)
  expr?: boolean; // более эмоциональная интонация
};

export type Visual = { kind: string; [key: string]: unknown };

export type Scene = {
  id: string;
  title: string; // смысловой блок (сценарий, раскадровка)
  chapter: ChapterId;
  host: HostSpot;
  // банан идёт по сцене: из своего места в другое (участник событий, а не «говорящая голова»)
  walk?: HostSpot;
  glasses?: boolean; // очки «профессора» — для разборов-оговорок
  visual: Visual;
  // опоры в источнике: «part-NN:Lxxx[–Lyyy]» (books/500-series/sources/BM-023) или «анализ»
  src: string[];
  srcNote?: string; // что взято из книги, что — комментарий BanaMind
  gap?: number; // фиксированная пауза перед сценой, с
  tight?: boolean; // короткие паузы между репликами (динамичное вступление)
  pilot?: boolean; // сцена входит в тестовый пилот 30–60 с
  lines: Line[];
};
