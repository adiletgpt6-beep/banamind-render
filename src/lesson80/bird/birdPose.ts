// Поза самки дрозда в кадре фильма (координаты мира дерева). Решатель
// превращает сегмент плана (birdPlan.ts) в непрерывные параметры: положение,
// направление, наклон корпуса, поворот/наклон головы, крылья, хвост, лапы,
// клюв и травинку. Все переходы детерминированны по номеру кадра.
import type { Timeline } from "../core/timing";
import { FPS } from "../core/video";
import { materialAt, planOf, segmentAt, type Segment } from "../film-1-6/birdPlan";
import { TREE } from "../sets/treeLayout";
import { clamp, easeInOut, easeOut, lerp, smoothstep, hash01 } from "../rig/motion";

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
  readonly state: Segment["state"];
  readonly u: number;
};

// Точки опоры (лапы) и центр корпуса над ними.
const BODY_ABOVE_FEET = 64;
const standAt = (p: { x: number; y: number }) => ({ x: p.x, y: p.y - BODY_ABOVE_FEET, perchY: p.y });
const anchor = (k: "ground" | "low" | "nest" | "away") =>
  k === "ground" ? { x: TREE.grassSpot.x + 60, y: TREE.groundY } : k === "low" ? TREE.perchLow : k === "nest" ? TREE.perchNest : TREE.away;

// Квадратичная кривая полёта с подъёмом.
const flightPath = (a: { x: number; y: number }, b: { x: number; y: number }, u: number, lift: number) => {
  const cx = (a.x + b.x) / 2;
  const cy = Math.min(a.y, b.y) - lift;
  const t = u;
  const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x;
  const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y;
  const dx = 2 * (1 - t) * (cx - a.x) + 2 * t * (b.x - cx);
  const dy = 2 * (1 - t) * (cy - a.y) + 2 * t * (b.y - cy);
  return { x, y, dx, dy };
};

// Фаза взмаха: частота 4,6 Гц в крейсере, медленнее при посадке.
const flapPhase = (t: number, u: number) => {
  const freq = 4.6 * (0.75 + 0.25 * Math.sin(u * Math.PI));
  return t * freq * Math.PI * 2;
};

const flapWings = (ph: number, amp: number, spread: number): [Wing, Wing] => {
  const f = Math.sin(ph) * amp;
  // дальнее крыло с небольшим запаздыванием
  const g = Math.sin(ph - 0.35) * amp;
  return [
    { spread, flap: f },
    { spread: spread * 0.96, flap: g },
  ];
};

const FOLDED: Wing = { spread: 0, flap: 0.15 };

const idleHead = (t: number, seed: number) => {
  // редкие повороты головы: детерминированные «интересные» моменты
  const k = Math.floor(t / 1.7);
  const r = hash01(k * 13 + seed);
  const local = (t - k * 1.7) / 1.7;
  const yaw = r < 0.33 ? -0.6 : r < 0.66 ? 0.5 : 0.1;
  const pitch = r > 0.8 ? 10 : r < 0.15 ? -6 : 2;
  const e = smoothstep(local / 0.25);
  const prevR = hash01((k - 1) * 13 + seed);
  const prevYaw = prevR < 0.33 ? -0.6 : prevR < 0.66 ? 0.5 : 0.1;
  const prevPitch = prevR > 0.8 ? 10 : prevR < 0.15 ? -6 : 2;
  return { yaw: lerp(prevYaw, yaw, e), pitch: lerp(prevPitch, pitch, e), blinkish: local > 0.9 };
};

export const birdPoseAt = (tl: Timeline, frame: number): BirdPose => {
  const t = frame / FPS;
  const { seg, u, next } = segmentAt(tl, frame);
  const grass = materialAt(tl, frame) === "beak";
  const breathe = Math.sin(t * 2.1) * 0.5 + 0.5;
  const base = {
    bodyPitch: 6,
    headYaw: 0,
    headPitch: 0,
    neck: 0.2,
    beakOpen: 0,
    wingNear: FOLDED,
    wingFar: FOLDED,
    tailPitch: 4 + breathe * 1.5,
    tailFan: 0,
    legs: 1,
    grip: 1,
    grass,
    grassSway: Math.sin(t * 3.3) * 2,
    visible: true,
    state: seg.state,
    u,
  };
  const facingFor = (from: string | undefined, to: string | undefined): 1 | -1 => {
    const a = anchor((from ?? "ground") as "ground");
    const b = anchor((to ?? "nest") as "nest");
    return b.x >= a.x ? 1 : -1;
  };
  switch (seg.state) {
    case "perchLow": {
      const p = standAt(TREE.perchLow);
      const h = idleHead(t, 3);
      return { ...base, ...p, facing: 1, headYaw: h.yaw * 0.7, headPitch: h.pitch * 0.6, tailPitch: 8 + Math.sin(t * 1.3) * 2 };
    }
    case "idleNest": {
      const p = standAt(TREE.perchNest);
      const h = idleHead(t, 7);
      // с травинкой в клюве смотрит в сторону гнезда (вправо)
      return { ...base, ...p, facing: 1, headYaw: grass ? 0.1 : h.yaw * 0.8, headPitch: grass ? 4 : h.pitch, neck: 0.25 };
    }
    case "groundLook": {
      const p = standAt({ x: TREE.grassSpot.x + 60, y: TREE.groundY });
      const h = idleHead(t, 11);
      return { ...base, ...p, facing: -1, bodyPitch: 10, headYaw: h.yaw * 0.6, headPitch: 6 + h.pitch * 0.5 };
    }
    case "holdGround": {
      const p = standAt({ x: TREE.grassSpot.x + 60, y: TREE.groundY });
      // перед взлётом разворачивается к дереву и чуть приседает
      const toNext = next ? clamp((t - (next.at - 0.5)) / 0.5) : 0;
      return { ...base, ...p, facing: 1, bodyPitch: 8 - 10 * toNext, headYaw: 0.15, headPitch: -4, y: p.y + 6 * smoothstep(toNext), neck: 0.3 };
    }
    case "pick": {
      const p = standAt({ x: TREE.grassSpot.x + 60, y: TREE.groundY });
      // 0–0.3 поворот головы к травинке, 0.3–0.72 наклон, 0.72 захват, →1 подъём
      const turn = smoothstep(u / 0.3);
      const down = u < 0.3 ? 0 : u < 0.72 ? easeInOut((u - 0.3) / 0.42) : 1 - easeOut((u - 0.72) / 0.28) * 0.85;
      const beak = u > 0.6 && u < 0.74 ? smoothstep((u - 0.6) / 0.08) * (1 - smoothstep((u - 0.7) / 0.04)) : 0;
      return {
        ...base,
        ...p,
        facing: -1,
        bodyPitch: 10 + 26 * down,
        headYaw: 0.25 * turn * (1 - down),
        headPitch: 14 * turn + 40 * down,
        neck: 0.2 + 0.75 * down,
        beakOpen: beak * 0.9,
        y: p.y + 10 * down,
        tailPitch: -6 * down + 4,
      };
    }
    case "takeOff": {
      const from = standAt(anchor(seg.from ?? "nest"));
      const facing = facingFor(seg.from, next?.to);
      // присед (0–0.35), толчок и раскрытие крыльев (0.35–1)
      const crouch = u < 0.35 ? smoothstep(u / 0.35) : 1 - smoothstep((u - 0.35) / 0.3);
      const rise = u < 0.35 ? 0 : easeOut((u - 0.35) / 0.65);
      const spread = u < 0.3 ? 0 : smoothstep((u - 0.3) / 0.4);
      const ph = flapPhase(t, 0);
      const [wn, wf] = flapWings(ph, 0.9 * spread, spread);
      return {
        ...base,
        x: from.x + facing * 26 * rise,
        y: from.y + 10 * crouch - 46 * rise,
        perchY: rise < 0.5 ? from.perchY : null,
        facing,
        bodyPitch: 4 - 24 * rise,
        legs: 1 - 0.6 * rise,
        grip: 1 - smoothstep((u - 0.4) / 0.25),
        wingNear: wn,
        wingFar: wf,
        tailFan: 0.5 * spread,
        tailPitch: 2 - 10 * rise,
        neck: 0.35,
      };
    }
    case "flyIn":
    case "flyUp":
    case "flyOut": {
      const a = anchor(seg.from ?? "ground");
      const b = anchor(seg.to ?? "nest");
      const facing: 1 | -1 = b.x >= a.x ? 1 : -1;
      const lift = seg.to === "away" ? 60 : seg.from === "ground" ? 240 : 150;
      const e = seg.to === "away" ? easeInOutLight(u) : easeInOut(u);
      const start = seg.state === "flyOut" || seg.from === "nest" || seg.from === "low" ? { x: a.x + facing * 26, y: a.y - BODY_ABOVE_FEET - 46 } : { x: a.x + facing * 20, y: a.y - BODY_ABOVE_FEET - 40 };
      const end = seg.to === "away" || seg.to === "ground" ? { x: b.x, y: b.y - BODY_ABOVE_FEET - 60 } : { x: b.x - facing * 18, y: b.y - BODY_ABOVE_FEET - 34 };
      const P = flightPath(start, end, e, lift);
      const landing = seg.to === "away" ? 0 : smoothstep((u - 0.72) / 0.28);
      const climbing = 1 - smoothstep((u - 0.1) / 0.3);
      const amp = 0.95 * (1 - 0.55 * landing) * (0.7 + 0.3 * climbing);
      const ph = flapPhase(t, u);
      const [wn, wf] = flapWings(ph, amp, 1 - 0.1 * landing);
      const dirPitch = clamp(Math.atan2(P.dy, facing * P.dx) * (180 / Math.PI), -40, 40);
      return {
        ...base,
        x: P.x,
        y: P.y + Math.sin(ph) * 3,
        perchY: null,
        facing,
        bodyPitch: lerp(-12 + dirPitch * 0.55, 18, landing),
        headYaw: landing * 0.1,
        headPitch: -4 + landing * 10,
        neck: 0.55,
        wingNear: wn,
        wingFar: wf,
        legs: landing * 0.95,
        grip: 0,
        tailFan: 0.35 + 0.6 * landing,
        tailPitch: -8 + 26 * landing,
        grassSway: Math.sin(ph) * 5,
      };
    }
    case "land": {
      // точку опоры определяет предыдущий полёт
      const target = standAt(landTarget(tl, frame));
      const settle = easeOut(u);
      const [wn, wf] = flapWings(flapPhase(t, 1), 0.3 * (1 - settle), 1 - settle);
      const facing: 1 | -1 = target.x > (TREE.grassSpot.x + 300) ? 1 : -1;
      return {
        ...base,
        x: target.x - 8 * (1 - settle),
        y: target.y - 10 * (1 - settle) + 3 * Math.sin(u * Math.PI),
        perchY: target.perchY,
        facing,
        bodyPitch: lerp(16, 6, settle),
        wingNear: wn,
        wingFar: wf,
        legs: 1,
        grip: smoothstep(u / 0.4),
        tailFan: 0.5 * (1 - settle),
        tailPitch: lerp(18, 4, settle),
        neck: lerp(0.5, 0.25, settle),
      };
    }
    case "place": {
      const p = standAt(TREE.perchNest);
      // к гнезду: поворот головы (0–0.2), вытягивание и наклон (0.2–0.6),
      // отпускание (0.62), подправить клювом (0.7–0.9), осмотреть (→1)
      const turn = smoothstep(u / 0.2);
      const reach = u < 0.2 ? 0 : u < 0.6 ? easeInOut((u - 0.2) / 0.4) : u < 0.7 ? 1 : 1 - easeInOut((u - 0.7) / 0.3) * 0.75;
      const peck = u > 0.7 && u < 0.92 ? Math.abs(Math.sin(((u - 0.7) / 0.22) * Math.PI * 2)) * 0.3 : 0;
      const beak = u > 0.6 && u < 0.68 ? smoothstep((u - 0.6) / 0.04) : 0;
      return {
        ...base,
        ...p,
        facing: 1,
        bodyPitch: 6 + 22 * reach,
        headYaw: 0.15 * turn,
        headPitch: 10 * turn + 36 * reach + 14 * peck,
        neck: 0.2 + 0.8 * reach + 0.2 * peck,
        beakOpen: beak * 0.8 + peck * 0.5,
        tailPitch: 2 - 8 * reach,
      };
    }
    case "adjust": {
      const p = standAt(TREE.perchNest);
      const inOut = Math.sin(u * Math.PI);
      const peck = Math.abs(Math.sin(u * Math.PI * 3)) * inOut;
      return {
        ...base,
        ...p,
        facing: 1,
        bodyPitch: 6 + 18 * inOut,
        headYaw: 0.1,
        headPitch: 30 * inOut + 12 * peck,
        neck: 0.2 + 0.7 * inOut + 0.2 * peck,
        beakOpen: peck * 0.45,
      };
    }
    case "away":
    default:
      return { ...base, x: TREE.away.x, y: TREE.away.y, perchY: null, facing: -1, visible: false };
  }
};

const easeInOutLight = (u: number) => lerp(u, easeInOut(u), 0.5);

// Опора после посадки — куда вела предыдущая траектория.
const landTarget = (tl: Timeline, frame: number) => {
  const { index } = segmentAt(tl, frame);
  const segs = planOf(tl);
  for (let k = index; k >= 0; k--) {
    const s = segs[k];
    if (s && (s.state === "flyIn" || s.state === "flyUp")) return anchor(s.to ?? "nest");
  }
  return TREE.perchNest;
};
