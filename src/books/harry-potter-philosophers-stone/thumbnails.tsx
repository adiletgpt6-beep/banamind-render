// Пять YouTube-обложек фильма BM-031 «Гарри Поттер и философский камень» (канал BanaMind).
// Пять разных постановок: классическая с условным томом и компасом, фишка в ярлыках,
// банан-профессор у доски улик, «ярлык против поступка», компас из точек.
// Только собственная графика фильма: без героев романа, замка, гербов, шляп,
// мётел, шрифтов и кадров франшизы; обложка тома — условная, только текст.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/harry-potter-philosophers-stone/thumbnails.json";
import { C, DIRS } from "./film/theme";
import { Compass, OwnBook, Sticker, Token } from "./film/visuals/common";
import { dotsOf, SH } from "./film/visuals/dots";
import { OL } from "./film/visuals/draw";

const Dots: React.FC<{ pts: { x: number; y: number; c: string }[]; r: number }> = ({ pts, r }) => (
  <g>
    {pts.map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.c} stroke={OL} strokeOpacity={0.35} strokeWidth={1.2} />
    ))}
  </g>
);

// ── №1 Классическая: банан, условный том, компас ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #2f3a78 0%, #6a4f9a 55%, #e0946a 100%)">
    <Rays x={900} y={420} color="#ffe2b8" count={16} opacity={0.08} />
    <Glow x={900} y={440} r={260} color="#ffd27a" opacity={0.4} />
    <g transform="translate(830 470) scale(0.78) rotate(-6)">
      <OwnBook x={0} y={0} title={["Гарри Поттер", "и философский", "камень"]} author="Дж. К. Роулинг" />
    </g>
    <g transform="translate(1110 500) scale(0.5)">
      <Compass x={0} y={0} r={250} angle={270} t={0} hi="act" labels={false} />
    </g>
    <Host x={300} y={920} scale={0.98} pose="present" mood="happy" face={{ lookX: 0.6 }} />
    <Headline x={640} y={102} lines={["ГАРРИ ПОТТЕР"]} size={92} font={FONTS.display} fill="#ffffff" stroke="#1d1a40" strokeWidth={16} anchor="middle" />
    <Headline x={640} y={168} lines={["И ФИЛОСОФСКИЙ КАМЕНЬ"]} size={54} font={FONTS.display} fill={BRAND.yellow} stroke="#1d1a40" strokeWidth={12} anchor="middle" />
    <Pill x={640} y={236} text="разбор книги · Дж. К. Роулинг" size={34} bg="#ffffff" anchor="middle" />
    <ChannelBadge x={990} y={676} scale={0.74} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №2 Интрига: фишка в ярлыках ──
const Labels: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #3d3f78 0%, #8a5a8a 60%, #e08a62 100%)">
    <Glow x={840} y={430} r={240} color="#ffd23f" opacity={0.3} />
    <Token x={840} y={430} name="?" color="#c9cbe0" t={0} s={1.25} hideName />
    <Sticker x={640} y={300} text="ненормальный" k={1} rot={-9} size={40} />
    <Sticker x={1060} y={340} text="знаменитый" k={1} rot={7} size={40} color="#fff1c2" />
    <Sticker x={700} y={560} text="выскочка" k={1} rot={6} size={40} color="#ffd6c7" />
    <Sticker x={1050} y={580} text="почти герой" k={1} rot={-5} size={36} color="#fff1c2" />
    <Host x={230} y={900} scale={0.9} pose="shock" mood="shock" face={{ lookX: 0.8, lookY: -0.2 }} />
    <Headline x={640} y={118} lines={["ЯРЛЫК ИЛИ ВЫБОР?"]} size={96} font={FONTS.display} fill="#ffffff" colors={[undefined]} stroke="#24132a" strokeWidth={16} anchor="middle" />
    <ChannelBadge x={990} y={676} scale={0.74} dark />
    <Vignette strength={0.4} />
  </Frame>
);

// ── №3 Профессор: доска улик ──
const Board: React.FC = () => {
  const card = (x: number, y: number, text: string, rot: number, color = "#fff") => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-130} y={-46} width={260} height={92} rx={10} fill={color} stroke={OL} strokeWidth={4} />
      <circle cx={0} cy={-46} r={11} fill={C.red} stroke={OL} strokeWidth={3} />
      <text y={14} fontFamily={FONTS.heavy} fontWeight={900} fontSize={40} fill={OL} textAnchor="middle">
        {text}
      </text>
    </g>
  );
  return (
    <Frame bg="linear-gradient(135deg, #22305e 0%, #3f5ea8 60%, #8fb0e8 100%)">
      <g filter="url(#softShadow)">
        <rect x={500} y={230} width={720} height={440} rx={22} fill="#c9925c" stroke={OL} strokeWidth={7} />
      </g>
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={520 + ((i * 97) % 680)} cy={250 + ((i * 53) % 400)} r={4} fill="#a87442" opacity={0.6} />
      ))}
      <line x1={650} y1={330} x2={860} y2={460} stroke={C.red} strokeWidth={7} />
      <line x1={1080} y1={340} x2={860} y2={460} stroke={C.red} strokeWidth={7} />
      <line x1={700} y1={590} x2={860} y2={460} stroke={C.red} strokeWidth={7} />
      <line x1={1060} y1={600} x2={860} y2={460} stroke={C.yellow} strokeWidth={7} strokeDasharray="16 10" />
      {card(650, 320, "улика", -6)}
      {card(1080, 330, "улика", 5)}
      {card(700, 590, "улика", 4)}
      {card(1060, 595, "?", -4, "#fff1c2")}
      <g transform="translate(860 460) rotate(-8)">
        <rect x={-150} y={-56} width={300} height={112} rx={14} fill="none" stroke={C.red} strokeWidth={9} />
        <text y={18} fontFamily={FONTS.display} fontWeight={800} fontSize={56} fill={C.red} textAnchor="middle">
          ДОГАДКА
        </text>
      </g>
      <Host x={250} y={920} scale={0.95} pose="point" mood="think" glasses bowtie face={{ lookX: 0.8, lookY: -0.2 }} />
      <Headline x={640} y={100} lines={["КОГО МЫ ПОДОЗРЕВАЛИ?"]} size={84} font={FONTS.display} fill="#ffffff" stroke="#101a38" strokeWidth={15} anchor="middle" />
      <ChannelBadge x={990} y={676} scale={0.72} dark />
      <Vignette strength={0.35} />
    </Frame>
  );
};

// ── №4 Противопоставление: ярлык против поступка ──
const Versus: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #2e2f52 0%, #44466e 49.9%, #2fbf9b 50.1%, #a8f0d6 100%)">
    <Sticker x={300} y={300} text="чужие слова" k={1} rot={-8} size={40} color="#c9cbe0" />
    <Sticker x={250} y={470} text="ненормальный" k={1} rot={5} size={38} color="#9aa3b8" />
    <Sticker x={360} y={600} text="знаменитый" k={1} rot={-4} size={38} color="#9aa3b8" />
    <g transform="translate(1000 470)" filter="url(#softShadow)">
      <rect x={-200} y={-150} width={400} height={300} rx={30} fill={C.paper} stroke={OL} strokeWidth={6} />
      <text y={-60} fontFamily={FONTS.heavy} fontWeight={900} fontSize={42} fill={DIRS.act.deep} textAnchor="middle">
        свой выбор
      </text>
      <path d="M -90 30 L -20 100 L 110 -40" stroke={DIRS.act.color} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <Host x={640} y={920} scale={0.72} pose="open" mood="wonder" />
    <Headline x={300} y={130} lines={["ЯРЛЫК"]} size={100} font={FONTS.display} fill="#c9cbe0" stroke="#15162e" strokeWidth={16} anchor="middle" />
    <Headline x={985} y={130} lines={["ПОСТУПОК"]} size={92} font={FONTS.display} fill="#ffffff" stroke="#0e4a3c" strokeWidth={16} anchor="middle" />
    <g filter="url(#shadow)"><circle cx={640} cy={330} r={74} fill={BRAND.yellow} stroke="#15162e" strokeWidth={8} /><text x={640} y={362} fontFamily={FONTS.display} fontWeight={800} fontSize={110} fill="#15162e" textAnchor="middle">≠</text></g>
    <ChannelBadge x={990} y={676} scale={0.72} dark />
    <Vignette strength={0.3} />
  </Frame>
);

// ── №5 Самая сильная: компас из точек ──
const DotCompass: React.FC = () => {
  const ring = dotsOf("th5-ring", SH.ring(200, 236), 840, 470, [C.brass, "#ffe08a", "#fff"], 10, 260);
  const sectors = (["origin", "expect", "fear", "act"] as const).map((d) => {
    const a = (DIRS[d].angle * Math.PI) / 180;
    return dotsOf(`th5-${d}`, (x, y) => {
      const r = Math.hypot(x, y);
      const ang = Math.atan2(x, -y);
      let da = Math.abs(ang - a);
      if (da > Math.PI) da = 2 * Math.PI - da;
      return r <= 185 && r >= 40 && da <= 0.42;
    }, 840, 470, [DIRS[d].color, DIRS[d].light, "#fff"], 10, 220);
  });
  const needle = dotsOf("th5-needle", (x, y) => {
    // стрелка от центра влево-вниз к «Поступку»
    const u = -x;
    const v = y;
    return u >= -20 && u <= 190 && Math.abs(v - u * 0.12) <= 22 * (1 - Math.max(0, u) / 210);
  }, 840, 470, [C.red, "#ff8a8a"], 8, 220);
  return (
    <Frame bg="linear-gradient(135deg, #1f2a5a 0%, #3e4a9a 50%, #2fbf9b 100%)">
      <Glow x={840} y={470} r={300} color="#ffd23f" opacity={0.3} />
      <Dots pts={ring} r={4.6} />
      {sectors.map((s, i) => (
        <Dots key={i} pts={s} r={4.4} />
      ))}
      <Dots pts={needle} r={4.4} />
      <circle cx={840} cy={470} r={20} fill={C.brass} stroke={OL} strokeWidth={4} />
      <Pill x={1010} y={250} text="Происхождение" size={30} bg={DIRS.origin.light} anchor="middle" rotate={8} />
      <Pill x={520} y={500} text="Поступок" size={36} bg={DIRS.act.color} color="#fff" anchor="middle" />
      <Host x={1120} y={920} scale={0.92} pose="point" mood="joy" flip face={{ lookX: -0.7 }} />
      <Headline x={40} y={92} lines={["СВОЙ ПО РОЖДЕНИЮ"]} size={74} font={FONTS.display} fill="#ffffff" stroke="#10163a" strokeWidth={14} anchor="start" />
      <Headline x={40} y={166} lines={["ИЛИ ПО ВЫБОРУ?"]} size={74} font={FONTS.display} fill={BRAND.yellow} stroke="#10163a" strokeWidth={14} anchor="start" />
      <ChannelBadge x={40} y={676} scale={0.72} dark />
      <Vignette strength={0.3} />
    </Frame>
  );
};

export const POTTER_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Labels, 3: Board, 4: Versus, 5: DotCompass },
};

