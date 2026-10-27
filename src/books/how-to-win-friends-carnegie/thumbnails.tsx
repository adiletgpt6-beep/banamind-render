// Пять YouTube-обложек фильма BM-025 «Как завоёвывать друзей и оказывать влияние на людей»
// (канал BanaMind). Пять разных постановок: классическая с собственной книгой фильма,
// кубок и оборванный мост, банан-профессор сравнивает реплики, давление и диалог,
// столкновение фраз и мост из точек. Только собственный рисунок фильма
// (src/lesson-carnegie/visuals): без обложки издания и чужих изображений.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BOOK_PARTS, C } from "../../lesson-carnegie/theme";
import { Bridge, Bubble, Ledge, planksOf } from "../../lesson-carnegie/visuals/bridge";
import { dotsOf } from "../../lesson-carnegie/visuals/dots";
import { OL, Person } from "../../lesson-carnegie/visuals/draw";
import { OwnBook } from "../../lesson-carnegie/visuals/open";
import { SHAPES } from "../../lesson-carnegie/visuals/shapes";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/how-to-win-friends-carnegie/thumbnails.json";

const ALL = [1, 2, 3, 4].map((n) => BOOK_PARTS[n as 1 | 2 | 3 | 4].color);

const Dots: React.FC<{ pts: { x: number; y: number; c: string }[]; r: number }> = ({ pts, r }) => (
  <g>
    {pts.map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.c} stroke="#2a1f2d" strokeOpacity={0.35} strokeWidth={1.2} />
    ))}
  </g>
);

// ── №1 Классическая: банан и собственная книга фильма ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #5b3a5e 0%, #b8645a 60%, #f0a868 100%)">
    <Rays x={880} y={380} color="#ffe2b8" count={16} opacity={0.08} />
    <Glow x={880} y={420} r={260} color="#ffd27a" opacity={0.45} />
    <g transform="translate(900 430) scale(1.25) rotate(-6)">
      <OwnBook x={0} y={0} s={1} />
    </g>
    <Host x={330} y={900} scale={1.0} pose="present" mood="happy" face={{ lookX: 0.6 }} />
    <Headline x={640} y={112} lines={["ДРУЗЬЯ И ВЛИЯНИЕ"]} size={92} font={FONTS.display} fill="#ffffff" stroke="#2a1630" strokeWidth={16} anchor="middle" />
    <Pill x={640} y={198} text="Дейл Карнеги" size={40} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={980} y={672} scale={0.78} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №2 Интрига: кубок и оборванный мост ──
const Trophy: React.FC = () => {
  const cup = dotsOf("th2-cup", (x, y) => SHAPES.trophy(x / 0.62, y / 0.62), 230, 330, [C.yellow, C.gold, "#fff1c2", "#fff"], 9, 200);
  return (
    <Frame bg="linear-gradient(180deg, #3b2747 0%, #8a4a5a 60%, #d8875a 100%)">
      <Glow x={230} y={330} r={180} color="#ffd23f" opacity={0.4} />
      <Ledge x={180} y={560} w={330} side={-1} />
      <Ledge x={1100} y={560} w={330} side={1} />
      <Bridge x0={345} x1={935} y={548} planks={planksOf(7, 7, { fallFrom: 2, fallTo: 5, fall: 0.75 })} rope={0} t={0} />
      <Dots pts={cup} r={4.4} />
      <Person who="friend" x={1150} y={546} s={0.5} mood="doubt" pose="walk" t={0.4} />
      <Host x={640} y={850} scale={0.66} pose="shock" mood="shock" face={{ lookX: -0.6, lookY: -0.3 }} />
      <Headline x={640} y={110} lines={["СПОР ВЫИГРАН.", "ДАЛЬШЕ?"]} size={86} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#24132a" strokeWidth={15} anchor="middle" lineGap={1.02} />
      <ChannelBadge x={40} y={60} scale={0.72} dark />
      <Vignette strength={0.4} />
    </Frame>
  );
};

// ── №3 Профессор: две реплики под лупой ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #2f4f5e 0%, #3f8a78 55%, #9ad0a8 100%)">
    {/* книжные полки кабинета */}
    {[0, 1, 2].map((r) => (
      <g key={r} opacity={0.25}>
        <rect x={700} y={250 + r * 150} width={560} height={14} fill="#fff" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={710 + i * 45} y={160 + r * 150} width={34} height={90} rx={4} fill={ALL[(i + r) % 4]} />
        ))}
      </g>
    ))}
    <g transform="translate(860 330)">
      <Bubble x={0} y={0} text="Вы гений!" size={50} fill="#ffe1e1" />
      <path d="M -150 30 L 150 -30" stroke={C.red} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
    </g>
    <g transform="translate(900 560)">
      <Bubble x={0} y={0} text={"Вы нашли ошибку\nза минуту"} size={44} fill="#e2fff0" />
      <path d="M 200 -10 L 236 30 L 300 -50" stroke={C.green} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <Host x={260} y={900} scale={1.0} pose="pointUp" mood="think" glasses bowtie face={{ lookX: 0.8, lookY: -0.2 }} />
    <Headline x={640} y={110} lines={["ИСКРЕННЕ ИЛИ ЛЕСТЬ?"]} size={84} font={FONTS.display} fill="#ffffff" stroke="#123028" strokeWidth={15} anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.72} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №4 Противопоставление: давление и диалог ──
const Versus: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #3a4660 0%, #4f5a78 49.9%, #f0a868 50.1%, #ffd27a 100%)">
    {/* слева — ветер и указующий палец */}
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M ${60 + i * 40} ${300 + i * 70} q 120 -30 240 0 t 200 0`} stroke="#dfe6f5" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
    ))}
    <Person who="boss" x={200} y={660} s={0.62} mood="tense" pose="point" t={0.2} />
    <Person who="timur" x={500} y={660} s={0.62} mood="tense" pose="arms" t={0.2} flip />
    {/* справа — солнце и мост */}
    <circle cx={1150} cy={250} r={70} fill={C.yellow} stroke={OL} strokeWidth={5} />
    <Ledge x={760} y={600} w={200} side={-1} />
    <Ledge x={1200} y={600} w={200} side={1} />
    <Bridge x0={860} x1={1100} y={588} planks={planksOf(4, 4)} rope={1} t={0} />
    <Person who="guest" x={930} y={590} s={0.45} mood="smile" pose="give" t={0.2} />
    <Person who="friend" x={1030} y={590} s={0.45} mood="smile" pose="give" t={0.2} flip />
    <Host x={640} y={900} scale={0.68} pose="shrug" mood="wonder" />
    <Headline x={320} y={120} lines={["ДАВЛЕНИЕ"]} size={84} font={FONTS.display} fill="#ffffff" stroke="#1d2333" strokeWidth={15} anchor="middle" />
    <Headline x={960} y={120} lines={["И ДИАЛОГ"]} size={84} font={FONTS.display} fill={BRAND.yellow} stroke="#3b1f10" strokeWidth={15} anchor="middle" />
    <ChannelBadge x={980} y={672} scale={0.72} dark />
    <Vignette strength={0.3} />
  </Frame>
);

// ── №5 Самая сильная: столкновение фраз и мост из точек ──
const Unheard: React.FC = () => {
  const bridge = dotsOf("th5-bridge", (x, y) => {
    const yy = y - Math.sin(((x + 420) / 840) * Math.PI) * 26;
    return Math.abs(x) <= 420 && yy >= -26 && yy <= 26;
  }, 640, 600, ALL.concat([C.yellow, "#fff"]), 10, 440);
  return (
    <Frame bg="radial-gradient(circle at 50% 70%, #d8875a 0%, #7a3f5e 55%, #3b2747 100%)">
      <Glow x={640} y={600} r={300} color="#ffd27a" opacity={0.35} />
      <Ledge x={120} y={610} w={200} side={-1} />
      <Ledge x={1160} y={610} w={200} side={1} />
      <Dots pts={bridge} r={4.6} />
      <g transform="translate(250 330) rotate(-8)">
        <Bubble x={0} y={0} text="Вы не правы!" size={40} fill="#ffe1e1" />
      </g>
      <g transform="translate(1040 300) rotate(7)">
        <Bubble x={0} y={0} text="Опять вы!" size={40} fill="#ffe1e1" />
      </g>
      <g transform="translate(1030 470) rotate(-5)">
        <Bubble x={0} y={0} text="Это не я!" size={36} fill="#f1eef8" />
      </g>
      {[[470, 330], [810, 300], [880, 470]].map(([x, y], i) => (
        <path key={i} d={`M ${x - 18} ${y - 18} L ${x + 18} ${y + 18} M ${x + 18} ${y - 18} L ${x - 18} ${y + 18}`} stroke={BRAND.yellow} strokeWidth={8} strokeLinecap="round" />
      ))}
      <Host x={640} y={880} scale={0.78} pose="open" mood="think" face={{ lookY: -0.4 }} />
      <Headline x={640} y={112} lines={["ПОЧЕМУ ВАС", "НЕ СЛЫШАТ?"]} size={88} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#24132a" strokeWidth={16} anchor="middle" lineGap={1.02} />
      <ChannelBadge x={40} y={672} scale={0.72} dark />
      <Vignette strength={0.4} />
    </Frame>
  );
};

// Тексты, концепции и рекомендация — в books/how-to-win-friends-carnegie/thumbnails.json.
export const CARNEGIE_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Trophy, 3: Professor, 4: Versus, 5: Unheard },
};
