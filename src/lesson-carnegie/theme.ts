// Палитра фильма BM-025 «Как завоёвывать друзей и оказывать влияние на людей».
// «Мастерская разговора»: тёплые освещённые фоны (никогда не чёрный кадр),
// деревянный мост между двумя сторонами разговора и четыре тематических акцента —
// по четырём частям книги Карнеги. По цвету зритель узнаёт часть в любой сцене.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#2a1f2d",
  inkSoft: "#5e4b5c",
  paper: "#fff6e8",
  paperDark: "#f0dcc0",
  cream: "#fdebd0",
  yellow: "#ffd23f",
  gold: "#f2b636",
  red: "#e5484d", // только «обрыв» и зачёркивания, без драматизма
  green: "#36b37e",
  white: "#ffffff",
  skin: "#f2d5bb",
  skinShade: "#e0b896",
  wood: "#b97a4a",
  woodDark: "#8a5532",
  woodLight: "#d9a06a",
  rope: "#e8c48a",
  cliff: "#6e5a8a",
  cliffTop: "#8f7bb0",
  sky: "#ffe2b8",
};

// Четыре части книги — акцент, глубокий и светлый тон.
export type BookPart = 1 | 2 | 3 | 4;
export const BOOK_PARTS: Record<BookPart, { name: string; short: string; color: string; deep: string; light: string }> = {
  1: { name: "Основные методы обращения с людьми", short: "Основа", color: "#ff7a59", deep: "#d4512f", light: "#ffd6c7" },
  2: { name: "Шесть способов понравиться людям", short: "Интерес", color: "#2fbf9b", deep: "#178a6e", light: "#c4f1e3" },
  3: { name: "Как склонить людей к вашей точке зрения", short: "Разногласие", color: "#ffb02e", deep: "#d07f00", light: "#ffe7bd" },
  4: { name: "Как говорить об ошибках и сохранить достоинство", short: "Ошибки", color: "#e0679a", deep: "#b23f72", light: "#fbd3e3" },
};

// Смысловые участки фильма: подпись вверху, фон и часть книги.
export const SECTIONS = {
  cold: { title: "Мастерская разговора", book: 0, bg: ["#5b3a5e", "#c9785a"] },
  frame: { title: "Мастерская разговора", book: 0, bg: ["#5a3f6e", "#d08a62"] },
  crit: { title: "Часть 1 · Почему обвинение вызывает защиту", book: 1, bg: ["#6a3a4a", "#d8795a"] },
  appr: { title: "Часть 1 · Искренняя оценка и чужой интерес", book: 1, bg: ["#6e4048", "#e08f5e"] },
  att: { title: "Часть 2 · Интерес, имя и внимание", book: 2, bg: ["#2f4f5e", "#4fa88e"] },
  listen: { title: "Часть 2 · Слушать и замечать важное", book: 2, bg: ["#2d5560", "#5bb59a"] },
  argue: { title: "Часть 3 · Спор без унижения", book: 3, bg: ["#5e4630", "#d0943e"] },
  coop: { title: "Часть 3 · Вопросы и сотрудничество", book: 3, bg: ["#5a4a34", "#c99a48"] },
  motive: { title: "Часть 3 · Мотивы, наглядность, вызов", book: 3, bg: ["#5a3f36", "#d08a4a"] },
  mistake: { title: "Часть 4 · Как говорить об ошибке", book: 4, bg: ["#5a3450", "#c86a8e"] },
  grow: { title: "Часть 4 · Поддержка прогресса", book: 4, bg: ["#56355a", "#d07d98"] },
  end: { title: "Мастерская разговора · выводы", book: 0, bg: ["#5a4070", "#e0a26a"] },
} as const;
export type SectionId = keyof typeof SECTIONS;
export const PART_BG: Record<string, [string, string]> = Object.fromEntries(Object.entries(SECTIONS).map(([k, v]) => [k, [v.bg[0], v.bg[1]]]));
export const accentOf = (part: string) => {
  const b = SECTIONS[part as SectionId]?.book ?? 0;
  return b ? BOOK_PARTS[b as BookPart] : { name: "", short: "", color: C.yellow, deep: C.gold, light: "#fff1c2" };
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const DISPLAY = "Rubik, Nunito, 'Segoe UI', sans-serif";
