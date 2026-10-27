// Пять YouTube-обложек BM-018 «Властелин колец: Музей искушений» (канал BanaMind).
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Собственный визуал BanaMind: геометрические фигурки и Кольцо-круг из фильма; никаких
// постеров, кадров, актёров, официальных карт, шрифтов экранизаций и иллюстраций изданий.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/lord-of-the-rings-tolkien/thumbnails.json";
import { Figure, OL, Ring } from "./film/visuals/figures";

const BookTag: React.FC<{ x: number; y: number; dark?: boolean; anchor?: "start" | "middle" }> = ({ x, y, dark, anchor = "start" }) => (
  <Pill x={x} y={y} text="Толкин · «Властелин колец»" size={28} bg={dark ? "#fff" : BRAND.ink} color={dark ? BRAND.ink : "#fff"} anchor={anchor} />
);

// ── №1 Интрига: «Почему все боялись?» — Кольцо-зеркало с отражениями соблазнов ──
const Feared: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #fff3c4 0%, #f6c95a 38%, #b5701a 100%)">
    <Rays x={880} y={360} color="#fff8d8" count={20} opacity={0.22} />
    <Glow x={880} y={360} r={300} color="#fff4c0" opacity={0.75} />
    <g transform="translate(880 360)">
      <circle r={190} fill="#fdf8ec" opacity={0.92} />
      {[
        ["ВЛАСТЬ", -70, -40, "#b5701a"],
        ["ПОРЯДОК", 60, 30, "#4b557a"],
        ["СЛАВА", -50, 90, "#4b557a"],
      ].map(([w, x, y, c]) => (
        <text key={String(w)} x={Number(x)} y={Number(y)} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={40} fill={String(c)} opacity={0.75}>
          {w}
        </text>
      ))}
      <Ring x={0} y={0} r={215} glow={0.4} t={0.5} />
    </g>
    <Host x={250} y={800} scale={0.98} pose="shock" mood="shock" mouth={0.7} round={0.8} face={{ lookX: 0.9, lookY: -0.3, eye: 1.32 }} />
    <Headline x={40} y={120} lines={["ПОЧЕМУ", "ВСЕ БОЯЛИСЬ?"]} size={96} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#3a2205" strokeWidth={18} lineGap={1.05} />
    <BookTag x={720} y={668} />
    <ChannelBadge x={980} y={60} scale={0.85} />
  </Frame>
);

// ── №2 Противопоставление: «Слабый спас мир?» — два хоббита и горы силы ──
const Weak: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #a9d6f2 0%, #e9f4fb 60%, #f4efe2 100%)">
    {[
      [120, 610, 520, 140, "#8c8fa6"],
      [430, 610, 300, 220, "#6f7490"],
      [760, 610, 560, 160, "#9a9db3"],
    ].map(([x, y, h, w, c], i) => (
      <path key={i} d={`M ${Number(x) - Number(w) * 1.4} ${y} L ${x} ${Number(y) - Number(h)} L ${Number(x) + Number(w) * 1.4} ${y} Z`} fill={String(c)} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    ))}
    <rect x={0} y={606} width={TW} height={TH - 606} fill="#d8c9a6" />
    <Glow x={980} y={520} r={190} color="#fff2a8" opacity={0.9} />
    <Figure kind="hobbit" x={900} y={650} s={1.45} mood="calm" bob={false} />
    <Figure kind="sam" x={1060} y={650} s={1.45} mood="happy" bob={false} />
    <Ring x={980} y={300} r={44} glow={1} t={0.4} />
    <Host x={1215} y={770} scale={0.42} pose="pointLeft" mood="wonder" mouth={0.4} round={0.5} />
    <Headline x={40} y={110} lines={["СЛАБЫЙ", "СПАС МИР?"]} size={104} font={FONTS.heavy} weight={900} fill="#fff" colors={[BRAND.yellow, undefined]} stroke={BRAND.ink} strokeWidth={18} lineGap={1.02} />
    <BookTag x={40} y={672} dark />
    <ChannelBadge x={980} y={60} scale={0.85} dark />
  </Frame>
);

// ── №3 Классическое/концептуальное: «Опасная власть» — золото превращается в цепь ──
const Chain: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #ffffff 0%, #f3efe6 100%)">
    {Array.from({ length: 6 }).map((_, i) => {
      const x = 470 + i * 140;
      const col = i === 0 ? "#f2b630" : i < 3 ? "#c9a85a" : "#7d7d86";
      return (
        <g key={i} transform={`translate(${x} ${470 - i * 10}) rotate(${i % 2 ? 90 : 0})`}>
          <ellipse rx={78} ry={42} fill="none" stroke={OL} strokeWidth={30} />
          <ellipse rx={78} ry={42} fill="none" stroke={col} strokeWidth={22} />
        </g>
      );
    })}
    <Ring x={330} y={470} r={110} glow={0.9} t={0.2} />
    <Host x={1150} y={790} scale={0.82} pose="hush" mood="serious" />
    <Headline x={40} y={150} lines={["ОПАСНАЯ", "ВЛАСТЬ"]} size={120} font={FONTS.display} fill={BRAND.ink} colors={[undefined, "#c98a12"]} stroke="#fff" strokeWidth={10} lineGap={1} />
    <Pill x={40} y={640} text="почему мудрые сказали «нет»" size={34} bg={BRAND.yellow} />
    <ChannelBadge x={980} y={60} scale={0.85} dark />
  </Frame>
);

// ── №4 Профессор-исследователь: «Зачем нужна жалость?» — меч опущен, окно истории Горлума ──
const Pity: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #e8f1e4 0%, #cfe3c6 100%)">
    {/* окно истории */}
    <rect x={640} y={170} width={560} height={420} rx={30} fill="#f4f0e6" stroke={OL} strokeWidth={8} />
    <rect x={640} y={170} width={560} height={60} rx={30} fill="#9bb38f" />
    <Figure kind="gollum" x={1060} y={560} s={1.5} mood="scared" bob={false} flip />
    <Figure kind="hobbit" x={790} y={560} s={1.5} mood="sad" bob={false} arm="down" />
    {/* опущенный меч */}
    <g transform="translate(1010 575) rotate(90)">
      <rect x={-8} y={-210} width={16} height={190} fill="#dfe7ee" stroke={OL} strokeWidth={5} />
      <rect x={-36} y={-26} width={72} height={16} rx={6} fill="#c98a12" stroke={OL} strokeWidth={4} />
    </g>
    <path d="M 860 240 q 50 -40 100 0" stroke="#ff7a6b" strokeWidth={12} fill="none" strokeLinecap="round" />
    <Host x={250} y={800} scale={0.95} pose="think" mood="think" glasses />
    <Headline x={40} y={110} lines={["ЗАЧЕМ НУЖНА", "ЖАЛОСТЬ?"]} size={88} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, "#ffb25e"]} stroke="#1e3a24" strokeWidth={16} lineGap={1.08} />
    <BookTag x={660} y={668} />
    <ChannelBadge x={980} y={60} scale={0.85} />
  </Frame>
);

// ── №5 Самый сильный: «Цена победы» — пустая дорога домой, корабль у горизонта ──
const Cost: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #f7d9c4 0%, #f3e7d6 45%, #bfdce8 100%)">
    <Glow x={980} y={300} r={220} color="#fff3d6" opacity={0.9} />
    <circle cx={980} cy={320} r={70} fill="#ffe2b8" />
    <rect x={0} y={360} width={TW} height={140} fill="#8ec3d8" />
    <g transform="translate(1000 380) scale(0.6)">
      <path d="M -160 0 L 160 0 L 120 60 L -120 60 Z" fill="#f4f4f8" stroke={OL} strokeWidth={6} />
      <rect x={-5} y={-240} width={10} height={240} fill={OL} />
      <path d="M 8 -230 Q 130 -130 8 -20 Z" fill="#fff" stroke={OL} strokeWidth={5} />
    </g>
    <path d={`M 0 500 L ${TW} 500 L ${TW} ${TH} L 0 ${TH} Z`} fill="#c9d9a8" />
    <path d={`M 560 ${TH} Q 760 600 900 500 L 960 500 Q 900 620 860 ${TH} Z`} fill="#e9dcc0" />
    <Figure kind="sam" x={820} y={660} s={1.1} mood="sad" bob={false} />
    <Host x={250} y={800} scale={0.95} pose="heart" mood="calm" />
    <Headline x={40} y={130} lines={["ЦЕНА", "ПОБЕДЫ"]} size={120} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#3a2a3a" strokeWidth={18} lineGap={1.02} />
    <BookTag x={720} y={676} dark />
    <ChannelBadge x={980} y={60} scale={0.85} dark />
    <Vignette strength={0.25} />
  </Frame>
);

export const LOTR_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Feared, 2: Weak, 3: Chain, 4: Pity, 5: Cost },
};

