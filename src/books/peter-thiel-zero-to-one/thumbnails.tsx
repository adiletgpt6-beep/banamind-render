// Пять YouTube-обложек BM-010 «От нуля к единице» (канал BanaMind).
// Пять разных концепций: классика с книгой, «100 копий или 1 новое», профессор у доски,
// противопоставление «конкуренция / уникальность», крупное «0 → 1».
// Обложка издания и иллюстрации книги не используются — книга нарисована заново;
// логотипов компаний нет. Тексты — books/peter-thiel-zero-to-one/thumbnails.json.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Bulb, Rocket, Shop } from "../../lesson-zero-to-one/visuals/draw";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/peter-thiel-zero-to-one/thumbnails.json";

const TITLE = ["От нуля", "к единице"];
const SUB = "Питер Тиль";

const Grid: React.FC<{ color: string; opacity?: number }> = ({ color, opacity = 0.12 }) => (
  <g opacity={opacity}>
    {Array.from({ length: 33 }).map((_, i) => (
      <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={TH} stroke={color} strokeWidth={1.5} />
    ))}
    {Array.from({ length: 19 }).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 40} x2={TW} y2={i * 40} stroke={color} strokeWidth={1.5} />
    ))}
  </g>
);

// ── №1 Классическое: банан + книга, название крупно ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #10304f 0%, #1c5a7a 55%, #2a8aa0 100%)">
    <Grid color="#9fe7ff" />
    <Glow x={330} y={420} r={260} color="#7fd8ff" opacity={0.35} />
    <BookCover x={420} y={420} scale={0.82} rotate={-8} title={TITLE} subtitle={SUB} color="#14806f" accent="#ffd23f" />
    <Host x={200} y={800} scale={0.92} pose="present" mood="happy" mouth={0.35} />
    <Headline x={1225} y={190} anchor="end" lines={["ОТ НУЛЯ", "К ЕДИНИЦЕ"]} size={104} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={18} lineGap={1.08} colors={[undefined, BRAND.yellow]} />
    <Pill x={1010} y={460} anchor="middle" text="Питер Тиль" size={44} bg="#fff" color={BRAND.ink} />
    <ChannelBadge x={940} y={640} scale={1.15} dark />
  </Frame>
);

// ── №2 Интрига: «100 копий или 1 новое?» ──
const CopyOrNew: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #6f7a8a 0%, #8f99a8 46%, #1d2333 54%, #0e1424 100%)">
    {Array.from({ length: 30 }).map((_, i) => (
      <g key={i} opacity={0.85}>
        <Shop x={60 + (i % 5) * 110} y={150 + Math.floor(i / 5) * 105} s={0.45} awning="#b9c2cf" color="#e4e8ee" />
      </g>
    ))}
    <Glow x={1000} y={330} r={260} color="#ffd23f" opacity={0.55} />
    <Rays x={1000} y={300} color="#ffe9a8" count={18} opacity={0.14} />
    <Bulb x={1000} y={380} s={1.9} t={0.4} />
    <Host x={640} y={830} scale={0.82} pose="shock" mood="shock" mouth={0.8} round={0.6} />
    <Headline x={300} y={110} anchor="middle" lines={["100 КОПИЙ"]} size={78} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={16} />
    <Headline x={975} y={110} anchor="middle" lines={["ИЛИ 1 НОВОЕ?"]} size={74} font={FONTS.display} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={16} />
    <ChannelBadge x={980} y={665} scale={1} dark />
  </Frame>
);

// ── №3 Профессор: банан в очках у доски 0 → 1 / 1 → N ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #f6ecd8 0%, #efdcb8 100%)">
    {/* полки с книгами */}
    {[0, 1].map((r) => (
      <g key={r}>
        <rect x={0} y={120 + r * 170} width={260} height={14} fill="#a8743f" />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={14 + i * 34} y={40 + r * 170} width={28} height={80} rx={4} fill={["#c0392b", "#2e86ab", "#f5b700", "#27ae60", "#8e44ad"][(i + r) % 5]} />
        ))}
      </g>
    ))}
    <rect x={430} y={60} width={800} height={470} rx={20} fill="#1f4a3a" stroke="#8a5a2b" strokeWidth={18} />
    <text x={830} y={250} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={150} fill="#fff" opacity={0.95}>
      0 → 1
    </text>
    <text x={830} y={380} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={70} fill="#cfe9d8" opacity={0.7}>
      1 → N
    </text>
    <line x1={640} y1={360} x2={1020} y2={330} stroke="#ff8f70" strokeWidth={12} strokeLinecap="round" />
    <text x={830} y={480} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={40} fill="#ffd23f">
      создавать, а не копировать
    </text>
    <Host x={230} y={830} scale={0.88} pose="point" mood="happy" mouth={0.45} glasses bowtie />
    <Headline x={830} y={640} anchor="middle" lines={["ПИТЕР ТИЛЬ"]} size={92} font={FONTS.display} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={16} />
    <Pill x={830} y={700} anchor="middle" text="Главные идеи книги" size={34} bg={BRAND.ink} color="#fff" />
    <ChannelBadge x={1000} y={40} scale={0.85} dark />
  </Frame>
);

// ── №4 Противопоставление: конкуренция ↔ уникальность ──
const Contrast: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #7a1f2b 0%, #b0303e 49%, #f5b700 51%, #ffd94d 100%)">
    {/* слева — одинаковые лавки и мечи */}
    {[0, 1, 2].map((i) => (
      <Shop key={i} x={110 + i * 150} y={560} s={0.8} awning="#6f7a8a" color="#d9dde3" />
    ))}
    <g transform="translate(260 300)">
      {[-35, 35].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <rect x={-10} y={-130} width={20} height={170} rx={6} fill="#e4e8ee" stroke={BRAND.ink} strokeWidth={5} />
          <rect x={-40} y={36} width={80} height={16} rx={6} fill="#6b4a1e" stroke={BRAND.ink} strokeWidth={4} />
          <rect x={-10} y={52} width={20} height={50} rx={6} fill="#6b4a1e" stroke={BRAND.ink} strokeWidth={4} />
        </g>
      ))}
    </g>
    {/* справа — одна уникальная лавка в лучах */}
    <Rays x={1030} y={440} color="#fff" count={16} opacity={0.25} />
    <Shop x={1030} y={600} s={1.5} awning="#ff8f70" glow={1} />
    <Host x={640} y={830} scale={0.8} pose="shrug" mood="think" mouth={0.2} />
    <Headline x={300} y={110} anchor="middle" lines={["КОНКУРЕНЦИЯ"]} size={60} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={14} />
    <Headline x={975} y={110} anchor="middle" lines={["УНИКАЛЬНОСТЬ"]} size={60} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={14} />
    <Headline x={640} y={250} anchor="middle" lines={["или"]} size={64} font={FONTS.display} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={12} />
    <ChannelBadge x={30} y={680} scale={0.9} dark />
  </Frame>
);

// ── №5 Самый сильный: гигантское «0 → 1» и банан в прыжке ──
const ZeroToOne: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 40%, #2b3f8c 0%, #141d45 55%, #0a0f26 100%)">
    {Array.from({ length: 60 }).map((_, i) => (
      <circle key={i} cx={(i * 263) % TW} cy={(i * 151) % TH} r={1 + (i % 3)} fill="#fff" opacity={0.3 + (i % 4) * 0.15} />
    ))}
    <Glow x={980} y={330} r={260} color="#ffd23f" opacity={0.45} />
    <text x={330} y={470} textAnchor="middle" fontFamily={FONTS.display} fontSize={420} fill="#6f7a8a" opacity={0.55} stroke={BRAND.ink} strokeWidth={10} paintOrder="stroke">
      0
    </text>
    <text x={1010} y={520} textAnchor="middle" fontFamily={FONTS.display} fontSize={520} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={16} paintOrder="stroke" filter="url(#shadow)">
      1
    </text>
    <path d="M 430 330 Q 640 120 840 260" stroke="#ff8f70" strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray="1 34" />
    <path d="M 812 228 L 852 268 L 800 284" stroke="#ff8f70" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Rocket x={1180} y={160} s={0.7} t={0.2} />
    <Host x={760} y={800} scale={0.74} pose="cheer" mood="joy" mouth={0.75} round={0.3} />
    <Headline x={40} y={640} lines={["КАК СОЗДАТЬ", "НОВОЕ"]} size={74} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={14} lineGap={1.05} colors={[undefined, BRAND.yellow]} />
    <ChannelBadge x={980} y={670} scale={0.9} dark />
    <Vignette strength={0.35} />
  </Frame>
);

export const ZERO_TO_ONE_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: Classic, 2: CopyOrNew, 3: Professor, 4: Contrast, 5: ZeroToOne },
};

