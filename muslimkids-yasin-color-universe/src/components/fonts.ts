import { staticFile } from "remotion";

export const FONT = {
  manrope: "Manrope",
  unbounded: "Unbounded",
  amiri: "Amiri Quran",
} as const;

let loading: Promise<void> | null = null;

/** Загружает шрифты проекта (OFL) из public/fonts. */
export const loadFonts = () => {
  if (!loading) {
    const faces = [
      new FontFace(FONT.manrope, `url(${staticFile("fonts/Manrope.ttf")})`, { weight: "200 800" }),
      new FontFace(FONT.unbounded, `url(${staticFile("fonts/Unbounded.ttf")})`, { weight: "200 900" }),
      new FontFace(FONT.amiri, `url(${staticFile("fonts/AmiriQuran.ttf")})`, { weight: "400" }),
    ];
    loading = Promise.all(faces.map((f) => f.load())).then((loaded) => {
      loaded.forEach((f) => (document.fonts as unknown as { add: (x: FontFace) => void }).add(f));
    });
  }
  return loading;
};
