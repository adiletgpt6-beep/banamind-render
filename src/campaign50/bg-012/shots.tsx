// Камера: мировой план показывается через viewBox (векторная графика
// остаётся чёткой при любом приближении). cx, cy — центр кадра в мире, z —
// приближение (1 — 1080 мировых px по ширине кадра).
import { AbsoluteFill } from "remotion";

export type Cam = { readonly cx: number; readonly cy: number; readonly z: number };

export const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({
  cx: a.cx + (b.cx - a.cx) * k,
  cy: a.cy + (b.cy - a.cy) * k,
  // приближение — в логарифмической шкале (равномерный наезд)
  z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * k),
});

export const World: React.FC<{ readonly cam: Cam; readonly blur?: number; readonly children: React.ReactNode; readonly style?: React.CSSProperties }> = ({
  cam,
  blur = 0,
  children,
  style,
}) => {
  const w = 1080 / cam.z;
  const h = 1920 / cam.z;
  return (
    <AbsoluteFill style={{ filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined, ...style }}>
      <svg width={1080} height={1920} viewBox={`${(cam.cx - w / 2).toFixed(2)} ${(cam.cy - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`}>
        {children}
      </svg>
    </AbsoluteFill>
  );
};
