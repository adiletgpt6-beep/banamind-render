// Анимированные схемы фильма BM-005 (часть «intro»): праздник Фуке и арест,
// главный вопрос фильма, книга и наш подход, «книга наоборот», цена успеха,
// позиция автора и наш вывод, финальные итоги с логотипом BanaMind.
import React from "react";
import { interpolateColors } from "remotion";
import { C, FONT, SERIF } from "../theme";
import { Board, Chess, Coin, CoinStack, Crown, Figure, Firework, Mask, Year } from "./court";
import { Heart, OL } from "./draw";
import { Arrow, Check, Panel, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── общие мелочи ──

const rnd = (i: number, s = 0) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const tw = (text: string, size: number) => text.length * size * 0.56;

// плавное появление с подъёмом
const Show: React.FC<{ k: number; dy?: number; children: React.ReactNode }> = ({ k, dy = 30, children }) =>
  k <= 0.001 ? null : (
    <g opacity={clamp01(k * 1.4)} transform={`translate(0 ${(1 - clamp01(k)) * dy})`}>
      {children}
    </g>
  );

// масштаб вокруг точки (пружинка)
const Grow: React.FC<{ k: number; x: number; y: number; children: React.ReactNode }> = ({ k, x, y, children }) =>
  k <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`} opacity={clamp01(k * 1.5)}>
      {children}
    </g>
  );

// табличка-пилюля с подписью
const Pill: React.FC<{ x: number; y: number; text: string; size?: number; fill?: string; color?: string; stroke?: string; serif?: boolean }> = ({ x, y, text, size = 32, fill = C.white, color = C.ink, stroke, serif }) => {
  const w = tw(text, size) + size * 1.3;
  const h = size * 1.55;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 4} y={-h / 2 + 6} width={w} height={h} rx={h / 2} fill="#24324a" opacity={0.12} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={stroke ? 4 : 0} />
      <text x={0} y={size * 0.35} textAnchor="middle" fontFamily={serif ? SERIF : FONT} fontWeight={serif ? 700 : 900} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};

// крупная надпись с белой обводкой (читается на любом фоне)
const Out: React.FC<{ x: number; y: number; size: number; color?: string; children: string; anchor?: "start" | "middle" | "end"; serif?: boolean; sw?: number }> = ({ x, y, size, color = C.ink, children, anchor = "middle", serif, sw = 10 }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={serif ? SERIF : FONT} fontWeight={900} fontSize={size} fill={color} stroke="#fff" strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke">
    {children}
  </text>
);

// искорки вокруг предмета
const Sparkles: React.FC<{ x: number; y: number; r: number; t: number; n?: number; color?: string; k?: number }> = ({ x, y, r, t, n = 7, color = C.goldLight, k = 1 }) => (
  <g opacity={clamp01(k)}>
    {Array.from({ length: n }).map((_, i) => {
      const a = (i / n) * Math.PI * 2 + t * 0.3;
      const ph = (t * 0.9 + rnd(i, 3)) % 1;
      const s = Math.sin(ph * Math.PI);
      const rr = r * (0.85 + 0.25 * rnd(i, 5));
      return <path key={i} transform={`translate(${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr}) scale(${s * (0.6 + 0.6 * rnd(i, 9))})`} d="M 0 -16 Q 3 -3 16 0 Q 3 3 0 16 Q -3 3 -16 0 Q -3 -3 0 -16 Z" fill={color} stroke={OL} strokeWidth={2} />;
    })}
  </g>
);

// обложка книги «48 законов власти» (своя условная обложка)
const GreeneBook: React.FC<{ x: number; y: number; s?: number; rot?: number; icon?: "crown" | "mask"; cover?: string }> = ({ x, y, s = 1, rot = 0, icon = "crown", cover = C.velvetDeep }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={10} cy={232} rx={170} ry={16} fill="#000" opacity={0.1} />
    <rect x={128} y={-200} width={36} height={414} rx={6} fill="#fbf0d4" stroke={OL} strokeWidth={4} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <path key={i} d={`M ${136 + i * 4} -190 L ${136 + i * 4} 204`} stroke="#d9c79c" strokeWidth={1.5} />
    ))}
    <rect x={-150} y={-210} width={300} height={420} rx={14} fill={cover} stroke={OL} strokeWidth={5} />
    <rect x={-150} y={-210} width={22} height={420} rx={8} fill="#000" opacity={0.18} />
    <rect x={-116} y={-182} width={244} height={364} rx={8} fill="none" stroke={C.gold} strokeWidth={4} />
    <rect x={-106} y={-172} width={224} height={344} rx={6} fill="none" stroke={C.gold} strokeWidth={1.5} opacity={0.7} />
    <text x={6} y={-48} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={128} fill={C.gold}>
      48
    </text>
    <text x={6} y={4} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={36} fill={C.goldLight} letterSpacing={2}>
      ЗАКОНОВ
    </text>
    <text x={6} y={44} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={36} fill={C.goldLight} letterSpacing={2}>
      ВЛАСТИ
    </text>
    {icon === "crown" ? <Crown x={6} y={112} s={0.5} /> : <Mask x={6} y={104} s={0.42} color="#e9e2d0" />}
    <text x={6} y={168} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={31} fill="#fff">
      Роберт Грин
    </text>
    <path d="M -100 -196 L -70 -196" stroke="#fff" strokeWidth={4} opacity={0.35} strokeLinecap="round" />
  </g>
);

// нотка
const Note: React.FC<{ x: number; y: number; s?: number; color?: string; o?: number }> = ({ x, y, s = 1, color = C.goldLight, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={12} ry={9} transform="rotate(-22)" fill={color} />
    <path d="M 10 -3 L 10 -42 Q 24 -36 26 -22" stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// замок Во-ле-Виконт (условный силуэт: купол в центре, два крыла)
const Chateau: React.FC<{ x: number; y: number; s?: number; t: number; lit?: number; wall?: string }> = ({ x, y, s = 1, t, lit = 1, wall = "#f4e6c8" }) => {
  const win = (i: number) => interpolateColors(lit * (0.82 + 0.18 * Math.sin(t * 3 + i * 1.7)), [0, 1], ["#9fb6cf", "#ffd76a"]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {lit > 0 && [1, 0.75, 0.5].map((q, i) => <ellipse key={i} cx={0} cy={-170} rx={420 * q} ry={210 * q} fill="#ffd76a" opacity={0.06 * lit} />)}
      {/* крылья */}
      <rect x={-300} y={-160} width={600} height={160} fill={wall} stroke={OL} strokeWidth={5} />
      <path d="M -312 -160 L -286 -222 L -110 -222 L -86 -160 Z" fill="#5d6b8a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 312 -160 L 286 -222 L 110 -222 L 86 -160 Z" fill="#5d6b8a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      {[-1, 1].map((d) => (
        <g key={d}>
          <rect x={d > 0 ? 250 : -320} y={-190} width={70} height={190} fill={wall} stroke={OL} strokeWidth={5} />
          <path d={`M ${d > 0 ? 242 : -328} -190 L ${d * 285} -250 L ${d > 0 ? 328 : -242} -190 Z`} fill="#4e5b78" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <rect x={d * 285 - 12} y={-160} width={24} height={44} rx={12} fill={win(d + 5)} stroke={OL} strokeWidth={3} />
          <rect x={d * 285 - 12} y={-90} width={24} height={44} rx={12} fill={win(d + 7)} stroke={OL} strokeWidth={3} />
        </g>
      ))}
      {[-230, -185, -140, 140, 185, 230].map((wx, i) => (
        <g key={i}>
          <rect x={wx - 13} y={-138} width={26} height={46} rx={13} fill={win(i)} stroke={OL} strokeWidth={3} />
          <rect x={wx - 13} y={-74} width={26} height={46} rx={13} fill={win(i + 3)} stroke={OL} strokeWidth={3} />
        </g>
      ))}
      {/* центральный павильон с куполом */}
      <rect x={-96} y={-210} width={192} height={210} fill={wall} stroke={OL} strokeWidth={5} />
      <path d="M -106 -210 Q -106 -320 0 -334 Q 106 -320 106 -210 Z" fill="#5d6b8a" stroke={OL} strokeWidth={5} />
      <path d="M -60 -230 Q -50 -300 0 -312" stroke="#fff" strokeWidth={5} opacity={0.25} fill="none" strokeLinecap="round" />
      <rect x={-16} y={-370} width={32} height={38} fill={wall} stroke={OL} strokeWidth={4} />
      <path d="M -22 -370 Q 0 -398 22 -370 Z" fill="#4e5b78" stroke={OL} strokeWidth={4} />
      <path d="M 0 -396 L 0 -414" stroke={OL} strokeWidth={4} />
      <circle cx={0} cy={-418} r={6} fill={C.gold} stroke={OL} strokeWidth={3} />
      {[-58, 0, 58].map((wx, i) => (
        <rect key={i} x={wx - 16} y={-186} width={32} height={72} rx={16} fill={win(i + 9)} stroke={OL} strokeWidth={3} />
      ))}
      <path d="M -30 0 L -30 -70 Q 0 -100 30 -70 L 30 0 Z" fill={win(12)} stroke={OL} strokeWidth={4} />
      <path d="M -120 0 L 120 0 L 140 14 L -140 14 Z" fill="#d8c8a8" stroke={OL} strokeWidth={4} />
    </g>
  );
};

// фонтан: чаша, струи и капли
const Fountain: React.FC<{ x: number; y: number; t: number; h?: number; s?: number }> = ({ x, y, t, h = 110, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((d) => (
      <path key={d} d={`M 0 ${-h * 0.62} Q ${d * 46} ${-h * 0.98} ${d * 60} -8`} stroke="#bfe6ff" strokeWidth={6} fill="none" opacity={0.85} strokeLinecap="round" />
    ))}
    <path d={`M 0 -6 L 0 ${-h}`} stroke="#dff3ff" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
    <circle cx={0} cy={-h - 4} r={10 + Math.sin(t * 6) * 2} fill="#e8f7ff" opacity={0.8} />
    {Array.from({ length: 8 }).map((_, j) => {
      const d = j % 2 ? 1 : -1;
      const u = (t * 0.9 + j / 8) % 1;
      const px = (1 - u) * (1 - u) * 0 + 2 * (1 - u) * u * d * 46 + u * u * d * 60;
      const py = (1 - u) * (1 - u) * -h * 0.62 + 2 * (1 - u) * u * -h * 0.98 + u * u * -8;
      return <circle key={j} cx={px} cy={py} r={4} fill="#fff" opacity={0.85} />;
    })}
    <ellipse cx={0} cy={0} rx={70} ry={16} fill="#8fb8d8" stroke={OL} strokeWidth={4} />
    <path d="M -70 0 L -62 18 Q 0 32 62 18 L 70 0" fill={C.stone} stroke={OL} strokeWidth={4} />
    <ellipse cx={0} cy={-2} rx={52} ry={9} fill="#cdeaff" opacity={0.7} />
  </g>
);

// блюда праздника (семь перемен)
const Dish: React.FC<{ x: number; y: number; kind: number; k: number; t: number }> = ({ x, y, kind, k, t }) => {
  if (k <= 0.001) return null;
  let food: React.ReactNode;
  switch (kind) {
    case 0:
      food = <ellipse cx={0} cy={-16} rx={26} ry={16} fill="#b8642c" stroke={OL} strokeWidth={3} />;
      break;
    case 1:
      food = (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={[-16, 0, 16, -8, 8, 0][i]} cy={[-10, -10, -10, -24, -24, -38][i]} r={9} fill={[C.red, C.gold, C.green, C.violet, C.coral, C.red][i]} stroke={OL} strokeWidth={2} />
          ))}
        </g>
      );
      break;
    case 2:
      food = (
        <g>
          <path d="M -24 -4 Q 0 -26 26 -6 L 34 -16 L 34 6 L 26 -2 Q 0 14 -24 -4 Z" fill="#7fb3d6" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={-12} cy={-6} r={3} fill={OL} />
        </g>
      );
      break;
    case 3:
      food = (
        <g>
          <path d="M -30 -4 Q -30 -44 0 -46 Q 30 -44 30 -4 Z" fill="#dfe6ee" stroke={OL} strokeWidth={3} />
          <circle cx={0} cy={-50} r={5} fill="#dfe6ee" stroke={OL} strokeWidth={3} />
          <path d="M -16 -16 Q -14 -30 -4 -36" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case 4:
      food = (
        <g>
          <path d="M -28 -4 Q -28 -30 0 -32 Q 28 -30 28 -4 Z" fill="#e9b04a" stroke={OL} strokeWidth={3} />
          <path d="M -14 -12 L -6 -26 M 4 -12 L 10 -26" stroke="#b97c3e" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
      break;
    case 5:
      food = (
        <g transform={`scale(${1 + Math.sin(t * 7) * 0.04} ${1 - Math.sin(t * 7) * 0.04})`}>
          <path d="M -22 -4 Q -24 -40 0 -40 Q 24 -40 22 -4 Z" fill="#5fd39a" stroke={OL} strokeWidth={3} opacity={0.95} />
          <circle cx={0} cy={-44} r={5} fill={C.red} stroke={OL} strokeWidth={2} />
        </g>
      );
      break;
    default:
      food = (
        <g>
          <rect x={-22} y={-26} width={44} height={22} rx={4} fill="#ff9ec0" stroke={OL} strokeWidth={3} />
          <rect x={-14} y={-42} width={28} height={16} rx={4} fill="#fff3d6" stroke={OL} strokeWidth={3} />
          <path d="M 0 -42 L 0 -52" stroke={OL} strokeWidth={3} />
          <path d="M 0 -60 Q 4 -54 0 -52 Q -4 -54 0 -60 Z" fill={C.yellow} />
        </g>
      );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse cx={0} cy={0} rx={38} ry={10} fill="#fff" stroke={OL} strokeWidth={3} />
      {food}
    </g>
  );
};

// звёзды на ночном небе
const Stars: React.FC<{ t: number; x0: number; x1: number; y0: number; y1: number; n?: number; o?: number }> = ({ t, x0, x1, y0, y1, n = 34, o = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={x0 + rnd(i, 1) * (x1 - x0)} cy={y0 + rnd(i, 2) * (y1 - y0)} r={1.5 + rnd(i, 4) * 2.5} fill="#fff" opacity={0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + rnd(i, 6)) + i))} />
    ))}
  </g>
);

const Cloud: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 0.9 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={70} ry={26} fill="#fff" />
    <circle cx={-26} cy={-14} r={28} fill="#fff" />
    <circle cx={18} cy={-22} r={34} fill="#fff" />
  </g>
);

// ── g01. Праздник в Во-ле-Виконт ──
export const Feast: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kYear = pop(t, at(c, 0.04));
  const kGarden = ramp(t, at(c, 0.1), 1.2);
  const kFouquet = pop(t, at(c, 0.4));
  const kKing = pop(t, at(c, 0.57));
  const kTable = ramp(t, at(c, 0.7), 0.8);
  const kMus = pop(t, at(c, 0.82));
  const dish0 = at(c, 1.03);
  const kMusic = ramp(t, at(c, 1.14), 1);
  const jet = 0.55 + 0.45 * ramp(t, at(c, 1.28), 1.4);
  const fw0 = at(c, 1.4);
  const kStage = pop(t, at(c, 1.57));
  const fws = [
    { x: 300, y: 240, col: C.gold },
    { x: 980, y: 190, col: C.coral },
    { x: 720, y: 300, col: C.sky },
    { x: 470, y: 170, col: C.violet },
    { x: 1150, y: 270, col: "#7fe3a8" },
  ];
  const noteN = kMus > 0 ? 3 + Math.round(kMusic * 4) : 0;
  return (
    <g>
      <defs>
        <linearGradient id="g01sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2552" />
          <stop offset="0.7" stopColor="#3f3a7e" />
          <stop offset="1" stopColor="#6b55a0" />
        </linearGradient>
        <linearGradient id="g01lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f6650" />
          <stop offset="1" stopColor="#1f4636" />
        </linearGradient>
        <clipPath id="g01clip">
          <rect x={70} y={110} width={1260} height={730} rx={40} />
        </clipPath>
      </defs>
      <rect x={76} y={120} width={1260} height={730} rx={40} fill="#24324a" opacity={0.12} />
      <g clipPath="url(#g01clip)">
        <rect x={70} y={110} width={1260} height={380} fill="url(#g01sky)" />
        <Stars t={t} x0={90} x1={1310} y0={125} y1={420} n={40} />
        <g transform="translate(1235 190)">
          <circle r={42} fill="#fff6c8" />
          <circle cx={16} cy={-10} r={38} fill="#2a2f62" />
        </g>
        {/* фейерверк над каналом */}
        {t > fw0 &&
          fws.map((f, i) => {
            const period = 2.4;
            const loc = t - fw0 - i * 0.45;
            if (loc < 0) return null;
            const ph = loc % period;
            const n = Math.floor(loc / period);
            const fx = f.x + (rnd(n, i) - 0.5) * 80;
            const fy = f.y + (rnd(n, i + 9) - 0.5) * 50;
            const rise = clamp01(ph / 0.45);
            const k = (ph - 0.45) / 1.3;
            return (
              <g key={i}>
                {ph < 0.45 && <circle cx={fx} cy={480 - (480 - fy) * rise} r={5} fill="#fff6c8" />}
                {ph < 0.45 && <path d={`M ${fx} ${480 - (480 - fy) * rise + 6} L ${fx} ${480 - (480 - fy) * rise + 40}`} stroke="#fff6c8" strokeWidth={3} opacity={0.5} />}
                {k > 0 && k < 1 && <circle cx={fx} cy={fy} r={30 + k * 120} fill={f.col} opacity={0.18 * (1 - k)} />}
                <Firework x={fx} y={fy} k={k} color={f.col} r={110} />
                {k > 0 && k < 1 && <ellipse cx={fx} cy={500} rx={50} ry={7} fill={f.col} opacity={0.5 * (1 - k)} />}
              </g>
            );
          })}
        <Chateau x={640} y={482} s={0.78} t={t} />
        {/* канал */}
        <rect x={70} y={482} width={1260} height={40} fill="#3a4f8f" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M ${120 + i * 180 + ((t * 30) % 60)} ${494 + (i % 2) * 14} l 50 0`} stroke="#ffd76a" strokeWidth={3} opacity={0.45} strokeLinecap="round" />
        ))}
        {/* сад */}
        <rect x={70} y={520} width={1260} height={330} fill="url(#g01lawn)" />
        <path d="M 540 850 L 620 520 L 660 520 L 740 850 Z" fill="#e7d7b2" opacity={0.25} />
        <g opacity={kGarden}>
          {[110, 470, 820, 1300].map((bx, i) => (
            <g key={i} transform={`translate(${bx} 540)`}>
              <path d="M -18 0 L 0 -62 L 18 0 Z" fill="#23895a" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
              <rect x={-6} y={0} width={12} height={10} fill="#8a5a2b" />
            </g>
          ))}
          <Fountain x={330} y={556} t={t} h={110 * jet} s={0.9} />
          <Fountain x={990} y={556} t={t + 0.4} h={110 * jet} s={0.9} />
          {[200, 560, 760, 1100].map((lx, i) => (
            <g key={i} transform={`translate(${lx} 600)`}>
              <rect x={-4} y={-50} width={8} height={50} fill="#3b2a10" />
              <circle cx={0} cy={-58} r={14 + Math.sin(t * 5 + i) * 2} fill="#ffd76a" opacity={0.35} />
              <path d={`M 0 ${-70 - Math.sin(t * 8 + i) * 3} Q 8 -58 0 -50 Q -8 -58 0 ${-70 - Math.sin(t * 8 + i) * 3} Z`} fill="#ffb13b" />
            </g>
          ))}
        </g>
        {/* музыканты */}
        <Show k={kMus} dy={20}>
          {[150, 248].map((mx, i) => (
            <Figure
              key={i}
              x={mx}
              y={760}
              s={0.58}
              t={t}
              role="artist"
              body={i ? "#6d4bc4" : undefined}
              mood="happy"
              arms={[60 + Math.sin(t * 5 + i) * 18, 95 + Math.sin(t * 5 + i * 2) * 10]}
              hold={<path d="M -6 -10 Q 16 -24 22 -6 Q 28 12 6 16 Q -14 18 -6 -10 Z" fill="#b8642c" stroke={OL} strokeWidth={3} />}
            />
          ))}
          {Array.from({ length: noteN }).map((_, i) => {
            const u = (t * 0.35 + i / Math.max(1, noteN)) % 1;
            return <Note key={i} x={200 + Math.sin(u * 7 + i) * 50 + u * 60} y={560 - u * 300} s={0.9 + 0.3 * rnd(i, 2)} o={Math.sin(u * Math.PI)} color={i % 2 ? C.goldLight : "#fff"} />;
          })}
        </Show>
        {/* король за столом */}
        {kKing > 0.001 && (
          <g opacity={clamp01(kKing * 1.5)}>
            <Figure x={640} y={720} s={0.8} t={t} role="king" mood="proud" arms={[18, 34]} look={0.7} />
          </g>
        )}
        {/* длинный стол */}
        <Show k={kTable} dy={30}>
          <rect x={330} y={668} width={630} height={18} rx={6} fill="#fffaf0" stroke={OL} strokeWidth={4} />
          <path d={`M 334 686 L 956 686 L 956 748 ${Array.from({ length: 9 })
            .map((_, i) => `Q ${956 - i * 69 - 34} 770 ${956 - (i + 1) * 69} 748`)
            .join(" ")} Z`} fill="#fff3d6" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 334 700 L 956 700" stroke={C.velvet} strokeWidth={8} />
          {[400, 880].map((cx, i) => (
            <g key={i}>
              <rect x={cx - 5} y={612} width={10} height={56} fill={C.gold} stroke={OL} strokeWidth={2} />
              <path d={`M ${cx} ${598 - Math.sin(t * 9 + i) * 3} Q ${cx + 7} 610 ${cx} 614 Q ${cx - 7} 610 ${cx} ${598 - Math.sin(t * 9 + i) * 3} Z`} fill="#ffb13b" />
              <circle cx={cx} cy={606} r={16} fill="#ffd76a" opacity={0.3} />
            </g>
          ))}
        </Show>
        {Array.from({ length: 7 }).map((_, i) => (
          <Dish key={i} x={420 + i * 75} y={670} kind={i} k={pop(t, dish0 + i * 0.28)} t={t} />
        ))}
        <Pop t={t} at={dish0 + 2.0} x={645} y={812}>
          <Pill x={0} y={0} text="7 перемен" size={32} fill={C.gold} />
        </Pop>
        {/* Фуке в поклоне */}
        {kFouquet > 0.001 && (
          <g opacity={clamp01(kFouquet * 1.5)}>
            <Figure x={1040} y={812} s={0.86} t={t} role="minister" mood="happy" flip bow={0.62 + 0.08 * Math.sin(t * 1.4)} arms={[20, 78]} look={0.4} />
          </g>
        )}
        {/* сцена «Мольер» */}
        <Grow k={kStage} x={1230} y={650}>
          <ellipse cx={1230} cy={652} rx={130} ry={16} fill="#000" opacity={0.15} />
          <rect x={1140} y={430} width={180} height={190} fill="#4a2333" />
          <path d={`M 1140 430 L 1185 430 Q ${1170 + Math.sin(t * 1.3) * 4} 520 1160 620 L 1140 620 Z`} fill={C.velvet} stroke={OL} strokeWidth={3} />
          <path d={`M 1320 430 L 1275 430 Q ${1290 - Math.sin(t * 1.3) * 4} 520 1300 620 L 1320 620 Z`} fill={C.velvet} stroke={OL} strokeWidth={3} />
          <path d="M 1130 440 Q 1230 400 1330 440 L 1330 420 L 1130 420 Z" fill={C.gold} stroke={OL} strokeWidth={4} />
          <path d="M 1150 460 Q 1230 500 1310 460" fill="none" stroke={C.velvetDeep} strokeWidth={10} strokeLinecap="round" />
          <path d={`M 1190 430 L 1270 430 L 1300 620 L 1160 620 Z`} fill="#fff7cf" opacity={0.18 + 0.05 * Math.sin(t * 2)} />
          <Figure x={1230} y={622} s={0.5} t={t} role="artist" mood="talk" talk={0.8} arms={[40 + Math.sin(t * 2.2) * 30, 120 + Math.sin(t * 1.7) * 25]} />
          <rect x={1126} y={618} width={208} height={36} rx={6} fill="#a87444" stroke={OL} strokeWidth={4} />
          <rect x={1160} y={372} width={140} height={46} rx={10} fill={C.night} stroke={C.gold} strokeWidth={3} />
          <text x={1230} y={406} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={32} fill={C.goldLight}>
            Мольер
          </text>
        </Grow>
        {/* подписи */}
        <Pop t={t} at={at(c, 0.6)} x={640} y={395}>
          <Pill x={0} y={0} text="Людовик XIV" size={30} serif />
        </Pop>
        <Pop t={t} at={at(c, 0.43)} x={1050} y={500}>
          <Pill x={0} y={0} text="Фуке" size={30} serif />
        </Pop>
      </g>
      <Show k={kYear} dy={-16}>
        <Year x={190} y={170} text="1661" k={1} />
        <text x={286} y={182} fontFamily={SERIF} fontWeight={700} fontSize={32} fill="#fff6dc">
          замок Во-ле-Виконт
        </text>
      </Show>
    </g>
  );
};

// ── g02. Арест наутро ──
export const Arrest: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fadeK = ramp(t, at(c, 0.05), 3.5);
  const walkK = ramp(t, at(c, 0.1), 2.6);
  const handK = ramp(t, at(c, 0.3), 0.7);
  const kTag = pop(t, at(c, 0.43));
  const kMount = ramp(t, at(c, 0.53), 1.4);
  const kYears = pop(t, at(c, 0.6));
  const kCell = pop(t, at(c, 0.8));
  const kQ = pop(t, at(c, 1.05));
  const mx = 130 + (600 - 130) * walkK;
  const walking = walkK > 0.001 && walkK < 0.999 ? 1 : 0;
  const s = 1.05;
  const bob = Math.sin(t * 2.6 + mx * 0.01) * 2 + (walking ? Math.abs(Math.sin(t * 7)) * -6 : 0);
  const fMood = handK > 0.4 ? (t > at(c, 1) ? "sad" : "shock") : "happy";
  return (
    <g>
      <defs>
        <linearGradient id="g02sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd8f0" />
          <stop offset="1" stopColor="#f8e6cc" />
        </linearGradient>
        <clipPath id="g02clip">
          <rect x={70} y={110} width={1260} height={730} rx={40} />
        </clipPath>
      </defs>
      <rect x={76} y={120} width={1260} height={730} rx={40} fill="#24324a" opacity={0.12} />
      <g clipPath="url(#g02clip)">
        <rect x={70} y={110} width={1260} height={460} fill="url(#g02sky)" />
        <circle cx={190} cy={250} r={70} fill="#fff1c4" opacity={0.9} />
        <circle cx={190} cy={250} r={100} fill="#fff1c4" opacity={0.3} />
        <Cloud x={420 + ((t * 12) % 300)} y={180} s={0.9} />
        <Cloud x={820 + ((t * 8) % 200)} y={230} s={0.7} o={0.75} />
        {/* горы и башня-тюрьма */}
        {kMount > 0.001 && (
          <g opacity={clamp01(kMount * 1.3)} transform={`translate(0 ${60 + (1 - kMount) * 90})`}>
            <path d="M 860 572 L 960 410 L 1030 470 L 1120 300 L 1210 430 L 1270 380 L 1340 470 L 1340 572 Z" fill="#8d9ab8" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
            <path d="M 1120 300 L 1092 352 L 1108 344 L 1120 360 L 1134 342 L 1150 356 Z" fill="#fff" />
            <path d="M 960 410 L 944 436 L 962 430 L 976 440 Z" fill="#fff" />
            <path d="M 1270 380 L 1256 404 L 1272 398 L 1286 406 Z" fill="#fff" />
            <path d="M 990 572 Q 1040 520 1010 480 Q 1060 440 1100 360" stroke="#c9b48a" strokeWidth={5} fill="none" strokeDasharray="12 10" />
            <g transform="translate(1120 306)">
              <rect x={-26} y={-110} width={52} height={110} fill={C.stoneDeep} stroke={OL} strokeWidth={4} />
              {[-20, -4, 12].map((d, i) => (
                <rect key={i} x={d - 2} y={-124} width={12} height={16} fill={C.stoneDeep} stroke={OL} strokeWidth={3} />
              ))}
              <rect x={-9} y={-82} width={18} height={26} fill="#2b2f55" />
              <path d="M -3 -82 L -3 -56 M 3 -82 L 3 -56" stroke="#cfd6e4" strokeWidth={2} />
            </g>
          </g>
        )}
        {/* тот же замок блекнет */}
        <g opacity={1 - 0.62 * fadeK}>
          <Chateau x={370} y={572} s={0.62} t={t} lit={0} wall={interpolateColors(fadeK, [0, 1], ["#f4e6c8", "#d9d6d0"])} />
        </g>
        {/* земля */}
        <rect x={70} y={570} width={1260} height={280} fill="#9fd28c" />
        <rect x={70} y={570} width={1260} height={14} fill="#86c074" />
        <path d="M 260 850 L 330 572 L 410 572 L 480 850 Z" fill="#e9dcb8" opacity={0.6} />
        {/* одиночная камера крупно */}
        <Grow k={kCell} x={1150} y={640}>
          <path d="M 1120 380 L 1080 560" stroke={C.inkSoft} strokeWidth={3} strokeDasharray="8 8" opacity={0.6} />
          <circle cx={1150} cy={650} r={112} fill={C.stone} stroke={OL} strokeWidth={5} />
          <circle cx={1150} cy={650} r={88} fill="#2f3360" stroke={OL} strokeWidth={4} />
          <circle cx={1150} cy={640} r={40 + Math.sin(t * 3) * 3} fill="#ffd76a" opacity={0.18} />
          <rect x={1144} y={650} width={12} height={34} rx={3} fill="#fff3d6" stroke={OL} strokeWidth={2} />
          <path d={`M 1150 ${622 - Math.sin(t * 7) * 3} Q 1158 640 1150 648 Q 1142 640 1150 ${622 - Math.sin(t * 7) * 3} Z`} fill="#ffb13b" />
          {[-54, -18, 18, 54].map((d) => (
            <rect key={d} x={1150 + d - 5} y={566} width={10} height={168} fill="#6e7891" stroke={OL} strokeWidth={2} />
          ))}
          <rect x={1066} y={622} width={168} height={10} fill="#6e7891" stroke={OL} strokeWidth={2} />
        </Grow>
        {/* Фуке */}
        <Figure x={730} y={812} s={s} t={t} role="minister" mood={fMood} flip arms={handK > 0.4 ? [34, 30] : [14, 14]} look={0.6} />
        {/* мушкетёр */}
        <g opacity={clamp01(walkK * 6)}>
          <Figure x={mx} y={812} s={s} t={t} role="soldier" mood="neutral" walk={walking} arms={[8, 10 + 85 * handK]} look={0.5} />
          <g transform={`translate(${mx} ${812 + bob}) scale(${s})`}>
            <path d="M -12 -150 L 12 -150 M 0 -164 L 0 -124" stroke="#e8edf5" strokeWidth={8} strokeLinecap="round" />
            <g transform="translate(0 -250)">
              <path d="M 18 -40 Q 70 -78 92 -28 Q 60 -52 26 -30 Z" fill="#fff" stroke={OL} strokeWidth={3} />
              <path d="M -38 0 Q -36 -46 0 -48 Q 36 -46 38 0 Z" fill="#2a3550" stroke={OL} strokeWidth={4} />
              <ellipse cx={0} cy={0} rx={70} ry={13} fill="#2a3550" stroke={OL} strokeWidth={4} />
              <path d="M -36 -10 L 36 -10" stroke={C.gold} strokeWidth={5} />
            </g>
          </g>
        </g>
        <Pop t={t} at={at(c, 0.13)} x={790} y={445}>
          <Pill x={0} y={0} text="Фуке" size={30} serif />
        </Pop>
        {kTag > 0.001 && (
          <g transform={`translate(${mx - 70} 438) scale(${kTag})`} opacity={clamp01(kTag * 1.5)}>
            <Pill x={0} y={0} text="д'Артаньян" size={32} serif fill={C.night} color={C.goldLight} />
          </g>
        )}
        {kQ > 0.001 && (
          <g transform={`translate(${770 + wob(t, 1, 4)} ${300 + wob(t, 2, 6)}) rotate(${wob(t, 3, 3)}) scale(${kQ * (1 + 0.04 * Math.sin(t * 3))})`}>
            <circle r={92} fill={C.yellow} opacity={0.3} />
            <Out x={0} y={62} size={190} color={C.coral} sw={14}>
              ?
            </Out>
          </g>
        )}
      </g>
      {kYears > 0.001 && (
        <g transform={`translate(1150 175) scale(${kYears})`} opacity={clamp01(kYears * 1.5)}>
          <rect x={-120} y={-46} width={240} height={86} rx={16} fill={C.night} stroke={C.gold} strokeWidth={4} />
          <text x={0} y={18} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={54} fill={C.goldLight}>
            20 лет
          </text>
        </g>
      )}
    </g>
  );
};

// ── g03. Главный вопрос фильма ──
const QCard: React.FC<{ x: number; y: number; w: number; num: string; text: string; color: string; t: number; glow?: number }> = ({ x, y, w, num, text, color, glow = 0 }) => (
  <g>
    {glow > 0 && <rect x={x - 10} y={y - 10} width={w + 20} height={180} rx={44} fill={color} opacity={0.18 * glow} />}
    <Panel x={x} y={y} w={w} h={160} r={36} />
    <rect x={x} y={y} width={16} height={160} rx={8} fill={color} />
    <circle cx={x + 76} cy={y + 80} r={42} fill={color} stroke={OL} strokeWidth={4} />
    <Txt x={x + 76} y={y + 98} size={50} weight={900} color="#fff">
      {num}
    </Txt>
    <Txt x={x + 138} y={y + 68} size={42} weight={900} anchor="start">
      {text}
    </Txt>
  </g>
);

export const BigQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kBook = pop(t, at(c, 0.05));
  const kStamp = pop(t, at(c, 0.32));
  const kBoard = ramp(t, at(c, 0.55), 0.9);
  const kKing = pop(t, at(c, 0.65));
  const kPawn = pop(t, at(c, 0.75));
  const kQ1 = pop(t, at(c, 1.2));
  const kQ2 = pop(t, at(c, 1.52));
  const q1g = kQ1 > 0 && t < at(c, 1.52) ? 1 : 0.35;
  const hop = kQ2 > 0.5 ? Math.abs(Math.sin(t * 3.2)) * 16 : 0;
  return (
    <g>
      {/* книга слева */}
      {kBook > 0.001 && (
        <g transform={`translate(350 ${560 + wob(t, 0, 5)}) scale(${kBook}) translate(-350 -560)`} opacity={clamp01(kBook * 1.5)}>
          <circle cx={350} cy={560} r={260} fill="#fff" opacity={0.35} />
          <GreeneBook x={340} y={560} s={0.9} rot={-4 + wob(t, 1, 1.2)} />
          <Sparkles x={350} y={560} r={250} t={t} n={8} />
        </g>
      )}
      {kStamp > 0.001 && (
        <g transform={`translate(400 820) rotate(-6) scale(${1.6 - 0.6 * clamp01(kStamp)})`} opacity={clamp01(kStamp * 1.5)}>
          <rect x={-190} y={-40} width={380} height={66} rx={12} fill="#fff" stroke={C.red} strokeWidth={5} />
          <Txt x={0} y={7} size={36} weight={900} color={C.red}>
            скандальная книга
          </Txt>
        </g>
      )}
      {/* шахматы справа */}
      <g opacity={clamp01(kBoard * 1.5)}>
        <ellipse cx={1570} cy={800} rx={300} ry={26} fill="#000" opacity={0.08 * kBoard} />
        <Board x={1570} y={770} w={500} k={kBoard} />
      </g>
      {kKing > 0.001 && (
        <g>
          {kQ1 > 0 && <circle cx={1660} cy={560} r={120} fill={C.goldLight} opacity={0.45 * q1g * (0.8 + 0.2 * Math.sin(t * 3))} />}
          <Chess x={1660} y={680 + (1 - clamp01(kKing)) * -80} s={1.05} kind="king" dark rot={wob(t, 2, 1.5)} />
        </g>
      )}
      {kPawn > 0.001 && (
        <g>
          {kQ2 > 0 && <ellipse cx={1470} cy={748} rx={70} ry={18} fill={C.yellow} opacity={0.6} />}
          <Chess x={1470} y={750 - hop - (1 - clamp01(kPawn)) * 80} s={0.95} kind="pawn" rot={wob(t, 4, 2)} />
        </g>
      )}
      {/* два вопроса */}
      {kQ1 > 0.001 && (
        <g transform={`translate(350 195) scale(${kQ1}) translate(-350 -195)`} opacity={clamp01(kQ1 * 1.5)}>
          <QCard x={70} y={115} w={570} num="1" text={"Как устроены\nигры власти?"} color={C.purple} t={t} glow={q1g === 1 ? 1 : 0} />
        </g>
      )}
      {kQ2 > 0.001 && (
        <g transform={`translate(1570 195) scale(${kQ2}) translate(-1570 -195)`} opacity={clamp01(kQ2 * 1.5)}>
          <QCard x={1285} y={115} w={570} num="2" text={"Как не стать\nпешкой?"} color={C.green} t={t} glow={0.6 + 0.4 * Math.sin(t * 2.5)} />
        </g>
      )}
    </g>
  );
};

// ── g04. Книга и наш подход ──
const SELECTED = new Set([1, 2, 4, 5, 6, 9, 11, 12, 17, 18, 19, 22, 23, 29, 32, 33, 35, 39, 40, 43, 46, 47, 48]);

const YearPlate: React.FC<{ x: number; y: number; year: string; sub: string; color?: string }> = ({ x, y, year, sub, color = C.night }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-170} y={-82} width={340} height={164} rx={26} fill="#24324a" opacity={0.1} transform="translate(5 8)" />
    <rect x={-170} y={-82} width={340} height={164} rx={26} fill="#fff" />
    <rect x={-170} y={-82} width={340} height={92} rx={26} fill={color} />
    <rect x={-170} y={-10} width={340} height={20} fill={color} />
    <text x={0} y={-8} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={70} fill={C.goldLight}>
      {year}
    </text>
    <Txt x={0} y={58} size={32} weight={800} color={C.inkSoft}>
      {sub}
    </Txt>
  </g>
);

const Magnifier: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 30 30 L 72 72" stroke={OL} strokeWidth={18} strokeLinecap="round" />
    <path d="M 30 30 L 72 72" stroke={C.brown} strokeWidth={10} strokeLinecap="round" />
    <circle r={46} fill="#e6f6ff" stroke={OL} strokeWidth={6} />
    <path d="M -24 -14 Q -16 -30 2 -32" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);

export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kBook = pop(t, at(c, 0.12));
  const k1998 = pop(t, at(c, 0.32));
  const kArr = ramp(t, at(c, 0.6), 0.6);
  const k2003 = pop(t, at(c, 0.7));
  const kCyn = pop(t, at(c, 1.22));
  const kQuote = pop(t, at(c, 1.42));
  const kC = ramp(t, at(c, 2), 0.9);
  const sel0 = at(c, 2.18);
  const kDam = pop(t, at(c, 2.56));
  const kLeg = ramp(t, at(c, 2.62), 0.6);
  // книга: крупно → уменьшается и уезжает влево, освобождая место сетке
  const bx = 850 - 120 * kC;
  const by = 460 - 20 * kC;
  const bs = 1.08 - 0.38 * kC;
  const gx = 965;
  const gy = 135;
  const TW = 100;
  const TH = 88;
  const G = 10;
  return (
    <g>
      {kBook > 0.001 && (
        <g transform={`translate(${bx} ${by + wob(t, 0, 4)}) scale(${kBook}) translate(${-bx} ${-by})`} opacity={clamp01(kBook * 1.5)}>
          <circle cx={bx} cy={by} r={280 * bs} fill="#fff" opacity={0.35} />
          <GreeneBook x={bx} y={by} s={bs} rot={-3 + wob(t, 1, 1)} />
          {kCyn > 0.001 && (
            <g transform={`translate(${bx + 120 * bs} ${by - 200 * bs}) rotate(12) scale(${bs * (1.5 - 0.5 * clamp01(kCyn))})`} opacity={clamp01(kCyn * 1.5) * (1 - kC)}>
              <rect x={-130} y={-42} width={260} height={74} rx={12} fill="#fff" opacity={0.85} stroke={C.red} strokeWidth={6} />
              <Txt x={0} y={10} size={44} weight={900} color={C.red}>
                цинично
              </Txt>
            </g>
          )}
        </g>
      )}
      {/* годы */}
      <g opacity={1 - kC}>
        <Pop t={t} at={at(c, 0.32)} x={1290} y={250}>
          <YearPlate x={0} y={0} year="1998" sub="вышла книга" color={C.velvetDeep} />
        </Pop>
        {k1998 > 0 && <Arrow x1={1360} y1={340} x2={1530} y2={420} k={kArr} color={C.inkSoft} w={8} bend={0.2} />}
        <Pop t={t} at={at(c, 0.7)} x={1620} y={510}>
          <YearPlate x={0} y={0} year="2003" sub="русский перевод" color={C.purpleDeep} />
        </Pop>
        {k2003 > 0 && kQuote <= 0 && <Sparkles x={1620} y={510} r={200} t={t} n={6} />}
      </g>
      {/* цитата переводчика */}
      {kQuote > 0.001 && (
        <g opacity={1 - kC} transform={`translate(1360 720) scale(${kQuote}) translate(-1360 -720)`}>
          <Panel x={1060} y={640} w={790} h={180} r={32} stroke={C.green} />
          <Magnifier x={1150} y={720} s={0.8} rot={wob(t, 2, 4)} />
          <Txt x={1240} y={712} size={40} weight={900} anchor="start">
            {"Не учит подлости —"}
          </Txt>
          <Txt x={1240} y={762} size={40} weight={900} anchor="start" color={C.greenDeep}>
            {"помогает её распознать"}
          </Txt>
          <Txt x={1820} y={806} size={26} weight={700} anchor="end" color={C.inkSoft}>
            {"— переводчик"}
          </Txt>
        </g>
      )}
      {/* 48 законов */}
      {kC > 0.001 &&
        Array.from({ length: 48 }).map((_, i) => {
          const n = i + 1;
          const col = i % 8;
          const row = Math.floor(i / 8);
          const k = pop(t, at(c, 2.02) + (row + col) * 0.07);
          if (k <= 0.001) return null;
          const x = gx + col * (TW + G);
          const y = gy + row * (TH + G);
          const isSel = SELECTED.has(n);
          const selK = isSel ? ramp(t, sel0 + [...SELECTED].indexOf(n) * 0.05, 0.35) : 0;
          const dim = !isSel && t > sel0 ? 1 - 0.35 * ramp(t, sel0, 0.6) : 1;
          const dam = n === 20 || n === 21;
          const dk = dam ? kDam : 0;
          const cx = x + TW / 2;
          const cy = y + TH / 2;
          const lift = 0;
          return (
            <g key={n} transform={`translate(${cx} ${cy + lift}) scale(${k}) translate(${-cx} ${-cy})`} opacity={dim}>
              <rect x={x + 3} y={y + 6} width={TW} height={TH} rx={16} fill="#24324a" opacity={0.1} />
              <rect x={x} y={y} width={TW} height={TH} rx={16} fill={dk > 0.5 ? "#d4d0c8" : interpolateColors(selK, [0, 1], ["#fffdf6", C.gold])} stroke={dk > 0.5 ? "#9c917f" : selK > 0.5 ? C.goldDeep : "#e6d9b8"} strokeWidth={4} strokeDasharray={dk > 0.5 ? "10 7" : undefined} />
              <Txt x={cx} y={cy + 15} size={42} weight={900} color={dk > 0.5 ? "#9c917f" : selK > 0.5 ? C.ink : C.inkSoft}>
                {String(n)}
              </Txt>
              {dk > 0.5 && <path d={`M ${x + 14} ${y + 18} L ${x + 40} ${y + 40} L ${x + 30} ${y + 52} L ${x + 62} ${y + 74}`} stroke="#8a8072" strokeWidth={4} fill="none" strokeLinejoin="round" />}
              {dk > 0.5 && <path d={`M ${x + TW - 26} ${y} L ${x + TW} ${y} L ${x + TW} ${y + 26} Z`} fill={C.stoneDeep} />}
            </g>
          );
        })}
      {kDam > 0.001 && (
        <g opacity={clamp01(kDam * 1.5)}>
          <rect x={gx + 3 * (TW + G) - 8} y={gy + 2 * (TH + G) - 8} width={2 * TW + G + 16} height={TH + 16} rx={20} fill="none" stroke={C.red} strokeWidth={5} strokeDasharray="14 10" strokeDashoffset={-t * 20} />
        </g>
      )}
      {kLeg > 0.001 && (
        <Show k={kLeg} dy={16}>
          <rect x={985} y={752} width={44} height={36} rx={9} fill={C.gold} stroke={C.goldDeep} strokeWidth={3} />
          <Txt x={1042} y={782} size={32} anchor="start">
            выбрали
          </Txt>
          <rect x={1250} y={752} width={44} height={36} rx={9} fill="#d4d0c8" stroke="#9c917f" strokeWidth={3} strokeDasharray="6 4" />
          <Txt x={1307} y={782} size={32} anchor="start" color={C.inkSoft}>
            страницы повреждены
          </Txt>
        </Show>
      )}
    </g>
  );
};

// ── g30. Книга наоборот: прививка ──
const Shield: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const blink = (t % 3.4) < 0.14 ? 0.15 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={210} rx={130} ry={14} fill="#000" opacity={0.1} />
      <path d="M 0 -190 L 160 -130 Q 166 70 0 190 Q -166 70 -160 -130 Z" fill={C.skyDeep} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 0 -160 L 130 -112 Q 134 56 0 158 Q -134 56 -130 -112 Z" fill={C.sky} />
      <path d="M -90 -100 Q -96 -10 -70 50" stroke="#fff" strokeWidth={10} opacity={0.35} fill="none" strokeLinecap="round" />
      {/* глаз: «замечать» */}
      <path d="M -82 -10 Q 0 -78 82 -10 Q 0 58 -82 -10 Z" fill="#fff" stroke={OL} strokeWidth={5} />
      <g transform={`scale(1 ${blink})`} >
        <circle cx={Math.sin(t * 0.9) * 10} cy={-10} r={28} fill={C.greenDeep} stroke={OL} strokeWidth={4} />
        <circle cx={Math.sin(t * 0.9) * 10} cy={-10} r={12} fill={OL} />
        <circle cx={Math.sin(t * 0.9) * 10 + 8} cy={-18} r={5} fill="#fff" />
      </g>
      <circle cx={0} cy={86} r={30} fill="#fff" stroke={OL} strokeWidth={4} />
      <Check x={0} y={86} s={34} k={1} />
    </g>
  );
};

export const MirrorBook: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kBook = pop(t, at(c, 0.05));
  const kLab = pop(t, at(c, 0.42));
  const kArc = ramp(t, at(c, 0.58), 0.8);
  const f0 = at(c, 0.62);
  const f1 = at(c, 0.8);
  const fp = clamp01((t - f0) / (f1 - f0));
  const flying = t > f0 && t < f1;
  const kShield = pop(t, f1 - 0.05);
  const kRib = pop(t, at(c, 0.86));
  const kSub = pop(t, at(c, 0.92));
  // путь отражения: дуга над бананом
  const P0 = [470, 300];
  const P1 = [960, 120];
  const P2 = [1450, 300];
  const ep = fp < 0.5 ? 2 * fp * fp : 1 - Math.pow(-2 * fp + 2, 2) / 2;
  const qx = (1 - ep) * (1 - ep) * P0[0] + 2 * (1 - ep) * ep * P1[0] + ep * ep * P2[0];
  const qy = (1 - ep) * (1 - ep) * P0[1] + 2 * (1 - ep) * ep * P1[1] + ep * ep * P2[1];
  const flipX = Math.cos(ep * Math.PI);
  const arcLen = 1100;
  return (
    <g>
      {/* книга-«инструкция манипулятора» */}
      {kBook > 0.001 && (
        <g transform={`translate(350 ${480 + wob(t, 0, 4)}) scale(${kBook}) translate(-350 -480)`} opacity={clamp01(kBook * 1.5) * (flying || t > f1 ? 0.85 : 1)}>
          <GreeneBook x={345} y={480} s={0.78} rot={-4} icon="mask" cover="#4a2f5c" />
        </g>
      )}
      <Show k={kLab} dy={20}>
        <Txt x={350} y={745} size={42} weight={900} color={C.purpleDeep}>
          {"тактики\nманипулятора"}
        </Txt>
      </Show>
      {/* дуга-зеркало */}
      {kArc > 0.001 && (
        <g>
          <path d={`M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke={C.inkSoft} strokeWidth={8} strokeDasharray={`${arcLen}`} strokeDashoffset={arcLen * (1 - kArc)} strokeLinecap="round" opacity={0.5} />
          <path d={`M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="4 22" strokeDashoffset={-t * 40} opacity={0.9 * kArc} />
          {kArc > 0.98 && <path d="M 1450 300 L 1412 292 M 1450 300 L 1436 264" stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round" opacity={0.5} />}
          {/* зеркало на вершине дуги */}
          <g transform={`translate(960 ${184 + wob(t, 2, 2)}) scale(${1 + 0.12 * Math.sin(clamp01((t - f0) / (f1 - f0)) * Math.PI)})`} opacity={clamp01(kArc * 2)}>
            <ellipse rx={36} ry={48} fill="#dff3ff" stroke={OL} strokeWidth={5} />
            <path d="M -14 -24 L 10 -34 M -18 -6 L 18 -22" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
            <rect x={-6} y={46} width={12} height={22} fill={C.goldDeep} stroke={OL} strokeWidth={3} />
          </g>
          <Show k={ramp(t, at(c, 0.7), 0.5)} dy={10}>
            <Out x={960} y={128} size={34} color={C.inkSoft}>
              читать наоборот
            </Out>
          </Show>
        </g>
      )}
      {/* книга переворачивается и становится щитом */}
      {flying && (
        <g transform={`translate(${qx} ${qy}) rotate(${(ep - 0.5) * 30}) scale(${0.27 * Math.max(0.06, Math.abs(flipX))} 0.27)`}>
          {flipX > 0 ? <GreeneBook x={0} y={0} icon="mask" cover="#4a2f5c" /> : <Shield x={0} y={0} t={t} />}
        </g>
      )}
      {flying && <Sparkles x={qx} y={qy} r={70} t={t * 3} n={6} color="#fff" />}
      {kShield > 0.001 && (
        <g transform={`translate(1570 ${470 + wob(t, 3, 4)}) scale(${0.9 * kShield})`}>
          <circle r={250} fill="#fff" opacity={0.3 + 0.1 * Math.sin(t * 3)} />
          <Shield x={0} y={0} t={t} />
        </g>
      )}
      {kShield > 0.5 && <Sparkles x={1570} y={470} r={240} t={t} n={8} color={C.goldLight} />}
      {kRib > 0.001 && (
        <g transform={`translate(1570 660) scale(${kRib}) rotate(${wob(t, 5, 1.2)})`}>
          <rect x={-150} y={-42} width={300} height={78} rx={18} fill={C.green} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={14} size={44} weight={900} color="#fff">
            прививка
          </Txt>
        </g>
      )}
      <Show k={kSub} dy={16}>
        <Txt x={1570} y={758} size={36} weight={800} color={C.inkSoft}>
          {"признаки, которые\nнужно замечать"}
        </Txt>
      </Show>
    </g>
  );
};

// ── g39. Цена успеха ──
const Weight: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.inkSoft }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-30} r={10} fill="none" stroke={OL} strokeWidth={6} />
    <path d="M -22 -22 L 22 -22 L 30 22 L -30 22 Z" fill="#4a5874" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-24} y={-4} width={48} height={10} fill={color} />
  </g>
);

const PRICES: { name: string; price: string; color: string; beat: number }[] = [
  { name: "Фуке", price: "свобода", color: C.sky, beat: 0.47 },
  { name: "Бальбоа", price: "жизнь", color: C.coral, beat: 0.65 },
  { name: "Кир", price: "жизнь", color: C.violet, beat: 0.72 },
  { name: "Наполеон", price: "авторитет", color: C.green, beat: 0.83 },
];

export const PriceScale: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kScale = ramp(t, at(c, 0.02), 0.8);
  const kSuccess = pop(t, at(c, 0.28));
  const kTitle = pop(t, at(c, 0.05));
  const kQuote = pop(t, at(c, 1.25));
  const kSway = ramp(t, at(c, 2), 1.5);
  const drops = PRICES.map((p) => ramp(t, at(c, p.beat), 0.5));
  const landed = drops.reduce((a, d) => a + clamp01(d), 0);
  const base = -5 * clamp01(kSuccess) + 4.6 * landed;
  const theta = base * (1 - kSway) + (Math.sin(t * 1.15) * 7 + Math.sin(t * 0.5) * 2) * kSway + wob(t, 1, 0.5);
  const px = 490;
  const py = 380;
  const L = 300;
  const rad = (theta * Math.PI) / 180;
  const lx = px - L * Math.cos(rad);
  const ly = py - L * Math.sin(rad);
  const rx = px + L * Math.cos(rad);
  const ry = py + L * Math.sin(rad);
  const CH = 200;
  const pan = (x: number, y: number, label: string, color: string, children: React.ReactNode) => (
    <g>
      <path d={`M ${x} ${y} L ${x - 96} ${y + CH} M ${x} ${y} L ${x + 96} ${y + CH}`} stroke={C.goldDeep} strokeWidth={4} />
      {children}
      <path d={`M ${x - 116} ${y + CH} L ${x + 116} ${y + CH} Q ${x + 100} ${y + CH + 66} ${x} ${y + CH + 70} Q ${x - 100} ${y + CH + 66} ${x - 116} ${y + CH} Z`} fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <Txt x={x} y={y + CH + 46} size={32} weight={900} color="#fff">
        {label}
      </Txt>
      <circle cx={x} cy={y} r={9} fill={C.gold} stroke={OL} strokeWidth={3} />
    </g>
  );
  return (
    <g>
      {/* заголовок → цитата */}
      {kTitle > 0.001 && kQuote < 0.6 && (
        <g transform={`translate(490 175) scale(${kTitle * (1 - clamp01(kQuote))})`} opacity={1 - clamp01(kQuote * 1.6)}>
          <rect x={-200} y={-46} width={400} height={84} rx={20} fill={C.night} stroke={C.gold} strokeWidth={4} />
          <text x={0} y={14} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={46} fill={C.goldLight}>
            Цена успеха
          </text>
        </g>
      )}
      {kQuote > 0.001 && (
        <g transform={`translate(700 180) scale(${kQuote}) translate(-700 -180)`} opacity={clamp01(kQuote * 1.5)}>
          <Panel x={90} y={112} w={1230} h={140} r={34} stroke={C.gold} />
          <circle cx={170} cy={182} r={50} fill={C.gold} stroke={OL} strokeWidth={4} />
          <Txt x={170} y={200} size={50} weight={900} color="#fff">
            ½
          </Txt>
          <Txt x={245} y={163} size={30} weight={800} anchor="start" color={C.inkSoft}>
            Грин: половина умения —
          </Txt>
          <Txt x={245} y={222} size={42} weight={900} anchor="start">
            то, во что вы не позволяете себя втянуть
          </Txt>
        </g>
      )}
      {/* весы */}
      <g opacity={clamp01(kScale * 1.5)} transform={`translate(0 ${(1 - kScale) * 30})`}>
        <ellipse cx={px} cy={826} rx={200} ry={18} fill="#000" opacity={0.08} />
        <path d={`M ${px - 150} 826 Q ${px} 770 ${px + 150} 826 Z`} fill={C.goldDeep} stroke={OL} strokeWidth={5} />
        <rect x={px - 14} y={py} width={28} height={420} rx={10} fill={C.gold} stroke={OL} strokeWidth={5} />
        <g transform={`rotate(${theta} ${px} ${py})`}>
          <rect x={px - L - 10} y={py - 12} width={2 * L + 20} height={24} rx={12} fill={C.gold} stroke={OL} strokeWidth={5} />
          <path d={`M ${px - L + 30} ${py - 2} L ${px + L - 30} ${py - 2}`} stroke="#fff" strokeWidth={4} opacity={0.4} strokeLinecap="round" />
        </g>
        <path d={`M ${px} ${py - 60} L ${px + 10 + 26 * Math.sin(rad)} ${py + 10} L ${px - 10 + 26 * Math.sin(rad)} ${py + 10} Z`} fill={C.velvet} stroke={OL} strokeWidth={3} />
        <circle cx={px} cy={py} r={26} fill={C.goldDeep} stroke={OL} strokeWidth={5} />
        <circle cx={px} cy={py - 64} r={14} fill={C.gold} stroke={OL} strokeWidth={4} />
        {pan(lx, ly, "успех", C.gold,
          kSuccess > 0.001 && (
            <g transform={`translate(${lx} ${ly + CH}) scale(${kSuccess})`}>
              <CoinStack x={-58} y={-8} n={4} r={30} />
              <CoinStack x={60} y={-8} n={3} r={30} />
              <Crown x={2} y={-34} s={0.62} glow={0.6 + 0.4 * Math.sin(t * 2.5)} />
              <Coin x={-20} y={-14} r={22} rot={t * 2} />
            </g>
          ))}
        {pan(rx, ry, "цена", C.inkSoft,
          PRICES.map((p, i) => {
            const d = drops[i];
            if (d <= 0.001) return null;
            const fall = 1 - d;
            return <Weight key={i} x={rx - 72 + i * 48} y={ry + CH - 24 - fall * 220} s={0.9} color={p.color} />;
          }),
        )}
      </g>
      {/* список цен */}
      {PRICES.map((p, i) => {
        const k = pop(t, at(c, p.beat));
        if (k <= 0.001) return null;
        const y = 360 + i * 108;
        return (
          <g key={i} transform={`translate(${(1 - clamp01(k)) * 60} 0)`} opacity={clamp01(k * 1.5)}>
            <rect x={925} y={y - 44} width={405} height={86} rx={24} fill="#24324a" opacity={0.1} transform="translate(4 7)" />
            <rect x={925} y={y - 44} width={405} height={86} rx={24} fill="#fff" />
            <rect x={925} y={y - 44} width={14} height={86} rx={7} fill={p.color} />
            <Weight x={982} y={y + 6} s={0.78} color={p.color} />
            <text x={1030} y={y - 4} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>
              {p.name}
            </text>
            <text x={1030} y={y + 30} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.velvetDeep}>
              {"— " + p.price}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ── g40. Позиция автора и наш вывод ──
const MapIcon: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const dash = (t * 30) % 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -150 -60 L -50 -80 L 50 -60 L 150 -80 L 150 70 L 50 90 L -50 70 L -150 90 Z" fill="#fbf0d4" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -50 -80 L -50 70 M 50 -60 L 50 90" stroke="#d9c79c" strokeWidth={4} />
      <path d="M -120 50 Q -80 -40 -20 10 Q 40 60 80 -20 Q 100 -50 120 -40" fill="none" stroke={C.red} strokeWidth={5} strokeDasharray="12 10" strokeDashoffset={-dash} strokeLinecap="round" />
      <Chess x={-118} y={62} s={0.3} kind="pawn" />
      <Chess x={124} y={-24} s={0.3} kind="king" dark />
      <path d="M 70 40 L 92 62 M 92 40 L 70 62" stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

// иконки приёмов манипуляции
const TrickIcon: React.FC<{ kind: number; t: number }> = ({ kind, t }) => {
  switch (kind) {
    case 0: // лесть: сладкие слова-сердечки
      return (
        <g>
          <circle r={46} fill="#ffe1ec" stroke={OL} strokeWidth={4} />
          <path d="M -26 -6 Q 0 -24 26 -6 Q 0 22 -26 -6 Z" fill={C.coral} stroke={OL} strokeWidth={3} />
          <Heart x={20 + Math.sin(t * 2) * 3} y={-18 - ((t * 10) % 8)} s={0.55} color={C.red} />
        </g>
      );
    case 1: // слухи: шепчущее ухо
      return (
        <g>
          <circle r={46} fill="#e3eefc" stroke={OL} strokeWidth={4} />
          <path d="M -6 -28 Q 22 -30 22 -4 Q 22 12 6 18 Q 0 28 -10 26" fill="none" stroke={OL} strokeWidth={6} strokeLinecap="round" />
          <path d="M -2 -12 Q 8 -12 8 0" fill="none" stroke={OL} strokeWidth={4} strokeLinecap="round" />
          {[0, 1].map((i) => (
            <path key={i} d={`M ${-22 - i * 10} -14 Q ${-30 - i * 10} 0 ${-22 - i * 10} 14`} fill="none" stroke={C.skyDeep} strokeWidth={4} strokeLinecap="round" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))} />
          ))}
        </g>
      );
    case 2: // внезапная щедрость: подарок
      return (
        <g>
          <circle r={46} fill="#fff1cc" stroke={OL} strokeWidth={4} />
          <rect x={-24} y={-8} width={48} height={34} rx={4} fill={C.velvet} stroke={OL} strokeWidth={3} />
          <rect x={-28} y={-20} width={56} height={14} rx={3} fill={C.velvet} stroke={OL} strokeWidth={3} />
          <path d="M 0 -20 L 0 26" stroke={C.gold} strokeWidth={7} />
          <path d={`M 0 -20 Q -20 ${-40 + Math.sin(t * 3) * 2} -14 -20 M 0 -20 Q 20 ${-40 + Math.sin(t * 3) * 2} 14 -20`} fill="none" stroke={C.gold} strokeWidth={5} />
        </g>
      );
    default: // обещание чуда: звезда
      return (
        <g>
          <circle r={46} fill="#efe7ff" stroke={OL} strokeWidth={4} />
          <g transform={`rotate(${t * 20})`}>
            <path d="M 0 -30 L 9 -9 L 30 -8 L 13 6 L 19 28 L 0 15 L -19 28 L -13 6 L -30 -8 L -9 -9 Z" fill={C.yellow} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
          </g>
        </g>
      );
  }
};

const Compass: React.FC<{ x: number; y: number; s?: number; t: number; settle: number }> = ({ x, y, s = 1, t, settle }) => {
  const ang = (1 - settle) * Math.sin(t * 4) * 60 + Math.sin(t * 1.3) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={86} fill={C.gold} stroke={OL} strokeWidth={5} />
      <circle r={70} fill="#fffaf0" stroke={OL} strokeWidth={4} />
      {[0, 90, 180, 270].map((a) => (
        <path key={a} d="M 0 -66 L 0 -54" stroke={OL} strokeWidth={4} transform={`rotate(${a})`} />
      ))}
      <g transform={`rotate(${ang})`}>
        <path d="M 0 -64 L 12 -26 L -12 -26 Z" fill={C.red} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
        <path d="M 0 64 L 12 26 L -12 26 Z" fill="#c8d0dc" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
      </g>
      <circle r={30} fill="#fff" stroke={OL} strokeWidth={3} />
      <Heart x={0} y={10} s={0.62 + 0.05 * Math.sin(t * 4)} color={C.red} />
    </g>
  );
};

export const TwoViews: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kL = pop(t, at(c, 0.02));
  const kStamp = pop(t, at(c, 0.2));
  const kL1 = pop(t, at(c, 0.32));
  const kL2 = pop(t, at(c, 0.51));
  const kR = pop(t, at(c, 1.0));
  const kMap = pop(t, at(c, 0.26 + 1));
  const icons = [0.54, 0.6, 0.7, 0.83].map((b) => pop(t, at(c, 1 + b)));
  const kPlus = pop(t, at(c, 2.02));
  const kComp = pop(t, at(c, 2.1));
  const settle = ramp(t, at(c, 2.3), 1.6);
  const kVal = pop(t, at(c, 2.32));
  const dimL = 1 - 0.25 * ramp(t, at(c, 2), 1);
  const icoX = [1318, 1466, 1614, 1762];
  const icoLab = ["лесть", "слухи", "щедрость", "чудо"];
  return (
    <g>
      {/* позиция автора */}
      {kL > 0.001 && (
        <g transform={`translate(895 470) scale(${0.85 + 0.15 * clamp01(kL)}) translate(-895 -470)`} opacity={clamp01(kL * 1.5) * dimL}>
          <Panel x={600} y={120} w={590} h={700} r={40} fill="#f8f3ff" />
          <rect x={600} y={120} width={590} height={96} rx={40} fill={C.purple} />
          <rect x={600} y={176} width={590} height={40} fill={C.purple} />
          <Txt x={895} y={184} size={44} weight={900} color="#fff">
            Позиция автора
          </Txt>
          <Show k={kL1} dy={20}>
            <Crown x={895} y={330 + wob(t, 0, 3)} s={0.95} />
            <Txt x={895} y={445} size={44} weight={900}>
              власть аморальна
            </Txt>
          </Show>
          <Show k={kL2} dy={20}>
            <g transform={`translate(895 ${560 + wob(t, 1, 3)})`}>
              <path d="M -50 -60 L 50 -60 L 44 -10 Q 30 30 0 34 Q -30 30 -44 -10 Z" fill={C.gold} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
              <path d="M -48 -46 Q -84 -46 -74 -14 Q -66 6 -40 4 M 48 -46 Q 84 -46 74 -14 Q 66 6 40 4" fill="none" stroke={OL} strokeWidth={5} />
              <rect x={-10} y={34} width={20} height={22} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
              <rect x={-38} y={54} width={76} height={18} rx={5} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
              <path d="M -24 -44 Q -24 -14 -10 6" stroke="#fff" strokeWidth={6} opacity={0.5} fill="none" strokeLinecap="round" />
            </g>
            <Txt x={895} y={700} size={42} weight={900}>
              судят по результату
            </Txt>
          </Show>
          {kStamp > 0.001 && (
            <g transform={`translate(1090 765) rotate(-10) scale(${1.5 - 0.5 * clamp01(kStamp)})`} opacity={clamp01(kStamp * 1.5)}>
              <rect x={-90} y={-30} width={180} height={54} rx={10} fill="#fff" stroke={C.red} strokeWidth={5} />
              <Txt x={0} y={9} size={32} weight={900} color={C.red}>
                спорно
              </Txt>
            </g>
          )}
        </g>
      )}
      {/* наш вывод */}
      {kR > 0.001 && (
        <g transform={`translate(1540 470) scale(${0.85 + 0.15 * clamp01(kR)}) translate(-1540 -470)`} opacity={clamp01(kR * 1.5)}>
          <Panel x={1240} y={120} w={600} h={700} r={40} fill="#f1fbf5" />
          <rect x={1240} y={120} width={600} height={96} rx={40} fill={C.green} />
          <rect x={1240} y={176} width={600} height={40} fill={C.green} />
          <Txt x={1540} y={184} size={44} weight={900} color="#fff">
            Наш вывод
          </Txt>
          {kMap > 0.001 && (
            <g transform={`translate(1540 290) scale(${kMap}) translate(-1540 -290)`}>
              <MapIcon x={1540} y={290} s={0.62} t={t} />
              <Txt x={1540} y={395} size={38} weight={900} color={C.greenDeep}>
                карта чужих ходов
              </Txt>
            </g>
          )}
          {icons.map((k, i) =>
            k > 0.001 ? (
              <g key={i}>
                <g transform={`translate(${icoX[i]} ${465 + wob(t, i, 3)}) scale(${k * 0.95})`}>
                  <TrickIcon kind={i} t={t} />
                </g>
                <g opacity={clamp01(k * 1.5)}>
                  <Txt x={icoX[i]} y={552} size={30} weight={800} color={C.inkSoft}>
                    {icoLab[i]}
                  </Txt>
                </g>
              </g>
            ) : null,
          )}
          {kPlus > 0.001 && (
            <g opacity={clamp01(kPlus * 1.5)}>
              <path d="M 1290 598 L 1790 598" stroke="#cfe9da" strokeWidth={4} strokeLinecap="round" />
              <circle cx={1540} cy={598} r={26} fill={C.green} stroke={OL} strokeWidth={4} transform={`scale(1)`} />
              <path d="M 1528 598 L 1552 598 M 1540 586 L 1540 610" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
            </g>
          )}
          {kComp > 0.001 && (
            <g transform={`translate(1395 712) scale(${kComp}) translate(-1395 -712)`}>
              <circle cx={1395} cy={712} r={100} fill={C.yellow} opacity={0.25 * settle} />
              <Compass x={1395} y={712} s={0.9} t={t} settle={settle} />
            </g>
          )}
          <Show k={kVal} dy={16}>
            <Txt x={1500} y={700} size={42} weight={900} anchor="start">
              {"свои\nценности"}
            </Txt>
          </Show>
        </g>
      )}
    </g>
  );
};

// ── g41. Главное за тридцать минут ──
type TileIco = "eclipse" | "hush" | "deed" | "shield" | "door" | "flag" | "target" | "calm" | "glass" | "stop" | "reed";

const TileIcon: React.FC<{ kind: TileIco; t: number }> = ({ kind, t }) => {
  switch (kind) {
    case "eclipse":
      return (
        <g>
          <circle cx={-8} cy={0} r={22} fill={C.yellow} stroke={OL} strokeWidth={3} />
          <circle cx={12} cy={-4} r={16} fill={C.gold} stroke={OL} strokeWidth={3} />
        </g>
      );
    case "hush":
      return (
        <g>
          <path d="M -22 4 Q 0 -10 22 4 Q 0 18 -22 4 Z" fill={C.coral} stroke={OL} strokeWidth={3} />
          <path d="M 0 -24 L 0 26" stroke={OL} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case "deed":
      return (
        <g transform={`rotate(${-20 + Math.sin(t * 3) * 10})`}>
          <rect x={-5} y={-8} width={10} height={36} rx={3} fill={C.brown} stroke={OL} strokeWidth={3} />
          <rect x={-22} y={-26} width={44} height={20} rx={4} fill="#9aa6bb" stroke={OL} strokeWidth={3} />
        </g>
      );
    case "shield":
      return <path d="M 0 -26 L 22 -18 Q 22 10 0 26 Q -22 10 -22 -18 Z" fill={C.skyDeep} stroke={OL} strokeWidth={3} strokeLinejoin="round" />;
    case "door":
      return (
        <g>
          <rect x={-18} y={-26} width={36} height={52} rx={4} fill="#ffe39a" stroke={OL} strokeWidth={3} />
          <path d="M -18 -26 L 6 -20 L 6 32 L -18 26 Z" fill="#b8642c" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
        </g>
      );
    case "flag":
      return (
        <g>
          <path d="M -14 28 L -14 -26" stroke={OL} strokeWidth={5} strokeLinecap="round" />
          <path d={`M -14 -26 L 22 ${-18 + Math.sin(t * 4) * 2} L -14 -6 Z`} fill={C.red} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
        </g>
      );
    case "target":
      return (
        <g>
          <circle r={24} fill="#fff" stroke={OL} strokeWidth={3} />
          <circle r={15} fill={C.red} stroke={OL} strokeWidth={2} />
          <circle r={6} fill="#fff" />
        </g>
      );
    case "calm":
      return (
        <g>
          <ellipse cx={0} cy={18} rx={24} ry={9} fill="#9c917f" stroke={OL} strokeWidth={3} />
          <ellipse cx={0} cy={0} rx={18} ry={8} fill="#cfc6b8" stroke={OL} strokeWidth={3} />
          <ellipse cx={0} cy={-15} rx={11} ry={6} fill="#e6dfd2" stroke={OL} strokeWidth={3} />
        </g>
      );
    case "glass":
      return <Magnifier x={-4} y={-4} s={0.4} rot={Math.sin(t * 2) * 8} />;
    case "stop":
      return (
        <g>
          <path d="M -12 -28 L 12 -28 L 28 -12 L 28 12 L 12 28 L -12 28 L -28 12 L -28 -12 Z" fill={C.red} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
          <rect x={-14} y={-4} width={28} height={8} rx={3} fill="#fff" />
        </g>
      );
    default:
      return (
        <g>
          <path d={`M -6 30 Q ${-4 + Math.sin(t * 2) * 12} 0 ${4 + Math.sin(t * 2) * 22} -28`} stroke={C.greenDeep} strokeWidth={6} fill="none" strokeLinecap="round" />
          <ellipse cx={8 + Math.sin(t * 2) * 10} cy={-4} rx={12} ry={5} fill={C.green} transform={`rotate(-30 ${8 + Math.sin(t * 2) * 10} -4)`} />
        </g>
      );
  }
};

const SumTile: React.FC<{ x: number; y: number; w: number; h: number; text: string; ico: TileIco; t: number; k: number; hot?: boolean; color?: string; size?: number }> = ({ x, y, w, h, text, ico, t, k, hot, color = C.purple, size = 40 }) => {
  if (k <= 0.001) return null;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const lines = text.split("\n");
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * k}) translate(${-cx} ${-cy})`} opacity={clamp01(k * 1.5)}>
      <rect x={x + 4} y={y + 7} width={w} height={h} rx={28} fill="#24324a" opacity={0.1} />
      <rect x={x} y={y} width={w} height={h} rx={28} fill={hot ? "#fff6d0" : "#fff"} stroke={hot ? C.yellowDeep : undefined} strokeWidth={hot ? 5 : 0} />
      <rect x={x} y={y + 14} width={10} height={h - 28} rx={5} fill={color} />
      <circle cx={x + 66} cy={cy} r={38} fill={hot ? C.yellow : "#f3eeff"} stroke={OL} strokeWidth={3} />
      <g transform={`translate(${x + 66} ${cy})`}>
        <TileIcon kind={ico} t={t} />
      </g>
      {lines.map((l, i) => (
        <text key={i} x={x + 122} y={cy + size * 0.36 + (i - (lines.length - 1) / 2) * size * 1.15} fontFamily={FONT} fontWeight={900} fontSize={size} fill={C.ink}>
          {l}
        </text>
      ))}
    </g>
  );
};

const LAWS: { text: string; ico: TileIco; b: number }[] = [
  { text: "не затмевать", ico: "eclipse", b: 0.19 },
  { text: "говорить меньше", ico: "hush", b: 0.33 },
  { text: "показывать делом", ico: "deed", b: 0.47 },
  { text: "беречь репутацию", ico: "shield", b: 0.55 },
  { text: "не прятаться", ico: "door", b: 0.62 },
  { text: "продумать финал", ico: "flag", b: 0.79 },
  { text: "ждать момента", ico: "target", b: 0.86 },
  { text: "владеть собой", ico: "calm", b: 0.92 },
];

const Confetti: React.FC<{ t: number; t0: number; n?: number }> = ({ t, t0, n = 80 }) => {
  if (t < t0) return null;
  const cols = [C.yellow, C.coral, C.sky, C.green, C.violet, C.gold, C.red];
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const delay = rnd(i, 1) * 2.4;
        const lt = t - t0 - delay;
        if (lt < 0) return null;
        const speed = 140 + rnd(i, 2) * 160;
        const y = -30 + ((lt * speed) % 1160);
        const x = 40 + rnd(i, 3) * 1840 + Math.sin(lt * (1 + rnd(i, 4) * 2) + i) * 30;
        const rot = lt * (120 + rnd(i, 5) * 240) * (i % 2 ? 1 : -1);
        const sh = Math.abs(Math.cos(lt * 4 + i));
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${0.25 + 0.75 * sh})`}>
            {i % 3 === 0 ? <circle r={8} fill={cols[i % cols.length]} /> : <rect x={-10} y={-5} width={20} height={10} rx={2} fill={cols[i % cols.length]} />}
          </g>
        );
      })}
    </g>
  );
};

export const Finale: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const out = ramp(t, at(c, 1.98), 0.7);
  const kTop = pop(t, at(c, 1.09));
  const kStop = pop(t, at(c, 1.36));
  const kFlex = pop(t, at(c, 1.76));
  const kLogo = pop(t, at(c, 2.06));
  const kTag1 = pop(t, at(c, 2.19));
  const kTag2 = pop(t, at(c, 2.3));
  const kPlay = pop(t, at(c, 2.53));
  const TW = 560;
  const TH = 112;
  return (
    <g>
      {/* итоги: 8 плиток по бокам */}
      {out < 0.999 && (
        <g opacity={1 - out} transform={`translate(960 480) scale(${1 - 0.08 * out}) translate(-960 -480)`}>
          {LAWS.map((l, i) => {
            const col = i < 4 ? 0 : 1;
            const row = i % 4;
            const x = col ? 1292 : 68;
            const y = 128 + row * (TH + 16);
            return <SumTile key={i} x={x} y={y + wob(t, i, 2)} w={TW} h={TH} text={l.text} ico={l.ico} t={t} k={pop(t, at(c, l.b))} color={col ? C.skyDeep : C.purple} />;
          })}
          <SumTile x={690} y={112} w={540} h={146} text={"распознавать\nманипуляции"} ico="glass" t={t} k={kTop} hot color={C.yellowDeep} size={40} />
          <SumTile x={68} y={656 + wob(t, 9, 2)} w={TW} h={150} text={"вовремя\nостановиться"} ico="stop" t={t} k={kStop} hot color={C.yellowDeep} />
          <SumTile x={1292} y={656 + wob(t, 10, 2)} w={TW} h={150} text={"оставаться гибкими"} ico="reed" t={t} k={kFlex} hot color={C.yellowDeep} size={38} />
        </g>
      )}
      {/* финал: логотип и конфетти */}
      <Confetti t={t} t0={at(c, 2.06)} />
      {kLogo > 0.001 && (
        <g transform={`translate(960 ${200 + wob(t, 1, 4)}) scale(${kLogo})`}>
          <ellipse cx={0} cy={-30} rx={360} ry={90} fill="#fff" opacity={0.55} />
          <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={124} stroke={OL} strokeWidth={10} strokeLinejoin="round" paintOrder="stroke">
            <tspan fill={C.yellow}>Bana</tspan>
            <tspan fill="#fff">Mind</tspan>
          </text>
          <Sparkles x={0} y={-30} r={330} t={t} n={9} />
        </g>
      )}
      {kTag1 > 0.001 && (
        <g transform={`translate(350 ${470 + wob(t, 2, 4)}) scale(${kTag1})`}>
          <Out x={0} y={0} size={64} color={C.ink} sw={14}>
            Большие идеи.
          </Out>
        </g>
      )}
      {kTag2 > 0.001 && (
        <g transform={`translate(1570 ${470 + wob(t, 3, 4)}) scale(${kTag2})`}>
          <Out x={0} y={0} size={54} color={C.ink} sw={14}>
            Простыми словами.
          </Out>
        </g>
      )}
      {kPlay > 0.001 && (
        <g>
          <g transform={`translate(350 640) scale(${kPlay})`}>
            <Chess x={-150} y={70 + wob(t, 4, 4)} s={0.7} kind="king" dark rot={wob(t, 5, 2)} />
            <Pill x={70} y={0} text="понимайте игру" size={36} fill={C.green} color="#fff" />
          </g>
          <g transform={`translate(1570 640) scale(${pop(t, at(c, 2.68))})`}>
            <Pill x={-10} y={0} text="не позволяйте играть собой" size={34} fill={C.purple} color="#fff" />
            <Chess x={0} y={150 + wob(t, 6, 4)} s={0.6} kind="pawn" rot={wob(t, 7, 2)} />
          </g>
        </g>
      )}
    </g>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const INTRO_VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  feast: Feast,
  arrest: Arrest,
  bigQuestion: BigQuestion,
  bookIntro: BookIntro,
  mirrorBook: MirrorBook,
  priceScale: PriceScale,
  twoViews: TwoViews,
  finale: Finale,
};
