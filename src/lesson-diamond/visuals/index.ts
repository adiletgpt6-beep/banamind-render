// Реестр анимированных сцен BM-027: kind из сценария → компонент.
import type React from "react";
import { BigQuestion, Compare, DotImage, Finale, Limits, Quote, Steps } from "./core";
import type { VisualProps } from "./kit";
import { Cajamarca, Chain, Icons, Lab, Onion, Surplus, TwoWorlds, Yali } from "./lab";
import { Axes, Fragment, Funnel, Germs, Invention, Ladder, LensEnd, Memorial, Regions, Scales, Selection, Verdict, Writing } from "./world";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  quote: Quote,
  bigQuestion: BigQuestion,
  dots: DotImage,
  compare: Compare,
  limits: Limits,
  steps: Steps,
  finale: Finale,
  twoWorlds: TwoWorlds,
  lab: Lab,
  onion: Onion,
  cajamarca: Cajamarca,
  chain: Chain,
  surplus: Surplus,
  icons: Icons,
  yali: Yali,
  selection: Selection,
  funnel: Funnel,
  axes: Axes,
  germs: Germs,
  writing: Writing,
  invention: Invention,
  ladder: Ladder,
  scales: Scales,
  regions: Regions,
  memorial: Memorial,
  fragment: Fragment,
  lensEnd: LensEnd,
  verdict: Verdict,
};
