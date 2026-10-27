import { interpolate } from "remotion";
import { COLORS, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { easeInOut, easeOut } from "../components/anim";
import { INK } from "./props";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const ramp = (
  frame: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing = easeInOut,
) =>
  interpolate(frame, [a, Math.max(a + 1, b)], [from, to], {
    ...clamp,
    easing,
  });

// Смысловая надпись сверху (в безопасной зоне Reels): белая плашка,
// жёлтый маркер. Появляется снизу вверх, уходит вверх.
export const Caption: React.FC<{
  readonly text: string;
  readonly frame: number;
  readonly at: number;
  readonly out?: number;
  readonly top?: number;
  readonly size?: number;
  readonly dark?: boolean;
}> = ({ text, frame, at, out, top = SAFE.top + 14, size = 62, dark }) => {
  const inP = ramp(frame, at, at + 14, 0, 1, easeOut);
  const outP = out === undefined ? 0 : ramp(frame, out, out + 12);
  const mark = ramp(frame, at + 8, at + 22, 0, 1, easeOut);
  if (inP <= 0 || outP >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: SAFE.left,
        top,
        display: "flex",
        justifyContent: "center",
        opacity: inP * (1 - outP),
        translate: `0px ${(1 - inP) * 30 - outP * 30}px`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: "18px 34px 22px",
          borderRadius: 30,
          backgroundColor: dark ? INK : "#FFFFFF",
          color: dark ? "#FFFFFF" : INK,
          boxShadow: "0 18px 40px rgba(20, 40, 90, 0.18)",
          fontFamily,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.12,
          textAlign: "center",
        }}
      >
        <span
          style={{
            backgroundImage: `linear-gradient(${COLORS.yellow}, ${COLORS.yellow})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${mark * 100}% 34%`,
            backgroundPosition: "0 88%",
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

// Камера: масштаб и сдвиг всего «мира» сцены (центр — точка фокуса).
// Камера не выходит за края декорации (worldW × worldH).
export const clampCam = (
  c: { x: number; y: number; scale: number },
  worldW = 1080,
  worldH = 1920,
) => {
  const hw = 540 / c.scale;
  const hh = 960 / c.scale;
  return {
    scale: c.scale,
    x: Math.min(Math.max(c.x, hw), Math.max(hw, worldW - hw)),
    y: Math.min(Math.max(c.y, hh), Math.max(hh, worldH - hh)),
  };
};

export const Cam: React.FC<{
  readonly x: number; // точка мира в центре кадра
  readonly y: number;
  readonly scale: number;
  readonly children: React.ReactNode;
  readonly rotate?: number;
}> = ({ x, y, scale, children, rotate = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: 1080,
      height: 1920,
      transformOrigin: "0 0",
      transform: `translate(540px, 960px) scale(${scale}) rotate(${rotate}deg) translate(${-x}px, ${-y}px)`,
    }}
  >
    {children}
  </div>
);

// Ключевые кадры: [[кадр, значение], …] с плавным переходом между ними.
export const keys = (
  frame: number,
  points: readonly (readonly [number, number])[],
  easing = easeInOut,
) => {
  if (frame <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [t1, v1] = points[i];
    const [t0, v0] = points[i - 1];
    if (frame <= t1) {
      if (t1 <= t0) return v1;
      return interpolate(frame, [t0, t1], [v0, v1], { ...clamp, easing });
    }
  }
  return points[points.length - 1][1];
};
