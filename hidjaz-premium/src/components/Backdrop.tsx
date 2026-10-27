// Тёплый «студийный» фон: мягкие световые пятна медленно дрейфуют,
// виньетка и плёночное зерно дают глубину без затемнения кадра.
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { CONTENT } from "../content";

const P = CONTENT.brand.palette;

export const Backdrop: React.FC<{ tone?: "light" | "deep"; seed?: number }> = ({ tone = "light", seed = 1 }) => {
  const f = useCurrentFrame();
  const blobs = [0, 1, 2].map((i) => {
    const r = (k: number) => random(`blob-${seed}-${i}-${k}`);
    const x = 20 + r(1) * 60 + Math.sin(f / (90 + i * 30) + r(2) * 6) * 12;
    const y = 15 + r(3) * 70 + Math.cos(f / (110 + i * 25) + r(4) * 6) * 10;
    return { x, y, s: 55 + r(5) * 35 };
  });
  const base = tone === "deep" ? `linear-gradient(170deg, ${P.deep}, #121c19)` : `linear-gradient(170deg, ${P.bg}, ${P.bgDeep})`;
  const glow = tone === "deep" ? "rgba(233,216,184,0.16)" : "rgba(255,255,255,0.75)";
  return (
    <AbsoluteFill style={{ background: base }}>
      {blobs.map((b, i) => (
        <AbsoluteFill
          key={i}
          style={{ background: `radial-gradient(circle at ${b.x}% ${b.y}%, ${i === 1 ? `${P.accentSoft}55` : glow} 0%, transparent ${b.s}%)` }}
        />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.10) 100%)" }} />
    </AbsoluteFill>
  );
};

/** зерно: детерминированный шум SVG, меняется каждые 2 кадра */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const f = Math.floor(useCurrentFrame() / 2);
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "multiply", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`g${f % 8}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 8} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${f % 8})`} />
      </svg>
    </AbsoluteFill>
  );
};
