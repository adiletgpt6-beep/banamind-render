// Сцена 01. Хук (VO01–VO02, диктор — ни у кого рот не двигается).
// 1. С первого кадра крупно семейное приложение на телефоне: папин палец
//    отмечает утреннюю поездку «07:40 · Ата» — появляется галочка; ниже
//    поездка после уроков «13:20 · Апа» и включённые напоминания.
// 2. «…колдонмо жасады»: папа дома за ноутбуком (к камере — внешняя
//    сторона крышки), печатает, доволен; на «унутчу эмес» телефон на столе
//    мягко светится (напоминание) — папа бросает взгляд и кивает.
// 3. «Бирок бир жумадан кийин…»: крупно рука мамы берёт ключи со стола в
//    офисе — большой и указательный пальцы зажимают кольцо, связка
//    поднимается со стола и качается.
// 4. «…маселеси кайра талкууга түштү»: вечер, недописанный отчёт на экране
//    ноутбука (мигает курсор) и заголовок «Колдонмо даяр. Маселе калды.»
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { Actor, type PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { PHT_TEXT, PHT_TIME } from "../script";
import { ChairBack, LaptopFront, LIVING, LivingBack, Monitor, Mug, PhoneOnTable, TableFront } from "../sets/Living";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { COMMON, OWN, TS2 } from "../sound";
import { abs, appear, C, Finger, font, Paper, Phone, StatusBar } from "../ui/kit";
import { ReportDoc, ScheduleApp } from "../ui/screens";
import { seated, seatOf, SKIN } from "./common";

const T = PHT_TEXT;
const L = LIVING;

type Span = { readonly from: number; readonly to: number; readonly word: (i: number) => number };

// Кадры планов и действий (кадры сцены), привязанные к словам диктора.
const beats = (vo01: Span, vo02: Span) => ({
  press: 26, // палец касается строки «07:40» (до слова «үй-бүлө»)
  dad: vo01.word(3) + 10, // «колдонмо» → папа за ноутбуком
  ping: vo01.word(8) - 4, // «унутчу» — телефон на столе светится
  keys: vo02.from - 4, // «Бирок…» → рука мамы и ключи
  grab: vo02.word(2) + 2, // «жумадан» — пальцы сомкнулись на кольце
  night: vo02.word(6) - 3, // «маселеси» → вечерний экран
  title1: vo02.word(6) + 6,
  title2: vo02.word(8) - 4, // «талкууга»
});
type Beats = ReturnType<typeof beats>;

// ---------- План 1: приложение на телефоне ----------
const PH = { x: 100, y: 330, w: 880 };
// кончик пальца на галочке строки «07:40» (px кадра)
const CHECK_AT: Vec = { x: 838, y: 908 };

// Строка «Эскертүү» с включённым переключателем (напоминания включены).
const ReminderRow: React.FC<{ readonly s: number; readonly on: number }> = ({ s, on }) => (
  <div style={{ marginTop: s * 6, display: "flex", alignItems: "center", gap: s * 3, padding: `${s * 3.4}px ${s * 4}px`, borderRadius: s * 4.5, backgroundColor: "#ECEFF4" }}>
    <svg width={s * 8} height={s * 8} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={20} fill={C.navy} />
      <path d="M 20 9 C 14 9 12 14 12 18 L 12 24 L 9.5 27.5 L 30.5 27.5 L 28 24 L 28 18 C 28 14 26 9 20 9 Z" fill={C.yellow} />
      <circle cx={20} cy={30.5} r={3} fill={C.yellow} />
    </svg>
    <div style={{ flex: 1, fontSize: s * 5.2, fontWeight: 800 }}>{T.app.reminder}</div>
    <div style={{ position: "relative", width: s * 14, height: s * 7.6, borderRadius: s * 3.8, backgroundColor: on > 0.5 ? C.yellow : "#C9D0DB" }}>
      <div style={abs({ top: s * 0.8, left: s * 0.8 + on * s * 6.4, width: s * 6, height: s * 6, borderRadius: s * 3, backgroundColor: C.white, boxShadow: "0 2px 6px rgba(20,36,59,0.25)" })} />
    </div>
  </div>
);

const AppShot: React.FC<{ readonly f: number; readonly B: Beats }> = ({ f, B }) => {
  const k = appear(f, 0, 7);
  const done = clamp((f - B.press - 2) / 12);
  // палец: входит снизу справа, касается галочки строки «07:40», отходит
  const tip = keysV(
    f,
    [
      [2, { x: 1010, y: 1500 }],
      [B.press - 2, CHECK_AT],
      [B.press + 8, CHECK_AT],
      [B.press + 24, { x: 930, y: 1260 }],
    ],
    anticipate,
  );
  const press = f >= B.press - 2 && f < B.press + 5 ? 1 : 0;
  // строка «после уроков» мягко выделяется после отметки
  const hi2 = clamp((f - (B.press + 22)) / 10);
  const zoom = 1 + 0.03 * easeInOut(f / Math.max(1, B.dad));
  const sw = PH.w * 0.93;
  return (
    <Paper>
      <div style={abs({ inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 45%" })}>
        <div style={abs({ inset: 0, opacity: clamp(k * 1.4), transform: `translateY(${(1 - k) * 160}px)` })}>
          <Phone x={PH.x} y={PH.y} w={PH.w}>
            <StatusBar time="07:32" w={sw} />
            <ScheduleApp
              w={sw}
              day={0}
              dayLabel={`${T.app.today} · ДҮЙШӨМБҮ`}
              rows={[
                { time: PHT_TIME.morning, title: T.app.toSchool, who: T.app.dad, done, hi: clamp((f - B.press + 4) / 6) * (1 - hi2) },
                { time: PHT_TIME.pickup, title: T.app.fromSchool, who: T.app.mom, hi: hi2 },
              ]}
              footer={<ReminderRow s={sw / 100} on={1} />}
            />
          </Phone>
        </div>
        {f >= 2 ? <Finger x={tip.x} y={tip.y} {...SKIN.dad} angle={-14} scale={1.05} press={press} /> : null}
      </div>
    </Paper>
  );
};

// ---------- План 2: папа дома за ноутбуком ----------
const DadShot: React.FC<{ readonly f: number; readonly B: Beats }> = ({ f, B }) => {
  const dad = seated("dad", L.seat.dad);
  const lap = L.laptop;
  const phone = { x: 1176, y: L.phoneDad.y };
  // взгляд на телефон при напоминании
  const glance = (t: number) => keys(t, [[B.ping + 4, 0], [B.ping + 10, 1], [B.ping + 30, 1], [B.ping + 40, 0]]);
  // печать: кисти на клавиатуре за крышкой, «стучат» по очереди
  const typeY = (t: number, ph: number) => {
    const on = 1 - glance(t);
    return -6 * on * Math.max(0, Math.sin(t * 1.3 + ph)) - 3 * on * Math.max(0, Math.sin(t * 0.55 + ph * 2));
  };
  const pose = (t: number): PoseIn => ({
    expr: t >= B.ping + 12 ? "smile" : "softSmile",
    sit: 1,
    seat: seatOf(dad),
    lean: 4 + 1.5 * Math.sin(t / 23),
    armL: { target: { x: lap.x - 44 + 3 * Math.sin(t * 0.21), y: lap.y - 20 + typeY(t, 0) }, shape: "relax", elbow: "hang", behind: false },
    armR: { target: { x: lap.x + 44 + 3 * Math.sin(t * 0.17 + 1), y: lap.y - 20 + typeY(t, 2.1) }, shape: "relax", elbow: "hang", behind: false },
    // читает экран: короткие переводы взгляда по строкам; на напоминание — на телефон
    lookY: lerp(0.42, 0.78, glance(t)),
    lookX: (1 - glance(t)) * (Math.floor(t / 16) % 3 === 1 ? 0.18 : Math.floor(t / 16) % 3 === 2 ? -0.12 : 0),
    nod: keys(t, [[B.ping + 22, 0], [B.ping + 30, 5], [B.ping + 42, 0]]),
  });
  const face = (t: number) => keys(t, [[0, 0.05], [B.ping + 4, 0.05], [B.ping + 10, 0.4], [B.ping + 30, 0.4], [B.ping + 40, 0.08]]);
  const glow = clamp((f - B.ping) / 6) * (1 - clamp((f - B.ping - 46) / 14));
  return (
    <Shot f={f} from={B.dad} to={B.keys} cam={camMove(f, B.dad, B.keys, { x: 1084, y: 1150, zoom: 2.42 }, { x: 1088, y: 1146, zoom: 2.52 })}>
      <LivingBack minutes={10 * 60 + 25 + f / 300} />
      <ChairBack x={dad.x} />
      <Actor uid="h1-dad" look="dad" f={f} place={() => dad} face={face} pose={pose} seed={2} layer="body" />
      <TableFront />
      <Monitor x={1590} y={L.monitor.y} glow={0.3} />
      <Mug x={952} y={L.table.top + 14} />
      <PhoneOnTable x={phone.x} y={phone.y} glow={glow} />
      {/* руки — за крышкой ноутбука: клавиатура обращена к папе */}
      <Actor uid="h1-dad" look="dad" f={f} place={() => dad} face={face} pose={pose} seed={2} layer="arms" />
      <LaptopFront x={lap.x} y={lap.y} open={1} />
    </Shot>
  );
};

// ---------- План 3: рука мамы берёт ключи ----------
// Связка ключей (вид спереди): (0, 0) — верх кольца, за который держат.
// Кольцо, ключ от квартиры (латунь), ключ машины с брелоком, сердечко.
// swing — качание подвесок относительно кольца, градусы.
const RING_R = 34;
const KeyBunch: React.FC<{ readonly swing: number }> = ({ swing }) => (
  <g>
    {/* ключ машины */}
    <g transform={`rotate(${-22 + swing * 0.8} 0 ${RING_R})`}>
      <rect x={-8} y={RING_R * 2 - 6} width={16} height={26} rx={6} fill="#9AA2B0" />
      <rect x={-34} y={RING_R * 2 + 14} width={68} height={120} rx={28} fill="#2A2F3E" />
      <rect x={-24} y={RING_R * 2 + 26} width={48} height={14} rx={7} fill="#3A4152" />
      <circle cx={0} cy={RING_R * 2 + 70} r={10} fill="#596278" />
      <circle cx={0} cy={RING_R * 2 + 102} r={10} fill="#596278" />
    </g>
    {/* ключ от квартиры */}
    <g transform={`rotate(${6 + swing} 0 ${RING_R})`}>
      <path d={`M -30 ${RING_R * 2 + 34} Q -32 ${RING_R * 2 + 2} 0 ${RING_R * 2} Q 32 ${RING_R * 2 + 2} 30 ${RING_R * 2 + 34} Q 28 ${RING_R * 2 + 58} 0 ${RING_R * 2 + 60} Q -28 ${RING_R * 2 + 58} -30 ${RING_R * 2 + 34} Z`} fill="#D2AE52" stroke="#B08E3C" strokeWidth={3} />
      <circle cx={0} cy={RING_R * 2 + 20} r={8} fill="#F5F2EA" />
      <path d={`M -10 ${RING_R * 2 + 58} L 10 ${RING_R * 2 + 58} L 10 ${RING_R * 2 + 172} L 0 ${RING_R * 2 + 186} L -10 ${RING_R * 2 + 172} Z`} fill="#D2AE52" stroke="#B08E3C" strokeWidth={3} />
      <path d={`M 10 ${RING_R * 2 + 100} L 22 ${RING_R * 2 + 100} L 22 ${RING_R * 2 + 114} L 10 ${RING_R * 2 + 114} M 10 ${RING_R * 2 + 130} L 25 ${RING_R * 2 + 130} L 25 ${RING_R * 2 + 146} L 10 ${RING_R * 2 + 146}`} fill="#D2AE52" stroke="#B08E3C" strokeWidth={3} />
    </g>
    {/* брелок-сердечко на шнурке */}
    <g transform={`rotate(${34 + swing * 1.25} 0 ${RING_R})`}>
      <line x1={0} y1={RING_R * 2 - 4} x2={0} y2={RING_R * 2 + 30} stroke="#8A6E5A" strokeWidth={5} />
      <path d={`M 0 ${RING_R * 2 + 98} C -44 ${RING_R * 2 + 66} -44 ${RING_R * 2 + 34} -20 ${RING_R * 2 + 32} C -7 ${RING_R * 2 + 32} 0 ${RING_R * 2 + 42} 0 ${RING_R * 2 + 48} C 0 ${RING_R * 2 + 42} 7 ${RING_R * 2 + 32} 20 ${RING_R * 2 + 32} C 44 ${RING_R * 2 + 34} 44 ${RING_R * 2 + 66} 0 ${RING_R * 2 + 98} Z`} fill="#E5677A" stroke="#C24E62" strokeWidth={3} />
    </g>
    {/* кольцо */}
    <circle cx={0} cy={RING_R} r={RING_R} fill="none" stroke="#8E96A4" strokeWidth={10} />
    <circle cx={0} cy={RING_R} r={RING_R} fill="none" stroke="#E1E5EC" strokeWidth={3.5} strokeDasharray="30 18" />
  </g>
);

// Кисть мамы (тыльная сторона, пальцы к камере/вниз) с рукавом жакета и
// манжетой блузы. (0, 0) — точка хвата между подушечками большого и
// указательного пальцев; кисть и рука уходят вверх. grip 0…1 — пальцы
// раскрыты → сомкнуты. part: "back" — рукав, ладонь, пальцы, большой
// палец; "front" — указательный палец (поверх кольца ключей).
const MomHand: React.FC<{ readonly grip: number; readonly part: "back" | "front" }> = ({ grip, part }) => {
  const g = clamp(grip);
  const sk = SKIN.mom.skin;
  const sh = SKIN.mom.shade;
  const finger = (from: Vec, to: Vec, w: number, key: string) => (
    <g key={key}>
      <path d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} stroke={sh} strokeWidth={w + 6} strokeLinecap="round" />
      <path d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} stroke={sk} strokeWidth={w} strokeLinecap="round" />
    </g>
  );
  if (part === "front") {
    // указательный: от костяшки к кольцу (сомкнут — подушечка на кольце)
    const tip = { x: lerp(46, 10, g), y: lerp(-22, -6, g) };
    const mid = { x: lerp(44, 34, g), y: lerp(-110, -84, g) };
    return (
      <g>
        <path d={`M 40 -196 Q ${mid.x} ${mid.y} ${tip.x} ${tip.y}`} stroke={sh} strokeWidth={46} strokeLinecap="round" fill="none" />
        <path d={`M 40 -196 Q ${mid.x} ${mid.y} ${tip.x} ${tip.y}`} stroke={sk} strokeWidth={40} strokeLinecap="round" fill="none" />
        <ellipse cx={tip.x + 2} cy={tip.y + 4} rx={11} ry={8} fill="#F4D7C6" opacity={0.85} />
      </g>
    );
  }
  const curl = (len: number) => lerp(len, len * 0.5, g);
  return (
    <g>
      {/* рукав жакета (уходит за верх кадра) и манжета блузы */}
      <path d="M -122 -330 L 118 -330 L 190 -1700 L -150 -1700 Z" fill={SKIN.mom.sleeve} />
      <path d="M 50 -330 L 118 -330 L 190 -1700 L 110 -1700 Z" fill={LOOKS.mom.topShade} opacity={0.6} />
      <rect x={-112} y={-352} width={226} height={34} rx={14} fill={LOOKS.mom.inner} />
      {/* ладонь (тыльная сторона) */}
      <path d="M -96 -330 Q -122 -262 -108 -186 Q -10 -168 96 -186 Q 112 -262 98 -330 Z" fill={sk} stroke={sh} strokeWidth={3} />
      {/* средний, безымянный, мизинец — поджимаются при хвате */}
      {finger({ x: -78, y: -196 }, { x: -86, y: -196 + curl(118) }, 32, "p")}
      {finger({ x: -42, y: -200 }, { x: -44, y: -200 + curl(140) }, 36, "r")}
      {finger({ x: -4, y: -202 }, { x: -2, y: -202 + curl(150) }, 38, "m")}
      {/* костяшки */}
      <path d="M -90 -190 Q -20 -206 56 -196" fill="none" stroke={sh} strokeWidth={3} opacity={0.6} />
      {/* большой палец: снизу, к указательному */}
      {finger({ x: 92, y: -250 }, { x: lerp(124, 26, g), y: lerp(-70, 6, g) }, 42, "t")}
    </g>
  );
};

const KeysShot: React.FC<{ readonly f: number; readonly B: Beats }> = ({ f, B }) => {
  const t = f - B.keys;
  const grabT = B.grab - B.keys; // пальцы сомкнулись
  const liftT = grabT + 4;
  // точка хвата: кольцо лежит на столе → поднимается
  const ring: Vec = { x: 520, y: 1120 };
  const hand = keysV(
    t,
    [
      [0, { x: 790, y: 220 }],
      [grabT - 4, { x: ring.x + 6, y: ring.y - 4 }],
      [liftT, ring],
      [liftT + 16, { x: 590, y: 700 }],
      [liftT + 32, { x: 604, y: 684 }],
      [liftT + 50, { x: 800, y: -320 }],
    ],
    easeInOut,
  );
  const grip = keys(t, [[grabT - 7, 0], [grabT, 1]]);
  // связка: лежит на столе (повёрнута и сжата перспективой) → висит и качается
  const s = Math.max(0, t - liftT);
  const lifted = t >= liftT;
  const rot = lifted ? 72 * Math.exp(-s / 10) * Math.cos(s / 3.4) : 72;
  const squash = lifted ? lerp(0.5, 1, easeOut(s / 7)) : 0.5;
  const grow = lifted ? lerp(1, 1.1, easeOut(s / 16)) : 1;
  const keysAt = lifted ? hand : ring;
  const swing = lifted ? -10 * Math.exp(-s / 12) * Math.sin(s / 3) : 0;
  const near = 1 - clamp((ring.y - hand.y) / 240);
  const zoom = 1 + 0.025 * easeInOut(t / 60);
  const angle = lerp(-14, -8, grip);
  return (
    <div style={abs({ inset: 0, overflow: "hidden", backgroundColor: "#F2EFEA" })}>
      <div style={abs({ inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 55%" })}>
        {/* офис мамы за столом — вне фокуса: доска со стикерами, окно */}
        <div style={abs({ inset: 0, filter: "blur(9px)" })}>
          <div style={abs({ left: 640, top: 90, width: 560, height: 700, borderRadius: 10, background: "linear-gradient(180deg, #C9E0F2, #EEF2F2)", border: "18px solid #DCE2E8" })} />
          <div style={abs({ left: -60, top: 200, width: 560, height: 500, borderRadius: 14, backgroundColor: "#FFFFFF", border: "14px solid #C9D3DE" })} />
          {["#FFE59A", "#CFE3F5", "#D5EDD9", "#FFE59A", "#F6D3D0", "#CFE3F5"].map((c, i) => (
            <div key={i} style={abs({ left: -10 + (i % 3) * 170, top: 270 + Math.floor(i / 3) * 150, width: 120, height: 100, borderRadius: 8, backgroundColor: c })} />
          ))}
        </div>
        {/* столешница (вид чуть сверху) */}
        <div style={abs({ left: -80, right: -80, top: 760, bottom: -80, background: "linear-gradient(180deg, #E6E9EE, #F6F7F9 40%, #EEF0F3)" })} />
        <div style={abs({ left: -80, right: -80, top: 756, height: 8, backgroundColor: "#D6DBE2" })} />
        <svg width={1} height={1} style={abs({ left: 0, top: 0, overflow: "visible" })}>
          {/* ноутбук мамы (к камере — крышка) */}
          <path d="M -60 1010 L 330 1010 L 356 950 L -60 950 Z" fill="#BCC4D0" />
          <path d="M -60 952 L 330 952 L 312 600 L -60 600 Z" fill="#D3D9E2" stroke="#AEB7C4" strokeWidth={4} strokeLinejoin="round" />
          <circle cx={140} cy={776} r={18} fill="#C2C9D4" />
          {/* чашка */}
          <ellipse cx={930} cy={930} rx={60} ry={16} fill="rgba(20,36,59,0.10)" />
          <rect x={876} y={826} width={108} height={104} rx={16} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={3} />
          <path d="M 984 850 q 34 0 32 30 q -2 24 -32 24" fill="none" stroke="#FFFFFF" strokeWidth={11} />
          <ellipse cx={930} cy={828} rx={54} ry={13} fill="#8A5A3C" />
          {/* блокнот и ручка */}
          <g transform="rotate(-7 860 1130)">
            <rect x={720} y={1010} width={290} height={230} rx={10} fill="#3E7CC0" />
            <rect x={736} y={1022} width={258} height={206} rx={6} fill="#F7F3EA" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={760} y={1058 + i * 40} width={i === 3 ? 110 : 200} height={8} rx={4} fill="#C9D0DB" />
            ))}
          </g>
          <rect x={690} y={1150} width={180} height={14} rx={7} fill={C.navy} transform="rotate(-28 780 1157)" />
          {/* тень руки и связки на столе */}
          <ellipse cx={hand.x + 70} cy={ring.y + 50} rx={150} ry={38} fill="rgba(20,36,59,0.14)" opacity={near} style={{ filter: "blur(10px)" }} />
          <ellipse cx={keysAt.x - 30} cy={ring.y + 34} rx={120 * (0.7 + 0.3 * near)} ry={22} fill="rgba(20,36,59,0.16)" opacity={0.3 + 0.7 * near} style={{ filter: "blur(4px)" }} />
        </svg>
        {/* рука и ключи: кольцо зажато между большим и указательным пальцами */}
        <svg width={1} height={1} style={abs({ left: 0, top: 0, overflow: "visible" })}>
          <g transform={`translate(${hand.x} ${hand.y}) rotate(${angle})`}>
            <MomHand grip={grip} part="back" />
          </g>
          <g transform={`translate(${keysAt.x} ${keysAt.y}) scale(${grow} ${grow * squash}) rotate(${rot})`}>
            <KeyBunch swing={swing} />
          </g>
          <g transform={`translate(${hand.x} ${hand.y}) rotate(${angle})`}>
            <MomHand grip={grip} part="front" />
          </g>
        </svg>
      </div>
    </div>
  );
};

// ---------- План 4: вечер, недописанный отчёт ----------
const NightShot: React.FC<{ readonly f: number; readonly B: Beats }> = ({ f, B }) => {
  const t = f - B.night;
  const zoom = 1 + 0.035 * easeOut(t / 80);
  const k1 = appear(f, B.title1, 10);
  const k2 = appear(f, B.title2, 10);
  const SW = 860;
  const sx = (1080 - SW) / 2;
  const sy = 560;
  const sh = SW * 0.7;
  return (
    <div style={abs({ inset: 0, overflow: "hidden", background: "linear-gradient(180deg, #1A2134 0%, #252B42 52%, #3A2F2C 100%)" })}>
      <div style={abs({ inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 48%" })}>
        {/* тёмное окно с огнями дома напротив */}
        <div style={abs({ left: 60, top: 200, width: 400, height: 330, borderRadius: 8, background: "linear-gradient(180deg, #1E2A4C, #3F4570)", opacity: 0.55, filter: "blur(3px)" })}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={abs({ left: 40 + (i % 2) * 180, top: 150 + Math.floor(i / 2) * 80, width: 44, height: 36, backgroundColor: "#F6D48A", opacity: 0.7 })} />
          ))}
        </div>
        {/* стол */}
        <div style={abs({ left: -60, right: -60, top: 1250, bottom: -60, background: "linear-gradient(180deg, #8C6A4C, #6E523B)" })} />
        {/* свет экрана на столе и тёплая лампа справа */}
        <div style={abs({ left: 90, top: 1170, width: 900, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 30%, rgba(200,220,255,0.30), transparent 70%)" })} />
        <div style={abs({ left: 620, top: 700, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,196,120,0.22), transparent 65%)" })} />
        {/* ноутбук спереди: экран к зрителю (отдельный план-вставка) */}
        <div style={abs({ left: sx - 30, top: sy - 30, width: SW + 60, height: sh + 60, borderRadius: 30, backgroundColor: "#1C2029", boxShadow: "0 0 90px rgba(170,200,255,0.25)" })} />
        <div style={abs({ left: sx, top: sy })}>
          <ReportDoc w={SW} f={f} typed={0} evening />
        </div>
        <svg width={1} height={1} style={abs({ left: 0, top: 0, overflow: "visible" })}>
          <path d={`M ${sx - 60} ${sy + sh + 30} L ${sx + SW + 60} ${sy + sh + 30} L ${sx + SW + 130} ${sy + sh + 110} L ${sx - 130} ${sy + sh + 110} Z`} fill="#AEB6C2" />
          <path d={`M ${sx - 130} ${sy + sh + 110} L ${sx + SW + 130} ${sy + sh + 110} L ${sx + SW + 126} ${sy + sh + 124} L ${sx - 126} ${sy + sh + 124} Z`} fill="#7D8594" />
          <path d={`M ${sx + SW / 2 - 90} ${sy + sh + 70} L ${sx + SW / 2 + 90} ${sy + sh + 70} L ${sx + SW / 2 + 96} ${sy + sh + 98} L ${sx + SW / 2 - 96} ${sy + sh + 98} Z`} fill="#9EA7B4" />
        </svg>
      </div>
      {/* редакционный заголовок (не субтитр) */}
      <HookTitle k1={k1} k2={k2} />
    </div>
  );
};

// Заголовок в стиле Accent, две строки (вторая — с небольшой задержкой).
const HookTitle: React.FC<{ readonly k1: number; readonly k2: number }> = ({ k1, k2 }) => {
  if (k1 <= 0) return null;
  const [a, b] = T.hookTitle.split(". ");
  const size = 64;
  return (
    <div style={abs({ left: 90, right: 90, top: 232, display: "flex", justifyContent: "center", pointerEvents: "none" })}>
      <div
        style={{
          padding: `${size * 0.26}px ${size * 0.6}px ${size * 0.3}px`,
          borderRadius: size * 0.4,
          backgroundColor: C.white,
          color: C.navy,
          fontFamily: font,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.18,
          textAlign: "center",
          boxShadow: "0 26px 60px rgba(0,0,0,0.35)",
          borderBottom: `${size * 0.12}px solid ${C.yellow}`,
          opacity: clamp(k1 * 1.4),
          transform: `translateY(${(1 - k1) * 30}px)`,
        }}
      >
        <div>{`${a}.`}</div>
        <div style={{ height: (size * 1.18 + 2) * easeOut(k2), overflow: "hidden", opacity: clamp(k2 * 1.5) }}>{b}</div>
      </div>
    </div>
  );
};

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo01 = useLine("vo01");
  const vo02 = useLine("vo02");
  const B = beats(vo01, vo02);
  return (
    <>
      {f < B.dad ? <AppShot f={f} B={B} /> : null}
      <DadShot f={f} B={B} />
      {f >= B.keys && f < B.night ? <KeysShot f={f} B={B} /> : null}
      {f >= B.night ? <NightShot f={f} B={B} /> : null}
    </>
  );
};

// В звуке известны только границы реплик: слова — по доле длины реплики
// (доли по текущей озвучке: «колдонмо», «унутчу», «жумадан», «маселеси»…).
const W01 = [0, 0.18, 0.27, 0.32, 0.42, 0.59, 0.68, 0.73, 0.84, 0.93];
const W02 = [0, 0.06, 0.11, 0.2, 0.27, 0.36, 0.48, 0.64, 0.76, 0.86];
const spanOf = (l: { from: number; to: number }, w: readonly number[]): Span => ({ ...l, word: (i) => Math.round(l.from + w[Math.max(0, Math.min(w.length - 1, i))] * (l.to - l.from)) });

export const sound: SceneSound = (ctx) => {
  const B = beats(spanOf(ctx.line("vo01"), W01), spanOf(ctx.line("vo02"), W02));
  return [
    { at: B.press - 1, src: COMMON("tap"), volume: 0.2 },
    { at: B.dad + 2, src: OWN("keyboard"), volume: 0.1, dur: 1.4, fade: 0.25 },
    { at: B.grab + 4, src: TS2("keys"), volume: 0.22 },
  ];
};
