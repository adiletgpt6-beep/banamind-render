// Сцена 3 (25–41 с): обед и попытка поработать. Мама с сыном входят, мама
// ставит рюкзак сына на полку у двери; у плиты накладывает обед в тарелку,
// несёт её вдоль стола и ставит перед сыном. Сын: «Апа, сен да тамак
// ичесиңби?» Мама: «Бир аздан кийин. Сен жей бер, мен бул ишти бүтүрүп
// алайын.» — садится (корпус вперёд, затем вниз), открывает ноутбук и
// печатает; на экране — конкретная рабочая задача. Чай мамы — рядом.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, cruise, keys, keysV, lerp, type Vec } from "../rig/motion";
import { LaptopScreen } from "../screens";
import { BagOnTable, ChairBack, HOME, HomeBack, LaptopSide, Piala, PlateOnTable, ShoeBench, TableFront } from "../sets/Home";
import { PhoneFlat } from "../sets/Apartment";
import { box, camMove, Shot } from "../shots";
import { H, lineFrames, onTable, placeAt, restOnTable, seated, seatOf, sitDown } from "./common";

const walk = (t: number, t0: number, t1: number, a: Vec, b: Vec, h: number, acc = 0.25): Place => {
  const u = cruise((t - t0) / (t1 - t0), acc);
  return placeAt(lerp(a.x, b.x, u), lerp(a.y, b.y, u), h);
};

// Траектории (кадры сцены).
export const L_MOM_IN = (t: number) => walk(t, 8, 46, { x: 200, y: 1566 }, { x: 520, y: 1600 }, 760);
export const L_SON_IN = (t: number) => walk(t, 0, 80, { x: 330, y: 1600 }, { x: 1020, y: 1650 }, H.son, 0.2);
export const L_MOM_STOVE: Place = placeAt(1700, 1606, 760);
// вдоль стола (за ним) к сыну, затем к своему стулу
export const L_MOM_TABLE = (t: number): Place =>
  t < 296 ? walk(t, 200, 262, { x: 1560, y: 1544 }, { x: 740, y: 1542 }, 760, 0.22) : walk(t, 296, 326, { x: 740, y: 1542 }, { x: HOME.seat.mom, y: 1540 }, 760, 0.35);

export const LUNCH = {
  give: 286, // тарелка на столе
  sit: 330, // начало посадки
  open: 366, // мама открывает ноутбук
  type: 392, // печатает
};
export const lunchLaptopOpen = (t: number) => clamp((t - LUNCH.open - 6) / 20);

export const LunchScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const s02 = lineFrames(cues, "s02", "lunch");
  const m03 = lineFrames(cues, "m03", "lunch");
  const son = seated("son", HOME.seat.son);
  const mom = seated("mom", HOME.seat.mom);

  // ---------- A. вход: рюкзак на полку ----------
  const packSpot = { x: HOME.bench.x + 80, y: HOME.bench.y - 160 };
  const momInPose = (t: number) => {
    const p = L_MOM_IN(t);
    return {
      expr: "calm" as const,
      bagOnShoulder: 1,
      lean: keys(t, [[40, 0], [52, 10], [62, 10], [72, 0]]),
      armL: {
        target: keysV(t, [[0, { x: p.x - 0.13 * p.h, y: p.y - 0.44 * p.h }], [40, { x: p.x - 0.13 * p.h, y: p.y - 0.44 * p.h }], [56, packSpot], [60, packSpot], [74, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }]], anticipate),
        shape: t < 58 ? ("fist" as const) : ("relax" as const),
        item: t < 58 ? ("backpack" as const) : ("none" as const),
        itemColor: LOOKS.son.backpack,
        behind: false,
      },
    };
  };
  const momInFace = (t: number) => keys(t, [[0, 0.3], [36, 0.3], [46, -0.4], [64, -0.4], [76, 0.4]]);
  const sonInPose = () => ({ expr: "calm" as const, packOff: true });

  // ---------- B. плита: накладывает обед ----------
  const pot = { x: HOME.stove.x + 166, y: HOME.stove.y - 120 };
  const counterPlate = { x: HOME.counter.x + 80, y: HOME.counter.top - 4 };
  const takePlate = 176;
  const stovePose = (t: number) => {
    const p = L_MOM_STOVE;
    const stir = { x: pot.x + Math.cos(t / 5) * 18, y: pot.y - 6 + Math.sin(t / 5) * 4 };
    return {
      expr: "calm" as const,
      lookY: 0.55,
      armR: {
        target: keysV(t, [[84, { x: p.x + 0.12 * p.h, y: p.y - 0.44 * p.h }], [100, pot], [104, stir], [140, stir], [152, { x: counterPlate.x + 20, y: counterPlate.y - 20 }], [160, { x: counterPlate.x + 20, y: counterPlate.y - 20 }], [168, { x: p.x + 0.12 * p.h, y: p.y - 0.44 * p.h }]], anticipate),
        shape: "fist" as const,
        item: t > 96 && t < 164 ? ("spoon" as const) : ("none" as const),
        elbow: "down" as const,
        behind: false,
      },
      armL: {
        target: keysV(t, [[84, { x: p.x - 0.12 * p.h, y: p.y - 0.44 * p.h }], [158, { x: p.x - 0.12 * p.h, y: p.y - 0.44 * p.h }], [takePlate, { x: counterPlate.x, y: counterPlate.y - 6 }], [194, { x: p.x - 0.18 * p.h, y: p.y - 0.52 * p.h }]], anticipate),
        shape: t >= takePlate ? ("fist" as const) : ("open" as const),
        item: t >= takePlate ? ("plate" as const) : ("none" as const),
        behind: false,
      },
    };
  };
  const stoveFace = (t: number) => keys(t, [[84, 0.5], [160, 0.5], [174, -0.35]]);

  // ---------- C. подача, посадка, ноутбук ----------
  const plateHome = onTable(HOME.plate.x + 10, 10);
  const tableMomPose = (t: number) => {
    const p = L_MOM_TABLE(t);
    const sd = sitDown(t, LUNCH.sit, 30);
    const seatedNow = t >= LUNCH.sit;
    const carry = { x: p.x - 0.2 * p.h, y: p.y - 0.52 * p.h };
    const key = (k: number): Vec => onTable(HOME.laptop.x - 52 + k * 22 + (t >= LUNCH.type ? Math.sin(t * 1.7 + k) * 3 : 0), -4 + (t >= LUNCH.type ? Math.abs(Math.sin(t * 1.3 + k * 2)) * -5 : 0));
    return {
      expr: t < m03.from ? ("softSmile" as const) : t < m03.to + 10 ? ("calm" as const) : ("thinking" as const),
      sit: sd.sit,
      seat: seatOf(mom),
      lean: seatedNow ? sd.lean : keys(t, [[262, 0], [278, 14], [292, 14], [300, 0]]),
      armR: {
        target:
          t < LUNCH.give
            ? keysV(t, [[196, carry], [262, carry], [LUNCH.give, plateHome]], anticipate)
            : keysV(t, [[LUNCH.give, plateHome], [300, { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h }], [LUNCH.sit + 30, restOnTable(mom, 1).target!], [LUNCH.open, { x: HOME.laptop.x + 60, y: HOME.laptop.y - 30 }], [LUNCH.open + 20, { x: HOME.laptop.x + 10, y: HOME.laptop.y - 120 }], [LUNCH.type, key(3)]], anticipate),
        shape: t < LUNCH.give ? ("fist" as const) : ("relax" as const),
        item: t < LUNCH.give ? ("plate" as const) : ("none" as const),
        elbow: "down" as const,
        behind: false,
      },
      armL: {
        target: t < LUNCH.type ? keysV(t, [[196, { x: p.x - 0.12 * p.h, y: p.y - 0.44 * p.h }], [LUNCH.sit + 30, restOnTable(mom, -1).target!]]) : key(0),
        shape: "relax" as const,
        elbow: "down" as const,
        behind: false,
      },
      lookY: keys(t, [[LUNCH.give - 20, 0.5], [LUNCH.give + 6, 0.5], [LUNCH.give + 20, 0], [LUNCH.open - 6, 0], [LUNCH.open + 4, 0.35]]),
      nod: keys(t, [[m03.from, 0], [m03.from + 8, 4], [m03.from + 18, 0]]),
    };
  };
  // мама: вдоль стола (налево) → сын → к стулу → ноутбук (направо)
  const tableMomFace = (t: number) => keys(t, [[196, -0.6], [262, -0.6], [272, -0.3], [s02.to + 4, -0.3], [m03.from + 30, -0.35], [LUNCH.open - 10, 0.1], [LUNCH.open, 0.45]]);
  const spoonAt = (t: number) => {
    // сын ест: ложка от тарелки ко рту, цикл 52 кадра, после подачи
    const eat0 = Math.max(LUNCH.give + 20, m03.from + 10);
    if (t < eat0) return 0;
    const ph = ((t - eat0) % 52) / 52;
    return ph < 0.45 ? Math.sin((Math.PI * ph) / 0.45) : 0;
  };
  const sonPose = (t: number) => {
    const mouth = { x: son.x + 0.06 * son.h, y: son.y - 0.36 * son.h - 0.36 * son.h * 0.62 };
    const plateP = onTable(HOME.plate.x + 14, 4);
    const e = spoonAt(t);
    const eating = t >= LUNCH.give + 20;
    return {
      expr: t < s02.to + 10 ? ("smile" as const) : ("calm" as const),
      sit: 1,
      seat: seatOf(son),
      packOff: true,
      lean: eating ? 4 + 4 * e : 0,
      armR: {
        target: eating ? { x: lerp(plateP.x, mouth.x + 10, e), y: lerp(plateP.y - 6, mouth.y + 20, e) } : restOnTable(son, 1).target!,
        shape: "fist" as const,
        item: "spoon" as const,
        elbow: "down" as const,
        behind: false,
      },
      armL: { target: onTable(HOME.table.x + 30, -2), shape: "relax" as const, elbow: "down" as const },
      lookY: eating ? keys(t, [[LUNCH.give + 20, 0.5]]) * (1 - e) : -0.15,
    };
  };
  const sonFace = (t: number) => keys(t, [[196, 0.55], [LUNCH.give + 30, 0.55], [LUNCH.give + 44, 0.3]]);

  const plateOnTable = f >= LUNCH.give;
  const world = (inside: boolean) => (
    <>
      <HomeBack minutes={12 * 60 + 25 + f / 120} doorOpen={keys(f, [[0, 1], [60, 1], [84, 0]])} stoveOn={f >= 84 && f < 200 ? 1 : 0} steam={f >= 84 && f < 260 ? 1 : 0.5} f={f} />
      {!plateOnTable && f >= 84 && f < takePlate ? <PlateOnTable x={counterPlate.x} y={counterPlate.y} /> : null}
      <ShoeBench girlPack={false} sonPack={f >= 58} bag={false} />
      <ChairBack x={HOME.seat.son} />
      <ChairBack x={mom.x} />
      {inside ? (
        <>
          <Actor uid="l3-son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} layer="body" />
          <Actor uid="l3-mom" look="mom" f={f} place={L_MOM_TABLE} face={tableMomFace} pose={tableMomPose} role="mother" seed={1} layer="body" walkFrom={196} />
        </>
      ) : null}
      <TableFront />
      <Piala x={HOME.piala.x} y={HOME.piala.y} />
      <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={lunchLaptopOpen(f)} />
      <PhoneFlat x={HOME.phone.x} y={HOME.phone.y - 6} />
      <BagOnTable x={HOME.bag.x} y={HOME.bag.y} />
      {plateOnTable ? <PlateOnTable x={HOME.plate.x + 10} y={HOME.plate.y} eaten={clamp((f - 330) / 400)} /> : null}
      {inside ? (
        <>
          <Actor uid="l3-son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} layer="arms" />
          <Actor uid="l3-mom" look="mom" f={f} place={L_MOM_TABLE} face={tableMomFace} pose={tableMomPose} role="mother" seed={1} layer="arms" walkFrom={196} />
        </>
      ) : null}
    </>
  );
  const entry = (
    <>
      {world(false)}
      <Actor uid="l3-mom-in" look="mom" f={f} place={L_MOM_IN} face={momInFace} pose={momInPose} seed={1} />
      <Actor uid="l3-son-in" look="son" f={f} place={L_SON_IN} face={() => 0.5} pose={sonInPose} seed={4} />
    </>
  );
  const stove = (
    <>
      {world(false)}
      <Actor uid="l3-mom-st" look="mom" f={f} place={() => L_MOM_STOVE} face={stoveFace} pose={stovePose} seed={1} />
    </>
  );
  return (
    <>
      <Shot f={f} from={0} to={84} cam={camMove(f, 0, 84, { x: 520, y: 1230, zoom: 1.12 }, { x: 600, y: 1230, zoom: 1.15 })}>
        {entry}
      </Shot>
      <Shot f={f} from={84} to={196} cam={camMove(f, 84, 196, { x: 1690, y: 1180, zoom: 1.45 }, { x: 1680, y: 1180, zoom: 1.5 })}>
        {stove}
      </Shot>
      <Shot f={f} from={196} to={300} cam={camMove(f, 196, 300, { x: 990, y: 1180, zoom: 0.82 }, { x: 890, y: 1170, zoom: 0.9 })}>
        {world(true)}
      </Shot>
      <Shot f={f} from={300} to={400} cam={camMove(f, 300, 400, { x: 860, y: 1170, zoom: 1 }, { x: 850, y: 1160, zoom: 1.04 })}>
        {world(true)}
      </Shot>
      {/* экран ноутбука через плечо: конкретная задача, мама печатает */}
      <Shot
        f={f}
        from={400}
        to={452}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "linear-gradient(180deg, #E9DCC7, #D9C6A8)" })}>
            <div style={box({ left: 70, top: 300, width: 940, height: 640, borderRadius: 26, backgroundColor: "#2A2F3A", padding: 22, boxSizing: "border-box" })}>
              <div style={box({ left: 22, top: 22, right: 22, bottom: 22, borderRadius: 10, overflow: "hidden" })}>
                <LaptopScreen f={f} typeFrom={404} typeTo={446} />
              </div>
            </div>
            <div style={box({ left: 20, top: 940, width: 1040, height: 60, borderRadius: "0 0 30px 30px", backgroundColor: "#B9C0CC" })} />
            {/* пиала рядом с ноутбуком */}
            <div style={box({ left: 860, top: 1010 })}>
              <Piala x={70} y={60} s={2.2} />
            </div>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={452} to={480} cam={camMove(f, 452, 480, { x: 960, y: 1110, zoom: 1.6 }, { x: 955, y: 1110, zoom: 1.64 })}>
        {world(true)}
      </Shot>
    </>
  );
};
