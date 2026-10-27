// Пиксельный текст: каждый «пиксель» шрифта — квадрат px×px. Собирается в
// один <path> на цвет (быстро и чётко, shapeRendering="crispEdges").
//   <PixelText text="ДЕҢГЭЭЛ 1" x={540} y={300} px={10} align="center" />
//     x, y — точка привязки: y — верх основных (прописных) строк;
//     align — по x: left (x — левый край), center, right.
//   reveal — сколько символов показать (эффект «печатной машинки»).
//   shadow — сдвиг тени в пикселях шрифта (по умолчанию 1×1) и её цвет.
// <PixelTextG> — то же внутри готового <svg> (без своего контейнера).
import { useMemo } from "react";
import { PIXEL_HEIGHT, PIXEL_TOP, glyphOf, pixelTextWidth } from "./pixelFont";

type Common = {
  readonly text: string;
  readonly px: number;
  readonly color?: string;
  readonly shadow?: string | null; // цвет тени; null — без тени
  readonly shadowOffset?: number; // в пикселях шрифта
  readonly reveal?: number;
  readonly align?: "left" | "center" | "right";
  readonly opacity?: number;
};

const buildPath = (text: string, px: number, reveal: number) => {
  let d = "";
  let cx = 0;
  const chars = [...text];
  chars.forEach((ch, i) => {
    const gl = glyphOf(ch);
    const w = gl.rows[0].length;
    if (i < reveal) {
      const put = (rows: readonly string[], row0: number) =>
        rows.forEach((r, ry) =>
          [...r].forEach((c, rx) => {
            if (c === "#") d += `M${(cx + rx) * px} ${(row0 + ry) * px}h${px}v${px}h${-px}z`;
          }),
        );
      if (gl.top) put(gl.top, PIXEL_TOP - gl.top.length);
      put(gl.rows, PIXEL_TOP);
      if (gl.tail) put([gl.tail], PIXEL_TOP + gl.rows.length);
    }
    cx += w + 1;
  });
  return d;
};

export const pixelTextSize = (text: string, px: number) => ({ width: pixelTextWidth(text) * px, height: PIXEL_HEIGHT * px });

export const PixelTextG: React.FC<Common & { readonly x?: number; readonly y?: number }> = ({
  text,
  px,
  x = 0,
  y = 0,
  color = "#14285A",
  shadow = null,
  shadowOffset = 1,
  reveal = Infinity,
  align = "left",
  opacity = 1,
}) => {
  const d = useMemo(() => buildPath(text, px, reveal), [text, px, reveal]);
  const w = pixelTextWidth(text) * px;
  const left = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  // y — верх прописных строк; путь начинается со строки «шапки»
  const top = y - PIXEL_TOP * px;
  return (
    <g transform={`translate(${Math.round(left)} ${Math.round(top)})`} opacity={opacity} shapeRendering="crispEdges">
      {shadow ? <path d={d} fill={shadow} transform={`translate(${shadowOffset * px} ${shadowOffset * px})`} /> : null}
      <path d={d} fill={color} />
    </g>
  );
};

export const PixelText: React.FC<Common & { readonly x: number; readonly y: number; readonly style?: React.CSSProperties }> = (props) => {
  const { text, px, x, y, align = "left", shadowOffset = 1, style } = props;
  const w = pixelTextWidth(text) * px + shadowOffset * px;
  const h = PIXEL_HEIGHT * px + shadowOffset * px;
  const tw = pixelTextWidth(text) * px;
  const left = align === "center" ? x - tw / 2 : align === "right" ? x - tw : x;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", left: Math.round(left), top: Math.round(y - PIXEL_TOP * px), overflow: "visible", ...style }}
    >
      <PixelTextG {...props} x={0} y={PIXEL_TOP * px} align="left" />
    </svg>
  );
};
