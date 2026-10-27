// Пять YouTube-обложек BM-036 «Десятая монета» (канал BanaMind). Пять разных композиций,
// действий и эмоций (TASK §7), а не разные цвета одного макета. Визуал — из фильма: кошелёк и
// предметы из цветных точек, векторные монеты, стол с зонами. Имя автора и название книги на
// обложки не выносятся (настройка владельца).
import React from "react";
import meta from "../../../books/richest-man-in-babylon-clason/thumbnails.json";
import { FONTS } from "../../banamind/fonts";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import { Dots } from "./film/visuals/dots";
import { Coin } from "./film/visuals/kit";

const T = 99; // все точки уже собраны
const KEEP = "#16a8b8";
const SPEND = "#ff6f5e";
const DEBT = "#6a5cd8";
const INCOME = "#2fb36f";

// летящая монета со «следом» движения
const Flying: React.FC<{ x: number; y: number; r: number; dx: number; dy: number }> = ({ x, y, r, dx, dy }) => (
  <g>
    {[0.6, 0.4, 0.2].map((o, i) => (
      <circle key={i} cx={x - dx * (i + 1) * 0.22} cy={y - dy * (i + 1) * 0.22} r={r * (0.9 - i * 0.15)} fill="#f7b928" opacity={o * 0.5} />
    ))}
    <Coin x={x} y={y} r={r} />
  </g>
);

// ── №1 Классическое: «КУДА УХОДЯТ ДЕНЬГИ?» — банан, кошелёк, понятное движение монет ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #fff6e4 0%, #ffe2a8 60%, #f7b74a 100%)">
    <Rays x={760} y={430} color="#fff7dd" count={18} opacity={0.35} />
    <Glow x={760} y={430} r={240} color="#fff4cf" opacity={0.9} />
    <Dots shape="wallet" x={760} y={440} size={400} t={T} at={0} sp={11} />
    {[
      { x: 1010, y: 300, dx: 60, dy: -40, l: "аренда" },
      { x: 1100, y: 470, dx: 80, dy: 0, l: "еда" },
      { x: 1020, y: 620, dx: 60, dy: 40, l: "долг" },
    ].map((c, i) => (
      <g key={i}>
        <Flying x={c.x} y={c.y} r={38} dx={c.dx} dy={c.dy} />
        <Pill x={c.x + 60} y={c.y + 12} text={c.l} size={30} bg={[SPEND, "#ff9b3d", DEBT][i]} color="#fff" />
      </g>
    ))}
    <Host x={250} y={790} scale={0.96} pose="present" mood="wonder" mouth={0.45} round={0.4} />
    <Headline x={40} y={120} lines={["КУДА УХОДЯТ", "ДЕНЬГИ?"]} size={92} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#3a2205" strokeWidth={18} lineGap={1.05} />
    <ChannelBadge x={980} y={680} scale={0.9} dark />
  </Frame>
);

// ── №2 Интрига: «ОСТАВЬ ОДНУ» — десять монет, одна выделена как собственная доля ──
const KeepOne: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #eafbfd 0%, #f7fdff 55%, #d6f3f6 100%)">
    {Array.from({ length: 10 }).map((_, i) => {
      const one = i === 9;
      const x = 250 + (i % 5) * 140;
      const y = i < 5 ? 330 : 500;
      return one ? null : <Coin key={i} x={x} y={y} r={58} op={0.92} />;
    })}
    <Glow x={1090} y={300} r={150} color={KEEP} opacity={0.55} />
    <g transform="translate(1090 300)">
      <circle r={112} fill="none" stroke={KEEP} strokeWidth={14} />
      <Coin x={0} y={0} r={84} />
    </g>
    <path d="M 930 500 Q 1010 470 1040 400" fill="none" stroke={KEEP} strokeWidth={14} strokeLinecap="round" />
    <path d="M 1018 418 L 1042 392 L 1058 426" fill="none" stroke={KEEP} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    <Pill x={1090} y={470} text="себе — первой" size={34} bg={KEEP} color="#fff" anchor="middle" />
    <Host x={170} y={820} scale={0.8} pose="point" mood="shock" mouth={0.6} round={0.9} face={{ lookX: 0.8 }} />
    <Headline x={330} y={150} lines={["ОСТАВЬ ОДНУ"]} size={110} font={FONTS.display} fill="#fff" stroke="#0b3f45" strokeWidth={18} />
    <ChannelBadge x={980} y={680} scale={0.9} dark />
  </Frame>
);

// ── №3 Профессор: «У МОНЕТЫ ЕСТЬ ЗАДАЧА» — банан в очках у предметной схемы ──
const Professor: React.FC = () => {
  const zones = [
    { l: "Запас", c: KEEP, n: 1 },
    { l: "Нужное", c: SPEND, n: 5 },
    { l: "Долги", c: DEBT, n: 2 },
  ];
  return (
    <Frame bg="radial-gradient(circle at 65% 40%, #3b2f6e 0%, #2a2150 60%, #1c1638 100%)">
      <rect x={430} y={250} width={800} height={380} rx={30} fill="#d8914e" />
      <rect x={430} y={600} width={800} height={34} rx={12} fill="#a9632c" />
      {zones.map((z, i) => (
        <g key={z.l}>
          <rect x={470 + i * 255} y={330} width={225} height={230} rx={24} fill="#fff" stroke={z.c} strokeWidth={10} />
          <Pill x={582 + i * 255} y={318} text={z.l} size={34} bg={z.c} color="#fff" anchor="middle" />
          {Array.from({ length: z.n }).map((_, j) => (
            <Coin key={j} x={512 + i * 255 + (j % 3) * 70} y={515 - Math.floor(j / 3) * 70} r={30} />
          ))}
        </g>
      ))}
      <Host x={235} y={810} scale={0.95} pose="point" mood="happy" mouth={0.4} glasses bowtie face={{ lookX: 0.7 }} />
      <Headline x={430} y={110} lines={["У МОНЕТЫ", "ЕСТЬ ЗАДАЧА"]} size={74} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#120d26" strokeWidth={14} lineGap={1.05} />
      <Pill x={40} y={70} text="Простое объяснение" size={32} />
      <ChannelBadge x={990} y={685} scale={0.85} />
    </Frame>
  );
};

// ── №4 Противопоставление: «ЗАРАБОТАЛ ≠ СОХРАНИЛ» — два исхода при одинаковом поступлении ──
const Contrast: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #ffe3de 0%, #ffe3de 50%, #d9f6f0 50%, #d9f6f0 100%)">
    {[0, 1].map((side) => {
      const cx = side ? 960 : 320;
      return (
        <g key={side}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Coin key={i} x={cx - 180 + (i % 5) * 90} y={i < 5 ? 270 : 345} r={34} op={side === 0 ? 0.35 : 1} />
          ))}
          <Dots shape={side ? "walletFull" : "wallet"} x={cx} y={520} size={250} t={T} at={0} sp={9} />
          <Pill x={cx} y={680} text={side ? "запас растёт" : "кошелёк пуст"} size={36} bg={side ? INCOME : SPEND} color="#fff" anchor="middle" />
        </g>
      );
    })}
    <text x={640} y={300} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={60} fill="#2a2140">
      =
    </text>
    <Host x={640} y={790} scale={0.62} pose="shrug" mood="confused" mouth={0.3} />
    <Headline x={640} y={150} lines={["ЗАРАБОТАЛ ≠ СОХРАНИЛ"]} size={84} font={FONTS.heavy} weight={900} fill="#fff" stroke="#2a2140" strokeWidth={16} anchor="middle" />
    <ChannelBadge x={40} y={60} scale={0.8} dark />
  </Frame>
);

// ── №5 Самый сильный: «КОШЕЛЁК СНОВА ПУСТ?» — крупная эмоция, пустой кошелёк, монеты улетают ──
const Strongest: React.FC = () => (
  <Frame bg="radial-gradient(circle at 30% 50%, #fff3c4 0%, #ffcf6e 45%, #f08a2c 100%)">
    <Rays x={380} y={420} color="#fff4cf" count={20} opacity={0.3} />
    {[
      [700, 520, 46, 90, 30],
      [820, 420, 40, 90, -10],
      [960, 560, 44, 100, 20],
      [1080, 430, 36, 90, -20],
      [1180, 580, 34, 80, 10],
    ].map(([x, y, r, dx, dy], i) => (
      <Flying key={i} x={x} y={y} r={r} dx={dx} dy={dy} />
    ))}
    <Dots shape="wallet" x={440} y={510} size={300} t={T} at={0} sp={10} />
    <Host x={1080} y={1080} scale={1.45} pose="shock" mood="shock" mouth={0.9} round={1} face={{ lookX: -0.7, smile: -0.4 }} />
    <Headline x={40} y={130} lines={["КОШЕЛЁК", "СНОВА ПУСТ?"]} size={104} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#3a1a05" strokeWidth={20} lineGap={1.02} />
    <ChannelBadge x={40} y={680} scale={0.85} dark />
  </Frame>
);

export const BM036_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: KeepOne, 3: Professor, 4: Contrast, 5: Strongest },
};
