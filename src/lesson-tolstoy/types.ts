import type { MoodName, PoseName } from "../banana-host";

// Части фильма «Масштаб выбора» по «Войне и миру»: от салона 1805 года через
// судьбы героев и войну 1812 года к спору эпилога о том, кто движет историей.
export type PartId =
  | "intro"
  | "society"
  | "andrei"
  | "pierre"
  | "natasha"
  | "family"
  | "borodino"
  | "moscow"
  | "captivity"
  | "generals"
  | "recovery"
  | "epilogue"
  | "end";

// Слой карты «Масштаб выбора», который сейчас открыт:
// person — личный выбор (силуэты, предметы, жесты),
// war — переживание войны (карты, геометрия событий),
// history — историческая перспектива (сеть ярких точек-решений).
export type Layer = "person" | "war" | "history";

// Где стоит банан: по центру крупно, слева/справа от схемы, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

// Чей голос звучит и какой статус у утверждения — зритель видит метку в углу кадра:
// story — событие романа (фабула, рассказ повествователя),
// hero — мысль или слова персонажа (не обязательно мнение Толстого),
// essay — Толстой-мыслитель: авторское рассуждение (отступления, эпилог II),
// history — исторический факт (даты, места), отличаем от трактовки романа,
// note — перевод французской речи по примечаниям издания,
// map — схема BanaMind: художественная реконструкция, не карта сражения,
// film — вывод и вопрос фильма BanaMind (наша интерпретация).
export type Claim = "story" | "hero" | "essay" | "history" | "note" | "map" | "film";

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
  layer: Layer;
  host: HostSpot;
  claim: Claim;
  visual: Visual;
  // источник: «part-06:L120–L140» — строки TXT пакета books/500-series/sources/BM-030;
  // «схема» — оригинальный объясняющий образ фильма, «фильм» — вывод/вопрос BanaMind,
  // «история» — общеизвестный исторический факт вне романа (HISTORICAL_FRAME.md)
  src: string[];
  srcNote?: string; // что именно взято из книги / что упрощено / чей голос
  gap?: number; // фиксированная пауза перед сценой, с
  tight?: boolean; // короткие паузы между репликами без растяжки (динамичное вступление)
  lines: Line[];
};
