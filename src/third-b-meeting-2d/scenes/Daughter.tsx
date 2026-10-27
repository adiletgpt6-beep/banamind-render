// Сцена 6. Дочка пришла.
// A. С тротуара, общий план: дочка выходит из школы с рюкзаком — видно
//    расстояние до машины; спокойный шаг вдоль тротуара (стопы не
//    скользят: фаза шага — по пройденному пути).
// B. Средний план: подход к задней правой двери, рука на ручке, дверь
//    открывается вокруг шарнира.
// C. Салон, ракурс A (склейка после контакта с ручкой, направление то же —
//    она входит слева в кадре, через правую дверь): садится на бустер,
//    снимает рюкзак, закрывает дверь, тянет ремень через плечо к замку;
//    мама отрывается от ноутбука, проверяет защёлку (щелчок). M02, G01 —
//    кивок.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { T3bTimeline } from "../timing";
import { C } from "../theme";
import { CarSide, doorHandleAt } from "../props/Car";
import { CurbSide, SchoolSidewalk, STREET } from "../sets/School";
import { CABIN } from "../sets/Cabin";
import { CabinA, KYZ_A, KYZ_SEAT, KYZ_SHOULDER, MOM_KEYS, MOM_SEAT } from "./cabinA";

export const daughterPlan = (tl: T3bTimeline) => {
  const T = sceneTools(tl, "daughter");
  const walk: [number, number] = [8, 112];
  const mid = 112; // склейка: вид с тротуара, она подходит к задней правой двери
  const walk2: [number, number] = [mid, mid + 22];
  const grab = walk2[1] + 6;
  const open: [number, number] = [grab + 4, grab + 26];
  const cabin = open[1] + 10;
  const sit: [number, number] = [cabin, cabin + 30];
  const door: [number, number] = [sit[1] + 4, sit[1] + 18];
  const belt: [number, number] = [door[1] + 10, door[1] + 38];
  const check: [number, number] = [belt[1] - 6, belt[1] + 14];
  return { walk, mid, walk2, grab, open, cabin, sit, door, belt, check, m02: T.from("M02"), g01: T.from("G01"), g01End: T.to("G01"), len: T.len };
};
type P = ReturnType<typeof daughterPlan>;

// A. Через улицу: школа за машиной, машина носом влево (левая сторона к
// зрителю); дочка выходит из дверей школы и идёт по тротуару за машиной.
const CAR_W = { x: 1950, y: STREET.ground, s: 1.6 } as const;
const H_KYZ_W = 450;
const Wide: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const place = (t: number): Place => {
    const u = cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.18);
    return { x: lerp(1000, 1600, u), y: STREET.curb - 8, h: H_KYZ_W };
  };
  const pose = (t: number) => {
    const pl = place(t);
    return { expr: "calm" as const, strapTug: 0.6, armR: { target: { x: pl.x + 0.12 * pl.h, y: pl.y - 0.42 * pl.h }, elbow: "down" as const }, armL: { target: { x: pl.x - 0.08 * pl.h, y: pl.y - 0.6 * pl.h }, shape: "fist" as const, elbow: "hang" as const } };
  };
  return (
    <Shot f={f} cam={{ x: 1450 + 60 * easeInOut(clamp(f / p.walk[1])), y: 1560, zoom: 0.62 }} bg={C.sky}>
      <SchoolSidewalk />
      <Actor uid="p6-kyz-w" look="kyz" f={f} place={place} face={() => 0.7} pose={pose} seed={4} blinkShift={37} walkFrom={p.walk[0] - 2} />
      <CarSide x={CAR_W.x} y={CAR_W.y} s={CAR_W.s} layer="back" dir={1} />
      <CarSide x={CAR_W.x} y={CAR_W.y} s={CAR_W.s} layer="body" dir={1} />
    </Shot>
  );
};

// B. С тротуара (камера у школы): машина носом вправо, правая сторона к
// зрителю; дочка подходит справа (от школы), берётся за ручку задней
// правой двери, открывает её и отступает на шаг.
const CAR = { x: 980, y: STREET.ground, s: 1.8 } as const;
const H_KYZ = 520;
const doorA = (p: P, t: number) => keys(t, [[p.open[0], 0], [p.open[1], 64]], anticipate);
const HANDLE0 = doorHandleAt(CAR.x, CAR.y, CAR.s, 0);
const kyzStreet = (p: P) => (t: number): Place => {
  const u = cruise(clamp((t - p.walk2[0]) / (p.walk2[1] - p.walk2[0])), 0.4);
  const back = keys(t, [[p.open[0], 0], [p.open[0] + 18, -90]]);
  return { x: lerp(HANDLE0.x + 330, HANDLE0.x + 120, u) + back, y: STREET.ground + 70, h: H_KYZ };
};

const Street: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const da = doorA(p, f);
  const place = kyzStreet(p);
  const pose = (t: number) => {
    const pl = place(t);
    const h = doorHandleAt(CAR.x, CAR.y, CAR.s, doorA(p, t));
    const rest = { x: pl.x - 0.13 * pl.h, y: pl.y - 0.42 * pl.h };
    const holding = t >= p.grab && t < p.open[1] + 2;
    return {
      expr: "calm" as const,
      lookY: 0.05,
      armL: { target: holding ? h : keysV(t, [[p.grab - 10, rest], [p.grab, h], [p.open[1] + 2, h], [p.open[1] + 14, rest]], anticipate), shape: holding ? ("fist" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      armR: { target: { x: pl.x + 0.08 * pl.h, y: pl.y - 0.6 * pl.h }, shape: "fist" as const, elbow: "hang" as const },
    };
  };
  return (
    <Shot f={f} cam={{ x: 860, y: 1720, zoom: 1.05 }} bg={C.sky}>
      <CurbSide />
      <CarSide x={CAR.x} y={CAR.y} s={CAR.s} layer="back" open={da} />
      <CarSide x={CAR.x} y={CAR.y} s={CAR.s} layer="body" open={da} />
      <CarSide x={CAR.x} y={CAR.y} s={CAR.s} layer="door" open={da} />
      <Actor uid="p6-kyz" look="kyz" f={f} place={place} face={(t) => (t < p.walk2[1] ? -0.7 : -0.8)} pose={pose} role="daughter" seed={4} blinkShift={37} walkFrom={p.walk2[0] - 2} />
    </Shot>
  );
};

// Ракурс A: посадка и ремень.
const Cabin: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const sitU = easeInOut(clamp((f - p.sit[0]) / (p.sit[1] - p.sit[0])));
  const kyzPlace = (t: number): Place => ({ ...KYZ_A, x: lerp(-160, KYZ_A.x, easeInOut(clamp((t - p.sit[0]) / (p.sit[1] - p.sit[0] - 6)))) });
  const pull = easeInOut(clamp((f - p.belt[0]) / (p.belt[1] - p.belt[0])));
  const beltHand = { x: lerp(CABIN.beltAnchor.x + 30, CABIN.buckle.x, pull), y: lerp(CABIN.beltAnchor.y + 180, CABIN.buckle.y, pull) };
  const belt = f < p.belt[0] ? 0 : f < p.belt[1] ? 0.5 : 1;
  const kyzPose = (t: number) => {
    const u = easeInOut(clamp((t - p.sit[0]) / (p.sit[1] - p.sit[0])));
    const reachDoor = keys(t, [[p.door[0] - 6, 0], [p.door[0], 1], [p.door[1], 1], [p.door[1] + 8, 0]]);
    const pulling = t >= p.belt[0] - 6 && t < p.belt[1] + 2;
    const pl = kyzPlace(t);
    const lap = { l: { x: pl.x - 40, y: 1300 }, r: { x: pl.x + 50, y: 1300 } };
    const pullHand = { x: lerp(CABIN.beltAnchor.x + 30, CABIN.buckle.x, easeInOut(clamp((t - p.belt[0]) / (p.belt[1] - p.belt[0])))), y: lerp(CABIN.beltAnchor.y + 180, CABIN.buckle.y, easeInOut(clamp((t - p.belt[0]) / (p.belt[1] - p.belt[0])))) };
    return {
      sit: easeInOut(clamp(u * 1.2 - 0.1)),
      seat: KYZ_SEAT,
      crouch: u < 0.5 ? 0.3 * (1 - u / 0.5) : 0,
      lean: keys(t, [[p.sit[0], 14], [p.sit[1], 0]]),
      packOff: t >= p.sit[0] + 10,
      expr: t >= p.g01 - 6 ? ("softSmile" as const) : ("calm" as const),
      lookY: 0.1,
      nod: keys(t, [[p.g01 - 2, 0], [p.g01 + 6, 9], [p.g01 + 16, 0]]),
      // правая рука (слева в кадре) — к двери за кадром, затем ремень
      armL: { target: reachDoor > 0 ? { x: lerp(lap.l.x, -60, reachDoor), y: lerp(lap.l.y, 1050, reachDoor) } : pulling ? pullHand : lap.l, shape: reachDoor > 0.5 || pulling ? ("fist" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      armR: { target: lap.r, elbow: "down" as const },
    };
  };
  const kyzFace = (t: number) => keys(t, [[p.sit[0], -0.4], [p.sit[1], 0.1], [p.door[0], -0.5], [p.door[1] + 6, 0.2], [p.m02 - 6, 0.55]]);
  const momPose = (t: number) => {
    const helping = t >= p.check[0] && t < p.check[1] + 8;
    return {
      sit: 1,
      seat: MOM_SEAT,
      lean: helping ? 10 : 0,
      expr: t >= p.sit[0] ? ("softSmile" as const) : ("calm" as const),
      lookY: helping ? 0.5 : 0.2,
      armL: { target: helping ? keysV(t, [[p.check[0], MOM_KEYS.l], [p.check[0] + 10, { x: CABIN.buckle.x + 20, y: CABIN.buckle.y - 4 }]], anticipate) : MOM_KEYS.l, shape: helping ? ("pinch" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      armR: { target: MOM_KEYS.r, elbow: "down" as const },
    };
  };
  const momFace = (t: number) => keys(t, [[p.sit[0] - 4, 0], [p.sit[0] + 8, -0.5], [p.check[1] + 10, -0.55]]);
  return (
    <CabinA
      f={f}
      uid="p6"
      kyzPlace={kyzPlace}
      kyzPose={kyzPose}
      kyzFace={kyzFace}
      momPose={momPose}
      momFace={momFace}
      belt={belt}
      beltHand={beltHand}
      laptop={1}
      extra={
        // снятый рюкзак стоит у ног дочки (зелёный, как на улице)
        f >= p.sit[0] + 10 ? <div style={box({ left: 150, top: 1440, width: 150, height: 120, borderRadius: 30, backgroundColor: "#718B7A", opacity: sitU })} /> : null
      }
    />
  );
};

export const DaughterScene: React.FC = () => {
  const { f } = useScene("daughter");
  const p = usePlan(daughterPlan);
  return <AbsoluteFill>{f < p.mid ? <Wide f={f} p={p} /> : f < p.cabin ? <Street f={f} p={p} /> : <Cabin f={f} p={p} />}</AbsoluteFill>;
};
export { KYZ_SHOULDER };
