// Пять YouTube-обложек фильма BM-013 «Sapiens» (канал BanaMind).
// Каждая — отдельная концепция из готового сценария: своя композиция, эмоция
// банана, шрифт и палитра. Книга нарисована условно (не обложка издательства);
// жители острова — условные фигурки учебной модели; религиозных символов нет.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { Coin, Factory, Hut, Island, Palm, Person, Wheat } from "../../lesson-sapiens/visuals/island";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/harari-sapiens/thumbnails.json";

const TITLE = ["SAPIENS"];
const SUB = "Ю. Н. Харари";

// толпа точек-людей и жёлтая сеть
const DotCrowd: React.FC<{ x: number; y: number; w: number; h: number; n: number; seed?: number }> = ({ x, y, w, h, n, seed = 0 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const hx = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
      const hy = Math.sin(i * 39.3468 + seed * 11.135) * 24634.6345;
      const px = x + (hx - Math.floor(hx)) * w;
      const py = y + (hy - Math.floor(hy)) * h;
      return <circle key={i} cx={px} cy={py} r={7 + (i % 3) * 2} fill={["#ff9a7a", "#7cc6e8", "#8fd39b", "#c9a6f2", "#ffd166", "#ffffff"][i % 6]} opacity={0.9} />;
    })}
  </g>
);
const Web: React.FC<{ pts: [number, number][]; color?: string; width?: number }> = ({ pts, color = BRAND.yellow, width = 4 }) => (
  <g stroke={color} strokeWidth={width} opacity={0.85}>
    {pts.flatMap((a, i) => pts.slice(i + 1).filter((_, j) => (i + j) % 3 === 0).map((b, j) => <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />))}
  </g>
);

// ── №1 Классическое: банан + книга на фоне учебного острова ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #8fd8ee 0%, #c9eef8 55%, #4fc0d6 56%, #2f9fbf 100%)">
    <Glow x={1100} y={110} r={170} color="#fff3b0" opacity={0.9} />
    <circle cx={1100} cy={110} r={60} fill="#ffd23f" />
    <g transform="translate(0 40)">
      <Island x={980} y={560} w={560} t={0.4} />
      <Hut x={960} y={540} s={0.8} />
      <Person x={1060} y={545} s={0.7} i={1} t={0} />
      <Person x={1110} y={548} s={0.7} i={3} t={0} look={-1} />
    </g>
    <Host x={250} y={800} scale={0.95} pose="present" mood="happy" mouth={0.35} />
    <BookCover x={520} y={470} scale={0.66} rotate={-7} title={TITLE} subtitle={SUB} color="#1f2a44" accent="#ffd23f" />
    <Headline x={680} y={200} lines={["SAPIENS"]} size={128} font={FONTS.display} fill="#fff" stroke="#0f2a44" strokeWidth={18} />
    <Pill x={690} y={290} text="Юваль Ной Харари" size={36} bg="#ffffff" />
    <Pill x={690} y={370} text="простыми словами" size={40} bg={BRAND.yellow} />
    <ChannelBadge x={980} y={660} scale={0.9} dark />
  </Frame>
);

// ── №2 Интрига: тысяча незнакомцев и сеть договорённостей ──
const Intrigue: React.FC = () => {
  const pts: [number, number][] = Array.from({ length: 16 }).map((_, i) => [520 + ((i * 211) % 700), 360 + ((i * 137) % 320)]);
  return (
    <Frame bg="radial-gradient(circle at 65% 60%, #2b3f73 0%, #182447 55%, #0b1128 100%)">
      <DotCrowd x={470} y={330} w={790} h={380} n={260} seed={2} />
      <Web pts={pts} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={12} fill={BRAND.yellow} stroke="#0b1128" strokeWidth={3} />
      ))}
      <Glow x={240} y={560} r={220} color="#ffd23f" opacity={0.25} />
      <Host x={250} y={860} scale={1.05} pose="open" mood="wonder" mouth={0.6} round={0.8} face={{ lookX: 0.9, lookY: -0.2, eye: 1.3, brow: 0.85 }} />
      <Headline x={430} y={125} lines={["КАК МЫ", "ДОГОВОРИЛИСЬ?"]} size={84} font={FONTS.heavy} weight={900} fill="#fff" colors={["#ffffff", BRAND.yellow]} stroke="#060b1c" strokeWidth={16} lineGap={1.02} />
      <Pill x={470} y={330} text="тысяча незнакомцев" size={34} bg="#ffffff" />
      <Vignette strength={0.45} />
      <ChannelBadge x={40} y={60} scale={0.85} dark />
    </Frame>
  );
};

// ── №3 Профессор: пшеничное поле и вопрос главы ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #ffe8a8 0%, #ffd27a 60%, #e8b63d 100%)">
    <Rays x={1120} y={120} color="#fff7d0" count={18} opacity={0.35} />
    <circle cx={1120} cy={120} r={70} fill="#fff1b8" />
    {Array.from({ length: 34 }).map((_, i) => (
      <g key={i} transform={`scale(1.6) translate(${i * 24 - 10} ${0})`}>
        <Wheat x={0} y={460} h={120 + (i % 4) * 14} t={i * 0.2} seed={i} />
      </g>
    ))}
    <g transform="translate(700 470) rotate(-18) scale(3.2)">
      <Wheat x={0} y={60} h={120} t={0} />
    </g>
    <Host x={980} y={830} scale={1.0} pose="point" mood="wonder" mouth={0.4} glasses bowtie face={{ lookX: -0.8, brow: 0.6 }} flip />
    <Headline x={40} y={150} lines={["КТО КОГО", "ОДОМАШНИЛ?"]} size={104} font={FONTS.display} fill="#ffffff" colors={["#ffffff", "#ffe066"]} stroke="#4a2a08" strokeWidth={18} lineGap={1.05} />
    <Pill x={50} y={640} text="Sapiens простым языком" size={36} bg="#4a2a08" color="#fff" />
    <ChannelBadge x={980} y={60} scale={0.85} dark />
  </Frame>
);

// ── №4 Противопоставление: остров собирателей против индустриального города ──
const Contrast: React.FC = () => (
  <Frame bg="#222">
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#9fe3f2" />
    <rect x={0} y={460} width={TW / 2} height={260} fill="#4fc0d6" />
    <Island x={300} y={520} w={520} t={0.2} />
    <Palm x={140} y={505} s={1} t={0.3} seed={1} />
    <Person x={300} y={500} s={0.9} i={1} t={0} arm={0.8} />
    <Person x={390} y={505} s={0.9} i={4} t={0} />
    <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#5b6475" />
    <rect x={TW / 2} y={520} width={TW / 2} height={200} fill="#3d4453" />
    {[700, 800, 920, 1040, 1160].map((x, i) => (
      <rect key={x} x={x} y={260 - (i % 3) * 60} width={90} height={300 + (i % 3) * 60} fill={["#7a8396", "#6b7487", "#8a93a6"][i % 3]} />
    ))}
    <Factory x={1000} y={560} s={1.1} t={0.6} />
    <line x1={TW / 2} y1={0} x2={TW / 2} y2={TH} stroke="#ffd23f" strokeWidth={10} />
    <Host x={640} y={840} scale={0.92} pose="think" mood="think" face={{ lookX: 0.2, lookY: -0.8 }} />
    <Headline x={40} y={130} lines={["ПРОГРЕСС"]} size={104} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#14202f" strokeWidth={14} />
    <Headline x={1244} y={130} lines={["СЧАСТЬЕ?"]} size={104} font={FONTS.condensed} weight={700} fill={BRAND.yellow} stroke="#14202f" strokeWidth={14} anchor="end" />
    <Pill x={640} y={220} text="или" size={48} anchor="middle" bg="#ffffff" font={FONTS.condensed} weight={700} />
    <ChannelBadge x={40} y={680} scale={0.8} dark />
  </Frame>
);

// ── №5 Самый сильный: невидимая сеть доверия ──
const Strong: React.FC = () => {
  const ring: [number, number][] = Array.from({ length: 14 }).map((_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return [520 + Math.cos(a) * 330, 430 + Math.sin(a) * 220];
  });
  return (
    <Frame bg="radial-gradient(circle at 42% 60%, #ffcf5a 0%, #e0761f 40%, #5a1f0b 100%)">
      <Rays x={520} y={430} color="#fff3c4" count={22} opacity={0.22} />
      <g stroke="#fff6d6" strokeWidth={5} opacity={0.9}>
        {ring.map(([x, y], i) => (
          <line key={i} x1={520} y1={430} x2={x} y2={y} strokeDasharray="14 10" />
        ))}
      </g>
      {ring.map(([x, y], i) => (
        <Person key={i} x={x} y={y + 40} s={0.95} i={i * 2} t={0} look={x < 520 ? 1 : -1} />
      ))}
      <Glow x={520} y={430} r={170} color="#fff6c4" opacity={0.85} />
      <Coin x={520} y={430} r={110} label="" />
      <Host x={1070} y={880} scale={1.18} pose="shock" mood="shock" mouth={0.95} round={1} face={{ lookX: -0.9, lookY: -0.1, eye: 1.36, brow: 1 }} />
      <Headline x={36} y={118} lines={["НА ЧЁМ", "ВСЁ ДЕРЖИТСЯ?"]} size={100} font={FONTS.display} fill="#ffffff" colors={["#ffffff", "#ffe066"]} stroke="#3a1205" strokeWidth={18} lineGap={1.02} />
      <Pill x={44} y={668} text="Sapiens · Харари" size={36} bg="#ffffff" />
      <ChannelBadge x={980} y={60} scale={0.8} dark />
    </Frame>
  );
};

// Тексты, концепции и рекомендация — в books/harari-sapiens/thumbnails.json
// (их же читает проверка орфографии и отчёт); здесь только рисунки.
export const SAPIENS_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strong },
};
