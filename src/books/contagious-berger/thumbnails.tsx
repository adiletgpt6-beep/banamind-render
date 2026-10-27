// Пять YouTube-обложек фильма BM-038 «Почему мы рассказываем?» (Йона Бергер «Заразительный»).
// Пять разных постановок: сеть из одной искры, шесть камер, яркая цепочка против
// гаснущей искры, слово-волна между силуэтами, полезная идея из рук в руки.
// Только собственный рисунок фильма (src/lesson-berger/visuals): без обложки
// издания, логотипов и чужих изображений; без пугающего образа вируса.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { CELL, CELLS } from "../../lesson-berger/theme";
import { OL } from "../../lesson-berger/visuals/draw";
import { buildNet, type NetNode } from "../../lesson-berger/visuals/lab";
import { pic, PICS } from "../../lesson-berger/visuals/pix";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/contagious-berger/thumbnails.json";

const COLORS = CELLS.map((c) => CELL[c].color);

const Dots: React.FC<{ pts: { x: number; y: number; c: string }[]; r: number }> = ({ pts, r }) => (
  <g>
    {pts.map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.c} stroke="#1b1f3d" strokeOpacity={0.35} strokeWidth={1.1} />
    ))}
  </g>
);

const Spark: React.FC<{ x: number; y: number; r: number; color?: string; dim?: boolean }> = ({ x, y, r, color = "#ffb020", dim }) => (
  <g transform={`translate(${x} ${y})`}>
    {!dim && <circle r={r * 2.4} fill={color} opacity={0.16} />}
    {!dim && <circle r={r * 1.7} fill={color} opacity={0.24} />}
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <line key={i} x1={Math.cos(a) * r * 1.25} y1={Math.sin(a) * r * 1.25} x2={Math.cos(a) * r * 1.8} y2={Math.sin(a) * r * 1.8} stroke={dim ? "#8a93b8" : color} strokeWidth={r * 0.17} strokeLinecap="round" opacity={dim ? 0.4 : 1} />;
    })}
    <circle r={r} fill={dim ? "#8a93b8" : color} stroke={OL} strokeWidth={4} />
    {!dim && <circle r={r * 0.42} cx={-r * 0.3} cy={-r * 0.3} fill="#fff" opacity={0.6} />}
  </g>
);

// сеть людей-точек (статичная, полностью раскрытая)
const People: React.FC<{ nodes: NetNode[]; r: number; upto?: number }> = ({ nodes, r, upto = 99 }) => (
  <g>
    {nodes.map((n, i) => (n.parent < 0 || n.g > upto ? null : <line key={`e${i}`} x1={nodes[n.parent].x} y1={nodes[n.parent].y} x2={n.x} y2={n.y} stroke={n.c} strokeWidth={r * 0.4} strokeLinecap="round" opacity={0.9} />))}
    {nodes.map((n, i) =>
      n.parent < 0 || n.g > upto ? null : (
        <g key={`n${i}`} transform={`translate(${n.x} ${n.y})`}>
          <path d={`M ${-r * 1.05} ${r * 1.5} Q ${-r * 1.05} ${r * 0.25} 0 ${r * 0.25} Q ${r * 1.05} ${r * 0.25} ${r * 1.05} ${r * 1.5} Z`} fill={n.c} stroke={OL} strokeWidth={2.5} />
          <circle cy={-r * 0.45} r={r * 0.62} fill={n.c} stroke={OL} strokeWidth={2.5} />
        </g>
      ),
    )}
  </g>
);

// ── №1 «ПОЧЕМУ ВСЕ ДЕЛЯТСЯ?» — от одной искры расходится сеть людей ──
const Network: React.FC = () => {
  const nodes = buildNet("th1", 470, 470, { gens: 4, fan: 2.3, step: 82, spread: Math.PI * 2, colors: COLORS });
  return (
    <Frame bg="radial-gradient(circle at 36% 62%, #3b4a9a 0%, #232b66 55%, #141a45 100%)">
      <Glow x={470} y={470} r={300} color="#ffb020" opacity={0.35} />
      <People nodes={nodes} r={15} />
      <Spark x={470} y={470} r={44} />
      <Headline x={640} y={120} lines={["ПОЧЕМУ ВСЕ", "ДЕЛЯТСЯ?"]} size={104} anchor="middle" colors={["#ffffff", BRAND.yellow]} />
      <Host x={1110} y={730} scale={0.62} pose="think" mood="wonder" flip face={{ lookX: -0.8, lookY: 0.2 }} />
      <ChannelBadge x={40} y={660} scale={0.72} dark />
      <Vignette strength={0.38} />
    </Frame>
  );
};

// ── №2 «ШЕСТЬ ПРИЧИН» — шесть цветных камер и идея в центре ──
const SixCells: React.FC = () => {
  const bulb = pic("th2-bulb", PICS.bulb, 450, 420, 1.15, 9);
  return (
    <Frame bg="linear-gradient(160deg, #f6f2e9 0%, #e5dcf7 100%)">
      <Glow x={450} y={420} r={250} color="#ffd23f" opacity={0.55} />
      {CELLS.map((c, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = 450 + Math.cos(a) * 250;
        const y = 420 + Math.sin(a) * 215;
        return (
          <g key={c} filter="url(#softShadow)">
            <line x1={450} y1={420} x2={x} y2={y} stroke={CELL[c].color} strokeWidth={12} strokeLinecap="round" />
            <rect x={x - 78} y={y - 64} width={156} height={128} rx={26} fill={CELL[c].light} stroke={CELL[c].deep} strokeWidth={7} />
            <rect x={x - 78} y={y - 64} width={156} height={40} rx={20} fill={CELL[c].color} stroke={CELL[c].deep} strokeWidth={7} />
            <text x={x} y={y + 40} fontFamily={FONTS.display} fontSize={56} fill={CELL[c].deep} textAnchor="middle">
              {`${i + 1}`}
            </text>
          </g>
        );
      })}
      <circle cx={450} cy={420} r={118} fill="#fff" stroke={OL} strokeWidth={7} />
      <Dots pts={bulb} r={4.2} />
      <Headline x={1010} y={200} lines={["ШЕСТЬ", "ПРИЧИН"]} size={118} anchor="middle" colors={[BRAND.ink, "#8b5cf6"]} fill={BRAND.ink} stroke="#ffffff" strokeWidth={16} />
      <Host x={1060} y={760} scale={0.5} pose="count" mood="happy" flip face={{ lookX: -0.6 }} />
      <ChannelBadge x={40} y={660} scale={0.72} />
    </Frame>
  );
};

// ── №3 «СЛУЧАЙНО ИЛИ НЕТ?» — яркая цепочка против исчезающей искры ──
const ChanceOrNot: React.FC = () => {
  const nodes = buildNet("th3", 250, 470, { gens: 4, fan: 2.1, step: 76, spread: Math.PI * 1.3, dir: 0, colors: ["#ffb020", "#f5a524", "#ff4f7b", "#ffd23f"] });
  return (
    <Frame bg="linear-gradient(90deg, #ff9a3c 0%, #f5a524 44%, #2a3158 56%, #161b3c 100%)">
      <People nodes={nodes} r={14} />
      <Spark x={250} y={470} r={36} />
      <Spark x={1060} y={470} r={36} dim />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={1060 + (i - 1) * 30} cy={400 - i * 26} r={8 - i * 2} fill="#8a93b8" opacity={0.6 - i * 0.15} />
      ))}
      <Headline x={640} y={130} lines={["СЛУЧАЙНО", "ИЛИ НЕТ?"]} size={108} anchor="middle" colors={["#ffffff", BRAND.yellow]} />
      <Host x={660} y={760} scale={0.56} pose="shrug" mood="confused" />
      <ChannelBadge x={40} y={660} scale={0.72} dark />
      <Vignette strength={0.32} />
    </Frame>
  );
};

// ── №4 «КАК РОЖДАЕТСЯ СЛУХ?» — слово передаётся цветными волнами между силуэтами ──
const Rumor: React.FC = () => {
  const xs = [150, 380, 610, 840];
  return (
    <Frame bg="linear-gradient(180deg, #17b3a3 0%, #0f6f80 60%, #123a5c 100%)">
      <Rays x={640} y={380} color="#ffffff" count={14} opacity={0.06} />
      {xs.map((x, i) => (
        <g key={x} transform={`translate(${x} 470)`} filter="url(#softShadow)">
          <circle cy={-70} r={56} fill="#1d2340" />
          <path d="M -86 140 Q -86 -6 0 -6 Q 86 -6 86 140 Z" fill="#1d2340" />
        </g>
      ))}
      {xs.slice(0, 3).map((x, i) =>
        [0, 1, 2].map((j) => <path key={`${i}-${j}`} d={`M ${x + 56 + j * 26} ${380 + j * 8} Q ${x + 115 + j * 22} ${330 - j * 10} ${x + 174 + j * 18} ${380 + j * 8}`} fill="none" stroke={COLORS[(i * 2 + j) % 6]} strokeWidth={14 - j * 3} strokeLinecap="round" />),
      )}
      <g transform="translate(150 300)" filter="url(#softShadow)">
        <path d="M -70 -30 C -70 -60 -40 -66 0 -66 C 40 -66 70 -60 70 -30 L 70 10 C 70 36 40 42 0 42 L -16 42 L -40 66 L -36 40 C -60 36 -70 28 -70 10 Z" fill="#fff" stroke={OL} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={-28 + i * 28} cy={-12} r={10} fill={COLORS[i * 2]} />
        ))}
      </g>
      <Headline x={1250} y={140} lines={["КАК", "РОЖДАЕТСЯ", "СЛУХ?"]} size={96} anchor="end" colors={["#ffffff", "#ffffff", BRAND.yellow]} />
      <Host x={1090} y={760} scale={0.5} pose="hush" mood="wonder" flip face={{ lookX: -0.8 }} />
      <ChannelBadge x={40} y={660} scale={0.72} dark />
      <Vignette strength={0.35} />
    </Frame>
  );
};

// ── №5 «ИДЕЯ, КОТОРУЮ ПЕРЕДАЮТ» — светящийся полезный предмет из рук в руки ──
const PassIt: React.FC = () => {
  const bulb = pic("th5-bulb", PICS.bulb, 820, 290, 1.55, 9);
  const hand = (x: number, y: number, flip: boolean) => (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} filter="url(#softShadow)">
      <path d="M -260 70 L -60 40 Q -10 30 20 50 L 80 90 Q 96 104 80 116 L 10 108 L -60 120 L -260 130 Z" fill="#f2d5bb" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -300 60 L -240 60 L -240 140 L -300 140 Z" fill={flip ? "#3b82f6" : "#22b35e"} stroke={OL} strokeWidth={6} />
    </g>
  );
  return (
    <Frame bg="radial-gradient(circle at 64% 44%, #fff4cf 0%, #ffc94a 40%, #e0701a 100%)">
      <Rays x={820} y={290} color="#fffbe6" count={18} opacity={0.22} />
      <Glow x={820} y={290} r={240} color="#ffffff" opacity={0.6} />
      {hand(700, 380, false)}
      {hand(940, 380, true)}
      <Dots pts={bulb} r={5} />
      <Headline x={1250} y={596} lines={["ИДЕЯ, КОТОРУЮ", "ПЕРЕДАЮТ"]} size={84} anchor="end" colors={["#ffffff", BRAND.yellow]} fill="#fff" />
      <Host x={250} y={790} scale={0.92} pose="present" mood="joy" face={{ lookX: 0.8, lookY: -0.4 }} />
      <ChannelBadge x={40} y={50} scale={0.72} dark />
      <Vignette strength={0.25} />
    </Frame>
  );
};

// Тексты, концепции и рекомендация — в books/contagious-berger/thumbnails.json.
export const BERGER_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Network, 2: SixCells, 3: ChanceOrNot, 4: Rumor, 5: PassIt },
};

export const _unusedTh = { Pill };
