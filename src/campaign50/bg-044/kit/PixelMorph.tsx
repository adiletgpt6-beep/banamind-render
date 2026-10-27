// Превращение игры в обычную 2D-сцену: слой `to` открывается квадратами
// (как пиксели, которые «переворачиваются») по диагонали с небольшим
// разбросом, на границе — тонкие жёлтые искры. progress 0 → только `from`,
// 1 → только `to`. id — уникальное имя clipPath в кадре.
import { useMemo } from "react";
import { clamp } from "../anim";
import { C } from "../palette";

const W = 1080;
const H = 1920;
const hash = (n: number) => {
  const s = Math.sin(n * 91.7 + 17.3) * 43758.5453;
  return s - Math.floor(s);
};

export const PixelMorph: React.FC<{
  readonly id: string;
  readonly progress: number;
  readonly from: React.ReactNode;
  readonly to: React.ReactNode;
  readonly cell?: number;
  readonly dir?: "down" | "up" | "diag"; // откуда идёт волна
}> = ({ id, progress, from, to, cell = 90, dir = "diag" }) => {
  const p = clamp(progress);
  const cells = useMemo(() => {
    const out: { x: number; y: number; th: number }[] = [];
    const cols = Math.ceil(W / cell);
    const rows = Math.ceil(H / cell);
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const pos = dir === "down" ? j / rows : dir === "up" ? 1 - j / rows : (i / cols) * 0.35 + (j / rows) * 0.65;
        out.push({ x: i * cell, y: j * cell, th: 0.04 + 0.78 * pos + 0.16 * hash(i * 13 + j * 7) });
      }
    return out;
  }, [cell, dir]);
  if (p <= 0) return <>{from}</>;
  if (p >= 1) return <>{to}</>;
  const open = cells.filter((c) => c.th <= p);
  const edge = cells.filter((c) => c.th > p && c.th <= p + 0.05);
  return (
    <>
      {from}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            {open.map((c, k) => (
              <rect key={k} x={c.x} y={c.y} width={cell + 0.5} height={cell + 0.5} />
            ))}
          </clipPath>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, clipPath: `url(#${id})` }}>{to}</div>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} shapeRendering="crispEdges">
        {edge.map((c, k) => {
          const a = 1 - (c.th - p) / 0.05;
          const s = cell * (0.35 + 0.4 * a);
          return <rect key={k} x={c.x + (cell - s) / 2} y={c.y + (cell - s) / 2} width={s} height={s} fill={k % 3 ? C.yellow : C.white} opacity={0.85 * a} />;
        })}
      </svg>
    </>
  );
};
