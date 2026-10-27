// Сцена 5. Повседневная дорога. Над планами — маршрутная линия «Кеңсе →
// Мектеп → Үй → Кеңсе», которая прорисовывается вместе с действием:
// A — кабинет, крупно: рука папы откладывает карандаш на чертёж (Кеңсе);
// B — салон семейной машины: папа за рулём, Эмир сзади, пристёгнут
//     (Мектеп → Үй);
// C — снова кабинет: папа садится и берёт карандаш (→ Кеңсе).
// Без часов потерь, стоимости и вывесок BalaGo.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { box, Paper, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C, F } from "../theme";
import { IW2_TEXT } from "../script";
import { BlueprintArt } from "../props/Blueprint";
import { CloseHand, SKIN } from "../props/CloseHand";
import { CabinBack, CabinFront, FrontSeats } from "../sets/CarViews";
import { OFFICE, OfficeBack, OfficeChairBack, OfficeDesk } from "../sets/Office";
import { OnTable } from "../sets/Home";
import { H, sitDown } from "./common";

export const routePlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "route");
  const n04 = T.from("N04");
  const car = T.word("N04", "мектептен") - 6;
  const back = T.word("N04", "кайра") - 2;
  return { n04, car, back, sit: back + 4, len: T.len };
};
type P = ReturnType<typeof routePlan>;

// ---------- маршрутная линия ----------
const NODES = [140, 400, 660, 920];
const Arrow: React.FC<{ x: number; y: number }> = ({ x, y }) => <path d={`M ${x - 14} ${y - 12} L ${x + 4} ${y} L ${x - 14} ${y + 12}`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />;
const RouteLine: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  // прогресс по узлам: 0 — Кеңсе, 1 — Мектеп, 2 — Үй, 3 — Кеңсе
  const prog = keys(f, [[4, 0], [p.car, 0.6], [p.car + 30, 2], [p.back - 4, 2.1], [p.back + 26, 3]], easeInOut);
  const k = easeOut(clamp(f / 10));
  const y = 250;
  const xAt = (v: number) => {
    const i = Math.min(2, Math.floor(v));
    return lerp(NODES[i], NODES[i + 1], v - i);
  };
  return (
    <div style={box({ left: 40, top: 150 - (1 - k) * 60, width: 1000, height: 220, backgroundColor: C.sheet, border: `4px solid ${C.ink}`, boxShadow: "8px 10px 0 rgba(23,23,23,0.14)", boxSizing: "border-box", opacity: k })}>
      <svg width={1000} height={220} style={box({ left: -4, top: -4 })}>
        <line x1={NODES[0]} y1={y - 150} x2={NODES[3]} y2={y - 150} stroke="#D9D6CC" strokeWidth={8} strokeLinecap="round" />
        <line x1={NODES[0]} y1={y - 150} x2={xAt(prog)} y2={y - 150} stroke={C.blue} strokeWidth={8} strokeLinecap="round" />
        {NODES.slice(0, 3).map((x, i) => (
          <Arrow key={i} x={(x + NODES[i + 1]) / 2 + 12} y={y - 150} />
        ))}
        {NODES.map((x, i) => (
          <circle key={i} cx={x} cy={y - 150} r={16} fill={prog >= i - 0.02 ? C.blue : C.white} stroke={C.blue} strokeWidth={6} />
        ))}
      </svg>
      {IW2_TEXT.routeNodes.map((t, i) => (
        <div key={i} style={box({ left: NODES[i] - 90 - 4, top: 140, width: 180, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 38, color: prog >= i - 0.02 ? C.ink : "#8C8A84" })}>{t}</div>
      ))}
    </div>
  );
};

// ---------- A: карандаш откладывается ----------
const PencilDown: React.FC<{ f: number }> = ({ f }) => {
  const W = 900;
  const hand = keysV(f, [[0, { x: 620, y: 1180 }], [16, { x: 640, y: 1260 }], [26, { x: 980, y: 1500 }]], anticipate);
  const holding = f < 16;
  const pencil = holding ? { x: hand.x - 120, y: hand.y - 150, r: -38 } : { x: 520, y: 1110, r: -30 };
  return (
    <AbsoluteFill style={{ backgroundColor: "#F2F1EC" }}>
      <Paper color="#F2F1EC" />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <g transform="translate(540 1000) rotate(-1)">
          <BlueprintArt w={W} />
        </g>
        <g transform={`translate(${pencil.x} ${pencil.y}) rotate(${pencil.r})`}>
          <rect x={-12} y={-150} width={24} height={300} rx={4} fill={C.yellow} stroke="#C9A12E" strokeWidth={2} />
          <path d="M -12 150 L 0 196 L 12 150 Z" fill="#E8CFA6" />
          <path d="M -4 182 L 0 196 L 4 182 Z" fill="#3A3F4B" />
        </g>
        <CloseHand x={hand.x} y={hand.y} angle={150} size={230} {...SKIN.azamat} shape={holding ? "pinch" : "open"} armLen={5} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- B: салон машины ----------
const Cabin: React.FC<{ f: number }> = ({ f }) => {
  const pass = f * 1.4;
  const dad: Place = { x: 830, y: 1980, h: 1180 };
  const boy: Place = { x: 470, y: 1360, h: 780 };
  const dadPose = () => ({ sit: 1, seat: 780, expr: "calm" as const, armL: { target: { x: 664, y: 1258 }, shape: "fist" as const, elbow: "down" as const, behind: false, wrist: -20 }, armR: { target: { x: 976, y: 1258 }, shape: "fist" as const, elbow: "down" as const, behind: false, wrist: 20 }, lookY: -0.05 });
  return (
    <Shot f={f} cam={{ x: 540, y: 1040, zoom: 1.08 }} bg="#3B414D">
      <CabinBack />
      <div style={box({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = ((((i * 260 - pass * 10) % 1300) + 1300) % 1300) - 200;
          return <div key={i} style={box({ left: x, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#F1E3C8", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"][i], borderRadius: i % 2 ? 80 : 6 })} />;
        })}
      </div>
      <Actor uid="r5-boy" look="emir" f={f} place={() => boy} face={() => -0.2} pose={() => ({ sit: 1, seat: 330, packOff: true, expr: "calm", armL: { target: { x: 430, y: 1030 }, elbow: "down" }, armR: { target: { x: 515, y: 1034 }, elbow: "down", behind: false }, lookX: -0.3 })} seed={4} blinkShift={37} />
      {/* ремень безопасности: через плечо и поясом, замок у бедра */}
      <Svg>
        <path d="M 392 790 L 548 1036" stroke="#1F2228" strokeWidth={18} strokeLinecap="round" />
        <path d="M 398 1034 L 548 1036" stroke="#1F2228" strokeWidth={18} strokeLinecap="round" />
        <rect x={536} y={1028} width={24} height={16} rx={4} fill="#9AA3B2" />
      </Svg>
      <div style={box({ left: 620, top: 930, width: 140, height: 180, borderRadius: "40px 40px 20px 20px", backgroundColor: C.blue })} />
      <div style={box({ left: 360, top: 1056, width: 500, height: 300, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
      <FrontSeats />
      <Actor uid="r5-dad" look="azamat" f={f} place={() => dad} face={() => 0} pose={dadPose} seed={2} layer="body" />
      <Svg>
        <path d="M 962 878 L 752 1440" stroke="#1F2228" strokeWidth={22} strokeLinecap="round" />
        <path d="M 962 878 L 752 1440" stroke="#3A3F4A" strokeWidth={9} strokeLinecap="round" />
      </Svg>
      <CabinFront pass={pass} wheel={0} />
      <Actor uid="r5-dad" look="azamat" f={f} place={() => dad} face={() => 0} pose={dadPose} seed={2} layer="arms" />
    </Shot>
  );
};

// ---------- C: снова за столом ----------
const DAD_SEAT: Place = { x: OFFICE.seatX, y: OFFICE.floorY, h: H.dad };
const Back: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.back;
  const s = sitDown(t, 0, 30);
  const pose = (tt: number) => {
    const ss = sitDown(tt - p.back, 0, 30);
    const reach = clamp((tt - p.back - 26) / 12);
    return {
      sit: ss.sit,
      seat: 216,
      lean: ss.lean + 8 * reach,
      expr: "calm" as const,
      lookY: 0.4 + 0.3 * reach,
      lookX: 0.15,
      armR: { target: { x: lerp(560, 520, reach), y: lerp(1160, 1250, reach) }, shape: reach > 0.6 ? ("pinch" as const) : ("relax" as const), item: reach > 0.6 ? ("pencil" as const) : ("none" as const), itemColor: C.yellow, elbow: "down" as const, behind: false },
      armL: { target: { x: 380, y: lerp(1180, 1250, s.sit) }, shape: "relax" as const, elbow: "down" as const },
    };
  };
  return (
    <Shot f={f} cam={{ x: 520, y: 1130, zoom: 1.55 }} bg="#ECEDEA">
      <OfficeBack />
      <OfficeChairBack x={DAD_SEAT.x} />
      <Actor uid="r5-dad-b" look="azamat" f={f} place={() => DAD_SEAT} face={() => 0.15} pose={pose} seed={2} layer="body" />
      <OfficeDesk />
      <OnTable x={545} y={1258} squash={0.27}>
        <BlueprintArt w={330} detail={false} />
      </OnTable>
      <Actor uid="r5-dad-b" look="azamat" f={f} place={() => DAD_SEAT} face={() => 0.15} pose={pose} seed={2} layer="arms" />
    </Shot>
  );
};

export const RouteScene: React.FC = () => {
  const { f } = useScene("route");
  const p = usePlan(routePlan);
  const shot = f >= p.back ? <Back f={f} p={p} /> : f >= p.car ? <Cabin f={f - p.car} /> : <PencilDown f={f} />;
  return (
    <AbsoluteFill>
      {shot}
      <RouteLine f={f} p={p} />
    </AbsoluteFill>
  );
};
