import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Muslim Kids — Infinite Discovery design tokens
export const COLORS = {
  deep: "#081426",
  gold: "#F4C66A",
  turquoise: "#58D6DB",
  white: "#F8F7F3",
  green: "#4EBB84",
  sky: "#A9E5F2",
};

// Nunito (OFL, public/fonts/OFL.txt): rounded, friendly, full Cyrillic. Loaded from the repo.
export const FONT = "Nunito";
loadFont({ family: FONT, url: staticFile("fonts/Nunito-Variable.ttf"), weight: "200 1000", format: "truetype" });
