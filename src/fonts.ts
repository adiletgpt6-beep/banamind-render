import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Nunito (OFL, public/fonts/OFL.txt) — округлый дружелюбный шрифт с полной
// кириллицей, включая кыргызские Ү ү, Ө ө, Ң ң. Файл лежит в репозитории,
// поэтому рендер не зависит от доступа к Google Fonts.
export const fontFamily = "Nunito";

loadFont({
  family: fontFamily,
  url: staticFile("fonts/Nunito-Variable.ttf"),
  weight: "200 1000",
  format: "truetype",
});
