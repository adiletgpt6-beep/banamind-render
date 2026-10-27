// Сцена «drive»: утро, мама отвозит дочку сама.
//   A. прихожая: мама заканчивает звонок на работу, убирает телефон в
//      сумку, зовёт дочку («Жүр, кызым…»), смотрит на ключницу и снимает
//      ключи с крючка на высоте плеча;
//   B. двор: идут к машине за руку, у каждой свой шаг;
//   C. мама пристёгивает дочку на бустере: язычок → через плечо и грудь →
//      в замок у таза → отпускает;
//   D. улица; E. салон: короткий разговор, руки на руле;
//   F. светофор: остановка перед переходом, пешеходы, старт на зелёный.
// Все кадры — от начала сцены; моменты речи берутся из фактической озвучки.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { useCueFrames } from "../context";
import { Actor, type Place, type PoseIn, type WorldBelt } from "../rig/Actor";
import { bodyPoints, wristForGrip } from "../rig/body";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, easeInOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { CarKeys, Hallway, HALL, KEYS_GRIP, Mountains } from "../sets/Apartment";
import { Booster, CAR_SIDE, CAR_SIDE_LAP, CAR_SIDE_RING, CabinBack, CabinFront, FrontSeats, RearDoorFrame, RearSeatSide, rimPoint } from "../sets/CarViews";
import { Car, Courtyard, Marshrutka, PanelHouse, Sky, TrafficLight, Tree } from "../sets/Outdoor";
import { box, camMove, Shot } from "../shots";
import { GIRL_HALL, GIRL_YARD, MOM_HALL, MOM_YARD, YARD_FROM, YARD_TO } from "../paths";
import { NB2_TEXT } from "../script";
import { PhoneIcon } from "../screens";

const MOM_CAR = "#AEB5BF"; // машина мамы — серебристая (не белая, как у BalaGo)
const MOM = LOOKS.mom.build;
const GIRL = LOOKS.girl.build;

// Границы планов (кадры сцены). Звуки сцены берут их отсюда же.
export const DRIVE_SHOTS = {
  hall: [0, YARD_FROM],
  yard: [YARD_FROM, YARD_TO],
  belt: [YARD_TO, 440],
  cabin: [440, 590],
  light: [590, 657],
} as const;
// Ремень: язычок в руке, щелчок замка, отпускание (кадры сцены).
export const BELT = { grab: YARD_TO + 14, click: YARD_TO + 50, release: YARD_TO + 56 } as const;
// Светофор: красный до LIGHT.yellow, зелёный с LIGHT.green, машина трогается.
export const LIGHT = { yellow: 600, green: 610, go: 618 } as const;
// Снятие ключей — от конца реплики «Жүр, кызым…» (кадры от её конца).
export const KEYS = { reach: 4, grab: 20, lift: 24, down: 40 } as const;

export const DriveScene: React.FC = () => {
  const f = useCurrentFrame();
  const call = useCueFrames("m03");
  const go = useCueFrames("m02");
  const dCar = useCueFrames("d_car");
  const mCar = useCueFrames("m_car");

  // ---------- A. прихожая ----------
  const endCall = call.to + 8; // нажимает «завершить» сразу после фразы
  const toBag = endCall + 14;
  const inBag = toBag + 10;
  const keyAt = go.to;
  const grab = keyAt + KEYS.grab;
  const momHallFace = (t: number) => keys(t, [[0, -0.15], [endCall, -0.15], [toBag, 0.1], [go.from - 6, -0.75], [keyAt, -0.75], [keyAt + 6, -0.45], [grab + 14, -0.45], [grab + 26, -0.8]]);
  const hallPose = (t: number) => ({ turn: momHallFace(t) * 0.8 });
  const keysHook = KEYS_GRIP(HALL.hook.x, HALL.hook.y, MOM_HALL.h / 1000);
  const momHallPose = (t: number): PoseIn => {
    const bp = bodyPoints(MOM, MOM_HALL, hallPose(t));
    const ear = bp.ear(1, momHallFace(t));
    const phoneEar = wristForGrip(MOM, MOM_HALL, hallPose(t), 1, { x: ear.x + 6, y: ear.y + 8 }, "down");
    const look = { x: bp.chest.x + 40, y: bp.chest.y + 10 };
    const bag = { x: MOM_HALL.x + MOM.shoulderHalf * 1.2 * bp.k, y: bp.pelvis.y - 8 };
    const restR = { x: MOM_HALL.x + 0.1 * MOM_HALL.h, y: MOM_HALL.y - 0.37 * MOM_HALL.h };
    const restL = { x: MOM_HALL.x - 0.1 * MOM_HALL.h, y: MOM_HALL.y - 0.37 * MOM_HALL.h };
    const hookW = wristForGrip(MOM, MOM_HALL, hallPose(t), -1, keysHook, "down");
    const offW = { x: hookW.x + 6, y: hookW.y - 10 };
    const chestL = { x: MOM_HALL.x - 0.13 * MOM_HALL.h, y: MOM_HALL.y - 0.47 * MOM_HALL.h };
    const holdingPhone = t < inBag;
    const hasKeys = t >= grab;
    return {
      expr: t < call.to ? "apologetic" : t < go.from - 4 ? "calm" : "softSmile",
      bagOnShoulder: 1,
      armR: {
        target: keysV(t, [[0, phoneEar], [endCall - 4, phoneEar], [endCall + 6, look], [toBag - 2, look], [toBag + 4, bag], [inBag, bag], [inBag + 14, restR]], anticipate),
        shape: holdingPhone ? "phone" : "relax",
        item: holdingPhone ? "phone" : "none",
        glow: keys(t, [[endCall - 2, 0.2], [endCall + 6, 1], [toBag - 2, 0.4]]),
        itemTilt: keys(t, [[endCall - 4, 4], [endCall + 6, -6]]),
        elbow: "down",
      },
      armL: {
        target: keysV(t, [[0, restL], [keyAt + KEYS.reach, restL], [grab - 3, hookW], [grab + 1, hookW], [keyAt + KEYS.lift, offW], [keyAt + KEYS.down, chestL]], easeInOut),
        shape: hasKeys ? "fist" : t > keyAt + KEYS.reach + 6 ? "open" : "relax",
        item: hasKeys ? "keys" : "none",
        elbow: "down",
        behind: false,
      },
      lookY: keys(t, [[0, 0.1], [endCall, 0.1], [endCall + 6, 0.5], [toBag + 6, 0.5], [inBag + 6, 0], [keyAt, 0], [keyAt + 6, -0.35], [grab + 8, -0.35], [grab + 18, 0.3], [grab + 30, 0]]),
      nod: keys(t, [[go.from + 2, 0], [go.from + 10, 4], [go.from + 22, 0]]),
    };
  };
  const girlHallPose = (t: number): PoseIn => ({
    expr: t < go.from + 10 ? "calm" : "softSmile",
    armL: { target: { x: GIRL_HALL.x - 0.035 * GIRL_HALL.h, y: GIRL_HALL.y - 0.6 * GIRL_HALL.h }, shape: "fist", elbow: "hang" },
    armR: { target: { x: GIRL_HALL.x + 0.035 * GIRL_HALL.h, y: GIRL_HALL.y - 0.6 * GIRL_HALL.h }, shape: "fist", elbow: "hang" },
    strapTug: keys(t, [[go.to - 4, 0], [go.to + 6, 1], [go.to + 30, 1], [go.to + 40, 0]]),
    lookY: -0.35,
    nod: keys(t, [[go.to - 6, 0], [go.to + 2, 5], [go.to + 12, 0]]),
  });
  const girlHallFace = (t: number) => keys(t, [[0, 0.7], [grab + 10, 0.7], [grab + 24, -0.3]]);

  // ---------- B. двор: за руку, кисти соединены, плечи свободны ----------
  const handAt = (t: number): Vec => {
    const m = MOM_YARD(t);
    const g = GIRL_YARD(t);
    const momLow = { x: m.x - 0.09 * m.h, y: m.y - 0.37 * m.h };
    const girlLow = { x: g.x + 0.14 * g.h, y: g.y - 0.45 * g.h };
    return { x: lerp(momLow.x, girlLow.x, 0.45), y: lerp(momLow.y, girlLow.y, 0.5) };
  };
  const momYardPose = (t: number): PoseIn => ({
    expr: "calm",
    bagOnShoulder: 1,
    armL: { target: handAt(t), shape: "fist", elbow: "down" },
    armR: { target: null, shape: "fist", item: "keys" },
    lookY: keys(t, [[YARD_FROM, 0.1], [YARD_FROM + 40, 0.35], [YARD_FROM + 60, 0.1]]),
  });
  const girlYardPose = (t: number): PoseIn => ({
    expr: t < YARD_FROM + 50 ? "calm" : "softSmile",
    armR: { target: handAt(t), shape: "fist", elbow: "down" },
    armL: { target: null, shape: "relax" },
    lookY: keys(t, [[YARD_FROM, -0.1], [YARD_FROM + 36, -0.45], [YARD_FROM + 58, -0.1]]),
  });
  const momYardFace = (t: number) => keys(t, [[YARD_FROM, 0.6], [YARD_FROM + 36, 0.45], [YARD_FROM + 58, 0.65]]);
  const girlYardFace = (t: number) => keys(t, [[YARD_FROM, 0.6], [YARD_FROM + 30, 0.75], [YARD_FROM + 60, 0.6]]);

  // ---------- C. ремень на бустере ----------
  const b0 = YARD_TO;
  const GIRL_SEAT: Place = { x: 480, y: CAR_SIDE.floorY, h: 700 };
  const girlTurn = 0.8;
  const seatPx = GIRL_SEAT.y - (CAR_SIDE.boosterTop - 4) + 6 * (GIRL_SEAT.h / 1000);
  const gb = bodyPoints(GIRL, GIRL_SEAT, { turn: girlTurn, seat: seatPx });
  const far = -gb.near as -1 | 1;
  const nearSh = gb.shoulder(gb.near);
  const D_RING = CAR_SIDE_RING;
  const LAP_ANCHOR = CAR_SIDE_LAP;
  const BUCKLE = { x: gb.hip(far).x + 20, y: gb.hip(far).y - 2 };
  const overShoulder = { x: nearSh.x + 14, y: nearSh.y - 10 };
  const hang = { x: D_RING.x + 8, y: D_RING.y + 160 };
  // мама наклоняется в проём у задней стойки, слева от дочки: лицо дочки
  // и её колени открыты, рука идёт за язычком и через грудь к замку
  const MOM_DOOR: Place = { x: 150, y: 2080, h: 1250 };
  const momDoorBody = { turn: 0.5 * 0.75, lean: 10 };
  const tongueAt = (t: number): Vec =>
    keysV(t, [[b0, hang], [BELT.grab, hang], [BELT.grab + 12, { x: overShoulder.x - 20, y: overShoulder.y - 30 }], [BELT.grab + 22, { x: overShoulder.x + 26, y: overShoulder.y + 34 }], [BELT.click - 6, { x: BUCKLE.x + 8, y: BUCKLE.y - 34 }], [BELT.click, BUCKLE]], easeInOut);
  const tongue = tongueAt(f);
  const belt: WorldBelt = {
    anchor: D_RING,
    shoulder: tongue.x > nearSh.x - 6 ? overShoulder : undefined,
    tongue,
    lap: LAP_ANCHOR,
    buckle: BUCKLE,
    width: 17,
  };
  const beltHand = (t: number): Vec => {
    const restHand = { x: 300, y: 1290 };
    const holding = t >= BELT.grab && t < BELT.release;
    const grip = holding
      ? tongueAt(t)
      : t < BELT.grab
        ? keysV(t, [[b0, restHand], [BELT.grab - 2, hang]], anticipate)
        : keysV(t, [[BELT.release, BUCKLE], [BELT.release + 6, { x: BUCKLE.x + 20, y: BUCKLE.y - 30 }], [BELT.release + 28, { x: 250, y: 1450 }]], easeInOut);
    return wristForGrip(MOM, MOM_DOOR, momDoorBody, 1, grip, "down");
  };
  const momDoorPose = (t: number): PoseIn => ({
    expr: t < BELT.click + 4 ? "calm" : "softSmile",
    lean: keys(t, [[b0, 10], [BELT.release + 20, 10], [BELT.release + 50, 4]]),
    turnBody: 0.75,
    armR: { target: beltHand(t), shape: t >= BELT.grab - 1 && t < BELT.release ? "fist" : "open", elbow: "down", behind: false },
    armL: { target: { x: 60, y: 1400 }, shape: "relax", behind: true },
    lookY: keys(t, [[b0, 0], [BELT.grab, -0.1], [BELT.click - 14, 0.5], [BELT.click + 8, 0.5], [BELT.click + 18, 0.1]]),
    nod: keys(t, [[BELT.click + 4, 0], [BELT.click + 12, 4], [BELT.click + 22, 0]]),
  });
  const thigh = (side: -1 | 1): Vec => {
    const h = gb.hip(side);
    const k = gb.knee(side);
    return { x: lerp(h.x, k.x, 0.62), y: lerp(h.y, k.y, 0.62) - 14 };
  };
  const girlSeatPose = (t: number): PoseIn => ({
    expr: t < BELT.click + 6 ? "calm" : "smile",
    sit: 1,
    turnBody: 1,
    seat: seatPx,
    packOff: true,
    armL: { target: thigh(-1), shape: "relax", elbow: "down" },
    armR: { target: thigh(1), shape: "relax", elbow: "down" },
    lookY: keys(t, [[b0, -0.2], [BELT.grab + 4, 0.15], [BELT.click - 8, 0.5], [BELT.click + 6, 0.5], [BELT.click + 14, -0.2]]),
    belt,
  });

  // ---------- D. улица ----------
  const wheelDeg = (dist: number, s: number) => (dist / (38 * s)) * (180 / Math.PI);

  // ---------- E. салон: мама за рулём, дочка сзади на бустере ----------
  const cab = DRIVE_SHOTS.cabin[0];
  const MOM_DRIVE: Place = { x: 790, y: 1880, h: 1150 };
  const driveSeat = MOM_DRIVE.y - 1400;
  const wheelRot = (t: number) => 2.5 * Math.sin((t - cab) * 0.045) + keys(t, [[cab + 120, 0], [cab + 140, -4], [cab + 165, 0]]);
  const GRIP_L = 160; // кисти «без двадцати десять»
  const GRIP_R = 20;
  const driveBody = { turn: 0, seat: driveSeat };
  const md = bodyPoints(MOM, MOM_DRIVE, driveBody);
  const momBelt: WorldBelt = {
    anchor: { x: md.shoulder(1).x + 46, y: md.shoulder(1).y - 70 },
    shoulder: { x: md.shoulder(1).x - 22, y: md.shoulder(1).y - 6 },
    tongue: { x: md.hip(-1).x - 10, y: md.hip(-1).y + 4 },
    lap: { x: md.hip(1).x + 40, y: md.hip(1).y + 4 },
    buckle: { x: md.hip(-1).x - 16, y: md.hip(-1).y + 4 },
    width: 24,
  };
  const momDrivePose = (t: number): PoseIn => {
    const rot = wheelRot(t);
    return {
      expr: t < dCar.to + 4 ? "thinking" : t < mCar.to + 10 ? "softSmile" : "calm",
      sit: 1,
      seat: driveSeat,
      armL: { target: wristForGrip(MOM, MOM_DRIVE, driveBody, -1, rimPoint(GRIP_L, rot), "down"), shape: "fist", elbow: "down", behind: false },
      armR: { target: wristForGrip(MOM, MOM_DRIVE, driveBody, 1, rimPoint(GRIP_R, rot), "down"), shape: "fist", elbow: "down", behind: false },
      lookY: keys(t, [[dCar.from, -0.05], [dCar.to + 2, 0.05]]),
      belt: momBelt,
    };
  };
  // взгляд мамы на дорогу; на вопрос — короткий взгляд в зеркало и снова вперёд
  const momDriveFace = (t: number) => keys(t, [[cab, 0], [dCar.to - 4, 0], [dCar.to + 6, -0.22], [mCar.from + 30, -0.22], [mCar.from + 42, 0]]);
  const GIRL_BACK: Place = { x: 430, y: 1400, h: 600 };
  const girlBackSeat = GIRL_BACK.y - 1100;
  const gk = bodyPoints(GIRL, GIRL_BACK, { turn: 0, seat: girlBackSeat });
  const girlBelt: WorldBelt = {
    anchor: { x: 241, y: 830 },
    shoulder: { x: gk.shoulder(-1).x + 18, y: gk.shoulder(-1).y - 8 },
    tongue: { x: gk.hip(1).x + 10, y: gk.hip(1).y },
    lap: { x: gk.hip(-1).x - 40, y: gk.hip(-1).y },
    buckle: { x: gk.hip(1).x + 14, y: gk.hip(1).y },
    width: 15,
  };
  const girlBackPose = (t: number): PoseIn => ({
    expr: t < dCar.from ? "calm" : t < mCar.from + 20 ? "worried" : "softSmile",
    sit: 1,
    seat: girlBackSeat,
    packOff: true,
    armL: { target: { x: gk.hip(-1).x - 6, y: gk.hip(-1).y - 60 }, shape: "relax", elbow: "down" },
    armR: { target: { x: gk.hip(1).x + 6, y: gk.hip(1).y - 60 }, shape: "relax", elbow: "down" },
    lookY: keys(t, [[cab, 0.2], [dCar.from - 10, 0.2], [dCar.from, 0]]),
    headTilt: keys(t, [[dCar.from, 0], [dCar.from + 10, -3], [mCar.to, -3], [mCar.to + 12, 0]]),
    belt: girlBelt,
  });
  const girlBackFace = (t: number) => keys(t, [[cab, -0.55], [dCar.from - 14, -0.55], [dCar.from - 2, 0.25], [mCar.to + 20, 0.25], [mCar.to + 36, -0.4]]);

  // ---------- F. светофор ----------
  const lt = DRIVE_SHOTS.light[0];
  const red = keys(f, [[lt, 1], [LIGHT.yellow - 2, 1], [LIGHT.yellow + 2, 0]]);
  const yellow = keys(f, [[LIGHT.yellow - 4, 0], [LIGHT.yellow, 1], [LIGHT.green - 2, 1], [LIGHT.green + 2, 0]]);
  const green = keys(f, [[LIGHT.green - 2, 0], [LIGHT.green + 4, 1]]);
  // путь после старта: плавный разгон (px)
  const move = (t: number) => (t < LIGHT.go ? 0 : (3.2 * (t - LIGHT.go) ** 1.5) / Math.sqrt(30));
  const hall = (keysOnHook: boolean) => (
    <>
      <Hallway minutes={7 * 60 + 22 + f / 1800} keysOnHook={keysOnHook} />
      <Actor uid="d4-girl" look="girl" f={f} place={() => GIRL_HALL} face={girlHallFace} pose={girlHallPose} role="daughter" seed={3} />
      <Actor uid="d4-mom" look="mom" f={f} place={() => MOM_HALL} face={momHallFace} pose={momHallPose} role="mother" seed={1} />
    </>
  );
  const keysProp = f < grab ? <CarKeys x={HALL.hook.x} y={HALL.hook.y} k={MOM_HALL.h / 1000} /> : null;
  return (
    <>
      {/* A1: звонок на работу */}
      <Shot f={f} from={0} to={call.to + 22} cam={camMove(f, 0, call.to + 22, { x: 1320, y: 1160, zoom: 1.6 }, { x: 1316, y: 1160, zoom: 1.64 })}>
        {hall(false)}
        {keysProp}
      </Shot>
      {/* A2: «Жүр, кызым» — общий план с дочкой */}
      <Shot f={f} from={call.to + 22} to={keyAt + 2} cam={camMove(f, call.to + 22, keyAt + 2, { x: 1050, y: 1240, zoom: 1.12 }, { x: 1065, y: 1235, zoom: 1.15 })}>
        {hall(false)}
        {keysProp}
      </Shot>
      {/* A3: ключи с крючка */}
      <Shot f={f} from={keyAt + 2} to={YARD_FROM} cam={camMove(f, keyAt + 2, YARD_FROM, { x: 1300, y: 1130, zoom: 1.55 }, { x: 1250, y: 1150, zoom: 1.42 })}>
        {hall(false)}
        {keysProp}
      </Shot>
      {/* звонок на работу: контакт «Жумуш» и время разговора */}
      {f < endCall ? (
        <div style={box({ right: 56, top: 150, padding: "12px 24px 12px 14px", borderRadius: 999, background: "rgba(33,59,89,0.86)", color: "#FFF", fontFamily, display: "flex", alignItems: "center", gap: 14 })}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#4FAD73", display: "flex", alignItems: "center", justifyContent: "center" }}><PhoneIcon size={28} /></div>
          <span style={{ fontSize: 36, fontWeight: 900 }}>{NB2_TEXT.call.contact}</span>
          <span style={{ fontSize: 30, fontWeight: 700, opacity: 0.85 }}>00:{String(4 + Math.floor(f / 30)).padStart(2, "0")}</span>
        </div>
      ) : null}
      {f < 54 ? <div style={box({ left: 72, top: 255, padding: "16px 28px", borderRadius: 20, fontFamily, fontSize: 40, fontWeight: 800, color: "#24354E", backgroundColor: "rgba(255,249,233,0.94)", opacity: 1 - clamp((f - 44) / 10) })}>{NB2_TEXT.nextMorning} · 07:22</div> : null}

      {/* B: двор, утро — идут к машине */}
      <Shot f={f} from={YARD_FROM} to={YARD_TO} cam={{ x: MOM_YARD(f).x - 40, y: 1330, zoom: 1.22 }} base={{ x: MOM_YARD(YARD_FROM).x - 40, y: 1330, zoom: 1.22 }}>
        <Courtyard momCar={MOM_CAR} />
        <Actor uid="d4y-girl" look="girl" f={f} place={GIRL_YARD} face={girlYardFace} pose={girlYardPose} seed={3} walkFrom={YARD_FROM} />
        <Actor uid="d4y-mom" look="mom" f={f} place={MOM_YARD} face={momYardFace} pose={momYardPose} seed={1} walkFrom={YARD_FROM} />
      </Shot>

      {/* C: ремень — дочка сидит на бустере */}
      <Shot f={f} from={DRIVE_SHOTS.belt[0]} to={DRIVE_SHOTS.belt[1]} cam={camMove(f, b0, DRIVE_SHOTS.belt[1], { x: 540, y: 1080, zoom: 1.04 }, { x: 536, y: 1086, zoom: 1.08 })}>
        <RearSeatSide />
        {/* рюкзак на среднем месте — за дочкой */}
        <div style={box({ left: 470, top: 1140, width: 130, height: 140, borderRadius: "36px 36px 22px 22px", backgroundColor: "#FFC90E" })} />
        <Booster x={GIRL_SEAT.x} />
        <Actor uid="d4c-girl" look="girl" f={f} place={() => GIRL_SEAT} face={() => girlTurn} pose={girlSeatPose} seed={3} />
        <Actor uid="d4c-mom" look="mom" f={f} place={() => MOM_DOOR} face={() => 0.5} pose={momDoorPose} seed={1} />
        <RearDoorFrame />
      </Shot>

      {/* E: салон — короткий разговор; обе кисти на ободе, ремни через плечо */}
      <Shot f={f} from={cab} to={DRIVE_SHOTS.cabin[1]} cam={camMove(f, cab, DRIVE_SHOTS.cabin[1], { x: 560, y: 1080, zoom: 1.02 }, { x: 600, y: 1090, zoom: 1.06 })}>
        <CabinBack />
        <div style={box({ left: 520, top: 990, width: 124, height: 128, borderRadius: "36px 36px 20px 20px", backgroundColor: "#FFC90E" })} />
        <div style={box({ left: 536, top: 1058, width: 92, height: 44, borderRadius: 12, backgroundColor: "#E5A800" })} />
        <Actor uid="d4e-girl" look="girl" f={f} place={() => GIRL_BACK} face={girlBackFace} pose={girlBackPose} role="daughter" seed={3} />
        <FrontSeats />
        <Actor uid="d4e-mom" look="mom" f={f} place={() => MOM_DRIVE} face={momDriveFace} pose={momDrivePose} role="mother" seed={1} />
        <CabinFront pass={f - cab} wheel={wheelRot(f)} grips={[{ at: GRIP_L, skin: LOOKS.mom.skin }, { at: GRIP_R, skin: LOOKS.mom.skin }]} />
        <div style={box({ left: 300, top: 1466, width: 200, height: 70, borderRadius: 14, backgroundColor: "#11131A", color: "#7FD3FF", fontFamily, fontSize: 40, fontWeight: 800, textAlign: "center", lineHeight: "70px" })}>{f < mCar.from ? "07:51" : "07:52"}</div>
      </Shot>

      {/* F: светофор — стоят перед переходом, пешеходы переходят, зелёный */}
      <Shot f={f} from={lt} to={DRIVE_SHOTS.light[1]} cam={camMove(f, lt, DRIVE_SHOTS.light[1], { x: 600, y: 1300, zoom: 1.0 }, { x: 620, y: 1300, zoom: 1.03 })}>
        <Sky w={1700} h={1300} />
        <Mountains x={-300} y={620} w={1800} h={300} />
        <PanelHouse x={-200} y={1320} w={1500} floors={5} color="#E4D6C6" seed={11} />
        <div style={box({ left: -400, top: 1320, width: 2000, height: 60, backgroundColor: "#D3CCBF" })} />
        <div style={box({ left: -400, top: 1380, width: 2000, height: 1200, backgroundColor: "#6E737D" })} />
        <div style={box({ left: -400, top: 1690, width: 2000, height: 10, backgroundImage: "repeating-linear-gradient(90deg, #F4F2EC 0 90px, transparent 90px 180px)" })} />
        {/* стоп-линия и пешеходный переход */}
        <div style={box({ left: 790, top: 1380, width: 12, height: 640, backgroundColor: "#F4F2EC", opacity: 0.9 })} />
        <div style={box({ left: 830, top: 1380, width: 220, height: 640, backgroundImage: "repeating-linear-gradient(0deg, #F4F2EC 0 40px, transparent 40px 80px)", opacity: 0.85 })} />
        <Marshrutka x={420 + move(f - 10)} y={1640} s={0.9} wheel={wheelDeg(move(f - 10), (0.9 * 42) / 38)} route="160" />
        <Car x={520 + move(f)} y={1880} s={1.05} color={MOM_CAR} wheel={wheelDeg(move(f), 1.05)} driver kid />
        <Car x={-60 + move(f - 12)} y={1890} s={1.0} color="#4F6B8E" wheel={wheelDeg(move(f - 12), 1)} driver />
        <TrafficLight x={1090} y={1420} s={1.25} red={red} yellow={yellow} green={green} />
        <Tree x={140} y={1400} s={0.9} kind="poplar" tone={1} />
      </Shot>
    </>
  );
};
