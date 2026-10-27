// Кисть и предмет в ней. Кисть рисуется в своей системе: (0, 0) —
// запястье, +y — вдоль кисти (от локтя к пальцам), side зеркалит большой
// палец. Предмет держится между ладонью и пальцами: сначала ладонь, потом
// предмет, затем пальцы поверх — пальцы «обхватывают» его.
import type { HandShape, ItemKind } from "./pose";
import { PaperCraft } from "./PaperCraft";

type HandProps = {
  readonly x: number;
  readonly y: number;
  readonly angle: number; // градусы: направление кисти (0 — вниз)
  readonly side: -1 | 1;
  readonly len: number;
  readonly skin: string;
  readonly shade: string;
  readonly shape: HandShape;
  readonly item: ItemKind;
  readonly itemColor?: string;
  readonly fold: number; // бумажная поделка: доля выполненных сгибов 0…1
  readonly itemTilt: number;
  readonly part: "back" | "front";
};

export const Hand: React.FC<HandProps> = (p) => {
  const L = p.len;
  const W = L * 0.62;
  const s = p.side;
  const grip = { x: 0, y: L * 0.5 };
  const itemEl = (() => {
    switch (p.item) {
      case "paper":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <PaperCraft w={L * 2.3} fold={p.fold} />
          </g>
        );
      case "book":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.8} y={-L * 1.0} width={L * 1.6} height={L * 2.0} rx={4} fill={p.itemColor ?? "#2F6B4F"} />
            <rect x={-L * 0.7} y={-L * 0.9} width={L * 1.4} height={L * 1.8} rx={3} fill="#FFFFFF" opacity={0.12} />
          </g>
        );
      default:
        return null;
    }
  })();

  const skinStroke = { stroke: p.shade, strokeWidth: 1.5 };
  const palm = <rect x={-W / 2} y={-2} width={W} height={L * 0.66} rx={W * 0.42} fill={p.skin} {...skinStroke} />;
  const fingers = (() => {
    switch (p.shape) {
      case "open":
        return (
          <g>
            {[-1.5, -0.5, 0.5, 1.5].map((k) => (
              <rect key={k} x={k * W * 0.22 - W * 0.1} y={L * 0.5} width={W * 0.2} height={L * (0.46 - Math.abs(k) * 0.05)} rx={W * 0.1} fill={p.skin} transform={`rotate(${k * 5} ${k * W * 0.22} ${L * 0.52})`} />
            ))}
            <rect x={s * W * 0.42 - W * 0.1} y={L * 0.18} width={W * 0.2} height={L * 0.38} rx={W * 0.1} fill={p.skin} transform={`rotate(${-s * 38} ${s * W * 0.4} ${L * 0.25})`} />
          </g>
        );
      case "point":
        return (
          <g>
            <rect x={-W / 2} y={L * 0.4} width={W} height={L * 0.36} rx={W * 0.35} fill={p.skin} {...skinStroke} />
            <rect x={s * W * 0.2 - W * 0.1} y={L * 0.6} width={W * 0.2} height={L * 0.55} rx={W * 0.1} fill={p.skin} {...skinStroke} />
          </g>
        );
      case "fist":
      case "pinch":
        return (
          <g>
            <rect x={-W / 2 - 1} y={L * 0.32} width={W + 2} height={L * 0.38} rx={W * 0.32} fill={p.skin} {...skinStroke} />
            {[-1, 0, 1].map((k) => (
              <line key={k} x1={k * W * 0.22} y1={L * 0.36} x2={k * W * 0.22} y2={L * 0.48} stroke={p.shade} strokeWidth={1.5} strokeLinecap="round" />
            ))}
            <rect x={s * W * 0.18 - W * 0.12} y={L * 0.24} width={W * 0.24} height={L * 0.3} rx={W * 0.12} fill={p.skin} {...skinStroke} transform={`rotate(${s * 30} ${s * W * 0.18} ${L * 0.3})`} />
          </g>
        );
      default:
        return (
          <g>
            <path d={`M ${-W / 2} ${L * 0.45} Q ${-W * 0.55} ${L * 0.95} ${0} ${L * 0.98} Q ${W * 0.55} ${L * 0.95} ${W / 2} ${L * 0.45} Z`} fill={p.skin} {...skinStroke} />
            <rect x={s * W * 0.38 - W * 0.1} y={L * 0.2} width={W * 0.2} height={L * 0.36} rx={W * 0.1} fill={p.skin} transform={`rotate(${-s * 18} ${s * W * 0.38} ${L * 0.25})`} />
          </g>
        );
    }
  })();
  if (p.part === "back") {
    return (
      <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
        {palm}
        <g transform={`translate(${grip.x} ${grip.y})`}>{itemEl}</g>
      </g>
    );
  }
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
      {fingers}
    </g>
  );
};
