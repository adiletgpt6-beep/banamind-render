// Технический лист походки (80-1-3): учитель идёт от окна к низкому столику
// (мимо учеников слева, за столиком), останавливается, затем обходит столик
// и присаживается на колени у TEACHER_SPOT. Комната, столик и 25 учеников —
// как в WorldTest урока 1; порядок рисования — по глубине (линии опоры).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HERO_SEATS, SEATS, TABLE, TEACHER_SPOT, WORLD, scaleAt } from "../../lesson01/layout";
import { Character, solveRig } from "../../lesson01/rig/Character";
import type { P } from "../../lesson01/rig/geom";
import { AMIR, BILAL, EXTRA_KIDS, TEACHER, YUSUF } from "../../lesson01/rig/looks";
import { FACE0, type Pose } from "../../lesson01/rig/pose";
import { sitCross, stand } from "../../lesson01/rig/presets";
import { Table } from "../../lesson01/sets/Props";
import { RoomBack } from "../../lesson01/sets/Room";
import { footWorld, kneelBlend, kneelShadow, planWalk, walkAt } from "../rig/gait";

const f = (n: number) => n.toFixed(2);

// kids / table = false — убрать учеников / столик (ноги учителя видны целиком)
export type GaitTestProps = { view: "wide" | "medium" | "legs"; marks?: boolean; kids?: boolean; table?: boolean };

// Путь 1: от столика у окна — влево вдоль стены за спинами задних рядов,
// затем почти прямо к камере (левее всех учеников) — остановка за низким
// столиком (стопы видны над его дальним краем).
export const GAIT_PATH1: P[] = [
  { x: 2320, y: 1262 },
  { x: 2000, y: 1280 },
  { x: 1700, y: 1330 },
  { x: 1620, y: 1600 },
  { x: 1540, y: 1750 },
];
// Путь 2: за столиком влево и вокруг его левого края — к месту учителя
// (с запасом: когда учитель выходит перед столиком, ноги левее его угла).
export const GAIT_PATH2: P[] = [{ x: 1540, y: 1750 }, { x: 1250, y: 1885 }, TEACHER_SPOT];

const W1 = planWalk({ look: TEACHER, t0: 0.5, path: GAIT_PATH1, yawStart: 0.45, yawEnd: 0.2 });
const W2 = planWalk({ look: TEACHER, t0: W1.t1 + 1.2, path: GAIT_PATH2, yawStart: 0.2, yawEnd: 0.5 });
const KNEEL_T0 = W2.t1 + 0.15;
const KNEEL_DUR = 1.3;
export const GAIT_TEST_FRAMES = Math.ceil((KNEEL_T0 + KNEEL_DUR + 0.8) * 30);

// sortY — линия глубины для порядка рисования: стопа, уже вставшая перед
// столиком, выводит учителя вперёд раньше корня (иначе носок «прыгает»
// из-за ножки столика на передний план).
const frontFoot = (pl: typeof W1, t: number, y: number) => {
  if (t <= pl.t0 || t >= pl.t1) return y;
  const fw = footWorld(pl, t);
  return Math.max(y, ...(["L", "R"] as const).filter((sd) => fw[sd].planted).map((sd) => fw[sd].contact.y));
};
const teacherAt = (t: number): { root: P; pose: Pose; sortY: number } => {
  if (t < W2.t0) {
    const w = walkAt(W1, t);
    return { root: w.root, pose: w.pose, sortY: frontFoot(W1, t, w.root.y) };
  }
  if (t < KNEEL_T0) {
    const w = walkAt(W2, t);
    return { root: w.root, pose: w.pose, sortY: frontFoot(W2, t, w.root.y) };
  }
  return { root: TEACHER_SPOT, pose: kneelBlend(TEACHER, 0.5, (t - KNEEL_T0) / KNEEL_DUR), sortY: TEACHER_SPOT.y };
};

const kids = (() => {
  const heroes: Record<number, typeof YUSUF> = { [HERO_SEATS.yusuf]: YUSUF, [HERO_SEATS.amir]: AMIR, [HERO_SEATS.bilal]: BILAL };
  let k = 0;
  return SEATS.map((seat) => ({ seat, look: heroes[SEATS.indexOf(seat)] ?? EXTRA_KIDS[k++].look }));
})();

// Отладочные метки: путь корня и точки постановки стоп.
const Marks: React.FC<{ t: number }> = ({ t }) => {
  const plans = [W1, W2];
  return (
    <g>
      {plans.map((pl, i) => (
        <g key={i}>
          <polyline points={pl.pts.map((p) => `${f(p.x)},${f(p.y)}`).join(" ")} fill="none" stroke="#e0c040" strokeWidth={2} strokeDasharray="8 6" />
          {(["L", "R"] as const).flatMap((sd) =>
            pl.falls[sd].map((fl, j) => <circle key={`${sd}${j}`} cx={f(fl.at.x)} cy={f(fl.at.y)} r={5} fill={sd === "L" ? "#e05050" : "#40a0e0"} />),
          )}
        </g>
      ))}
      {t > W1.t0 && t < W1.t1
        ? (["L", "R"] as const).map((sd) => {
            const fw = footWorld(W1, t)[sd];
            return <circle key={sd} cx={f(fw.contact.x)} cy={f(fw.contact.y)} r={9} fill="none" stroke={fw.planted ? "#20c060" : "#c0c0c0"} strokeWidth={3} />;
          })
        : null}
      {t > W2.t0 && t < W2.t1
        ? (["L", "R"] as const).map((sd) => {
            const fw = footWorld(W2, t)[sd];
            return <circle key={sd} cx={f(fw.contact.x)} cy={f(fw.contact.y)} r={9} fill="none" stroke={fw.planted ? "#20c060" : "#c0c0c0"} strokeWidth={3} />;
          })
        : null}
    </g>
  );
};

export const GaitTest: React.FC<GaitTestProps> = ({ view = "wide", marks = false, kids: showKids = true, table = true }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const T = teacherAt(t);
  const ts = scaleAt(T.root.y);
  type Item = { y: number; key: string; el: React.ReactNode };
  const items: Item[] = (showKids ? kids : []).map(({ seat, look }) => ({
    y: seat.y,
    key: look.key,
    el: <Character key={look.key} uid={look.key} look={look} pose={sitCross(look, -0.45)} face={{ ...FACE0, gaze: { x: -0.5, y: 0.1 } }} x={seat.x} y={seat.y} scale={scaleAt(seat.y)} />,
  }));
  if (table) items.push({ y: TABLE.floorY, key: "table", el: <Table key="table" x={TABLE.x} floorY={TABLE.floorY} s={scaleAt(TABLE.floorY)} w={TABLE.w} legH={TABLE.legH} topD={TABLE.topD} /> });
  const face = { ...FACE0, smile: 0.4, gaze: { x: T.pose.headYaw * 0.9, y: 0.1 } };
  // на коленях тень рисуем сами — без скачка размера
  const ku = (t - KNEEL_T0) / KNEEL_DUR;
  const sh = ku > 0 ? kneelShadow(TEACHER, ku) : null;
  items.push({
    y: T.sortY,
    key: "teacher",
    el: (
      <g key="teacher">
        {sh ? <ellipse cx={f(T.root.x)} cy={f(T.root.y)} rx={f(sh.rx * ts)} ry={f(sh.ry * ts)} fill="#5a3b2c" opacity={0.2} /> : null}
        <Character uid="teacher" look={TEACHER} pose={T.pose} face={face} x={T.root.x} y={T.root.y} scale={ts} shadow={!sh} />
      </g>
    ),
  });
  items.sort((a, b) => a.y - b.y);

  // средний план: окно ≥ 1400×787.5 следует за учителем, фигура — целиком
  let vb = `0 0 ${WORLD.w} ${WORLD.h}`;
  if (view !== "wide") {
    // «legs» — крупно ноги (проверка стоп и коленей)
    const top = solveRig(TEACHER, T.pose).headC.y - TEACHER.body.headH * 0.75;
    const topStand = solveRig(TEACHER, stand(TEACHER, 0)).headC.y - TEACHER.body.headH * 0.75;
    const h = view === "legs" ? 450 : Math.max(787.5, -topStand * ts + 130);
    const w = (h * 16) / 9;
    const cx = Math.min(WORLD.w - w / 2, Math.max(w / 2, T.root.x));
    // средний план — макушка у верхнего края (стоя и на коленях); «legs» — по ногам
    const cy0 = view === "legs" ? T.root.y - 160 * ts : T.root.y + top * ts - 50 + h / 2;
    const cy = Math.min(WORLD.h - h / 2, Math.max(h / 2, cy0));
    vb = `${f(cx - w / 2)} ${f(cy - h / 2)} ${f(w)} ${f(h)}`;
  }
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      <svg width={1920} height={1080} viewBox={vb}>
        <RoomBack t={t} />
        {items.map((i) => (
          <React.Fragment key={i.key}>{i.el}</React.Fragment>
        ))}
        {marks ? <Marks t={t} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
