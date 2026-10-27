// Городской набор BG-030: узнаваемый, но не адресный Бишкек — хребет
// Ала-Тоо со снегом на горизонте, панельные дома с балконами, высокие
// тополя, арык вдоль тротуара, троллейбусные провода, типовая школа с
// оградой. Без названий улиц, районов и конкретных зданий.
import { fontFamily } from "../../../fonts";
import { hash01 } from "../anim";
import { C } from "../palette";

// ---------- небо и горы ----------
export const Sky: React.FC<{ readonly id: string; readonly top?: string; readonly bottom?: string; readonly x?: number; readonly y?: number; readonly w?: number; readonly h?: number }> = ({
  id,
  top = C.skyTop,
  bottom = C.skyBottom,
  x = 0,
  y = 0,
  w = 1080,
  h = 1920,
}) => (
  <>
    <defs>
      <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={x} y={y} width={w} height={h} fill={`url(#sky-${id})`} />
  </>
);

// Хребет: вершины по детерминированному «шуму», снег на высоких пиках.
export const Mountains: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly seed?: number; readonly color?: string; readonly snow?: boolean }> = ({
  x,
  y,
  w,
  h,
  seed = 3,
  color = C.mountain,
  snow = true,
}) => {
  const n = Math.max(6, Math.round(w / 170));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n * 2; i++) {
    const px = x + (i / (n * 2)) * w;
    const peak = i % 2 === 1;
    const r = hash01(seed * 31 + i * 7.7);
    const py = peak ? y + h * (0.05 + 0.4 * r) : y + h * (0.45 + 0.3 * r);
    pts.push([px, py]);
  }
  const body = `M${x} ${y + h} ` + pts.map(([a, b]) => `L${a.toFixed(1)} ${b.toFixed(1)}`).join(" ") + ` L${x + w} ${y + h} Z`;
  const caps: string[] = [];
  if (snow) {
    for (let i = 1; i < pts.length - 1; i += 2) {
      const [px, py] = pts[i];
      if (py > y + h * 0.32) continue;
      const [lx, ly] = pts[i - 1];
      const [rx, ry] = pts[i + 1];
      const d = 0.34;
      const l = [px + (lx - px) * d, py + (ly - py) * d];
      const rr = [px + (rx - px) * d, py + (ry - py) * d];
      const m1 = [px + (l[0] - px) * 0.5 + 8, l[1] - 10];
      const m2 = [px + (rr[0] - px) * 0.5 - 6, rr[1] - 4];
      caps.push(`M${px} ${py} L${rr[0]} ${rr[1]} L${m2[0]} ${m2[1]} L${px} ${py + 26} L${m1[0]} ${m1[1]} L${l[0]} ${l[1]} Z`);
    }
  }
  return (
    <g>
      <path d={body} fill={color} />
      {caps.map((c, i) => (
        <path key={i} d={c} fill={C.snow} opacity={0.95} />
      ))}
    </g>
  );
};

// ---------- окна ----------
export type WinProps = {
  readonly x: number; // левый верх
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly lit?: number; // 0…1 тёплый свет внутри
  readonly curtains?: boolean;
  readonly frame?: string;
};

export const Win: React.FC<WinProps & { readonly children?: React.ReactNode; readonly clipId?: string }> = ({ x, y, w, h, lit = 0, curtains, frame = C.frame, children, clipId }) => {
  const t = Math.max(4, w * 0.06);
  const glass = lit > 0 ? mix(C.windowDay, C.windowLit, lit) : C.windowDay;
  return (
    <g>
      <rect x={x - t * 0.5} y={y - t * 0.5} width={w + t} height={h + t} rx={t * 0.4} fill={frame} />
      <rect x={x} y={y} width={w} height={h} fill={glass} />
      {children && clipId ? (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x={x} y={y} width={w} height={h} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>{children}</g>
        </>
      ) : null}
      {/* блик стекла */}
      <path d={`M${x + w * 0.62} ${y} L${x + w * 0.8} ${y} L${x + w * 0.38} ${y + h} L${x + w * 0.2} ${y + h} Z`} fill="#FFFFFF" opacity={0.18} />
      {curtains ? (
        <>
          <path d={`M${x} ${y} Q${x + w * 0.2} ${y + h * 0.5} ${x + w * 0.1} ${y + h} L${x} ${y + h} Z`} fill={C.curtain} opacity={0.95} />
          <path d={`M${x + w} ${y} Q${x + w * 0.8} ${y + h * 0.5} ${x + w * 0.9} ${y + h} L${x + w} ${y + h} Z`} fill={C.curtain} opacity={0.95} />
        </>
      ) : null}
      <rect x={x + w / 2 - t * 0.35} y={y} width={t * 0.7} height={h} fill={frame} />
      <rect x={x} y={y + h * 0.36} width={w} height={t * 0.6} fill={frame} />
      <rect x={x - t * 0.9} y={y + h + t * 0.4} width={w + t * 1.8} height={t * 0.9} rx={t * 0.3} fill={frame} />
    </g>
  );
};

// ---------- дома ----------
// Панельный дом: этажи, швы панелей, окна, балконы. Возвращает и функцию
// координат окна, чтобы сцены знали, куда «заходит» камера.
export type PanelSpec = {
  readonly x: number;
  readonly y: number; // низ (уровень тротуара)
  readonly w: number;
  readonly floors: number;
  readonly cols: number;
  readonly color: string;
  readonly seed?: number;
  readonly floorH?: number;
};

export const panelWindow = (p: PanelSpec, col: number, row: number) => {
  const fh = p.floorH ?? 112;
  const pad = p.w * 0.07;
  const cw = (p.w - pad * 2) / p.cols;
  const ww = cw * 0.52;
  const wh = fh * 0.5;
  // row 0 — первый этаж (снизу)
  const top = p.y - fh * (row + 1) + fh * 0.22;
  return { x: p.x + pad + cw * col + (cw - ww) / 2, y: top, w: ww, h: wh };
};

export const PanelHouse: React.FC<{ readonly p: PanelSpec; readonly lit?: readonly (readonly [number, number])[]; readonly skip?: readonly (readonly [number, number])[] }> = ({ p, lit = [], skip = [] }) => {
  const fh = p.floorH ?? 112;
  const H = fh * p.floors + 40;
  const top = p.y - H;
  const seed = p.seed ?? 1;
  const items: React.ReactNode[] = [];
  for (let r = 0; r < p.floors; r++) {
    for (let c = 0; c < p.cols; c++) {
      if (skip.some(([a, b]) => a === c && b === r)) continue;
      const wn = panelWindow(p, c, r);
      const isLit = lit.some(([a, b]) => a === c && b === r);
      const balcony = r > 0 && (c + seed) % 3 === 1;
      items.push(
        <g key={`${r}-${c}`}>
          <rect x={wn.x} y={wn.y} width={wn.w} height={wn.h} fill={isLit ? C.windowLit : hash01(seed * 9 + r * 13 + c) > 0.82 ? "#C6D9EC" : C.windowDay} />
          <rect x={wn.x + wn.w / 2 - 2} y={wn.y} width={4} height={wn.h} fill={C.frame} opacity={0.9} />
          <rect x={wn.x - 3} y={wn.y + wn.h} width={wn.w + 6} height={5} fill={C.frame} opacity={0.85} />
          {balcony ? (
            <g>
              <rect x={wn.x - wn.w * 0.28} y={wn.y + wn.h * 0.42} width={wn.w * 1.56} height={wn.h * 0.66} rx={3} fill={shade(p.color, -0.07)} />
              <rect x={wn.x - wn.w * 0.28} y={wn.y + wn.h * 0.42} width={wn.w * 1.56} height={7} fill={C.frame} opacity={0.8} />
            </g>
          ) : null}
        </g>,
      );
    }
  }
  return (
    <g>
      <rect x={p.x} y={top} width={p.w} height={H} fill={p.color} />
      <rect x={p.x - 8} y={top - 10} width={p.w + 16} height={16} rx={4} fill={shade(p.color, -0.12)} />
      {Array.from({ length: p.floors }, (_, r) => (
        <rect key={`s${r}`} x={p.x} y={p.y - fh * (r + 1) - 2} width={p.w} height={3} fill={shade(p.color, -0.06)} />
      ))}
      {Array.from({ length: p.cols + 1 }, (_, c) => {
        const pad = p.w * 0.07;
        const cw = (p.w - pad * 2) / p.cols;
        return <rect key={`v${c}`} x={p.x + pad + cw * c - 1.5} y={top} width={3} height={H} fill={shade(p.color, -0.05)} opacity={0.6} />;
      })}
      {items}
      {/* подъезд */}
      <rect x={p.x + p.w * 0.44} y={p.y - fh * 0.78} width={p.w * 0.12} height={fh * 0.78} fill={shade(p.color, -0.25)} />
      <rect x={p.x + p.w * 0.41} y={p.y - fh * 0.86} width={p.w * 0.18} height={10} fill={shade(p.color, -0.15)} />
    </g>
  );
};

// Офисное здание со стеклянным фасадом.
export const officeWindow = (x: number, y: number, w: number, col: number, row: number) => {
  const cw = (w - 40) / 4;
  const fh = 128;
  return { x: x + 20 + cw * col + 8, y: y - fh * (row + 1) + 14, w: cw - 16, h: fh - 28 };
};
export const OfficeTower: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly floors: number }> = ({ x, y, w, floors }) => {
  const H = floors * 128 + 60;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < floors; r++)
    for (let c = 0; c < 4; c++) {
      const o = officeWindow(x, y, w, c, r);
      cells.push(<rect key={`${r}-${c}`} x={o.x} y={o.y} width={o.w} height={o.h} fill={hash01(r * 5 + c * 3) > 0.7 ? C.glassDark : C.glass} />);
    }
  return (
    <g>
      <rect x={x} y={y - H} width={w} height={H} fill="#E9EEF4" />
      <rect x={x - 10} y={y - H - 14} width={w + 20} height={20} rx={4} fill="#C9D3DF" />
      {cells}
      <rect x={x + w * 0.38} y={y - 120} width={w * 0.24} height={120} fill="#9FB4CB" />
    </g>
  );
};

// Типовая школа: широкие окна, крыльцо, табличка «Мектеп», ограда.
export const schoolWindow = (x: number, y: number, w: number, col: number, row: number) => {
  const cw = (w - 60) / 6;
  const fh = 150;
  return { x: x + 30 + cw * col + 10, y: y - fh * (row + 1) + 26, w: cw - 20, h: fh - 56 };
};
export const School: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly label: string; readonly fence?: boolean }> = ({ x, y, w, label, fence = true }) => {
  const H = 3 * 150 + 50;
  const wins: React.ReactNode[] = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 6; c++) {
      if (r === 0 && (c === 2 || c === 3)) continue;
      const o = schoolWindow(x, y, w, c, r);
      wins.push(
        <g key={`${r}-${c}`}>
          <rect x={o.x} y={o.y} width={o.w} height={o.h} fill={C.windowDay} />
          <rect x={o.x + o.w / 2 - 2} y={o.y} width={4} height={o.h} fill={C.frame} />
          <rect x={o.x} y={o.y + o.h * 0.3} width={o.w} height={4} fill={C.frame} />
        </g>,
      );
    }
  const ex = x + w / 2;
  return (
    <g>
      <rect x={x} y={y - H} width={w} height={H} fill={C.school} />
      <rect x={x - 10} y={y - H - 14} width={w + 20} height={22} rx={4} fill={C.schoolTrim} />
      {[1, 2].map((k) => (
        <rect key={k} x={x} y={y - 150 * k - 4} width={w} height={8} fill={C.schoolTrim} opacity={0.7} />
      ))}
      {wins}
      {/* крыльцо и вход */}
      <rect x={ex - 90} y={y - 140} width={180} height={140} fill="#7C8EAC" />
      <rect x={ex - 6} y={y - 140} width={12} height={140} fill="#9FB0CA" />
      <rect x={ex - 130} y={y - 24} width={260} height={24} fill="#D8D2C6" />
      <rect x={ex - 120} y={y - 168} width={240} height={22} rx={6} fill={C.schoolTrim} />
      {/* табличка */}
      <rect x={ex - 150} y={y - 262} width={300} height={78} rx={14} fill={C.navy} />
      <text x={ex} y={y - 208} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={46} fill={C.white}>
        {label}
      </text>
      {fence ? <Fence x={x - 40} y={y + 70} w={w + 80} /> : null}
    </g>
  );
};

export const Fence: React.FC<{ readonly x: number; readonly y: number; readonly w: number }> = ({ x, y, w }) => (
  <g>
    <rect x={x} y={y - 120} width={w} height={8} fill={C.fence} />
    <rect x={x} y={y - 24} width={w} height={8} fill={C.fence} />
    {Array.from({ length: Math.floor(w / 26) }, (_, i) => (
      <rect key={i} x={x + i * 26 + 6} y={y - 132} width={7} height={132} rx={3} fill={C.fence} />
    ))}
  </g>
);

// ---------- деревья ----------
export const Poplar: React.FC<{ readonly x: number; readonly y: number; readonly h: number; readonly sway?: number; readonly tone?: number }> = ({ x, y, h, sway = 0, tone = 0 }) => {
  const w = h * 0.2;
  const g = tone ? shade(C.poplar, tone) : C.poplar;
  const gd = tone ? shade(C.poplarDark, tone) : C.poplarDark;
  return (
    <g transform={`rotate(${sway} ${x} ${y})`}>
      <rect x={x - w * 0.07} y={y - h * 0.22} width={w * 0.14} height={h * 0.22} fill={C.trunk} />
      <ellipse cx={x} cy={y - h * 0.58} rx={w * 0.5} ry={h * 0.42} fill={gd} />
      <ellipse cx={x - w * 0.08} cy={y - h * 0.62} rx={w * 0.38} ry={h * 0.36} fill={g} />
      <ellipse cx={x + w * 0.1} cy={y - h * 0.5} rx={w * 0.22} ry={h * 0.2} fill={shade(g, 0.08)} opacity={0.8} />
    </g>
  );
};

export const RoundTree: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly tone?: number }> = ({ x, y, s, tone = 0 }) => (
  <g>
    <rect x={x - 9 * s} y={y - 120 * s} width={18 * s} height={120 * s} fill={C.trunk} />
    <circle cx={x} cy={y - 170 * s} r={90 * s} fill={shade(C.poplarDark, tone)} />
    <circle cx={x - 40 * s} cy={y - 150 * s} r={60 * s} fill={shade(C.poplar, tone)} />
    <circle cx={x + 34 * s} cy={y - 196 * s} r={62 * s} fill={shade(C.poplar, tone + 0.05)} />
  </g>
);

// ---------- улица ----------
export const Street: React.FC<{ readonly x0: number; readonly x1: number; readonly y: number; readonly dash?: number }> = ({ x0, x1, y, dash = 0 }) => {
  const w = x1 - x0;
  const off = ((dash % 160) + 160) % 160;
  return (
    <g>
      <rect x={x0} y={y} width={w} height={70} fill={C.sidewalk} />
      {/* арык */}
      <rect x={x0} y={y + 70} width={w} height={26} fill={C.aryk} />
      <rect x={x0} y={y + 70} width={w} height={5} fill="#7FA9C2" />
      <rect x={x0} y={y + 96} width={w} height={14} fill={C.curb} />
      <rect x={x0} y={y + 110} width={w} height={300} fill={C.asphalt} />
      {Array.from({ length: Math.ceil(w / 160) + 2 }, (_, i) => (
        <rect key={i} x={x0 + i * 160 - off} y={y + 250} width={80} height={10} rx={5} fill="#FFFFFF" opacity={0.75} />
      ))}
      <rect x={x0} y={y + 410} width={w} height={600} fill={C.asphaltDark} />
    </g>
  );
};

// Троллейбусные провода и столбы.
export const Wires: React.FC<{ readonly x0: number; readonly x1: number; readonly y: number; readonly step?: number; readonly ground: number }> = ({ x0, x1, y, step = 620, ground }) => (
  <g>
    {Array.from({ length: Math.floor((x1 - x0) / step) + 1 }, (_, i) => {
      const px = x0 + i * step;
      return (
        <g key={i}>
          <rect x={px - 6} y={y - 30} width={12} height={ground - y + 30} fill={C.wire} opacity={0.75} />
          <rect x={px - 40} y={y - 6} width={80} height={6} fill={C.wire} opacity={0.75} />
        </g>
      );
    })}
    {[0, 22].map((d) => (
      <path key={d} d={`M${x0} ${y + d} ` + Array.from({ length: Math.floor((x1 - x0) / step) }, (_, i) => `Q${x0 + i * step + step / 2} ${y + d + 26} ${x0 + (i + 1) * step} ${y + d}`).join(" ")} stroke={C.wire} strokeWidth={3} fill="none" opacity={0.7} />
    ))}
  </g>
);

// Обычная машина городского потока (не BalaGo): вид сбоку.
export const TrafficCar: React.FC<{ readonly x: number; readonly y: number; readonly color: string; readonly dir?: 1 | -1; readonly s?: number }> = ({ x, y, color, dir = 1, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
    <path d="M-150 -30 Q-148 -66 -110 -70 L-70 -72 Q-40 -118 10 -120 L60 -120 Q100 -116 120 -74 L146 -66 Q160 -60 160 -36 L160 -16 L-150 -16 Z" fill={color} />
    <path d="M-60 -76 Q-34 -110 6 -112 L30 -112 L30 -76 Z" fill="#DCEAF6" />
    <path d="M42 -112 L60 -112 Q92 -108 108 -76 L42 -76 Z" fill="#DCEAF6" />
    <circle cx={-92} cy={-14} r={30} fill="#2B3240" />
    <circle cx={-92} cy={-14} r={13} fill="#B7BECB" />
    <circle cx={104} cy={-14} r={30} fill="#2B3240" />
    <circle cx={104} cy={-14} r={13} fill="#B7BECB" />
  </g>
);

// Жёлтая метка-указатель над объектом мира («Үй», «Мектеп»).
export const Pin: React.FC<{ readonly x: number; readonly y: number; readonly label: string; readonly icon: "home" | "school"; readonly k: number; readonly s?: number }> = ({ x, y, label, icon, k, s = 1 }) => {
  if (k <= 0.001) return null;
  const sc = s * (0.6 + 0.4 * k);
  const w = 64 + label.length * 30;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={Math.min(1, k * 1.4)}>
      <path d={`M-18 -8 L0 18 L18 -8 Z`} fill={C.yellow} />
      <rect x={-w / 2} y={-92} width={w} height={86} rx={43} fill={C.yellow} stroke={C.white} strokeWidth={6} />
      <g transform={`translate(${-w / 2 + 46} -49)`}>{icon === "home" ? <HomeIcon /> : <SchoolIcon />}</g>
      <text x={-w / 2 + 82} y={-34} fontFamily={fontFamily} fontWeight={900} fontSize={44} fill={C.navy}>
        {label}
      </text>
    </g>
  );
};

export const HomeIcon: React.FC<{ readonly color?: string; readonly s?: number }> = ({ color = C.navy, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-22 2 L0 -18 L22 2 L22 22 L-22 22 Z" fill={color} />
    <rect x={-6} y={8} width={12} height={14} fill={C.yellow} />
  </g>
);
export const SchoolIcon: React.FC<{ readonly color?: string; readonly s?: number }> = ({ color = C.navy, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-26 -4 L0 -20 L26 -4 Z" fill={color} />
    <rect x={-22} y={-4} width={44} height={26} fill={color} />
    <rect x={-14} y={2} width={8} height={8} fill={C.yellow} />
    <rect x={6} y={2} width={8} height={8} fill={C.yellow} />
    <rect x={-4} y={12} width={8} height={10} fill={C.yellow} />
  </g>
);
export const ClockIcon: React.FC<{ readonly color?: string; readonly s?: number; readonly h?: number }> = ({ color = C.navy, s = 1, h = 8 }) => (
  <g transform={`scale(${s})`}>
    <circle r={22} fill="none" stroke={color} strokeWidth={6} />
    <path d={`M0 0 L0 -13`} stroke={color} strokeWidth={5} strokeLinecap="round" transform={`rotate(${(h % 12) * 30})`} />
    <path d={`M0 0 L10 0`} stroke={color} strokeWidth={5} strokeLinecap="round" />
  </g>
);

// ---------- цвет ----------
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (v: number[]) => "#" + v.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return toHex(A.map((x, i) => x + (B[i] - x) * t));
};
export const shade = (c: string, k: number) => (k >= 0 ? mix(c, "#FFFFFF", k) : mix(c, "#000000", -k));
