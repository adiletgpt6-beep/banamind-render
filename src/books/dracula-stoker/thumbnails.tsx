// Пять YouTube-обложек фильма BM-033 «Дракула» (BanaMind, «Бюро невозможных
// доказательств»). Пять разных постановок: банан перед замком из точек и
// архивных листов, дневник Харкера и пустое зеркало, архивные карточки и лупа,
// две колбы фактов, сливающиеся в одно доказательство, люди вокруг света
// документов. Только собственная графика фильма (src/lesson-dracula): без кадров
// экранизаций, актёров, официальной киносимволики, крови и издательской обложки.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Diary, Flask, Lamp, Stamp, Telegram } from "../../lesson-dracula/visuals/gothic";
import { Particles } from "../../lesson-dracula/visuals/particles";
import { Envelope, Label } from "../../lesson-dracula/visuals/props";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/dracula-stoker/thumbnails.json";

const INK = "#1d2333";
const AMBER = "#f0a640";
const TEAL = "#2aa39a";
const FROST = "#9fc3f0";
const PLUM = "#7d63b0";
const NIGHT = "radial-gradient(circle at 75% 25%, #3b4f86 0%, #24335c 45%, #141c36 100%)";

// звёзды-точки ночного неба (детерминированно)
const Stars: React.FC<{ n?: number; maxY?: number }> = ({ n = 40, maxY = 420 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = ((i * 977) % 1280) + ((i * 31) % 17);
      const y = (i * 313) % maxY;
      return <circle key={i} cx={x} cy={y} r={1.5 + (i % 3)} fill="#e8f0ff" opacity={0.35 + (i % 4) * 0.15} />;
    })}
  </g>
);

// ── №1 Классическое: банан перед замком из точек, холодно-тёплый контраст ──
const Castle: React.FC = () => (
  <Frame bg={NIGHT}>
    <Stars />
    <circle cx={1060} cy={150} r={70} fill="#e8f0ff" opacity={0.9} />
    <Glow x={1060} y={150} r={160} color="#cfe2ff" opacity={0.35} />
    <Particles shape="castle" t={10} at={0} x={900} y={440} s={0.78} r={5.2} step={13} />
    {/* архивные листы у подножия — «дверь» из документов */}
    {[-2, -1, 0, 1, 2].map((i) => (
      <rect key={i} x={830 + i * 34} y={560 - Math.abs(i) * 8} width={70} height={96} rx={6} fill="#f8eedb" stroke={INK} strokeWidth={3} transform={`rotate(${i * 9} ${865 + i * 34} 640)`} />
    ))}
    <Glow x={330} y={520} r={260} color="#ffd28a" opacity={0.5} />
    <Host x={330} y={860} scale={1.12} pose="pointLeft" mood="wonder" flip face={{ eye: 1.25, brow: 0.8, lookX: 0.8 }} />
    <Headline x={640} y={150} lines={["ПОЧЕМУ", "МЫ БОИМСЯ?"]} size={112} font={FONTS.display} fill="#fff" colors={["#fff", BRAND.yellow]} stroke={INK} strokeWidth={17} anchor="middle" lineGap={1.0} />
    <Pill x={900} y={680} text="«Дракула» · Брэм Стокер" size={30} bg="#fff" anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.8} dark />
  </Frame>
);

// ── №2 Интрига: дневник Харкера и зеркало без отражения графа ──
const Diary2: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #f8ecd3 0%, #ecd2a3 55%, #c9a774 100%)">
    <Rays x={420} y={420} color="#fff7e0" count={16} opacity={0.18} />
    <Diary x={430} y={470} s={0.92} k={1} t={10} date="8 мая" title="Дневник Харкера" rows={["в зеркале —", "только я…"]} rowAt={[0, 0]} rot={-4} />
    {/* зеркальце для бритья: в отражении только пустота */}
    <g transform="translate(980 390) rotate(6)">
      <ellipse rx={150} ry={190} fill="#6b4524" stroke={INK} strokeWidth={6} />
      <ellipse rx={124} ry={164} fill="#d6e6fa" stroke={INK} strokeWidth={4} />
      <path d="M -70 -110 Q -90 -40 -60 30" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.75} fill="none" />
      <text y={40} fontFamily={FONTS.heavy} fontWeight={900} fontSize={150} fill={INK} opacity={0.18} textAnchor="middle">
        ?
      </text>
    </g>
    <Host x={1120} y={880} scale={0.95} pose="ask" mood="serious" face={{ lookX: -0.9, brow: 0.2, tilt: -0.2 }} />
    <Headline x={60} y={128} lines={["ОН ПИСАЛ", "ПРАВДУ?"]} size={110} font={FONTS.display} fill="#fff" colors={["#fff", BRAND.yellow]} stroke={INK} strokeWidth={17} lineGap={1.0} />
    <ChannelBadge x={980} y={56} scale={0.8} dark />
  </Frame>
);

// ── №3 Профессор: архивные карточки, лупа, банан в очках ──
const Archive: React.FC = () => {
  const cards = [
    { x: 520, y: 330, r: -8, t: "дневник" },
    { x: 760, y: 300, r: 5, t: "письмо" },
    { x: 1000, y: 340, r: -4, t: "газета" },
    { x: 620, y: 520, r: 6, t: "телеграмма" },
    { x: 880, y: 540, r: -6, t: "фонограф" },
  ];
  return (
    <Frame bg="linear-gradient(180deg, #24335c 0%, #1b2747 55%, #3a2a14 100%)">
      <Stars n={24} maxY={240} />
      <Glow x={780} y={430} r={330} color="#ffd28a" opacity={0.35} />
      {/* нити между карточками */}
      {cards.slice(1).map((c, i) => (
        <line key={i} x1={cards[i].x} y1={cards[i].y} x2={c.x} y2={c.y} stroke={AMBER} strokeWidth={6} strokeDasharray="12 10" />
      ))}
      {cards.map((c) => (
        <g key={c.t} transform={`translate(${c.x} ${c.y}) rotate(${c.r})`}>
          <rect x={-120} y={-70} width={240} height={140} rx={12} fill="#f8eedb" stroke={INK} strokeWidth={5} />
          <text y={14} fontFamily={FONTS.heavy} fontWeight={900} fontSize={36} fill={INK} textAnchor="middle">
            {c.t}
          </text>
        </g>
      ))}
      <Particles shape="magnifier" t={10} at={0} x={1120} y={470} s={0.36} r={4.6} step={13} />
      <Host x={210} y={870} scale={1.0} pose="present" mood="think" glasses face={{ lookX: 0.9 }} />
      <Headline x={760} y={128} lines={["ТАЙНА ДРАКУЛЫ"]} size={100} font={FONTS.display} fill="#fff" stroke={INK} strokeWidth={16} anchor="middle" />
      <Pill x={700} y={690} text="разбор по документам" size={34} bg={BRAND.yellow} anchor="middle" />
      <ChannelBadge x={1000} y={680} scale={0.8} dark />
    </Frame>
  );
};

// ── №4 Противопоставление: два факта в колбах сливаются в одно доказательство ──
const Flasks: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #1d2a4c 0%, #24335c 50%, #f1d9a6 50%, #fbf1dc 100%)">
    <Stars n={18} maxY={700} />
    <Flask x={230} y={380} s={1.0} k={1} level={0.55} color={FROST} label="факт 1" t={3} />
    <Flask x={1050} y={380} s={1.0} k={1} level={0.55} color={PLUM} label="факт 2" t={5} />
    {/* в центре — общее большое доказательство */}
    <Glow x={640} y={430} r={170} color="#bff3ea" opacity={0.6} />
    <Flask x={640} y={420} s={1.45} k={1} level={0.85} color={TEAL} t={7} />
    <path d="M 380 430 Q 480 380 540 420" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="4 18" />
    <path d="M 900 430 Q 800 380 740 420" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="4 18" />
    <Host x={1200} y={910} scale={0.5} pose="cheer" mood="joy" />
    <Headline x={640} y={120} lines={["ВЕРИТЬ ИЛИ НЕТ?"]} size={96} font={FONTS.display} fill="#fff" stroke={INK} strokeWidth={16} anchor="middle" />
    <Pill x={640} y={680} text="одно доказательство — мало" size={32} bg="#fff" anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.8} dark />
  </Frame>
);

// ── №5 Самый сильный: люди-силуэты вокруг света документов, банан ведёт ──
const Together: React.FC = () => (
  <Frame bg="radial-gradient(circle at 55% 62%, #6a5a3a 0%, #2c3d6c 45%, #141c36 100%)">
    <Stars n={30} maxY={300} />
    <Glow x={700} y={520} r={260} color="#ffdf9e" opacity={0.75} />
    <Lamp x={700} y={420} s={0.8} k={1} t={0} />
    <Envelope x={600} y={560} s={0.45} k={1} rot={-8} />
    <Telegram x={820} y={560} s={0.42} k={1} text="ВСЕ ВМЕСТЕ" rot={6} />
    {/* условные силуэты группы — без лиц и без кинообразов */}
    {[
      [430, 600, AMBER],
      [540, 640, TEAL],
      [870, 640, PLUM],
      [980, 600, FROST],
    ].map(([x, y, c], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <path d="M -70 140 L -60 10 Q 0 -20 60 10 L 70 140 Z" fill={c as string} stroke={INK} strokeWidth={5} />
        <circle cy={-50} r={52} fill="#2a2f45" stroke={INK} strokeWidth={5} />
      </g>
    ))}
    <Stamp x={700} y={690} text="свидетельство" k={1} color="#ffd23f" rot={-4} size={34} />
    <Host x={160} y={880} scale={0.95} pose="pointUp" mood="joy" />
    <Headline x={700} y={140} lines={["КТО ПОБЕДИТ", "СТРАХ?"]} size={108} font={FONTS.display} fill="#fff" colors={["#fff", BRAND.yellow]} stroke={INK} strokeWidth={17} anchor="middle" lineGap={1.0} />
    <ChannelBadge x={1000} y={672} scale={0.8} dark />
  </Frame>
);

export const DRACULA_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: Castle, 2: Diary2, 3: Archive, 4: Flasks, 5: Together },
};

export { Label };
