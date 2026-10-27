// Пиксельный спрайт: строки из букв палитры PX (palette.ts), «.» — пусто.
// Один <path> на цвет, shapeRendering="crispEdges" — чёткие пиксели.
//   <SpriteG rows={MOM_IDLE} px={12} x={100} y={200} />      — внутри <svg>
//   <Sprite rows={…} px={12} x={…} y={…} flip />              — свой <svg>
// x, y — левый верхний угол спрайта (после отражения тоже).
import { useMemo } from "react";
import { PX, type PxKey } from "../palette";

export type SpriteRows = readonly string[];

const pathsOf = (rows: SpriteRows, px: number, flip: boolean) => {
  const w = Math.max(...rows.map((r) => r.length));
  const byColor = new Map<string, string>();
  rows.forEach((r, y) => {
    [...r].forEach((ch, x) => {
      const col = PX[ch as PxKey];
      if (!col) return;
      const gx = flip ? w - 1 - x : x;
      byColor.set(col, (byColor.get(col) ?? "") + `M${gx * px} ${y * px}h${px}v${px}h${-px}z`);
    });
  });
  return [...byColor.entries()];
};

export const spriteSize = (rows: SpriteRows, px: number) => ({
  width: Math.max(...rows.map((r) => r.length)) * px,
  height: rows.length * px,
});

type Props = {
  readonly rows: SpriteRows;
  readonly px: number;
  readonly x?: number;
  readonly y?: number;
  readonly flip?: boolean;
  readonly opacity?: number;
  // заменить цвета (например, другой цвет одежды): { "#5B7FC7": "#E8735A" }
  readonly recolor?: Readonly<Record<string, string>>;
};

export const SpriteG: React.FC<Props> = ({ rows, px, x = 0, y = 0, flip = false, opacity = 1, recolor }) => {
  const paths = useMemo(() => pathsOf(rows, px, flip), [rows, px, flip]);
  return (
    <g transform={`translate(${Math.round(x)} ${Math.round(y)})`} opacity={opacity} shapeRendering="crispEdges">
      {paths.map(([col, d]) => (
        <path key={col} d={d} fill={recolor?.[col] ?? col} />
      ))}
    </g>
  );
};

export const Sprite: React.FC<Props & { readonly style?: React.CSSProperties }> = ({ style, x = 0, y = 0, ...p }) => {
  const { width, height } = spriteSize(p.rows, p.px);
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: Math.round(x), top: Math.round(y), overflow: "visible", ...style }}>
      <SpriteG {...p} />
    </svg>
  );
};
