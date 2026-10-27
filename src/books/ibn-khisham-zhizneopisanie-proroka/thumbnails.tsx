// Пять YouTube-обложек BM-002 «Жизнеописание Пророка Мухаммада» (Ибн Хишам), канал BanaMind.
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Религиозное правило: на обложках нет изображения Пророка, других пророков, ангелов,
// их силуэтов или «заменителей» — только банан-ведущий, места, предметы и надписи.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/ibn-khisham-zhizneopisanie-proroka/thumbnails.json";
import { Kaaba, Lantern, Mountains, Palm, Scroll, Star8, Tent } from "./visuals/draw";

const TITLE = ["Сира", "Пророка"];
const SUB = "Ибн Хишам";

const Stars: React.FC<{ n: number; seed: number; h?: number }> = ({ n, seed, h = 420 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = (i * 263 + seed * 97) % TW;
      const y = (i * 151 + seed * 31) % h;
      return <circle key={i} cx={x} cy={y} r={1 + (i % 3)} fill="#fff" opacity={0.35 + (i % 4) * 0.15} />;
    })}
  </g>
);

const Dunes: React.FC<{ y: number; cols: string[] }> = ({ y, cols }) => (
  <g>
    {cols.map((c, i) => (
      <path key={i} d={`M 0 ${y + i * 60} Q 200 ${y - 50 + i * 60} 420 ${y + i * 60} T 860 ${y + i * 60} T ${TW} ${y + i * 60} L ${TW} ${TH} L 0 ${TH} Z`} fill={c} />
    ))}
  </g>
);

// ── №1 Классическое: банан + книга, вечерняя Мекка с Каабой ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #2d3c78 0%, #c8786a 55%, #f4c48a 100%)">
    <Glow x={1060} y={430} r={200} color="#ffd79a" opacity={0.7} />
    <g transform="scale(0.667)">
      <Mountains y={760} color="#7a5266" seed={3} />
    </g>
    <Dunes y={560} cols={["#d99a5f", "#c07f48", "#a8693a"]} />
    <g transform="translate(1040 560) scale(0.8)">
      <Kaaba x={0} y={0} s={1} glow={0.8} />
    </g>
    <Palm x={1210} y={640} s={0.75} t={0} />
    <Host x={250} y={790} scale={0.98} pose="present" mood="happy" mouth={0.3} />
    <BookCover x={560} y={470} scale={0.66} rotate={-7} title={TITLE} subtitle={SUB} color="#1e5a4a" />
    <Headline x={690} y={140} lines={["ЖИЗНЕОПИСАНИЕ", "ПРОРОКА", "МУХАММАДА"]} size={54} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow, BRAND.yellow]} stroke="#1d2333" strokeWidth={14} lineGap={1.1} />
    <Pill x={694} y={330} text="Ибн Хишам · 30 минут" size={30} bg="#fff4d0" />
    <ChannelBadge x={40} y={60} scale={0.8} dark />
  </Frame>
);

// ── №2 Интрига: ночь, пещера Хира, одно слово «Читай!» ──
const Intrigue: React.FC = () => (
  <Frame bg="radial-gradient(circle at 60% 45%, #24356b 0%, #121c3d 55%, #070b1c 100%)">
    <Stars n={90} seed={5} />
    <path d={`M 360 ${TH} L 560 360 L 760 300 L 980 420 L 1180 ${TH} Z`} fill="#2c2442" />
    <Glow x={770} y={520} r={190} color="#ffe39a" opacity={0.75} />
    <ellipse cx={770} cy={520} rx={110} ry={80} fill="#120e1a" />
    <ellipse cx={770} cy={524} rx={100} ry={72} fill="#fff1b0" />
    <Rays x={770} y={520} color="#fff1c0" count={18} opacity={0.12} />
    <Headline x={770} y={420} lines={["«ЧИТАЙ!»"]} size={110} font={FONTS.serif} weight={700} fill="#fff4d0" stroke="#3a2a10" strokeWidth={14} anchor="middle" />
    <Headline x={44} y={110} lines={["С ЧЕГО ВСЁ", "НАЧАЛОСЬ?"]} size={70} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#06101f" strokeWidth={13} lineGap={1.08} />
    <Host x={1130} y={830} scale={0.92} pose="pointUp" mood="wonder" mouth={0.5} round={0.7} face={{ lookX: -0.9, lookY: -0.5, eye: 1.3, brow: 0.9 }} />
    <Pill x={44} y={668} text="Жизнеописание Пророка Мухаммада" size={24} bg="#ffffff" padX={34} />
    <ChannelBadge x={980} y={56} scale={0.75} dark />
    <Vignette strength={0.45} />
  </Frame>
);

// ── №3 Профессор: банан в очках у кафедры с большой книгой, арки ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #2a5a52 0%, #173a35 100%)">
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${200 + i * 300} 0)`}>
        <path d="M -110 720 L -110 260 Q -110 120 0 90 Q 110 120 110 260 L 110 720 Z" fill="#1f4a43" stroke="#e8c96a" strokeWidth={5} opacity={0.75} />
        <g transform="translate(0 200)">
          <Star8 x={0} y={0} r={28} fill="#e8c96a" opacity={0.6} />
        </g>
      </g>
    ))}
    <Glow x={900} y={380} r={220} color="#ffe3a0" opacity={0.35} />
    <path d="M 760 720 L 820 470 L 1060 470 L 1120 720 Z" fill="#7a4b2a" stroke="#3b2a10" strokeWidth={6} />
    <BookCover x={940} y={330} scale={0.62} rotate={6} title={TITLE} subtitle={SUB} color="#5a2a3a" />
    <Host x={360} y={820} scale={1.02} pose="point" mood="happy" mouth={0.3} glasses bowtie face={{ smile: 0.65, brow: 0.25, lookX: 0.6 }} />
    <Headline x={60} y={120} lines={["ИБН ХИШАМ"]} size={92} font={FONTS.display} fill="#fff4d0" stroke="#0e2420" strokeWidth={14} />
    <Pill x={66} y={205} text="жизнь Пророка за 30 минут" size={34} bg="#e8c96a" />
    <Pill x={940} y={660} text="Простое объяснение" size={36} anchor="middle" bg={BRAND.yellow} />
    <ChannelBadge x={40} y={690} scale={0.72} dark />
  </Frame>
);

// ── №4 Противопоставление: «Уступка» (договор) против «Победы» (10 000) ──
const Contrast: React.FC = () => (
  <Frame bg="#1a1a1a">
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#e9dcc0" />
    <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#1f3b5a" />
    <g transform="translate(300 420) scale(0.62)">
      <Scroll x={0} y={0} w={420} h={420} k={1}>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={-160} y={-120 + i * 55} width={320 - (i % 2) * 70} height={14} rx={7} fill="#a88f63" />
        ))}
        <rect x={-170} y={-40} width={340} height={8} fill="#d9534f" />
      </Scroll>
    </g>
    {Array.from({ length: 260 }).map((_, i) => (
      <circle key={i} cx={700 + (i % 26) * 20} cy={330 + Math.floor(i / 26) * 22} r={6} fill={i % 7 ? "#ffcf6a" : "#ffffff"} opacity={0.9} />
    ))}
    <Headline x={40} y={118} lines={["УСТУПКА"]} size={100} font={FONTS.condensed} weight={700} fill="#c8643b" stroke="#2b1a0e" strokeWidth={12} />
    <Headline x={1244} y={118} lines={["ПОБЕДА?"]} size={100} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#0b1f33" strokeWidth={12} anchor="end" />
    <Pill x={640} y={190} text="или" size={46} anchor="middle" bg={BRAND.yellow} font={FONTS.condensed} weight={700} />
    <Pill x={1000} y={600} text="1400 → 10 000" size={40} anchor="middle" bg="#ffffff" />
    <Host x={640} y={840} scale={0.9} pose="think" mood="think" face={{ lookX: 0.2, lookY: -0.9 }} />
    <Pill x={150} y={640} text="аль-Худайбия" size={34} anchor="middle" bg="#ffffff" />
    <ChannelBadge x={980} y={690} scale={0.72} dark />
  </Frame>
);

// ── №5 Самый сильный: «Идите, вы свободны!» — прощение при возвращении в Мекку ──
const Strongest: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 40%, #ffd98a 0%, #f2a65a 45%, #8a3f2a 100%)">
    <Rays x={880} y={420} color="#fff4d0" count={22} opacity={0.16} />
    <Dunes y={600} cols={["#e2b56c", "#c99a5e"]} />
    <g transform="translate(880 600) scale(0.95)">
      <Kaaba x={0} y={0} s={1} glow={1} />
    </g>
    {[-1, 1].map((sd) =>
      [0, 1, 2].map((i) => (
        <g key={`${sd}-${i}`} transform={`translate(${880 + sd * (230 + i * 70)} ${600 + i * 8}) rotate(${sd * 80})`}>
          <rect x={-16} y={-70} width={32} height={70} rx={4} fill="#8c7a66" stroke="#3b2a1a" strokeWidth={4} />
        </g>
      )),
    )}
    <Headline x={40} y={130} lines={["«ИДИТЕ,", "ВЫ СВОБОДНЫ!»"]} size={92} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#3a1608" strokeWidth={18} lineGap={1.0} rotate={-2} />
    <Host x={190} y={920} scale={0.88} pose="open" mood="joy" mouth={0.75} round={0.3} face={{ eye: 1.2, brow: 0.6 }} />
    <Pill x={400} y={668} text="Жизнеописание Пророка · Ибн Хишам" size={24} bg="#ffffff" padX={34} />
    <ChannelBadge x={1000} y={56} scale={0.72} dark />
    <Lantern x={1200} y={540} s={0.5} t={0} />
    <Tent x={1150} y={700} s={0.5} />
  </Frame>
);

export const IBN_KHISHAM_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strongest },
};

export { TH };
