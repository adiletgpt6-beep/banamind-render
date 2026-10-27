// Пять YouTube-обложек BM-017 «И тогда никого не осталось» (канал BanaMind).
// Оригинальная графика: фигурки-жетоны, остров-макет, доска подозрений, весы,
// пустой стол. Без насилия, без названия острова, без текста считалки,
// без развязки (обложка №4 — только вопрос «КТО СУДИТ?»).
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/and-then-there-were-none-christie/thumbnails.json";
import { Board, Card, DinnerTable, Figurine, Gavel, Island, Lamp, Magnifier, PAL, ROLES, Scales, Thread, Waves } from "./draw";

const RED = PAL.thread;

const Stars: React.FC<{ n: number; seed: number; h?: number }> = ({ n, seed, h = 300 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={(i * 263 + seed * 97) % TW} cy={(i * 151 + seed * 31) % h} r={1 + (i % 3)} fill="#fff" opacity={0.25 + (i % 4) * 0.12} />
    ))}
  </g>
);

// ── №1 Интрига: «КТО ИЗ НИХ?» — десять фигурок с вопросами ──
const Who: React.FC = () => (
  <Frame bg={`radial-gradient(circle at 50% 70%, #24365a 0%, ${PAL.night} 60%, #060b14 100%)`}>
    <Stars n={50} seed={5} h={260} />
    <Glow x={640} y={640} r={420} color={PAL.window} opacity={0.18} />
    <path d={`M 0 630 L ${TW} 630 L ${TW} ${TH} L 0 ${TH} Z`} fill="#2a1f1a" />
    <path d={`M 0 630 L ${TW} 630`} stroke="#000" strokeWidth={4} opacity={0.5} />
    {ROLES.map((r, i) => (
      <Figurine key={r} x={110 + i * 92} y={640 - (i % 2) * 12} s={1.22} fill={i === 4 ? "#fff7da" : PAL.porcelain} q glow={i === 4} />
    ))}
    <Host x={1120} y={800} scale={0.82} pose="think" mood="think" glasses face={{ lookX: -0.9, lookY: 0.2, brow: 0.5, tilt: -0.35 }} />
    <Magnifier x={990} y={470} s={1.1} rot={-30} />
    <Headline x={60} y={170} lines={["КТО", "ИЗ НИХ?"]} size={150} font={FONTS.display} colors={["#fff", BRAND.yellow]} stroke="#060b14" strokeWidth={20} lineGap={0.98} />
    <Pill x={66} y={395} text="Агата Кристи" size={34} bg="#fff" />
    <ChannelBadge x={980} y={70} scale={0.8} dark />
    <Vignette strength={0.5} />
  </Frame>
);

// ── №2 Классическое: «ОСТРОВ БЕЗ ВЫХОДА» — карта острова в шторм ──
const IslandCover: React.FC = () => (
  <Frame bg={`linear-gradient(180deg, #121c30 0%, ${PAL.storm} 45%, ${PAL.sea} 100%)`}>
    <g opacity={0.5} fill="#0a1222">
      <ellipse cx={300} cy={80} rx={420} ry={90} />
      <ellipse cx={980} cy={60} rx={480} ry={100} />
    </g>
    <path d="M 860 0 L 820 120 L 860 120 L 800 260" stroke="#e8f1ff" strokeWidth={6} fill="none" opacity={0.8} />
    <Waves y={470} w={TW} opacity={0.35} rows={5} />
    <Island x={860} y={540} s={1.05} lit={[0, 0, 0, 0, 0, 0, 0, 1, 0, 0]} />
    <Glow x={890} y={420} r={70} color={PAL.window} opacity={0.6} />
    <Host x={210} y={800} scale={0.78} pose="point" mood="serious" face={{ lookX: 0.8 }} />
    <Headline x={40} y={150} lines={["ОСТРОВ", "БЕЗ ВЫХОДА"]} size={112} font={FONTS.display} colors={["#fff", BRAND.yellow]} stroke="#0a1222" strokeWidth={18} lineGap={1.0} />
    <Pill x={46} y={340} text="И тогда никого не осталось" size={30} bg="#fff" />
    <ChannelBadge x={980} y={680} scale={0.8} dark />
    <Vignette strength={0.45} />
  </Frame>
);

// ── №3 Профессор: «ВСЕ ПОДОЗРЕВАЕМЫЕ» — доска с нитями ──
const POS: [number, number][] = [
  [90, 110], [260, 90], [430, 120], [600, 90], [90, 330], [270, 350], [440, 320], [610, 340], [180, 220], [520, 220],
];
const LINKS: [number, number][] = [[0, 5], [1, 7], [2, 4], [3, 8], [9, 4], [6, 0], [1, 9], [8, 3], [5, 2]];
const Suspects: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #2b2f3d 0%, #1b1f2b 100%)">
    <Glow x={420} y={360} r={360} color="#ffe2a8" opacity={0.18} />
    <Board x={70} y={250} w={700} h={430}>
      {LINKS.map(([a, b], i) => (
        <Thread key={i} a={[POS[a][0] + 0, POS[a][1] - 50]} b={[POS[b][0], POS[b][1] - 50]} dashed={i % 3 === 0} />
      ))}
      {ROLES.map((r, i) => (
        <Card key={r} x={POS[i][0]} y={POS[i][1]} role={r} w={104} rot={((i * 37) % 11) - 5} />
      ))}
    </Board>
    <Host x={1040} y={850} scale={0.95} pose="present" mood="lookBoard" glasses bowtie face={{ lookX: -0.9 }} mouth={0.3} flip />
    <Headline x={60} y={120} lines={["ВСЕ", "ПОДОЗРЕВАЕМЫЕ"]} sizes={[86, 86]} size={86} font={FONTS.display} colors={[BRAND.yellow, "#fff"]} stroke="#11141c" strokeWidth={16} lineGap={0.98} />
    <Pill x={880} y={250} text="Разбор детектива" size={32} bg={RED} color="#fff" />
    <ChannelBadge x={980} y={70} scale={0.8} dark />
    <Vignette strength={0.4} />
  </Frame>
);

// ── №4 Противопоставление: «КТО СУДИТ?» — весы в тёплом свете / тень-молоток в холодном ──
const WhoJudges: React.FC = () => (
  <Frame bg="#101521">
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#3a2a14" />
    <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#0f1d33" />
    <Glow x={300} y={380} r={300} color="#ffcf6a" opacity={0.45} />
    <Glow x={980} y={380} r={300} color={PAL.cold} opacity={0.3} />
    <Rays x={300} y={300} color="#ffe9a8" count={14} opacity={0.08} />
    <Scales x={300} y={690} s={1.05} tilt={-4} />
    <g opacity={0.9}>
      <Gavel x={980} y={420} s={1.05} rot={-24} color="#1d2c48" />
    </g>
    <path d={`M ${TW / 2} 0 L ${TW / 2} ${TH}`} stroke="#fff" strokeWidth={6} opacity={0.6} />
    <Host x={TW / 2} y={860} scale={0.8} pose="open" mood="serious" face={{ brow: -0.1, tilt: -0.2 }} />
    <Headline x={TW / 2} y={150} lines={["КТО СУДИТ?"]} size={128} font={FONTS.display} anchor="middle" fill="#fff" stroke="#05070c" strokeWidth={20} />
    <Pill x={TW / 2} y={250} text="Агата Кристи" size={32} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={40} y={680} scale={0.75} dark />
    <Vignette strength={0.45} />
  </Frame>
);

// ── №5 Самый сильный: «НИКОГО НЕ ОСТАЛОСЬ» — пустой стол, одна фигурка ──
const Nobody: React.FC = () => (
  <Frame bg="radial-gradient(circle at 50% 42%, #3a3326 0%, #15130f 55%, #050505 100%)">
    <Glow x={640} y={330} r={330} color="#fff2c0" opacity={0.3} />
    <path d="M 520 120 L 760 120 L 1000 720 L 280 720 Z" fill="#fff6d8" opacity={0.08} />
    <Lamp x={640} y={110} s={0.75} />
    <DinnerTable x={640} y={460} s={0.82} chairs={5} />
    <Figurine x={640} y={420} s={0.7} glow />
    <Host x={1150} y={860} scale={0.82} pose="shock" mood="shock" mouth={0.7} round={1} face={{ lookX: -0.9, lookY: 0.3, smile: -0.9 }} />
    <Headline x={640} y={110} lines={["НИКОГО"]} size={128} font={FONTS.display} anchor="middle" fill="#fff" stroke="#050505" strokeWidth={20} />
    <Headline x={640} y={688} lines={["НЕ ОСТАЛОСЬ"]} size={96} font={FONTS.display} anchor="middle" fill={BRAND.yellow} stroke="#050505" strokeWidth={16} />
    <Pill x={40} y={560} text="Агата Кристи" size={30} bg="#fff" />
    <ChannelBadge x={40} y={60} scale={0.75} dark />
    <Vignette strength={0.6} />
  </Frame>
);

export const CHRISTIE_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Who, 2: IslandCover, 3: Suspects, 4: WhoJudges, 5: Nobody },
};

export { TH, TW };
