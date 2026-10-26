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
  // Стиль 2 (looks.ts, rigStyle): кисть с ладонью, большим пальцем и группой
  // пальцев; thumb — сторона большого пальца −1…1 (по +x системы кисти),
  // плавно проходит через 0 (палец к зрителю) при повороте кисти.
  readonly style?: 2;
  readonly thumb?: number;
};

export const Hand: React.FC<HandProps> = (p) => (p.style === 2 ? <Hand2 {...p} /> : <Hand1 {...p} />);

const Hand1: React.FC<HandProps> = (p) => {
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
      case "palmUp":
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
      case "grip":
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

// ---------- кисть стиля 2 ----------
// Доли длины кисти L (от запястья до кончиков пальцев): ширина у запястья,
// ширина по костяшкам, длина ладони; толщина кисти в профиль (ладонь вверх).
export const HAND2 = { wrist: 0.4, knuckles: 0.52, palm: 0.5, side: 0.3 } as const;

// Точка захвата в системе кисти (запястье — 0, +y к пальцам, T — сторона
// большого пальца): где предмет — щепоть, край под пальцами, середина ладони.
export const hand2Grip = (shape: HandShape, L: number, T: number): { x: number; y: number } => {
  const pl = L * HAND2.palm;
  const pw1 = L * HAND2.knuckles;
  switch (shape) {
    case "pinch":
      return { x: T * pw1 * 0.46, y: L * 0.84 };
    case "grip":
      return { x: 0, y: pl + L * 0.16 };
    case "palmUp":
      return { x: T * L * HAND2.side * 0.5, y: L * 0.44 };
    case "fist":
      return { x: 0, y: pl + L * 0.05 };
    case "point":
      return { x: T * pw1 * 0.38, y: pl + L * 0.46 };
    case "open":
      return { x: 0, y: pl * 0.62 };
    default:
      return { x: 0, y: pl + L * 0.1 };
  }
};
// Силуэт: сначала контур всех частей цветом тени (чуть шире), затем заливка
// кожей — части сливаются в одну кисть без внутренних швов; швы между
// пальцами и складки — отдельными тонкими линиями.
type Part = { readonly d: string; readonly w?: number };

const Skin: React.FC<{ parts: readonly Part[]; skin: string; shade: string; ow: number }> = ({ parts, skin, shade, ow }) => (
  <>
    {parts.map((q, i) => (q.w ? <path key={`o${i}`} d={q.d} stroke={shade} strokeWidth={q.w + ow * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : <path key={`o${i}`} d={q.d} fill={shade} stroke={shade} strokeWidth={ow * 2} strokeLinejoin="round" />))}
    {parts.map((q, i) => (q.w ? <path key={`f${i}`} d={q.d} stroke={skin} strokeWidth={q.w} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : <path key={`f${i}`} d={q.d} fill={skin} />))}
  </>
);

const seg = (x1: number, y1: number, x2: number, y2: number) => `M ${x1} ${y1} L ${x2} ${y2}`;
const curve = (x1: number, y1: number, cx: number, cy: number, x2: number, y2: number) => `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

const Hand2: React.FC<HandProps> = (p) => {
  const L = p.len;
  const T = Math.max(-1, Math.min(1, p.thumb ?? p.side));
  const H = HAND2;
  const pw0 = L * H.wrist;
  const pw1 = L * H.knuckles;
  const pl = L * H.palm;
  const fw = (pw1 / 4) * 1.04; // толщина пальца
  const ow = Math.max(1.1, L * 0.022);
  const slot = (j: number) => (j - 1.5) * (pw1 / 4) * 0.98; // x пальца: 0 — мизинец … 3 — указательный при T = 1
  // длина пальца в слоте: указательный со стороны большого пальца (плавно по T)
  const base = [0.33, 0.4, 0.44, 0.41];
  const u = (T + 1) / 2;
  const flen = (j: number) => L * (base[3 - j] + (base[j] - base[3 - j]) * u);
  const sx = (j: number) => slot(j);
  // большой палец: основание у запястья на стороне T
  const tb = { x: T * pw0 * 0.42, y: L * 0.14 };
  const tw = L * 0.15;
  const palm = `M ${-pw0 / 2} ${-L * 0.05} Q ${-pw1 * 0.54} ${pl * 0.45} ${-pw1 / 2} ${pl} Q 0 ${pl + L * 0.06} ${pw1 / 2} ${pl} Q ${pw1 * 0.54} ${pl * 0.45} ${pw0 / 2} ${-L * 0.05} Q 0 ${-L * 0.1} ${-pw0 / 2} ${-L * 0.05} Z`;
  const g = hand2Grip(p.shape, L, T);
  const back: Part[] = [{ d: palm }];
  const front: Part[] = [];
  const lines: React.ReactNode[] = [];
  const crease = (d: string, k: string, op = 0.8) => lines.push(<path key={k} d={d} stroke={p.shade} strokeWidth={Math.max(1, L * 0.022)} strokeLinecap="round" fill="none" opacity={op} />);
  // согнутые пальцы (кулак): полоса фаланг поверх ладони с бугорками костяшек
  const curled = (from: number, to: number, y0: number, depth: number, into: Part[]) => {
    for (let j = from; j <= to; j++) into.push({ d: seg(sx(j), y0, sx(j) * 0.96, y0 + depth), w: fw });
  };
  switch (p.shape) {
    case "open": {
      // пальцы веером, большой палец отведён
      for (let j = 0; j < 4; j++) {
        const a = ((j - 1.5) * 7 * Math.PI) / 180;
        const x0 = sx(j);
        const y0 = pl - L * 0.04;
        const fl = flen(j);
        front.push({ d: seg(x0, y0, x0 + Math.sin(a) * fl, y0 + Math.cos(a) * fl), w: fw * 0.94 });
      }
      const ta = (T * 48 * Math.PI) / 180;
      front.push({ d: curve(tb.x, tb.y, tb.x + Math.sin(ta) * L * 0.2, tb.y + Math.cos(ta) * L * 0.2, tb.x + Math.sin(ta) * L * 0.36, tb.y + Math.cos(ta) * L * 0.4), w: tw });
      crease(curve(-pw1 * 0.3, pl * 0.52, 0, pl * 0.75, pw1 * 0.32, pl * 0.5), "c1", 0.45);
      break;
    }
    case "palmUp": {
      // ладонь вверх, вид сбоку: кисть плоская, кончики пальцев чуть
      // загнуты вверх; большой палец поднят у края (перед предметом)
      back.length = 0;
      const th = L * HAND2.side; // толщина кисти в профиль
      back.push({ d: `M ${-th * 0.55} ${-L * 0.05} Q ${-th * 0.62} ${pl * 0.6} ${-th * 0.42} ${L * 0.92} Q ${-th * 0.05} ${L * 1.02} ${th * 0.32} ${L * 0.86} Q ${th * 0.55} ${pl * 0.6} ${th * 0.5} ${-L * 0.05} Z` });
      // большой палец на стороне T (вверху, когда кисть ровно ладонью вверх)
      front.push({ d: curve(T * th * 0.45, L * 0.12, T * th * 0.95, L * 0.24, T * th * 0.85, L * 0.42), w: tw * 0.95 });
      crease(curve(-T * th * 0.05, pl * 0.95, -T * th * 0.12, L * 0.72, -T * th * 0.02, L * 0.9), "c1", 0.45);
      break;
    }
    case "fist": {
      curled(0, 3, pl - L * 0.08, L * 0.2, front);
      for (let j = 0; j < 3; j++) crease(seg((sx(j) + sx(j + 1)) / 2, pl - L * 0.02, (sx(j) + sx(j + 1)) / 2, pl + L * 0.1), `k${j}`, 0.6);
      // большой палец поперёк согнутых пальцев
      front.push({ d: curve(tb.x, tb.y, T * pw1 * 0.42, pl + L * 0.1, -T * pw1 * 0.05, pl + L * 0.12), w: tw * 0.95 });
      break;
    }
    case "point": {
      curled(0, 2, pl - L * 0.08, L * 0.18, front);
      const ix = sx(3) * T;
      front.push({ d: seg(ix, pl - L * 0.06, ix * 1.05, pl + L * 0.46), w: fw * 0.98 });
      front.push({ d: curve(tb.x, tb.y, T * pw1 * 0.4, pl + L * 0.04, -T * pw1 * 0.02, pl + L * 0.1), w: tw * 0.92 });
      break;
    }
    case "pinch": {
      // щепоть: подушечки большого и указательного сходятся в точке g на
      // стороне большого пальца; средний, безымянный и мизинец поджаты
      const step = (pw1 / 4) * 0.98;
      for (let j = 0; j < 3; j++) {
        const x = (j - 1) * step - T * step * 0.6;
        back.push({ d: curve(x, pl - L * 0.06, x * 1.02, pl + L * 0.1, x * 0.9, pl + L * 0.15), w: fw });
      }
      for (let j = 0; j < 2; j++) crease(seg((j - 0.5) * step - T * step * 0.6, pl + L * 0.02, (j - 0.5) * step * 0.95 - T * step * 0.6, pl + L * 0.13), `k${j}`, 0.55);
      const ik = { x: T * step * 1.45, y: pl - L * 0.05 };
      back.push({ d: curve(ik.x, ik.y, ik.x + T * L * 0.05, (ik.y + g.y) / 2 + L * 0.04, g.x - T * L * 0.02, g.y + L * 0.03), w: fw * 0.95 });
      // большой палец — по внешнему краю кисти к кончику указательного
      front.push({ d: curve(tb.x, tb.y, T * pw1 * 0.78, (tb.y + g.y) * 0.48, g.x + T * L * 0.05, g.y - L * 0.02), w: tw * 0.95 });
      break;
    }
    case "grip": {
      // обхват края: ладонь и основания пальцев за предметом, согнутые
      // концы пальцев — перед ним (край проходит через точку g)
      for (let j = 0; j < 4; j++) back.push({ d: seg(sx(j), pl - L * 0.06, sx(j) * 0.98, g.y + L * 0.02), w: fw });
      for (let j = 0; j < 4; j++) front.push({ d: curve(sx(j) * 0.98, g.y - L * 0.03, sx(j) * 0.96, g.y + L * 0.13, sx(j) * 0.9, g.y + L * 0.07), w: fw * 0.92 });
      for (let j = 0; j < 3; j++) crease(seg((sx(j) + sx(j + 1)) / 2, g.y - L * 0.01, (sx(j) + sx(j + 1)) / 2, g.y + L * 0.1), `k${j}`, 0.55);
      // большой палец — по другой стороне края (за предметом)
      back.push({ d: curve(tb.x, tb.y, T * pw1 * 0.58, g.y - L * 0.22, T * pw1 * 0.4, g.y - L * 0.02), w: tw });
      break;
    }
    default: {
      // спокойная кисть: пальцы вместе, чуть согнуты; большой палец вдоль
      for (let j = 0; j < 4; j++) front.push({ d: curve(sx(j), pl - L * 0.05, sx(j) * 0.98, pl + flen(j) * 0.55, sx(j) * 0.84 - L * 0.01, pl + flen(j) * 0.86), w: fw });
      for (let j = 0; j < 3; j++) crease(seg((sx(j) + sx(j + 1)) / 2 * 0.92, pl + L * 0.16, (sx(j) + sx(j + 1)) / 2 * 0.86, pl + L * 0.34), `k${j}`, 0.5);
      back.push({ d: curve(tb.x, tb.y, T * pw1 * 0.6, L * 0.34, T * pw1 * 0.46, L * 0.52), w: tw });
      break;
    }
  }
  const itemEl = (() => {
    switch (p.item) {
      case "paper":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <PaperCraft w={L * 1.6} fold={p.fold} />
          </g>
        );
      case "book":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.56} y={-L * 0.7} width={L * 1.12} height={L * 1.4} rx={4} fill={p.itemColor ?? "#2F6B4F"} />
            <rect x={-L * 0.49} y={-L * 0.63} width={L * 0.98} height={L * 1.26} rx={3} fill="#FFFFFF" opacity={0.12} />
          </g>
        );
      default:
        return null;
    }
  })();
  if (p.part === "back") {
    return (
      <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
        <Skin parts={back} skin={p.skin} shade={p.shade} ow={ow} />
        <g transform={`translate(${g.x} ${g.y})`}>{itemEl}</g>
      </g>
    );
  }
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
      <Skin parts={front} skin={p.skin} shade={p.shade} ow={ow} />
      {lines}
    </g>
  );
};
