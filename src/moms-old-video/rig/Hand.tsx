// Кисть и предмет в ней. Кисть рисуется в своей системе: (0, 0) —
// запястье, +y — вдоль кисти (от локтя к пальцам), side зеркалит большой
// палец. Предмет держится между ладонью и пальцами: сначала ладонь, потом
// предмет, затем пальцы поверх — пальцы «обхватывают» его.
import type { HandShape, ItemKind } from "./pose";

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
  readonly flat: number;
  readonly itemTilt: number;
  readonly glow: number;
  readonly shake: number;
  readonly part: "back" | "front";
};

const INK = "#1E2235";

// Телефон в руке: экраном к зрителю, почти вертикально (itemTilt), или
// плашмя (flat → 1) — как лежит на столе.
const PhoneShape: React.FC<{ w: number; h: number; flat: number; glow: number }> = ({ w, h, flat, glow }) => {
  const W = w * (1 + 0.95 * flat);
  const H = h * (1 - 0.68 * flat);
  const scr = glow > 0 ? `rgba(${Math.round(150 + 90 * glow)}, ${Math.round(190 + 50 * glow)}, ${Math.round(230 + 20 * glow)}, 1)` : "#2C3B5C";
  return (
    <g>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={Math.min(W, H) * 0.16} fill={INK} />
      <rect x={-W / 2 + 3} y={-H / 2 + 3 + 2 * (1 - flat)} width={W - 6} height={H - 6 - 4 * (1 - flat)} rx={Math.min(W, H) * 0.12} fill={scr} />
      {glow > 0.2 && flat < 0.5 ? (
        <g opacity={glow}>
          <rect x={-W / 2 + 7} y={-H / 2 + 12} width={W * 0.55} height={4} rx={2} fill="#FFFFFF" opacity={0.85} />
          <rect x={-W / 2 + 7} y={-H / 2 + 22} width={W * 0.7} height={4} rx={2} fill="#FFFFFF" opacity={0.6} />
        </g>
      ) : null}
    </g>
  );
};

export const Hand: React.FC<HandProps> = (p) => {
  const L = p.len;
  const W = L * 0.62;
  const s = p.side;
  const grip = { x: 0, y: L * 0.5 };
  // предмет — в мировой ориентации (телефон, ключи висят вниз)
  const itemEl = (() => {
    switch (p.item) {
      case "phone": {
        const pw = L * 0.82;
        const ph = L * 1.62;
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(${p.shake} 0)`}>
            <PhoneShape w={pw} h={ph} flat={p.flat} glow={p.glow} />
          </g>
        );
      }
      case "keys":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <circle cx={0} cy={L * 0.12} r={L * 0.16} fill="none" stroke="#B9BEC8" strokeWidth={3} />
            <g transform={`rotate(${8} 0 ${L * 0.2})`}>
              <rect x={-3} y={L * 0.22} width={7} height={L * 0.5} rx={3} fill="#C9A646" />
              <rect x={-9} y={L * 0.22} width={10} height={10} rx={3} fill="#C9A646" />
            </g>
            <g transform={`rotate(${-14} 0 ${L * 0.2})`}>
              <rect x={-3} y={L * 0.24} width={6} height={L * 0.44} rx={3} fill="#AFB5BF" />
              <rect x={-10} y={L * 0.6} width={14} height={9} rx={4} fill="#3A4A7A" />
            </g>
          </g>
        );
      case "workbag":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <path d={`M ${-L * 0.35} ${L * 0.5} Q ${-L * 0.35} ${-L * 0.1} 0 ${-L * 0.1} Q ${L * 0.35} ${-L * 0.1} ${L * 0.35} ${L * 0.5}`} stroke="#5E3F31" strokeWidth={6} fill="none" />
            <rect x={-L * 1.1} y={L * 0.45} width={L * 2.2} height={L * 1.6} rx={L * 0.3} fill="#8A5A44" />
            <rect x={-L * 1.1} y={L * 0.45} width={L * 2.2} height={L * 0.4} rx={L * 0.2} fill="#7A4E3B" />
          </g>
        );
      case "notebook":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.75} y={-L * 0.95} width={L * 1.5} height={L * 1.9} rx={4} fill="#3E7CC0" />
            <rect x={-L * 0.6} y={-L * 0.8} width={L * 1.2} height={L * 0.5} rx={3} fill="#FFFFFF" opacity={0.85} />
          </g>
        );
      case "phoneSide":
        // телефон ребром к зрителю (экраном к снимаемым): видна боковая грань
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.11} y={-L * 0.82} width={L * 0.22} height={L * 1.64} rx={L * 0.08} fill={INK} />
            <rect x={-L * 0.04} y={-L * 0.7} width={L * 0.05} height={L * 0.3} rx={2} fill="#5A6378" />
          </g>
        );
      case "bottle":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.3} y={-L * 0.9} width={L * 0.6} height={L * 1.9} rx={L * 0.22} fill={p.itemColor ?? "#8CC9E8"} opacity={0.95} />
            <rect x={-L * 0.3} y={-L * 0.2} width={L * 0.6} height={L * 0.5} fill="#FFFFFF" opacity={0.55} />
            <rect x={-L * 0.18} y={-L * 1.16} width={L * 0.36} height={L * 0.3} rx={L * 0.08} fill="#2F5D9E" />
          </g>
        );
      case "towel":
        // сложенное полотенце, свисает с кисти
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.75} y={-L * 0.25} width={L * 1.5} height={L * 1.7} rx={L * 0.18} fill={p.itemColor ?? "#F4D9A7"} />
            <rect x={-L * 0.75} y={L * 1.1} width={L * 1.5} height={L * 0.14} fill="#FFFFFF" opacity={0.5} />
            <rect x={-L * 0.75} y={-L * 0.25} width={L * 0.3} height={L * 1.7} rx={L * 0.12} fill="#000000" opacity={0.06} />
          </g>
        );
      case "card":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.9} y={-L * 1.25} width={L * 1.8} height={L * 2.3} rx={6} fill={p.itemColor ?? "#FFFFFF"} stroke="#D5DCE6" strokeWidth={2} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-L * 0.65} y={-L * 0.95 + k * L * 0.55} width={L * (k === 2 ? 0.8 : 1.3)} height={L * 0.16} rx={4} fill="#9AA6BC" />
            ))}
          </g>
        );
      case "cup":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <rect x={-L * 0.45} y={-L * 0.55} width={L * 0.9} height={L * 1.0} rx={8} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
            <path d={`M ${s * L * 0.45} ${-L * 0.35} q ${s * L * 0.35} 0 ${s * L * 0.3} ${L * 0.35} q 0 ${L * 0.25} ${-s * L * 0.3} ${L * 0.25}`} fill="none" stroke="#D5DCE6" strokeWidth={5} />
          </g>
        );
      default:
        return null;
    }
  })();

  const skinStroke = { stroke: p.shade, strokeWidth: 1.5 };
  // ладонь (за предметом)
  const palm = <rect x={-W / 2} y={-2} width={W} height={L * 0.66} rx={W * 0.42} fill={p.skin} {...skinStroke} />;
  // пальцы (перед предметом)
  const fingers = (() => {
    switch (p.shape) {
      case "open":
      case "wave":
        return (
          <g>
            {[-1.5, -0.5, 0.5, 1.5].map((k) => (
              <rect key={k} x={k * W * 0.22 - W * 0.1} y={L * 0.5} width={W * 0.2} height={L * (0.46 - Math.abs(k) * 0.05)} rx={W * 0.1} fill={p.skin} transform={`rotate(${k * 5} ${k * W * 0.22} ${L * 0.52})`} />
            ))}
            <rect x={s * W * 0.42 - W * 0.1} y={L * 0.18} width={W * 0.2} height={L * 0.38} rx={W * 0.1} fill={p.skin} transform={`rotate(${-s * 38} ${s * W * 0.4} ${L * 0.25})`} />
          </g>
        );
      case "soft":
        // мягкая танцевальная кисть: пальцы вытянуты и собраны
        return (
          <g>
            <path d={`M ${-W / 2} ${L * 0.45} Q ${-W * 0.45} ${L * 1.18} ${W * 0.05} ${L * 1.22} Q ${W * 0.5} ${L * 1.12} ${W / 2} ${L * 0.45} Z`} fill={p.skin} {...skinStroke} />
            <rect x={s * W * 0.4 - W * 0.1} y={L * 0.22} width={W * 0.2} height={L * 0.4} rx={W * 0.1} fill={p.skin} transform={`rotate(${-s * 22} ${s * W * 0.4} ${L * 0.28})`} />
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
      case "phone":
        // кончики пальцев на краю телефона и большой палец у экрана
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            {[-0.25, 0.05, 0.35].map((k) => (
              <ellipse key={k} cx={-s * L * 0.42 * (1 + 0.9 * p.flat)} cy={k * L * (1 - 0.6 * p.flat)} rx={L * 0.1} ry={L * 0.08} fill={p.skin} {...skinStroke} />
            ))}
            <ellipse cx={s * L * 0.34 * (1 + 0.6 * p.flat)} cy={L * 0.38 * (1 - 0.7 * p.flat)} rx={L * 0.12} ry={L * 0.2} fill={p.skin} {...skinStroke} transform={`rotate(${-s * 25} ${s * L * 0.34} ${L * 0.38})`} />
          </g>
        );
      default:
        // расслабленная кисть: пальцы слегка согнуты
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
      {p.item === "phone" ? <g transform={`translate(${grip.x} ${grip.y})`}>{fingers}</g> : fingers}
    </g>
  );
};
