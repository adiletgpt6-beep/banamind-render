// Сцена 3. Почему после школы Бектур едет в офис.
// A. Схема на бумажном фоне: «Мектеп» и «Кеңсе» рядом, «Үй» дальше.
//    Оранжевая линия — привычный короткий путь школа → офис; синяя
//    пунктирная петля офис → дом → офис заметно длиннее. Без километров и
//    минут.
// B. У школы: белая машина остановилась у тротуара (нос вправо, к тротуару —
//    пассажирская сторона), папа за рулём. Бектур подходит к задней двери,
//    берётся за ручку, открывает (дверь вращается вокруг шарнира), шагает
//    к проёму.
// C. Вид через открытую дверь: он садится на заднее сиденье, пристёгивает
//    ремень и закрывает дверь (звук двери).
// D. Салон спереди: папа за рулём смотрит на дорогу, сын сзади пристёгнут.
// E. Машина подъезжает к офису и останавливается.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { NY2_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Paper, settle, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { CarSide, doorHandleAt } from "../props/Car";
import { CabinBack, CabinFront, FrontSeats, RearDoorFrame, RearSeatBack } from "../sets/CarViews";
import { H } from "./common";

export const routePlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "route");
  const school = T.to("N03") + 8; // конец схемы
  const walk: [number, number] = [school + 4, school + 70];
  const grab = walk[1] + 8;
  const open: [number, number] = [grab + 6, grab + 34];
  const step = open[1] + 6;
  const seat = step + 26; // C
  const sitDone = seat + 36;
  const belt: [number, number] = [sitDone + 4, sitDone + 30];
  const close: [number, number] = [belt[1] + 8, belt[1] + 26];
  const cabin = close[1] + 2; // D
  const arrive = cabin + 54; // E
  return {
    icons: [T.from("N03"), T.word("N03", "Кеңсе") + 10],
    home: T.word("N03", "Үйгө"),
    orange: [T.word("N03", "Атасы"), T.wordEnd("N03", "келет")] as const,
    blue: [T.word("N03", "Үйгө") + 4, T.wordEnd("N03", "кайтуу") + 6] as const,
    school,
    walk,
    grab,
    open,
    step,
    seat,
    sitDone,
    belt,
    close,
    cabin,
    arrive,
    len: T.len,
  };
};
type P = ReturnType<typeof routePlan>;

// ---------- A. Схема ----------
const ICON = {
  school: { x: 300, y: 620 },
  office: { x: 790, y: 820 },
  home: { x: 430, y: 1360 },
} as const;

const SchoolIcon: React.FC = () => (
  <g>
    <rect x={-150} y={-120} width={300} height={200} fill={C.paper} stroke={C.ink} strokeWidth={10} />
    <path d="M -170 -120 L 0 -220 L 170 -120 Z" fill={C.orange} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
    <rect x={-30} y={10} width={60} height={70} fill={C.ink} />
    {[-100, 60].map((x) => (
      <rect key={x} x={x} y={-80} width={40} height={50} fill={C.blue} />
    ))}
    <line x1={0} y1={-220} x2={0} y2={-290} stroke={C.ink} strokeWidth={8} />
    <path d="M 0 -290 L 60 -272 L 0 -254 Z" fill={C.yellow} stroke={C.ink} strokeWidth={6} />
  </g>
);
const OfficeIcon: React.FC = () => (
  <g>
    <rect x={-110} y={-230} width={220} height={310} fill={C.blue} stroke={C.ink} strokeWidth={10} />
    {[0, 1, 2, 3].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={-75 + c * 90} y={-200 + r * 66} width={60} height={40} fill={C.paper} />))}
  </g>
);
const HomeIcon: React.FC = () => (
  <g>
    <rect x={-130} y={-90} width={260} height={170} fill={C.yellow} stroke={C.ink} strokeWidth={10} />
    <path d="M -160 -90 L 0 -210 L 160 -90 Z" fill={C.paper} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
    <rect x={-30} y={0} width={60} height={80} fill={C.ink} />
  </g>
);

// длина ломаной для «рисования» линии
const pathLen = (pts: readonly { x: number; y: number }[]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);

const Diagram: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const pop = (t: number) => {
    const k = settle(t, 12);
    return { s: t < 0 ? 0 : lerp(0.4, 1, k), o: clamp(t / 4) };
  };
  const sch = pop(f - p.icons[0]);
  const off = pop(f - p.icons[1]);
  const hom = pop(f - p.home);
  // короткий путь школа → офис (оранжевый)
  const orangePts = [
    { x: ICON.school.x + 170, y: ICON.school.y + 40 },
    { x: ICON.office.x - 130, y: ICON.office.y - 40 },
  ];
  const oLen = pathLen(orangePts);
  const oK = easeInOut(clamp((f - p.orange[0]) / Math.max(10, p.orange[1] - p.orange[0])));
  // длинная петля офис → дом → офис (синий пунктир)
  const loop = `M ${ICON.office.x + 20} ${ICON.office.y + 110} C ${ICON.office.x + 120} ${ICON.office.y + 520}, ${ICON.home.x + 360} ${ICON.home.y + 260}, ${ICON.home.x + 170} ${ICON.home.y + 30} M ${ICON.home.x - 170} ${ICON.home.y - 30} C ${ICON.home.x - 420} ${ICON.home.y - 380}, ${ICON.office.x - 520} ${ICON.office.y + 300}, ${ICON.office.x - 120} ${ICON.office.y + 70}`;
  const bK = easeInOut(clamp((f - p.blue[0]) / Math.max(10, p.blue[1] - p.blue[0])));
  const label = (txt: string, x: number, y: number, o: number) => (
    <text x={x} y={y} textAnchor="middle" fontFamily={F.display} fontWeight={900} fontSize={68} fill={C.ink} opacity={o}>
      {txt}
    </text>
  );
  return (
    <AbsoluteFill>
      <Paper />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <line x1={orangePts[0].x} y1={orangePts[0].y} x2={orangePts[1].x} y2={orangePts[1].y} stroke={C.orange} strokeWidth={22} strokeLinecap="round" strokeDasharray={`${oLen * oK} ${oLen}`} />
        <path d={loop} stroke={C.blue} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="34 26" pathLength={1000} style={{ clipPath: `inset(0 0 ${(1 - bK) * 100}% 0)` }} opacity={bK > 0 ? 1 : 0} />
        <g transform={`translate(${ICON.school.x} ${ICON.school.y}) scale(${sch.s})`} opacity={sch.o}>
          <SchoolIcon />
        </g>
        {label(NY2_TEXT.labels.school, ICON.school.x, ICON.school.y + 170, sch.o)}
        <g transform={`translate(${ICON.office.x} ${ICON.office.y}) scale(${off.s})`} opacity={off.o}>
          <OfficeIcon />
        </g>
        {label(NY2_TEXT.labels.office, ICON.office.x, ICON.office.y + 170, off.o)}
        <g transform={`translate(${ICON.home.x} ${ICON.home.y}) scale(${hom.s})`} opacity={hom.o}>
          <HomeIcon />
        </g>
        {label(NY2_TEXT.labels.home, ICON.home.x, ICON.home.y + 170, hom.o)}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- B. У школы ----------
export const STREET_CAR = { x: 1150, y: 1990, s: 1.8 } as const;
const BOY_Y = 2110;
const handleWorld = (a: number) => doorHandleAt(STREET_CAR.x, STREET_CAR.y, STREET_CAR.s, a);
const DAD_IN_CAR: Place = { x: 1400, y: 1990, h: 750 };

const SchoolFacade: React.FC = () => (
  <div style={box({ left: -200, top: 0 })}>
    <div style={box({ left: 0, top: 0, width: 2800, height: 2100, backgroundColor: "#CFE0EE" })} />
    <div style={box({ left: 120, top: 620, width: 2300, height: 1300, backgroundColor: "#E9DCC7" })} />
    <div style={box({ left: 120, top: 560, width: 2300, height: 70, backgroundColor: C.orange })} />
    {Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 9 }).map((__, c) =>
        c === 4 ? null : <div key={`${r}${c}`} style={box({ left: 200 + c * 250, top: 720 + r * 320, width: 150, height: 200, backgroundColor: C.glass, border: `10px solid ${C.paper}`, boxSizing: "border-box" })} />,
      ),
    )}
    <div style={box({ left: 1140, top: 1460, width: 260, height: 460, backgroundColor: "#6B4A3A" })} />
    <div style={box({ left: 1030, top: 1320, width: 480, height: 110, backgroundColor: C.blue, color: C.paper, fontFamily: F.display, fontWeight: 900, fontSize: 84, textAlign: "center", lineHeight: "110px" })}>{NY2_TEXT.labels.school}</div>
    {/* тротуар и дорога */}
    <div style={box({ left: 0, top: 1900, width: 2800, height: 120, backgroundColor: "#8F949C" })} />
    <div style={box({ left: 0, top: 2020, width: 2800, height: 30, backgroundColor: "#C9C3B6" })} />
    <div style={box({ left: 0, top: 2050, width: 2800, height: 600, backgroundColor: "#DDD6C8" })} />
  </div>
);

const boyStreet = (p: P) => (tt: number): Place => {
  const u = cruise(clamp((tt - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.28);
  // подходит слева к задней двери; при открывании — шаг вправо за дверью;
  // затем — к проёму
  const x = lerp(140, 620, u) + keys(tt, [[p.open[0], 0], [p.open[0] + 22, 50]]) + keys(tt, [[p.open[1] + 2, 0], [p.step + 24, 150]]);
  return { x, y: BOY_Y, h: H.boy };
};

const Street: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const doorA = keys(f, [[p.open[0], 0], [p.open[1], 66]], anticipate);
  const boyPlace = boyStreet(p);
  const boyPose = (tt: number) => {
    const b = boyPlace(tt);
    const holding = tt >= p.grab && tt < p.open[0] + 20;
    const h = handleWorld(keys(tt, [[p.open[0], 0], [p.open[1], 66]], anticipate));
    const rest = { x: b.x + 0.12 * b.h, y: b.y - 0.42 * b.h };
    return {
      expr: "calm" as const,
      badge: 1,
      armR: {
        target: tt < p.grab ? keysV(tt, [[p.grab - 10, rest], [p.grab, h]], anticipate) : holding ? h : keysV(tt, [[p.open[0] + 20, h], [p.open[0] + 34, rest]], anticipate),
        shape: holding ? ("fist" as const) : ("relax" as const),
        elbow: "down" as const,
        behind: false,
      },
      armL: { target: { x: b.x - 0.12 * b.h, y: b.y - 0.42 * b.h }, shape: "relax" as const, elbow: "down" as const },
      lookY: 0.1,
    };
  };
  const boyFace = (tt: number) => (tt < p.walk[1] ? 0.6 : 0.75);
  const cam = { x: keys(f, [[p.walk[0], 640], [p.walk[1], 860]]), y: 1640, zoom: 0.95 };
  return (
    <Shot f={f} cam={cam} bg="#CFE0EE">
      <SchoolFacade />
      <CarSide x={STREET_CAR.x} y={STREET_CAR.y} s={STREET_CAR.s} layer="back" open={doorA} />
      {/* папа за рулём: виден только в окнах (ниже кузова обрезан) */}
      <div style={box({ left: 0, top: 0, width: 3000, height: 1900, overflow: "hidden" })}>
        <Actor uid="r3-dad" look="dadIT" f={f} place={() => DAD_IN_CAR} face={() => 0.7} pose={() => ({ sit: 1, seat: 114, expr: "calm", armL: { target: { x: 1540, y: 1700 }, elbow: "down" }, armR: { target: { x: 1580, y: 1710 }, elbow: "down" } })} seed={2} />
      </div>
      <CarSide x={STREET_CAR.x} y={STREET_CAR.y} s={STREET_CAR.s} layer="body" open={doorA} />
      <CarSide x={STREET_CAR.x} y={STREET_CAR.y} s={STREET_CAR.s} layer="door" open={doorA} />
      <Actor uid="r3-boy" look="bektur" f={f} place={boyPlace} face={boyFace} pose={boyPose} role="son" seed={4} blinkShift={37} walkFrom={p.walk[0] - 2} />
    </Shot>
  );
};

// ---------- C. Посадка: вид через открытую дверь ----------
const SEAT_Y = 1640;
const Belt: React.FC<{ anchor: { x: number; y: number }; to: { x: number; y: number }; lap?: { x: number; y: number } }> = ({ anchor, to, lap }) => (
  <Svg>
    <path d={`M ${anchor.x} ${anchor.y} L ${to.x} ${to.y}`} stroke="#1F2228" strokeWidth={20} strokeLinecap="round" />
    <path d={`M ${anchor.x} ${anchor.y} L ${to.x} ${to.y}`} stroke="#3A3F4A" strokeWidth={8} strokeLinecap="round" />
    {lap ? <path d={`M ${lap.x} ${lap.y} L ${to.x} ${to.y}`} stroke="#1F2228" strokeWidth={20} strokeLinecap="round" /> : null}
    <rect x={to.x - 13} y={to.y - 9} width={26} height={18} rx={4} fill="#9AA3B2" />
  </Svg>
);
const ANCHOR = { x: 300, y: 820 };
const BUCKLE = { x: 616, y: 1290 };

const Seat: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t0 = p.seat;
  const place = (tt: number): Place => ({ x: lerp(1180, 520, easeInOut(clamp((tt - t0) / 30))), y: SEAT_Y, h: 760 });
  const pull = easeInOut(clamp((f - p.belt[0]) / (p.belt[1] - p.belt[0])));
  const reach = easeInOut(clamp((f - p.belt[0] + 6) / 8));
  const beltHand = { x: lerp(ANCHOR.x + 20, BUCKLE.x, pull), y: lerp(ANCHOR.y + 60, BUCKLE.y, pull) };
  const door = easeInOut(clamp((f - p.close[0]) / (p.close[1] - p.close[0])));
  const pose = (tt: number) => {
    const u = clamp((tt - t0) / 34);
    const pl = place(tt);
    const rest = { x: pl.x + 0.1 * pl.h, y: SEAT_Y - 0.36 * pl.h };
    const reachDoor = keys(tt, [[p.close[0] - 10, 0], [p.close[0], 1], [p.close[1], 1], [p.close[1] + 8, 0]]);
    return {
      sit: easeInOut(clamp(u * 1.3 - 0.1)),
      seat: SEAT_Y - 1300,
      crouch: u < 0.6 ? 0.35 * (1 - u / 0.6) : 0,
      lean: keys(tt, [[t0, 18], [t0 + 30, 4], [t0 + 40, 0]]),
      expr: "calm" as const,
      badge: 1,
      packOff: true,
      armL: {
        // левая рука (у зрителя справа): тянется к ремню у плеча и ведёт его к замку
        target: tt >= p.belt[0] - 6 && tt < p.belt[1] + 4 ? (reach < 1 ? { x: lerp(rest.x, ANCHOR.x + 20, reach), y: lerp(rest.y, ANCHOR.y + 60, reach) } : beltHand) : rest,
        shape: tt >= p.belt[0] && tt < p.belt[1] ? ("fist" as const) : ("relax" as const),
        elbow: "down" as const,
        behind: false,
      },
      armR: { target: { x: lerp(pl.x - 0.1 * pl.h, 1000, reachDoor), y: lerp(SEAT_Y - 0.36 * pl.h, 1180, reachDoor) }, shape: reachDoor > 0.6 ? ("fist" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      lookY: 0.15,
    };
  };
  const face = (tt: number) => keys(tt, [[t0, -0.5], [t0 + 30, 0], [p.belt[0], 0.4], [p.belt[1], 0.1], [p.close[0] - 6, -0.4]]);
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3B414D">
      <RearSeatBack />
      <Actor uid="r3-boyseat" look="bektur" f={f} place={place} face={face} pose={pose} role="son" seed={4} blinkShift={37} />
      {f >= p.belt[0] ? <Belt anchor={ANCHOR} to={f < p.belt[1] ? beltHand : BUCKLE} lap={f >= p.belt[1] ? { x: 400, y: 1290 } : undefined} /> : null}
      <RearDoorFrame />
      {/* закрывающаяся дверь: белая панель входит в кадр справа */}
      {door > 0 ? <div style={box({ left: lerp(1080, -40, door), top: 0, width: 1200, height: 1920, backgroundColor: "#F7F8FA", borderLeft: "16px solid #C9D0DA" })} /> : null}
    </Shot>
  );
};

// ---------- D. Салон спереди ----------
export const CabinShot: React.FC<{ f: number; from: number }> = ({ f, from }) => {
  const k = f - from;
  const pass = k * 1.4;
  const dad: Place = { x: 830, y: 1980, h: 1180 };
  const boy: Place = { x: 470, y: 1360, h: 780 };
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3B414D">
      <CabinBack />
      <div style={box({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = ((((i * 260 - pass * 10) % 1300) + 1300) % 1300) - 200;
          return <div key={i} style={box({ left: x, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#F1E3C8", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"][i], borderRadius: i % 2 ? 80 : 6 })} />;
        })}
      </div>
      <Actor uid="c-boy" look="bektur" f={f} place={() => boy} face={() => -0.2} pose={() => ({ sit: 1, seat: 330, packOff: true, badge: 1, expr: "calm", armL: { target: { x: 430, y: 1030 }, elbow: "down" }, armR: { target: { x: 515, y: 1034 }, elbow: "down", behind: false }, lookX: -0.3 })} seed={4} blinkShift={37} />
      <Svg>
        <path d="M 392 790 L 548 1036" stroke="#1F2228" strokeWidth={18} strokeLinecap="round" />
        <path d="M 398 1034 L 548 1036" stroke="#1F2228" strokeWidth={18} strokeLinecap="round" />
        <rect x={536} y={1028} width={24} height={16} rx={4} fill="#9AA3B2" />
      </Svg>
      <div style={box({ left: 620, top: 930, width: 140, height: 180, borderRadius: "40px 40px 20px 20px", backgroundColor: "#3550D8" })} />
      <div style={box({ left: 360, top: 1056, width: 500, height: 300, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
      <FrontSeats />
      <Actor uid="c-dad" look="dadIT" f={f} place={() => dad} face={() => 0} pose={() => ({ sit: 1, seat: 780, expr: "calm", armL: { target: { x: 664, y: 1258 }, shape: "fist", elbow: "down", behind: false, wrist: -20 }, armR: { target: { x: 976, y: 1258 }, shape: "fist", elbow: "down", behind: false, wrist: 20 }, lookY: -0.05 })} seed={2} layer="body" />
      <Svg>
        <path d="M 962 878 L 752 1440" stroke="#1F2228" strokeWidth={22} strokeLinecap="round" />
        <path d="M 962 878 L 752 1440" stroke="#3A3F4A" strokeWidth={9} strokeLinecap="round" />
      </Svg>
      <CabinFront pass={pass} wheel={0} />
      <Actor uid="c-dad" look="dadIT" f={f} place={() => dad} face={() => 0} pose={() => ({ sit: 1, seat: 780, expr: "calm", armL: { target: { x: 664, y: 1258 }, shape: "fist", elbow: "down", behind: false, wrist: -20 }, armR: { target: { x: 976, y: 1258 }, shape: "fist", elbow: "down", behind: false, wrist: 20 }, lookY: -0.05 })} seed={2} layer="arms" />
    </Shot>
  );
};

// ---------- E. У офиса ----------
const Arrive: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = f - p.arrive;
  const u = easeOut(clamp(k / 30));
  const x = lerp(-700, 760, u);
  const bounce = k > 28 && k < 40 ? Math.sin(((k - 28) / 12) * Math.PI) * 3 : 0;
  return (
    <Shot f={f} cam={{ x: 820, y: 1400, zoom: 0.56 }} bg="#CFE0EE">
      <div style={box({ left: -600, top: 300, width: 3000, height: 1700, backgroundColor: "#DCE1EE" })} />
      <div style={box({ left: 300, top: 260, width: 1200, height: 1640, backgroundColor: C.blue })} />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 4 }).map((__, c) => <div key={`${r}${c}`} style={box({ left: 380 + c * 280, top: 360 + r * 260, width: 180, height: 170, backgroundColor: C.paper })} />),
      )}
      <div style={box({ left: 720, top: 1640, width: 360, height: 260, backgroundColor: "#1C2DC4" })} />
      <div style={box({ left: 640, top: 1520, width: 520, height: 100, backgroundColor: C.paper, color: C.ink, fontFamily: F.display, fontWeight: 900, fontSize: 80, textAlign: "center", lineHeight: "100px" })}>{NY2_TEXT.labels.office}</div>
      <div style={box({ left: -600, top: 1900, width: 3000, height: 120, backgroundColor: "#8F949C" })} />
      <div style={box({ left: -600, top: 2020, width: 3000, height: 700, backgroundColor: "#DDD6C8" })} />
      <CarSide x={x} y={1990} s={1.8} layer="back" />
      <CarSide x={x} y={1990} s={1.8} layer="body" wheel={u * 720} bounce={bounce} />
    </Shot>
  );
};

export const RouteScene: React.FC = () => {
  const { f } = useScene("route");
  const p = usePlan(routePlan);
  if (f < p.school) return <Diagram f={f} p={p} />;
  if (f < p.seat) return <Street f={f} p={p} />;
  if (f < p.cabin) return <Seat f={f} p={p} />;
  if (f < p.arrive) return <CabinShot f={f} from={p.cabin} />;
  return <Arrive f={f} p={p} />;
};
