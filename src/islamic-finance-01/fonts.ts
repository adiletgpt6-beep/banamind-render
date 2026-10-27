import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FONT } from "./theme";

// Inter (SIL OFL, public/fonts/Inter-OFL.txt) — bundled, so rendering does not
// depend on Google Fonts. Variable font covers weights 100–900.
export const fontFamily = FONT.family;

loadFont({
  family: fontFamily,
  url: staticFile("fonts/InterVariable.ttf"),
  weight: "100 900",
  format: "truetype",
});
