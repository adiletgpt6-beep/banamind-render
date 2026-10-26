// Служебная композиция Lesson80-1-9-RigLab (300 кадров): проверка
// расширений рига 80-1-9 в классе (RoomBack + столик из 80-1-8).
//   0–89    Юсуф сидит на полу; правая рука (слева на экране) щепотью несёт
//           дольку яблока ко рту (цель — actorAnchors().mouth, aim "grip"),
//           откусывает и жуёт.
//   90–179  учитель: стоит → на колене → сидит на полу; тарелка на ладони
//           (palmUp), при посадке — обхват края (grip).
//   180–299 Билал держит коробку размером с поднос обеими руками (grip),
//           затем садится на пол (неявный путь через колено у rigStyle 2).
// Камера по умолчанию — крупный план текущего героя; props.cam задаёт свою
// (рендер кадров с --props), props.bilalKneel — явный kneel у Билала.
import { useCurrentFrame } from "remotion";
import { nestingBirdPose } from "../../bird/birdPose";
import { Shot, type Cam } from "../../core/shots";
import { Actor, actorAnchors, breathAt, chewPhaseAt, type ActorAnchors, type Place, type PoseIn } from "../../rig/Actor";
import type { Look } from "../../rig/looks";
import type { HandShape } from "../../rig/pose";
import { clamp, easeInOut, keys, keysV, lerp, smoothstep, type Vec } from "../../rig/motion";
import { RoomBack } from "../../sets/Classroom";
import { castById, heightAt, TEACHER, TEACHER_H } from "../../film-1-8/cast";
import { depth } from "../../sets/roomLayout";
import { Table } from "../../film-1-8/set";
import { TABLE_SURFACE_Y } from "../layout";

const style2 = (l: Look): Look => ({ ...l, rigStyle: 2 });

// Долька яблока (в мире): центр — точка захвата; bitten — откушено.
const Slice: React.FC<{ at: Vec; w: number; bitten: number; tilt: number }> = ({ at, w, bitten, tilt }) => {
  // откушенная долька короче, край укуса — волнистый
  const r = w / 2;
  const e = bitten > 0 ? r * 0.25 : r;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g transform={`translate(${at.x} ${at.y}) rotate(${tilt})`}>
        <path d={`M ${-r} 0 Q ${(e - r) / 2} ${w * 0.42} ${e} ${w * 0.18} L ${e} ${-w * 0.02} Q ${(e - r) / 2} ${w * 0.1} ${-r} 0 Z`} fill="#C8423A" />
        <path d={`M ${-r + 1} -0.5 Q ${(e - r) / 2} ${w * 0.3} ${e} ${w * 0.12} ${bitten > 0 ? `Q ${e - w * 0.06} ${w * 0.02} ${e} ${-w * 0.12}` : `L ${e} ${-w * 0.08}`} Q ${(e - r) / 2} ${-w * 0.2} ${-r + 1} -0.5 Z`} fill="#F7EBC8" />
      </g>
    </svg>
  );
};

// Тарелка (вид спереди): дно в точке at, ширина w.
const Plate: React.FC<{ at: Vec; w: number; slices?: number }> = ({ at, w, slices = 0 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <g transform={`translate(${at.x} ${at.y})`}>
      <ellipse cx={0} cy={-w * 0.07} rx={w / 2} ry={w * 0.12} fill="#F4F1EA" stroke="#D8D1C2" strokeWidth={1.2} />
      <ellipse cx={0} cy={-w * 0.085} rx={w * 0.32} ry={w * 0.07} fill="#E9E4D8" />
      {Array.from({ length: slices }, (_, i) => (
        <g key={i} transform={`translate(${(i - (slices - 1) / 2) * w * 0.22} ${-w * 0.13}) rotate(${(i - (slices - 1) / 2) * 14})`}>
          <path d={`M ${-w * 0.13} 0 Q 0 ${w * 0.12} ${w * 0.13} 0 Q 0 ${w * 0.05} ${-w * 0.13} 0 Z`} fill="#C8423A" />
          <path d={`M ${-w * 0.125} -0.5 Q 0 ${w * 0.08} ${w * 0.125} -0.5 Q 0 ${-w * 0.07} ${-w * 0.125} -0.5 Z`} fill="#F7EBC8" />
        </g>
      ))}
    </g>
  </svg>
);

// Коробка размером с поднос (центр, ширина, высота).
const Box: React.FC<{ c: Vec; w: number; h: number }> = ({ c, w, h }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <g transform={`translate(${c.x} ${c.y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="#C99A63" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.22} rx={3} fill="#DDB37E" />
      <rect x={-w * 0.12} y={-h / 2} width={w * 0.24} height={h} fill="#B98953" opacity={0.6} />
      <rect x={-w / 2} y={h * 0.3} width={w} height={h * 0.2} rx={3} fill="#A97A47" opacity={0.5} />
    </g>
  </svg>
);

type Props = { readonly cam?: Cam; readonly bilalKneel?: boolean; readonly gallery?: boolean; readonly anchors?: boolean };

// Опорные точки actorAnchors поверх рисунка (props.anchors): проверка, что
// они совпадают с нарисованными головой, ртом, подбородком, шеей, плечами.
const Dots: React.FC<{ a: ActorAnchors }> = ({ a }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {(Object.entries(a) as [string, Vec][]).map(([k, v]) => (
      <circle key={k} cx={v.x} cy={v.y} r={1.6} fill={k === "mouth" ? "#00C8FF" : k === "chin" ? "#FF00C8" : k.startsWith("grip") ? "#00E060" : "#FF2020"} />
    ))}
  </svg>
);

// Все формы кисти стиля 2 крупно (props.gallery): кадр f — чётный —
// учитель, нечётный — Юсуф; f / 2 — формы 0–3 или 4–6. Левая на экране
// рука — перед грудью, правая — поднята в сторону.
const SHAPES: readonly HandShape[] = ["relax", "open", "fist", "point", "pinch", "grip", "palmUp"];
const Gallery: React.FC<{ f: number }> = ({ f }) => (f >= 4 ? <ChewGallery f={f} /> : <HandGallery f={f} />);

// Жевание крупно (кадры ≥ 4): учитель, Юсуф, Билал; в каждой паре слева —
// челюсть вверху (фаза 0), справа — внизу (фаза 0,5); f = 5 — без жевания.
const ChewGallery: React.FC<{ f: number }> = ({ f }) => {
  const y = castById("yusuf");
  const bl = castById("bilal");
  const looks = [style2(TEACHER.look), style2(y.look), style2(bl.look)];
  const hs = [1950, 1400, 1800];
  const headY = [0.884, 0.806, 0.862];
  const on = f !== 5;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F1E7D6", overflow: "hidden" }}>
      {looks.flatMap((look, i) =>
        [0, 1].map((k) => {
          const P: Place = { x: 160 + (i * 2 + k) * 320, y: 400 + headY[i] * hs[i], h: hs[i] };
          return <Actor key={`${i}${k}`} uid={`c${i}${k}`} look={look} f={k * 7.5} place={() => P} pose={() => ({ expr: "calm", chew: on ? 1 : 0, mouthFull: on ? 0.6 : 0 })} seed={3} />;
        }),
      )}
    </div>
  );
};

const HandGallery: React.FC<{ f: number }> = ({ f }) => {
  const y = castById("yusuf");
  const child = f % 2 === 1;
  const look = style2(child ? y.look : TEACHER.look);
  const h = child ? 2600 : 1900;
  const top = child ? 0.86 : 0.93; // доля роста над краем кадра
  const page = Math.floor(f / 2) % 2;
  const shapes = SHAPES.slice(page * 4, page * 4 + 4);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F1E7D6", overflow: "hidden" }}>
      {shapes.map((shape, i) => {
        const P: Place = { x: 240 + i * 480, y: h * top - 30, h };
        const pose = (): PoseIn => ({
          expr: "calm",
          armL: { target: { x: P.x + 0.03 * h, y: P.y - (child ? 0.5 : 0.6) * h }, shape, elbow: "down" },
          armR: { target: { x: P.x + 0.17 * h, y: P.y - (child ? 0.74 : 0.86) * h }, shape, elbow: "out" },
        });
        return <Actor key={shape} uid={`g${i}`} look={look} f={0} place={() => P} pose={pose} seed={3} />;
      })}
    </div>
  );
};

export const RigLab: React.FC<Props> = ({ cam, bilalKneel = false, gallery = false, anchors = false }) => {
  const f = useCurrentFrame();
  if (gallery) return <Gallery f={f} />;

  // ---------- Юсуф: долька ко рту и жевание ----------
  const y = castById("yusuf");
  const yLook = style2(y.look);
  const yP: Place = { x: 2150, y: 1340, h: heightAt(y.age, 1340) };
  const yFace = 0.12;
  const ySeed = y.seed;
  const yPlate = { x: 2088, y: TABLE_SURFACE_Y };
  const yBase: PoseIn = { floorSit: 1, expr: "calm" };
  const yAnch = (pose: PoseIn, t: number) => actorAnchors({ look: yLook, place: yP, pose, bodyTurn: yFace * 0.8, headTurn: yFace, breath: breathAt(t, ySeed), chewPhase: chewPhaseAt(t) });
  const chewAt = (t: number) => (t < 90 ? clamp((t - 47) / 4) * (1 - clamp((t - 84) / 5)) : 0);
  const biteAt = (t: number) => (t < 90 ? smoothstep((t - 36) / 5) * (1 - smoothstep((t - 44) / 3)) : 0);
  const yPoseAt = (t: number): PoseIn => {
    const chew = chewAt(t);
    const mouth = yAnch(yBase, t).mouth;
    // кисти лежат на краю столика
    const rest: Vec = { x: yP.x - 0.03 * yP.h, y: TABLE_SURFACE_Y - 4 };
    const pick: Vec = { x: yPlate.x + 4, y: yPlate.y - 12 };
    // щепоть: со стола ко рту, укус, обратно
    const g = keysV(t, [
      [0, rest],
      [10, rest],
      [22, pick],
      [26, pick],
      [38, { x: mouth.x - 2, y: mouth.y + 3 }],
      [44, { x: mouth.x - 2, y: mouth.y + 3 }],
      [58, { x: rest.x + 10, y: rest.y - 30 }],
      [90, { x: rest.x + 10, y: rest.y - 30 }],
    ]);
    const shape = t >= 18 && t < 64 ? "pinch" : "relax";
    return {
      ...yBase,
      lookY: t < 26 ? 0.55 : 0.05,
      nod: t >= 14 && t < 26 ? 4 : 0,
      chew,
      mouthFull: chew > 0 ? 0.6 * (1 - clamp((t - 70) / 18)) : 0,
      bite: biteAt(t),
      armL: { target: g, shape, elbow: "down", aim: "grip" },
      armR: { target: { x: yP.x + 0.06 * yP.h, y: TABLE_SURFACE_Y - 4 }, shape: "relax", elbow: "down", aim: "grip" },
    };
  };
  const yPose = yPoseAt(f);
  const yGrip = yAnch(yPose, f).gripL;
  const yHead0 = yAnch(yBase, 0).head;
  const sliceIn = f >= 24 && f < 90 && f < 76;

  // ---------- учитель: стоит → на колене → на полу; тарелка ----------
  const tLook = style2(TEACHER.look);
  const tY = 1430;
  const tP: Place = { x: 2470, y: tY, h: TEACHER_H * depth(tY) };
  const tFace = -0.32;
  const tu = clamp(f - 90, 0, 89);
  // как в хореографии: kneel убывает, пока растёт floorSit
  const tKneel = keys(tu, [
    [0, 0],
    [10, 0],
    [40, 1],
    [50, 1],
    [86, 0],
  ]);
  const tFloor = keys(tu, [
    [0, 0],
    [50, 0],
    [86, 1],
  ]);
  const tBase: PoseIn = { kneel: tKneel, floorSit: tFloor, expr: "softSmile", lean: 4 + 4 * tKneel, lookY: 0.3 };
  const tA = actorAnchors({ look: tLook, place: tP, pose: tBase, bodyTurn: tFace * 0.8, headTurn: tFace, breath: breathAt(f, 5) });
  const holdGrip = tu >= 60;
  // тарелка: перед поясом, со стороны левой на экране руки; идёт за плечом
  const plateW = 84 * (tP.h / 760) * 0.95;
  const plateC: Vec = { x: tA.shoulderL.x + 0.1 * tP.h, y: tA.shoulderL.y + 0.25 * tP.h };
  const tLeftTarget: Vec = holdGrip ? { x: plateC.x - plateW * 0.47, y: plateC.y - plateW * 0.07 } : { x: plateC.x - plateW * 0.06, y: plateC.y + 2 };
  const tRightRest: Vec = tFloor > 0.5 ? { x: tP.x + 0.17 * tP.h, y: tP.y - 0.06 * tP.h } : { x: tA.shoulderR.x + 0.04 * tP.h, y: tA.shoulderR.y + 0.36 * tP.h * (1 - 0.25 * tKneel) };
  const tPose: PoseIn = {
    ...tBase,
    armL: { target: tLeftTarget, shape: holdGrip ? "grip" : "palmUp", elbow: "down", aim: "grip" },
    armR: { target: tRightRest, shape: "relax", elbow: "out" },
  };

  // ---------- Билал: коробка обеими руками, затем садится ----------
  const bc = castById("bilal");
  const bLook = style2(bc.look);
  const bY = 1344;
  const bP: Place = { x: 1560, y: bY, h: heightAt(bc.age, bY) };
  const bFace = 0.1;
  const bu = clamp(f - 180, 0, 119);
  const sitU = clamp((bu - 30) / 70);
  const bBase: PoseIn = bilalKneel
    ? { kneel: sitU < 0.6 ? smoothstep(sitU / 0.6) : 1 - smoothstep((sitU - 0.6) / 0.4), floorSit: smoothstep((sitU - 0.35) / 0.65), expr: "calm", lookY: 0.3, lean: 4 }
    : { floorSit: easeInOut(sitU), expr: "calm", lookY: 0.3, lean: 4 };
  const bA = actorAnchors({ look: bLook, place: bP, pose: bBase, bodyTurn: bFace * 0.8, headTurn: bFace, breath: breathAt(f, bc.seed) });
  const boxW = 0.22 * bP.h;
  const boxH = 0.07 * bP.h;
  const boxC: Vec = { x: (bA.shoulderL.x + bA.shoulderR.x) / 2, y: lerp(bA.shoulderL.y, bA.shoulderR.y, 0.5) + 0.19 * bP.h };
  const bPose: PoseIn = {
    ...bBase,
    // локти у боков, предплечья вперёд (к зрителю) — в проекции короче
    armL: { target: { x: boxC.x - boxW / 2 + 2, y: boxC.y }, shape: "grip", elbow: "down", aim: "grip", fore: 0.5 },
    armR: { target: { x: boxC.x + boxW / 2 - 2, y: boxC.y }, shape: "grip", elbow: "down", aim: "grip", fore: 0.5 },
  };

  // ---------- камера ----------
  const auto: Cam =
    f < 90
      ? { x: yHead0.x, y: yHead0.y + 0.08 * yP.h, zoom: 3.0 }
      : f < 180
        ? { x: tP.x - 0.05 * tP.h, y: tP.y - 0.5 * tP.h, zoom: 1.0 }
        : { x: bP.x, y: bP.y - 0.48 * bP.h, zoom: 1.35 };
  const c = cam ?? auto;

  return (
    <Shot f={f} from={-1} to={99999} cam={c} bg="#F1E7D6">
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} />
      {/* Билал — слева от столика */}
      <Actor uid="rl-b" look={bLook} f={f} place={() => bP} face={() => bFace} pose={() => bPose} seed={bc.seed} layer="body" />
      <Actor uid="rl-b" look={bLook} f={f} place={() => bP} face={() => bFace} pose={() => bPose} seed={bc.seed} layer="armsBack" />
      <Box c={boxC} w={boxW} h={boxH} />
      <Actor uid="rl-b" look={bLook} f={f} place={() => bP} face={() => bFace} pose={() => bPose} seed={bc.seed} layer="fingers" />
      {/* Юсуф — за столиком; рука над столешницей */}
      <Actor uid="rl-y" look={yLook} f={f} place={() => yP} face={() => yFace} pose={yPoseAt} seed={ySeed} layer="body" />
      <Table />
      <Plate at={yPlate} w={70} slices={f < 22 ? 3 : 2} />
      <Actor uid="rl-y" look={yLook} f={f} place={() => yP} face={() => yFace} pose={yPoseAt} seed={ySeed} layer="armsBack" />
      {sliceIn ? <Slice at={yGrip} w={0.05 * yP.h} bitten={f >= 42 ? 1 : 0} tilt={-20} /> : null}
      <Actor uid="rl-y" look={yLook} f={f} place={() => yP} face={() => yFace} pose={yPoseAt} seed={ySeed} layer="fingers" />
      {/* учитель — перед правым краем столика */}
      <Actor uid="rl-t" look={tLook} f={f} place={() => tP} face={() => tFace} pose={() => tPose} seed={5} layer="body" />
      <Actor uid="rl-t" look={tLook} f={f} place={() => tP} face={() => tFace} pose={() => tPose} seed={5} layer="armsBack" />
      <Plate at={{ x: plateC.x, y: plateC.y }} w={plateW} slices={3} />
      <Actor uid="rl-t" look={tLook} f={f} place={() => tP} face={() => tFace} pose={() => tPose} seed={5} layer="fingers" />
      {anchors ? (
        <>
          <Dots a={yAnch(yPose, f)} />
          <Dots a={actorAnchors({ look: tLook, place: tP, pose: tPose, bodyTurn: tFace * 0.8, headTurn: tFace, breath: breathAt(f, 5) })} />
          <Dots a={actorAnchors({ look: bLook, place: bP, pose: bPose, bodyTurn: bFace * 0.8, headTurn: bFace, breath: breathAt(f, bc.seed) })} />
        </>
      ) : null}
    </Shot>
  );
};
