import type { MoodName, PoseName } from "../../../banana-host";

// Три слоя карты «Масштаб выбора»: личный выбор → война → история.
export type LayerId = "l1" | "l2" | "l3";
// Акты фильма (вступление, 11 смысловых блоков, выводы) — см. ACTS в theme.ts.
export type ActId = "a00" | "a01" | "a02" | "a03" | "a04" | "a05" | "a06" | "a07" | "a08" | "a09" | "a10" | "a11" | "a12";

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
  act: ActId;
  host: HostSpot;
  visual: Visual;
  // опоры в источнике: «part-NN:Lxxx[–Lyyy]» (books/500-series/sources/BM-030) или «анализ»
  src: string[];
  srcNote?: string; // что взято из книги, что — авторская интерпретация BanaMind
  gap?: number; // фиксированная пауза перед сценой, с
  tight?: boolean; // короткие паузы между репликами (динамичное вступление)
  pilot?: boolean; // сцена входит в тестовый пилот 30–60 с
  lines: Line[];
};
