// Пять YouTube-обложек фильма BM-007 «Лидер без титула» (канал BanaMind).
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Обложка книги нарисована своей простой графикой (не копия издательской обложки).
import React from "react";
import { Badge, OL, Plate, Switch, Worker } from "../../lesson-leader/visuals/draw";
import { FONTS } from "../../banamind/fonts";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/lider-bez-titula/thumbnails.json";

// обложка книги в 3/4 (своя графика)
const Cover: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#softShadow)">
    <path d="M 150 -210 L 176 -196 L 176 224 L 150 210 Z" fill="#f4ecd8" stroke={OL} strokeWidth={4} />
    <rect x={-150} y={-210} width={300} height={420} rx={14} fill="#1f3a5f" stroke={OL} strokeWidth={5} />
    <rect x={-150} y={-210} width={30} height={420} rx={10} fill="#000" opacity={0.2} />
    <rect x={-104} y={-176} width={236} height={352} rx={10} fill="none" stroke="#e8c96a" strokeWidth={4} />
    <text x={14} y={-96} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={26} fill="#e8c96a">
      Робин Шарма
    </text>
    <text x={14} y={-20} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={50} fill="#fff8e6">
      Лидер
    </text>
    <text x={14} y={36} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={42} fill="#fff8e6">
      без титула
    </text>
    <path d="M -40 80 L 68 80" stroke="#e8c96a" strokeWidth={3} />
    <path transform="translate(14 130)" d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" fill="#e8c96a" />
  </g>
);

// ── №1 Классическое: банан + книга, тёплый «офис-библиотека», название ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #ffe7b0 0%, #ffc978 55%, #ff9f5a 100%)">
    <Glow x={980} y={140} r={220} color="#fff6d8" opacity={0.8} />
    {/* полки на фоне */}
    {[0, 1].map((r) => (
      <g key={r} opacity={0.35}>
        <rect x={0} y={150 + r * 170} width={TW} height={16} fill="#8a5a2b" />
        {Array.from({ length: 34 }).map((_, i) => (
          <rect key={i} x={10 + i * 38} y={60 + r * 170 + ((i * 7 + r) % 3) * 8} width={28} height={90 - ((i * 7 + r) % 3) * 8} rx={3} fill={["#b8543d", "#3d6b8a", "#4f7a45", "#a07a2c"][(i + r) % 4]} />
        ))}
      </g>
    ))}
    <Host x={300} y={800} scale={1.02} pose="present" mood="happy" mouth={0.35} />
    <Cover x={590} y={470} s={0.72} rot={-6} />
    <Headline x={745} y={290} lines={["ЛИДЕР", "БЕЗ ТИТУЛА"]} size={76} font={FONTS.display} fill="#fff" stroke="#3a1f0a" strokeWidth={16} lineGap={1.08} />
    <Pill x={770} y={500} text="Робин Шарма" size={40} bg={BRAND.ink} color="#fff" />
    <ChannelBadge x={770} y={620} scale={1.25} dark />
  </Frame>
);

// ── №2 Интрига: «Лидер без должности?» — табличка падает, удивлённый банан ──
const Intrigue: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 40%, #2c4a7a 0%, #172a4d 55%, #0b1630 100%)">
    <Rays x={880} y={300} color="#ffd23f" count={16} opacity={0.1} />
    <Glow x={880} y={300} r={260} color="#ffd23f" opacity={0.25} />
    {/* падающая табличка «ДИРЕКТОР» */}
    <g transform="translate(800 440) rotate(24)" filter="url(#shadow)">
      <Plate x={0} y={0} text="ДИРЕКТОР" s={1.05} />
    </g>
    <path d="M 720 300 q 30 40 50 90 M 880 280 q 10 50 0 100" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5} strokeDasharray="10 14" />
    <Host x={1120} y={840} scale={0.9} pose="shock" mood="shock" mouth={0.7} round={0.8} face={{ lookX: -0.6, lookY: -0.4 }} />
    <Headline x={56} y={170} lines={["ЛИДЕР", "БЕЗ ДОЛЖНОСТИ?"]} size={96} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#050b1a" strokeWidth={14} lineGap={1.05} sizes={[110, 84]} />
    <Cover x={190} y={560} s={0.42} rot={-8} />
    <Pill x={340} y={560} text="Робин Шарма" size={30} bg="#fff" color={BRAND.ink} />
    <Vignette strength={0.45} />
    <ChannelBadge x={330} y={665} scale={0.85} />
  </Frame>
);

// ── №3 Профессор: банан в очках у доски с четырьмя словами книги ──
const WORDS: [string, string][] = [
  ["IMAGE", "#2f8fd0"],
  ["SPARK", "#8e6cf0"],
  ["HUMAN", "#3fb67c"],
  ["SHINE", "#f5b700"],
];
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #24463a 0%, #183027 100%)">
    {/* школьная доска */}
    <rect x={430} y={150} width={800} height={470} rx={18} fill="#2f5d4c" stroke="#8a5a2b" strokeWidth={16} />
    {WORDS.map(([w, c], i) => (
      <g key={w} transform={`translate(${830} ${235 + i * 100})`}>
        {w.split("").map((ch, k) => (
          <g key={k} transform={`translate(${(k - 2) * 80} 0)`}>
            <rect x={-34} y={-38} width={68} height={76} rx={12} fill={c} stroke="#0e1d17" strokeWidth={3} />
            <text x={0} y={20} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={50} fill="#fff">
              {ch}
            </text>
          </g>
        ))}
        <text x={-260} y={16} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={46} fill="#e9f5ef" opacity={0.85}>
          {i + 1}
        </text>
      </g>
    ))}
    <Host x={210} y={820} scale={0.95} pose="point" mood="happy" mouth={0.4} glasses bowtie />
    <Headline x={640} y={110} lines={["4 ПРИНЦИПА ЛИДЕРА"]} size={70} font={FONTS.display} fill={BRAND.yellow} stroke="#0e1d17" strokeWidth={12} anchor="middle" />
    <Pill x={470} y={680} text="Простое объяснение" size={38} bg={BRAND.yellow} color={BRAND.ink} />
    <ChannelBadge x={1000} y={680} scale={0.95} />
  </Frame>
);

// ── №4 Противопоставление: ЖЕРТВА | ЛИДЕР, банан с выключателем в центре ──
const Contrast: React.FC = () => (
  <Frame bg="#1a1a1a">
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#5f6b7d" />
    <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#ffcf4d" />
    {/* дождь слева, солнце справа */}
    {Array.from({ length: 40 }).map((_, i) => (
      <line key={i} x1={(i * 53) % 620} y1={(i * 97) % 720} x2={(i * 53) % 620 - 12} y2={(i * 97) % 720 + 36} stroke="#c9d3e3" strokeWidth={4} opacity={0.5} />
    ))}
    <Rays x={1100} y={140} color="#fff6c4" count={14} opacity={0.35} />
    <circle cx={1100} cy={140} r={70} fill="#fff1a8" />
    <Worker x={170} y={640} s={1.5} role="clerk" mood="sad" color="#7d8696" />
    <Worker x={1110} y={640} s={1.5} role="clerk" mood="smile" arms={1} />
    <Headline x={320} y={140} lines={["ЖЕРТВА"]} size={96} font={FONTS.display} fill="#e9eef5" stroke="#2a313d" strokeWidth={14} anchor="middle" />
    <Headline x={960} y={140} lines={["ЛИДЕР"]} size={110} font={FONTS.display} fill="#fff" stroke="#7a4b00" strokeWidth={16} anchor="middle" />
    <g transform="translate(640 315)" filter="url(#shadow)">
      <Switch x={0} y={0} s={0.42} k={1} />
    </g>
    <Host x={640} y={830} scale={0.62} pose="think" mood="think" mouth={0.1} />
    <Pill x={640} y={250} text="титул не нужен" size={34} bg={BRAND.ink} color="#fff" anchor="middle" />
    <ChannelBadge x={1000} y={660} scale={0.8} />
  </Frame>
);

// ── №5 Самый сильный: бейдж «Должность: Человек» — главная мысль книги ──
const Strong: React.FC = () => (
  <Frame bg="radial-gradient(circle at 35% 50%, #ff8a5b 0%, #e2513a 50%, #8e2222 100%)">
    <Rays x={420} y={360} color="#ffe2b0" count={18} opacity={0.18} />
    <Glow x={420} y={380} r={260} color="#ffd23f" opacity={0.45} />
    <g transform="translate(420 380) rotate(-6) scale(1.55)" filter="url(#softShadow)">
      <Badge x={0} y={0} text="Человек" sub="ДОЛЖНОСТЬ" />
    </g>
    <Host x={1060} y={840} scale={0.95} pose="pointLeft" mood="joy" mouth={0.6} round={0.2} flip />
    <Headline x={60} y={120} lines={["ТИТУЛ НЕ НУЖЕН"]} size={88} font={FONTS.heavy} weight={900} fill="#fff" stroke="#4a0d0d" strokeWidth={14} />
    <Headline x={60} y={680} lines={["ЛИДЕР БЕЗ ТИТУЛА"]} size={48} font={FONTS.display} fill={BRAND.yellow} stroke="#4a0d0d" strokeWidth={10} />
    <ChannelBadge x={980} y={80} scale={0.85} />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/lider-bez-titula/thumbnails.json
// (их же читает проверка орфографии и отчёт); здесь только рисунки.
export const LEADER_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strong },
};
