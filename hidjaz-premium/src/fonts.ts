import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Cormorant Garamond (заголовки) и Montserrat (субтитры) — OFL, файлы
// в hidjaz-premium/public/fonts. Подмножество cyrillic-ext содержит
// кыргызские Ү ү, Ө ө, Ң ң, поэтому рендер не зависит от Google Fonts.
export const serif = "Cormorant Garamond";
export const sans = "Montserrat";

const RANGES = {
  latin:
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  cyrillic: "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116",
  "cyrillic-ext": "U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F",
} as const;

for (const [sub, unicodeRange] of Object.entries(RANGES)) {
  for (const weight of ["500", "600", "700"]) {
    for (const style of ["normal", "italic"]) {
      loadFont({
        family: serif,
        url: staticFile(`fonts/cormorant-garamond-${sub}-${weight}-${style}.woff2`),
        weight,
        style,
        format: "woff2",
        unicodeRange,
      });
    }
  }
  for (const weight of ["500", "600", "800"]) {
    loadFont({ family: sans, url: staticFile(`fonts/montserrat-${sub}-${weight}-normal.woff2`), weight, format: "woff2", unicodeRange });
  }
}
