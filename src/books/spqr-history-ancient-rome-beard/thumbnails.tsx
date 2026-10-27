// Пять YouTube-обложек фильма BM-040 «Кого Рим считал своим?» (BanaMind).
// Пять разных сюжетов из графики фильма: банан у ворот со знаком принадлежности;
// банан связывает центр с дальними точками; профессор у схемы власти; гражданин и
// правитель в одной сцене; банан у открывающихся ворот с меняющейся границей группы.
// Без издательской обложки, имени автора и названия книги, без фотографий, точных
// карт и сцен насилия — только собственная векторная и точечная графика фильма.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Particles } from "./film/visuals/particles";
import { Figure } from "./film/visuals/props";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/spqr-history-ancient-rome-beard/thumbnails.json";

const TEAL = "#1f9a9a";
const AMBER = "#e39a2d";
const CORAL = "#e8735f";
const PLUM = "#7b5ea7";
const SAGE = "#6c9a6e";
const SKY = "#8fc3e6";
const INK = "#1f2a3d";
const STONE = "#e9dfcc";
const STONE_D = "#c9b796";

// неподвижные точечные образы (сборка завершена: t далеко после начала)
const Dots: React.FC<{ shape: string; x: number; y: number; s: number; step?: number }> = ({ shape, x, y, s, step = 14 }) => (
  <Particles shape={shape} t={30} at={0} x={x} y={y} s={s} r={step * 0.42} step={step} />
);

// ── №1 Классическая: банан у ворот, в руке знак принадлежности ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #fdf3e1 0%, #f3dcc0 100%)">
    <Rays x={880} y={420} color="#e39a2d" opacity={0.16} />
    <Dots shape="gate" x={930} y={500} s={0.66} />
    <Host x={360} y={760} scale={0.62} pose="present" mood="wonder" face={{ eye: 1.15 }} />
    <g transform="translate(590 480) rotate(-8)">
      <rect x={-110} y={-80} width={220} height={175} rx={18} fill="#fff9ee" stroke={INK} strokeWidth={5} filter="url(#softShadow)" />
      <Dots shape="diploma" x={0} y={0} s={0.33} step={14} />
    </g>
    <Headline x={640} y={118} lines={["КТО ТАКОЙ", "РИМЛЯНИН?"]} size={106} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={16} anchor="middle" lineGap={0.98} />
    <ChannelBadge x={980} y={672} scale={0.72} dark />
  </Frame>
);

// ── №2 Интрига: банан соединяет центр с дальними точками ──
const NETWORK: [number, number][] = [
  [230, 330],
  [1080, 300],
  [1130, 560],
  [860, 650],
  [300, 600],
  [190, 420],
];
const Network: React.FC = () => (
  <Frame bg="radial-gradient(circle at 50% 55%, #eaf6fb 0%, #bfe1f0 70%, #9fd0e6 100%)">
    {NETWORK.map(([x, y], i) => (
      <g key={i}>
        <line x1={640} y1={430} x2={x} y2={y} stroke={AMBER} strokeWidth={9} strokeLinecap="round" strokeDasharray={i % 2 ? "22 14" : undefined} />
        <circle cx={x} cy={y} r={30} fill={TEAL} stroke={INK} strokeWidth={6} />
        <circle cx={x} cy={y} r={12} fill="#fff" />
      </g>
    ))}
    <Glow x={640} y={430} r={150} color="#fff7d6" opacity={0.9} />
    <circle cx={640} cy={430} r={62} fill={CORAL} stroke={INK} strokeWidth={8} />
    <text x={640} y={447} fontFamily={FONTS.heavy} fontWeight={900} fontSize={44} fill="#fff" textAnchor="middle">
      РИМ
    </text>
    <Host x={1010} y={790} scale={0.5} pose="point" mood="happy" flip />
    <Headline x={60} y={128} lines={["РИМ —", "НЕ ТОЛЬКО ГОРОД"]} size={92} font={FONTS.display} fill="#fff" colors={["#ffd23f", "#fff"]} stroke={INK} strokeWidth={15} anchor="start" lineGap={1.0} />
    <ChannelBadge x={40} y={672} scale={0.72} dark />
  </Frame>
);

// ── №3 Профессор: очки и ясная схема власти ──
const Professor: React.FC = () => {
  const cols = [
    ["СЕНАТ", TEAL, 150],
    ["НАРОД", AMBER, 90],
    ["ОДИН", CORAL, 300],
  ] as const;
  return (
    <Frame bg="linear-gradient(180deg, #f7f2e4 0%, #e8dcbc 100%)">
      <g transform="translate(560 0)">
        <polygon points="20,250 330,150 640,250" fill={STONE} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <rect x={20} y={250} width={620} height={34} fill={STONE_D} stroke={INK} strokeWidth={6} />
        {cols.map(([label, col, h], i) => (
          <g key={i} transform={`translate(${90 + i * 200} 0)`}>
            <rect x={-55} y={620 - h} width={110} height={h} rx={14} fill={col} stroke={INK} strokeWidth={6} />
            <text x={0} y={670} fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={INK} textAnchor="middle">
              {label}
            </text>
          </g>
        ))}
        <rect x={20} y={620} width={620} height={18} fill={STONE_D} stroke={INK} strokeWidth={5} />
        <text x={330} y={232} fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={INK} textAnchor="middle">
          ?
        </text>
      </g>
      <Host x={300} y={770} scale={0.6} pose="pointUp" mood="think" glasses bowtie />
      <Headline x={640} y={112} lines={["КТО ЗДЕСЬ РЕШАЕТ?"]} size={94} font={FONTS.display} fill="#fff" stroke={INK} strokeWidth={15} anchor="middle" />
      <Pill x={300} y={250} text="простое объяснение" size={30} bg={BRAND.yellow} anchor="middle" />
      <ChannelBadge x={40} y={672} scale={0.72} dark />
    </Frame>
  );
};

// ── №4 Противопоставление: гражданин и правитель в одной сцене ──
const Contrast: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #d8ecf7 0%, #d8ecf7 50%, #f8d9a6 50%, #f8d9a6 100%)">
    {/* слева — гражданин опускает табличку */}
    <Dots shape="ballot" x={270} y={480} s={0.48} step={16} />
    {[0, 1, 2].map((i) => (
      <Figure key={i} x={120 + i * 120} y={700} s={0.42} color={[TEAL, SAGE, PLUM][i]} />
    ))}
    {/* справа — один правитель на возвышении */}
    <rect x={900} y={520} width={300} height={160} rx={16} fill={STONE} stroke={INK} strokeWidth={7} />
    <rect x={930} y={430} width={240} height={100} rx={16} fill={STONE_D} stroke={INK} strokeWidth={7} />
    <Figure x={1050} y={440} s={0.7} color={CORAL} />
    <Host x={640} y={760} scale={0.55} pose="shrug" mood="think" />
    <Headline x={640} y={118} lines={["ГРАЖДАНИН", "≠ ПРАВИТЕЛЬ"]} size={96} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={15} anchor="middle" lineGap={1.0} />
    <ChannelBadge x={980} y={44} scale={0.62} dark />
  </Frame>
);

// ── №5 Самая сильная: банан у открывающихся ворот, граница группы раздвигается ──
const Strongest: React.FC = () => (
  <Frame bg="radial-gradient(circle at 60% 50%, #fff6e4 0%, #f7dfb2 75%, #f0c98a 100%)">
    <Rays x={760} y={420} color="#ffd23f" opacity={0.22} />
    {/* меняющаяся граница группы: старый круг пунктиром, новый — шире */}
    <ellipse cx={760} cy={470} rx={300} ry={210} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="18 16" opacity={0.45} />
    <ellipse cx={760} cy={470} rx={470} ry={300} fill="none" stroke={CORAL} strokeWidth={10} />
    <Dots shape="gate" x={760} y={430} s={0.6} />
    <rect x={760 - 72} y={430 - 24} width={144} height={190} fill="#fff7e2" />
    <rect x={760 - 72} y={430 - 6} width={28} height={168} fill={AMBER} stroke={INK} strokeWidth={4} />
    <rect x={760 + 44} y={430 - 6} width={28} height={168} fill={AMBER} stroke={INK} strokeWidth={4} />
    {[TEAL, SAGE, PLUM, SKY, AMBER].map((c, i) => (
      <Figure key={i} x={560 + i * 95} y={700 - (i % 2) * 18} s={0.3} color={c} />
    ))}
    <Host x={250} y={790} scale={0.66} pose="open" mood="wonder" mouth={0.5} round={0.4} face={{ eye: 1.25, brow: 0.8 }} />
    <Headline x={1240} y={130} lines={["КТО ЗДЕСЬ", "СВОЙ?"]} size={112} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={17} anchor="end" lineGap={0.96} />
    <ChannelBadge x={980} y={672} scale={0.72} dark />
  </Frame>
);

export const SPQR_THUMBNAILS: BookThumbnails = {
  ...meta,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  components: { 1: Classic, 2: Network, 3: Professor, 4: Contrast, 5: Strongest },
};
