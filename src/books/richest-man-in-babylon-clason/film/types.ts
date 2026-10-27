import type { MoodName, PoseName } from "../../../banana-host";

// Главы фильма «Десятая монета»: начало, шесть историй-правил и возвращение к столу.
export type ChapterId = "c00" | "c01" | "c02" | "c03" | "c04" | "c05" | "c06" | "c07" | "c08";

// Где стоит банан: по центру крупно, слева/справа от схемы, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

export type Line = {
  id: string;
  text: string; // то, что слышит и читает зритель (субтитры)
  say?: string; // особое произношение для синтеза (ударения в именах)
  pose?: PoseName;
  mood?: MoodName;
  pause?: number; // доп. пауза после реплики, с
  wait?: number; // пауза «подумайте» после вопроса, с (спокойная карточка, без таймера)
  expr?: boolean; // более эмоциональная интонация
};

export type Visual = { kind: string; [key: string]: unknown };

export type Scene = {
  id: string;
  title: string; // смысловая функция сцены (сценарий, раскадровка)
  chapter: ChapterId;
  host: HostSpot;
  walk?: HostSpot; // банан проходит по сцене к другому месту
  glasses?: boolean; // очки «профессора» — для разборов и оговорок
  visual: Visual;
  // опоры в источнике: «pNN:Lx[–Ly]» — part-NN.txt, локальные строки (карта → исходные строки в
  // line-index.csv и SOURCE_MAP.md) или «анализ» (объяснение BanaMind, наш стол-метафора)
  src: string[];
  srcNote?: string; // что взято из книги, что — комментарий BanaMind
  gap?: number; // фиксированная пауза перед сценой, с
  tight?: boolean; // короткие паузы между репликами (динамичное вступление)
  pilot?: boolean; // сцена входит в тестовый пилот 30–60 с
  lines: Line[];
};
