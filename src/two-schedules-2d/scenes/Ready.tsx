// Сцена 5 (55–69,5 с): снова собираться. Мама кладёт телефон в сумку,
// закрывает ноутбук, встаёт (корпус вперёд, вес на стопы, затем
// выпрямляется), обходит стол и подходит к сыну. Сын устал: «Биз кайра
// мектепке барабызбы? Мен чарчадым.» Мама приседает рядом, поправляет ему
// воротник: «Ооба, эжеңди алып келебиз. Анан үйдө эс аласың.» — берёт
// рюкзак с полки; сын медленно встаёт, поворачивается к двери и идёт рядом.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, cruise, keys, keysV, lerp, type Vec } from "../rig/motion";
import { PhoneFlat } from "../sets/Apartment";
import { BagOnTable, ChairBack, HOME, HomeBack, LaptopSide, Piala, PlateOnTable, ShoeBench, TableFront } from "../sets/Home";
import { camMove, Shot } from "../shots";
import { H, lineFrames, onTable, placeAt, seated, seatOf, standUp } from "./common";

export const READY = {
  pick: 8, // телефон со стола
  inBag: 34, // телефон в сумке
  close: 50, // ноутбук закрывается
  bag: 64, // берёт сумку
  stand: 70, // мама встаёт
  shoulder: 96, // сумка на плече
  walk: 104, // идёт вокруг стола
  crouch: 176,
  pack: 300, // берёт рюкзак с полки
  sonUp: 318, // сын встаёт
  go: 350, // идут к двери
};
export const readyLaptopOpen = (t: number) => 1 - clamp((t - READY.close) / 12);

const seg = (t: number, t0: number, t1: number, a: Vec, b: Vec, acc = 0.3) => {
  const u = cruise((t - t0) / (t1 - t0), acc);
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
};
// мама: из-за стола → к торцу стола → вперёд к сыну → к полке → к двери
export const R_MOM = (t: number): Place => {
  const p =
    t < 140
      ? seg(t, READY.walk, 140, { x: HOME.seat.mom, y: 1540 }, { x: 520, y: 1546 }, 0.25)
      : t < 280
        ? seg(t, 146, 172, { x: 520, y: 1546 }, { x: 690, y: 1600 })
        : t < READY.go
          ? seg(t, 282, 298, { x: 690, y: 1600 }, { x: 600, y: 1590 })
          : seg(t, READY.go, 435, { x: 600, y: 1590 }, { x: 240, y: 1575 }, 0.2);
  return placeAt(p.x, p.y, H.mom);
};
export const R_SON = (t: number): Place => {
  const p = t < READY.go + 6 ? { x: HOME.seat.son, y: HOME.seatY } : seg(t, READY.go + 6, 435, { x: HOME.seat.son, y: HOME.seatY + 60 }, { x: 170, y: 1640 }, 0.25);
  return t < READY.go + 6 ? { ...p, h: H.son } : placeAt(p.x, p.y, H.son);
};
// пока мама за столом (до торца), она рисуется до скатерти
const behindTable = (t: number) => t < 141;

export const ReadyScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const s03 = lineFrames(cues, "s03", "ready");
  const m05 = lineFrames(cues, "m05", "ready");
  const mom = seated("mom", HOME.seat.mom);
  const phone0: Vec = { x: HOME.laptop.x + 100, y: HOME.laptop.y - 4 };
  const bagIn: Vec = { x: HOME.bag.x - 4, y: HOME.bag.y - 96 };
  const packSpot: Vec = { x: HOME.bench.x + 80, y: HOME.bench.y - 160 };
  const momPose = (t: number) => {
    const p = R_MOM(t);
    const su = standUp(t, READY.stand, 32);
    const son = R_SON(t);
    const collar = (side: -1 | 1): Vec => ({ x: son.x + side * 0.05 * son.h + 6, y: HOME.seatY - 0.36 * son.h - 0.27 * son.h + 14 });
    const hasPack = t >= READY.pack;
    return {
      expr: t < s03.from ? ("thinking" as const) : t < m05.from ? ("calm" as const) : ("softSmile" as const),
      sit: t < READY.stand ? 1 : su.sit,
      seat: seatOf(mom),
      lean: t < READY.stand ? keys(t, [[READY.pick + 10, 0], [READY.inBag - 8, 12], [READY.inBag + 6, 0]]) : t < READY.walk ? su.lean : keys(t, [[READY.crouch - 6, 0], [READY.crouch + 10, 12], [272, 12], [286, 0], [292, 0], [READY.pack - 2, 14], [READY.pack + 12, 0]]),
      crouch: keys(t, [[READY.crouch - 4, 0], [READY.crouch + 18, 0.62], [270, 0.62], [290, 0], [292, 0], [READY.pack - 4, 0.3], [READY.pack + 12, 0]]),
      armR: {
        target:
          t < READY.walk
            ? keysV(t, [[0, onTable(HOME.laptop.x + 100, -8)], [READY.pick, phone0], [READY.inBag - 6, bagIn], [READY.inBag + 2, bagIn], [READY.close - 6, { x: HOME.laptop.x + 40, y: HOME.laptop.y - 120 }], [READY.close + 10, { x: HOME.laptop.x - 40, y: HOME.laptop.y - 14 }], [READY.bag - 2, { x: HOME.bag.x - 10, y: HOME.bag.y - 108 }], [READY.bag + 2, { x: HOME.bag.x - 10, y: HOME.bag.y - 108 }], [READY.shoulder, { x: p.x + 0.1 * p.h, y: p.y - 0.74 * p.h }], [READY.walk, { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h }]], anticipate)
            : t < READY.crouch
              ? { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h }
              : t < 290
                ? keysV(t, [[READY.crouch, { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h }], [READY.crouch + 22, collar(1)], [m05.from - 4, { x: collar(1).x - 6, y: collar(1).y + 8 }], [m05.from + 10, collar(1)], [m05.from + 30, { x: son.x + 0.16 * son.h, y: son.y - 0.32 * son.h }]], anticipate)
                : { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h },
        shape: t >= READY.pick && t < READY.inBag ? ("phone" as const) : t >= READY.bag && t < READY.shoulder ? ("fist" as const) : t >= READY.crouch && t < 280 ? ("pinch" as const) : ("relax" as const),
        item: t >= READY.pick && t < READY.inBag ? ("phone" as const) : t >= READY.bag && t < READY.shoulder ? ("handbag" as const) : ("none" as const),
        flat: t >= READY.pick && t < READY.inBag ? 1 - clamp((t - READY.pick) / 10) * 0.6 : 1,
        elbow: "down" as const,
        behind: false,
      },
      armL: {
        target:
          t < READY.crouch
            ? keysV(t, [[0, onTable(mom.x - 0.12 * mom.h, -4)], [READY.stand, onTable(mom.x - 0.12 * mom.h, -4)], [READY.stand + 26, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }]])
            : t < 292
              ? keysV(t, [[READY.crouch, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }], [READY.crouch + 26, collar(-1)], [m05.from + 30, collar(-1)], [m05.from + 44, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }]], anticipate)
              : keysV(t, [[292, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }], [READY.pack, packSpot], [READY.pack + 24, { x: p.x - 0.14 * p.h, y: p.y - 0.45 * p.h }]], anticipate),
        shape: t >= READY.crouch && t < 280 ? ("pinch" as const) : hasPack ? ("fist" as const) : t > 292 ? ("open" as const) : ("relax" as const),
        item: hasPack ? ("backpack" as const) : ("none" as const),
        itemColor: LOOKS.son.backpack,
        elbow: "down" as const,
        behind: false,
      },
      bagOnShoulder: t >= READY.shoulder ? 1 : 0, // сумка с телефоном — на плече
      lookY: keys(t, [[0, 0.4], [READY.close + 10, 0.4], [READY.stand, 0], [READY.crouch, 0], [READY.crouch + 14, 0.2]]),
      nod: keys(t, [[m05.from, 0], [m05.from + 8, 4], [m05.from + 18, 0]]),
    };
  };
  const momFace = (t: number) => keys(t, [[0, 0.5], [READY.close + 14, 0.5], [READY.stand + 10, -0.2], [READY.crouch, -0.3], [READY.crouch + 10, -0.42], [290, -0.42], [READY.pack - 10, -0.6], [READY.go - 4, -0.4]]);
  const sonPose = (t: number) => {
    const p = R_SON(t);
    const su = standUp(t, READY.sonUp, 34);
    return {
      expr: t < s03.from - 10 ? ("calm" as const) : ("tired" as const),
      sit: su.sit,
      seat: seatOf(seated("son", HOME.seat.son)),
      lean: su.lean,
      packOff: true,
      exhale: keys(t, [[s03.from, 0], [s03.from + 20, 0.8]]),
      armR: { target: t < READY.sonUp ? keysV(t, [[0, onTable(HOME.plate.x - 20, -2)], [s03.from - 10, onTable(HOME.plate.x - 20, -2)], [s03.from + 6, { x: p.x + 0.13 * p.h, y: p.y - 0.3 * p.h }]]) : null, shape: "relax" as const, elbow: "down" as const },
      armL: { target: t < READY.sonUp ? { x: p.x - 0.13 * p.h, y: p.y - 0.3 * p.h } : null, shape: "relax" as const },
      lookY: keys(t, [[0, 0.45], [s03.from - 14, 0.45], [s03.from, 0.05], [s03.to + 10, 0.2], [READY.sonUp - 6, 0.3], [READY.sonUp + 10, 0.1]]),
      headTilt: keys(t, [[s03.from, 0], [s03.from + 14, -6], [m05.to, -6], [m05.to + 14, 0]]),
    };
  };
  // сын не сразу поворачивается к маме — реакция замедлена
  const sonFace = (t: number) => keys(t, [[0, 0.3], [READY.walk + 30, 0.3], [s03.from - 6, 0.55], [READY.sonUp, 0.55], [READY.go - 4, -0.4]]);

  const momBody = <Actor uid="r5-mom" look="mom" f={f} place={R_MOM} face={momFace} pose={momPose} role="mother" seed={1} layer={behindTable(f) && f < READY.stand + 40 ? "body" : "all"} walkFrom={READY.walk - 2} />;
  const world = (
    <>
      <HomeBack minutes={12 * 60 + 49 + f / 300} doorOpen={keys(f, [[390, 0], [410, 1]])} f={f} />
      <ShoeBench sonPack={f < READY.pack} girlPack={false} />
      <ChairBack x={HOME.seat.son} />
      <ChairBack x={HOME.seat.mom} />
      {behindTable(f) ? momBody : null}
      <TableFront />
      <Piala x={HOME.piala.x} y={HOME.piala.y} />
      <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={readyLaptopOpen(f)} glow={readyLaptopOpen(f)} />
      {f < READY.pick ? <PhoneFlat x={phone0.x} y={phone0.y} /> : null}
      {f < READY.bag ? <BagOnTable x={HOME.bag.x} y={HOME.bag.y} open={f >= READY.inBag - 10 && f < READY.inBag + 8 ? 1 : 0} /> : null}
      <PlateOnTable x={HOME.plate.x + 10} y={HOME.plate.y} eaten={0.75} />
      {behindTable(f) && f < READY.stand + 40 ? <Actor uid="r5-mom" look="mom" f={f} place={R_MOM} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" walkFrom={READY.walk - 2} /> : null}
      {f < READY.go ? <Actor uid="r5-son" look="son" f={f} place={R_SON} face={sonFace} pose={sonPose} role="son" seed={4} walkFrom={READY.go} /> : null}
      {behindTable(f) ? null : momBody}
      {f >= READY.go ? <Actor uid="r5-son" look="son" f={f} place={R_SON} face={sonFace} pose={sonPose} role="son" seed={4} walkFrom={READY.go} /> : null}
    </>
  );
  return (
    <>
      <Shot f={f} from={0} to={READY.walk} cam={camMove(f, 0, READY.walk, { x: 1130, y: 1090, zoom: 1.6 }, { x: 1110, y: 1100, zoom: 1.55 })}>
        {world}
      </Shot>
      <Shot f={f} from={READY.walk} to={435} cam={camMove(f, READY.walk, 435, { x: 700, y: 1220, zoom: 1.28 }, { x: 560, y: 1220, zoom: 1.3 })}>
        {world}
      </Shot>
    </>
  );
};
