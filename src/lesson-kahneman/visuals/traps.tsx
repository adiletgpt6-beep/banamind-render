// Часть «Ловушки интуиции»: малые выборки, якорь, доступность, похожесть (Стив),
// Линда, такси и базовые частоты, регрессия к среднему, памятка.
// Все времена привязаны к репликам через at(c, n); абсолютных секунд нет.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT, S1, S2 } from "../theme";
import { Dot } from "./chars";
import { Bubble, OL, Person } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualCtx, type VisualProps } from "./kit";

const RUBIK = "Rubik, 'Segoe UI', sans-serif";
const outCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const GREY = "#d5dbe6";

// ───────────── мелкие иконки ─────────────

const Title: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; anchor?: "start" | "middle" | "end" }> = ({ x, y, text, size = 36, color = C.ink, anchor = "middle" }) => (
  <text x={x} y={y} fontFamily={RUBIK} fontWeight={700} fontSize={size} fill={color} textAnchor={anchor}>
    {text}
  </text>
);

const Ball: React.FC<{ x: number; y: number; r: number; red: boolean; k?: number }> = ({ x, y, r, red, k = 1 }) =>
  k <= 0.01 ? null : (
    <g transform={`translate(${x} ${y - (1 - clamp01(k)) * 40}) scale(${0.4 + 0.6 * clamp01(k)})`} opacity={clamp01(k * 2)}>
      <circle r={r} fill={red ? C.red : "#fff"} stroke={OL} strokeWidth={Math.max(2, r * 0.18)} />
      <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.25} fill="#fff" opacity={red ? 0.5 : 0} />
    </g>
  );

const Urn: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -30 -60 L 30 -60 L 30 -46 Q 58 -30 58 6 Q 58 50 0 54 Q -58 50 -58 6 Q -58 -30 -30 -46 Z" fill="#cfe6f7" stroke={OL} strokeWidth={4} />
    {[
      [-24, 20, 1],
      [0, 30, 0],
      [24, 18, 1],
      [-12, -2, 0],
      [14, 0, 1],
      [-34, 0, 0],
      [34, 2, 0],
    ].map(([bx, by, r], i) => (
      <circle key={i} cx={bx} cy={by} r={11} fill={r ? C.red : "#fff"} stroke={OL} strokeWidth={2.5} />
    ))}
    <rect x={-36} y={-70} width={72} height={14} rx={6} fill="#9fbfd8" stroke={OL} strokeWidth={4} />
  </g>
);

const AnchorIcon: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.ink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={0} cy={-30} r={9} />
    <path d="M 0 -21 L 0 30" />
    <path d="M -16 -10 L 16 -10" />
    <path d="M -28 12 Q -24 32 0 32 Q 24 32 28 12" />
    <path d="M -34 18 L -28 10 L -20 18 M 34 18 L 28 10 L 20 18" />
  </g>
);

const DieFace: React.FC<{ x: number; y: number; n: number; s?: number; rot?: number }> = ({ x, y, n, s = 1, rot = 0 }) => {
  const P: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-1, -1], [1, 1]],
    3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-34} y={-34} width={68} height={68} rx={14} fill="#fff" stroke={OL} strokeWidth={4} />
      {P[n].map(([a, b], i) => (
        <circle key={i} cx={a * 17} cy={b * 17} r={6.5} fill={OL} />
      ))}
    </g>
  );
};

const Gavel: React.FC<{ x: number; y: number; s?: number; hit?: number }> = ({ x, y, s = 1, hit = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={56} width={150} height={34} rx={10} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
    <rect x={-104} y={46} width={118} height={14} rx={5} fill="#a8733c" stroke={OL} strokeWidth={3} />
    <g transform={`rotate(${28 - hit * 28} 120 0)`}>
      <rect x={-20} y={-9} width={150} height={18} rx={8} fill="#a8733c" stroke={OL} strokeWidth={4} />
      <rect x={-72} y={-46} width={58} height={92} rx={12} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
      <rect x={-78} y={-38} width={70} height={14} rx={5} fill="#c8955a" stroke={OL} strokeWidth={3} />
      <rect x={-78} y={24} width={70} height={14} rx={5} fill="#c8955a" stroke={OL} strokeWidth={3} />
    </g>
  </g>
);

const House: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-70} width={160} height={110} fill="#fff1d6" stroke={OL} strokeWidth={5} />
    <path d="M -100 -64 L 0 -140 L 100 -64 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={44} y={-130} width={22} height={40} fill="#b9764a" stroke={OL} strokeWidth={4} />
    <rect x={-60} y={-46} width={40} height={36} rx={4} fill={C.sky} stroke={OL} strokeWidth={4} />
    <rect x={20} y={-46} width={40} height={36} rx={4} fill={C.sky} stroke={OL} strokeWidth={4} />
    <rect x={-18} y={-4} width={36} height={44} rx={4} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
  </g>
);

const Tornado: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const w = 80 - i * 12;
      const dx = Math.sin(t * 3 + i * 0.9) * (4 + i * 2);
      return <ellipse key={i} cx={dx} cy={-110 + i * 22} rx={w} ry={13} fill={i % 2 ? "#8d9bb0" : "#a9b5c7"} stroke={OL} strokeWidth={3.5} />;
    })}
  </g>
);

const Lightning: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 -90 Q -70 -130 -30 -130 Q -20 -160 16 -150 Q 40 -170 60 -140 Q 92 -138 80 -104 Q 70 -90 40 -92 L -40 -92 Q -56 -90 -60 -90 Z" fill="#c9d2df" stroke={OL} strokeWidth={4} />
    <path d="M 4 -92 L -24 -30 L 0 -30 L -16 20 L 34 -48 L 8 -48 L 24 -92 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={0} cy={-36} r={46} fill={C.yellow} opacity={0.12 + 0.08 * Math.sin(t * 2)} />
  </g>
);

const Inhaler: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-60} width={28} height={56} rx={8} fill="#7fb0e0" stroke={OL} strokeWidth={4} />
    <path d="M -18 -8 L 18 -8 L 18 8 L 40 8 L 40 26 L -18 26 Z" fill="#dfe8f2" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

const Waves: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 -10 L -50 -60 L 0 -96 L 50 -60 L 50 -10 Z" fill="#fff1d6" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => {
      const ph = Math.sin(t * 2 + i) * 6;
      const yy = -26 + i * 22;
      return <path key={i} d={`M -80 ${yy} q 20 ${-14 + ph * 0.3} 40 0 t 40 0 t 40 0 t 40 0`} fill="none" stroke={i === 0 ? C.skyDeep : C.sky} strokeWidth={10} strokeLinecap="round" transform={`translate(${ph} 0)`} />;
    })}
  </g>
);

const Policy: React.FC<{ x: number; y: number; s?: number; faded?: number }> = ({ x, y, s = 1, faded = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - faded * 0.75}>
    <rect x={-50} y={-66} width={100} height={132} rx={10} fill="#fff" stroke={OL} strokeWidth={4} strokeDasharray={faded > 0.5 ? "10 8" : undefined} />
    <path d="M 0 -48 L 30 -36 Q 30 -2 0 12 Q -30 -2 -30 -36 Z" fill={faded > 0.5 ? GREY : C.green} stroke={OL} strokeWidth={4} />
    <path d="M -30 34 L 30 34 M -30 50 L 14 50" stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" />
  </g>
);

const Door: React.FC<{ x: number; y: number; s?: number; color: string; sign: "book" | "sprout"; glow?: number; t: number }> = ({ x, y, s = 1, color, sign, glow = 0, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <rect x={-140} y={-210} width={280} height={430} rx={30} fill={C.yellow} opacity={glow * (0.35 + 0.1 * Math.sin(t * 2))} />}
    <rect x={-120} y={-190} width={240} height={390} rx={18} fill="#efe2cc" stroke={OL} strokeWidth={5} />
    <rect x={-96} y={-166} width={192} height={366} rx={10} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-74} y={-140} width={148} height={130} rx={10} fill="#fff" opacity={0.25} />
    <circle cx={66} cy={30} r={11} fill={C.yellow} stroke={OL} strokeWidth={4} />
    {sign === "book" ? (
      <g transform="translate(0 -76)">
        <path d="M -46 -30 Q -22 -40 0 -28 Q 22 -40 46 -30 L 46 30 Q 22 20 0 32 Q -22 20 -46 30 Z" fill="#fff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 0 -28 L 0 32" stroke={OL} strokeWidth={4} />
      </g>
    ) : (
      <g transform="translate(0 -60)">
        <path d="M 0 30 L 0 -26" stroke={C.greenDeep} strokeWidth={7} strokeLinecap="round" />
        <path d="M 0 -6 Q -40 -10 -44 -44 Q -6 -40 0 -6 Z" fill={C.green} stroke={OL} strokeWidth={4} />
        <path d="M 0 -16 Q 40 -20 44 -54 Q 6 -50 0 -16 Z" fill={C.green} stroke={OL} strokeWidth={4} />
        <rect x={-50} y={28} width={100} height={12} rx={6} fill="#8a5a2b" />
      </g>
    )}
  </g>
);

const TaxiCar: React.FC<{ x: number; y: number; s?: number; color: string; dim?: boolean }> = ({ x, y, s = 1, color, dim }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={dim ? 0.3 : 1}>
    <path d="M -12 -10 L -6 -19 L 9 -19 L 15 -10 Z" fill="#e8f4ff" stroke={OL} strokeWidth={2.4} strokeLinejoin="round" />
    <rect x={-21} y={-11} width={42} height={15} rx={5} fill={color} stroke={OL} strokeWidth={2.4} />
    <rect x={-4} y={-23} width={8} height={4} rx={1.5} fill={C.yellow} stroke={OL} strokeWidth={1.5} />
    <circle cx={-11} cy={5} r={5} fill="#2b2b2b" />
    <circle cx={11} cy={5} r={5} fill="#2b2b2b" />
  </g>
);
const TGREEN = "#3fb67c";
const TBLUE = "#3b7fe0";

const Coin: React.FC<{ x: number; y: number; color: string; ring?: boolean; k?: number }> = ({ x, y, color, ring, k = 1 }) =>
  k <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${clamp01(k)})`}>
      <ellipse rx={20} ry={11} fill={ring ? "#fff" : color} stroke={ring ? color : OL} strokeWidth={ring ? 6 : 3.5} />
      {!ring && <ellipse cx={-5} cy={-3} rx={7} ry={3} fill="#fff" opacity={0.5} />}
    </g>
  );

const Glasses: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={OL} strokeWidth={3.5}>
    <circle cx={-11} cy={0} r={10} />
    <circle cx={11} cy={0} r={10} />
    <path d="M -1 0 L 1 0" />
  </g>
);

const Pie: React.FC<{ x: number; y: number; r: number; v: number; color: string; k?: number; label?: string }> = ({ x, y, r, v, color, k = 1, label }) => {
  const a = Math.PI * 2 * v * clamp01(k);
  const x2 = Math.sin(a) * r;
  const y2 = -Math.cos(a) * r;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#fff" stroke={OL} strokeWidth={4} />
      {a > 0.01 && <path d={`M 0 0 L 0 ${-r} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`} fill={color} stroke={OL} strokeWidth={3} />}
      {label && k > 0.6 && (
        <Txt x={0} y={r + 42} size={34} weight={900}>
          {label}
        </Txt>
      )}
    </g>
  );
};

// плавное «состояние сцены»: 0 до at(a), 1 после
const st = (c: VisualCtx, beat: number, d = 0.7) => ramp(c.t, at(c, beat), d);

// ═══════════════════ k14 — закон малых чисел ═══════════════════

type County = { x: number; y: number; w: number; h: number; small: boolean; kind: 0 | 1 | 2; seed: number };
const COUNTIES: County[] = (() => {
  const cols = 12;
  const rows = 9;
  const occ: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const out: County[] = [];
  const bigs: [number, number, number, number][] = [
    [0, 0, 2, 2], [3, 0, 3, 2], [7, 1, 2, 3], [10, 0, 2, 2], [1, 3, 2, 2], [4, 3, 3, 2],
    [9, 4, 3, 2], [0, 6, 2, 3], [3, 6, 2, 2], [6, 6, 3, 2], [10, 7, 2, 2],
  ];
  for (const [x, y, w, h] of bigs) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) occ[j][i] = true;
    out.push({ x, y, w, h, small: false, kind: 0, seed: x * 7 + y });
  }
  let n = 0;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      if (occ[j][i]) continue;
      const h = (i * 37 + j * 91 + 13) % 11;
      const kind = h === 0 || h === 6 ? 1 : h === 3 || h === 9 ? 2 : 0;
      out.push({ x: i, y: j, w: 1, h: 1, small: true, kind: kind as 0 | 1 | 2, seed: n++ });
    }
  return out;
})();

export const SmallNumbers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const CS = 62;
  const MX = 80;
  const MY = 140;
  const mapK = pop(t, 0.25);
  const greenK = st(c, 1.05, 0.9);
  const redK = st(c, 2.05, 0.9);
  const swap = st(c, 3, 0.7);
  const shimmer = 1 - Math.max(greenK, redK * 0.0);
  const cellCenter = (q: County) => [MX + (q.x + q.w / 2) * CS, MY + (q.y + q.h / 2) * CS] as const;
  const greens = COUNTIES.filter((q) => q.small && q.kind === 1).sort((a, b) => b.x - a.x);
  const reds = COUNTIES.filter((q) => q.small && q.kind === 2).sort((a, b) => b.x - a.x);
  const small = [
    { reds: 4, total: 4 },
    { reds: 0, total: 4 },
    { reds: 3, total: 4 },
  ];
  const big = [11, 13, 12];
  return (
    <g>
      {/* «карта» — условная сетка округов */}
      <g transform={`translate(${MX - 24} ${MY - 70}) scale(${lerp(1, 0.72, swap)}) translate(${-MX + 24} ${-MY + 70})`}>
      <g transform={`translate(${MX + 6 * CS} ${MY + 4.5 * CS}) scale(${0.85 + 0.15 * mapK}) translate(${-MX - 6 * CS} ${-MY - 4.5 * CS})`} opacity={clamp01(mapK * 1.5)}>
        <Panel x={MX - 24} y={MY - 70} w={12 * CS + 48} h={9 * CS + 94} fill="#fffaf2" r={28} />
        <Txt x={MX} y={MY - 22} size={32} anchor="start" color={C.inkSoft}>
          условная карта: 3000 округов
        </Txt>
        {COUNTIES.map((q, i) => {
          const [cx, cy] = cellCenter(q);
          let fill = GREY;
          let op = 1;
          if (q.small) {
            const base = "#ece6da";
            fill = base;
            const sh = (0.5 + 0.5 * Math.sin(t * 1.3 + q.seed * 1.9)) * shimmer;
            const tint = q.seed % 2 ? "#b9e6cc" : "#f6c1bf";
            const fin = q.kind === 1 ? greenK : q.kind === 2 ? redK : 0;
            return (
              <g key={i}>
                <rect x={MX + q.x * CS + 3} y={MY + q.y * CS + 3} width={CS - 6} height={CS - 6} rx={7} fill={fill} />
                <rect x={MX + q.x * CS + 3} y={MY + q.y * CS + 3} width={CS - 6} height={CS - 6} rx={7} fill={tint} opacity={sh * 0.8 * (1 - fin)} />
                {fin > 0 && (
                  <rect
                    x={MX + q.x * CS + 3}
                    y={MY + q.y * CS + 3}
                    width={CS - 6}
                    height={CS - 6}
                    rx={7}
                    fill={q.kind === 1 ? C.green : C.red}
                    stroke={OL}
                    strokeWidth={3}
                    opacity={fin}
                    transform={`translate(${cx} ${cy}) scale(${0.7 + 0.3 * fin}) translate(${-cx} ${-cy})`}
                  />
                )}
              </g>
            );
          }
          op = 1;
          return <rect key={i} x={MX + q.x * CS + 3} y={MY + q.y * CS + 3} width={q.w * CS - 6} height={q.h * CS - 6} rx={10} fill={fill} stroke="#b9c2d1" strokeWidth={3} opacity={op} />;
        })}
        {/* легенда */}
        <g transform={`translate(${MX} ${MY + 9 * CS + 60})`}>
          <rect x={0} y={-26} width={34} height={34} rx={6} fill={GREY} stroke="#b9c2d1" strokeWidth={3} />
          <Txt x={48} y={2} size={30} anchor="start" color={C.inkSoft}>
            большие
          </Txt>
          <rect x={220} y={-18} width={20} height={20} rx={4} fill="#ece6da" stroke="#cbbfa8" strokeWidth={2} />
          <Txt x={252} y={2} size={30} anchor="start" color={C.inkSoft}>
            маленькие
          </Txt>
        </g>
      </g>
      </g>

      {/* реплики 2–3: ярлыки справа от карты */}
      <g opacity={1 - swap}>
        <Pop t={t} at={at(c, 1)} x={1080} y={190}>
          <Tag x={0} y={0} text="реже всего" color={C.green} textColor="#fff" size={40} />
        </Pop>
        {greens.slice(0, 2).map((q, i) => {
          const [cx, cy] = cellCenter(q);
          return <Arrow key={i} x1={950} y1={190 + i * 14} x2={cx + 20} y2={cy} k={ramp(t, at(c, 1.1) + i * 0.15, 0.6)} color={C.greenDeep} w={7} bend={0.12} />;
        })}
        <Pop t={t} at={at(c, 1.5)} x={1080} y={320}>
          <g>
            <Bubble x={-210} y={-70} w={420} h={124} fill="#fff" />
            <Txt x={0} y={-18} size={32} color={C.inkSoft}>
              {"чистый воздух?\nздоровая еда?"}
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 2)} x={1080} y={500}>
          <Tag x={0} y={0} text="чаще всего" color={C.red} textColor="#fff" size={40} />
        </Pop>
        {reds.slice(0, 2).map((q, i) => {
          const [cx, cy] = cellCenter(q);
          return <Arrow key={i} x1={950} y1={500 + i * 14} x2={cx + 20} y2={cy} k={ramp(t, at(c, 2.1) + i * 0.15, 0.6)} color={C.red} w={7} bend={-0.12} />;
        })}
        <Pop t={t} at={at(c, 2.5)} x={1080} y={600}>
          <Txt x={0} y={0} size={38} weight={900}>
            тоже маленькие!
          </Txt>
        </Pop>
      </g>

      {/* реплика 4: шары из урны */}
      {swap > 0 && (
        <g opacity={swap} transform={`translate(${(1 - swap) * 40 - 190} 0)`}>
          {[0, 1].map((pi) => {
            const y0 = 110 + pi * 300;
            return (
              <g key={pi}>
                <Panel x={830} y={y0} w={520} h={270} fill="#fff" r={26} />
                <Txt x={1090} y={y0 + 48} size={32} color={pi === 0 ? C.red : C.inkSoft}>
                  {pi === 0 ? "маленькая выборка: по 4" : "большая выборка: по 24"}
                </Txt>
                <Urn x={900} y={y0 + 170} s={0.85} />
              </g>
            );
          })}
          {small.map((r, ri) =>
            Array.from({ length: 4 }).map((_, bi) => (
              <Ball key={`${ri}-${bi}`} x={990 + bi * 42} y={194 + ri * 54} r={17} red={bi < r.reds} k={ramp(t, at(c, 3.08 + ri * 0.08) + bi * 0.07, 0.4)} />
            )),
          )}
          {small.map((r, ri) => (
            <Pop key={ri} t={t} at={at(c, 3.1 + ri * 0.08) + 0.4} x={1250} y={206 + ri * 54}>
              <Txt x={0} y={0} size={34} weight={900} color={r.reds === 0 || r.reds === 4 ? C.red : C.ink}>
                {`${Math.round((r.reds / r.total) * 100)}%`}
              </Txt>
            </Pop>
          ))}
          {big.map((nr, ri) =>
            Array.from({ length: 24 }).map((_, bi) => {
              const row = Math.floor(bi / 12);
              const col = bi % 12;
              const red = (bi * 7 + ri * 5) % 24 < nr;
              return <Ball key={`b${ri}-${bi}`} x={978 + col * 17} y={488 + ri * 56 + row * 18} r={7.5} red={red} k={ramp(t, at(c, 3.35 + ri * 0.08) + col * 0.03, 0.35)} />;
            }),
          )}
          {big.map((nr, ri) => (
            <Pop key={ri} t={t} at={at(c, 3.4 + ri * 0.08) + 0.4} x={1250} y={508 + ri * 56}>
              <Txt x={0} y={0} size={34} weight={900}>
                {`${Math.round((nr / 24) * 100)}%`}
              </Txt>
            </Pop>
          ))}
          <Pop t={t} at={at(c, 3.7)} x={1090} y={760}>
            <Tag x={0} y={0} text="крайности — от случая" color={C.yellow} size={38} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ═══════════════════ k15 — якорь ═══════════════════

const WHEEL_COLORS = ["#ffd23f", "#6cc5f0", "#ff7a6b", "#3fb67c", "#8e6cf0"];
const Wheel: React.FC<{ rot: number; r: number }> = ({ rot, r }) => {
  const N = 20;
  const seg = 360 / N;
  return (
    <g>
      <circle r={r + 16} fill="#8a5a2b" stroke={OL} strokeWidth={6} />
      <g transform={`rotate(${rot})`}>
        {Array.from({ length: N }).map((_, i) => {
          const a0 = ((i * seg - seg / 2 - 90) * Math.PI) / 180;
          const a1 = ((i * seg + seg / 2 - 90) * Math.PI) / 180;
          return (
            <g key={i}>
              <path d={`M 0 0 L ${Math.cos(a0) * r} ${Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${Math.cos(a1) * r} ${Math.sin(a1) * r} Z`} fill={WHEEL_COLORS[i % 5]} stroke={OL} strokeWidth={2.5} />
              <g transform={`rotate(${i * seg}) translate(0 ${-r * 0.8})`}>
                <text textAnchor="middle" y={9} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>
                  {String(i * 5)}
                </text>
              </g>
            </g>
          );
        })}
      </g>
      <circle r={30} fill="#fff" stroke={OL} strokeWidth={5} />
      <path d={`M -22 ${-r - 40} L 22 ${-r - 40} L 0 ${-r + 12} Z`} fill={C.red} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

export const AnchorWheel: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const s1a = at(c, 0.08);
  const s1b = at(c, 0.42);
  const s2a = at(c, 0.55);
  const s2b = at(c, 0.92);
  const r1 = -360 * 3 - 2 * 18;
  const r2 = r1 - 360 * 3 - 11 * 18;
  const k1 = outCubic(interpolate(t, [s1a, s1b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const k2 = outCubic(interpolate(t, [s2a, s2b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const rot = r1 * k1 + (r2 - r1) * k2;
  const move = st(c, 1, 0.8);
  const judge = st(c, 3, 0.7);
  const wx = lerp(930, 740, move);
  const wy = lerp(450, 300, move);
  const ws = lerp(1, 0.48, move);
  // шкала ответов
  const BY = 740;
  const H = 700;
  const yv = (v: number) => BY - (v / 100) * H;
  const bars = [
    { x: 1230, anchor: 10, v: 25, color: S2.main, deep: S2.deep },
    { x: 1580, anchor: 65, v: 45, color: S1.main, deep: S1.deep },
  ];
  const grow = st(c, 1.45, 1.0);
  const rope = st(c, 2.05, 0.8);
  return (
    <g>
      <g opacity={1 - judge}>
        <g transform={`translate(${wx} ${wy}) scale(${ws})`}>
          <Wheel rot={rot} r={220} />
        </g>
        {/* участники */}
        <g opacity={1 - move}>
          <Pop t={t} at={s1b} x={1420} y={380}>
            <g>
              <Person x={0} y={40} s={0.9} color={S2.main} t={t} />
              <Bubble x={60} y={-150} w={150} h={90} tail={[40, -70]} />
              <Txt x={135} y={-90} size={52} weight={900} color={S2.deep}>
                10
              </Txt>
            </g>
          </Pop>
          <Pop t={t} at={s2b} x={1640} y={620}>
            <g>
              <Person x={0} y={40} s={0.9} color={S1.main} t={t} />
              <Bubble x={60} y={-150} w={150} h={90} tail={[40, -70]} />
              <Txt x={135} y={-90} size={52} weight={900} color={S1.deep}>
                65
              </Txt>
            </g>
          </Pop>
          <Pop t={t} at={at(c, 0.7)} x={930} y={760}>
            <Tag x={0} y={0} text="подкручено: только 10 или 65" color="#fff" size={34} />
          </Pop>
        </g>
        {/* вопрос и ответы */}
        {move > 0 && (
          <g opacity={move}>
            <Panel x={940} y={110} w={920} h={100} r={30} fill="#fff" stroke={C.yellowDeep} />
            <Txt x={1400} y={176} size={40} weight={900}>
              Доля африканских стран в ООН?
            </Txt>
            <line x1={1060} y1={BY} x2={1780} y2={BY} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
            {bars.map((b, i) => {
              const hh = (b.v / 100) * H * grow;
              const ay = yv(b.anchor);
              return (
                <g key={i}>
                  <line x1={b.x - 130} y1={ay} x2={b.x + 130} y2={ay} stroke={b.deep} strokeWidth={5} strokeDasharray="14 10" opacity={grow} />
                  <Txt x={b.x - 150} y={ay + 12} size={34} anchor="end" color={b.deep} opacity={grow}>
                    {String(b.anchor)}
                  </Txt>
                  <rect x={b.x - 70} y={BY - hh} width={140} height={hh} rx={14} fill={b.color} stroke={OL} strokeWidth={4} />
                  {grow > 0.7 && (
                    <Txt x={b.x} y={BY - hh - (b.anchor > b.v ? -50 : 20)} size={44} weight={900} color={b.anchor > b.v ? "#fff" : C.ink}>
                      {`${b.v}%`}
                    </Txt>
                  )}
                  <Txt x={b.x} y={BY + 46} size={32} color={C.inkSoft}>
                    {`видели ${b.anchor}`}
                  </Txt>
                  {rope > 0 && (
                    <g opacity={rope}>
                      <path
                        d={`M ${b.x + 70} ${BY - hh + 6} Q ${b.x + 130 + wob(t, i, 6)} ${(BY - hh + ay) / 2} ${b.x + 118} ${b.anchor < b.v ? ay - 72 : ay + 74}`}
                        fill="none"
                        stroke="#8a5a2b"
                        strokeWidth={6}
                        strokeDasharray="4 6"
                        strokeLinecap="round"
                      />
                      <AnchorIcon x={b.x + 118} y={b.anchor < b.v ? ay - 36 : ay + 40} s={1.1} color={b.deep} />
                    </g>
                  )}
                </g>
              );
            })}
            <Pop t={t} at={at(c, 2.4)} x={1400} y={848}>
              <Tag x={0} y={0} text="случайное число притянуло ответ" color={C.yellow} size={36} />
            </Pop>
          </g>
        )}
      </g>

      {/* реплика 4: судьи и кости */}
      {judge > 0 && (
        <g opacity={judge} transform={`translate(${(1 - judge) * 60} 0)`}>
          <Gavel x={1190} y={215} s={1.05} hit={clamp01(Math.sin(Math.max(0, t - at(c, 3.05)) * 5)) * (t < at(c, 3.05) + 0.63 ? 1 : 0)} />
          <Txt x={1210} y={375} size={38} weight={900}>
            опытные судьи
          </Txt>
          {[
            { y: 510, d: [1, 2], sum: 3, len: 220, label: "короче срок", color: S2.main, b: 3.25 },
            { y: 700, d: [4, 5], sum: 9, len: 480, label: "дольше срок", color: S1.main, b: 3.55 },
          ].map((r, i) => {
            const k = pop(t, at(c, r.b));
            const ar = ramp(t, at(c, r.b) + 0.3, 0.5);
            const bk = ramp(t, at(c, r.b) + 0.6, 0.8);
            return (
              <g key={i} opacity={clamp01(k * 1.5)}>
                <DieFace x={680} y={r.y} n={r.d[0]} rot={-10 + wob(t, i, 3)} s={0.6 + 0.4 * k} />
                <DieFace x={765} y={r.y + 6} n={r.d[1]} rot={12 - wob(t, i, 3)} s={0.6 + 0.4 * k} />
                <Txt x={830} y={r.y + 18} size={50} weight={900} anchor="start">
                  {`= ${r.sum}`}
                </Txt>
                <Arrow x1={950} y1={r.y} x2={1060} y2={r.y} k={ar} color={C.inkSoft} w={8} />
                <rect x={1100} y={r.y - 26} width={r.len * bk} height={52} rx={18} fill={r.color} stroke={OL} strokeWidth={4} />
                {bk > 0.5 && (
                  <Txt x={1100 + r.len + 24} y={r.y + 13} size={38} anchor="start" opacity={clamp01(bk * 2 - 1)}>
                    {r.label}
                  </Txt>
                )}
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ═══════════════════ k16 — защита от якоря ═══════════════════

export const AnchorDefense: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const shrink = st(c, 1, 0.8);
  const sx = 60;
  const sy = lerp(200, 120, shrink);
  const ss = lerp(1, 0.9, shrink);
  const slide = ramp(t, at(c, 0.35), 1.2);
  const rows = [
    { y: 40, color: S2.main, label: "оценщики", tie: true },
    { y: 290, color: C.coral, label: "студенты", tie: false },
  ];
  const ANCHOR_X = 1120;
  return (
    <g>
      <g transform={`translate(${sx} ${sy}) scale(${ss})`} opacity={1 - shrink}>
        {/* буклет */}
        <Pop t={t} at={0.25} x={165} y={240}>
          <g>
            <Panel x={-165} y={-240} w={330} h={490} fill="#fff" r={24} />
            <rect x={-165} y={-240} width={330} height={70} rx={24} fill={C.skyDeep} />
            <rect x={-165} y={-200} width={330} height={30} fill={C.skyDeep} />
            <Txt x={0} y={-192} size={34} color="#fff">
              буклет
            </Txt>
            <House x={0} y={40} s={0.95} />
            <g transform={`rotate(${-6 + wob(t, 1, 2)} 0 160)`}>
              <rect x={-130} y={120} width={260} height={74} rx={18} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <circle cx={-104} cy={157} r={8} fill="#fff" stroke={OL} strokeWidth={3} />
              <Txt x={10} y={170} size={36} weight={900}>
                цена
              </Txt>
            </g>
          </g>
        </Pop>
        {rows.map((r, i) => {
          const k = pop(t, at(c, 0.08 + i * 0.12));
          const from = 650 + i * 30;
          const mx = lerp(from, ANCHOR_X - 120, outCubic(slide));
          return (
            <g key={i} opacity={clamp01(k * 1.5)} transform={`translate(0 ${r.y + (1 - k) * 20})`}>
              {[0, 1, 2].map((j) => (
                <g key={j}>
                  <Person x={420 + j * 70} y={170} s={0.62} color={r.color} t={t + j} />
                  {r.tie && <path d={`M ${420 + j * 70} ${170 - 46} l -6 10 l 6 22 l 6 -22 Z`} fill={C.red} stroke={OL} strokeWidth={2} />}
                </g>
              ))}
              <Txt x={490} y={232} size={34}>
                {r.label}
              </Txt>
              {/* шкала оценки */}
              <line x1={620} y1={150} x2={1240} y2={150} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" />
              <line x1={ANCHOR_X} y1={118} x2={ANCHOR_X} y2={182} stroke={C.yellowDeep} strokeWidth={8} strokeLinecap="round" />
              <Txt x={ANCHOR_X} y={222} size={30} color={C.yellowDeep}>
                цена
              </Txt>
              <circle cx={from} cy={150} r={12} fill="#fff" stroke={C.inkSoft} strokeWidth={4} strokeDasharray="4 4" />
              <Arrow x1={from + 18} y1={150} x2={mx - 26} y2={150} k={slide > 0.3 ? 1 : 0} color={r.color} w={6} />
              <circle cx={mx} cy={150} r={20} fill={r.color} stroke={OL} strokeWidth={4} />
              <Txt x={800} y={222} size={30} color={C.inkSoft}>
                оценка
              </Txt>
            </g>
          );
        })}
        <Pop t={t} at={at(c, 0.62)} x={760} y={30}>
          <g>
            <Bubble x={-20} y={-56} w={400} h={84} tail={[-90, 70]} fill="#fff" />
            <Txt x={180} y={2} size={36} weight={900} color={S2.deep}>
              на меня не влияет
            </Txt>
          </g>
        </Pop>
      </g>

      {/* реплика 2: совет */}
      {shrink > 0 && (
        <g transform={`translate(${lerp(680, 410, st(c, 2, 0.8))} ${lerp(470, 360, st(c, 2, 0.8))}) scale(${lerp(1.2, 1, st(c, 2, 0.8))})`}>
        <Pop t={t} at={at(c, 1)} x={0} y={0}>
          <g>
            <Panel x={-350} y={-150} w={700} h={300} fill="#fff" r={30} />
            <Txt x={-310} y={-92} size={34} anchor="start" color={C.inkSoft}>
              совет из книги
            </Txt>
            {["любое число влияет", "ищите доводы против"].map((s, i) => {
              const ck = ramp(t, at(c, 1.2 + i * 0.4), 0.5);
              return (
                <g key={i} opacity={clamp01(ck * 3)}>
                  <rect x={-310} y={-46 + i * 100} width={58} height={58} rx={12} fill="#fff" stroke={OL} strokeWidth={4} />
                  <Check x={-280} y={-18 + i * 100} s={36} k={ck} />
                  <Txt x={-226} y={-4 + i * 100} size={42} anchor="start" weight={900}>
                    {s}
                  </Txt>
                </g>
              );
            })}
          </g>
        </Pop>
        </g>
      )}

      {/* реплика 3: переговоры */}
      <Pop t={t} at={at(c, 2)} x={1060} y={680}>
        <g>
          <Person x={-170} y={0} s={1} color={S2.main} t={t} />
          <Person x={170} y={0} s={1} color={C.violet} t={t + 1} />
          <rect x={-250} y={-10} width={500} height={40} rx={12} fill="#a8733c" stroke={OL} strokeWidth={4} />
          <rect x={-220} y={30} width={22} height={90} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
          <rect x={198} y={30} width={22} height={90} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
          <g transform="translate(0 -175)">
            <rect x={-130} y={-50} width={260} height={96} rx={14} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={44} weight={900} color={C.violet}>
              1 000 000?
            </Txt>
            <Cross x={0} y={0} s={90} k={ramp(t, at(c, 2.3), 0.6)} />
          </g>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 2.45)} x={1060} y={330}>
        <g>
          <Bubble x={-200} y={-50} w={400} h={80} tail={[-170, 190]} fill="#fff" />
          <Txt x={0} y={4} size={34} weight={900} color={S2.deep}>
            с этого не начнём
          </Txt>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 2.6)} x={1060} y={850}>
        <Tag x={0} y={0} text="не торгуйтесь от него" color={C.yellow} size={36} />
      </Pop>
    </g>
  );
};

// ═══════════════════ k17 — доступность ═══════════════════

const Cell: React.FC<{ x: number; y: number; w: number; h: number; title: string; k: number }> = ({ x, y, w, h, title, k }) =>
  k <= 0.001 ? null : (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${0.9 + 0.1 * k}) translate(${-x - w / 2} ${-y - h / 2})`} opacity={clamp01(k * 1.5)}>
      <Panel x={x} y={y} w={w} h={h} fill="#fffaf4" r={28} />
      <Title x={x + w / 2} y={y + 50} text={title} size={34} />
    </g>
  );

export const Availability: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k0 = pop(t, 0.25);
  const k1 = pop(t, at(c, 1));
  const k2 = pop(t, at(c, 2));
  const k3 = pop(t, at(c, 3));
  const real = st(c, 1.5, 1.0);
  const fade = ramp(t, at(c, 3.55), 1.4);
  const W = 610;
  const H = 380;
  return (
    <g>
      {/* 1. полка памяти */}
      <Cell x={640} y={100} w={W} h={H} title="Полка памяти" k={k0} />
      {k0 > 0.01 && (
        <g opacity={clamp01(k0 * 1.5)}>
          <rect x={665} y={380} width={560} height={16} rx={8} fill="#c98b4a" />
          <rect x={665} y={456} width={560} height={14} rx={7} fill="#c98b4a" />
          <Pop t={t} at={at(c, 0.3)} x={732} y={378}>
            <Tornado x={0} y={0} s={1.1} t={t} />
          </Pop>
          <Pop t={t} at={at(c, 0.45)} x={935} y={380}>
            <Lightning x={0} y={0} s={1.15} t={t} />
          </Pop>
          <Pop t={t} at={at(c, 0.6)} x={1185} y={455}>
            <g opacity={0.75}>
              <Inhaler x={0} y={0} s={0.5} />
            </g>
          </Pop>
          <Pop t={t} at={at(c, 0.6)} x={1140} y={448}>
            <Txt x={0} y={0} size={30} color={C.inkSoft} anchor="end">
              астма
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 0.7)} x={1128} y={318}>
            <Tag x={0} y={0} text="ярко — легко" color={C.yellow} size={30} />
          </Pop>
        </g>
      )}

      {/* 2. торнадо vs астма */}
      <Cell x={1270} y={100} w={W} h={H} title="Причина смерти" k={k1} />
      {k1 > 0.01 && (
        <g opacity={clamp01(k1 * 1.5)}>
          <Txt x={1575} y={200} size={32} color={real > 0.5 ? C.greenDeep : C.inkSoft} opacity={Math.abs(real - 0.5) * 2}>
            {real > 0.5 ? "на самом деле" : "кажется"}
          </Txt>
          {[
            { y: 268, label: "торнадо", a: 340, b: 20, color: "#8d9bb0" },
            { y: 360, label: "астма", a: 160, b: 400, color: C.coral },
          ].map((r, i) => (
            <g key={i}>
              <Txt x={1420} y={r.y + 12} size={32} anchor="end">
                {r.label}
              </Txt>
              <rect x={1440} y={r.y - 26} width={lerp(r.a, r.b, real) * clamp01(k1)} height={52} rx={14} fill={r.color} stroke={OL} strokeWidth={4} />
            </g>
          ))}
          <Pop t={t} at={at(c, 1.75)} x={1730} y={438}>
            <Tag x={0} y={0} text="астма ≈ ×20" color={C.yellow} size={34} />
          </Pop>
        </g>
      )}

      {/* 3. супруги */}
      <Cell x={640} y={500} w={W} h={H} title="Вклад в домашние дела" k={k2} />
      {k2 > 0.01 && (
        <g opacity={clamp01(k2 * 1.5)}>
          <Person x={720} y={810} s={0.95} color={S2.main} t={t} />
          <Person x={1190} y={810} s={0.95} color={C.coral} t={t + 2} />
          <Pie x={860} y={630} r={52} v={0.6} color={S2.main} k={ramp(t, at(c, 2.1), 0.8)} />
          <Pie x={1050} y={630} r={52} v={0.55} color={C.coral} k={ramp(t, at(c, 2.25), 0.8)} />
          <Txt x={860} y={720} size={32} weight={900} color={S2.deep} opacity={ramp(t, at(c, 2.3), 0.4)}>
            60%
          </Txt>
          <Txt x={1050} y={720} size={32} weight={900} color={C.red} opacity={ramp(t, at(c, 2.4), 0.4)}>
            55%
          </Txt>
          <Pop t={t} at={at(c, 2.55)} x={955} y={790}>
            <Txt x={0} y={0} size={36} weight={900}>
              = 115%
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 2.7)} x={955} y={850}>
            <Tag x={0} y={0} text="в сумме > 100%" color={C.yellow} size={30} />
          </Pop>
        </g>
      )}

      {/* 4. наводнение и страховка */}
      <Cell x={1270} y={500} w={W} h={H} title="Наводнение и страховка" k={k3} />
      {k3 > 0.01 && (
        <g opacity={clamp01(k3 * 1.5)}>
          <Waves x={1370} y={700} s={1} t={t} />
          <Txt x={1370} y={800} size={30} color={C.inkSoft}>
            наводнение
          </Txt>
          <Arrow x1={1460} y1={680} x2={1525} y2={680} k={ramp(t, at(c, 3.2), 0.4)} w={7} />
          <Pop t={t} at={at(c, 3.3)} x={1595} y={680}>
            <Policy x={0} y={0} s={0.9} />
          </Pop>
          <Txt x={1595} y={800} size={30} color={C.greenDeep} opacity={ramp(t, at(c, 3.35), 0.4)}>
            страховка
          </Txt>
          <Arrow x1={1655} y1={680} x2={1715} y2={680} k={ramp(t, at(c, 3.55), 0.4)} w={7} color="#b9c2d1" />
          {fade > 0 && (
            <g opacity={clamp01(fade * 2)}>
              <Policy x={1795} y={680} s={0.9} faded={fade} />
              <Txt x={1795} y={800} size={30} color={C.inkSoft}>
                {"забыли"}
              </Txt>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ═══════════════════ k17s — Стив: библиотекарь или фермер ═══════════════════

export const Steve: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const lib = st(c, 1, 0.6);
  const pop2 = st(c, 2, 0.9);
  const dx = lerp(0, 0, pop2);
  const ds = lerp(1, 0.5, pop2);
  const dy = lerp(380, 215, pop2);
  const traits = ["застенчив", "аккуратен", "любит порядок"];
  return (
    <g>
      {/* Стив */}
      <Pop t={t} at={0.25} x={790} y={700}>
        <g>
          <g transform="scale(2)">
            <Person x={0} y={0} s={1} color="#7a8db0" t={0} />
            <path d="M -30 -118 Q -24 -146 4 -144 Q 28 -144 31 -120 Q 20 -136 2 -134 Q -6 -126 -30 -118 Z" fill="#5a4630" stroke={OL} strokeWidth={2.5} strokeLinejoin="round" />
            <Glasses x={0} y={-114} s={0.95} />
            <path d="M 0 -78 l -6 9 l 6 24 l 6 -24 Z" fill={S2.deep} stroke={OL} strokeWidth={2} />
            <rect x={36} y={-40} width={26} height={34} rx={4} fill={C.coral} stroke={OL} strokeWidth={2.5} transform="rotate(-10 49 -23)" />
          </g>
          <rect x={-60} y={78} width={120} height={50} rx={25} fill={C.ink} />
          <Txt x={0} y={115} size={34} color="#fff">
            Стив
          </Txt>
        </g>
      </Pop>
      {traits.map((s, i) => (
        <Pop key={i} t={t} at={at(c, 0.25 + i * 0.15)} x={790} y={150 + i * 76}>
          <Tag x={0} y={0} text={s} color={i === 1 ? C.yellow : "#fff"} size={38} />
        </Pop>
      ))}

      {/* двери */}
      {[
        { x: 1200, label: "библиотекарь", color: "#8fb6e8", sign: "book" as const, b: 0.7 },
        { x: 1600, label: "фермер", color: "#9ed39a", sign: "sprout" as const, b: 0.8 },
      ].map((d, i) => {
        const k = pop(t, at(c, d.b));
        if (k <= 0.001) return null;
        return (
          <g key={i} opacity={clamp01(k * 1.5)}>
            <g transform={`translate(${d.x + dx} ${dy}) scale(${ds * (0.8 + 0.2 * k)})`}>
              <Door x={0} y={0} color={d.color} sign={d.sign} glow={i === 0 ? lib * (1 - pop2) : 0} t={t} />
            </g>
            <Txt x={d.x} y={dy + 200 * ds + 52} size={36} weight={900}>
              {d.label}
            </Txt>
            {i === 0 && <Check x={d.x + 96 * ds + 10} y={dy - 150 * ds} s={44 * (1 - pop2 * 0.4)} k={lib} />}
          </g>
        );
      })}
      <g opacity={1 - pop2}>
        <Pop t={t} at={at(c, 1.4)} x={1400} y={720}>
          <Tag x={0} y={0} text="похоже на образ" color={C.yellow} size={36} />
        </Pop>
      </g>

      {/* сколько их на самом деле */}
      {pop2 > 0 && (
        <g>
          <Dot x={1200} y={530} r={40} color={S2.main} k={pop(t, at(c, 2.15))} />
          <Pop t={t} at={at(c, 2.2)} x={1200} y={630}>
            <Txt x={0} y={0} size={48} weight={900} color={S2.deep}>
              1
            </Txt>
          </Pop>
          {Array.from({ length: 24 }).map((_, i) => {
            const col = i % 6;
            const row = Math.floor(i / 6);
            return <Dot key={i} x={1465 + col * 54} y={445 + row * 58} r={21} color={C.greenDeep} k={pop(t, at(c, 2.3) + i * 0.035)} />;
          })}
          <Pop t={t} at={at(c, 2.6)} x={1600} y={690}>
            <Txt x={0} y={0} size={48} weight={900} color={C.greenDeep}>
              больше 20
            </Txt>
          </Pop>
        </g>
      )}
      <Pop t={t} at={at(c, 3.1)} x={1220} y={810}>
        <Tag x={0} y={0} text="сколько таких вообще?" color={C.yellow} size={40} />
      </Pop>
    </g>
  );
};

// ═══════════════════ k18 — Линда ═══════════════════

export const Linda: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const euler = st(c, 2, 0.8);
  const traits = ["31 год", "философия", "справедливость", "демонстрации"];
  const icons = [C.yellow, C.violet, C.green, C.coral];
  const cardK = pop(t, 0.25);
  return (
    <g>
      {/* карточка Линды */}
      <g opacity={clamp01(cardK * 1.5) * (1 - euler)} transform={`translate(${-euler * 80} ${(1 - cardK) * 30})`}>
        <Panel x={70} y={110} w={470} h={560} fill="#fff" r={30} />
        <circle cx={180} cy={210} r={64} fill="#fde2ec" stroke={OL} strokeWidth={4} />
        <path d="M 130 236 Q 120 150 180 146 Q 240 150 230 236 Q 216 196 180 190 Q 144 196 130 236 Z" fill="#7a4a2a" stroke={OL} strokeWidth={4} />
        <circle cx={180} cy={218} r={34} fill="#f2c79b" stroke={OL} strokeWidth={4} />
        <path d="M 150 196 Q 180 170 210 196 Q 196 184 180 184 Q 164 184 150 196 Z" fill="#7a4a2a" />
        <circle cx={168} cy={216} r={4} fill={OL} />
        <circle cx={192} cy={216} r={4} fill={OL} />
        <path d="M 170 232 Q 180 240 190 232" stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Txt x={270} y={228} size={50} anchor="start" weight={900}>
          Линда
        </Txt>
        {traits.map((s, i) => {
          const k = ramp(t, at(c, 0.15 + i * 0.2), 0.5);
          return (
            <g key={i} opacity={k} transform={`translate(${(1 - k) * 30} 0)`}>
              <circle cx={130} cy={346 + i * 80} r={16} fill={icons[i]} stroke={OL} strokeWidth={3} />
              <Txt x={162} y={358 + i * 80} size={40} anchor="start">
                {s}
              </Txt>
            </g>
          );
        })}
      </g>

      {/* два варианта */}
      {[
        { y: 160, badge: "А", text: "кассир", b: 1.2 },
        { y: 360, badge: "Б", text: "кассир и феминистка", b: 1.55 },
      ].map((o, i) => (
        <Pop key={i} t={t} at={at(c, o.b)} x={985} y={o.y + 80}>
          <g>
            <Panel x={-365} y={-80} w={730} h={160} fill="#fff" r={30} stroke={i === 1 && euler > 0.5 ? C.coral : undefined} />
            <circle cx={-285} cy={0} r={44} fill={i === 0 ? C.sky : C.coral} stroke={OL} strokeWidth={4} />
            <Txt x={-285} y={16} size={46} weight={900} color="#fff">
              {o.badge}
            </Txt>
            <Txt x={-215} y={16} size={44} anchor="start" weight={900}>
              {o.text}
            </Txt>
          </g>
        </Pop>
      ))}
      <Pop t={t} at={at(c, 2.08)} x={1200} y={334}>
        <Tag x={0} y={0} text="выбирают чаще" color={C.coral} textColor="#fff" size={30} />
      </Pop>

      {/* круги Эйлера */}
      {euler > 0 && (
        <g opacity={euler}>
          <g transform={`translate(300 420) scale(${0.85 + 0.15 * euler})`}>
            <circle r={235} fill="#dbeefc" stroke={C.skyDeep} strokeWidth={6} />
            <Txt x={0} y={-150} size={40} weight={900} color={C.skyDeep}>
              кассиры
            </Txt>
            <g transform={`scale(${pop(t, at(c, 2.3))})`}>
              <circle cx={20} cy={60} r={110} fill="#ffd6d1" stroke={C.red} strokeWidth={6} />
              <Txt x={20} y={46} size={32} weight={900} color={C.red}>
                {"кассиры-\nфеминистки"}
              </Txt>
            </g>
          </g>
          <Arrow x1={610} y1={240} x2={500} y2={300} k={ramp(t, at(c, 2.5), 0.5)} color={C.skyDeep} w={7} />
          <Arrow x1={610} y1={460} x2={440} y2={480} k={ramp(t, at(c, 2.6), 0.5)} color={C.red} w={7} />
        </g>
      )}

      {/* итог */}
      <Pop t={t} at={at(c, 3)} x={985} y={620}>
        <g>
          <Txt x={-40} y={20} size={88} weight={900} color={C.red} anchor="end">
            89%
          </Txt>
          <Txt x={-20} y={8} size={44} weight={900} anchor="start">
            ошиблись
          </Txt>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 3.45)} x={700} y={790}>
        <Tag x={0} y={0} text="больше деталей — меньше вероятность" color={C.yellow} size={36} />
      </Pop>
    </g>
  );
};

// ═══════════════════ k19 — такси ═══════════════════

export const Taxi: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const GX = 700;
  const GY = 200;
  const CS = 54;
  const gridK = pop(t, 0.25);
  const ana = st(c, 3, 0.7);
  const swapOut = 1 - ana;
  const markBlue = ramp(t, at(c, 3.25), 0.8);
  const markGreen = ramp(t, at(c, 3.5), 0.8);
  return (
    <g>
      <g opacity={clamp01(gridK * 1.5)}>
        <Panel x={GX - 30} y={GY - 100} w={CS * 10 + 60} h={CS * 10 + 130} fill="#eef1f5" r={30} />
        <Title x={GX + CS * 5} y={GY - 44} text="100 такси города" size={36} />
        {Array.from({ length: 100 }).map((_, i) => {
          const col = i % 10;
          const row = Math.floor(i / 10);
          const blue = i >= 85;
          const cx = GX + col * CS + CS / 2;
          const cy = GY + row * CS + CS / 2 + 6;
          const k = clamp01(gridK * 2.2 - ((row * 10 + col) % 23) / 23);
          const blueOk = blue && i < 97; // 12 синих названы верно
          const greenErr = !blue && i >= 68; // 17 зелёных названы «синими»
          const dim = ana > 0.5 && ((blue && !blueOk) || (!blue && !greenErr)) && markGreen > 0.5;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`}>
              {blueOk && markBlue > 0 && <circle cx={cx} cy={cy - 6} r={25} fill="none" stroke={C.yellowDeep} strokeWidth={5} opacity={markBlue} />}
              {greenErr && markGreen > 0 && <circle cx={cx} cy={cy - 6} r={25} fill="none" stroke={C.red} strokeWidth={4} strokeDasharray="7 5" opacity={markGreen} />}
              <TaxiCar x={cx} y={cy} color={blue ? TBLUE : TGREEN} dim={dim} />
            </g>
          );
        })}
      </g>

      {/* правая колонка: условие */}
      <g opacity={swapOut}>
        <Pop t={t} at={at(c, 0.35)} x={1340} y={180}>
          <g>
            <TaxiCar x={20} y={6} s={1.8} color={TGREEN} />
            <Txt x={80} y={14} size={44} anchor="start" weight={900} color={C.greenDeep}>
              85% зелёные
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 0.6)} x={1340} y={265}>
          <g>
            <TaxiCar x={20} y={6} s={1.8} color={TBLUE} />
            <Txt x={80} y={14} size={44} anchor="start" weight={900} color={TBLUE}>
              15% синие
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 1.1)} x={1400} y={570}>
          <g>
            <Person x={0} y={0} s={1.1} color={C.violet} t={t} />
            <Bubble x={50} y={-250} w={230} h={90} tail={[30, -150]} />
            <Txt x={165} y={-192} size={44} weight={900} color={TBLUE}>
              синее!
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 1.45)} x={1740} y={470}>
          <Tag x={0} y={0} text="прав в 80%" color="#fff" size={38} />
        </Pop>
        {t > c.ends[1] && t < c.beats[2] + 0.4 && (
          <g opacity={clamp01((t - c.ends[1]) * 2) * clamp01((c.beats[2] + 0.4 - t) * 3)}>
            <Txt x={1730} y={420 + wob(t, 0, 5)} size={96} weight={900} color={C.yellowDeep}>
              ?
            </Txt>
          </g>
        )}
        <Pop t={t} at={at(c, 2.05)} x={1460} y={790}>
          <g>
            <Txt x={0} y={0} size={76} weight={900} color={C.inkSoft}>
              80%
            </Txt>
            <Txt x={0} y={46} size={30} color={C.inkSoft}>
              частый ответ
            </Txt>
            <Cross x={0} y={-26} s={96} k={ramp(t, at(c, 2.4), 0.5)} />
          </g>
        </Pop>
        <Pop t={t} at={at(c, 2.55)} x={1740} y={790}>
          <g>
            <Txt x={0} y={0} size={84} weight={900} color={C.greenDeep}>
              ≈ 41%
            </Txt>
            <Txt x={0} y={46} size={30} color={C.greenDeep}>
              верно
            </Txt>
          </g>
        </Pop>
      </g>

      {/* правая колонка: разбор */}
      {ana > 0 && (
        <g opacity={ana} transform={`translate(${(1 - ana) * 40} 0)`}>
          <g opacity={ramp(t, at(c, 3.2), 0.5)}>
            <circle cx={1350} cy={180} r={30} fill="none" stroke={C.yellowDeep} strokeWidth={5} />
            <TaxiCar x={1350} y={186} s={1.1} color={TBLUE} />
            <Txt x={1400} y={194} size={38} anchor="start" weight={900}>
              12 синих — верно
            </Txt>
          </g>
          <g opacity={ramp(t, at(c, 3.45), 0.5)}>
            <circle cx={1350} cy={280} r={30} fill="none" stroke={C.red} strokeWidth={4} strokeDasharray="7 5" />
            <TaxiCar x={1350} y={286} s={1.1} color={TGREEN} />
            <Txt x={1400} y={294} size={38} anchor="start" weight={900}>
              17 зелёных — «синие»
            </Txt>
          </g>
          <Pop t={t} at={at(c, 3.7)} x={1590} y={470}>
            <g>
              <Panel x={-280} y={-110} w={560} h={220} fill="#fff" r={30} />
              <Txt x={-150} y={-20} size={56} weight={900} color={TBLUE}>
                12
              </Txt>
              <line x1={-260} y1={0} x2={-40} y2={0} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
              <Txt x={-150} y={58} size={48} weight={900}>
                12 + 17
              </Txt>
              <Txt x={120} y={26} size={72} weight={900} color={C.greenDeep}>
                ≈ 41%
              </Txt>
            </g>
          </Pop>
        </g>
      )}
      <Pop t={t} at={at(c, 4)} x={1590} y={700}>
        <Tag x={0} y={0} text="сначала базовая частота" color={C.yellow} size={38} />
      </Pop>
    </g>
  );
};

// ═══════════════════ k20 — регрессия к среднему ═══════════════════

const THROWS: { c: string; a: [number, number]; b: [number, number] }[] = [
  { c: C.red, a: [0.05, 0.08], b: [0.55, -0.35] },
  { c: C.skyDeep, a: [-0.12, -0.1], b: [-0.5, 0.45] },
  { c: C.violet, a: [0.85, 0.4], b: [0.35, 0.2] },
  { c: C.greenDeep, a: [-0.88, -0.35], b: [-0.3, -0.25] },
  { c: C.yellowDeep, a: [0.4, -0.6], b: [0.6, 0.15] },
];

export const Regression: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const TX = 1010;
  const TY = 300;
  const RX = 270;
  const RY = 130;
  const th1 = ramp(t, at(c, 1.15), 0.8);
  const th2 = ramp(t, at(c, 1.5), 0.8);
  const bellK = pop(t, at(c, 2));
  const drift = ramp(t, at(c, 2.4), 1.2);
  // колокол
  const BX = 340;
  const BB = 800;
  const bell = (x: number) => BB - 230 * Math.exp(-Math.pow((x - BX) / 105, 2));
  const bellPath = Array.from({ length: 53 }, (_, i) => {
    const x = BX - 260 + i * 10;
    return `${i === 0 ? "M" : "L"} ${x} ${bell(x)}`;
  }).join(" ");
  return (
    <g>
      {/* диалог инструктора */}
      <Pop t={t} at={0.25} x={340} y={275}>
        <g>
          <Panel x={-290} y={-175} w={580} h={350} fill="#fffaf4" r={28} />
          <g transform="translate(-205 140) scale(1.1)">
            <Person x={0} y={0} s={1} color={C.skyDeep} t={0} />
            <path d="M -36 -128 L 40 -128 L 28 -140 Q 0 -160 -28 -140 Z" fill="#2a4aa0" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
          </g>
          {[
            { y: -140, a: "похвалил", b: "хуже", color: C.red, up: false, beat: 0.15 },
            { y: -10, a: "отругал", b: "лучше", color: C.greenDeep, up: true, beat: 0.55 },
          ].map((r, i) => (
            <Pop key={i} t={t} at={at(c, r.beat)} x={0} y={0}>
              <g>
                <path d={`M -100 ${r.y + 34} L -150 ${i === 0 ? r.y + 120 : r.y + 40} L -100 ${r.y + 66} Z`} fill="#fff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
                <rect x={-110} y={r.y} width={392} height={96} rx={34} fill="#fff" stroke={OL} strokeWidth={4} />
                <rect x={-112} y={r.y + 36} width={10} height={28} fill="#fff" />
                <text x={-88} y={r.y + 60} fontFamily={FONT} fontSize={34} fontWeight={800} fill={C.ink}>
                  {`${r.a} → `}
                  <tspan fill={r.color} fontWeight={900}>
                    {r.b}
                  </tspan>
                </text>
                <path d={r.up ? `M 252 ${r.y + 68} l 0 -40 m -11 13 l 11 -13 l 11 13` : `M 252 ${r.y + 28} l 0 40 m -11 -13 l 11 13 l 11 -13`} stroke={r.color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </Pop>
          ))}
        </g>
      </Pop>

      {/* мишень на полу */}
      <Pop t={t} at={at(c, 1)} x={TX} y={310}>
        <g>
          <Panel x={-330} y={-210} w={660} h={420} fill="#fffaf4" r={28} />
          <Title x={0} y={-160} text="Монеты в мишень" size={34} />
          {[1, 0.72, 0.44, 0.18].map((f, i) => (
            <ellipse key={i} cx={0} cy={TY - 310} rx={RX * f} ry={RY * f} fill={i % 2 ? "#fff" : "#ffd9cf"} stroke={OL} strokeWidth={3.5} />
          ))}
        </g>
      </Pop>
      {THROWS.map((th, i) => {
        const ax = TX + th.a[0] * RX;
        const ay = TY + th.a[1] * RY;
        const bx = TX + th.b[0] * RX;
        const by = TY + th.b[1] * RY;
        return (
          <g key={i}>
            <Coin x={ax} y={ay - (1 - th1) * 80} color={th.c} k={clamp01(th1 * 3 - i * 0.3)} />
            {th2 > 0 && <Arrow x1={ax} y1={ay} x2={lerp(ax, bx, 0.82)} y2={lerp(ay, by, 0.82)} k={th2} color={th.c} w={4} />}
            <Coin x={bx} y={by} color={th.c} ring k={clamp01(th2 * 2 - 1)} />
          </g>
        );
      })}
      <g opacity={ramp(t, at(c, 1.55), 0.5)}>
        <Coin x={790} y={482} color={C.ink} />
        <Txt x={820} y={492} size={30} anchor="start">
          1-й
        </Txt>
        <Coin x={930} y={482} color={C.ink} ring />
        <Txt x={960} y={492} size={30} anchor="start">
          2-й бросок
        </Txt>
      </g>

      {/* колокол и среднее */}
      {bellK > 0.001 && (
        <g opacity={clamp01(bellK * 1.5)} transform={`translate(0 ${(1 - bellK) * 30})`}>
          <Panel x={50} y={480} w={580} h={400} fill="#fffaf4" r={28} />
          <Title x={340} y={534} text="Регрессия к среднему" size={34} />
          <path d={`${bellPath} L ${BX + 260} ${BB} L ${BX - 260} ${BB} Z`} fill="#ffe7b8" stroke={OL} strokeWidth={4} />
          <line x1={BX} y1={560} x2={BX} y2={BB} stroke={C.ink} strokeWidth={4} strokeDasharray="10 8" />
          <Txt x={BX} y={846} size={30} color={C.inkSoft}>
            среднее
          </Txt>
          {[
            { x0: BX + 210, x1: BX + 70, col: C.green },
            { x0: BX - 210, x1: BX - 70, col: C.red },
          ].map((d, i) => {
            const x = lerp(d.x0, d.x1, drift);
            return (
              <g key={i}>
                <circle cx={d.x0} cy={bell(d.x0) - 18} r={14} fill="none" stroke={d.col} strokeWidth={4} strokeDasharray="5 4" opacity={drift} />
                <Arrow x1={d.x0} y1={bell(d.x0) - 44} x2={lerp(d.x0, d.x1, 0.8)} y2={bell(d.x1) - 52} k={drift} color={d.col} w={5} bend={d.x0 > BX ? 0.25 : -0.25} />
                <circle cx={x} cy={bell(x) - 18} r={16} fill={d.col} stroke={OL} strokeWidth={3.5} />
              </g>
            );
          })}
          <Txt x={BX + 225} y={bell(BX + 210) + 48} size={30} color={C.greenDeep}>
            удача
          </Txt>
          <Txt x={BX - 225} y={bell(BX - 210) + 48} size={30} color={C.red}>
            неудача
          </Txt>
        </g>
      )}

      {/* выводы */}
      <Pop t={t} at={at(c, 3.05)} x={1010} y={600}>
        <Tag x={0} y={0} text="у удачи нет причины" color={C.yellow} size={38} />
      </Pop>
      <Pop t={t} at={at(c, 4.05)} x={1010} y={700}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.ink}>
          {"успех = "}
          <tspan fill={S2.deep}>талант</tspan>
          {" + "}
          <tspan fill={S1.deep}>удача</tspan>
        </text>
      </Pop>
      <Pop t={t} at={at(c, 4.45)} x={1010} y={790}>
        <g>
          <Panel x={-320} y={-56} w={640} h={112} fill="#fff" r={26} />
          <text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>
            большой успех =
          </text>
          <text x={0} y={32} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink}>
            <tspan fill={S2.deep}>чуть больше таланта</tspan>
            {" + "}
            <tspan fill={S1.deep} fontWeight={900} fontSize={36}>
              много удачи
            </tspan>
          </text>
        </g>
      </Pop>
    </g>
  );
};

// ═══════════════════ k21 — памятка ═══════════════════

const MemoIcon: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  if (i === 0)
    return (
      <g>
        {[
          [-30, -10, 1],
          [0, 14, 0],
          [26, -14, 1],
        ].map(([x, y, r], j) => (
          <circle key={j} cx={x} cy={y} r={13} fill={r ? C.red : "#fff"} stroke={OL} strokeWidth={3} />
        ))}
        <circle cx={0} cy={0} r={58} fill="none" stroke={C.ink} strokeWidth={7} />
        <path d="M 42 42 L 74 74" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      </g>
    );
  if (i === 1) return <AnchorIcon x={0} y={8} s={1.7} color={C.skyDeep} />;
  if (i === 2)
    return (
      <g>
        <Tornado x={-24} y={60} s={0.62} t={t} />
        <Inhaler x={50} y={44} s={0.55} />
      </g>
    );
  return (
    <g>
      {Array.from({ length: 15 }).map((_, j) => (
        <Dot key={j} x={-56 + (j % 5) * 28} y={-30 + Math.floor(j / 5) * 34} r={11} color={j < 4 ? C.coral : S2.main} />
      ))}
    </g>
  );
};

export const TrapsRecap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cards = [
    { text: "Выборка\nмала?", b: 0.18 },
    { text: "Есть\nякорь?", b: 0.45 },
    { text: "Легко вспомнить\n≠ часто", b: 0.72 },
    { text: "Сколько\nиз 100?", b: 1.05 },
  ];
  const bars = ramp(t, at(c, 1.4), 1.0);
  const fall = ramp(t, at(c, 1.7), 1.0);
  const SCALE = 12;
  return (
    <g>
      <Pop t={t} at={0.2} x={1080} y={140}>
        <Title x={0} y={0} text="Памятка против ловушек" size={52} />
      </Pop>
      {cards.map((cd, i) => {
        const x = 520 + i * 375;
        return (
          <Pop key={i} t={t} at={at(c, cd.b)} x={x} y={370}>
            <g transform={`rotate(${wob(t, i, 1.2)})`}>
              <Panel x={-170} y={-170} w={340} h={340} fill={i === 3 ? "#fff6d6" : "#fff"} r={30} stroke={i === 3 ? C.yellowDeep : undefined} />
              <rect x={-40} y={-186} width={80} height={30} rx={8} fill={C.yellow} opacity={0.9} />
              <g transform="translate(0 -46) scale(1.3)">
                <MemoIcon i={i} t={t} />
              </g>
              <Txt x={0} y={78} size={i === 2 ? 32 : 40} weight={900}>
                {cd.text}
              </Txt>
            </g>
          </Pop>
        );
      })}
      {bars > 0 && (
        <g opacity={clamp01(bars * 2)}>
          <Txt x={1100} y={624} size={36} weight={900} color={C.inkSoft}>
            доля ошибок
          </Txt>
          {[
            { y: 700, label: "в процентах", v: 65, color: C.red, k: bars },
            { y: 800, label: "«сколько из 100?»", v: 25, color: C.green, k: fall },
          ].map((r, i) => (
            <g key={i} opacity={i === 1 ? clamp01(fall * 3) : 1}>
              <Txt x={700} y={r.y + 12} size={34} anchor="end">
                {r.label}
              </Txt>
              <rect x={720} y={r.y - 30} width={r.v * SCALE * r.k} height={60} rx={16} fill={r.color} stroke={OL} strokeWidth={4} />
              {r.k > 0.7 && (
                <Txt x={720 + r.v * SCALE * r.k + 20} y={r.y + 16} size={44} anchor="start" weight={900} color={i === 0 ? C.red : C.greenDeep}>
                  {`${r.v}%`}
                </Txt>
              )}
            </g>
          ))}
        </g>
      )}
    </g>
  );
};
