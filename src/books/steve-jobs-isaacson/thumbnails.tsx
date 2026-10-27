// Пять YouTube-обложек фильма BM-015 «Стив Джобс» (канал BanaMind).
// Каждая — отдельная концепция из готового сценария: своя композиция, эмоция банана,
// шрифт и палитра. Без фотографий и портретов реальных людей, без логотипов и
// фирменной графики Apple: условные фигуры, обобщённые устройства, своя книжка.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Board, ButtonGrid, Compact, Door, Person, Phone, Player } from "../../lesson-jobs/visuals/draw";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/steve-jobs-isaacson/thumbnails.json";

// ── №1 «ГЕНИЙ ПРОСТОТЫ»: чистая белая мастерская и одно устройство ──
const Simplicity: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 55%, #ffffff 0%, #eef1f6 45%, #c9d0dc 100%)">
    <rect x={560} y={560} width={720} height={160} fill="#dde2ea" />
    <Glow x={900} y={420} r={260} color="#ffffff" opacity={0.95} />
    <g transform="translate(900 600) scale(1.35)" filter="url(#softShadow)">
      <Phone x={0} y={-150} s={1} t={0.5} k={1} />
    </g>
    <Host x={330} y={920} scale={0.95} pose="present" mood="joy" mouth={0.45} face={{ lookX: 0.8 }} />
    <Headline x={40} y={130} lines={["ГЕНИЙ", "ПРОСТОТЫ"]} size={112} font={FONTS.display} fill="#1d2333" colors={["#1d2333", "#f5b700"]} stroke="#ffffff" strokeWidth={14} lineGap={1.0} />
    <Pill x={44} y={318} text="или самый сложный человек?" size={34} bg="#1d2333" color="#ffffff" />
    <ChannelBadge x={980} y={60} scale={0.85} dark />
  </Frame>
);

// ── №2 «ЕГО УВОЛИЛИ»: огромная закрывающаяся дверь кабинета ──
const Fired: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #3b2f4a 0%, #231b30 100%)">
    <Rays x={760} y={420} color="#ffe9b0" count={14} opacity={0.12} />
    <rect x={0} y={600} width={TW} height={120} fill="#1a1424" />
    <g transform="translate(760 690) scale(1.35)">
      <Door x={0} y={0} close={0.82} label="" />
    </g>
    <Glow x={700} y={430} r={140} color="#ffd98a" opacity={0.55} />
    <Person x={700} y={680} s={0.42} color="#20283c" t={0} gesture="sad" opacity={0.85} />
    <Host x={1090} y={880} scale={1.05} pose="shock" mood="shock" mouth={0.85} round={1} face={{ lookX: -0.9, eye: 1.36, brow: 1 }} />
    <Headline x={40} y={140} lines={["ЕГО", "УВОЛИЛИ"]} size={118} font={FONTS.heavy} weight={900} fill="#ffffff" colors={["#ffffff", "#ff7a6b"]} stroke="#120d1a" strokeWidth={16} lineGap={1.0} />
    <Pill x={44} y={398} text="из собственной компании" size={34} bg="#ffffff" />
    <Vignette strength={0.4} />
    <ChannelBadge x={40} y={660} scale={0.8} dark />
  </Frame>
);

// ── №3 «ДВА СТИВА»: плата инженера и продукт для людей ──
const TwoSteves: React.FC = () => (
  <Frame bg="#1d2333">
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#2f8f6a" />
    <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#ffd23f" />
    <g transform="translate(320 470) scale(1.45)">
      <Board x={0} y={0} s={1} t={0.4} glow={1} />
    </g>
    <g transform="translate(960 640) scale(1.15)">
      <Compact x={0} y={0} s={1} t={0.4} k={1} />
    </g>
    <line x1={TW / 2} y1={0} x2={TW / 2} y2={TH} stroke="#ffffff" strokeWidth={10} />
    <Host x={640} y={880} scale={0.74} pose="open" mood="wonder" mouth={0.4} />
    <Headline x={640} y={128} lines={["ДВА СТИВА"]} size={116} font={FONTS.display} fill="#ffffff" stroke="#1d2333" strokeWidth={18} anchor="middle" />
    <Pill x={140} y={250} text="инженер" size={40} bg="#ffffff" />
    <Pill x={790} y={250} text="продукт" size={40} bg="#1d2333" color="#ffffff" />
    <ChannelBadge x={980} y={680} scale={0.75} dark />
  </Frame>
);

// ── №4 «ЦЕНА УСПЕХА»: сияющий продукт и уставшая команда ──
const Price: React.FC = () => (
  <Frame bg="#141824">
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#2a3150" />
    <Rays x={320} y={360} color="#fff3c4" count={20} opacity={0.22} />
    <Glow x={320} y={360} r={200} color="#ffe58a" opacity={0.8} />
    <g transform="translate(320 470) scale(1.4)">
      <Player x={0} y={-80} s={1} t={0.3} spin={1} />
    </g>
    <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#4a4f60" />
    {[0, 1, 2, 3].map((i) => (
      <Person key={i} x={760 + i * 125} y={700} s={0.55} color={["#6f7f99", "#8e6cf0", "#3cc6c0", "#ff7a6b"][i]} t={0} seed={i} gesture="sad" opacity={0.92} />
    ))}
    <line x1={TW / 2} y1={0} x2={TW / 2} y2={TH} stroke="#ffd23f" strokeWidth={10} />
    <Host x={600} y={930} scale={0.95} pose="think" mood="serious" face={{ lookY: -0.5 }} />
    <Headline x={640} y={132} lines={["ЦЕНА УСПЕХА"]} size={104} font={FONTS.heavy} weight={900} fill="#ffd23f" stroke="#0c0f18" strokeWidth={16} anchor="middle" />
    <ChannelBadge x={40} y={60 + 600} scale={0.75} dark />
  </Frame>
);

// ── №5 «ВСЁ ЛИШНЕЕ — ПРОЧЬ»: сотня кнопок разлетается, остаётся одна ──
const Strong: React.FC = () => {
  const keep = (i: number) => i === 34;
  return (
    <Frame bg="radial-gradient(circle at 60% 55%, #3a4570 0%, #1a2040 55%, #0b0f22 100%)">
      <g transform="translate(140 40)" opacity={0.95}>
        <ButtonGrid x={640} y={420} cols={12} rows={7} keep={keep} off={0.55} t={1.3} size={46} />
      </g>
      <Glow x={700} y={410} r={130} color="#ffd23f" opacity={0.75} />
      <rect x={640} y={350} width={120} height={120} rx={30} fill={BRAND.yellow} stroke="#0b0f22" strokeWidth={6} />
      <Host x={250} y={880} scale={1.08} pose="hush" mood="serious" face={{ lookX: 0.6 }} />
      <Headline x={1250} y={128} lines={["ВСЁ ЛИШНЕЕ —", "ПРОЧЬ"]} size={92} font={FONTS.display} fill="#ffffff" colors={["#ffffff", "#ffd23f"]} stroke="#070a17" strokeWidth={16} anchor="end" lineGap={1.05} />
      <Pill x={830} y={640} text="Стив Джобс · Айзексон" size={34} bg="#ffffff" />
      <Vignette strength={0.35} />
      <ChannelBadge x={40} y={60} scale={0.8} dark />
    </Frame>
  );
};

// Тексты, концепции и рекомендация — в books/steve-jobs-isaacson/thumbnails.json.
export const JOBS_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Simplicity, 2: Fired, 3: TwoSteves, 4: Price, 5: Strong },
};
