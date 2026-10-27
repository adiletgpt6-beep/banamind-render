import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS, type SceneTiming, type Word } from "../theme";

type Chunk = { words: Array<Word & { kw: boolean }> };

const MAX_WORDS = 4;
const MAX_CHARS = 26;

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");

/** Делит реплику на короткие смысловые фрагменты для кинетических субтитров. */
export const chunkWords = (scene: SceneTiming, skip = 0): Chunk[] => {
  const kws = new Set(scene.keywords.map(norm));
  // Отдельное тире приклеиваем к предыдущему слову.
  const merged: Array<Word & { kw: boolean }> = [];
  scene.words.forEach((w, i) => {
    if (i < skip) {
      return;
    }
    if ((w.w === "—" || w.w === "–") && merged.length) {
      const last = merged[merged.length - 1];
      merged[merged.length - 1] = { ...last, w: `${last.w} —`, e: w.e };
      return;
    }
    merged.push({ ...w, kw: kws.has(norm(w.w)) });
  });
  const chunks: Chunk[] = [];
  let cur: Chunk = { words: [] };
  const len = (c: Chunk) => c.words.map((x) => x.w).join(" ").length;
  merged.forEach((w, i) => {
    cur.words.push(w);
    const next = merged[i + 1];
    const hard = /[.!?:]$/.test(w.w);
    const soft = /[,—]$/.test(w.w) && cur.words.length >= 2;
    const full =
      cur.words.length >= MAX_WORDS || (next && len(cur) + next.w.length + 1 > MAX_CHARS);
    if (hard || soft || full || !next) {
      chunks.push(cur);
      cur = { words: [] };
    }
  });
  return chunks;
};

export const Captions: React.FC<{
  scene: SceneTiming;
  skip?: number;
  top: number;
  left: number;
  width: number;
  align?: "left" | "center";
  size?: number;
}> = ({ scene, skip = 0, top, left, width, align = "left", size = 64 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chunks = chunkWords(scene, skip);
  if (!chunks.length) {
    return null;
  }
  // Активный фрагмент: последний начавшийся; держим до начала следующего.
  let idx = -1;
  chunks.forEach((c, i) => {
    if (t >= c.words[0].s - 0.08) {
      idx = i;
    }
  });
  if (idx < 0) {
    return null;
  }
  const chunk = chunks[idx];
  const last = chunk.words[chunk.words.length - 1];
  const isLast = idx === chunks.length - 1;
  const fadeOut = isLast ? interpolate(t, [last.e + 0.5, last.e + 0.8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const startF = Math.round((chunk.words[0].s - 0.08) * FPS);

  return (
    <div
      data-fit="caption"
      style={{
        position: "absolute",
        top,
        left,
        width,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: size * 0.28,
        rowGap: size * 0.08,
        fontFamily: FONT.text,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: -0.5,
        opacity: fadeOut,
        isolation: "isolate",
      }}
    >
      {chunk.words.map((w, i) => {
        const local = frame - startF - i * 2;
        const enter = interpolate(local, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const spoken = t >= w.s - 0.04;
        const color = spoken ? (w.kw ? C.orange : C.navy) : C.muted;
        const hl = w.kw ? interpolate(t, [w.s, w.s + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
        return (
          <span
            key={`${idx}-${i}`}
            style={{
              position: "relative",
              display: "inline-block",
              color,
              opacity: enter,
              transform: `translateY(${(1 - enter) * 26}px)`,
              textShadow: "0 2px 0 rgba(255,255,255,0.85), 0 8px 24px rgba(255,255,255,0.9)",
            }}
          >
            {w.kw ? (
              <span
                style={{
                  position: "absolute",
                  left: -6,
                  right: -6,
                  bottom: size * 0.06,
                  height: size * 0.3,
                  borderRadius: 8,
                  background: "rgba(255,159,67,0.28)",
                  transform: `scaleX(${hl})`,
                  transformOrigin: "left",
                  zIndex: -1,
                }}
              />
            ) : null}
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
