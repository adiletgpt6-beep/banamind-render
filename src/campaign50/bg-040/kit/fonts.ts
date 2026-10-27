import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Caveat (OFL, public/assets/campaign50/bg-040/fonts/OFL-Caveat.txt) —
// рукописный шрифт с кыргызскими Ү ү, Ө ө, Ң ң: «почерк» мамы на листах.
// Интерфейс и титры — Nunito (src/fonts.ts).
export const handFamily = "BG40Caveat";

loadFont({
  family: handFamily,
  url: staticFile("assets/campaign50/bg-040/fonts/Caveat-Variable.ttf"),
  weight: "400 700",
  format: "truetype",
});
