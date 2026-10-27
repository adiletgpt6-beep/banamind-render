import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { H, W } from "../theme";
import { newP, sample, type P, type Segment } from "./particles";

export type Decor = (ctx: CanvasRenderingContext2D, frame: number) => void;

type Props = {
  segments: readonly Segment[];
  count: number;
  below?: Decor;
  above?: Decor;
  // смещение кадра для motion blur (доля кадра, 0 — без размытия)
  blur?: number;
};

const now = newP();
const prev = newP();

const rgba = (p: P, a: number) =>
  `rgba(${p.c[0] | 0},${p.c[1] | 0},${p.c[2] | 0},${a.toFixed(3)})`;

// Холст частиц на весь кадр. Рисуется синхронно для текущего кадра Remotion.
export const ParticleCanvas: React.FC<Props> = ({
  segments,
  count,
  below,
  above,
  blur = 0.6,
}) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    below?.(ctx, frame);
    ctx.lineCap = "round";
    for (let i = 0; i < count; i++) {
      sample(segments, i, frame, now);
      if (now.a < 0.01 || now.r < 0.05) continue;
      if (now.x < -60 || now.x > W + 60 || now.y < -60 || now.y > H + 60)
        continue;
      const a = Math.min(1, now.a);
      if (now.g > 0.02) {
        ctx.fillStyle = rgba(now, a * now.g * 0.16);
        ctx.beginPath();
        ctx.arc(now.x, now.y, now.r * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      let streak = false;
      if (blur > 0) {
        sample(segments, i, frame - blur, prev);
        const d = Math.hypot(now.x - prev.x, now.y - prev.y);
        if (d > Math.max(1.5, now.r * 0.8)) {
          streak = true;
          ctx.strokeStyle = rgba(now, a * Math.max(0.45, 1 - d / 160));
          ctx.lineWidth = now.r * 2;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(now.x, now.y);
          ctx.stroke();
        }
      }
      if (!streak) {
        ctx.fillStyle = rgba(now, a);
        ctx.beginPath();
        ctx.arc(now.x, now.y, now.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    above?.(ctx, frame);
  }, [frame, segments, count, below, above, blur]);

  return (
    <AbsoluteFill>
      <canvas
        ref={ref}
        width={W}
        height={H}
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};
