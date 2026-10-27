// Общие планы с семейной машиной (сцены 3, 4, 6):
//   CarStreet — у машины: взрослый открывает заднюю дверь (кисть на ручке,
//               дверь вращается вокруг шарнира) и отходит, ребёнок подходит
//               к проёму;
//   SeatView  — вид через открытую дверь: дочка садится (сначала сиденье,
//               потом ремень), взрослый закрывает дверь снаружи;
//   SchoolDrop— у школы: машина у тротуара, ребёнок идёт к входу.
// Пропорции человека, двери и сиденья согласованы (как в №22).
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, Shot, Svg } from "../kit";
import { CarSide, doorHandleAt } from "../props/Car";
import { RearDoorFrame, RearSeatBack } from "../sets/CarViews";
import { HomeYard, SchoolFacade, STREET } from "../sets/Street";
import type { LookId } from "../rig/looks";
import { H } from "./common";

export const STREET_CAR = { x: 1150, y: 1990, s: 1.8 } as const;
const KID_Y = 2100;
const handleWorld = (a: number) => doorHandleAt(STREET_CAR.x, STREET_CAR.y, STREET_CAR.s, a);

// t0 — начало плана (кадр сцены). Тайминг: взрослый у двери → кисть на
// ручке (grab) → дверь открыта (open) → взрослый отходит, ребёнок подходит.
export const carStreetTimes = (t0: number) => {
  const grab = t0 + 14;
  const open: [number, number] = [grab + 4, grab + 30];
  const kid: [number, number] = [t0, open[1] + 22];
  return { t0, grab, open, kid, end: kid[1] + 6 };
};

export const CarStreet: React.FC<{
  readonly f: number;
  readonly t0: number;
  readonly adult: LookId;
  readonly kid: LookId;
  readonly school?: boolean;
  readonly adultRole?: "mother" | "father";
}> = ({ f, t0, adult, kid, school = false }) => {
  const T = carStreetTimes(t0);
  const doorA = keys(f, [[T.open[0], 0], [T.open[1], 66]], anticipate);
  const adultPlace = (tt: number): Place => ({ x: 600 - keys(tt, [[T.open[1] - 4, 0], [T.open[1] + 18, 150]]), y: KID_Y - 16, h: H.mom });
  const adultPose = (tt: number): PoseIn => {
    const holding = tt >= T.grab && tt < T.open[1];
    const h = handleWorld(keys(tt, [[T.open[0], 0], [T.open[1], 66]], anticipate));
    const pl = adultPlace(tt);
    const rest = { x: pl.x + 0.13 * pl.h, y: pl.y - 0.42 * pl.h };
    return {
      expr: "calm",
      lookY: 0.15,
      bagOnShoulder: adult === "su2Mom" ? 1 : 0,
      armR: {
        target: tt < T.grab ? keysV(tt, [[T.grab - 10, rest], [T.grab, h]], anticipate) : holding ? h : keysV(tt, [[T.open[1], h], [T.open[1] + 12, rest]], anticipate),
        shape: holding ? "fist" : "relax",
        elbow: "down",
        behind: false,
      },
    };
  };
  const kidPlace = (tt: number): Place => ({ x: lerp(-120, 830, cruise(clamp((tt - T.kid[0]) / (T.kid[1] - T.kid[0])), 0.28)), y: KID_Y + 14, h: H.girl });
  const cam = { x: keys(f, [[t0, 620], [T.kid[1], 760]]), y: 1640, zoom: 0.95 };
  return (
    <Shot f={f} cam={cam} bg="#D5E6F2">
      {school ? <SchoolFacade /> : <HomeYard />}
      <CarSide x={STREET_CAR.x} y={STREET_CAR.y} s={STREET_CAR.s} layer="back" open={doorA} />
      <CarSide x={STREET_CAR.x} y={STREET_CAR.y} s={STREET_CAR.s} layer="body" open={doorA} />
      <CarSide x={STREET_CAR.x} y={STREET_CAR.y} s={STREET_CAR.s} layer="door" open={doorA} />
      <Actor uid="cs-adult" look={adult} f={f} place={adultPlace} face={(tt) => (tt < T.open[1] + 4 ? 0.7 : keys(tt, [[T.open[1] + 4, 0.7], [T.open[1] + 14, -0.5]]))} pose={adultPose} seed={5} walkFrom={T.open[1] - 6} />
      <Actor uid="cs-kid" look={kid} f={f} place={kidPlace} face={() => 0.65} pose={() => ({ expr: "calm", lookY: 0.05 })} seed={7} blinkShift={23} walkFrom={T.kid[0]} />
    </Shot>
  );
};

// ---------- Посадка: вид через открытую дверь ----------
const SEAT_Y = 1640;
const ANCHOR = { x: 300, y: 820 };
const BUCKLE = { x: 616, y: 1290 };
const Belt: React.FC<{ anchor: { x: number; y: number }; to: { x: number; y: number }; lap?: { x: number; y: number } }> = ({ anchor, to, lap }) => (
  <Svg>
    <path d={`M ${anchor.x} ${anchor.y} L ${to.x} ${to.y}`} stroke="#1F2228" strokeWidth={20} strokeLinecap="round" />
    <path d={`M ${anchor.x} ${anchor.y} L ${to.x} ${to.y}`} stroke="#3A3F4A" strokeWidth={8} strokeLinecap="round" />
    {lap ? <path d={`M ${lap.x} ${lap.y} L ${to.x} ${to.y}`} stroke="#1F2228" strokeWidth={20} strokeLinecap="round" /> : null}
    <rect x={to.x - 13} y={to.y - 9} width={26} height={18} rx={4} fill="#9AA3B2" />
  </Svg>
);

export const seatTimes = (t0: number) => {
  const sitDone = t0 + 34;
  const belt: [number, number] = [sitDone + 4, sitDone + 30];
  const close: [number, number] = [belt[1] + 8, belt[1] + 24];
  return { t0, sitDone, belt, close, end: close[1] + 4 };
};

export const SeatView: React.FC<{ readonly f: number; readonly t0: number; readonly kid: LookId }> = ({ f, t0, kid }) => {
  const T = seatTimes(t0);
  const place = (tt: number): Place => ({ x: lerp(1180, 520, easeInOut(clamp((tt - t0) / 30))), y: SEAT_Y, h: 780 });
  const pull = easeInOut(clamp((f - T.belt[0]) / (T.belt[1] - T.belt[0])));
  const reach = easeInOut(clamp((f - T.belt[0] + 6) / 8));
  const beltHand = { x: lerp(ANCHOR.x + 20, BUCKLE.x, pull), y: lerp(ANCHOR.y + 60, BUCKLE.y, pull) };
  const door = easeInOut(clamp((f - T.close[0]) / (T.close[1] - T.close[0])));
  const pose = (tt: number): PoseIn => {
    const u = clamp((tt - t0) / 34);
    const pl = place(tt);
    const rest = { x: pl.x + 0.1 * pl.h, y: SEAT_Y - 0.36 * pl.h };
    return {
      sit: easeInOut(clamp(u * 1.3 - 0.1)),
      seat: SEAT_Y - 1300,
      crouch: u < 0.6 ? 0.35 * (1 - u / 0.6) : 0,
      lean: keys(tt, [[t0, 18], [t0 + 30, 4], [t0 + 40, 0]]),
      expr: tt > T.belt[1] ? "softSmile" : "calm",
      packOff: true,
      armL: {
        target: tt >= T.belt[0] - 6 && tt < T.belt[1] + 4 ? (reach < 1 ? { x: lerp(rest.x, ANCHOR.x + 20, reach), y: lerp(rest.y, ANCHOR.y + 60, reach) } : beltHand) : rest,
        shape: tt >= T.belt[0] && tt < T.belt[1] ? "fist" : "relax",
        elbow: "down",
        behind: false,
      },
      armR: { target: { x: pl.x - 0.1 * pl.h, y: SEAT_Y - 0.36 * pl.h }, shape: "relax", elbow: "down", behind: false },
      lookY: 0.15,
    };
  };
  const face = (tt: number) => keys(tt, [[t0, -0.5], [t0 + 30, 0], [T.belt[0], 0.4], [T.belt[1], 0.1], [T.close[0] - 6, -0.3]]);
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3B414D">
      <RearSeatBack />
      <Actor uid="sv-kid" look={kid} f={f} place={place} face={face} pose={pose} seed={7} blinkShift={23} />
      {f >= T.belt[0] ? <Belt anchor={ANCHOR} to={f < T.belt[1] ? beltHand : BUCKLE} lap={f >= T.belt[1] ? { x: 400, y: 1290 } : undefined} /> : null}
      <RearDoorFrame />
      {door > 0 ? <div style={box({ left: lerp(1080, -40, door), top: 0, width: 1200, height: 1920, backgroundColor: "#F7F8FA", borderLeft: "16px solid #C9D0DA" })} /> : null}
    </Shot>
  );
};

// ---------- У школы: машина у тротуара, ребёнок идёт к входу ----------
export const SchoolDrop: React.FC<{ readonly f: number; readonly t0: number; readonly kid: LookId; readonly toSchool?: boolean; readonly len: number }> = ({ f, t0, kid, toSchool = true, len }) => {
  const k = f - t0;
  const u = clamp(k / Math.max(1, len));
  const kidPlace = (tt: number): Place => {
    const v = cruise(clamp((tt - t0 - 4) / Math.max(10, len - 4)), 0.3);
    // идёт вдоль тротуара: к входу школы (вправо) или от входа к машине (влево)
    return { x: toSchool ? lerp(620, 960, v) : lerp(960, 640, v), y: STREET.curbY + 70, h: H.girl };
  };
  return (
    <Shot f={f} cam={{ x: 980, y: 1560, zoom: lerp(0.62, 0.66, u) }} bg="#CFE0EE">
      <SchoolFacade />
      <CarSide x={STREET_CAR.x - 900} y={STREET_CAR.y} s={STREET_CAR.s} layer="back" />
      <CarSide x={STREET_CAR.x - 900} y={STREET_CAR.y} s={STREET_CAR.s} layer="body" />
      <Actor uid="sd-kid" look={kid} f={f} place={kidPlace} face={() => (toSchool ? 0.7 : -0.7)} pose={() => ({ expr: "softSmile" })} seed={7} blinkShift={23} walkFrom={t0} />
    </Shot>
  );
};
