// Реестр анимированных сцен BM-034: kind из сценария → компонент.
import type React from "react";
import type { VisualProps } from "./kit";
import { BookIntro, Chain, DeskScene, Dialog, Hook, Ladder, Loop, OpVsGame, Strokes } from "./scenes1";
import { Ego, NewIdea, NotLabels, Pause, Queue, Trans, Verdict, YesButTitle } from "./scenes2";
import { Bill, CardsScene, CareHelp, CaughtName, Contract, GoodScale, HelpLoop, NoMind, Party, Poker } from "./scenes3";
import { Between, Birds, Drivers, SmallTalk, Spontaneity, Takeaways, Three } from "./scenes4";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hook: Hook,
  desk: DeskScene,
  bookIntro: BookIntro,
  strokes: Strokes,
  dialog: Dialog,
  ladder: Ladder,
  opVsGame: OpVsGame,
  chain: Chain,
  loop: Loop,
  ego: Ego,
  notLabels: NotLabels,
  trans: Trans,
  verdict: Verdict,
  yesbutTitle: YesButTitle,
  queue: Queue,
  newIdea: NewIdea,
  pause: Pause,
  bill: Bill,
  caughtName: CaughtName,
  contract: Contract,
  party: Party,
  noMind: NoMind,
  poker: Poker,
  helpLoop: HelpLoop,
  careHelp: CareHelp,
  goodScale: GoodScale,
  cards: CardsScene,
  smallTalk: SmallTalk,
  between: Between,
  three: Three,
  birds: Birds,
  drivers: Drivers,
  spontaneity: Spontaneity,
  takeaways: Takeaways,
};
