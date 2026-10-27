// Реестр анимированных схем: kind из сценария → компонент.
import type React from "react";
import { Goodbye, Legacy, Recap, Sieve, WeekPlan } from "./end";
import { BookIntro, HookBadge, Teaser, Trailer } from "./hook";
import { Garden, GiveFirst, Ripples } from "./human";
import { FourForces, LastDay, Orchestra, Route, SmallSteps, StoryFrame, TitleFades, VictimSwitch } from "./idea";
import { Acronym, Authenticity, Courage, Ethics, Innovation, Mastery, Practice } from "./image";
import type { VisualProps } from "./kit";
import { Athlete, Cleanup, HomeThings, MastBattery, MorningHour, StainedGlass } from "./shine";
import { Candor, ComfortZone, Priorities, Respond, SkierScene, WallScene } from "./spark";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hookBadge: HookBadge,
  teaser: Teaser,
  trailer: Trailer,
  bookIntro: BookIntro,
  storyFrame: StoryFrame,
  route: Route,
  titleFades: TitleFades,
  orchestra: Orchestra,
  fourForces: FourForces,
  victimSwitch: VictimSwitch,
  lastDay: LastDay,
  smallSteps: SmallSteps,
  acronym: Acronym,
  innovation: Innovation,
  mastery: Mastery,
  authenticity: Authenticity,
  courage: Courage,
  ethics: Ethics,
  practice: Practice,
  skier: SkierScene,
  comfortZone: ComfortZone,
  candor: Candor,
  priorities: Priorities,
  wall: WallScene,
  respond: Respond,
  garden: Garden,
  giveFirst: GiveFirst,
  ripples: Ripples,
  athlete: Athlete,
  stainedGlass: StainedGlass,
  morningHour: MorningHour,
  cleanup: Cleanup,
  mastBattery: MastBattery,
  homeThings: HomeThings,
  legacy: Legacy,
  sieve: Sieve,
  weekPlan: WeekPlan,
  recap: Recap,
  goodbye: Goodbye,
};
