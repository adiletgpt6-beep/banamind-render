// Реестр анимированных сцен BM-016: kind из сценария → компонент.
import type React from "react";
import { Conclusions, Court, Crossroads, Motives, Siberia, Trichinae } from "./end";
import type { VisualProps } from "./kit";
import { Banknote, CandleRoom, Coins, Duel, Family, Fever, Funeral, Mirror, Moth, Objects, Portrait, Triptych } from "./middle";
import { BigQuestion, Boulevard, City, LabMap, Letter, Pressure, ScalesScene, Stairs, Tavern, Trailer } from "./open";
import { Arithmetic, Article, Bridge, Dream, PlanBreak, QuoteCard, TwoClasses, Victims } from "./theory";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  scales: ScalesScene,
  bigQuestion: BigQuestion,
  labMap: LabMap,
  trailer: Trailer,
  city: City,
  stairs: Stairs,
  tavern: Tavern,
  letter: Letter,
  boulevard: Boulevard,
  pressure: Pressure,
  arithmetic: Arithmetic,
  article: Article,
  twoClasses: TwoClasses,
  bridge: Bridge,
  quote: QuoteCard,
  dream: Dream,
  planBreak: PlanBreak,
  victims: Victims,
  fever: Fever,
  objects: Objects,
  duel: Duel,
  portrait: Portrait,
  family: Family,
  moth: Moth,
  candle: CandleRoom,
  mirror: Mirror,
  banknote: Banknote,
  triptych: Triptych,
  coins: Coins,
  funeral: Funeral,
  motives: Motives,
  crossroads: Crossroads,
  court: Court,
  siberia: Siberia,
  trichinae: Trichinae,
  conclusions: Conclusions,
};
