// Пять YouTube-обложек BM-012 Марк Аврелий «Наедине с собой» (канал BanaMind).
// Пять разных концепций: классика с книгой у колонны, «Как не взорваться?», профессор у доски
// с двумя кругами, противопоставление «власть над империей / над собой», ночной шатёр
// «Дневник императора». Обложка издания АСТ не используется — книга нарисована заново;
// богов, божеств и обрядов нет. Тексты — books/marcus-aurelius-meditations/thumbnails.json.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Column, Laurel, OilLamp, Tent, WaxTablet, Writer } from "../../lesson-meditations/visuals/draw";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/marcus-aurelius-meditations/thumbnails.json";

const PURPLE = "#6d3b8c";
const GOLD = "#e6b422";

// нарисованная книга «Наедине с собой» (не обложка издания)
const MedBook: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -6 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-190} y={-270} width={380} height={520} rx={16} fill="#000" opacity={0.25} transform="translate(16 18)" />
    <rect x={-190} y={-270} width={380} height={520} rx={16} fill={PURPLE} stroke={BRAND.ink} strokeWidth={8} />
    <rect x={-190} y={-270} width={40} height={520} rx={12} fill="#4f2a66" stroke={BRAND.ink} strokeWidth={8} />
    <rect x={-130} y={-230} width={290} height={440} rx={10} fill="none" stroke={GOLD} strokeWidth={6} />
    <Laurel x={15} y={196} s={0.38} color={GOLD} />
    <text x={15} y={-118} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={40} fill={GOLD}>
      Марк
    </text>
    <text x={15} y={-72} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={40} fill={GOLD}>
      Аврелий
    </text>
    <text x={15} y={80} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={52} fill="#fff">
      Наедине
    </text>
    <text x={15} y={140} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={52} fill="#fff">
      с собой
    </text>
  </g>
);

// ── №1 Классическое ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #7a2e18 0%, #b8532f 55%, #e08a4f 100%)">
    <Glow x={420} y={380} r={300} color="#ffd98a" opacity={0.35} />
    <g opacity={0.35}>
      <Column x={110} y={760} s={1.25} h={420} />
    </g>
    <g filter="url(#softShadow)">
      <MedBook x={440} y={390} s={0.95} />
    </g>
    <Host x={170} y={830} scale={0.82} pose="presentLeft" mood="happy" mouth={0.35} flip />
    <Headline x={1235} y={200} anchor="end" lines={["МАРК", "АВРЕЛИЙ"]} size={104} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={18} lineGap={1.05} colors={[BRAND.yellow, undefined]} />
    <Pill x={1000} y={470} anchor="middle" text="Наедине с собой" size={48} bg="#fff" color={BRAND.ink} font={FONTS.serif} weight={700} />
    <ChannelBadge x={870} y={630} scale={1.15} dark />
  </Frame>
);

// ── №2 Интрига: «Как не взорваться?» ──
const NoExplode: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 55%, #ff9a6b 0%, #e5484d 55%, #8a1f2b 100%)">
    <Rays x={880} y={430} color="#fff3c4" count={20} opacity={0.14} />
    <Glow x={880} y={460} r={260} color="#ffe08a" opacity={0.4} />
    {[
      { x: 470, y: 330, r: -12, t: "провал!" },
      { x: 640, y: 560, r: 8, t: "!#@" },
      { x: 1180, y: 300, r: 10, t: "фу" },
    ].map((b, i) => (
      <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r})`} filter="url(#shadow)">
        <rect x={-120} y={-52} width={240} height={96} rx={30} fill="#fff" stroke={BRAND.ink} strokeWidth={6} />
        <text x={0} y={18} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={50} fill="#e5484d">
          {b.t}
        </text>
      </g>
    ))}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (i / 8) * Math.PI * 2;
      return <path key={i} d={`M ${880 + Math.cos(a) * 250} ${400 + Math.sin(a) * 200} L ${880 + Math.cos(a) * 330} ${400 + Math.sin(a) * 260}`} stroke="#fff3c4" strokeWidth={12} strokeLinecap="round" opacity={0.8} />;
    })}
    <Host x={880} y={860} scale={0.95} pose="hush" mood="shock" mouth={0.1} face={{ cheek: 1 }} />
    <Headline x={40} y={130} lines={["КАК НЕ", "ВЗОРВАТЬСЯ?"]} size={100} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={18} lineGap={1.05} colors={[undefined, BRAND.yellow]} />
    <ChannelBadge x={40} y={650} scale={0.95} dark />
    <Vignette strength={0.3} />
  </Frame>
);

// ── №3 Профессор: доска с двумя кругами ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #f6ecd8 0%, #ead3a8 100%)">
    {[0, 1].map((r) => (
      <g key={r}>
        <rect x={0} y={120 + r * 170} width={260} height={14} fill="#a8743f" />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={14 + i * 34} y={40 + r * 170} width={28} height={80} rx={4} fill={["#6d3b8c", "#c8643c", "#e6b422", "#7d8c3c", "#2f8fd0"][(i + r) % 5]} />
        ))}
      </g>
    ))}
    <rect x={400} y={40} width={840} height={500} rx={20} fill="#1f4a3a" stroke="#8a5a2b" strokeWidth={18} />
    <circle cx={820} cy={300} r={210} fill="none" stroke="#cfe9d8" strokeWidth={8} strokeDasharray="22 14" />
    <circle cx={820} cy={300} r={100} fill="#3a6b55" stroke={BRAND.yellow} strokeWidth={10} />
    <text x={820} y={292} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={BRAND.yellow}>
      в моей
    </text>
    <text x={820} y={328} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={BRAND.yellow}>
      власти
    </text>
    <text x={820} y={130} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill="#cfe9d8">
      не в моей власти
    </text>
    <text x={600} y={300} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill="#fff">
      погода
    </text>
    <text x={1060} y={300} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill="#fff">
      чужие слова
    </text>
    <text x={820} y={470} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={BRAND.yellow}>
      мой шаг
    </text>
    <Host x={230} y={830} scale={0.88} pose="point" mood="happy" mouth={0.45} glasses bowtie />
    <Headline x={820} y={630} anchor="middle" lines={["ЧТО В МОЕЙ ВЛАСТИ?"]} size={68} font={FONTS.display} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={14} />
    <Pill x={820} y={690} anchor="middle" text="Простое объяснение" size={34} bg={BRAND.ink} color="#fff" />
  </Frame>
);

// ── №4 Противопоставление: власть над империей / над собой ──
const Power: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #6d3b8c 0%, #8a4fb0 49%, #1e2a4a 51%, #2b3a62 100%)">
    <g opacity={0.9}>
      <rect x={110} y={250} width={400} height={260} rx={18} fill="#f3ead2" stroke={BRAND.ink} strokeWidth={6} />
      <path d="M 140 420 Q 250 330 330 400 T 490 360" stroke="#7cc0ec" strokeWidth={16} fill="none" />
      {[180, 270, 360, 440].map((x, i) => (
        <circle key={i} cx={x} cy={300 + (i % 2) * 120} r={12} fill="#c8643c" />
      ))}
    </g>
    <Laurel x={310} y={380} s={2.3} color={GOLD} />
    <Glow x={960} y={380} r={220} color="#ffcf66" opacity={0.45} />
    <g transform="translate(960 560) scale(0.62)">
      <Writer x={-40} y={0} t={0.4} />
      <OilLamp x={170} y={-110} s={0.8} t={0.4} />
      <WaxTablet x={210} y={-60} s={0.32} k={1} />
    </g>
    <Host x={640} y={860} scale={0.7} pose="open" mood="wonder" mouth={0.3} />
    <Headline x={640} y={110} anchor="middle" lines={["ВЛАСТЬ"]} size={92} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={16} />
    <Headline x={310} y={620} anchor="middle" lines={["НАД ИМПЕРИЕЙ"]} size={58} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={12} />
    <Headline x={980} y={240} anchor="middle" lines={["НАД СОБОЙ"]} size={72} font={FONTS.display} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={14} />
    <ChannelBadge x={990} y={680} scale={0.85} dark />
  </Frame>
);

// ── №5 Самый сильный: ночной шатёр — «Дневник императора» ──
const Diary: React.FC = () => (
  <Frame bg="radial-gradient(circle at 60% 40%, #2b3f8c 0%, #141d45 60%, #0a0f26 100%)">
    {Array.from({ length: 60 }).map((_, i) => (
      <circle key={i} cx={(i * 263) % TW} cy={(i * 151) % 380} r={1 + (i % 3)} fill="#fff" opacity={0.3 + (i % 4) * 0.15} />
    ))}
    <path d="M 1150 70 A 46 46 0 1 0 1196 134 A 35 35 0 1 1 1150 70 Z" fill="#fff3c4" />
    <rect x={0} y={560} width={TW} height={160} fill="#18223c" />
    <path d="M 0 590 Q 320 560 640 590 T 1280 585 L 1280 640 Q 960 625 640 650 T 0 640 Z" fill="#2c4a78" />
    <g opacity={0.8}>
      <Tent x={130} y={600} s={0.55} open={0.3} color="#8f8467" />
      <Tent x={1180} y={610} s={0.5} open={0.3} color="#8f8467" />
    </g>
    <Glow x={640} y={430} r={300} color="#ffcf66" opacity={0.5} />
    <Tent x={640} y={650} s={1.45} open={1} glow={0.85} />
    <g transform="translate(640 640) scale(0.62)">
      <Writer x={-40} y={0} t={0.4} />
      <OilLamp x={170} y={-110} s={0.8} t={0.4} />
      <WaxTablet x={210} y={-60} s={0.32} k={1} />
    </g>
    <Host x={1080} y={840} scale={0.68} pose="hush" mood="wonder" mouth={0.2} />
    <Headline x={40} y={120} lines={["ДНЕВНИК", "ИМПЕРАТОРА"]} size={92} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={16} lineGap={1.05} colors={[BRAND.yellow, undefined]} />
    <Pill x={40} y={300} text="не для чужих глаз" size={40} bg="#fff" color={BRAND.ink} />
    <ChannelBadge x={40} y={665} scale={0.9} dark />
    <Vignette strength={0.35} />
  </Frame>
);

export const MED_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: Classic, 2: NoExplode, 3: Professor, 4: Power, 5: Diary },
};
