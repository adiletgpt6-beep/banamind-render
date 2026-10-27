// Реестр анимированных схем фильма BM-010: kind из сценария → компонент.
import type React from "react";
import type { VisualProps } from "../../lesson-traktat/visuals/kit";
import { Cleantech, Finale, Founder, Futures, Limits, Recap, SevenQuestions, TwoCars } from "./final";
import { BookIntro, BubbleChart, Contrarian, GlobeTech, HookShops, LessonsFlip, Roadmap, StartupTeam, Teaser, ThinkSelf, ZeroOne } from "./intro";
import { Copycats, Expand, FourPillars, FutureCash, LastMove, MarketLies, Merge, ProfitBars, Rivals, SmallMarket, TenX, Tolstoy, TwoModels } from "./mono";
import { HillClimb, LifePath, Lottery, PowerLaw, Quadrant, SecretDoors, TwoSecrets, WhyNot, Wiles } from "./plan";
import { BuildIt, HumanMachine, Igor, Ltv, OneChannel, SalesLadder, Viral } from "./sales";
import { Foundation, Incentives, Mafia, OneThing, Spectrum, ThreeBranches, Twentieth } from "./team";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hookShops: HookShops, teaser: Teaser, bookIntro: BookIntro, roadmap: Roadmap,
  zeroOne: ZeroOne, globeTech: GlobeTech, contrarian: Contrarian, startupTeam: StartupTeam,
  bubble: BubbleChart, lessonsFlip: LessonsFlip, thinkSelf: ThinkSelf,
  profitBars: ProfitBars, twoModels: TwoModels, marketLies: MarketLies, rivals: Rivals, copycats: Copycats, merge: Merge, tolstoy: Tolstoy,
  futureCash: FutureCash, fourPillars: FourPillars, tenX: TenX, smallMarket: SmallMarket, expand: Expand, lastMove: LastMove,
  lottery: Lottery, quadrant: Quadrant, hillClimb: HillClimb, powerLaw: PowerLaw, lifePath: LifePath,
  secretDoors: SecretDoors, whyNot: WhyNot, twoSecrets: TwoSecrets, wiles: Wiles,
  foundation: Foundation, threeBranches: ThreeBranches, incentives: Incentives, mafia: Mafia, twentieth: Twentieth, oneThing: OneThing, spectrum: Spectrum,
  buildIt: BuildIt, ltv: Ltv, salesLadder: SalesLadder, viral: Viral, oneChannel: OneChannel, humanMachine: HumanMachine, igor: Igor,
  cleantech: Cleantech, sevenQuestions: SevenQuestions, twoCars: TwoCars, founder: Founder, futures: Futures, limits: Limits, recap: Recap, finale: Finale,
};
