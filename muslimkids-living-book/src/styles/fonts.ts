import { continueRender, delayRender, staticFile } from "remotion";

// Шрифты лежат локально (из @fontsource) — рендер не зависит от сети.
const FACES: { family: string; file: string; weight: string; style?: string }[] = [
  { family: "Cormorant Garamond", file: "cormorant-garamond-cyrillic-500-normal.woff2", weight: "500" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-500-normal.woff2", weight: "500" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-cyrillic-600-normal.woff2", weight: "600" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-600-normal.woff2", weight: "600" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-cyrillic-700-normal.woff2", weight: "700" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-700-normal.woff2", weight: "700" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-cyrillic-500-italic.woff2", weight: "500", style: "italic" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
  { family: "Nunito", file: "nunito-cyrillic-600-normal.woff2", weight: "600" },
  { family: "Nunito", file: "nunito-latin-600-normal.woff2", weight: "600" },
  { family: "Nunito", file: "nunito-cyrillic-800-normal.woff2", weight: "800" },
  { family: "Nunito", file: "nunito-latin-800-normal.woff2", weight: "800" },
];

let loading: Promise<void> | null = null;

export const loadFonts = () => {
  if (loading) return loading;
  const handle = delayRender("Загрузка шрифтов");
  loading = Promise.all(
    FACES.map(async (f) => {
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, {
        weight: f.weight,
        style: f.style ?? "normal",
      });
      await face.load();
      document.fonts.add(face);
    }),
  ).then(() => continueRender(handle));
  return loading;
};
