// S10 · Мама на выступлении, папа сам забирает сына.
//
// 10A — зал: мама в синем жакете с бейджем стоит у кафедры, ладонь на
//       раскрытой жёлтой папке, второй рукой спокойно показывает на экран;
//       зрители со спины на переднем плане. Лёгкий наезд.
// 10B — школьные ворота: папа ждёт у тротуара, сын выходит, машет, подходит;
//       ладонь папы ложится ему на плечо.
// 10C — серая машина у тротуара: сын уже на заднем сиденье, папа мягко
//       закрывает заднюю дверь.
// 10D — вставка: детские руки защёлкивают ремень (щелчок).
// 10E — машина едет по улице, папа за рулём, сын смотрит в окно; горы.
import { useScene, usePlan, Shot, Svg, camMove, camKeys, useInk, Ring } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, glide, keys, keysV, lerpV, type Vec } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { murmur } from "../context";
import { HALL, HallBack, Lectern, Audience } from "../sets/Hall";
import { SCHOOL, SchoolBack, SchoolFence, SchoolFront, schoolScale, TinyPerson } from "../sets/School";
import { STREET, StreetBack } from "../sets/Street";
import { CarBody, CarCabin, carDoorEdge, carPt, CAR_FLOOR, CAR_SEAT_X, type CarPlace } from "../props/Car";
import { BadgeOnChest } from "../props/Badge";
import { CloseHand, SKIN } from "../props/CloseHand";
import { H } from "./common";
import type { Sd2SfxPlan } from "../sfx";

export const tripPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "trip");
  const gate = T.word("N09", "уулун") - 6;
  const door = T.word("N09", "кетти") + 8;
  const belt = door + 40;
  const drive = belt + 34;
  return {
    len: T.len,
    gate,
    door,
    shut: door + 26, // дверь закрылась
    belt,
    click: belt + 20,
    drive,
  };
};
type Plan = ReturnType<typeof tripPlan>;

// ---------- 10A: зал ----------
const Hall: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const mom = { x: HALL.mom.x, y: HALL.stageTop + 22, h: 640 };
  const k = mom.h / 1000;
  const L = HALL.lectern;
  const pose = (t: number): PoseIn => ({
    expr: t < 16 ? EXPR.calm : EXPR.softSmile,
    lookY: 0.04,
    nod: keys(t, [[18, 0], [24, 3], [32, 0], [48, 0], [54, 3], [62, 0]]),
    armR: { target: { x: L.x - 30, y: L.top - 8 }, shape: "relax", elbow: "down" },
    armL: {
      target: keysV(t, [
        [0, { x: mom.x - 60, y: mom.y - 330 * k * 1.25 }],
        [14, { x: mom.x - 170, y: mom.y - 640 * k }],
        [40, { x: mom.x - 190, y: mom.y - 660 * k }],
        [56, { x: mom.x - 110, y: mom.y - 560 * k }],
      ]),
      shape: t > 10 && t < 50 ? "open" : "relax",
      elbow: "down",
    },
  });
  const face = (t: number) => keys(t, [[0, 0.1], [12, -0.3], [40, -0.3], [54, 0.05]]);
  const cam = camMove(f, 0, p.gate, { x: 560, y: 1000, zoom: 1.4 }, { x: 590, y: 960, zoom: 1.56 });
  const actor = (layer: "body" | "arms") => (
    <Actor uid="s10-mom" look="momTalk" f={f} place={() => mom} face={face} pose={pose} seed={1} layer={layer} talk={(t) => murmur(t, 6, p.gate, 3, 0.45)} />
  );
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <HallBack ink={ink} uid="s10-hall" />
      {actor("body")}
      <Svg>
        <BadgeOnChest neckL={{ x: mom.x - 22 * k - 4, y: mom.y - 790 * k }} neckR={{ x: mom.x + 22 * k - 4, y: mom.y - 790 * k }} card={{ x: mom.x + 2, y: mom.y - 660 * k }} w={40} ink={ink} />
      </Svg>
      {actor("arms")}
      <Lectern ink={ink} />
      <Audience ink={ink} y={1430} t={f} />
    </Shot>
  );
};

// ---------- 10B: у школьных ворот ----------
const SON_PATH: readonly Vec[] = [
  { x: SCHOOL.exit.x, y: SCHOOL.exit.y },
  { x: SCHOOL.gate.x + SCHOOL.gate.w / 2, y: SCHOOL.fenceY - 6 },
  { x: SCHOOL.gate.x + SCHOOL.gate.w / 2 + 70, y: SCHOOL.fenceY + 60 },
  { x: SCHOOL.meet.x - 160, y: SCHOOL.meet.y - 4 },
];
const Gate: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const t0 = p.gate;
  const walkEnd = t0 + Math.min(54, p.door - t0 - 24);
  const sonPlace = (t: number) => {
    const q = glide(t, t0 + 2, walkEnd, SON_PATH);
    return { x: q.x, y: q.y, h: H.son * schoolScale(q.y) };
  };
  const dad = { x: SCHOOL.meet.x, y: SCHOOL.meet.y, h: H.dad };
  const sonP = sonPlace(f);
  const inYard = sonP.y < SCHOOL.fenceY;
  const wave = (t: number) => clamp((t - t0 - 6) / 6) * (1 - clamp((t - t0 - 26) / 8));
  const hold = (t: number) => clamp((t - walkEnd + 6) / 10);
  const sonPose = (t: number): PoseIn => {
    const sp = sonPlace(t);
    const w = wave(t);
    return {
      expr: EXPR.smile,
      lookY: -0.12,
      armR: w > 0 ? { target: { x: sp.x + sp.h * 0.2, y: sp.y - sp.h * (0.78 + 0.04 * Math.sin(t / 2.4)) }, shape: "wave", elbow: "out" } : { target: null },
      armL: { target: null },
    };
  };
  const shoulder = (t: number): Vec => {
    const sp = sonPlace(t);
    return { x: sp.x + 30, y: sp.y - sp.h * 0.78 };
  };
  const dadPose = (t: number): PoseIn => {
    const h = hold(t);
    const w = clamp((t - t0 - 12) / 6) * (1 - clamp((t - t0 - 30) / 8));
    return {
      expr: EXPR.smile,
      lookY: 0.12 + h * 0.14,
      armL:
        h > 0
          ? { target: lerpV({ x: dad.x - 70, y: dad.y - 380 }, shoulder(t), easeInOut(h)), shape: h > 0.7 ? "open" : "relax", elbow: "down" }
          : w > 0
            ? { target: { x: dad.x - 150, y: dad.y - 720 - 10 * Math.sin(t / 2.6) }, shape: "wave", elbow: "out" }
            : { target: null },
      armR: { target: null },
      crouch: h * 0.12,
    };
  };
  const son = <Actor uid="s10-son" look="sonSchool" f={f} place={sonPlace} face={(t) => (t < walkEnd - 12 ? 0.1 : 0.55)} pose={sonPose} seed={3} />;
  const cam = camMove(f, t0, p.door, { x: 590, y: 1110, zoom: 1.2 }, { x: 620, y: 1130, zoom: 1.32 });
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <SchoolBack ink={ink} uid="s10-sch" />
      <Svg>
        <TinyPerson x={640} y={1120} h={150} ink={ink} top="#B4785C" kid pack="#7A6BC4" arm={0.2} />
        <TinyPerson x={560} y={1108} h={210} ink={ink} top="#8C7A9E" />
        <TinyPerson x={150} y={1100} h={146} ink={ink} top="#4F9A92" kid pack="#D9A85F" step={0.5} />
      </Svg>
      {inYard ? son : null}
      <SchoolFence ink={ink} uid="s10-sch" />
      <Actor uid="s10-dad" look="dadWork" f={f} place={() => dad} face={(t) => (t < t0 + 8 ? -0.2 : -0.55)} pose={dadPose} seed={2} />
      {inYard ? null : son}
      <SchoolFront ink={ink} uid="s10-sch" />
    </Shot>
  );
};

// ---------- машина (10C, 10E) ----------
const CAR_S = 1;
const carAt = (x: number): CarPlace => ({ x, y: STREET.curb - 18, len: 860 * CAR_S, dir: -1 });
const SON_IN_CAR_H = 262;
const DAD_IN_CAR_H = 318;
const passengers = (c: CarPlace, f: number, sonFace: (t: number) => number, bob: number) => {
  const s = carPt(c, CAR_SEAT_X.rear, CAR_FLOOR);
  const d = carPt(c, CAR_SEAT_X.front, CAR_FLOOR - 8);
  return (
    <>
      <Actor
        uid="s10-dad-car"
        look="dadWork"
        f={f}
        place={() => ({ x: d.x, y: d.y + bob, h: DAD_IN_CAR_H })}
        face={() => -0.75}
        pose={() => ({ sit: 1, seat: 50, expr: EXPR.calm, armL: { target: carPt(c, 150, -196), shape: "fist", elbow: "down" }, armR: { target: carPt(c, 140, -206), shape: "fist", elbow: "down" } })}
        seed={2}
      />
      <Actor
        uid="s10-son-car"
        look="sonSchool"
        f={f}
        place={() => ({ x: s.x, y: s.y + bob, h: SON_IN_CAR_H })}
        face={sonFace}
        pose={() => ({ sit: 1, seat: SON_IN_CAR_H * 0.31, expr: EXPR.smile, lookY: 0.05, packOff: true })}
        seed={3}
      />
    </>
  );
};

const Door: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const t0 = p.door;
  const c = carAt(540);
  const door = 1 - easeInOut((f - t0 - 10) / (p.shut - t0 - 10));
  const dad = { x: 870, y: STREET.walkTop + 52, h: 380 };
  const edge = carDoorEdge(c, door);
  const dadPose = (): PoseIn => ({
    expr: EXPR.softSmile,
    lookY: 0.1,
    armL: { target: { x: edge.x + 6, y: edge.y + 8 }, shape: "open", elbow: "down" },
    armR: { target: null },
    lean: 4 * (1 - door),
  });
  const cam = camMove(f, t0, p.belt, { x: 610, y: 1060, zoom: 1.32 }, { x: 600, y: 1064, zoom: 1.38 });
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <StreetBack ink={ink} uid="s10-st" />
      <Svg>
        <CarCabin {...c} ink={ink} />
      </Svg>
      {passengers(c, f, () => -0.5, 0)}
      <Svg>
        <CarBody {...c} ink={ink} door={door} />
      </Svg>
      <Actor uid="s10-dad-door" look="dadWork" f={f} place={() => dad} face={() => -0.55} pose={dadPose} seed={2} />
    </Shot>
  );
};

// 10D: вставка — ремень безопасности.
const Belt: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const ink = useInk(4);
  const t = f - p.belt;
  const ins = easeInOut(t / 20); // язычок идёт к замку
  const buckle: Vec = { x: 380, y: 1260 };
  const from: Vec = { x: 700, y: 1000 };
  const tongue = lerpV(from, { x: buckle.x + 46, y: buckle.y - 30 }, ins);
  const ang = Math.atan2(buckle.y - from.y, buckle.x - from.x);
  return (
    <Shot f={f} cam={{ x: 540, y: 1080, zoom: 1 + t * 0.002 }} bg="#5B636E">
      <Svg>
        {/* сиденье: ткань и прострочка */}
        <rect x={-100} y={300} width={1300} height={1700} fill="#5B636E" />
        {[520, 760, 1000, 1240, 1480].map((y) => (
          <path key={y} d={`M -100 ${y} Q 540 ${y + 30} 1200 ${y}`} fill="none" stroke="#4C535D" strokeWidth={ink * 1.6} strokeDasharray={`${ink * 3} ${ink * 2.4}`} />
        ))}
        {/* куртка ребёнка (колени и пояс) */}
        <path d={`M 120 1700 Q 300 1180 640 1120 Q 980 1080 1180 1220 L 1180 2000 L 120 2000 Z`} fill="#2F4A7A" stroke={C.ink} strokeWidth={ink} />
        {/* ремень от плеча к язычку */}
        <path d={`M 1180 640 L ${tongue.x + 30} ${tongue.y - 20}`} stroke="#2E333C" strokeWidth={70} strokeLinecap="butt" />
        <path d={`M 1180 640 L ${tongue.x + 30} ${tongue.y - 20}`} stroke="#3B414C" strokeWidth={58} strokeLinecap="butt" />
        {/* замок */}
        <path d={`M ${buckle.x - 160} ${buckle.y + 120} L ${buckle.x - 20} ${buckle.y + 10}`} stroke="#2E333C" strokeWidth={64} />
        <rect x={buckle.x - 40} y={buckle.y - 40} width={110} height={70} rx={18} fill="#2F3540" stroke={C.ink} strokeWidth={ink} transform={`rotate(${(ang * 180) / Math.PI} ${buckle.x} ${buckle.y})`} />
        <rect x={buckle.x - 14} y={buckle.y - 18} width={34} height={26} rx={8} fill="#C9574A" stroke={C.ink} strokeWidth={ink * 0.6} transform={`rotate(${(ang * 180) / Math.PI} ${buckle.x} ${buckle.y})`} />
        {/* язычок */}
        <g transform={`rotate(${(ang * 180) / Math.PI} ${tongue.x} ${tongue.y})`}>
          <rect x={tongue.x - 30} y={tongue.y - 30} width={80} height={60} rx={10} fill="#C9CED4" stroke={C.ink} strokeWidth={ink} />
          <rect x={tongue.x + 40} y={tongue.y - 14} width={40} height={28} rx={4} fill="#AEB4BC" stroke={C.ink} strokeWidth={ink * 0.7} />
        </g>
        {/* детские руки: правая ведёт язычок, левая придерживает замок */}
        <CloseHand x={tongue.x + 60} y={tongue.y - 90} angle={150} size={150} look={SKIN.sonSchool} shape="pinch" armLen={3} ink={ink} />
        <CloseHand x={buckle.x - 120} y={buckle.y + 150} angle={-60} size={140} look={SKIN.sonSchool} shape="open" armLen={3} ink={ink} mirror />
        {t >= p.click - p.belt ? <Ring x={buckle.x + 20} y={buckle.y - 10} r={110} t={t - (p.click - p.belt)} color={C.yellow} width={ink * 1.4} dur={12} /> : null}
      </Svg>
    </Shot>
  );
};

// 10E: машина едет.
const Drive: React.FC<{ f: number; p: Plan; len: number }> = ({ f, p, len }) => {
  const t = f - p.drive;
  const v = 16; // px/кадр
  const shift = t * v * clamp(t / 12 + 0.25); // плавный старт
  const bob = Math.sin(t / 3.1) * 1.6 + Math.sin(t / 7.3) * 1.2;
  const c = carAt(540);
  const cam = camKeys(f, [
    [p.drive, { x: 560, y: 1000, zoom: 1.08 }],
    [len, { x: 530, y: 990, zoom: 1.16 }],
  ]);
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <StreetBack ink={ink} uid="s10-dr" shift={shift} />
      <Svg>
        <g transform={`translate(0 ${bob})`}>
          <CarCabin {...c} ink={ink} />
        </g>
      </Svg>
      {passengers(c, f, (tt) => keys(tt, [[p.drive, -0.5], [p.drive + 40, -0.1]]), bob)}
      <Svg>
        <CarBody {...c} ink={ink} wheel={(shift / 64) * 57.3} bob={bob} />
      </Svg>
    </Shot>
  );
};

export const S10Trip: React.FC = () => {
  const { f, len } = useScene("trip");
  const p = usePlan(tripPlan);
  if (f < p.gate) return <Hall f={f} p={p} />;
  if (f < p.door) return <Gate f={f} p={p} />;
  if (f < p.belt) return <Door f={f} p={p} />;
  if (f < p.drive) return <Belt f={f} p={p} />;
  return <Drive f={f} p={p} len={len} />;
};

// Звук: тихий зал, двор, дверь машины, щелчок ремня, салон в движении.
export const sfxS10Trip: Sd2SfxPlan = (tl) => {
  const p = tripPlan(tl);
  return [
    { at: 0, kind: "hall", dur: p.gate / 30 + 0.2 },
    { at: p.gate, kind: "yard", dur: (p.door - p.gate) / 30 + 0.3 },
    { at: p.shut - 4, kind: "car-door" },
    { at: p.click - 2, kind: "belt" },
    { at: p.drive, kind: "car", dur: (p.len - p.drive) / 30 },
  ];
};
