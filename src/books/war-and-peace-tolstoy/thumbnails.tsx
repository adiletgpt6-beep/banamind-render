// Пять YouTube-обложек фильма BM-030 «Война и мир» (канал BanaMind).
// Пять разных постановок: стрела полководца распадается на точки-решения,
// цена славы (небо и золото), тёплый дом против войны, план против поля,
// свобода за решёткой под звёздами. Только собственные рисунки фильма
// (силуэты эпохи, точки, карты) — без кадров экранизаций, актёров и картин.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BigArrow, DotNet, Figure, makeDots, rnd, SmallArrow } from "./film/visuals/draw";
import { ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/war-and-peace-tolstoy/thumbnails.json";

const DOTS = ["#3fd6ff", "#ffd23f", "#ff8fc7", "#9be15d", "#b18cff", "#ff9f43", "#5cf2c8", "#ff6b6b"];
const PAPER = "#f5ecd8";
const GOLD = "#f2b33d";

const Star: React.FC<{ x: number; y: number; r: number; fill: string }> = ({ x, y, r, fill }) => (
  <polygon
    transform={`translate(${x} ${y})`}
    points={Array.from({ length: 10 })
      .map((_, i) => {
        const rr = i % 2 ? r * 0.42 : r;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
      })
      .join(" ")}
    fill={fill}
    stroke="#fff"
    strokeWidth={6}
  />
);

// ── №1 «КТО ПИШЕТ ИСТОРИЮ?» — стрела рассыпается в сеть точек ──
const History: React.FC = () => {
  const dots = makeDots(70, 960, 330, 290, 230, 5);
  return (
    <Frame bg="linear-gradient(160deg, #1d2a5c 0%, #2f4378 55%, #4f6aa8 100%)">
      {/* старая карта */}
      <g transform="translate(560 120) rotate(-3)">
        <rect x={0} y={0} width={680} height={460} rx={22} fill={PAPER} opacity={0.95} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M 10 ${60 + i * 90} Q 340 ${30 + i * 90} 670 ${70 + i * 90}`} stroke="#b89a6a" strokeOpacity={0.5} strokeWidth={4} fill="none" />
        ))}
      </g>
      <BigArrow x1={600} y1={520} x2={830} y2={330} w={78} color="#d9534f" />
      {/* обломки стрелы → стрелки-решения */}
      {Array.from({ length: 26 }).map((_, i) => (
        <SmallArrow key={i} x={820 + rnd(i) * 360} y={170 + rnd(i + 9) * 360} ang={-30 + (rnd(i + 3) - 0.5) * 140} len={36} color={DOTS[i % 8]} />
      ))}
      <DotNet dots={dots} t={0} k={1} links={2} drift={0} linkColor="#1d2340" linkOpacity={0.22} />
      <Host x={260} y={760} scale={0.92} pose="think" mood="think" face={{ lookX: 0.9, lookY: -0.3, brow: 0.4 }} />
      <Headline x={40} y={130} lines={["КТО ПИШЕТ", "ИСТОРИЮ?"]} size={104} font={FONTS.display} colors={["#fff", "#ffd23f"]} stroke="#101a3a" strokeWidth={16} />
      <Pill x={640} y={640} text="Война и мир" size={34} bg={PAPER} />
      <ChannelBadge x={990} y={668} scale={0.85} dark />
      <Vignette strength={0.45} />
    </Frame>
  );
};

// ── №2 «ЦЕНА СЛАВЫ» — холодное небо и золотая награда ──
const Glory: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #5f8fd0 0%, #9cc7f0 55%, #dce9f7 100%)">
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${120 + i * 230} ${110 + (i % 2) * 70}) scale(${0.8 + (i % 2) * 0.3})`} fill="#fff" opacity={0.85}>
        <ellipse cx={0} cy={0} rx={120} ry={34} />
        <circle cx={-50} cy={-18} r={40} />
        <circle cx={10} cy={-34} r={52} />
        <circle cx={66} cy={-14} r={36} />
      </g>
    ))}
    <path d="M -20 640 Q 400 600 800 630 L 800 740 L -20 740 Z" fill="#6f8a5c" />
    {/* маленький силуэт на поле, знамя рядом */}
    <Figure who="andrei" x={360} y={620} s={0.42} pose="lie" t={0} fill="#1d2340" rim="#cfd8ff" />
    <g transform="translate(480 640) rotate(80)">
      <rect x={-4} y={-200} width={8} height={200} fill="#5a3f22" />
      <path d="M 4 -196 Q 50 -206 100 -192 Q 86 -160 100 -130 Q 50 -144 4 -138 Z" fill={GOLD} />
    </g>
    {/* золото справа */}
    <rect x={820} y={0} width={460} height={720} fill="#2a1e0c" />
    <Rays x={1050} y={330} color="#ffd98a" count={18} opacity={0.12} />
    <Glow x={1050} y={330} r={210} color={GOLD} opacity={0.45} />
    <g transform="translate(1050 140)">
      <path d="M -60 0 L -20 160 L 20 160 L 60 0 Z" fill="#c94a4a" />
      <path d="M -20 0 L 0 160 L 20 0 Z" fill="#fff" opacity={0.7} />
    </g>
    <Star x={1050} y={360} r={150} fill={GOLD} />
    <Host x={700} y={790} scale={0.72} pose="shrug" mood="think" face={{ lookX: 0.8, smile: -0.1 }} />
    <Headline x={40} y={300} lines={["ЦЕНА", "СЛАВЫ"]} size={150} font={FONTS.display} colors={["#fff", "#ffd23f"]} stroke="#101a3a" strokeWidth={18} />
    <ChannelBadge x={40} y={668} scale={0.85} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №3 «ЧТО ВАЖНЕЕ ВОЙНЫ?» — тёплый дом и нити между людьми ──
const Home: React.FC = () => {
  const people: { who: "natasha" | "pierre" | "marya" | "nikolai" | "countessR"; x: number }[] = [
    { who: "countessR", x: 560 },
    { who: "natasha", x: 680 },
    { who: "pierre", x: 820 },
    { who: "marya", x: 960 },
    { who: "nikolai", x: 1090 },
  ];
  return (
    <Frame bg="linear-gradient(180deg, #2a3a6e 0%, #6a5f9e 50%, #f0b07a 100%)">
      {/* дальний горизонт с дымами */}
      <path d="M 0 470 Q 320 440 640 465 T 1280 455 L 1280 720 L 0 720 Z" fill="#3a4568" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${180 + i * 380} 440)`} fill="#cdd6ec" opacity={0.55}>
          <circle r={34} />
          <circle cx={30} cy={-16} r={26} />
          <circle cx={-26} cy={-10} r={22} />
        </g>
      ))}
      {/* тёплое окно */}
      <Glow x={830} y={330} r={260} color="#ffd98a" opacity={0.55} />
      <rect x={660} y={150} width={340} height={300} rx={14} fill="#5a4a3a" />
      <rect x={680} y={170} width={300} height={260} rx={8} fill="#ffe39a" />
      <line x1={830} y1={170} x2={830} y2={430} stroke="#5a4a3a" strokeWidth={12} />
      <line x1={680} y1={270} x2={980} y2={270} stroke="#5a4a3a" strokeWidth={12} />
      <rect x={0} y={600} width={1280} height={120} fill="#4a3a4a" opacity={0.6} />
      {/* нити */}
      {people.slice(0, -1).map((p, i) => (
        <path key={i} d={`M ${p.x} 520 Q ${(p.x + people[i + 1].x) / 2} 470 ${people[i + 1].x} 520`} stroke="#ffd23f" strokeWidth={6} fill="none" />
      ))}
      {people.map((p, i) => (
        <g key={p.who}>
          <Figure who={p.who} x={p.x} y={680} s={0.55} t={0} pose={i === 1 ? "reach" : "stand"} flip={i % 2 === 1} rim="#ffd23f" fill={["#6a5a8a", "#8a5aa0", "#5a6aa0", "#6a7a9a", "#a05a6a"][i]} />
          <circle cx={p.x} cy={520} r={13} fill={DOTS[i * 2 % 8]} stroke="#fff" strokeWidth={5} />
        </g>
      ))}
      <Host x={220} y={780} scale={0.9} pose="ask" mood="wonder" />
      <Headline x={40} y={120} lines={["ЧТО ВАЖНЕЕ", "ВОЙНЫ?"]} size={100} font={FONTS.display} colors={["#fff", "#ffd23f"]} stroke="#1d2340" strokeWidth={16} />
      <ChannelBadge x={990} y={668} scale={0.85} dark />
      <Vignette strength={0.4} />
    </Frame>
  );
};

// ── №4 «НИКТО НЕ ВСЁ КОНТРОЛИРУЕТ» — план против поля ──
const Scales: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #e9dcc0 0%, #e9dcc0 46%, #1d2a5c 46%, #2f4378 100%)">
    {/* план */}
    <g transform="translate(300 380) rotate(-4)">
      <rect x={-210} y={-190} width={420} height={380} rx={16} fill="#fffaf0" stroke="#b89a6a" strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-170} x2={120 - i * 40} y1={-140 + i * 36} y2={-140 + i * 36} stroke="#8a7a5a" strokeWidth={8} strokeLinecap="round" />
      ))}
      <BigArrow x1={-150} y1={130} x2={150} y2={-30} w={56} color="#d9534f" />
    </g>
    <Pill x={300} y={640} text="план" size={40} bg="#1d2340" color="#fff" anchor="middle" />
    {/* поле */}
    {Array.from({ length: 80 }).map((_, i) => (
      <SmallArrow key={i} x={640 + rnd(i) * 580} y={190 + rnd(i + 21) * 400} ang={-40 + (rnd(i + 5) - 0.5) * 170} len={30 + rnd(i + 2) * 20} color={DOTS[i % 8]} />
    ))}
    <DotNet dots={makeDots(30, 940, 400, 260, 190, 33)} t={0} k={1} links={1} drift={0} />
    <Pill x={940} y={640} text="поле" size={40} bg="#ffd23f" anchor="middle" />
    <Host x={600} y={810} scale={0.78} pose="shrug" mood="confused" />
    <Headline x={640} y={95} lines={["НИКТО НЕ ВСЁ", "КОНТРОЛИРУЕТ"]} size={82} font={FONTS.display} anchor="middle" colors={["#fff", "#ffd23f"]} stroke="#101a3a" strokeWidth={14} />
    <ChannelBadge x={990} y={690} scale={0.75} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №5 «СВОБОДА В ПЛЕНУ?» — звёзды за решёткой ──
const Freedom: React.FC = () => (
  <Frame bg="radial-gradient(circle at 62% 40%, #3a4f9a 0%, #1b2650 55%, #0f1636 100%)">
    {Array.from({ length: 160 }).map((_, i) => (
      <circle key={i} cx={rnd(i) * 1280} cy={rnd(i + 7) * 560} r={1.6 + rnd(i + 3) * 3.4} fill={i % 6 === 0 ? DOTS[i % 8] : "#fff"} />
    ))}
    <Glow x={820} y={300} r={200} color="#9cc7f0" opacity={0.35} />
    <path d="M 0 600 Q 640 560 1280 600 L 1280 720 L 0 720 Z" fill="#2f3f6a" />
    <Figure who="pierre" x={820} y={610} s={0.5} t={0} pose="arms" fill="#4a5a9a" rim="#ffd23f" />
    {/* прутья решётки на переднем плане */}
    {[520, 640, 760, 880, 1000, 1120].map((x, i) => (
      <g key={x}>
        <rect x={x} y={0} width={26} height={720} fill="#141a38" opacity={0.92} />
        <rect x={x + 4} y={0} width={5} height={720} fill="#8d9ab8" opacity={0.5} />
      </g>
    ))}
    <rect x={500} y={60} width={680} height={22} fill="#141a38" opacity={0.92} />
    <Host x={230} y={780} scale={0.9} pose="ask" mood="wonder" />
    <Headline x={40} y={135} lines={["СВОБОДА", "В ПЛЕНУ?"]} size={108} font={FONTS.display} colors={["#fff", "#ffd23f"]} stroke="#0b1130" strokeWidth={16} />
    <Pill x={1010} y={600} text="Война и мир" size={32} bg={PAPER} />
    <ChannelBadge x={990} y={668} scale={0.85} dark />
    <Vignette strength={0.45} />
  </Frame>
);

export const WAR_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: History, 2: Glory, 3: Home, 4: Scales, 5: Freedom },
};
