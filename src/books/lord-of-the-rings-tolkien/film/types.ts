import type { MoodName, PoseName } from "../../../banana-host";

// Залы «Музея искушений»: вступление, 11 смысловых залов и выход.
export type HallId = "h00" | "h01" | "h02" | "h03" | "h04" | "h05" | "h06" | "h07" | "h08" | "h09" | "h10" | "h11" | "h12";

// Где стоит банан: по центру крупно, слева/справа от экспоната, маленький в углу.
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
  hall: HallId;
  host: HostSpot;
  visual: Visual;
  // опоры в источнике: «part-NN:Lxxx[–Lyyy]» (books/500-series/sources/BM-018) или «анализ»
  src: string[];
  srcNote?: string; // что взято из книги, что — авторская интерпретация BanaMind
  gap?: number; // фиксированная пауза перед сценой, с
  tight?: boolean; // короткие паузы между репликами (динамичное вступление)
  pilot?: boolean; // сцена входит в тестовый пилот 30–60 с
  lines: Line[];
};
