// Сцена 2 «Апанын жумуш күнү» (12,6 с). Говорит только диктор — ни у кого
// рот не двигается.
// Вход — круглая маска раскрывается из точки, где сжалась маска первой
// сцены. Утро, прихожая: кисть берёт ремень сумки с крючка → средний план:
// сумка на плече, мама идёт к двери. Офис («долбоорлорду башкарат»): мама
// у экрана показывает карточку плана, коллеги слушают и кивают; «Өз ишин
// жакшы көрөт» — спокойный средний план, улыбка, жест; в паузе — взгляд
// на часы. «Бирок…» — деталь: кисть берёт ключи со стола. Улица у школы:
// сын с рюкзаком подходит к машине, задняя дверь открыта, садится. Салон
// через лобовое стекло: мама смотрит на дорогу, сын пристёгивается (деталь
// замка), на «жолго чыгат» машина трогается.
import { useContext } from "react";
import type { MovCue } from "../timing";
import { useCurrentFrame } from "remotion";
import { CabinBack, CabinFront, FrontSeats } from "../../two-schedules-2d/sets/CarViews";
import { CuesContext } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import type { ExprId } from "../rig/pose";
import { FamilyCar, HALLWAY, Hallway, OFFICE, OfficeBack, OfficeDesk, SchoolStreet, WorkBagHanging } from "../sets/Places";
import { box, type Cam, camMove, Shot } from "../shots";
import { H, lineFrames, placeAt, sceneLen, sitDown, wordFrame } from "./common";
import {
  BackpackOnSeat,
  BAG_TOP,
  BagInHand,
  BeltStrap,
  BeltTongue,
  bodyTurnOf,
  Buckle,
  carToWorld,
  DoorOpening,
  doorClip,
  frontWindowClip,
  gripTo,
  KeyRing,
  NearSidewalk,
  OpenRearDoor,
  SeatedSon,
  swingOf,
} from "./WorkdayParts";

const MOM_B = LOOKS.momOffice.build;
const SON_B = LOOKS.sonSchool.build;
const SEED_MOM = 1;
const SEED_SON = 4;

// ---------- прихожая ----------
const BAG_S = 0.55;
// низ среднего крючка — здесь висит ручка сумки
const PEG: Vec = { x: HALLWAY.hook.x, y: HALLWAY.hook.y + 16 };
const HALL_MOM: Place = placeAt(900, HALLWAY.floorY, H.mom);
const A = { grab: 11, lift: 15 };
const faceA = () => -0.32;

// ---------- офис ----------
const MOM_O: Place = placeAt(1470, OFFICE.floorY, H.mom);
const COL_A: Place = placeAt(520, OFFICE.floorY - 14, H.dad);
const COL_B: Place = placeAt(790, OFFICE.floorY - 14, H.adult);
// карточка плана, о которой говорит мама (вторая колонка, первая карточка)
const CARD = { x: OFFICE.screen.x + 306, y: OFFICE.screen.y + 158, w: 210, h: 78 };
const CARD_C: Vec = { x: CARD.x + CARD.w * 0.45, y: CARD.y + CARD.h / 2 };
// ключи на столе (правый край столешницы) и мама за столом
const KEYS: Vec = { x: 915, y: OFFICE.desk.top + 12 };
const MOM_E: Place = placeAt(850, OFFICE.floorY - 20, H.mom);
const faceE = () => -0.25;

// ---------- улица у школы ----------
const CAR = { x: 1300, y: 2110, s: 2.5 };
const CURB_Y = 2128;
const SON_WALK_Y = 2196;
const SON_STREET_H = H.son;
// где сын встаёт в машину (свободная часть проёма) и пол салона
const SEAT_X = carToWorld(CAR, 318, 0).x;
const CAR_FLOOR_Y = carToWorld(CAR, 0, 240).y;
const SEAT_TOP_Y = carToWorld(CAR, 0, 200).y;

// ---------- салон ----------
const SON_CAB: Place = { x: 520, y: 1330, h: H.son * 1.07 };
const SON_CAB_SEAT = 300;
const MOM_CAB: Place = { x: 830, y: 1980, h: H.mom * 1.07 * 1.44 };
const MOM_CAB_SEAT = 780;
const BELT_ANCHOR: Vec = { x: 432, y: 806 };
const TONGUE_REST: Vec = { x: 454, y: 948 };
const faceG = () => 0.04;

// Ремень по рисунку Figure: от плеча (слева в кадре) к бедру (справа).
const beltPoints = (f: number) => {
  const k = SON_CAB.h / 1000;
  const bt = bodyTurnOf(faceG, f);
  const ws = 1 - 0.36 * Math.abs(bt);
  const dy = -SON_CAB_SEAT / k + 6 - SON_B.hipJointY;
  const breath = Math.sin((f + SEED_SON * 17) / 26);
  const sy = SON_B.shoulderY + dy - breath * 1.5;
  const hy = SON_B.hipY + dy;
  return {
    shoulder: { x: SON_CAB.x - SON_B.shoulderHalf * ws * 0.55 * k, y: SON_CAB.y + (sy - 2) * k },
    hip: { x: SON_CAB.x + SON_B.hipHalf * ws * 0.8 * k, y: SON_CAB.y + (hy + 4) * k },
    w: 12 * k,
  };
};

// Монтаж по словам диктора (кадры сцены); те же моменты берёт звук.
export const workdayCuts = (cues: readonly MovCue[]) => {
  const len = sceneLen("workday");
  const w = (id: string, i: number) => wordFrame(cues, id, i);
  const cutA = 26;
  const cutB = clamp(w("n01", 2) - 1, 50, 72); // «долбоорлорду» — офис
  const cutC = clamp(w("n01", 4) - 2, cutB + 30, 124); // «Өз ишин…» — средний план
  const cutD = clamp(w("n02", 0), cutC + 44, 196); // «Бирок» — ключи
  const cutE = clamp(w("n02", 3) - 2, cutD + 28, 236); // «уулун» — улица у школы
  const cutF = clamp(w("n02", 8) - 2, cutE + 50, 292); // «күн сайын» — салон
  const cutG1 = cutF + 38;
  const cutG2 = cutG1 + 16;
  const go = clamp(w("n02", 12), cutG2 + 2, len - 30); // «жолго» — трогается
  // звук: ключи в руке, дверь машины, щелчок ремня
  return { cutA, cutB, cutC, cutD, cutE, cutF, cutG1, cutG2, go, keys: cutD + 12, door: cutE + 34, click: cutG1 + 6 };
};

export const WorkdayScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("workday");
  const n01 = lineFrames(cues, "n01");
  const { cutA, cutB, cutC, cutD, cutE, cutF, cutG1, cutG2, go } = workdayCuts(cues);
  const watchAt = clamp(n01.to + 1, cutC + 26, cutD - 18);

  // ================= A. Прихожая, деталь: ремень сумки =================
  const gripWantA = (t: number) =>
    keysV(t, [
      [0, { x: 792, y: 902 }],
      [A.grab, PEG],
      [A.lift, PEG],
      [A.lift + 6, { x: PEG.x + 8, y: PEG.y - 22 }],
      [cutA + 6, { x: 860, y: 905 }],
    ]);
  const gripA = (t: number) => gripTo(gripWantA(t), { p: HALL_MOM, build: MOM_B, side: -1, elbow: "out", bt: bodyTurnOf(faceA, t), f: t, seed: SEED_MOM });
  const bagGrip = (t: number) => (t < A.grab ? PEG : gripA(t).grip);
  const momPoseA = (t: number): PoseIn => ({
    expr: "softSmile",
    lookY: keys(t, [[0, -0.35], [A.lift, -0.3], [A.lift + 8, 0]]),
    armL: { target: gripA(t).target, shape: t < A.grab - 2 ? "open" : "fist", elbow: "out", behind: false },
    armR: { target: null, shape: "relax" },
  });
  const hallClose = () => {
    const momA = (layer: "body" | "arms") => <Actor uid="w2-mom-a" look="momOffice" f={f} place={() => HALL_MOM} face={faceA} pose={momPoseA} seed={SEED_MOM} layer={layer} />;
    return (
      <>
        <Hallway bagOnHook={false} />
        {momA("body")}
        {f < A.grab ? <WorkBagHanging x={PEG.x} y={PEG.y - BAG_TOP * BAG_S} s={BAG_S} /> : <BagInHand grip={bagGrip(f)} s={BAG_S} swing={swingOf(bagGrip, f, 1.1, 20)} />}
        {momA("arms")}
      </>
    );
  };

  // ================= B. Прихожая: сумка на плече, к двери =================
  const tB = (t: number) => t - cutA;
  const momB = (t: number): Place => {
    const u = cruise((tB(t) - 8) / 56, 0.25);
    return placeAt(lerp(HALL_MOM.x, 430, u), HALLWAY.floorY, H.mom);
  };
  const faceB = (t: number) => keys(tB(t), [[0, -0.12], [6, -0.12], [12, -0.75]]);
  const momPoseB = (t: number): PoseIn => {
    const p = momB(t);
    const tt = tB(t);
    // правая кисть поправляет ремень у левого плеча, затем опускается
    const strap = { x: p.x + 0.072 * p.h, y: p.y - 0.705 * p.h + keys(tt, [[0, 0], [4, 7], [8, 2]]) };
    const rest = { x: p.x - 0.083 * p.h, y: p.y - 0.452 * p.h };
    return {
      expr: "softSmile",
      bagOnShoulder: 1,
      lookY: keys(tt, [[0, 0.35], [6, 0.35], [12, 0]]),
      armL: tt < 16 ? { target: keysV(tt, [[0, strap], [7, strap], [15, rest]]), shape: tt < 9 ? "fist" : "relax", elbow: "down", behind: false } : { target: null, shape: "relax" },
      armR: { target: null, shape: "relax" },
    };
  };
  const hallMid = () => (
    <>
      <Hallway bagOnHook={false} />
      <Actor uid="w2-mom-b" look="momOffice" f={f} place={momB} face={faceB} pose={momPoseB} seed={SEED_MOM} walkFrom={cutA} />
    </>
  );

  // ================= C, D. Офис =================
  const tC = (t: number) => t - cutB;
  const pointing = (t: number) => tC(t) >= 6 && tC(t) < 34;
  const momFaceO = (t: number) => {
    if (t < cutC) return keys(tC(t), [[0, -0.55], [26, -0.55], [34, -0.4]]);
    const tD = t - cutC;
    return keys(tD, [[0, -0.4], [24, -0.32], [watchAt - cutC - 6, -0.32], [watchAt - cutC + 2, 0.06], [cutD - cutC, 0.06]]);
  };
  const momExprO = (t: number): ExprId => (t < cutB + 30 ? "proud" : t < watchAt ? "smile" : t < watchAt + 14 ? "focused" : "calm");
  const momPoseO = (t: number): PoseIn => {
    const p = MOM_O;
    const restL = { x: p.x - 0.15 * p.h, y: p.y - 0.43 * p.h };
    const palm = { x: p.x - 0.24 * p.h, y: p.y - 0.53 * p.h };
    const tt = tC(t);
    const glance = t >= watchAt - 4;
    // левая (в кадре) рука: к карточке — затем ладонь к коллегам — опускается
    const armL = keysV(tt, [
      [0, restL],
      [8, CARD_C],
      [30, CARD_C],
      [40, palm],
      [cutC - cutB + 14, { x: palm.x + 6, y: palm.y - 8 }],
      [cutC - cutB + 30, restL],
    ], anticipate);
    // правая кисть с часами — к груди, взгляд на часы
    const watch = { x: p.x - 0.03 * p.h, y: p.y - 0.6 * p.h };
    const restR = { x: p.x + 0.15 * p.h, y: p.y - 0.43 * p.h };
    const armR = keysV(t, [[watchAt - 8, restR], [watchAt + 2, watch], [cutD - 6, watch], [cutD + 4, restR]], anticipate);
    return {
      expr: momExprO(t),
      lookY: pointing(t) ? keys(tt, [[6, 0], [10, -0.45], [26, -0.45], [32, 0]]) : glance ? keys(t, [[watchAt - 4, 0], [watchAt + 2, 0.65], [cutD - 8, 0.65], [cutD - 2, 0.2]]) : 0,
      lookX: pointing(t) ? -0.2 : 0,
      nod: glance ? keys(t, [[watchAt - 4, 0], [watchAt + 2, 9], [cutD - 12, 9], [cutD - 8, 4], [cutD - 4, 8]]) : keys(t, [[cutC + 6, 0], [cutC + 11, 5], [cutC + 17, 0]]),
      headTilt: keys(t, [[cutB + 30, 0], [cutB + 40, -4], [watchAt - 6, -4], [watchAt, 0]]),
      armL: { target: armL, shape: pointing(t) ? "point" : tt >= 34 && t < cutC + 24 ? "open" : "relax", elbow: "out", behind: false },
      armR: { target: armR, shape: "relax", elbow: "down", behind: false },
    };
  };
  // коллеги: кивают, когда мама показывает карточку
  const nodAt = (t: number, at: readonly number[]) => at.reduce((s, a) => s + keys(t - cutB, [[a, 0], [a + 4, 7], [a + 10, 0]]), 0);
  const colPoseA = (t: number): PoseIn => ({
    expr: t < cutB + 18 ? "curious" : "softSmile",
    nod: nodAt(t, [16, 34]),
    lookY: keys(t - cutB, [[0, 0], [8, -0.25], [28, -0.25], [34, 0]]),
    armL: { target: { x: COL_A.x - 0.03 * COL_A.h, y: COL_A.y - 0.56 * COL_A.h }, shape: "fist", item: "cup", elbow: "down", behind: false },
    armR: { target: { x: COL_A.x + 0.14 * COL_A.h, y: COL_A.y - 0.43 * COL_A.h }, shape: "relax" },
  });
  const colPoseB = (t: number): PoseIn => ({
    expr: t < cutB + 12 ? "curious" : "smile",
    nod: nodAt(t, [11, 27]),
    lookY: keys(t - cutB, [[0, 0], [8, -0.25], [26, -0.25], [32, 0]]),
    armL: { target: { x: COL_B.x - 0.02 * COL_B.h, y: COL_B.y - 0.58 * COL_B.h }, shape: "fist", item: "notebook", itemTilt: -10, elbow: "down", behind: false },
    armR: { target: { x: COL_B.x + 0.05 * COL_B.h, y: COL_B.y - 0.55 * COL_B.h }, shape: "relax", elbow: "down", behind: false },
  });
  const cardRing = clamp((tC(f) - 8) / 6);
  const office = () => (
    <>
      <OfficeBack f={f} />
      {/* карточка, на которую показывает мама, — жёлтая рамка */}
      {cardRing > 0 ? (
        <div
          style={box({
            left: CARD.x - 7,
            top: CARD.y - 7,
            width: CARD.w + 14,
            height: CARD.h + 14,
            borderRadius: 16,
            border: "6px solid #FFC90E",
            boxSizing: "border-box",
            boxShadow: "0 0 0 6px rgba(255,201,14,0.25)",
            opacity: cardRing,
            scale: `${1.08 - 0.08 * easeOut(cardRing)}`,
          })}
        />
      ) : null}
      <Actor uid="w2-col-a" look="colleagueA" f={f} place={() => COL_A} face={() => 0.5} pose={colPoseA} seed={7} />
      <Actor uid="w2-col-b" look="colleagueB" f={f} place={() => COL_B} face={() => 0.42} pose={colPoseB} seed={9} />
      <OfficeDesk />
      {/* на столе: блокнот и ключи мамы */}
      <div style={box({ left: 760, top: OFFICE.desk.top + 4, width: 110, height: 12, borderRadius: 3, backgroundColor: "#3E7CC0" })} />
      <KeyRing at={KEYS} L={MOM_B.hand * (MOM_E.h / 1000)} rot={88} />
      <Actor uid="w2-mom-o" look="momOffice" f={f} place={() => MOM_O} face={momFaceO} pose={momPoseO} seed={SEED_MOM} />
    </>
  );

  // ================= E. Деталь: ключи со стола =================
  const tE = (t: number) => t - cutD;
  const grabE = 11;
  const leanE = (t: number) => keys(tE(t), [[0, 18], [8, 26], [grabE + 4, 26], [grabE + 20, 6]]);
  const crouchE = (t: number) => keys(tE(t), [[0, 0.3], [8, 0.42], [grabE + 4, 0.42], [grabE + 20, 0.08]]);
  const gripWantE = (t: number) =>
    keysV(tE(t), [
      [0, { x: 1030, y: 1150 }],
      [grabE - 1, KEYS],
      [grabE + 3, KEYS],
      [grabE + 12, { x: KEYS.x + 40, y: KEYS.y - 120 }],
      [grabE + 26, { x: KEYS.x + 70, y: KEYS.y - 260 }],
    ]);
  const gripE = (t: number) => gripTo(gripWantE(t), { p: MOM_E, build: MOM_B, side: 1, elbow: "out", bt: bodyTurnOf(faceE, t), f: t, seed: SEED_MOM, lean: leanE(t), crouch: crouchE(t) });
  const keysGrip = (t: number) => (tE(t) < grabE + 1 ? KEYS : gripE(t).grip);
  const momPoseE = (t: number): PoseIn => ({
    expr: "focused",
    lean: leanE(t),
    crouch: crouchE(t),
    lookY: 0.75,
    nod: keys(tE(t), [[0, 12], [grabE + 6, 12], [grabE + 20, 3]]),
    armL: { target: { x: MOM_E.x - 0.15 * MOM_E.h, y: MOM_E.y - 0.4 * MOM_E.h }, shape: "relax" },
    armR: { target: gripE(t).target, shape: tE(t) < grabE - 2 ? "open" : "fist", elbow: "out", behind: false },
  });
  const keysRot = (t: number) => {
    const tt = tE(t) - grabE - 1;
    if (tt < 0) return 88;
    return keys(tt, [[0, 88], [6, -16], [11, 9], [16, -4], [22, 0]]) + swingOf(keysGrip, t, 0.6, 14);
  };
  const keysDetail = () => {
    const held = tE(f) >= grabE + 1;
    const mom = (layer: "body" | "arms" | "armsNoHands" | "hands") => (
      <Actor uid="w2-mom-e" look="momOffice" f={f} place={() => MOM_E} face={faceE} pose={momPoseE} seed={SEED_MOM} layer={layer} />
    );
    const L = MOM_B.hand * (MOM_E.h / 1000);
    return (
      <>
        <OfficeBack f={f} />
        {mom("body")}
        <OfficeDesk />
        <div style={box({ left: 760, top: OFFICE.desk.top + 4, width: 110, height: 12, borderRadius: 3, backgroundColor: "#3E7CC0" })} />
        {held ? (
          <>
            {mom("armsNoHands")}
            <KeyRing at={keysGrip(f)} L={L} rot={keysRot(f)} />
            {mom("hands")}
          </>
        ) : (
          <>
            <KeyRing at={KEYS} L={L} rot={88} />
            {mom("arms")}
          </>
        )}
      </>
    );
  };

  // ================= F. Улица у школы: сын садится в машину =================
  const tF = (t: number) => t - cutE;
  const F = { stop: 26, step: 40, sitFrom: 36, sitDur: 16 };
  const sonF = (t: number): Place => {
    const tt = tF(t);
    if (tt < F.stop) {
      // идёт с постоянной скоростью и плавно тормозит у двери
      const u = clamp(tt / F.stop, -1, 1);
      const dec = 0.4;
      const v = 1 / (1 - dec / 2);
      const s = u < 1 - dec ? v * u : 1 - (v * (1 - u) * (1 - u)) / (2 * dec);
      return placeAt(lerp(800, SEAT_X - 40, s), SON_WALK_Y, SON_STREET_H, SON_WALK_Y);
    }
    // шаг в салон: выше (пол машины) и чуть дальше от камеры
    const u = easeInOut((tt - F.stop) / (F.step - F.stop));
    return { x: lerp(SEAT_X - 40, SEAT_X, u), y: lerp(SON_WALK_Y, CAR_FLOOR_Y, u), h: SON_STREET_H * lerp(1, 0.96, u) };
  };
  const sonSitF = (t: number) => sitDown(tF(t), F.sitFrom, F.sitDur);
  const inside = (t: number) => sonSitF(t).sit > 0.6;
  const sonFaceF = (t: number) => keys(tF(t), [[0, 0.62], [F.stop, 0.62], [F.step + 6, 0.5]]);
  const sonPoseF = (t: number): PoseIn => {
    const tt = tF(t);
    const p = sonF(t);
    const sd = sonSitF(t);
    const duck = keys(tt, [[F.stop - 2, 0], [F.stop + 8, 1], [F.sitFrom + 6, 1], [F.sitFrom + F.sitDur, 0]]);
    return {
      expr: tt < F.stop ? "softSmile" : "focused",
      sit: sd.sit,
      seat: p.y - SEAT_TOP_Y,
      lean: Math.max(sd.lean, 22 * duck),
      crouch: 0.32 * duck * (1 - sd.sit),
      nod: 8 * duck,
      // руки: при посадке правая опирается о сиденье
      armR: tt < F.stop ? { target: null, shape: "relax" } : { target: keysV(tt, [[F.stop, { x: p.x + 0.16 * p.h, y: p.y - 0.42 * p.h }], [F.stop + 8, { x: SEAT_X + 120, y: SEAT_TOP_Y - 8 }]]), shape: "open", elbow: "down" },
      armL: tt < F.stop ? { target: null, shape: "relax" } : { target: { x: p.x - 0.05 * p.h, y: p.y - 0.4 * p.h - sd.sit * 40 }, shape: "relax", elbow: "down" },
    };
  };
  // мама ждёт за рулём (дальняя сторона, видна в окне водителя)
  const momCarPlace: Place = { x: carToWorld(CAR, 572, 0).x, y: CAR.y - 40, h: H.mom * 0.94 };
  const momCarPose = (t: number): PoseIn => ({
    expr: tF(t) < 30 ? "softSmile" : "smile",
    sit: 1,
    seat: 330,
    nod: keys(tF(t), [[F.step, 0], [F.step + 5, 6], [F.step + 12, 0]]),
    armL: { target: { x: momCarPlace.x - 60, y: momCarPlace.y - 300 }, shape: "fist" },
    armR: { target: { x: momCarPlace.x + 60, y: momCarPlace.y - 300 }, shape: "fist" },
  });
  const street = () => {
    const son = <Actor uid="w2-son-f" look="sonSchool" f={f} place={sonF} face={sonFaceF} pose={sonPoseF} seed={SEED_SON} walkFrom={cutE - 4} />;
    return (
      <>
        <SchoolStreet />
        <FamilyCar x={CAR.x} y={CAR.y} s={CAR.s} />
        <DoorOpening car={CAR} />
        {/* мама в окне водителя: стекло чуть тонирует */}
        <div style={box({ left: 0, top: 0, width: 1, height: 1, clipPath: frontWindowClip(CAR) })}>
          <div style={box({ left: 0, top: 0, width: 4000, height: 4000, backgroundColor: "#3B414D" })} />
          <Actor uid="w2-mom-car" look="momOffice" f={f} place={() => momCarPlace} face={() => -0.62} pose={momCarPose} seed={SEED_MOM} />
          <div style={box({ left: 0, top: 0, width: 4000, height: 4000, backgroundColor: "rgba(200,220,236,0.32)" })} />
        </div>
        {inside(f) ? <div style={box({ left: 0, top: 0, width: 1, height: 1, clipPath: doorClip(CAR) })}>{son}</div> : null}
        <OpenRearDoor car={CAR} open={1} />
        <NearSidewalk y={CURB_Y} />
        {!inside(f) ? son : null}
      </>
    );
  };

  // ================= G. Салон: ремень, машина трогается =================
  const tG = (t: number) => t - cutF;
  const G = { reach: 6, grab: 16, pull: 19, click: cutG1 - cutF + 6, release: cutG1 - cutF + 10 };
  const bp = beltPoints(f);
  const gripWantG = (t: number) => {
    const tt = tG(t);
    const b = beltPoints(t);
    const lap = { x: SON_CAB.x + 0.08 * SON_CAB.h, y: SON_CAB.y - 0.5 * SON_CAB.h };
    return keysV(tt, [
      [0, lap],
      [G.reach, lap],
      [G.grab, TONGUE_REST],
      [G.pull, TONGUE_REST],
      [G.pull + 10, { x: 520, y: 972 }],
      [G.click - 4, { x: b.hip.x + 4, y: b.hip.y - 14 }],
      [G.click, b.hip],
      [G.release + 8, lap],
    ]);
  };
  const gripG = (t: number) => gripTo(gripWantG(t), { p: SON_CAB, build: SON_B, side: 1, elbow: "down", bt: bodyTurnOf(faceG, t), f: t, seed: SEED_SON, seat: SON_CAB_SEAT });
  const holding = (t: number) => tG(t) >= G.grab && tG(t) < G.click + 2;
  const belted = tG(f) >= G.click;
  const sonPoseG = (t: number): PoseIn => {
    const tt = tG(t);
    return {
      expr: tt < G.click + 4 ? "focused" : "proud",
      sit: keys(tt, [[0, 0.9], [5, 1]]),
      seat: SON_CAB_SEAT,
      lookY: tt < G.click + 4 ? keys(tt, [[0, 0.2], [G.reach, 0.55], [G.grab, 0.35], [G.pull + 6, 0.65]]) : keys(tt, [[G.click + 4, 0.65], [G.click + 12, 0]]),
      lookX: tt < G.grab ? keys(tt, [[G.reach, 0], [G.grab - 4, -0.5]]) : tt < G.click + 10 ? 0 : 0.35,
      nod: tt < G.click + 4 ? 6 : keys(tt, [[G.click + 4, 6], [G.click + 12, 0]]),
      headTilt: keys(tt, [[G.click + 6, 0], [G.click + 16, 4]]),
      belt: belted ? 1 : 0,
      armR: { target: gripG(t).target, shape: holding(t) ? "fist" : tt > G.release ? "relax" : "open", elbow: "down", behind: false },
      armL: { target: { x: SON_CAB.x - 0.07 * SON_CAB.h, y: SON_CAB.y - 0.49 * SON_CAB.h }, shape: "relax", elbow: "down" },
    };
  };
  const momGlance = cutG2 + 4;
  const momPoseG = (t: number): PoseIn => ({
    expr: t < momGlance + 8 ? "calm" : "softSmile",
    sit: 1,
    seat: MOM_CAB_SEAT,
    lookY: keys(t, [[momGlance, 0], [momGlance + 4, -0.6], [momGlance + 16, -0.6], [momGlance + 21, 0]]),
    lookX: keys(t, [[momGlance, 0], [momGlance + 4, -0.45], [momGlance + 16, -0.45], [momGlance + 21, 0]]),
    armL: { target: { x: 660, y: 1258 }, shape: "fist", elbow: "down", behind: false },
    armR: { target: { x: 982, y: 1258 }, shape: "fist", elbow: "down", behind: false },
  });
  // путь машины: стоит, на «жолго» трогается с разгоном
  const pass = f < go ? 0 : Math.pow(f - go, 1.6) * 0.5;
  const moving = f >= go;
  const sway = moving ? Math.sin((f - go) * 0.31) * 1.6 * clamp((f - go) / 12) : 0;
  const cabin = () => {
    const g = gripG(f);
    const strapMid = belted ? bp.shoulder : keysV(tG(f), [[G.pull, { x: (BELT_ANCHOR.x + g.grip.x) / 2, y: (BELT_ANCHOR.y + g.grip.y) / 2 }], [G.click - 6, bp.shoulder]]);
    const son = (layer: "body" | "arms" | "armsNoHands" | "hands") => <SeatedSon uid="w2-son-g" f={f} place={SON_CAB} face={faceG} pose={sonPoseG} seed={SEED_SON} layer={layer} />;
    return (
      <>
        <CabinBack />
        {/* заднее стекло: улица у школы уходит назад */}
        <div style={box({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = ((((i * 230 - pass * 6) % 1380) + 1380) % 1380) - 260;
            const tree = i % 3 === 1;
            return <div key={i} style={box({ left: x, top: tree ? 30 : 60, width: tree ? 110 : 190, height: tree ? 220 : 200, borderRadius: tree ? 55 : 6, backgroundColor: tree ? "#7FAF63" : i % 2 ? "#F1E3C8" : "#E6D6C4" })} />;
          })}
          <div style={box({ left: 0, top: 170, width: 740, height: 60, backgroundColor: "#CFC8BC" })} />
        </div>
        {/* крепление ремня на стойке */}
        <div style={box({ left: BELT_ANCHOR.x - 16, top: BELT_ANCHOR.y - 14, width: 32, height: 28, borderRadius: 8, backgroundColor: "#2A2E36" })} />
        {/* до пристёгивания ремень висит у стойки */}
        {tG(f) < G.grab ? <BeltStrap from={BELT_ANCHOR} to={TONGUE_REST} w={bp.w} /> : null}
        {tG(f) < G.grab ? <BeltTongue at={TONGUE_REST} w={bp.w * 1.6} angle={-8} /> : null}
        {son("body")}
        <BackpackOnSeat x={412} y={1108} w={92} />
        <Buckle at={{ x: bp.hip.x + 6, y: bp.hip.y + 6 }} w={bp.w * 2.2} click={belted ? keys(tG(f), [[G.click, 1], [G.click + 10, 0]]) : 0} />
        {tG(f) >= G.grab ? <BeltStrap from={BELT_ANCHOR} to={strapMid} w={bp.w} /> : null}
        {tG(f) >= G.grab && !belted ? <BeltStrap from={strapMid} to={g.grip} w={bp.w} /> : null}
        {holding(f) ? (
          <>
            {son("armsNoHands")}
            <BeltTongue at={g.grip} w={bp.w * 1.6} angle={g.angle} />
            {son("hands")}
          </>
        ) : (
          son("arms")
        )}
        {/* подушка заднего сиденья перед ногами сына */}
        <div style={box({ left: 330, top: 1118, width: 420, height: 220, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
        <FrontSeats />
        <Actor uid="w2-mom-g" look="momOffice" f={f} place={() => MOM_CAB} face={() => 0} pose={momPoseG} seed={SEED_MOM} />
        <CabinFront pass={pass} wheel={moving ? Math.sin((f - go) * 0.05) * 3 : 0} />
      </>
    );
  };

  // ================= камера и монтаж =================
  const camA: Cam = camMove(f, 14, cutA, { x: 655, y: 880, zoom: 3.1 }, { x: 690, y: 884, zoom: 3.0 });
  const camB: Cam = camMove(f, cutA, cutB, { x: 790, y: 1100, zoom: 1.55 }, { x: 690, y: 1105, zoom: 1.5 });
  const camC: Cam = camMove(f, cutB, cutC, { x: 960, y: 1040, zoom: 0.9 }, { x: 985, y: 1030, zoom: 0.93 });
  const camD: Cam = camMove(f, cutC, cutD, { x: 1455, y: 1000, zoom: 1.8 }, { x: 1462, y: 1010, zoom: 1.95 });
  // деталь: кисть и ключи (мама — за столом, ниже пояса скрыта столешницей)
  const camE: Cam = camMove(f, cutD + grabE + 4, cutE, { x: 905, y: 1205, zoom: 3.4 }, { x: 925, y: 1160, zoom: 3.2 });
  const camF: Cam = camMove(f, cutE, cutF, { x: 1060, y: 1560, zoom: 0.7 }, { x: 1110, y: 1545, zoom: 0.74 });
  const camG1: Cam = camMove(f, cutF, cutG1, { x: 548, y: 1010, zoom: 1.04 }, { x: 550, y: 1005, zoom: 1.08 });
  const bpG = beltPoints(cutG1);
  const camG2: Cam = camMove(f, cutG1, cutG2, { x: bpG.hip.x - 30, y: bpG.hip.y - 10, zoom: 3.2 }, { x: bpG.hip.x - 26, y: bpG.hip.y - 12, zoom: 3.35 });
  const camG3: Cam = camMove(f, cutG2, len, { x: 640, y: 1000 + sway, zoom: 1.2 }, { x: 650, y: 995 + sway, zoom: 1.26 });

  // вход: круглая маска раскрывается из точки, где закрылась сцена 1
  const irisR = keys(f, [[0, 0], [10, 1300]], easeOut);
  const iris = f < 10 ? `circle(${irisR}px at 560px 820px)` : undefined;
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4EDE2" })}>
      <div style={box({ inset: 0, clipPath: iris })}>
        {f < cutA ? (
          <Shot f={f} from={0} to={cutA} cam={camA} bg="#F2E6D4">
            {hallClose()}
          </Shot>
        ) : f < cutB ? (
          <Shot f={f} from={cutA} to={cutB} cam={camB} bg="#F2E6D4">
            {hallMid()}
          </Shot>
        ) : f < cutC ? (
          <Shot f={f} from={cutB} to={cutC} cam={camC} bg="#EEF1F5">
            {office()}
          </Shot>
        ) : f < cutD ? (
          <Shot f={f} from={cutC} to={cutD} cam={camD} bg="#EEF1F5">
            {office()}
          </Shot>
        ) : f < cutE ? (
          <Shot f={f} from={cutD} to={cutE} cam={camE} bg="#EEF1F5">
            {keysDetail()}
          </Shot>
        ) : f < cutF ? (
          <Shot f={f} from={cutE} to={cutF} cam={camF} bg="#D6CFC3">
            {street()}
          </Shot>
        ) : f < cutG1 ? (
          <Shot f={f} from={cutF} to={cutG1} cam={camG1} bg="#2F343E">
            {cabin()}
          </Shot>
        ) : f < cutG2 ? (
          <Shot f={f} from={cutG1} to={cutG2} cam={camG2} bg="#2F343E">
            {cabin()}
          </Shot>
        ) : (
          <Shot f={f} from={cutG2} to={len} cam={camG3} bg="#2F343E">
            {cabin()}
          </Shot>
        )}
      </div>
    </div>
  );
};
