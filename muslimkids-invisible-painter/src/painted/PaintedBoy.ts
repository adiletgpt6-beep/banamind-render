// Мальчик 7–9 лет на холме смотрит на звёздное небо. Вид со спины в три четверти:
// лицо не прорисовывается крупно (добрый детский силуэт). Скромная повседневная
// одежда: рубашка с длинным рукавом, брюки. Рисуется мягкими мазками по частям,
// затем обретает объём (тень и лунный контровой свет) и чуть поднимает голову.

import { drawWash, type Pt, type WashSpec } from "../engines/WatercolorSimulationEngine";
import { drawStroke } from "../engines/BrushStrokeEngine";
import { clamp01, smooth } from "../utils/noise";

export const BOY = { x: 640, y: 1652, s: 1.15 };

type Part = { id: string; pts: Pt[]; colors: string[]; t: number; op?: number; head?: boolean };

const P = (pts: [number, number][]) => pts.map(([x, y]) => ({ x, y }));

const PARTS: Part[] = [
  { id: "shoe-l", pts: P([[-34, -4], [-14, -6], [-10, 2], [-36, 3]]), colors: ["#4A3428"], t: 0 },
  { id: "shoe-r", pts: P([[2, -6], [24, -6], [26, 2], [0, 2]]), colors: ["#4A3428"], t: 0.02 },
  { id: "leg-l", pts: P([[-30, -104], [-8, -104], [-12, -6], [-30, -6]]), colors: ["#2E4469", "#33507A"], t: 0.05 },
  { id: "leg-r", pts: P([[-6, -104], [16, -104], [22, -6], [2, -6]]), colors: ["#2E4469", "#2A3F63"], t: 0.08 },
  { id: "arm-r", pts: P([[18, -176], [34, -168], [40, -116], [28, -112], [22, -150]]), colors: ["#7FB0D6", "#8DBADD"], t: 0.2 },
  { id: "torso", pts: P([[-30, -182], [-10, -188], [14, -186], [30, -176], [32, -140], [36, -98], [-36, -96], [-34, -140]]), colors: ["#8DBADD", "#9CC6E4", "#7FB0D6"], t: 0.14 },
  { id: "arm-l", pts: P([[-30, -178], [-44, -166], [-48, -116], [-36, -112], [-32, -150]]), colors: ["#7FB0D6", "#8DBADD"], t: 0.24 },
  { id: "hand-l", pts: P([[-49, -118], [-36, -116], [-38, -102], [-48, -103]]), colors: ["#D89F78"], t: 0.3 },
  { id: "hand-r", pts: P([[28, -116], [41, -118], [41, -104], [30, -103]]), colors: ["#D89F78"], t: 0.3 },
  { id: "neck", pts: P([[-9, -196], [7, -196], [8, -182], [-10, -182]]), colors: ["#D89F78"], t: 0.34, head: true },
  { id: "head", pts: P([[-30, -214], [-24, -236], [-4, -246], [18, -238], [26, -216], [22, -196], [4, -188], [-20, -192]]), colors: ["#E2AC82", "#D89F78"], t: 0.38, head: true },
  { id: "hair", pts: P([[-14, -240], [4, -248], [22, -238], [28, -216], [24, -200], [10, -196], [4, -210], [-6, -224], [-20, -230]]), colors: ["#2E211C", "#3A2A22"], t: 0.46, head: true },
  { id: "ear", pts: P([[-2, -220], [6, -222], [8, -210], [0, -206]]), colors: ["#D18F68"], t: 0.5, head: true },
];

export type BoyState = { paint: number; awaken: number; lift: number; f: number; alpha?: number };

export function drawBoy(ctx: CanvasRenderingContext2D, st: BoyState) {
  if (st.paint <= 0) return;
  const { x, y, s } = BOY;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // холмик и мягкая тень под ногами
  drawWash(ctx, { id: "boy-hill", shape: P([[-170, 18], [-90, -6], [0, -14], [90, -6], [170, 18], [130, 50], [-130, 50]]), colors: ["#4E8E64", "#5A9A6A"], layers: 8, opacity: 0.35, edge: 0.15, deform: 0.6 }, smooth(st.paint * 3));
  drawWash(ctx, { id: "boy-shadow", shape: P([[-46, -2], [40, -4], [46, 6], [-50, 8]]), colors: ["#1F3B4A"], layers: 5, opacity: 0.5, edge: 0, deform: 0.5 }, smooth(st.paint * 2 - 0.3));
  const tilt = 0.04 + 0.32 * smooth(st.lift);
  for (const part of PARTS) {
    const p = smooth((st.paint - part.t) / 0.32);
    if (p <= 0) continue;
    ctx.save();
    if (part.head) {
      ctx.translate(-2, -186);
      ctx.rotate(tilt);
      ctx.translate(2, 186);
    }
    const spec: WashSpec = { id: `boy-${part.id}`, shape: part.pts, colors: part.colors, layers: 9, opacity: part.op ?? 0.92, edge: 0.7, deform: 0.08, spreadJitter: 0.4 };
    drawWash(ctx, spec, p, { alpha: st.alpha ?? 1 });
    ctx.restore();
  }
  // объём: тень справа, лунный контровой свет слева
  if (st.awaken > 0) {
    const a = st.awaken * (st.alpha ?? 1);
    drawWash(ctx, { id: "boy-shade-body", shape: P([[4, -184], [30, -176], [36, -98], [22, -6], [6, -6], [8, -100], [10, -150]]), colors: ["#1E3358"], layers: 6, opacity: 0.5, edge: 0, deform: 0.1 }, 1, { alpha: a });
    const rim = (id: string, pts: [number, number][], w: number, head = false) => {
      ctx.save();
      if (head) {
        ctx.translate(-2, -186);
        ctx.rotate(tilt);
        ctx.translate(2, 186);
      }
      drawStroke(ctx, { id, pts: P(pts), width: w, color: "#FFF1C9", bristles: 5, dry: 0.3, opacity: 0.75, mode: "source-over", taper: [0.2, 0.3] }, clamp01(a * 1.2), { alpha: a });
      ctx.restore();
    };
    rim("boy-rim-arm", [[-44, -164], [-48, -140], [-48, -118]], 4);
    rim("boy-rim-back", [[-31, -178], [-34, -140], [-36, -100]], 4);
    rim("boy-rim-head", [[-26, -232], [-30, -214], [-24, -196]], 4, true);
  }
  ctx.restore();
}
