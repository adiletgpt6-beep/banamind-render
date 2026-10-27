import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Nunito (OFL) из общего public/fonts — полная кириллица с ү, ө, ң.
export const fontFamily = "Nunito";

loadFont({
  family: fontFamily,
  url: staticFile("fonts/Nunito-Variable.ttf"),
  weight: "200 1000",
  format: "truetype",
});
