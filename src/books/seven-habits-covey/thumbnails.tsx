// Пять YouTube-обложек фильма BM-022 «7 навыков высокоэффективных людей» (канал BanaMind).
// Пять разных постановок: классическая (банан и книга), интрига (календарь чужой
// срочности), профессор у матрицы срочного/важного, противопоставление «автопилот /
// выбор», семь развилок одного дня. Без издательских картинок книги: книга, герои и
// схемы нарисованы заново в стиле фильма (src/lesson-covey/visuals/draw.tsx).
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { HABIT } from "../../lesson-covey/theme";
import { OL, Person, Phone } from "../../lesson-covey/visuals/draw";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/seven-habits-covey/thumbnails.json";

const TEAL = "#16b3a2";
const CORAL = "#f2735f";

// ── №1 Классическое: банан и книга ──
const Classic: React.FC = () => (
  <Frame bg="radial-gradient(circle at 72% 40%, #5aa8f0 0%, #2f5fb3 55%, #1c3a78 100%)">
    <Rays x={880} y={300} color="#ffffff" count={16} opacity={0.07} />
    <Glow x={890} y={330} r={250} color="#ffe08a" opacity={0.35} />
    <BookCover x={900} y={360} scale={0.95} rotate={6} title={["7", "навыков"]} subtitle="Стивен Кови" color="#1f6f8b" accent="#ffd36a" />
    <Host x={250} y={800} scale={0.92} pose="present" mood="happy" mouth={0.35} />
    <Headline x={40} y={150} lines={["7 НАВЫКОВ"]} size={124} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={16} />
    <Pill x={44} y={240} text="разбор книги Кови" size={40} bg={BRAND.yellow} />
    <ChannelBadge x={990} y={668} scale={0.85} dark />
    <Vignette strength={0.4} />
  </Frame>
);

// ── №2 Интрига: календарь, заполненный чужой срочностью ──
const Intrigue: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #6f86e8 0%, #4a5fc4 60%, #31409a 100%)">
    <g transform="translate(560 120) rotate(-4)" filter="url(#softShadow)">
      <rect x={0} y={0} width={660} height={430} rx={30} fill="#fff" stroke={OL} strokeWidth={6} />
      {["пн", "вт", "ср", "чт", "пт"].map((d, i) => (
        <text key={d} x={66 + i * 132} y={50} fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill="#46557a" textAnchor="middle">
          {d}
        </text>
      ))}
      {Array.from({ length: 20 }).map((_, i) => {
        const c = i % 5;
        const r = Math.floor(i / 5);
        return (
          <g key={i}>
            <rect x={14 + c * 132} y={72 + r * 88} width={104} height={72} rx={14} fill={i === 7 ? "#ffd23f" : "#ffd6cd"} stroke={OL} strokeWidth={3} />
            <text x={66 + c * 132} y={116 + r * 88} fontFamily={FONTS.heavy} fontWeight={800} fontSize={20} fill={OL} textAnchor="middle">
              {i === 7 ? "моё?" : "срочно"}
            </text>
          </g>
        );
      })}
    </g>
    <g transform="translate(1130 520)">
      <Phone x={40} y={60} s={0.72} t={0.4} ring={1} count={40} />
    </g>
    <Host x={230} y={820} scale={0.95} pose="shock" mood="shock" mouth={0.7} round={0.6} />
    <Headline x={36} y={140} lines={["ПОЧЕМУ", "ВСЁ СНОВА?"]} size={98} font={FONTS.display} fill="#fff" colors={["#fff", BRAND.yellow]} stroke={BRAND.ink} strokeWidth={15} lineGap={1.02} />
    <Pill x={40} y={340} text="Кови: 7 навыков" size={34} bg="#fff" />
    <ChannelBadge x={990} y={668} scale={0.85} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №3 Профессор: срочное и важное ──
const Professor: React.FC = () => {
  const q = [
    { n: "I", c: "#ff7a6b", t: "кризисы" },
    { n: "II", c: "#2fbf71", t: "главное" },
    { n: "III", c: "#ffb84a", t: "чужое" },
    { n: "IV", c: "#9aa6c4", t: "бегство" },
  ];
  return (
    <Frame bg="linear-gradient(180deg, #3b2f5c 0%, #5a4a8a 100%)">
      {/* книжные полки */}
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={0} y={150 + r * 190} width={1280} height={16} fill="#7a5a3a" />
          {Array.from({ length: 30 }).map((_, i) => (
            <rect key={i} x={i * 44 + (r % 2) * 18} y={60 + r * 190} width={34} height={90} rx={4} fill={["#c94a4a", "#3d8bff", "#2fbf71", "#ffb84a", "#9b6bff"][(i + r) % 5]} opacity={0.35} />
          ))}
        </g>
      ))}
      <g transform="translate(620 150)" filter="url(#softShadow)">
        <rect x={0} y={0} width={600} height={430} rx={24} fill="#1f3a34" stroke="#7a5a3a" strokeWidth={14} />
        {q.map((it, i) => {
          const x = 30 + (i % 2) * 280;
          const y = 30 + Math.floor(i / 2) * 190;
          const on = i === 1;
          return (
            <g key={it.n}>
              <rect x={x} y={y} width={260} height={170} rx={18} fill={on ? it.c : "#2a4a43"} stroke={on ? "#fff" : it.c} strokeWidth={on ? 8 : 5} />
              <text x={x + 24} y={y + 74} fontFamily={FONTS.display} fontSize={60} fill={on ? "#fff" : it.c}>
                {it.n}
              </text>
              <text x={x + 24} y={y + 140} fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill="#fff">
                {it.t}
              </text>
            </g>
          );
        })}
      </g>
      <Host x={300} y={800} scale={0.92} pose="point" mood="lookBoard" glasses bowtie mouth={0.3} />
      <Headline x={40} y={130} lines={["ВАЖНОЕ ≠", "СРОЧНОЕ"]} size={96} font={FONTS.display} fill="#fff" colors={["#fff", "#7ff0a8"]} stroke={BRAND.ink} strokeWidth={15} />
      <Pill x={44} y={330} text="простое объяснение" size={32} bg={BRAND.yellow} />
      <ChannelBadge x={990} y={668} scale={0.85} dark />
      <Vignette strength={0.4} />
    </Frame>
  );
};

// ── №4 Противопоставление: автопилот или выбор ──
const Versus: React.FC = () => (
  <Frame bg="#ffffff">
    <rect x={0} y={0} width={640} height={720} fill={CORAL} />
    <rect x={640} y={0} width={640} height={720} fill={TEAL} />
    <path d="M 0 560 L 640 520 L 640 720 L 0 720 Z" fill="#c9503e" opacity={0.6} />
    <path d="M 640 520 L 1280 560 L 1280 720 L 640 720 Z" fill="#0d8478" opacity={0.6} />
    <Person who="marat" x={170} y={690} s={0.95} t={0.3} pose="phone" mood="angry" accent="#1d2a44" />
    <Person who="marat" x={1110} y={690} s={0.95} t={0.3} pose="open" mood="calm" accent={BRAND.yellow} flip />
    <Headline x={330} y={185} lines={["АВТОПИЛОТ"]} size={88} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={14} anchor="middle" />
    <Headline x={960} y={185} lines={["ВЫБОР"]} size={96} font={FONTS.display} fill="#fff" stroke={BRAND.ink} strokeWidth={14} anchor="middle" />
    <circle cx={640} cy={330} r={74} fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={8} filter="url(#shadow)" />
    <text x={640} y={358} fontFamily={FONTS.display} fontSize={82} fill={BRAND.ink} textAnchor="middle">
      ?
    </text>
    <Host x={640} y={830} scale={0.78} pose="shrug" mood="wonder" mouth={0.2} />
    <Pill x={640} y={262} text="7 навыков · Стивен Кови" size={30} bg="#fff" anchor="middle" />
    <ChannelBadge x={30} y={60} scale={0.8} dark />
  </Frame>
);

// ── №5 Самый сильный: семь развилок одного дня ──
const Forks: React.FC = () => {
  const pts = [1, 2, 3, 4, 5, 6, 7].map((n, i) => ({ n, x: 470 + i * 112, y: 470 - Math.sin(i * 0.9) * 40 }));
  return (
    <Frame bg="linear-gradient(180deg, #4a74cf 0%, #8fc0f0 55%, #ffd8a0 100%)">
      <Glow x={1100} y={150} r={150} color="#ffcf6a" opacity={0.8} />
      <circle cx={1100} cy={150} r={70} fill="#ffc93c" stroke="#f2a516" strokeWidth={6} />
      {/* дорога, расходящаяся на развилках */}
      <path d={`M 300 520 ${pts.map((p) => `L ${p.x} ${p.y}`).join(" ")} L 1300 420`} stroke={OL} strokeWidth={70} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M 300 520 ${pts.map((p) => `L ${p.x} ${p.y}`).join(" ")} L 1300 420`} stroke={TEAL} strokeWidth={58} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={p.n}>
          <path d={`M ${p.x} ${p.y} L ${p.x + 40} ${p.y - 120 - (i % 2) * 30}`} stroke={CORAL} strokeWidth={22} strokeLinecap="round" opacity={0.85} />
          <circle cx={p.x} cy={p.y} r={34} fill={HABIT[p.n].color} stroke="#fff" strokeWidth={8} />
          <text x={p.x} y={p.y + 13} fontFamily={FONTS.display} fontSize={38} fill="#fff" textAnchor="middle">
            {p.n}
          </text>
        </g>
      ))}
      <Host x={190} y={810} scale={0.9} pose="pointUp" mood="joy" mouth={0.45} />
      <Headline x={40} y={130} lines={["7 РАЗВИЛОК", "ОДНОГО ДНЯ"]} size={92} font={FONTS.display} fill="#fff" colors={["#fff", BRAND.yellow]} stroke={BRAND.ink} strokeWidth={15} />
      <Pill x={44} y={330} text="навыки Кови на практике" size={32} bg="#fff" />
      <ChannelBadge x={990} y={668} scale={0.85} dark />
    </Frame>
  );
};

export const COVEY_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Versus, 5: Forks },
};

