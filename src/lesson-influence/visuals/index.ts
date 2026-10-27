// Реестр анимированных сцен BM-021: kind из сценария → компонент.
import type React from "react";
import { Conclusions, HonestFake, LastTv, Overload, Story, Toolkit, Zappa } from "./end";
import { Candy, Cola, Experiment, History } from "./exp";
import { Auction, Reviews, Versus, Waiter } from "./extra";
import type { VisualProps } from "./kit";
import { Actor, Beef, Cocreate, Cookies, Ear, Restaurant, RobotScene, Sign, Symbols, Sync, Toddler, Yawn } from "./later";
import { Camp, CardsPile, Carts, Concession, GiftVsTrick, Help, Laugh, Mirror, Party, Pool, Sky, Weather } from "./middle";
import { FilterPass, FilterTitle, ModelFinal, ModelIntro, ModelSeven } from "./model";
import { BookIntro, Buckets, Hook, Shortcut, Tape, Turquoise, TurkeyScene } from "./open";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hook: Hook,
  modelSeven: ModelSeven,
  bookIntro: BookIntro,
  turkey: TurkeyScene,
  tape: Tape,
  experiment: Experiment,
  turquoise: Turquoise,
  shortcut: Shortcut,
  buckets: Buckets,
  modelIntro: ModelIntro,
  filterTitle: FilterTitle,
  cola: Cola,
  candy: Candy,
  history: History,
  concession: Concession,
  giftVsTrick: GiftVsTrick,
  filterPass: FilterPass,
  party: Party,
  cardsPile: CardsPile,
  mirror: Mirror,
  camp: Camp,
  weather: Weather,
  sky: Sky,
  laugh: Laugh,
  carts: Carts,
  pool: Pool,
  help: Help,
  ear: Ear,
  symbols: Symbols,
  actor: Actor,
  cookies: Cookies,
  toddler: Toddler,
  beef: Beef,
  sign: Sign,
  restaurant: Restaurant,
  robot: RobotScene,
  yawn: Yawn,
  sync: Sync,
  cocreate: Cocreate,
  story: Story,
  zappa: Zappa,
  overload: Overload,
  honestFake: HonestFake,
  lastTv: LastTv,
  toolkit: Toolkit,
  conclusions: Conclusions,
  modelFinal: ModelFinal,
  versus: Versus,
  reviews: Reviews,
  waiter: Waiter,
  auction: Auction,
};
