// Сцена 2 (≈6–18 с). Камера «проходит» сквозь окно: дома за столом мама.
// Это её сознательное действие: она сама кладёт на стол карточки «Үй»,
// «Мектеп», «Сабактын убактысы» и думает вслух (m01), глядя в окно на
// город. Затем план сверху: она поворачивает карточки, пока не видит
// связь, — «Үй + Мектеп + Убакыт». В конце берёт со стола телефон.
import { AbsoluteFill } from "remotion";
import { appear, clamp, easeInOut, easeOut, keys, lerp, zoomLerp } from "../anim";
import { Layer, World, type Cam } from "../art/camera";
import { PlanCard, type CardKind } from "../art/cards";
import { Mountains, PanelHouse, Poplar, Sky, Win, type PanelSpec } from "../art/city";
import { TopHand } from "../art/hands";
import { Mom } from "../art/Mom";
import { Caption } from "../art/ui";
import { useLine, useSceneFrame } from "../context";
import { C } from "../palette";
import { BG30_TEXT } from "../script";

// Кадры событий (для звука).
export const TABLE = { card1: 34, card2: 88, card3: 128, cut: 156, rot1: 186, rot2: 222, rot3: 258, link: 286, phone: 318 } as const;

const WIN = { x: 250, y: 260, w: 580, h: 700 };
const FEET = { x: 540, y: 2060 };
const H = 1250;
const K = H / 1000;
const TOP = 1480; // передний край столешницы
const SEAT = 380; // высота сиденья, единицы рисунка
const u = (x: number, y: number) => ({ x: (x - FEET.x) / K, y: (y - FEET.y) / K });

const OUT_A: PanelSpec = { x: 180, y: 900, w: 300, floors: 5, cols: 3, color: C.panelC, seed: 3, floorH: 70 };
const OUT_B: PanelSpec = { x: 600, y: 900, w: 320, floors: 6, cols: 3, color: C.panelB, seed: 6, floorH: 70 };

const Outside: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Sky id="table-out" x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} />
    <Layer depth={0.2}>
      <Mountains x={150} y={420} w={800} h={260} seed={12} />
    </Layer>
    <Layer depth={0.5}>
      <PanelHouse p={OUT_A} />
      <PanelHouse p={OUT_B} />
      <Poplar x={520} y={900} h={420} sway={Math.sin(f / 40) * 1.2} />
      <Poplar x={960} y={900} h={380} sway={Math.sin(f / 37 + 1) * 1.2} />
      <rect x={100} y={900} width={900} height={80} fill={C.sidewalk} />
    </Layer>
  </g>
);

const Room: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-400} y={-200} width={1880} height={2400} fill={C.wall} />
    <rect x={-400} y={1180} width={1880} height={1000} fill={C.wallShade} />
    <Win x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} curtains clipId="table-win">
      <Outside f={f} />
    </Win>
    {/* полка с цветком */}
    <rect x={890} y={640} width={220} height={16} rx={6} fill={C.woodDark} />
    <path d="M940 640 L960 590 L1000 590 L1020 640 Z" fill="#E08E6D" />
    <ellipse cx={980} cy={560} rx={40} ry={46} fill={C.poplar} />
  </g>
);

// Стол со скатертью до пола: сидящую маму видно по пояс.
const TableTop: React.FC = () => (
  <g>
    <path d={`M60 ${TOP - 120} L1020 ${TOP - 120} L1160 ${TOP} L-80 ${TOP} Z`} fill={C.wood} />
    <rect x={-80} y={TOP} width={1240} height={40} fill={C.woodDark} />
    <rect x={-60} y={TOP + 40} width={1200} height={700} fill="#F4EBDD" />
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={-40 + i * 140} y={TOP + 40} width={8} height={700} fill="#E8DCC8" />
    ))}
  </g>
);

// Медиум: место карточки на столе (центр) и её поворот в перспективе.
const SMALL: Record<CardKind, { x: number; y: number; rot: number }> = {
  home: { x: 730, y: TOP - 64, rot: -8 },
  school: { x: 350, y: TOP - 70, rot: 7 },
  time: { x: 545, y: TOP - 34, rot: -3 },
};

const Medium: React.FC<{ readonly f: number; readonly m01: { from: number; to: number } }> = ({ f, m01 }) => {
  const T = BG30_TEXT.table.cards;
  const cam: Cam = {
    x: keys(f, [
      [0, WIN.x + WIN.w / 2],
      [40, 540],
    ]),
    y: keys(f, [
      [0, WIN.y + WIN.h * 0.5],
      [40, 1200],
      [156, 1290],
    ]),
    zoom: f < 40 ? zoomLerp(2.1, 1.0, easeInOut(f / 40)) : lerp(1.0, 1.16, clamp((f - 40) / 116)),
  };
  // руки: правая кладёт «Үй», левая — «Мектеп», правая — «Сабактын убактысы»
  const place = (at: number, d = 22) => clamp((f - at + d) / d);
  const rHome = place(TABLE.card1);
  const lSchool = place(TABLE.card2);
  const rTime = place(TABLE.card3);
  const chest = u(560, 1330);
  const armR = (() => {
    if (f < TABLE.card1 + 8) {
      const p = u(SMALL.home.x, SMALL.home.y);
      return { target: { x: lerp(chest.x + 60, p.x, easeInOut(rHome)), y: lerp(chest.y, p.y, easeInOut(rHome)) }, shape: "pinch" as const, item: f < TABLE.card1 ? ("card" as const) : ("none" as const), elbow: "down" as const };
    }
    if (f < TABLE.card3 - 24) return { target: u(760, TOP - 40), shape: "relax" as const, elbow: "down" as const };
    const p = u(SMALL.time.x + 20, SMALL.time.y);
    return { target: { x: lerp(chest.x + 40, p.x, easeInOut(rTime)), y: lerp(chest.y, p.y, easeInOut(rTime)) }, shape: "pinch" as const, item: f < TABLE.card3 ? ("card" as const) : ("none" as const), elbow: "down" as const };
  })();
  const armL = (() => {
    if (f < TABLE.card2 - 24) return { target: u(330, TOP - 40), shape: "relax" as const, elbow: "down" as const };
    const p = u(SMALL.school.x, SMALL.school.y);
    return { target: { x: lerp(chest.x - 60, p.x, easeInOut(lSchool)), y: lerp(chest.y, p.y, easeInOut(lSchool)) }, shape: "pinch" as const, item: f < TABLE.card2 ? ("card" as const) : ("none" as const), elbow: "down" as const };
  })();
  // взгляд: на карточку → в окно на город во время реплики → снова на стол
  const speaking = f >= m01.from - 4 && f <= m01.to + 6;
  const headTurn = keys(f, [
    [0, 0.15],
    [TABLE.card1, 0.2],
    [m01.from + 10, -0.25],
    [m01.to, -0.3],
    [m01.to + 20, 0],
  ]);
  const lookY = keys(f, [
    [0, 0.6],
    [m01.from + 10, -0.2],
    [m01.to, -0.15],
    [m01.to + 20, 0.6],
  ]);
  const pose = { sit: 1, seat: SEAT, armL, armR, headTurn, lookX: headTurn * 0.6, lookY, nod: lookY > 0.3 ? 6 : 0, expr: speaking ? ("thinking" as const) : ("calm" as const), lean: 4 };
  return (
    <World cam={cam} base={{ x: 540, y: 1200, zoom: 1.0 }}>
      <Room f={f} />
      <Mom uid="t-mom" f={f} x={FEET.x} y={FEET.y} h={H} pose={pose} layer="body" speaks />
      <TableTop />
      {f >= TABLE.card1 ? <PlanCard kind="home" label={T[0]} {...SMALL.home} w={180} /> : null}
      {f >= TABLE.card2 ? <PlanCard kind="school" label={T[1]} {...SMALL.school} w={180} /> : null}
      {f >= TABLE.card3 ? <PlanCard kind="time" label={T[2]} {...SMALL.time} w={180} /> : null}
      <Mom uid="t-mom" f={f} x={FEET.x} y={FEET.y} h={H} pose={pose} layer="arms" speaks />
    </World>
  );
};

// План сверху: карточки крупно, руки поворачивают их «в одну линию».
const BIG: Record<CardKind, { x: number; y: number; r0: number; at: number }> = {
  home: { x: 300, y: 860, r0: -16, at: TABLE.rot1 },
  school: { x: 780, y: 860, r0: 13, at: TABLE.rot2 },
  time: { x: 540, y: 1240, r0: -11, at: TABLE.rot3 },
};

const Overhead: React.FC<{ readonly f: number }> = ({ f }) => {
  const T = BG30_TEXT.table.cards;
  const g = f - TABLE.cut;
  const rot = (k: CardKind) => BIG[k].r0 * (1 - easeInOut((f - BIG[k].at) / 22));
  const lift = (k: CardKind) => Math.sin(Math.PI * clamp((f - BIG[k].at) / 22)) * 0.6;
  const zoom = lerp(1.06, 1.0, easeOut(g / 60));
  // активная рука — у той карточки, которую сейчас поворачивают
  const order: CardKind[] = ["home", "school", "time"];
  const cur = order.find((k) => f < BIG[k].at + 26) ?? "time";
  const c = BIG[cur];
  const r = rot(cur);
  const corner = { x: c.x + Math.cos(((r - 90) * Math.PI) / 180) * 0 + 150 * Math.cos((r * Math.PI) / 180), y: c.y + 80 + 150 * Math.sin((r * Math.PI) / 180) };
  const handIn = appear(f, TABLE.cut + 4, 14) * (1 - appear(f, BIG.time.at + 30, 14));
  const hand = { x: lerp(corner.x + 120, corner.x, handIn), y: lerp(corner.y + 500, corner.y, handIn) };
  // связи между карточками: пунктир рисуется после выравнивания
  const link = clamp((f - TABLE.link) / 24);
  // телефон: правая рука подвигает и поднимает его
  const ph = clamp((f - TABLE.phone) / 30);
  const phX = lerp(1220, 900, easeInOut(ph));
  const phY = lerp(1560, 1480, easeInOut(ph));
  const phS = 1 + 0.18 * easeInOut(clamp((f - TABLE.phone - 22) / 16));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`}>
        <rect x={-200} y={-200} width={1480} height={2320} fill={C.wood} />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M-200 ${i * 160 + 40} Q400 ${i * 160 + 70} 1280 ${i * 160 + 30}`} stroke={C.woodDark} strokeWidth={3} fill="none" opacity={0.25} />
        ))}
        {/* тетрадь и карандаш — детали стола, без еды */}
        <rect x={60} y={1420} width={300} height={380} rx={10} fill="#FFFFFF" transform="rotate(-8 210 1610)" />
        <rect x={120} y={1460} width={200} height={10} rx={5} fill="#C9D6E8" transform="rotate(-8 210 1610)" />
        <rect x={120} y={1500} width={170} height={10} rx={5} fill="#C9D6E8" transform="rotate(-8 210 1610)" />
        <rect x={700} y={420} width={260} height={16} rx={8} fill={C.yellow} transform="rotate(24 830 428)" />
        <path
          d={`M${BIG.home.x} ${BIG.home.y} L${BIG.school.x} ${BIG.school.y} L${BIG.time.x} ${BIG.time.y} Z`}
          stroke={C.yellow}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray="2 30"
          fill="none"
          opacity={link}
        />
        {order.map((k, i) => (
          <PlanCard key={k} kind={k} label={T[i]} x={BIG[k].x} y={BIG[k].y} w={360} rot={rot(k)} lift={lift(k)} glow={link} />
        ))}
        {/* «+» между карточками */}
        {link > 0
          ? [
              [(BIG.home.x + BIG.school.x) / 2, BIG.home.y],
              [(BIG.school.x + BIG.time.x) / 2 + 40, (BIG.school.y + BIG.time.y) / 2 + 20],
            ].map(([px, py], i) => (
              <g key={i} transform={`translate(${px} ${py}) scale(${easeOut(link)})`}>
                <circle r={34} fill={C.yellow} />
                <rect x={-16} y={-5} width={32} height={10} rx={5} fill={C.navy} />
                <rect x={-5} y={-16} width={10} height={32} rx={5} fill={C.navy} />
              </g>
            ))
          : null}
        {/* телефон экраном вниз → мама берёт его */}
        <g transform={`translate(${phX} ${phY}) scale(${phS}) rotate(-12)`}>
          <rect x={-110} y={-220} width={220} height={440} rx={34} fill="#1E2433" />
          <rect x={-98} y={-208} width={196} height={416} rx={26} fill="#2E3648" />
          <circle cx={-56} cy={-170} r={16} fill="#11151F" />
        </g>
        {f < BIG.time.at + 44 ? <TopHand x={hand.x} y={hand.y} angle={-20 + r * 0.5} side={1} pinch={0.2} /> : null}
        {ph > 0 ? <TopHand x={phX + 60} y={phY + 120} angle={-24} side={1} pinch={0.5} /> : null}
      </g>
    </svg>
  );
};

export const TableScene: React.FC = () => {
  const f = Math.max(0, useSceneFrame());
  const m01 = useLine("m01");
  const overhead = f >= TABLE.cut;
  const cross = clamp((f - TABLE.cut) / 8);
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall }}>
      {cross < 1 ? <Medium f={Math.min(f, TABLE.cut + 8)} m01={m01} /> : null}
      {overhead ? (
        <AbsoluteFill style={{ opacity: cross }}>
          <Overhead f={f} />
        </AbsoluteFill>
      ) : null}
      <Caption f={f} at={TABLE.link + 10} text={BG30_TEXT.table.sum} top={250} size={54} />
    </AbsoluteFill>
  );
};
