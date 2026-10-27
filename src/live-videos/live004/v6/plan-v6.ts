// LIVE-004 v6 — план = v5 (эффекты, звук, CTA без изменений) + новые
// кинетические субтитры (captions.ts). Без импортов Remotion.
import { PLAN as V5_PLAN } from "../v5/plan-v5.ts";
import { SHOWN_BY_GRAPHICS, V6_CAPTIONS } from "./captions.ts";

export const PLAN = {
  ...V5_PLAN,
  version: "v6",
  captions: { kind: "kinetic", groups: V6_CAPTIONS.length, shownByGraphics: SHOWN_BY_GRAPHICS },
} as const;
