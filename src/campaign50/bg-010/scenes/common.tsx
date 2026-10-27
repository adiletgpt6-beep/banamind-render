// Общее для сцен: рост персонажей, «камера» по экрану ноутбука (кадр
// 1080×1920), позы папы за столом, точки времени по словам озвучки.
import { useScene, useTimeline } from "../context";
import type { PoseIn, WorldArm } from "../rig/Actor";
import { clamp, keys, lerp } from "../rig/motion";
import { BG10_VIDEO } from "../script";
import { OFFICE } from "../sets/Office";

// Рост персонажей (px мира).
export const H = { dad: 1040, son: 720 } as const;

// Крупный план экрана: точка (cx, cy) экрана в центре кадра, масштаб z.
// Фон за окном — светлый, с лёгкими кругами бренда.
export const ScreenCam: React.FC<{ readonly cx: number; readonly cy: number; readonly z: number; readonly rot?: number; readonly shake?: number; readonly children: React.ReactNode }> = ({ cx, cy, z, rot = 0, shake = 0, children }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#F4F6FB" }}>
    <div style={{ position: "absolute", left: -260, top: -200, width: 760, height: 760, borderRadius: 380, backgroundColor: "#FFF4CF" }} />
    <div style={{ position: "absolute", right: -240, bottom: -160, width: 700, height: 700, borderRadius: 350, backgroundColor: "#E6F0FB" }} />
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        transformOrigin: "0 0",
        transform: `translate(${540 - cx * z + shake}px, ${960 - cy * z}px) scale(${z}) rotate(${rot}deg)`,
      }}
    >
      {children}
    </div>
  </div>
);

// Камера между двумя положениями экрана.
export const screenMove = (f: number, a: number, b: number, from: { cx: number; cy: number; z: number }, to: { cx: number; cy: number; z: number }, ease: (x: number) => number) => {
  const t = ease(clamp((f - a) / Math.max(1, b - a)));
  return { cx: lerp(from.cx, to.cx, t), cy: lerp(from.cy, to.cy, t), z: lerp(from.z, to.z, t) };
};

// Кадр сцены, когда звучит слово № idx реплики id (по фактическим таймингам).
export const useWordFrame = (id: string, idx: number) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const w = c.words[Math.min(idx, c.words.length - 1)];
  const t = w ? w.start : c.from + ((c.to - c.from) * idx) / Math.max(1, c.words.length);
  return Math.round(t * BG10_VIDEO.fps) - from;
};

// Папа сидит за столом.
export const DAD_SEAT = { x: OFFICE.dadX, y: OFFICE.floorY, h: H.dad } as const;

// Руки на клавиатуре (за крышкой ноутбука): лёгкий набор текста.
export const typingArms = (t: number, amt = 1): { armL: WorldArm; armR: WorldArm } => {
  const k = OFFICE.laptop;
  const bob = (ph: number) => Math.max(0, Math.sin(t * 1.3 + ph)) * 10 * amt;
  return {
    armL: { target: { x: k.x - 150, y: k.y - 40 - bob(0) }, shape: "relax", elbow: "down" },
    armR: { target: { x: k.x - 20, y: k.y - 40 - bob(2.1) }, shape: "relax", elbow: "down" },
  };
};

// Базовая поза сидящего папы.
export const seated = (t: number, extra: PoseIn = {}): PoseIn => ({
  sit: 1,
  seat: OFFICE.seat,
  expr: "thinking",
  lookY: 0.45,
  ...typingArms(t),
  ...extra,
});

// Плавное значение по ключам (переэкспорт для краткости сцен).
export { keys };
