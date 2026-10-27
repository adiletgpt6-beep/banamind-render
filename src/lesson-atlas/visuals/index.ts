// Реестр анимированных схем фильма BM-006: kind из сценария → компонент.
import type React from "react";
import { FirstRun, GaltAnswer, Glass, Migration, Money, Naming, ProfitChart, SanSebastian, Express, Volunteers } from "./choice";
import { Melody, Quitter, RedSignal, Statue } from "./dagny";
import { Cards, Debate, Scales } from "./generic";
import { FragmentBook, Goodbye, Hello, HookCity, Trailer } from "./intro";
import type { VisualProps } from "./kit";
import { BraceletScene, BraceletSwap, Deal, Guilt, Pour, RisePath, WorldMovers } from "./rearden";
import { BarTable, BridgeDesign, FairShare, Institute, PotterFork, Result, Rumor, RuleVote } from "./rules";
import { Cast, Decay, GaltPhrase, Kiosk } from "./world";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hookCity: HookCity,
  fragmentBook: FragmentBook,
  trailer: Trailer,
  hello: Hello,
  goodbye: Goodbye,
  galtPhrase: GaltPhrase,
  decay: Decay,
  kiosk: Kiosk,
  cast: Cast,
  redSignal: RedSignal,
  debate: Debate,
  scales: Scales,
  cards: Cards,
  quitter: Quitter,
  melody: Melody,
  statue: Statue,
  pour: Pour,
  risePath: RisePath,
  bracelet: BraceletScene,
  braceletSwap: BraceletSwap,
  guilt: Guilt,
  deal: Deal,
  worldMovers: WorldMovers,
  barTable: BarTable,
  ruleVote: RuleVote,
  result: Result,
  bridgeDesign: BridgeDesign,
  fairShare: FairShare,
  potterFork: PotterFork,
  rumor: Rumor,
  institute: Institute,
  sanSebastian: SanSebastian,
  money: Money,
  express: Express,
  naming: Naming,
  volunteers: Volunteers,
  profitChart: ProfitChart,
  galtAnswer: GaltAnswer,
  firstRun: FirstRun,
  glass: Glass,
  migration: Migration,
};
