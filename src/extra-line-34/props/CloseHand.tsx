// Кисть с предплечьем и рукавом для крупных планов книги (сц. 7, 14): рука
// входит из-за края кадра, at — точка хвата (страница, закладка). angle — как
// у Hand: 0 — кисть вниз. Рукав доходит до края кадра (900 px).
import { Hand } from "../rig/Hand";
import type { HandShape } from "../rig/pose";

export const CloseHand: React.FC<{
  readonly at: { readonly x: number; readonly y: number };
  readonly angle: number;
  readonly shape: HandShape;
  readonly len?: number;
  readonly skin: string;
  readonly shade: string;
  readonly sleeve: string;
  readonly sleeveShade: string;
  readonly cuff?: number; // длина открытого запястья, px
}> = ({ at, angle, shape, len = 150, skin, shade, sleeve, sleeveShade, cuff = 70 }) => {
  const a = (angle * Math.PI) / 180;
  const d = { x: -Math.sin(a), y: Math.cos(a) }; // направление кисти
  const wrist = { x: at.x - d.x * len * 0.5, y: at.y - d.y * len * 0.5 };
  const elbow = { x: wrist.x - d.x * 900, y: wrist.y - d.y * 900 };
  const c = { x: wrist.x - d.x * cuff, y: wrist.y - d.y * cuff };
  const hp = { x: wrist.x, y: wrist.y, angle, side: 1 as const, len, skin, shade, shape, item: "none" as const, flat: 0, itemTilt: 0, glow: 0, shake: 0 };
  return (
    <g>
      <line x1={wrist.x} y1={wrist.y} x2={c.x} y2={c.y} stroke={skin} strokeWidth={len * 0.5} strokeLinecap="round" />
      <line x1={c.x} y1={c.y} x2={elbow.x} y2={elbow.y} stroke={sleeve} strokeWidth={len * 0.62} strokeLinecap="round" />
      <line x1={c.x + d.y * 18} y1={c.y - d.x * 18} x2={elbow.x + d.y * 18} y2={elbow.y - d.x * 18} stroke={sleeveShade} strokeWidth={len * 0.22} strokeLinecap="round" opacity={0.6} />
      <Hand {...hp} part="back" />
      <Hand {...hp} part="front" />
    </g>
  );
};
