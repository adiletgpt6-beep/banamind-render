// Реестр анимированных сцен BM-019: kind из сценария → компонент.
import type React from "react";
import type { VisualProps } from "./kit";
import { Conclusions, Crisis, DotMorph, Fates, Finale, Letter, Pemberley, Reread } from "./late";
import { Ballroom, Duo, Evidence, JaneLens, SplitChoice, Storyteller, Street } from "./middle";
import { BigQuestion, DotPortraits, Estate, Lenses, QuoteCard, ScalesScene } from "./open";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  dotPortraits: DotPortraits,
  bigQuestion: BigQuestion,
  lenses: Lenses,
  quote: QuoteCard,
  estate: Estate,
  scales: ScalesScene,
  ballroom: Ballroom,
  street: Street,
  storyteller: Storyteller,
  evidence: Evidence,
  duo: Duo,
  splitChoice: SplitChoice,
  janeLens: JaneLens,
  letter: Letter,
  dotMorph: DotMorph,
  reread: Reread,
  pemberley: Pemberley,
  crisis: Crisis,
  fates: Fates,
  conclusions: Conclusions,
  finale: Finale,
};
