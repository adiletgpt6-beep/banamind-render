// Сцена 14. Результат, который видят все. Крупно модель на демонстрационном
// столе — та же конструкция и пропорции, что вечером (TEST_GEO). Эмир ставит
// ту же жёлтую машинку на край моста и толкает: начало, середина, конец
// проезда. Затем дети коротко аплодируют, папа смотрит на сына; крупно —
// мальчик встречает его взгляд и улыбается. N08 — после успеха.
import { AbsoluteFill } from "remotion";
import { anticipate, clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, Paper, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C } from "../theme";
import { BridgeSide, deckY } from "../props/Bridge";
import { CloseHand, SKIN } from "../props/CloseHand";
import { TEST_GEO } from "./Test";
import { ClassFront } from "./Class";

export const demoPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "demo");
  const n08 = T.from("N08");
  return { place: [4, 22] as const, cross: [30, 112] as const, clap: [118, 160] as const, smile: Math.min(n08 - 10, 166), n08, len: T.len };
};
type P = ReturnType<typeof demoPlan>;

const G = TEST_GEO;
const CAR = 130;
const LEFT = G.cx - G.span / 2 - G.bookW / 2;
const RIGHT = G.cx + G.span / 2 + G.bookW / 2;

const Model: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const u = easeInOut(clamp((f - p.cross[0]) / (p.cross[1] - p.cross[0])));
  const carX = lerp(LEFT, RIGHT, u);
  const y = deckY(G, "folded", carX, carX, 90);
  const lift = keys(f, [[p.place[0], 70], [p.place[1], 0]]);
  const placing = f < p.place[1] + 6;
  const fing = { x: carX - CAR * 0.55, y: y - CAR * 0.18 };
  const hand = placing ? keysV(f, [[0, { x: LEFT + 10, y: G.tableY - G.stackH - 70 - CAR * 0.42 - 380 }], [p.place[0], { x: LEFT + 10, y: G.tableY - G.stackH - lift - CAR * 0.42 - 200 }], [p.place[1] + 6, { x: LEFT - 40, y: G.tableY - G.stackH - 500 }]], anticipate) : null;
  const zoom = keys(f, [[p.cross[0], 1.28], [(p.cross[0] + p.cross[1]) / 2, 1.36], [p.cross[1], 1.3]]);
  const camX = lerp(0, 60, u);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom}) translateX(${-camX}px)`, transformOrigin: "540px 1150px" }}>
      <Paper color="#EFEDE4" dots="rgba(23,23,23,0.04)" />
      <div style={box({ left: 60, top: 560, width: 960, height: 420, backgroundColor: "#22354F", border: "18px solid #C8B08A" })} />
      <div style={box({ left: 0, top: G.tableY, width: 1200, height: 34, backgroundColor: C.wood })} />
      <div style={box({ left: 0, top: G.tableY + 34, width: 1200, height: 700, backgroundColor: C.navy })} />
      <svg width={1200} height={1920} style={box({ left: 0, top: 0 })}>
        <BridgeSide g={G} mode="folded" sag={90} carX={carX} carLen={CAR} carLift={f < p.place[1] ? lift : 0} carRoll={carX - LEFT} />
        {hand ? <CloseHand x={hand.x} y={hand.y} angle={4} size={180} {...SKIN.emir} shape="pinch" armLen={5} /> : null}
        {!placing && u < 0.98 ? <CloseHand x={fing.x - 150} y={fing.y - 140} angle={-47} size={170} {...SKIN.emir} shape="point" mirror armLen={5} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

export const DemoScene: React.FC = () => {
  const { f } = useScene("demo");
  const p = usePlan(demoPlan);
  if (f < p.clap[0]) return <Model f={f} p={p} />;
  const t = f - p.clap[0];
  const clap = (k: number) => (tt: number) => {
    const c = tt - p.clap[0];
    const on = c > 4 + k * 2 && tt < p.clap[1];
    const o = on ? Math.abs(Math.sin((c + k * 3) * 0.55)) * 40 : 60;
    return { expr: "smile", lookX: k ? -0.2 : 0.2, lookY: -0.15, armL: { target: on ? { x: -o, y: -420 } : null, shape: "open", elbow: "down", behind: false, wrist: 30 }, armR: { target: on ? { x: o, y: -420 } : null, shape: "open", elbow: "down", behind: false, wrist: -30 } };
  };
  // руки детей — относительно их места (в ClassFront места заданы в мире)
  const KIDS = [
    { x: 200, y: 1730, h: 640 },
    { x: 920, y: 1730, h: 650 },
    { x: 1040, y: 1700, h: 620 },
  ];
  const kidPose = (k: number) => (tt: number) => {
    const pz = clap(k)(tt);
    const P0 = KIDS[k];
    const s = P0.h / 1000;
    const tr = (a: { target: { x: number; y: number } | null }) => (a.target ? { ...a, target: { x: P0.x + a.target.x * s, y: P0.y + a.target.y * s } } : a);
    return { ...pz, armL: tr(pz.armL), armR: tr(pz.armR) };
  };
  const dadPose = () => ({ expr: "smile", lookX: 0.45, lookY: 0.05, armL: { target: { x: 470, y: 1250 }, shape: "relax", elbow: "down", behind: false }, armR: { target: { x: 610, y: 1250 }, shape: "relax", elbow: "down", behind: false } });
  const smiling = f >= p.smile;
  const emirPose = () => ({ expr: smiling ? { browIn: 3, browOut: 4, lid: 0.08, smile: 1 } : "smile", lookX: smiling ? -0.6 : -0.2, lookY: 0.0, armL: { target: { x: 735, y: 1255 }, shape: "relax", elbow: "down", behind: false }, armR: { target: { x: 810, y: 1255 }, shape: "relax", elbow: "down" } });
  const cam = smiling ? { x: 700, y: 1120, zoom: 2.6 } : { x: 600, y: 1150, zoom: keys(t, [[0, 1.3], [40, 1.36]]) };
  return <ClassFront f={f} dadPose={dadPose} emirPose={emirPose} kidPose={kidPose} cam={cam} carX={CLASS_RIGHT} />;
};
const CLASS_RIGHT = 560 + 100 + 38;
