// Реестр иллюстраций: kind из сценария → компонент. Список ключей — visuals/list.ts.
import type React from "react";
import { Cards, Chapter, Circles, Columns, Ladder } from "./generic";
import type { VisualProps } from "./kit";
import { Antonyms, BodySoul, BookIntro, FearHope, FiveViews, Foundation, HeartScene, HookQuestions, Middle, NoBlind, ThreeParts, TreeFruit } from "./scenes1";
import { Chain, Conveyor, Harmony, Idea, Magnet, Names, NotLike, ThreeRoads, TwoWills } from "./scenes2";
import { Actions, Crossroads, Eclipse, Farmer, Hafiz, Market, Miracle, Painter, QuranChallenge, Scrolls, Spectrum, ThreeRule } from "./scenes3";
import { Breath, Field, Finale, FlameClay, Hope, Invisible, LightFireClay, OnlyRevelation, Recap, Soul, Spring, Staff, Timeline } from "./scenes4";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hookQuestions: HookQuestions,
  bookIntro: BookIntro,
  chapter: Chapter,
  threeParts: ThreeParts,
  bodySoul: BodySoul,
  foundation: Foundation,
  noBlind: NoBlind,
  middle: Middle,
  fiveViews: FiveViews,
  heart: HeartScene,
  antonyms: Antonyms,
  treeFruit: TreeFruit,
  ladder: Ladder,
  circles: Circles,
  fearHope: FearHope,
  columns: Columns,
  cards: Cards,
  magnet: Magnet,
  chain: Chain,
  harmony: Harmony,
  threeRoads: ThreeRoads,
  idea: Idea,
  names: Names,
  notLike: NotLike,
  twoWills: TwoWills,
  conveyor: Conveyor,
  actions: Actions,
  spectrum: Spectrum,
  eclipse: Eclipse,
  farmer: Farmer,
  painter: Painter,
  crossroads: Crossroads,
  market: Market,
  miracle: Miracle,
  quranChallenge: QuranChallenge,
  scrolls: Scrolls,
  hafiz: Hafiz,
  threeRule: ThreeRule,
  lightFireClay: LightFireClay,
  invisible: Invisible,
  breath: Breath,
  staff: Staff,
  flameClay: FlameClay,
  onlyRevelation: OnlyRevelation,
  field: Field,
  spring: Spring,
  timeline: Timeline,
  hope: Hope,
  soul: Soul,
  recap: Recap,
  finale: Finale,
};
