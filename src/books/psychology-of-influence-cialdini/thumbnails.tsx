// Пять YouTube-обложек фильма BM-021 «Психология влияния» (канал BanaMind).
// Пять разных постановок: стеклянные фильтры и вопрос «ДА?», семь сигналов вокруг
// банана, толпа точек и одно решение, эксперт или роль, развилка «стоп».
// Только собственный рисунок фильма (src/lesson-influence/visuals): без обложки
// издания, его иллюстраций и чужих изображений.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { FC, FILTERS } from "../../lesson-influence/theme";
import { Badge, FilterIcon, GlassPlate, OL } from "../../lesson-influence/visuals/draw";
import { dotsOf, hash, SH, word } from "../../lesson-influence/visuals/dots";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/psychology-of-influence-cialdini/thumbnails.json";

const Dots: React.FC<{ pts: { x: number; y: number; c: string }[]; r: number }> = ({ pts, r }) => (
  <g>
    {pts.map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.c} stroke="#1b1f3d" strokeOpacity={0.35} strokeWidth={1.2} />
    ))}
  </g>
);

// ── №1 «ПОЧЕМУ ВЫ СКАЗАЛИ ДА?» — стёкла фильтров веером, точечное «ДА?» ──
const WhyYes: React.FC = () => {
  const da = dotsOf("th1-da", word("ДА?", 150, 26), 900, 370, FILTERS.map((f) => f.color), 11, 330);
  return (
    <Frame bg="radial-gradient(circle at 70% 50%, #4f5bb8 0%, #2a2f6e 60%, #181b44 100%)">
      <Rays x={900} y={380} color="#b9c4ff" count={18} opacity={0.07} />
      <Glow x={900} y={380} r={230} color="#7f8cff" opacity={0.45} />
      {FILTERS.map((f, i) => {
        const ang = ((i - 3) / 3) * 0.9;
        return <GlassPlate key={f.id} id={f.id} x={900 + Math.sin(ang) * 330} y={590 - Math.cos(ang) * 60} w={92} h={130} label={false} tilt={ang * 8} />;
      })}
      <Dots pts={da} r={5.4} />
      <Host x={250} y={860} scale={0.95} pose="ask" mood="wonder" face={{ lookX: 0.8, lookY: -0.3, eye: 1.12 }} />
      <Headline x={40} y={118} lines={["ПОЧЕМУ ВЫ", "СКАЗАЛИ «ДА»?"]} size={92} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#111433" strokeWidth={16} lineGap={1.02} />
      <ChannelBadge x={990} y={672} scale={0.78} dark />
      <Vignette strength={0.45} />
    </Frame>
  );
};

// ── №2 «7 СИГНАЛОВ» — семь ярких значков по кругу вокруг банана ──
const Seven: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #20264f 0%, #3a2f7a 55%, #6a3a7a 100%)">
    <Glow x={640} y={430} r={260} color="#ffd23f" opacity={0.28} />
    {FILTERS.map((f, i) => {
      const [x, y] = [[260, 330], [180, 480], [330, 615], [640, 350], [950, 615], [1100, 480], [1020, 330]][i];
      return (
        <g key={f.id} transform={`translate(${x} ${y})`}>
          <circle r={74} fill={f.color} opacity={0.3} />
          <circle r={60} fill={f.color} stroke="#fff" strokeWidth={6} />
          <FilterIcon id={f.id} x={0} y={0} s={0.72} color="#fff" />
        </g>
      );
    })}
    <Host x={640} y={1010} scale={0.92} pose="count" mood="joy" face={{ eye: 1.1 }} />
    <Headline x={640} y={128} lines={["7 СИГНАЛОВ"]} size={118} font={FONTS.display} fill={BRAND.yellow} stroke="#141633" strokeWidth={18} anchor="middle" />
    <Pill x={640} y={212} text="которые включают ваше «да»" size={34} bg="#ffffff" anchor="middle" />
    <ChannelBadge x={40} y={60} scale={0.72} dark />
    <Vignette strength={0.4} />
  </Frame>
);

// ── №3 «НЕ ВЕРЬТЕ ТОЛПЕ?» — синяя толпа точек идёт в одну сторону, одна жёлтая точка — в свою ──
const Crowd: React.FC = () => {
  const people = Array.from({ length: 21 }).map((_, i) => ({ x: 120 + (i % 7) * 105 + (Math.floor(i / 7) % 2) * 50, y: 470 + Math.floor(i / 7) * 95, s: 0.95 + hash(i) * 0.15 }));
  return (
    <Frame bg="linear-gradient(180deg, #1f3a7a 0%, #3d6fc8 100%)">
      {people.map((p, i) => {
        const pts = dotsOf("th3-person", SH.person(66), p.x, p.y, ["#8fd0ff", "#cfe2ff", "#5aa0ff"], 9, 90);
        return <Dots key={i} pts={pts} r={4.1 * p.s} />;
      })}
      {/* стрелки толпы */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${180 + i * 30} ${380 + i * 100} L ${800} ${380 + i * 100}`} stroke="#cfe2ff" strokeWidth={6} strokeDasharray="10 14" opacity={0.6} />
      ))}
      <Glow x={980} y={470} r={150} color={BRAND.yellow} opacity={0.55} />
      <Dots pts={dotsOf("th3-me", SH.person(130), 980, 470, [BRAND.yellow, "#fff3b0", "#ff9a2e"], 10, 160)} r={5} />
      <path d="M 980 600 L 1000 660 L 1200 600" stroke={BRAND.yellow} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Host x={1190} y={860} scale={0.55} pose="think" mood="think" face={{ lookX: -0.8 }} />
      <Headline x={40} y={130} lines={["НЕ ВЕРЬТЕ", "ТОЛПЕ?"]} size={100} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#0f1d44" strokeWidth={16} lineGap={1.0} />
      <ChannelBadge x={40} y={672} scale={0.78} dark />
      <Vignette strength={0.35} />
    </Frame>
  );
};

// ── №4 «ЭКСПЕРТ ИЛИ РОЛЬ?» — две половины: книга-знание и пустой халат на вешалке ──
const Expert: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #2f2f7a 0%, #2f2f7a 49.6%, #6c3fd6 50.4%, #9a6bff 100%)">
    <Glow x={320} y={360} r={200} color="#7fe0ff" opacity={0.35} />
    <Glow x={960} y={360} r={200} color="#ffd23f" opacity={0.3} />
    {/* знание: раскрытая книга и формулы-точки */}
    <g transform="translate(320 440)">
      <path d="M -190 -20 Q -95 -60 0 -20 L 0 150 Q -95 110 -190 150 Z" fill="#f7f3ea" stroke={OL} strokeWidth={6} />
      <path d="M 190 -20 Q 95 -60 0 -20 L 0 150 Q 95 110 190 150 Z" fill="#f7f3ea" stroke={OL} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} stroke="#8a93b5" strokeWidth={6} strokeLinecap="round">
          <line x1={-160} y1={20 + i * 28} x2={-30} y2={20 + i * 28} />
          <line x1={30} y1={20 + i * 28} x2={160} y2={20 + i * 28} />
        </g>
      ))}
    </g>
    <Pill x={320} y={640} text="знание" size={40} bg="#ffffff" anchor="middle" />
    {/* роль: пустой халат и значок */}
    <g transform="translate(960 470)">
      <path d="M 0 -230 L 0 -200" stroke={OL} strokeWidth={8} />
      <path d="M -70 -200 Q 0 -230 70 -200" stroke={OL} strokeWidth={8} fill="none" />
      <path d="M -110 -190 L 110 -190 L 140 160 L -140 160 Z" fill="#ffffff" stroke={OL} strokeWidth={6} />
      <path d="M -30 -190 L 0 -60 L 30 -190" fill={FC.authority.light} stroke={OL} strokeWidth={5} />
      <Badge x={70} y={-60} s={0.55} />
    </g>
    <Pill x={960} y={690} text="костюм" size={40} bg={BRAND.yellow} anchor="middle" />
    <Host x={640} y={830} scale={0.62} pose="shrug" mood="confused" face={{ smile: -0.1 }} />
    <Headline x={640} y={120} lines={["ЭКСПЕРТ ИЛИ РОЛЬ?"]} size={92} font={FONTS.display} fill="#ffffff" stroke="#141633" strokeWidth={16} anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.72} dark />
  </Frame>
);

// ── №5 «СТОП. ЭТО ВАШ ВЫБОР?» — развилка, крупная ладонь «стоп», сомневающийся банан ──
const Stop: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #2a4f7a 0%, #6fa4c8 65%, #e0b48a 100%)">
    {/* развилка двух дорог */}
    <path d="M 560 720 L 720 720 L 560 360 L 520 360 Z" fill="#f2e2c4" />
    <path d="M 560 720 L 720 720 L 940 360 L 880 360 Z" fill="#f2e2c4" opacity={0.85} />
    <Pill x={500} y={300} text="«да»" size={42} bg="#d2f5d7" anchor="middle" />
    <Pill x={890} y={300} text="«нет»" size={42} bg="#ffd2e1" anchor="middle" />
    {/* ладонь «стоп» */}
    <g transform="translate(1080 560) rotate(8)" filter="url(#softShadow)">
      <rect x={-90} y={-60} width={180} height={190} rx={60} fill="#f2d5bb" stroke={OL} strokeWidth={6} />
      {[-66, -22, 22, 66].map((x, i) => (
        <rect key={i} x={x - 20} y={-170 + Math.abs(i - 1.5) * 18} width={40} height={140} rx={20} fill="#f2d5bb" stroke={OL} strokeWidth={6} />
      ))}
      <rect x={-150} y={0} width={70} height={40} rx={20} fill="#f2d5bb" stroke={OL} strokeWidth={6} transform="rotate(-30 -110 20)" />
    </g>
    <Host x={250} y={880} scale={1.0} pose="think" mood="confused" face={{ lookX: 0.7, lookY: -0.2, brow: 0.5 }} />
    <Headline x={640} y={118} lines={["СТОП. ЭТО ВАШ ВЫБОР?"]} size={84} font={FONTS.display} fill="#ffffff" stroke="#14233f" strokeWidth={15} anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.78} dark />
    <Vignette strength={0.3} />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/psychology-of-influence-cialdini/thumbnails.json.
export const INFLUENCE_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: WhyYes, 2: Seven, 3: Crowd, 4: Expert, 5: Stop },
};

