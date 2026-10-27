// Сцена 1 (0–12 с): утро, день выглядит организованным. Кухня-столовая:
// мама за столом с листком плана придвигает ноутбук, папа с пиалой у
// кухни, сын поправляет рюкзак, дочь убирает тетрадь в рюкзак у двери.
// Папа: «Бүгүн балдарды качан алып келесиң?» Мама: «Уулубузду он экиде,
// кызыбызды экиде. Ортодо иштеп алам.» — листок плана крупно: строки
// появляются вместе со словами мамы.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor } from "../rig/Actor";
import { anticipate, keys, keysV } from "../rig/motion";
import { TS2_SCENES, TS2_VIDEO } from "../script";
import { PlanCard } from "../screens";
import { ChairBack, HOME, HomeBack, LaptopSide, PaperOnTable, Piala, ShoeBench, TableFront, Teapot } from "../sets/Home";
import { box, camMove, Shot } from "../shots";
import { H, lap, onTable, placeAt, restOnTable, seated, seatOf } from "./common";

const FPS = TS2_VIDEO.fps;
const START = TS2_SCENES.find((s) => s.id === "morning")!.from * FPS;

export const MORNING = {
  mom: seated("mom", HOME.seat.mom),
  dad: placeAt(1400, 1610, H.dad),
  son: placeAt(850, 1740, H.son),
  daughter: placeAt(600, 1680, H.daughter),
};

// Ноутбук: мама придвигает его к себе (кадры сцены).
export const morningLaptopX = (t: number) => keys(t, [[18, 1290], [58, HOME.laptop.x]]);

export const MorningScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const m01 = cues.find((c) => c.id === "m01")!;
  const f01 = cues.find((c) => c.id === "f01")!;
  // моменты слов мамы (кадры сцены): «Уулубузду…», «кызыбызды…», «Ортодо…»
  const wordAt = (i: number, fb: number) => Math.round(((m01.words[i]?.start ?? m01.from + fb) - START / FPS) * FPS);
  const reveal = { son: wordAt(0, 0), daughter: wordAt(3, 1.4), work: wordAt(5, 2.6) };
  const dadAsk = Math.round((f01.from - START / FPS) * FPS);
  const momAns = Math.round((m01.from - START / FPS) * FPS);

  const { mom, dad, son, daughter } = MORNING;
  const lx = morningLaptopX(f);
  const momPose = (t: number) => ({
    sit: 1,
    seat: seatOf(mom),
    expr: t < dadAsk ? ("calm" as const) : ("softSmile" as const),
    lookY: keys(t, [[0, 0.55], [dadAsk + 6, 0.55], [dadAsk + 16, 0], [momAns + 70, 0], [momAns + 84, 0.5]]),
    armL: { target: keysV(t, [[0, onTable(HOME.plan.x + 10, -2)], [momAns + 60, onTable(HOME.plan.x + 10, -2)], [momAns + 76, onTable(HOME.plan.x - 20, -6)]]), shape: "point" as const, elbow: "down" as const },
    armR: {
      target: keysV(t, [[0, lap(mom, 1)], [12, onTable(1300, -14)], [18, onTable(morningLaptopX(18) - 70, -6)], [58, onTable(HOME.laptop.x - 70, -6)], [76, restOnTable(mom, 1).target!]], anticipate),
      shape: t > 10 && t < 64 ? ("open" as const) : ("relax" as const),
      elbow: "down" as const,
    },
    nod: keys(t, [[momAns + 10, 0], [momAns + 18, 4], [momAns + 30, 0]]),
  });
  // взгляд мамы: план → папа (на вопрос) → план
  const momFace = (t: number) => keys(t, [[0, 0], [dadAsk - 4, 0], [dadAsk + 10, 0.55], [momAns + 90, 0.55], [momAns + 104, 0.05]]);
  const dadPose = (t: number) => ({
    expr: "calm" as const,
    armR: { target: keysV(t, [[0, { x: dad.x + 0.12 * dad.h, y: dad.y - 0.62 * dad.h }], [dadAsk - 20, { x: dad.x + 0.12 * dad.h, y: dad.y - 0.62 * dad.h }], [dadAsk - 4, { x: dad.x + 0.14 * dad.h, y: dad.y - 0.52 * dad.h }]]), shape: "fist" as const, item: "cup" as const, elbow: "down" as const },
    armL: { target: keysV(t, [[dadAsk, { x: dad.x - 0.16 * dad.h, y: dad.y - 0.42 * dad.h }], [dadAsk + 12, { x: dad.x - 0.24 * dad.h, y: dad.y - 0.5 * dad.h }], [dadAsk + 50, { x: dad.x - 0.24 * dad.h, y: dad.y - 0.5 * dad.h }], [dadAsk + 64, { x: dad.x - 0.16 * dad.h, y: dad.y - 0.42 * dad.h }]]), shape: t > dadAsk && t < dadAsk + 60 ? ("open" as const) : ("relax" as const) },
    headTilt: keys(t, [[dadAsk, 0], [dadAsk + 10, 4], [dadAsk + 60, 4], [dadAsk + 70, 0]]),
    nod: keys(t, [[momAns + 40, 0], [momAns + 48, 5], [momAns + 58, 0]]),
  });
  const dadFace = (t: number) => keys(t, [[0, -0.2], [dadAsk - 18, -0.2], [dadAsk - 6, -0.7]]);
  // сын: подтягивает лямки, потом смотрит на маму
  const sonPose = (t: number) => ({
    expr: "smile" as const,
    strapTug: keys(t, [[10, 0], [22, 1], [36, 0.4], [48, 1], [62, 0]]),
    armL: { target: keysV(t, [[0, { x: son.x - 0.1 * son.h, y: son.y - 0.47 * son.h }], [14, { x: son.x - 0.13 * son.h, y: son.y - 0.6 * son.h }], [64, { x: son.x - 0.13 * son.h, y: son.y - 0.6 * son.h }], [80, { x: son.x - 0.1 * son.h, y: son.y - 0.47 * son.h }]]), shape: "fist" as const, elbow: "down" as const },
    armR: { target: keysV(t, [[0, { x: son.x + 0.1 * son.h, y: son.y - 0.47 * son.h }], [14, { x: son.x + 0.13 * son.h, y: son.y - 0.6 * son.h }], [64, { x: son.x + 0.13 * son.h, y: son.y - 0.6 * son.h }], [80, { x: son.x + 0.1 * son.h, y: son.y - 0.47 * son.h }]]), shape: "fist" as const, elbow: "down" as const },
    lookY: keys(t, [[0, 0.3], [60, 0.3], [72, -0.2]]),
  });
  const sonFace = (t: number) => keys(t, [[0, 0], [66, 0], [80, 0.4]]);
  // дочь: тетрадь — в рюкзак на полке
  const packTop = { x: HOME.bench.x + 210, y: HOME.bench.y - 150 - 160 };
  const nbIn = 70;
  const girlPose = (t: number) => ({
    expr: "calm" as const,
    lean: keys(t, [[20, 0], [44, 12], [80, 12], [100, 0]]),
    packOff: true,
    armR: {
      target: keysV(t, [[0, { x: daughter.x + 0.04 * daughter.h, y: daughter.y - 0.58 * daughter.h }], [40, { x: packTop.x + 30, y: packTop.y - 30 }], [nbIn, { x: packTop.x + 6, y: packTop.y + 10 }], [96, { x: daughter.x - 0.08 * daughter.h, y: daughter.y - 0.46 * daughter.h }]], anticipate),
      shape: t < nbIn ? ("fist" as const) : ("relax" as const),
      item: t < nbIn ? ("notebook" as const) : ("none" as const),
      itemTilt: keys(t, [[30, 0], [60, -70]]),
      elbow: "down" as const,
    },
    armL: { target: keysV(t, [[0, { x: daughter.x - 0.1 * daughter.h, y: daughter.y - 0.47 * daughter.h }], [40, { x: packTop.x - 40, y: packTop.y + 40 }], [90, { x: packTop.x - 40, y: packTop.y + 40 }], [110, { x: daughter.x - 0.1 * daughter.h, y: daughter.y - 0.47 * daughter.h }]]), shape: t > 36 && t < 96 ? ("open" as const) : ("relax" as const) },
    lookY: keys(t, [[0, 0.6], [100, 0.6], [112, 0]]),
  });
  const girlFace = (t: number) => keys(t, [[0, -0.8], [100, -0.8], [120, 0.3]]);

  const world = (
    <>
      <HomeBack minutes={7 * 60 + 40 + f / 300} />
      <Teapot x={HOME.counter.x + 90} y={HOME.counter.top + 4} s={0.9} />
      <ShoeBench girlPack sonPack={false} bag />
      <ChairBack x={HOME.seat.son} />
      <ChairBack x={mom.x} />
      <Actor uid="m1-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <TableFront />
      <PaperOnTable x={HOME.plan.x} y={HOME.plan.y} />
      <LaptopSide x={lx} y={HOME.laptop.y} open={0} />
      <Piala x={1320} y={HOME.piala.y} />
      <Actor uid="m1-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
      <Actor uid="m1-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} />
      <Actor uid="m1-girl" look="daughter" f={f} place={() => daughter} face={girlFace} pose={girlPose} role="daughter" seed={3} />
      <Actor uid="m1-son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} />
    </>
  );
  const planIn = momAns + 8;
  const planOut = momAns + 128;
  return (
    <>
      <Shot f={f} from={0} to={dadAsk - 6} cam={camMove(f, 0, dadAsk, { x: 1000, y: 1200, zoom: 0.95 }, { x: 1010, y: 1195, zoom: 0.99 })}>
        {world}
      </Shot>
      <Shot f={f} from={dadAsk - 6} to={planIn} cam={camMove(f, dadAsk - 6, planIn, { x: 1215, y: 1110, zoom: 1.32 }, { x: 1210, y: 1110, zoom: 1.37 })}>
        {world}
      </Shot>
      {/* листок плана крупно: строки появляются вместе со словами мамы */}
      <Shot
        f={f}
        from={planIn}
        to={planOut}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 35%, #F6EEE1, #E2CFB4)" })}>
            <div style={box({ left: 150, top: 250 - (f - planIn) * 0.25, rotate: "-2deg" })}>
              <PlanRows f={f} reveal={reveal} />
            </div>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={planOut} to={360} cam={camMove(f, planOut, 360, { x: 860, y: 1160, zoom: 1.2 }, { x: 870, y: 1160, zoom: 1.24 })}>
        {world}
      </Shot>
    </>
  );
};

// Листок плана: строки по словам мамы (в порядке листка: сын, иш, дочь).
const PlanRows: React.FC<{ f: number; reveal: { son: number; daughter: number; work: number } }> = ({ f, reveal }) => (
  <PlanCard f={f} at={reveal.son - 10} rows={[reveal.son, reveal.work, reveal.daughter]} />
);
