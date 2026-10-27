// Блик, проходящий по предмету по диагонали (как свет по ткани/стеклу).
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { range } from "./anim";

export const LightSweep: React.FC<{ start: number; dur?: number; strength?: number }> = ({ start, dur = 28, strength = 0.55 }) => {
  const f = useCurrentFrame();
  const p = range(f, start, start + dur, -0.6, 1.6, (x) => x);
  if (f < start || f > start + dur) return null;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(115deg, transparent ${p * 100 - 18}%, rgba(255,255,255,${strength}) ${p * 100}%, transparent ${p * 100 + 18}%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};
