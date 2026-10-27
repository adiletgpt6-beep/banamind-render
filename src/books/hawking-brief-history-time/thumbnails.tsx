// Пять YouTube-обложек фильма BM-014 «Краткая история времени» (канал BanaMind).
// Каждая — отдельная концепция из готового сценария: своя композиция, эмоция
// банана, шрифт и палитра. Книга нарисована условно (не обложка издательства),
// чёрные дыры — художественные схемы, не снимки телескопов; людей и религиозных
// символов нет.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BlackHole, Clock, Galaxy, Photon, Spark } from "../../lesson-hawking/visuals/space";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/hawking-brief-history-time/thumbnails.json";

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const Stars: React.FC<{ n?: number; seed?: number; color?: string }> = ({ n = 120, seed = 0, color = "#e6eeff" }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={rnd(i + seed) * TW} cy={rnd(i + seed + 400) * TH} r={0.8 + rnd(i + seed + 800) * 2.2} fill={color} opacity={0.35 + rnd(i + seed + 1200) * 0.6} />
    ))}
  </g>
);

// ── №1 Классическое: банан с книгой на фоне галактики ──
const Classic: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 40%, #3a3f9c 0%, #1a1f55 45%, #0a0d26 100%)">
    <Stars n={160} />
    <Galaxy x={1080} y={560} s={1.8} t={1.2} color="#a98bff" tilt={0.42} />
    <Host x={250} y={800} scale={0.95} pose="present" mood="happy" mouth={0.35} />
    <BookCover x={520} y={470} scale={0.66} rotate={-7} title={["Краткая", "история", "времени"]} subtitle="С. Хокинг" color="#141b46" accent="#ffd23f" />
    <Headline x={640} y={200} lines={["КРАТКАЯ", "ИСТОРИЯ", "ВРЕМЕНИ"]} size={92} font={FONTS.display} fill="#fff" colors={["#ffffff", "#ffffff", BRAND.yellow]} stroke="#070a1f" strokeWidth={16} lineGap={1.05} />
    <Pill x={650} y={520} text="Стивен Хокинг" size={38} bg="#ffffff" />
    <Pill x={650} y={600} text="простыми словами" size={38} bg={BRAND.yellow} />
    <ChannelBadge x={40} y={60} scale={0.85} dark />
  </Frame>
);

// ── №2 Интрига: двое часов на разной высоте показывают разное ──
const Intrigue: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #0c1233 0%, #1b2a66 70%, #2a3f86 100%)">
    <Stars n={110} seed={7} />
    <path d="M 0 640 Q 640 560 1280 640 L 1280 720 L 0 720 Z" fill="#2f6fd6" />
    <rect x={1098} y={420} width={44} height={200} rx={8} fill="#1d2752" stroke="#7fa6ff" strokeWidth={3} />
    <Glow x={1120} y={330} r={130} color="#ffd23f" opacity={0.35} />
    <g transform="translate(1120 330)">
      <Clock x={0} y={0} r={108} phase={0.28} color="#ffd23f" />
    </g>
    <g transform="translate(780 530)">
      <Clock x={0} y={0} r={96} phase={0.18} color="#7fd3ff" />
    </g>
    <Host x={250} y={860} scale={1.05} pose="shock" mood="shock" mouth={0.8} round={0.9} face={{ lookX: 0.9, lookY: -0.3, eye: 1.32 }} />
    <Headline x={430} y={135} lines={["ПОЧЕМУ ЧАСЫ", "НЕ СОГЛАСНЫ?"]} size={80} font={FONTS.heavy} weight={900} colors={["#ffffff", BRAND.yellow]} stroke="#060b1c" strokeWidth={16} lineGap={1.05} />
    <Pill x={440} y={330} text="Хокинг · время" size={34} bg="#ffffff" />
    <Vignette strength={0.4} />
    <ChannelBadge x={40} y={60} scale={0.85} dark />
  </Frame>
);

// ── №3 Профессор: банан в очках у световых часов ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #10204a 0%, #183a7a 55%, #0f1d44 100%)">
    <Stars n={90} seed={21} />
    <g stroke="#7fd3ff" strokeWidth={10} strokeLinecap="round">
      <line x1={560} y1={230} x2={760} y2={230} />
      <line x1={560} y1={600} x2={760} y2={600} />
      <line x1={900} y1={230} x2={1100} y2={230} />
      <line x1={900} y1={600} x2={1100} y2={600} />
    </g>
    <line x1={660} y1={240} x2={660} y2={590} stroke="#ffd23f" strokeWidth={4} strokeDasharray="10 10" />
    <path d="M 900 590 L 1000 240 L 1100 590" fill="none" stroke="#ffd23f" strokeWidth={6} strokeDasharray="14 10" />
    <Photon x={660} y={330} r={14} />
    <Photon x={1000} y={240} r={14} />
    <Headline x={40} y={135} lines={["ВРЕМЯ", "ЗАМЕДЛЯЕТСЯ?"]} size={96} font={FONTS.display} colors={["#ffffff", "#7fd3ff"]} stroke="#071433" strokeWidth={18} lineGap={1.05} />
    <Host x={250} y={860} scale={0.98} pose="point" mood="wonder" mouth={0.4} glasses bowtie face={{ lookX: 0.8, brow: 0.6 }} />
    <Pill x={560} y={672} text="теория относительности просто" size={34} bg={BRAND.yellow} />
    <ChannelBadge x={980} y={60} scale={0.85} dark />
  </Frame>
);

// ── №4 Противопоставление: «чёрная» дыра и её слабое свечение ──
const Contrast: React.FC = () => (
  <Frame bg="#05060d">
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#06070f" />
    <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#2a0f12" />
    <Glow x={960} y={400} r={330} color="#ff7b3a" opacity={0.45} />
    <Stars n={60} seed={33} />
    <g transform="translate(320 400)">
      <circle r={170} fill="#000" stroke="#3a4060" strokeWidth={5} />
    </g>
    <g transform="translate(960 400)">
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <Spark key={i} x={Math.cos(a) * 230} y={Math.sin(a) * 230} r={16} color={i % 2 ? "#ffd58a" : "#ff9a3a"} />;
      })}
      <circle r={190} fill="#ff9a3a" opacity={0.25} />
      <circle r={170} fill="#000" stroke="#ffd58a" strokeWidth={8} />
    </g>
    <line x1={TW / 2} y1={0} x2={TW / 2} y2={TH} stroke={BRAND.yellow} strokeWidth={8} />
    <Host x={640} y={880} scale={0.88} pose="shrug" mood="confused" mouth={0.3} face={{ lookX: 0.6 }} />
    <Headline x={40} y={110} lines={["ЧЁРНАЯ…"]} size={96} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#000" strokeWidth={14} />
    <Headline x={1244} y={110} lines={["НЕ СОВСЕМ!"]} size={96} font={FONTS.condensed} weight={700} fill={BRAND.yellow} stroke="#2a0a00" strokeWidth={14} anchor="end" />
    <Pill x={780} y={690} text="излучение Хокинга" size={34} bg="#ffffff" />
    <ChannelBadge x={40} y={680} scale={0.8} dark />
  </Frame>
);

// ── №5 Самый сильный: горизонт событий крупно ──
const Strong: React.FC = () => (
  <Frame bg="radial-gradient(circle at 40% 55%, #3b1d12 0%, #12070a 55%, #030205 100%)">
    <Stars n={90} seed={51} color="#ffe2c4" />
    <Rays x={500} y={430} color="#ffb347" count={22} opacity={0.08} />
    <BlackHole x={500} y={430} r={165} t={0.5} disk={1} tilt={0.26} />
    <circle cx={500} cy={430} r={172} fill="none" stroke={BRAND.yellow} strokeWidth={5} strokeDasharray="16 12" />
    <Host x={1080} y={880} scale={1.15} pose="shock" mood="shock" mouth={0.95} round={1} face={{ lookX: -0.9, lookY: -0.1, eye: 1.36, brow: 1 }} />
    <Headline x={36} y={115} lines={["ЧТО ЗА", "ГОРИЗОНТОМ?"]} size={96} font={FONTS.display} colors={["#ffffff", "#ffb347"]} stroke="#1a0600" strokeWidth={18} lineGap={1.02} />
    <Pill x={44} y={668} text="Хокинг · чёрные дыры" size={34} bg="#ffffff" />
    <ChannelBadge x={980} y={60} scale={0.8} dark />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/hawking-brief-history-time/thumbnails.json
// (их же читает проверка орфографии и отчёт); здесь только рисунки.
export const HAWKING_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strong },
};
