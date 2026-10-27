// Стейдж фильма 80-1-7: комната со всеми 26 персонажами, столик с глобусом и
// лампой, занавеска; три вида — комната (с камерой), «вид на модель сверху»
// и «лист сверху» (рисунок Юсуфа). Планы собираются из шкалы (shots.ts).
import { useContext, useMemo } from "react";
import { fontFamily } from "../../fonts";
import { nestingBirdPose } from "../bird/birdPose";
import { SceneContext, TimelineContext } from "../core/context";
import { box, Shot, type Cam } from "../core/shots";
import { Actor, type Place } from "../rig/Actor";
import { RoomBack, ROOM } from "../sets/Classroom";
import { CAST, TEACHER } from "./cast";
import { buildChoreo, type Choreo } from "./choreo";
import { EarthSheetContent, HouseSheet, DaySheetContent, NightSheetContent, SHEET_H, SHEET_W, pencilTip } from "./drawings";
import { GlobeView } from "./globe/GlobeView";
import { CurtainLayer, GLOBE, SHEETS, TableSet, TABLE } from "./set";
import { phiAt, type L80Timeline } from "./timeline";

export const useChoreo = (tl: L80Timeline): Choreo => useMemo(() => buildChoreo(tl), [tl]);


// ---------- комната ----------
export const RoomView: React.FC<{ readonly f: number; readonly tl: L80Timeline; readonly ch: Choreo }> = ({ f, tl, ch }) => {
  const phi = phiAt(tl, f / 30);
  const set = {
    phi,
    lamp: ch.lamp(f),
    curtain: ch.curtain(f),
    globeOnTable: ch.globeOnTable(f),
    globeLift: ch.globeLift(f),
    sheetsOnTable: ch.sheetsOnTable(f),
    blankOnTable: ch.blankOnTable(f),
    f,
  };
  // персонажи с текущим положением; порядок рисования — по y ступней
  type Item = { y: number; key: string; node: React.ReactNode };
  const items: Item[] = [];
  const mainCtl = { yusuf: ch.yusuf, amir: ch.amir, bilal: ch.bilal } as const;
  for (const p of CAST) {
    const ctl = p.main ? mainCtl[p.id as keyof typeof mainCtl] : ch.bg(p);
    const pl: Place = ctl.place(f);
    items.push({
      y: pl.y,
      key: p.id,
      node: <Actor key={p.id} uid={`r-${p.id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} role={p.main ? (p.id as "yusuf") : undefined} seed={p.seed} />,
    });
  }
  const tp = ch.teacher.place(f);
  // руки учителя поверх стола и глобуса только когда он касается модели или
  // показывает на неё; в остальное время кисти в коленях скрыты за реквизитом
  const front = ch.teacherArmsFront(f);
  items.push({ y: tp.y, key: "teacher", node: <Actor key="teacher" uid="r-teacher" look={TEACHER.look} f={f} place={ch.teacher.place} face={ch.teacher.face} pose={ch.teacher.pose} role="muhammad" seed={3} layer={front ? "body" : "all"} /> });
  items.push({ y: TABLE.top + 1, key: "table", node: <TableSet key="table" s={set} /> });
  if (front) items.push({ y: TABLE.top + 2, key: "teacher-arms", node: <Actor key="teacher-arms" uid="r-teacher" look={TEACHER.look} f={f} place={ch.teacher.place} face={ch.teacher.face} pose={ch.teacher.pose} role="muhammad" seed={3} layer="arms" /> });
  // рисунок на столе: чистый лист превращается в рисунок Земли в руках Юсуфа
  const len = ch.earthLen(f);
  if (!ch.blankOnTable(f) && f >= ch.events.sheetTaken) {
    items.push({ y: TABLE.top + 1.5, key: "earth", node: <HouseSheet key="earth" kind="blank" x={SHEETS.blank.x + 40} y={SHEETS.blank.y - 4} w={150} rot={-3} flat earthLen={Math.max(0.01, len)} /> });
  }
  // листы в руках Юсуфа (сцена 1)
  const sh = ch.yusufSheets(f);
  if (sh) {
    items.push({ y: ROOM.rowY[0] + 1, key: "sheets", node: (
      <div key="sheets">
        <HouseSheet kind="day" x={sh.day.x} y={sh.day.y} w={118} rot={sh.angleDay} />
        <HouseSheet kind="night" x={sh.night.x} y={sh.night.y} w={118} rot={sh.angleNight} />
      </div>
    ) });
  }
  // карандаш в руке Юсуфа/Амира (сцена 8)
  const hand = ch.drawingHand(f);
  if (hand) {
    const tip = DRAW_TIP(len);
    items.push({ y: TABLE.top + 3, key: "pencil", node: <Pencil key="pencil" x={tip.x} y={tip.y} /> });
  }
  items.sort((a, b) => a.y - b.y);
  return (
    <>
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} />
      <CurtainLayer curtain={set.curtain} />
      {items.map((i) => i.node)}
    </>
  );
};

const DRAW_TIP = (len: number) => {
  const tip = pencilTip(len);
  const kx = 150 / SHEET_W;
  return { x: SHEETS.blank.x + 40 + (tip.x - SHEET_W / 2) * kx, y: SHEETS.blank.y - 4 + (tip.y - SHEET_H / 2) * kx * 0.26 };
};

const Pencil: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <g transform="rotate(-55)">
      <rect x={-3} y={-54} width={6} height={50} fill="#F2C53D" stroke="#B88A1C" strokeWidth={1} />
      <path d="M -3 -4 L 0 4 L 3 -4 Z" fill="#E6CFA3" />
      <path d="M -1 1 L 0 4 L 1 1 Z" fill="#2B2B2B" />
      <rect x={-3} y={-58} width={6} height={5} fill="#E88B8B" />
    </g>
  </svg>
);

// ---------- вид на модель сверху ----------
export const TopView: React.FC<{ readonly f: number; readonly tl: L80Timeline; readonly ch: Choreo; readonly caption?: boolean }> = ({ f, tl, ch, caption = true }) => {
  const phi = phiAt(tl, f / 30);
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: "#8F6A47" })}>
      <svg width={1920} height={1080}>
        <defs>
          <radialGradient id="l817-topwood" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0" stopColor="#C09468" />
            <stop offset="1" stopColor="#8A6240" />
          </radialGradient>
          <linearGradient id="l817-topcone" x1="1" x2="0">
            <stop offset="0" stopColor="#FFE9B5" stopOpacity={0.45} />
            <stop offset="1" stopColor="#FFE9B5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#l817-topwood)" />
        {/* волокна дерева */}
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M 0 ${60 + i * 75} Q 960 ${40 + i * 75 + (i % 3) * 18} 1920 ${70 + i * 75}`} stroke="#6E4C31" strokeOpacity={0.18} strokeWidth={3} fill="none" />
        ))}
        {/* конус света от лампы к шару (вид сверху) */}
        <path d="M 1500 470 L 1200 340 L 1200 740 L 1500 610 Z" fill="url(#l817-topcone)" opacity={ch.lamp(f)} />
        {/* тень шара на столе */}
        <ellipse cx={940} cy={560} rx={372} ry={366} fill="#000" opacity={0.18} />
        <GlobeView uid="top-globe" cx={960} cy={540} r={360} phi={phi} view="top" lamp={ch.lamp(f)} pathHint stand={false} />
        {/* лампа сверху: колпак направлен влево, основание справа */}
        <g>
          <ellipse cx={1660} cy={540} rx={64} ry={64} fill="#3C4350" />
          <ellipse cx={1660} cy={540} rx={50} ry={50} fill="#596274" />
          <path d="M 1660 540 L 1560 540" stroke="#4A5160" strokeWidth={14} strokeLinecap="round" />
          <path d="M 1570 480 L 1500 460 L 1500 620 L 1570 600 Z" fill="#55607A" />
          <rect x={1494} y={452} width={10} height={176} rx={4} fill={ch.lamp(f) > 0 ? "#FFF2C8" : "#2E3440"} />
        </g>
        {caption ? (
          <g>
            <rect x={660} y={960} width={600} height={70} rx={16} fill="#1E2A44" opacity={0.78} />
            <text x={960} y={1008} textAnchor="middle" fontFamily={fontFamily} fontSize={38} fontWeight={700} fill="#FFFFFF">Вид на модель сверху</text>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

// Маленькая вставка «вид сверху» в углу кадра.
export const TopInset: React.FC<{ readonly f: number; readonly tl: L80Timeline; readonly ch: Choreo; readonly opacity?: number }> = ({ f, tl, ch, opacity = 1 }) => {
  const phi = phiAt(tl, f / 30);
  const S = 400;
  return (
    <div style={box({ left: 44, top: 44, width: S, height: S + 48, borderRadius: 22, overflow: "hidden", opacity, boxShadow: "0 10px 30px rgba(20,20,40,0.35)", border: "4px solid #FBF7F0" })}>
      <svg width={S} height={S + 48}>
        <rect x={0} y={0} width={S} height={S + 48} fill="#A3784F" />
        <path d={`M ${S * 0.95} ${S * 0.5} L ${S * 0.56} ${S * 0.3} L ${S * 0.56} ${S * 0.7} Z`} fill="#FFE9B5" opacity={0.4 * ch.lamp(f)} />
        <GlobeView uid="inset-globe" cx={S * 0.47} cy={S * 0.5} r={S * 0.4} phi={phi} view="top" lamp={ch.lamp(f)} pathHint stand={false} markScale={1.15} />
        <circle cx={S * 0.95} cy={S * 0.5} r={S * 0.06} fill="#596274" />
        <rect x={0} y={S} width={S} height={48} fill="#1E2A44" opacity={0.85} />
        <text x={S / 2} y={S + 33} textAnchor="middle" fontFamily={fontFamily} fontSize={26} fontWeight={700} fill="#FFFFFF">Вид на модель сверху</text>
      </svg>
    </div>
  );
};

// ---------- лист сверху (рисунок Юсуфа) ----------
export const PaperView: React.FC<{ readonly f: number; readonly ch: Choreo; readonly finished?: boolean }> = ({ f, ch, finished = false }) => {
  const len = ch.earthLen(f);
  const hand = finished ? null : ch.drawingHand(f);
  const tip = pencilTip(len);
  const k = 2.9; // масштаб листа
  const sx = 700;
  const sy = 180;
  const tipX = sx + tip.x * k;
  const tipY = sy + tip.y * k;
  const sleeve = hand === "amir" ? "#3E6FB5" : "#F2C53D";
  const skin = hand === "amir" ? "#EBBE9A" : "#E8B48D";
  // рука заходит с правого нижнего края листа; при паузе карандаш чуть приподнят
  const drawing = ch.events.drawSpans.some((s) => f >= s.from && f <= s.to);
  const lift = drawing ? 0 : 10;
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: "#8F6A47" })}>
      <svg width={1920} height={1080}>
        <rect x={0} y={0} width={1920} height={1080} fill="#A3784F" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M 0 ${50 + i * 90} Q 960 ${30 + i * 90 + (i % 3) * 18} 1920 ${60 + i * 90}`} stroke="#6E4C31" strokeOpacity={0.16} strokeWidth={3} fill="none" />
        ))}
        {/* рядом — те же два рисунка дома */}
        <g transform="translate(120 250) rotate(-6) scale(1.5)">
          <DaySheetContent />
        </g>
        <g transform="translate(250 620) rotate(5) scale(1.5)">
          <NightSheetContent />
        </g>
        {/* лист с рисунком Земли */}
        <g transform={`translate(${sx} ${sy}) rotate(1.5) scale(${k})`} style={{ filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.22))" }}>
          <EarthSheetContent len={len} />
        </g>
        {hand ? (
          <g transform={`translate(${tipX} ${tipY - lift})`}>
            {/* карандаш: кончик в точке пути, тень под рукой */}
            <g transform="rotate(38)">
              <rect x={-9} y={-250} width={18} height={226} fill="#F2C53D" stroke="#B88A1C" strokeWidth={2} />
              <path d="M -9 -24 L 0 2 L 9 -24 Z" fill="#E6CFA3" />
              <path d="M -3 -8 L 0 2 L 3 -8 Z" fill="#2B2B2B" />
              <rect x={-9} y={-262} width={18} height={14} fill="#E88B8B" />
            </g>
            {/* кисть, держащая карандаш (вид сверху): пальцы у кончика, запястье и рукав ниже справа */}
            <g transform="translate(70 120) rotate(38)">
              <ellipse cx={0} cy={0} rx={62} ry={78} fill={skin} stroke="#C9956F" strokeWidth={2} />
              <ellipse cx={-42} cy={-52} rx={22} ry={44} fill={skin} stroke="#C9956F" strokeWidth={2} transform="rotate(-25 -42 -52)" />
              <ellipse cx={-12} cy={-70} rx={16} ry={40} fill={skin} stroke="#C9956F" strokeWidth={2} transform="rotate(-8 -12 -70)" />
              <ellipse cx={16} cy={-62} rx={15} ry={34} fill={skin} stroke="#C9956F" strokeWidth={2} transform="rotate(8 16 -62)" />
              <rect x={-70} y={60} width={140} height={260} rx={44} fill={sleeve} />
              <rect x={-70} y={56} width={140} height={28} rx={10} fill={skin} />
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

// ---------- план комнаты с камерой ----------
export const RoomShot: React.FC<{ readonly f: number; readonly tl: L80Timeline; readonly ch: Choreo; readonly cam: Cam; readonly overlay?: React.ReactNode }> = ({ f, tl, ch, cam, overlay }) => (
  <Shot f={f} from={-1} to={Number.MAX_SAFE_INTEGER} cam={cam} bg="#F1E7D6" overlay={overlay}>
    <RoomView f={f} tl={tl} ch={ch} />
  </Shot>
);

export const useFilm = () => {
  const tl = useContext(TimelineContext) as L80Timeline;
  const sc = useContext(SceneContext);
  return { tl, sc };
};
export { GLOBE };
