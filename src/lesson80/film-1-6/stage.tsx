// «Стейдж» фильма: комната со всеми 26 персонажами и планы дерева.
// Сцена описывает только то, что отличается: позы и взгляды главных героев,
// куда смотрит массовка, подсветка доски, планы камеры. Всё остальное —
// постоянная постановка: места учеников, их внешность, посадка на ковре,
// редкие индивидуальные микродвижения (по seed, без общего ритма).
import { useContext, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { birdPoseAt } from "../bird/birdPose";
import { SceneContext, TimelineContext, useScene, useTimeline } from "../core/context";
import { box, Shot, type Cam } from "../core/shots";
import { FPS } from "../core/video";
import { heightForAge, MAIN, PUPILS, TEACHER, type Pupil } from "../characters/characterConfig";
import { Actor, type Place, type PoseIn, type WorldArm } from "../rig/Actor";
import { clamp, hash01, keys, lerp, smoothstep } from "../rig/motion";
import { LowTable, ROOM, RoomBack, depth } from "../sets/Classroom";
import { TreeWorld } from "../sets/Tree";
import { materialAt, nestCountAt } from "./birdPlan";
import { lineFrames } from "../core/context";

export type CharCtl = {
  readonly face?: (t: number) => number; // −1…1 (абсолютный поворот)
  readonly pose?: (t: number) => PoseIn;
  readonly place?: (t: number) => Place; // перемещение (Юсуф делает шаг)
};

// Куда смотрит массовка в кадре t: x мира (окно, учитель, говорящий).
export type Attention = (t: number) => number;

export const WINDOW_X = ROOM.window.x + ROOM.window.w * 0.6;
export const TEACHER_X: number = ROOM.teacher.x;

// Поворот головы к точке мира из точки x (мягко, в профиль не уходит).
export const faceTo = (targetX: number, x: number) => clamp((targetX - x) / 760, -0.85, 0.85);

// Место ученика на ковре (ступни) и рост с учётом глубины.
export const pupilPlace = (p: Pupil): Place => {
  const y = ROOM.rowY[p.seat.row];
  return { x: p.seat.x, y, h: heightForAge(p.age) * depth(y) };
};
export const teacherPlace: Place = { x: ROOM.teacher.x, y: ROOM.teacher.y, h: 760 * depth(ROOM.teacher.y) };

// Сидя на полу: кисти лежат на бёдрах/коленях.
export const kneeHands = (p: Place): { armL: WorldArm; armR: WorldArm } => ({
  armL: { target: { x: p.x - 0.155 * p.h, y: p.y - 0.05 * p.h }, shape: "relax", elbow: "in" },
  armR: { target: { x: p.x + 0.155 * p.h, y: p.y - 0.05 * p.h }, shape: "relax", elbow: "in" },
});

// Юсуф держит незавершённую лодочку: левая кисть держит лист, правая у края.
export const paperL = (p: Place) => ({ x: p.x - 0.06 * p.h, y: p.y - 0.27 * p.h });
export const paperR = (p: Place) => ({ x: p.x + 0.1 * p.h, y: p.y - 0.26 * p.h });
export const holdPaper = (p: Place, fold = 0.35): { armL: WorldArm; armR: WorldArm } => ({
  armL: { target: paperL(p), shape: "fist", item: "paper", flat: fold, itemTilt: 10, elbow: "down" },
  armR: { target: paperR(p), shape: "pinch", elbow: "out" },
});
// Кисть указывает в сторону окна (справа).
export const pointWindow = (p: Place): WorldArm => ({ target: { x: p.x + 0.3 * p.h, y: p.y - 0.52 * p.h }, shape: "point", elbow: "out" });
// Небольшой жест открытой ладонью (говорящий ребёнок).
export const smallGesture = (p: Place, side: -1 | 1): WorldArm => ({ target: { x: p.x + side * 0.18 * p.h, y: p.y - 0.3 * p.h }, shape: "open", elbow: "out" });
// Жест учителя: открытая ладонь к группе/окну.
export const teacherGesture = (p: Place, dx: number, dy: number): WorldArm => ({ target: { x: p.x + dx * p.h, y: p.y + dy * p.h }, shape: "open", elbow: "out" });
export const teacherRest: WorldArm = { target: null, shape: "relax" };

// Микродвижения фонового ученика: редкие, индивидуальные.
const bgMicro = (t: number, seed: number) => {
  const period = 150 + Math.floor(hash01(seed) * 120);
  const k = Math.floor(t / period);
  const local = t - k * period;
  const r = hash01(seed * 7 + k * 3);
  const shift = r < 0.3 && local < 40 ? Math.sin((local / 40) * Math.PI) : 0; // поправил посадку
  const tilt = r > 0.7 && local > 60 && local < 140 ? smoothstep((local - 60) / 20) * (1 - smoothstep((local - 120) / 20)) : 0;
  return { lean: shift * 3, headTilt: tilt * (hash01(seed + 2) > 0.5 ? 5 : -5), lookY: 0.05 };
};

// Как ученик следует за вниманием группы: со своей задержкой; часть детей
// продолжает смотреть на учителя.
const bgFace = (attention: Attention, p: Pupil, t: number) => {
  const delay = 3 + Math.floor(hash01(p.seed + 5) * 14);
  const stubborn = hash01(p.seed + 9) > 0.82;
  const target = stubborn ? TEACHER_X : attention(t - delay);
  return faceTo(target, p.seat.x);
};

export type RoomProps = {
  readonly f: number; // кадр сцены
  readonly chars?: Partial<Record<"yusuf" | "amir" | "bilal" | "teacher", CharCtl>>;
  readonly attention: Attention;
  readonly board?: number; // появление иллюстрации на доске 0…1
  readonly seedOffset?: number;
};

// Поза птицы и гнездо для абсолютного кадра (используют и комната, и дерево).
export const useBird = (f: number) => {
  const tl = useTimeline();
  const sc = useScene();
  const abs = f + sc.from;
  return { pose: birdPoseAt(tl, abs), placed: nestCountAt(tl, abs), grassOnGround: materialAt(tl, abs) === "ground", abs };
};

export const Room: React.FC<RoomProps> = ({ f, chars = {}, attention, board = 0 }) => {
  const bird = useBird(f);
  const mainCtl = (id: "yusuf" | "amir" | "bilal"): CharCtl => chars[id] ?? {};
  const renderPupil = (p: Pupil) => {
    const base = pupilPlace(p);
    const isMain = p.main;
    const ctl = isMain ? mainCtl(p.id as "yusuf") : {};
    const place = ctl.place ?? (() => base);
    const face = ctl.face ?? ((t: number) => bgFace(attention, p, t));
    const pose = (t: number): PoseIn => {
      const pl = place(t);
      const micro = bgMicro(t, p.seed);
      const kh = kneeHands(pl);
      const own = ctl.pose?.(t) ?? {};
      return { floorSit: 1, expr: "listening", ...kh, ...micro, ...own };
    };
    return (
      <Actor
        key={p.id}
        uid={`r-${p.id}`}
        look={p.look}
        f={f}
        place={place}
        face={face}
        pose={pose}
        role={isMain ? (p.id as "yusuf") : undefined}
        chorus={!isMain && hash01(p.seed + 1) > 0.35}
        seed={p.seed}
      />
    );
  };
  // порядок рисования: дальние ряды раньше
  const ordered = [...PUPILS].sort((a, b) => b.seat.row - a.seat.row || a.seat.x - b.seat.x);
  const tc = chars.teacher ?? {};
  const tPlace = tc.place ?? (() => teacherPlace);
  const tFace = tc.face ?? ((t: number) => faceTo(attention(t) === TEACHER_X ? 1250 : attention(t), teacherPlace.x) * 0.9);
  const tPose = (t: number): PoseIn => ({ expr: "calm", armL: { target: null, shape: "relax" }, armR: { target: null, shape: "relax" }, ...(tc.pose?.(t) ?? {}) });
  return (
    <>
      <RoomBack pose={bird.pose} placed={bird.placed} f={bird.abs} grassOnGround={bird.grassOnGround} boardIllustration={board} />
      {ordered.filter((p) => p.seat.row >= 1).map(renderPupil)}
      <Actor uid="r-teacher" look={TEACHER.look} f={f} place={tPlace} face={tFace} pose={tPose} role="muhammad" seed={3} />
      {ordered.filter((p) => p.seat.row === 0).map(renderPupil)}
      <LowTable />
      {/* главные мальчики — поверх стола, если он перед ними */}
      {ordered.filter((p) => p.main).map((p) => {
        const ctl = mainCtl(p.id as "yusuf");
        return ctl.place ? (
          <Actor key={`${p.id}-arms`} uid={`r-${p.id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={(t) => ({ floorSit: 1, ...kneeHands(ctl.place!(t)), ...(ctl.pose?.(t) ?? {}) })} layer="arms" role={p.id as "yusuf"} seed={p.seed} />
        ) : null;
      })}
    </>
  );
};

// План дерева: мир дерева в SVG с камерой (центр и масштаб).
export const TreeShot: React.FC<{ readonly f: number; readonly cam: Cam }> = ({ f, cam }) => {
  const bird = useBird(f);
  const w = 1920 / cam.zoom;
  const h = 1080 / cam.zoom;
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: "#DCE9EF" })}>
      <svg width={1920} height={1080} viewBox={`${cam.x - w / 2} ${cam.y - h / 2} ${w} ${h}`}>
        <TreeWorld pose={bird.pose} placed={bird.placed} f={bird.abs} grassOnGround={bird.grassOnGround} />
      </svg>
    </div>
  );
};

// Описание плана сцены (кадры сцены).
export type ShotSpec =
  | { readonly kind: "room"; readonly from: number; readonly to: number; readonly cam: Cam | ((f: number) => Cam); readonly board?: (f: number) => number; readonly overlay?: React.ReactNode }
  | { readonly kind: "tree"; readonly from: number; readonly to: number; readonly cam: Cam | ((f: number) => Cam) };

// Рендер сцены по списку планов: активен один план.
export const Shots: React.FC<{ readonly shots: readonly ShotSpec[]; readonly room: Omit<RoomProps, "f" | "board"> }> = ({ shots, room }) => {
  const f = useCurrentFrame();
  const shot = shots.find((s) => f >= s.from && f < s.to) ?? shots[shots.length - 1];
  const cam = typeof shot.cam === "function" ? shot.cam(f) : shot.cam;
  if (shot.kind === "tree") return <TreeShot f={f} cam={cam} />;
  return (
    <Shot f={f} from={-1} to={Number.MAX_SAFE_INTEGER} cam={cam} bg="#F1E7D6" overlay={shot.overlay}>
      <Room f={f} chars={room.chars} attention={room.attention} board={shot.board?.(f) ?? 0} />
    </Shot>
  );
};

// Удобные якоря реплик в кадрах сцены.
export const useLines = () => {
  const tl = useContext(TimelineContext);
  const sc = useContext(SceneContext);
  return useMemo(() => {
    const L = (id: number) => lineFrames(tl, sc.from, id);
    return { L, len: sc.len, from: sc.from, tl };
  }, [tl, sc]);
};

// Внимание массовки по репликам сцены: пока говорит учитель — на него,
// пока говорит мальчик — на него; в указанных окнах — на окно.
export const attentionByLines = (
  lines: readonly { readonly id: number; readonly from: number; readonly to: number; readonly role: string }[],
  windowSpans: readonly (readonly [number, number])[] = [],
  fallback = TEACHER_X,
): Attention => {
  const xOf = (role: string) => (role === "muhammad" ? TEACHER_X : role === "yusuf" ? MAIN.yusuf.seat.x : role === "amir" ? MAIN.amir.seat.x : role === "bilal" ? MAIN.bilal.seat.x : fallback);
  return (t) => {
    for (const [a, b] of windowSpans) if (t >= a && t < b) return WINDOW_X;
    let cur = fallback;
    for (const l of lines) {
      if (t >= l.from - 6) cur = xOf(l.role);
    }
    return cur;
  };
};

// Небольшая плавная анимация числа по ключам (обёртка).
export const k = keys;
export const mix = lerp;
export const FRAMES = FPS;
