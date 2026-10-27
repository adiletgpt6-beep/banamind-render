// Анимированные схемы фильма BM-005, часть «Люди и ловушки» (+ две истории закона 29
// и закон 40): шах и Чингисхан, Форд и альбомы, друг-конюх, император-затворник,
// Версаль, надпись на тазике, Бисмарк и Бальбоа, «бесплатная земля».
// Все появления привязаны к репликам через at(c, n); опасность — только символами.
import type React from "react";
import { C, FONT, SERIF } from "../theme";
import { Coin, CoinStack, Crown, Figure, Ribbon, Scroll, Throne, Year } from "./court";
import { Bubble, Heart, OL } from "./draw";
import { Arrow, Check, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = VisualProps<{ host?: string }>;

// ───────────── общие мелочи ─────────────

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const outCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
// видно между a и b (плавно)
const win = (t: number, a: number, b: number, d = 0.6) => ramp(t, a, d) * (1 - ramp(t, b, d));

// положение кисти фигуры court.Figure (side 1 — правая на экране), без учёта покачивания
const handOf = (x: number, y: number, s: number, a: number, side: 1 | -1 = 1): [number, number] => {
  const r = (a * Math.PI) / 180;
  const ex = 30 + Math.sin(r) * 44;
  const ey = -170 + Math.cos(r) * 44;
  return [x + side * (ex + Math.sin(r * 1.04) * 40) * s, y + (ey + Math.cos(r * 1.04) * 40) * s];
};

// табличка с одной-двумя строками
const Plaque: React.FC<{ x: number; y: number; text: string; k: number; size?: number; fill?: string; color?: string; serif?: boolean; w?: number; rot?: number; stroke?: string }> = ({
  x,
  y,
  text,
  k,
  size = 40,
  fill = C.white,
  color = C.ink,
  serif,
  w,
  rot = 0,
  stroke = OL,
}) => {
  if (k <= 0.001) return null;
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  const ww = w ?? longest * size * (serif ? 0.55 : 0.6) + size * 1.4;
  const hh = lines.length * size * 1.2 + size * 0.7;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.7 + 0.3 * k})`} opacity={clamp01(k * 1.5)}>
      <rect x={-ww / 2 + 5} y={-hh / 2 + 8} width={ww} height={hh} rx={size * 0.45} fill="#24324a" opacity={0.12} />
      <rect x={-ww / 2} y={-hh / 2} width={ww} height={hh} rx={size * 0.45} fill={fill} stroke={stroke} strokeWidth={4} />
      {lines.map((l, i) => (
        <text key={i} x={0} y={-hh / 2 + size * 0.35 + size * 0.92 + i * size * 1.2} textAnchor="middle" fontFamily={serif ? SERIF : FONT} fontWeight={serif ? 700 : 900} fontSize={size} fill={color}>
          {l}
        </text>
      ))}
    </g>
  );
};

// пузырь реплики с текстом; tail — кончик хвостика относительно центра пузыря
const Say: React.FC<{ x: number; y: number; text: string; k: number; size?: number; tail?: [number, number]; fill?: string }> = ({ x, y, text, k, size = 36, tail = [0, 90], fill = "#fff" }) => {
  if (k <= 0.001) return null;
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.58 + size * 1.5;
  const h = lines.length * size * 1.2 + size * 0.9;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 1.6)}>
      <Bubble x={-w / 2} y={-h / 2} w={w} h={h} tail={tail} fill={fill} />
      {lines.map((l, i) => (
        <text key={i} x={0} y={-h / 2 + size * 0.45 + size * 0.9 + i * size * 1.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={C.ink}>
          {l}
        </text>
      ))}
    </g>
  );
};

const Cloud: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> = ({ x, y, s = 1, color = "#fff", opacity = 0.85 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill={color}>
    <ellipse cx={0} cy={0} rx={70} ry={30} />
    <ellipse cx={-40} cy={-10} rx={40} ry={28} />
    <ellipse cx={30} cy={-22} rx={46} ry={34} />
  </g>
);

const Sparkle: React.FC<{ x: number; y: number; t: number; s?: number; seed?: number; color?: string }> = ({ x, y, t, s = 1, seed = 0, color = C.gold }) => {
  const k = 0.5 + 0.5 * Math.sin(t * 3 + seed * 2.3);
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s * (0.5 + 0.6 * k)}) rotate(${t * 30 + seed * 40})`}
      d="M 0 -22 Q 4 -4 22 0 Q 4 4 0 22 Q -4 4 -22 0 Q -4 -4 0 -22 Z"
      fill={color}
      opacity={0.4 + 0.6 * k}
    />
  );
};

const Drops: React.FC<{ x: number; y: number; t: number; k: number }> = ({ x, y, t, k }) =>
  k <= 0 ? null : (
    <g opacity={clamp01(k)}>
      {[0, 1].map((i) => {
        const ph = (t * 1.3 + i * 0.5) % 1;
        return <path key={i} transform={`translate(${x + i * 34} ${y + ph * 30})`} d="M 0 -14 Q 9 0 7 6 Q 4 13 0 13 Q -4 13 -7 6 Q -9 0 0 -14 Z" fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={2.5} opacity={1 - ph} />;
      })}
    </g>
  );

// лошадь в профиль, смотрит влево; rear — подъём на дыбы (градусы)
const Horse: React.FC<{ x: number; y: number; s?: number; t: number; color?: string; rear?: number; gallop?: number; rider?: string; mane?: string; silhouette?: boolean }> = ({
  x,
  y,
  s = 1,
  t,
  color = "#a0663a",
  rear = 0,
  gallop = 0,
  rider,
  mane = "#4a2e14",
  silhouette,
}) => {
  const g = Math.sin(t * 10) * 14 * gallop;
  const st = silhouette ? color : OL;
  const sw = silhouette ? 0 : 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {!silhouette && <ellipse cx={0} cy={4} rx={80} ry={10} fill="#000" opacity={0.08} />}
      <g transform={`rotate(${rear} 50 -10)`}>
        {/* ноги */}
        <g stroke={silhouette ? color : OL} strokeWidth={silhouette ? 14 : 12} strokeLinecap="round" fill="none">
          <path d={`M -46 -70 L ${-50 - g - rear * 0.8} ${-34 - rear * 0.9} L ${-48 - g - rear * 1.2} ${0 - rear * 1.2}`} />
          <path d={`M -30 -70 L ${-28 + g - rear * 0.5} ${-30 - rear * 0.7} L ${-30 + g - rear * 1.4} ${0 - rear * 0.8}`} />
          <path d={`M 40 -70 L ${42 + g} -34 L ${40 + g} 0`} />
          <path d={`M 56 -70 L ${58 - g} -34 L ${60 - g} 0`} />
        </g>
        {/* хвост */}
        <path d={`M 70 -96 Q ${100 + wob(t, 1, 6)} -80 ${96 + wob(t, 2, 8)} -40`} stroke={silhouette ? color : mane} strokeWidth={14} strokeLinecap="round" fill="none" />
        {/* тело и шея */}
        <ellipse cx={8} cy={-92} rx={74} ry={34} fill={color} stroke={st} strokeWidth={sw} />
        <path d="M -40 -110 Q -60 -150 -76 -168 L -50 -184 Q -30 -150 -12 -116 Z" fill={color} stroke={st} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M -76 -168 L -112 -150 Q -122 -140 -110 -132 L -80 -136 Q -66 -150 -54 -170 Z" fill={color} stroke={st} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M -60 -184 L -56 -200 L -48 -184 Z" fill={color} stroke={st} strokeWidth={sw} />
        {!silhouette && (
          <g>
            <path d="M -50 -186 Q -30 -160 -14 -118" stroke={mane} strokeWidth={10} fill="none" strokeLinecap="round" />
            <circle cx={-80} cy={-160} r={4} fill={OL} />
            <circle cx={-108} cy={-142} r={2.5} fill={OL} />
            <path d="M -110 -134 L -76 -150 L -46 -110" stroke="#5a3a1c" strokeWidth={3} fill="none" />
          </g>
        )}
        {rider && (
          <g>
            <path d="M -6 -118 Q -20 -170 -10 -196 L 22 -196 Q 30 -160 18 -118 Z" fill={rider} />
            <circle cx={4} cy={-214} r={20} fill={rider} />
            <path d="M -18 -222 Q 4 -256 26 -222 Z" fill={rider} />
            <path d="M -24 -150 L -40 -280" stroke={rider} strokeWidth={6} strokeLinecap="round" />
            <path d={`M -40 -280 L ${-80 + wob(t, x, 5)} -268 L -40 -252 Z`} fill={rider} />
          </g>
        )}
      </g>
    </g>
  );
};

// ───────────── g17 · шах и Чингисхан ─────────────

const Camel: React.FC<{ x: number; y: number; s?: number; t: number; walk?: number; load?: string; grey?: number }> = ({ x, y, s = 1, t, walk = 0, load = C.velvet, grey = 0 }) => {
  const st = Math.sin(t * 6 + x * 0.05) * 9 * walk;
  const body = grey > 0.5 ? "#b9ad98" : "#d9a86a";
  return (
    <g transform={`translate(${x} ${y + Math.abs(Math.sin(t * 6 + x * 0.05)) * -3 * walk}) scale(${-s} ${s})`}>
      <ellipse cx={0} cy={2} rx={60} ry={8} fill="#000" opacity={0.08} />
      <g stroke={OL} strokeWidth={8} strokeLinecap="round">
        <path d={`M -34 -60 L ${-34 + st} 0`} />
        <path d={`M -20 -60 L ${-20 - st} 0`} />
        <path d={`M 24 -60 L ${24 - st} 0`} />
        <path d={`M 38 -60 L ${38 + st} 0`} />
      </g>
      <ellipse cx={2} cy={-80} rx={54} ry={26} fill={body} stroke={OL} strokeWidth={4} />
      <path d="M -30 -98 Q -6 -142 20 -98 Z" fill={body} stroke={OL} strokeWidth={4} />
      <path d="M 44 -86 Q 72 -104 66 -136 L 82 -138 Q 88 -98 56 -68 Z" fill={body} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={86} cy={-140} rx={20} ry={11} fill={body} stroke={OL} strokeWidth={4} />
      <circle cx={88} cy={-144} r={3} fill={OL} />
      <rect x={-26} y={-138} width={42} height={30} rx={5} fill={grey > 0.5 ? "#9c917f" : load} stroke={OL} strokeWidth={4} />
      <path d="M -5 -138 L -5 -108 M -26 -123 L 16 -123" stroke={grey > 0.5 ? "#d5ccb8" : C.goldLight} strokeWidth={5} />
    </g>
  );
};

const Yurt: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 0 L -60 -40 Q -50 -78 0 -86 Q 50 -78 60 -40 L 60 0 Z" fill="#fbf4e2" stroke={OL} strokeWidth={4} />
    <path d="M -60 -40 Q 0 -50 60 -40" stroke={C.velvet} strokeWidth={6} fill="none" />
    <rect x={-14} y={-34} width={28} height={34} rx={4} fill={C.velvet} stroke={OL} strokeWidth={3} />
    <circle cx={0} cy={-86} r={6} fill={C.gold} stroke={OL} strokeWidth={3} />
  </g>
);

const Samarkand: React.FC<{ x: number; y: number; s?: number; ruin?: number }> = ({ x, y, s = 1, ruin = 0 }) => {
  const dome = ruin > 0.5 ? "#9fb0bf" : C.skyDeep;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-110, 110].map((cx, i) => (
        <g key={i} transform={`rotate(${ruin * (i ? 7 : -9)} ${cx} 0)`}>
          <rect x={cx - 14} y={-200} width={28} height={200} fill="#f1dfb8" stroke={OL} strokeWidth={4} />
          <path d={`M ${cx - 20} -200 L ${cx + 20} -200 L ${cx} -236 Z`} fill={dome} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        </g>
      ))}
      <rect x={-90} y={-110} width={180} height={110} fill="#f1dfb8" stroke={OL} strokeWidth={4} />
      <path d="M -60 -110 Q -60 -190 0 -196 Q 60 -190 60 -110 Z" fill={dome} stroke={OL} strokeWidth={4} />
      <path d="M -24 0 L -24 -50 Q 0 -78 24 -50 L 24 0 Z" fill="#7a5530" stroke={OL} strokeWidth={4} />
      {[-62, 62].map((cx) => (
        <rect key={cx} x={cx - 10} y={-80} width={20} height={32} rx={10} fill={dome} opacity={0.8} />
      ))}
      {ruin > 0 && <path d="M -40 -110 L -20 -80 L -34 -50 L -12 -20" stroke={OL} strokeWidth={4} fill="none" opacity={clamp01(ruin * 2)} />}
      {ruin > 0 && <path d="M 30 -190 L 18 -160 L 34 -136 L 20 -110" stroke={OL} strokeWidth={4} fill="none" opacity={clamp01(ruin * 2)} />}
    </g>
  );
};

// посол степи: меховая шапка или обритая голова; ghost — исчез (пунктирный силуэт)
const Envoy: React.FC<{ x: number; y: number; s?: number; t: number; bald?: number; ghost?: number }> = ({ x, y, s = 1, t, bald = 0, ghost = 0 }) => {
  const bob = Math.sin(t * 2.4 + x * 0.02) * 2;
  if (ghost > 0.5)
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.8}>
        <path d="M -30 -120 Q -40 -40 -44 0 L 44 0 Q 40 -40 30 -120 Q 0 -130 -30 -120 Z" fill="#8d8aa3" opacity={0.35} stroke="#6f6b88" strokeWidth={4} strokeDasharray="12 10" />
        <circle cx={0} cy={-152} r={28} fill="#8d8aa3" opacity={0.35} stroke="#6f6b88" strokeWidth={4} strokeDasharray="10 8" />
      </g>
    );
  const hatY = -bald * 120;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <ellipse cx={0} cy={3} rx={46} ry={8} fill="#000" opacity={0.08} />
      <path d="M -30 -120 Q -40 -40 -44 0 L 44 0 Q 40 -40 30 -120 Q 0 -130 -30 -120 Z" fill="#3d7f9e" stroke={OL} strokeWidth={4} />
      <rect x={-38} y={-70} width={76} height={12} fill={C.gold} stroke={OL} strokeWidth={3} />
      <path d="M -30 -112 L -46 -60 M 30 -112 L 46 -60" stroke="#3d7f9e" strokeWidth={14} strokeLinecap="round" />
      <circle cx={0} cy={-152} r={28} fill="#e7b48a" stroke={OL} strokeWidth={4} />
      <circle cx={-9} cy={-154} r={3.5} fill={OL} />
      <circle cx={9} cy={-154} r={3.5} fill={OL} />
      <path d={bald > 0.5 ? "M -8 -138 Q 0 -144 8 -138" : "M -8 -140 Q 0 -134 8 -140"} stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
      {bald > 0.5 && <ellipse cx={-10} cy={-172} rx={9} ry={5} fill="#fff" opacity={0.7} />}
      <g transform={`translate(0 ${hatY}) rotate(${bald * 40})`} opacity={1 - bald}>
        <path d="M -30 -164 Q -28 -200 0 -202 Q 28 -200 30 -164 Z" fill="#8a5a2b" stroke={OL} strokeWidth={4} />
        <rect x={-34} y={-172} width={68} height={14} rx={7} fill="#fbf4e2" stroke={OL} strokeWidth={3} />
      </g>
    </g>
  );
};

export const SilkRoad: React.FC<P> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const b3 = at(c, 3);
  const mapK = ramp(t, 0.2, 1.2);
  // маршрут каравана: от ставки хана (справа) к Самарканду (слева)
  const P0: [number, number] = [1150, 470];
  const PC: [number, number] = [860, 250];
  const P2: [number, number] = [610, 560];
  const qb = (u: number): [number, number] => [(1 - u) * (1 - u) * P0[0] + 2 * u * (1 - u) * PC[0] + u * u * P2[0], (1 - u) * (1 - u) * P0[1] + 2 * u * (1 - u) * PC[1] + u * u * P2[1]];
  const travel = outCubic((t - (b1 + 1.2)) / 9) * 0.92;
  const caught = ramp(t, at(c, 2.4), 0.8);
  const insult = ramp(t, at(c, 2.72), 0.9);
  const war = ramp(t, b3, 1.2);
  const fall = ramp(t, at(c, 3.32), 1.2);
  const env = win(t, at(c, 2.6), b3 + 0.4);
  const shahArms: [number, number] = fall > 0.3 ? [150, 150] : [14, 20];
  return (
    <g>
      {/* карта-пергамент */}
      <g opacity={mapK}>
        <rect x={76} y={126} width={1264} height={700} rx={32} fill="#24324a" opacity={0.1} />
        <rect x={70} y={118} width={1264} height={700} rx={32} fill="#f6e7c4" stroke={OL} strokeWidth={5} />
        <rect x={92} y={140} width={1220} height={656} rx={22} fill="none" stroke="#d9c08e" strokeWidth={4} strokeDasharray="18 12" />
        {/* горы */}
        {[
          [760, 330, 1],
          [840, 320, 1.3],
          [930, 336, 0.9],
        ].map(([mx, my, ms], i) => (
          <path key={i} transform={`translate(${mx} ${my}) scale(${ms})`} d="M -60 30 L 0 -50 L 60 30 Z M -20 -24 L 0 -50 L 20 -24 L 8 -18 L 0 -28 L -10 -18 Z" fill="#c9b48a" stroke={OL} strokeWidth={3.5} strokeLinejoin="round" />
        ))}
        {/* барханы и река */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${720 + i * 150} ${700 + (i % 2) * 30} q 50 -34 100 0`} stroke="#d4b47a" strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
        <path d="M 980 140 Q 940 300 1020 380 Q 1080 450 1010 560 Q 950 650 1000 796" stroke="#8fc9ea" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.8} />
        {/* дорога */}
        <path d={`M ${P0[0]} ${P0[1]} Q ${PC[0]} ${PC[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke="#b07d3a" strokeWidth={10} strokeDasharray="26 18" strokeLinecap="round" strokeDashoffset={-t * 8} />
        <g opacity={ramp(t, at(c, 2), 0.8) * (1 - war)}>
          <Tag x={870} y={236} text="Шёлковый путь" size={32} color={C.goldLight} />
        </g>
        {/* облака плывут */}
        <Cloud x={((t * 14 + 300) % 1300) + 40} y={190} s={0.7} opacity={0.6 * (1 - war)} />
        <Cloud x={((t * 9 + 900) % 1300) + 40} y={250} s={0.5} opacity={0.5 * (1 - war)} />
      </g>

      {/* ставка хана */}
      <g opacity={ramp(t, 0.8, 0.8)}>
        <Yurt x={1110} y={500} s={0.8} />
        <Yurt x={1210} y={480} s={0.95} />
        <Yurt x={1270} y={520} s={0.7} />
        <path d="M 1160 410 L 1160 330" stroke={OL} strokeWidth={5} />
        <path d={`M 1160 330 Q ${1196 + wob(t, 3, 6)} 336 1228 344 L 1160 366 Z`} fill={C.skyDeep} stroke={OL} strokeWidth={3} />
        <Tag x={1190} y={600} text="Чингисхан" size={32} color={C.sky} />
      </g>

      {/* Самарканд и шах на троне */}
      <g opacity={ramp(t, b1, 0.8)}>
        <Samarkand x={500} y={600} s={0.95} ruin={fall} />
        <Tag x={510} y={340} text="Самарканд" size={32} color={C.goldLight} />
      </g>
      <g opacity={ramp(t, b1 + 0.3, 0.8)}>
        <Throne x={250} y={800} s={0.74} />
        {fall > 0 && <path d="M 236 576 L 258 616 L 240 650 L 266 700" stroke={OL} strokeWidth={6} fill="none" strokeLinecap="round" opacity={fall} />}
        <Figure x={250} y={790} s={0.98} t={t} role="peasant" body={C.purple} mood={fall > 0.3 ? "shock" : insult > 0.2 ? "angry" : "proud"} look={-1} arms={shahArms} />
        {(() => {
          // корона шаха: держится на голове, в финале падает и лежит сломанной
          const cx = lerp(250, 340, fall);
          const cy = lerp(790 - 276 * 0.98, 776, outCubic(fall));
          return <Crown x={cx} y={cy} s={0.43} rot={fall * 70} />;
        })()}
        {fall > 0.6 && <path d="M 330 752 L 342 770 L 334 786" stroke={OL} strokeWidth={4} fill="none" opacity={ramp(t, at(c, 3.32) + 1, 0.4)} />}
        <Tag x={250} y={455} text="Хорезмшах" size={32} color={C.purpleLight} />
      </g>
      <Say x={330} y={350} text="Выскочка!" k={pop(t, at(c, 1.7)) * (1 - ramp(t, b2, 0.4))} tail={[-60, 70]} />
      <Say x={330} y={350} text="…" size={50} k={pop(t, at(c, 2.17)) * (1 - ramp(t, at(c, 2.4), 0.4))} tail={[-60, 70]} />
      <Year x={240} y={190} text="1219" k={pop(t, b1 + 1.5)} />

      {/* предложение хана */}
      <Say x={1010} y={380} text="Делим путь?" size={34} k={pop(t, b2 + 0.4) * (1 - ramp(t, at(c, 2.38), 0.4))} tail={[90, 80]} />

      {/* караван */}
      <g opacity={ramp(t, b1 + 1, 0.8) * (1 - war)}>
        {[0, 1, 2].map((i) => {
          const u = clamp01(travel - i * 0.07);
          const [cx, cy] = qb(u);
          return <Camel key={i} x={cx} y={cy} s={0.6} t={t} walk={travel > 0.01 && travel < 0.91 && caught < 0.1 ? 1 : 0} load={[C.velvet, C.gold, C.green][i]} grey={caught} />;
        })}
        {caught > 0 && (
          <g opacity={caught}>
            <ellipse cx={qb(0.85)[0] + 6} cy={qb(0.85)[1] - 50} rx={150} ry={74} fill="none" stroke="#8a5a2b" strokeWidth={8} strokeDasharray={`${caught * 900} 900`} />
            <Plaque x={qb(0.85)[0] + 40} y={qb(0.85)[1] + 70} text="караван захвачен" size={30} k={pop(t, at(c, 2.48)) * (1 - ramp(t, at(c, 2.66), 0.4))} fill="#ffe1dc" color={C.velvetDeep} />
          </g>
        )}
      </g>

      {/* послы: двоим обрили головы, третий исчез */}
      <g opacity={env}>
        {[0, 1, 2].map((i) => (
          <Envoy key={i} x={500 + i * 120} y={800} s={0.78} t={t} bald={i > 0 ? insult : 0} ghost={i === 0 ? insult : 0} />
        ))}
        <Plaque x={630} y={575} text="оскорбление" size={32} k={pop(t, at(c, 2.82))} fill={C.velvet} color="#fff" />
      </g>

      {/* война: тучи и конница из степи */}
      {war > 0 && (
        <g>
          <g opacity={war * 0.85}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Cloud key={i} x={lerp(1500, 1250, war) - i * 190 + wob(t, i, 10)} y={200 + (i % 2) * 40} s={1.1} color="#6f6b88" opacity={0.75} />
            ))}
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const k = outCubic((t - b3 - i * 0.18) / 3.2);
            const row = i % 2;
            const x0 = 1260 + row * 60;
            const x1 = 720 + i * 70;
            return k > 0 ? <Horse key={i} x={lerp(x0, x1, k)} y={720 + row * 70} s={0.55} t={t + i} gallop={1 - k * 0.6} rider="#3a3550" color="#4b4766" silhouette /> : null;
          })}
        </g>
      )}
      <Ribbon x={700} y={186} text="Закон 19" k={pop(t, 0.3) * (1 - ramp(t, at(c, 3.6), 0.5))} />
      <Plaque x={700} y={290} text="Знай, с кем имеешь дело" size={36} k={pop(t, at(c, 0.4)) * (1 - ramp(t, b1, 0.5))} />
      <Ribbon x={700} y={186} text="Отказывать — вежливо" color={C.greenDeep} k={pop(t, at(c, 3.7))} />
    </g>
  );
};

// ───────────── g18 · Форд и альбомы ─────────────

const Painting: React.FC<{ x: number; y: number; s?: number; rot?: number; kind: number }> = ({ x, y, s = 1, rot = 0, kind }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-62} y={-48} width={124} height={96} rx={6} fill={C.gold} stroke={OL} strokeWidth={4} />
    <rect x={-48} y={-34} width={96} height={68} fill={kind === 1 ? "#3a3550" : "#bfe6ff"} stroke={OL} strokeWidth={3} />
    {kind === 0 && (
      <g>
        <path d="M -48 34 L -48 6 Q -20 -14 6 4 Q 26 -10 48 2 L 48 34 Z" fill={C.green} />
        <circle cx={26} cy={-16} r={9} fill={C.yellow} />
      </g>
    )}
    {kind === 1 && (
      <g>
        <ellipse cx={0} cy={-2} rx={16} ry={20} fill="#f2c79b" />
        <path d="M -30 34 Q 0 6 30 34 Z" fill={C.velvet} />
      </g>
    )}
    {kind === 2 && (
      <g>
        <rect x={-48} y={14} width={96} height={20} fill="#c98a0b" />
        <circle cx={-14} cy={4} r={12} fill={C.red} />
        <circle cx={10} cy={6} r={10} fill={C.green} />
        <path d="M 22 14 L 26 -14 L 36 -14 L 40 14 Z" fill={C.skyDeep} />
      </g>
    )}
  </g>
);

const Tome: React.FC<{ x: number; y: number; s?: number; n: string; color: string; rot?: number }> = ({ x, y, s = 1, n, color, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-44} y={-220} width={88} height={220} rx={8} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-44} y={-196} width={88} height={14} fill={C.gold} />
    <rect x={-44} y={-40} width={88} height={14} fill={C.gold} />
    <rect x={-26} y={-160} width={52} height={70} rx={4} fill={C.goldLight} stroke={OL} strokeWidth={3} />
    <text x={0} y={-112} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={32} fill={C.ink}>
      {n}
    </text>
  </g>
);

const OpenBook: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${wob(t, 4, 2)})`}>
    <path d="M 0 -6 Q -50 -26 -110 -10 L -110 70 Q -50 54 0 74 Z" fill="#fffaf0" stroke={OL} strokeWidth={4} />
    <path d="M 0 -6 Q 50 -26 110 -10 L 110 70 Q 50 54 0 74 Z" fill="#fffaf0" stroke={OL} strokeWidth={4} />
    <Painting x={-54} y={30} s={0.62} kind={0} />
    <Painting x={54} y={30} s={0.62} kind={1} />
  </g>
);

export const FordBooks: React.FC<P> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const enter = outCubic((t - 0.3) / 3.2);
  const drop = ramp(t, at(c, 1.62), 0.9);
  const shocked = t > at(c, 1.55);
  const joy = ramp(t, b1 + 0.3, 0.6);
  const bookToFord = outCubic((t - b1 - 0.2) / 1.2);
  const fordX = 1690;
  const FS = 1.2;
  const DS = 1.15;
  const fhy = handOf(fordX, 800, FS, 60)[1];
  const dealers = [740, 910, 1080];
  return (
    <g>
      {/* стена галереи */}
      <rect x={600} y={130} width={1250} height={680} rx={34} fill="#fff6ea" stroke={OL} strokeWidth={5} />
      <rect x={600} y={640} width={1250} height={170} rx={0} fill="#f0d9bd" opacity={0.7} />
      <path d="M 600 640 L 1850 640" stroke={OL} strokeWidth={4} />
      {[700, 1480, 1760].map((x, i) => (
        <g key={i} opacity={0.35}>
          <Painting x={x} y={250 + (i % 2) * 20} s={0.8} kind={i} />
        </g>
      ))}
      {/* дилеры с картинами */}
      {dealers.map((x0, i) => {
        const x = lerp(x0 - 140, x0, enter);
        const arm = drop > 0 ? lerp(150, 60, drop) : 150;
        const [hx, hy] = handOf(x, 800, DS, 150);
        const fx = hx - 10;
        const fy = hy - 60;
        const px = lerp(fx, x0 + 46 - i * 6, drop);
        const py = lerp(fy, 755, drop * drop);
        return (
          <g key={i} opacity={clamp01(enter * 1.6)}>
            <Figure x={x} y={800} s={DS} t={t + i} role="merchant" body={[C.goldDeep, "#2f6f8f", C.velvet][i]} mood={t > b2 ? "sad" : shocked ? "shock" : "happy"} arms={[14, arm]} walk={enter < 0.98 ? 1 : 0} />
            <Painting x={px} y={py} s={1.05} rot={drop * (i % 2 ? 72 : -64) + (drop < 0.01 ? wob(t, i, 2) : 0)} kind={i} />
          </g>
        );
      })}
      <g opacity={ramp(t, 1.2, 0.6)}>
        <Tag x={dealers[0]} y={370} text="Дювин" size={32} color={C.goldLight} />
      </g>
      {/* стол с тремя томами */}
      <g>
        <rect x={1190} y={668} width={330} height={24} rx={6} fill="#a8733c" stroke={OL} strokeWidth={4} />
        <path d="M 1212 692 L 1222 800 M 1498 692 L 1488 800" stroke={OL} strokeWidth={10} strokeLinecap="round" />
        {["I", "II", "III"].map((n, i) => {
          const k = pop(t, at(c, 0.42 + i * 0.1));
          if (k <= 0.01) return null;
          if (i === 2 && bookToFord > 0) return null;
          return (
            <g key={n} transform={`translate(${1243 + i * 112} 668) scale(${(0.6 + 0.4 * k) * 1.22}) translate(${-1243 - i * 112} -668)`} opacity={clamp01(k * 1.5)}>
              <Tome x={1243 + i * 112} y={668} n={n} color={[C.velvetDeep, C.purpleDeep, "#23546f"][i]} rot={i === 0 ? -3 : i === 1 ? 2 : 0} />
            </g>
          );
        })}
        <Plaque x={1355} y={330} text="100 великих полотен" size={34} k={pop(t, at(c, 0.75)) * (1 - ramp(t, b1, 0.5))} fill={C.goldLight} />
      </g>
      {/* Форд */}
      <g opacity={ramp(t, 0.6, 0.6)}>
        <Figure x={fordX} y={800} s={FS} t={t} role="modern" body="#5b4a3a" mood={joy > 0.5 ? (t > at(c, 1.5) && t < b2 ? "talk" : "happy") : "neutral"} arms={[60, 60]} look={-0.6} talk={t > at(c, 1.5) && t < at(c, 1.95) ? 1 : 0} />
        <Tag x={fordX + 20} y={385} text="Генри Форд" size={32} color={C.sky} />
      </g>
      {bookToFord > 0 && (
        <g>
          {bookToFord < 1 ? (
            <Tome x={lerp(1467, fordX, bookToFord)} y={lerp(668, fhy + 60, bookToFord) - Math.sin(bookToFord * Math.PI) * 120} s={lerp(1.22, 0.8, bookToFord)} n="III" color="#23546f" rot={bookToFord * 20} />
          ) : (
            <OpenBook x={fordX} y={fhy - 34} s={1.08} t={t} />
          )}
        </g>
      )}
      {joy > 0 && [0, 1, 2, 3].map((i) => <Sparkle key={i} x={fordX - 150 + i * 100} y={[470, 450, 455, 480][i] + (i % 2) * 40} t={t} seed={i} s={joy} />)}
      <Say x={1360} y={250} text="Зачем мне оригиналы?" size={38} k={pop(t, at(c, 1.48)) * (1 - ramp(t, b2, 0.5))} tail={[240, 220]} />
      <Plaque x={1225} y={250} text="Сначала изучи человека" size={46} k={pop(t, b2 + 0.4)} fill={C.green} color="#fff" />
      <g opacity={ramp(t, at(c, 2.45), 0.6)}>
        <Plaque x={1225} y={360} text="подарок мимо цели" size={32} k={pop(t, at(c, 2.45))} />
      </g>
    </g>
  );
};

// ───────────── g19b · друг-конюх ─────────────

const Lantern: React.FC<{ x: number; y: number; t: number; seed?: number }> = ({ x, y, t, seed = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${wob(t, seed, 4)})`}>
    <path d="M 0 -60 L 0 -30" stroke={OL} strokeWidth={4} />
    <circle cy={6} r={50} fill={C.goldLight} opacity={0.35 + 0.1 * Math.sin(t * 2 + seed)} />
    <ellipse cy={6} rx={30} ry={36} fill={C.red} stroke={OL} strokeWidth={4} />
    <path d="M -14 -26 Q -22 6 -14 38 M 14 -26 Q 22 6 14 38" stroke={C.velvetDeep} strokeWidth={3} fill="none" />
    <rect x={-14} y={-34} width={28} height={10} rx={3} fill={C.gold} stroke={OL} strokeWidth={3} />
    <rect x={-14} y={38} width={28} height={10} rx={3} fill={C.gold} stroke={OL} strokeWidth={3} />
  </g>
);

const BundleIcon: React.FC<{ x: number; y: number; s?: number; open?: number }> = ({ x, y, s = 1, open = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {open < 0.5 ? (
      <g>
        <rect x={-38} y={-24} width={76} height={56} rx={14} fill={C.skyDeep} stroke={OL} strokeWidth={4} />
        {[-18, 0, 18].map((dx) => (
          <circle key={dx} cx={dx} cy={10} r={4} fill={C.goldLight} />
        ))}
        <path d="M -10 -24 Q -34 -50 -6 -40 Q 0 -30 6 -40 Q 34 -50 10 -24 Z" fill={C.skyDeep} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={0} cy={-28} r={7} fill={C.sky} stroke={OL} strokeWidth={3} />
      </g>
    ) : (
      <path d="M -70 20 L -40 -10 L 40 -10 L 70 20 L 40 34 L -40 34 Z" fill={C.skyDeep} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    )}
  </g>
);

export const StableFriend: React.FC<P> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const b3 = at(c, 3);
  const actA = 1 - ramp(t, b2 - 0.2, 0.8);
  const actB = win(t, b2 + 0.2, b3, 0.8);
  const horseK = pop(t, at(c, 0.5)) * (1 - ramp(t, b1 + 0.2, 0.8));
  const calm = ramp(t, at(c, 0.8), 1);
  const stairsK = ramp(t, b1 + 0.4, 0.8);
  // Василий поднимается по ступеням
  const steps = [1000, 1210, 1420, 1630];
  const stepTimes = [at(c, 1.15), at(c, 1.3), at(c, 1.45), at(c, 1.82)];
  let vx = 1180;
  let vy = 800;
  let vs = 1;
  if (t > b1) {
    vx = lerp(1180, 950, ramp(t, b1, 0.8));
    vs = lerp(1, 0.85, ramp(t, b1, 0.8));
    stepTimes.forEach((st, i) => {
      const k = ramp(t, st, 0.7);
      if (k > 0) {
        vx = lerp(i === 0 ? 950 : steps[i - 1] + 105, steps[i] + 105, k);
        vy = lerp(800 - i * 80, 800 - (i + 1) * 80, k) - Math.sin(k * Math.PI) * 30;
      }
    });
  }
  const shadow = ramp(t, at(c, 1.55), 1.2);
  const gone = ramp(t, at(c, 1.78), 1);
  const roll = clamp01((t - at(c, 1.8)) / 2.2);
  // корона катится от императора к Василию
  const crownPath = (): [number, number, number] => {
    if (roll < 0.35) {
      const k = outCubic(roll / 0.35);
      return [lerp(800, 860, k), lerp(800 - 276, 780, k * k), k * 90];
    }
    const k = (roll - 0.35) / 0.65;
    const ex = steps[3] + 105;
    const ey = 800 - 4 * 80 - 276 * 0.85;
    return [lerp(860, ex, k), lerp(780, ey, k) - Math.sin(k * Math.PI) * 220, 90 + k * 630];
  };
  const [cx, cy, cr] = crownPath();
  // князь: получает свёрток, идёт домой, раскрывает, кланяется
  const walkK = outCubic((t - at(c, 2.4)) / 2.2);
  const px = lerp(1180, 1520, walkK);
  const opened = ramp(t, at(c, 2.62), 0.8);
  const bowK = ramp(t, at(c, 2.82), 0.8);
  const [phx, phy] = handOf(px, 800, 1, 50);
  const [ehx, ehy] = handOf(900, 800, 1, 70);
  const given = t > at(c, 2.28);
  return (
    <g>
      {/* ── акт 1: конюшня и лестница ── */}
      {actA > 0 && (
        <g opacity={actA}>
          <g opacity={1 - stairsK * 0.4}>
            <path d="M 600 320 L 1220 160 L 1840 320 L 1840 810 L 600 810 Z" fill="#e8c79b" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            {Array.from({ length: 10 }).map((_, i) => (
              <path key={i} d={`M 620 ${360 + i * 46} L 1820 ${360 + i * 46}`} stroke="#c9a06b" strokeWidth={4} />
            ))}
            <path d="M 600 320 L 1220 160 L 1840 320" fill="none" stroke="#8a5a2b" strokeWidth={22} strokeLinejoin="round" />
            <rect x={1690} y={720} width={140} height={84} rx={18} fill="#f2d16b" stroke={OL} strokeWidth={4} />
            <path d="M 1700 748 L 1820 748 M 1700 776 L 1820 776" stroke="#c9a03a" strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M ${1705 + i * 36} 722 l ${-6 + i * 3} -14`} stroke="#c9a03a" strokeWidth={4} strokeLinecap="round" />
            ))}
          </g>
          <Ribbon x={1220} y={250} text="Закон 2" k={pop(t, 0.3) * (1 - ramp(t, b1 + 0.3, 0.5))} />
          <Plaque x={1220} y={350} text="Византия, IX век" size={34} serif k={pop(t, at(c, 0.3)) * (1 - ramp(t, b1 + 0.3, 0.5))} fill={C.cream} />
          {horseK > 0.01 && (
            <g opacity={clamp01(horseK * 1.5)}>
              <Horse x={1480} y={800} s={1.25} t={t} rear={lerp(26 + Math.sin(t * 3.2) * 7, 0, calm)} />
            </g>
          )}
          {horseK > 0.3 && t < b1 && (() => {
            const ang = (lerp(26 + Math.sin(t * 3.2) * 7, 0, calm) * Math.PI) / 180;
            const lx = -100 - 50;
            const ly = -140 + 10;
            const hx = 1480 + 1.25 * (50 + lx * Math.cos(ang) - ly * Math.sin(ang));
            const hy = 800 + 1.25 * (-10 + lx * Math.sin(ang) + ly * Math.cos(ang));
            const [vhx, vhy] = handOf(vx, vy, vs, 120);
            return <path d={`M ${vhx} ${vhy} Q ${(vhx + hx) / 2} ${(vhy + hy) / 2 + 30 * (1 - calm)} ${hx} ${hy}`} stroke="#5a3a1c" strokeWidth={5} fill="none" opacity={clamp01(horseK * 1.5)} />;
          })()}
          {/* лестница наверх */}
          {stairsK > 0 && (
            <g opacity={stairsK}>
              {steps.map((sx, i) => (
                <g key={i}>
                  <rect x={sx} y={800 - (i + 1) * 80} width={1840 - sx} height={80} rx={4} fill={i === 3 ? C.goldLight : "#efe2cc"} stroke={OL} strokeWidth={4} />
                </g>
              ))}
              {(["советник", "×2", "×3", "трон"] as const).map((lb, i) => {
                const k = pop(t, stepTimes[i] - 0.3);
                return k > 0.01 ? (
                  <g key={lb} opacity={clamp01(k * 1.5)}>
                    {i === 1 || i === 2 ? (
                      <g>
                        <CoinStack x={steps[i] + 55} y={800 - i * 80 - 24} n={i + 1} r={22} />
                        <Txt x={steps[i] + 140} y={800 - i * 80 - 24} size={42} weight={900} color={C.goldDeep}>
                          {lb}
                        </Txt>
                      </g>
                    ) : (
                      <Txt x={steps[i] + 105} y={800 - i * 80 - 27} size={34} weight={900} color={C.ink}>
                        {lb}
                      </Txt>
                    )}
                  </g>
                ) : null;
              })}
            </g>
          )}
          {/* тень за спиной императора */}
          {shadow > 0 && (
            <g transform={`translate(${700 - shadow * 30} 800) scale(${1 + shadow * 0.45})`} opacity={0.32 * shadow} fill="#3a3550">
              <path d="M -60 0 L -52 -150 Q -50 -200 0 -206 Q 50 -200 52 -150 L 60 0 Z" />
              <circle cx={0} cy={-246} r={40} />
              <path d="M -48 -290 Q 0 -310 48 -290 L 40 -270 L -40 -270 Z" />
              <path d="M -16 -250 L -6 -246 M 16 -250 L 6 -246" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
            </g>
          )}
          <Figure x={800} y={800} s={1} t={t} role="king" mood={gone > 0.2 ? "worried" : horseK > 0.3 && calm < 0.6 ? "shock" : "happy"} arms={horseK > 0.3 && calm < 0.6 ? [150, 150] : t > b1 && t < at(c, 1.4) ? [20, 80] : [14, 14]} look={0.6} opacity={1 - gone * 0.85} />
          <g opacity={ramp(t, at(c, 0.4), 0.6) * (1 - ramp(t, b1, 0.5))}>
            <Tag x={800} y={440} text="Михаил" size={32} color={C.purpleLight} />
          </g>
          <Figure x={vx} y={vy} s={vs} t={t} role="peasant" mood={t > at(c, 1.4) ? "sly" : "happy"} arms={t < b1 && horseK > 0.3 ? [20, 120] : roll >= 1 ? [140, 20] : [14, 14]} walk={t > b1 && t < at(c, 1.95) ? 0.6 : 0} />
          <g opacity={ramp(t, at(c, 0.6), 0.6) * (1 - ramp(t, b1, 0.5))}>
            <Tag x={1180} y={440} text="Василий" size={32} color={C.goldLight} />
          </g>
          <Say x={vx - 170} y={vy - 330} text="Мало!" size={36} k={pop(t, at(c, 1.5)) * (1 - ramp(t, at(c, 1.75), 0.4))} tail={[90, 80]} />
          {roll > 0 && <Crown x={cx} y={cy} s={0.37} rot={cr} />}
        </g>
      )}

      {/* ── акт 2: император Сун и свёрток ── */}
      {actB > 0 && (
        <g opacity={actB}>
          <path d="M 620 250 Q 900 170 1220 180 Q 1540 170 1820 250 L 1780 280 L 660 280 Z" fill={C.velvet} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <rect x={660} y={280} width={1120} height={24} fill={C.gold} stroke={OL} strokeWidth={4} />
          {[720, 1720].map((x) => (
            <rect key={x} x={x - 18} y={304} width={36} height={500} fill={C.velvetDeep} stroke={OL} strokeWidth={4} />
          ))}
          <path d="M 1100 800 Q 1500 770 1840 790" stroke="#e7cf9e" strokeWidth={50} fill="none" strokeLinecap="round" />
          <Lantern x={1170} y={370} t={t} seed={1} />
          <Lantern x={1640} y={370} t={t} seed={2} />
          <Figure x={900} y={800} s={1} t={t} role="king" body={C.velvet} mood="happy" arms={[14, given ? 30 : 70]} look={1} />
          <Plaque x={900} y={400} text="Император Сун" size={34} serif k={pop(t, b2 + 0.5)} fill={C.cream} />
          {!given && t > b2 + 0.8 && <BundleIcon x={ehx + 10} y={ehy - 20} s={0.8} />}
          <Figure x={px} y={800} s={1} t={t + 2} role="minister" mood={bowK > 0 ? "happy" : opened > 0.3 ? "shock" : "worried"} arms={[14, opened > 0 ? 80 : 50]} walk={walkK > 0.02 && walkK < 0.98 ? 1 : 0} flip={bowK > 0 || walkK < 0.02} bow={bowK} look={walkK > 0.02 && walkK < 0.98 ? 1 : -1} />
          <g opacity={ramp(t, b2 + 1, 0.6) * (1 - ramp(t, at(c, 2.4), 0.4))}>
            <Tag x={1180} y={470} text="князь" size={32} color={C.sky} />
          </g>
          {given && (
            <g>
              <BundleIcon x={(bowK > 0 || walkK < 0.02 ? px - (phx - px) : phx) + 4} y={phy - 18} s={0.8} open={opened} />
              {opened > 0 &&
                [0, 1, 2].map((i) => {
                  const k = outCubic(opened);
                  const bx = (bowK > 0 ? px - (phx - px) : phx) + (i - 1) * 90 * k;
                  return (
                    <g key={i} transform={`translate(${bx} ${phy - 50 - k * (80 + (i % 2) * 30) + wob(t, i, 4)}) rotate(${(i - 1) * 12})`} opacity={clamp01(k * 2) * (1 - bowK * 0.6)}>
                      <rect x={-34} y={-44} width={68} height={88} rx={6} fill="#fffaf0" stroke={OL} strokeWidth={4} />
                      <path d="M -20 -24 L 20 -24 M -20 -6 L 20 -6 M -20 12 L 8 12" stroke={C.inkSoft} strokeWidth={4} strokeLinecap="round" />
                      <circle cx={16} cy={28} r={9} fill={C.red} />
                    </g>
                  );
                })}
              <Plaque x={1500} y={390} text="все улики" size={34} k={pop(t, at(c, 2.7)) * (1 - ramp(t, at(c, 2.86), 0.4))} fill="#ffe1dc" color={C.velvetDeep} />
            </g>
          )}
          {bowK > 0 && (
            <g opacity={bowK}>
              <Heart x={1330} y={560 + wob(t, 2, 6)} s={1.6} color={C.coral} />
              <Plaque x={1500} y={390} text="верный вассал" size={34} k={pop(t, at(c, 2.88))} fill={C.green} color="#fff" />
            </g>
          )}
        </g>
      )}

      {/* ── акт 3: совет ── */}
      <g>
        {[
          { x: 930, text: "Друзья —\nдля дружбы", col: C.coral, at: at(c, 3.25) },
          { x: 1530, text: "Дело —\nс умелыми", col: C.green, at: at(c, 3.6) },
        ].map((cd, i) => {
          const k = pop(t, cd.at);
          if (k <= 0.01) return null;
          return (
            <g key={i} transform={`translate(${cd.x} ${470 + wob(t, i, 4)}) scale(${0.7 + 0.3 * k})`} opacity={clamp01(k * 1.5)}>
              <rect x={-266} y={-246} width={540} height={500} rx={40} fill="#24324a" opacity={0.1} />
              <rect x={-270} y={-250} width={540} height={500} rx={40} fill="#fff" stroke={cd.col} strokeWidth={8} />
              {i === 0 ? (
                <g>
                  <Heart x={0} y={-80} s={2.6} color={C.coral} />
                  <Figure x={-110} y={0} s={0.45} t={t} role="peasant" arms={[14, 60]} />
                  <Figure x={110} y={0} s={0.45} t={t + 1} role="lady" arms={[60, 14]} />
                </g>
              ) : (
                <g>
                  <g transform="translate(-60 -110)">
                    <circle r={58} fill={C.stone} stroke={OL} strokeWidth={5} />
                    {Array.from({ length: 8 }).map((_, j) => (
                      <rect key={j} x={-12} y={-80} width={24} height={30} rx={4} fill={C.stone} stroke={OL} strokeWidth={4} transform={`rotate(${j * 45 + t * 20})`} />
                    ))}
                    <circle r={22} fill="#fff" stroke={OL} strokeWidth={4} />
                  </g>
                  <Check x={90} y={-100} s={80} k={ramp(t, cd.at + 0.4, 0.6)} />
                </g>
              )}
              <Txt x={0} y={110} size={50} weight={900} color={C.ink}>
                {cd.text}
              </Txt>
            </g>
          );
        })}
      </g>
    </g>
  );
};

// ───────────── g20 · император-затворник ─────────────

const Roof: React.FC<{ x: number; y: number; k: number; lit?: number; dim?: number }> = ({ x, y, k, lit = 0, dim = 0 }) =>
  k <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * k})`} opacity={clamp01(k * 1.5) * (1 - dim * 0.4)}>
      {lit > 0 && <circle r={26} fill={C.goldLight} opacity={lit} />}
      <rect x={-12} y={-2} width={24} height={14} fill={lit > 0.5 ? C.yellow : "#f6e2c0"} stroke={OL} strokeWidth={2} />
      <path d="M -20 0 Q -10 -4 -8 -12 L 8 -12 Q 10 -4 20 0 Z" fill={lit > 0.5 ? C.gold : C.velvet} stroke={OL} strokeWidth={2} strokeLinejoin="round" />
    </g>
  );

const Fish: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -30 0 Q 0 -18 24 0 Q 0 18 -30 0 Z M 22 0 L 40 -12 L 40 12 Z" fill="#9fb8c9" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={-16} cy={-3} r={3} fill={OL} />
  </g>
);

export const QinPalace: React.FC<P> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const COLS = 19;
  const ROWS = 16;
  const AC = 9; // центральная аллея (столбец и ряд без павильонов): 18 × 15 = 270
  const AR = 7;
  const gx = 640;
  const gy = 168;
  const cw = 44;
  const ch = 38;
  const cell = (cc: number, rr: number): [number, number] => [gx + cw / 2 + cc * cw, gy + ch / 2 + rr * ch];
  const plan = 1 - ramp(t, b2, 1) * 0.7;
  // тайный путь императора по спальням
  const route: [number, number][] = [
    [2, 2],
    [2, 5],
    [6, 5],
    [6, 11],
    [12, 11],
    [12, 4],
    [16, 4],
    [16, 13],
  ];
  const rooms = [0, 2, 4, 6, 7];
  const passK = ramp(t, at(c, 1.25), 2.5);
  const segLen = route.slice(1).map((p, i) => Math.abs(p[0] - route[i][0]) + Math.abs(p[1] - route[i][1]));
  const total = segLen.reduce((a, b) => a + b, 0);
  const runK = t > at(c, 1.45) ? ((t - at(c, 1.45)) / 7) % 1 : 0;
  let left = runK * total;
  let px = route[0][0];
  let py = route[0][1];
  for (let i = 0; i < segLen.length; i++) {
    if (left <= segLen[i]) {
      const k = segLen[i] ? left / segLen[i] : 0;
      px = lerp(route[i][0], route[i + 1][0], k);
      py = lerp(route[i][1], route[i + 1][1], k);
      break;
    }
    left -= segLen[i];
    px = route[i + 1][0];
    py = route[i + 1][1];
  }
  const [rx, ry] = cell(px, py);
  // ближайшая спальня — подсвечена
  let lit = -1;
  let best = 99;
  rooms.forEach((ri) => {
    const d = Math.abs(route[ri][0] - px) + Math.abs(route[ri][1] - py);
    if (d < best) {
      best = d;
      lit = ri;
    }
  });
  const pathD = route.map((p, i) => `${i ? "L" : "M"} ${cell(p[0], p[1])[0]} ${cell(p[0], p[1])[1]}`).join(" ");
  // поездка: паланкин и тележка
  const rideK = ramp(t, b2 + 0.3, 0.8);
  const gxRide = lerp(1060, 1200, clamp01((t - b2) / 12));
  return (
    <g>
      {/* план дворца */}
      <g opacity={plan}>
        <rect x={gx - 26} y={gy - 26} width={COLS * cw + 52} height={ROWS * ch + 52} rx={18} fill="#efe0c4" stroke={OL} strokeWidth={5} opacity={ramp(t, 0.2, 0.8)} />
        <rect x={gx - 10} y={gy - 10} width={COLS * cw + 20} height={ROWS * ch + 20} rx={10} fill="none" stroke={C.velvetDeep} strokeWidth={4} strokeDasharray="14 8" opacity={ramp(t, 0.4, 0.8)} />
        <g opacity={ramp(t, 0.5, 0.8)}>
          <rect x={gx + AC * cw + 6} y={gy - 4} width={cw - 12} height={ROWS * ch + 8} rx={8} fill="#e2c98f" />
          <rect x={gx - 4} y={gy + AR * ch + 6} width={COLS * cw + 8} height={ch - 12} rx={8} fill="#e2c98f" />
        </g>
        {Array.from({ length: ROWS }).map((_, rr) =>
          Array.from({ length: COLS }).map((__, cc) => {
            if (cc === AC || rr === AR) return null;
            const [x, y] = cell(cc, rr);
            const k = ramp(t, 0.6 + (rr + cc) * 0.07, 0.5);
            const isLit = lit >= 0 && route[lit][0] === cc && route[lit][1] === rr && t > at(c, 1.45) && best < 0.8;
            return <Roof key={`${rr}-${cc}`} x={x} y={y} k={k} lit={isLit ? 1 : 0} />;
          }),
        )}
        <g transform={`translate(${cell(AC, AR)[0]} ${cell(AC, AR)[1] + 4}) scale(2.4)`}>
          <Roof x={0} y={0} k={ramp(t, 0.9, 0.6)} lit={0} />
        </g>
        {passK > 0 && (
          <g>
            <path d={pathD} fill="none" stroke={C.night} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.12} />
            <path d={pathD} fill="none" stroke={C.night} strokeWidth={6} strokeDasharray="12 10" strokeDashoffset={-t * 20} strokeLinecap="round" strokeLinejoin="round" opacity={passK} />
            {rooms.map((ri) => {
              const [x, y] = cell(route[ri][0], route[ri][1]);
              return (
                <g key={ri} opacity={passK}>
                  <path transform={`translate(${x + 18} ${y - 22})`} d="M 6 -12 A 12 12 0 1 0 6 12 A 9 9 0 1 1 6 -12 Z" fill={C.night} />
                </g>
              );
            })}
            {t > at(c, 1.45) && (
              <g transform={`translate(${rx} ${ry}) scale(1.5)`}>
                <circle cx={0} cy={-10} r={24} fill="#fff" opacity={0.75} />
                <ellipse cx={0} cy={6} rx={16} ry={6} fill="#000" opacity={0.2} />
                <path d="M -9 4 Q -12 -16 0 -18 Q 12 -16 9 4 Z" fill={C.night} />
                <circle cx={0} cy={-24} r={8} fill={C.night} />
              </g>
            )}
          </g>
        )}
      </g>
      <Plaque x={gx + (COLS * cw) / 2} y={500} text="270 павильонов" size={46} k={pop(t, b1 + 0.6) * (1 - ramp(t, at(c, 1.3), 0.6))} fill={C.goldLight} />
      <Plaque x={1660} y={300} text={"каждую ночь —\nновая спальня"} size={32} k={pop(t, at(c, 1.42)) * (1 - ramp(t, b2, 0.5))} />

      {/* правая колонка: император, позже — евнухи за занавеской */}
      <Ribbon x={1660} y={190} text="Закон 18" size={36} k={pop(t, 0.3) * (1 - ramp(t, b2, 0.5))} />
      <Plaque x={1660} y={290} text="изоляция опасна" size={32} k={pop(t, at(c, 0.3)) * (1 - ramp(t, at(c, 1.3), 0.4))} />
      <g opacity={ramp(t, at(c, 0.5), 0.8) * (1 - ramp(t, b2, 0.8))}>
        <Figure x={1660} y={800} s={1} t={t} role="king" body={C.night} mood="worried" look={Math.sin(t * 1.3)} arms={[24, 24]} />
        <Plaque x={1660} y={430} text="Цинь Шихуанди" size={32} serif k={1} fill={C.cream} />
      </g>
      {rideK > 0 && (
        <g opacity={rideK}>
          {/* занавес и евнухи */}
          <g>
            <rect x={1490} y={330} width={350} height={480} rx={16} fill="#fff1e0" stroke={OL} strokeWidth={4} />
            <Figure x={1600} y={790} s={0.95} t={t} role="minister" body={C.violet} mood="sly" look={1} talk={0.5} />
            <Figure x={1740} y={790} s={0.95} t={t + 1} role="minister" body="#5a4a8a" mood="sly" look={-1} flip />
            <path d={`M 1490 330 Q ${1560 + wob(t, 1, 8)} 560 1520 810 L 1490 810 Z`} fill={C.velvet} stroke={OL} strokeWidth={4} opacity={0.95} />
            <path d={`M 1840 330 Q ${1770 + wob(t, 2, 8)} 560 1810 810 L 1840 810 Z`} fill={C.velvet} stroke={OL} strokeWidth={4} opacity={0.95} />
            <rect x={1520} y={330} width={290} height={480} fill={C.velvet} opacity={0.32} />
            <rect x={1480} y={316} width={370} height={26} rx={10} fill={C.gold} stroke={OL} strokeWidth={4} />
            <Say x={1590} y={460} text="тсс…" size={32} k={pop(t, at(c, 2.6))} tail={[20, 60]} />
          </g>
          <Plaque x={1665} y={230} text="правили евнухи" size={34} k={pop(t, at(c, 2.62))} fill={C.purpleLight} />
          {/* дорога */}
          <rect x={600} y={760} width={860} height={60} rx={20} fill="#e7cf9e" opacity={0.9} />
          <g transform={`translate(${gxRide} 0)`}>
            {/* тележка с рыбой */}
            <path d="M -260 700 Q -220 690 -196 626" stroke="#8a5a2b" strokeWidth={5} fill="none" />
            <rect x={-440} y={690} width={180} height={64} rx={8} fill="#a8733c" stroke={OL} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => (
              <Fish key={i} x={-410 + i * 40} y={686 - (i % 2) * 10} s={0.8} rot={-10 + i * 8} />
            ))}
            {[0, 1, 2].map((i) => {
              const ph = (t * 0.6 + i * 0.33) % 1;
              return <path key={i} d={`M ${-400 + i * 50} ${660 - ph * 60} q 10 -14 0 -28 q -10 -14 0 -28`} stroke="#9fb88a" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8 * (1 - ph)} />;
            })}
            {[-400, -300].map((wx) => (
              <g key={wx} transform={`translate(${wx} 770) rotate(${t * 80})`}>
                <circle r={28} fill="#c9a06b" stroke={OL} strokeWidth={4} />
                <path d="M -28 0 L 28 0 M 0 -28 L 0 28" stroke={OL} strokeWidth={3} />
              </g>
            ))}
            {/* паланкин */}
            <Figure x={-130} y={800} s={0.72} t={t} role="peasant" walk={1} arms={[150, 150]} />
            <Figure x={120} y={800} s={0.72} t={t + 0.5} role="peasant" walk={1} arms={[150, 150]} />
            <path d="M -200 626 L 190 626" stroke="#6b4a1e" strokeWidth={12} strokeLinecap="round" />
            <rect x={-90} y={496} width={180} height={130} rx={10} fill={C.gold} stroke={OL} strokeWidth={4} />
            <rect x={-70} y={516} width={140} height={90} fill={C.velvet} stroke={OL} strokeWidth={3} />
            <path d={`M -70 516 Q ${-30 + wob(t, 5, 6)} 560 -40 606 L 40 606 Q ${30 + wob(t, 6, 6)} 560 70 516 Z`} fill={C.velvetDeep} opacity={0.5} />
            <path d="M -110 496 Q 0 446 110 496 Z" fill={C.velvetDeep} stroke={OL} strokeWidth={4} />
          </g>
          <Plaque x={gxRide - 350} y={570} text="солёная рыба" size={32} k={pop(t, at(c, 2.3))} fill="#e6f3ea" />
        </g>
      )}
    </g>
  );
};

// ───────────── g21 · Версаль ─────────────

const Bed: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -170 -420 Q 0 -470 170 -420 L 170 -390 L -170 -390 Z" fill={C.velvet} stroke={OL} strokeWidth={5} />
    <path d="M -170 -390 Q -150 -250 -130 -230 L -150 -230 Q -180 -300 -170 -390 Z M 170 -390 Q 150 -250 130 -230 L 150 -230 Q 180 -300 170 -390 Z" fill={C.velvetDeep} stroke={OL} strokeWidth={4} />
    <rect x={-168} y={-390} width={14} height={390} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
    <rect x={154} y={-390} width={14} height={390} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-452} r={14} fill={C.gold} stroke={OL} strokeWidth={4} />
  </g>
);

const Pin: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M 0 -30 L 0 30" stroke="#7d8aa0" strokeWidth={5} strokeLinecap="round" />
    <circle cx={0} cy={-32} r={9} fill={C.red} stroke={OL} strokeWidth={3} />
  </g>
);

export const Versailles: React.FC<P> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const shrink = ramp(t, b1, 1.1);
  const back = ramp(t, b2, 1);
  const pcx = lerp(660, 210, shrink);
  const pcy = lerp(470, 270, shrink);
  const ps = lerp(1, 0.4, shrink) * (1 - back * 0.0);
  const planOp = 1 - back;
  const cer = win(t, b1 + 0.4, b2, 0.8);
  const pinT = at(c, 1.55);
  const pinK = clamp01((t - pinT) / 0.7);
  const heard = t > pinT + 0.7;
  const rings = [
    { r: 175, n: 10, col: C.gold, k: at(c, 0.45) },
    { r: 255, n: 16, col: C.velvet, k: at(c, 0.6) },
    { r: 335, n: 22, col: C.skyDeep, k: at(c, 0.75) },
  ];
  return (
    <g>
      {/* план: спальня в центре, кольца придворных по рангу */}
      {planOp > 0 && (
        <g transform={`translate(${pcx} ${pcy}) scale(${ps})`} opacity={planOp}>
          <circle r={372} fill="#f3ecdc" stroke={OL} strokeWidth={5} opacity={ramp(t, 0.2, 0.8)} />
          {rings.map((rg, i) => (
            <g key={i} opacity={ramp(t, rg.k, 0.6)} transform={`rotate(${t * (i % 2 ? -3 : 3)})`}>
              <circle r={rg.r} fill="none" stroke={rg.col} strokeWidth={4} strokeDasharray="10 12" opacity={0.6} />
              {Array.from({ length: rg.n }).map((_, j) => {
                const a = (j / rg.n) * Math.PI * 2;
                const k = pop(t, rg.k + j * 0.04);
                return (
                  <g key={j} transform={`translate(${Math.cos(a) * rg.r} ${Math.sin(a) * rg.r}) scale(${k})`}>
                    <circle r={22} fill={rg.col} stroke={OL} strokeWidth={3} />
                    <circle cy={-4} r={10} fill="#f2c79b" stroke={OL} strokeWidth={2} />
                  </g>
                );
              })}
            </g>
          ))}
          <g transform={`scale(${pop(t, 0.5)})`}>
            <circle r={120} fill={C.goldLight} opacity={0.4 + 0.15 * Math.sin(t * 2)} />
            <rect x={-80} y={-80} width={160} height={160} rx={22} fill={C.gold} stroke={OL} strokeWidth={5} />
            <rect x={-46} y={-20} width={92} height={60} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
            <rect x={-46} y={-20} width={92} height={18} rx={6} fill={C.velvet} />
            <Crown x={0} y={-30} s={0.45} />
          </g>
        </g>
      )}
      <g opacity={1 - shrink}>
        <Ribbon x={1170} y={190} text="Версаль" size={36} k={pop(t, 0.3)} />
        <Plaque x={1170} y={330} text={"спальня короля —\nв центре"} size={32} k={pop(t, at(c, 0.3))} />
        <Plaque x={1170} y={560} text={"придворные\nпо рангу"} size={32} k={pop(t, at(c, 0.62))} />
        <Arrow x1={1060} y1={430} x2={780} y2={460} k={ramp(t, at(c, 0.35), 0.7)} w={7} bend={0.15} />
        <Arrow x1={1060} y1={600} x2={960} y2={620} k={ramp(t, at(c, 0.68), 0.6)} w={7} bend={-0.15} />
      </g>

      {/* церемония пробуждения */}
      {cer > 0 && (
        <g opacity={cer}>
          <rect x={430} y={300} width={900} height={510} rx={26} fill="#fff6ea" stroke={OL} strokeWidth={5} />
          <rect x={430} y={720} width={900} height={90} fill="#ead2a8" opacity={0.7} />
          <path d="M 455 720 L 455 470 Q 510 430 565 470 L 565 720 Z" fill="#5a4a6a" stroke={OL} strokeWidth={5} />
          <path d="M 440 722 L 440 462 Q 510 410 580 462 L 580 722" fill="none" stroke={C.goldDeep} strokeWidth={10} />
          <Bed x={1100} y={800} s={0.75} />
          <Figure x={1100} y={790} s={0.85} t={t} role="king" mood={heard && t < pinT + 3 ? "shock" : "neutral"} look={heard ? -1 : 0} arms={[40, 40]} />
          <rect x={985} y={660} width={230} height={70} rx={14} fill={C.purpleLight} stroke={OL} strokeWidth={4} />
          <rect x={970} y={730} width={260} height={60} rx={8} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
          {Array.from({ length: 6 }).map((_, i) => {
            const k = ramp(t, b1 + 0.6 + i * 0.25, 0.6);
            const x = 560 + i * 60 + Math.max(0, Math.sin(t * 1.2 - i * 0.5)) * 8;
            return (
              <g key={i} opacity={k}>
                <Figure x={x} y={800} s={0.52} t={t + i} role={(["courtier", "lady", "minister", "courtier", "lady", "soldier"] as const)[i]} look={1} mood="happy" walk={0.3} />
              </g>
            );
          })}
          <Plaque x={720} y={380} text="100+ человек" size={36} k={pop(t, at(c, 1.25))} fill={C.goldLight} />
          {/* булавка */}
          {pinK > 0 && <Pin x={lerp(930, 915, pinK)} y={lerp(420, 790, pinK * pinK)} rot={pinK * 260} />}
          {heard && (
            <g opacity={1 - ramp(t, pinT + 3.5, 0.8)}>
              {[0, 1, 2].map((i) => {
                const ph = ((t - pinT) * 1.2 + i * 0.33) % 1;
                return <path key={i} d={`M ${915 - 30 - ph * 40} ${770 - ph * 30} q ${30 + ph * 40} ${-30 - ph * 30} ${60 + ph * 80} 0`} stroke={C.skyDeep} strokeWidth={5} fill="none" opacity={1 - ph} />;
              })}
              <Txt x={945} y={600} size={40} weight={900} color={C.skyDeep}>
                дзынь!
              </Txt>
            </g>
          )}
        </g>
      )}

      {/* вывод: дверь к людям открыта */}
      {back > 0 && (
        <g opacity={back}>
          {/* дверь */}
          <g transform="translate(400 0)">
            <path d="M -130 800 L -130 420 Q 0 340 130 420 L 130 800 Z" fill="#fff4c9" stroke={OL} strokeWidth={5} />
            <circle cx={0} cy={600} r={180} fill={C.yellow} opacity={0.25 + 0.08 * Math.sin(t * 2)} />
            {[-60, 0, 60].map((dx, i) => (
              <g key={i} opacity={0.75}>
                <Figure x={dx} y={790} s={0.42} t={t + i} role={(["modern", "lady", "peasant"] as const)[i]} mood="happy" arms={i === 1 ? [14, 140] : [14, 14]} />
              </g>
            ))}
            <path d={`M 130 800 L 130 420 L ${230 - wob(t, 1, 4)} 380 L ${230 - wob(t, 1, 4)} 830 Z`} fill="#a8733c" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={205} cy={620} r={9} fill={C.gold} stroke={OL} strokeWidth={3} />
            <Plaque x={0} y={250} text={"дверь к людям\nоткрыта"} size={34} k={pop(t, b2 + 0.4)} fill={C.green} color="#fff" />
          </g>
          {/* уютный уголок */}
          <g transform="translate(1040 0)">
            <path d="M -110 800 L -110 640 Q -110 560 -40 560 L 40 560 Q 110 560 110 640 L 110 800" fill={C.skyDeep} stroke={OL} strokeWidth={5} />
            <rect x={-140} y={660} width={60} height={120} rx={22} fill={C.sky} stroke={OL} strokeWidth={5} />
            <rect x={80} y={660} width={60} height={120} rx={22} fill={C.sky} stroke={OL} strokeWidth={5} />
            <rect x={-90} y={700} width={180} height={60} rx={14} fill={C.sky} stroke={OL} strokeWidth={4} />
            <path d="M 210 800 L 210 520" stroke={OL} strokeWidth={6} />
            <path d="M 170 520 L 250 520 L 230 470 L 190 470 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
            <circle cx={210} cy={560} r={70} fill={C.goldLight} opacity={0.35 + 0.1 * Math.sin(t * 1.7)} />
            <rect x={-40} y={672} width={80} height={24} rx={4} fill={C.velvet} stroke={OL} strokeWidth={3} transform={`rotate(-8)`} />
            <Plaque x={30} y={420} text={"уединение —\nненадолго"} size={34} k={pop(t, at(c, 2.45))} fill={C.skyDeep} color="#fff" />
          </g>
          <Arrow x1={900} y1={620} x2={680} y2={620} k={ramp(t, at(c, 2.65), 0.9)} w={9} color={C.greenDeep} bend={-0.2} />
        </g>
      )}
    </g>
  );
};

// ───────────── g22 · надпись на тазике ─────────────

const Basin: React.FC<{ x: number; y: number; s?: number; glow?: number; t: number }> = ({ x, y, s = 1, glow = 0, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <circle cy={-10} r={80} fill={C.goldLight} opacity={glow * (0.5 + 0.15 * Math.sin(t * 4))} />}
    <path d="M -70 -24 Q -60 20 0 22 Q 60 20 70 -24 Z" fill="#cfd8e3" stroke={OL} strokeWidth={4} />
    <ellipse cx={0} cy={-24} rx={74} ry={16} fill="#e8eef5" stroke={OL} strokeWidth={4} />
    <path d="M -36 -2 L 36 -2" stroke={C.gold} strokeWidth={4} strokeLinecap="round" strokeDasharray="8 5" opacity={0.6 + glow * 0.4} />
    <path d="M -44 -30 Q -50 -10 -30 8" stroke="#fff" strokeWidth={5} opacity={0.7} fill="none" strokeLinecap="round" />
  </g>
);

const Purse: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -26 -10 Q -34 30 0 30 Q 34 30 26 -10 Q 14 -20 0 -18 Q -14 -20 -26 -10 Z" fill="#a8733c" stroke={OL} strokeWidth={4} />
    <path d="M -14 -18 L 0 -30 L 14 -18" fill="none" stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={8} r={8} fill={C.gold} stroke={OL} strokeWidth={2} />
  </g>
);

export const BasinScene: React.FC<P> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const b3 = at(c, 3);
  const intro = 1 - ramp(t, b1, 0.6);
  const dervish = win(t, b1 + 0.3, b2, 0.7);
  const plot = ramp(t, b2, 0.8) * (1 - ramp(t, at(c, 3.4), 1));
  const take = ramp(t, at(c, 2.62), 0.8);
  const read = ramp(t, at(c, 2.82), 0.6);
  const confess = ramp(t, at(c, 3.35), 1);
  const scared = t > b3;
  const sx0 = 1010;
  const sx = lerp(lerp(sx0, 1150, take), 1400, confess) + (scared && confess < 1 ? Math.sin(t * 40) * 3 : 0);
  const sy = 800 + confess * 12;
  const [shx, shy] = handOf(sx, sy, 1, 60);
  const purseK = clamp01((t - at(c, 2.2)) / 0.9);
  const [chx, chy] = handOf(760, 800, 1, 70);
  return (
    <g>
      {/* стена дворца */}
      <rect x={620} y={140} width={1220} height={670} rx={30} fill="#fbf1de" stroke={OL} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${700 + i * 240} 810 L ${700 + i * 240} 360 Q ${790 + i * 240} 280 ${880 + i * 240} 360 L ${880 + i * 240} 810`} fill="#f3e3c4" stroke="#d9c08e" strokeWidth={4} opacity={0.7} />
      ))}
      <rect x={620} y={740} width={1220} height={70} fill="#e9d3a6" opacity={0.6} />
      {/* надпись золотом */}
      <g opacity={ramp(t, at(c, 1.72), 1)}>
        <rect x={830} y={170} width={800} height={110} rx={18} fill={C.night} stroke={C.gold} strokeWidth={6} />
        <text x={1230} y={242} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={48} fill={C.goldLight}>
          Подумай, чем закончится
        </text>
        <Sparkle x={850} y={180} t={t} seed={1} />
        <Sparkle x={1610} y={270} t={t} seed={2} />
      </g>
      {intro > 0 && (
        <g opacity={intro}>
          <Ribbon x={1230} y={380} text="Закон 29" k={pop(t, 0.3)} />
          <Plaque x={1230} y={500} text="Планируй до самого конца" size={42} k={pop(t, at(c, 0.25))} />
          <Plaque x={1230} y={620} text="восточная притча" size={32} serif k={pop(t, at(c, 0.6))} fill={C.cream} />
        </g>
      )}
      {/* царь на троне */}
      <g opacity={ramp(t, b1, 0.8)}>
        <Throne x={1680} y={800} s={0.8} />
        <Figure x={1680} y={790} s={1} t={t} role="king" mood={confess > 0.5 ? "proud" : "happy"} look={-1} arms={t > at(c, 1.65) && t < at(c, 1.9) ? [14, 120] : [14, 30]} />
        {/* столик с серебряным тазиком */}
        <rect x={1180} y={690} width={140} height={18} rx={5} fill="#a8733c" stroke={OL} strokeWidth={4} />
        <path d="M 1200 708 L 1205 800 M 1300 708 L 1295 800" stroke={OL} strokeWidth={8} strokeLinecap="round" />
      </g>
      {take < 0.02 ? (
        <g opacity={ramp(t, at(c, 1.85), 0.8)}>
          <Basin x={1250} y={668} s={0.8} t={t} glow={0} />
        </g>
      ) : (
        <Basin x={lerp(1250, shx - 30, take)} y={lerp(668, shy - 10, take)} s={lerp(0.8, 0.9, take)} t={t} glow={read * (1 - confess * 0.5)} />
      )}
      {/* дервиш и смеющаяся свита */}
      {dervish > 0 && (
        <g opacity={dervish}>
          <Figure x={1060} y={800} s={1} t={t} role="peasant" body="#9c7a4a" mood="happy" arms={[14, 70]} look={1} />
          <Scroll x={1185} y={560} w={170} h={110} lines={["совет"]} size={32} open={ramp(t, b1 + 0.6, 0.6)} />
          <Plaque x={1060} y={400} text="100 динаров" size={34} k={pop(t, at(c, 1.12))} fill={C.goldLight} />
          {[0, 1, 2].map((i) => (
            <Coin key={i} x={1170 + i * 40} y={440 - Math.abs(Math.sin(t * 3 + i)) * 10} r={18} rot={t * 3 + i} />
          ))}
          <Figure x={770} y={800} s={0.85} t={t} role="courtier" mood={t > at(c, 1.45) ? "talk" : "happy"} arms={[14, 40]} />
          <Figure x={900} y={800} s={0.85} t={t + 1} role="lady" mood={t > at(c, 1.45) ? "talk" : "happy"} arms={[40, 14]} />
          <g opacity={ramp(t, at(c, 1.45), 0.4)}>
            <Txt x={835} y={520 + wob(t, 1, 5)} size={40} weight={900} color={C.velvet}>
              ха-ха!
            </Txt>
          </g>
        </g>
      )}
      {/* заговорщик и хирург */}
      {plot > 0 && (
        <g opacity={plot}>
          <path d="M 670 810 L 670 400 Q 760 320 850 400 L 850 810 Z" fill="#3a3550" opacity={0.3} />
          <Figure x={760} y={800} s={1} t={t} role="minister" body="#3a3550" mood="sly" arms={[14, purseK < 1 ? 70 : 20]} look={1} />
          <Plaque x={760} y={440} text="заговорщик" size={32} k={pop(t, b2 + 0.4)} fill="#e3e0ef" />
        </g>
      )}
      <g opacity={ramp(t, b2 + 0.3, 0.8)}>
        <Figure x={sx} y={sy} s={1} t={t} role="scholar" body="#7fa7c9" mood={confess > 0.1 ? "shock" : scared ? "worried" : read > 0.5 ? "shock" : "neutral"} arms={[14, 60]} look={confess > 0 ? 1 : -1} bow={confess * 0.6} />
        <g opacity={1 - ramp(t, b3, 0.5)}>
          <Plaque x={sx0} y={440} text="хирург" size={32} k={pop(t, b2 + 0.6)} fill="#e3eef8" />
        </g>
        <Drops x={sx - 50} y={sy - 300 + confess * 40} t={t} k={ramp(t, b3 + 0.4, 0.5)} />
      </g>
      {purseK > 0 && purseK < 1 && <Purse x={lerp(chx, shx - 60, purseK)} y={lerp(chy - 10, shy, purseK) - Math.sin(purseK * Math.PI) * 60} s={0.9} />}
      {t > at(c, 2.2) + 0.9 && t < b3 && <Purse x={shx - 64} y={shy + 34} s={0.7} />}
      {/* ланцет */}
      <g opacity={win(t, at(c, 2.35), at(c, 2.6), 0.4)}>
        <g transform={`translate(${chx + 30} ${chy - 40}) rotate(-30)`}>
          <rect x={-30} y={-5} width={40} height={10} rx={4} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
          <path d="M 10 -5 L 42 0 L 10 5 Z" fill="#cfd8e3" stroke={OL} strokeWidth={3} />
        </g>
        <Txt x={chx + 30} y={chy - 90} size={30} weight={900} color={C.inkSoft}>
          ланцет
        </Txt>
      </g>
      {/* лупа над тазиком */}
      {read > 0 && (
        <g opacity={read * (1 - ramp(t, b3 + 0.2, 0.6))}>
          <circle cx={1250} cy={440} r={110} fill="#fff" stroke={C.gold} strokeWidth={8} />
          <Txt x={1250} y={428} size={34} weight={900} color={C.goldDeep}>
            {"чем\nзакончится?"}
          </Txt>
          <path d={`M ${shx - 30} ${shy - 40} L 1200 548`} stroke={C.gold} strokeWidth={5} strokeDasharray="10 8" />
        </g>
      )}
      <Say x={1250} y={420} text={"…и меня\nуберут!"} size={36} k={pop(t, at(c, 3.12)) * (1 - ramp(t, at(c, 3.45), 0.4))} tail={[sx - 1250 > 0 ? 40 : -60, 140]} />
      <Plaque x={1200} y={430} text="хирург признался" size={42} k={pop(t, at(c, 3.6))} fill={C.green} color="#fff" />
    </g>
  );
};

// ───────────── g23 · Бисмарк и Бальбоа ─────────────

const Flag: React.FC<{ x: number; y: number; t: number; color: string; label?: string; s?: number; seed?: number }> = ({ x, y, t, color, label, s = 1, seed = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 L 0 -110" stroke={OL} strokeWidth={5} strokeLinecap="round" />
    <path d={`M 0 -110 Q ${30 + wob(t, seed, 5)} ${-100 + wob(t, seed + 1, 3)} 60 -96 Q ${36 + wob(t, seed + 2, 4)} -80 60 -66 Q 30 -72 0 -66 Z`} fill={color} stroke={OL} strokeWidth={3.5} strokeLinejoin="round" />
    {label && (
      <text x={26} y={-76} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">
        {label}
      </text>
    )}
  </g>
);

const Stop: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const pts = Array.from({ length: 8 })
    .map((_, i) => {
      const a = ((i + 0.5) / 8) * Math.PI * 2;
      return `${Math.cos(a) * 56},${Math.sin(a) * 56}`;
    })
    .join(" ");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <polygon points={pts} fill={C.red} stroke={OL} strokeWidth={4} />
      <polygon points={pts} fill="none" stroke="#fff" strokeWidth={4} transform="scale(0.84)" />
      <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#fff">
        СТОП
      </text>
    </g>
  );
};

const Dove: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  const f = Math.sin(t * 9) * 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -6 -4 Q -30 ${-30 - f} -56 ${-20 - f} Q -30 -6 -6 6 Z`} fill="#fff" stroke={OL} strokeWidth={3.5} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={30} ry={14} fill="#fff" stroke={OL} strokeWidth={3.5} />
      <circle cx={28} cy={-8} r={11} fill="#fff" stroke={OL} strokeWidth={3.5} />
      <path d="M 38 -8 L 48 -4 L 38 -2 Z" fill={C.gold} stroke={OL} strokeWidth={2} />
      <circle cx={30} cy={-10} r={2.5} fill={OL} />
      <path d="M 44 0 Q 56 8 60 20" stroke={C.greenDeep} strokeWidth={4} fill="none" />
      <ellipse cx={56} cy={10} rx={6} ry={3} fill={C.green} />
      <path d="M -30 0 L -46 -6 L -46 8 Z" fill="#fff" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};

// германские земли: куски, которые сходятся в одно целое
const LANDS: { d: string; col: string; dx: number; dy: number }[] = [
  { d: "M -40 -70 L 60 -90 L 120 -40 L 70 10 L -10 0 Z", col: C.skyDeep, dx: 40, dy: -40 },
  { d: "M -10 0 L 70 10 L 60 70 L -20 80 L -50 30 Z", col: C.coral, dx: 30, dy: 40 },
  { d: "M -140 -40 L -40 -70 L -10 0 L -50 30 L -130 20 Z", col: C.green, dx: -50, dy: -30 },
  { d: "M -130 20 L -50 30 L -20 80 L -90 110 L -150 70 Z", col: C.yellow, dx: -50, dy: 40 },
  { d: "M 70 10 L 120 -40 L 150 20 L 120 80 L 60 70 Z", col: C.violet, dx: 50, dy: 10 },
  { d: "M -20 80 L 60 70 L 120 80 L 80 120 L -60 120 L -90 110 Z", col: "#ff9ec0", dx: 0, dy: 50 },
];

export const TwoEndings: React.FC<P> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const leftK = ramp(t, 0.2, 0.8);
  const unite = ramp(t, at(c, 0.35), 1.6);
  const rightK = ramp(t, b2, 0.8);
  const trap = ramp(t, at(c, 2.6), 1);
  const fadeFlag = ramp(t, at(c, 2.75), 1.4);
  const dove = ramp(t, at(c, 1.55), 0.8);
  return (
    <g>
      {/* развилка дорог */}
      <path d="M 700 1000 Q 700 860 380 780 M 700 1000 Q 700 860 1030 780" stroke="#e7cf9e" strokeWidth={60} fill="none" strokeLinecap="round" opacity={ramp(t, 0.1, 0.8)} />
      <path d="M 700 1000 Q 700 860 380 780 M 700 1000 Q 700 860 1030 780" stroke="#fff" strokeWidth={5} strokeDasharray="20 18" fill="none" opacity={ramp(t, 0.1, 0.8) * 0.8} />
      {/* ── Бисмарк ── */}
      <g opacity={leftK * (1 - rightK * 0.25)}>
        <rect x={86} y={138} width={580} height={570} rx={34} fill="#24324a" opacity={0.1} />
        <rect x={80} y={130} width={580} height={570} rx={34} fill="#fff" stroke={OL} strokeWidth={5} />
        <Tag x={370} y={190} text="Бисмарк" size={34} color={C.goldLight} />
        <g transform="translate(370 380)">
          {LANDS.map((ld, i) => {
            const k = 1 - outCubic(unite);
            const col = unite > 0.85 ? (i === 0 ? C.skyDeep : "#7fb7e6") : ld.col;
            return <path key={i} d={ld.d} transform={`translate(${ld.dx * k} ${ld.dy * k + wob(t, i, 2) * k})`} fill={col} stroke={OL} strokeWidth={4} strokeLinejoin="round" opacity={pop(t, 0.5 + i * 0.12)} />;
          })}
          {unite > 0.85 && <path d="M -140 -40 L -40 -70 L 60 -90 L 120 -40 L 150 20 L 120 80 L 80 120 L -60 120 L -90 110 L -150 70 L -130 20 Z" fill="none" stroke={OL} strokeWidth={8} strokeLinejoin="round" opacity={ramp(t, at(c, 0.35) + 1.4, 0.4)} />}
          <g opacity={ramp(t, at(c, 0.3), 0.6)}>
            <Txt x={40} y={-30} size={30} weight={900} color="#fff">
              Пруссия
            </Txt>
          </g>
        </g>
        <Figure x={170} y={690} s={0.6} t={t} role="general" body="#2f4f6f" mood={t > b1 ? "proud" : "neutral"} arms={t > b1 + 0.5 && t < at(c, 1.6) ? [14, 150] : [14, 20]} look={1} />
        {[0, 1, 2].map((i) => {
          const k = pop(t, at(c, 0.68 + i * 0.08));
          return k > 0.01 ? (
            <g key={i} transform={`translate(${290 + i * 70} 690) scale(${k}) translate(${-290 - i * 70} -690)`}>
              <Flag x={290 + i * 70} y={690} t={t} color={C.velvet} label={String(i + 1)} s={0.9} seed={i} />
            </g>
          ) : null;
        })}
        {/* Вена и стоп */}
        <g opacity={ramp(t, b1 + 0.3, 0.6)}>
          <path d="M 570 690 L 570 600" stroke={OL} strokeWidth={6} />
          <path d="M 520 600 L 620 600 L 640 575 L 620 550 L 520 550 Z" fill="#fff4c9" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
          <Txt x={575} y={586} size={30} weight={900}>
            Вена
          </Txt>
          <g transform={`translate(570 485) scale(${pop(t, at(c, 1.25))})`}>
            <Stop x={0} y={0} s={0.85} />
          </g>
        </g>
        {dove > 0 && <Dove x={lerp(250, 470, dove) + Math.sin(t * 1.2) * 30} y={300 + Math.cos(t * 1.6) * 14 - dove * 20} t={t} s={1.05} />}
      </g>
      <Ribbon x={370} y={770} text="финал продуман" color={C.greenDeep} size={36} k={pop(t, at(c, 1.75))} />

      {/* ── Бальбоа ── */}
      {rightK > 0 && (
        <g opacity={rightK} transform={`translate(${(1 - rightK) * 60} 0)`}>
          <defs>
            <clipPath id="ppl-g23-card">
              <rect x={745} y={135} width={570} height={560} rx={30} />
            </clipPath>
          </defs>
          <rect x={746} y={138} width={580} height={570} rx={34} fill="#24324a" opacity={0.1} />
          <rect x={740} y={130} width={580} height={570} rx={34} fill="#dff3ff" stroke={OL} strokeWidth={5} />
          <Tag x={1030} y={190} text="Бальбоа" size={34} color={C.goldLight} />
          {/* океан и берег */}
          <g clipPath="url(#ppl-g23-card)">
          <path d="M 745 420 L 1315 420 L 1315 670 Q 1315 695 1290 695 L 770 695 Q 745 695 745 670 Z" fill={C.sky} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${760 + ((t * 30 + i * 80) % 80)} ${450 + i * 40} q 30 -14 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.7} />
          ))}
          <path d="M 745 600 Q 950 560 1110 610 Q 1220 640 1315 600 L 1315 670 Q 1315 695 1290 695 L 770 695 Q 745 695 745 670 Z" fill="#f2d9a3" />
          <Plaque x={1130} y={300} text="Тихий океан" size={32} k={pop(t, at(c, 2.2)) * (1 - ramp(t, at(c, 2.6), 0.4))} fill="#fff" />
          <Figure x={900} y={680} s={0.62} t={t} role="soldier" body={trap > 0.5 ? "#8d93a6" : "#3d6bd6"} mood={trap > 0.4 ? "worried" : "proud"} arms={[14, 150]} opacity={1 - fadeFlag * 0.6} />
          <g opacity={1 - fadeFlag * 0.55}>
            <Flag x={960} y={600} t={t} color={fadeFlag > 0.5 ? "#b7b9c4" : C.yellowDeep} s={1.1} seed={4} />
          </g>
          {/* ловушка: силуэты солдат смыкаются */}
          {trap > 0 &&
            [0, 1, 2, 3].map((i) => {
              const side = i < 2 ? -1 : 1;
              const x = 900 + side * lerp(330, 130 + (i % 2) * 70, outCubic(trap));
              return (
                <g key={i} opacity={trap * 0.85} transform={`translate(${x} 690) scale(${side < 0 ? 1 : -1} 1)`}>
                  <path d="M -16 0 L -14 -60 Q -22 -110 0 -116 Q 22 -110 14 -60 L 16 0 Z" fill="#3a3550" />
                  <circle cx={0} cy={-132} r={18} fill="#3a3550" />
                  <path d="M -20 -142 Q 0 -168 20 -142 Z" fill="#3a3550" />
                  <path d="M 20 -100 L 34 -190" stroke="#3a3550" strokeWidth={6} strokeLinecap="round" />
                </g>
              );
            })}
          </g>
          {trap > 0 && <Plaque x={1030} y={300} text="ловушка соперника" size={30} k={pop(t, at(c, 2.68))} fill="#e3e0ef" />}
        </g>
      )}
      <Ribbon x={1030} y={770} text="финал забыт" color="#7d7a92" size={36} k={pop(t, at(c, 2.85))} />
    </g>
  );
};

// ───────────── g34b · бесплатная земля ─────────────

const Mousetrap: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={150} ry={14} fill="#000" opacity={0.1} />
    <rect x={-130} y={-30} width={260} height={36} rx={6} fill="#c9a06b" stroke={OL} strokeWidth={4} />
    <path d="M -100 -30 L -100 -46 L 90 -46 L 90 -30" stroke="#8d93a6" strokeWidth={7} fill="none" strokeLinejoin="round" />
    <path d={`M -10 -30 L -10 ${-120 + Math.sin(t * 2) * 2} L 100 ${-120 + Math.sin(t * 2) * 2}`} stroke="#8d93a6" strokeWidth={7} fill="none" strokeLinejoin="round" />
    <circle cx={-10} cy={-30} r={10} fill="#8d93a6" stroke={OL} strokeWidth={3} />
    <g transform="translate(50 -30)">
      <path d="M -40 0 L 40 0 L 40 -40 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={22} cy={-12} r={5} fill={C.yellowDeep} />
      <circle cx={8} cy={-5} r={4} fill={C.yellowDeep} />
    </g>
  </g>
);

const Register: React.FC<{ x: number; y: number; s?: number; k: number; t: number }> = ({ x, y, s = 1, k, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-90} y={-70} width={180} height={90} rx={12} fill={C.stone} stroke={OL} strokeWidth={4} />
    <rect x={-60} y={-130} width={120} height={56} rx={8} fill={C.night} stroke={OL} strokeWidth={4} />
    <text x={0} y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.goldLight} opacity={k}>
      25 $
    </text>
    {[-1, 0, 1].map((i) => (
      <rect key={i} x={i * 44 - 16} y={-50} width={32} height={18} rx={4} fill="#fff" stroke={OL} strokeWidth={3} />
    ))}
    <rect x={-100} y={20} width={200} height={26} rx={6} fill="#9c917f" stroke={OL} strokeWidth={4} />
    {k > 0.5 && <Coin x={70 + Math.sin(t * 3) * 3} y={-150} r={20} rot={t * 4} />}
  </g>
);

export const FreeLand: React.FC<P> = (c) => {
  const { t } = c;
  const f = (x: number) => at(c, x);
  const signK = pop(t, f(0.06));
  const trapK = pop(t, f(0.3));
  const weil = ramp(t, f(0.5), 0.8);
  const lens = ramp(t, f(0.66), 0.8);
  const cash = ramp(t, f(0.76), 0.6);
  const fake = pop(t, f(0.86));
  return (
    <g>
      {/* участок земли с забором */}
      <g opacity={ramp(t, 0.1, 0.8)}>
        <path d="M 90 640 Q 560 590 1030 640 L 1030 820 L 90 820 Z" fill="#a9dd8f" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i}>
            <rect x={110 + i * 76} y={650 - Math.sin(i * 0.4) * 6} width={16} height={86} rx={4} fill="#fff4e0" stroke={OL} strokeWidth={3} />
          </g>
        ))}
        <path d="M 100 680 Q 560 640 1020 680 M 100 714 Q 560 674 1020 714" stroke="#fff4e0" strokeWidth={9} fill="none" />
        <path d="M 100 680 Q 560 640 1020 680 M 100 714 Q 560 674 1020 714" stroke={OL} strokeWidth={2} fill="none" opacity={0.5} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M ${150 + i * 150} 800 q ${wob(t, i, 4)} -20 ${wob(t, i + 1, 6)} -36`} stroke={C.greenDeep} strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        <Cloud x={((t * 16 + 200) % 1200) + 80} y={170} s={0.8} opacity={0.75} />
        <Cloud x={((t * 10 + 800) % 1200) + 80} y={240} s={0.55} opacity={0.6} />
      </g>
      {/* вывеска */}
      {signK > 0.01 && (
        <g transform={`translate(560 340) scale(${0.7 + 0.3 * signK}) translate(-560 -340)`} opacity={clamp01(signK * 1.5)}>
          <path d="M 260 410 L 260 700 M 860 410 L 860 700" stroke="#8a5a2b" strokeWidth={22} strokeLinecap="round" />
          <rect x={186} y={262} width={760} height={160} rx={24} fill="#24324a" opacity={0.12} />
          <rect x={180} y={254} width={760} height={160} rx={24} fill={C.green} stroke={OL} strokeWidth={6} />
          <rect x={196} y={270} width={728} height={128} rx={16} fill="none" stroke={C.goldLight} strokeWidth={5} />
          <text x={560} y={328} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#fff">
            БЕСПЛАТНАЯ
          </text>
          <text x={560} y={384} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.goldLight}>
            ЗЕМЛЯ
          </text>
          {/* мелкий шрифт (намеренно крошечный — его разглядывает лупа) */}
          <text x={800} y={446} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={16} fill={C.ink} opacity={ramp(t, f(0.55), 0.6)}>
            * оформление — 25 $
          </text>
          {[0, 1, 2, 3].map((i) => (
            <Sparkle key={i} x={[200, 920, 230, 900][i]} y={[262, 270, 404, 400][i]} t={t} seed={i} s={0.9} color={C.goldLight} />
          ))}
        </g>
      )}
      {/* мышеловка с сыром */}
      {trapK > 0.01 && (
        <g transform={`translate(560 760) scale(${0.6 + 0.4 * trapK}) translate(-560 -760)`} opacity={clamp01(trapK * 1.5)}>
          <Mousetrap x={560} y={770} s={0.9} t={t} />
        </g>
      )}
      <Plaque x={480} y={575} text="скрытая цена" size={36} k={pop(t, f(0.36))} fill="#ffe1dc" color={C.velvetDeep} />
      {/* лупа над мелким шрифтом */}
      {lens > 0 && (
        <g opacity={lens} transform={`translate(${lerp(860, 800, lens)} ${555 + wob(t, 2, 4)})`}>
          <path d="M 76 76 L 140 140" stroke="#8a5a2b" strokeWidth={22} strokeLinecap="round" />
          <circle r={108} fill="#fff" opacity={0.94} />
          <circle r={108} fill="none" stroke={OL} strokeWidth={8} />
          <Txt x={0} y={-10} size={30} weight={800} color={C.ink}>
            оформление
          </Txt>
          <Txt x={0} y={44} size={50} weight={900} color={C.red}>
            25 $
          </Txt>
        </g>
      )}
      {/* Вейл и касса */}
      <g opacity={weil}>
        <Figure x={1230} y={800} s={1} t={t} role="merchant" body="#e0b92e" mood="sly" arms={[14, fake > 0.1 ? 120 : 40]} look={-1} />
        <Plaque x={1225} y={455} text={"Жёлтый Малыш\nВейл"} size={32} k={weil} fill={C.goldLight} />
      </g>
      {cash > 0 && (
        <g opacity={cash}>
          <Register x={1060} y={760} s={0.85} k={ramp(t, f(0.8), 0.4)} t={t} />
        </g>
      )}
      {/* бумаги с печатью */}
      {fake > 0.01 && (
        <g transform={`translate(1200 250) scale(${0.6 + 0.4 * fake}) rotate(${4 + wob(t, 3, 1.5)})`} opacity={clamp01(fake * 1.5)}>
          <rect x={-114} y={-96} width={228} height={180} rx={10} fill="#24324a" opacity={0.12} />
          <rect x={-120} y={-104} width={228} height={180} rx={10} fill="#fffaf0" stroke={OL} strokeWidth={4} />
          <path d="M -90 -70 L 70 -70 M -90 -44 L 70 -44 M -90 -18 L 30 -18" stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" />
          <g transform={`rotate(-12) scale(${1 + (1 - clamp01((t - f(0.86)) * 4)) * 0.5})`}>
            <rect x={-104} y={6} width={200} height={54} rx={8} fill="none" stroke={C.red} strokeWidth={5} />
            <text x={-4} y={45} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.red}>
              ПОДДЕЛЬНО
            </text>
          </g>
        </g>
      )}
      <Ribbon x={560} y={170} text="Закон 40" k={pop(t, 0.2)} />
    </g>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PEOPLE_VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  silkRoad: SilkRoad,
  fordBooks: FordBooks,
  stableFriend: StableFriend,
  qinPalace: QinPalace,
  versailles: Versailles,
  basin: BasinScene,
  twoEndings: TwoEndings,
  freeLand: FreeLand,
};
