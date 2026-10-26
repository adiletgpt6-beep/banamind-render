// Кисть, вид сверху-сбоку: (0, 0) — запястье, +y — вдоль кисти к пальцам,
// side зеркалит большой палец. Формы: rest (лежит), relax, open (ладонь
// плоско, пальцы вместе — прижать сгиб), press (два пальца проводят по
// линии), pinch (большой и указательный держат край), grip (пальцы
// обхватывают предмет), point (указывает). Части: back — ладонь и большой
// палец (под предметом), front — пальцы (над предметом).
import type { HandShape } from "./pose";

type HandProps = {
  readonly x: number;
  readonly y: number;
  readonly angle: number; // градусы: направление кисти (0 — вниз)
  readonly side: -1 | 1;
  readonly len: number;
  readonly skin: string;
  readonly shade: string;
  readonly shape: HandShape;
  readonly spread: number;
  readonly part: "back" | "front";
};

export const Hand: React.FC<HandProps> = (p) => {
  const L = p.len;
  const W = L * 0.64;
  const s = p.side;
  const line = { stroke: p.shade, strokeWidth: 1.4 };
  const finger = (k: number, len: number, ang: number, w = W * 0.21) => (
    <rect key={k} x={k * W * 0.23 - w / 2} y={L * 0.5} width={w} height={len} rx={w / 2} fill={p.skin} {...line} transform={`rotate(${ang} ${k * W * 0.23} ${L * 0.52})`} />
  );
  const thumbOut = (ang: number, len = L * 0.44) => (
    <rect x={s * W * 0.44 - W * 0.11} y={L * 0.12} width={W * 0.22} height={len} rx={W * 0.11} fill={p.skin} {...line} transform={`rotate(${-s * ang} ${s * W * 0.44} ${L * 0.18})`} />
  );
  const palm = <rect x={-W / 2} y={-2} width={W} height={L * 0.68} rx={W * 0.4} fill={p.skin} {...line} />;
  let back: React.ReactNode = palm;
  let front: React.ReactNode = null;
  switch (p.shape) {
    case "open": {
      const sp = 3 + 7 * p.spread;
      front = (
        <g>
          {[-1.5, -0.5, 0.5, 1.5].map((k) => finger(k, L * (0.5 - Math.abs(k) * 0.06), k * sp))}
          {thumbOut(42)}
        </g>
      );
      break;
    }
    case "press":
      // указательный и средний вытянуты вперёд, остальные подогнуты
      front = (
        <g>
          {finger(-1.5, L * 0.24, -4)}
          {finger(-0.5, L * 0.54, -2)}
          {finger(0.5, L * 0.52, 2)}
          {finger(1.5, L * 0.22, 6)}
          {thumbOut(30, L * 0.36)}
        </g>
      );
      break;
    case "pinch":
      // большой палец под краем (back), указательный сверху встречает его
      back = (
        <g>
          {palm}
          <rect x={s * W * 0.3 - W * 0.11} y={L * 0.3} width={W * 0.22} height={L * 0.5} rx={W * 0.11} fill={p.skin} {...line} transform={`rotate(${-s * 18} ${s * W * 0.3} ${L * 0.35})`} />
        </g>
      );
      front = (
        <g>
          {finger(s * 1.2, L * 0.56, -s * 10)}
          {finger(s * 0.3, L * 0.3, -s * 4)}
          {finger(-s * 0.6, L * 0.26, s * 2)}
          {finger(-s * 1.5, L * 0.22, s * 6)}
          {/* кончик большого пальца виден у края */}
          <ellipse cx={s * W * 0.52} cy={L * 1.02} rx={W * 0.12} ry={W * 0.13} fill={p.skin} {...line} />
        </g>
      );
      break;
    case "grip":
      back = (
        <g>
          {palm}
          {thumbOut(58, L * 0.4)}
        </g>
      );
      front = (
        <g>
          {[-1.5, -0.5, 0.5, 1.5].map((k) => (
            <path key={k} d={`M ${k * W * 0.23 - W * 0.1} ${L * 0.5} Q ${k * W * 0.23 - W * 0.1} ${L * 0.95} ${k * W * 0.23 + W * 0.06} ${L * 0.9} L ${k * W * 0.23 + W * 0.1} ${L * 0.5} Z`} fill={p.skin} {...line} />
          ))}
        </g>
      );
      break;
    case "point":
      front = (
        <g>
          <rect x={-W / 2} y={L * 0.4} width={W} height={L * 0.36} rx={W * 0.35} fill={p.skin} {...line} />
          <rect x={s * W * 0.2 - W * 0.1} y={L * 0.6} width={W * 0.2} height={L * 0.55} rx={W * 0.1} fill={p.skin} {...line} />
          {thumbOut(36, L * 0.34)}
        </g>
      );
      break;
    case "rest":
      front = (
        <g>
          <path d={`M ${-W / 2} ${L * 0.45} Q ${-W * 0.55} ${L * 0.9} ${0} ${L * 0.93} Q ${W * 0.55} ${L * 0.9} ${W / 2} ${L * 0.45} Z`} fill={p.skin} {...line} />
          {[-0.9, 0, 0.9].map((k) => (
            <line key={k} x1={k * W * 0.26} y1={L * 0.66} x2={k * W * 0.26} y2={L * 0.86} stroke={p.shade} strokeWidth={1.2} strokeLinecap="round" />
          ))}
          {thumbOut(24, L * 0.36)}
        </g>
      );
      break;
    default:
      front = (
        <g>
          <path d={`M ${-W / 2} ${L * 0.45} Q ${-W * 0.55} ${L * 0.95} ${0} ${L * 0.98} Q ${W * 0.55} ${L * 0.95} ${W / 2} ${L * 0.45} Z`} fill={p.skin} {...line} />
          {thumbOut(26, L * 0.38)}
        </g>
      );
  }
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
      {p.part === "back" ? back : front}
    </g>
  );
};
