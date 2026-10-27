// Реестр анимированных схем: kind из сценария → компонент.
import type React from "react";
import { Bundling, Dopamine, Reframe, Supernormal, Tribe, Asch } from "./attractive";
import { Atoms, Compound, Cycling, FourLaws, HabitLoop, IdentityLayers, Plateau, SystemsGoals, Votes } from "./basics";
import { Friction, HabitLine, LockIn, Photos, Prime, TwoMinutes } from "./easy";
import { Goodbye, Recap, Sieve, WeekPlan } from "./end";
import { BookIntro, IceCubeScene, Teaser, Trailer } from "./intro";
import type { VisualProps } from "./kit";
import { Genes, Goldilocks, Review } from "./master";
import { Context, Environment, Intention, Invisible, PointCall, Stacking } from "./obvious";
import { ContractScene, Delayed, Goodhart, NeverTwice, Paperclips, Savings, Soap } from "./satisfying";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  iceCube: IceCubeScene,
  teaser: Teaser,
  trailer: Trailer,
  bookIntro: BookIntro,
  cycling: Cycling,
  compound: Compound,
  plateau: Plateau,
  systemsGoals: SystemsGoals,
  atoms: Atoms,
  identityLayers: IdentityLayers,
  votes: Votes,
  habitLoop: HabitLoop,
  fourLaws: FourLaws,
  pointCall: PointCall,
  intention: Intention,
  stacking: Stacking,
  environment: Environment,
  context: Context,
  invisible: Invisible,
  supernormal: Supernormal,
  dopamine: Dopamine,
  bundling: Bundling,
  tribe: Tribe,
  asch: Asch,
  reframe: Reframe,
  photos: Photos,
  habitLine: HabitLine,
  friction: Friction,
  prime: Prime,
  twoMinutes: TwoMinutes,
  lockIn: LockIn,
  soap: Soap,
  delayed: Delayed,
  savings: Savings,
  paperclips: Paperclips,
  neverTwice: NeverTwice,
  goodhart: Goodhart,
  contract: ContractScene,
  genes: Genes,
  goldilocks: Goldilocks,
  review: Review,
  sieve: Sieve,
  weekPlan: WeekPlan,
  recap: Recap,
  goodbye: Goodbye,
};
