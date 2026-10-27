// Пять YouTube-обложек фильма BM-032 «Джейн Эйр» (канал BanaMind).
// Пять разных сцен из фильма: Красная комната с книгой; любовь против свободы
// у окна; одиночество на пустоши; наследство на четверых; открытая дверь
// финала и золотой путь. Без обложек изданий, кадров экранизаций и лиц актёров —
// персонажи нарисованы заново в стиле фильма (src/lesson-jane).
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { OL, Person } from "../../lesson-jane/visuals/draw";
import { Particles } from "../../lesson-jane/visuals/particles";
import { Candle, Door, Moor, Signpost, Window } from "../../lesson-jane/visuals/scenery";
import { DotPath, VoiceFlame } from "../../lesson-jane/visuals/voice";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/jane-eyre-bronte/thumbnails.json";

const INK = "#1f2a3d";
const RED = "#cf3f4b";
const GOLD = "#f0a92e";

// ── №1 Классика: Красная комната, книга, огонёк ──
const RedRoom: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #fbe0d8 0%, #f0b8ae 55%, #d9897e 100%)">
    {/* полог кровати */}
    <g transform="translate(1110 720)">
      <rect x={-230} y={-520} width={460} height={44} rx={10} fill="#8a2430" stroke={OL} strokeWidth={5} />
      <path d="M -230 -476 Q -270 -260 -210 -120 L -160 -120 Q -190 -300 -160 -476 Z" fill={RED} stroke={OL} strokeWidth={4} />
      <path d="M 230 -476 Q 270 -260 210 -120 L 160 -120 Q 190 -300 160 -476 Z" fill={RED} stroke={OL} strokeWidth={4} />
      <rect x={-200} y={-200} width={400} height={200} rx={20} fill="#f4e6e0" stroke={OL} strokeWidth={5} />
      <rect x={-215} y={-110} width={430} height={110} rx={14} fill={RED} stroke={OL} strokeWidth={5} />
    </g>
    <Door x={150} y={720} s={0.95} locked color="#8a3a3a" />
    <Glow x={560} y={360} r={230} color="#fff1c4" opacity={0.6} />
    <BookCover x={560} y={430} scale={0.66} rotate={-6} title={["Джейн", "Эйр"]} subtitle="Шарлотта Бронте" color="#7a2a3a" accent="#f1d08a" />
    <Person who="janeKid" x={850} y={700} s={0.78} mood="tense" pose="stand" t={0.4} />
    <VoiceFlame x={850} y={330} t={0.6} s={0.5} />
    <Host x={1150} y={780} scale={0.72} pose="shock" mood="shock" face={{ lookX: -0.8 }} />
    <Headline x={640} y={110} lines={["ДЖЕЙН ЭЙР"]} size={104} font={FONTS.display} fill="#fff" stroke={INK} strokeWidth={16} anchor="middle" />
    <Pill x={640} y={178} text="Шарлотта Бронте · разбор романа" size={32} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.8} dark />
    <Vignette strength={0.25} />
  </Frame>
);

// ── №2 Противопоставление: любовь (тепло, подарки) / свобода (окно) ──
const LoveFreedom: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #f6c27a 0%, #f2d3a2 49.9%, #cfe6f4 50%, #9cc6e8 100%)">
    <Glow x={300} y={330} r={240} color="#fff1c4" opacity={0.55} />
    <Candle x={120} y={560} s={0.6} t={0.3} />
    <Person who="rochester" x={330} y={700} s={0.78} mood="smile" pose="reach" t={0.5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={470 + i * 26} cy={430 - (i % 2) * 24} r={13} fill={GOLD} stroke={OL} strokeWidth={3} />
    ))}
    <Window x={1010} y={350} w={300} h={380} t={0.2} sky="#d8ecf8" hills="#9fcf8a" curtain="" />
    <Person who="jane" x={800} y={700} s={0.78} mood="tense" pose="point" t={0.4} flip />
    <VoiceFlame x={800} y={200} t={0.4} s={0.45} />
    <Host x={570} y={800} scale={0.52} pose="shrug" mood="think" face={{ lookY: -0.3 }} />
    <Headline x={40} y={112} lines={["ЛЮБОВЬ"]} size={100} font={FONTS.display} fill="#fff" stroke={INK} strokeWidth={15} />
    <Headline x={1240} y={112} lines={["ИЛИ СВОБОДА?"]} size={84} font={FONTS.display} fill={BRAND.yellow} stroke={INK} strokeWidth={15} anchor="end" />
    <ChannelBadge x={980} y={672} scale={0.8} dark />
  </Frame>
);

// ── №3 Интрига: одна на пустоши, указатель, дождь ──
const MoorAlone: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #dcd4ec 0%, #eae4f4 45%, #c9b6e2 100%)">
    <g transform="scale(0.6667)">
      <Moor t={3} />
      <Signpost x={1500} y={900} s={1} arms={["?", "?"]} />
      {Array.from({ length: 46 }).map((_, i) => {
        const px = (i * 83) % 1920;
        const py = (i * 157) % 1080;
        return <line key={i} x1={px} y1={py} x2={px - 14} y2={py + 40} stroke="#7a76a0" strokeWidth={4} opacity={0.5} strokeLinecap="round" />;
      })}
    </g>
    <Person who="jane" x={640} y={680} s={0.82} mood="sad" pose="walk" t={0.2} />
    <VoiceFlame x={640} y={180} t={0.5} s={0.45} />
    <Host x={220} y={800} scale={0.68} pose="think" mood="think" face={{ lookX: 0.8, lookY: -0.3 }} />
    <Headline x={1240} y={130} lines={["ПОЧЕМУ", "ОНА УШЛА?"]} size={86} font={FONTS.display} fill="#fff" colors={["#fff", BRAND.yellow]} stroke={INK} strokeWidth={15} anchor="end" lineGap={1.0} />
    <ChannelBadge x={980} y={672} scale={0.8} dark />
    <Vignette strength={0.3} />
  </Frame>
);

// ── №4 Профессор: наследство на четверых ──
const Inheritance: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #2f5a46 0%, #4c7f5e 55%, #e6d5a8 100%)">
    <Rays x={760} y={300} color="#ffe8b0" count={16} opacity={0.08} />
    <g transform="translate(760 330) rotate(-4)">
      <rect x={-210} y={-150} width={420} height={300} rx={10} fill="#fff9ee" stroke={OL} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={-170} x2={150 - i * 30} y1={-90 + i * 44} y2={-90 + i * 44} stroke="#8892ab" strokeWidth={8} strokeLinecap="round" />)}
      <circle cx={150} cy={100} r={38} fill={RED} stroke={OL} strokeWidth={4} />
    </g>
    {[0, 1, 2, 3].map((g) => (
      <g key={g} transform={`translate(${480 + g * 190} 610)`}>
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={0} cy={-i * 18} rx={42} ry={14} fill={GOLD} stroke={OL} strokeWidth={3} />)}
      </g>
    ))}
    <Host x={210} y={830} scale={0.82} pose="point" mood="joy" glasses bowtie face={{ lookX: 0.8 }} />
    <Headline x={1240} y={120} lines={["20 000", "НА ЧЕТВЕРЫХ"]} size={92} font={FONTS.display} fill={BRAND.yellow} colors={[BRAND.yellow, "#fff"]} stroke="#123026" strokeWidth={15} anchor="end" lineGap={1.0} />
    <Pill x={1060} y={312} text="Джейн Эйр · Бронте" size={34} bg="#fff" anchor="middle" />
    <ChannelBadge x={980} y={672} scale={0.8} dark />
    <Vignette strength={0.3} />
  </Frame>
);

// ── №5 Самая сильная: путь из точек к открытой двери, огонёк ──
const OpenDoor: React.FC = () => (
  <Frame bg="radial-gradient(circle at 72% 45%, #fff6dc 0%, #f9dfa8 55%, #e9b96a 100%)">
    <Rays x={900} y={330} color="#fff2c4" count={18} opacity={0.14} />
    <DotPath pts={[[60, 660], [300, 610], [560, 650], [760, 590], [900, 560]]} k={1} n={28} r={11} t={0.5} />
    <Door x={960} y={650} s={1.3} open={1} color="#6b4a3a" glow="#fff4c8" />
    <Particles shape="girl" t={3} at={0} dur={1} x={600} y={470} s={0.55} r={6.4} step={14} spread={10} />
    <VoiceFlame x={600} y={265} t={0.5} s={0.45} />
    <Host x={1170} y={790} scale={0.62} pose="cheer" mood="joy" />
    <Headline x={50} y={135} lines={["ЦЕНА", "СВОЕГО", "ГОЛОСА"]} size={92} font={FONTS.display} fill="#fff" colors={["#fff", "#fff", BRAND.yellow]} stroke={INK} strokeWidth={15} lineGap={0.98} />
    <ChannelBadge x={980} y={672} scale={0.8} dark />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/jane-eyre-bronte/thumbnails.json.
export const JANE_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: RedRoom, 2: LoveFreedom, 3: MoorAlone, 4: Inheritance, 5: OpenDoor },
};
