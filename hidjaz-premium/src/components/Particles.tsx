// Золотая пыль: частицы на трёх глубинах (размер, скорость, размытие),
// мерцают и медленно поднимаются. Детерминированы через random(seed).
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { CONTENT, HEIGHT, WIDTH } from "../content";

export const Particles: React.FC<{ count?: number; seed?: string; color?: string; burst?: number }> = ({
  count = 46,
  seed = "dust",
  color = CONTENT.brand.palette.accent,
  burst = 0,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: number) => random(`${seed}-${i}-${k}`);
        const depth = r(1);
        const size = 3 + depth * 9;
        const speed = 0.25 + depth * 0.9;
        const x = r(2) * WIDTH + Math.sin(f / (40 + r(3) * 40) + r(4) * 9) * 18 * (1 + depth);
        const y = (((r(5) * HEIGHT - f * speed) % HEIGHT) + HEIGHT) % HEIGHT;
        // «взрыв» от центра при появлении товара
        const bx = burst > 0 ? (x - WIDTH / 2) * burst * 0.35 : 0;
        const by = burst > 0 ? (y - HEIGHT * 0.45) * burst * 0.35 : 0;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / (12 + r(6) * 20) + r(7) * 6));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + bx,
              top: y + by,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, #fff 0%, ${color} 45%, transparent 72%)`,
              opacity: tw * (0.35 + depth * 0.55),
              filter: depth < 0.3 ? "blur(2px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
