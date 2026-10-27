// Реестр анимированных сцен BM-032: kind из сценария → компонент.
import type React from "react";
import type { VisualProps } from "./kit";
import { BigQuestion, Call, Core, Finale, Inherit, Jewels, Journey, Ledger, Married, Portraits, VoiceHook } from "./special";
import { Stage } from "./stage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  stage: Stage,
  voiceHook: VoiceHook,
  bigQuestion: BigQuestion,
  journey: Journey,
  ledger: Ledger,
  portraits: Portraits,
  jewels: Jewels,
  core: Core,
  inherit: Inherit,
  call: Call,
  married: Married,
  finale: Finale,
};
