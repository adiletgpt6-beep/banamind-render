// TypographySystem — readable, calm kinetic text.
//
// Letters arrive one after another (soft rise + de-blur), words can carry a
// gold accent, the block leaves with a gentle fade. Everything is a pure
// function of the frame. Fonts are bundled locally (OFL) and loaded with
// delayRender so the very first rendered frame already uses them.

import React from "react";
import { continueRender, delayRender, Easing, staticFile } from "remotion";
import { clamp } from "../utils/geometry.ts";
import { FONTS, PALETTE } from "../styles/palette.ts";

const FONT_FILES: { family: string; file: string; weight: string; style?: string; range?: string }[] = [
  { family: "MKNunito", file: "nunito-cyrillic-800-normal.woff2", weight: "800", range: "U+0400-04FF" },
  { family: "MKNunito", file: "nunito-latin-800-normal.woff2", weight: "800", range: "U+0000-00FF,U+2000-206F" },
  { family: "MKNunito", file: "nunito-cyrillic-900-normal.woff2", weight: "900", range: "U+0400-04FF" },
  { family: "MKNunito", file: "nunito-latin-900-normal.woff2", weight: "900", range: "U+0000-00FF,U+2000-206F" },
  { family: "MKNunito", file: "nunito-cyrillic-700-normal.woff2", weight: "700", range: "U+0400-04FF" },
  { family: "MKNunito", file: "nunito-latin-700-normal.woff2", weight: "700", range: "U+0000-00FF,U+2000-206F" },
  { family: "MKLora", file: "lora-cyrillic-700-normal.woff2", weight: "700", range: "U+0400-04FF" },
  { family: "MKLora", file: "lora-latin-700-normal.woff2", weight: "700", range: "U+0000-00FF,U+2000-206F" },
  { family: "MKLora", file: "lora-cyrillic-600-italic.woff2", weight: "600", style: "italic", range: "U+0400-04FF" },
  { family: "MKLora", file: "lora-latin-600-italic.woff2", weight: "600", style: "italic", range: "U+0000-00FF,U+2000-206F" },
];

let fontsPromise: Promise<void> | null = null;
export const loadFonts = (): Promise<void> => {
  if (fontsPromise) return fontsPromise;
  fontsPromise = Promise.all(
    FONT_FILES.map(async (ff) => {
      const face = new FontFace(ff.family, `url(${staticFile(`assets/fonts/${ff.file}`)}) format("woff2")`, {
        weight: ff.weight,
        style: ff.style ?? "normal",
        unicodeRange: ff.range,
      });
      await face.load();
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(face);
    }),
  ).then(() => undefined);
  return fontsPromise;
};

export const useFonts = () => {
  const [handle] = React.useState(() => delayRender("Loading MUSLIM KIDS fonts"));
  React.useEffect(() => {
    loadFonts()
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

export type KineticTextProps = {
  lines: string[];
  f: number;
  from: number; // first letter starts
  to?: number; // block starts leaving
  x?: number; // centre x (px)
  y: number; // centre y of the block (px)
  size: number;
  lineHeight?: number;
  font?: string;
  weight?: number;
  color?: string;
  accent?: string[]; // words drawn in gold
  stagger?: number; // frames between letters
  letterSpacing?: number;
  shadow?: boolean;
  lineDelay?: number[]; // extra delay per line (frames)
  italic?: boolean;
  opacity?: number;
};

const arrive = Easing.bezier(0.2, 0.7, 0.2, 1);

export const KineticText: React.FC<KineticTextProps> = ({
  lines,
  f,
  from,
  to,
  x = 540,
  y,
  size,
  lineHeight = 1.18,
  font = FONTS.title,
  weight = 900,
  color = PALETTE.white,
  accent = [],
  stagger = 1.2,
  letterSpacing = 0,
  shadow = true,
  lineDelay = [],
  italic = false,
  opacity = 1,
}) => {
  if (f < from - 1) return null;
  const leave = to === undefined ? 0 : clamp((f - to) / 14);
  if (leave >= 1) return null;
  let idx = 0;
  const blockH = lines.length * size * lineHeight;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: y - blockH / 2,
        textAlign: "center",
        transform: `translateX(${x - 540}px) translateY(${-8 * leave}px)`,
        opacity: (1 - leave) * opacity,
        fontFamily: font,
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        fontSize: size,
        lineHeight: `${size * lineHeight}px`,
        letterSpacing,
        color,
        whiteSpace: "pre",
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(/(\s+)/).map((word, wi) => {
            const isAccent = accent.some((a) => word.replace(/[«»!?.,]/g, "") === a);
            return (
              <span key={wi} style={{ color: isAccent ? PALETTE.gold : undefined, display: "inline-block" }}>
                {[...word].map((ch, ci) => {
                  const start = from + (lineDelay[li] ?? 0) + idx++ * stagger;
                  const t = arrive(clamp((f - start) / 12));
                  return (
                    <span
                      key={ci}
                      style={{
                        display: "inline-block",
                        whiteSpace: "pre",
                        opacity: t,
                        transform: `translateY(${(1 - t) * size * 0.28}px)`,
                        filter: t < 0.999 ? `blur(${(1 - t) * 6}px)` : undefined,
                        textShadow: shadow
                          ? `0 2px 18px rgba(5,10,22,0.85), 0 0 2px rgba(5,10,22,0.9)${isAccent ? ", 0 0 26px rgba(248,201,106,0.35)" : ""}`
                          : undefined,
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
