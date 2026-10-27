// Реестр анимированных сцен BM-025: kind из сценария → компонент.
import type React from "react";
import { Compare, DotsQ, Duo, Phrase, Rule } from "./generic";
import type { VisualProps } from "./kit";
import { BigQuestion, BookIntro, BookParts, ColdArgue, Finale, Outro, PartTitle, Practice, Workshop } from "./open";
import { ButAnd, Cards, FaceSave, Josephine, Questions } from "./part4";
import { Banquet, Bonfire, Chalk, Jars, Rex, Sketches, SunWind, YesSteps } from "./part3";
import { Boats, CoatShop, Dinner, ListenEar, NameStory, NameTrick, Nurse, PostOffice } from "./part2";
import { Coins, FatherForgets, Fishing, Helmets, Hoover, Hotel, Letter, Ribbons, Roses } from "./part1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  coldArgue: ColdArgue,
  bigQuestion: BigQuestion,
  bookIntro: BookIntro,
  bookParts: BookParts,
  workshop: Workshop,
  partTitle: PartTitle,
  finale: Finale,
  practice: Practice,
  outro: Outro,
  duo: Duo,
  compare: Compare,
  rule: Rule,
  phrase: Phrase,
  dotsQ: DotsQ,
  helmets: Helmets,
  letter: Letter,
  hoover: Hoover,
  fatherForgets: FatherForgets,
  ribbons: Ribbons,
  coins: Coins,
  roses: Roses,
  fishing: Fishing,
  hotel: Hotel,
  nurse: Nurse,
  nameStory: NameStory,
  nameTrick: NameTrick,
  dinner: Dinner,
  coat: CoatShop,
  listenEar: ListenEar,
  boats: Boats,
  postOffice: PostOffice,
  banquet: Banquet,
  rex: Rex,
  sunWind: SunWind,
  yesSteps: YesSteps,
  sketches: Sketches,
  bonfire: Bonfire,
  jars: Jars,
  chalk: Chalk,
  butAnd: ButAnd,
  josephine: Josephine,
  questions: Questions,
  faceSave: FaceSave,
  cards: Cards,
};
