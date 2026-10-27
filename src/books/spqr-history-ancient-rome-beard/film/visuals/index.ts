// Реестр анимированных сцен BM-040: kind из сценария → компонент.
import type React from "react";
import { BigQuestion, Compare, DotImage, Finale, Limits, Quote, Steps } from "./core";
import type { VisualProps } from "./kit";
import { Era, Gate, Letters, Lives, MapScene, Matrix, Power, Rings, Speech, Status, Workshop } from "./rome";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  quote: Quote,
  bigQuestion: BigQuestion,
  dots: DotImage,
  compare: Compare,
  limits: Limits,
  steps: Steps,
  finale: Finale,
  gate: Gate,
  workshop: Workshop,
  status: Status,
  era: Era,
  map: MapScene,
  rings: Rings,
  matrix: Matrix,
  power: Power,
  speech: Speech,
  letters: Letters,
  lives: Lives,
};
