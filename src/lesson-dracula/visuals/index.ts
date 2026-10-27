// Реестр анимированных сцен BM-033: kind из сценария → компонент.
import type React from "react";
import { BigQuestion, Compare, DotImage, Finale, LetterQuote, Limits, Quote, Steps } from "./core";
import type { VisualProps } from "./kit";
import {
  Boxes, Bureau, CastleScene, Chorus, Clinic, ClippingScene, ColdOpen, DiaryScene, Edition, Exchange, Explain, FireScene, Flasks,
  Intercept, Letters, MapScene, Memo, Scales, Secrets, Seal, Sheets, ShipScene, TechTable, TelegraphScene, TypewriterScene, Voiceless, Wall, WindowScene,
} from "./scenes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  coldOpen: ColdOpen,
  bigQuestion: BigQuestion,
  edition: Edition,
  bureau: Bureau,
  limits: Limits,
  map: MapScene,
  diary: DiaryScene,
  explain: Explain,
  quote: Quote,
  letter: LetterQuote,
  castle: CastleScene,
  letters: Letters,
  intercept: Intercept,
  dots: DotImage,
  compare: Compare,
  chorus: Chorus,
  ship: ShipScene,
  boxes: Boxes,
  secrets: Secrets,
  seal: Seal,
  clinic: Clinic,
  telegraph: TelegraphScene,
  clipping: ClippingScene,
  window: WindowScene,
  steps: Steps,
  flasks: Flasks,
  exchange: Exchange,
  typewriter: TypewriterScene,
  sheets: Sheets,
  techTable: TechTable,
  fire: FireScene,
  wall: Wall,
  memo: Memo,
  voiceless: Voiceless,
  scales: Scales,
  finale: Finale,
};
