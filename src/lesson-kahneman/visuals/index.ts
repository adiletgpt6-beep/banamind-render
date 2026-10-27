// Реестр анимированных схем фильма: kind из сценария → компонент.
import type React from "react";
import { BatBall, BatBallAnswer, BigQuestion, BookIntro, Roadmap } from "./hook";
import { MeetS1, MeetS2, NotBrain, LazyController, MullerLyer, Gorilla, CognitiveEase, Wysiati, Substitution } from "./systems";
import { SmallNumbers, AnchorWheel, AnchorDefense, Availability, Steve, Linda, Taxi, Regression, TrapsRecap } from "./traps";
import { Hindsight, LogTest, Apgar, Interview, ExpertIntuition, Planning, Premortem } from "./confidence";
import { ReferencePoint, LossAversion, ValueCurve, Mugs, Fourfold, Framing, BroadFrame } from "./choice";
import { TwoSelves, PeakEnd, ColdHand, LifeStory, Focusing, Checklist, Finale } from "./selves";
import type { VisualProps } from "./kit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  batBall: BatBall,
  batBallAnswer: BatBallAnswer,
  bigQuestion: BigQuestion,
  bookIntro: BookIntro,
  roadmap: Roadmap,
  meetS1: MeetS1,
  meetS2: MeetS2,
  notBrain: NotBrain,
  lazyController: LazyController,
  mullerLyer: MullerLyer,
  gorilla: Gorilla,
  cognitiveEase: CognitiveEase,
  wysiati: Wysiati,
  substitution: Substitution,
  smallNumbers: SmallNumbers,
  anchorWheel: AnchorWheel,
  anchorDefense: AnchorDefense,
  availability: Availability,
  steve: Steve,
  linda: Linda,
  taxi: Taxi,
  regression: Regression,
  trapsRecap: TrapsRecap,
  hindsight: Hindsight,
  logTest: LogTest,
  apgar: Apgar,
  interview: Interview,
  expertIntuition: ExpertIntuition,
  planning: Planning,
  premortem: Premortem,
  referencePoint: ReferencePoint,
  lossAversion: LossAversion,
  valueCurve: ValueCurve,
  mugs: Mugs,
  fourfold: Fourfold,
  framing: Framing,
  broadFrame: BroadFrame,
  twoSelves: TwoSelves,
  peakEnd: PeakEnd,
  coldHand: ColdHand,
  lifeStory: LifeStory,
  focusing: Focusing,
  checklist: Checklist,
  finale: Finale,
};
