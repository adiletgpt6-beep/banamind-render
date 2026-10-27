// Единый облик книги «Кичинекей каарман» и игрушки-зайчика №34 — для
// предметов в руке (rig/Hand.tsx) и крупных планов (props/Book.tsx,
// props/Bunny.tsx). Одна книга и одна игрушка на весь фильм.
export const BOOK = {
  cover: "#E9896A", // коралловая обложка
  coverShade: "#CF7155",
  spine: "#C96E52",
  band: "#FFF4E2", // светлая плашка с названием
  fox: "#F08A3C", // лисёнок на обложке
  page: "#FFFDF7",
  pageShade: "#EFE7D8",
  edge: "#F1E6D2",
  title: "Кичинекей каарман",
  bookmark: "#FFD447", // жёлтая бумажная закладка
} as const;

export const BUNNY = {
  body: "#EED9CC",
  shade: "#DCC2B2",
  ear: "#F2B8B5",
  nose: "#C9746E",
  eye: "#2A2430",
} as const;
