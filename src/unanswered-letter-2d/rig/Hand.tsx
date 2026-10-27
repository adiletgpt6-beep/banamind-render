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
  readonly tap?: number;
  readonly part: "back" | "front";
};

const INK = "#1E2235";

// Чуть темнее цвета (карман рюкзака).
const shade = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * 0.82);
  return `#${((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1)}`;
};

// Телефон в руке: экраном к зрителю, почти вертикально (itemTilt), или
// плашмя (flat → 1) — как лежит на столе.
// caseColor — чехол (рабочий телефон отца и телефон сына различаются).
const PhoneShape: React.FC<{ w: number; h: number; flat: number; glow: number; caseColor?: string }> = ({ w, h, flat, glow, caseColor = INK }) => {
  const W = w * (1 + 0.95 * flat);
  const H = h * (1 - 0.68 * flat);
  const scr = glow > 0 ? `rgba(${Math.round(150 + 90 * glow)}, ${Math.round(190 + 50 * glow)}, ${Math.round(230 + 20 * glow)}, 1)` : "#2C3B5C";
  return (
    <g>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={Math.min(W, H) * 0.16} fill={caseColor} />
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
            <PhoneShape w={pw} h={ph} flat={p.flat} glow={p.glow} caseColor={p.itemColor} />
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
      case "handbag":
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
      case "pencilcase":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.95} y={-L * 0.35} width={L * 1.9} height={L * 0.7} rx={L * 0.3} fill="#E5677A" />
            <rect x={-L * 0.95} y={-L * 0.06} width={L * 1.9} height={L * 0.1} fill="#C24E62" />
          </g>
        );
      case "backpack": {
        // рюкзак висит на петле под кистью (вертикально в мире)
        const c = p.itemColor ?? "#3E9C6B";
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <path d={`M ${-L * 0.3} ${L * 0.15} Q 0 ${-L * 0.35} ${L * 0.3} ${L * 0.15}`} stroke="#14285A" strokeWidth={7} fill="none" />
            <rect x={-L * 1.25} y={L * 0.1} width={L * 2.5} height={L * 3.1} rx={L * 0.7} fill={c} />
            <rect x={-L * 0.85} y={L * 1.8} width={L * 1.7} height={L * 1.05} rx={L * 0.3} fill={shade(c)} />
            <rect x={-L * 0.5} y={L * 0.3} width={L * 1.0} height={L * 0.22} rx={L * 0.1} fill="#FFFFFF" opacity={0.25} />
          </g>
        );
      }
      case "plate":
        // тарелка с обедом: держится горизонтально (вид чуть сверху)
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(${-s * L * 0.15} ${-L * 0.1})`}>
            <ellipse cx={0} cy={L * 0.12} rx={L * 1.55} ry={L * 0.42} fill="#D5DCE6" />
            <ellipse cx={0} cy={0} rx={L * 1.55} ry={L * 0.42} fill="#FFFFFF" />
            <ellipse cx={0} cy={0} rx={L * 1.05} ry={L * 0.27} fill="#F1F3F6" />
            <ellipse cx={-L * 0.25} cy={-L * 0.04} rx={L * 0.62} ry={L * 0.18} fill="#E7C27A" />
            <ellipse cx={L * 0.45} cy={0} rx={L * 0.34} ry={L * 0.13} fill="#C9643E" />
            <circle cx={-L * 0.4} cy={-L * 0.1} r={L * 0.08} fill="#7FAF63" />
          </g>
        );
      case "spoon":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.06} y={-L * 0.2} width={L * 0.12} height={L * 1.0} rx={L * 0.06} fill="#C9CFD8" transform={`rotate(${s * 50})`} />
            <ellipse cx={s * L * 0.62} cy={-L * 0.55} rx={L * 0.2} ry={L * 0.13} fill="#DDE2EA" />
          </g>
        );
      case "pencil":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt - 24})`}>
            <rect x={-L * 0.065} y={-L * 1.25} width={L * 0.13} height={L * 1.6} rx={2} fill={p.itemColor ?? "#E5677A"} />
            <rect x={-L * 0.065} y={-L * 1.4} width={L * 0.13} height={L * 0.16} rx={2} fill="#F4C8D0" />
            <path d={`M ${-L * 0.065} ${L * 0.35} L 0 ${L * 0.7} L ${L * 0.065} ${L * 0.35} Z`} fill="#D8B88D" />
            <path d={`M ${-L * 0.023} ${L * 0.58} L 0 ${L * 0.7} L ${L * 0.023} ${L * 0.58} Z`} fill="#313B4E" />
          </g>
        );
      case "teapot":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <path d={`M ${-s * L * 0.2} ${-L * 0.1} Q ${-s * L * 0.2} ${-L * 0.55} ${-s * L * 0.7} ${-L * 0.4}`} stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" />
            <ellipse cx={-s * L * 0.9} cy={L * 0.45} rx={L * 0.95} ry={L * 0.75} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={3} />
            <path d={`M ${-s * L * 1.7} ${L * 0.45} Q ${-s * L * 0.9} ${L * 0.15} ${-s * L * 0.1} ${L * 0.45}`} stroke="#2F62A8" strokeWidth={6} fill="none" />
            <path d={`M ${-s * L * 1.8} ${L * 0.4} Q ${-s * L * 2.3} ${L * 0.2} ${-s * L * 2.35} ${-L * 0.1}`} stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" />
            <ellipse cx={-s * L * 0.9} cy={-L * 0.25} rx={L * 0.3} ry={L * 0.1} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
            <circle cx={-s * L * 0.9} cy={-L * 0.36} r={L * 0.1} fill="#2F62A8" />
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
      case "gymbag": {
        // спортивный мешок на шнурке (висит под кистью)
        const c = p.itemColor ?? "#3FA7A0";
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <path d={`M ${-L * 0.25} ${L * 0.1} L ${-L * 0.7} ${L * 0.9} M ${L * 0.25} ${L * 0.1} L ${L * 0.7} ${L * 0.9}`} stroke="#E9E6E0" strokeWidth={4} />
            <path d={`M ${-L * 0.85} ${L * 0.85} Q 0 ${L * 0.6} ${L * 0.85} ${L * 0.85} L ${L * 1.0} ${L * 2.6} Q 0 ${L * 2.9} ${-L * 1.0} ${L * 2.6} Z`} fill={c} />
            <path d={`M ${-L * 0.4} ${L * 1.7} L ${L * 0.4} ${L * 1.7}`} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
          </g>
        );
      }
      case "craft":
        // сложенная бумажная поделка: домик-оригами с окошком и солнцем
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(0 ${-L * 0.4})`}>
            <path d={`M ${-L * 1.1} ${-L * 0.1} L 0 ${-L * 1.1} L ${L * 1.1} ${-L * 0.1} Z`} fill="#E8806B" />
            <rect x={-L * 0.9} y={-L * 0.1} width={L * 1.8} height={L * 1.2} rx={4} fill="#FFD33D" />
            <rect x={-L * 0.3} y={L * 0.25} width={L * 0.6} height={L * 0.5} rx={3} fill="#4FD1C5" />
            <circle cx={L * 0.75} cy={-L * 0.95} r={L * 0.22} fill="#FFF3B0" />
          </g>
        );
      case "note":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(0 ${-L * 0.3})`}>
            <rect x={-L * 0.6} y={-L * 0.8} width={L * 1.2} height={L * 1.5} rx={3} fill="#FFFDF6" stroke="#D5DCE6" strokeWidth={2} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-L * 0.42} y={-L * 0.55 + k * L * 0.36} width={L * (k === 2 ? 0.5 : 0.84)} height={L * 0.1} rx={3} fill="#7C8BA3" />
            ))}
          </g>
        );
      case "laptopbag":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <path d={`M ${-L * 0.4} ${L * 0.5} Q 0 ${-L * 0.2} ${L * 0.4} ${L * 0.5}`} stroke="#1E2230" strokeWidth={7} fill="none" />
            <rect x={-L * 1.5} y={L * 0.45} width={L * 3.0} height={L * 2.1} rx={L * 0.25} fill="#2B3142" />
            <rect x={-L * 1.5} y={L * 0.45} width={L * 3.0} height={L * 0.36} rx={L * 0.2} fill="#363D52" />
            <rect x={-L * 0.4} y={L * 1.2} width={L * 0.8} height={L * 0.14} rx={4} fill="#FFD33D" opacity={0.8} />
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
      case "point":
        return (
          <g>
            <rect x={-W / 2} y={L * 0.4} width={W} height={L * 0.36} rx={W * 0.35} fill={p.skin} {...skinStroke} />
            <rect x={s * W * 0.2 - W * 0.1} y={L * 0.6} width={W * 0.2} height={L * 0.55} rx={W * 0.1} fill={p.skin} {...skinStroke} />
          </g>
        );
      case "type": {
        // Кисть над клавиатурой: запястье неподвижно, четыре согнутых
        // пальца смотрят вниз; нажимающий палец опускается на клавишу.
        return (
          <g>
            <path d={`M ${-W / 2} ${L * 0.42} Q ${-W * 0.5} ${L * 0.62} ${0} ${L * 0.64} Q ${W * 0.5} ${L * 0.62} ${W / 2} ${L * 0.42} Z`} fill={p.skin} {...skinStroke} />
            {[-1.5, -0.5, 0.5, 1.5].map((k, i) => {
              const down = p.tap === i ? L * 0.16 : 0;
              return <rect key={k} x={k * W * 0.23 - W * 0.09} y={L * 0.55} width={W * 0.18} height={L * 0.26 + down} rx={W * 0.09} fill={p.skin} {...skinStroke} />;
            })}
            <rect x={s * W * 0.42 - W * 0.1} y={L * 0.22} width={W * 0.2} height={L * 0.32} rx={W * 0.1} fill={p.skin} transform={`rotate(${-s * 28} ${s * W * 0.4} ${L * 0.25})`} />
          </g>
        );
      }
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
