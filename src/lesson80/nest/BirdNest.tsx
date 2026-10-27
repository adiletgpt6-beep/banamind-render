// Гнездо самки чёрного дрозда: чаша из тонких веточек и сухих стеблей,
// укреплённая землёй изнутри, с мягкой выстилкой. Гнездо начато до фильма;
// принесённые за фильм травинки — отдельные объекты, которые появляются по
// счётчику и остаются на месте. Без яиц и птенцов. Рисуется в двух слоях:
// back — задняя стенка (за птицей), front — передний край (перед лапами).
import { TREE } from "../sets/treeLayout";
import { hash01 } from "../rig/motion";

const TWIG = ["#6B4E3A", "#7E5F48", "#55402F", "#8A6A4F"];
const STRAW = ["#B89B67", "#C9AE78", "#A28655"];

// Положения травинок, уложенных за фильм (постоянные; индекс = порядок укладки).
export const PLACED_BLADES: readonly { x: number; y: number; angle: number; len: number; bend: number }[] = [
  { x: -22, y: -34, angle: -8, len: 150, bend: 14 },
  { x: 30, y: -40, angle: 14, len: 136, bend: 10 },
  { x: -8, y: -46, angle: -22, len: 142, bend: 16 },
  { x: 40, y: -30, angle: 4, len: 128, bend: 8 },
  { x: -36, y: -38, angle: 18, len: 140, bend: 12 },
  { x: 12, y: -50, angle: -4, len: 132, bend: 14 },
];

export const BirdNest: React.FC<{ readonly layer: "back" | "front"; readonly placed: number }> = ({ layer, placed }) => {
  const { x, y, rx, ry } = TREE.nest;
  const twigs = (count: number, seed: number, yOff: number, spreadY: number, front: boolean) =>
    Array.from({ length: count }, (_, i) => {
      const r1 = hash01(seed + i * 3.1);
      const r2 = hash01(seed + i * 7.7);
      const r3 = hash01(seed + i * 11.3);
      const px = x + (r1 - 0.5) * rx * 2.2;
      const py = y + yOff + (r2 - 0.5) * spreadY;
      const len = 40 + r3 * 70;
      const ang = (r1 - 0.5) * 70 + (front ? 0 : 180);
      const col = r3 > 0.55 ? TWIG[i % TWIG.length] : STRAW[i % STRAW.length];
      return <line key={i} x1={px - Math.cos((ang * Math.PI) / 180) * len * 0.5} y1={py - Math.sin((ang * Math.PI) / 180) * len * 0.15} x2={px + Math.cos((ang * Math.PI) / 180) * len * 0.5} y2={py + Math.sin((ang * Math.PI) / 180) * len * 0.15} stroke={col} strokeWidth={2.6 + r2 * 2} strokeLinecap="round" />;
    });
  if (layer === "back") {
    return (
      <g>
        {/* задняя стенка чаши */}
        <path d={`M ${x - rx * 1.05} ${y} C ${x - rx * 1.1} ${y - ry * 1.9} ${x + rx * 1.1} ${y - ry * 1.9} ${x + rx * 1.05} ${y} Z`} fill="#6E5542" />
        {twigs(26, 3, -ry * 0.9, ry * 1.6, false)}
        {/* внутренняя земляная стенка и выстилка */}
        <path d={`M ${x - rx * 0.86} ${y - ry * 0.1} C ${x - rx * 0.9} ${y - ry * 1.5} ${x + rx * 0.9} ${y - ry * 1.5} ${x + rx * 0.86} ${y - ry * 0.1} Z`} fill="#5A4536" />
        <path d={`M ${x - rx * 0.72} ${y - ry * 0.2} C ${x - rx * 0.75} ${y - ry * 1.2} ${x + rx * 0.75} ${y - ry * 1.2} ${x + rx * 0.72} ${y - ry * 0.2} Z`} fill="#8C7556" />
        <ellipse cx={x} cy={y - ry * 0.35} rx={rx * 0.62} ry={ry * 0.45} fill="#A08A66" />
        {/* уложенные за фильм травинки — на внутреннем крае */}
        {PLACED_BLADES.slice(0, placed).map((b, i) => (
          <g key={i} transform={`translate(${x + b.x} ${y + b.y}) rotate(${b.angle})`}>
            <path d={`M ${-b.len / 2} 0 Q 0 ${-b.bend} ${b.len / 2} 0`} stroke="#CDB474" strokeWidth={4.6} fill="none" strokeLinecap="round" />
            <path d={`M ${-b.len / 2} 0 Q 0 ${-b.bend} ${b.len / 2} 0`} stroke="#A48E57" strokeWidth={1.4} fill="none" strokeLinecap="round" transform="translate(0 1.4)" />
          </g>
        ))}
      </g>
    );
  }
  return (
    <g>
      {/* передняя стенка и край чаши */}
      <path d={`M ${x - rx * 1.05} ${y} C ${x - rx * 1.0} ${y + ry * 1.7} ${x + rx * 1.0} ${y + ry * 1.7} ${x + rx * 1.05} ${y} C ${x + rx * 0.7} ${y + ry * 0.35} ${x - rx * 0.7} ${y + ry * 0.35} ${x - rx * 1.05} ${y} Z`} fill="#7A5F49" />
      <path d={`M ${x - rx * 0.98} ${y + 2} C ${x - rx * 0.9} ${y + ry * 1.3} ${x + rx * 0.9} ${y + ry * 1.3} ${x + rx * 0.98} ${y + 2} C ${x + rx * 0.6} ${y + ry * 0.3} ${x - rx * 0.6} ${y + ry * 0.3} ${x - rx * 0.98} ${y + 2} Z`} fill="#5F4938" opacity={0.6} />
      {twigs(30, 17, ry * 0.5, ry * 1.1, true)}
      {/* земляной укреплённый край */}
      <path d={`M ${x - rx * 0.9} ${y + 4} Q ${x} ${y + ry * 0.45} ${x + rx * 0.9} ${y + 4}`} stroke="#5A4536" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  );
};
