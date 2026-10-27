// «Үй-бүлөлүк диспетчердик» — кыялдагы пульт (мировые координаты кухни:
// x 0…1600, y −250…2700). Пульт — фантазия: тёмно-синие панели с лампами,
// приборами и большими кнопками. При раскрытии (reveal) панели сначала
// «выцветают» в картон с рисунком маркером (paper), затем складываются, как
// бумага, вниз по сгибу (fold), а стол-пульт сжимается в картонную коробку
// на обычном кухонном столе (CardboardBox). Всё детерминировано от времени.
import { interpolate } from "remotion";
import { fontFamily } from "../fonts";
import {
  CARD,
  CARD_DARK,
  CARD_LIGHT,
  LAMP_AMBER,
  LAMP_BLUE,
  LAMP_GREEN,
  LAMP_PINK,
  LAMP_RED,
  MARKER,
  NAVY,
  PANEL,
  PANEL_DARK,
  PANEL_LIGHT,
  YELLOW,
} from "../palette";
import { B48_TEXT } from "../script";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const f1 = (n: number) => n.toFixed(1);

// смешение двух цветов #RRGGBB
export const mix = (a: string, b: string, k: number) => {
  const p = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const q = Math.max(0, Math.min(1, k));
  const ch = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * q));
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

export type ButtonId = "mektep" | "jumush" | "jol" | "jyiyn" | "phone";

export type ConsoleState = {
  readonly t: number; // секунды (мигание ламп, катушки)
  readonly paper: number; // 0 — глянцевая фантазия … 1 — картон с маркером
  readonly fold: number; // 0 — стоит … 1 — сложено (стенные панели)
  readonly shrink: number; // 0 — большой стол-пульт … 1 — сжат в коробку
  readonly alarm: number; // 0…1 — мягкая янтарная тревога (лампы пульсируют)
  readonly go: number; // 0…1 — «операция начата»: зелёные огни
  readonly press: Partial<Record<ButtonId, number>>; // 0…1 — глубина нажатия
  readonly book: number; // 0…1 — учебник выскакивает из люка «МЕКТЕП»
  readonly phone: number; // 0…1 — телефон выезжает и звонит
  readonly laptop: number; // 0…1 — ноутбук раскрывается («Жолугушуу 13:00»)
  readonly cardA: number; // 0…1 — карточка «13:00 Мектеп бүтөт» на табло
  readonly cardB: number; // 0…1 — карточка «13:00 Жумуштагы жолугушуу»
  readonly bump: number; // 0…1 — столкновение карточек (покачивание)
  readonly rush: number; // 0…1 — стрелка «ШАШУУ»
  readonly calm: number; // 0…1 — стрелка «ТЫНЧТЫК»
  readonly ticker: number; // 0…1 — лента принтера «13:00 = 13:00 ?!»
  readonly spring: number; // 0…1 — пружина-хлопушка из «ЖЫЙЫН»
  readonly mission: number; // 0…1 — экран «ОПЕРАЦИЯ»
  readonly split: number; // 0…1 — на экране бумажная мама растягивается между школой и работой
  readonly fingers: number; // 0…1 — детские пальцы выталкивают ленту принтера (подсказка)
};

// Принтер на столе-пульте (центр щели): лента поднимается вверх, к папе.
export const PRINTER = { x: 440, y: 1318 } as const;

export const CONSOLE_IDLE: ConsoleState = {
  t: 0,
  paper: 0,
  fold: 0,
  shrink: 0,
  alarm: 0,
  go: 0,
  press: {},
  book: 0,
  phone: 0,
  laptop: 0,
  cardA: 0,
  cardB: 0,
  bump: 0,
  rush: 0.18,
  calm: 0.8,
  ticker: 0,
  spring: 0,
  mission: 0,
  split: 0,
  fingers: 0,
};

// Положение кнопок на столе-пульте (центр, радиус) — по ним кисти героев
// и лапа кота точно попадают в кнопку.
export const BUTTONS: Record<ButtonId, { readonly x: number; readonly y: number; readonly r: number; readonly color: string; readonly label?: string }> = {
  jol: { x: 680, y: 1262, r: 44, color: LAMP_GREEN, label: B48_TEXT.console.buttons[2] },
  mektep: { x: 900, y: 1262, r: 48, color: YELLOW, label: B48_TEXT.console.buttons[0] },
  phone: { x: 1022, y: 1248, r: 30, color: LAMP_RED },
  jumush: { x: 1150, y: 1262, r: 48, color: LAMP_BLUE, label: B48_TEXT.console.buttons[1] },
  jyiyn: { x: 1390, y: 1262, r: 44, color: LAMP_PINK, label: B48_TEXT.console.buttons[3] },
};

// Цвет панели: глянцевый синий → картон.
const warm = (c: string, paper: number) => mix(c, "#FFF1D6", 0.45 * Math.sin(Math.PI * Math.max(0, Math.min(1, paper))));
const panelFill = (paper: number, shade = 0) => warm(mix(shade < 0 ? PANEL_DARK : shade > 0 ? PANEL_LIGHT : PANEL, shade < 0 ? CARD_DARK : shade > 0 ? CARD_LIGHT : CARD, paper), paper);
const inkFill = (paper: number, glossy: string) => mix(glossy, MARKER, paper);

// Лампа: мягкое свечение, без резких вспышек.
const Lamp: React.FC<{ x: number; y: number; r: number; color: string; on: number; paper: number }> = ({ x, y, r, color, on, paper }) => {
  const lit = on * (1 - paper);
  return (
    <g>
      {lit > 0.05 ? <circle cx={x} cy={y} r={r * 2.1} fill={color} opacity={0.18 * lit} /> : null}
      <circle cx={x} cy={y} r={r} fill={mix(mix("#4A5A80", color, 0.35 + 0.65 * on), "#F5E6C8", paper)} stroke={inkFill(paper, "#0E1E40")} strokeWidth={paper > 0.5 ? 3 : 2} />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.32} fill="#FFFFFF" opacity={0.35 * on * (1 - paper)} />
    </g>
  );
};

// Стрелочный прибор: значение 0…1 → −60°…+60°, красная зона справа.
const Gauge: React.FC<{ x: number; y: number; r: number; value: number; label: string; paper: number; red?: boolean; t: number }> = ({ x, y, r, value, label, paper, red, t }) => {
  const jitter = red ? Math.sin(t * 23) * 0.012 * value : 0;
  const a = ((-60 + 120 * Math.max(0, Math.min(1.05, value + jitter))) * Math.PI) / 180;
  const arc = (from: number, to: number, rr: number) => {
    const p = (deg: number) => [x + rr * Math.sin((deg * Math.PI) / 180), y - rr * Math.cos((deg * Math.PI) / 180)];
    const [ax, ay] = p(from);
    const [bx, by] = p(to);
    return `M ${f1(ax)} ${f1(ay)} A ${rr} ${rr} 0 0 1 ${f1(bx)} ${f1(by)}`;
  };
  return (
    <g>
      <circle cx={x} cy={y} r={r + 10} fill={mix("#0F2147", CARD_DARK, paper)} />
      <circle cx={x} cy={y} r={r} fill={mix("#F4F7FF", "#F6E7C8", paper)} />
      <path d={arc(-60, 20, r * 0.78)} stroke={mix(LAMP_GREEN, MARKER, paper)} strokeWidth={r * 0.12} fill="none" opacity={0.8} />
      <path d={arc(20, 60, r * 0.78)} stroke={mix(red ? LAMP_RED : LAMP_AMBER, MARKER, paper)} strokeWidth={r * 0.12} fill="none" opacity={0.85} />
      {[-60, -30, 0, 30, 60].map((d) => {
        const ca = (d * Math.PI) / 180;
        return (
          <line
            key={d}
            x1={x + Math.sin(ca) * r * 0.6}
            y1={y - Math.cos(ca) * r * 0.6}
            x2={x + Math.sin(ca) * r * 0.7}
            y2={y - Math.cos(ca) * r * 0.7}
            stroke={inkFill(paper, NAVY)}
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
      <line x1={x} y1={y} x2={x + Math.sin(a) * r * 0.74} y2={y - Math.cos(a) * r * 0.74} stroke={mix(LAMP_RED, MARKER, paper)} strokeWidth={7} strokeLinecap="round" />
      <circle cx={x} cy={y} r={r * 0.1} fill={inkFill(paper, NAVY)} />
      <text x={x} y={y + r * 0.42} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={r * 0.24} fill={inkFill(paper, NAVY)}>
        {label}
      </text>
    </g>
  );
};

// Катушка «старого компьютера» — крутится.
const Reel: React.FC<{ x: number; y: number; r: number; a: number; paper: number }> = ({ x, y, r, a, paper }) => (
  <g transform={`rotate(${f1(a)} ${x} ${y})`}>
    <circle cx={x} cy={y} r={r} fill={mix("#C9D4EC", "#EED9B0", paper)} stroke={inkFill(paper, "#0E1E40")} strokeWidth={4} />
    {[0, 120, 240].map((d) => (
      <circle key={d} cx={x + Math.cos((d * Math.PI) / 180) * r * 0.52} cy={y + Math.sin((d * Math.PI) / 180) * r * 0.52} r={r * 0.22} fill={panelFill(paper, -1)} />
    ))}
    <circle cx={x} cy={y} r={r * 0.14} fill={inkFill(paper, NAVY)} />
  </g>
);

// Складывание панели «как бумага» вниз по сгибу (нижний край — петля).
// k 0…1; по мере сгиба панель темнеет, у сгиба остаётся складка.
const Fold: React.FC<{ k: number; hingeY: number; x0: number; x1: number; children: React.ReactNode }> = ({ k, hingeY, x0, x1, children }) => {
  if (k >= 0.999) return null;
  const s = Math.cos((k * Math.PI) / 2);
  return (
    <g>
      <g transform={`translate(0 ${f1(hingeY)}) scale(1 ${f1(Math.max(0.001, s))}) translate(0 ${f1(-hingeY)})`} opacity={1 - 0.2 * Math.sin(k * Math.PI)}>
        {children}
      </g>
      {/* складка у сгиба */}
      {k > 0.02 ? <rect x={x0} y={hingeY - 6} width={x1 - x0} height={10} rx={5} fill={CARD_DARK} opacity={Math.min(1, k * 3)} /> : null}
    </g>
  );
};

// ---------- Стена фантазии (позади героев) ----------
// Раскладка под вертикальный кадр: баннер с названием (y 500…620), над
// головами — свободная полоса для субтитров (y 630…750), ниже — экраны:
// часы, табло расписания, «ОПЕРАЦИЯ» (y 760…990), по бокам — башни.
// Подсказки, что это поделка: малярный скотч на углах, звёздочка маркером.
const Tape: React.FC<{ x: number; y: number; a: number; paper: number }> = ({ x, y, a, paper }) => (
  <rect x={x - 34} y={y - 11} width={68} height={22} rx={3} fill="#F3E7C4" opacity={0.55 + 0.4 * paper} transform={`rotate(${a} ${x} ${y})`} />
);

export const ConsoleWall: React.FC<{ readonly s: ConsoleState }> = ({ s }) => {
  const { t, paper } = s;
  if (s.fold >= 0.999) return null;
  // панели складываются по очереди, как страницы книжки-раскладушки
  const k = (i: number) => interpolate(s.fold, [i * 0.1, 0.5 + i * 0.1], [0, 1], clamp);
  const blinkSeq = (i: number, n: number) => 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.6 - (i / n) * Math.PI * 2));
  const alarmPulse = s.alarm * (0.6 + 0.4 * Math.sin(t * 4.4));
  const reelA = t * 70 + s.alarm * t * 160;
  const wob = Math.sin(s.bump * Math.PI * 3) * (1 - s.bump) * 6;
  const cardW = 330;
  const boardX = 605;
  const boardY = 760;
  const sw = paper > 0.5 ? 6 : 3;
  return (
    <g>
      {/* тёмная подложка комнаты управления (под кухней) */}
      <g opacity={1 - interpolate(s.fold, [0.25, 0.9], [0, 1], clamp)}>
        <rect x={-400} y={-600} width={2400} height={1900} fill={warm(mix("#1A2C55", "#E9D2A8", paper), paper)} />
        {Array.from({ length: 40 }, (_, i) => {
          const x = 30 + ((i * 173) % 1540);
          const y = -200 + ((i * 97) % 660);
          return <circle key={i} cx={x} cy={y} r={5} fill={i % 3 === 0 ? LAMP_BLUE : i % 3 === 1 ? YELLOW : LAMP_GREEN} opacity={(0.25 + 0.4 * blinkSeq(i, 9)) * (1 - paper)} />;
        })}
        {/* гофрокартон по краю — подсказка */}
        <rect x={-400} y={1236} width={2400} height={14} fill={CARD_DARK} opacity={0.7} />
      </g>
      {/* левая башня с катушками */}
      <Fold k={k(0)} hingeY={1240} x0={10} x1={230}>
        <rect x={20} y={500} width={200} height={740} rx={24} fill={panelFill(paper, -1)} stroke={inkFill(paper, "#0B1834")} strokeWidth={sw} />
        <Reel x={120} y={610} r={66} a={reelA} paper={paper} />
        <Reel x={120} y={780} r={66} a={-reelA * 0.8} paper={paper} />
        {Array.from({ length: 6 }, (_, i) => (
          <Lamp key={i} x={70 + (i % 2) * 100} y={900 + Math.floor(i / 2) * 64} r={17} color={i % 2 ? LAMP_GREEN : LAMP_AMBER} on={Math.max(blinkSeq(i, 6), alarmPulse)} paper={paper} />
        ))}
        <rect x={50} y={1100} width={140} height={110} rx={14} fill={panelFill(paper, 1)} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={64} y={1114 + i * 24} width={112 * (0.4 + 0.6 * Math.abs(Math.sin(t * (1.1 + i * 0.3) + i)))} height={14} rx={7} fill={mix(LAMP_BLUE, MARKER, paper)} opacity={0.9} />
        ))}
        <Tape x={36} y={510} a={-30} paper={paper} />
      </Fold>
      {/* правая башня с мягкой мигалкой */}
      <Fold k={k(1)} hingeY={1240} x0={1370} x1={1590}>
        <rect x={1380} y={500} width={200} height={740} rx={24} fill={panelFill(paper, -1)} stroke={inkFill(paper, "#0B1834")} strokeWidth={sw} />
        <Reel x={1480} y={610} r={66} a={-reelA} paper={paper} />
        {Array.from({ length: 6 }, (_, i) => (
          <Lamp key={i} x={1430 + (i % 2) * 100} y={740 + Math.floor(i / 2) * 64} r={17} color={i % 2 ? LAMP_BLUE : LAMP_PINK} on={Math.max(blinkSeq(i + 3, 6), alarmPulse)} paper={paper} />
        ))}
        <path d="M 1440 1060 Q 1440 1000 1480 1000 Q 1520 1000 1520 1060 Z" fill={mix(mix("#7A6A50", LAMP_AMBER, 0.3 + 0.7 * alarmPulse), "#F2D79A", paper)} />
        {alarmPulse > 0.05 && paper < 0.9 ? <circle cx={1480} cy={1035} r={74} fill={LAMP_AMBER} opacity={0.2 * alarmPulse * (1 - paper)} /> : null}
        <rect x={1430} y={1060} width={100} height={22} rx={6} fill={inkFill(paper, "#0B1834")} />
        {/* звёздочка, нарисованная фломастером — подсказка */}
        <path d="M 1480 1150 l 10 22 l 24 2 l -18 16 l 6 24 l -22 -13 l -22 13 l 6 -24 l -18 -16 l 24 -2 Z" fill="none" stroke={mix("#FFE58A", MARKER, paper)} strokeWidth={4} strokeLinejoin="round" />
      </Fold>
      {/* главный баннер с названием */}
      <Fold k={k(2)} hingeY={630} x0={150} x1={1450}>
        <rect x={170} y={500} width={1260} height={124} rx={34} fill={panelFill(paper)} stroke={mix(YELLOW, MARKER, paper)} strokeWidth={8} />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={230 + i * 87} cy={517} r={7} fill={i % 2 ? YELLOW : LAMP_BLUE} opacity={(0.3 + 0.7 * blinkSeq(i, 14)) * (1 - paper)} />
        ))}
        <text x={800} y={580} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={48} letterSpacing={1} fill={mix("#FFFFFF", MARKER, paper)}>
          {B48_TEXT.console.title}
        </text>
        <Tape x={190} y={510} a={-35} paper={paper} />
        <Tape x={1410} y={512} a={32} paper={paper} />
      </Fold>
      {/* левый экран: «эквалайзер» и маленькие часы 08:00 */}
      <Fold k={k(3)} hingeY={1000} x0={220} x1={530}>
        <rect x={230} y={760} width={290} height={230} rx={26} fill={panelFill(paper, -1)} stroke={mix(LAMP_BLUE, MARKER, paper)} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => {
          const h = 30 + 110 * Math.abs(Math.sin(t * (2.1 + (i % 4) * 0.4) + i * 1.3)) * (1 + s.alarm * 0.4);
          return <rect key={i} x={262 + i * 26} y={f1(960 - Math.min(150, h))} width={16} height={f1(Math.min(150, h))} rx={6} fill={mix(i % 3 === 0 ? YELLOW : LAMP_GREEN, MARKER, paper)} opacity={0.9} />;
        })}
        <text x={300} y={800} fontFamily={fontFamily} fontWeight={1000} fontSize={30} fill={mix("#BFD3FF", MARKER, paper)}>
          08:00
        </text>
      </Fold>
      {/* центральное табло расписания: две карточки 13:00 въезжают в одну строку */}
      <Fold k={k(4)} hingeY={1010} x0={595} x1={1005}>
        <rect x={boardX} y={boardY} width={390} height={250} rx={26} fill={panelFill(paper, -1)} stroke={mix(YELLOW, MARKER, paper)} strokeWidth={5} />
        <rect x={boardX + 16} y={boardY + 16} width={358} height={218} rx={18} fill={mix("#0B1834", "#F3E2BF", paper)} />
        {[
          { k: s.cardA, from: -1, c: YELLOW, row: B48_TEXT.console.board[0] },
          { k: s.cardB, from: 1, c: LAMP_BLUE, row: B48_TEXT.console.board[1] },
        ].map((c, i) => {
          if (c.k <= 0) return null;
          // вторая карточка наезжает на первую — одно и то же время
          const x = boardX + 22 + (1 - c.k) * c.from * 440 + (i ? 22 : 0) + wob * (i ? 1 : -1);
          const y = boardY + 26 + (i ? 96 : 0) + Math.abs(wob) * (i ? -0.5 : 0.5);
          const rot = (i ? 4 : -3) * s.bump;
          return (
            <g key={i} transform={`rotate(${f1(rot)} ${f1(x + cardW / 2)} ${f1(y + 50)})`} opacity={Math.min(1, c.k * 3)}>
              <rect x={x} y={y} width={cardW} height={104} rx={16} fill={mix("#FFFFFF", "#FFF5DD", paper)} stroke={mix(c.c, MARKER, paper)} strokeWidth={6} />
              <text x={x + 20} y={y + 66} fontFamily={fontFamily} fontWeight={1000} fontSize={46} fill={mix(NAVY, MARKER, paper)}>
                {c.row.time}
              </text>
              {c.row.label.split(" ").length > 1 ? (
                <>
                  <text x={x + 158} y={y + 46} fontFamily={fontFamily} fontWeight={900} fontSize={26} fill={mix(NAVY, MARKER, paper)}>
                    {c.row.label.split(" ")[0]}
                  </text>
                  <text x={x + 158} y={y + 78} fontFamily={fontFamily} fontWeight={900} fontSize={26} fill={mix(NAVY, MARKER, paper)}>
                    {c.row.label.split(" ").slice(1).join(" ")}
                  </text>
                </>
              ) : (
                <text x={x + 158} y={y + 62} fontFamily={fontFamily} fontWeight={900} fontSize={28} fill={mix(NAVY, MARKER, paper)}>
                  {c.row.label}
                </text>
              )}
            </g>
          );
        })}
        {/* до конфликта на табло — «ОПЕРАЦИЯ»: мектеп → үй */}
        {(() => {
          const mo = s.mission * (1 - Math.min(1, Math.max(s.cardA, s.cardB) * 2));
          if (mo <= 0.01) return null;
          const by = boardY + 210;
          const left = boardX + 110;
          const right = boardX + 280;
          return (
            <g opacity={mo}>
              <text x={boardX + 195} y={boardY + 80} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={44} letterSpacing={2} fill={mix(YELLOW, MARKER, paper)}>
                {B48_TEXT.console.mission}
              </text>
              <path d={`M ${left - 30} ${by} L ${left - 30} ${by - 64} L ${left} ${by - 88} L ${left + 30} ${by - 64} L ${left + 30} ${by} Z`} fill={mix("#FFFFFF", "#FFF5DD", paper)} stroke={inkFill(paper, NAVY)} strokeWidth={4} />
              <rect x={left - 10} y={by - 36} width={20} height={36} fill={mix(YELLOW, CARD_DARK, paper)} />
              <path d={`M ${right - 32} ${by} L ${right - 32} ${by - 56} L ${right} ${by - 80} L ${right + 32} ${by - 56} L ${right + 32} ${by} Z`} fill={mix(YELLOW, "#F6D98F", paper)} stroke={inkFill(paper, NAVY)} strokeWidth={4} />
              <path d={`M ${left + 38} ${by - 30} L ${right - 40} ${by - 30}`} stroke={mix(YELLOW, MARKER, paper)} strokeWidth={6} strokeDasharray="10 8" strokeDashoffset={-t * 30} />
              <circle cx={(left + right) / 2} cy={by - 30} r={9 + 3 * Math.sin(t * 4)} fill={mix(LAMP_PINK, MARKER, paper)} />
            </g>
          );
        })()}
        <Tape x={boardX + 10} y={boardY + 8} a={-30} paper={paper} />
      </Fold>
      {/* правый экран: «ОПЕРАЦИЯ» (мектеп → үй); при конфликте — бумажная
          мама растягивается между школой и работой */}
      <Fold k={k(5)} hingeY={1000} x0={1070} x1={1380}>
        <rect x={1080} y={760} width={290} height={230} rx={26} fill={panelFill(paper, -1)} stroke={mix(LAMP_PINK, MARKER, paper)} strokeWidth={5} />
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={i} x={1104} y={784 + i * 18} width={70 + 60 * Math.abs(Math.sin(t * 1.3 + i))} height={8} rx={4} fill={mix(LAMP_BLUE, MARKER, paper)} opacity={0.6} />
        ))}
        {(() => {
          const sp = s.split;
          // слева школа, справа — дом (миссия) или офис (конфликт)
          const left = 1120;
          const right = 1330 - 0 * sp;
          const by = 955;
          const momX0 = 1225;
          const stretch = sp;
          return (
            <g opacity={0.45 + 0.55 * sp}>
              <path d={`M ${left - 26} ${by} L ${left - 26} ${by - 60} L ${left} ${by - 82} L ${left + 26} ${by - 60} L ${left + 26} ${by} Z`} fill={mix("#FFFFFF", "#FFF5DD", paper)} stroke={inkFill(paper, NAVY)} strokeWidth={4} />
              <rect x={left - 9} y={by - 34} width={18} height={34} fill={mix(YELLOW, CARD_DARK, paper)} />
              {sp < 0.5 ? (
                <g opacity={1 - sp * 2}>
                  <path d={`M ${right - 28} ${by} L ${right - 28} ${by - 52} L ${right} ${by - 74} L ${right + 28} ${by - 52} L ${right + 28} ${by} Z`} fill={mix(YELLOW, "#F6D98F", paper)} stroke={inkFill(paper, NAVY)} strokeWidth={4} />
                  <path d={`M ${left + 34} ${by - 30} L ${right - 36} ${by - 30}`} stroke={mix(YELLOW, MARKER, paper)} strokeWidth={6} strokeDasharray="10 8" strokeDashoffset={-t * 30} />
                  <circle cx={(left + right) / 2} cy={by - 30} r={9 + 3 * Math.sin(t * 4) * s.mission} fill={mix(LAMP_PINK, MARKER, paper)} />
                </g>
              ) : (
                <g opacity={(sp - 0.5) * 2}>
                  {/* офис */}
                  <rect x={right - 30} y={by - 96} width={60} height={96} fill={mix("#BFD3FF", "#E8D9B8", paper)} stroke={inkFill(paper, NAVY)} strokeWidth={4} />
                  {[0, 1, 2].map((r) => (
                    <rect key={r} x={right - 18} y={by - 84 + r * 26} width={36} height={14} fill={mix("#FFFFFF", "#FFF5DD", paper)} />
                  ))}
                  {/* растянутая бумажная мама: голова посередине, руки к двум зданиям */}
                  <path d={`M ${left + 30} ${by - 40} Q ${momX0} ${by - 60 - 10 * Math.sin(t * 6)} ${right - 34} ${by - 40}`} stroke={mix("#F4C430", CARD_DARK, paper)} strokeWidth={14} fill="none" strokeLinecap="round" />
                  <circle cx={momX0} cy={by - 76 - 4 * Math.sin(t * 6)} r={17} fill={mix("#F2C9A4", "#F2D8B8", paper)} stroke={inkFill(paper, NAVY)} strokeWidth={3} />
                  <path d={`M ${momX0 - 8} ${by - 70} q 8 ${4 * stretch} 16 0`} stroke={inkFill(paper, NAVY)} strokeWidth={3} fill="none" />
                  <path d={`M ${momX0} ${by - 52} L ${momX0} ${by - 10}`} stroke={mix("#4D5B7C", MARKER, paper)} strokeWidth={10} strokeLinecap="round" />
                </g>
              )}
            </g>
          );
        })()}
        <Tape x={1355} y={770} a={30} paper={paper} />
      </Fold>
    </g>
  );
};

// ---------- Стол-пульт (перед героями) ----------
// Стол рисуется в два слоя: «desk» — корпус и кнопки (перед телами героев,
// но за их руками), «front» — пружина/конфетти и лента, которые выше рук.
export const ConsoleDesk: React.FC<{ readonly s: ConsoleState; readonly layer?: "desk" | "front" }> = ({ s, layer = "desk" }) => {
  const { t, paper } = s;
  if (s.shrink >= 0.999) return null;
  // сжатие к центру картонной коробки на обычном столе
  const cx = 800;
  const cy = 1185;
  const sc = 1 - 0.78 * s.shrink;
  const dx = (cx - 800) * s.shrink;
  const dy = (cy - 1500) * s.shrink;
  const op = interpolate(s.shrink, [0.75, 1], [1, 0], clamp);
  const tr = `translate(${f1(800 + dx)} ${f1(1500 + dy)}) scale(${f1(sc)}) translate(-800 -1500)`;
  const press = (id: ButtonId) => s.press[id] ?? 0;
  const goLit = s.go * (1 - paper);

  if (layer === "front") {
    return (
      <g transform={tr} opacity={op}>
        {/* пружина-хлопушка из кнопки «ЖЫЙЫН» */}
        {s.spring > 0 && s.spring < 1 ? (() => {
          const b = BUTTONS.jyiyn;
          const up = interpolate(s.spring, [0, 0.18, 0.3, 1], [0, 1.15, 0.95, 1], clamp);
          const top = b.y - 30 - 190 * up;
          const coils = 7;
          const pts = Array.from({ length: coils * 2 + 1 }, (_, i) => `${i === 0 ? "M" : "L"} ${f1(b.x + (i % 2 ? 22 : -22))} ${f1(b.y - 20 - ((b.y - 20 - top) * i) / (coils * 2))}`).join(" ");
          return (
            <g opacity={interpolate(s.spring, [0.85, 1], [1, 0], clamp)}>
              <path d={pts} stroke={mix("#B9C2D4", MARKER, paper)} strokeWidth={7} fill="none" strokeLinejoin="round" />
              {/* «шляпа-хлопушка» на пружине */}
              <path d={`M ${f1(b.x - 46)} ${f1(top)} L ${f1(b.x)} ${f1(top - 90)} L ${f1(b.x + 46)} ${f1(top)} Z`} fill={mix(LAMP_PINK, CARD, paper)} stroke={inkFill(paper, NAVY)} strokeWidth={4} />
              <circle cx={b.x} cy={top - 92} r={12} fill={YELLOW} />
              <text x={b.x - 120} y={top - 20} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={38} fill="#FFFFFF" stroke={NAVY} strokeWidth={8} paintOrder="stroke" opacity={interpolate(s.spring, [0.2, 0.32], [0, 1], clamp)}>
                {`${B48_TEXT.console.buttons[3]}?!`}
              </text>
            </g>
          );
        })() : null}
        {/* лента принтера поднимается из щели слева на столе */}
        {s.ticker > 0 ? (() => {
          const h = 40 + 74 * s.ticker;
          const top = PRINTER.y - h;
          return (
            <g>
              <path d={`M ${PRINTER.x - 140} ${PRINTER.y} L ${PRINTER.x - 140} ${f1(top + 10)} ${Array.from({ length: 14 }, (_, i) => `L ${PRINTER.x - 140 + (i + 0.5) * 20} ${f1(i % 2 ? top + 10 : top)}`).join(" ")} L ${PRINTER.x + 140} ${f1(top + 10)} L ${PRINTER.x + 140} ${PRINTER.y} Z`} fill="#FFFDF6" stroke={mix("#C8D0E0", CARD_DARK, paper)} strokeWidth={3} />
              <text x={PRINTER.x} y={f1(top + 54)} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={30} fill={mix(LAMP_RED, MARKER, paper)} opacity={interpolate(s.ticker, [0.25, 0.4], [0, 1], clamp)}>
                {B48_TEXT.console.ticker}
              </text>
            </g>
          );
        })() : null}
        {/* корпус принтера поверх ленты */}
        <rect x={PRINTER.x - 150} y={PRINTER.y - 8} width={300} height={60} rx={14} fill={panelFill(paper, -1)} stroke={inkFill(paper, "#0B1834")} strokeWidth={3} />
        <rect x={PRINTER.x - 136} y={PRINTER.y - 4} width={272} height={12} rx={6} fill={mix("#0B1834", CARD_DARK, paper)} />
        <circle cx={PRINTER.x + 120} cy={PRINTER.y + 28} r={8} fill={mix(s.ticker > 0 && s.ticker < 1 ? LAMP_GREEN : "#4A5A80", CARD_DARK, paper)} />
      </g>
    );
  }

  return (
    <g transform={tr} opacity={op}>
      {/* тень на полу */}
      <ellipse cx={800} cy={1850} rx={760} ry={40} fill="#000000" opacity={0.12 * (1 - s.shrink)} />
      {/* верхняя наклонная поверхность */}
      <path d="M 150 1200 L 1450 1200 L 1520 1420 L 80 1420 Z" fill={panelFill(paper, 1)} stroke={inkFill(paper, "#0B1834")} strokeWidth={paper > 0.5 ? 7 : 4} strokeLinejoin="round" />
      <path d="M 150 1200 L 1450 1200 L 1460 1225 L 142 1225 Z" fill={mix(YELLOW, CARD_LIGHT, paper)} opacity={0.9} />
      {/* лицевая панель */}
      <path d="M 80 1420 L 1520 1420 L 1500 1830 L 100 1830 Z" fill={panelFill(paper)} stroke={inkFill(paper, "#0B1834")} strokeWidth={paper > 0.5 ? 7 : 4} strokeLinejoin="round" />
      <rect x={80} y={1420} width={1440} height={16} fill={mix("#0F2147", CARD_DARK, paper)} />
      {/* рычаг папы (слева) и тумблеры */}
      <g>
        <rect x={250} y={1240} width={130} height={36} rx={18} fill={panelFill(paper, -1)} />
        {(() => {
          const a = -35 + 70 * s.go;
          return (
            <g transform={`rotate(${f1(a)} 315 1258)`}>
              <line x1={315} y1={1258} x2={315} y2={1170} stroke={mix("#C9D4EC", MARKER, paper)} strokeWidth={14} strokeLinecap="round" />
              <circle cx={315} cy={1166} r={22} fill={mix(LAMP_RED, CARD_DARK, paper)} />
            </g>
          );
        })()}
        {[0, 1, 2, 3].map((i) => {
          const on = (i + Math.floor(t * 1.5)) % 3 === 0 ? 1 : 0;
          return (
            <g key={i}>
              <rect x={140 + i * 36} y={1366} width={24} height={44} rx={12} fill={panelFill(paper, -1)} />
              <rect x={143 + i * 36} y={on ? 1369 : 1387} width={18} height={20} rx={9} fill={mix(on ? YELLOW : "#8DA2D0", CARD_DARK, paper)} />
            </g>
          );
        })}
      </g>
      {/* большие кнопки */}
      {(Object.keys(BUTTONS) as ButtonId[]).map((id) => {
        const b = BUTTONS[id];
        const p = press(id);
        const lit = id === "jol" ? goLit : 0;
        return (
          <g key={id}>
            <ellipse cx={b.x} cy={b.y + 12} rx={b.r + 12} ry={b.r * 0.55 + 10} fill={mix("#0B1834", CARD_DARK, paper)} />
            {lit > 0.05 ? <circle cx={b.x} cy={b.y} r={b.r * 1.9} fill={LAMP_GREEN} opacity={0.25 * lit} /> : null}
            <ellipse cx={b.x} cy={b.y + 6 * p} rx={b.r} ry={b.r * 0.62} fill={mix(b.color, mix(b.color, "#F4E2B8", 0.55), paper)} stroke={inkFill(paper, "#0B1834")} strokeWidth={paper > 0.5 ? 5 : 3} />
            <ellipse cx={b.x - b.r * 0.25} cy={b.y - b.r * 0.2 + 6 * p} rx={b.r * 0.35} ry={b.r * 0.16} fill="#FFFFFF" opacity={0.45 * (1 - paper)} />
            {/* значок на кнопке */}
            <g transform={`translate(${b.x} ${f1(b.y + 6 * p)})`} stroke={inkFill(paper, NAVY)} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {id === "mektep" ? <path d="M -18 -8 L 0 -14 L 18 -8 L 18 10 L 0 4 L -18 10 Z M 0 -14 L 0 4" /> : null}
              {id === "jumush" ? <path d="M -18 -12 L 18 -12 L 18 6 L -18 6 Z M -24 12 L 24 12" /> : null}
              {id === "jol" ? <path d="M -8 14 L -3 -14 M 8 14 L 3 -14 M 0 10 L 0 4 M 0 -2 L 0 -8" /> : null}
              {id === "jyiyn" ? <path d="M -12 -6 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0 M 12 -6 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0 M -22 14 Q -12 2 -2 14 M 2 14 Q 12 2 22 14" /> : null}
              {id === "phone" ? <path d="M -12 -10 Q -14 4 -2 12 Q 4 15 10 10 L 6 4 L 0 6 Q -6 2 -6 -4 L -2 -8 Z" fill={inkFill(paper, NAVY)} /> : null}
            </g>
            {b.label ? (
              <g>
                <rect x={b.x - 82} y={b.y + b.r * 0.62 + 22} width={164} height={46} rx={12} fill={mix("#0B1834", "#F6E7C8", paper)} stroke={mix(b.color, MARKER, paper)} strokeWidth={3} />
                <text x={b.x} y={b.y + b.r * 0.62 + 56} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={30} fill={mix("#FFFFFF", MARKER, paper)}>
                  {b.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
      {/* люк «МЕКТЕП»: выскакивает учебник */}
      {s.book > 0 ? (() => {
        const b = BUTTONS.mektep;
        const up = interpolate(s.book, [0, 0.25, 0.4, 1], [0, 1.12, 0.96, 1], clamp);
        const y = b.y - 70 - 120 * up;
        return (
          <g transform={`rotate(${f1(-8 + 16 * Math.sin(s.book * 9) * (1 - s.book))} ${b.x} ${f1(y + 40)})`}>
            <path d={`M ${b.x - 6} ${b.y - 30} L ${b.x - 6} ${f1(y + 60)} M ${b.x + 6} ${b.y - 30} L ${b.x + 6} ${f1(y + 60)}`} stroke="#B9C2D4" strokeWidth={5} />
            <rect x={b.x - 60} y={y} width={120} height={84} rx={8} fill={mix("#E85D4F", CARD, paper)} stroke={inkFill(paper, NAVY)} strokeWidth={4} />
            <rect x={b.x - 50} y={y + 8} width={100} height={68} rx={4} fill="#FFFDF4" />
            <path d={`M ${b.x} ${f1(y + 8)} L ${b.x} ${f1(y + 76)}`} stroke={inkFill(paper, NAVY)} strokeWidth={3} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${b.x - 40} ${f1(y + 24 + i * 16)} L ${b.x - 10} ${f1(y + 24 + i * 16)} M ${b.x + 10} ${f1(y + 24 + i * 16)} L ${b.x + 40} ${f1(y + 24 + i * 16)}`} stroke="#9AA8C4" strokeWidth={3} />
            ))}
          </g>
        );
      })() : null}
      {/* телефон выезжает и вибрирует */}
      {s.phone > 0 ? (() => {
        const b = BUTTONS.phone;
        const up = interpolate(s.phone, [0, 0.2], [0, 1], clamp);
        const shake = s.phone < 0.95 ? Math.sin(t * 60) * 4 * up : 0;
        const y = b.y - 60 - 110 * up;
        return (
          <g transform={`translate(${f1(shake)} 0) rotate(${f1(shake * 1.5)} ${b.x} ${f1(y + 60)})`}>
            <rect x={b.x - 34} y={y} width={68} height={120} rx={14} fill={mix("#2B2F3A", CARD_DARK, paper)} />
            <rect x={b.x - 28} y={y + 10} width={56} height={96} rx={8} fill={mix("#A6E3FF", "#FFF5DD", paper)} />
            <path d={`M ${b.x - 12} ${f1(y + 50)} Q ${b.x - 14} ${f1(y + 64)} ${b.x - 2} ${f1(y + 72)} Q ${b.x + 4} ${f1(y + 75)} ${b.x + 10} ${f1(y + 70)} L ${b.x + 6} ${f1(y + 64)} L ${b.x} ${f1(y + 66)} Q ${b.x - 6} ${f1(y + 62)} ${b.x - 6} ${f1(y + 56)} L ${b.x - 2} ${f1(y + 52)} Z`} fill={inkFill(paper, NAVY)} />
            {[1, 2].map((i) => (
              <path key={i} d={`M ${b.x + 44 + i * 12} ${f1(y + 30)} Q ${b.x + 56 + i * 14} ${f1(y + 60)} ${b.x + 44 + i * 12} ${f1(y + 90)}`} stroke={mix(LAMP_RED, MARKER, paper)} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 12 + i)} />
            ))}
          </g>
        );
      })() : null}
      {/* ноутбук раскрывается: «Жолугушуу 13:00» */}
      {s.laptop > 0 ? (() => {
        // ноутбук справа от мамы и ниже подбородка — лицо остаётся видно
        const b = { ...BUTTONS.jumush, x: BUTTONS.jumush.x + 100 };
        const up = interpolate(s.laptop, [0, 0.25], [0, 1], clamp);
        const open = interpolate(s.laptop, [0.2, 0.55], [0, 1], clamp);
        const y = b.y - 40 - 60 * up;
        const h = 120 * open;
        return (
          <g>
            <rect x={b.x - 90} y={y} width={180} height={18} rx={6} fill={mix("#C9D2E3", CARD, paper)} stroke={inkFill(paper, NAVY)} strokeWidth={3} />
            {open > 0.02 ? (
              <g>
                <rect x={b.x - 84} y={f1(y - h)} width={168} height={f1(h)} rx={8} fill={mix("#E9EEF8", CARD, paper)} stroke={inkFill(paper, NAVY)} strokeWidth={3} />
                <rect x={b.x - 74} y={f1(y - h + 10)} width={148} height={f1(Math.max(0, h - 20))} rx={4} fill={mix("#FFFFFF", "#FFF5DD", paper)} />
                {open > 0.8 ? (
                  <g>
                    <text x={b.x} y={y - h + 54} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={22} fill={mix(NAVY, MARKER, paper)}>
                      {B48_TEXT.console.board[1].label.split(" ")[1]}
                    </text>
                    <text x={b.x} y={y - h + 96} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={38} fill={mix(LAMP_RED, MARKER, paper)}>
                      {B48_TEXT.console.board[1].time}
                    </text>
                  </g>
                ) : null}
              </g>
            ) : null}
          </g>
        );
      })() : null}
      {/* приборы на лицевой панели: УБАКЫТ, ШАШУУ (в центре, крупнее), ТЫНЧТЫК */}
      <Gauge x={520} y={1552} r={86} value={0.35 + 0.3 * ((t * 0.05) % 1)} label={B48_TEXT.console.gauges[0]} paper={paper} t={t} />
      <Gauge x={800} y={1540} r={100} value={s.rush} label={B48_TEXT.console.gauges[1]} paper={paper} red t={t} />
      <Gauge x={1080} y={1552} r={86} value={s.calm} label={B48_TEXT.console.gauges[2]} paper={paper} t={t} />
      {/* малярный скотч на приборе «УБАКЫТ» — подсказка, что это поделка */}
      <rect x={560} y={1462} width={70} height={22} rx={3} fill="#F3E7C4" opacity={0.7} transform="rotate(28 595 1473)" />
      <rect x={200} y={1500} width={180} height={110} rx={16} fill={panelFill(paper, -1)} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={218} y={1518 + i * 30} width={144 * (0.3 + 0.7 * Math.abs(Math.sin(t * (0.9 + i * 0.5) + i * 2)))} height={16} rx={8} fill={mix(i === 1 ? YELLOW : LAMP_GREEN, MARKER, paper)} />
      ))}
      <rect x={1220} y={1500} width={180} height={110} rx={16} fill={panelFill(paper, -1)} />
      {Array.from({ length: 6 }, (_, i) => (
        <Lamp key={i} x={1250 + (i % 3) * 60} y={1530 + Math.floor(i / 3) * 50} r={14} color={goLit > 0.5 ? LAMP_GREEN : i % 2 ? LAMP_BLUE : YELLOW} on={0.3 + 0.7 * Math.max(goLit, Math.max(0, Math.sin(t * 3 - i * 0.7)))} paper={paper} />
      ))}
      {/* ряд ламп и вентиляционные прорези */}
      {Array.from({ length: 11 }, (_, i) => (
        <Lamp key={i} x={300 + i * 100} y={1690} r={12} color={goLit > 0.5 ? LAMP_GREEN : s.alarm > 0.3 ? LAMP_AMBER : i % 2 ? LAMP_BLUE : YELLOW} on={0.3 + 0.7 * Math.max(goLit, s.alarm * 0.8, Math.max(0, Math.sin(t * 2.6 - i * 0.6)))} paper={paper} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={230 + i * 170} y={1760} width={110} height={14} rx={7} fill={mix("#0F2147", CARD_DARK, paper)} />
      ))}
      {/* гофрокартон на нижнем крае — подсказка */}
      <path d={`M 100 1830 ${Array.from({ length: 70 }, (_, i) => `q 10 ${i % 2 ? 8 : -8} 20 0`).join(" ")}`} stroke={CARD_DARK} strokeWidth={5} fill="none" opacity={0.7} />
      {/* детские пальчики выглядывают из-за пульта — кто-то прячется */}
      {s.fingers > 0.01 ? (
        <g transform={`translate(0 ${f1(30 * (1 - s.fingers))})`} opacity={s.fingers}>
          {[-1, 1].map((sd) => (
            <g key={sd}>
              {[0, 1, 2, 3].map((j) => (
                <rect key={j} x={800 + sd * 40 + j * 11 - 22} y={1180} width={10} height={30} rx={5} fill="#F4CDA8" stroke="#E0AE87" strokeWidth={2} />
              ))}
            </g>
          ))}
        </g>
      ) : null}
    </g>
  );
};

// ---------- Кресло диспетчера (фантазия) ----------
export const SwivelChair: React.FC<{ readonly x: number; readonly y: number; readonly paper: number; readonly opacity?: number }> = ({ x, y, paper, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={x - 130} y={y} width={260} height={330} rx={60} fill={mix("#2D4A85", CARD, paper)} stroke={inkFill(paper, "#0B1834")} strokeWidth={4} />
    <rect x={x - 100} y={y + 26} width={200} height={40} rx={20} fill={mix(YELLOW, CARD_LIGHT, paper)} />
    <circle cx={x - 106} cy={y + 18} r={14} fill={mix(LAMP_BLUE, CARD_DARK, paper)} />
    <circle cx={x + 106} cy={y + 18} r={14} fill={mix(LAMP_BLUE, CARD_DARK, paper)} />
  </g>
);

// ---------- Наушники-гарнитура (в координатах головы) ----------
// paper 0 — «настоящая» гарнитура из фантазии, 1 — бумажные стаканчики со
// шнурком и трубочкой-микрофоном (игрушка дочери). lift — наушники
// снимаются (поднимаются вверх, px).
export const Headset: React.FC<{ readonly rx: number; readonly ry: number; readonly paper: number; readonly lift?: number; readonly tilt?: number; readonly t?: number }> = ({ rx, ry, paper, lift = 0, tilt = 0, t = 0 }) => {
  const cupW = rx * 0.42;
  const cupH = ry * 0.62;
  const band = `M ${f1(-rx * 1.06)} ${f1(-ry * 0.05)} C ${f1(-rx * 1.18)} ${f1(-ry * 1.75)} ${f1(rx * 1.18)} ${f1(-ry * 1.75)} ${f1(rx * 1.06)} ${f1(-ry * 0.05)}`;
  const micTip = Math.max(0, Math.sin(t * 3));
  const pro = 1 - paper;
  return (
    <g transform={`translate(0 ${f1(-lift)}) rotate(${f1(tilt)} 0 ${f1(-ry)})`}>
      {/* «настоящая» гарнитура из фантазии */}
      {pro > 0.01 ? (
        <g opacity={pro}>
          <path d={band} stroke="#2B3E6E" strokeWidth={16} fill="none" strokeLinecap="round" />
          <path d={band} stroke={YELLOW} strokeWidth={4} fill="none" strokeLinecap="round" />
          {([-1, 1] as const).map((side) => (
            <g key={side} transform={`translate(${f1(side * rx * 1.05)} ${f1(ry * 0.08)})`}>
              <rect x={-cupW * 0.55} y={-cupH * 0.5} width={cupW * 1.1} height={cupH} rx={cupW * 0.4} fill="#24407A" stroke="#0B1834" strokeWidth={4} />
              <ellipse cx={0} cy={0} rx={cupW * 0.36} ry={cupH * 0.32} fill={YELLOW} />
            </g>
          ))}
          <path d={`M ${f1(-rx * 1.0)} ${f1(ry * 0.3)} Q ${f1(-rx * 0.9)} ${f1(ry * 0.85)} ${f1(-rx * 0.35)} ${f1(ry * 0.62)}`} stroke="#1B2D57" strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={-rx * 0.33} cy={ry * 0.62} r={10} fill={mix("#33415E", LAMP_RED, micTip)} />
        </g>
      ) : null}
      {/* поделка дочери: бумажные стаканчики на ниточке и трубочка-«микрофон» */}
      {paper > 0.01 ? (
        <g opacity={paper}>
          <path d={band} stroke="#E8DCC4" strokeWidth={5} fill="none" strokeLinecap="round" />
          {([-1, 1] as const).map((side) => {
            const x0 = side * rx * 0.92;
            const x1 = side * rx * 1.4;
            const y0 = ry * 0.1;
            return (
              <g key={side}>
                <path d={`M ${f1(x0)} ${f1(y0 - ry * 0.3)} L ${f1(x1)} ${f1(y0 - ry * 0.2)} L ${f1(x1)} ${f1(y0 + ry * 0.2)} L ${f1(x0)} ${f1(y0 + ry * 0.3)} Z`} fill="#FFFFFF" stroke="#C9B48E" strokeWidth={3} strokeLinejoin="round" />
                <path d={`M ${f1(x0 + side * rx * 0.08)} ${f1(y0 - ry * 0.29)} L ${f1(x0 + side * rx * 0.08)} ${f1(y0 + ry * 0.29)}`} stroke="#E85D4F" strokeWidth={7} />
                <circle cx={x0 + side * rx * 0.28} cy={y0 - ry * 0.05} r={4} fill="#59C3FF" />
                <circle cx={x0 + side * rx * 0.36} cy={y0 + ry * 0.1} r={3.5} fill="#F7C531" />
                <ellipse cx={x1} cy={y0} rx={4} ry={ry * 0.2} fill="#EFE6D4" stroke="#C9B48E" strokeWidth={2} />
              </g>
            );
          })}
          {/* изогнутая трубочка в полоску */}
          <path d={`M ${f1(-rx * 1.0)} ${f1(ry * 0.35)} Q ${f1(-rx * 0.95)} ${f1(ry * 0.85)} ${f1(-rx * 0.38)} ${f1(ry * 0.66)}`} stroke="#7FB8F0" strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d={`M ${f1(-rx * 1.0)} ${f1(ry * 0.35)} Q ${f1(-rx * 0.95)} ${f1(ry * 0.85)} ${f1(-rx * 0.38)} ${f1(ry * 0.66)}`} stroke="#FFFFFF" strokeWidth={9} fill="none" strokeDasharray="6 8" />
        </g>
      ) : null}
    </g>
  );
};

// ---------- Картонная коробка — тот самый «пульт», который смастерила дочь ----------
// На обычном столе (верх стола y = 1300). flip — кнопка «МЕКТЕП»
// переворачивается (финал), её рисует CtaCard поверх; здесь — пустой круг.
export const BOX = { x: 640, y: 1062, w: 320, h: 240, mektep: { x: 724, y: 1196, r: 54 } } as const;

export const CardboardBox: React.FC<{ readonly appear: number; readonly t: number; readonly pressMektep?: number; readonly hideMektep?: boolean }> = ({ appear, t, pressMektep = 0, hideMektep }) => {
  if (appear <= 0) return null;
  const { x, y, w, h, mektep } = BOX;
  const wob = Math.sin(t * 1.3) * 0.6;
  return (
    <g opacity={Math.min(1, appear * 1.4)}>
      <ellipse cx={x + w / 2} cy={y + h + 2} rx={w * 0.56} ry={14} fill="#000000" opacity={0.12} />
      {/* открытые клапаны */}
      <path d={`M ${x} ${y} L ${x - 40} ${y - 46} L ${x + 120} ${y - 40} L ${x + 150} ${y} Z`} fill={CARD_LIGHT} stroke={CARD_DARK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${x + w} ${y} L ${x + w + 40} ${y - 50} L ${x + w - 110} ${y - 44} L ${x + w - 150} ${y} Z`} fill={CARD_LIGHT} stroke={CARD_DARK} strokeWidth={4} strokeLinejoin="round" />
      {/* антенна из втулки и проволоки */}
      <g transform={`rotate(${f1(wob * 3)} ${x + w - 40} ${y})`}>
        <line x1={x + w - 40} y1={y} x2={x + w - 30} y2={y - 110} stroke="#8C99B0" strokeWidth={5} />
        <circle cx={x + w - 30} cy={y - 116} r={12} fill={YELLOW} stroke={MARKER} strokeWidth={3} />
      </g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={CARD} stroke={CARD_DARK} strokeWidth={5} />
      <path d={`M ${x + 8} ${y + 14} L ${x + w - 8} ${y + 14}`} stroke={CARD_DARK} strokeWidth={3} opacity={0.6} />
      {/* надпись маркером */}
      <text x={x + w / 2} y={y + 52} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={26} fill={MARKER} transform={`rotate(-2 ${x + w / 2} ${y + 50})`}>
        {B48_TEXT.console.title.split(" ")[1]}
      </text>
      {/* нарисованные кнопки и крышки-«кнопки» */}
      {!hideMektep ? (
        <g transform={`translate(0 ${f1(3 * pressMektep)})`}>
          <circle cx={mektep.x} cy={mektep.y} r={mektep.r} fill="#F2D27A" stroke={MARKER} strokeWidth={5} />
          <text x={mektep.x} y={mektep.y + 9} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={22} fill={MARKER}>
            {B48_TEXT.console.buttons[0]}
          </text>
        </g>
      ) : null}
      <circle cx={x + 205} cy={y + 110} r={20} fill="#7FB8F0" stroke={MARKER} strokeWidth={4} />
      <circle cx={x + 265} cy={y + 110} r={20} fill="#8FE0A6" stroke={MARKER} strokeWidth={4} />
      <circle cx={x + 205} cy={y + 170} r={20} fill="#FFB0D4" stroke={MARKER} strokeWidth={4} />
      {/* нарисованный прибор */}
      <circle cx={x + 265} cy={y + 180} r={26} fill="#FFF7E6" stroke={MARKER} strokeWidth={4} />
      <line x1={x + 265} y1={y + 180} x2={x + 265 + 18 * Math.sin(0.6 + wob * 0.2)} y2={y + 180 - 18 * Math.cos(0.6)} stroke="#E85D4F" strokeWidth={4} strokeLinecap="round" />
      {/* бутылочные крышки-ручки */}
      <circle cx={x + 160} cy={y + 212} r={12} fill="#E85D4F" />
      <circle cx={x + 196} cy={y + 212} r={12} fill="#59C3FF" />
    </g>
  );
};
