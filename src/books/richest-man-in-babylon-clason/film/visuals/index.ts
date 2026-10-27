// Реестр анимированных сцен BM-036: kind из сценария → компонент.
import type React from "react";
import { Bansir, Dream, EarnKeep, Friends, Stream, TwoPurses } from "./ch1";
import { Advice, Azmur, Basket, NineTen, PayAll, Pebbles, Scribe, Tree } from "./ch2";
import { Classroom, DonkeyLoad, GrowingNeeds, Weeds, WishList } from "./ch3";
import { BagTablet, ChestLid, FiveLaws, OxDonkey, RodanGold, RodanMath, RulesMap, ThreeBags, Traps, Walls } from "./ch4";
import { Decide, Delay, FoundPurse, Procrastinator, SheepNight } from "./ch5";
import { Creditors, DebtSteps, DebtTablet, Desert, EnemiesFriends, Letter, Months, Structure, Tarkad, YellowStone } from "./ch6";
import { AradGula, Bakery, Canal, Caravan, ChainField, Freedom, HoneyCake, Limits, Megiddo, Rings, SixRules, Skill } from "./ch7";
import { Babylon, ChapterCard, ColdOpen, EndCard, Finale, Hello } from "./intro";
import type { VisualProps } from "./kit";
import { Table } from "./table";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  coldOpen: ColdOpen,
  table: Table,
  babylon: Babylon,
  hello: Hello,
  chapterCard: ChapterCard,
  bansir: Bansir,
  twoPurses: TwoPurses,
  dream: Dream,
  stream: Stream,
  earnKeep: EarnKeep,
  friends: Friends,
  scribe: Scribe,
  payAll: PayAll,
  basket: Basket,
  nineTen: NineTen,
  azmur: Azmur,
  advice: Advice,
  pebbles: Pebbles,
  tree: Tree,
  classroom: Classroom,
  growingNeeds: GrowingNeeds,
  weeds: Weeds,
  wishList: WishList,
  donkeyLoad: DonkeyLoad,
  rulesMap: RulesMap,
  bagTablet: BagTablet,
  traps: Traps,
  fiveLaws: FiveLaws,
  threeBags: ThreeBags,
  rodanGold: RodanGold,
  oxDonkey: OxDonkey,
  rodanMath: RodanMath,
  chestLid: ChestLid,
  walls: Walls,
  foundPurse: FoundPurse,
  delay: Delay,
  procrastinator: Procrastinator,
  sheepNight: SheepNight,
  decide: Decide,
  tarkad: Tarkad,
  yellowStone: YellowStone,
  desert: Desert,
  enemiesFriends: EnemiesFriends,
  creditors: Creditors,
  debtTablet: DebtTablet,
  months: Months,
  debtSteps: DebtSteps,
  letter: Letter,
  structure: Structure,
  caravan: Caravan,
  chainField: ChainField,
  megiddo: Megiddo,
  bakery: Bakery,
  honeyCake: HoneyCake,
  aradGula: AradGula,
  canal: Canal,
  freedom: Freedom,
  rings: Rings,
  skill: Skill,
  sixRules: SixRules,
  limits: Limits,
  finale: Finale,
  endCard: EndCard,
};
