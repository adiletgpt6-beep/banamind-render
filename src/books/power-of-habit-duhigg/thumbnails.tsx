// Пять YouTube-обложек фильма BM-035 «Сила привычки» (Чарлз Дахигг, BanaMind).
// Пять разных постановок «Лаборатории невидимых кнопок»: банан над городом с
// прозрачными петлями, рука тянется к телефону и петля в отражении стекла,
// три крупные точки петли с бананом сбоку, две конкурирующие схемы выбора,
// цепная реакция точек в организации. Без издательской обложки, логотипов
// компаний и фотографий — только собственная графика фильма (src/lesson-duhigg).
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/power-of-habit-duhigg/thumbnails.json";

const CUE = "#ff7a3d";
const ROUTINE = "#2f8fd8";
const REWARD = "#f2b01e";
const CRAVE = "#8a63d2";
const INK = "#1f2a3d";
const OL = "#24283a";

// Точка петли: круг с бликом и мягким свечением.
const Dot: React.FC<{ x: number; y: number; r: number; c: string; glow?: number }> = ({ x, y, r, c, glow = 0 }) => (
  <g>
    {glow > 0 && <circle cx={x} cy={y} r={r * 1.9} fill={c} opacity={0.18 * glow} />}
    {glow > 0 && <circle cx={x} cy={y} r={r * 1.4} fill={c} opacity={0.25 * glow} />}
    <circle cx={x} cy={y} r={r} fill={c} stroke={OL} strokeWidth={Math.max(3, r * 0.08)} />
    <circle cx={x - r * 0.3} cy={y - r * 0.32} r={r * 0.38} fill="#fff" opacity={0.4} />
  </g>
);

// Петля: три точки на окружности и дуги-стрелки между ними.
const Loop: React.FC<{ cx: number; cy: number; R: number; r: number; w?: number; op?: number }> = ({ cx, cy, R, r, w = 10, op = 1 }) => {
  const pts = [-150, -30, 90].map((a) => [cx + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)]);
  const arc = (a0: number, a1: number, c: string) => {
    const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)];
    const p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
    return <path d={`M ${p0[0]} ${p0[1]} A ${R} ${R} 0 0 1 ${p1[0]} ${p1[1]}`} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />;
  };
  const g = 0.42;
  const d = (x: number) => (x * Math.PI) / 180;
  return (
    <g opacity={op}>
      {arc(d(-150) + g, d(-30) - g, ROUTINE)}
      {arc(d(-30) + g, d(90) - g, REWARD)}
      {arc(d(90) + g, d(210) - g, CUE)}
      <Dot x={pts[0][0]} y={pts[0][1]} r={r} c={CUE} />
      <Dot x={pts[1][0]} y={pts[1][1]} r={r} c={ROUTINE} />
      <Dot x={pts[2][0]} y={pts[2][1]} r={r} c={REWARD} glow={1} />
    </g>
  );
};

// ── №1 «КТО УПРАВЛЯЕТ?» — банан над городом, над окнами — прозрачные петли ──
const City: React.FC = () => {
  const houses = [
    { x: 520, w: 150, h: 300, c: "#f3d6c6" },
    { x: 690, w: 170, h: 390, c: "#d8ecf7" },
    { x: 880, w: 140, h: 260, c: "#fde9b3" },
    { x: 1040, w: 190, h: 420, c: "#e3e7ef" },
  ];
  return (
    <Frame bg="linear-gradient(180deg, #24345a 0%, #3b4f86 55%, #6f7fb5 100%)">
      <Rays x={880} y={300} color="#ffd9a8" count={18} opacity={0.08} />
      {houses.map((h, i) => (
        <g key={i}>
          <rect x={h.x} y={640 - h.h} width={h.w} height={h.h} rx={12} fill={h.c} stroke={OL} strokeWidth={5} />
          {Array.from({ length: Math.floor(h.h / 80) }, (_, r) =>
            [0, 1].map((c) => <rect key={`${r}${c}`} x={h.x + 22 + c * (h.w / 2 - 6)} y={640 - h.h + 30 + r * 80} width={h.w / 2 - 38} height={40} rx={6} fill="#fff6d8" opacity={0.95} />),
          )}
        </g>
      ))}
      <rect x={480} y={640} width={800} height={20} fill="#9aa3b5" />
      {/* прозрачный слой с петлями */}
      <rect x={490} y={170} width={760} height={470} rx={30} fill="#fff" opacity={0.12} stroke="#fff" strokeWidth={3} strokeDasharray="14 10" />
      {[
        [600, 330, 46],
        [780, 260, 56],
        [950, 430, 44],
        [1130, 300, 52],
        [760, 520, 40],
      ].map(([x, y, R], i) => (
        <Loop key={i} cx={x} cy={y} R={R} r={R * 0.34} w={6} />
      ))}
      <Host x={250} y={720} scale={0.6} pose="pointUp" mood="wonder" face={{ lookX: 0.7, eye: 1.2 }} />
      <Headline x={730} y={125} lines={["КТО УПРАВЛЯЕТ?"]} size={100} font={FONTS.display} fill="#fff" stroke="#0d1420" strokeWidth={16} anchor="middle" />
      <Pill x={880} y={690} text="Сила привычки · Дахигг" size={30} bg={BRAND.yellow} anchor="middle" />
      <ChannelBadge x={36} y={60} scale={0.72} />
    </Frame>
  );
};

// ── №2 «ПОЧЕМУ ОПЯТЬ?» — рука тянется к телефону, в стекле отражается петля ──
const Phone: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 55%, #fff1e2 0%, #f5d2b4 55%, #e2a988 100%)">
    <Glow x={880} y={420} r={300} color="#ffffff" opacity={0.6} />
    {/* телефон крупно */}
    <g transform="translate(880 420) rotate(-8)">
      <rect x={-190} y={-290} width={380} height={580} rx={50} fill={OL} />
      <rect x={-165} y={-255} width={330} height={500} rx={30} fill="#1d2840" />
      {/* отражение петли в стекле */}
      <Loop cx={0} cy={-10} R={120} r={42} w={12} op={0.95} />
      <path d="M -150 -240 L 40 -240 L -150 60 Z" fill="#fff" opacity={0.08} />
      <circle cx={120} cy={-215} r={22} fill={CUE} stroke="#fff" strokeWidth={4} />
    </g>
    {/* рука в рукаве тянется к телефону */}
    <g transform="translate(560 560) rotate(-22)">
      <rect x={-420} y={-48} width={400} height={96} rx={48} fill="#cfe5f7" stroke={OL} strokeWidth={6} />
      <ellipse cx={10} cy={0} rx={70} ry={54} fill="#f1c9a5" stroke={OL} strokeWidth={6} />
      <rect x={50} y={-44} width={80} height={30} rx={15} fill="#f1c9a5" stroke={OL} strokeWidth={5} />
    </g>
    <Headline x={50} y={150} lines={["ПОЧЕМУ", "ОПЯТЬ?"]} size={118} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={17} anchor="start" lineGap={0.98} />
    <Host x={1170} y={730} scale={0.4} pose="shrug" mood="confused" />
    <ChannelBadge x={40} y={672} scale={0.72} dark />
  </Frame>
);

// ── №3 «3 НЕВИДИМЫХ ШАГА» — сигнал → действие → награда, крупный банан сбоку ──
const Steps: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #fdf5ea 0%, #f7e3c4 100%)">
    <Glow x={760} y={430} r={360} color="#ffffff" opacity={0.7} />
    {[
      { x: 470, c: CUE, t: "СИГНАЛ" },
      { x: 760, c: ROUTINE, t: "ДЕЙСТВИЕ" },
      { x: 1050, c: REWARD, t: "НАГРАДА" },
    ].map((s, i) => (
      <g key={i}>
        <Dot x={s.x} y={420} r={92} c={s.c} glow={i === 2 ? 1.2 : 0.5} />
        <text x={s.x} y={575} fontFamily={FONTS.heavy} fontWeight={900} fontSize={40} fill={INK} textAnchor="middle">
          {s.t}
        </text>
      </g>
    ))}
    {[0, 1].map((i) => (
      <path key={i} d={`M ${560 + i * 290} 420 L ${668 + i * 290} 420 M ${646 + i * 290} 398 L ${672 + i * 290} 420 L ${646 + i * 290} 442`} stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ))}
    <path d="M 1050 320 Q 760 150 470 320" fill="none" stroke={CUE} strokeWidth={8} strokeDasharray="16 14" />
    <Host x={185} y={740} scale={0.62} pose="count" mood="wonder" />
    <Headline x={760} y={150} lines={["3 НЕВИДИМЫХ ШАГА"]} size={82} font={FONTS.display} fill="#fff" colors={["#fff"]} stroke={INK} strokeWidth={15} anchor="middle" />
    <Pill x={660} y={668} text="Сила привычки · Чарлз Дахигг" size={30} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={1000} y={680} scale={0.72} dark />
  </Frame>
);

// ── №4 «ВОЛЯ НЕ ПОМОЖЕТ?» — две конкурирующие схемы выбора ──
const Will: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #f6e1dc 0%, #f6e1dc 50%, #dcebdc 50%, #dcebdc 100%)">
    {/* слева: «сжать зубы» — натянутая стрелка против петли */}
    <g>
      <Loop cx={330} cy={420} R={130} r={44} w={11} />
      <path d="M 120 250 L 270 360" stroke="#cc4646" strokeWidth={18} strokeLinecap="round" />
      <path d="M 250 330 L 275 365 L 232 368" stroke="#cc4646" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={330} y={640} fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={INK} textAnchor="middle">
        сила воли против петли
      </text>
    </g>
    {/* справа: тот же сигнал и награда, новое действие */}
    <g>
      <Loop cx={950} cy={420} R={130} r={44} w={11} />
      <circle cx={950 + 130 * Math.cos(-Math.PI / 6)} cy={420 + 130 * Math.sin(-Math.PI / 6)} r={62} fill="none" stroke="#3f9b5a" strokeWidth={10} strokeDasharray="12 9" />
      <text x={950} y={640} fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={INK} textAnchor="middle">
        план заранее
      </text>
    </g>
    <Host x={640} y={740} scale={0.46} pose="think" mood="think" />
    <Headline x={640} y={140} lines={["ВОЛЯ НЕ ПОМОЖЕТ?"]} size={96} font={FONTS.display} fill="#fff" colors={["#fff"]} stroke={INK} strokeWidth={16} anchor="middle" />
    <ChannelBadge x={1000} y={690} scale={0.72} dark />
  </Frame>
);

// ── №5 «МЕНЯЕТСЯ ВСЁ» — цепная реакция малых точек в организации ──
const Chain: React.FC = () => {
  const cols = 10;
  const rows = 5;
  return (
    <Frame bg="radial-gradient(circle at 25% 60%, #3a2a5c 0%, #241c3d 60%, #171329 100%)">
      <Rays x={250} y={460} color="#ffb37a" count={22} opacity={0.08} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const d = Math.hypot(c, r - 2);
        const lit = d < 7.2;
        const col = c === 0 && r === 2 ? CUE : lit ? [ROUTINE, REWARD, "#6c9a6e", CRAVE][(c + r) % 4] : "#4a4466";
        const rr = c === 0 && r === 2 ? 34 : 20 + Math.max(0, 7.2 - d) * 1.4;
        return <circle key={i} cx={250 + c * 98} cy={300 + r * 86} r={rr} fill={col} stroke="#0d0a18" strokeWidth={3} opacity={lit ? 1 : 0.7} />;
      })}
      {[1, 2, 3].map((k) => (
        <circle key={k} cx={250} cy={472} r={60 + k * 70} fill="none" stroke={CUE} strokeWidth={6} opacity={0.5 - k * 0.12} />
      ))}
      <Headline x={640} y={150} lines={["МЕНЯЕТСЯ ВСЁ"]} size={110} font={FONTS.display} fill="#fff" colors={["#ffd23f"]} stroke="#0d0a18" strokeWidth={16} anchor="middle" />
      <Pill x={640} y={232} text="одна краеугольная привычка" size={30} bg="#ffffff" anchor="middle" />
      <Host x={1170} y={740} scale={0.42} pose="cheer" mood="joy" />
      <ChannelBadge x={36} y={672} scale={0.72} />
    </Frame>
  );
};

export const DUHIGG_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: City, 2: Phone, 3: Steps, 4: Will, 5: Chain },
};
