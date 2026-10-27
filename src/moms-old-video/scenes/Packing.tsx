// Сцена 11 «Уулу жардам берет» (≈ 9,4 с).
// Субботнее утро. Открытая спортивная сумка на диване (там, где её оставили
// в сцене 10). Мама уже в одежде для занятия. Сын приносит бутылку воды и
// полотенце и подаёт по одному — из руки в руку (в кадре передачи обе кисти
// на предмете, предмет в одной руке в каждый момент). Мама кладёт вещи в
// сумку, застёгивает её и благодарно смотрит на сына. Сын: «Кийин
// үйрөнгөнүңдү мага көрсөтөсүңбү?» Живая пауза — мама улыбается и коротко
// кивает.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place, type PoseIn, type WorldArm } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { cruise, keys, keysV, lerp, type Vec } from "../rig/motion";
import type { ExprId } from "../rig/pose";
import { ChairBack, LIV, LivingBack, Rug, Sofa, SportBag, WorkTable } from "../sets/Living";
import { box, type Cam, camMove, Shot } from "../shots";
import { H, lineFrames, placeAt, sceneLen } from "./common";
import { BAG_S, BAG_SEAT } from "./Pick";

const MOM_P: Place = placeAt(1700, 1592, H.mom);
const SON_FROM = { x: 1020, y: 1622 };
const SON_TO = { x: 1352, y: 1628 };
const BAG_TOP: Vec = { x: BAG_SEAT.x, y: BAG_SEAT.y + (-186 + 60) * BAG_S }; // горловина сумки
const HO1: Vec = { x: 1530, y: 1192 }; // передача бутылки
const HO2: Vec = { x: 1526, y: 1200 }; // передача полотенца
export const PACK = {
  walk: [6, 46] as const,
  give1: [50, 60] as const, // сын тянет бутылку к маме
  swap1: 63,
  put1: [70, 86] as const,
  give2: [92, 104] as const,
  swap2: 107,
  put2: [114, 130] as const,
  zip: [134, 148] as const,
  thank: 150,
  sonShot: 150,
  momShot: 228,
};

export const packSonPlace = (t: number): Place => {
  const u = cruise((t - PACK.walk[0]) / (PACK.walk[1] - PACK.walk[0]), 0.3);
  return placeAt(lerp(SON_FROM.x, SON_TO.x, u), lerp(SON_FROM.y, SON_TO.y, u), H.son);
};

const headOfStanding = (p: Place, look: "son" | "momDance", face: number): Vec => {
  const b = LOOKS[look].build;
  const k = p.h / 1000;
  return { x: p.x + face * 0.8 * 12 * k, y: p.y + (b.headY + 6) * k };
};
const faceCam = (head: Vec, look: "son" | "momDance", h: number, r: number, sx: number, sy: number): Cam => {
  const z = r / (LOOKS[look].build.headRx * (h / 1000));
  return { x: head.x - (sx - 540) / z, y: head.y - (sy - 960) / z, zoom: z };
};

export const PackingScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("packing");
  const s04 = lineFrames(cues, "s04");
  const nod = Math.max(s04.to + 26, PACK.momShot + 22);

  // ---------- сын ----------
  const sonPlace = packSonPlace;
  const sonCarry = (t: number, side: -1 | 1): Vec => {
    const p = sonPlace(t);
    return { x: p.x + side * 0.15 * p.h + (side > 0 ? 0.04 * p.h : 0), y: p.y - 0.46 * p.h };
  };
  const sonRest = (t: number, side: -1 | 1): Vec => {
    const p = sonPlace(t);
    return { x: p.x + side * 0.14 * p.h, y: p.y - 0.44 * p.h };
  };
  const sonArmR = (t: number): WorldArm => {
    const has = t < PACK.swap1;
    const target = t < PACK.give1[0] ? sonCarry(t, 1) : keysV(t, [[PACK.give1[0], sonCarry(t, 1)], [PACK.give1[1], HO1], [PACK.swap1 + 2, HO1], [PACK.swap1 + 14, sonRest(t, 1)]]);
    return { target, shape: has ? "fist" : "relax", item: has ? "bottle" : "none", itemTilt: 0, elbow: "down", behind: false };
  };
  const sonArmL = (t: number): WorldArm => {
    const has = t < PACK.swap2;
    const target = t < PACK.give2[0] ? sonCarry(t, -1) : keysV(t, [[PACK.give2[0], sonCarry(t, -1)], [PACK.give2[1], HO2], [PACK.swap2 + 2, HO2], [PACK.swap2 + 14, sonRest(t, -1)]]);
    return { target, shape: has ? "fist" : "relax", item: has ? "towel" : "none", itemColor: "#F4D9A7", itemTilt: 0, elbow: "down", behind: t >= PACK.give2[0] - 4 ? false : undefined };
  };
  const sonExpr = (t: number): ExprId => (t < PACK.thank ? "smile" : t < s04.from - 4 ? "softSmile" : t < s04.to + 2 ? "curious" : t < nod + 4 ? "curious" : "proud");
  const sonPose = (t: number): PoseIn => ({
    expr: sonExpr(t),
    lookY: t < PACK.thank ? 0.25 : -0.12,
    headTilt: t >= s04.from && t < s04.to + 30 ? keys(t, [[s04.from, 0], [s04.from + 10, 5]]) : 0,
    shoulders: t >= s04.from && t < s04.to ? 0.2 : 0,
    armR: sonArmR(t),
    armL: sonArmL(t),
  });
  const sonFace = (t: number) => keys(t, [[PACK.walk[1] - 6, 0.35], [PACK.give2[0], 0.5], [PACK.thank, 0.55]]);

  // ---------- мама ----------
  const momRest = (side: -1 | 1): Vec => ({ x: MOM_P.x + side * 0.14 * MOM_P.h, y: MOM_P.y - 0.44 * MOM_P.h });
  const momArmL = (t: number): WorldArm => {
    const has1 = t >= PACK.swap1 && t < PACK.put1[1] - 3;
    const has2 = t >= PACK.swap2 && t < PACK.put2[1] - 3;
    const target = keysV(t, [
      [PACK.give1[0] + 2, momRest(-1)],
      [PACK.give1[1] + 1, HO1],
      [PACK.swap1 + 2, HO1],
      [PACK.put1[0], { x: BAG_TOP.x, y: BAG_TOP.y - 40 }],
      [PACK.put1[1] - 4, { x: BAG_TOP.x, y: BAG_TOP.y + 4 }],
      [PACK.put1[1] + 4, { x: BAG_TOP.x - 10, y: BAG_TOP.y - 30 }],
      [PACK.give2[1] + 1, HO2],
      [PACK.swap2 + 2, HO2],
      [PACK.put2[0], { x: BAG_TOP.x + 8, y: BAG_TOP.y - 40 }],
      [PACK.put2[1] - 4, { x: BAG_TOP.x + 8, y: BAG_TOP.y + 4 }],
      [PACK.zip[0], { x: BAG_TOP.x - 70, y: BAG_TOP.y + 4 }],
      [PACK.zip[1] + 10, momRest(-1)],
    ]);
    return { target, shape: has1 || has2 ? "fist" : t > PACK.give1[0] && t < PACK.zip[0] ? "open" : "relax", item: has1 ? "bottle" : has2 ? "towel" : "none", itemColor: has2 ? "#F4D9A7" : undefined, itemTilt: 0, elbow: "down", behind: false };
  };
  const momArmR = (t: number): WorldArm => {
    // правая застёгивает молнию: от левого края горловины к правому
    const target = keysV(t, [
      [PACK.zip[0] - 8, momRest(1)],
      [PACK.zip[0], { x: BAG_TOP.x - 60, y: BAG_TOP.y }],
      [PACK.zip[1], { x: BAG_TOP.x + 66, y: BAG_TOP.y }],
      [PACK.zip[1] + 12, momRest(1)],
    ]);
    return { target, shape: t > PACK.zip[0] - 2 && t < PACK.zip[1] + 2 ? "pinch" : "relax", elbow: "down", behind: false };
  };
  const momPose = (t: number): PoseIn => ({
    expr: (t < PACK.thank ? "smile" : t < PACK.thank + 20 ? "grateful" : t < nod - 14 ? "softSmile" : "smile") as ExprId,
    lean: keys(t, [[PACK.put1[0] - 4, 0], [PACK.put1[0] + 6, 10], [PACK.put1[1] + 2, 10], [PACK.give2[1] - 2, 2], [PACK.put2[0] + 6, 10], [PACK.zip[1], 10], [PACK.zip[1] + 12, 0]]),
    lookY: t < PACK.thank ? 0.4 : 0.35,
    nod: keys(t, [[nod - 2, 0], [nod + 5, 9], [nod + 12, 0]]),
    headTilt: keys(t, [[PACK.thank, 0], [PACK.thank + 14, 5], [nod - 14, 3], [nod + 20, 6]]),
    armL: momArmL(t),
    armR: momArmR(t),
  });
  const momFace = (t: number) => keys(t, [[0, -0.3], [PACK.give1[0], -0.45], [PACK.put1[0], -0.2], [PACK.give2[0], -0.45], [PACK.put2[0], -0.2], [PACK.zip[1], -0.25], [PACK.thank, -0.5]]);

  const zipped = keys(f, [[PACK.zip[0], 1], [PACK.zip[1], 0]]);
  const world = (
    <>
      <LivingBack light="morning" f={f} />
      <Sofa light="morning" />
      <Rug />
      <ChairBack x={LIV.chair.x} light="morning" />
      <WorkTable light="morning" />
      <SportBag x={BAG_SEAT.x} y={BAG_SEAT.y} s={BAG_S} open={zipped} />
      <Actor uid="p11-mom" look="momDance" f={f} place={() => MOM_P} face={momFace} pose={momPose} role="mother" seed={1} />
      <Actor uid="p11-son" look="son" f={f} place={sonPlace} face={sonFace} pose={sonPose} role="son" seed={4} walkFrom={PACK.walk[0]} />
    </>
  );

  const sonP = sonPlace(PACK.sonShot + 10);
  const sonCam = faceCam(headOfStanding(sonP, "son", 0.55), "son", sonP.h, 130, 470, 800);
  const momCam = faceCam(headOfStanding(MOM_P, "momDance", -0.5), "momDance", MOM_P.h, 140, 600, 780);
  return (
    <>
      <Shot f={f} from={0} to={PACK.sonShot} cam={camMove(f, 0, PACK.sonShot, { x: 1460, y: 1240, zoom: 1.22 }, { x: 1500, y: 1225, zoom: 1.34 })} bg="#F1E4D1">
        {world}
      </Shot>
      <Shot f={f} from={PACK.sonShot} to={PACK.momShot} cam={camMove(f, PACK.sonShot, PACK.momShot, { ...sonCam, zoom: sonCam.zoom * 0.95 }, sonCam)} bg="#F1E4D1">
        {world}
      </Shot>
      <Shot f={f} from={PACK.momShot} to={len} cam={camMove(f, PACK.momShot, len, { ...momCam, zoom: momCam.zoom * 0.96 }, momCam)} bg="#F1E4D1">
        {world}
      </Shot>
      {/* мягкий утренний свет из окна */}
      <div style={box({ inset: 0, background: "radial-gradient(circle at 15% 10%, rgba(255,240,205,0.28), transparent 60%)", pointerEvents: "none" })} />
    </>
  );
};
