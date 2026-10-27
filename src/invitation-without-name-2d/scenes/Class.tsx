// Сцена 13. Папа пришёл. Дневной свет, тот же класс, на доске «КЕСИПТЕР
// КҮНҮ». a — папа входит, учительница приветствует его, Эмир подходит и
// показывает на стол, куда поставить модель (N07). b — папа за столом
// перед классом: рядом приколот его чертёж, на столе — их бумажный мост.
// F05: на «имараттарды» он один раз показывает на чертёж, на «Бүгүн» — на
// мост; без постоянной жестикуляции. Дети стоят у стола и слушают.
import { Actor, type Place } from "../rig/Actor";
import { clamp, cruise, keys, lerp } from "../rig/motion";
import { Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C } from "../theme";
import { BlueprintArt } from "../props/Blueprint";
import { BridgeSide, type BridgeGeo } from "../props/Bridge";
import { CLASS, ClassroomBack, DemoTable } from "../sets/School";
import { H } from "./common";

export const classPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "class");
  const f05 = T.from("F05");
  return {
    walk: [4, 64] as const,
    greet: 40,
    emir: [24, 70] as const,
    show: 78,
    n07: T.from("N07"),
    present: f05 - 14,
    f05,
    pointA: [T.word("F05", "имараттарды") - 4, T.word("F05", "Бүгүн") - 16] as const,
    pointB: [T.word("F05", "Бүгүн") - 4, T.to("F05") + 6] as const,
    f05End: T.to("F05"),
    len: T.len,
  };
};

export const CLASS_BRIDGE: BridgeGeo = { cx: 560, tableY: CLASS.table.top, span: 200, bookW: 76, stackH: 70 };
export const BLUEPRINT_ON_BOARD = { x: 320, y: 790, w: 220 } as const;

const Pinned: React.FC = () => (
  <Svg>
    <g transform={`translate(${BLUEPRINT_ON_BOARD.x} ${BLUEPRINT_ON_BOARD.y}) rotate(-2)`}>
      <BlueprintArt w={BLUEPRINT_ON_BOARD.w} />
      <circle cx={0} cy={-74} r={7} fill={C.coral} />
    </g>
  </Svg>
);

const FRONT_Y = 1720;
const Arrive: React.FC<{ f: number; p: ReturnType<typeof classPlan> }> = ({ f, p }) => {
  const dadPlace = (tt: number): Place => ({ x: lerp(-220, 330, cruise(clamp((tt - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.25)), y: FRONT_Y, h: 900 });
  const emirPlace = (tt: number): Place => ({ x: lerp(900, 620, cruise(clamp((tt - p.emir[0]) / (p.emir[1] - p.emir[0])), 0.3)), y: FRONT_Y, h: 640 });
  const teacher: Place = { x: 110, y: FRONT_Y - 30, h: 860 };
  const point = keys(f, [[p.show, 0], [p.show + 10, 1], [p.show + 50, 1], [p.show + 62, 0]]);
  return (
    <Shot f={f} cam={{ x: 470, y: 1240, zoom: 1.22 }} bg="#EFEDE4">
      <ClassroomBack />
      <Pinned />
      <DemoTable />
      <Svg>
        <BridgeSide g={CLASS_BRIDGE} mode="folded" sag={0} carX={CLASS_BRIDGE.cx - CLASS_BRIDGE.span / 2 - CLASS_BRIDGE.bookW / 2} carLen={62} />
      </Svg>
      <Actor uid="c13-teacher" look="mugalim" f={f} place={() => teacher} face={() => 0.55} pose={(tt) => ({ expr: tt > p.greet - 10 ? "smile" : "softSmile", lookX: 0.3, nod: keys(tt, [[p.greet, 0], [p.greet + 8, 5], [p.greet + 20, 0]]), armR: { target: tt > p.greet ? { x: 230, y: 1260 } : null, shape: "open", elbow: "down", behind: false } })} seed={8} />
      <Actor uid="c13-dad" look="azamat" f={f} place={dadPlace} face={(tt) => (tt < p.walk[1] ? 0.6 : 0.4)} pose={(tt) => ({ expr: tt > p.greet ? "smile" : "calm", lookX: tt > p.emir[1] ? 0.4 : -0.3, nod: keys(tt, [[p.greet + 4, 0], [p.greet + 12, 4], [p.greet + 24, 0]]) })} seed={2} walkFrom={0} />
      <Actor
        uid="c13-emir"
        look="emir"
        f={f}
        place={emirPlace}
        face={(tt) => (tt < p.emir[1] ? -0.6 : point > 0.5 ? 0.3 : -0.4)}
        pose={() => ({ expr: "smile", lookX: point > 0.5 ? -0.2 : -0.3, lookY: -0.2, packOff: true, armR: { target: point > 0.02 ? { x: lerp(680, 760, point), y: lerp(1400, 1250, point) } : null, shape: point > 0.5 ? "point" : "relax", elbow: "down", behind: false } })}
        seed={4}
        blinkShift={37}
        walkFrom={0}
      />
    </Shot>
  );
};

const KID_A: Place = { x: 200, y: 1730, h: 640 };
const KID_B: Place = { x: 920, y: 1730, h: 650 };
const KID_C: Place = { x: 1040, y: 1700, h: 620 };
const DAD_T: Place = { x: 540, y: CLASS.floorY, h: H.dad };
const EMIR_T: Place = { x: 770, y: CLASS.floorY, h: H.boy };

export const ClassFront: React.FC<{ f: number; dadPose: (t: number) => object; emirPose: (t: number) => object; kidPose: (k: number) => (t: number) => object; cam: { x: number; y: number; zoom: number }; carX?: number | null; car?: React.ReactNode }> = ({ f, dadPose, emirPose, kidPose, cam, carX, car }) => (
  <Shot f={f} cam={cam} bg="#EFEDE4">
    <ClassroomBack />
    <Pinned />
    <Actor uid="c13-dad-t" look="azamat" f={f} place={() => DAD_T} face={() => 0.1} pose={dadPose} role="father" seed={2} layer="body" />
    <Actor uid="c13-emir-t" look="emir" f={f} place={() => EMIR_T} face={() => -0.4} pose={emirPose} seed={4} blinkShift={37} layer="body" />
    <DemoTable />
    <Svg>{car ?? <BridgeSide g={CLASS_BRIDGE} mode="folded" sag={0} carX={carX === undefined ? CLASS_BRIDGE.cx - CLASS_BRIDGE.span / 2 - CLASS_BRIDGE.bookW / 2 : carX} carLen={62} />}</Svg>
    <Actor uid="c13-dad-t" look="azamat" f={f} place={() => DAD_T} face={() => 0.1} pose={dadPose} role="father" seed={2} layer="arms" />
    <Actor uid="c13-emir-t" look="emir" f={f} place={() => EMIR_T} face={() => -0.4} pose={emirPose} seed={4} blinkShift={37} layer="arms" />
    <Actor uid="c13-kA" look="classA" f={f} place={() => KID_A} face={() => 0.55} pose={kidPose(0)} seed={11} blinkShift={13} />
    <Actor uid="c13-kB" look="classB" f={f} place={() => KID_B} face={() => -0.55} pose={kidPose(1)} seed={12} blinkShift={51} />
    <Actor uid="c13-kC" look="classC" f={f} place={() => KID_C} face={() => -0.6} pose={kidPose(2)} seed={13} blinkShift={29} />
  </Shot>
);

export const ClassScene: React.FC = () => {
  const { f } = useScene("class");
  const p = usePlan(classPlan);
  if (f < p.present) return <Arrive f={f} p={p} />;
  const a = keys(f, [[p.pointA[0], 0], [p.pointA[0] + 10, 1], [p.pointA[1], 1], [p.pointA[1] + 10, 0]]);
  const b = keys(f, [[p.pointB[0], 0], [p.pointB[0] + 10, 1], [p.pointB[1] - 10, 1], [p.pointB[1], 0]]);
  const dadPose = () => ({
    expr: "softSmile",
    lookX: a > 0.5 ? -0.6 : b > 0.5 ? 0.1 : 0.2,
    lookY: b > 0.5 ? 0.45 : 0.05,
    armL: { target: a > 0.02 ? { x: lerp(460, BLUEPRINT_ON_BOARD.x + 60, a), y: lerp(1240, 820, a) } : { x: 470, y: 1250 }, shape: a > 0.5 ? "point" : "relax", elbow: "down", behind: false },
    armR: { target: b > 0.02 ? { x: lerp(610, 600, b), y: lerp(1250, 1150, b) } : { x: 610, y: 1250 }, shape: b > 0.5 ? "point" : "relax", elbow: "down", behind: false },
  });
  const emirPose = () => ({ expr: "smile", lookX: -0.3, lookY: 0.05, armL: { target: { x: 735, y: 1255 }, shape: "relax", elbow: "down", behind: false }, armR: { target: { x: 810, y: 1255 }, shape: "relax", elbow: "down" } });
  const kidPose = (k: number) => (tt: number) => ({ expr: tt > p.pointB[0] ? "smile" : "calm", lookX: k ? -0.2 : 0.2, lookY: -0.15, nod: keys(tt, [[p.f05End - 10 + k * 5, 0], [p.f05End + k * 5, 3], [p.f05End + 14 + k * 5, 0]]) });
  return <ClassFront f={f} dadPose={dadPose} emirPose={emirPose} kidPose={kidPose} cam={{ x: 560, y: 1110, zoom: keys(f, [[p.present, 1.42], [p.len, 1.5]]) }} />;
};
