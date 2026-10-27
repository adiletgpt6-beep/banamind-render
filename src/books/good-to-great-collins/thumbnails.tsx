// Пять YouTube-обложек фильма BM-037 «Двигатель прорыва» (канал BanaMind).
// Пять разных постановок и эмоций: застрявшая красивая передача, команда у развилки,
// пересечение трёх кругов из точек, большой маховик и цепь толчков, разорванная петля
// перезапусков. Только собственная графика фильма (src/lesson-collins/visuals):
// без обложки издания, имени автора и названия книги в витрине.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { gearPath } from "../../lesson-collins/components/Background";
import { C } from "../../lesson-collins/theme";
import { dotsOf, SH } from "../../lesson-collins/visuals/dots";
import { Flywheel } from "../../lesson-collins/visuals/machine";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/good-to-great-collins/thumbnails.json";

const OL = "#1f2240";
const Dots: React.FC<{ pts: { x: number; y: number; c: string }[]; r: number }> = ({ pts, r }) => (
  <g>
    {pts.map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.c} stroke={OL} strokeOpacity={0.35} strokeWidth={1.2} />
    ))}
  </g>
);

// ── №1 «ХОРОШЕГО МАЛО»: красивая золотая передача, но тормоз и цепь ──
const GoodIsNotEnough: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #3a2a12 0%, #8a5a14 55%, #f0b030 100%)">
    <Rays x={880} y={400} color="#ffe2a0" count={18} opacity={0.1} />
    <Glow x={880} y={420} r={260} color="#ffd27a" opacity={0.5} />
    <g transform="translate(880 420)">
      <path d={gearPath(230, 16, 0.14)} fill="#f2b636" stroke={OL} strokeWidth={10} strokeLinejoin="round" />
      <circle r={140} fill="#ffe08a" stroke={OL} strokeWidth={8} />
      <circle r={40} fill={OL} />
      {/* тормозная колодка и цепь: передача красивая, но не крутится */}
      <path d="M -260 -40 L -200 -60 L -200 60 L -260 40 Z" fill={C.red} stroke={OL} strokeWidth={8} />
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={-130 + i * 44} cy={-10 + (i % 2) * 18} rx={26} ry={16} fill="none" stroke="#5d6880" strokeWidth={10} transform={`rotate(${i % 2 ? 25 : -25} ${-130 + i * 44} ${-10 + (i % 2) * 18})`} />
      ))}
    </g>
    <Host x={300} y={900} scale={1.0} pose="think" mood="think" face={{ lookX: 0.7, lookY: -0.2 }} />
    <Headline x={640} y={120} lines={["ХОРОШЕГО МАЛО"]} size={104} font={FONTS.display} fill="#ffffff" stroke="#2a1a05" strokeWidth={18} anchor="middle" />
    <Pill x={880} y={700} text="почему успех тормозит прорыв" size={34} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={30} y={672} scale={0.72} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №2 «СНАЧАЛА ЛЮДИ»: команда в автобусе у развилки двух маршрутов ──
const PeopleFirst: React.FC = () => {
  const heads = [C.teal, C.coral, C.indigo, C.gold, C.green, C.coralDeep];
  return (
    <Frame bg="linear-gradient(180deg, #e9fbf7 0%, #9fe3d7 70%, #5cc3b2 100%)">
      <path d="M -40 600 L 640 600 Q 840 600 1320 400" fill="none" stroke="#ffffff" strokeWidth={70} strokeLinecap="round" opacity={0.9} />
      <path d="M 640 600 Q 840 600 1320 720" fill="none" stroke="#ffffff" strokeWidth={70} strokeLinecap="round" opacity={0.9} />
      <path d="M 640 600 Q 840 600 1320 400" fill="none" stroke={C.coral} strokeWidth={10} strokeDasharray="30 20" />
      <path d="M 640 600 Q 840 600 1320 720" fill="none" stroke={C.tealDeep} strokeWidth={10} strokeDasharray="30 20" />
      <g transform="translate(560 470)">
        <rect x={-300} y={-150} width={600} height={230} rx={44} fill={BRAND.yellow} stroke={OL} strokeWidth={9} />
        {heads.map((c, i) => (
          <g key={i}>
            <rect x={-268 + i * 90} y={-122} width={74} height={92} rx={14} fill="#cfefff" stroke={OL} strokeWidth={5} />
            <circle cx={-231 + i * 90} cy={-64} r={26} fill={c} stroke={OL} strokeWidth={4} />
          </g>
        ))}
        <circle cx={-190} cy={90} r={50} fill={OL} />
        <circle cx={190} cy={90} r={50} fill={OL} />
        <circle cx={-190} cy={90} r={20} fill="#d9dfea" />
        <circle cx={190} cy={90} r={20} fill="#d9dfea" />
      </g>
      <Host x={1080} y={760} scale={0.8} pose="pointLeft" mood="happy" face={{ lookX: -0.7 }} />
      <Headline x={640} y={128} lines={["СНАЧАЛА ЛЮДИ"]} size={110} font={FONTS.display} fill={OL} stroke="#ffffff" strokeWidth={18} anchor="middle" />
      <Pill x={560} y={210} text="потом — куда ехать" size={36} bg={OL} color="#ffffff" anchor="middle" />
      <ChannelBadge x={30} y={672} scale={0.72} />
    </Frame>
  );
};

// ── №3 «ТРИ КРУГА»: объёмное пересечение из цветных точек ──
const ThreeCircles: React.FC = () => {
  const R = 170;
  const cx = 820;
  const cy = 420;
  const circles = [
    { dx: -110, dy: 70, c: [C.teal, "#7fe0d4", "#ffffff"] },
    { dx: 110, dy: 70, c: [C.coral, "#ffb39e", "#ffffff"] },
    { dx: 0, dy: -120, c: [C.yellow, "#fff0a0", "#ffffff"] },
  ];
  return (
    <Frame bg="radial-gradient(circle at 65% 55%, #4b55c8 0%, #2a2f7a 55%, #151842 100%)">
      <Glow x={cx} y={cy} r={200} color="#ffffff" opacity={0.25} />
      {circles.map((k, i) => (
        <g key={i}>
          <circle cx={cx + k.dx} cy={cy + k.dy} r={R} fill={k.c[0]} opacity={0.22} />
          <Dots pts={dotsOf(`th3-${i}`, SH.ring(R - 26, R), cx + k.dx, cy + k.dy, k.c, 11, R + 10)} r={4.6} />
        </g>
      ))}
      <circle cx={cx} cy={cy + 10} r={46} fill="#ffffff" stroke={OL} strokeWidth={6} />
      <circle cx={cx} cy={cy + 10} r={18} fill={C.coral} />
      <Host x={250} y={880} scale={0.95} pose="point" mood="wonder" face={{ lookX: 0.8 }} />
      <Headline x={640} y={124} lines={["ТРИ КРУГА"]} size={118} font={FONTS.display} fill="#ffffff" colors={["#ffffff"]} stroke="#0f1236" strokeWidth={18} anchor="middle" />
      <Pill x={830} y={690} text="где они пересекаются?" size={36} bg={BRAND.yellow} anchor="middle" />
      <ChannelBadge x={980} y={60} scale={0.72} dark />
      <Vignette strength={0.3} />
    </Frame>
  );
};

// ── №4 «НЕ ОДИН РЫВОК»: большой маховик и цепь маленьких согласованных толчков ──
const NotOnePush: React.FC = () => (
  <Frame bg="linear-gradient(135deg, #fff1e8 0%, #ffd2c0 55%, #ff8f70 100%)">
    <g transform="translate(0 0)">
      <Flywheel x={1000} y={330} r={220} angle={18} trail={0.95} />
    </g>
    {Array.from({ length: 6 }, (_, i) => {
      const x = 420 + i * 70;
      const s = 0.55 + i * 0.07;
      return (
        <g key={i} transform={`translate(${x} 110) scale(${s})`} opacity={0.55 + i * 0.09}>
          <rect x={-70} y={-14} width={110} height={28} rx={14} fill={C.tealDeep} />
          <path d="M 40 -34 L 90 0 L 40 34 Z" fill={C.tealDeep} stroke={OL} strokeWidth={4} />
        </g>
      );
    })}
    <Host x={250} y={880} scale={0.95} pose="present" mood="joy" face={{ lookX: 0.6, lookY: -0.2 }} />
    <Headline x={470} y={540} lines={["НЕ ОДИН", "РЫВОК"]} size={118} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#3b1408" strokeWidth={18} anchor="start" lineGap={0.98} />
    <ChannelBadge x={980} y={672} scale={0.72} dark />
  </Frame>
);

// ── №5 «СНОВА С НУЛЯ?»: разорванная петля перезапусков, крупный план ──
const RestartAgain: React.FC = () => {
  const loop = Array.from({ length: 40 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 40) * Math.PI * 1.65;
    return { x: 960 + Math.cos(a) * 190, y: 250 + Math.sin(a) * 190, c: i % 2 ? C.coral : "#ffb39e" };
  });
  const trail = Array.from({ length: 18 }, (_, i) => ({ x: 770 + i * 26, y: 460 - Math.sin(i / 4) * 20, c: [C.teal, C.yellow, "#ffffff"][i % 3] }));
  return (
    <Frame bg="linear-gradient(160deg, #2b1830 0%, #6b2a3a 55%, #c2414a 100%)">
      <Glow x={960} y={250} r={200} color="#ff7a59" opacity={0.35} />
      <Dots pts={loop} r={13} />
      {/* разрыв петли и стрелка назад */}
      <path d="M 1110 180 l 40 -30 M 1110 180 l 10 46" stroke="#ffffff" strokeWidth={14} strokeLinecap="round" />
      <Dots pts={trail} r={10} />
      <Host x={380} y={1080} scale={1.55} pose="shock" mood="confused" face={{ lookX: 0.6, lookY: -0.3 }} />
      <Headline x={1250} y={590} lines={["СНОВА", "С НУЛЯ?"]} size={118} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#1c0b18" strokeWidth={18} anchor="end" lineGap={0.98} />
      <ChannelBadge x={30} y={60} scale={0.72} dark />
      <Vignette strength={0.4} />
    </Frame>
  );
};

export const COLLINS_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: GoodIsNotEnough, 2: PeopleFirst, 3: ThreeCircles, 4: NotOnePush, 5: RestartAgain },
};
