import React from "react";
import { OrnamentGlow } from "../components/Ornament";
import { smoothstep } from "../engines/math";

// Scene 6 — a calm pause: no flashes, only the drawn ornament and the translation of meaning.
export const QuranScene: React.FC<{ t: number }> = ({ t }) => (
  <OrnamentGlow opacity={smoothstep(48.5, 50.5, t) * (1 - smoothstep(54.4, 55.4, t))} />
);
