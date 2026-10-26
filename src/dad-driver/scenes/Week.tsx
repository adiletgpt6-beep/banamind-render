// Сцена 10. Следующая неделя (VO13).
// План А — вечер дома: папа и мама рядом за столом смотрят расписание на
// ноутбуке, спокойно, как партнёры; мама показывает на экран, папа кивает.
// План Б — календарь в стиле референса: тёмная панель «КИЙИНКИ ЖУМА»,
// пять дней; по словам рассказчика заполняются блоки папы (бирюзовые,
// долгие рабочие обсуждения) и мамы (жёлтые, встречи с клиентами); строка
// «МЕКТЕПТЕН АЛУУ» пересекается с ними — спокойная пульсация, без тревоги.
// План В — «Баланы үйдөн чоң энеси тосуп ала алат»: карточка-вставка,
// бабушка открывает дверь квартиры и приветливо встречает; плашка
// «ҮЙДӨ ЧОҢ ЭНЕСИ ТОСОТ». Ребёнок один не показан.
import { AbsoluteFill } from "remotion";
import { useCue, useSceneFrame, wordAt } from "../context";
import { appear, Board, C, Chip, fontFamily, Headline, Vignette } from "../kit";
import { Actor } from "../rig/Actor";
import { easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { ChairBacks, HOME, HomeRoom, HomeTable } from "../sets/Home";
import { Shot } from "../shots";
import { DD_TEXT } from "../script";
import { H, restOnTable, seatOf } from "./common";

const T = DD_TEXT.week;

const useBeats = () => {
  const cue = useCue("vo13");
  const w = (i: number) => wordAt(cue, i);
  return {
    cue,
    point: w(3) - 6, // «жуманын» — мама показывает на экран
    title: w(2) - 4,
    cutB: w(5) + 14, // после «карашты»
    dad: w(6), // «Атасында»
    mom: w(10), // «апасында»
    clash: w(13), // «жолугушуулар»
    cutC: w(15) - 8, // «Баланы»
    grandma: w(17), // «чоң энеси»
  };
};

export const WeekScene: React.FC = () => {
  const t = useSceneFrame();
  const b = useBeats();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      {t < b.cutB ? <ShotHome t={t} b={b} /> : <ShotCalendar t={t} b={b} />}
      {t >= b.cutC ? <GrandmaCard t={t} b={b} /> : null}
      <Headline t={t} at={b.title} lines={[[{ text: T.title.split(" ")[0] }, { text: T.title.split(" ")[1], hl: "yellow" }]]} y={150} size={92} out={b.cutB - 2} />
    </AbsoluteFill>
  );
};

type Beats = ReturnType<typeof useBeats>;

const MOM_X = 600;
const DAD_X = 860;

// Ноутбук на столе — видна крышка (экран повёрнут к родителям).
const LaptopBack: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x - 120, top: y - 150 }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 240, height: 150, borderRadius: "12px 12px 4px 4px", background: "linear-gradient(180deg, #C9D0DA, #AEB7C4)", boxShadow: "0 0 30px rgba(115,220,232,0.35)" }} />
    <div style={{ position: "absolute", left: -14, top: 146, width: 268, height: 14, borderRadius: 6, background: "#8D97A6" }} />
  </div>
);

const ShotHome: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const mom = { x: MOM_X, y: HOME.seatY, h: H.mom };
  const dad = { x: DAD_X, y: HOME.seatY, h: H.dad };
  const lap = { x: (MOM_X + DAD_X) / 2, y: HOME.table.top - 26 };
  const momPose = (f: number) => ({
    expr: EXPR.calm,
    sit: 1,
    seat: seatOf(mom),
    lean: 6,
    lookY: 0.35,
    nod: 3,
    armR: {
      target: f > b.point ? { x: lap.x - 60, y: lap.y - 120 + Math.sin((f - b.point) / 9) * 4 } : { x: mom.x + 0.11 * mom.h, y: HOME.table.top + 14 },
      shape: f > b.point ? ("point" as const) : ("relax" as const),
      elbow: f > b.point ? ("down" as const) : ("hang" as const),
      behind: false,
    },
    armL: restOnTable(mom, -1),
  });
  const dadPose = (f: number) => ({
    expr: mixExpr(EXPR.calm, EXPR.thinking, 0.4),
    sit: 1,
    seat: seatOf(dad),
    lean: 6,
    lookY: 0.35,
    nod: keys(f, [[b.point + 14, 2], [b.point + 22, 6], [b.point + 32, 2]]),
    armL: restOnTable(dad, -1, 0.08),
    armR: restOnTable(dad, 1),
  });
  const cam = { x: 730, y: 1060, zoom: lerp(1.85, 1.93, easeInOut(t / Math.max(1, b.cutB))) };
  return (
    <Shot f={t} from={-30} to={b.cutB} cam={cam} bg={C.wall}>
      <HomeRoom t={t} evening={1} />
      <ChairBacks xs={[MOM_X, DAD_X]} evening={1} />
      <Actor uid="wk-mom" look="mom" f={t} place={() => mom} face={() => 0.35} pose={momPose} seed={41} layer="body" />
      <Actor uid="wk-dad" look="dad" f={t} place={() => dad} face={() => -0.35} pose={dadPose} seed={42} layer="body" />
      <HomeTable evening={1} />
      <LaptopBack x={lap.x} y={lap.y} />
      <Actor uid="wk-mom" look="mom" f={t} place={() => mom} face={() => 0.35} pose={momPose} seed={41} layer="arms" />
      <Actor uid="wk-dad" look="dad" f={t} place={() => dad} face={() => -0.35} pose={dadPose} seed={42} layer="arms" />
      <Vignette strength={0.3} />
    </Shot>
  );
};

// Календарь: дни × блоки. Блоки — доли рабочего дня (0 — утро, 1 — вечер).
const DAYS = 5;
const DAD_BLOCKS: readonly [number, number, number][] = [
  [0, 0.08, 0.8],
  [2, 0.12, 0.86],
  [3, 0.3, 0.92],
];
const MOM_BLOCKS: readonly [number, number, number][] = [
  [1, 0.2, 0.84],
  [3, 0.04, 0.26],
  [4, 0.18, 0.9],
];
const PICKUP = 0.62; // время, когда заканчиваются уроки

const ShotCalendar: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const enter = easeOut((t - b.cutB) / 12);
  const bx = 40;
  const by = 160;
  const bw = 1000;
  const bh = 1170;
  const gx = 70;
  const gy = 170;
  const colW = (bw - gx - 40) / DAYS;
  const gh = 720;
  const yOf = (u: number) => gy + u * gh;
  const dim = 1 - 0.65 * easeInOut((t - b.cutC) / 10);
  const pulse = (k: number) => {
    const u = (t - b.clash - k * 4) / 26;
    return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0;
  };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep}, ${C.navy})` }}>
      <div style={{ position: "absolute", inset: 0, opacity: enter * dim, transform: `scale(${0.96 + 0.04 * enter})`, transformOrigin: "540px 700px" }}>
        <Board x={bx} y={by} w={bw} h={bh} t={t}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 64, color: C.light, letterSpacing: 1 }}>{T.title}</div>
          {/* дни */}
          {T.days.map((d, i) => (
            <div key={d} style={{ position: "absolute", left: gx + i * colW, top: gy - 64, width: colW, textAlign: "center", fontFamily, fontWeight: 800, fontSize: 38, color: C.cyan }}>
              {d}
            </div>
          ))}
          <svg width={bw} height={bh} style={{ position: "absolute", left: 0, top: 0 }}>
            {Array.from({ length: DAYS + 1 }, (_, i) => (
              <line key={i} x1={gx + i * colW} y1={gy - 10} x2={gx + i * colW} y2={gy + gh + 10} stroke="rgba(115,220,232,0.22)" strokeWidth={2} />
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map((u) => (
              <line key={u} x1={gx} y1={yOf(u)} x2={gx + DAYS * colW} y2={yOf(u)} stroke="rgba(115,220,232,0.12)" strokeWidth={2} />
            ))}
            {/* солнце утром, луна вечером — без точных часов */}
            <circle cx={gx - 34} cy={yOf(0.04)} r={14} fill={C.yellow} />
            <path d={`M ${gx - 40} ${yOf(0.98) - 14} a 14 14 0 1 0 14 22 a 11 11 0 1 1 -14 -22 Z`} fill={C.light} opacity={0.8} />
            {/* блоки папы */}
            {DAD_BLOCKS.map(([d, a, z], k) => {
              const u = easeOut((t - b.dad - k * 6) / 12);
              const h = (yOf(z) - yOf(a)) * u;
              return u > 0 ? (
                <g key={`d${k}`}>
                  <rect x={gx + d * colW + 14} y={yOf(a)} width={colW - 28} height={h} rx={16} fill={C.cyan} opacity={0.92} />
                  <rect x={gx + d * colW + 14} y={yOf(a)} width={colW - 28} height={Math.min(h, 10)} rx={5} fill="#FFFFFF" opacity={0.35} />
                </g>
              ) : null;
            })}
            {/* блоки мамы */}
            {MOM_BLOCKS.map(([d, a, z], k) => {
              const u = easeOut((t - b.mom - k * 6) / 12);
              const h = (yOf(z) - yOf(a)) * u;
              return u > 0 ? <rect key={`m${k}`} x={gx + d * colW + 14} y={yOf(a)} width={colW - 28} height={h} rx={16} fill={C.yellow} opacity={0.94} /> : null;
            })}
            {/* «Мектептен алуу»: время конца уроков каждый день */}
            {Array.from({ length: DAYS }, (_, d) => {
              const u = easeOut((t - b.cutB - 6 - d * 3) / 10);
              const busy = DAD_BLOCKS.some(([dd, a, z]) => dd === d && a < PICKUP && z > PICKUP) || MOM_BLOCKS.some(([dd, a, z]) => dd === d && a < PICKUP && z > PICKUP);
              const p = busy ? pulse(d) : 0;
              const x = gx + d * colW + 8;
              const y = yOf(PICKUP) - 34;
              return u > 0 ? (
                <g key={`p${d}`} opacity={u}>
                  <rect x={x} y={y} width={colW - 16} height={68} rx={18} fill="rgba(16,24,39,0.82)" stroke="#FFFFFF" strokeWidth={4 + 3 * p} />
                  {p > 0 ? <rect x={x - 6 * p} y={y - 6 * p} width={colW - 16 + 12 * p} height={68 + 12 * p} rx={22} fill="none" stroke="#FFFFFF" strokeOpacity={0.4 * p} strokeWidth={3} /> : null}
                  <SchoolMini x={x + (colW - 16) / 2} y={y + 34} />
                </g>
              ) : null;
            })}
          </svg>
          {/* легенда */}
          <div style={{ position: "absolute", left: 60, right: 40, top: gy + gh + 46, display: "flex", flexDirection: "column", gap: 14 }}>
            <Legend color={C.cyan} who={T.dadWho} what={T.dad} o={appear(t, b.dad + 4, 10)} />
            <Legend color={C.yellow} who={T.momWho} what={T.mom} o={appear(t, b.mom + 4, 10)} />
            <Legend color="outline" who="" what={T.pickup} o={appear(t, b.cutB + 12, 10)} />
          </div>
        </Board>
      </div>
    </AbsoluteFill>
  );
};

const SchoolMini: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-22} y={-8} width={44} height={22} rx={3} fill="#F6F7F9" />
    <path d="M -10 -8 L 0 -20 L 10 -8 Z" fill="#F6F7F9" />
    <rect x={-5} y={2} width={10} height={12} fill={C.tealDeep} />
  </g>
);

const Legend: React.FC<{ color: string; who: string; what: string; o: number }> = ({ color, who, what, o }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: color === "outline" ? "rgba(16,24,39,0.8)" : color,
        border: color === "outline" ? "4px solid #FFFFFF" : "none",
        flexShrink: 0,
      }}
    />
    <span style={{ fontFamily, fontWeight: 800, fontSize: 38, color: C.light, whiteSpace: "nowrap" }}>
      {who ? <span style={{ color: color === "outline" ? C.light : color }}>{who}: </span> : null}
      {what}
    </span>
  </div>
);

// Вставка: бабушка встречает дома (дверь квартиры, дневной свет).
const GrandmaCard: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const u = easeOut((t - b.cutC) / 12);
  const open = easeInOut((t - b.cutC - 6) / 16);
  const g = { x: 1700, y: HOME.seatY, h: H.grandma };
  const pose = (f: number) => ({
    expr: mixExpr(EXPR.softSmile, EXPR.smile, easeInOut((f - b.grandma) / 12)),
    lookY: 0.15,
    armL: { target: { x: g.x - 120, y: 1100 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: {
      target: { x: g.x + 120, y: lerp(1260, 1150, easeInOut((f - b.grandma) / 12)) },
      shape: f > b.grandma ? ("open" as const) : ("relax" as const),
      elbow: "out" as const,
    },
    nod: keys(f, [[b.grandma + 10, 0], [b.grandma + 18, 4], [b.grandma + 28, 0]]),
  });
  const cardW = 760;
  const cardH = 820;
  return (
    <div style={{ position: "absolute", left: 540 - cardW / 2, top: 280 + (1 - u) * 120, width: cardW, height: cardH, opacity: u }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 40, overflow: "hidden", boxShadow: `0 0 0 4px ${C.yellow}, 0 30px 70px rgba(0,0,0,0.5)` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: "translate(-1310px, -560px) scale(1)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0" }}>
            <HomeRoom t={t} doorOpen={open} />
            <Actor uid="wk-gma" look="grandma" f={t} place={() => g} face={() => -0.25} pose={pose} seed={45} />
          </div>
        </div>
      </div>
      <Chip x={cardW / 2} y={cardH + 70} t={t} at={b.grandma - 2} accent={C.yellow} size={50}>
        <span>{T.grandma}</span>
      </Chip>
    </div>
  );
};
