// Пять YouTube-обложек фильма BM-008 «Атомные привычки» (канал BanaMind).
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Обложка книги нарисована своей простой графикой (не копия издательской обложки).
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/james-clear-atomic-habits/thumbnails.json";

const OL = "#2e2410";

// атом — символ книги в нашем оформлении
const Atom: React.FC<{ x: number; y: number; s?: number; color?: string; core?: string }> = ({ x, y, s = 1, color = "#7fd8ff", core = BRAND.yellow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 60, 120].map((r) => (
      <ellipse key={r} rx={90} ry={32} fill="none" stroke={color} strokeWidth={8} transform={`rotate(${r + 10})`} />
    ))}
    <circle r={22} fill={core} stroke={OL} strokeWidth={5} />
    {[
      [70, -40],
      [-62, -52],
      [-20, 70],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={11} fill="#ff7a6b" stroke={OL} strokeWidth={3} />
    ))}
  </g>
);

// своя обложка книги (3/4 вид)
const Cover: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#softShadow)">
    <path d="M 150 -210 L 176 -196 L 176 224 L 150 210 Z" fill="#f4ecd8" stroke={OL} strokeWidth={4} />
    <rect x={-150} y={-210} width={300} height={420} rx={14} fill="#173a5e" stroke={OL} strokeWidth={5} />
    <rect x={-150} y={-210} width={30} height={420} rx={10} fill="#000" opacity={0.22} />
    <Atom x={12} y={-92} s={0.95} />
    <text x={12} y={40} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={44} fill="#fff">
      АТОМНЫЕ
    </text>
    <text x={12} y={90} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={44} fill={BRAND.yellow}>
      ПРИВЫЧКИ
    </text>
    <text x={12} y={156} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={26} fill="#bfe0fb">
      Джеймс Клир
    </text>
  </g>
);

// кубики-«атомы» на фоне
const Dots: React.FC<{ seed?: number; color: string; opacity?: number }> = ({ seed = 1, color, opacity = 0.35 }) => (
  <g opacity={opacity}>
    {Array.from({ length: 26 }).map((_, i) => (
      <circle key={i} cx={(i * 197 * seed + 60) % TW} cy={(i * 131 * seed + 40) % TH} r={6 + ((i * 7) % 4) * 4} fill={color} />
    ))}
  </g>
);

// ── №1 Классическое: банан + книга, светлый фон с атомами, название ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #e3f4ff 0%, #a9dbff 55%, #6cb8f0 100%)">
    <Dots color="#fff" opacity={0.55} />
    <Glow x={980} y={160} r={240} color="#ffffff" opacity={0.75} />
    <Host x={300} y={800} scale={1.02} pose="present" mood="happy" mouth={0.35} />
    <Cover x={600} y={460} s={0.74} rot={-6} />
    <Headline x={760} y={260} lines={["АТОМНЫЕ", "ПРИВЫЧКИ"]} size={84} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#0f2a44" strokeWidth={16} lineGap={1.08} />
    <Pill x={770} y={485} text="Джеймс Клир" size={40} bg="#0f2a44" color="#fff" />
    <Pill x={770} y={575} text="главные идеи" size={34} bg={BRAND.yellow} color={BRAND.ink} />
    <ChannelBadge x={770} y={665} scale={1.1} dark />
  </Frame>
);

// ── №2 Интрига: «Почему привычки не держатся?» — календарь с оборванной цепочкой ──
const Intrigue: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 40%, #3b2a6b 0%, #241a4a 55%, #120c2a 100%)">
    <Rays x={930} y={330} color="#ffd23f" count={16} opacity={0.08} />
    <Glow x={930} y={330} r={250} color="#ffd23f" opacity={0.22} />
    {/* календарь: три галочки и пустота */}
    <g transform="translate(540 470) rotate(-4)" filter="url(#shadow)">
      <rect x={-250} y={-150} width={500} height={300} rx={22} fill="#fff" stroke={OL} strokeWidth={6} />
      <rect x={-250} y={-150} width={500} height={60} rx={22} fill="#ff7a6b" />
      <rect x={-247} y={-110} width={494} height={22} fill="#ff7a6b" />
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i} transform={`translate(${-195 + i * 65} 10)`}>
          <rect x={-26} y={-26} width={52} height={52} rx={8} fill={i < 3 ? "#d9f5e5" : "#f1f2f6"} stroke={OL} strokeWidth={3} />
          {i < 3 && <path d="M -14 0 L -4 12 L 16 -12" stroke="#23895a" strokeWidth={7} fill="none" strokeLinecap="round" />}
        </g>
      ))}
    </g>
    <Host x={1110} y={840} scale={0.9} pose="shock" mood="shock" mouth={0.7} round={0.8} face={{ lookX: -0.6, lookY: -0.2 }} />
    <Headline x={56} y={140} lines={["ПОЧЕМУ ПРИВЫЧКИ", "НЕ ДЕРЖАТСЯ?"]} size={84} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#07051a" strokeWidth={14} lineGap={1.1} sizes={[78, 96]} />
    <Cover x={140} y={500} s={0.4} rot={-8} />
    <Vignette strength={0.45} />
    <ChannelBadge x={60} y={680} scale={0.8} />
  </Frame>
);

// ── №3 Профессор: банан в очках у доски с четырьмя законами ──
const LAWS: [string, string][] = [
  ["ОЧЕВИДНО", "#6cc5f0"],
  ["ПРИВЛЕКАТЕЛЬНО", "#ff8fb1"],
  ["ПРОСТО", "#3fb67c"],
  ["ПРИЯТНО", "#ffd23f"],
];
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #24463a 0%, #183027 100%)">
    <rect x={430} y={150} width={800} height={470} rx={18} fill="#2f5d4c" stroke="#8a5a2b" strokeWidth={16} />
    {LAWS.map(([w, c], i) => (
      <g key={w} transform={`translate(${830} ${232 + i * 100})`}>
        <rect x={-320} y={-38} width={640} height={76} rx={38} fill={c} stroke="#0e1d17" strokeWidth={4} />
        <circle cx={-280} cy={0} r={28} fill="#fff" stroke="#0e1d17" strokeWidth={3} />
        <text x={-280} y={12} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={BRAND.ink}>
          {i + 1}
        </text>
        <text x={20} y={16} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={46} fill={BRAND.ink}>
          {w}
        </text>
      </g>
    ))}
    <Host x={210} y={820} scale={0.95} pose="point" mood="happy" mouth={0.4} glasses bowtie />
    <Headline x={640} y={112} lines={["4 ЗАКОНА ПРИВЫЧЕК"]} size={72} font={FONTS.display} fill={BRAND.yellow} stroke="#0e1d17" strokeWidth={12} anchor="middle" />
    <Pill x={470} y={680} text="Простое объяснение" size={38} bg={BRAND.yellow} color={BRAND.ink} />
    <ChannelBadge x={990} y={680} scale={0.95} />
  </Frame>
);

// ── №4 Противопоставление: −1 % в день | +1 % в день, банан в центре ──
const Contrast: React.FC = () => {
  const up = Array.from({ length: 40 }, (_, i) => {
    const x = i / 39;
    return `${700 + x * 520},${600 - (Math.pow(1.01, x * 365) - 1) / 36.8 * 400 - 20}`;
  }).join(" ");
  const down = Array.from({ length: 40 }, (_, i) => {
    const x = i / 39;
    return `${60 + x * 520},${200 + (1 - Math.pow(0.99, x * 365)) * 380}`;
  }).join(" ");
  return (
    <Frame bg="#1a1a1a">
      <rect x={0} y={0} width={TW / 2} height={TH} fill="#5f6b7d" />
      <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#ffcf4d" />
      {Array.from({ length: 36 }).map((_, i) => (
        <line key={i} x1={(i * 53) % 620} y1={(i * 97) % 720} x2={(i * 53) % 620 - 12} y2={(i * 97) % 720 + 36} stroke="#c9d3e3" strokeWidth={4} opacity={0.4} />
      ))}
      <Rays x={1120} y={120} color="#fff6c4" count={14} opacity={0.35} />
      <polyline points={down} fill="none" stroke="#e5484d" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" filter="url(#shadow)" />
      <polyline points={up} fill="none" stroke="#1f9a5a" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" filter="url(#shadow)" />
      <Headline x={320} y={130} lines={["−1 % В ДЕНЬ"]} size={74} font={FONTS.display} fill="#e9eef5" stroke="#2a313d" strokeWidth={14} anchor="middle" />
      <Headline x={960} y={130} lines={["+1 % В ДЕНЬ"]} size={80} font={FONTS.display} fill="#fff" stroke="#7a4b00" strokeWidth={16} anchor="middle" />
      <Host x={640} y={770} scale={0.66} pose="think" mood="think" mouth={0.1} />
      <Pill x={640} y={300} text="маленькие привычки" size={34} bg={BRAND.ink} color="#fff" anchor="middle" />
      <ChannelBadge x={990} y={665} scale={0.8} />
    </Frame>
  );
};

// ── №5 Самый сильный: «Правило 2 минут» — кроссовок и лесенка к цели ──
const Strong: React.FC = () => (
  <Frame bg="radial-gradient(circle at 35% 55%, #ffa96b 0%, #f0633c 55%, #9e2a1d 100%)">
    <Rays x={420} y={420} color="#ffe2b0" count={18} opacity={0.18} />
    <Glow x={420} y={430} r={260} color="#ffd23f" opacity={0.45} />
    {/* лесенка: первая ступень подсвечена */}
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={170 + i * 100} y={620 - (i + 1) * 70} width={100} height={(i + 1) * 70 + 40} fill={i === 0 ? BRAND.yellow : "#fff3e8"} stroke={OL} strokeWidth={5} opacity={i === 0 ? 1 : 0.85} />
    ))}
    {/* кроссовок на первой ступени */}
    <g transform="translate(220 500) scale(2.4)" filter="url(#shadow)">
      <path d="M -40 10 L -36 -24 L -10 -24 Q 0 -6 20 -4 Q 40 0 42 18 L -40 18 Z" fill="#2f8fd0" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
      <path d="M -30 -14 L -12 -14 M -28 -6 L -8 -6" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <rect x={-42} y={16} width={86} height={7} rx={3} fill="#fff" stroke={OL} strokeWidth={2} />
    </g>
    <Host x={1070} y={840} scale={0.95} pose="pointLeft" mood="joy" mouth={0.6} round={0.2} flip />
    <Headline x={60} y={130} lines={["ПРАВИЛО", "2 МИНУТ"]} size={104} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#4a0d0d" strokeWidth={15} lineGap={1.0} />
    <Pill x={60} y={680} text="Атомные привычки · Джеймс Клир" size={30} bg="#fff" color={BRAND.ink} />
    <ChannelBadge x={990} y={70} scale={0.85} />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/james-clear-atomic-habits/thumbnails.json
// (их же читает проверка орфографии и отчёт); здесь только рисунки.
export const HABITS_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strong },
};
