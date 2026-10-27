// Сцена 5. Переговорная у школы. N03.
// A. С тротуара: тихая улица, «Мектеп», белый седан стоит у тротуара
//    (правой стороной к тротуару); Айжан приехала заранее, она за рулём.
// B. С дороги (левая сторона машины): полоса рядом пустая — никто не едет
//    вплотную. Айжан открывает водительскую дверь (дверь вращается вокруг
//    шарнира) → склейка в проёме: она уже стоит у двери с ноутбуком и
//    папкой, закрывает дверь, делает пару шагов к задней левой двери,
//    берётся за ручку, открывает и садится (кузов и открытая дверь
//    перекрывают тело). Без «телепортации» между местами.
// C. Салон, ракурс A: она на заднем левом месте; закрытый ноутбук на
//    коленях — крышка открывается вокруг шарнира; папку кладёт рядом.
// D. Вставка экрана: окно подключения — её камера, «Үн» и «Камера»
//    включаются касаниями.
// E. Снова A: спокойный вдох, собранный взгляд на экран.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { T3bTimeline } from "../timing";
import { CarSide, carPt, doorHandleAt, frontHandleAt } from "../props/Car";
import { FEED, Fit, MomFeed } from "../props/Call";
import { LaptopScreenView } from "../props/Laptop";
import { CloseHand } from "../props/CloseHand";
import { SchoolRoad, SchoolSidewalk, STREET } from "../sets/School";
import { CabinA, MOM_KEYS, MOM_SEAT, LAPTOP_A } from "./cabinA";
import { MOM_HAND } from "./Studio";

export const parkedPlan = (tl: T3bTimeline) => {
  const T = sceneTools(tl, "parked");
  const road = 78;
  const fOpen: [number, number] = [road + 14, road + 34];
  const out = road + 40; // склейка: уже стоит у двери
  const fClose: [number, number] = [out + 8, out + 26];
  const walk: [number, number] = [out + 30, out + 78];
  const grab = walk[1] + 4;
  const rOpen: [number, number] = [grab + 4, grab + 28];
  const enter: [number, number] = [rOpen[1] + 4, rOpen[1] + 14];
  const cabin = enter[1];
  const lid: [number, number] = [cabin + 22, cabin + 46];
  const folder: [number, number] = [lid[1] + 8, lid[1] + 34];
  const check = folder[1] + 6;
  const toggles = [check + 16, check + 30];
  const breath = check + 50;
  return { road, fOpen, out, fClose, walk, grab, rOpen, enter, cabin, lid, folder, check, toggles, breath, len: T.len };
};
type P = ReturnType<typeof parkedPlan>;

// ---------- A. С тротуара ----------
const CAR_A = { x: 1180, y: STREET.ground, s: 1.6 } as const;
const MOM_DRIVER_A: Place = { x: 1180 - 90 * 1.6, y: STREET.ground, h: 600 };
const Sidewalk: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} cam={{ x: 1020 + 30 * easeInOut(clamp(f / 78)), y: 1500, zoom: 0.72 }} bg={C.sky}>
    <SchoolSidewalk />
    <CarSide x={CAR_A.x} y={CAR_A.y} s={CAR_A.s} layer="back" dir={1} />
    <div style={box({ left: 0, top: 0, width: 3000, height: STREET.ground - 80, overflow: "hidden" })}>
      <Actor uid="p5-mom-a" look="aizhan" f={f} place={() => MOM_DRIVER_A} face={() => -0.75} pose={() => ({ sit: 1, seat: 170, expr: "calm", lookY: 0.2, armL: { target: { x: MOM_DRIVER_A.x - 110, y: 1700 }, elbow: "down" }, armR: { target: { x: MOM_DRIVER_A.x - 70, y: 1710 }, elbow: "down" } })} seed={5} />
    </div>
    <CarSide x={CAR_A.x} y={CAR_A.y} s={CAR_A.s} layer="body" dir={1} />
  </Shot>
);

// ---------- B. С дороги ----------
const CAR_B = { x: 640, y: STREET.ground, s: 1.8, dir: 1 as const };
const H_MOM = 660;
const fDoor = (p: P, t: number) => (t < p.out ? keys(t, [[p.fOpen[0], 0], [p.fOpen[1], 62]], anticipate) : keys(t, [[p.fClose[0], 62], [p.fClose[1], 0]], easeInOut));
const rDoor = (p: P, t: number) => keys(t, [[p.rOpen[0], 0], [p.rOpen[1], 66]], anticipate);
const FRONT_STAND = carPt(CAR_B.x, CAR_B.y, CAR_B.s, -150, 0, CAR_B.dir).x;
const REAR_STAND = carPt(CAR_B.x, CAR_B.y, CAR_B.s, 120, 0, CAR_B.dir).x;
const momRoad = (p: P) => (t: number): Place => {
  const u = cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3);
  // к ручке задней двери; при открытии — шаг назад от двери; затем в проём
  const back = keys(t, [[p.rOpen[0], 0], [p.rOpen[0] + 16, -70]]);
  const into = keys(t, [[p.enter[0], 0], [p.enter[1], 60]]);
  return { x: lerp(FRONT_STAND - 120, REAR_STAND - 40, u) + back + into, y: STREET.ground + 70, h: H_MOM };
};
const Road: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const fd = fDoor(p, f);
  const rd = rDoor(p, f);
  const inside = f < p.out;
  const place = momRoad(p);
  const pose = (t: number) => {
    const pl = place(t);
    const fh = frontHandleAt(CAR_B.x, CAR_B.y, CAR_B.s, fDoor(p, t), CAR_B.dir);
    const rh = doorHandleAt(CAR_B.x, CAR_B.y, CAR_B.s, rDoor(p, t), CAR_B.dir);
    const rest = { x: pl.x + 0.14 * pl.h, y: pl.y - 0.42 * pl.h };
    const onFront = t >= p.fClose[0] - 2 && t < p.fClose[1] + 2;
    const onRear = t >= p.grab && t < p.rOpen[1] + 4;
    const target = onFront ? fh : onRear ? rh : t < p.fClose[0] ? keysV(t, [[p.out, rest], [p.fClose[0] - 2, fh]], anticipate) : t < p.grab ? keysV(t, [[p.fClose[1] + 2, fh], [p.fClose[1] + 14, rest], [p.grab - 10, rest], [p.grab, rh]], anticipate) : keysV(t, [[p.rOpen[1] + 4, rh], [p.rOpen[1] + 16, { x: pl.x + 0.2 * pl.h, y: pl.y - 0.55 * pl.h }]], anticipate);
    return {
      expr: "calm" as const,
      lookY: 0.15,
      crouch: keys(t, [[p.enter[0], 0], [p.enter[1], 0.25]]),
      lean: keys(t, [[p.enter[0], 0], [p.enter[1], 10]]),
      armR: { target, shape: onFront || onRear ? ("fist" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      armL: { target: { x: pl.x - 0.06 * pl.h, y: pl.y - 0.5 * pl.h }, shape: "fist" as const, item: "laptop" as const, elbow: "in" as const, behind: false },
    };
  };
  const face = (t: number) => (t < p.walk[1] + 6 ? 0.7 : t < p.enter[0] ? 0.8 : 0.9);
  const driver: Place = { x: carPt(CAR_B.x, CAR_B.y, CAR_B.s, -90, 0, CAR_B.dir).x, y: STREET.ground, h: H_MOM };
  return (
    <Shot f={f} cam={{ x: 720, y: 1690, zoom: 0.92 }} bg={C.sky}>
      <SchoolRoad />
      <CarSide x={CAR_B.x} y={CAR_B.y} s={CAR_B.s} layer="back" open={rd} openFront={fd} dir={CAR_B.dir} />
      {inside ? (
        <div style={box({ left: 0, top: 0, width: 3000, height: STREET.ground - 90, overflow: "hidden" })}>
          <Actor uid="p5-mom-in" look="aizhan" f={f} place={() => driver} face={() => -0.75} pose={() => ({ sit: 1, seat: 190, expr: "calm", armR: { target: { x: driver.x - 40, y: 1720 }, elbow: "down", item: "laptop", shape: "fist" }, armL: { target: { x: driver.x - 110, y: 1700 }, elbow: "down" } })} seed={5} />
        </div>
      ) : null}
      <CarSide x={CAR_B.x} y={CAR_B.y} s={CAR_B.s} layer="body" open={rd} openFront={fd} dir={CAR_B.dir} />
      {!inside ? <Actor uid="p5-mom" look="aizhan" f={f} place={place} face={face} pose={pose} seed={5} walkFrom={p.walk[0] - 2} /> : null}
      <CarSide x={CAR_B.x} y={CAR_B.y} s={CAR_B.s} layer="door" open={rd} openFront={fd} dir={CAR_B.dir} />
    </Shot>
  );
};

// ---------- C/E. Салон ----------
const Cabin: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const lid = easeInOut(clamp((f - p.lid[0]) / (p.lid[1] - p.lid[0])));
  const lidTop = { x: LAPTOP_A.x, y: LAPTOP_A.y - LAPTOP_A.w * 0.64 * Math.sin(lid * 1.83) * 0.92 - 10 };
  const folderU = easeInOut(clamp((f - p.folder[0]) / (p.folder[1] - p.folder[0])));
  const settle = 1 - easeOut(clamp((f - p.cabin) / 16));
  const pose = (t: number) => {
    const lifting = t >= p.lid[0] - 8 && t < p.lid[1] + 2;
    const folding = t >= p.folder[0] - 8 && t < p.folder[1] + 4;
    const breath = keys(t, [[p.breath, 0], [p.breath + 18, 1], [p.breath + 44, 0]]);
    return {
      sit: 1,
      seat: MOM_SEAT + 30 * settle,
      lean: 6 * settle,
      expr: t >= p.breath + 30 ? ("softSmile" as const) : ("calm" as const),
      lookY: t < p.lid[1] ? 0.55 : 0.35,
      exhale: breath,
      shoulders: keys(t, [[p.breath, 0], [p.breath + 18, 0.6], [p.breath + 30, 0]]),
      armR: { target: lifting ? { x: lidTop.x + 90, y: lidTop.y + 6 } : MOM_KEYS.r, shape: lifting ? ("pinch" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      armL: {
        target: folding ? keysV(t, [[p.folder[0] - 8, MOM_KEYS.l], [p.folder[0], { x: 600, y: 1420 }], [p.folder[1], { x: 520, y: 1330 }], [p.folder[1] + 4, MOM_KEYS.l]]) : lifting ? { x: lidTop.x - 90, y: lidTop.y + 6 } : MOM_KEYS.l,
        shape: folding || lifting ? ("pinch" as const) : ("relax" as const),
        elbow: "down" as const,
        behind: false,
      },
    };
  };
  const folderPos = { x: lerp(600, 500, folderU), y: lerp(1420, 1325, folderU) };
  return (
    <CabinA
      f={f}
      uid="p5"
      kyz={false}
      laptop={lid}
      momFace={() => 0}
      momPose={pose}
      extra={
        <div style={box({ left: folderPos.x - 90, top: folderPos.y - 20, width: 180, height: 44, borderRadius: 6, backgroundColor: C.navy, borderTop: `8px solid ${C.bulakA}`, opacity: f >= p.folder[0] - 8 ? 1 : 0 })} />
      }
    />
  );
};

// ---------- D. Экран подключения ----------
const Join: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const on = p.toggles.map((t) => f >= t);
  // курсор по экрану → кнопка; палец нажимает тачпад
  const cur = keysV(f, [[p.check + 2, { x: 640, y: 420 }], [p.toggles[0] - 2, { x: 470, y: 650 }], [p.toggles[1] - 8, { x: 470, y: 650 }], [p.toggles[1] - 2, { x: 800, y: 650 }]], easeInOut);
  const press = p.toggles.some((t) => f >= t - 2 && f < t + 2) ? 1 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#2B2F38" }}>
      <LaptopScreenView x={540} y={1120} w={1000}>
        <div style={box({ left: 0, top: 0, width: 1280, height: 800, backgroundColor: "#1E232D" })}>
          <Fit x={220} y={60} W={840} w={FEED.w} h={FEED.h} radius={12}>
            <MomFeed f={f} lift={0} uid="p5j" face={() => ({ expr: "calm", face: 0.04, lookY: 0.08 })} />
          </Fit>
          {[T3B_TEXT.call.mute, T3B_TEXT.call.cam].map((t, i) => (
            <div key={t} style={box({ left: 340 + i * 330, top: 600, width: 270, height: 100, borderRadius: 50, backgroundColor: on[i] ? C.green : "#3A414E", color: C.white, fontFamily: F.text, fontWeight: 800, fontSize: 40, textAlign: "center", lineHeight: "100px" })}>
              {on[i] ? `✓ ${t}` : t}
            </div>
          ))}
          <svg width={60} height={70} style={box({ left: cur.x, top: cur.y })}>
            <path d="M 4 4 L 4 52 L 18 40 L 28 62 L 38 58 L 28 36 L 46 36 Z" fill="#FFFFFF" stroke="#182638" strokeWidth={4} strokeLinejoin="round" />
          </svg>
        </div>
      </LaptopScreenView>
      <Svg>
        <CloseHand x={560} y={1760 + press * 6} angle={186} size={190} {...MOM_HAND} shape="point" armLen={3} />
      </Svg>
    </AbsoluteFill>
  );
};

export const ParkedScene: React.FC = () => {
  const { f } = useScene("parked");
  const p = usePlan(parkedPlan);
  if (f < p.road) return <Sidewalk f={f} />;
  if (f < p.cabin) return <Road f={f} p={p} />;
  if (f >= p.check && f < p.breath - 6) return <Join f={f} p={p} />;
  return <Cabin f={f} p={p} />;
};
