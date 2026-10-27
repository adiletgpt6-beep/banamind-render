import { continueRender, delayRender, staticFile } from "remotion";
import { FONT } from "./theme";

// Шрифты лежат в public/muslim-kids/fonts (OFL), рендер не зависит от сети.
// Каждое начертание — два файла (латиница + кириллица) с unicode-range.
const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const CYRILLIC = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116";
const ARABIC =
  "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC";

type Face = { family: string; file: string; weight: number; range: string };
const faces: Face[] = [
  ...[400, 500, 600, 700, 800].flatMap((w) => [
    {
      family: FONT.body,
      file: `inter-latin-${w}-normal.woff2`,
      weight: w,
      range: LATIN,
    },
    {
      family: FONT.body,
      file: `inter-cyrillic-${w}-normal.woff2`,
      weight: w,
      range: CYRILLIC,
    },
  ]),
  ...[500, 700].flatMap((w) => [
    {
      family: FONT.display,
      file: `unbounded-latin-${w}-normal.woff2`,
      weight: w,
      range: LATIN,
    },
    {
      family: FONT.display,
      file: `unbounded-cyrillic-${w}-normal.woff2`,
      weight: w,
      range: CYRILLIC,
    },
  ]),
  ...[400, 700].map((w) => ({
    family: FONT.arabic,
    file: `amiri-arabic-${w}-normal.woff2`,
    weight: w,
    range: ARABIC,
  })),
];

let started = false;
export const loadMuslimKidsFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Muslim Kids fonts");
  Promise.all(
    faces.map(async (f) => {
      const face = new FontFace(
        f.family,
        `url(${staticFile(`muslim-kids/fonts/${f.file}`)}) format("woff2")`,
        {
          weight: String(f.weight),
          unicodeRange: f.range,
        },
      );
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
