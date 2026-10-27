// Реестр анимированных сцен BM-037: kind из сценария → компонент.
import type React from "react";
import { EndBars, DotGrid, Shift, YearLine } from "./charts";
import { BigWheel, Booster, CornerMap, CrawlWalkRun, Cycle, Denominator, FreeFrame, HedgeFox, Matrix, ThreeCircles, TwoLists, TyrantCurve } from "./engine";
import { Compare, Duo, Phrase, Rule } from "./generic";
import { BookCard, Bus, Criteria, FourTools, Genius, Ladder, Limits, Outro, Pairs, Pyramid, QuoteStack, Relay, Stats, Stockdale, ThreeQuestions, WindowMirror } from "./ideas";
import type { VisualProps } from "./kit";
import { BigQuestion, Engine, TwoWheels } from "./open";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  twoWheels: TwoWheels,
  bigQuestion: BigQuestion,
  engine: Engine,
  bookCard: BookCard,
  duo: Duo,
  phrase: Phrase,
  criteria: Criteria,
  ladder: Ladder,
  endBars: EndBars,
  pairs: Pairs,
  stats: Stats,
  limits: Limits,
  shift: Shift,
  pyramid: Pyramid,
  windowMirror: WindowMirror,
  relay: Relay,
  compare: Compare,
  rule: Rule,
  bus: Bus,
  dotGrid: DotGrid,
  genius: Genius,
  fourTools: FourTools,
  quoteStack: QuoteStack,
  stockdale: Stockdale,
  hedgeFox: HedgeFox,
  cornerMap: CornerMap,
  threeCircles: ThreeCircles,
  denominator: Denominator,
  cycle: Cycle,
  matrix: Matrix,
  freeFrame: FreeFrame,
  tyrantCurve: TyrantCurve,
  twoLists: TwoLists,
  crawlWalkRun: CrawlWalkRun,
  booster: Booster,
  bigWheel: BigWheel,
  yearLine: YearLine,
  threeQuestions: ThreeQuestions,
  outro: Outro,
};
