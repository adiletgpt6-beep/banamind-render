import type { MoodName, PoseName } from "../banana-host";

// Части фильма «Окно доказательств»: масштаб окна меняется от земного горизонта
// к планетам, звёздам и галактикам, а затем возвращается к Земле.
export type PartId = "intro" | "measure" | "models" | "planets" | "travel" | "light" | "stars" | "galaxies" | "life" | "search" | "earth" | "end";

// Слой окна доказательств, который сейчас работает в сцене.
export type Layer = "observe" | "explain" | "test" | "revise";

// Где стоит банан: по центру крупно, слева/справа от схемы, маленький в углу.
export type HostSpot = "center" | "close" | "left" | "right" | "corner" | "off" | "peek";

// Чей голос и какой статус у утверждения — зритель видит метку в углу кадра:
// book — Саган пишет (книга 1980 г.; «сейчас» книги — это 1980 год),
// note — примечание переводчика или редактора русского издания (другой голос, не Саган),
// fact — наблюдение/измерение, описанное в книге и не требующее оговорок эпохи,
// model — научная модель при допущениях,
// hypo — гипотеза, оценка или открытый вопрос (не обнаружение),
// opinion — взгляд и ценностный вывод Сагана,
// update — уточнение после книги из первичного официального источника (SCIENCE_AND_ATTRIBUTION_AUDIT.md),
// lab — «Окно доказательств»: наш объясняющий образ, не сцена книги и не эксперимент,
// film — вывод и вопрос фильма BanaMind.
export type Claim = "book" | "note" | "fact" | "model" | "hypo" | "opinion" | "update" | "lab" | "film";

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
  // источник: «part-06:L120–L140» — строки TXT пакета books/500-series/sources/BM-028;
  // «окно» — оригинальная объясняющая сцена фильма, «фильм» — вывод/вопрос BanaMind,
  // «дополнение» — уточнение после книги (см. SCIENCE_AND_ATTRIBUTION_AUDIT.md)
  src: string[];
  srcNote?: string; // что именно взято из книги / что упрощено / чей голос
  gap?: number; // фиксированная пауза перед сценой, с
  tight?: boolean; // короткие паузы между репликами без растяжки (динамичное вступление)
  lines: Line[];
};
