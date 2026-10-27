// Пять YouTube-обложек BM-006 «Атлант расправил плечи» — разбор ознакомительного
// фрагмента первой части (канал BanaMind). Каждая — своя концепция, композиция,
// эмоция банана, шрифт и палитра. Только образы из фрагмента (рельсы, семафор,
// сине-зелёный металл, мост, календарь, уходящие люди, фраза о Голте); обложка
// и иллюстрации издания не воспроизводятся. На каждой — пометка «часть I».
import React from "react";
import { FogQuestion, Ladle, Silhouette, Skyline, Track, Train } from "../../lesson-atlas/visuals/draw";
import { FONTS } from "../../banamind/fonts";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/ayn-rand-atlas-shrugged-fragment/thumbnails.json";

const METAL = "#3fb6a8";
const TITLE = ["Атлант", "расправил", "плечи"];
const SUB = "Айн Рэнд";

// ── №1 Классическое: банан + книга, рельсы из сине-зелёного металла ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #8cc8ee 0%, #cfe8f7 58%, #eef6fb 100%)">
    <Glow x={1100} y={120} r={200} color="#fff3c4" opacity={0.85} />
    <g transform="translate(0 -40)">
      <Skyline y={560} color="#9fb0c8" seed={4} x0={620} x1={1300} />
    </g>
    <rect x={0} y={520} width={TW} height={200} fill="#d9dfe8" />
    <g transform="translate(0 40) scale(1)">
      <Track x1={0} x2={TW} y={560} color={METAL} />
    </g>
    <Train x={1010} y={588} s={0.62} cars={3} t={0} color="#23867c" label="TT" />
    <Host x={250} y={760} scale={0.95} pose="present" mood="happy" mouth={0.35} />
    <BookCover x={545} y={430} scale={0.68} rotate={-7} title={TITLE} subtitle={SUB} color="#24324a" accent={METAL} />
    <Headline x={720} y={120} lines={["АТЛАНТ", "РАСПРАВИЛ", "ПЛЕЧИ"]} size={68} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#1d2333" strokeWidth={14} lineGap={1.12} />
    <Pill x={726} y={355} text="разбор первой части" size={34} bg="#ffffff" />
    <ChannelBadge x={40} y={60} scale={0.85} dark />
  </Frame>
);

// ── №2 Интрига: «Кто такой Джон Голт?» в тумане ──
const Intrigue: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 40%, #4b5d7e 0%, #27344e 50%, #141b2b 100%)">
    <g opacity={0.5}>
      <Skyline y={720} color="#33415c" win="#ffd98a" seed={9} />
    </g>
    <Glow x={900} y={300} r={260} color="#9fb4d8" opacity={0.35} />
    <g opacity={0.55}>
      <FogQuestion x={940} y={330} s={1.25} t={1} color="#c9d6ec" />
    </g>
    <Host x={1090} y={860} scale={1.05} pose="shock" mood="shock" mouth={0.6} round={0.7} />
    <Headline x={50} y={150} lines={["КТО ТАКОЙ", "ДЖОН ГОЛТ?"]} size={112} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#0b1020" strokeWidth={16} lineGap={1.05} />
    <Pill x={56} y={430} text="загадка первых глав" size={38} bg="#ffffff" />
    <BookCover x={250} y={600} scale={0.42} rotate={-10} title={TITLE} subtitle={SUB} color="#24324a" accent={METAL} />
    <Vignette strength={0.45} />
    <ChannelBadge x={420} y={668} scale={0.8} dark />
  </Frame>
);

// ── №3 Профессор: банан в очках у кафедры с книгой ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #5b3f2c 0%, #7a563c 60%, #4a3222 100%)">
    {/* книжные полки */}
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={0} y={60 + r * 170} width={TW} height={16} fill="#3a271a" />
        {Array.from({ length: 34 }).map((_, i) => {
          const h = 90 + ((i * 37 + r * 11) % 50);
          const colors = ["#a23b3b", "#2f5d8a", "#2f7a5a", "#c49a3c", "#6b4a8a", "#8a5a3a"];
          return <rect key={i} x={10 + i * 38} y={60 + r * 170 - h} width={30} height={h} rx={3} fill={colors[(i + r) % 6]} opacity={0.85} />;
        })}
      </g>
    ))}
    <rect x={0} y={0} width={TW} height={720} fill="#1a120c" opacity={0.35} />
    <Glow x={420} y={420} r={300} color="#ffd98a" opacity={0.35} />
    {/* кафедра */}
    <path d="M 270 720 L 300 520 L 560 520 L 590 720 Z" fill="#6b4630" stroke="#2b1a10" strokeWidth={5} />
    <BookCover x={430} y={420} scale={0.62} rotate={-4} title={TITLE} subtitle={SUB} color="#1f6f68" accent="#e8c96a" />
    <Host x={790} y={800} scale={1.02} pose="pointLeft" mood="lookBoard" mouth={0.3} glasses bowtie face={{ lookX: -0.9 }} />
    <Headline x={1240} y={150} lines={["ПРОСТОЕ", "ОБЪЯСНЕНИЕ"]} size={84} font={FONTS.serif} weight={700} fill="#fff8e6" colors={[undefined, BRAND.yellow]} stroke="#2b1a10" strokeWidth={14} anchor="end" lineGap={1.08} />
    <Pill x={1010} y={340} text="Айн Рэнд · часть I" size={36} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={980} y={668} scale={0.85} dark />
  </Frame>
);

// ── №4 Противопоставление: «создать» против «поделить» ──
const Opposition: React.FC = () => (
  <Frame bg="#1d2333">
    {/* слева: плавка и рельсы — труд создателя */}
    <rect x={0} y={0} width={640} height={720} fill="#2c4a54" />
    <Glow x={330} y={420} r={260} color="#ffb35a" opacity={0.45} />
    <Ladle x={280} y={360} s={0.9} tilt={-28} glow={1} />
    <path d="M 400 300 Q 450 420 430 620" stroke="#fff5cf" strokeWidth={34} fill="none" strokeLinecap="round" />
    {Array.from({ length: 18 }).map((_, i) => (
      <circle key={i} cx={430 + Math.cos(i * 2.3) * (60 + i * 8)} cy={600 - Math.abs(Math.sin(i * 1.7)) * (40 + i * 9)} r={4} fill="#ffd27a" />
    ))}
    {/* справа: документ «доля» */}
    <rect x={640} y={0} width={640} height={720} fill="#5a2f3e" />
    <g transform="translate(960 420) rotate(6)">
      <rect x={-170} y={-210} width={340} height={420} rx={14} fill="#fffdf6" stroke="#1d2333" strokeWidth={6} />
      <text x={0} y={-140} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={34} fill="#1d2333">
        Закон
      </text>
      <text x={0} y={-98} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={30} fill="#1d2333">
        справедливой доли
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-120} y={-50 + i * 34} width={i % 2 ? 180 : 240} height={10} rx={5} fill="#c9d1dd" />
      ))}
      <g transform="translate(30 150) rotate(-12)">
        <rect x={-120} y={-36} width={240} height={72} rx={10} fill="none" stroke="#e5484d" strokeWidth={8} />
        <text y={14} textAnchor="middle" fontFamily={FONTS.display} fontSize={40} fill="#e5484d">
          ПРИНЯТ
        </text>
      </g>
    </g>
    <path d="M 640 0 L 640 720" stroke="#fff" strokeWidth={6} opacity={0.7} />
    <Headline x={40} y={118} lines={["СОЗДАТЬ"]} size={104} font={FONTS.condensed} weight={700} fill="#c5f3ea" stroke="#0c1b20" strokeWidth={12} />
    <Headline x={1244} y={118} lines={["ПОДЕЛИТЬ?"]} size={104} font={FONTS.condensed} weight={700} fill="#ffd6dc" stroke="#210c13" strokeWidth={12} anchor="end" />
    <Pill x={640} y={200} text="или" size={46} anchor="middle" bg={BRAND.yellow} font={FONTS.condensed} weight={700} />
    <Host x={640} y={830} scale={0.82} pose="think" mood="think" mouth={0.1} />
    <Pill x={980} y={672} text="«Атлант расправил плечи» · часть I" size={26} bg="#ffffff" anchor="middle" padX={16} />
    <ChannelBadge x={40} y={672} scale={0.8} dark />
  </Frame>
);

// ── №5 Самый сильный: «Лучшие уходят» — календарь, уходящие мастера, изумлённый банан ──
const Strongest: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #ffb46b 0%, #ffd9a8 55%, #ffeed2 100%)">
    <Rays x={860} y={560} color="#fff2d6" count={20} opacity={0.22} />
    <circle cx={860} cy={560} r={150} fill="#ff9d4d" opacity={0.6} />
    <Skyline y={600} color="#7f8fa9" seed={2} />
    {/* календарь над крышами */}
    <g transform="translate(1140 330) rotate(4)">
      <rect x={-150} y={-70} width={300} height={140} rx={12} fill="#fffdf6" stroke="#1d2333" strokeWidth={6} />
      <rect x={-150} y={-70} width={300} height={38} rx={12} fill="#e5484d" />
      <text y={42} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={42} fill="#1d2333">
        2 сентября
      </text>
    </g>
    <rect x={0} y={600} width={TW} height={120} fill="#cfd6e2" />
    <Track x1={0} x2={TW} y={620} />
    {[0, 1, 2, 3].map((i) => (
      <Silhouette key={i} x={520 + i * 150} y={700} s={0.78} walk={1} t={i * 0.4} bag color="#3f4b63" opacity={1 - i * 0.18} />
    ))}
    <Host x={250} y={830} scale={1.1} pose="shock" mood="shock" mouth={0.7} round={0.8} />
    <Headline x={430} y={150} lines={["ЛУЧШИЕ", "УХОДЯТ"]} size={130} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#1d2333" strokeWidth={18} lineGap={1.0} rotate={-3} />
    <Headline x={1150} y={590} lines={["?"]} size={170} font={FONTS.display} fill="#e5484d" stroke="#1d2333" strokeWidth={14} rotate={10} anchor="middle" />
    <Pill x={640} y={672} text="«Атлант расправил плечи» · часть I" size={26} bg="#ffffff" anchor="middle" padX={16} />
    <ChannelBadge x={990} y={672} scale={0.8} dark />
  </Frame>
);

export const ATLAS_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Opposition, 5: Strongest },
};
