import { interpolate } from "remotion";
import { easeInOut } from "../components/anim";
import { Cam, clampCam } from "./ui";

export type CamPos = { readonly x: number; readonly y: number; readonly scale: number };

// Плавный проезд камеры между двумя положениями за время плана.
export const camMove = (f: number, a: number, b: number, from: CamPos, to: CamPos): CamPos => {
  const t = interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    scale: from.scale + (to.scale - from.scale) * t,
  };
};

// План сцены: виден только в кадрах [from, to). Мир 1080 × 1920 (или w × h)
// под камерой; камера не выходит за края мира.
export const Shot: React.FC<{
  readonly f: number;
  readonly from: number;
  readonly to: number;
  readonly cam: CamPos;
  readonly w?: number;
  readonly h?: number;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode; // поверх камеры (надписи, экран)
}> = ({ f, from, to, cam, w = 1080, h = 1920, children, overlay }) => {
  if (f < from || f >= to) return null;
  const c = clampCam(cam, w, h);
  return (
    <>
      <Cam x={c.x} y={c.y} scale={c.scale}>
        <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, overflow: "hidden" }}>{children}</div>
      </Cam>
      {overlay}
    </>
  );
};
