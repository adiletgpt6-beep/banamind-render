// Поза птицы для вида дерева за окном. В фильмах, где птица — не действующее
// лицо (80-1-7), она спокойно сидит в своём гнезде из фильма 80-1-6: та же
// птица, то же гнездо, лёгкое дыхание и редкие повороты головы.
import { TREE } from "../sets/treeLayout";
import { hash01 } from "../rig/motion";

export type Wing = { readonly spread: number; readonly flap: number }; // spread 0 сложено … 1 раскрыто; flap −1 вверх … 1 вниз

export type BirdPose = {
  readonly x: number; // центр корпуса (мир)
  readonly y: number;
  readonly facing: 1 | -1; // 1 — смотрит вправо
  readonly bodyPitch: number; // градусы, + — нос вниз
  readonly headYaw: number; // −1 … 1: поворот головы к зрителю (0 — профиль)
  readonly headPitch: number; // градусы, + — клюв вниз
  readonly neck: number; // вытягивание шеи 0…1
  readonly beakOpen: number; // 0…1
  readonly wingNear: Wing; // крыло со стороны зрителя
  readonly wingFar: Wing;
  readonly tailPitch: number; // градусы, + — хвост вниз
  readonly tailFan: number; // 0…1
  readonly legs: number; // 0 — поджаты (полёт), 1 — стоит
  readonly grip: number; // 0…1 пальцы охватывают ветку
  readonly perchY: number | null; // y опоры под лапами (ветка/земля) или null в полёте
  readonly grass: boolean; // травинка в клюве
  readonly grassSway: number; // покачивание травинки (градусы)
  readonly visible: boolean;
  readonly state: string;
  readonly u: number;
};

const FOLDED: Wing = { spread: 0, flap: 0 };

// Птица сидит в гнезде (f — кадр фильма): дыхание и редкий поворот головы.
export const nestingBirdPose = (f: number): BirdPose => {
  const t = f / 30;
  const breathe = Math.sin(t * 2.1) * 0.5 + 0.5;
  const k = Math.floor(t / 7);
  const local = t - k * 7;
  const turn = hash01(k * 3 + 1) > 0.55 && local > 2 && local < 4.2 ? Math.sin(((local - 2) / 2.2) * Math.PI) : 0;
  return {
    x: TREE.nest.x - 10,
    y: TREE.nest.y - 26 - breathe * 1.2,
    facing: 1,
    bodyPitch: 4,
    headYaw: 0.1 + turn * 0.5,
    headPitch: 2 + turn * 3,
    neck: 0.15,
    beakOpen: 0,
    wingNear: FOLDED,
    wingFar: FOLDED,
    tailPitch: 6 + breathe * 1.5,
    tailFan: 0,
    legs: 0.2,
    grip: 0,
    perchY: TREE.nest.y - 8,
    grass: false,
    grassSway: 0,
    visible: true,
    state: "nesting",
    u: 0,
  };
};
