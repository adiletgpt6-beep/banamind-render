// Пять YouTube-обложек фильма BM-027 «Ружья, микробы и сталь» (Джаред Даймонд, BanaMind).
// Пять разных постановок: два условных мира и банан между ними, банан с картой-пазлом
// и стрелками условий, три ярких кластера «ружья • микробы • сталь», путь
// «зерно → город → сеть власти», граф нескольких гипотез. Без издательской обложки,
// исторических карт, фотографий и сцен насилия — только собственная графика фильма
// (src/lesson-diamond). Ни одна обложка не изображает иерархию народов.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Animal, City, Crown, Germ, Granary, Ingot, Lens, Musket, Person, Plant, Ship, Wheat } from "../../lesson-diamond/visuals/icons";
import { Tile } from "../../lesson-diamond/visuals/lab";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/guns-germs-and-steel-diamond/thumbnails.json";

const TEAL = "#1f9a9a";
const AMBER = "#e39a2d";
const CORAL = "#e8735f";
const PLUM = "#7b5ea7";
const INK = "#1f2a3d";
const STEEL = "#7d8aa8";

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; w?: number; dash?: boolean }> = ({ x1, y1, x2, y2, color, w = 10, dash }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = w * 2.8;
  return (
    <g stroke={color} strokeWidth={w} strokeLinecap="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dash ? `${w * 2} ${w * 1.6}` : undefined} />
      <path d={`M ${x2} ${y2} L ${x2 - h * Math.cos(a - 0.5)} ${y2 - h * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - h * Math.cos(a + 0.5)} ${y2 - h * Math.sin(a + 0.5)}`} />
    </g>
  );
};

// ── №1 Два условных мира и банан между ними ──
const TwoWorlds: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #e3f0d2 0%, #e3f0d2 50%, #d4e9f5 50%, #d4e9f5 100%)">
    <Tile x={300} y={470} w={460} h={330} kind="fertile" k={1} t={0} />
    <Tile x={990} y={470} w={440} h={320} kind="island" k={1} t={0.6} />
    {[0, 1, 2, 3].map((i) => (
      <Wheat key={i} x={150 + i * 70} y={400} s={0.7} />
    ))}
    <Animal x={380} y={540} s={0.85} />
    <Plant x={930} y={430} s={0.8} fruit="#6c9a6e" />
    <Plant x={1080} y={470} s={0.7} fruit="#6c9a6e" />
    <Host x={640} y={720} scale={0.5} pose="shrug" mood="wonder" face={{ eye: 1.25, brow: 0.8 }} />
    <Headline x={640} y={112} lines={["ПОЧЕМУ ИМ", "ПОВЕЗЛО?"]} size={104} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={16} anchor="middle" lineGap={0.98} />
    <Pill x={640} y={668} text="Ружья, микробы и сталь · Даймонд" size={30} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={980} y={672} scale={0.72} dark />
  </Frame>
);

// ── №2 Банан держит карту-пазл, стрелки условий меняются ──
const MapHolder: React.FC = () => {
  const pieces = [
    [560, 300, "#d3e6cc"],
    [720, 300, "#ecd7b5"],
    [880, 300, "#d8ecf7"],
    [560, 450, "#ecd7b5"],
    [720, 450, "#d3e6cc"],
    [880, 450, "#ecd7b5"],
  ] as const;
  return (
    <Frame bg="radial-gradient(circle at 60% 55%, #fff7e6 0%, #f3e0bd 55%, #ddb984 100%)">
      <Rays x={720} y={380} color="#ffffff" count={18} opacity={0.14} />
      <g transform="translate(0 -70)">
      <g filter="url(#softShadow)">
        <rect x={470} y={215} width={500} height={320} rx={26} fill="#fff9ee" stroke={INK} strokeWidth={6} />
        {pieces.map(([x, y, c], i) => (
          <g key={i}>
            <rect x={x - 76} y={y - 70} width={152} height={140} rx={16} fill={c} stroke={INK} strokeWidth={4} />
            <circle cx={x + 76} cy={y} r={16} fill={c} stroke={INK} strokeWidth={4} />
          </g>
        ))}
      </g>
      <Arrow x1={520} y1={300} x2={840} y2={300} color={TEAL} w={12} />
      <Arrow x1={720} y1={360} x2={720} y2={500} color={PLUM} w={10} dash />
      <Wheat x={570} y={455} s={0.6} />
      <Animal x={880} y={460} s={0.55} />
      </g>
      <Host x={250} y={720} scale={0.62} pose="present" mood="think" face={{ lookX: 0.8 }} />
      <Headline x={1240} y={560} lines={["ГЕОГРАФИЯ", "РЕШАЕТ?"]} size={100} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={16} anchor="end" lineGap={0.98} />
      <ChannelBadge x={40} y={60} scale={0.72} dark />
    </Frame>
  );
};

// ── №3 Три ярких кластера: ружья • микробы • сталь ──
const Trio: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #283a5c 0%, #1f2a3d 60%, #16202f 100%)">
    {[
      { x: 230, c: "#8fb6e6" },
      { x: 640, c: CORAL },
      { x: 1050, c: "#c7cfe0" },
    ].map((g, i) => (
      <g key={i}>
        <Glow x={g.x} y={420} r={210} color={g.c} opacity={0.32} />
        <circle cx={g.x} cy={420} r={150} fill="#ffffff" opacity={0.95} />
        <circle cx={g.x} cy={420} r={150} fill="none" stroke={g.c} strokeWidth={12} />
      </g>
    ))}
    <Musket x={230} y={420} s={1.6} />
    <Germ x={640} y={420} s={1.9} t={0.3} />
    <Germ x={590} y={350} s={0.6} t={1.2} />
    <Germ x={705} y={485} s={0.55} t={2} />
    <Ingot x={1050} y={430} s={1.7} />
    <Headline x={640} y={150} lines={["РУЖЬЯ • МИКРОБЫ • СТАЛЬ"]} size={76} font={FONTS.display} fill="#fff" stroke="#0d1420" strokeWidth={14} anchor="middle" />
    <Pill x={640} y={640} text="что за ними стоит? · разбор Даймонда" size={30} bg={BRAND.yellow} anchor="middle" />
    <Host x={1180} y={710} scale={0.36} pose="pointUp" mood="wonder" />
    <ChannelBadge x={36} y={672} scale={0.72} />
  </Frame>
);

// ── №4 Зерно → город → сеть власти ──
const Power: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #fbf0d6 0%, #f0d9a8 60%, #d9b77a 100%)">
    <Glow x={640} y={430} r={300} color="#fff6d8" opacity={0.7} />
    <g>
      <circle cx={200} cy={440} r={120} fill="#fff9ee" stroke={INK} strokeWidth={6} />
      <Wheat x={170} y={440} s={1.2} />
      <Granary x={235} y={455} s={0.8} />
    </g>
    <Arrow x1={340} y1={440} x2={480} y2={440} color={TEAL} w={14} />
    <g>
      <circle cx={620} cy={440} r={130} fill="#fff9ee" stroke={INK} strokeWidth={6} />
      <City x={620} y={445} s={1.35} />
    </g>
    <Arrow x1={770} y1={440} x2={900} y2={440} color={PLUM} w={12} dash />
    <g>
      {[
        [1050, 320],
        [1170, 420],
        [1080, 540],
        [960, 460],
        [1060, 430],
      ].map(([x, y], i, a) => (
        <g key={i}>
          {i < a.length - 1 && <line x1={a[4][0]} y1={a[4][1]} x2={x} y2={y} stroke={INK} strokeWidth={6} />}
        </g>
      ))}
      {[
        [1050, 320],
        [1170, 420],
        [1080, 540],
        [960, 460],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={30} fill="#ddd2ee" stroke={INK} strokeWidth={5} />
      ))}
      <Crown x={1060} y={430} s={0.75} />
    </g>
    <Headline x={640} y={120} lines={["ГДЕ НАЧИНАЕТСЯ", "ВЛАСТЬ?"]} size={92} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={15} anchor="middle" lineGap={1.0} />
    <Host x={1150} y={720} scale={0.38} pose="ask" mood="think" />
    <ChannelBadge x={40} y={672} scale={0.72} dark />
  </Frame>
);

// ── №5 Граф нескольких гипотез ──
const Mystery: React.FC = () => {
  const nodes = [
    { x: 560, y: 300, c: "#d3e6cc", s: "#6c9a6e" },
    { x: 820, y: 250, c: "#d8ecf7", s: "#8fc3e6" },
    { x: 1060, y: 330, c: "#f8d9a6", s: AMBER },
    { x: 640, y: 520, c: "#f8cfc5", s: CORAL },
    { x: 900, y: 520, c: "#ddd2ee", s: PLUM },
    { x: 1120, y: 560, c: "#d5dbe8", s: STEEL },
  ];
  const edges = [
    [0, 1, 0],
    [1, 2, 0],
    [0, 3, 1],
    [3, 4, 0],
    [1, 4, 1],
    [4, 5, 0],
    [2, 5, 1],
  ];
  return (
    <Frame bg="radial-gradient(circle at 70% 45%, #2a5d66 0%, #1d3a48 55%, #142430 100%)">
      <Rays x={850} y={420} color="#5fd4c8" count={20} opacity={0.08} />
      {edges.map(([a, b, dash], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={dash ? "#c9b6f0" : "#5fd4c8"} strokeWidth={dash ? 7 : 10} strokeDasharray={dash ? "16 14" : undefined} strokeLinecap="round" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={62} fill={n.c} stroke={n.s} strokeWidth={8} />
        </g>
      ))}
      <Wheat x={560} y={300} s={0.55} />
      <Ship x={820} y={260} s={0.5} />
      <Person x={1060} y={330} s={1} color={TEAL} />
      <Germ x={640} y={520} s={0.6} t={0.4} />
      <Crown x={900} y={520} s={0.55} />
      <Ingot x={1120} y={565} s={0.55} />
      <Lens x={300} y={330} r={110} glow={0.7} color={TEAL} />
      <Host x={300} y={720} scale={0.42} pose="pointUp" mood="wonder" face={{ lookX: 0.8 }} />
      <Headline x={640} y={110} lines={["ТАЙНА ВЕЛИКОГО", "НЕРАВЕНСТВА"]} size={86} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke="#0d1420" strokeWidth={15} anchor="middle" lineGap={1.0} />
      <Pill x={760} y={668} text="несколько причин — не одна" size={30} bg="#5fd4c8" anchor="middle" />
      <ChannelBadge x={1040} y={672} scale={0.72} />
    </Frame>
  );
};

export const DIAMOND_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: TwoWorlds, 2: MapHolder, 3: Trio, 4: Power, 5: Mystery },
};
