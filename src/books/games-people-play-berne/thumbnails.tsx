// Пять YouTube-обложек фильма BM-034 «Игры, в которые играют люди» (канал BanaMind).
// Пять разных постановок: книга на монтажном столе, петля «опять тот же финал»,
// профессор и два слоя, совет или поддержка, «ДА, НО…» из точек.
// Только собственный рисунок фильма (src/lesson-berne/visuals): без обложки
// издания, его схем и чужих изображений. Надписи — наши, не цитаты и не диагнозы.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { EGO, EGOS } from "../../lesson-berne/theme";
import { BookObj, OL, Person } from "../../lesson-berne/visuals/draw";
import { dotsOf, SH, word } from "../../lesson-berne/visuals/dots";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/games-people-play-berne/thumbnails.json";

const CORAL = "#ff8f70";
const LILAC = "#b9a8ff";

const Dots: React.FC<{ pts: { x: number; y: number; c: string }[]; r: number }> = ({ pts, r }) => (
  <g>
    {pts.map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.c} stroke="#1b1f3d" strokeOpacity={0.35} strokeWidth={1.2} />
    ))}
  </g>
);

const Chip: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; fg?: string; dash?: boolean; rot?: number }> = ({ x, y, text, size = 34, bg = "#ffffff", fg = BRAND.ink, dash, rot = 0 }) => {
  const w = [...text].length * size * 0.56 + 44;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} filter="url(#softShadow)">
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.75} rx={size * 0.6} fill={bg} stroke={OL} strokeWidth={4} strokeDasharray={dash ? "12 8" : undefined} />
      <text y={size * 0.3} fontFamily={FONTS.round} fontWeight={900} fontSize={size} fill={fg} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// ── №1 «ИГРЫ В ОБЩЕНИИ» — банан, книга и монтажный стол ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #24566e 0%, #3a3d82 60%, #2f3a7c 100%)">
    <Glow x={820} y={430} r={300} color="#7fe0d0" opacity={0.25} />
    {/* монтажный стол */}
    <g transform="translate(470 300)">
      <rect x={0} y={0} width={620} height={300} rx={30} fill="#2b2f52" stroke={OL} strokeWidth={6} filter="url(#softShadow)" />
      <text x={30} y={46} fontFamily={FONTS.round} fontWeight={900} fontSize={26} fill="#fff">
        сказано
      </text>
      {["Почему бы…?", "Да, но…"].map((s, i) => (
        <g key={i} transform={`translate(${110 + i * 200} 92)`}>
          <rect x={-90} y={-28} width={180} height={56} rx={14} fill="#fff" stroke={OL} strokeWidth={3} />
          <text y={10} fontFamily={FONTS.round} fontWeight={900} fontSize={26} fill={BRAND.ink} textAnchor="middle">
            {s}
          </text>
        </g>
      ))}
      <text x={30} y={170} fontFamily={FONTS.round} fontWeight={900} fontSize={26} fill={LILAC}>
        интерпретация
      </text>
      <rect x={20} y={190} width={400} height={70} rx={16} fill={LILAC} fillOpacity={0.18} stroke={LILAC} strokeWidth={4} strokeDasharray="14 10" />
      <rect x={430} y={30} width={170} height={240} rx={22} fill={CORAL} fillOpacity={0.25} stroke={CORAL} strokeWidth={4} />
      <text x={515} y={64} fontFamily={FONTS.round} fontWeight={900} fontSize={26} fill={CORAL} textAnchor="middle">
        итог
      </text>
      <circle cx={515} cy={160} r={58} fill={CORAL} stroke={OL} strokeWidth={5} />
    </g>
    <g transform="translate(1165 520) rotate(8) scale(0.95)" filter="url(#softShadow)">
      <BookObj x={0} y={0} />
    </g>
    <Host x={230} y={900} scale={0.85} pose="present" mood="happy" face={{ lookX: 0.6 }} />
    <Headline x={40} y={112} lines={["ИГРЫ В ОБЩЕНИИ"]} size={100} font={FONTS.display} fill="#ffffff" stroke="#111433" strokeWidth={16} />
    <Pill x={44} y={196} text="Эрик Берн — простыми словами" size={36} bg={BRAND.yellow} />
    <ChannelBadge x={40} y={672} scale={0.72} dark />
    <Vignette strength={0.4} />
  </Frame>
);

// ── №2 «ОПЯТЬ ТОТ ЖЕ ФИНАЛ?» — петля реплик сходится в один финал ──
const SameEnd: React.FC = () => {
  const ring = dotsOf("th2-ring", SH.ring(178, 206), 820, 430, [EGO.P.color, EGO.A.color, EGO.C.color, "#ffffff"], 11, 240);
  return (
    <Frame bg="radial-gradient(circle at 65% 55%, #6a63b8 0%, #3a3d82 55%, #1c2050 100%)">
      <Rays x={820} y={430} color="#c9c4ff" count={18} opacity={0.07} />
      <Dots pts={ring} r={5.6} />
      {[
        { t: "Почему бы…?", a: -2.3 },
        { t: "А если…?", a: -0.8 },
        { t: "Может, так?", a: 0.6 },
        { t: "Попробуйте!", a: 2.1 },
      ].map((c, i) => (
        <Chip key={i} x={820 + Math.cos(c.a) * 192} y={430 + Math.sin(c.a) * 192} text={c.t} size={30} rot={Math.sin(c.a) * 6} />
      ))}
      <Glow x={820} y={430} r={150} color={CORAL} opacity={0.5} />
      <circle cx={820} cy={430} r={98} fill={CORAL} stroke={OL} strokeWidth={7} />
      <text x={820} y={448} fontFamily={FONTS.display} fontSize={52} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
        финал
      </text>
      <Host x={210} y={900} scale={1.0} pose="shock" mood="shock" face={{ lookX: 0.8, lookY: -0.2 }} />
      <Headline x={40} y={110} lines={["ОПЯТЬ ТОТ ЖЕ", "ФИНАЛ?"]} size={96} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#111433" strokeWidth={16} lineGap={1.0} />
      <ChannelBadge x={990} y={672} scale={0.72} dark />
      <Vignette strength={0.42} />
    </Frame>
  );
};

// ── №3 «ЧТО МЫ НЕ СЛЫШИМ?» — профессор и два подписанных слоя ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #2b4a86 0%, #3a5aa0 55%, #5d86cc 100%)">
    {/* книжные полки кабинета */}
    {[0, 1, 2].map((r) => (
      <g key={r} opacity={0.35}>
        <rect x={0} y={250 + r * 160} width={1280} height={14} fill="#1f2a55" />
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={i} x={20 + i * 58} y={170 + r * 160} width={40} height={80} rx={4} fill={["#2f4f8a", "#3a2f7a", "#24566e"][(i + r) % 3]} />
        ))}
      </g>
    ))}
    <g transform="translate(500 300)" filter="url(#softShadow)">
      <rect x={0} y={0} width={720} height={130} rx={26} fill="#ffffff" stroke={OL} strokeWidth={5} />
      <text x={30} y={52} fontFamily={FONTS.round} fontWeight={900} fontSize={30} fill="#4a5378">
        сказано вслух
      </text>
      <text x={30} y={102} fontFamily={FONTS.round} fontWeight={900} fontSize={33} fill={BRAND.ink}>
        «Почему бы вам не…?» — «Да, но…»
      </text>
      <rect x={0} y={170} width={720} height={170} rx={26} fill="#efe9ff" stroke="#7a66d6" strokeWidth={5} strokeDasharray="16 10" />
      <text x={30} y={222} fontFamily={FONTS.round} fontWeight={900} fontSize={30} fill="#4a3a8a">
        интерпретация Берна
      </text>
      {EGOS.map((e, i) => (
        <g key={e} transform={`translate(${110 + i * 150} 286)`}>
          <circle r={40} fill={EGO[e].color} stroke={OL} strokeWidth={4} />
          <text y={14} fontFamily={FONTS.display} fontSize={36} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={4} paintOrder="stroke">
            {EGO[e].short}
          </text>
        </g>
      ))}
      <path d="M 560 260 q 40 -30 90 0" fill="none" stroke="#7a66d6" strokeWidth={8} strokeDasharray="14 10" strokeLinecap="round" />
    </g>
    <Host x={250} y={880} scale={0.98} pose="point" mood="wonder" glasses face={{ lookX: 0.8, eye: 1.08 }} />
    <Headline x={640} y={118} lines={["ЧТО МЫ НЕ СЛЫШИМ?"]} size={90} font={FONTS.display} fill="#ffffff" colors={[BRAND.yellow]} stroke="#111433" strokeWidth={16} anchor="middle" />
    <ChannelBadge x={1000} y={672} scale={0.72} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №4 «СОВЕТ ИЛИ ПОДДЕРЖКА?» — две мизансцены, банан между ними ──
const AdviceOrSupport: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #6a4248 0%, #6a4248 50%, #2a6a6a 50%, #2a6a6a 100%)">
    <line x1={640} y1={150} x2={640} y2={720} stroke="#ffffff" strokeWidth={6} strokeDasharray="14 12" opacity={0.6} />
    {/* слева: на человека сыплются советы */}
    <Person who="anna" x={260} y={690} s={0.78} mood="tense" pose="arms" />
    {[[90, 260, -12], [250, 220, 4], [420, 270, 10], [150, 380, -6], [400, 380, 8]].map(([x, y, r], i) => (
      <Chip key={i} x={x} y={y} text={["Почему бы…", "А вы…", "Надо так!", "Попробуйте!", "Почему бы…"][i]} size={26} rot={r} />
    ))}
    <Pill x={320} y={658} text="советы" size={34} bg={CORAL} anchor="middle" />
    {/* справа: двое разговаривают, один слушает */}
    <Person who="friend" x={860} y={690} s={0.74} mood="kind" />
    <Person who="anna" x={1090} y={690} s={0.74} mood="smile" flip />
    <g transform="translate(975 330)">
      <path d="M 0 -18 C -22 -58 -72 -34 -44 4 L 0 44 L 44 4 C 72 -34 22 -58 0 -18 Z" fill="#ff6b9a" stroke={OL} strokeWidth={5} />
    </g>
    <Pill x={975} y={658} text="выслушать" size={34} bg="#c8f2e8" anchor="middle" />
    <Host x={640} y={790} scale={0.6} pose="shrug" mood="think" />
    <Headline x={640} y={112} lines={["СОВЕТ ИЛИ ПОДДЕРЖКА?"]} size={78} font={FONTS.display} fill="#ffffff" colors={["#ffffff"]} stroke="#111433" strokeWidth={15} anchor="middle" />
    <ChannelBadge x={30} y={30} scale={0.6} dark />
    <Vignette strength={0.3} />
  </Frame>
);

// ── №5 «ДА, НО…» — точечная реплика останавливает очередь советов ──
const YesBut: React.FC = () => {
  const da = dotsOf("th5-dano", word("ДА,НО", 160, 26), 700, 330, [EGO.C.color, BRAND.yellow, "#ffffff", CORAL], 10, 420);
  return (
    <Frame bg="radial-gradient(circle at 60% 40%, #a878b4 0%, #5a3f7a 55%, #2a1f48 100%)">
      <Rays x={780} y={330} color="#ffd6f0" count={16} opacity={0.08} />
      <Glow x={780} y={330} r={260} color={BRAND.yellow} opacity={0.25} />
      <Dots pts={da} r={5.8} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={1150 + i * 44} cy={385} r={15} fill={BRAND.yellow} stroke="#111433" strokeWidth={5} />
      ))}
      {/* очередь советов упирается в реплику */}
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={1 - i * 0.25}>
          <Chip x={560 - i * 190} y={590 + i * 34} text={["Почему бы вам не…?", "А может…", "Почему бы…"][i]} size={28} rot={-3 + i * 3} />
        </g>
      ))}
      <path d="M 720 560 L 790 510" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
      <Host x={1130} y={790} scale={0.6} pose="ask" mood="think" flip face={{ lookX: -0.7, lookY: -0.3 }} />
      <g transform="translate(1225 430)" filter="url(#softShadow)">
        <circle r={52} fill={BRAND.yellow} stroke={OL} strokeWidth={5} />
        <text y={26} fontFamily={FONTS.display} fontSize={74} fill={OL} textAnchor="middle">
          ?
        </text>
      </g>
      <ChannelBadge x={40} y={50} scale={0.72} dark />
      <Vignette strength={0.42} />
    </Frame>
  );
};

// Тексты, концепции и рекомендация — в books/games-people-play-berne/thumbnails.json.
export const BERNE_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: SameEnd, 3: Professor, 4: AdviceOrSupport, 5: YesBut },
};
