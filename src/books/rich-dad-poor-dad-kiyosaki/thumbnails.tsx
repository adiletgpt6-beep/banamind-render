// Пять YouTube-обложек BM-023 «Богатый папа, бедный папа» (канал BanaMind).
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Собственный визуал BanaMind (монета, дорожки, карман, дом на «рентгене» из фильма);
// издательская обложка и иллюстрации книги не используются.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/rich-dad-poor-dad-kiyosaki/thumbnails.json";
import { Coin, House, OL } from "./film/visuals/draw";

const AuthorTag: React.FC<{ x: number; y: number; dark?: boolean }> = ({ x, y, dark }) => <Pill x={x} y={y} text="Кийосаки" size={30} bg={dark ? "#fff" : BRAND.ink} color={dark ? BRAND.ink : "#fff"} />;

// ── №1 Классическое: банан + книга + монеты ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #fff3cf 0%, #ffd77a 55%, #f0a92c 100%)">
    <Rays x={360} y={420} color="#fff8dc" count={20} opacity={0.3} />
    <Glow x={360} y={420} r={260} color="#fff6d0" opacity={0.8} />
    {[
      [120, 600, 54, 0.4],
      [600, 640, 46, 2.2],
      [980, 660, 60, 0.1],
      [1180, 560, 40, 1.4],
      [700, 140, 36, 0.8],
    ].map(([x, y, r, s], i) => (
      <Coin key={i} x={x} y={y} r={r} spin={s} />
    ))}
    <BookCover x={500} y={420} scale={0.78} rotate={-6} title={["Богатый", "папа,", "бедный", "папа"]} color="#2b3a67" accent="#f5b52e" />
    <Host x={230} y={800} scale={0.98} pose="present" mood="happy" mouth={0.4} />
    <Headline x={690} y={190} lines={["БОГАТЫЙ ПАПА,", "БЕДНЫЙ ПАПА"]} size={62} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#3a2205" strokeWidth={16} lineGap={1.15} />
    <Pill x={710} y={370} text="Роберт Кийосаки" size={34} bg={BRAND.ink} color="#fff" />
    <ChannelBadge x={712} y={470} scale={1.2} dark />
  </Frame>
);

// ── №2 Интрига: одна зарплата — два пути ──
const TwoPaths: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #eaf4ff 0%, #f8fbff 60%, #e8f7ef 100%)">
    {/* красная дорожка к нулю */}
    <path d="M 420 470 C 640 470 720 250 1180 210" fill="none" stroke="#ff6b5e" strokeWidth={46} strokeLinecap="round" opacity={0.9} />
    <circle cx={1180} cy={210} r={64} fill="#fff" stroke="#d8433a" strokeWidth={10} />
    <text x={1180} y={240} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={84} fill="#d8433a">
      0
    </text>
    {/* зелёная дорожка к запасу */}
    <path d="M 420 520 C 640 520 720 640 1150 600" fill="none" stroke="#2fbf8f" strokeWidth={46} strokeLinecap="round" opacity={0.95} />
    {[0, 1, 2, 3].map((i) => (
      <Coin key={i} x={1150} y={590 - i * 30} r={42} />
    ))}
    <Pill x={1010} y={680} text="запас" size={34} bg="#2fbf8f" color="#fff" />
    <Glow x={400} y={500} r={170} color="#ffd23f" opacity={0.6} />
    <Coin x={420} y={495} r={92} face />
    <Host x={210} y={820} scale={0.9} pose="point" mood="wonder" mouth={0.5} round={0.6} face={{ lookX: 0.8, lookY: -0.2 }} />
    <Headline x={40} y={120} lines={["ОДНА ЗАРПЛАТА —", "ДВА ПУТИ"]} size={84} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke={BRAND.ink} strokeWidth={16} lineGap={1.08} />
    <ChannelBadge x={980} y={665} scale={0.85} dark />
    <AuthorTag x={40} y={672} />
  </Frame>
);

// ── №3 Профессор: доска «актив / пассив» ──
const Professor: React.FC = () => (
  <Frame bg="radial-gradient(circle at 60% 40%, #2f6b56 0%, #1d4a3c 60%, #123129 100%)">
    {/* доска */}
    <rect x={420} y={90} width={820} height={480} rx={24} fill="#244f42" stroke="#8a5a2b" strokeWidth={18} />
    {/* карман */}
    <g transform="translate(830 400)">
      <path d="M -130 -100 L 130 -100 L 112 80 Q 0 130 -112 80 Z" fill="#4c6db8" stroke="#fff" strokeWidth={6} />
      <path d="M -130 -100 L 130 -100" stroke="#2f4a8a" strokeWidth={14} />
    </g>
    {/* стрелки */}
    <path d="M 560 250 L 760 250 L 760 300" fill="none" stroke="#5fe0b0" strokeWidth={20} strokeLinecap="round" />
    <path d="M 742 290 L 760 320 L 778 290" fill="none" stroke="#5fe0b0" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 900 300 L 900 250 L 1100 250" fill="none" stroke="#ff8f70" strokeWidth={20} strokeLinecap="round" />
    <path d="M 1090 232 L 1120 250 L 1090 268" fill="none" stroke="#ff8f70" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
    <Headline x={560} y={200} lines={["АКТИВ"]} size={74} font={FONTS.display} fill="#5fe0b0" stroke="#0e241d" strokeWidth={12} anchor="middle" />
    <Headline x={1100} y={200} lines={["ПАССИВ"]} size={74} font={FONTS.display} fill="#ff8f70" stroke="#0e241d" strokeWidth={12} anchor="middle" />
    <Host x={250} y={820} scale={0.98} pose="point" mood="happy" mouth={0.45} glasses bowtie face={{ lookX: 0.6 }} />
    <Pill x={470} y={655} text="Простое объяснение" size={44} />
    <ChannelBadge x={40} y={60} scale={0.85} />
    <AuthorTag x={1080} y={655} dark />
  </Frame>
);

// ── №4 Противопоставление: «не могу позволить» vs «как могу позволить?» ──
const Duel: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #8f97a8 0%, #b9bfcc 49.9%, #ffcc4d 50.1%, #ffb21f 100%)">
    {/* закрытая дверь */}
    <rect x={130} y={300} width={240} height={360} rx={12} fill="#6c7385" stroke={OL} strokeWidth={8} />
    <circle cx={330} cy={480} r={14} fill="#c9ced8" />
    <path d="M 180 380 L 320 520 M 320 380 L 180 520" stroke="#e5484d" strokeWidth={22} strokeLinecap="round" />
    {/* шестерёнки мысли */}
    {[
      [1000, 420, 110, 0],
      [1150, 560, 70, 20],
    ].map(([x, y, r, rot], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
        {Array.from({ length: 10 }).map((_, j) => (
          <rect key={j} x={-r * 0.2} y={-r * 1.25} width={r * 0.4} height={r * 0.45} rx={6} fill="#fff6d0" stroke={OL} strokeWidth={6} transform={`rotate(${j * 36})`} />
        ))}
        <circle r={r} fill="#fff6d0" stroke={OL} strokeWidth={8} />
        <circle r={r * 0.35} fill="#ffb21f" stroke={OL} strokeWidth={6} />
      </g>
    ))}
    <Host x={640} y={830} scale={0.95} pose="shrug" mood="think" mouth={0.2} />
    <Headline x={40} y={120} lines={["НЕ МОГУ", "ПОЗВОЛИТЬ"]} size={74} font={FONTS.heavy} weight={900} fill="#fff" stroke="#2a2f3d" strokeWidth={14} lineGap={1.05} />
    <Headline x={1240} y={120} lines={["КАК МОГУ", "ПОЗВОЛИТЬ?"]} size={74} font={FONTS.heavy} weight={900} fill="#fff" stroke="#5a3a00" strokeWidth={14} lineGap={1.05} anchor="end" />
    <ChannelBadge x={510} y={672} scale={0.85} dark />
    <AuthorTag x={1080} y={672} dark />
  </Frame>
);

// ── №5 Самый сильный: «Ваш дом — пассив?» ──
const HouseQuestion: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 50%, #24476e 0%, #132a46 60%, #0b1a2e 100%)">
    <Glow x={880} y={420} r={300} color="#7fe3ff" opacity={0.25} />
    <g transform="translate(880 600) scale(1.9)">
      <House x={0} y={0} big roof="#ff6b5e" />
    </g>
    {/* «рентген»: половина дома — синий экран со стрелками расходов */}
    <g>
      <rect x={880} y={170} width={300} height={440} fill="#0f2a4a" opacity={0.9} />
      {[960, 1060].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={520} x2={x} y2={300} stroke="#ff8f70" strokeWidth={14} strokeLinecap="round" />
          <path d={`M ${x - 20} 320 L ${x} 290 L ${x + 20} 320`} fill="none" stroke="#ff8f70" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <line x1={880} y1={160} x2={880} y2={620} stroke="#7fe3ff" strokeWidth={8} />
    </g>
    <Host x={250} y={820} scale={1.02} pose="shock" mood="shock" mouth={0.75} round={0.85} face={{ lookX: 0.8, eye: 1.32 }} />
    <Headline x={40} y={130} lines={["ВАШ ДОМ —", "ПАССИВ?"]} size={104} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#06101f" strokeWidth={18} lineGap={1.05} />
    <Vignette strength={0.35} />
    <ChannelBadge x={980} y={665} scale={0.85} />
    <AuthorTag x={1040} y={60} dark />
  </Frame>
);

export const RDDP_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: TwoPaths, 3: Professor, 4: Duel, 5: HouseQuestion },
};

