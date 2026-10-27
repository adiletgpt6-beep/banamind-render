import { Character, type Arm, type CharacterProps, LOOKS } from "./Character";

// Персонаж в мире сцены: x — центр, y — линия ступней, h — рост рисунка.
export type Placement = { readonly x: number; readonly y: number; readonly h: number };

const CHILD_THIGH = 150;
const ADULT_THIGH = 190;

// Точка мира → цель кисти (Arm) для руки side (−1 левая, 1 правая) с учётом
// посадки sit. Нужна, чтобы кисть точно касалась предмета (сумки, плеча).
export const reach = (
  p: Placement,
  kind: CharacterProps["kind"],
  side: -1 | 1,
  wx: number,
  wy: number,
  sit = 0,
): Arm => {
  const k = p.h / 1000;
  const drop = sit * (LOOKS[kind].child ? CHILD_THIGH : ADULT_THIGH);
  const px = (wx - p.x + 0.2 * p.h) / k;
  const py = (wy - p.y + 0.975 * p.h) / k - drop;
  return [side === -1 ? px - 200 : 200 - px, py];
};

export const Actor: React.FC<
  Omit<CharacterProps, "height"> & { readonly at: Placement; readonly z?: number }
> = ({ at, z, ...props }) => (
  <div
    style={{
      position: "absolute",
      left: at.x - at.h * 0.2,
      top: at.y - at.h * 0.975,
      width: at.h * 0.4,
      height: at.h,
      zIndex: z,
    }}
  >
    <Character height={at.h} {...props} />
  </div>
);

// Шаг персонажа, который движется по траектории pos(frame): пройденный
// путь (единицы рисунка), направление и размах шага. Шаги считаются от
// реального перемещения — ступни не скользят; направление и размах
// сглажены по окну ±4 кадра, поэтому на поворотах, при старте и остановке
// ноги не «перескакивают». Движение «к камере» (по y) — с коэффициентом depth.
export const walkOf = (
  pos: (frame: number) => Placement,
  from: number,
  frame: number,
  depth = 0.7,
) => {
  let walk = 0;
  const end = Math.max(from, Math.floor(frame));
  for (let t = from; t < end; t++) {
    const a = pos(t);
    const b = pos(t + 1);
    walk += Math.hypot(b.x - a.x, (b.y - a.y) * depth) / (b.h / 1000);
  }
  // окно симметричное и полное: до начала пути позиция постоянна, поэтому
  // скорость нарастает плавно (без скачка на первом кадре движения)
  const W = 4;
  const a = pos(frame - W);
  const b = pos(frame + W);
  const span = 2 * W;
  const k = 1000 / pos(frame).h;
  const vx = ((b.x - a.x) * k) / span;
  const vy = ((b.y - a.y) * depth * k) / span;
  const speed = Math.hypot(vx, vy);
  const walkDir = speed > 1e-3 ? vx / speed : 0;
  const x = Math.min(1, speed / 6);
  const walkAmount = x * x * (3 - 2 * x);
  return {
    legs: (walkAmount > 0.02 ? "walk" : "stand") as "walk" | "stand",
    walk,
    walkDir,
    walkAmount,
  };
};
