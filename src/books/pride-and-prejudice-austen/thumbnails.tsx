// Пять YouTube-обложек фильма BM-019 «Гордость и предубеждение» (канал BanaMind).
// Пять разных постановок: классический кабинет с книгой, две несовпадающие
// линзы, профессор и модель выбора, обаяние против правды, портрет из точек,
// который распадается. Без современной обложки издания, кадров экранизаций и
// лиц актёров — персонажи нарисованы заново в стиле фильма (src/lesson-pride).
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { LetterSheet, Manor, OL, Person } from "../../lesson-pride/visuals/draw";
import { LensCard, LensFrame } from "../../lesson-pride/visuals/lens";
import { Particles } from "../../lesson-pride/visuals/particles";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/pride-and-prejudice-austen/thumbnails.json";

const ROSE = "#e0697a";
const TEAL = "#2f8f9d";
const GOLD = "#e3a93a";
const INK = "#1f2a3d";

// ── №1 Классическая: кабинет, книга, банан ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #fff3de 0%, #f1d6b0 60%, #d9b48a 100%)">
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={0} y={250 + r * 150} width={1280} height={12} fill="#8a5c38" opacity={0.5} />
        {Array.from({ length: 30 }).map((_, i) => {
          const h = 80 + ((i * 37 + r * 13) % 40);
          return <rect key={i} x={6 + i * 43} y={250 + r * 150 - h} width={36} height={h} rx={4} fill={["#a8505a", "#4f8a8a", "#c9a24a", "#6a5a8a", "#7a8a5a"][(i + r) % 5]} opacity={0.35} />;
        })}
      </g>
    ))}
    <Glow x={430} y={430} r={240} color="#fff2c4" opacity={0.75} />
    <g transform="translate(440 430) rotate(-5)" filter="url(#softShadow)">
      <rect x={-175} y={-225} width={350} height={450} rx={14} fill="#8a3a52" stroke="#3b2a10" strokeWidth={5} />
      <rect x={-150} y={-200} width={300} height={400} rx={10} fill="none" stroke="#f1d08a" strokeWidth={5} />
      <path d="M 0 -150 L 8 -128 L 30 -120 L 8 -112 L 0 -90 L -8 -112 L -30 -120 L -8 -128 Z" fill="#f1d08a" />
      <text y={-20} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={46} fill="#fff8e6">Гордость</text>
      <text y={34} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={34} fill="#fff8e6">и предубеждение</text>
      <text y={140} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={24} fill="#f1d08a">Джейн Остин</text>
    </g>
    <Host x={985} y={830} scale={1.05} pose="present" mood="happy" bowtie face={{ lookX: -0.8, smile: 0.6 }} />
    <Headline x={640} y={112} lines={["ГОРДОСТЬ И ПРЕДУБЕЖДЕНИЕ"]} size={66} font={FONTS.serif} weight={700} fill="#fff8ec" stroke={INK} strokeWidth={13} anchor="middle" />
    <Pill x={640} y={188} text="Джейн Остин" size={34} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.8} dark />
  </Frame>
);

// ── №2 Интрига: две несовпадающие линзы ──
const TwoLenses: React.FC = () => (
  <Frame bg="radial-gradient(circle at 60% 50%, #fff6e8 0%, #f6dccf 55%, #e7b9b6 100%)">
    <g transform="translate(820 380) scale(0.8)">
      <LensFrame x={-190} y={-20} r={250} who="liz" k={1} sep={1} t={0.4} labels={0} name={false}>
        <LensCard x={0} y={-40} text="гордый" kind="decided" who="liz" k={1} w={300} size={44} />
      </LensFrame>
      <LensFrame x={210} y={40} r={250} who="darcy" k={1} sep={1} t={0.4} labels={0} name={false}>
        <LensCard x={0} y={60} text="факт?" kind="known" who="darcy" k={1} w={260} size={44} />
      </LensFrame>
    </g>
    <Host x={250} y={880} scale={1.1} pose="shock" mood="shock" face={{ eye: 1.32, brow: 1, lookX: 0.8 }} />
    <Headline x={60} y={160} lines={["Я БЫЛА", "НЕПРАВА"]} size={118} font={FONTS.display} fill="#fff" colors={["#fff", ROSE]} stroke={INK} strokeWidth={16} lineGap={1.0} />
    <ChannelBadge x={980} y={672} scale={0.8} dark />
  </Frame>
);

// ── №3 Профессор: модель выбора ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #2f5a66 0%, #3f7480 50%, #d9c39a 100%)">
    <Rays x={760} y={260} color="#ffe8b0" count={16} opacity={0.08} />
    <g transform="translate(760 210)">
      <rect x={-12} y={0} width={24} height={330} fill={GOLD} stroke={OL} strokeWidth={5} />
      <path d="M -100 350 Q 0 315 100 350 L 118 376 L -118 376 Z" fill={GOLD} stroke={OL} strokeWidth={5} />
      <g transform="rotate(-6)">
        <line x1={-270} y1={0} x2={270} y2={0} stroke="#b9821c" strokeWidth={16} strokeLinecap="round" />
        <circle r={22} fill={GOLD} stroke={OL} strokeWidth={5} />
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${d * 270} 0) rotate(6)`}>
            <path d="M 0 0 L -90 130 M 0 0 L 90 130" stroke="#b9821c" strokeWidth={4} />
            <path d="M -116 130 Q 0 190 116 130 Z" fill={GOLD} stroke={OL} strokeWidth={5} />
          </g>
        ))}
      </g>
    </g>
    <Pill x={560} y={430} text="чувство" size={34} bg="#f6c3c7" anchor="middle" />
    <Pill x={1030} y={360} text="дом и деньги" size={34} bg="#efe2c6" anchor="middle" />
    <BookCover x={1120} y={560} scale={0.42} rotate={8} title={["Джейн", "Остин"]} color="#8a3a52" accent="#f1d08a" />
    <Host x={230} y={860} scale={1.0} pose="pointUp" mood="think" glasses bowtie face={{ lookX: 0.7, lookY: -0.4 }} />
    <Headline x={640} y={150} lines={["ЛЮБОВЬ И РАСЧЁТ"]} size={96} font={FONTS.display} fill="#fff" colors={[BRAND.yellow]} stroke="#123038" strokeWidth={16} anchor="middle" />
    <ChannelBadge x={980} y={672} scale={0.8} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №4 Противопоставление: обаяние / правда ──
const CharmTruth: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #f6b36a 0%, #f3c58e 49.9%, #c9dfe6 50%, #8fb8c8 100%)">
    <Glow x={300} y={300} r={220} color="#fff1c4" opacity={0.6} />
    <Person who="wickham" x={430} y={660} s={0.82} mood="smile" pose="point" />
    <g transform="translate(190 330)">
      <ellipse rx={160} ry={76} fill="#fff8e4" stroke={OL} strokeWidth={5} />
      <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={44} fill={INK}>рассказ</text>
    </g>
    <g transform="translate(980 420) rotate(4)">
      <LetterSheet x={0} y={0} s={0.62} k={1} lines={8} highlight={[2, 5]} />
      <circle cx={130} cy={150} r={46} fill="#cc4646" stroke={OL} strokeWidth={4} />
      <path d="M 105 150 L 125 170 L 160 132" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <Pill x={980} y={665} text="письмо" size={34} bg="#fff" anchor="middle" />
    <Host x={640} y={900} scale={0.95} pose="shrug" mood="confused" face={{ smile: -0.1 }} />
    <Headline x={40} y={120} lines={["ОБАЯНИЕ"]} size={96} font={FONTS.display} fill="#fff" stroke={INK} strokeWidth={15} />
    <Headline x={1240} y={120} lines={["И ПРАВДА"]} size={96} font={FONTS.display} fill="#fff" colors={[BRAND.yellow]} stroke={INK} strokeWidth={15} anchor="end" />
    <ChannelBadge x={510} y={672} scale={0.8} dark />
  </Frame>
);

// ── №5 Самая сильная: портрет-оценка распадается ──
const Crumble: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 50%, #fff4e2 0%, #f3dcc0 60%, #e2bf9a 100%)">
    {/* под распадающимся портретом проявляется другой, тёплый силуэт */}
    <g opacity={0.95}>
      <Particles shape="man" t={2.1} at={0} dur={1} x={900} y={390} s={0.95} r={6} step={15} mono="#6c9a6e" spread={10} outline />
    </g>
    <Particles shape="man" t={3.05} at={-3} dur={1} x={900} y={390} s={0.95} r={6.4} step={15} breakAt={2.2} breakDur={1.6} mono={TEAL} spread={10} />
    <g transform="translate(905 330) rotate(-10)">
      <rect x={-150} y={-44} width={300} height={88} rx={14} fill="#fff" stroke={TEAL} strokeWidth={8} opacity={0.85} />
      <text y={20} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={56} fill={TEAL} opacity={0.85}>гордец</text>
    </g>
    <Pill x={905} y={585} text="проверено" size={34} bg="#cfe3c4" anchor="middle" />
    <Host x={250} y={880} scale={1.05} pose="point" mood="think" face={{ lookX: 0.9, lookY: -0.2, brow: 0.4 }} />
    <Headline x={50} y={135} lines={["ЦЕНА", "ПЕРВОГО", "ВЗГЛЯДА"]} size={92} font={FONTS.display} fill="#fff" colors={["#fff", "#fff", ROSE]} stroke={INK} strokeWidth={15} lineGap={0.98} />
    <ChannelBadge x={980} y={672} scale={0.8} dark />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/pride-and-prejudice-austen/thumbnails.json.
export const PRIDE_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: TwoLenses, 3: Professor, 4: CharmTruth, 5: Crumble },
};

export { Manor };
