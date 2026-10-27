// Пять YouTube-обложек фильма BM-004 «Думай медленно… решай быстро» (канал BanaMind).
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Система 1 (оранжевая искра) и Система 2 (синий счётчик в очках) — метафоры книги,
// а не части мозга. Обложка книги — наша простая, не копия настоящего издания.
import React from "react";
import { SystemOne, SystemTwo } from "../../lesson-kahneman/visuals/chars";
import { OL } from "../../lesson-kahneman/visuals/draw";
import { S1, S2 } from "../../lesson-kahneman/theme";
import { FONTS } from "../../banamind/fonts";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/kahneman-thinking-fast-and-slow/thumbnails.json";

const TITLE = ["Думай медленно…", "решай быстро"];
const SUB = "Даниэль Канеман";
// t для персонажей: кадр с открытыми глазами (t = 0 попадает на моргание)
const T = 1;

// Молния — символ быстрой Системы 1.
const Bolt: React.FC<{ x: number; y: number; s?: number; rot?: number; fill?: string; opacity?: number }> = ({ x, y, s = 1, rot = 0, fill = S1.main, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <path d="M 18 -100 L -46 10 L -4 10 L -22 100 L 50 -18 L 6 -18 Z" fill={fill} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

// Шестерёнка.
const Gear: React.FC<{ x: number; y: number; r: number; teeth?: number; fill: string; hole?: string; stroke?: string; sw?: number; rot?: number }> = ({ x, y, r, teeth = 10, fill, hole = "#fff", stroke = OL, sw = 6, rot = 0 }) => {
  const pts: string[] = [];
  const n = teeth * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * 0.8;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon points={pts.join(" ")} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <circle r={r * 0.32} fill={hole} stroke={stroke} strokeWidth={sw} />
    </g>
  );
};

// Черепаха с панцирем-шестерёнкой — символ медленной Системы 2.
const GearTurtle: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-60, 50].map((dx) => (
      <rect key={dx} x={dx} y={-14} width={30} height={40} rx={12} fill="#7fc49a" stroke={OL} strokeWidth={5} />
    ))}
    <path d="M 92 -40 Q 150 -60 156 -20 Q 158 6 120 4 L 90 -6 Z" fill="#7fc49a" stroke={OL} strokeWidth={5} />
    <circle cx={136} cy={-26} r={6} fill={OL} />
    <path d="M -96 -6 L -122 4 L -94 10 Z" fill="#7fc49a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -100 0 Q -100 -110 0 -110 Q 100 -110 100 0 Z" fill={S2.main} stroke={OL} strokeWidth={6} />
    <Gear x={0} y={-46} r={46} teeth={8} fill={S2.light} hole={S2.main} sw={5} rot={8} />
  </g>
);

// ── №1 Классическое: банан + книга, символы двух систем, название ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(115deg, #ffe2b8 0%, #ffc98a 44%, #b9d6fb 56%, #8db8f2 100%)">
    <Glow x={330} y={420} r={300} color="#fff3d6" opacity={0.75} />
    <Bolt x={110} y={500} s={1.25} rot={-12} fill={S1.main} opacity={0.9} />
    <Bolt x={1170} y={250} s={0.6} rot={14} fill={S1.light} opacity={0.65} />
    <GearTurtle x={1080} y={640} s={1.15} />
    <Gear x={1210} y={470} r={58} teeth={9} fill={S2.light} hole="#8db8f2" rot={10} />
    <Headline
      x={640}
      y={118}
      lines={["ДУМАЙ МЕДЛЕННО…", "РЕШАЙ БЫСТРО"]}
      size={104}
      font={FONTS.display}
      anchor="middle"
      colors={["#ffffff", BRAND.yellow]}
      stroke={BRAND.ink}
      strokeWidth={18}
      lineGap={1.06}
    />
    <Host x={330} y={860} scale={0.9} pose="present" mood="happy" mouth={0.35} />
    <BookCover x={640} y={500} scale={0.6} rotate={-6} title={TITLE} titleSize={27} subtitle={SUB} color={S2.deep} accent={S1.main} />
    <Pill x={1010} y={350} text="Канеман за 30 минут" size={36} anchor="middle" bg="#ffffff" color={BRAND.ink} />
    <ChannelBadge x={840} y={440} scale={1.05} dark />
  </Frame>
);

// ── №2 Интрига: «Уверен. И неправ?» — галочка трескается в крест ──
const Intrigue: React.FC = () => (
  <Frame bg="radial-gradient(circle at 72% 45%, #3a2a4f 0%, #1c1730 50%, #0c0a18 100%)">
    <Glow x={660} y={520} r={260} color="#3fb67c" opacity={0.35} />
    <Glow x={850} y={540} r={220} color="#e5484d" opacity={0.35} />
    {/* огромная галочка: левая часть зелёная, правая трескается и краснеет */}
    <g filter="url(#softShadow)" transform="translate(-170 170)">
      <path d="M 640 360 L 760 480 L 860 380" fill="none" stroke="#3fb67c" strokeWidth={70} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 640 360 L 760 480 L 860 380" fill="none" stroke="#7ee0a8" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      {/* трещина */}
      <path d="M 852 330 L 880 372 L 866 392 L 900 430 L 884 452" fill="none" stroke="#0c0a18" strokeWidth={10} strokeLinejoin="round" />
      {/* красный крест */}
      <g transform="translate(1010 360) rotate(4)">
        <path d="M -80 -80 L 80 80 M 80 -80 L -80 80" stroke="#e5484d" strokeWidth={66} strokeLinecap="round" />
        <path d="M -80 -80 L 80 80 M 80 -80 L -80 80" stroke="#ff8f8f" strokeWidth={16} strokeLinecap="round" opacity={0.45} />
      </g>
      {/* осколки */}
      {[[905, 300, 20], [930, 470, -30], [890, 250, 50], [950, 420, 10]].map(([x, y, r], i) => (
        <path key={i} d="M 0 -14 L 12 4 L -6 14 Z" transform={`translate(${x} ${y}) rotate(${r})`} fill={i % 2 ? "#e5484d" : "#3fb67c"} />
      ))}
    </g>
    <Vignette strength={0.45} />
    <Host x={1075} y={880} scale={0.95} pose="pointUp" mood="happy" mouth={0.25} face={{ smile: 0.95, brow: 0.05, tilt: -0.2, eye: 0.92, lookX: -0.6, lookY: 0.1, cheek: 0.5 }} />
    <Headline x={52} y={170} lines={["УВЕРЕН."]} size={140} font={FONTS.heavy} weight={900} fill="#ffffff" stroke="#0c0a18" strokeWidth={18} />
    <Headline x={52} y={330} lines={["И НЕПРАВ?"]} size={140} font={FONTS.heavy} weight={900} fill="#ff5a5f" stroke="#0c0a18" strokeWidth={18} />
    <BookCover x={150} y={560} scale={0.4} rotate={-8} title={TITLE} titleSize={27} color={S2.deep} accent={S1.main} />
    <ChannelBadge x={40} y={690} scale={0.8} />
  </Frame>
);

// ── №3 Профессор: доска с двумя системами, банан в очках и бабочке ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #e9d3ad 0%, #d7b98a 100%)">
    {/* доска в деревянной раме */}
    <g filter="url(#softShadow)">
      <rect x={520} y={40} width={730} height={580} rx={18} fill="#8a5a2b" />
      <rect x={542} y={62} width={686} height={536} rx={10} fill="#24493c" />
    </g>
    <Glow x={885} y={330} r={260} color="#3c7a62" opacity={0.6} />
    <path d="M 580 110 Q 700 94 780 112" stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.18} />
    <path d="M 1000 560 Q 1100 574 1200 556" stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.18} />
    <path d="M 810 360 Q 885 410 960 360" stroke="#ffffff" strokeWidth={5} fill="none" strokeDasharray="12 10" opacity={0.6} />
    <SystemOne x={710} y={480} s={1.05} t={T} mood="happy" look={0.4} />
    <SystemTwo x={1080} y={480} s={1.0} t={T} mood="think" look={-0.4} />
    <rect x={0} y={650} width={TW} height={70} fill="#7a4e26" />
    <Host x={270} y={820} scale={0.95} pose="point" mood="happy" mouth={0.35} glasses bowtie face={{ smile: 0.7, brow: 0.25, lookX: 0.8 }} />
    <Headline x={40} y={100} lines={["2 СИСТЕМЫ", "МЫШЛЕНИЯ"]} size={84} font={FONTS.serif} weight={700} fill="#fff4d6" colors={[BRAND.yellow, "#fff4d6"]} stroke="#3b2412" strokeWidth={14} lineGap={1.05} />
    <Pill x={1010} y={690} text="Простое объяснение" size={38} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={40} y={690} scale={0.75} dark />
  </Frame>
);

// ── №4 Противопоставление: быстро или медленно ──
const Contrast: React.FC = () => (
  <Frame bg="#111">
    <defs>
      <linearGradient id="fast" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffb347" />
        <stop offset="100%" stopColor="#e0601a" />
      </linearGradient>
      <linearGradient id="slow" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#163a75" />
        <stop offset="100%" stopColor="#2c63b8" />
      </linearGradient>
    </defs>
    <path d={`M 0 0 L 700 0 L 580 ${TH} L 0 ${TH} Z`} fill="url(#fast)" />
    <path d={`M 700 0 L ${TW} 0 L ${TW} ${TH} L 580 ${TH} Z`} fill="url(#slow)" />
    {/* слева — линии скорости и молнии */}
    {Array.from({ length: 9 }).map((_, i) => (
      <path key={i} d={`M ${-20 + ((i * 97) % 200)} ${190 + i * 58} L ${260 + ((i * 131) % 260)} ${190 + i * 58}`} stroke="#fff3d6" strokeWidth={8 + (i % 3) * 4} strokeLinecap="round" opacity={0.35} />
    ))}
    <Bolt x={500} y={250} s={0.8} rot={16} fill={BRAND.yellow} />
    <Bolt x={80} y={600} s={0.55} rot={-18} fill={BRAND.yellow} opacity={0.9} />
    <SystemOne x={300} y={640} s={1.1} t={T} mood="happy" run={1} label={false} look={1} />
    {/* справа — спокойные круги, шестерёнки, Система 2 с блокнотом */}
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={1010} cy={430} r={140 + i * 70} fill="none" stroke="#cfe1fb" strokeWidth={3} opacity={0.18} />
    ))}
    <Gear x={1210} y={360} r={50} teeth={9} fill={S2.light} hole="#2c63b8" rot={6} />
    <Gear x={1150} y={430} r={30} teeth={7} fill="#9cc0f3" hole="#2c63b8" rot={20} sw={5} />
    <SystemTwo x={1010} y={650} s={1.05} t={T} mood="think" write={0} label={false} look={-1} />
    <line x1={700} y1={0} x2={580} y2={TH} stroke="#fff" strokeWidth={8} />
    <Host x={640} y={860} scale={0.88} pose="think" mood="think" face={{ lookX: 0, lookY: -0.9 }} />
    <Headline x={40} y={150} lines={["БЫСТРО"]} size={130} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#6b2a00" strokeWidth={14} rotate={-3} />
    <Headline x={1244} y={150} lines={["МЕДЛЕННО?"]} size={112} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#0b1f45" strokeWidth={14} anchor="end" />
    <Pill x={650} y={230} text="или" size={52} anchor="middle" bg={BRAND.yellow} font={FONTS.condensed} weight={700} />
    <ChannelBadge x={40} y={690} scale={0.75} dark />
  </Frame>
);

// ── №5 Самый сильный: задача про биту и мяч ──
const Bat: React.FC<{ x: number; y: number; rot: number; s?: number }> = ({ x, y, rot, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#softShadow)">
    <path d="M -230 -10 L -110 -14 Q 140 -40 220 -34 Q 250 -30 250 0 Q 250 30 220 34 Q 140 40 -110 14 L -230 10 Z" fill="#e0a45a" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -100 -8 Q 120 -26 214 -22" stroke="#fff" strokeWidth={6} opacity={0.35} fill="none" strokeLinecap="round" />
    <rect x={-250} y={-20} width={26} height={40} rx={10} fill="#3b2a10" />
    <rect x={-210} y={-12} width={90} height={24} rx={6} fill="#2c63b8" opacity={0.85} />
  </g>
);

const Ball: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`} filter="url(#softShadow)">
    <circle r={r} fill="#fffdf4" stroke={OL} strokeWidth={6} />
    <path d={`M ${-r * 0.55} ${-r * 0.8} Q ${-r * 0.1} 0 ${-r * 0.55} ${r * 0.8}`} stroke="#e5484d" strokeWidth={5} fill="none" strokeDasharray="8 6" />
    <path d={`M ${r * 0.55} ${-r * 0.8} Q ${r * 0.1} 0 ${r * 0.55} ${r * 0.8}`} stroke="#e5484d" strokeWidth={5} fill="none" strokeDasharray="8 6" />
  </g>
);

const Strong: React.FC = () => (
  <Frame bg="radial-gradient(circle at 35% 60%, #fff3b0 0%, #ffd23f 45%, #f5a300 100%)">
    <Rays x={360} y={480} color="#ffffff" count={22} opacity={0.22} />
    <Bat x={330} y={520} rot={-18} s={1.05} />
    <Ball x={560} y={560} r={56} />
    {/* общий ценник на биту и мяч */}
    <g transform="translate(250 330) rotate(-8)" filter="url(#shadow)">
      <path d="M -40 -46 L 190 -46 Q 206 -46 206 -30 L 206 30 Q 206 46 190 46 L -40 46 L -84 0 Z" fill="#ffffff" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={-48} cy={0} r={11} fill="#ffd23f" stroke={OL} strokeWidth={4} />
      <text x={70} y={22} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={64} fill={BRAND.ink}>
        1,10 $
      </text>
    </g>
    {/* мысль: монетка, перечёркнутая — первый ответ неверен */}
    <g filter="url(#shadow)">
      <circle cx={790} cy={480} r={14} fill="#fff" stroke={OL} strokeWidth={4} />
      <circle cx={760} cy={436} r={22} fill="#fff" stroke={OL} strokeWidth={4} />
      <ellipse cx={720} cy={350} rx={90} ry={70} fill="#fff" stroke={OL} strokeWidth={5} />
      <circle cx={720} cy={350} r={42} fill="#d9a441" stroke={OL} strokeWidth={5} />
      <circle cx={720} cy={350} r={30} fill="none" stroke="#f6d27a" strokeWidth={4} />
      <path d="M 670 300 L 770 400 M 770 300 L 670 400" stroke="#e5484d" strokeWidth={14} strokeLinecap="round" />
    </g>
    <Host x={1040} y={1000} scale={1.36} pose="open" mood="shock" mouth={1} round={1} face={{ lookX: -0.9, lookY: 0.1, smile: -1, brow: 1, tilt: 0.85, eye: 1.36, cheek: 0.2 }} />
    <Headline x={44} y={170} lines={["10 ЦЕНТОВ?"]} size={150} font={FONTS.display} fill="#ffffff" stroke="#5a2a00" strokeWidth={20} rotate={-3} />
    <Pill x={50} y={665} text="Большинство ошибается" size={42} bg={BRAND.ink} color={BRAND.yellow} />
    <ChannelBadge x={980} y={60} scale={0.8} dark />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/kahneman-thinking-fast-and-slow/thumbnails.json
// (их же читает проверка орфографии и отчёт); здесь только рисунки.
export const KAHNEMAN_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strong },
};
