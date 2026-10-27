import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import type { Bg23Cue } from "./script";
import { C, clamp, ease, pop } from "./theme";

/** Реплика сцены: время относительно начала сцены, с. */
export type SceneCue = Pick<Bg23Cue, "from" | "to" | "words">;
export type SceneProps = { readonly dur: number; readonly cue: SceneCue };

/** Начало i-го слова реплики (или пропорциональная оценка). */
export const wordAt = (cue: SceneCue, i: number, n: number): number =>
  cue.words.length === n ? cue.words[i].start : cue.from + ((cue.to - cue.from) * i) / n;

// Светлая «бумага карты»: точечная сетка и мягкий градиент.
export const Paper: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFFFF 0%, ${C.bg} 55%, #EEF4FC 100%)` }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
      <defs>
        <pattern id="bg23dots" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="22" cy="22" r="2.4" fill="#D3DFEE" />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill="url(#bg23dots)" />
    </svg>
  </AbsoluteFill>
);

export const Brand: React.FC = () => (
  <div style={{ position: "absolute", left: 90, top: 262, display: "flex", alignItems: "center", gap: 14, fontFamily }}>
    <div style={{ width: 66, height: 66, borderRadius: 33, overflow: "hidden", background: "#fff", boxShadow: `0 8px 20px ${C.shadow}` }}>
      <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
    <div style={{ fontWeight: 900, fontSize: 34, color: C.navy }}>
      Bala<span style={{ color: C.yellow, WebkitTextStroke: `1px ${C.navy}` }}>Go</span>
    </div>
  </div>
);

export const Title: React.FC<{ readonly text: React.ReactNode; readonly at?: number; readonly top?: number; readonly size?: number }> = ({ text, at = 0.15, top = 360, size = 64 }) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 16);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 150,
        top,
        textAlign: "left",
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.08,
        color: C.navy,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      {text}
    </div>
  );
};

/** Кадров кроссфейда между сценами. */
export const CROSSFADE = 12;

/** Мягкое появление сцены поверх предыдущей (без вспышек и скачков масштаба). */
export const SceneIn: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const t = ease(f, 0, 0.4);
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, CROSSFADE], [0, 1], clamp), transform: `scale(${1.015 - 0.015 * t})` }}>{children}</AbsoluteFill>;
};

export const Underline: React.FC<{ readonly t: number; readonly width: number }> = ({ t, width }) => (
  <div style={{ height: 14, width: width * t, background: C.yellow, borderRadius: 7, marginTop: 8 }} />
);
