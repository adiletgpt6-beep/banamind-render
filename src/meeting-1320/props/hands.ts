// Цвета рук крупных планов (props/CloseHand.tsx) по обликам №31 — те же
// кожа, контур и рукав, что у рига (rig/looks.ts), чтобы кисть в
// предметном плане совпадала с героем в общем:
//   <CloseHand {...M13_HANDS.director} x y angle size shape />
// shade — контур пальцев (тёмный оттенок кожи, как у рига); sleeve —
// рукав; cuff — полоска у запястья (манжета рубашки из-под пиджака,
// резинка свитера). У директора дома рукава подвернуты выше кадра:
// рукав и манжета — цвета кожи (видно предплечье).
import { LOOKS, lineOf, type LookId } from "../rig/looks";

export type M13Hand = { readonly skin: string; readonly shade: string; readonly sleeve: string; readonly cuff: string };

const of = (id: LookId, sleeve?: string, cuff?: string): M13Hand => {
  const l = LOOKS[id];
  return { skin: l.skin, shade: lineOf(l.skin), sleeve: sleeve ?? l.topColor, cuff: cuff ?? l.topShade };
};

export const M13_HANDS = {
  // тёмно-синий пиджак, из-под рукава — светло-голубая манжета рубашки
  director: of("m13Director", undefined, LOOKS.m13Director.inner),
  // дома: рубашка с подвернутыми рукавами — в кадре предплечье
  directorHome: of("m13DirectorHome", LOOKS.m13DirectorHome.skin, LOOKS.m13DirectorHome.skin),
  // бирюзовый жакет, светлая манжета блузки
  assistant: of("m13Assistant", undefined, LOOKS.m13Assistant.inner),
  // школьный джемпер с резинкой на манжете
  son: of("m13Son"),
  // голубой домашний свитер
  sonHome: of("m13SonHome"),
  // сливовый жакет, светлая манжета блузки
  mom: of("m13Mom", undefined, LOOKS.m13Mom.inner),
  // серо-розовый кардиган
  momHome: of("m13MomHome"),
  // оливковый кардиган
  grandma: of("m13Grandma"),
} as const satisfies Record<string, M13Hand>;
