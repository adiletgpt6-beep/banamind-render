// Пять YouTube-обложек фильма BM-005 «48 законов власти» (канал BanaMind).
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Обложка книги — наша простая, не копия настоящего издания; люди — условные
// персонажи фильма, а не портреты. Обложки обещают только то, что есть в фильме.
import React from "react";
import { Board, Castle, Chess, Crown, Figure, Firework } from "../../lesson-greene/visuals/court";
import { OL } from "../../lesson-greene/visuals/draw";
import { FONTS } from "../../banamind/fonts";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/robert-greene-48-laws-of-power/thumbnails.json";

const TITLE = ["48 законов", "власти"];
const SUB = "Роберт Грин";
const GOLD = "#f2b81d";
const VELVET = "#c23b4e";

// нити кукловода: от «рук» сверху к фигуре
const Strings: React.FC<{ from: [number, number][]; to: [number, number][]; color?: string; opacity?: number }> = ({ from, to, color = "#fff6c8", opacity = 0.85 }) => (
  <g opacity={opacity}>
    {from.map(([x1, y1], i) => (
      <line key={i} x1={x1} y1={y1} x2={to[i][0]} y2={to[i][1]} stroke={color} strokeWidth={3} />
    ))}
  </g>
);

// крестовина кукловода
const Cross: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#shadow)">
    <rect x={-120} y={-12} width={240} height={24} rx={10} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
    <rect x={-12} y={-90} width={24} height={180} rx={10} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
  </g>
);

// щит с галочкой
const Shield: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#softShadow)">
    <path d="M 0 -150 L 120 -110 Q 120 40 0 150 Q -120 40 -120 -110 Z" fill="#2f8fd0" stroke={OL} strokeWidth={8} strokeLinejoin="round" />
    <path d="M 0 -118 L 92 -88 Q 92 26 0 114 Q -92 26 -92 -88 Z" fill="#6cc5f0" />
    <path d="M -48 0 L -10 40 L 56 -40" fill="none" stroke="#fff" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// ── №1 Классическое: банан + книга, шахматный король с короной, название ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #3b2575 0%, #5b3aa8 45%, #2a1a52 100%)">
    <Rays x={960} y={420} color="#ffd36b" count={20} opacity={0.12} />
    <Glow x={960} y={430} r={260} color="#ffcf5a" opacity={0.45} />
    <Board x={950} y={700} w={620} />
    <Chess x={960} y={600} kind="king" s={1.55} />
    <Crown x={960} y={268} s={1.1} rot={-6} glow={1} />
    <Chess x={760} y={640} kind="pawn" dark s={0.95} />
    <Chess x={1160} y={650} kind="knight" dark s={1.0} />
    <Headline x={40} y={120} lines={["48 ЗАКОНОВ", "ВЛАСТИ"]} size={110} font={FONTS.display} colors={["#ffffff", BRAND.yellow]} stroke="#1a0f38" strokeWidth={18} lineGap={1.02} />
    <Host x={250} y={870} scale={0.86} pose="present" mood="happy" mouth={0.35} face={{ lookX: 0.7 }} />
    <BookCover x={500} y={520} scale={0.52} rotate={-7} title={TITLE} titleSize={34} subtitle={SUB} color={VELVET} accent={GOLD} />
    <Pill x={40} y={335} text="Роберт Грин за 30 минут" size={36} bg="#ffffff" color={BRAND.ink} />
    <ChannelBadge x={990} y={70} scale={0.95} dark />
  </Frame>
);

// ── №2 Интрига: «Как не стать пешкой?» — нити кукловода над пешкой ──
const Intrigue: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 55%, #3a2a4f 0%, #1c1730 55%, #0c0a18 100%)">
    <Glow x={880} y={520} r={250} color="#c23b4e" opacity={0.35} />
    <Board x={900} y={720} w={700} />
    <Cross x={900} y={110} s={1.1} rot={6} />
    <Strings from={[[790, 120], [1010, 132], [900, 30], [900, 200]]} to={[[860, 420], [940, 420], [900, 400], [900, 470]]} />
    <Chess x={900} y={640} kind="pawn" s={1.9} />
    <Chess x={1150} y={600} kind="king" dark s={1.2} />
    <Vignette strength={0.5} />
    <Headline x={44} y={170} lines={["КАК НЕ СТАТЬ"]} size={104} font={FONTS.heavy} weight={900} fill="#ffffff" stroke="#0c0a18" strokeWidth={16} />
    <Headline x={44} y={315} lines={["ПЕШКОЙ?"]} size={150} font={FONTS.heavy} weight={900} fill={BRAND.yellow} stroke="#0c0a18" strokeWidth={18} />
    <Host x={300} y={920} scale={0.95} pose="shock" mood="shock" mouth={0.8} round={0.8} face={{ lookX: 0.8, lookY: -0.5 }} />
    <BookCover x={1180} y={340} scale={0.36} rotate={8} title={TITLE} titleSize={34} color={VELVET} accent={GOLD} />
    <ChannelBadge x={980} y={690} scale={0.8} dark />
  </Frame>
);

// ── №3 Профессор: доска с законами, банан в очках и бабочке ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #e9d3ad 0%, #d7b98a 100%)">
    <g filter="url(#softShadow)">
      <rect x={500} y={40} width={750} height={580} rx={18} fill="#8a5a2b" />
      <rect x={522} y={62} width={706} height={536} rx={10} fill="#24493c" />
    </g>
    <Glow x={875} y={330} r={260} color="#3c7a62" opacity={0.6} />
    <text x={875} y={140} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={50} fill="#fff4d6">
      Законы власти
    </text>
    {[
      ["1", "не затмевай господина"],
      ["4", "говори меньше"],
      ["5", "береги репутацию"],
      ["29", "продумай финал"],
      ["48", "будь как вода"],
    ].map(([n, s], i) => (
      <g key={n} transform={`translate(570 ${215 + i * 74})`}>
        <circle r={28} fill={BRAND.yellow} />
        <text y={11} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={BRAND.ink}>
          {n}
        </text>
        <text x={50} y={13} fontFamily={FONTS.heavy} fontWeight={800} fontSize={38} fill="#ffffff">
          {s}
        </text>
      </g>
    ))}
    <Crown x={1150} y={160} s={0.6} rot={10} />
    <rect x={0} y={650} width={TW} height={70} fill="#7a4e26" />
    <Host x={260} y={830} scale={0.95} pose="point" mood="happy" mouth={0.35} glasses bowtie face={{ smile: 0.7, brow: 0.25, lookX: 0.8 }} />
    <Headline x={40} y={110} lines={["ИГРЫ", "ВЛАСТИ"]} size={92} font={FONTS.serif} weight={700} colors={[BRAND.yellow, "#fff4d6"]} stroke="#3b2412" strokeWidth={14} lineGap={1.02} />
    <Pill x={1000} y={690} text="Простое объяснение" size={38} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={40} y={690} scale={0.75} dark />
  </Frame>
);

// ── №4 Противопоставление: манипуляция или защита ──
const Contrast: React.FC = () => (
  <Frame bg="#111">
    <defs>
      <linearGradient id="manip" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7a2240" />
        <stop offset="100%" stopColor="#2a0f2a" />
      </linearGradient>
      <linearGradient id="guard" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1f6fb0" />
        <stop offset="100%" stopColor="#0f3b66" />
      </linearGradient>
    </defs>
    <path d={`M 0 0 L 700 0 L 580 ${TH} L 0 ${TH} Z`} fill="url(#manip)" />
    <path d={`M 700 0 L ${TW} 0 L ${TW} ${TH} L 580 ${TH} Z`} fill="url(#guard)" />
    {/* слева — кукловод и марионетка */}
    <Cross x={300} y={240} s={0.85} rot={-8} />
    <Strings from={[[210, 250], [390, 230], [300, 170], [300, 310]]} to={[[250, 470], [350, 470], [300, 440], [300, 560]]} />
    <Figure x={300} y={650} s={0.95} role="modern" mood="worried" arms={[120, 120]} t={1} />
    {/* справа — щит и спокойный человек */}
    <Shield x={1040} y={420} s={1.05} />
    <line x1={700} y1={0} x2={580} y2={TH} stroke="#fff" strokeWidth={8} />
    <Host x={640} y={880} scale={0.86} pose="think" mood="think" face={{ lookX: 0, lookY: -0.9 }} />
    <Headline x={36} y={130} lines={["МАНИПУЛЯЦИЯ"]} size={92} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#3a0a1a" strokeWidth={14} rotate={-3} />
    <Headline x={1250} y={130} lines={["ЗАЩИТА"]} size={110} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#08233f" strokeWidth={14} anchor="end" />
    <Pill x={650} y={230} text="или" size={52} anchor="middle" bg={BRAND.yellow} font={FONTS.condensed} weight={700} />
    <ChannelBadge x={980} y={690} scale={0.75} dark />
  </Frame>
);

// ── №5 Самый сильный: крючок фильма — праздник и арест наутро ──
const Strong: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #1b1846 0%, #33246a 55%, #4a2f8f 100%)">
    <Firework x={170} y={300} k={0.45} r={110} color={GOLD} />
    <Firework x={480} y={260} k={0.5} r={80} color="#ff7a6b" />
    <Firework x={330} y={360} k={0.4} r={70} color="#6cc5f0" />
    <Castle x={320} y={700} s={0.72} color="#e8dcc6" flag={VELVET} />
    {/* стрелка от праздника к решётке */}
    <path d="M 560 520 Q 610 470 660 500" fill="none" stroke={BRAND.yellow} strokeWidth={14} strokeLinecap="round" filter="url(#shadow)" />
    <path d="M 640 470 L 668 503 L 628 516" fill="none" stroke={BRAND.yellow} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    {/* решётка тюрьмы — контраст */}
    <g filter="url(#softShadow)">
      <rect x={690} y={250} width={280} height={400} rx={14} fill="#2b2f45" stroke={OL} strokeWidth={6} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={720 + i * 52} y={250} width={16} height={400} fill="#9aa3b8" stroke={OL} strokeWidth={3} />
      ))}
      <rect x={690} y={420} width={280} height={16} fill="#9aa3b8" stroke={OL} strokeWidth={3} />
    </g>
    <Figure x={830} y={620} s={0.95} role="minister" mood="sad" arms={[150, 150]} t={1} />
    <Host x={1130} y={1010} scale={1.05} pose="shock" mood="shock" mouth={1} round={1} face={{ lookX: -0.9, lookY: -0.2, smile: -1, brow: 1, tilt: 0.85, eye: 1.36, cheek: 0.2 }} />
    <Headline x={40} y={135} lines={["ПРАЗДНИК → ТЮРЬМА"]} size={100} font={FONTS.display} fill="#ffffff" stroke="#1a0f38" strokeWidth={18} />
    <Pill x={44} y={225} text="За что?" size={44} bg={BRAND.yellow} color={BRAND.ink} />
    <ChannelBadge x={40} y={690} scale={0.8} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/robert-greene-48-laws-of-power/thumbnails.json
// (их же читает проверка орфографии и отчёт); здесь только рисунки.
export const GREENE_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strong },
};

