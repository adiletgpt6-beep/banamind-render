// Пять YouTube-обложек фильма BM-028 «Космос» Карла Сагана (канал BanaMind).
// Каждая — отдельная концепция из готового сценария («Окно доказательств»): своя
// композиция, эмоция банана, шрифт и палитра. Книга нарисована условно (не обложка
// издательства), космос — собственные схемы из чётких точек, не снимки и не кадры
// телесериала; пришельцев, людей и религиозных символов нет.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Earth, Galaxy, Star } from "../../lesson-sagan/visuals/space";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/cosmos-carl-sagan/thumbnails.json";

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
// чёткие звёзды: не меньше 1,8 px, без размытия
const Stars: React.FC<{ n?: number; seed?: number; color?: string }> = ({ n = 120, seed = 0, color = "#e6eeff" }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={rnd(i + seed) * TW} cy={rnd(i + seed + 400) * TH} r={1.8 + rnd(i + seed + 800) * 2} fill={color} opacity={0.45 + rnd(i + seed + 1200) * 0.5} />
    ))}
  </g>
);

// арочное окно обсерватории с латунной рамой
const Arch: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; id: string }> = ({ x, y, w, h, children, id }) => {
  const r = w / 2;
  const d = `M ${-r} ${h / 2} L ${-r} ${-h / 2 + r} A ${r} ${r} 0 0 1 ${r} ${-h / 2 + r} L ${r} ${h / 2} Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="#0b1230" />
      <g clipPath={`url(#${id})`}>{children}</g>
      <path d={d} fill="none" stroke="#c9a15a" strokeWidth={14} />
      <path d={d} fill="none" stroke="#7d6230" strokeWidth={4} transform="scale(1.03)" />
    </g>
  );
};

const AtomDot: React.FC<{ x: number; y: number; label: string; color: string; r?: number }> = ({ x, y, label, color, r = 34 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={color} stroke="#0b1230" strokeWidth={4} />
    <text y={r * 0.36} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={r * 0.95} fill="#0b1230">
      {label}
    </text>
  </g>
);

// ── №1 Классическое: банан, книга и окно с галактикой ──
const Classic: React.FC = () => (
  <Frame bg="radial-gradient(circle at 75% 40%, #2c3b86 0%, #141c4a 50%, #0a0f2a 100%)">
    <Stars n={130} />
    <Arch x={1030} y={400} w={400} h={560} id="th1">
      <Stars n={40} seed={9} />
      <circle cy={-30} r={150} fill="#ad92ff" opacity={0.12} />
      <Galaxy x={0} y={-30} s={1.25} tilt={0.55} n={300} dot={3.4} />
    </Arch>
    <Host x={250} y={820} scale={0.92} pose="present" mood="happy" mouth={0.35} />
    <BookCover x={560} y={500} scale={0.62} rotate={-6} title={["Космос"]} subtitle="Карл Саган" color="#18214d" accent="#ffd23f" />
    <Headline x={44} y={140} lines={["КОСМОС", "САГАНА"]} size={104} font={FONTS.display} colors={["#ffffff", BRAND.yellow]} stroke="#070a1f" strokeWidth={18} lineGap={1.02} />
    <Pill x={50} y={360} text="простыми словами" size={36} bg="#ffffff" />
    <ChannelBadge x={44} y={672} scale={0.8} dark />
  </Frame>
);

// ── №2 Интрига: звёзды → атомы в нас ──
const Intrigue: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #0b1030 0%, #1f1a52 60%, #3a1f4a 100%)">
    <Stars n={110} seed={7} />
    <Glow x={900} y={300} r={220} color="#ffb347" opacity={0.3} />
    <Star x={900} y={300} r={95} color="#ffb347" />
    {[
      { x: 760, y: 560, l: "N", c: "#86d6ff" },
      { x: 920, y: 600, l: "Ca", c: "#d7deef" },
      { x: 1080, y: 560, l: "Fe", c: "#ff8a7a" },
    ].map((a, i) => (
      <g key={a.l}>
        <line x1={900 + (i - 1) * 40} y1={395} x2={a.x} y2={a.y - 40} stroke="#ffd23f" strokeWidth={5} strokeDasharray="12 10" />
        <AtomDot x={a.x} y={a.y} label={a.l} color={a.c} r={44} />
      </g>
    ))}
    <Host x={280} y={880} scale={1.05} pose="shock" mood="shock" mouth={0.8} round={0.9} face={{ lookX: 0.9, lookY: -0.4, eye: 1.32 }} />
    <Headline x={40} y={130} lines={["МЫ ЧАСТЬ", "ЭТОГО?"]} size={100} font={FONTS.heavy} weight={900} colors={["#ffffff", BRAND.yellow]} stroke="#060b1c" strokeWidth={18} lineGap={1.04} />
    <Pill x={800} y={680} text="звёздное вещество" size={34} bg="#ffffff" />
    <Vignette strength={0.35} />
    <ChannelBadge x={980} y={60} scale={0.8} dark />
  </Frame>
);

// спектр с линиями
const Spectrum: React.FC<{ x: number; y: number; w: number; shift: number; id: string }> = ({ x, y, w, shift, id }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <linearGradient id={id}>
        <stop offset="0%" stopColor="#7a5cf0" />
        <stop offset="25%" stopColor="#3b9cff" />
        <stop offset="45%" stopColor="#4fdc94" />
        <stop offset="65%" stopColor="#ffd23f" />
        <stop offset="82%" stopColor="#ff8a3d" />
        <stop offset="100%" stopColor="#ff4a4a" />
      </linearGradient>
    </defs>
    <rect width={w} height={70} rx={12} fill={`url(#${id})`} stroke="#0b1230" strokeWidth={4} />
    {[0.16, 0.33, 0.55, 0.7].map((l) => (
      <rect key={l} x={(l + shift) * w} y={0} width={9} height={70} fill="#0b1230" />
    ))}
  </g>
);

// ── №3 Профессор: банан в очках и одна ясная схема — спектры ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #10204a 0%, #1c3d7c 55%, #0f1d44 100%)">
    <Stars n={70} seed={21} />
    <g transform="translate(560 300)">
      <rect x={-30} y={-40} width={700} height={340} rx={26} fill="#0b1230" opacity={0.85} stroke="#c9a15a" strokeWidth={5} />
      <Spectrum x={20} y={0} w={600} shift={0} id="th3a" />
      <Spectrum x={20} y={110} w={600} shift={0.08} id="th3b" />
      <Spectrum x={20} y={220} w={600} shift={0.17} id="th3c" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${20 + 0.16 * 600 + 4} ${70 + i * 110} L ${20 + (0.16 + (i + 1) * 0.085) * 600} ${110 + i * 110}`} stroke="#ffffff" strokeWidth={3} strokeDasharray="6 6" opacity={i < 2 ? 0.9 : 0} />
      ))}
    </g>
    <Headline x={40} y={130} lines={["КАК ЧИТАТЬ", "ЗВЁЗДЫ?"]} size={96} font={FONTS.display} colors={["#ffffff", "#86d6ff"]} stroke="#071433" strokeWidth={18} lineGap={1.05} />
    <Host x={250} y={870} scale={0.98} pose="point" mood="wonder" mouth={0.4} glasses bowtie face={{ lookX: 0.8, brow: 0.6 }} />
    <Pill x={600} y={670} text="свет рассказывает" size={36} bg={BRAND.yellow} />
    <ChannelBadge x={980} y={60} scale={0.8} dark />
  </Frame>
);

// ── №4 Противопоставление: пирог и звезда-кузница ──
const Contrast: React.FC = () => (
  <Frame bg="#0b1230">
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#3a2414" />
    <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#121a46" />
    <Stars n={60} seed={33} />
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#3a2414" opacity={0.9} />
    <Glow x={960} y={380} r={260} color="#ffb347" opacity={0.35} />
    {/* пирог */}
    <g transform="translate(300 430)">
      <ellipse rx={200} ry={70} cy={46} fill="#b8743a" />
      <ellipse rx={200} ry={70} fill="#e6ad5e" />
      {[-110, -40, 30, 100].map((x) => (
        <path key={x} d={`M ${x - 24} -12 q 24 -24 48 0`} fill="none" stroke="#a8622a" strokeWidth={7} />
      ))}
    </g>
    <Star x={980} y={380} r={120} color="#ffb347" />
    <AtomDot x={530} y={250} label="C" color="#c8d0e6" r={40} />
    <AtomDot x={640} y={200} label="O" color="#ff8a7a" r={40} />
    <AtomDot x={750} y={250} label="Fe" color="#86d6ff" r={40} />
    <line x1={TW / 2} y1={0} x2={TW / 2} y2={TH} stroke={BRAND.yellow} strokeWidth={8} />
    <Host x={640} y={900} scale={0.86} pose="open" mood="joy" mouth={0.5} face={{ lookY: -0.3 }} />
    <Headline x={40} y={110} lines={["ДАЛЕКО."]} size={100} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#1c0f05" strokeWidth={16} />
    <Headline x={1244} y={110} lines={["НО РЯДОМ."]} size={100} font={FONTS.condensed} weight={700} fill={BRAND.yellow} stroke="#060b1c" strokeWidth={16} anchor="end" />
    <Pill x={40} y={672} text="пирог и звёзды" size={34} bg="#ffffff" />
    <ChannelBadge x={980} y={672} scale={0.8} dark />
  </Frame>
);

// ── №5 Самый сильный: маленькая яркая Земля в арке окна ──
const Strong: React.FC = () => (
  <Frame bg="radial-gradient(circle at 62% 50%, #1b2c66 0%, #0c1436 55%, #060a1e 100%)">
    <Stars n={140} seed={51} />
    <Rays x={800} y={380} color="#86d6ff" count={18} opacity={0.06} />
    <Arch x={800} y={400} w={400} h={600} id="th5">
      <Stars n={50} seed={77} />
      {[150, 125, 105].map((r, i) => (
        <circle key={r} cy={20} r={r} fill="#3f8cff" opacity={0.12 + i * 0.06} />
      ))}
      <Earth x={0} y={20} r={88} spin={0.05} />
    </Arch>
    <Host x={1170} y={880} scale={0.9} pose="heart" mood="serious" mouth={0.1} face={{ lookX: -0.8, lookY: -0.2, brow: 0.2 }} />
    <Headline x={40} y={150} lines={["КТО", "СОХРАНИТ", "ЗЕМЛЮ?"]} size={86} font={FONTS.display} colors={["#ffffff", "#ffffff", BRAND.yellow]} stroke="#050a1c" strokeWidth={18} lineGap={1.02} />
    <Pill x={44} y={500} text="окно доказательств" size={32} bg="#ffffff" />
    <ChannelBadge x={44} y={672} scale={0.8} dark />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/cosmos-carl-sagan/thumbnails.json
// (их же читает проверка орфографии и отчёт); здесь только рисунки.
export const SAGAN_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strong },
};
