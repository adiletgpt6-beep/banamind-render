// Дерево за окном: небо, дальняя листва, ствол с развилкой, задние ветки,
// гнездо (задняя стенка), птица, гнездо (передний край), передние ветки и
// листья, лужайка с сухой травой. Одно постоянное дерево для крупных планов
// и для вида из окна класса (тот же компонент в меньшем масштабе).
import { BirdCharacter, GrassBlade } from "../bird/BirdCharacter";
import type { BirdPose } from "../bird/birdPose";
import { BirdNest } from "../nest/BirdNest";
import { hash01 } from "../rig/motion";
import { TREE } from "./treeLayout";

const BARK = "#6B4E3A";
const BARK_DARK = "#54392A";
const BARK_LIGHT = "#86664F";
const LEAF = ["#6F9A52", "#7FAF63", "#5E8A47", "#8DBA6E", "#4F7A3C"];

// Ветка переменной толщины между точками (квадратичная кривая).
const Branch: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; c?: { x: number; y: number }; w0: number; w1: number; tone?: number }> = ({ a, b, c, w0, w1, tone = 0 }) => {
  const cx = c?.x ?? (a.x + b.x) / 2;
  const cy = c?.y ?? (a.y + b.y) / 2 - 30;
  const d = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  const col = tone > 0 ? BARK_DARK : BARK;
  return (
    <g>
      <path d={d} stroke={col} strokeWidth={w0} fill="none" strokeLinecap="round" />
      <path d={`M ${(a.x + cx) / 2} ${(a.y + cy) / 2} Q ${cx} ${cy} ${b.x} ${b.y}`} stroke={col} strokeWidth={w1} fill="none" strokeLinecap="round" />
      <path d={d} stroke={BARK_LIGHT} strokeWidth={Math.max(2, w0 * 0.18)} fill="none" strokeLinecap="round" opacity={0.45} transform="translate(-3 -4)" />
    </g>
  );
};

// Куст листвы: несколько перекрывающихся листьев-эллипсов с лёгким покачиванием.
const Foliage: React.FC<{ x: number; y: number; r: number; seed: number; sway: number; tone?: number; n?: number }> = ({ x, y, r, seed, sway, tone = 0, n = 14 }) => (
  <g transform={`rotate(${sway} ${x} ${y + r})`}>
    {Array.from({ length: n }, (_, i) => {
      const a = hash01(seed + i * 1.7) * Math.PI * 2;
      const d = hash01(seed + i * 3.3) * r * 0.75;
      const lx = x + Math.cos(a) * d;
      const ly = y + Math.sin(a) * d * 0.8;
      const col = LEAF[(i + tone) % LEAF.length];
      const rot = hash01(seed + i * 5.1) * 360;
      return <ellipse key={i} cx={lx} cy={ly} rx={r * 0.34} ry={r * 0.2} fill={col} transform={`rotate(${rot} ${lx} ${ly})`} opacity={0.96} />;
    })}
  </g>
);

export const TreeWorld: React.FC<{ readonly pose: BirdPose; readonly placed: number; readonly f: number; readonly grassOnGround: boolean; readonly window?: boolean }> = ({ pose, placed, f, grassOnGround, window }) => {
  const sway = Math.sin(f / 41) * 0.8 + Math.sin(f / 97) * 0.6;
  const T = TREE;
  const trunkD = `M ${T.trunk.x - 70} ${T.trunk.baseY + 20} C ${T.trunk.x - 60} ${T.trunk.baseY - 400} ${T.trunk.x - 30} ${T.trunk.baseY - 700} ${T.trunk.x - 22} ${T.trunk.topY} L ${T.trunk.x + 34} ${T.trunk.topY} C ${T.trunk.x + 60} ${T.trunk.baseY - 700} ${T.trunk.x + 86} ${T.trunk.baseY - 400} ${T.trunk.x + 96} ${T.trunk.baseY + 20} Z`;
  return (
    <g>
      {/* небо */}
      <defs>
        <linearGradient id="l80sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFD9EC" />
          <stop offset="0.6" stopColor="#DCE9EF" />
          <stop offset="1" stopColor="#EEE7D6" />
        </linearGradient>
        <linearGradient id="l80lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FB46A" />
          <stop offset="1" stopColor="#6F955A" />
        </linearGradient>
      </defs>
      <rect x={-400} y={-400} width={T.w + 800} height={T.h + 800} fill="url(#l80sky)" />
      {/* дальняя листва (размытая масса) */}
      <ellipse cx={520} cy={520} rx={520} ry={300} fill="#B9CFAE" opacity={0.7} />
      <ellipse cx={2100} cy={420} rx={420} ry={260} fill="#B3CBA6" opacity={0.65} />
      <ellipse cx={1100} cy={330} rx={460} ry={220} fill="#C3D6B4" opacity={0.6} />
      {/* лужайка */}
      <rect x={-400} y={T.groundY} width={T.w + 800} height={400} fill="url(#l80lawn)" />
      <path d={`M -400 ${T.groundY + 6} Q ${T.w / 2} ${T.groundY - 22} ${T.w + 400} ${T.groundY + 4} L ${T.w + 400} ${T.groundY + 30} L -400 ${T.groundY + 30} Z`} fill="#86AD64" />
      {Array.from({ length: 36 }, (_, i) => {
        const gx = -300 + i * 86 + hash01(i) * 40;
        const gy = T.groundY + 8 + hash01(i + 9) * 60;
        return <path key={i} d={`M ${gx} ${gy} q 6 -22 14 -34 M ${gx + 10} ${gy} q -4 -18 -12 -28 M ${gx + 6} ${gy} q 2 -24 6 -38`} stroke="#5F8A47" strokeWidth={2.5} fill="none" strokeLinecap="round" />;
      })}
      {/* кустик сухой травы — материал для гнезда */}
      <g transform={`translate(${T.grassSpot.x} ${T.groundY})`}>
        {[-26, -14, -2, 10, 22].map((dx, i) => (
          <path key={i} d={`M ${dx} 6 q ${dx * 0.3} -40 ${dx * 0.9} -78`} stroke="#C9B275" strokeWidth={3.4} fill="none" strokeLinecap="round" opacity={0.95} />
        ))}
        {grassOnGround ? <GrassBlade x={34} y={-6} angle={-14} len={170} hold={0.5} bend={12} /> : null}
      </g>
      {/* задние ветки и листва за гнездом */}
      <Branch a={{ x: T.trunk.x, y: 760 }} b={{ x: 1980, y: 300 }} c={{ x: 1900, y: 520 }} w0={44} w1={18} tone={1} />
      <Branch a={{ x: T.fork.x, y: T.fork.y }} b={{ x: 1400, y: 380 }} c={{ x: 1430, y: 520 }} w0={34} w1={14} tone={1} />
      <Foliage x={1380} y={330} r={210} seed={5} sway={sway} tone={2} n={18} />
      <Foliage x={2060} y={260} r={240} seed={9} sway={sway * 0.8} tone={1} n={20} />
      <Foliage x={1760} y={120} r={260} seed={13} sway={sway} n={22} />
      {/* ствол */}
      <path d={trunkD} fill={BARK} />
      <path d={`M ${T.trunk.x - 44} ${T.trunk.baseY} C ${T.trunk.x - 34} ${T.trunk.baseY - 500} ${T.trunk.x - 10} ${T.trunk.baseY - 800} ${T.trunk.x - 2} ${T.trunk.topY + 40}`} stroke={BARK_DARK} strokeWidth={14} fill="none" opacity={0.5} />
      <path d={`M ${T.trunk.x + 40} ${T.trunk.baseY} C ${T.trunk.x + 46} ${T.trunk.baseY - 500} ${T.trunk.x + 30} ${T.trunk.baseY - 760} ${T.trunk.x + 20} ${T.trunk.topY + 60}`} stroke={BARK_LIGHT} strokeWidth={10} fill="none" opacity={0.35} />
      {/* толстая ветка от ствола к развилке и ветка-присест влево */}
      <Branch a={{ x: T.trunk.x - 30, y: 860 }} b={{ x: T.fork.x, y: T.fork.y + 8 }} c={{ x: 1600, y: 760 }} w0={52} w1={40} />
      <Branch a={{ x: T.fork.x, y: T.fork.y + 8 }} b={{ x: 980, y: 790 }} c={{ x: 1230, y: 718 }} w0={40} w1={22} />
      <Branch a={{ x: 1080, y: 772 }} b={{ x: 900, y: 600 }} c={{ x: 1010, y: 690 }} w0={16} w1={8} />
      {/* нижняя ветка-присест */}
      <Branch a={{ x: T.trunk.x - 20, y: 1100 }} b={{ x: 560, y: 1010 }} c={{ x: 1100, y: 1050 }} w0={40} w1={20} />
      <Branch a={{ x: 700, y: 1016 }} b={{ x: 560, y: 880 }} c={{ x: 640, y: 950 }} w0={14} w1={7} />
      <Foliage x={520} y={880} r={150} seed={21} sway={sway * 1.2} tone={3} n={12} />
      {/* гнездо — задняя стенка */}
      <BirdNest layer="back" placed={placed} />
      {/* птица */}
      <BirdCharacter pose={pose} uid={window ? "bird-w" : "bird"} />
      {/* гнездо — передний край */}
      <BirdNest layer="front" placed={placed} />
      {/* передние ветки и листья (глубина) */}
      <Branch a={{ x: 1180, y: 420 }} b={{ x: 1340, y: 560 }} c={{ x: 1280, y: 470 }} w0={12} w1={6} />
      <Foliage x={1160} y={400} r={140} seed={31} sway={sway * 1.4} tone={1} n={10} />
      <Foliage x={1950} y={560} r={170} seed={37} sway={sway} tone={4} n={12} />
      {!window ? <Foliage x={-60} y={160} r={260} seed={41} sway={sway * 1.6} tone={2} n={16} /> : null}
    </g>
  );
};
