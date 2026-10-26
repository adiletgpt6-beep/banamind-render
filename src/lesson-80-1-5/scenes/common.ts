// Общее для сцен: места персонажей (с перспективой), помощники для рук,
// кадры реплик и действий в координатах сцены.
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import { heightOfAge, lookOf } from "../rig/looks";
import type { Vec } from "../rig/motion";
import { L815_FPS, L815_PUPILS, mainPupil, type L815SceneId, type Pupil } from "../script";
import { depthK, ROOM } from "../set/Room";
import type { L815Timeline } from "../timing";

export type Main = "yusuf" | "amir" | "bilal";

// Место на ковре и рост (px мира) с учётом глубины.
export const placeOf = (x: number, y: number, standing: number): Place => ({ x, y, h: standing * depthK(y) });
export const seatOf = (who: Main): Place => {
  const p = mainPupil(who);
  const s = ROOM.seats[who];
  return placeOf(s.x, s.y, heightOfAge(p.age));
};
export const TEACHER_PLACE: Place = placeOf(ROOM.seats.teacher.x, ROOM.seats.teacher.y, lookOf("teacher").height);
export const CAST: Record<Main | "teacher", Place> = { yusuf: seatOf("yusuf"), amir: seatOf("amir"), bilal: seatOf("bilal"), teacher: TEACHER_PLACE };
export const lookIdOf = (who: Main | "teacher") => (who === "teacher" ? "teacher" : mainPupil(who).id);

// Место фонового ученика (ряды 1–3).
export const pupilPlace = (p: Pupil): Place => {
  const r = ROOM.rows[p.row as 1 | 2 | 3];
  const x = r.x0 + ((p.slot + 1) / 2) * (r.x1 - r.x0);
  return placeOf(x, r.y, heightOfAge(p.age));
};
export const BACKGROUND = L815_PUPILS.filter((p) => !p.main);

// Плечо персонажа в мире (приближённо, без поворота корпуса).
export const shoulderOf = (p: Place, lookId: string, side: -1 | 1): Vec => {
  const b = lookOf(lookId).build;
  const k = p.h / 1000;
  return { x: p.x + side * (b.shoulderHalf - b.limb * 0.45) * k, y: p.y + (b.shoulderY + b.limb * 0.45) * k };
};
// Запястье, при котором кончики пальцев приходят в точку tip.
export const wristFor = (p: Place, lookId: string, side: -1 | 1, tip: Vec, reach = 0.92): Vec => {
  const b = lookOf(lookId).build;
  const k = p.h / 1000;
  const s = shoulderOf(p, lookId, side);
  const dx = tip.x - s.x;
  const dy = tip.y - s.y;
  const d = Math.hypot(dx, dy) || 1;
  const hand = b.hand * k * reach;
  return { x: tip.x - (dx / d) * hand, y: tip.y - (dy / d) * hand };
};
// Рука: кончики пальцев в точке tip.
export const handAt = (p: Place, lookId: string, side: -1 | 1, tip: Vec, extra: Partial<WorldArm> = {}): WorldArm => ({
  target: wristFor(p, lookId, side, tip),
  elbow: "down",
  shape: "relax",
  ...extra,
});
// Руки спокойно лежат на столешнице перед сидящим.
export const restOnTable = (p: Place, side: -1 | 1, dy = 0): WorldArm => ({
  target: { x: p.x + side * 0.13 * p.h, y: ROOM.table.y + 36 + dy },
  elbow: "down",
  shape: "rest",
});
// Руки на коленях (не видны за столом).
export const LAP: WorldArm = { target: null, shape: "rest" };

// Кадры сцены для реплики и действия.
export const sceneFrames = (tl: L815Timeline, scene: L815SceneId) => {
  const s = tl.scenes.find((x) => x.id === scene)!;
  const line = (id: string) => {
    const c = tl.cues.find((x) => x.id === id)!;
    return { from: c.fromFrame - s.from, to: c.toFrame - s.from, mid: Math.round((c.fromFrame + c.toFrame) / 2) - s.from };
  };
  const action = (id: string) => {
    const a = tl.actions.find((x) => x.id === id)!;
    return { from: a.from - s.from, to: a.to - s.from, len: a.to - a.from };
  };
  const pause = (question: string) => {
    const p = tl.pauses.find((x) => x.question === question)!;
    return { from: p.from - s.from, to: p.to - s.from };
  };
  return { start: s.from, end: s.to, len: s.to - s.from, line, action, pause };
};
export type Frames = ReturnType<typeof sceneFrames>;

export const FPS = L815_FPS;
export const sec = (s: number) => Math.round(s * FPS);

// Кто говорит в кадре сцены t (по репликам сцены) — для взглядов слушающих.
export const speakerAt = (tl: L815Timeline, sceneStart: number, t: number) => {
  const abs = sceneStart + t;
  const c = tl.cues.find((x) => abs >= x.fromFrame - 4 && abs <= x.toFrame + 6);
  return c?.role ?? null;
};

// Точка в мире, куда смотрит персонаж, → поворот головы −1…1.
export const turnTo = (p: Place, target: Vec) => Math.max(-1, Math.min(1, (target.x - p.x) / 420));
export const lookDownTo = (p: Place, target: Vec, headY = 0.4) => Math.max(-0.6, Math.min(0.9, (target.y - (p.y - p.h * headY)) / 260));

export type CastFns = {
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly blinks?: readonly number[];
};
