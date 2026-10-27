// Реестр анимированных сцен BM-026: kind из сценария → компонент.
import type React from "react";
import { BigQuestion, Compare, DayLeak, DotImage, Finale, LetterQuote, Limits, Quote, Steps, Workshop } from "./core";
import type { VisualProps } from "./kit";
import { CrowdPull, Dignity, EnoughLadder, FlawLamp, FogFacts, FriendsBridge, GoodScale, NoiseCalm, Precepts, Review, Scatter, Storm, TimeBox } from "./themes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  dayLeak: DayLeak,
  workshop: Workshop,
  letter: LetterQuote,
  quote: Quote,
  bigQuestion: BigQuestion,
  dots: DotImage,
  compare: Compare,
  limits: Limits,
  steps: Steps,
  finale: Finale,
  timeBox: TimeBox,
  scatter: Scatter,
  flaw: FlawLamp,
  crowd: CrowdPull,
  fog: FogFacts,
  ladder: EnoughLadder,
  friends: FriendsBridge,
  dignity: Dignity,
  noise: NoiseCalm,
  review: Review,
  precepts: Precepts,
  storm: Storm,
  goodScale: GoodScale,
};
