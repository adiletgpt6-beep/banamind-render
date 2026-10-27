// Ноутбук на обеденном столе (вид ¾): основание лежит на столешнице, экран
// повернут вправо — к маме у торца стола — и к камере, поэтому зритель видит
// экран под углом. Содержимое экрана — любой React-узел в своём размере
// (designW × designH), натянутый на четырёхугольник экрана проективным
// преобразованием (matrix3d). Тем же преобразованием сцена может «посадить»
// полноэкранную карточку точно в экран (монтаж по форме).
import { box } from "../kit";

export type Pt = { readonly x: number; readonly y: number };
export type Quad = readonly [Pt, Pt, Pt, Pt]; // TL, TR, BR, BL

// CSS matrix3d, переводящий прямоугольник 0..w × 0..h в четырёхугольник q
// (transform-origin: 0 0).
export const quadMatrix3d = (w: number, h: number, q: Quad): string => {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const dy3 = p0.y - p1.y + p2.y - p3.y;
  let a: number, b: number, c: number, d: number, e: number, f: number, g: number, hh: number;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    a = p1.x - p0.x;
    b = p3.x - p0.x;
    c = p0.x;
    d = p1.y - p0.y;
    e = p3.y - p0.y;
    f = p0.y;
    g = 0;
    hh = 0;
  } else {
    const det = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / det;
    hh = (dx1 * dy3 - dx3 * dy1) / det;
    a = p1.x - p0.x + g * p1.x;
    b = p3.x - p0.x + hh * p3.x;
    c = p0.x;
    d = p1.y - p0.y + g * p1.y;
    e = p3.y - p0.y + hh * p3.y;
    f = p0.y;
  }
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => Number(v.toFixed(8))).join(",")})`;
};

export const lerpQuad = (a: Quad, b: Quad, t: number): Quad =>
  a.map((p, i) => ({ x: p.x + (b[i].x - p.x) * t, y: p.y + (b[i].y - p.y) * t })) as unknown as Quad;

// Экран ноутбука (мировые px) для ноутбука с серединой основания (x, y).
// Экран 16:10, лёгкая перспектива: ближний (правый) край чуть выше.
export const laptopScreenQuad = (x: number, y: number, open = 1): Quad => {
  const lift = 150 * open;
  return [
    { x: x - 78, y: y - 10 - lift },
    { x: x + 66, y: y - 2 - lift - 10 },
    { x: x + 66, y: y - 12 },
    { x: x - 78, y: y - 8 },
  ];
};

export const LAPTOP_DESIGN = { w: 1600, h: 1000 } as const;

// Содержимое экрана в произвольном четырёхугольнике (мировые px).
export const ScreenIn: React.FC<{ readonly quad: Quad; readonly w?: number; readonly h?: number; readonly children: React.ReactNode; readonly opacity?: number }> = ({
  quad,
  w = LAPTOP_DESIGN.w,
  h = LAPTOP_DESIGN.h,
  children,
  opacity = 1,
}) => (
  <div style={box({ left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: quadMatrix3d(w, h, quad), overflow: "hidden", opacity })}>{children}</div>
);

export const Laptop: React.FC<{
  readonly x: number;
  readonly y: number; // столешница (низ основания)
  readonly open?: number;
  readonly glow?: number;
  readonly screen?: React.ReactNode; // в размере LAPTOP_DESIGN
}> = ({ x, y, open = 1, glow = 1, screen }) => {
  const q = laptopScreenQuad(x, y, open);
  const pts = (qq: Quad) => qq.map((p) => `${p.x},${p.y}`).join(" ");
  // рамка экрана чуть больше самого экрана
  const frame: Quad = [
    { x: q[0].x - 7, y: q[0].y - 7 },
    { x: q[1].x + 7, y: q[1].y - 7 },
    { x: q[2].x + 7, y: q[2].y + 4 },
    { x: q[3].x - 7, y: q[3].y + 4 },
  ];
  return (
    <>
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        {/* тень и основание (клавиатура к маме — вправо) */}
        <ellipse cx={x + 10} cy={y + 2} rx={120} ry={9} fill="rgba(30,30,40,0.14)" />
        <polygon points={`${x - 92},${y - 4} ${x + 70},${y - 12} ${x + 122},${y + 2} ${x - 52},${y + 6}`} fill="#C9CED8" />
        <polygon points={`${x - 92},${y - 4} ${x - 52},${y + 6} ${x - 52},${y + 10} ${x - 92},${y}`} fill="#A9AFBC" />
        <polygon points={`${x - 52},${y + 6} ${x + 122},${y + 2} ${x + 122},${y + 6} ${x - 52},${y + 10}`} fill="#B4BAC6" />
        <polygon points={`${x - 66},${y - 3} ${x + 66},${y - 9} ${x + 98},${y} ${x - 40},${y + 4}`} fill="#AEB4C0" opacity={0.6} />
        {/* крышка с экраном */}
        <polygon points={pts(frame)} fill="#2B3142" />
        <polygon points={pts(q)} fill={glow > 0 ? "#F4F7FB" : "#3A4258"} />
      </svg>
      {screen && glow > 0 ? <ScreenIn quad={q}>{screen}</ScreenIn> : null}
      {glow > 0 ? (
        <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", pointerEvents: "none" })}>
          {/* мягкий свет экрана на маму и стол */}
          <polygon points={`${q[1].x},${q[1].y} ${q[2].x},${q[2].y} ${x + 260},${y + 4} ${x + 260},${y - 220}`} fill={`rgba(200,220,250,${0.1 * glow * open})`} />
          <polygon points={pts(q)} fill="url(#el34-glare)" opacity={0.5} />
          <defs>
            <linearGradient id="el34-glare" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="0.45" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
        </svg>
      ) : null}
    </>
  );
};
