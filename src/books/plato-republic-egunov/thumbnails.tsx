// Пять YouTube-обложек BM-039 «Государство» (Платон) — канал BanaMind.
// Пять разных концепций: справедливость (весы), пещера, идеальный город,
// философ у власти, порядок или свобода. Визуальный язык фильма — цветные
// точки (те же фигуры, что в кадре: src/bm039-republic/dots/shapes.ts).
// Платон, боги и религиозные святыни не изображаются.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { shapePoints, type ShapeSpec } from "../../bm039-republic/dots/shapes";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/plato-republic-egunov/thumbnails.json";

const TITLE = ["Государство"];
const SUB = "Платон";

// фигура из точек фильма (без фоновой пыли), с мягким свечением
const Dots: React.FC<{ spec: ShapeSpec; r?: number; glow?: number }> = ({ spec, r = 3.3, glow = 0.18 }) => {
  const pts = shapePoints(spec).filter((p) => p.a > 0.5);
  return (
    <g>
      {pts.map((p, i) => (
        <circle key={`h${i}`} cx={p.x} cy={p.y} r={r * p.r * 2.6} fill={p.c} opacity={glow} />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={r * p.r} fill={p.c} opacity={Math.min(1, p.a)} />
      ))}
    </g>
  );
};

const Stars: React.FC<{ n: number; seed: number; h?: number }> = ({ n, seed, h = 720 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={(i * 263 + seed * 97) % 1280} cy={(i * 151 + seed * 31) % h} r={1 + (i % 3) * 0.8} fill="#c9d4ea" opacity={0.25 + (i % 4) * 0.12} />
    ))}
  </g>
);

// ── №1 Справедливость: весы из точек, сила против права ──
const Justice: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #2a2f6e 0%, #151a42 55%, #0b0e26 100%)">
    <Stars n={60} seed={2} />
    <Glow x={900} y={380} r={260} color="#ffd23f" opacity={0.18} />
    <Dots spec={{ kind: "scales", x: 900, y: 470, s: 0.66, tilt: -12, left: "#ff5466", right: "#5cc8ff" }} r={3.6} />
    <Host x={250} y={790} scale={0.92} pose="pointUp" mood="wonder" mouth={0.5} round={0.6} face={{ lookX: 0.8, lookY: -0.5 }} />
    <Headline x={44} y={118} lines={["ЧТО ТАКОЕ", "СПРАВЕДЛИВОСТЬ?"]} size={88} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#070a1c" strokeWidth={14} lineGap={1.05} />
    <Pill x={640} y={668} text="сила или право" size={34} bg="#ff5466" color="#fff" />
    <BookCover x={1150} y={590} scale={0.36} rotate={8} title={TITLE} subtitle={SUB} color="#2b2f6b" accent="#ffd23f" />
    <ChannelBadge x={1000} y={46} scale={0.9} dark />
  </Frame>
);

// ── №2 Пещера: тени на стене, огонь и свет у выхода ──
const Cave: React.FC = () => (
  <Frame bg="radial-gradient(circle at 85% 8%, #4a3a1a 0%, #1a1426 30%, #06070f 75%)">
    <Glow x={1120} y={40} r={190} color="#fff3c4" opacity={0.55} />
    <Dots spec={{ kind: "cave", x: 520, y: 450, s: 0.6, lit: 1, exit: 1 }} r={3.1} glow={0.22} />
    <Glow x={845} y={530} r={120} color="#ff9d3b" opacity={0.3} />
    <Host x={1140} y={860} scale={1.0} pose="shock" mood="shock" mouth={0.7} round={0.9} face={{ lookX: -0.9, lookY: -0.2, eye: 1.32 }} />
    <Headline x={40} y={130} lines={["ВЫ ТОЖЕ", "В ПЕЩЕРЕ?"]} size={104} font={FONTS.display} fill="#fff" colors={[undefined, "#ffb13b"]} stroke="#05060d" strokeWidth={16} lineGap={1.05} />
    <Vignette strength={0.45} />
    <Pill x={44} y={668} text="Платон · Государство" size={30} bg="#ffd23f" />
    <ChannelBadge x={980} y={668} scale={0.8} dark />
  </Frame>
);

// ── №3 Идеальный город: полис из цветных точек, банан-профессор ──
const City: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #0f2a4a 0%, #163b52 60%, #1d4a5a 100%)">
    <Stars n={50} seed={5} h={380} />
    <Glow x={760} y={330} r={300} color="#4fe3e0" opacity={0.12} />
    <Dots spec={{ kind: "city", x: 790, y: 420, s: 0.78 }} r={3.4} />
    <Host x={190} y={800} scale={0.9} pose="point" mood="happy" mouth={0.4} glasses bowtie face={{ lookX: 0.6 }} />
    <Headline x={640} y={110} lines={["ИДЕАЛЬНЫЙ ГОРОД"]} size={84} font={FONTS.heavy} weight={900} fill="#fff" anchor="middle" stroke="#06162a" strokeWidth={14} />
    <Headline x={790} y={690} lines={["ЦЕНА?"]} size={92} font={FONTS.display} fill={BRAND.yellow} anchor="middle" stroke="#06162a" strokeWidth={14} />
    <BookCover x={1165} y={560} scale={0.34} rotate={6} title={TITLE} subtitle={SUB} color="#1f5560" accent="#ffd23f" />
    <ChannelBadge x={1000} y={170} scale={0.85} dark />
  </Frame>
);

// ── №4 Философ у власти: солнце блага за спиной банана в очках ──
const Philosopher: React.FC = () => (
  <Frame bg="radial-gradient(circle at 30% 50%, #5a3a10 0%, #2a1a3a 50%, #120c22 100%)">
    <Glow x={380} y={360} r={330} color="#ffd23f" opacity={0.25} />
    <Dots spec={{ kind: "sun", x: 380, y: 340, s: 0.95 }} r={3.6} glow={0.25} />
    <Host x={380} y={850} scale={1.05} pose="present" mood="calm" mouth={0.3} glasses bowtie />
    <Headline x={1240} y={170} lines={["ПРАВИТЬ", "ДОЛЖЕН", "ФИЛОСОФ?"]} size={96} font={FONTS.heavy} weight={900} anchor="end" fill="#fff" colors={[undefined, undefined, BRAND.yellow]} stroke="#120c22" strokeWidth={14} lineGap={1.04} />
    <Pill x={700} y={520} text="спор длиной в 2000 лет" size={32} bg="#a98bff" color="#fff" />
    <BookCover x={1190} y={610} scale={0.27} rotate={-6} title={TITLE} subtitle={SUB} color="#3b2a5a" accent="#ffd23f" />
    <ChannelBadge x={760} y={668} scale={0.8} dark />
  </Frame>
);

// ── №5 Порядок или свобода: строгая сетка против свободных точек ──
const Grid: React.FC = () => (
  <g>
    {Array.from({ length: 13 * 15 }).map((_, i) => {
      const cx = 40 + (i % 13) * 42;
      const cy = 230 + Math.floor(i / 13) * 32;
      return <circle key={i} cx={cx} cy={cy} r={5} fill={i % 13 < 4 ? "#ffd23f" : i % 13 < 8 ? "#c9d4ea" : "#e0915a"} opacity={0.9} />;
    })}
  </g>
);
const Freedom: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #1b1a45 0%, #1b1a45 50%, #2a1440 50%, #3d1a35 100%)">
    <Grid />
    <Dots spec={{ kind: "scatter", x: 980, y: 470, s: 1, w: 560, h: 480 }} r={4.4} glow={0.2} />
    <rect x={636} y={0} width={8} height={720} fill="#fff" opacity={0.85} />
    <Host x={640} y={830} scale={0.95} pose="shrug" mood="confused" mouth={0.35} />
    <Headline x={320} y={140} lines={["ПОРЯДОК"]} size={92} font={FONTS.display} anchor="middle" fill="#ffd23f" stroke="#0b0b22" strokeWidth={14} />
    <Headline x={960} y={140} lines={["СВОБОДА?"]} size={92} font={FONTS.display} anchor="middle" fill="#fff" stroke="#0b0b22" strokeWidth={14} />
    <Pill x={640} y={208} text="или" size={34} anchor="middle" bg="#fff" />
    <Pill x={44} y={668} text="Платон · Государство" size={28} bg="#ffd23f" />
    <ChannelBadge x={1000} y={668} scale={0.8} dark />
  </Frame>
);

export const REPUBLIC_THUMBNAILS: BookThumbnails = {
  ...(meta as unknown as Omit<BookThumbnails, "components">),
  components: { 1: Justice, 2: Cave, 3: City, 4: Philosopher, 5: Freedom },
};
