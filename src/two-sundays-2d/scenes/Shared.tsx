// Сцена 13. Календарь становится общим. Следующий совместный ужин: другая
// скатерть, другой чайник, у папы и дочки другая домашняя одежда (прошло
// время; это не означает, что заявка уже обработана).
// A. Родители за столом. Дочка приходит с тем же календарём и кладёт его на
//    свободную часть стола — тарелки и еда остаются на месте.
// B. D03: через мягко размытый край чашки — лицо дочки; она смотрит на обоих.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, keys, keysV, lerp } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C, TINT } from "../theme";
import { KITCHEN, KitchenBack, KitchenChairs, KitchenTable } from "../sets/Home";
import { H, seatOf } from "./common";

const K = KITCHEN;
const CLOTH = "#CFDCEB";
export const SHEET_ON_TABLE = { x: 726, y: K.table.top - 4 };

export const sharedPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "shared");
  const walk: [number, number] = [8, 64];
  const place = walk[1] + 12;
  const close = Math.max(place + 16, T.from("D03") - 10);
  return { walk, place, close, d03: T.from("D03"), len: T.len };
};

export const NextTable: React.FC<{ sheet: boolean }> = ({ sheet }) => (
  <Svg>
    {[K.seats.mom, K.seats.girl, K.seats.dad].map((x) => (
      <g key={x}>
        <ellipse cx={x} cy={K.table.top - 4} rx={64} ry={11} fill="#FFFFFF" stroke="#E2E6EC" strokeWidth={3} />
        <ellipse cx={x} cy={K.table.top - 10} rx={36} ry={6} fill="#E8B24A" />
      </g>
    ))}
    {/* чайник между мамой и дочкой */}
    <g transform={`translate(${495} ${K.table.top - 4})`}>
      <ellipse cx={0} cy={-34} rx={46} ry={36} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={3} />
      <path d="M 40 -40 q 26 -6 32 -26" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={-72} r={8} fill={C.blue} />
    </g>
    {sheet ? <rect x={SHEET_ON_TABLE.x - 48} y={SHEET_ON_TABLE.y - 6} width={96} height={9} rx={3} fill="#FFFEFA" stroke="#D8D2C4" strokeWidth={2} /> : null}
  </Svg>
);

export const SharedScene: React.FC = () => {
  const { f } = useScene("shared");
  const p = usePlan(sharedPlan);
  const girlPlace = (t: number): Place => ({ x: lerp(1260, K.seats.girl + 40, cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3)), y: K.floorY - 6, h: H.girl });
  const holding = f < p.place;
  const girlPose = (t: number): PoseIn => ({
    expr: t >= p.d03 - 6 ? "smile" : "softSmile",
    lookY: t < p.place + 4 ? 0.35 : 0.05,
    lean: keys(t, [[p.place - 10, 0], [p.place, 10], [p.place + 14, 0]]),
    armR: { target: t < p.walk[1] - 6 ? { x: girlPlace(t).x - 90, y: K.floorY - 6 - 300 } : keysV(t, [[p.walk[1] - 6, { x: 700, y: K.table.top - 90 }], [p.place, SHEET_ON_TABLE], [p.place + 12, { x: 700, y: K.table.top - 30 }]], anticipate), shape: holding ? "pinch" : "relax", item: holding ? "calendar" : "none", elbow: "down", behind: false },
  });
  const girlFace = (t: number) => (t < p.walk[1] ? -0.7 : t < p.d03 + 20 ? keys(t, [[p.d03, -0.2], [p.d03 + 18, -0.5]]) : keys(t, [[p.d03 + 20, -0.5], [p.d03 + 40, 0.5]]));
  const seated = (x: number, h: number): PoseIn => ({ sit: 1, seat: seatOf(h) + 30, expr: "softSmile", lookY: 0.15, armL: { target: { x: x - 60, y: K.table.top + 6 }, shape: "relax", elbow: "down", behind: false }, armR: { target: { x: x + 60, y: K.table.top + 6 }, shape: "relax", elbow: "down", behind: false } });
  const momFace = (t: number) => (t < p.walk[0] + 30 ? 0.4 : 0.6);
  const dadFace = (t: number) => (t < p.walk[0] + 20 ? -0.3 : 0.3 - 0.8 * clamp((t - p.place) / 20));
  const cam = f < p.close ? { x: 680, y: 1060, zoom: 1.2 } : { x: K.seats.girl + 40, y: 1010, zoom: 2.3 };
  return (
    <Shot f={f} cam={cam} bg={C.wallKitchen}>
      <KitchenBack warm={1} />
      <KitchenChairs seats={[K.seats.mom, K.seats.dad]} />
      <Actor uid="s13-mom" look="su2MomHome" f={f} place={() => ({ x: K.seats.mom, y: K.floorY - 30, h: H.mom })} face={momFace} pose={() => seated(K.seats.mom, H.mom)} seed={5} layer="body" />
      <Actor uid="s13-dad" look="su2DadNext" f={f} place={() => ({ x: K.seats.dad, y: K.floorY - 30, h: H.dad })} face={dadFace} pose={() => seated(K.seats.dad, H.dad)} seed={2} layer="body" />
      <Actor uid="s13-girl" look="su2GirlNext" f={f} place={girlPlace} face={girlFace} pose={girlPose} role="daughter" seed={7} blinkShift={23} walkFrom={p.walk[0]} layer="body" />
      <KitchenTable cloth={CLOTH} />
      <NextTable sheet={!holding} />
      <Actor uid="s13-mom" look="su2MomHome" f={f} place={() => ({ x: K.seats.mom, y: K.floorY - 30, h: H.mom })} face={momFace} pose={() => seated(K.seats.mom, H.mom)} seed={5} layer="arms" />
      <Actor uid="s13-dad" look="su2DadNext" f={f} place={() => ({ x: K.seats.dad, y: K.floorY - 30, h: H.dad })} face={dadFace} pose={() => seated(K.seats.dad, H.dad)} seed={2} layer="arms" />
      <Actor uid="s13-girl" look="su2GirlNext" f={f} place={girlPlace} face={girlFace} pose={girlPose} role="daughter" seed={7} blinkShift={23} walkFrom={p.walk[0]} layer="arms" />
      {f >= p.close ? (
        <>
          {/* мягко размытая чашка на переднем плане */}
          <div style={box({ left: K.seats.girl - 260, top: 1180, width: 230, height: 260, borderRadius: "20px 20px 60px 60px", backgroundColor: "#FFFFFF", filter: "blur(16px)", opacity: 0.95 })} />
          <div style={box({ left: K.seats.girl - 250, top: 1170, width: 210, height: 40, borderRadius: "50%", backgroundColor: "#C9A27A", filter: "blur(16px)" })} />
        </>
      ) : null}
      <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
    </Shot>
  );
};
