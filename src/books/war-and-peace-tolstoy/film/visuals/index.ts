// Реестр анимированных сцен BM-030: kind из сценария → компонент.
import type React from "react";
import type { VisualProps } from "./kit";
import { CandleScene, Carts, Comet, Door, Duel, Family, Ferry, Fire, Globe, HiveScene, Inheritance, Karataev, Ladder, Ledger, Letter, OakScene, Rain, Reunion, StarsScene, Theatre, WindowScene, Ball } from "./life";
import { ArrowBreak, BigQuestion, CastBoard, Layers, PartTitle, QuoteScene, Salon, YearsAxis } from "./open";
import { Apple, Calculus, Conclusions, Freedom, Locomotive, Ram } from "./theory";
import { Battery, Borodino, Council, Gears, Generals, Glory, March, Plan, PlanVsField, Sky } from "./war";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  arrowBreak: ArrowBreak,
  layers: Layers,
  bigQuestion: BigQuestion,
  castBoard: CastBoard,
  yearsAxis: YearsAxis,
  quote: QuoteScene,
  partTitle: PartTitle,
  salon: Salon,
  family: Family,
  inheritance: Inheritance,
  glory: Glory,
  battery: Battery,
  plan: Plan,
  sky: Sky,
  duel: Duel,
  ladder: Ladder,
  ferry: Ferry,
  oak: OakScene,
  window: WindowScene,
  ball: Ball,
  theatre: Theatre,
  comet: Comet,
  ledger: Ledger,
  letter: Letter,
  apple: Apple,
  march: March,
  gears: Gears,
  borodino: Borodino,
  planVsField: PlanVsField,
  rain: Rain,
  council: Council,
  hive: HiveScene,
  carts: Carts,
  fire: Fire,
  candle: CandleScene,
  karataev: Karataev,
  stars: StarsScene,
  globe: Globe,
  generals: Generals,
  door: Door,
  reunion: Reunion,
  locomotive: Locomotive,
  ram: Ram,
  freedom: Freedom,
  calculus: Calculus,
  conclusions: Conclusions,
};
