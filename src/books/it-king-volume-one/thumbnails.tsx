// Пять YouTube-обложек BM-020 «Оно», первый том (канал BanaMind).
// Пять разных композиций из собственной точечной графики фильма: условный город,
// «слепая» зона карты, папка свидетельств, сеть свидетелей, пустое светлое окно.
// Без копии издательской обложки, кино-образов, клоуна и крови. Маркер «Том 1» на каждой.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BookCover, ChannelBadge, Frame, Glow, Headline, Host, Pill, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/it-king-volume-one/thumbnails.json";
import { C } from "./film/theme";
import { Dots, fillRect, join, line, move, rect, type Shape } from "./film/visuals/dots";
import { house, manuscript, town, townWindows } from "./film/visuals/shapes";

const BG = `radial-gradient(ellipse at 50% 38%, #26406b 0%, ${C.bgTop} 45%, ${C.bgBottom} 100%)`;
const map = town();
const win = townWindows();
const Vol: React.FC<{ x?: number; y?: number }> = ({ x = 1110, y = 64 }) => <Pill x={x} y={y} text="ТОМ 1" size={30} bg={C.teal} color={C.ink} anchor="middle" />;

// ── №1 Классическое: банан, книга-символ, город с погасшими окнами
const Classic: React.FC = () => (
  <Frame bg={BG}>
    <g transform="translate(330 300) scale(0.5)" opacity={0.85}>
      <Dots shape={map} k={1} />
      <Dots shape={win} k={1} glow={0.6} only={(_, i) => i % 3 !== 0} />
    </g>
    <Vignette strength={0.5} />
    <BookCover x={760} y={470} scale={0.62} rotate={-6} title={["Оно"]} subtitle="Стивен Кинг · том 1" color="#20304f" accent={C.teal} />
    <Host x={250} y={790} scale={1.02} pose="present" mood="wonder" mouth={0.3} />
    <Headline x={470} y={150} lines={["ОНО • ТОМ 1"]} size={92} font={FONTS.display} fill="#fff" stroke={C.ink} strokeWidth={16} />
    <ChannelBadge x={920} y={660} scale={1.15} dark />
  </Frame>
);

// ── №2 Интрига: «слепая» зона пересекает карту
const Intrigue: React.FC = () => (
  <Frame bg={BG}>
    <g transform="translate(40 120) scale(0.62)">
      <Dots shape={map} k={1} />
      <Dots shape={win} k={1} glow={0.7} only={(d) => d.x < 700 || d.x > 1500} />
      <Dots shape={win} k={1} dimTo={0.12} dimK={1} only={(d) => d.x >= 700 && d.x <= 1500} />
    </g>
    {/* слепая полоса */}
    <rect x={470} y={80} width={460} height={640} fill={C.ink} opacity={0.55} />
    <Headline x={640} y={200} lines={["ГОРОД", "НЕ ВИДИТ"]} size={104} font={FONTS.display} anchor="middle" fill="#fff" stroke={C.ink} strokeWidth={18} colors={[undefined, C.amber]} lineGap={1.05} />
    <Host x={1140} y={820} scale={0.9} pose="ask" mood="wonder" mouth={0.5} round={0.6} flip />
    <Vol x={130} y={64} />
    <ChannelBadge x={40} y={670} scale={1.1} dark />
  </Frame>
);

// ── №3 Исследователь: папка условных городских свидетельств
const folder = (): Shape => join(rect(-260, -170, 520, 340, { col: "amber", gap: 13 }), line(-260, -120, 260, -120, { col: "amber", gap: 13 }), fillRect(-240, -165, 140, 40, { col: "amber", gap: 12, r: 4 }));
const Researcher: React.FC = () => (
  <Frame bg={BG}>
    <Glow x={820} y={380} r={260} color={C.amber} opacity={0.25} />
    <g transform="translate(820 410)">
      <Dots shape={folder()} k={1} />
    </g>
    <g transform="translate(820 420) scale(0.7)">
      <Dots shape={manuscript("paper", 7)} k={1} glow={0.4} />
    </g>
    <Host x={270} y={800} scale={1.02} pose="point" mood="lookBoard" mouth={0.3} glasses />
    <Headline x={640} y={130} lines={["ПАМЯТЬ ВЕРНУЛАСЬ"]} size={78} font={FONTS.display} anchor="middle" fill="#fff" stroke={C.ink} strokeWidth={15} colors={[C.amber]} />
    <Vol x={1180} y={600} />
    <ChannelBadge x={980} y={670} scale={1.05} dark />
  </Frame>
);

// ── №4 Сопоставление: одинокий след против сети свидетелей
const NET: [number, number][] = [
  [900, 260],
  [1080, 220],
  [1180, 380],
  [1000, 470],
  [860, 420],
  [1120, 560],
];
const Compare: React.FC = () => (
  <Frame bg={BG}>
    <rect x={0} y={0} width={TW / 2} height={TH} fill={C.ink} opacity={0.35} />
    {/* одинокий след слева */}
    <circle cx={260} cy={400} r={130} fill="none" stroke={C.dim} strokeWidth={4} strokeDasharray="1 14" strokeLinecap="round" />
    <circle cx={260} cy={400} r={20} fill={C.mist} opacity={0.6} />
    {/* сеть справа */}
    {NET.map((a, i) =>
      NET.slice(i + 1).map((b, j) => {
        if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 260) return null;
        const n = Math.round(Math.hypot(a[0] - b[0], a[1] - b[1]) / 16);
        return Array.from({ length: n + 1 }, (_, k) => <circle key={`${i}-${j}-${k}`} cx={a[0] + ((b[0] - a[0]) * k) / n} cy={a[1] + ((b[1] - a[1]) * k) / n} r={3.4} fill={C.teal} />);
      }),
    )}
    {NET.map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={46} fill={C.amber} opacity={0.15} />
        <circle cx={x} cy={y} r={16} fill={C.amber} />
      </g>
    ))}
    <Host x={640} y={810} scale={0.88} pose="open" mood="joy" mouth={0.55} />
    <Headline x={640} y={120} lines={["ВМЕСТЕ ВИДНО БОЛЬШЕ"]} size={74} font={FONTS.display} anchor="middle" fill="#fff" stroke={C.ink} strokeWidth={15} colors={[C.teal]} />
    <Vol x={1180} y={680} />
    <ChannelBadge x={40} y={670} scale={1.05} dark />
  </Frame>
);

// ── №5 Самый сильный: пустое ярко освещённое окно и тёмная улица
const Strongest: React.FC = () => {
  const big = move(house(700, 470, 1, 1, [true], "teal"), 0, 0);
  return (
    <Frame bg={`radial-gradient(ellipse at 40% 45%, #1d3156 0%, ${C.bgBottom} 75%)`}>
      <Glow x={430} y={470} r={240} color={C.amber} opacity={0.35} />
      <g transform="translate(430 690) scale(0.72)">
        <Dots shape={big} k={1} glow={1} />
      </g>
      {/* тёмная улица: ряд погасших домиков */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${830 + i * 120} 700) scale(0.4)`} opacity={0.6}>
          <Dots shape={house(220, 180, 2, 1, [false, false], "dim")} k={1} />
        </g>
      ))}
      <Host x={1090} y={760} scale={0.9} pose="shock" mood="shock" mouth={0.6} round={0.8} flip />
      <Headline x={640} y={120} lines={["ТИШИНА СТРАШНЕЕ"]} size={84} font={FONTS.display} anchor="middle" fill="#fff" stroke={C.ink} strokeWidth={16} />
      <Vol x={1180} y={210} />
      <ChannelBadge x={40} y={672} scale={1.0} dark />
    </Frame>
  );
};

export const IT_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Researcher, 4: Compare, 5: Strongest },
};
