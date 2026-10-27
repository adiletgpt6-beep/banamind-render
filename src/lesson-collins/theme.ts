// Палитра фильма BM-037 «Двигатель прорыва» (по книге Джима Коллинза «От хорошего к великому»).
// Светлая инженерная мастерская: тёплая бумага, чертёжная сетка, чёткие тёмные контуры.
// Три узла механизма — три акцента: ЛЮДИ (бирюзовый), ЯСНОСТЬ (коралловый),
// ПОСЛЕДОВАТЕЛЬНОСТЬ (фирменный жёлтый). По цвету зритель узнаёт узел в любой сцене.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1d2333",
  inkSoft: "#4a5468",
  line: "#2b3245",
  paper: "#fffaf0",
  paperDark: "#f1e6d0",
  white: "#ffffff",
  yellow: "#ffd23f",
  gold: "#f2b636",
  teal: "#1fb5a6",
  tealDeep: "#0f8a7e",
  tealLight: "#c9f1ec",
  coral: "#ff7a59",
  coralDeep: "#d4512f",
  coralLight: "#ffd9cc",
  indigo: "#4b55c8",
  indigoLight: "#d9dcff",
  red: "#e5484d",
  green: "#2fa86f",
  steel: "#8b97ad",
  steelDark: "#5d6880",
  steelLight: "#d9dfea",
  wood: "#c58b54",
  woodDark: "#8a5532",
  woodLight: "#d9a06a",
  rope: "#e8c48a",
  cliff: "#6e7fa8",
  cliffTop: "#90a2c8",
  skin: "#f2d5bb",
  skinShade: "#e0b896",
};

// Три узла «двигателя прорыва».
export type Node = "people" | "clarity" | "action";
export const NODES: Record<Node, { name: string; color: string; deep: string; light: string }> = {
  people: { name: "Люди", color: C.teal, deep: C.tealDeep, light: C.tealLight },
  clarity: { name: "Ясность", color: C.coral, deep: C.coralDeep, light: C.coralLight },
  action: { name: "Последовательность", color: C.gold, deep: "#c98a00", light: "#fff0bf" },
};

// Смысловые участки фильма: подпись вверху, фон и узел механизма.
export const SECTIONS = {
  cold: { title: "Два маховика", node: null, bg: ["#fff7e6", "#ffe7c2"] },
  study: { title: "Как искали ответ", node: null, bg: ["#f2f7fb", "#dcebf5"] },
  lead: { title: "Люди · Лидер 5 уровня", node: "people", bg: ["#effaf8", "#d3f0ea"] },
  who: { title: "Люди · Сначала кто", node: "people", bg: ["#eefaf6", "#cdeee6"] },
  facts: { title: "Ясность · Суровые факты", node: "clarity", bg: ["#fff4ef", "#ffe0d3"] },
  hedge: { title: "Ясность · Три круга", node: "clarity", bg: ["#fff3ee", "#ffdcd0"] },
  disc: { title: "Последовательность · Дисциплина", node: "action", bg: ["#fffbea", "#fff0c4"] },
  tech: { title: "Последовательность · Технологии", node: "action", bg: ["#fffaea", "#ffeec0"] },
  fly: { title: "Маховик и порочный круг", node: "action", bg: ["#fff9e8", "#ffe9b8"] },
  end: { title: "Двигатель прорыва · итоги", node: null, bg: ["#f6f3ff", "#e3defa"] },
} as const;
export type SectionId = keyof typeof SECTIONS;
export const PART_BG: Record<string, [string, string]> = Object.fromEntries(Object.entries(SECTIONS).map(([k, v]) => [k, [v.bg[0], v.bg[1]]]));
export const accentOf = (part: string) => {
  const n = SECTIONS[part as SectionId]?.node as Node | null | undefined;
  return n ? NODES[n] : { name: "", color: C.indigo, deep: "#323b9c", light: C.indigoLight };
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const DISPLAY = "Rubik, Nunito, 'Segoe UI', sans-serif";
