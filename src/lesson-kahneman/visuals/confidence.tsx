// Часть «Уверенность»: задний ум, иллюзия валидности, формулы и шкала Апгар,
// собеседование по баллам, интуиция экспертов, ошибка планирования, премортем.
import React from "react";
import { interpolate } from "remotion";
import { C, S1, S2 } from "../theme";
import { BigNum, Dot } from "./chars";
import { Book, Heart, OL, Person, Soldier } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualCtx, type VisualProps } from "./kit";

// ───────────── общие детали ─────────────

// видимость «фазы» сцены: появляется в a, уходит перед b
const phase = (t: number, a: number | null, b: number | null, d = 0.5) => (a === null ? 1 : ramp(t, a, d)) * (b === null ? 1 : 1 - ramp(t, b - d, d));

const Phase: React.FC<{ o: number; children: React.ReactNode; dy?: number }> = ({ o, children, dy = 24 }) =>
  o <= 0.001 ? null : (
    <g opacity={o} transform={`translate(0 ${(1 - o) * dy})`}>
      {children}
    </g>
  );

const Head: React.FC<{ x: number; y: number; children: string; size?: number; color?: string; anchor?: "start" | "middle" | "end" }> = ({ x, y, children, size = 44, color = C.ink, anchor = "middle" }) => (
  <text x={x} y={y} fontFamily="Rubik" fontWeight={700} fontSize={size} fill={color} textAnchor={anchor}>
    {children}
  </text>
);

// рисование линии/пути по прогрессу
const DrawPath: React.FC<{ d: string; k: number; len: number; color: string; w?: number }> = ({ d, k, len, color, w = 10 }) =>
  k <= 0 ? null : <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - clamp01(k))} />;

const Trophy: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 -50 Q -78 -48 -66 -18 Q -58 0 -32 -6" fill="none" stroke={OL} strokeWidth={6} />
    <path d="M 40 -50 Q 78 -48 66 -18 Q 58 0 32 -6" fill="none" stroke={OL} strokeWidth={6} />
    <path d="M -44 -62 L 44 -62 Q 44 6 0 16 Q -44 6 -44 -62 Z" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -26 -50 Q -26 -10 -6 2" stroke="#fff" strokeWidth={6} fill="none" opacity={0.7} strokeLinecap="round" />
    <rect x={-9} y={14} width={18} height={22} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
    <rect x={-34} y={34} width={68} height={16} rx={5} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
  </g>
);

// весы: tilt > 0 — правая чаша ниже
const Scales: React.FC<{ x: number; y: number; tilt: number; left: React.ReactNode; right: React.ReactNode; arm?: number; s?: number }> = ({ x, y, tilt, left, right, arm = 200, s = 1 }) => {
  const a = (tilt * Math.PI) / 180;
  const lx = -arm * Math.cos(a);
  const ly = -arm * Math.sin(a);
  const rx = arm * Math.cos(a);
  const ry = arm * Math.sin(a);
  const pan = (px: number, py: number, content: React.ReactNode) => (
    <g transform={`translate(${px} ${py})`}>
      <path d="M 0 0 L -70 110 M 0 0 L 70 110" stroke={OL} strokeWidth={4} />
      <path d="M -90 110 L 90 110 Q 80 150 0 150 Q -80 150 -90 110 Z" fill="#e9eef7" stroke={OL} strokeWidth={5} />
      <g transform="translate(0 106)">{content}</g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -70 330 L 70 330 L 30 300 L 14 0 L -14 0 L -30 300 Z" fill="#c9b48a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={OL} strokeWidth={12} strokeLinecap="round" />
      <circle r={16} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
      {pan(lx, ly, left)}
      {pan(rx, ry, right)}
    </g>
  );
};

const Coin: React.FC<{ x: number; y: number; t: number; r?: number; spin?: number }> = ({ x, y, t, r = 60, spin = 1 }) => {
  const sx = spin > 0 ? Math.cos(t * 9) : 1;
  const face = sx >= 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.max(0.08, Math.abs(sx))} 1)`}>
      <circle r={r} fill={face ? C.yellow : C.yellowDeep} stroke={OL} strokeWidth={5} />
      <circle r={r * 0.72} fill="none" stroke={C.bananaDark} strokeWidth={4} />
      <Txt x={0} y={r * 0.28} size={r * 0.8} weight={900} color={C.brown}>
        {face ? "1" : "?"}
      </Txt>
    </g>
  );
};

// полукруглый индикатор (v 0..1)
const Gauge: React.FC<{ x: number; y: number; v: number; r?: number; label: string; color?: string }> = ({ x, y, v, r = 150, label, color = C.green }) => {
  const arc = (from: number, to: number) => {
    const a0 = Math.PI * (1 - from);
    const a1 = Math.PI * (1 - to);
    return `M ${Math.cos(a0) * r} ${-Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${Math.cos(a1) * r} ${-Math.sin(a1) * r}`;
  };
  const na = Math.PI * (1 - clamp01(v));
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={arc(0, 1)} stroke="#e3e6ef" strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={arc(0, 0.4)} stroke="#ffd0c9" strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={arc(0.7, 1)} stroke={color} strokeWidth={34} fill="none" strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.cos(na) * (r - 30)} y2={-Math.sin(na) * (r - 30)} stroke={OL} strokeWidth={10} strokeLinecap="round" />
      <circle r={16} fill={OL} />
      <Txt x={0} y={64} size={36}>
        {label}
      </Txt>
    </g>
  );
};

// ───────────── k22: иллюзия понимания прошлого ─────────────

const BRANCHES: [number, number, number, number][] = [
  [-200, 92, -110, 220],
  [-150, 70, -250, -40],
  [-70, 34, 60, 170],
  [-20, 10, -110, -130],
  [40, -20, 180, 80],
  [90, -50, 20, -200],
  [150, -80, 290, 20],
  [200, -100, 150, -230],
  [-250, 112, -330, 230],
];

const Garage: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -170 0 L -170 -170 L 0 -260 L 170 -170 L 170 0 Z" fill="#f6e3c4" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -190 -160 L 0 -270 L 190 -160" fill="none" stroke={C.coral} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={-120} y={-140} width={240} height={140} fill="#cdd6e4" stroke={OL} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={-120} x2={120} y1={-112 + i * 30} y2={-112 + i * 30} stroke="#9aa7bd" strokeWidth={5} />
    ))}
  </g>
);

const WeightCard: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <g>
    <rect x={-88} y={-62} width={176} height={58} rx={14} fill={color} stroke={OL} strokeWidth={4} />
    <Txt x={0} y={-22} size={30}>
      {text}
    </Txt>
  </g>
);

export const Hindsight: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const o1 = phase(t, null, at(c, 2));
  const o2 = phase(t, at(c, 2) - 0.1, null);
  // путь успеха и «камера» отъезжает
  const pathK = ramp(t, 0.3, 1.4);
  const zoom = ramp(t, at(c, 0.5), 1.6);
  const z = 1.45 - 0.45 * zoom;
  const fx = 120 * (1 - zoom);
  const fy = -60 * (1 - zoom);
  // блокнот: стирание и новая надпись
  const erase = ramp(t, at(c, 2.3), 1.1);
  const write = ramp(t, at(c, 2.3) + 1.1, 0.9);
  const eraserX = -170 + 340 * erase;
  const tilt = 14 * ramp(t, at(c, 3.25), 1.2);
  const slide = ramp(t, at(c, 3), 0.8);
  return (
    <g>
      <Phase o={o1}>
        {/* дерево исходов */}
        <linearGradient id="hs-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.12" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.9" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id="hs-tree" maskUnits="userSpaceOnUse" x={600} y={90} width={740} height={740}>
          <rect x={600} y={90} width={740} height={740} fill="url(#hs-fade)" />
        </mask>
        <g mask="url(#hs-tree)">
        <g transform={`translate(970 450)`}>
          <g transform={`scale(${z}) translate(${-fx} ${-fy})`}>
            {BRANCHES.map(([x1, y1, x2, y2], i) => {
              const k = ramp(t, at(c, 0.55) + i * 0.12, 0.5);
              if (k <= 0) return null;
              const mx = x1 + (x2 - x1) * k;
              const my = y1 + (y2 - y1) * k;
              return (
                <g key={i}>
                  <path d={`M ${x1} ${y1} L ${mx} ${my}`} stroke="#a7aec4" strokeWidth={8} strokeDasharray="16 14" strokeLinecap="round" />
                  {k > 0.95 && (
                    <g transform={`translate(${x2} ${y2})`} stroke={C.red} strokeWidth={7} strokeLinecap="round" opacity={0.8}>
                      <line x1={-12} y1={-12} x2={12} y2={12} />
                      <line x1={12} y1={-12} x2={-12} y2={12} />
                    </g>
                  )}
                </g>
              );
            })}
            <DrawPath d="M -300 120 C -150 80 -80 40 0 0 S 160 -100 280 -120" k={pathK} len={680} color={C.greenDeep} w={16} />
            <circle cx={-300} cy={120} r={20} fill={C.white} stroke={OL} strokeWidth={5} />
            {pathK > 0.9 && <Trophy x={300} y={-170} s={0.95 + 0.05 * Math.sin(t * 3)} />}
          </g>
        </g>
        </g>
        <g transform={`translate(970 450)`}>
          <Pop t={t} at={0.9} x={0} y={-300}>
            <Tag x={0} y={0} text="история успеха" color={C.yellow} size={36} />
          </Pop>
          <Pop t={t} at={at(c, 0.85)} x={-40} y={300}>
            <Tag x={0} y={0} text="а сколько других исходов?" color="#e7e3f7" size={32} />
          </Pop>
        </g>
        {/* гараж и табличка */}
        <Pop t={t} at={at(c, 1)} x={1610} y={640}>
          <Garage x={0} y={0} />
        </Pop>
        <Pop t={t} at={at(c, 1.25)} x={1610} y={250}>
          <g transform={`rotate(${wob(t, 2, 2)})`}>
            <line x1={0} y1={60} x2={0} y2={150} stroke={OL} strokeWidth={8} />
            <rect x={-150} y={-70} width={300} height={140} rx={16} fill="#fff" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-14} size={34}>
              продаётся
            </Txt>
            <Txt x={0} y={42} size={44} weight={900} color={C.greenDeep}>
              ~$1 млн
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 1.6)} x={1610} y={570} from={1.6}>
          <g transform="rotate(-8)">
            <rect x={-170} y={-52} width={340} height={104} rx={14} fill="#fff" fillOpacity={0.88} stroke={C.red} strokeWidth={7} />
            <Txt x={0} y={-8} size={34} color={C.red}>
              покупатель
            </Txt>
            <Txt x={0} y={34} size={34} color={C.red}>
              отказался
            </Txt>
          </g>
        </Pop>
      </Phase>

      <Phase o={o2}>
        {/* блокнот */}
        <g transform={`translate(${1240 - 330 * slide} 450)`}>
          <Panel x={-240} y={-280} w={480} h={560} r={24} fill="#fffdf6" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={-180 + i * 60} cy={-280} r={13} fill="none" stroke={OL} strokeWidth={5} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={-200} x2={200} y1={-150 + i * 76} y2={-150 + i * 76} stroke="#cfe0f5" strokeWidth={3} />
          ))}
          <Txt x={0} y={-180} size={32} color={C.inkSoft}>
            мой прогноз:
          </Txt>
          <clipPath id="hs-old">
            <rect x={eraserX} y={-120} width={400} height={120} />
          </clipPath>
          <clipPath id="hs-new">
            <rect x={-200} y={-120} width={400 * write} height={120} />
          </clipPath>
          <g clipPath="url(#hs-old)">
            <Txt x={0} y={-50} size={48} color={C.inkSoft}>
              «50 на 50»
            </Txt>
          </g>
          <g clipPath="url(#hs-new)">
            <text x={0} y={-48} textAnchor="middle" fontFamily="Nunito" fontStyle="italic" fontWeight={900} fontSize={50} fill={C.red}>
              «я так и знал!»
            </text>
          </g>
          {erase > 0 && erase < 1 && (
            <g transform={`translate(${eraserX} ${-62 + Math.sin(t * 22) * 6}) rotate(-20)`}>
              <rect x={-34} y={-60} width={68} height={110} rx={12} fill="#ff9fb4" stroke={OL} strokeWidth={5} />
              <rect x={-34} y={-60} width={68} height={40} rx={12} fill={S2.main} stroke={OL} strokeWidth={5} />
            </g>
          )}
          <Pop t={t} at={at(c, 2.05)} x={0} y={90}>
            <g>
              <rect x={-170} y={-40} width={340} height={80} rx={20} fill={C.green} opacity={0.9} />
              <Txt x={0} y={14} size={36} color="#fff">
                исход известен
              </Txt>
            </g>
          </Pop>
          <Pop t={t} at={at(c, 2.7)} x={0} y={200}>
            <Tag x={0} y={0} text="задним умом" color={C.yellow} size={36} />
          </Pop>
        </g>
        {/* весы: решение vs результат */}
        <Pop t={t} at={at(c, 3)} x={1590} y={330}>
          <Scales
            x={0}
            y={0}
            tilt={tilt}
            arm={190}
            left={<WeightCard text="решение" color={S2.light} />}
            right={<WeightCard text="результат" color="#ffe1dc" />}
          />
        </Pop>
        <Pop t={t} at={at(c, 3.6)} x={1590} y={760}>
          <Tag x={0} y={0} text="судят по исходу" color={C.coral} size={34} textColor="#fff" />
        </Pop>
      </Phase>
    </g>
  );
};

// ───────────── k23: иллюзия валидности ─────────────

const FUNDS = ["Фонд A", "Фонд B", "Фонд C", "Фонд D", "Фонд E"];
const FUND_COL = [S1.main, S2.main, C.green, C.violet, C.coral];
const YEAR2 = [3, 0, 4, 1, 2]; // место фонда во 2-м году

export const LogTest: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const o1 = phase(t, null, at(c, 3));
  const o2 = phase(t, at(c, 3) - 0.1, null);
  const carry = ramp(t, at(c, 0.4), 3);
  const lift = -10 * carry + wob(t, 1, 3);
  const conf = 0.86 + Math.sin(t * 1.3) * 0.02;
  return (
    <g>
      <Phase o={o1}>
        <Head x={450} y={160}>
          армейский тест с бревном
        </Head>
        <g transform="translate(0 90)">
        {/* земля и стена */}
        <rect x={60} y={660} width={880} height={14} rx={7} fill="#b9a7e6" />
        <g>
          {Array.from({ length: 6 }).map((_, row) =>
            [0, 1].map((col) => (
              <rect key={`${row}-${col}`} x={780 + col * 60 - (row % 2) * 30} y={420 + row * 40} width={60} height={40} fill="#d98b66" stroke={OL} strokeWidth={3} />
            )),
          )}
          <rect x={746} y={410} width={128} height={250} fill="none" />
        </g>
        {/* солдаты без знаков различия */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Pop key={i} t={t} at={0.3 + i * 0.08} x={150 + i * 74 + carry * 30} y={650}>
            <Soldier x={0} y={0} s={1.15} squat={0.15 + 0.12 * Math.abs(Math.sin(t * 2 + i))} color="#6f8a55" />
          </Pop>
        ))}
        {/* бревно */}
        <Pop t={t} at={0.9} x={460 + carry * 30} y={518 + lift}>
          <g transform={`rotate(${-4 * carry + wob(t, 3, 1.2)})`}>
            <rect x={-360} y={-24} width={720} height={48} rx={24} fill="#a8733f" stroke={OL} strokeWidth={5} />
            <ellipse cx={346} cy={0} rx={16} ry={22} fill="#d9a066" stroke={OL} strokeWidth={4} />
            <path d="M -300 -6 L -180 -6 M -60 8 L 80 8 M 160 -8 L 260 -8" stroke="#7e5228" strokeWidth={5} strokeLinecap="round" />
          </g>
        </Pop>
        <Pop t={t} at={at(c, 0.7)} x={450} y={235}>
          <Tag x={0} y={0} text="8 человек, без знаков" color="#fff" size={32} />
        </Pop>
        {/* ярлыки над головами */}
        <Pop t={t} at={at(c, 0.15)} x={150 + 1 * 74 + carry * 30} y={380} from={0.3}>
          <g>
            <Tag x={0} y={0} text="лидер!" color={C.green} size={32} textColor="#fff" />
            <path d="M -10 26 L 0 44 L 10 26 Z" fill={C.green} />
          </g>
        </Pop>
        <Pop t={t} at={at(c, 0.35)} x={150 + 6 * 74 + carry * 30} y={380} from={0.3}>
          <g>
            <Tag x={0} y={0} text="слабак" color={C.coral} size={32} textColor="#fff" />
            <path d="M -10 26 L 0 44 L 10 26 Z" fill={C.coral} />
          </g>
        </Pop>
        </g>
        {/* прогноз ≈ монетка */}
        <Pop t={t} at={at(c, 0.6)} x={1150} y={290}>
          <g>
            <Panel x={-190} y={-150} w={380} h={300} r={30} />
            <Txt x={0} y={-96} size={32} color={C.inkSoft}>
              точность прогноза
            </Txt>
            <Coin x={0} y={0} t={t} r={58} />
            <Txt x={0} y={118} size={42} weight={900}>
              ≈ монетка
            </Txt>
          </g>
        </Pop>
        {/* уверенность не падает */}
        <Pop t={t} at={at(c, 2.05)} x={1150} y={720}>
          <g>
            <Panel x={-190} y={-210} w={380} h={300} r={30} />
            <Gauge x={0} y={0} v={conf} r={130} label="уверенность" />
          </g>
        </Pop>
        <Pop t={t} at={at(c, 2.5)} x={450} y={850}>
          <Tag x={0} y={0} text="иллюзия валидности" color={C.yellow} size={40} />
        </Pop>
      </Phase>

      <Phase o={o2}>
        {/* рейтинги фондов */}
        <g transform="translate(340 470)">
          <Panel x={-290} y={-330} w={580} h={600} r={30} />
          <Head x={0} y={-260} size={40}>
            рейтинг фондов
          </Head>
          <Txt x={-150} y={-195} size={32} color={C.inkSoft}>
            Год 1
          </Txt>
          <Txt x={150} y={-195} size={32} color={C.inkSoft}>
            Год 2
          </Txt>
          {FUNDS.map((f, i) => {
            const k1 = pop(t, at(c, 3) + 0.1 + i * 0.1);
            const k2 = pop(t, at(c, 3.35) + i * 0.1);
            const ar = ramp(t, at(c, 3.3) + i * 0.08, 0.6);
            const y1 = -130 + i * 85;
            const y2 = -130 + YEAR2[i] * 85;
            return (
              <g key={f}>
                {ar > 0 && <Arrow x1={-80} y1={y1} x2={80} y2={y2} k={ar} color={FUND_COL[i]} w={6} />}
                <g transform={`translate(-150 ${y1}) scale(${k1})`}>
                  <rect x={-75} y={-30} width={150} height={60} rx={18} fill={FUND_COL[i]} />
                  <Txt x={0} y={11} size={30} color="#fff">
                    {`${i + 1}. ${f.slice(5)}`}
                  </Txt>
                </g>
                <g transform={`translate(150 ${y2}) scale(${k2})`}>
                  <rect x={-75} y={-30} width={150} height={60} rx={18} fill={FUND_COL[i]} />
                  <Txt x={0} y={11} size={30} color="#fff">
                    {`${YEAR2[i] + 1}. ${f.slice(5)}`}
                  </Txt>
                </g>
              </g>
            );
          })}
        </g>
        <Pop t={t} at={at(c, 3.6)} x={340} y={810}>
          <Tag x={0} y={0} text="связно ≠ точно" color={C.yellow} size={36} />
        </Pop>
        {/* Тетлок */}
        <g transform="translate(1010 470)">
          <Pop t={t} at={at(c, 4)} x={0} y={0}>
            <Panel x={-320} y={-330} w={640} h={600} r={30} />
          </Pop>
          <Pop t={t} at={at(c, 4.05)} x={0} y={-262}>
            <Head x={0} y={0} size={38}>
              Тетлок: 20 лет прогнозов
            </Head>
          </Pop>
          <BigNum x={-150} y={-160} text="284" k={pop(t, at(c, 4.15))} size={72} color={S2.deep} />
          <Pop t={t} at={at(c, 4.15)} x={-150} y={-112}>
            <Txt x={0} y={0} size={30} color={C.inkSoft}>
              эксперта
            </Txt>
          </Pop>
          <BigNum x={150} y={-160} text="80 000+" k={pop(t, at(c, 4.3))} size={72} color={S2.deep} />
          <Pop t={t} at={at(c, 4.3)} x={150} y={-112}>
            <Txt x={0} y={0} size={30} color={C.inkSoft}>
              прогнозов
            </Txt>
          </Pop>
          {(() => {
            const k = ramp(t, at(c, 4.35), 1.2);
            if (k <= 0) return null;
            const base = 180;
            const hA = 150 * k;
            const hB = 210 * k;
            return (
              <g>
                <line x1={-260} x2={260} y1={base} y2={base} stroke={OL} strokeWidth={4} />
                <rect x={-190} y={base - hA} width={140} height={hA} rx={12} fill={S2.main} stroke={OL} strokeWidth={4} />
                <rect x={50} y={base - hB} width={140} height={hB} rx={12} fill="#c9cfdc" stroke={OL} strokeWidth={4} />
                <Txt x={-120} y={base + 42} size={30}>
                  эксперты
                </Txt>
                {k > 0.95 && (
                  <g transform={`translate(-120 ${base - hA - 34}) scale(${pop(t, at(c, 4.6))})`}>
                    <Tag x={0} y={0} text="хуже" color={C.red} size={28} textColor="#fff" />
                  </g>
                )}
                <Txt x={120} y={base + 42} size={30}>
                  равные шансы
                </Txt>
                {k > 0.5 && (
                  <Txt x={0} y={-40} size={30} color={C.inkSoft}>
                    точность на долгий срок
                  </Txt>
                )}
              </g>
            );
          })()}
        </g>
      </Phase>
    </g>
  );
};

// ───────────── k24: формулы против интуиции, шкала Апгар ─────────────

const APGAR = ["Пульс", "Дыхание", "Рефлексы", "Тонус", "Цвет кожи"];
const APGAR_V = [2, 2, 1, 2, 2];

const Baby: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={34} rx={44} ry={36} fill="#cfe1fb" stroke={OL} strokeWidth={4} />
    <path d="M -40 30 Q 0 52 40 30" stroke="#a9c6f0" strokeWidth={6} fill="none" />
    <circle cx={0} cy={-14} r={32} fill="#f6d2ae" stroke={OL} strokeWidth={4} />
    <path d="M -4 -46 Q 6 -58 12 -44" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M -14 -16 Q -9 -12 -4 -16 M 4 -16 Q 9 -12 14 -16" stroke={OL} strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <path d="M -7 -2 Q 0 4 7 -2" stroke={OL} strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <circle cx={-18} cy={-4} r={5} fill="#ff9f9f" opacity={0.7} />
    <circle cx={18} cy={-4} r={5} fill="#ff9f9f" opacity={0.7} />
  </g>
);

const MiniChart: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-80} width={220} height={160} rx={16} fill="#fff" stroke={OL} strokeWidth={4} />
    <path d="M -84 50 L -40 10 L 0 30 L 40 -30 L 84 -10" fill="none" stroke={S2.main} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    <line x1={-90} y1={58} x2={90} y2={58} stroke="#c4cad8" strokeWidth={4} />
  </g>
);

export const Apgar: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const tilt = 16 * ramp(t, at(c, 0.45), 1.4) + wob(t, 1, 0.8);
  const rowsAt = (i: number) => at(c, 2.45 + i * 0.1);
  const total = APGAR_V.reduce((s, v, i) => s + (t > rowsAt(i) + 0.3 ? v : 0), 0);
  const beat = 1 + 0.08 * Math.max(0, Math.sin(t * 6));
  return (
    <g>
      {/* весы: специалист против формулы */}
      <Pop t={t} at={0.3} x={930} y={200}>
        <Scales
          x={0}
          y={0}
          tilt={tilt}
          arm={190}
          s={0.85}
          left={
            <g>
              <Person x={0} y={-12} s={0.55} color={C.coral} />
              <Txt x={0} y={92} size={34}>
                специалист
              </Txt>
            </g>
          }
          right={
            <g>
              <rect x={-66} y={-80} width={132} height={70} rx={14} fill={S2.light} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-33} size={36} weight={900} color={S2.deep}>
                a+b+c
              </Txt>
              <Txt x={0} y={92} size={34}>
                формула
              </Txt>
            </g>
          }
        />
      </Pop>
      <Pop t={t} at={at(c, 0.8)} x={930} y={545}>
        <Tag x={0} y={0} text="часто точнее" color={C.green} size={32} textColor="#fff" />
      </Pop>
      {/* непоследовательность эксперта */}
      <Pop t={t} at={at(c, 1)} x={720} y={840}>
        <Person x={0} y={0} s={0.9} color={C.coral} t={t} />
      </Pop>
      <Pop t={t} at={at(c, 1.05)} x={900} y={740}>
        <MiniChart x={0} y={0} />
      </Pop>
      <Pop t={t} at={at(c, 1.3)} x={1100} y={680}>
        <g>
          <rect x={-70} y={-48} width={140} height={84} rx={24} fill="#fff" stroke={OL} strokeWidth={4} />
          <Txt x={0} y={10} size={40} weight={900} color={S2.deep}>
            «7»
          </Txt>
          <Txt x={0} y={-60} size={26} color={C.inkSoft}>
            1-й раз
          </Txt>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 1.6)} x={1100} y={820}>
        <g>
          <rect x={-70} y={-48} width={140} height={84} rx={24} fill="#fff" stroke={C.red} strokeWidth={5} />
          <Txt x={0} y={10} size={40} weight={900} color={C.red}>
            «4»
          </Txt>
          <Txt x={0} y={-60} size={26} color={C.inkSoft}>
            2-й раз
          </Txt>
        </g>
      </Pop>
      {/* шкала Апгар */}
      <Pop t={t} at={at(c, 2)} x={1560} y={450}>
        <g>
          <Panel x={-310} y={-340} w={620} h={680} r={32} />
          <Head x={-270} y={-262} size={44} anchor="start">
            Шкала Апгар
          </Head>
          <Txt x={-270} y={-212} size={28} color={C.inkSoft} anchor="start">
            через 1 минуту после рождения
          </Txt>
          <Txt x={110} y={-168} size={26} color={C.inkSoft}>
            0
          </Txt>
          <Txt x={180} y={-168} size={26} color={C.inkSoft}>
            1
          </Txt>
          <Txt x={250} y={-168} size={26} color={C.inkSoft}>
            2
          </Txt>
          {APGAR.map((name, i) => {
            const y = -118 + i * 72;
            const k = pop(t, at(c, 2.15 + i * 0.07));
            const f = pop(t, rowsAt(i));
            return (
              <g key={name} opacity={clamp01(k * 1.5)}>
                <rect x={-280} y={y - 32} width={560} height={64} rx={16} fill={f > 0.01 ? "#f0f7f2" : "#f5f6fa"} />
                <Txt x={-260} y={y + 11} size={32} anchor="start">
                  {name}
                </Txt>
                {[0, 1, 2].map((v) => (
                  <circle key={v} cx={110 + v * 70} cy={y} r={22} fill="#fff" stroke="#c4cad8" strokeWidth={4} />
                ))}
                {f > 0.01 && <circle cx={110 + APGAR_V[i] * 70} cy={y} r={22 * f} fill={C.green} stroke={OL} strokeWidth={3} />}
              </g>
            );
          })}
          <line x1={-280} x2={280} y1={214} y2={214} stroke="#d5d9e4" strokeWidth={4} />
          <Pop t={t} at={rowsAt(0) + 0.2} x={0} y={276}>
            <g>
              <Txt x={-260} y={0} size={36} anchor="start">
                Итого
              </Txt>
              <Txt x={260} y={4} size={48} weight={900} anchor="end" color={C.greenDeep}>
                {`${total} / 10`}
              </Txt>
            </g>
          </Pop>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 2.1)} x={1800} y={170}>
        <Baby x={0} y={0} s={0.9} />
      </Pop>
      <Pop t={t} at={at(c, 3.05)} x={1700} y={140}>
        <g transform={`scale(${beat})`}>
          <Heart x={0} y={0} s={1.1} color={C.red} />
        </g>
      </Pop>
      <Pop t={t} at={at(c, 3.2)} x={1560} y={850}>
        <Tag x={0} y={0} text="правило вместо впечатления" color={C.yellow} size={32} />
      </Pop>
    </g>
  );
};

// ───────────── k24i: собеседование по баллам ─────────────

const TRAITS = ["Ответственность", "Общительность", "Гордость за работу", "Пунктуальность", "Самостоятельность", "Мужество"];
const SCORE_A = [4, 3, 5, 4, 4, 3];

const Face: React.FC<{ x: number; y: number; closed?: boolean; s?: number }> = ({ x, y, closed, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={40} fill="#f6d2ae" stroke={OL} strokeWidth={4} />
    {closed ? (
      <path d="M -22 -6 Q -14 2 -6 -6 M 6 -6 Q 14 2 22 -6" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
    ) : (
      <g>
        <circle cx={-14} cy={-6} r={5} fill={OL} />
        <circle cx={14} cy={-6} r={5} fill={OL} />
      </g>
    )}
    <path d="M -12 14 Q 0 22 12 14" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

export const Interview: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const rowAt = (i: number) => at(c, 1.1 + i * 0.12);
  const active = TRAITS.findIndex((_, i) => t >= rowAt(i) && t < rowAt(i + 1));
  const sumK = ramp(t, at(c, 2.05), 0.6);
  const oRight1 = phase(t, null, at(c, 2));
  const oRight2 = phase(t, at(c, 2) - 0.1, null);
  return (
    <g>
      {/* лист собеседования */}
      <Pop t={t} at={0.3} x={400} y={480}>
        <g>
          <Panel x={-330} y={-380} w={660} h={760} r={30} fill="#fffdf6" />
          <Head x={-290} y={-300} size={40} anchor="start">
            Собеседование
          </Head>
          <Txt x={290} y={-302} size={28} color={C.inkSoft} anchor="end">
            оценка 1–5
          </Txt>
          {TRAITS.map((tr, i) => {
            const y = -210 + i * 82;
            const k = pop(t, at(c, 0.12 + i * 0.07));
            const filled = t >= rowAt(i) + 0.15;
            const isAct = active === i;
            return (
              <g key={tr} opacity={clamp01(k * 1.5)}>
                <rect x={-305} y={y - 34} width={610} height={68} rx={16} fill={isAct ? "#fff1c2" : "#f5f6fa"} stroke={isAct ? C.yellowDeep : "none"} strokeWidth={4} />
                <Txt x={-285} y={y + 10} size={29} anchor="start">
                  {tr}
                </Txt>
                {[1, 2, 3, 4, 5].map((v) => {
                  const on = filled && v <= SCORE_A[i];
                  const kk = on ? pop(t, rowAt(i) + 0.15 + v * 0.06) : 0;
                  return (
                    <g key={v}>
                      <circle cx={80 + v * 42} cy={y} r={16} fill="#fff" stroke="#c4cad8" strokeWidth={3} />
                      {kk > 0 && <circle cx={80 + v * 42} cy={y} r={16 * kk} fill={S2.main} />}
                    </g>
                  );
                })}
              </g>
            );
          })}
          {sumK > 0 && (
            <g opacity={sumK}>
              <line x1={-305} x2={305} y1={286} y2={286} stroke="#d5d9e4" strokeWidth={4} />
              <Txt x={-285} y={336} size={36} anchor="start">
                Сумма
              </Txt>
              <Txt x={285} y={340} size={48} weight={900} anchor="end" color={S2.deep}>
                23
              </Txt>
            </g>
          )}
        </g>
      </Pop>

      <Phase o={oRight1}>
        {/* общее впечатление — зачёркнуто */}
        <Pop t={t} at={at(c, 0.5)} x={1040} y={260}>
          <g>
            <path d="M -170 40 Q -200 -20 -140 -40 Q -130 -100 -50 -90 Q 0 -140 60 -90 Q 150 -110 160 -30 Q 210 10 160 50 Q 140 90 60 70 Q 0 100 -60 70 Q -150 90 -170 40 Z" fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-12} size={30}>
              общее
            </Txt>
            <Txt x={0} y={26} size={30}>
              впечатление
            </Txt>
            {t > at(c, 0.75) && (
              <g transform={`translate(150 -70) scale(${pop(t, at(c, 0.75))})`}>
                <circle r={34} fill="#fff" stroke={C.red} strokeWidth={5} />
                <Cross x={0} y={0} s={32} k={ramp(t, at(c, 0.75), 0.5)} />
              </g>
            )}
          </g>
        </Pop>
        <Pop t={t} at={at(c, 0.9)} x={1040} y={440}>
          <Tag x={0} y={0} text="6 качеств" color={C.yellow} size={40} />
        </Pop>
        <Pop t={t} at={at(c, 1.15)} x={1040} y={570}>
          <Tag x={0} y={0} text="факты о поступках" color="#fff" size={32} />
        </Pop>
        <Pop t={t} at={at(c, 1.45)} x={1040} y={690}>
          <g>
            <Tag x={0} y={0} text="строго по очереди" color={S2.main} size={32} textColor="#fff" />
          </g>
        </Pop>
      </Phase>

      <Phase o={oRight2}>
        {/* два кандидата */}
        {[
          { x: 900, sum: "23", color: S2.main, label: "A" },
          { x: 1210, sum: "18", color: C.coral, label: "B" },
        ].map((cd, i) => (
          <Pop key={cd.label} t={t} at={at(c, 2.15) + i * 0.2} x={cd.x} y={560}>
            <g>
              <Person x={0} y={0} s={1.15} color={cd.color} t={t} />
              <rect x={-80} y={-290} width={160} height={90} rx={22} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-230} size={44} weight={900} color={i === 0 ? S2.deep : C.inkSoft}>
                {`Σ ${cd.sum}`}
              </Txt>
              <Txt x={0} y={100} size={32} color={C.inkSoft}>
                {`кандидат ${cd.label}`}
              </Txt>
            </g>
          </Pop>
        ))}
        {[0, 1, 2].map((i) => {
          const k = pop(t, at(c, 2.35) + i * 0.12);
          if (k <= 0) return null;
          const fl = ((t * 0.5 + i * 0.33) % 1) * 30;
          return <Heart key={i} x={1275 + (i % 2) * 40} y={540 - i * 45 - fl} s={0.75 * k} color={C.red} />;
        })}
        <Pop t={t} at={at(c, 2.4)} x={1210} y={300}>
          <Tag x={0} y={-70} text="понравился" color="#ffe1dc" size={28} />
        </Pop>
        <Pop t={t} at={at(c, 2.5)} x={900} y={700}>
          <g>
            <Tag x={0} y={0} text="выбор" color={C.green} size={34} textColor="#fff" />
          </g>
        </Pop>
        <Check x={985} y={250} s={50} k={ramp(t, at(c, 2.5), 0.5)} />
        <Pop t={t} at={at(c, 2.75)} x={1050} y={810}>
          <g>
            <Face x={-250} y={0} closed s={0.75} />
            <Txt x={-210} y={11} size={30} anchor="start">
              общее впечатление — в конце
            </Txt>
          </g>
        </Pop>
      </Phase>
    </g>
  );
};

// ───────────── k25: когда интуиции эксперта можно верить ─────────────

const Helmet: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -38 0 Q -38 -40 0 -42 Q 38 -40 38 0 Z" fill={C.red} stroke={OL} strokeWidth={4} />
    <rect x={-48} y={-4} width={96} height={12} rx={6} fill={C.red} stroke={OL} strokeWidth={4} />
    <rect x={-8} y={-34} width={16} height={22} rx={4} fill={C.yellow} stroke={OL} strokeWidth={3} />
  </g>
);

const Flame: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  const f = 1 + Math.sin(t * 9 + x) * 0.08;
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * f})`}>
      <path d="M 0 -50 Q 30 -20 24 4 Q 18 24 0 24 Q -18 24 -24 4 Q -28 -20 0 -50 Z" fill={S1.main} />
      <path d="M 0 -22 Q 14 -6 10 8 Q 6 18 0 18 Q -8 18 -10 8 Q -12 -6 0 -22 Z" fill={C.yellow} />
    </g>
  );
};

const Chess: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 16 }).map((_, i) => {
      const r = Math.floor(i / 4);
      const col = i % 4;
      return <rect key={i} x={-80 + col * 40} y={-80 + r * 40} width={40} height={40} fill={(r + col) % 2 ? "#6b4a1e" : "#f6e3c4"} />;
    })}
    <rect x={-80} y={-80} width={160} height={160} fill="none" stroke={OL} strokeWidth={5} />
    <path d="M -20 30 L 20 30 L 14 10 Q 26 -10 10 -30 Q 0 -40 -12 -26 L -6 -18 Q -20 -10 -16 10 Z" fill="#fff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

const Monitor: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const off = (t * 80) % 60;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-90} y={-70} width={180} height={140} rx={16} fill="#1f2a3d" stroke={OL} strokeWidth={5} />
      <clipPath id="ei-mon">
        <rect x={-80} y={-60} width={160} height={120} />
      </clipPath>
      <g clipPath="url(#ei-mon)">
        <path
          d={`M ${-140 - off} 0 ${Array.from({ length: 6 })
            .map(() => `l 20 0 l 8 -34 l 10 60 l 8 -26 l 14 0`)
            .join(" ")}`}
          fill="none"
          stroke="#5be39a"
          strokeWidth={5}
          strokeLinejoin="round"
        />
      </g>
      <rect x={-20} y={70} width={40} height={20} fill="#c4cad8" stroke={OL} strokeWidth={4} />
    </g>
  );
};

const Stock: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={-80} width={240} height={160} rx={16} fill="#fff" stroke={OL} strokeWidth={5} />
    <path d="M -100 40 L -70 10 L -50 30 L -20 -20 L 0 0" fill="none" stroke={S2.main} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 0 L 30 -40 L 60 20 L 100 -30" fill="none" stroke="#b9c0d0" strokeWidth={6} strokeDasharray="10 10" strokeLinecap="round" />
    <path d="M 0 0 L 40 40 L 100 50" fill="none" stroke="#b9c0d0" strokeWidth={6} strokeDasharray="10 10" strokeLinecap="round" />
    <line x1={0} y1={-70} x2={0} y2={70} stroke="#d5d9e4" strokeWidth={3} />
  </g>
);

const ConfBar: React.FC<{ x: number; y: number; k: number; w?: number }> = ({ x, y, k, w = 420 }) => (
  <g transform={`translate(${x} ${y})`}>
    <Txt x={-w / 2} y={-22} size={28} anchor="start" color={C.inkSoft}>
      уверенность
    </Txt>
    <rect x={-w / 2} y={-12} width={w} height={34} rx={17} fill="#e3e6ef" />
    <rect x={-w / 2} y={-12} width={w * 0.9 * k} height={34} rx={17} fill={S1.main} stroke={OL} strokeWidth={3} />
  </g>
);

export const ExpertIntuition: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const o1 = phase(t, null, at(c, 2));
  const o2 = phase(t, at(c, 2) - 0.1, null);
  // выход людей из здания и обрушение перекрытия
  const walk = ramp(t, at(c, 1.1), 2.2);
  const fall = ramp(t, at(c, 1.6), 0.9);
  return (
    <g>
      <Phase o={o1}>
        {/* спор двух исследователей */}
        <Pop t={t} at={0.3} x={200} y={470}>
          <Person x={0} y={0} s={1.4} color={S2.main} t={t} />
        </Pop>
        <Pop t={t} at={0.5} x={500} y={470}>
          <g>
            <Person x={0} y={0} s={1.4} color={C.green} t={t} />
            {t > at(c, 0.6) && (
              <g transform={`translate(0 ${-185}) scale(${pop(t, at(c, 0.6))})`}>
                <Helmet x={0} y={0} s={1.05} />
              </g>
            )}
          </g>
        </Pop>
        <Pop t={t} at={0.45} x={200} y={560}>
          <Txt x={0} y={0} size={34}>
            Канеман
          </Txt>
        </Pop>
        <Pop t={t} at={0.65} x={500} y={560}>
          <Txt x={0} y={0} size={34}>
            Кляйн
          </Txt>
        </Pop>
        <Pop t={t} at={at(c, 0.2)} x={210} y={160}>
          <g>
            <rect x={-160} y={-50} width={320} height={90} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <path d="M -30 40 L -40 84 L 10 40" fill="#fff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
            <rect x={-28} y={34} width={36} height={10} fill="#fff" />
            <Txt x={0} y={8} size={32}>
              интуиция врёт?
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 0.6)} x={560} y={200}>
          <Tag x={0} y={0} text="изучал пожарных" color={C.yellow} size={30} />
        </Pop>
        {/* здание и командир */}
        <Pop t={t} at={at(c, 1)} x={1050} y={800}>
          <g>
            <rect x={-200} y={-500} width={400} height={500} fill="#e7dccb" stroke={OL} strokeWidth={6} />
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((col) => <rect key={`${r}${col}`} x={-160 + col * 120} y={-460 + r * 120} width={80} height={70} rx={8} fill={r === 0 && col === 2 ? "#ffcf9e" : "#bcd6ef"} stroke={OL} strokeWidth={4} />),
            )}
            <Flame x={140} y={-400} t={t} s={0.8} />
            {/* перекрытие, которое мягко проседает */}
            <g transform={`translate(0 ${fall * 70}) rotate(${fall * 9} 200 -250)`}>
              <rect x={-200} y={-262} width={400} height={24} fill="#a89f91" stroke={OL} strokeWidth={4} />
            </g>
            {fall > 0 &&
              [-120, -20, 90].map((dx, i) => (
                <circle key={i} cx={dx + Math.sin(t + i) * 8} cy={-150 - fall * 30} r={30 + fall * 24} fill="#d9d2c6" opacity={0.65 * (1 - fall * 0.3)} />
              ))}
            <rect x={-60} y={-130} width={120} height={130} rx={10} fill="#6b4a1e" stroke={OL} strokeWidth={5} />
            <line x1={-520} x2={260} y1={2} y2={2} stroke="#b9a7e6" strokeWidth={10} strokeLinecap="round" />
          </g>
        </Pop>
        {walk > 0 &&
          [0, 1, 2, 3].map((i) => {
            const x = 1050 - walk * (330 + i * 85) + i * 10;
            const step = Math.abs(Math.sin(t * 8 + i)) * 6;
            return (
              <g key={i}>
                <Person x={x} y={792 - step} s={0.75} color={i === 0 ? C.yellowDeep : ["#9bb8ff", "#c79bff", "#7fd1ae"][i - 1]} />
                {i === 0 && <Helmet x={x} y={792 - step - 99} s={0.6} />}
              </g>
            );
          })}
        <Check x={640} y={630} s={50} k={ramp(t, at(c, 1.7), 0.5)} />
        <Pop t={t} at={at(c, 1.75)} x={1050} y={225}>
          <Tag x={0} y={0} text="узнавание, а не магия" color={C.yellow} size={36} />
        </Pop>
      </Phase>

      <Phase o={o2}>
        <Pop t={t} at={at(c, 2)} x={700} y={140}>
          <Head x={0} y={0} size={42}>
            интуиции можно верить, если:
          </Head>
        </Pop>
        {/* условие 1 */}
        <Pop t={t} at={at(c, 2.3)} x={370} y={290}>
          <g>
            <Panel x={-300} y={-100} w={600} h={200} r={30} />
            <circle cx={-210} cy={0} r={52} fill={S2.light} />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={-246 + i * 26} y={-18} width={18} height={36} rx={6} fill={S2.main} />
            ))}
            <Txt x={50} y={-8} size={36}>
              1. регулярный
            </Txt>
            <Txt x={50} y={38} size={36}>
              мир
            </Txt>
          </g>
        </Pop>
        {/* условие 2 */}
        <Pop t={t} at={at(c, 2.6)} x={1030} y={290}>
          <g>
            <Panel x={-320} y={-100} w={640} h={200} r={30} />
            <circle cx={-230} cy={0} r={52} fill="#d6f3e3" />
            <path d="M -258 10 A 30 30 0 1 1 -230 30" fill="none" stroke={C.greenDeep} strokeWidth={8} strokeLinecap="round" />
            <path d="M -268 -4 L -258 14 L -244 0" fill="none" stroke={C.greenDeep} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            <Txt x={50} y={-8} size={34}>
              2. быстрая честная
            </Txt>
            <Txt x={50} y={36} size={34}>
              обратная связь
            </Txt>
          </g>
        </Pop>
        {/* сравнение */}
        <Pop t={t} at={at(c, 3)} x={370} y={560}>
          <g>
            <Chess x={-110} y={0} />
            <Monitor x={110} y={-10} t={t} />
            <Check x={230} y={-110} s={56} k={ramp(t, at(c, 3.25), 0.5)} />
            <Txt x={0} y={130} size={30} color={C.inkSoft}>
              шахматист, анестезиолог
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 3.35)} x={1030} y={560}>
          <g>
            <Stock x={0} y={0} />
            <Txt x={0} y={22} size={90} weight={900} color={C.red} opacity={0.85}>
              ?
            </Txt>
            <Cross x={170} y={-100} s={60} k={ramp(t, at(c, 3.5), 0.5)} />
            <Txt x={0} y={130} size={30} color={C.inkSoft}>
              курс акций на годы
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 3.7)} x={0} y={0}>
          <g>
            <ConfBar x={370} y={790} k={ramp(t, at(c, 3.7), 0.8)} />
            <ConfBar x={1030} y={790} k={ramp(t, at(c, 3.7), 0.8)} />
            <Txt x={700} y={810} size={60} weight={900}>
              =
            </Txt>
          </g>
        </Pop>
      </Phase>
    </g>
  );
};

// ───────────── k26: ошибка планирования ─────────────

const Sticky: React.FC<{ x: number; y: number; text: string; color: string; rot?: number }> = ({ x, y, text, color, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-70} y={-56} width={140} height={112} fill={color} stroke={OL} strokeWidth={3} />
    <rect x={-70} y={-56} width={140} height={18} fill="#000" opacity={0.08} />
    <Txt x={0} y={20} size={30}>
      {text}
    </Txt>
  </g>
);

const CAL = ["1 год", "2 года", "3 года", "4 года", "5 лет", "6 лет", "7 лет", "+8 лет"];

const Calendar: React.FC<{ x: number; y: number; ctx: VisualCtx; from: number; to: number }> = ({ x, y, ctx, from, to }) => {
  const { t } = ctx;
  const prog = clamp01((t - from) / Math.max(0.1, to - from));
  const pos = prog * (CAL.length - 1);
  const idx = Math.min(CAL.length - 1, Math.floor(pos));
  const frac = idx >= CAL.length - 1 ? 0 : pos - idx;
  const flip = frac > 0.6 ? (frac - 0.6) / 0.4 : 0; // листок уходит вверх
  const last = idx === CAL.length - 1;
  const page = (label: string, k = 1) => (
    <g>
      <rect x={-150} y={-90} width={300} height={200} rx={12} fill="#fff" stroke={OL} strokeWidth={5} />
      <Txt x={0} y={40} size={last && label === CAL[CAL.length - 1] ? 76 : 58} weight={900} color={label === CAL[CAL.length - 1] ? C.red : C.ink} opacity={k}>
        {label}
      </Txt>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-150} y={-90} width={300} height={200} rx={12} fill="#f2f0fb" stroke={OL} strokeWidth={5} transform="translate(8 8)" />
      {idx < CAL.length - 1 && page(CAL[idx + 1])}
      <g transform={`translate(0 -90) scale(1 ${1 - flip}) translate(0 90)`}>{page(CAL[idx])}</g>
      <rect x={-150} y={-130} width={300} height={50} rx={12} fill={C.red} stroke={OL} strokeWidth={5} />
      {[-90, 0, 90].map((dx) => (
        <rect key={dx} x={dx - 8} y={-150} width={16} height={40} rx={8} fill="#c4cad8" stroke={OL} strokeWidth={3} />
      ))}
    </g>
  );
};

const Parliament: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -220 0 L -220 -120 Q -140 -190 -40 -150 L -40 0 Z" fill="#dfe7f2" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -40 0 L -40 -180 Q 60 -240 160 -170 L 160 0 Z" fill="#cfd9e8" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 160 0 L 160 -110 Q 200 -130 230 -100 L 230 0 Z" fill="#e8eef6" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {[-190, -150, -110, -10, 40, 90].map((wx, i) => (
      <rect key={i} x={wx} y={-90} width={26} height={60} rx={6} fill="#9cc3e8" stroke={OL} strokeWidth={3} />
    ))}
    <rect x={-250} y={0} width={510} height={14} rx={7} fill="#9aa7bd" />
  </g>
);

export const Planning: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const o1 = phase(t, null, at(c, 3));
  const o2 = phase(t, at(c, 3) - 0.1, null);
  const grow = ramp(t, at(c, 3.45), 1.6);
  const money = Math.round(interpolate(grow, [0, 1], [40, 431]));
  return (
    <g>
      <Phase o={o1}>
        {/* команда и стикеры */}
        <Pop t={t} at={0.3} x={930} y={130}>
          <g>
            <Book x={-200} y={8} s={0.3} color={C.green} />
            <Head x={-150} y={20} size={40} anchor="start">
              учебник для школ
            </Head>
          </g>
        </Pop>
        {[
          ["2 года", "#fff59d", -4],
          ["1,5 года", "#c8f2d8", 3],
          ["2,5 года", "#ffd6e0", -2],
          ["2 года", "#d6e6ff", 4],
        ].map(([txt, col, rot], i) => (
          <Pop key={i} t={t} at={at(c, 0.55) + i * 0.1} x={720 + i * 160} y={260}>
            <Sticky x={0} y={0} text={txt as string} color={col as string} rot={rot as number} />
          </Pop>
        ))}
        <Pop t={t} at={0.5} x={960} y={510}>
          <g>
            {[-210, -70, 70, 210].map((dx, i) => (
              <Person key={i} x={dx} y={0} s={0.85} color={["#9bb8ff", "#ffad7a", "#7fd1ae", "#c79bff"][i]} t={t + i} />
            ))}
            <rect x={-300} y={-30} width={600} height={40} rx={14} fill="#c98b4a" stroke={OL} strokeWidth={5} />
            <rect x={-260} y={10} width={20} height={60} fill="#a8733f" stroke={OL} strokeWidth={4} />
            <rect x={240} y={10} width={20} height={60} fill="#a8733f" stroke={OL} strokeWidth={4} />
          </g>
        </Pop>
        <Pop t={t} at={at(c, 0.85)} x={960} y={390} from={0.4}>
          <Tag x={0} y={0} text="план: ≈ 2 года" color={C.yellow} size={36} />
        </Pop>
        {/* эксперт со статистикой */}
        <Pop t={t} at={at(c, 1)} x={1570} y={320}>
          <g>
            <Panel x={-290} y={-210} w={580} h={420} r={30} />
            <Head x={0} y={-150} size={36}>
              похожие команды
            </Head>
            {(() => {
              const k = ramp(t, at(c, 1.5), 0.8);
              const a = Math.PI * 2 * 0.4 * k;
              const r = 70;
              return (
                <g transform="translate(-170 -30)">
                  <circle r={r} fill="#d6f3e3" stroke={OL} strokeWidth={4} />
                  {k > 0 && <path d={`M 0 0 L 0 ${-r} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * r} ${-Math.cos(a) * r} Z`} fill={C.red} stroke={OL} strokeWidth={4} />}
                </g>
              );
            })()}
            <Pop t={t} at={at(c, 1.5)} x={40} y={-30}>
              <g>
                <Txt x={0} y={-6} size={52} weight={900} anchor="start" color={C.red}>
                  40%
                </Txt>
                <Txt x={0} y={36} size={30} anchor="start">
                  не закончили
                </Txt>
              </g>
            </Pop>
            <line x1={-250} x2={250} y1={78} y2={78} stroke="#d5d9e4" strokeWidth={4} />
            <Pop t={t} at={at(c, 1.75)} x={0} y={150}>
              <g>
                <Txt x={-250} y={0} size={30} anchor="start">
                  остальным:
                </Txt>
                <Txt x={250} y={6} size={52} weight={900} anchor="end" color={S2.deep}>
                  7–10 лет
                </Txt>
              </g>
            </Pop>
          </g>
        </Pop>
        {/* календарь */}
        <Pop t={t} at={at(c, 2)} x={1150} y={755}>
          <Calendar x={0} y={0} ctx={c} from={at(c, 2.1)} to={at(c, 2.7)} />
        </Pop>
        <Pop t={t} at={at(c, 2.05)} x={830} y={755}>
          <Txt x={0} y={12} size={34} color={C.inkSoft}>
            дописали через
          </Txt>
        </Pop>
        <Arrow x1={1570} y1={560} x2={1340} y2={700} k={ramp(t, at(c, 2.8), 0.5)} color={C.inkSoft} w={7} bend={-0.2} />
        <Pop t={t} at={at(c, 2.85)} x={1600} y={780}>
          <Tag x={0} y={0} text="как в статистике" color={C.yellow} size={32} />
        </Pop>
      </Phase>

      <Phase o={o2}>
        <Pop t={t} at={at(c, 3)} x={960} y={160}>
          <Tag x={0} y={0} text="ошибка планирования" color={C.yellow} size={44} />
        </Pop>
        <Pop t={t} at={at(c, 3.2)} x={960} y={255}>
          <Txt x={0} y={0} size={32} color={C.inkSoft}>
            план = лучший сценарий
          </Txt>
        </Pop>
        <Pop t={t} at={at(c, 3.35)} x={930} y={720}>
          <g>
            <g transform="scale(1.25)">
              <Parliament x={0} y={0} />
            </g>
            <Txt x={0} y={74} size={32} color={C.inkSoft}>
              здание парламента
            </Txt>
          </g>
        </Pop>
        {/* столбики: оценка и итог */}
        <Pop t={t} at={at(c, 3.4)} x={0} y={0}>
          <g>
            <line x1={1300} x2={1820} y1={780} y2={780} stroke={OL} strokeWidth={5} />
            <rect x={1340} y={780 - 40} width={160} height={40} rx={10} fill="#b9c0d0" stroke={OL} strokeWidth={4} />
            <Txt x={1420} y={720} size={36} weight={900}>
              £40 млн
            </Txt>
            <Txt x={1420} y={822} size={28} color={C.inkSoft}>
              оценка
            </Txt>
            {grow > 0 && (
              <g>
                <rect x={1620} y={780 - 431 * grow} width={160} height={431 * grow} rx={10} fill={C.red} stroke={OL} strokeWidth={4} />
                <Txt x={1700} y={780 - 431 * grow - 20} size={40} weight={900} color={C.red}>
                  {`≈ £${money} млн`}
                </Txt>
                <Txt x={1700} y={822} size={28} color={C.inkSoft}>
                  итог
                </Txt>
              </g>
            )}
            <Arrow x1={1510} y1={700} x2={1600} y2={500} k={ramp(t, at(c, 3.5), 0.6)} color={C.inkSoft} w={7} bend={0.15} />
          </g>
        </Pop>
      </Phase>
    </g>
  );
};

// ───────────── k27: взгляд извне и премортем ─────────────

const STEPS = [
  { n: "1", a: "похожие", b: "случаи" },
  { n: "2", a: "их", b: "статистика" },
  { n: "3", a: "поправка", b: "на себя" },
];

const CAUSES = ["сроки сорвались", "бюджет кончился", "клиенты не пришли", "все молчали"];

export const Premortem: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const o1 = phase(t, null, at(c, 2));
  const o2 = phase(t, at(c, 2) - 0.1, at(c, 3));
  const o3 = phase(t, at(c, 3) - 0.1, null);
  const fade = ramp(t, at(c, 1.4), 1.2);
  const bandK = ramp(t, at(c, 2.15), 0.8);
  return (
    <g>
      <Phase o={o1}>
        <Pop t={t} at={0.3} x={700} y={140}>
          <Head x={0} y={0} size={44}>
            взгляд извне
          </Head>
        </Pop>
        {STEPS.map((s, i) => (
          <Pop key={s.n} t={t} at={at(c, 0.2 + i * 0.25)} x={250 + i * 450} y={270}>
            <g>
              <Panel x={-180} y={-80} w={360} h={160} r={28} />
              <circle cx={-118} cy={0} r={40} fill={[S2.main, C.violet, C.green][i]} />
              <Txt x={-118} y={16} size={44} weight={900} color="#fff">
                {s.n}
              </Txt>
              <Txt x={40} y={-8} size={32}>
                {s.a}
              </Txt>
              <Txt x={40} y={32} size={32}>
                {s.b}
              </Txt>
            </g>
          </Pop>
        ))}
        {[0, 1].map((i) => (
          <Arrow key={i} x1={440 + i * 450} y1={270} x2={510 + i * 450} y2={270} k={ramp(t, at(c, 0.4 + i * 0.25), 0.4)} color={C.inkSoft} w={8} />
        ))}
        {/* 100 фирм → 35 */}
        <Pop t={t} at={at(c, 1)} x={330} y={420}>
          <Txt x={0} y={0} size={32}>
            100 малых фирм → 5 лет
          </Txt>
        </Pop>
        {Array.from({ length: 100 }).map((_, i) => {
          const r = Math.floor(i / 10);
          const col = i % 10;
          const k = pop(t, at(c, 1.05) + ((r * 3 + col) % 13) * 0.03);
          const dead = i >= 35;
          return <Dot key={i} x={130 + col * 50} y={492 + r * 41} r={14} color={dead && fade > 0 ? interpolateColor(fade) : C.green} k={k} />;
        })}
        <Pop t={t} at={at(c, 1.5)} x={0} y={0}>
          <g>
            <Panel x={700} y={420} w={620} h={400} r={30} />
            <Txt x={740} y={490} size={32} anchor="start">
              выживают 5 лет
            </Txt>
            <rect x={740} y={510} width={540} height={50} rx={14} fill="#e3e6ef" />
            <rect x={740} y={510} width={540 * 0.35 * ramp(t, at(c, 1.55), 0.8)} height={50} rx={14} fill={C.green} />
            <Txt x={1280} y={490} size={40} weight={900} anchor="end" color={C.greenDeep}>
              35%
            </Txt>
            <Txt x={740} y={640} size={32} anchor="start">
              верят: шансы 7 из 10+
            </Txt>
            <rect x={740} y={660} width={540} height={50} rx={14} fill="#e3e6ef" />
            <rect x={740} y={660} width={540 * 0.81 * ramp(t, at(c, 1.75), 0.8)} height={50} rx={14} fill={S1.main} />
            <Txt x={1280} y={640} size={40} weight={900} anchor="end" color={S1.deep}>
              81%
            </Txt>
            <Txt x={1010} y={780} size={30} color={C.inkSoft}>
              оптимизм ≠ статистика
            </Txt>
          </g>
        </Pop>
      </Phase>

      <Phase o={o2}>
        <Pop t={t} at={at(c, 2)} x={700} y={150}>
          <Head x={0} y={0} size={42}>
            прогнозы финансовых директоров
          </Head>
        </Pop>
        <g transform="translate(0 0)">
          <Panel x={90} y={200} w={1220} h={420} r={30} />
          {/* уверенная узкая полоса */}
          {bandK > 0 && (
            <g>
              <rect x={140} y={385} width={1120 * bandK} height={70} rx={20} fill={S2.light} stroke={S2.main} strokeWidth={4} />
              <line x1={140} x2={140 + 1120 * bandK} y1={420} y2={420} stroke={S2.main} strokeWidth={4} strokeDasharray="14 10" />
            </g>
          )}
          {bandK > 0.9 && (
            <Txt x={700} y={370} size={28} color={S2.deep}>
              «уверенные рамки»
            </Txt>
          )}
          {[
            [200, 300],
            [290, 430],
            [380, 520],
            [470, 270],
            [560, 410],
            [650, 560],
            [740, 330],
            [830, 500],
            [920, 260],
            [1010, 440],
            [1100, 545],
            [1190, 290],
          ].map(([x, y], i) => {
            const k = pop(t, at(c, 2.35) + i * 0.05);
            const out = y < 385 || y > 455;
            return k > 0 ? <circle key={i} cx={x} cy={y} r={15 * k} fill={out ? C.red : C.green} stroke={OL} strokeWidth={3} /> : null;
          })}
        </g>
        <Pop t={t} at={at(c, 2.6)} x={0} y={0}>
          <g>
            <Panel x={150} y={660} w={480} h={170} r={28} />
            <Txt x={390} y={720} size={30} color={C.inkSoft}>
              ждали сюрпризов
            </Txt>
            <Txt x={390} y={796} size={64} weight={900} color={C.inkSoft}>
              20%
            </Txt>
            <Panel x={770} y={660} w={480} h={170} r={28} />
            <Txt x={1010} y={720} size={30} color={C.inkSoft}>
              вышло на деле
            </Txt>
            <Txt x={1010} y={796} size={64} weight={900} color={C.red}>
              67%
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 2.8)} x={700} y={745}>
          <Tag x={0} y={0} text="×3" color={C.yellow} size={40} />
        </Pop>
      </Phase>

      <Phase o={o3}>
        {/* газета из будущего */}
        <Pop t={t} at={at(c, 3.15)} x={340} y={400}>
          <g transform={`rotate(${-3 + wob(t, 1, 0.6)})`}>
            <rect x={-260} y={-270} width={520} height={540} rx={10} fill="#fbfaf5" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-212} size={30} color={C.inkSoft}>
              ГАЗЕТА · через год
            </Txt>
            <line x1={-230} x2={230} y1={-190} y2={-190} stroke={OL} strokeWidth={4} />
            <text x={0} y={-80} textAnchor="middle" fontFamily="Rubik" fontWeight={900} fontSize={110} fill={C.red}>
              ПРОВАЛ
            </text>
            <rect x={-230} y={-30} width={200} height={140} fill="#dfe3ec" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={0} x2={230} y1={-20 + i * 32} y2={-20 + i * 32} stroke="#c4cad8" strokeWidth={10} strokeLinecap="round" />
            ))}
            {[0, 1, 2].map((i) => (
              <line key={i} x1={-230} x2={230 - i * 60} y1={150 + i * 34} y2={150 + i * 34} stroke="#c4cad8" strokeWidth={10} strokeLinecap="round" />
            ))}
          </g>
        </Pop>
        {[0, 1, 2].map((i) => (
          <Pop key={i} t={t} at={at(c, 3.4) + i * 0.1} x={190 + i * 150} y={800}>
            <g>
              <Person x={0} y={0} s={0.7} color={["#9bb8ff", "#ffad7a", "#7fd1ae"][i]} t={t + i} arms={0.4 + 0.2 * Math.sin(t * 6 + i)} />
            </g>
          </Pop>
        ))}
        <Pop t={t} at={at(c, 3.45)} x={1000} y={160}>
          <Head x={0} y={0} size={40}>
            почему так вышло?
          </Head>
        </Pop>
        {CAUSES.map((cs, i) => {
          const col = i % 2;
          const r = Math.floor(i / 2);
          return (
            <Pop key={cs} t={t} at={at(c, 3.6) + i * 0.1} x={835 + col * 330} y={290 + r * 170}>
              <g transform={`rotate(${[-3, 2, 3, -2][i]})`}>
                <rect x={-155} y={-62} width={310} height={124} rx={12} fill={["#fff59d", "#ffd6e0", "#d6e6ff", "#c8f2d8"][i]} stroke={OL} strokeWidth={3} />
                <Txt x={0} y={11} size={29}>
                  {cs}
                </Txt>
                <g transform="translate(136 -48)">
                  <circle r={22} fill="#fff" stroke={OL} strokeWidth={3} opacity={ramp(t, at(c, 4.4), 0.4)} />
                  <Check x={0} y={2} s={22} k={ramp(t, at(c, 4.4) + i * 0.08, 0.4)} />
                </g>
              </g>
            </Pop>
          );
        })}
        <Pop t={t} at={at(c, 4.05)} x={1000} y={710}>
          <Tag x={0} y={0} text="можно сомневаться вслух" color={C.yellow} size={40} />
        </Pop>
        <Pop t={t} at={at(c, 4.4)} x={1000} y={810}>
          <Txt x={0} y={0} size={30} color={C.inkSoft}>
            скрытые риски видны
          </Txt>
        </Pop>
      </Phase>
    </g>
  );
};

// зелёный → бледно-серый (для «не выжили»)
function interpolateColor(k: number) {
  const a = [0x3f, 0xb6, 0x7c];
  const b = [0xc6, 0xcb, 0xd9];
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * clamp01(k)));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}
