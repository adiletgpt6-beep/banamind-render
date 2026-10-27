// Пять YouTube-обложек BM-011 «22 непреложных закона маркетинга» (канал BanaMind).
// Пять разных концепций: классика с книгой «22», «первый или лучший?», профессор у доски,
// противопоставление «всё подряд / одно слово», ночная Атлантика «а кто был вторым?».
// Обложка издания не используется — книга нарисована заново; логотипов компаний нет.
// Тексты — books/22-laws-of-marketing/thumbnails.json.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Plane } from "../../lesson-marketing-laws/visuals/draw";
import { LawsBook } from "../../lesson-marketing-laws/visuals/intro";
import { Head, LadderShape, Loaf, Tent } from "../../lesson-marketing-laws/visuals/items";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/22-laws-of-marketing/thumbnails.json";

const Stripes: React.FC<{ color: string; opacity?: number }> = ({ color, opacity = 0.12 }) => (
  <g opacity={opacity}>
    {Array.from({ length: 20 }).map((_, i) => (
      <rect key={i} x={i * 70} y={0} width={35} height={TH} fill={color} />
    ))}
  </g>
);

const Star: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 -50 L 13 -16 L 48 -16 L 20 6 L 30 40 L 0 20 L -30 40 L -20 6 L -48 -16 L -13 -16 Z" fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={5} />
);

// ── №1 Классическое ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #8a2b1f 0%, #c4462f 55%, #e8743c 100%)">
    <Stripes color="#fff" opacity={0.07} />
    <Glow x={330} y={400} r={260} color="#ffd23f" opacity={0.35} />
    <g filter="url(#softShadow)">
      <LawsBook x={380} y={400} s={0.85} />
    </g>
    <Host x={190} y={800} scale={0.9} pose="present" mood="happy" mouth={0.35} />
    <Headline x={1235} y={200} anchor="end" lines={["22 ЗАКОНА", "МАРКЕТИНГА"]} size={88} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={18} lineGap={1.08} colors={[BRAND.yellow, undefined]} />
    <Pill x={985} y={470} anchor="middle" text="Эл Рис и Джек Траут" size={42} bg="#fff" color={BRAND.ink} />
    <ChannelBadge x={930} y={640} scale={1.15} dark />
  </Frame>
);

// ── №2 Интрига: «Первый или лучший?» ──
const FirstOrBest: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #1d2a4a 0%, #2c3f6e 100%)">
    <Rays x={360} y={330} color="#ffe9a8" count={18} opacity={0.12} />
    <Glow x={360} y={340} r={250} color="#ffd23f" opacity={0.45} />
    <rect x={190} y={330} width={340} height={390} rx={10} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={8} />
    <text x={360} y={520} textAnchor="middle" fontFamily={FONTS.display} fontSize={200} fill={BRAND.ink}>
      1
    </text>
    <text x={360} y={630} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={50} fill={BRAND.ink}>
      первый
    </text>
    <rect x={550} y={480} width={300} height={240} rx={10} fill="#c9d1de" stroke={BRAND.ink} strokeWidth={8} />
    <text x={700} y={610} textAnchor="middle" fontFamily={FONTS.display} fontSize={130} fill={BRAND.ink}>
      2
    </text>
    <text x={700} y={690} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={44} fill={BRAND.ink}>
      лучший
    </text>
    <Star x={700} y={420} s={1.3} />
    <Host x={1060} y={820} scale={0.86} pose="shock" mood="shock" mouth={0.8} round={0.6} />
    <Headline x={40} y={120} lines={["ПЕРВЫЙ"]} size={104} font={FONTS.display} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={18} />
    <Headline x={40} y={235} lines={["ИЛИ ЛУЧШИЙ?"]} size={90} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={16} />
    <ChannelBadge x={960} y={40} scale={0.9} dark />
  </Frame>
);

// ── №3 Профессор: доска «1 марка = 1 слово» ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #f6ecd8 0%, #efdcb8 100%)">
    {[0, 1].map((r) => (
      <g key={r}>
        <rect x={0} y={120 + r * 170} width={260} height={14} fill="#a8743f" />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={14 + i * 34} y={40 + r * 170} width={28} height={80} rx={4} fill={["#c0392b", "#2e86ab", "#f5b700", "#27ae60", "#8e44ad"][(i + r) % 5]} />
        ))}
      </g>
    ))}
    <rect x={420} y={50} width={820} height={480} rx={20} fill="#1f4a3a" stroke="#8a5a2b" strokeWidth={18} />
    <text x={720} y={210} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={84} fill="#fff">
      1 марка
    </text>
    <text x={720} y={320} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={84} fill={BRAND.yellow}>
      = 1 слово
    </text>
    <g transform="translate(1150 480) scale(0.5)">
      <Head x={0} y={0} s={1} color="#f3e6d0">
        <LadderShape x={0} y={60} s={0.5} steps={4} h={300} w={160} />
      </Head>
    </g>
    <text x={720} y={460} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill="#cfe9d8">
      лестница в голове покупателя
    </text>
    <Host x={230} y={830} scale={0.88} pose="point" mood="happy" mouth={0.45} glasses bowtie />
    <Headline x={830} y={640} anchor="middle" lines={["ЭЛ РИС И ДЖЕК ТРАУТ"]} size={66} font={FONTS.display} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={14} />
    <Pill x={830} y={700} anchor="middle" text="Главные идеи книги" size={34} bg={BRAND.ink} color="#fff" />
  </Frame>
);

// ── №4 Противопоставление: всё подряд ↔ одно слово ──
const Contrast: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #4b4f66 0%, #6b7088 49%, #f5b700 51%, #ffd94d 100%)">
    <Tent x={300} y={640} s={1.15} w={1.4} color="#7d6aa8" />
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={110 + (i % 5) * 80} y={250 + Math.floor(i / 5) * 70 + (i % 2) * 14} width={60} height={60} rx={8} fill={["#e5484d", "#16a3a3", "#3fb67c", "#ff9f43", "#2f8fd0"][i % 5]} stroke={BRAND.ink} strokeWidth={4} opacity={0.85} />
    ))}
    <Rays x={1000} y={400} color="#fff" count={16} opacity={0.28} />
    <Glow x={1000} y={400} r={200} color="#fff6c2" opacity={0.6} />
    <rect x={820} y={330} width={360} height={140} rx={70} fill="#fff" stroke={BRAND.ink} strokeWidth={8} />
    <text x={1000} y={425} textAnchor="middle" fontFamily={FONTS.display} fontSize={78} fill={BRAND.ink}>
      «слово»
    </text>
    <Loaf x={1000} y={600} s={0.9} steam={1} t={0.3} />
    <Host x={640} y={830} scale={0.8} pose="shrug" mood="think" mouth={0.2} />
    <Headline x={300} y={110} anchor="middle" lines={["ВСЁ ПОДРЯД"]} size={70} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={14} />
    <Headline x={990} y={110} anchor="middle" lines={["ОДНО СЛОВО"]} size={70} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={14} />
    <Headline x={640} y={250} anchor="middle" lines={["или"]} size={64} font={FONTS.display} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={12} />
    <ChannelBadge x={30} y={680} scale={0.9} dark />
  </Frame>
);

// ── №5 Самый сильный: «А кто был вторым?» ──
const WhoSecond: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 30%, #2b3f8c 0%, #141d45 55%, #0a0f26 100%)">
    {Array.from({ length: 60 }).map((_, i) => (
      <circle key={i} cx={(i * 263) % TW} cy={(i * 151) % 420} r={1 + (i % 3)} fill="#fff" opacity={0.3 + (i % 4) * 0.15} />
    ))}
    <rect x={0} y={520} width={TW} height={200} fill="#1f5f9a" />
    {[0, 1, 2].map((r) => (
      <path key={r} d={`M 0 ${560 + r * 50} ${Array.from({ length: 14 }).map((_, i) => `Q ${i * 100 + 50} ${545 + r * 50} ${i * 100 + 100} ${560 + r * 50}`).join(" ")}`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.35} />
    ))}
    <Glow x={940} y={210} r={200} color="#ffd23f" opacity={0.45} />
    <g transform="translate(940 210) scale(1.9) rotate(-8)">
      <Plane x={0} y={0} s={1} color="#fff" />
    </g>
    <Pill x={940} y={340} anchor="middle" text="№1" size={46} bg={BRAND.yellow} color={BRAND.ink} />
    <g opacity={0.6} transform="translate(560 400) scale(1.1) rotate(-4)">
      <Plane x={0} y={0} s={1} color="#9aa6b8" />
    </g>
    <text x={560} y={330} textAnchor="middle" fontFamily={FONTS.display} fontSize={130} fill="#ff8f70" stroke={BRAND.ink} strokeWidth={8} paintOrder="stroke">
      ?
    </text>
    <Pill x={560} y={480} anchor="middle" text="№2" size={40} bg="#c9d1de" color={BRAND.ink} />
    <Host x={1120} y={820} scale={0.72} pose="shock" mood="shock" mouth={0.8} round={0.6} />
    <Headline x={40} y={130} lines={["А КТО", "БЫЛ ВТОРЫМ?"]} size={84} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={16} lineGap={1.05} colors={[undefined, BRAND.yellow]} />
    <ChannelBadge x={40} y={650} scale={0.9} dark />
    <Vignette strength={0.35} />
  </Frame>
);

export const LAWS_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: Classic, 2: FirstOrBest, 3: Professor, 4: Contrast, 5: WhoSecond },
};
