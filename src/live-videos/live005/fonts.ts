// Шрифты LIVE-005: Montserrat (OFL, public/assets/live/fonts) — журнальная
// типографика субтитров и надписей, с кыргызскими Ү Ө Ң. Nunito проекта
// остаётся для мелких подписей карточек.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const display = "Montserrat";

const face = (file: string, weight: string, style: "normal" | "italic") =>
  loadFont({ family: display, url: staticFile(`assets/live/fonts/${file}`), weight, style, format: "truetype" });

face("Montserrat-Bold.ttf", "700", "normal");
face("Montserrat-Black.ttf", "900", "normal");
face("Montserrat-BlackItalic.ttf", "900", "italic");
