// Палитра фильма BM-031 «Гарри Поттер и философский камень» — оригинальное
// критическое эссе BanaMind. Рамка фильма — «Мастерская решений»: на столе банана
// компас с четырьмя направлениями (происхождение, ожидания, страх, поступок).
// Это наша аналитическая метафора, а не предмет из романа; никаких гербов,
// цветов факультетов, замков или фирменной графики франшизы.
// Светлые тёплые фоны (никогда не чёрный кадр), чёткие цветные точки.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2240",
  inkSoft: "#4e5378",
  paper: "#fff8ec",
  paperDark: "#f1e2c8",
  cream: "#fdeccf",
  yellow: "#ffd23f",
  gold: "#f2b636",
  red: "#e5484d",
  green: "#36b37e",
  white: "#ffffff",
  wood: "#b97a4a",
  woodDark: "#8a5532",
  woodLight: "#dba56f",
  brass: "#e2b04a",
  brassDark: "#a8792a",
  sky: "#ffe2b8",
};

// Четыре стороны компаса — четыре силы, которые тянут стрелку.
export type Dir = "origin" | "expect" | "fear" | "act";
export const DIRS: Record<Dir, { name: string; short: string; color: string; deep: string; light: string; angle: number }> = {
  origin: { name: "Происхождение", short: "Откуда я", color: "#ff7a59", deep: "#cf4f2f", light: "#ffd6c7", angle: 0 },
  expect: { name: "Ожидания", short: "Что ждут другие", color: "#4f8df5", deep: "#2a63c4", light: "#cfe0ff", angle: 90 },
  fear: { name: "Страх", short: "Чего я боюсь", color: "#9a6bff", deep: "#6d43d0", light: "#e3d6ff", angle: 180 },
  act: { name: "Поступок", short: "Что я выбираю", color: "#2fbf9b", deep: "#178a6e", light: "#c4f1e3", angle: 270 },
};

// Смысловые участки фильма: подпись вверху, фон и направление компаса.
export const SECTIONS = {
  cold: { title: "Мастерская решений", dir: null, bg: ["#3d3f78", "#c47a62"] },
  frame: { title: "Мастерская решений", dir: null, bg: ["#3f4580", "#cf8a66"] },
  origin: { title: "Происхождение · дом, где ребёнка не видно", dir: "origin", bg: ["#5e3a52", "#d47a5c"] },
  fame: { title: "Ожидания · имя, которое знают все", dir: "expect", bg: ["#2f4a7a", "#5f9ad8"] },
  choice: { title: "Поступок · просьба вместо приговора", dir: "act", bg: ["#2b5a5c", "#4fb08e"] },
  trust: { title: "Поступок · дружба и правила", dir: "act", bg: ["#2e5560", "#5bb59a"] },
  judge: { title: "Ожидания · ошибки наблюдателя", dir: "expect", bg: ["#33416e", "#6f8fd0"] },
  mirror: { title: "Страх и желание · зеркало", dir: "fear", bg: ["#3e3470", "#9a7ad8"] },
  pressure: { title: "Страх · шаги под давлением", dir: "fear", bg: ["#46336a", "#b07ac8"] },
  reveal: { title: "Первый финал · два лица", dir: "act", bg: ["#5a4232", "#d0944a"] },
  end: { title: "Мастерская решений · выводы", dir: null, bg: ["#3f4a80", "#e0a26a"] },
} as const;
export type SectionId = keyof typeof SECTIONS;
export const PART_BG: Record<string, [string, string]> = Object.fromEntries(Object.entries(SECTIONS).map(([k, v]) => [k, [v.bg[0], v.bg[1]]]));
export const accentOf = (part: string) => {
  const d = SECTIONS[part as SectionId]?.dir as Dir | null | undefined;
  return d ? DIRS[d] : { name: "", short: "", color: C.yellow, deep: C.gold, light: "#fff1c2", angle: 0 };
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const DISPLAY = "Rubik, Nunito, 'Segoe UI', sans-serif";
