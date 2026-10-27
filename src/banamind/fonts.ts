// Шрифты бренда BanaMind (OFL, public/fonts/channel/OFL-*.txt): обложки, титры, заставки.
// Для каждого начертания грузятся два файла: кириллица и латиница/знаки
// («», —, ?, цифры), чтобы надписи на обложках не зависели от системных шрифтов.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const CYR = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116";
const LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

export const FONTS = {
  display: "Russo One", // крупные заголовки-плакаты
  heavy: "Rubik", // жирные заголовки 800/900
  serif: "PT Serif", // книги, «академический» стиль
  condensed: "Oswald", // узкие подписи
  round: "Nunito", // фирменный шрифт фильма (src/fonts.ts)
};

const faces: [string, string, string][] = [
  [FONTS.display, "russo-one", "400"],
  [FONTS.heavy, "rubik", "800"],
  [FONTS.heavy, "rubik", "900"],
  [FONTS.serif, "pt-serif", "700"],
  [FONTS.condensed, "oswald", "700"],
];

export const fontsReady = Promise.all(
  faces.flatMap(([family, file, weight]) =>
    (["cyrillic", "latin"] as const).map((sub) =>
      loadFont({
        family,
        url: staticFile(`fonts/channel/${file}-${sub}-${weight}-normal.woff2`),
        weight,
        format: "woff2",
        unicodeRange: sub === "cyrillic" ? CYR : LAT,
      }),
    ),
  ),
);
