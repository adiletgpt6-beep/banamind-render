// Пять YouTube-обложек фильма BM-026 «Нравственные письма к Луцилию» (BanaMind).
// Пять разных постановок: книга-символ и конверт, нить дня из руки ведущего,
// Мастерская с прозрачными коробками, лестница желаний против линии «довольно»,
// выбор шага среди обстоятельств. Без издательской обложки, гравюр и портретов —
// только собственная графика фильма (src/lesson-seneca).
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Envelope, GlassBox, Label, Thread } from "../../lesson-seneca/visuals/props";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/seneca-letters-lucilius/thumbnails.json";

const TEAL = "#1f9a9a";
const AMBER = "#e39a2d";
const CORAL = "#e8735f";
const INK = "#1f2a3d";

// ── №1 Классическое: книга-символ, конверт, банан ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #fff4df 0%, #f4d9ae 60%, #dcb380 100%)">
    <Glow x={420} y={420} r={260} color="#fff2c4" opacity={0.8} />
    <BookCover x={380} y={430} scale={1.05} rotate={-6} title={["Письма", "к Луцилию"]} subtitle="Сенека" color="#1f6f6a" accent="#f1d08a" />
    <g transform="translate(640 560) rotate(8)">
      <Envelope x={0} y={0} s={0.8} open={1} num="Письмо I" />
    </g>
    <Host x={1010} y={840} scale={1.08} pose="present" mood="happy" face={{ lookX: -0.8, smile: 0.7 }} />
    <Headline x={640} y={118} lines={["СЕНЕКА • ПРОСТО"]} size={92} font={FONTS.display} fill="#fff" stroke={INK} strokeWidth={15} anchor="middle" />
    <Pill x={640} y={196} text="Нравственные письма к Луцилию" size={32} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.8} dark />
  </Frame>
);

// ── №2 Интрига: нить дня уходит из руки ──
const ThreadHook: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 55%, #fff6e6 0%, #f7d9c2 55%, #e9b39a 100%)">
    {[
      [130, 430],
      [260, 570],
      [150, 690],
    ].map(([x, y], i) => (
      <g key={i}>
        <Thread x1={900} y1={470} x2={x + 40} y2={y} k={1} t={i} sag={30 - i * 20} n={34} color={AMBER} />
        <circle cx={x} cy={y} r={30} fill={CORAL} stroke={INK} strokeWidth={5} />
        <path d={`M ${x - 6} ${y - 44} Q ${x - 6} ${y - 70} ${x + 16} ${y - 70} Q ${x + 38} ${y - 70} ${x + 38} ${y - 48}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      </g>
    ))}
    <Host x={1040} y={900} scale={1.2} pose="pointLeft" mood="shock" face={{ eye: 1.3, brow: 0.9, lookX: -0.8 }} />
    <Headline x={70} y={150} lines={["ЧЬЯ ЭТО", "ЖИЗНЬ?"]} size={120} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={17} lineGap={1.0} />
    <ChannelBadge x={980} y={56} scale={0.8} dark />
  </Frame>
);

// ── №3 Исследователь: Мастерская с коробками ──
const Workshop: React.FC = () => {
  const names = ["время", "одобрение", "достаток", "страх", "отношения"];
  return (
    <Frame bg="linear-gradient(180deg, #e9f4f2 0%, #cfe7e2 55%, #e8d6b4 100%)">
      <Rays x={760} y={420} color="#ffffff" count={18} opacity={0.12} />
      <rect x={360} y={560} width={900} height={26} rx={10} fill="#b9895a" stroke={INK} strokeWidth={4} />
      {names.map((n, i) => (
        <GlassBox key={n} x={450 + i * 185} y={560} w={150} h={140} label={n} labelColor={i === 0 ? "#bfe6e2" : "#ffd23f"} glow={i === 0 ? 1 : 0}>
          {i === 0 ? <circle cx={0} cy={-70} r={30} fill={TEAL} stroke={INK} strokeWidth={4} /> : <circle cx={0} cy={-50} r={16} fill={CORAL} stroke={INK} strokeWidth={3} />}
        </GlassBox>
      ))}
      <Host x={150} y={840} scale={0.9} pose="present" mood="wonder" glasses face={{ lookX: 0.8 }} />
      <Headline x={760} y={150} lines={["ВНУТРЕННЯЯ", "СВОБОДА"]} size={100} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={15} anchor="middle" lineGap={1.0} />
      <ChannelBadge x={980} y={672} scale={0.8} dark />
    </Frame>
  );
};

// ── №4 Сопоставление: лестница желаний и линия «довольно» ──
const Enough: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #f6d3c6 0%, #f6d3c6 50%, #cdeae5 50%, #cdeae5 100%)">
    <g transform="translate(250 0)">
      <rect x={-110} y={-20} width={22} height={760} fill={INK} opacity={0.7} />
      <rect x={90} y={-20} width={22} height={760} fill={INK} opacity={0.7} />
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={-100} y={680 - i * 66} width={200} height={20} rx={10} fill={CORAL} stroke={INK} strokeWidth={3} />
      ))}
      <Label x={0} y={300} text="ещё" size={44} bg="#fff" />
    </g>
    <g transform="translate(1030 0)">
      <line x1={-170} y1={520} x2={170} y2={520} stroke={TEAL} strokeWidth={18} strokeLinecap="round" />
      <Label x={0} y={440} text="довольно" size={46} bg="#bfe6e2" />
    </g>
    <Host x={640} y={880} scale={1.0} pose="point" mood="happy" face={{ lookX: 0.8 }} />
    <Headline x={640} y={128} lines={["СКОЛЬКО", "ДОСТАТОЧНО?"]} size={96} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={15} anchor="middle" lineGap={1.0} />
    <ChannelBadge x={40} y={672} scale={0.8} dark />
  </Frame>
);

// ── №5 Самая сильная: выбранный шаг среди обстоятельств ──
const Choice: React.FC = () => {
  const things = ["чужое решение", "случай", "потеря"];
  return (
    <Frame bg="radial-gradient(circle at 70% 60%, #3a8f8c 0%, #1f5f66 60%, #163f48 100%)">
      <circle cx={900} cy={470} r={150} fill="none" stroke="#bfe6e2" strokeWidth={8} strokeDasharray="4 18" strokeLinecap="round" />
      {things.map((th, i) => {
        const a = -2.4 + i * 1.6;
        return <Label key={th} x={900 + Math.cos(a) * 340} y={520 + Math.sin(a) * 170} text={th} size={36} bg="#fff" rot={(i - 1) * 6} />;
      })}
      <Label x={900} y={470} text="мой шаг" size={44} bg="#bfe6e2" />
      <Host x={260} y={880} scale={1.1} pose="pointUp" mood="serious" face={{ lookX: 0.6 }} />
      <Headline x={560} y={140} lines={["ЧТО ЗАВИСИТ", "ОТ ВАС?"]} size={104} font={FONTS.display} fill="#fff" colors={["#fff", "#ffd23f"]} stroke={INK} strokeWidth={16} anchor="middle" lineGap={1.0} />
      <ChannelBadge x={1000} y={672} scale={0.8} dark />
    </Frame>
  );
};

export const SENECA_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: Classic, 2: ThreadHook, 3: Workshop, 4: Enough, 5: Choice },
};
