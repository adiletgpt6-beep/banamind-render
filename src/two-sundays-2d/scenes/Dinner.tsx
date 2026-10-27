// Сцена 8. Три человека за столом.
// A. Сверху: детские руки раскладывают три вилки по одной — каждую берут из
//    стакана, переносят к тарелке и оставляют.
// B. Через край тарелки — средний план кухни: папа режет овощи на доске
//    (нож в одной руке, огурец в другой; кружочки появляются после
//    движения ножа), мама перемешивает салат, дочка ставит тарелки и
//    беззвучно что-то рассказывает; мама слушает и улыбается.
// C. Мягко размытый край миски на переднем плане открывает три лица.
// D. Общий план: все трое за столом — мама слева, дочка в центре, папа
//    справа, как на детском рисунке.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C, TINT } from "../theme";
import { KITCHEN, KitchenBack, KitchenChairs, KitchenTable } from "../sets/Home";
import { H, HANDS, seatOf } from "./common";

const K = KITCHEN;

export const dinnerPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "dinner");
  const forks = [6, 34, 62]; // начало переноса каждой вилки
  const kitchen = 100;
  const chops = Array.from({ length: 9 }, (_, i) => kitchen + 16 + i * 11);
  const faces = Math.max(kitchen + 120, T.word("N08", "Апасы") - 8);
  const table = faces + 70;
  return { forks, kitchen, chops, faces, table, len: T.len };
};
type P = ReturnType<typeof dinnerPlan>;

// ---------- A. Вилки сверху ----------
const PLATES = [
  { x: 230, y: 760 },
  { x: 540, y: 980 },
  { x: 850, y: 760 },
];
const CUP = { x: 880, y: 1380 };
const Fork: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <rect x={-7} y={-40} width={14} height={150} rx={7} fill="#C9CFD8" />
    {[-1, 0, 1].map((k) => (
      <rect key={k} x={k * 13 - 4} y={-92} width={8} height={56} rx={4} fill="#DDE2EA" />
    ))}
  </g>
);
const ForksTop: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const placed = PLATES.map((pl, i) => ({ x: pl.x - 140, y: pl.y + 10, i }));
  const handFor = (i: number) => {
    const t0 = p.forks[i];
    return keysV(f, [[t0, { x: CUP.x, y: CUP.y + 40 }], [t0 + 6, { x: CUP.x, y: CUP.y + 20 }], [t0 + 22, { x: placed[i].x, y: placed[i].y + 40 }], [t0 + 26, { x: placed[i].x, y: placed[i].y + 40 }], [t0 + 34, { x: CUP.x - 80, y: CUP.y + 200 }]], easeInOut);
  };
  const cur = p.forks.findIndex((t0) => f >= t0 && f < t0 + 28);
  const hand = cur >= 0 ? handFor(cur) : { x: CUP.x - 60, y: CUP.y + 260 };
  return (
    <Shot f={f} cam={{ x: 540, y: 1060, zoom: 1 }} bg={C.woodLight}>
      <div style={box({ left: -200, top: -200, width: 1500, height: 2400, backgroundColor: C.woodLight, backgroundImage: "repeating-linear-gradient(90deg, rgba(150,105,60,0.10) 0 3px, transparent 3px 120px)" })} />
      <Svg>
        {PLATES.map((pl) => (
          <g key={pl.x}>
            <circle cx={pl.x} cy={pl.y} r={130} fill="#FFFFFF" stroke="#E2E6EC" strokeWidth={6} />
            <circle cx={pl.x} cy={pl.y} r={88} fill="#F3F5F8" />
          </g>
        ))}
        {/* стакан с вилками */}
        <circle cx={CUP.x} cy={CUP.y} r={70} fill={C.navy} />
        <circle cx={CUP.x} cy={CUP.y} r={56} fill="#2A3768" />
        {[0, 1, 2].filter((i) => f < p.forks[i] + 6).map((i) => (
          <circle key={i} cx={CUP.x - 18 + i * 18} cy={CUP.y - 6 + (i % 2) * 10} r={9} fill="#C9CFD8" />
        ))}
        {placed.map((pl) => (f >= p.forks[pl.i] + 26 ? <Fork key={pl.i} x={pl.x} y={pl.y} a={0} /> : null))}
        {cur >= 0 && f >= p.forks[cur] + 6 && f < p.forks[cur] + 26 ? <Fork x={hand.x} y={hand.y - 40} a={lerp(20, 0, clamp((f - p.forks[cur] - 6) / 16))} /> : null}
        <CloseHand x={hand.x + 30} y={hand.y + 150} angle={168} size={140} {...HANDS.girl} shape={cur >= 0 && f >= p.forks[cur] + 4 && f < p.forks[cur] + 26 ? "pinch" : "rest"} />
      </Svg>
      <div style={box({ left: -200, top: -200, width: 1500, height: 2400, backgroundColor: TINT.warm })} />
    </Shot>
  );
};

// ---------- B–D. Кухня ----------
const Board: React.FC<{ slices: number }> = ({ slices }) => (
  <Svg>
    <rect x={250} y={K.table.top - 14} width={250} height={16} rx={6} fill="#B98A5A" />
    {/* огурец (укорачивается) и кружочки */}
    <rect x={300 + slices * 9} y={K.table.top - 40} width={Math.max(30, 150 - slices * 9)} height={28} rx={14} fill="#5E9E4E" />
    {Array.from({ length: slices }).map((_, i) => (
      <ellipse key={i} cx={268 + (i % 5) * 9} cy={K.table.top - 18 - Math.floor(i / 5) * 6} rx={13} ry={5} fill="#BFE0A6" stroke="#5E9E4E" strokeWidth={2} />
    ))}
  </Svg>
);

const TableItems: React.FC<{ bowl?: boolean; plates?: number }> = ({ bowl = true, plates = 3 }) => (
  <Svg>
    {[K.seats.mom, K.seats.girl, K.seats.dad].slice(0, plates).map((x) => (
      <ellipse key={x} cx={x} cy={K.table.top - 4} rx={70} ry={12} fill="#FFFFFF" stroke="#E2E6EC" strokeWidth={3} />
    ))}
    {bowl ? (
      <g>
        <path d={`M 500 ${K.table.top - 70} Q 510 ${K.table.top} 560 ${K.table.top} L 640 ${K.table.top} Q 690 ${K.table.top} 700 ${K.table.top - 70} Z`} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={3} />
        <ellipse cx={600} cy={K.table.top - 70} rx={100} ry={18} fill="#9CC86E" />
        <circle cx={570} cy={K.table.top - 78} r={12} fill="#E2574C" />
        <circle cx={625} cy={K.table.top - 80} r={10} fill="#E2574C" />
      </g>
    ) : null}
  </Svg>
);

const Cooking: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const chopIdx = p.chops.filter((c) => f >= c + 5).length;
  const chop = p.chops.find((c) => f >= c && f < c + 11);
  const knifeY = chop !== undefined ? keys(f - chop, [[0, -40], [5, 0], [11, -40]]) : -40;
  const dad: Place = { x: 210, y: K.floorY - 30, h: H.dad };
  const mom: Place = { x: 520, y: K.floorY - 40, h: H.mom };
  const girl: Place = { x: 830, y: K.floorY - 20, h: H.girl };
  const dadPose = (): PoseIn => ({
    expr: "softSmile",
    lean: 12,
    lookY: 0.55,
    armR: { target: { x: 400 + chopIdx * 3, y: K.table.top - 60 + knifeY }, shape: "fist", item: "knife", elbow: "down", behind: false, itemTilt: 0 },
    armL: { target: { x: 470, y: K.table.top - 34 }, shape: "fist", elbow: "down", behind: false },
  });
  const stir = (t: number) => ({ x: 600 + 34 * Math.cos(t / 6), y: K.table.top - 96 + 8 * Math.sin(t / 6) });
  const momPose = (t: number): PoseIn => ({ expr: "smile", lean: 8, lookY: 0.3, lookX: 0.4, armR: { target: stir(t), shape: "fist", item: "spoon", elbow: "down", behind: false }, armL: { target: { x: 520, y: K.table.top - 36 }, shape: "open", elbow: "down", behind: false } });
  const talk = (t: number) => 0.5 + 0.5 * Math.sin(t / 8);
  const girlPose = (t: number): PoseIn => ({ expr: "smile", lookY: 0.05, armL: { target: { x: 760 - 30 * talk(t), y: K.table.top - 140 - 60 * talk(t) }, shape: "open", elbow: "down", behind: false }, armR: { target: { x: 890, y: K.table.top - 10 }, shape: "relax", elbow: "down", behind: false } });
  return (
    <>
      <KitchenBack warm={1} />
      <Actor uid="d8-dad" look="su2Dad" f={f} place={() => dad} face={() => 0.45} pose={dadPose} seed={2} layer="body" />
      <Actor uid="d8-mom" look="su2MomHome" f={f} place={() => mom} face={(t) => keys(t, [[p.kitchen, 0.1], [p.kitchen + 40, 0.55]])} pose={momPose} seed={5} layer="body" />
      <Actor uid="d8-girl" look="su2GirlHome" f={f} place={() => girl} face={() => -0.55} pose={girlPose} seed={7} blinkShift={23} layer="body" />
      <KitchenTable />
      <TableItems />
      <Board slices={chopIdx} />
      <Actor uid="d8-dad" look="su2Dad" f={f} place={() => dad} face={() => 0.45} pose={dadPose} seed={2} layer="arms" />
      <Actor uid="d8-mom" look="su2MomHome" f={f} place={() => mom} face={(t) => keys(t, [[p.kitchen, 0.1], [p.kitchen + 40, 0.55]])} pose={momPose} seed={5} layer="arms" />
      <Actor uid="d8-girl" look="su2GirlHome" f={f} place={() => girl} face={() => -0.55} pose={girlPose} seed={7} blinkShift={23} layer="arms" />
    </>
  );
};

// Все трое за столом: мама слева, дочка в центре, папа справа.
export const SeatedThree: React.FC<{ f: number; looks?: { mom: "su2MomHome"; girl: "su2GirlHome" | "su2GirlNext"; dad: "su2Dad" | "su2DadNext" }; girlPose?: (t: number) => PoseIn; momPose?: (t: number) => PoseIn; dadPose?: (t: number) => PoseIn; girlFace?: (t: number) => number; momFace?: (t: number) => number; dadFace?: (t: number) => number; items?: React.ReactNode; cloth?: string }> = ({
  f,
  looks = { mom: "su2MomHome", girl: "su2GirlHome", dad: "su2Dad" },
  girlPose,
  momPose,
  dadPose,
  girlFace = () => 0,
  momFace = () => 0.45,
  dadFace = () => -0.45,
  items,
  cloth,
}) => {
  const base = (x: number, h: number, child = false): PoseIn => ({ sit: 1, seat: seatOf(h, child) + (child ? 60 : 30), expr: "softSmile", armL: { target: { x: x - 60, y: K.table.top + 6 }, shape: "relax", elbow: "down", behind: false }, armR: { target: { x: x + 60, y: K.table.top + 6 }, shape: "relax", elbow: "down", behind: false } });
  const mp = (t: number) => ({ ...base(K.seats.mom, H.mom), ...(momPose?.(t) ?? {}) });
  const gp = (t: number) => ({ ...base(K.seats.girl, H.girl, true), ...(girlPose?.(t) ?? {}) });
  const dp = (t: number) => ({ ...base(K.seats.dad, H.dad), ...(dadPose?.(t) ?? {}) });
  const actors = (layer: "body" | "arms") => (
    <>
      <Actor uid="st-mom" look={looks.mom} f={f} place={() => ({ x: K.seats.mom, y: K.floorY - 30, h: H.mom })} face={momFace} pose={mp} role="mother" seed={5} layer={layer} />
      <Actor uid="st-girl" look={looks.girl} f={f} place={() => ({ x: K.seats.girl, y: K.floorY - 10, h: H.girl })} face={girlFace} pose={gp} role="daughter" seed={7} blinkShift={23} layer={layer} />
      <Actor uid="st-dad" look={looks.dad} f={f} place={() => ({ x: K.seats.dad, y: K.floorY - 30, h: H.dad })} face={dadFace} pose={dp} role="father" seed={2} layer={layer} />
    </>
  );
  return (
    <>
      <KitchenChairs />
      {actors("body")}
      <KitchenTable cloth={cloth} />
      {items}
      {actors("arms")}
    </>
  );
};

export const DinnerScene: React.FC = () => {
  const { f } = useScene("dinner");
  const p = usePlan(dinnerPlan);
  if (f < p.kitchen) {
    // переход через край тарелки: белый круг раскрывается на весь кадр
    const wipe = clamp((f - (p.kitchen - 12)) / 12);
    return (
      <>
        <ForksTop f={f} p={p} />
        {wipe > 0 ? <div style={box({ left: 540 - 2000 * wipe, top: 980 - 2000 * wipe, width: 4000 * wipe, height: 4000 * wipe, borderRadius: "50%", backgroundColor: "#FFFFFF" })} /> : null}
      </>
    );
  }
  if (f < p.faces) {
    const k = clamp((f - p.kitchen) / 10);
    return (
      <>
        <Shot f={f} cam={{ x: 520, y: 1080, zoom: 1.12 }} bg={C.wallKitchen}>
          <Cooking f={f} p={p} />
          <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
        </Shot>
        {k < 1 ? <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: "#FFFFFF", opacity: 1 - k })} /> : null}
      </>
    );
  }
  if (f < p.table) {
    return (
      <Shot f={f} cam={{ x: 610, y: 870, zoom: 1.7 }} bg={C.wallKitchen}>
        <KitchenBack warm={1} />
        <SeatedThree f={f} items={<TableItems />} girlFace={(t) => keys(t, [[p.faces, 0.4], [p.faces + 30, -0.4]])} />
        {/* мягко размытый край миски на переднем плане */}
        <div style={box({ left: 300, top: 1240, width: 640, height: 300, borderRadius: "50%", backgroundColor: "#FFFFFF", filter: "blur(14px)", opacity: 0.95 })} />
        <div style={box({ left: 360, top: 1220, width: 520, height: 70, borderRadius: "50%", backgroundColor: "#9CC86E", filter: "blur(14px)" })} />
        <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
      </Shot>
    );
  }
  return (
    <Shot f={f} cam={{ x: 610, y: 1080, zoom: keys(f, [[p.table, 1.0], [p.len, 1.06]]) }} bg={C.wallKitchen}>
      <KitchenBack warm={1} />
      <SeatedThree f={f} items={<TableItems />} girlFace={(t) => (Math.floor(t / 40) % 2 ? 0.4 : -0.4)} />
      <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
    </Shot>
  );
};
