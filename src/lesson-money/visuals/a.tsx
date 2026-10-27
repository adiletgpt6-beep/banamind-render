// Схемы группы a (сцены s01–s13): крючок, книга, монеты «блинчиком», формула и чувства,
// крошечная точка опыта, разные очки поколений, «мы новички», альбом воспоминаний,
// воронка удачи и её зеркало, монетка судьбы, шкала «ужасно — прекрасно».
// Всё зависит только от времени сцены (c.t) и начала реплик (at).
import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../theme";
import { Book, Bubble, Glasses, Heart, OL, Person, Sprout, Sun, Worker } from "./draw";
import { Bill, Coin, CoinStack, Cottage, Key, LineChart, Mansion, Scales, Wad, Watch } from "./props";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, zoneX, type VisualProps } from "./kit";

// ───────────── общие мелочи ─────────────
const rnd = (i: number, k = 1) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};
// видимость фазы: проявляется к a, исчезает к b
const phase = (t: number, a: number, b = 1e9) => ramp(t, a - 0.25, 0.5) * (1 - ramp(t, b - 0.25, 0.5));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const Broom: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-5} y={-190} width={10} height={190} rx={4} fill={C.wood} stroke={OL} strokeWidth={3} />
    <path d="M -30 -4 L 30 -4 L 42 46 L -42 46 Z" fill="#e8c96a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    {[-26, -9, 9, 26].map((d) => (
      <path key={d} d={`M ${d} 8 L ${d * 1.3} 42`} stroke="#b5893f" strokeWidth={3} />
    ))}
  </g>
);

// шапочка выпускника; (x, y) — макушка
const GradCap: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-24} y={-6} width={48} height={20} rx={4} fill={C.ink} />
    <path d="M -54 -8 L 0 -30 L 54 -8 L 0 14 Z" fill={C.ink} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 40 -6 L 46 30" stroke={C.yellow} strokeWidth={4} />
    <circle cx={46} cy={32} r={6} fill={C.yellow} />
  </g>
);

const Brain: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -62 8 Q -84 -40 -42 -60 Q -12 -88 20 -64 Q 70 -78 76 -26 Q 98 18 52 40 Q 0 62 -40 46 Q -78 40 -62 8 Z" fill={C.pink} stroke={OL} strokeWidth={4} />
    <path d="M -38 -30 q 20 -12 30 8 q 12 20 36 4 M -34 16 q 22 -14 44 0 M 2 -60 q -6 20 8 34" stroke="#d45b82" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

// облачко (мысли / погоды)
const Cloud: React.FC<{ x: number; y: number; s?: number; fill?: string; stroke?: string }> = ({ x, y, s = 1, fill = "#fff", stroke = OL }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -90 30 Q -120 30 -116 0 Q -112 -30 -80 -26 Q -76 -66 -34 -64 Q -14 -96 26 -80 Q 62 -96 78 -56 Q 118 -54 114 -16 Q 126 30 86 30 Z" fill={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

const Bolt: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.yellow }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 8 -40 L -20 6 L 0 6 L -10 44 L 24 -6 L 4 -6 Z" fill={color} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
);

const Star: React.FC<{ x: number; y: number; r?: number; color?: string; rot?: number }> = ({ x, y, r = 40, color = C.yellow, rot = 0 }) => {
  const pts = Array.from({ length: 10 })
    .map((_, i) => {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      return `${Math.cos(a) * rr} ${Math.sin(a) * rr}`;
    })
    .join(" L ");
  return <path transform={`translate(${x} ${y}) rotate(${rot})`} d={`M ${pts} Z`} fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" />;
};

const Clover: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 10 Q 10 50 30 70" stroke={C.greenDeep} strokeWidth={7} fill="none" strokeLinecap="round" />
    {[0, 90, 180, 270].map((a) => (
      <g key={a} transform={`rotate(${a + 45})`}>
        <path d="M 0 0 C -30 -20 -30 -56 -8 -56 Q 0 -56 0 -44 Q 0 -56 8 -56 C 30 -56 30 -20 0 0 Z" fill={C.green} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      </g>
    ))}
    <circle r={7} fill={C.greenDeep} />
  </g>
);

// маленький банан (сам ведущий в миниатюре)
const MiniBanana: React.FC<{ x: number; y: number; s?: number; t?: number; rot?: number }> = ({ x, y, s = 1, t = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot + Math.sin(t * 2) * 3}) scale(${s})`}>
    <rect x={-9} y={-178} width={18} height={36} rx={5} fill="#7a5a20" stroke={OL} strokeWidth={4} />
    <ellipse cx={0} cy={0} rx={72} ry={150} fill={C.yellow} stroke={OL} strokeWidth={5} />
    <path d="M 40 -110 Q 64 0 36 110" stroke={C.yellowDeep} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
    <circle cx={-22} cy={-34} r={17} fill="#fff" stroke={OL} strokeWidth={4} />
    <circle cx={22} cy={-34} r={17} fill="#fff" stroke={OL} strokeWidth={4} />
    <circle cx={-18} cy={-32} r={7} fill={OL} />
    <circle cx={26} cy={-32} r={7} fill={OL} />
    <path d="M -24 6 Q 0 30 24 6" stroke={OL} strokeWidth={5} fill="#c0392b" strokeLinecap="round" />
    <circle cx={-46} cy={0} r={9} fill={C.coral} opacity={0.5} />
    <circle cx={46} cy={0} r={9} fill={C.coral} opacity={0.5} />
  </g>
);

// старый компьютерный терминал с бумажной лентой
const Terminal: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-40} width={240} height={110} rx={12} fill="#d9d2c0" stroke={OL} strokeWidth={5} />
    <rect x={-96} y={-20} width={192} height={36} rx={6} fill="#bdb5a1" stroke={OL} strokeWidth={3} />
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={-88 + i * 22} y={-14} width={16} height={12} rx={3} fill="#f4efe2" />
    ))}
    <rect x={-100} y={-190} width={200} height={150} rx={14} fill="#c9c1ad" stroke={OL} strokeWidth={5} />
    <rect x={-80} y={-172} width={160} height={110} rx={10} fill="#123524" stroke={OL} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-66} y={-160 + i * 24} width={(40 + ((i * 37) % 70)) * clamp01(((t * 0.9 + i * 0.25) % 1.4) * 1.6)} height={10} rx={4} fill="#5cf08e" opacity={0.9} />
    ))}
    <rect x={-60} y={70} width={120} height={50} fill={C.wood} stroke={OL} strokeWidth={4} />
  </g>
);

// школа
const School: React.FC<{ x: number; y: number; s?: number; name?: string }> = ({ x, y, s = 1, name }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-230} y={-200} width={460} height={200} fill="#e9b48a" stroke={OL} strokeWidth={5} />
    <path d="M -260 -200 L 0 -300 L 260 -200 Z" fill={C.navy} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {[-170, -100, 100, 170].map((wx) =>
      [-160, -90].map((wy) => <rect key={`${wx}${wy}`} x={wx - 22} y={wy} width={44} height={46} rx={4} fill="#bfe6ff" stroke={OL} strokeWidth={4} />),
    )}
    <rect x={-40} y={-100} width={80} height={100} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} />
    <rect x={-4} y={-380} width={8} height={90} fill={OL} />
    <path d="M 4 -378 L 74 -362 L 4 -344 Z" fill={C.coral} stroke={OL} strokeWidth={3} />
    {name && (
      <g transform="translate(0 -230)">
        <rect x={-130} y={-28} width={260} height={50} rx={10} fill="#fff" stroke={OL} strokeWidth={3} />
        <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>
          {name}
        </text>
      </g>
    )}
  </g>
);

// ═════════════ s01 · два пути: уборщик и банкир ═════════════
export const TwoFates: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const L = pop(t, 0.15);
  const R = pop(t, at(c, 0.42));
  const q = pop(t, at(c, 1.02));
  const fill = clamp01((t - at(c, 1)) / Math.max(0.1, at(c, 2.35) - at(c, 1)));
  const reveal = ramp(t, at(c, 2.02), 0.6);
  const crack = ramp(t, at(c, 2.42), 1.1);
  const sold = pop(t, at(c, 2.62));
  const words = [pop(t, at(c, 2.72)), pop(t, at(c, 2.86))];
  const jarX = 505;
  const jarY = 650;
  return (
    <g transform="translate(620 780) scale(1.1) translate(-620 -780)">
      {/* разделитель */}
      <path d="M 655 170 L 655 820" stroke={C.inkSoft} strokeWidth={5} strokeDasharray="14 16" opacity={0.35 * R} />
      {/* слева: скромная жизнь */}
      <g transform={`translate(${(1 - L) * -90} 0)`} opacity={clamp01(L * 1.5)}>
        <ellipse cx={360} cy={712} rx={300} ry={26} fill="#c9a86a" opacity={0.35} />
        <Cottage x={310} y={590} s={0.78} glow={reveal} />
        <Worker x={140} y={700} s={1.25} role="janitor" t={t} arms={0.2} mood={reveal > 0.5 ? "smile" : "flat"} />
        <Broom x={205} y={735} s={0.95} rot={-14 + Math.sin(t * 3.2) * 9} />
        {/* монетки падают в банку */}
        {fill > 0 &&
          fill < 1 &&
          [0, 1, 2].map((i) => {
            const p = (t * 0.85 + i / 3) % 1;
            return <Coin key={i} x={jarX + (i - 1) * 24} y={lerp(jarY - 300, jarY - 70, p)} s={0.5} spin={Math.cos(t * 6 + i)} rot={p * 90} />;
          })}
        <g transform={`translate(${jarX} ${jarY}) scale(${1 + 0.06 * reveal * Math.sin(t * 4)})`}>
          <JarSmall level={0.08 + 0.86 * fill} t={t} />
        </g>
        <Pop t={t} at={at(c, 2.08)} x={jarX} y={400}>
          <rect x={-150} y={-42} width={300} height={70} rx={14} fill={C.money} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={8} size={42} color="#fff" weight={900}>
            8 000 000 $
          </Txt>
        </Pop>
        <Pop t={t} at={0.35} x={330} y={190}>
          <Tag x={0} y={0} text="уборщик" color={C.teal} textColor="#fff" size={42} />
        </Pop>
      </g>
      {/* справа: блестящая карьера */}
      <g transform={`translate(${(1 - R) * 90} 0)`} opacity={clamp01(R * 1.5)}>
        <ellipse cx={940} cy={712} rx={300} ry={26} fill="#c9a86a" opacity={0.35} />
        <g transform={`translate(${crack * Math.sin(t * 30) * 3 * (1 - sold)} 0)`}>
          <Mansion x={975} y={600} s={0.74} crack={crack} sold={sold} />
        </g>
        <rect x={1000} y={630} width={170} height={56} rx={26} fill="#7fd1f5" stroke={OL} strokeWidth={4} />
        <path d={`M 1018 652 q 20 ${-8 + Math.sin(t * 3) * 4} 40 0 t 40 0 t 40 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.8} />
        <Worker x={760} y={700} s={1.25} role="boss" t={t} mood={crack > 0.3 ? "sad" : "smile"} arms={crack > 0.3 ? 0 : 0.4} />
        <GradCap x={760} y={700 - 140 * 1.25 + 2} s={1.1} />
        <Pop t={t} at={at(c, 0.5)} x={930} y={190}>
          <Tag x={0} y={0} text="банкир" color={C.navy} textColor="#fff" size={42} />
        </Pop>
      </g>
      {/* вопрос */}
      {q > 0.01 && (
        <g transform={`translate(655 ${420 + wob(t, 1, 6)}) scale(${q})`} opacity={1 - reveal}>
          <circle r={74} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={34} size={100} weight={900}>
            ?
          </Txt>
        </g>
      )}
      {/* итог */}
      {words[0] > 0.01 && (
        <g transform={`translate(330 805) scale(${words[0]})`}>
          <Tag x={0} y={0} text="терпение" color={C.green} textColor="#fff" size={42} />
        </g>
      )}
      {words[1] > 0.01 && (
        <g transform={`translate(940 805) scale(${words[1]})`}>
          <Tag x={0} y={0} text="жадность" color={C.red} textColor="#fff" size={42} />
        </g>
      )}
    </g>
  );
};

// банка без подписи (props.Jar рисует clipPath с id по координатам — здесь рисуем в 0,0)
const JarSmall: React.FC<{ level: number; t: number }> = ({ level, t }) => (
  <g transform="scale(0.8)">
    <Jarish level={level} t={t} />
  </g>
);
const Jarish: React.FC<{ level: number; t: number }> = ({ level, t }) => {
  const lv = clamp01(level);
  const top = 100 - lv * 210;
  return (
    <g>
      <defs>
        <clipPath id="twoFates-jar">
          <path d="M -90 -120 Q -100 -110 -100 -90 L -100 100 Q -100 120 -80 120 L 80 120 Q 100 120 100 100 L 100 -90 Q 100 -110 90 -120 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#twoFates-jar)">
        <rect x={-110} y={-130} width={220} height={260} fill="#eaf7ff" />
        <path d={`M -110 ${top} Q -50 ${top - 8 + Math.sin(t * 2) * 4} 0 ${top} T 110 ${top} L 110 130 L -110 130 Z`} fill={C.gold} />
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse key={i} cx={-70 + (i % 4) * 46 + (Math.floor(i / 4) % 2) * 20} cy={Math.max(top + 16, 104 - Math.floor(i / 4) * 34)} rx={20} ry={7} fill="#c9952a" opacity={0.6} />
        ))}
      </g>
      <path d="M -90 -120 Q -100 -110 -100 -90 L -100 100 Q -100 120 -80 120 L 80 120 Q 100 120 100 100 L 100 -90 Q 100 -110 90 -120 Z" fill="none" stroke={OL} strokeWidth={5} />
      <rect x={-96} y={-148} width={192} height={34} rx={10} fill={C.wood} stroke={OL} strokeWidth={5} />
      <path d="M -70 -90 L -70 60" stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.5} />
    </g>
  );
};

// ═════════════ s02 · три вопроса книги ═════════════
const QCard: React.FC<{ k: number; small: number; x: number; y: number; title: string; children: React.ReactNode }> = ({ k, small, x, y, title, children }) => {
  if (k <= 0.001) return null;
  const s = 0.86 - small * 0.43;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * k)})`} opacity={clamp01(k * 1.6)}>
      <Panel x={-380} y={-300} w={760} h={560} fill="#fffdf6" r={40} />
      <g>{children}</g>
      <rect x={-350} y={150} width={700} height={84} rx={42} fill={C.yellow} />
      <Txt x={0} y={207} size={44} weight={900}>
        {title}
      </Txt>
    </g>
  );
};

export const Teaser: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const k = [0, 1, 2].map((i) => pop(t, at(c, i) + 0.05));
  const sm = [0, 1, 2].map((i) => (i < 2 ? ramp(t, at(c, i + 1) - 0.25, 0.55) : 0));
  const pos = (i: number) => {
    const m = sm[i];
    return { x: interpolate(m, [0, 1], [cx, cx - 380 + i * 380]), y: interpolate(m, [0, 1], [585, 200]) };
  };
  const t0 = at(c, 0) + 0.6;
  const morph = ramp(t, at(c, 2.45), 0.8);
  const tilt = Math.sin(t * 1.4) * 0.55;
  return (
    <g>
      <QCard k={k[0]} small={sm[0]} {...pos(0)} title="гений без денег?">
        <rect x={-360} y={10} width={720} height={130} rx={20} fill="#7fd1f5" />
        {[0, 1].map((r) => (
          <path key={r} d={`M -360 ${30 + r * 50} ${Array.from({ length: 12 }).map((_, i) => `q 30 ${(i % 2 ? 1 : -1) * 10 + Math.sin(t * 2 + i + r) * 3} 60 0`).join(" ")}`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.7} />
        ))}
        <Worker x={-280} y={40} s={0.95} role="boss" t={t} arms={0.6} />
        <g transform={`translate(-280 ${-150 + wob(t, 2, 4)})`}>
          <circle r={34} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <rect x={-14} y={30} width={28} height={18} rx={4} fill={C.grey} stroke={OL} strokeWidth={3} />
        </g>
        {[0, 1, 2].map((i) => {
          const p = ((t - t0) * 0.42 + i * 0.33) % 1;
          if (t < t0 + i * 0.8) return null;
          const sink = clamp01((p - 0.82) / 0.18);
          const h = 150 * (1 - p) * Math.abs(Math.sin(p * Math.PI * 3.6));
          return <Coin key={i} x={-220 + p * 520} y={30 - h + sink * 60} s={0.55} spin={Math.cos(t * 9 + i)} rot={0} />;
        })}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={-80 + i * 130} cy={40} rx={30 + ((t * 30 + i * 20) % 30)} ry={8} fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />
        ))}
      </QCard>
      <QCard k={k[1]} small={sm[1]} {...pos(1)} title="самое трудное слово?">
        <Scales x={0} y={-150} s={0.62} tilt={tilt} left={<CoinStack x={0} y={-6} n={7} s={0.9} />} right={<Heart x={0} y={-40} s={1.5} color={C.coral} />} />
        <g transform={`translate(0 ${-10 + wob(t, 1, 3)})`}>
          <rect x={-170} y={-40} width={340} height={70} rx={14} fill={C.green} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={10} size={38} color="#fff" weight={900}>
            ДОСТАТОЧНО
          </Txt>
        </g>
      </QCard>
      <QCard k={k[2]} small={sm[2]} {...pos(2)} title="что покупают деньги?">
        <g opacity={1 - morph * 0.85}>
          <g transform="translate(-255 -165) scale(0.5)">
            <CarMini t={t} />
          </g>
          <Cross x={-255} y={-185} s={90} k={ramp(t, at(c, 2.25), 0.5)} />
          <Mansion x={255} y={-100} s={0.36} />
          <Cross x={255} y={-160} s={90} k={ramp(t, at(c, 2.35), 0.5)} />
        </g>
        <g transform={`translate(0 -80) rotate(${(1 - morph) * 0 + morph * wob(t, 3, 5)})`}>
          <g opacity={1 - morph} transform={`scale(${1.25 - morph * 0.6})`}>
            <Watch x={0} y={0} a={t * 30} />
          </g>
          {morph > 0.01 && (
            <g transform={`rotate(${(1 - morph) * -120}) scale(${morph * 1.35})`}>
              <circle r={120} fill={C.yellow} opacity={0.25 + 0.15 * Math.sin(t * 3)} />
              <Key x={10} y={0} />
            </g>
          )}
        </g>
      </QCard>
    </g>
  );
};

const CarMini: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M -200 20 L -190 -30 Q -180 -50 -150 -54 L -90 -60 L -40 -110 Q -20 -124 20 -124 L 90 -124 Q 120 -124 140 -100 L 175 -60 Q 205 -54 210 -30 L 214 20 Z" fill={C.red} stroke={OL} strokeWidth={8} strokeLinejoin="round" />
    {[-120, 130].map((wx) => (
      <g key={wx} transform={`translate(${wx} 22) rotate(${t * 100})`}>
        <circle r={44} fill="#2b2b3a" stroke={OL} strokeWidth={6} />
        <circle r={18} fill="#c9d3e0" />
      </g>
    ))}
  </g>
);

// ═════════════ s03 · ведущий и книга ═════════════
const MoneyBook: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-142} y={-196} width={300} height={410} rx={16} fill="#000" opacity={0.12} />
    <rect x={-150} y={-210} width={300} height={410} rx={16} fill={C.moneyDeep} stroke={OL} strokeWidth={6} />
    <rect x={-150} y={-210} width={26} height={410} rx={8} fill="#000" opacity={0.18} />
    <rect x={-112} y={-180} width={242} height={6} fill={C.gold} />
    <text x={9} y={-118} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">
      Психология
    </text>
    <text x={9} y={-68} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.gold}>
      денег
    </text>
    <g transform="translate(9 50)">
      <circle r={62} fill={C.gold} stroke={OL} strokeWidth={5} />
      <circle r={46} fill="none" stroke="#c9952a" strokeWidth={5} />
      <Brain x={0} y={8} s={0.5} />
    </g>
    <text x={9} y={168} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff">
      Морган Хаузел
    </text>
  </g>
);

export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const logo = pop(t, 0.2);
  const up = ramp(t, at(c, 1) - 0.1, 0.8);
  const book = pop(t, at(c, 1) + 0.3);
  const fanK = (i: number) => ramp(t, at(c, 1.42) + i * 0.08, 0.35);
  const fanOut = ramp(t, at(c, 2) - 0.2, 0.5);
  const formula = phase(t, at(c, 2.1), at(c, 3));
  const advice = phase(t, at(c, 2.15), at(c, 3.4));
  const icon = (i: number) => pop(t, at(c, 3.12 + i * 0.12));
  const COLS = [C.coral, C.sky, C.yellow, C.violet, C.green, C.orange, C.pink, C.teal];
  return (
    <g>
      {/* логотип BanaMind */}
      {logo > 0.01 && (
        <g transform={`translate(1190 ${lerp(430, 150, up)}) scale(${(1 - 0.48 * up) * (0.7 + 0.3 * logo)})`} opacity={clamp01(logo * 1.5)}>
          <circle r={330} fill={C.yellow} opacity={0.18 * (1 - up)} />
          <Panel x={-440} y={-150} w={900} h={300} r={60} />
          <MiniBanana x={-300} y={10} s={0.72} t={t} rot={-8} />
          <text x={-190} y={8} fontFamily={FONT} fontWeight={900} fontSize={104} fill={C.ink}>
            Bana<tspan fill={C.yellowDeep}>Mind</tspan>
          </text>
          <Txt x={-190} y={76} size={34} anchor="start" color={C.inkSoft} weight={800}>
            большие идеи простыми словами
          </Txt>
        </g>
      )}
      {/* книга */}
      {book > 0.01 && (
        <g transform={`translate(0 ${(1 - book) * 80})`} opacity={clamp01(book * 1.5)}>
          <MoneyBook x={900} y={540 + wob(t, 0, 5)} s={0.95 * (0.8 + 0.2 * book)} rot={-4 + wob(t, 1, 1.5)} />
        </g>
      )}
      {/* веер из 20 глав */}
      <g opacity={1 - fanOut}>
        {Array.from({ length: 20 }).map((_, i) => {
          const k = fanK(i);
          if (k <= 0.01) return null;
          const a = interpolate(i, [0, 19], [-62, 62]) * k;
          return (
            <g key={i} transform={`translate(1480 690) rotate(${a})`} opacity={k}>
              <rect x={-38} y={-290} width={76} height={110} rx={10} fill={COLS[i % COLS.length]} stroke={OL} strokeWidth={3} />
              <rect x={-24} y={-270} width={48} height={8} rx={4} fill="#fff" opacity={0.8} />
              <rect x={-24} y={-252} width={34} height={8} rx={4} fill="#fff" opacity={0.6} />
            </g>
          );
        })}
        <Pop t={t} at={at(c, 1.5)} x={1480} y={740}>
          <Txt x={0} y={0} size={54} weight={900}>
            20 глав
          </Txt>
        </Pop>
      </g>
      {/* «не формулы» */}
      {formula > 0.01 && (
        <g opacity={formula} transform={`translate(1480 470) rotate(${wob(t, 2, 2)})`}>
          <Panel x={-220} y={-120} w={440} h={240} fill="#2b3a67" r={26} />
          <Txt x={0} y={-20} size={50} color="#fff">
            {"x² + y = $"}
          </Txt>
          <Txt x={0} y={60} size={44} color="#bfe6ff">
            {"∑ (a · b) ÷ c"}
          </Txt>
          <Cross x={0} y={0} s={200} k={ramp(t, at(c, 2.7), 0.6)} />
        </g>
      )}
      {advice > 0.01 && (
        <g opacity={advice} transform={`translate(1190 ${800 + (1 - advice) * 30})`}>
          <Tag x={0} y={0} text="разбор идей, не финансовый совет" color={C.coral} textColor="#fff" size={38} />
        </g>
      )}
      {/* терпение, страх, зависть */}
      {[
        { x: 1240, label: "терпение", color: "#d8f3e3" },
        { x: 1470, label: "страх", color: "#dfe3f5" },
        { x: 1700, label: "зависть", color: "#fde4cf" },
      ].map((it, i) => {
        const k = icon(i);
        if (k <= 0.01) return null;
        return (
          <g key={i} transform={`translate(${it.x} ${500 + wob(t, i, 6)}) scale(${k})`}>
            <circle r={100} fill={it.color} stroke={OL} strokeWidth={5} />
            {i === 0 && <Sprout x={0} y={60} s={1} grow={clamp01((t - at(c, 3.2)) / 2.5)} t={t} color={C.yellow} />}
            {i === 1 && (
              <g>
                <Cloud x={0} y={0} s={0.62} fill="#8d97b5" />
                <Bolt x={4} y={42} s={0.9} />
              </g>
            )}
            {i === 2 && (
              <g>
                {[-28, 28].map((ex) => (
                  <g key={ex}>
                    <ellipse cx={ex} cy={-20} rx={24} ry={18} fill="#fff" stroke={OL} strokeWidth={4} />
                    <circle cx={ex + 10 + Math.sin(t * 1.5) * 4} cy={-18} r={10} fill={C.green} stroke={OL} strokeWidth={2} />
                  </g>
                ))}
                <Coin x={40} y={46} s={0.6} spin={Math.cos(t * 3)} />
              </g>
            )}
            <Txt x={0} y={160} size={40} weight={900}>
              {it.label}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ═════════════ s04 · монеты «блинчиком» ═════════════
const Pocket: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -200 -170 L 200 -170 L 220 200 L 30 200 L 0 -20 L -30 200 L -220 200 Z" fill="#5873b8" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-200} y={-200} width={400} height={44} rx={8} fill="#4a63a2" stroke={OL} strokeWidth={5} />
    {/* вывернутые карманы */}
    {[-1, 1].map((d) => (
      <g key={d} transform={`translate(${d * 205} -120) rotate(${d * (8 + Math.sin(t * 2.4 + d) * 6)})`}>
        <path d={`M 0 0 Q ${d * 70} 10 ${d * 66} 90 Q ${d * 30} 120 0 80 Z`} fill="#f2ede1" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      </g>
    ))}
    {/* моль */}
    <g transform={`translate(${Math.sin(t * 1.3) * 80} ${-260 + Math.sin(t * 2.2) * 20})`}>
      <ellipse rx={8} ry={16} fill="#9b8f7a" />
      <path d={`M 0 -4 Q -34 ${-30 + Math.sin(t * 14) * 10} -30 6 Z M 0 -4 Q 34 ${-30 + Math.sin(t * 14) * 10} 30 6 Z`} fill="#cfc4ae" stroke={OL} strokeWidth={2} />
    </g>
  </g>
);

export const CoinSkip: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const p1 = phase(t, -1, at(c, 1));
  const p2 = phase(t, at(c, 1), at(c, 3));
  const p3 = phase(t, at(c, 3), at(c, 4));
  const p4 = phase(t, at(c, 4));
  const seaK = clamp01(pop(t, 0.1)) * (1 - p4 * 0.85);
  const wadGone = ramp(t, at(c, 2) - 0.1, 0.6);
  const waves = (y0: number, amp: number, sp: number, ph: number) => {
    const pts: string[] = [];
    for (let x = 80; x <= 1300; x += 30) pts.push(`L ${x} ${y0 + Math.sin(x * 0.018 + t * sp + ph) * amp}`);
    return `M 80 ${y0} ${pts.join(" ")} L 1300 850 L 80 850 Z`;
  };
  const coinStart = at(c, 2) + 0.4;
  return (
    <g>
      {/* набережная и океан */}
      <g opacity={seaK}>
        <rect x={80} y={660} width={1220} height={70} fill="#e8d6b0" />
        <path d={waves(735, 9, 1.6, 0)} fill="#6cc5f0" />
        <path d={waves(770, 8, -1.2, 2)} fill="#4aa8dc" />
        <path d={waves(810, 7, 1.9, 4)} fill="#2f8fd0" opacity={0.9} />
      </g>
      {/* 1 · отель и мойка машин */}
      {p1 > 0.01 && (
        <g opacity={p1}>
          <g transform="translate(300 680)">
            <rect x={-150} y={-420} width={300} height={420} rx={10} fill="#f6e3c4" stroke={OL} strokeWidth={5} />
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={-120 + (i % 3) * 90} y={-370 + Math.floor(i / 3) * 80} width={60} height={50} rx={6} fill={(i * 7) % 5 === 0 ? "#ffe58a" : "#bfe6ff"} stroke={OL} strokeWidth={3} />
            ))}
            <rect x={-100} y={-470} width={200} height={56} rx={10} fill={C.coral} stroke={OL} strokeWidth={4} />
            <text y={-430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#fff">
              ОТЕЛЬ
            </text>
          </g>
          <g transform={`translate(520 680) rotate(${Math.sin(t * 1.2) * 2})`}>
            <path d="M -8 0 Q -14 -150 8 -260 L 22 -260 Q 6 -150 14 0 Z" fill="#a57442" stroke={OL} strokeWidth={4} />
            {[-70, -20, 30, 80, 130].map((a, i) => (
              <path key={i} d="M 15 -260 Q 70 -300 130 -250 Q 70 -270 15 -255 Z" fill={C.green} stroke={OL} strokeWidth={3} transform={`rotate(${a + Math.sin(t * 1.5 + i) * 4} 15 -258)`} />
            ))}
          </g>
          <CarMiniBlue x={860} y={665} t={t} />
          <Worker x={1110} y={690} s={1.15} role="plain" color={C.skyDeep} t={t} arms={0.5 + Math.sin(t * 5) * 0.3} />
          <rect x={1030} y={570 + Math.sin(t * 5) * 14} width={40} height={28} rx={8} fill={C.yellow} stroke={OL} strokeWidth={3} />
          {Array.from({ length: 7 }).map((_, i) => {
            const k = (t * 0.45 + rnd(i)) % 1;
            return <circle key={i} cx={760 + rnd(i, 2) * 300 + Math.sin(t * 2 + i) * 10} cy={600 - k * 260} r={10 + rnd(i, 3) * 14} fill="#fff" stroke="#9fd6f3" strokeWidth={3} opacity={1 - k} />;
          })}
          <Pop t={t} at={at(c, 0.35)} x={760} y={175}>
            <Tag x={0} y={0} text="Лос-Анджелес, отель" color={C.skyDeep} textColor="#fff" size={42} />
          </Pop>
        </g>
      )}
      {/* 2 · гений с пачкой денег и монеты по волнам */}
      {p2 > 0.01 && (
        <g opacity={p2}>
          <Worker x={420} y={690} s={1.45} role="boss" t={t} arms={0.8} flip />
          <g opacity={1 - wadGone} transform={`translate(492 ${570 + Math.sin(t * 4) * 10}) rotate(${Math.sin(t * 4) * 12})`}>
            <Wad x={0} y={0} s={0.8} />
          </g>
          {[0, 1, 2].map((i) => (
            <path key={i} transform={`translate(492 520) rotate(${-50 + i * 50})`} d={`M 0 -60 L 0 ${-90 - Math.sin(t * 6 + i) * 8}`} stroke={C.yellowDeep} strokeWidth={6} strokeLinecap="round" opacity={(1 - wadGone) * (0.5 + 0.5 * Math.sin(t * 6 + i))} />
          ))}
          {/* пузырь «изобретатель» */}
          <Pop t={t} at={at(c, 1.15)} x={420} y={300}>
            <Bubble x={0} y={0} w={260} h={170} />
            <rect x={-70} y={-10} width={140} height={46} rx={12} fill={C.navy} stroke={OL} strokeWidth={4} />
            <path d="M -44 -10 L -54 -50 M 44 -10 L 54 -50" stroke={OL} strokeWidth={6} strokeLinecap="round" />
            {[1, 2, 3].map((r) => (
              <path key={r} d={`M ${-r * 14} ${-24 - r * 6} Q 0 ${-38 - r * 14} ${r * 14} ${-24 - r * 6}`} stroke={C.green} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.4 + 0.6 * clamp01(Math.sin(t * 4 - r))} />
            ))}
            {[-40, -15, 10].map((lx) => (
              <circle key={lx} cx={lx} cy={13} r={5} fill="#5cf08e" />
            ))}
          </Pop>
          {/* друзья-зрители */}
          {[150, 270].map((x, i) => (
            <g key={x}>
              <Worker x={x} y={690} s={1.05} role="plain" color={i ? C.violet : C.orange} t={t + i} arms={0.3} />
              <Txt x={x + 10} y={500 + wob(t, i, 6)} size={50} color={C.red} weight={900}>
                !
              </Txt>
            </g>
          ))}
          <Pop t={t} at={at(c, 1.05)} x={830} y={175}>
            <Tag x={0} y={0} text="гений-изобретатель" color={C.violet} textColor="#fff" size={42} />
          </Pop>
          {/* золотые монеты блинчиком */}
          {Array.from({ length: 6 }).map((_, i) => {
            const st = coinStart + i * 1.15;
            const p = clamp01((t - st) / 2.6);
            if (t < st) return null;
            const sink = clamp01((p - 0.86) / 0.14);
            const h = 220 * (1 - p) * Math.abs(Math.sin(p * Math.PI * 4));
            const x = 520 + p * 740;
            const y = 735 - h + sink * 80;
            return (
              <g key={i}>
                {[0.25, 0.5, 0.75].map((b) =>
                  p > b ? <ellipse key={b} cx={520 + b * 740} cy={742} rx={20 + (p - b) * 120} ry={6 + (p - b) * 20} fill="none" stroke="#fff" strokeWidth={4} opacity={clamp01(1 - (p - b) * 3)} /> : null,
                )}
                <g opacity={1 - sink}>
                  <Coin x={x} y={y} s={1.0} spin={Math.cos(t * 10 + i)} rot={p * 40} />
                </g>
              </g>
            );
          })}
          <Pop t={t} at={at(c, 2.45)} x={980} y={300}>
            <Tag x={0} y={0} text="просто ради забавы" color={C.yellow} size={40} />
          </Pop>
        </g>
      )}
      {/* 3 · спустя несколько лет */}
      {p3 > 0.01 && (
        <g opacity={p3}>
          <Pocket x={690} y={420} s={0.95} t={t} />
          <Worker x={300} y={690} s={1.3} role="boss" t={t} mood="sad" flip />
          <Pop t={t} at={at(c, 3.1)} x={690} y={150}>
            <Tag x={0} y={0} text="спустя несколько лет" color={C.navy} textColor="#fff" size={42} />
          </Pop>
          <Pop t={t} at={at(c, 3.45)} x={1080} y={560}>
            <rect x={-130} y={-44} width={260} height={74} rx={14} fill={C.red} stroke={OL} strokeWidth={4} transform="rotate(-8)" />
            <Txt x={0} y={8} size={44} color="#fff" weight={900}>
              разорён
            </Txt>
          </Pop>
        </g>
      )}
      {/* 4 · ум легче привычек */}
      {p4 > 0.01 && (
        <g opacity={p4}>
          <Scales
            x={690}
            y={400}
            s={1.05}
            tilt={interpolate(ramp(t, at(c, 4.3), 1.4), [0, 1], [0, 0.9]) + Math.sin(t * 2) * 0.04}
            left={
              <g>
                <Brain x={0} y={-50} s={0.9} />
                <Txt x={0} y={-130} size={44} weight={900}>
                  ум
                </Txt>
              </g>
            }
            right={
              <g>
                <Sprout x={0} y={-10} s={1.15} grow={clamp01((t - at(c, 4.1)) / 1.5)} t={t} color={C.yellow} />
                <Txt x={0} y={-190} size={44} weight={900}>
                  привычки
                </Txt>
              </g>
            }
          />
          <Pop t={t} at={at(c, 4.55)} x={690} y={160}>
            <Tag x={0} y={0} text="дело в поведении" color={C.green} textColor="#fff" size={48} />
          </Pop>
        </g>
      )}
    </g>
  );
};

const CarMiniBlue: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y}) scale(0.95)`}>
    <path d="M -200 20 L -190 -30 Q -180 -50 -150 -54 L -90 -60 L -40 -110 Q -20 -124 20 -124 L 90 -124 Q 120 -124 140 -100 L 175 -60 Q 205 -54 210 -30 L 214 20 Z" fill={C.sky} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -60 -62 L -28 -102 Q -14 -112 6 -112 L 40 -112 L 40 -62 Z" fill="#e6f6ff" stroke={OL} strokeWidth={4} />
    <path d="M 56 -62 L 56 -112 L 88 -112 Q 110 -112 124 -96 L 150 -62 Z" fill="#e6f6ff" stroke={OL} strokeWidth={4} />
    {[-120, 130].map((wx) => (
      <g key={wx} transform={`translate(${wx} 22)`}>
        <circle r={44} fill="#2b2b3a" stroke={OL} strokeWidth={5} />
        <circle r={18} fill="#c9d3e0" />
      </g>
    ))}
    {[-80, 20, 120].map((sx, i) => (
      <path key={i} transform={`translate(${sx} -80) scale(${0.6 + 0.4 * Math.abs(Math.sin(t * 3 + i))})`} d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill="#fff" />
    ))}
  </g>
);

// ═════════════ s05 · формула и чувства ═════════════
export const FormulaVsFeelings: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const p1 = phase(t, -1, at(c, 1));
  const p2 = phase(t, at(c, 1), at(c, 2));
  const p3 = phase(t, at(c, 2), at(c, 3));
  const p4 = phase(t, at(c, 3));
  const race = ramp(t, at(c, 1.25), Math.max(1, (c.ends[1] ?? 0) - at(c, 1.25) - 0.5));
  const gradX = 820 + 640 * race;
  const janX = 820 + 900 * Math.pow(race, 1.7);
  const feel = ramp(t, at(c, 3.45), 0.7);
  const title = pop(t, at(c, 4));
  return (
    <g>
      {/* 1 · хирург и уборщик */}
      {p1 > 0.01 && (
        <g opacity={p1}>
          <Pop t={t} at={0.3} x={1190} y={330}>
            <circle r={110} fill="#ffe3e0" stroke={OL} strokeWidth={5} />
            <g transform={`scale(${1 + 0.08 * Math.max(0, Math.sin(t * 6))})`}>
              <Heart x={0} y={6} s={2.6} color={C.red} />
            </g>
          </Pop>
          <Pop t={t} at={0.6} x={900} y={720}>
            <Worker x={0} y={0} s={1.45} role="nurse" color="#69c7b5" t={t} arms={0.4} />
            <rect x={-30} y={-162} width={60} height={22} rx={8} fill="#bfe8df" stroke={OL} strokeWidth={3} />
          </Pop>
          <Pop t={t} at={0.9} x={1480} y={720}>
            <Worker x={0} y={0} s={1.45} role="janitor" t={t} />
            <Broom x={84} y={6} s={0.95} rot={10 + Math.sin(t * 3) * 6} />
          </Pop>
          <Pop t={t} at={0.75} x={900} y={820}>
            <Txt x={0} y={0} size={42}>
              хирург
            </Txt>
          </Pop>
          <Pop t={t} at={1.05} x={1480} y={820}>
            <Txt x={0} y={0} size={42}>
              уборщик
            </Txt>
          </Pop>
          <g transform="translate(900 400)">
            {ramp(t, at(c, 0.7), 0.4) > 0 && <circle r={60} fill="#e2f6ea" stroke={C.green} strokeWidth={5} />}
            <Check x={0} y={0} s={56} k={ramp(t, at(c, 0.72), 0.5)} />
          </g>
          <g transform="translate(1480 400)">
            {ramp(t, at(c, 0.78), 0.4) > 0 && <circle r={60} fill="#fde4e4" stroke={C.red} strokeWidth={5} />}
            <Cross x={0} y={0} s={60} k={ramp(t, at(c, 0.8), 0.5)} />
          </g>
        </g>
      )}
      {/* 2 · гонка: уборщик обгоняет выпускника */}
      {p2 > 0.01 && (
        <g opacity={p2}>
          {[470, 770].map((y, i) => (
            <g key={y}>
              <rect x={700} y={y - 12} width={1120} height={40} rx={20} fill={i ? "#d8f3e3" : "#e3e8f7"} />
              <path d={`M 720 ${y + 8} L 1800 ${y + 8}`} stroke="#fff" strokeWidth={4} strokeDasharray="24 20" />
            </g>
          ))}
          <g transform="translate(1790 790)">
            <rect x={-4} y={-330} width={8} height={330} fill={OL} />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={i} x={4 + (i % 2) * 22} y={-330 + Math.floor(i / 2) * 22} width={22} height={22} fill={(i + Math.floor(i / 2)) % 2 ? "#fff" : OL} />
            ))}
          </g>
          <CoinStack x={1720} y={380} n={5} s={0.8} />
          <g>
            <Worker x={gradX} y={470} s={1.15} role="boss" t={t * 3} />
            <GradCap x={gradX} y={470 - 140 * 1.15 + 2} s={1} />
          </g>
          <g>
            <Worker x={janX} y={770} s={1.15} role="janitor" t={t * 3} arms={race > 0.6 ? 1 : 0.2} />
          </g>
          <Pop t={t} at={at(c, 1.1)} x={1000} y={250}>
            <Tag x={0} y={0} text="выпускник Гарварда" color={C.navy} textColor="#fff" size={36} />
          </Pop>
          <Pop t={t} at={at(c, 1.35)} x={1000} y={590}>
            <Tag x={0} y={0} text="без образования и связей" color={C.teal} textColor="#fff" size={34} />
          </Pop>
          <Pop t={t} at={at(c, 1.05)} x={1240} y={150}>
            <Tag x={0} y={0} text="а с деньгами — бывает" color={C.yellow} size={46} />
          </Pop>
        </g>
      )}
      {/* 3 · две причины */}
      {p3 > 0.01 && (
        <g opacity={p3}>
          <Pop t={t} at={at(c, 2.15)} x={950} y={480}>
            <Panel x={-260} y={-240} w={520} h={480} fill="#fff" />
            <Clover x={0} y={-60} s={1.6} rot={wob(t, 1, 6)} />
            <Txt x={0} y={150} size={52} weight={900}>
              1. везение
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 2.48)} x={1530} y={480}>
            <Panel x={-260} y={-240} w={520} h={480} fill="#fff8de" stroke={C.yellowDeep} />
            <g transform={`rotate(${wob(t, 2, 4)} 0 -60)`}>
              <rect x={-150} y={-100} width={300} height={70} rx={10} fill={C.gold} stroke={OL} strokeWidth={4} />
              {Array.from({ length: 11 }).map((_, i) => (
                <rect key={i} x={-132 + i * 26} y={-100} width={5} height={i % 2 ? 22 : 36} fill={OL} />
              ))}
            </g>
            <Txt x={0} y={70} size={100} weight={900} color={C.violet}>
              ?
            </Txt>
            <Txt x={0} y={150} size={44} weight={900}>
              {"2. не точная\nнаука"}
            </Txt>
          </Pop>
        </g>
      )}
      {/* 4 · формула против чувств */}
      {p4 > 0.01 && (
        <g opacity={p4}>
          <g transform={`translate(${lerp(0, -20, feel)} 0)`} opacity={1 - feel * 0.35}>
            <Pop t={t} at={at(c, 3.05)} x={950} y={500}>
              <Panel x={-250} y={-200} w={500} h={400} fill="#2b4a3f" r={24} stroke={C.wood} />
              <Txt x={0} y={-90} size={52} color="#fff">
                {"2 + 2 = 4"}
              </Txt>
              <Txt x={0} y={-10} size={48} color="#d9f7e4">
                {"x · y = $"}
              </Txt>
              <g transform="translate(0 110)">
                <rect x={-70} y={-60} width={140} height={120} rx={14} fill="#dfe3ea" stroke={OL} strokeWidth={4} />
                <rect x={-54} y={-48} width={108} height={30} rx={5} fill="#a8d5b8" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <rect key={i} x={-54 + (i % 4) * 28} y={-8 + Math.floor(i / 4) * 30} width={22} height={22} rx={5} fill={i === 7 ? C.orange : "#fff"} stroke={OL} strokeWidth={2} />
                ))}
              </g>
            </Pop>
            <Pop t={t} at={at(c, 3.2)} x={950} y={760}>
              <Txt x={0} y={0} size={40}>
                как физика?
              </Txt>
            </Pop>
          </g>
          <Pop t={t} at={at(c, 3.5)} x={1530} y={500}>
            <Panel x={-260} y={-200} w={520} h={400} fill="#fff1f4" r={24} stroke={C.pink} />
            <g transform={`translate(-140 -60) scale(${1 + 0.08 * Math.sin(t * 5)})`}>
              <Heart x={0} y={10} s={2} color={C.coral} />
            </g>
            <g transform={`translate(10 ${-80 + wob(t, 3, 5)})`}>
              <Cloud x={0} y={10} s={0.55} fill="#8d97b5" />
              <Bolt x={0} y={50} s={0.7} />
            </g>
            <Star x={150} y={-60} r={52} rot={t * 20} />
            <Txt x={-140} y={70} size={36}>
              чувства
            </Txt>
            <Txt x={10} y={70} size={36}>
              страх
            </Txt>
            <Txt x={150} y={70} size={36}>
              мечта
            </Txt>
            <Worker x={-40} y={175} s={0.6} role="plain" t={t} arms={0.4} />
            <Worker x={60} y={175} s={0.6} role="cashier" t={t + 1} />
          </Pop>
          <Pop t={t} at={at(c, 3.45)} x={1240} y={500}>
            <circle r={44} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={16} size={52} weight={900} color={C.red}>
              ≠
            </Txt>
          </Pop>
          {title > 0.01 && (
            <g transform={`translate(1240 ${185 + wob(t, 4, 3)}) scale(${title})`}>
              <rect x={-330} y={-58} width={660} height={100} rx={50} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={58} weight={900}>
                психология денег
              </Txt>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ═════════════ s06 · крошечная точка опыта ═════════════
const DOTS = Array.from({ length: 220 }).map((_, i) => {
  const a = rnd(i, 1) * Math.PI * 2;
  const r = Math.sqrt(rnd(i, 2)) * 225;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, r: 4 + rnd(i, 3) * 6, c: [C.coral, C.yellow, C.violet, C.white, C.orange, C.pink][i % 6] };
});
const MY_DOT = { x: 70, y: 80 };

export const TinyDot: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const main = phase(t, -1, at(c, 3));
  const p4 = phase(t, at(c, 3));
  const globe = pop(t, 0.3);
  const dotsK = (i: number) => ramp(t, 0.6 + (i / DOTS.length) * Math.max(1, at(c, 1.5) - 0.6), 0.3);
  const person = phase(t, at(c, 1.1), at(c, 2));
  const find = ramp(t, at(c, 2.05), 1.6);
  const shrink = ramp(t, at(c, 2.55), 0.9);
  const lensIn = pop(t, at(c, 2.62));
  const gX = lerp(560, 360, shrink);
  const gY = lerp(480, 440, shrink);
  const gS = lerp(1, 0.62, shrink);
  const mag = { x: lerp(gX + 200 * gS, gX + MY_DOT.x * gS, find), y: lerp(gY - 180 * gS, gY + MY_DOT.y * gS, find) };
  return (
    <g>
      <Pop t={t} at={0.15} x={690} y={150}>
        <Tag x={0} y={0} text="глава 1 · «Сумасшедших нет»" color={C.navy} textColor="#fff" size={44} />
      </Pop>
      {main > 0.01 && (
        <g opacity={main}>
          {/* глобус с событиями */}
          {globe > 0.01 && (
            <g transform={`translate(${gX} ${gY}) scale(${gS * globe})`}>
              <circle r={250} fill="#5bb3e6" stroke={OL} strokeWidth={6} />
              <path d="M -180 -90 Q -120 -170 -40 -150 Q 20 -110 -30 -60 Q -80 -20 -60 40 Q -100 80 -170 20 Q -220 -30 -180 -90 Z" fill="#7cd39b" stroke={OL} strokeWidth={4} />
              <path d="M 60 -200 Q 150 -190 190 -110 Q 220 -30 160 10 Q 110 -20 80 -80 Q 30 -140 60 -200 Z" fill="#7cd39b" stroke={OL} strokeWidth={4} />
              <path d="M 0 100 Q 80 70 140 120 Q 150 190 70 220 Q 0 210 -20 160 Z" fill="#7cd39b" stroke={OL} strokeWidth={4} />
              {DOTS.map((d, i) => {
                const k = dotsK(i);
                return k > 0 ? <circle key={i} cx={d.x} cy={d.y} r={d.r * k * (1 + 0.25 * Math.sin(t * 3 + i))} fill={d.c} opacity={0.9 * (1 - find * 0.5)} /> : null;
              })}
              <circle cx={MY_DOT.x} cy={MY_DOT.y} r={6} fill={C.red} stroke="#fff" strokeWidth={2} opacity={find > 0 ? 1 : 0} />
              {find > 0.9 && <circle cx={MY_DOT.x} cy={MY_DOT.y} r={16 + 6 * Math.sin(t * 5)} fill="none" stroke={C.red} strokeWidth={4} />}
              <ellipse cx={-90} cy={-150} rx={50} ry={24} fill="#fff" opacity={0.25} transform="rotate(-30 -90 -150)" />
            </g>
          )}
          {/* человечек со своей логикой */}
          {person > 0.01 && (
            <g opacity={person}>
              <Worker x={1080} y={760} s={1.3} role="plain" color={C.orange} t={t} arms={0.3} />
              <Bubble x={1090} y={430} w={330} h={120} />
              <Txt x={1090} y={444} size={42} weight={900}>
                своя логика
              </Txt>
            </g>
          )}
          {/* лупа */}
          {find > 0.01 && shrink < 0.99 && (
            <g transform={`translate(${mag.x} ${mag.y})`} opacity={clamp01(find * 3) * (1 - shrink)}>
              <line x1={56} y1={56} x2={130} y2={130} stroke={OL} strokeWidth={22} strokeLinecap="round" />
              <line x1={58} y1={58} x2={126} y2={126} stroke={C.wood} strokeWidth={14} strokeLinecap="round" />
              <circle r={80} fill="#eaf7ff" opacity={0.6} stroke={OL} strokeWidth={10} />
              <circle r={26 * clamp01(find * 1.2)} fill={C.red} />
            </g>
          )}
          <Pop t={t} at={at(c, 2.2)} x={lerp(gX + 70 * gS + 250, 360, shrink)} y={lerp(gY + 80 * gS + 140, 760, shrink)}>
            <Tag x={0} y={0} text={shrink > 0.5 ? "доля в мире" : "мой опыт"} color={C.red} textColor="#fff" size={40} />
          </Pop>
          {/* очки: та же точка заполняет линзы */}
          {lensIn > 0.01 && (
            <g transform={`translate(930 ${450 + wob(t, 2, 4)}) scale(${lensIn})`}>
              <defs>
                <clipPath id="tinyDot-lensL">
                  <rect x={-280} y={-110} width={240} height={200} rx={70} />
                </clipPath>
                <clipPath id="tinyDot-lensR">
                  <rect x={40} y={-110} width={240} height={200} rx={70} />
                </clipPath>
              </defs>
              {["L", "R"].map((s, i) => (
                <g key={s} clipPath={`url(#tinyDot-lens${s})`}>
                  <rect x={-300} y={-120} width={600} height={220} fill="#eaf7ff" />
                  <circle cx={i ? 160 : -160} cy={-10} r={20 + 82 * ramp(t, at(c, 2.75), 1.2)} fill={C.red} opacity={0.9} />
                </g>
              ))}
              <rect x={-280} y={-110} width={240} height={200} rx={70} fill="none" stroke={OL} strokeWidth={12} />
              <rect x={40} y={-110} width={240} height={200} rx={70} fill="none" stroke={OL} strokeWidth={12} />
              <path d="M -40 -30 Q 0 -60 40 -30" stroke={OL} strokeWidth={12} fill="none" />
              <path d="M -280 -60 L -330 -80 M 280 -60 L 330 -80" stroke={OL} strokeWidth={12} strokeLinecap="round" />
              <Txt x={-160} y={4} size={34} color="#fff">
                мой
              </Txt>
              <Txt x={160} y={4} size={34} color="#fff">
                опыт
              </Txt>
            </g>
          )}
          <Pop t={t} at={at(c, 2.8)} x={930} y={760}>
            <Tag x={0} y={0} text="доля во взглядах" color={C.red} textColor="#fff" size={40} />
          </Pop>
        </g>
      )}
      {/* 4 · одни книги — разный страх */}
      {p4 > 0.01 && (
        <g opacity={p4}>
          <Person x={380} y={720} s={1.45} color="#9a8f7f" t={t} />
          <rect x={358} y={640} width={26} height={22} rx={4} fill="#c9b79a" stroke={OL} strokeWidth={2} />
          <Worker x={1050} y={720} s={1.45} role="boss" t={t} />
          <Pop t={t} at={at(c, 3.25)} x={715} y={600}>
            <Book x={-70} y={0} s={0.55} color={C.skyDeep} />
            <Book x={70} y={0} s={0.55} color={C.skyDeep} />
            <Txt x={0} y={150} size={38}>
              те же книги
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 3.5)} x={380} y={330}>
            <Cloud x={0} y={0} s={1.1} fill="#8d97b5" />
            <Bolt x={-30} y={70} s={1} />
            <Bolt x={40} y={70} s={0.8} />
            <Txt x={0} y={-10} size={42} color="#fff">
              риск!
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 3.65)} x={1050} y={330}>
            <Sun x={0} y={0} r={62} t={t} />
            <Txt x={0} y={150} size={40}>
              спокойно
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 3.15)} x={380} y={810}>
            <Txt x={0} y={0} size={38}>
              вырос в бедности
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 3.3)} x={1050} y={810}>
            <Txt x={0} y={0} size={38}>
              сын банкира
            </Txt>
          </Pop>
        </g>
      )}
    </g>
  );
};

// ═════════════ s07 · два поколения, разные очки ═════════════
export const TwoLenses: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const chart = phase(t, -1, at(c, 1));
  const lens = [pop(t, at(c, 1.05)), pop(t, at(c, 1.4))];
  const draw = [ramp(t, at(c, 1.15), 2.2), ramp(t, at(c, 1.5), 2.2)];
  const people = pop(t, 0.5);
  const specs = ramp(t, at(c, 2.2), 0.6);
  const LX = [930, 1450];
  const LY = 470;
  const RAD = 175;
  return (
    <g>
      {/* общая линия мира */}
      {chart > 0.01 && (
        <g opacity={chart}>
          <Pop t={t} at={0.25} x={1190} y={410}>
            <Panel x={-430} y={-200} w={860} h={360} fill="#fff" />
            <LineChart x={-370} y={-140} w={740} h={240} pts={[[0, 0.3], [0.15, 0.45], [0.3, 0.6], [0.42, 0.7], [0.5, 0.3], [0.56, 0.62], [0.62, 0.22], [0.7, 0.5], [0.8, 0.55], [1, 0.85]]} k={ramp(t, 0.6, 3)} color={C.skyDeep} />
            <rect x={-370 + 0.0 * 740} y={-150} width={0.42 * 740} height={260} fill={C.yellow} opacity={0.18 * ramp(t, at(c, 0.6), 0.5)} />
            <rect x={-370 + 0.46 * 740} y={-150} width={0.28 * 740} height={260} fill={C.violet} opacity={0.18 * ramp(t, at(c, 0.7), 0.5)} />
          </Pop>
          <Pop t={t} at={0.4} x={1190} y={150}>
            <Tag x={0} y={0} text="один и тот же мир" color={C.skyDeep} textColor="#fff" size={44} />
          </Pop>
        </g>
      )}
      {/* линзы */}
      <defs>
        {LX.map((x, i) => (
          <clipPath key={i} id={`twoLenses-clip${i}`}>
            <circle cx={x} cy={LY} r={RAD} />
          </clipPath>
        ))}
      </defs>
      {LX.map((x, i) => {
        const k = lens[i];
        if (k <= 0.01) return null;
        return (
          <g key={i} transform={`translate(${x} ${LY}) scale(${k}) translate(${-x} ${-LY})`}>
            <path d={`M ${x - 40} ${LY + RAD - 10} L ${x - 14} 690 L ${x + 14} 690 L ${x + 40} ${LY + RAD - 10} Z`} fill={i ? C.violet : C.yellow} opacity={0.2} />
            <g clipPath={`url(#twoLenses-clip${i})`}>
              <rect x={x - RAD} y={LY - RAD} width={RAD * 2} height={RAD * 2} fill={i ? "#cfc6e6" : "#e6f6ff"} />
              {i === 0 ? (
                <g>
                  <Sun x={x + 85} y={LY - 85} r={42} t={t} />
                  <path d={`M ${x - RAD} ${LY + 120} Q ${x} ${LY + 90} ${x + RAD} ${LY - 40} L ${x + RAD} ${LY + RAD} L ${x - RAD} ${LY + RAD} Z`} fill="#bfe8c9" />
                  <LineChart x={x - 150} y={LY - 90} w={300} h={200} pts={[[0, 0.1], [0.25, 0.22], [0.5, 0.4], [0.75, 0.62], [1, 0.9]]} k={draw[0]} color={C.greenDeep} axis={false} width={12} />
                </g>
              ) : (
                <g>
                  <Cloud x={x - 20} y={LY - 90} s={0.9} fill="#6b6f8e" />
                  <Bolt x={x - 40 + Math.sin(t * 7) * 2} y={LY - 20} s={1} />
                  {Array.from({ length: 10 }).map((_, j) => (
                    <line key={j} x1={x - 150 + j * 32} y1={LY - 40 + ((t * 160 + j * 37) % 180)} x2={x - 158 + j * 32} y2={LY - 20 + ((t * 160 + j * 37) % 180)} stroke="#7fa6d6" strokeWidth={4} strokeLinecap="round" />
                  ))}
                  <LineChart x={x - 150} y={LY - 70} w={300} h={200} pts={[[0, 0.6], [0.12, 0.2], [0.24, 0.75], [0.36, 0.15], [0.5, 0.65], [0.62, 0.1], [0.76, 0.55], [0.88, 0.2], [1, 0.45]]} k={draw[1]} color={C.red} axis={false} width={12} />
                </g>
              )}
            </g>
            <circle cx={x} cy={LY} r={RAD} fill="none" stroke={i ? C.violet : C.yellowDeep} strokeWidth={22} />
            <circle cx={x} cy={LY} r={RAD} fill="none" stroke={OL} strokeWidth={5} />
            <circle cx={x} cy={LY} r={RAD + 13} fill="none" stroke={OL} strokeWidth={4} />
            <path d={`M ${x - 110} ${LY - 110} Q ${x - 60} ${LY - 150} ${x - 10} ${LY - 150}`} stroke="#fff" strokeWidth={10} fill="none" opacity={0.5} strokeLinecap="round" />
          </g>
        );
      })}
      <Pop t={t} at={at(c, 1.1)} x={LX[0]} y={200}>
        <Txt x={0} y={0} size={38} weight={900}>
          {"молодость\nв спокойные годы"}
        </Txt>
      </Pop>
      <Pop t={t} at={at(c, 1.45)} x={LX[1]} y={200}>
        <Txt x={0} y={0} size={38} weight={900}>
          {"молодость\nв кризис"}
        </Txt>
      </Pop>
      {/* два поколения */}
      {people > 0.01 && (
        <g opacity={clamp01(people * 1.5)}>
          <g>
            <Worker x={LX[0]} y={815} s={1.0} role="plain" color={C.teal} t={t} skin="#f0c49a" />
            <path d={`M ${LX[0] - 30} ${815 - 128} Q ${LX[0]} ${815 - 160} ${LX[0] + 30} ${815 - 128}`} stroke="#d9dde5" strokeWidth={12} fill="none" strokeLinecap="round" />
            {specs > 0.01 && <Glasses x={LX[0]} y={815 - 114} s={0.22 * specs} color={C.yellow} />}
          </g>
          <g>
            <Worker x={LX[1]} y={815} s={1.0} role="plain" color={C.coral} t={t + 1} />
            <path d={`M ${LX[1] - 30} ${815 - 126} Q ${LX[1] - 10} ${815 - 156} ${LX[1] + 30} ${815 - 128}`} stroke="#5a3d22" strokeWidth={12} fill="none" strokeLinecap="round" />
            {specs > 0.01 && <Glasses x={LX[1]} y={815 - 114} s={0.22 * specs} color={C.violet} />}
          </g>
        </g>
      )}
      <Pop t={t} at={at(c, 2.15)} x={1190} y={470}>
        <circle r={60} fill="#fff" stroke={OL} strokeWidth={4} />
        <Check x={0} y={0} s={48} k={ramp(t, at(c, 2.2), 0.5)} />
      </Pop>
      <Pop t={t} at={at(c, 2.45)} x={1190} y={110}>
        <Tag x={0} y={0} text="не сумасшедшие — просто разные очки" color={C.yellow} size={36} />
      </Pop>
    </g>
  );
};

// ═════════════ s08 · мы все новички ═════════════
const Dog: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -54 -40 Q ${-80 + Math.sin(t * 9) * 8} ${-70} ${-76 + Math.sin(t * 9) * 10} -84`} stroke="#b07a45" strokeWidth={10} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-36} rx={58} ry={28} fill="#c98a4b" stroke={OL} strokeWidth={4} />
    {[-36, -14, 18, 40].map((lx) => (
      <rect key={lx} x={lx - 6} y={-20} width={12} height={22} rx={5} fill="#c98a4b" stroke={OL} strokeWidth={3} />
    ))}
    <circle cx={54} cy={-66} r={26} fill="#c98a4b" stroke={OL} strokeWidth={4} />
    <ellipse cx={42} cy={-86} rx={10} ry={18} fill="#8a5a2b" stroke={OL} strokeWidth={3} transform="rotate(-20 42 -86)" />
    <ellipse cx={78} cy={-62} rx={12} ry={9} fill="#e7c49a" stroke={OL} strokeWidth={3} />
    <circle cx={86} cy={-64} r={4} fill={OL} />
    <circle cx={58} cy={-72} r={4} fill={OL} />
  </g>
);
const Fire: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy={-40} r={70} fill={C.yellow} opacity={0.18 + 0.06 * Math.sin(t * 8)} />
    <path d={`M -30 0 Q -40 -40 -10 ${-70 + Math.sin(t * 9) * 6} Q -6 -40 6 -50 Q 10 ${-90 + Math.sin(t * 7) * 8} 34 -40 Q 40 -14 30 0 Z`} fill={C.orange} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d={`M -12 0 Q -16 -24 2 ${-40 + Math.sin(t * 11) * 4} Q 18 -22 12 0 Z`} fill={C.yellow} />
    <path d="M -46 8 L 46 -4 M -46 -4 L 46 8" stroke="#8a5a2b" strokeWidth={14} strokeLinecap="round" />
  </g>
);

export const Newbies: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const row = pop(t, 0.3);
  const move = ramp(t, at(c, 1.55), 1.0);
  const bar = ramp(t, at(c, 1) - 0.1, 1.4);
  const old = (i: number) => pop(t, at(c, 1.05) + i * 0.25);
  const recent = pop(t, at(c, 1.6));
  const newbie = pop(t, at(c, 2.2));
  const BX0 = 420;
  const BX1 = 1820;
  const SEG = 1700;
  const ICONS = [
    { label: "пенсии" },
    { label: "счета" },
    { label: "копилки" },
    { label: "учёба в долг" },
  ];
  return (
    <g>
      <Pop t={t} at={0.2} x={1080} y={150}>
        <Tag x={0} y={0} text={newbie > 0.5 ? "мы не сумасшедшие — мы новички" : "всё это появилось недавно"} color={newbie > 0.5 ? C.green : C.yellow} textColor={newbie > 0.5 ? "#fff" : C.ink} size={44} />
      </Pop>
      {/* иконки современных финансов */}
      {ICONS.map((it, i) => {
        const k = pop(t, at(c, 0.25) + i * 0.6) * row;
        if (k <= 0.01) return null;
        const x0 = 600 + i * 330;
        const y0 = 330;
        const x = lerp(x0, SEG + 20 + i * 52, move);
        const y = lerp(y0, 620, move);
        const s = lerp(1, 0.32, move) * k;
        return (
          <g key={i} transform={`translate(${x} ${y + wob(t, i, 4) * (1 - move)}) scale(${s})`}>
            <circle r={110} fill="#fff" stroke={OL} strokeWidth={5} />
            {i === 0 && (
              <g>
                <Person x={-6} y={60} s={0.8} color={C.violet} t={t} />
                <path d="M -36 -64 Q -6 -88 24 -64" stroke="#d9dde5" strokeWidth={14} fill="none" strokeLinecap="round" />
                <path d="M 42 20 L 50 74 M 42 20 Q 56 6 64 20" stroke={C.wood} strokeWidth={8} fill="none" strokeLinecap="round" />
              </g>
            )}
            {i === 1 && (
              <g transform={`rotate(${-8 + wob(t, 5, 3)})`}>
                <rect x={-80} y={-50} width={160} height={100} rx={14} fill={C.skyDeep} stroke={OL} strokeWidth={5} />
                <rect x={-80} y={-26} width={160} height={20} fill={OL} opacity={0.6} />
                <rect x={-58} y={8} width={34} height={26} rx={5} fill={C.gold} stroke={OL} strokeWidth={3} />
                <rect x={0} y={16} width={60} height={10} rx={5} fill="#fff" opacity={0.8} />
              </g>
            )}
            {i === 2 && (
              <g>
                <ellipse cx={0} cy={10} rx={78} ry={60} fill={C.pink} stroke={OL} strokeWidth={5} />
                <ellipse cx={74} cy={4} rx={18} ry={22} fill="#ffb3c8" stroke={OL} strokeWidth={4} />
                <path d="M -30 -42 L -20 -66 L -6 -46" fill={C.pink} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
                <rect x={-20} y={-54} width={40} height={10} rx={4} fill={OL} />
                <circle cx={36} cy={-8} r={6} fill={OL} />
                {[-40, 30].map((lx) => (
                  <rect key={lx} x={lx} y={56} width={16} height={24} rx={4} fill={C.pink} stroke={OL} strokeWidth={3} />
                ))}
                <Coin x={0} y={-82 - ((t * 60) % 30)} s={0.45} spin={Math.cos(t * 5)} />
              </g>
            )}
            {i === 3 && (
              <g>
                <GradCap x={0} y={-30} s={1.5} />
                <Bill x={0} y={50} s={0.75} rot={-6} color="#f6b8b8" />
                <Txt x={0} y={62} size={30} color={C.red} weight={900}>
                  долг
                </Txt>
              </g>
            )}
            <g opacity={1 - move}>
              <Txt x={0} y={170} size={40} weight={900}>
                {it.label}
              </Txt>
            </g>
          </g>
        );
      })}
      {/* лента времени */}
      {bar > 0.01 && (
        <g>
          <rect x={BX0} y={700} width={(BX1 - BX0) * bar} height={44} rx={22} fill="#f2c79b" stroke={OL} strokeWidth={4} />
          {Array.from({ length: 13 }).map((_, i) => {
            const x = BX0 + 40 + i * 100;
            return x < BX0 + (BX1 - BX0) * bar - 20 ? <line key={i} x1={x} y1={710} x2={x} y2={734} stroke="#c9955f" strokeWidth={4} strokeLinecap="round" /> : null;
          })}
          {recent > 0.01 && <rect x={SEG} y={694} width={(BX1 - SEG) * recent} height={56} rx={14} fill={C.green} stroke={OL} strokeWidth={4} />}
        </g>
      )}
      {[0, 1, 2].map((i) => {
        const k = old(i);
        if (k <= 0.01) return null;
        return (
          <g key={i} transform={`translate(${[560, 700, 840][i]} 692) scale(${k})`}>
            {i === 0 && <Person x={0} y={-4} s={0.95} color="#a5673f" t={t} arms={0.3} />}
            {i === 1 && <Dog x={0} y={0} s={1} t={t} />}
            {i === 2 && <Fire x={0} y={0} s={1} t={t} />}
          </g>
        );
      })}
      <Pop t={t} at={at(c, 1.25)} x={760} y={810}>
        <Txt x={0} y={0} size={42} weight={900}>
          ≈ 10 000 лет вместе
        </Txt>
      </Pop>
      <Pop t={t} at={at(c, 1.65)} x={1620} y={810}>
        <Txt x={0} y={0} size={40} weight={900} color={C.greenDeep}>
          несколько десятилетий
        </Txt>
      </Pop>
      {recent > 0.01 && <Arrow x1={1560} y1={540} x2={1745} y2={605} k={ramp(t, at(c, 1.7), 0.5)} color={C.greenDeep} w={7} bend={-0.2} />}
      {/* банан-новичок */}
      {newbie > 0.01 && (
        <g transform={`translate(1180 ${400 + wob(t, 2, 6)}) scale(${newbie})`}>
          <MiniBanana x={0} y={0} s={0.95} t={t} />
          <g transform="translate(0 -130)">
            <path d="M -66 4 Q -60 -60 0 -62 Q 60 -60 66 4 Z" fill={C.skyDeep} stroke={OL} strokeWidth={5} />
            <path d="M 40 0 L 120 6 Q 110 20 50 18 Z" fill={C.skyDeep} stroke={OL} strokeWidth={4} />
            <circle cy={-62} r={10} fill={C.yellow} stroke={OL} strokeWidth={3} />
          </g>
          <g transform="translate(-130 60) rotate(-12)">
            <rect x={-60} y={-80} width={120} height={160} rx={10} fill={C.coral} stroke={OL} strokeWidth={5} />
            <rect x={-60} y={-80} width={16} height={160} fill="#000" opacity={0.15} />
            <Txt x={8} y={20} size={70} color="#fff" weight={900}>
              $
            </Txt>
          </g>
          <g transform="translate(170 -150)">
            <Tag x={0} y={0} text="новичок" color={C.yellow} size={38} />
          </g>
        </g>
      )}
    </g>
  );
};

// ═════════════ s09 · альбом воспоминаний ═════════════
const PHOTO_LABELS = ["дом", "копилка", "рынок", "семья"];
const PhotoPic: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const k = ((i % 4) + 4) % 4;
  return (
    <g>
      <rect x={-80} y={-110} width={160} height={150} rx={6} fill={["#cfe9ff", "#ffe3ec", "#fff1c9", "#dff5e6"][k]} />
      {k === 0 && <Cottage x={0} y={30} s={0.55} />}
      {k === 1 && (
        <g transform="translate(0 -20)">
          <ellipse cx={0} cy={10} rx={52} ry={40} fill={C.pink} stroke={OL} strokeWidth={4} />
          <ellipse cx={50} cy={6} rx={12} ry={15} fill="#ffb3c8" stroke={OL} strokeWidth={3} />
          <rect x={-14} y={-34} width={28} height={7} rx={3} fill={OL} />
          <circle cx={24} cy={-2} r={4} fill={OL} />
          <Coin x={0} y={-54 - ((t * 40) % 16)} s={0.35} />
        </g>
      )}
      {k === 2 && (
        <g transform="translate(0 20)">
          <rect x={-66} y={-70} width={132} height={22} fill={C.red} />
          {[-66, -40, -14, 12, 38].map((sx, j) => (
            <rect key={sx} x={sx} y={-70} width={13} height={22} fill={j % 2 ? "#fff" : C.red} />
          ))}
          <rect x={-60} y={-48} width={6} height={60} fill={C.wood} />
          <rect x={54} y={-48} width={6} height={60} fill={C.wood} />
          <rect x={-66} y={0} width={132} height={22} fill={C.wood} stroke={OL} strokeWidth={3} />
          {[-40, -10, 20, 46].map((ax, j) => (
            <circle key={ax} cx={ax} cy={-8} r={12} fill={[C.red, C.orange, C.green, C.yellow][j]} stroke={OL} strokeWidth={2} />
          ))}
        </g>
      )}
      {k === 3 && (
        <g transform="translate(0 30)">
          <Person x={-38} y={0} s={0.55} color={C.skyDeep} t={t} />
          <Person x={30} y={0} s={0.55} color={C.coral} t={t} />
          <Person x={0} y={14} s={0.36} color={C.yellow} t={t} />
        </g>
      )}
      <rect x={-80} y={-110} width={160} height={150} rx={6} fill="none" stroke={OL} strokeWidth={3} />
      <Txt x={0} y={86} size={34} weight={800}>
        {PHOTO_LABELS[k]}
      </Txt>
    </g>
  );
};

export const MemoryQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const album = pop(t, 0.3);
  const period = 3.4;
  const u = Math.max(0, (t - 1.2) / period);
  const n = Math.floor(u);
  const fl = clamp01((u - n - 0.55) / 0.45);
  const SPX = 380;
  const AY = 470;
  const pageW = 220;
  const right = phase(t, -1, at(c, 1));
  const yours = phase(t, at(c, 1));
  const qGlow = 0.5 + 0.5 * Math.sin(t * 2.6);
  const Page: React.FC<{ side: -1 | 1; i: number; sx?: number }> = ({ side, i, sx = 1 }) => (
    <g transform={`translate(${SPX} ${AY}) scale(${sx} 1)`}>
      <rect x={side === 1 ? 0 : -pageW} y={-160} width={pageW} height={320} rx={10} fill="#fffaf0" stroke={OL} strokeWidth={4} />
      <g transform={`translate(${side * pageW * 0.5} 10) rotate(${side * 3})`}>
        <rect x={-92} y={-124} width={184} height={250} rx={6} fill="#fff" stroke="#d9cdb4" strokeWidth={3} />
        <PhotoPic i={i} t={t} />
      </g>
    </g>
  );
  return (
    <g>
      {/* светящийся знак вопроса */}
      <g transform={`translate(960 ${150 + wob(t, 0, 4)})`}>
        <circle r={70 + 10 * qGlow} fill={C.yellow} opacity={0.25 + 0.2 * qGlow} />
        <circle r={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={30} size={86} weight={900}>
          ?
        </Txt>
      </g>
      {/* альбом */}
      {album > 0.01 && (
        <g transform={`translate(${SPX} ${AY}) scale(${album}) translate(${-SPX} ${-AY})`}>
          <rect x={SPX - pageW - 24} y={AY - 180} width={pageW * 2 + 48} height={360} rx={18} fill={C.wood} stroke={OL} strokeWidth={5} />
          <Page side={-1} i={2 * n} />
          <Page side={1} i={fl > 0 ? 2 * n + 3 : 2 * n + 1} />
          {fl > 0 && (fl < 0.5 ? <Page side={1} i={2 * n + 1} sx={1 - 2 * fl} /> : <Page side={-1} i={2 * n + 2} sx={2 * fl - 1} />)}
          <rect x={SPX - 4} y={AY - 170} width={8} height={340} fill="#000" opacity={0.15} />
          <Txt x={SPX} y={AY + 250} size={40} weight={900}>
            детство и юность
          </Txt>
        </g>
      )}
      {/* справа: опыт за чужим решением */}
      {right > 0.01 && (
        <g opacity={right}>
          <Worker x={1450} y={740} s={1.3} role="plain" color={C.violet} t={t} arms={0.5} />
          <Coin x={1510} y={600} s={0.6} spin={Math.cos(t * 3)} />
          <Pop t={t} at={at(c, 0.5)} x={1520} y={390}>
            <Cloud x={0} y={30} s={1.35} />
            <g transform="translate(-30 -10) scale(0.55)">
              <rect x={-92} y={-124} width={184} height={250} rx={6} fill="#fff" stroke="#d9cdb4" strokeWidth={4} />
              <PhotoPic i={0} t={t} />
            </g>
            <g transform="translate(70 -10) scale(0.55) rotate(8)">
              <rect x={-92} y={-124} width={184} height={250} rx={6} fill="#fff" stroke="#d9cdb4" strokeWidth={4} />
              <PhotoPic i={2} t={t} />
            </g>
          </Pop>
          <Pop t={t} at={at(c, 0.7)} x={1560} y={200}>
            <Tag x={0} y={0} text="какой опыт за этим?" color={C.skyDeep} textColor="#fff" size={40} />
          </Pop>
        </g>
      )}
      {yours > 0.01 && (
        <g opacity={yours} transform={`translate(1560 ${450 + wob(t, 3, 6)}) rotate(${6 + wob(t, 4, 2)})`}>
          <circle r={210} fill={C.yellow} opacity={0.15 + 0.15 * qGlow} />
          <rect x={-130} y={-180} width={260} height={340} rx={10} fill="#fff" stroke={OL} strokeWidth={5} />
          <rect x={-104} y={-154} width={208} height={220} rx={6} fill="#fff6d9" stroke={OL} strokeWidth={3} />
          <Txt x={0} y={20} size={140} weight={900} color={C.yellowDeep}>
            ?
          </Txt>
          <Txt x={0} y={122} size={34} weight={900}>
            ваше событие
          </Txt>
        </g>
      )}
    </g>
  );
};

// ═════════════ s10 · воронка удачи ═════════════
const FX = 690; // центр воронки
const funnelPath = (top: number, neck: number, w: number, nw: number, spout: number) =>
  `M ${FX - w} ${top} L ${FX + w} ${top} L ${FX + nw} ${neck} L ${FX + nw} ${spout} L ${FX - nw} ${spout} L ${FX - nw} ${neck} Z`;

const Tiny: React.FC<{ x: number; y: number; s?: number; color: string }> = ({ x, y, s = 1, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-7} y={-6} width={14} height={18} rx={6} fill={color} />
    <circle cx={0} cy={-13} r={7} fill="#f2c79b" />
  </g>
);

export const Funnel: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const p1 = phase(t, -1, at(c, 2));
  const fun = phase(t, at(c, 2));
  const dim = 1 - 0.94 * ramp(t, at(c, 3), 0.6);
  const term = pop(t, at(c, 1.1));
  const COLS = [C.coral, C.skyDeep, C.green, C.violet, C.orange, C.teal, C.pink];
  const TOP = 290;
  const NECK = 560;
  const blocks = (i: number) => pop(t, at(c, 3.3) + i * 0.45);
  return (
    <g>
      <Pop t={t} at={0.2} x={690} y={150 - 300 * (1 - p1)}>
        <Tag x={0} y={0} text="глава 2 · удача" color={C.navy} textColor="#fff" size={44} />
      </Pop>
      {/* школа и терминал */}
      {p1 > 0.01 && (
        <g opacity={p1}>
          <Pop t={t} at={0.5} x={420} y={760}>
            <School x={0} y={0} s={1} name="ЛЕЙКСАЙД" />
          </Pop>
          {term > 0.01 && (
            <g transform={`translate(980 ${700}) scale(${term})`}>
              <circle cy={-90} r={220} fill={C.yellow} opacity={0.2 + 0.1 * Math.sin(t * 3)} />
              <Terminal x={0} y={0} s={1.1} t={t} />
              <Worker x={-190} y={130} s={1.05} role="plain" color={C.skyDeep} t={t} arms={0.6} />
            </g>
          )}
          <Pop t={t} at={at(c, 1.15)} x={980} y={340}>
            <Tag x={0} y={0} text="1968 · свой компьютер" color={C.green} textColor="#fff" size={40} />
          </Pop>
        </g>
      )}
      {/* воронка */}
      {fun > 0.01 && (
        <g opacity={fun}>
          <g opacity={dim}>
            {/* толпа сверху */}
            {Array.from({ length: 3 }).map((_, r) =>
              Array.from({ length: 34 }).map((_, i) => {
                const x = FX - 470 + i * 28.5 + (r % 2) * 14;
                return <Tiny key={`${r}-${i}`} x={x} y={TOP - 30 - r * 34 + Math.sin(t * 4 + i + r) * 2} s={0.9} color={COLS[(i + r * 3) % COLS.length]} />;
              }),
            )}
            <path d={funnelPath(TOP, NECK, 480, 46, NECK + 50)} fill={C.sky} stroke={OL} strokeWidth={6} strokeLinejoin="round" opacity={0.92} />
            <path d={`M ${FX - 440} ${TOP + 12} L ${FX + 440} ${TOP + 12}`} stroke="#fff" strokeWidth={6} opacity={0.5} />
            {/* поток внутрь */}
            {Array.from({ length: 40 }).map((_, i) => {
              const p = (t * 0.32 + rnd(i, 7)) % 1;
              const xs = FX - 420 + rnd(i, 8) * 840;
              const x = lerp(xs, FX, Math.pow(p, 1.3));
              const y = lerp(TOP + 20, NECK - 10, p);
              return <Tiny key={i} x={x} y={y} s={0.75 * (1 - p * 0.6)} color={COLS[i % COLS.length]} />;
            })}
            <Txt x={FX} y={TOP + 110} size={54} weight={900} color="#fff">
              ≈ 303 млн
            </Txt>
            <Txt x={FX} y={TOP + 160} size={38} weight={900} color="#fff">
              старшеклассников
            </Txt>
          </g>
          {/* один из миллиона */}
          <Pop t={t} at={at(c, 2.5)} x={FX} y={790}>
            <circle cy={-80} r={140} fill={C.yellow} opacity={0.25 + 0.12 * Math.sin(t * 3)} />
            <Terminal x={50} y={-60} s={0.72} t={t} />
            <Worker x={-80} y={0} s={0.95} role="plain" color={C.skyDeep} t={t} arms={0.6} />
          </Pop>
          <Pop t={t} at={at(c, 2.65)} x={1080} y={720}>
            <Tag x={0} y={0} text="1 из миллиона" color={C.gold} size={46} />
          </Pop>
          {/* талант + труд + удача */}
          {[
            { x: 360, label: "талант", col: "#fff3c4" },
            { x: 690, label: "труд", col: "#e2f0ff" },
            { x: 1020, label: "удача", col: "#dff7e8" },
          ].map((b, i) => {
            const k = blocks(i);
            if (k <= 0.01) return null;
            return (
              <g key={i} transform={`translate(${b.x} ${370 + wob(t, i, 5)}) scale(${k * 0.9})`}>
                {i === 2 && <circle r={180} fill={C.green} opacity={0.15 + 0.1 * Math.sin(t * 3)} />}
                <Panel x={-140} y={-140} w={280} h={280} fill={b.col} stroke={i === 2 ? C.green : undefined} />
                {i === 0 && <Star x={0} y={-30} r={66} rot={t * 15} />}
                {i === 1 && (
                  <g transform={`rotate(${-30 + Math.sin(t * 6) * 14} 0 -10)`}>
                    <rect x={-8} y={-60} width={16} height={110} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
                    <rect x={-46} y={-86} width={92} height={40} rx={8} fill={C.grey} stroke={OL} strokeWidth={4} />
                  </g>
                )}
                {i === 2 && <Clover x={0} y={-36} s={1.05} rot={wob(t, 5, 8)} />}
                <Txt x={0} y={100} size={44} weight={900}>
                  {b.label}
                </Txt>
                {i < 2 && (
                  <Txt x={165} y={18} size={64} weight={900} color={C.inkSoft}>
                    +
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

// ═════════════ s11 · риск — близнец удачи ═════════════
export const MirrorFunnel: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const friends = phase(t, -1, at(c, 2));
  const loss = ramp(t, at(c, 1.1), 1.4);
  const mir = phase(t, at(c, 2));
  const up = ramp(t, at(c, 2) + 0.1, 1.0);
  const down = ramp(t, at(c, 2.25), 1.2);
  const MX = 1120;
  const WL = 470;
  const half = (dir: 1 | -1, k: number, fill: string) => {
    const top = WL - dir * 330 * k;
    const neck = WL - dir * 40;
    return `M ${MX - 300} ${top} L ${MX + 300} ${top} L ${MX + 30} ${neck} L ${MX - 30} ${neck} Z` + (fill ? "" : "");
  };
  return (
    <g>
      {/* двое друзей у терминала */}
      {friends > 0.01 && (
        <g opacity={friends}>
          <Pop t={t} at={0.3} x={1190} y={640}>
            <Terminal x={0} y={0} s={1} t={t} />
          </Pop>
          <Pop t={t} at={0.5} x={920} y={760}>
            <Worker x={0} y={0} s={1.3} role="plain" color={C.skyDeep} t={t} arms={0.4} />
            <Star x={0} y={-260} r={38} rot={t * 20} />
          </Pop>
          <Pop t={t} at={at(c, 0.4)} x={1470} y={760}>
            <g opacity={1 - loss * 0.75}>
              <Worker x={0} y={0} s={1.3} role="plain" color={C.orange} t={t} arms={0.4} />
            </g>
            <circle cx={0} cy={-90} r={140} fill="#bcd3ff" opacity={0.35 * loss} />
            <Star x={0} y={-260} r={38} rot={t * 20} />
          </Pop>
          <Pop t={t} at={at(c, 0.55)} x={1470} y={850}>
            <Txt x={0} y={-10} size={38} weight={900}>
              Кент Эванс
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 0.3)} x={1190} y={200}>
            <Tag x={0} y={0} text="лучшие друзья · оба талантливы" color={C.skyDeep} textColor="#fff" size={40} />
          </Pop>
          {loss > 0.01 && (
            <g opacity={loss}>
              <Flower3 x={1560} y={790} t={t} />
              <g transform="translate(1190 310)">
                <Tag x={0} y={0} text="≈ 1 из миллиона" color="#c9d3e6" size={40} />
              </g>
            </g>
          )}
        </g>
      )}
      {/* зеркальная воронка */}
      {mir > 0.01 && (
        <g opacity={mir}>
          <rect x={700} y={WL} width={1140} height={380} rx={30} fill="#7d93cf" opacity={0.45 * down} />
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={i} d={`M ${760 + i * 170} ${WL + 30 + i * 50} q 30 -10 60 0 t 60 0`} stroke="#6f86c4" strokeWidth={4} fill="none" opacity={0.6 * down} transform={`translate(${Math.sin(t * 1.5 + i) * 14} 0)`} />
          ))}
          <path d={half(1, up, "")} fill={C.gold} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
          <g transform={`translate(${Math.sin(t * 1.8) * 4} 0)`}>
            <path d={half(-1, down, "")} fill="#2b3a67" stroke="#1a2444" strokeWidth={6} strokeLinejoin="round" />
          </g>
          <line x1={700} y1={WL} x2={1840} y2={WL} stroke="#fff" strokeWidth={6} opacity={0.8} />
          {up > 0.6 && (
            <g opacity={(up - 0.6) * 2.5}>
              <Txt x={MX} y={WL - 200} size={60} weight={900} color="#fff">
                удача
              </Txt>
              <Star x={MX} y={WL - 100} r={34} rot={t * 20} />
            </g>
          )}
          {down > 0.6 && (
            <g opacity={(down - 0.6) * 2.5}>
              <Txt x={MX} y={WL + 230} size={60} weight={900} color="#fff">
                риск
              </Txt>
              <Cloud x={MX} y={WL + 120} s={0.42} fill="#8d97b5" stroke="#1a2444" />
            </g>
          )}
          <Pop t={t} at={at(c, 2.3)} x={1620} y={250}>
            <Txt x={0} y={0} size={44} weight={900}>
              {"те же шансы —\nв другую\nсторону"}
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 2.75)} x={1620} y={640}>
            <Tag x={0} y={0} text="близнецы" color={C.yellow} size={46} />
          </Pop>
        </g>
      )}
    </g>
  );
};

const Flower3: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-26, 0, 26].map((dx, i) => {
      const sw = Math.sin(t * 1.5 + i) * 3;
      return (
        <g key={i}>
          <path d={`M ${dx} 0 Q ${dx + sw} -40 ${dx + sw * 2} ${-70 - i * 10}`} stroke={C.greenDeep} strokeWidth={5} fill="none" />
          {Array.from({ length: 5 }).map((_, j) => (
            <ellipse key={j} cx={dx + sw * 2} cy={-84 - i * 10} rx={7} ry={13} fill="#fff" stroke={OL} strokeWidth={2} transform={`rotate(${j * 72} ${dx + sw * 2} ${-70 - i * 10})`} />
          ))}
          <circle cx={dx + sw * 2} cy={-70 - i * 10} r={6} fill={C.yellow} />
        </g>
      );
    })}
  </g>
);

// ═════════════ s12 · монетка: чужие ошибки и своё невезение ═════════════
const FlipCoin: React.FC<{ x: number; y: number; r: number; spin: number; t: number }> = ({ x, y, r, spin, t }) => {
  const front = spin >= 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.max(0.06, Math.abs(spin))} 1)`}>
      <circle r={r + 10} fill={front ? "#c9952a" : "#3d3a4a"} stroke={OL} strokeWidth={6} />
      <circle r={r} fill={front ? C.gold : "#5b5870"} stroke={OL} strokeWidth={4} />
      {front ? (
        <g>
          <rect x={-r * 0.55} y={-r * 0.7} width={r * 1.1} height={r * 1.4} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
          <rect x={-r * 0.55} y={-r * 0.7} width={r * 1.1} height={r * 0.3} rx={6} fill={C.red} />
          <text y={-r * 0.48} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.17} fill="#fff">
            ЖУРНАЛ
          </text>
          <Worker x={0} y={r * 0.55} s={r / 230} role="boss" t={t} arms={1} />
          <Star x={r * 0.32} y={-r * 0.2} r={r * 0.11} />
        </g>
      ) : (
        <g opacity={0.7}>
          <circle cx={0} cy={-r * 0.25} r={r * 0.22} fill="#2a2838" />
          <rect x={-r * 0.3} y={-r * 0.02} width={r * 0.6} height={r * 0.55} rx={r * 0.2} fill="#2a2838" />
        </g>
      )}
    </g>
  );
};

export const CoinFlip: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const p1 = phase(t, -1, at(c, 1));
  const p2 = phase(t, at(c, 1), at(c, 2));
  const p3 = phase(t, at(c, 2), at(c, 3));
  const p4 = phase(t, at(c, 3));
  const land = ramp(t, at(c, 1.55), 0.8);
  const tt = t - at(c, 1);
  const spin = interpolate(land, [0, 1], [Math.cos(tt * 7), 1]);
  const jump = (1 - land) * Math.abs(Math.sin(tt * 1.7)) * 160;
  const shadows = ramp(t, at(c, 1.6), 0.8);
  const bal = Math.sin(t * 1.3) * 0.5 + Math.sin(t * 2.9) * 0.2;
  return (
    <g>
      {/* 1 · «он ошибся» / «мне не повезло» */}
      {p1 > 0.01 && (
        <g opacity={p1}>
          <Pop t={t} at={0.3} x={360} y={720}>
            <Worker x={0} y={0} s={1.4} role="plain" color={C.orange} t={t} mood="sad" />
            <Coin x={90} y={30} s={0.6} spin={0.3} rot={70} />
          </Pop>
          <Pop t={t} at={0.5} x={980} y={720}>
            <Worker x={0} y={0} s={1.4} role="plain" color={C.skyDeep} t={t} mood="sad" />
            <Coin x={-90} y={30} s={0.6} spin={0.3} rot={-70} />
          </Pop>
          <Pop t={t} at={at(c, 0.25)} x={420} y={350}>
            <Bubble x={0} y={0} w={400} h={120} />
            <Txt x={0} y={14} size={44} weight={900} color={C.red}>
              «он ошибся»
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 0.62)} x={1000} y={350}>
            <Bubble x={0} y={0} w={460} h={120} />
            <Txt x={0} y={14} size={44} weight={900} color={C.skyDeep}>
              «мне не повезло»
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 0.3)} x={360} y={820}>
            <Txt x={0} y={0} size={38}>
              другой
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 0.65)} x={980} y={820}>
            <Txt x={0} y={0} size={38}>
              я
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 0.3)} x={680} y={160}>
            <Tag x={0} y={0} text="один промах — два объяснения" color={C.yellow} size={42} />
          </Pop>
        </g>
      )}
      {/* 2 · монетка и обложка журнала */}
      {p2 > 0.01 && (
        <g opacity={p2}>
          {[180, 330, 1050, 1200].map((x, i) => (
            <g key={i} opacity={shadows * 0.55} transform={`translate(${x} ${700 + wob(t, i, 3)})`}>
              <circle cx={0} cy={-150} r={32} fill="#8c8aa0" />
              <rect x={-34} y={-116} width={68} height={100} rx={26} fill="#8c8aa0" />
              <Txt x={0} y={-200} size={40} weight={900} color="#8c8aa0">
                ?
              </Txt>
            </g>
          ))}
          <ellipse cx={690} cy={790} rx={170 - jump * 0.4} ry={22} fill="#000" opacity={0.12} />
          <FlipCoin x={690} y={500 - jump} r={190} spin={spin} t={t} />
          <Pop t={t} at={at(c, 1.1)} x={690} y={170}>
            <Tag x={0} y={0} text="на обложках — только выигравшие" color={C.coral} textColor="#fff" size={40} />
          </Pop>
          <Pop t={t} at={at(c, 1.7)} x={690} y={850}>
            <Txt x={0} y={-12} size={38} color={C.inkSoft}>
              проигравших не видно
            </Txt>
          </Pop>
        </g>
      )}
      {/* 3 · честный вопрос */}
      {p3 > 0.01 && (
        <g opacity={p3}>
          <Pop t={t} at={at(c, 2.05)} x={690} y={480}>
            <Panel x={-470} y={-290} w={940} h={580} fill="#fff" />
            <Txt x={-400} y={-170} size={48} anchor="start">
              решение
            </Txt>
            <g transform="translate(240 -186)">
              <rect x={-150} y={-40} width={300} height={74} rx={37} fill="#e2f6ea" />
              <Txt x={-24} y={12} size={40} color={C.greenDeep}>
                разумное
              </Txt>
              <Check x={110} y={-2} s={34} k={ramp(t, at(c, 2.25), 0.5)} />
            </g>
            <Txt x={-400} y={-30} size={48} anchor="start">
              результат
            </Txt>
            <g transform="translate(240 -46)">
              <rect x={-150} y={-40} width={300} height={74} rx={37} fill="#fde4e4" />
              <Txt x={-24} y={12} size={40} color={C.red}>
                плохой
              </Txt>
              <Cross x={110} y={-2} s={40} k={ramp(t, at(c, 2.4), 0.5)} />
            </g>
            <line x1={-400} y1={40} x2={400} y2={40} stroke="#e3dccb" strokeWidth={4} />
            <g transform={`translate(-280 160)`}>
              <Coin x={0} y={0} s={1.3} spin={Math.cos(t * 4)} />
            </g>
            <Pop t={t} at={at(c, 2.6)} x={80} y={150}>
              <Txt x={0} y={0} size={46} weight={900}>
                {"ошибка — или просто\nне та сторона?"}
              </Txt>
            </Pop>
          </Pop>
        </g>
      )}
      {/* 4 · тонкая черта */}
      {p4 > 0.01 && (
        <g opacity={p4}>
          <rect x={120} y={230} width={570} height={560} rx={30} fill="#dff5e6" />
          <rect x={690} y={230} width={570} height={560} rx={30} fill="#fde4e4" />
          <line x1={690} y1={250} x2={690} y2={800} stroke={OL} strokeWidth={4} />
          <Txt x={405} y={320} size={52} weight={900} color={C.greenDeep}>
            смелый
          </Txt>
          <Txt x={975} y={320} size={52} weight={900} color={C.red}>
            безрассудный
          </Txt>
          <Star x={300} y={470} r={46} rot={t * 15} />
          <g transform="translate(1080 460)">
            <path d="M -40 40 L 0 -40 L 40 40 Z" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            <Txt x={0} y={30} size={56} weight={900}>
              !
            </Txt>
          </g>
          <g transform={`translate(${690 + bal * 40} 760) rotate(${bal * 14})`}>
            <Worker x={0} y={-30} s={1.3} role="plain" color={C.violet} t={t} arms={1.2} />
            <path d="M -130 -90 L 130 -90" stroke={C.wood} strokeWidth={8} strokeLinecap="round" />
          </g>
          <Pop t={t} at={at(c, 3.3)} x={690} y={170}>
            <Tag x={0} y={0} text="граница очень тонкая" color={C.yellow} size={44} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ═════════════ s13 · шкала «ужасно — прекрасно» ═════════════
const Gauge: React.FC<{ x: number; y: number; r: number; angle: number }> = ({ x, y, r, angle }) => {
  const COLS = [C.red, C.orange, C.yellow, "#9bd66f", C.green];
  const P = (a: number, rr: number) => `${Math.cos(a) * rr} ${Math.sin(a) * rr}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M ${-r - 40} 0 A ${r + 40} ${r + 40} 0 0 1 ${r + 40} 0 Z`} fill="#fff" stroke={OL} strokeWidth={5} />
      {COLS.map((col, i) => {
        const a0 = Math.PI + (i * Math.PI) / 5;
        const a1 = Math.PI + ((i + 1) * Math.PI) / 5;
        return <path key={i} d={`M ${P(a0, r)} A ${r} ${r} 0 0 1 ${P(a1, r)} L ${P(a1, r - 60)} A ${r - 60} ${r - 60} 0 0 0 ${P(a0, r - 60)} Z`} fill={col} stroke={OL} strokeWidth={3} />;
      })}
      <g transform={`rotate(${angle})`}>
        <path d={`M -12 0 L 0 ${-r + 30} L 12 0 Z`} fill={OL} />
      </g>
      <circle r={22} fill={C.navy} stroke={OL} strokeWidth={4} />
    </g>
  );
};

export const GoodBadMeter: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const g = pop(t, 0.2);
  const settle = ramp(t, at(c, 3.1), 2.5);
  const big = ramp(t, at(c, 3) - 0.1, 0.9);
  const wild = 80 * Math.sin(t * 1.25 + Math.sin(t * 0.5) * 1.5);
  const angle = lerp(wild, 6 * Math.sin(t * 1.6), settle);
  const p1 = phase(t, -1, at(c, 1));
  const p2 = phase(t, at(c, 1), at(c, 2));
  const p3 = phase(t, at(c, 2), at(c, 3));
  const GX = 1230;
  const gy = lerp(390, 560, big);
  const gr = lerp(200, 290, big);
  return (
    <g>
      {g > 0.01 && (
        <g transform={`translate(${GX} ${gy}) scale(${g}) translate(${-GX} ${-gy})`}>
          <Gauge x={GX} y={gy} r={gr} angle={angle} />
          <Txt x={GX - gr - 10} y={gy + 56} size={38} weight={900} color={C.red}>
            ужасно
          </Txt>
          <Txt x={GX + gr + 10} y={gy + 56} size={38} weight={900} color={C.greenDeep}>
            прекрасно
          </Txt>
        </g>
      )}
      {/* 1 · не копировать, не судить */}
      {p1 > 0.01 && (
        <g opacity={p1}>
          {[
            { x: 960, label: "не копировать\nслепо", at: 0.15 },
            { x: 1500, label: "не судить\nстрого", at: 0.55 },
          ].map((it, i) => (
            <Pop key={i} t={t} at={at(c, it.at)} x={it.x} y={680}>
              <Panel x={-240} y={-130} w={480} h={260} fill="#fff" />
              <g transform="translate(-150 -10)">
                {i === 0 ? (
                  <g>
                    <rect x={-50} y={-60} width={80} height={100} rx={8} fill="#e2f0ff" stroke={OL} strokeWidth={4} />
                    <rect x={-30} y={-40} width={80} height={100} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
                    <Star x={10} y={10} r={24} />
                  </g>
                ) : (
                  <g transform={`rotate(${-20 + Math.sin(t * 3) * 6})`}>
                    <rect x={-50} y={-30} width={100} height={44} rx={10} fill={C.wood} stroke={OL} strokeWidth={4} />
                    <rect x={-8} y={10} width={16} height={70} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
                  </g>
                )}
                <Cross x={0} y={0} s={110} k={ramp(t, at(c, it.at + 0.2), 0.5)} />
              </g>
              <Txt x={70} y={-12} size={40} weight={900}>
                {it.label}
              </Txt>
            </Pop>
          ))}
        </g>
      )}
      {/* 2 · скромность и мягкость */}
      {p2 > 0.01 && (
        <g opacity={p2}>
          <Pop t={t} at={at(c, 1.05)} x={1230} y={690}>
            <Panel x={-520} y={-150} w={1040} h={300} fill="#fff" />
            {["скромность в успехе", "мягкость к себе в неудаче"].map((s, i) => (
              <g key={i} transform={`translate(-440 ${-50 + i * 110})`}>
                <circle r={36} fill={i ? "#ffe3ec" : "#e2f6ea"} stroke={OL} strokeWidth={4} />
                <Check x={0} y={0} s={30} k={ramp(t, at(c, 1.2 + i * 0.35), 0.5)} color={i ? C.coral : C.green} />
                <Txt x={70} y={15} size={46} anchor="start" weight={900}>
                  {s}
                </Txt>
              </g>
            ))}
          </Pop>
        </g>
      )}
      {/* 3 · успех — плохой учитель */}
      {p3 > 0.01 && (
        <g opacity={p3}>
          <Pop t={t} at={at(c, 2.1)} x={900} y={700}>
            <g transform={`rotate(${wob(t, 1, 3)})`}>
              <path d="M -70 -110 L 70 -110 Q 70 -10 0 10 Q -70 -10 -70 -110 Z" fill={C.gold} stroke={OL} strokeWidth={5} />
              <path d="M -70 -90 Q -120 -90 -100 -50 Q -86 -26 -56 -36 M 70 -90 Q 120 -90 100 -50 Q 86 -26 56 -36" stroke={OL} strokeWidth={6} fill="none" />
              <rect x={-12} y={8} width={24} height={40} fill={C.gold} stroke={OL} strokeWidth={4} />
              <rect x={-56} y={46} width={112} height={30} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
              <Star x={0} y={-60} r={24} color="#fff" />
            </g>
          </Pop>
          <Pop t={t} at={at(c, 2.35)} x={1380} y={680}>
            <Txt x={0} y={-10} size={50} weight={900}>
              {"успех —\nплохой учитель"}
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 2.7)} x={1380} y={830}>
            <Tag x={0} y={-30} text="«проиграть невозможно»?" color={C.coral} textColor="#fff" size={34} />
          </Pop>
        </g>
      )}
      {/* 4 · ничто не так хорошо и не так плохо */}
      <Pop t={t} at={at(c, 3.4)} x={GX} y={720}>
        <Txt x={0} y={0} size={46} weight={900}>
          {"не так хорошо и не так плохо,\nкак кажется"}
        </Txt>
      </Pop>
    </g>
  );
};
