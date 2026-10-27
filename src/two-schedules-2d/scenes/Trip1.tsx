// Сцена 2 (12–25 с): первая поездка, около полудня. Школьные ворота, часы
// на фасаде — 12:00. Сын выходит с учительницей, замечает маму и бежит к
// ней с рюкзаком в руке: «Апа, бүгүн сүрөт тарттык. Кечинде сага
// көрсөтөм.» Мама принимает рюкзак: «Көрсөтөсүң. Азыр үйгө барып
// тамактаналы.» — берёт сына за руку, они разворачиваются и уходят.
// Короткий дорожный план: семейная машина (без брендинга) едет домой,
// сын оживлённо смотрит в окно.
import { useCurrentFrame } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, cruise, easeInOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { Car, Marshrutka, PanelHouse, Sidewalk, Sky, Tree } from "../sets/Outdoor";
import { Mountains } from "../sets/Apartment";
import { SchoolBack, SchoolFence, SidewalkTrees } from "../sets/School";
import { box, camMove, Depth, Shot } from "../shots";
import { H, placeAt } from "./common";

export const FAMILY_CAR = "#AEB5BF"; // машина семьи — серебристая, без надписей

const path = (t: number, t0: number, t1: number, a: Vec, b: Vec, h: number, acc = 0.25): Place => {
  const u = cruise((t - t0) / (t1 - t0), acc);
  return placeAt(lerp(a.x, b.x, u), lerp(a.y, b.y, u), h);
};

// Траектории (кадры сцены).
export const T1_SON = (t: number): Place =>
  t < 84
    ? path(t, 8, 84, { x: 650, y: 1548 }, { x: 960, y: 1724 }, H.son, 0.2)
    : t < 230
      ? path(t, 84, 120, { x: 960, y: 1724 }, { x: 1050, y: 1852 }, H.son, 0.3)
      : t < 262
        ? path(t, 232, 258, { x: 1050, y: 1852 }, { x: 1150, y: 1866 }, H.son, 0.4)
        : path(t, 262, 390, { x: 1150, y: 1866 }, { x: 290, y: 1884 }, H.son, 0.22);
export const T1_TEACHER = (t: number): Place => path(t, 4, 92, { x: 560, y: 1542 }, { x: 870, y: 1716 }, H.teacher, 0.25);
export const T1_MOM = (t: number): Place => path(t, 262, 390, { x: 1310, y: 1886 }, { x: 450, y: 1902 }, H.mom, 0.22);

export const Trip1Scene: React.FC = () => {
  const f = useCurrentFrame();
  const give = 150; // рюкзак переходит из руки сына в руку мамы
  const meet = (t: number): Vec => {
    const m = T1_MOM(t);
    return { x: m.x - 0.13 * m.h, y: m.y - 0.44 * m.h };
  };
  // руки «за ручку» при уходе: точка между мамой и сыном
  const handHold = (t: number): Vec => {
    const m = T1_MOM(t);
    const s = T1_SON(t);
    return { x: m.x - 0.1 * m.h, y: s.y - 0.6 * s.h };
  };
  const sonPose = (t: number) => {
    const p = T1_SON(t);
    const side = { x: p.x + 0.17 * p.h, y: p.y - 0.42 * p.h };
    return {
      expr: t < 40 ? ("calm" as const) : ("smile" as const),
      packOff: true,
      armR: {
        target: keysV(t, [[0, side], [100, { x: T1_SON(100).x + 0.17 * H.son, y: T1_SON(100).y - 0.42 * H.son }], [132, { x: meet(give).x + 2, y: meet(give).y + 4 }], [give, meet(give)], [give + 16, { x: p.x + 0.12 * p.h, y: p.y - 0.45 * p.h }]], anticipate),
        shape: t < give ? ("fist" as const) : ("relax" as const),
        item: t < give ? ("backpack" as const) : ("none" as const),
        itemColor: LOOKS.son.backpack,
        elbow: "down" as const,
        behind: false,
      },
      armL: t < 250 ? { target: keysV(t, [[108, { x: p.x - 0.14 * p.h, y: p.y - 0.42 * p.h }], [118, { x: p.x - 0.22 * p.h, y: p.y - 0.62 * p.h }], [150, { x: p.x - 0.22 * p.h, y: p.y - 0.62 * p.h }], [166, { x: p.x - 0.14 * p.h, y: p.y - 0.42 * p.h }]]), shape: t > 110 && t < 160 ? ("open" as const) : ("relax" as const) } : { target: null, shape: "relax" as const },
      lookY: keys(t, [[100, 0], [118, -0.45]]),
      headTilt: keys(t, [[108, 0], [120, 5], [170, 5], [182, 0]]),
    };
  };
  // сын смотрит вперёд → замечает маму (справа) → на маму
  const sonFace = (t: number) => keys(t, [[0, 0.2], [38, 0.2], [48, 0.45], [250, 0.45], [262, -0.6]]);
  const sonPoseHold = (t: number) => {
    const base = sonPose(t);
    return t >= 250 ? { ...base, armR: { target: keysV(t, [[250, base.armR.target], [266, handHold(266)]], easeInOut), shape: "fist" as const, elbow: "down" as const } } : base;
  };
  const sonTarget = (t: number) => (t >= 266 ? { ...sonPoseHold(t), armR: { target: handHold(t), shape: "fist" as const, elbow: "down" as const } } : sonPoseHold(t));
  const momPose = (t: number) => {
    const p = T1_MOM(t);
    const has = t >= give;
    return {
      expr: t < 40 ? ("calm" as const) : ("smile" as const),
      bagOnShoulder: 1,
      crouch: keys(t, [[120, 0], [140, 0.28], [200, 0.28], [222, 0]]),
      lean: keys(t, [[120, 0], [140, 8], [200, 8], [222, 0]]),
      armL: {
        target:
          t < 250
            ? keysV(t, [[0, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }], [126, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }], [give, meet(give)], [give + 30, { x: p.x - 0.12 * p.h, y: p.y - 0.47 * p.h }]], anticipate)
            : t < 266
              ? keysV(t, [[250, { x: p.x - 0.12 * p.h, y: p.y - 0.47 * p.h }], [266, handHold(266)]], easeInOut)
              : handHold(t),
        shape: t >= 250 ? ("fist" as const) : t > 130 && t < give ? ("open" as const) : has ? ("fist" as const) : ("relax" as const),
        item: has && t < 250 ? ("backpack" as const) : ("none" as const),
        itemColor: LOOKS.son.backpack,
        elbow: "down" as const,
        behind: false,
      },
      // с 250-го кадра рюкзак — в правой руке (переложила, освобождая левую)
      armR: {
        target: keysV(t, [[0, { x: p.x + 0.12 * p.h, y: p.y - 0.45 * p.h }], [236, { x: p.x + 0.12 * p.h, y: p.y - 0.45 * p.h }], [248, { x: p.x - 0.02 * p.h, y: p.y - 0.5 * p.h }], [262, { x: p.x + 0.15 * p.h, y: p.y - 0.44 * p.h }]], anticipate),
        shape: t >= 248 ? ("fist" as const) : ("relax" as const),
        item: t >= 250 ? ("backpack" as const) : ("none" as const),
        itemColor: LOOKS.son.backpack,
        elbow: "down" as const,
      },
      lookY: keys(t, [[110, 0], [126, 0.35], [230, 0.35], [244, 0]]),
      nod: keys(t, [[226, 0], [234, 5], [244, 0]]),
    };
  };
  // перекладывание рюкзака: левая рука подаёт к правой (248–250)
  const momPoseFixed = (t: number) => {
    const b = momPose(t);
    if (t >= 236 && t < 250) {
      const p = T1_MOM(t);
      const mid = { x: p.x - 0.02 * p.h, y: p.y - 0.5 * p.h };
      return { ...b, armL: { ...b.armL, target: keysV(t, [[236, { x: p.x - 0.12 * p.h, y: p.y - 0.47 * p.h }], [248, { x: mid.x - 4, y: mid.y }]], easeInOut) } };
    }
    return b;
  };
  const momFace = (t: number) => keys(t, [[0, -0.3], [40, -0.3], [60, -0.42], [250, -0.42], [262, -0.8]]);
  const teacherPose = (t: number) => {
    const p = T1_TEACHER(t);
    return {
      expr: "softSmile" as const,
      armR: { target: keysV(t, [[0, { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h }], [150, { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h }], [166, { x: p.x + 0.2 * p.h, y: p.y - 0.86 * p.h }], [210, { x: p.x + 0.2 * p.h, y: p.y - 0.86 * p.h }], [226, { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h }]]), shape: t > 156 && t < 216 ? ("wave" as const) : ("relax" as const), wrist: Math.sin(t / 5) * 10 * clamp((t - 160) / 8) * clamp((214 - t) / 8) },
      armL: { target: { x: p.x - 0.08 * p.h, y: p.y - 0.5 * p.h }, shape: "fist" as const, item: "notebook" as const, elbow: "down" as const },
    };
  };
  const teacherFace = (t: number) => keys(t, [[0, 0.2], [90, 0.2], [104, 0.6]]);

  const world = (
    <>
      <SchoolBack minutes={12 * 60 + f / 900} />
      <Actor uid="t1-teacher" look="teacher" f={f} place={T1_TEACHER} face={teacherFace} pose={teacherPose} seed={5} />
      {f < 120 ? <Actor uid="t1-son" look="son" f={f} place={T1_SON} face={sonFace} pose={sonTarget} role="son" seed={4} /> : null}
      <SchoolFence />
      {f >= 120 ? <Actor uid="t1-son" look="son" f={f} place={T1_SON} face={sonFace} pose={sonTarget} role="son" seed={4} /> : null}
      <Actor uid="t1-mom" look="mom" f={f} place={T1_MOM} face={momFace} pose={momPoseFixed} role="mother" seed={1} />
      <SidewalkTrees />
    </>
  );
  return (
    <>
      <Shot f={f} from={0} to={104} cam={camMove(f, 0, 104, { x: 960, y: 1420, zoom: 0.86 }, { x: 990, y: 1450, zoom: 0.92 })}>
        {world}
      </Shot>
      <Shot f={f} from={104} to={262} cam={camMove(f, 104, 262, { x: 1150, y: 1470, zoom: 1.22 }, { x: 1160, y: 1480, zoom: 1.3 })}>
        {world}
      </Shot>
      <Shot f={f} from={262} to={322} cam={camMove(f, 262, 322, { x: 1060, y: 1500, zoom: 1.1 }, { x: 860, y: 1500, zoom: 1.1 })}>
        {world}
      </Shot>
      <Shot f={f} from={322} to={390} cam={{ x: 540, y: 960, zoom: 1 }} bg="#CFE3F2">
        <RoadHome f={f - 322} />
      </Shot>
    </>
  );
};

// Дорога домой: улица с арыком, панельные дома, маршрутка; машина семьи
// едет слева направо, сын в окне (лёгкий темп).
const RoadHome: React.FC<{ f: number }> = ({ f }) => {
  const carX = lerp(120, 1180, easeInOut(f / 68) * 0.5 + (f / 68) * 0.5);
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      <Sky w={1080} h={1100} />
      <Depth depth={0.2}>
        <Mountains x={-300} y={480} w={1700} h={330} />
      </Depth>
      <div style={box({ left: -f * 1.2, top: 0 })}>
        <PanelHouse x={-100} y={1220} w={700} floors={5} color="#E8D8C6" seed={2} />
        <PanelHouse x={680} y={1220} w={760} floors={5} color="#DDE3E8" seed={5} />
        <Tree x={620} y={1240} s={1.0} kind="poplar" />
        <Tree x={1300} y={1240} s={1.05} kind="poplar" tone={1} />
      </div>
      <Sidewalk x={-200} y={1200} w={1600} offset={f * 1.2} />
      <div style={box({ left: -200, top: 1418, width: 1600, height: 520, backgroundColor: "#6E737E" })} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={box({ left: ((i * 300 - f * 2) % 1800) - 150, top: 1640, width: 150, height: 14, backgroundColor: "#E9E6DF" })} />
      ))}
      <Marshrutka x={1300 - f * 9} y={1600} s={0.82} wheel={-f * 9} route="110" />
      <Car x={carX} y={1830} s={1.6} color={FAMILY_CAR} wheel={f * 14} driver kid />
      {/* сын в заднем окне: машет рукой */}
      <div style={box({ left: carX + 70 * 1.6 + 14, top: 1830 - 128 * 1.6 - 34 + Math.sin(f / 3) * 4, width: 18, height: 36, borderRadius: 9, backgroundColor: LOOKS.son.skin, rotate: `${Math.sin(f / 3) * 25}deg`, transformOrigin: "50% 100%" })} />
    </div>
  );
};
