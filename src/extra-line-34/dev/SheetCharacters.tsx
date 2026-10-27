// Рабочий лист «Персонажи» (№34): рост и пропорции героев на одном полу,
// посадка на диван/кресло (у сына ноги свисают), предметы в руках: книга
// двумя руками, зайчик; портреты кандидатов для карточек.
import { useCurrentFrame } from "remotion";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { keys, keysV } from "../rig/motion";
import { box } from "../kit";
import { C } from "../theme";
import { DevSheet } from "./DevSheet";

const FLOOR1 = 860;
const FLOOR2 = 1640;

const Block: React.FC<{ x: number; w: number; floor: number; seat: number; back?: number; color?: string }> = ({ x, w, floor, seat, back = 300, color = C.sofa }) => (
  <>
    <div style={box({ left: x, top: floor - seat - back, width: w, height: back + 20, borderRadius: 30, backgroundColor: color, filter: "brightness(0.92)" })} />
    <div style={box({ left: x - 10, top: floor - seat, width: w + 20, height: seat, borderRadius: "20px 20px 6px 6px", backgroundColor: color })} />
  </>
);

export const SheetCharacters: React.FC = () => {
  const f = useCurrentFrame();
  const at = (x: number, y: number, h: number) => (): Place => ({ x, y, h });
  const turn = (a: number) => (t: number) => keys(t, [[0, 0], [40, a], [100, a], [130, 0]]);
  // ряд 1 — стоят (масштаб 0,72 от роста в фильме)
  const S = 0.72;
  const row1: { uid: string; look: "mom" | "dad" | "caregiver" | "son" | "toddler"; x: number; h: number }[] = [
    { uid: "m", look: "mom", x: 150, h: 760 * S },
    { uid: "d", look: "dad", x: 340, h: 790 * S },
    { uid: "c", look: "caregiver", x: 540, h: 750 * S },
    { uid: "s", look: "son", x: 730, h: 560 * S },
    { uid: "t", look: "toddler", x: 900, h: 380 * S },
  ];
  // ряд 2 — сидят: воспитатель с книгой, сын рядом (ноги свисают), мама в кресле
  const cg: Place = { x: 330, y: FLOOR2, h: 750 * 0.8 };
  const sn: Place = { x: 520, y: FLOOR2, h: 560 * 0.8 };
  const seat = 205 * 0.8;
  const bookY = cg.y - seat - 40;
  const cgPose = (t: number): PoseIn => ({
    sit: 1,
    seat,
    expr: "softSmile",
    armL: { target: { x: cg.x - 40, y: bookY }, shape: "fist", elbow: "down" },
    armR: { target: { x: cg.x + 40, y: bookY }, shape: "fist", elbow: "down", item: t > 220 ? "bunny" : "none", itemScale: 1.3 },
    lookY: 0.5,
  });
  const snPose = (t: number): PoseIn => ({
    sit: 1,
    seat,
    expr: "smile",
    legSwing: Math.sin(t / 9) * 0.8,
    armL: { target: keysV(t, [[0, { x: sn.x - 30, y: sn.y - seat - 10 }], [150, { x: sn.x - 30, y: sn.y - sn.h * 0.6 }], [200, { x: sn.x - 30, y: sn.y - sn.h * 0.6 }], [240, { x: sn.x - 30, y: sn.y - seat - 10 }]]), shape: "fist", elbow: "hang" },
    armR: { target: keysV(t, [[0, { x: sn.x + 30, y: sn.y - seat - 10 }], [150, { x: sn.x + 30, y: sn.y - sn.h * 0.6 }], [200, { x: sn.x + 30, y: sn.y - sn.h * 0.6 }], [240, { x: sn.x + 30, y: sn.y - seat - 10 }]]), shape: "fist", elbow: "hang", item: t > 140 && t < 230 ? "book" : "none", itemScale: 1.3 },
  });
  const td: Place = { x: 900, y: FLOOR2, h: 380 * 0.8 };
  const tdPose = (t: number): PoseIn => ({
    expr: "smile",
    armL: { target: { x: td.x - 22, y: td.y - td.h * 0.62 }, shape: "fist", elbow: "hang" },
    armR: { target: { x: td.x + 22, y: td.y - td.h * 0.62 }, shape: "fist", elbow: "hang", item: t <= 220 ? "bunny" : "none", itemScale: 2.4 },
  });
  return (
    <DevSheet>
      <div style={box({ left: 0, top: FLOOR1, width: 1080, height: 6, backgroundColor: C.line })} />
      {row1.map((r, i) => (
        <Actor key={r.uid} uid={`sheet-${r.uid}`} look={r.look} f={f} place={at(r.x, FLOOR1, r.h)} face={turn(i % 2 ? -0.6 : 0.6)} seed={i + 1} pose={() => ({ expr: "softSmile" })} />
      ))}
      <Block x={180} w={460} floor={FLOOR2} seat={seat} />
      <Block x={700} w={150} floor={FLOOR2} seat={seat} color={C.armchair} />
      <div style={box({ left: 0, top: FLOOR2, width: 1080, height: 6, backgroundColor: C.line })} />
      <Actor uid="sheet-cg" look="caregiver" f={f} place={() => cg} face={(t) => keys(t, [[0, 0.3], [140, 0.5], [210, 0.8], [260, 0.5]])} pose={cgPose} seed={3} />
      <Actor uid="sheet-sn" look="son" f={f} place={() => sn} face={() => -0.5} pose={snPose} seed={4} />
      <Actor uid="sheet-td" look="toddler" f={f} place={() => td} face={() => -0.4} pose={tdPose} seed={5} />
      {/* портреты кандидатов */}
      {(["cand1", "cand2"] as const).map((l, i) => (
        <div key={l} style={box({ left: 120 + i * 300, top: 1700, width: 200, height: 200, borderRadius: 100, overflow: "hidden", backgroundColor: C.bgDeep })}>
          <Actor uid={`sheet-${l}`} look={l} f={f} place={() => ({ x: 100, y: 640, h: 625 })} seed={6 + i} pose={() => ({ expr: "softSmile" })} />
        </div>
      ))}
    </DevSheet>
  );
};
