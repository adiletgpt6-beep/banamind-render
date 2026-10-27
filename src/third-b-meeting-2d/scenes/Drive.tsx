// Сцена 12. Сегодня получилось. N04 (рассказчик; рты закрыты).
// A. Ноутбук убран в сумку; Айжан выходит через заднюю левую дверь
//    (уходит вправо в кадре). Дочка остаётся сзади справа.
// B. С дороги (полоса пустая): Айжан закрывает заднюю дверь, проходит к
//    водительской, открывает её и садится — склейка в проёме.
// C. Салон спереди: Айжан за рулём пристёгивается; дочка сзади справа
//    пристёгнута, рисунок у неё на коленях. Только после этого машина
//    трогается.
// D. Улица: машина спокойно едет.
// E. Салон: на остановке Айжан выдыхает, плечи опускаются; смотрит на
//    дорогу, телефон не трогает. Это сама мама везёт дочь домой.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { box, Shot, Svg, useScene } from "../kit";
import { C } from "../theme";
import { CarSide, carPt, doorHandleAt, frontHandleAt } from "../props/Car";
import { CabinBack, CabinFront, FrontSeats } from "../sets/CarViews";
import { SchoolRoad, STREET } from "../sets/School";
import { ClassDrawing, SHEET } from "../props/Drawing";
import { CallA, kyzSeatPose, momCallPose } from "./callA";
import { KYZ_A } from "./cabinA";

export const drivePlan = (len: number) => {
  const out: [number, number] = [26, 56];
  const road = 60;
  const rClose: [number, number] = [road + 6, road + 22];
  const walk: [number, number] = [road + 26, road + 64];
  const grab = walk[1] + 4;
  const fOpen: [number, number] = [grab + 4, grab + 24];
  const cabin = fOpen[1] + 8;
  const belt: [number, number] = [cabin + 10, cabin + 40];
  const go = belt[1] + 8;
  const street = go + 40;
  const back = street + 76;
  const stop = back + 30;
  return { out, road, rClose, walk, grab, fOpen, cabin, belt, go, street, back, stop, len };
};
type P = ReturnType<typeof drivePlan>;

// ---------- A ----------
const Leave: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const u = easeInOut(clamp((f - p.out[0]) / (p.out[1] - p.out[0])));
  const momPlace = (t: number): Place => ({ x: lerp(735, 1260, easeInOut(clamp((t - p.out[0]) / (p.out[1] - p.out[0])))), y: 1790, h: 1540 });
  return (
    <AbsoluteFill>
      <CallA
        f={f}
        uid="s12a"
        laptop={f < p.out[0] - 4 ? 0 : -1}
        sample={0}
        mom={(t) =>
          momCallPose({
            sit: 1 - 0.6 * easeInOut(clamp((t - p.out[0]) / (p.out[1] - p.out[0]))),
            lean: 10 * u,
            expr: "softSmile",
            lookY: 0.4,
            // закрытый ноутбук в чехле берёт с собой
            armR: t >= p.out[0] - 4 ? { target: { x: momPlace(t).x + 150, y: 1380 }, shape: "fist", item: "laptopbag", elbow: "down", behind: false } : { target: { x: 830, y: 1442 }, elbow: "down" },
          })
        }
        momFace={(t) => keys(t, [[p.out[0] - 6, 0], [p.out[0] + 6, 0.6]])}
        kyz={() => kyzSeatPose(0.001, { expr: "softSmile", lookY: 0.2 })}
        kyzFace={() => 0.45}
        album={1}
        lift={0.001}
        cam={{ x: 560, y: 1020, zoom: 1.08 }}
        momPlace={momPlace}
      />
    </AbsoluteFill>
  );
};

// ---------- B ----------
const CAR_B = { x: 640, y: STREET.ground, s: 1.8, dir: 1 as const };
const H_MOM = 660;
const Road: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const rd = keys(f, [[p.road, 66], [p.rClose[0], 66], [p.rClose[1], 0]], easeInOut);
  const fd = keys(f, [[p.fOpen[0], 0], [p.fOpen[1], 62]], anticipate);
  const REAR = carPt(CAR_B.x, CAR_B.y, CAR_B.s, 120, 0, CAR_B.dir).x;
  const FRONT = carPt(CAR_B.x, CAR_B.y, CAR_B.s, -150, 0, CAR_B.dir).x;
  const place = (t: number): Place => {
    const u = cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3);
    return { x: lerp(REAR - 60, FRONT + 120, u) + keys(t, [[p.fOpen[0], 0], [p.fOpen[0] + 16, 70]]), y: STREET.ground + 70, h: H_MOM };
  };
  const pose = (t: number) => {
    const pl = place(t);
    const rh = doorHandleAt(CAR_B.x, CAR_B.y, CAR_B.s, keys(t, [[p.road, 66], [p.rClose[0], 66], [p.rClose[1], 0]], easeInOut), CAR_B.dir);
    const fh = frontHandleAt(CAR_B.x, CAR_B.y, CAR_B.s, keys(t, [[p.fOpen[0], 0], [p.fOpen[1], 62]], anticipate), CAR_B.dir);
    const rest = { x: pl.x - 0.14 * pl.h, y: pl.y - 0.42 * pl.h };
    const onRear = t < p.rClose[1] + 2;
    const onFront = t >= p.grab && t < p.fOpen[1] + 2;
    return {
      expr: "calm" as const,
      lookY: 0.15,
      armL: { target: onRear ? rh : onFront ? fh : keysV(t, [[p.rClose[1] + 2, rh], [p.rClose[1] + 14, rest], [p.grab - 10, rest], [p.grab, fh]], anticipate), shape: onRear || onFront ? ("fist" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      armR: { target: { x: pl.x + 0.06 * pl.h, y: pl.y - 0.5 * pl.h }, shape: "fist" as const, item: "laptopbag" as const, elbow: "hang" as const },
    };
  };
  return (
    <Shot f={f} cam={{ x: 640, y: 1690, zoom: 0.92 }} bg={C.sky}>
      <SchoolRoad />
      <CarSide x={CAR_B.x} y={CAR_B.y} s={CAR_B.s} layer="back" open={rd} openFront={fd} dir={CAR_B.dir} />
      <CarSide x={CAR_B.x} y={CAR_B.y} s={CAR_B.s} layer="body" open={rd} openFront={fd} dir={CAR_B.dir} />
      <Actor uid="s12-mom" look="aizhan" f={f} place={place} face={(t) => (t < p.rClose[1] + 4 ? 0.8 : -0.75)} pose={pose} seed={5} walkFrom={p.walk[0] - 2} />
      <CarSide x={CAR_B.x} y={CAR_B.y} s={CAR_B.s} layer="door" open={rd} openFront={fd} dir={CAR_B.dir} />
    </Shot>
  );
};

// ---------- C / E. Салон спереди ----------
const MOM_F: Place = { x: 830, y: 1980, h: 1180 };
const KYZ_F: Place = { x: 440, y: 1330, h: 760 };
export const DriveCabin: React.FC<{ f: number; pass: number; belt: number; exhale?: number; uid: string }> = ({ f, pass, belt, exhale = 0, uid }) => {
  const beltEnd = { x: lerp(962, 752, easeInOut(belt)), y: lerp(878, 1440, easeInOut(belt)) };
  const pull = belt > 0 && belt < 1;
  const momPose = () => ({
    sit: 1,
    seat: 780,
    expr: exhale > 0.5 ? ("softSmile" as const) : ("calm" as const),
    exhale,
    shoulders: 0,
    lookY: -0.05,
    armL: { target: { x: 664, y: 1258 }, shape: "fist" as const, elbow: "down" as const, behind: false, wrist: -20 },
    armR: { target: pull ? { x: beltEnd.x + 20, y: beltEnd.y } : { x: 976, y: 1258 }, shape: "fist" as const, elbow: "down" as const, behind: false, wrist: 20 },
  });
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3B414D">
      <CabinBack />
      <div style={box({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = ((((i * 260 - pass * 10) % 1300) + 1300) % 1300) - 200;
          return <div key={i} style={box({ left: x, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#F1E3C8", "#8FB07C", "#DDE3E8", "#E8DCCB", "#9DBB8C"][i], borderRadius: i % 2 ? 80 : 6 })} />;
        })}
      </div>
      {/* бустер и дочка сзади справа (слева в кадре), пристёгнута */}
      <div style={box({ left: 300, top: 1040, width: 280, height: 70, borderRadius: 20, backgroundColor: "#3D434F", borderTop: `8px solid ${C.green}` })} />
      <Actor uid={`${uid}-kyz`} look="kyz" f={f} place={() => KYZ_F} face={() => -0.15} pose={() => ({ sit: 1, seat: 300, packOff: true, expr: "softSmile", lookX: -0.2, lookY: 0.1, armL: { target: { x: 400, y: 1030 }, elbow: "down" }, armR: { target: { x: 490, y: 1034 }, elbow: "down", behind: false } })} seed={4} blinkShift={37} />
      <Svg>
        <g transform={`translate(${KYZ_F.x - 70} 1000) scale(${150 / SHEET.w}) rotate(-6)`}>
          <ClassDrawing id={`${uid}-lap`} />
        </g>
        <path d="M 352 790 L 508 1036" stroke="#1F2228" strokeWidth={18} strokeLinecap="round" />
        <path d="M 358 1034 L 508 1036" stroke="#1F2228" strokeWidth={18} strokeLinecap="round" />
        <rect x={496} y={1028} width={24} height={16} rx={4} fill="#9AA3B2" />
      </Svg>
      <FrontSeats />
      <Actor uid={`${uid}-mom`} look="aizhan" f={f} place={() => MOM_F} face={() => 0} pose={momPose} seed={5} layer="body" />
      <Svg>
        {belt > 0 ? (
          <>
            <path d={`M 962 878 L ${beltEnd.x} ${beltEnd.y}`} stroke="#1F2228" strokeWidth={22} strokeLinecap="round" />
            <path d={`M 962 878 L ${beltEnd.x} ${beltEnd.y}`} stroke="#3A3F4A" strokeWidth={9} strokeLinecap="round" />
          </>
        ) : null}
      </Svg>
      <CabinFront pass={pass} wheel={0} />
      <Actor uid={`${uid}-mom`} look="aizhan" f={f} place={() => MOM_F} face={() => 0} pose={momPose} seed={5} layer="arms" />
    </Shot>
  );
};

// ---------- D. Улица ----------
const Street: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = f - p.street;
  const x = lerp(1500, -300, easeOut(clamp(k / 90)) * 0.6 + clamp(k / 90) * 0.4);
  return (
    <Shot f={f} cam={{ x: 640, y: 1700, zoom: 0.7 }} bg={C.sky}>
      <SchoolRoad />
      <CarSide x={x} y={STREET.ground} s={1.6} layer="back" dir={1} />
      <CarSide x={x} y={STREET.ground} s={1.6} layer="body" dir={1} wheel={-k * 9} />
    </Shot>
  );
};

export const DriveScene: React.FC = () => {
  const { f, len } = useScene("drive");
  const p = drivePlan(len);
  if (f < p.road) return <Leave f={f} p={p} />;
  if (f < p.cabin) return <Road f={f} p={p} />;
  if (f >= p.street && f < p.back) return <Street f={f} p={p} />;
  const belt = clamp((f - p.belt[0]) / (p.belt[1] - p.belt[0]));
  const moving = f >= p.go;
  // едет: отражения плывут; на остановке — замирают, выдох
  const pass = moving ? Math.max(0, Math.min(f, p.stop) - p.go) * 1.4 + (f > p.stop + 50 ? (f - p.stop - 50) * 1.2 : 0) : 0;
  const exhale = keys(f, [[p.stop + 6, 0], [p.stop + 22, 1], [p.stop + 50, 0.5]]);
  return <DriveCabin f={f} pass={pass} belt={belt} exhale={exhale} uid="s12c" />;
};
export { KYZ_A };
