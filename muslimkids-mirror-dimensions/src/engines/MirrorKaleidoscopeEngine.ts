// MirrorKaleidoscopeEngine: раскладка зеркальных панелей кульминации.
// Только для главной сцены — управляемое, узнаваемое (не хаотичное) построение:
//
//  фаза A «Три мира»   — три панели появляются из ребра (видна тонкая грань),
//                        разворачиваются к зрителю: горы и облака / Земля / дерево и звёзды;
//  фаза B «Симметрия»  — центральная панель и её пара складываются в V-образную
//                        пару под углом ≈ 60°: между ними настоящая Земля,
//                        взаимные отражения дают ограниченное число повторов;
//  фаза C «Вся система» — камера отдаляется, панели медленно дрейфуют;
//  фаза D «Тишина»     — движение замедляется, центр освобождается для цитаты;
//  фаза E «Складывание» — панели поворачиваются ребром и уходят.
import { V3, lerp, seg, smoother, v3lerp } from "../utils/math";

export type PanelState = {
  position: V3;
  rotation: V3; // Эйлер XYZ
  opacity: number; // рама и стекло
  visible: boolean;
};

export type PanelId = "mountains" | "earth" | "tree" | "partner";

export type Timing = {
  appear: number; // начало фазы A
  recompose: number; // начало фазы B
  wide: number; // фаза C
  calm: number; // фаза D
  fold: number; // фаза E
};

const HALF_PI = Math.PI / 2;

/** Расстояние разведения по вертикали в фазе D: центр кадра освобождается. */
const spread = (t: number, T: Timing) => seg(t, T.calm, T.calm + 3.2);

export const panelState = (id: PanelId, t: number, T: Timing): PanelState => {
  const fold = seg(t, T.fold, T.fold + 1.4);
  const sp = spread(t, T);
  const drift = (a: number) => Math.sin(t * 0.35 + a) * 0.04 * (1 - 0.7 * seg(t, T.calm, T.calm + 2));
  const appearK = (delay: number) => seg(t, T.appear + delay, T.appear + delay + 1.8, smoother);
  const edgeOn = (k: number, sign: number) => sign * HALF_PI * (1 - k);

  if (id === "mountains") {
    const k = appearK(0);
    const base: V3 = [-0.95, 3.85 + 3.8 * sp, -0.6];
    return {
      position: v3lerp([-0.95, 6.5, -0.6], base, k),
      rotation: [-0.12 + drift(1) + fold * 0.2, 0.36 + edgeOn(k, 1) + fold * 1.4, 0],
      opacity: k * (1 - fold),
      visible: t > T.appear - 0.1 && fold < 1,
    };
  }
  if (id === "tree") {
    const k = appearK(0.5);
    const base: V3 = [-0.75, -0.75 - 0.9 * sp, 0.4];
    return {
      position: v3lerp([-0.75, -3.5, 0.4], base, k),
      rotation: [0.14 + drift(2) - fold * 0.2, 0.32 + edgeOn(k, -1) - fold * 1.4, 0],
      opacity: k * (1 - fold),
      visible: t > T.appear + 0.4 && fold < 1,
    };
  }
  // центральная пара
  const k = appearK(0.25);
  const rec = seg(t, T.recompose, T.recompose + 2.6, smoother);
  if (id === "earth") {
    const a: V3 = [0.85, 1.6, 0.0];
    const b: V3 = [-0.5, 1.6 - 2.0 * sp, -0.35];
    return {
      position: v3lerp(v3lerp([3.6, 1.6, 0.0], a, k), b, rec),
      rotation: [drift(3) * 0.5, lerp(-0.3 + edgeOn(k, -1), 1.02, rec) + fold * 1.2, 0],
      opacity: k * (1 - fold),
      visible: t > T.appear && fold < 1,
    };
  }
  // партнёр V-пары — встаёт из ребра в фазе B
  const kp = seg(t, T.recompose + 0.4, T.recompose + 2.8, smoother);
  return {
    position: v3lerp([1.7, 1.6, -0.35], [0.5, 1.6 - 2.0 * sp, -0.35], kp),
    rotation: [drift(4) * 0.5, lerp(-HALF_PI, -1.02, kp) - fold * 1.2, 0],
    opacity: kp * (1 - fold),
    visible: t > T.recompose + 0.3 && fold < 1,
  };
};

/** Насколько видна настоящая Земля между панелями V-пары. */
export const innerEarthScale = (t: number, T: Timing) =>
  seg(t, T.recompose + 0.6, T.recompose + 2.6) * (1 - seg(t, T.fold, T.fold + 1.2));

/** Доля «тоннельного» отражения в центральной панели (вместо гостевой Земли). */
export const tunnelBlend = (t: number, T: Timing) => seg(t, T.recompose + 0.2, T.recompose + 2.2);
