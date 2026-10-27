// Кисти персонажей «в кадре» (не крупный план): ладонь + читаемые пальцы.
// Локальная система: запястье в (0,0), кисть вытянута вдоль +x (по
// направлению предплечья), большой палец со стороны −y (thumb = +1) или
// +y (thumb = −1). Рисуется в два прохода: контур всех частей, потом
// заливка — пальцы не «рассыпаются» швами.
import { INK, type Pt } from "./core";

export type HandShape = "relaxed" | "open" | "point" | "grip" | "flat" | "pencil" | "hold";

type Cap = { readonly a: Pt; readonly b: Pt; readonly r: number };
type El = { readonly c: Pt; readonly rx: number; readonly ry: number; readonly rot?: number };

const C = (ax: number, ay: number, bx: number, by: number, r: number): Cap => ({ a: { x: ax, y: ay }, b: { x: bx, y: by }, r });

// Части кисти (без учёта зеркала) для каждой формы.
const parts = (shape: HandShape): { caps: Cap[]; els: El[]; creases: string[] } => {
  switch (shape) {
    case "open":
      return {
        els: [{ c: { x: 11, y: 0 }, rx: 12.5, ry: 11.5 }],
        caps: [
          C(19, -8, 34, -15, 3.3),
          C(21, -3, 38, -5, 3.4),
          C(21, 3, 37, 5, 3.3),
          C(19, 8, 32, 13, 3.0),
          C(7, -9, 15, -22, 3.6),
        ],
        creases: [],
      };
    case "point":
      return {
        els: [{ c: { x: 11, y: 1 }, rx: 12, ry: 10.5 }],
        caps: [C(17, -6, 37, -7, 3.4), C(21, -1, 24, 1, 4.2), C(20, 4.5, 23, 5.5, 4.0), C(18, 9, 20, 9.5, 3.6), C(6, -8, 18, -9, 3.6)],
        creases: [],
      };
    case "grip":
      return {
        els: [{ c: { x: 10, y: 1 }, rx: 12, ry: 11 }],
        caps: [C(19, -6.5, 22, -6.5, 4.2), C(20, -1.5, 23, -1, 4.3), C(20, 3.8, 23, 4.2, 4.1), C(18, 8.8, 20.5, 9, 3.6), C(6, -9, 19, -10.5, 3.7)],
        creases: [],
      };
    case "hold":
      return {
        els: [{ c: { x: 10, y: 1 }, rx: 12, ry: 11 }],
        caps: [C(19, -6, 24, -8, 3.6), C(20, -1, 25, -1.5, 3.7), C(20, 4, 25, 4.5, 3.6), C(18, 9, 22, 10, 3.3), C(6, -8, 20, -15, 3.7)],
        creases: [],
      };
    case "pencil":
      return {
        els: [{ c: { x: 10, y: 1 }, rx: 11.5, ry: 10.5 }],
        caps: [C(17, -5, 26, -2, 3.4), C(19, 0, 22, 2, 4.1), C(18, 5, 21, 6, 3.9), C(16, 9.5, 19, 9.8, 3.4), C(6, -8, 21, -6, 3.6)],
        creases: [],
      };
    case "flat":
      return {
        els: [{ c: { x: 11, y: 0 }, rx: 12.5, ry: 10.5 }],
        caps: [C(20, -6.5, 35, -7, 3.2), C(21, -2, 37, -2, 3.3), C(21, 2.5, 36, 3, 3.2), C(20, 7, 32, 8, 3.0), C(6, -8, 17, -14, 3.5)],
        creases: [],
      };
    case "relaxed":
    default:
      return {
        els: [{ c: { x: 11, y: 0.5 }, rx: 12, ry: 10.5 }],
        caps: [C(19, -5.5, 31, -4.5, 3.3), C(20, -0.5, 33, 1.5, 3.4), C(19, 4.5, 31, 6.5, 3.3), C(17, 8.5, 27, 10, 3.0), C(6, -8, 16, -12.5, 3.5)],
        creases: [],
      };
  }
};

const cap = (c: Cap, extra: number) => {
  const dx = c.b.x - c.a.x;
  const dy = c.b.y - c.a.y;
  return { x1: c.a.x, y1: c.a.y, x2: c.a.x + dx, y2: c.a.y + dy, w: (c.r + extra) * 2 };
};

// Кисть в точке w, направление dir (градусы), размер k, сторона большого пальца.
export const MiniHand: React.FC<{
  readonly w: Pt;
  readonly dir: number;
  readonly k: number;
  readonly shape: HandShape;
  readonly thumb?: 1 | -1;
  readonly skin: string;
  readonly shade: string;
  readonly ow?: number;
}> = ({ w, dir, k, shape, thumb = 1, skin, shade, ow = 3 }) => {
  const { caps, els } = parts(shape);
  const o = ow / k;
  const thumbCap = caps[caps.length - 1];
  const fingers = caps.slice(0, -1);
  return (
    <g transform={`translate(${w.x} ${w.y}) rotate(${dir}) scale(${k} ${k * thumb})`}>
      {shape === "pencil" ? (
        <g>
          <line x1={-6} y1={-26} x2={26} y2={22} stroke={INK} strokeWidth={7 + o * 2} strokeLinecap="round" />
          <line x1={-6} y1={-26} x2={22} y2={16} stroke="#FFC90E" strokeWidth={7} strokeLinecap="round" />
          <line x1={-6} y1={-26} x2={-3} y2={-21.5} stroke="#F2A5A0" strokeWidth={7} strokeLinecap="round" />
          <line x1={22} y1={16} x2={26} y2={22} stroke="#5A4A3A" strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : null}
      {/* контур */}
      {els.map((e, i) => (
        <ellipse key={`eo${i}`} cx={e.c.x} cy={e.c.y} rx={e.rx + o} ry={e.ry + o} fill={INK} />
      ))}
      {fingers.map((c, i) => {
        const l = cap(c, o);
        return <line key={`co${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={INK} strokeWidth={l.w} strokeLinecap="round" />;
      })}
      {/* заливка ладони и пальцев */}
      {els.map((e, i) => (
        <ellipse key={`ef${i}`} cx={e.c.x} cy={e.c.y} rx={e.rx} ry={e.ry} fill={skin} />
      ))}
      {fingers.map((c, i) => {
        const l = cap(c, 0);
        return <line key={`cf${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={i % 2 === 1 ? skin : skin} strokeWidth={l.w} strokeLinecap="round" />;
      })}
      {/* разделение пальцев тонкими линиями тени */}
      {fingers.slice(0, -1).map((c, i) => {
        const n = fingers[i + 1];
        const mx1 = (c.a.x + n.a.x) / 2 + 1;
        const my1 = (c.a.y + n.a.y) / 2;
        const mx2 = (c.b.x + n.b.x) / 2;
        const my2 = (c.b.y + n.b.y) / 2;
        const mid = (shape === "grip" || shape === "pencil" || shape === "point") && i > (shape === "point" ? 0 : -1);
        return mid ? (
          <line key={`s${i}`} x1={mx1 - 2} y1={my1} x2={mx2 + 2} y2={my2} stroke={shade} strokeWidth={1.6} strokeLinecap="round" />
        ) : (
          <line key={`s${i}`} x1={mx1 + 2} y1={my1} x2={mx2 - 1} y2={my2} stroke={shade} strokeWidth={1.4} strokeLinecap="round" />
        );
      })}
      {/* большой палец поверх */}
      {(() => {
        const lo = cap(thumbCap, o);
        const lf = cap(thumbCap, 0);
        return (
          <>
            <line x1={lo.x1} y1={lo.y1} x2={lo.x2} y2={lo.y2} stroke={INK} strokeWidth={lo.w} strokeLinecap="round" />
            <line x1={lf.x1} y1={lf.y1} x2={lf.x2} y2={lf.y2} stroke={skin} strokeWidth={lf.w} strokeLinecap="round" />
          </>
        );
      })()}
      {/* мягкая тень у основания ладони */}
      <path d="M 2 6 Q 9 11 17 9" stroke={shade} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  );
};
