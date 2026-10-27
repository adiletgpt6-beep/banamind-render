// Детские руки в виде сверху (тыльная сторона кисти): предплечье в рукаве от
// края кадра к запястью, ладонь, пять пальцев с суставами и ногтями. Поза
// задаётся сгибом пальцев и положением большого пальца:
//   rest  — кисть спокойно лежит, пальцы чуть согнуты;
//   grip  — пальцы согнуты на край детали, большой палец с другой стороны;
//   pinch — большой и указательный сведены (щипок за край);
//   point — указательный вытянут, остальные согнуты;
//   trace — как point, кончик указательного касается поверхности.
// Координаты — пиксели кадра вида сверху. angle — куда направлены пальцы
// (0 — вверх кадра, по часовой). side: 1 — правая рука ребёнка (большой
// палец слева на тыльной стороне), −1 — левая.

export type TopHandPose = "rest" | "grip" | "pinch" | "point" | "trace" | "open";

type Look = { readonly skin: string; readonly shade: string; readonly sleeve: string; readonly sleeveShade: string };

type Finger = { readonly x: number; readonly len: number; readonly w: number; readonly spread: number };
// x — положение основания по ширине ладони (от стороны большого пальца),
// len — длина, w — толщина (доли длины кисти L). Детские пальцы короткие и пухлые.
const FINGERS: readonly Finger[] = [
  { x: -0.17, len: 0.37, w: 0.135, spread: -7 }, // указательный
  { x: -0.055, len: 0.42, w: 0.14, spread: -2 }, // средний
  { x: 0.06, len: 0.39, w: 0.135, spread: 3 }, // безымянный
  { x: 0.17, len: 0.31, w: 0.125, spread: 9 }, // мизинец
];

const POSES: Record<TopHandPose, { readonly curl: readonly number[]; readonly thumb: number; readonly thumbIn: number; readonly spread: number }> = {
  rest: { curl: [0.22, 0.26, 0.3, 0.34], thumb: -26, thumbIn: 0, spread: 1 },
  open: { curl: [0.04, 0.04, 0.06, 0.08], thumb: -40, thumbIn: 0, spread: 1.7 },
  grip: { curl: [0.5, 0.52, 0.6, 0.66], thumb: -6, thumbIn: 0.55, spread: 0.6 },
  pinch: { curl: [0.42, 0.62, 0.72, 0.78], thumb: 6, thumbIn: 0.9, spread: 0.5 },
  point: { curl: [0.0, 0.82, 0.86, 0.88], thumb: 14, thumbIn: 0.75, spread: 0.4 },
  trace: { curl: [0.12, 0.8, 0.84, 0.86], thumb: 12, thumbIn: 0.7, spread: 0.4 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Кисть в локальных координатах: запястье (0, 0), пальцы к −y.
const HandShape: React.FC<{ readonly L: number; readonly pose: TopHandPose; readonly blend?: { readonly to: TopHandPose; readonly t: number }; readonly look: Look }> = ({ L, pose, blend, look }) => {
  const a = POSES[pose];
  const b = blend ? POSES[blend.to] : a;
  const t = blend ? blend.t : 0;
  const curl = a.curl.map((c, i) => lerp(c, b.curl[i], t));
  const thumbAng = lerp(a.thumb, b.thumb, t);
  const thumbIn = lerp(a.thumbIn, b.thumbIn, t);
  const spread = lerp(a.spread, b.spread, t);
  const knuckleY = -0.46 * L;
  const palmW0 = 0.4 * L;
  const palmW1 = 0.52 * L;
  const palm = `M ${-palmW0 / 2} ${0.02 * L} C ${-palmW0 / 2 - 0.05 * L} ${-0.2 * L} ${-palmW1 / 2 - 0.02 * L} ${knuckleY + 0.08 * L} ${-palmW1 / 2 + 0.02 * L} ${knuckleY} Q 0 ${knuckleY - 0.07 * L} ${palmW1 / 2 - 0.01 * L} ${knuckleY + 0.02 * L} C ${palmW1 / 2 + 0.03 * L} ${knuckleY + 0.12 * L} ${palmW0 / 2 + 0.05 * L} ${-0.18 * L} ${palmW0 / 2} ${0.02 * L} Z`;
  const fingers = FINGERS.map((f, i) => {
    const c = curl[i];
    const ang = (f.spread * spread * Math.PI) / 180;
    const bx = f.x * L;
    const by = knuckleY + 0.02 * L + Math.abs(f.x) * 0.12 * L;
    // согнутый палец сверху короче: видны основная фаланга и согнутый кончик
    const vis = f.len * L * (1 - 0.6 * c);
    const tx = bx + Math.sin(ang) * vis;
    const ty = by - Math.cos(ang) * vis;
    const w = f.w * L;
    const mid = { x: bx + Math.sin(ang) * vis * 0.5, y: by - Math.cos(ang) * vis * 0.5 };
    return (
      <g key={i}>
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke={look.shade} strokeWidth={w + 2.2} strokeLinecap="round" />
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke={look.skin} strokeWidth={w} strokeLinecap="round" />
        {/* сустав */}
        <path d={`M ${mid.x - w * 0.28} ${mid.y + 0.02 * L} q ${w * 0.28} ${-0.025 * L} ${w * 0.56} 0`} stroke={look.shade} strokeWidth={1.3} fill="none" opacity={0.55} />
        {c < 0.45 ? (
          // ноготь у кончика
          <ellipse cx={tx - Math.sin(ang) * w * 0.32} cy={ty + Math.cos(ang) * w * 0.32} rx={w * 0.26} ry={w * 0.33} transform={`rotate(${(ang * 180) / Math.PI} ${tx - Math.sin(ang) * w * 0.32} ${ty + Math.cos(ang) * w * 0.32})`} fill="#F7DCCB" stroke={look.shade} strokeWidth={0.8} opacity={0.9} />
        ) : (
          // согнутый кончик уходит вниз: тень у кончика
          <ellipse cx={tx} cy={ty + w * 0.08} rx={w * 0.42} ry={w * 0.3} fill={look.shade} opacity={0.35} />
        )}
      </g>
    );
  });
  // большой палец: от основания сбоку ладони (нижняя треть), с мягким
  // возвышением у основания; thumbIn — насколько он подведён к указательному
  const tbx = -palmW0 / 2 + 0.02 * L;
  const tby = -0.17 * L;
  const ta = ((thumbAng - 8) * Math.PI) / 180;
  const tl = 0.36 * L * (1 - 0.22 * thumbIn);
  const t1 = { x: tbx + Math.sin(ta) * tl * 0.52 - 0.03 * L * thumbIn, y: tby - Math.cos(ta) * tl * 0.52 };
  const ta2 = ta + 0.45 * thumbIn + 0.12;
  const t2 = { x: t1.x + Math.sin(ta2) * tl * 0.48, y: t1.y - Math.cos(ta2) * tl * 0.48 };
  const tw = 0.16 * L;
  return (
    <g>
      {/* большой палец под ладонью при захвате рисуется раньше */}
      {thumbIn > 0.5 ? <Thumb tb={{ x: tbx, y: tby }} t1={t1} t2={t2} w={tw} look={look} /> : null}
      <path d={palm} fill={look.skin} stroke={look.shade} strokeWidth={1.6} />
      {/* лёгкая тень у запястья и складка у основания пальцев */}
      <path d={`M ${-palmW1 * 0.36} ${knuckleY + 0.07 * L} Q 0 ${knuckleY + 0.02 * L} ${palmW1 * 0.36} ${knuckleY + 0.08 * L}`} stroke={look.shade} strokeWidth={1.4} fill="none" opacity={0.45} />
      <ellipse cx={0.05 * L} cy={-0.06 * L} rx={palmW0 * 0.42} ry={0.08 * L} fill={look.shade} opacity={0.12} />
      {[...fingers].reverse()}
      {thumbIn <= 0.5 ? <Thumb tb={{ x: tbx, y: tby }} t1={t1} t2={t2} w={tw} look={look} /> : null}
    </g>
  );
};

const Thumb: React.FC<{ tb: { x: number; y: number }; t1: { x: number; y: number }; t2: { x: number; y: number }; w: number; look: Look }> = ({ tb, t1, t2, w, look }) => (
  <g>
    {/* возвышение у основания большого пальца — переход от ладони */}
    <path d={`M ${tb.x + w * 0.9} ${tb.y + w * 1.7} Q ${tb.x - w * 0.55} ${tb.y + w * 0.6} ${t1.x - w * 0.3} ${t1.y} L ${t1.x + w * 0.45} ${t1.y + w * 0.2} Q ${tb.x + w * 0.9} ${tb.y + w * 0.2} ${tb.x + w * 1.4} ${tb.y + w * 0.4} Z`} fill={look.skin} />
    <path d={`M ${tb.x + w * 0.2} ${tb.y + w * 0.3} L ${t1.x} ${t1.y} L ${t2.x} ${t2.y}`} stroke={look.shade} strokeWidth={w + 2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={`M ${tb.x + w * 0.2} ${tb.y + w * 0.3} L ${t1.x} ${t1.y} L ${t2.x} ${t2.y}`} stroke={look.skin} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={`M ${tb.x + w * 0.9} ${tb.y + w * 1.6} Q ${tb.x - w * 0.3} ${tb.y + w * 0.7} ${t1.x - w * 0.1} ${t1.y + w * 0.1}`} stroke={look.skin} strokeWidth={w * 0.9} fill="none" strokeLinecap="round" />
    <ellipse cx={t2.x} cy={t2.y + w * 0.12} rx={w * 0.26} ry={w * 0.32} fill="#F7DCCB" stroke={look.shade} strokeWidth={0.8} opacity={0.85} />
  </g>
);

// Рука целиком: плечо от точки anchor (за краем кадра) к локтю, предплечье
// к запястью, манжета рукава, кисть. Локоть — по двухзвенной кинематике,
// отведён наружу (side): кисти близко к телу — рука согнута, далеко —
// почти прямая. Длина кисти L, пикселей кадра.
export const TopArm: React.FC<{
  readonly wrist: { readonly x: number; readonly y: number };
  readonly anchor: { readonly x: number; readonly y: number };
  readonly L: number;
  readonly angle: number;
  readonly side: 1 | -1;
  readonly pose: TopHandPose;
  readonly blend?: { readonly to: TopHandPose; readonly t: number };
  readonly look: Look;
  readonly shadow?: number; // высота кисти над столом (px кадра) для тени
}> = ({ wrist, anchor, L, angle, side, pose, blend, look, shadow = 10 }) => {
  const dx = wrist.x - anchor.x;
  const dy = wrist.y - anchor.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const Lu = 1.5 * L; // плечо (в кадре почти не видно — за нижним краем)
  const Lf = 2.15 * L; // предплечье до запястья
  const d = Math.min(len, Lu + Lf - 0.5);
  const a = (d * d + Lu * Lu - Lf * Lf) / (2 * d);
  const hgt = len >= Lu + Lf ? 0 : Math.sqrt(Math.max(0, Lu * Lu - a * a));
  // локоть ближе к телу (ниже в кадре), когда кисть уходит вбок; при
  // вытягивании прямо вперёд — чуть наружу (side). Плавно, без перескока.
  const out = -uy * side >= 0 ? 1 : -1;
  const sgn = Math.max(-1, Math.min(1, ux / 0.25 + out * 0.4));
  const elbow = len >= Lu + Lf ? { x: anchor.x + ux * len * (Lu / (Lu + Lf)), y: anchor.y + uy * len * (Lu / (Lu + Lf)) } : { x: anchor.x + ux * a - uy * hgt * sgn, y: anchor.y + uy * a + ux * hgt * sgn };
  // предплечье: направление локоть → запястье
  const fl = Math.hypot(wrist.x - elbow.x, wrist.y - elbow.y) || 1;
  const fx = (wrist.x - elbow.x) / fl;
  const fy = (wrist.y - elbow.y) / fl;
  const nx = -fy;
  const ny = fx;
  const wW = 0.36 * L; // запястье
  const cW = 0.5 * L; // манжета
  const eW = 0.56 * L; // рукав у локтя
  const cuffAt = 0.2 * L; // манжета от запястья
  const c = { x: wrist.x - fx * cuffAt, y: wrist.y - fy * cuffAt };
  const sleevePath = `M ${anchor.x} ${anchor.y} L ${elbow.x} ${elbow.y} L ${c.x} ${c.y}`;
  const skinArm = `M ${c.x + nx * wW / 2 - fx * 4} ${c.y + ny * wW / 2 - fy * 4} L ${wrist.x + nx * wW / 2} ${wrist.y + ny * wW / 2} L ${wrist.x - nx * wW / 2} ${wrist.y - ny * wW / 2} L ${c.x - nx * wW / 2 - fx * 4} ${c.y - ny * wW / 2 - fy * 4} Z`;
  const sh = Math.max(4, shadow);
  return (
    <g>
      {/* тень руки на столе */}
      <g opacity={0.2} style={{ filter: `blur(${3 + sh * 0.25}px)` }} transform={`translate(${sh * 0.6} ${-sh * 0.3})`}>
        <path d={sleevePath} stroke="#2A1A0E" strokeWidth={0.54 * L} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <g transform={`translate(${wrist.x} ${wrist.y}) rotate(${angle}) scale(${side} 1)`}>
          <ellipse cx={0} cy={-0.35 * L} rx={0.3 * L} ry={0.45 * L} fill="#2A1A0E" />
        </g>
      </g>
      <path d={skinArm} fill={look.skin} stroke={look.shade} strokeWidth={1.4} />
      <g transform={`translate(${wrist.x} ${wrist.y}) rotate(${angle}) scale(${side} 1)`}>
        <HandShape L={L} pose={pose} blend={blend} look={look} />
      </g>
      {/* рукав: плечо, скруглённый локоть, предплечье сужается к манжете */}
      <path d={`M ${anchor.x} ${anchor.y} L ${elbow.x} ${elbow.y}`} stroke={look.sleeve} strokeWidth={0.6 * L} strokeLinecap="round" fill="none" />
      <path d={`M ${elbow.x + nx * eW / 2} ${elbow.y + ny * eW / 2} L ${c.x + nx * cW / 2} ${c.y + ny * cW / 2} Q ${c.x + fx * 0.05 * L} ${c.y + fy * 0.05 * L} ${c.x - nx * cW / 2} ${c.y - ny * cW / 2} L ${elbow.x - nx * eW / 2} ${elbow.y - ny * eW / 2} Z`} fill={look.sleeve} />
      <circle cx={elbow.x} cy={elbow.y} r={0.29 * L} fill={look.sleeve} />
      <path d={`M ${elbow.x - fx * 0.02 * L} ${elbow.y - fy * 0.02 * L} m ${nx * 0.2 * L} ${ny * 0.2 * L} q ${fx * 0.25 * L} ${fy * 0.25 * L} ${-nx * 0.4 * L} ${-ny * 0.4 * L}`} stroke={look.sleeveShade} strokeWidth={2} fill="none" opacity={hgt > 0.3 * L ? 0.5 : 0} />
      <path d={`M ${c.x + nx * cW / 2} ${c.y + ny * cW / 2} Q ${c.x + fx * 0.05 * L} ${c.y + fy * 0.05 * L} ${c.x - nx * cW / 2} ${c.y - ny * cW / 2}`} stroke={look.sleeveShade} strokeWidth={0.08 * L} fill="none" strokeLinecap="round" />
      {/* складки рукава */}
      <path d={`M ${c.x - fx * 0.5 * L + nx * cW * 0.3} ${c.y - fy * 0.5 * L + ny * cW * 0.3} q ${-fx * 0.2 * L} ${-fy * 0.2 * L} ${-nx * cW * 0.25} ${-ny * cW * 0.25}`} stroke={look.sleeveShade} strokeWidth={2} fill="none" opacity={0.6} />
    </g>
  );
};

export const YUSUF_HANDS: Look = { skin: "#E8B48D", shade: "#C98F68", sleeve: "#F2C53D", sleeveShade: "#D9A92C" };
export const AMIR_HANDS: Look = { skin: "#EBBE9A", shade: "#CE9F7A", sleeve: "#3E6FB5", sleeveShade: "#2F5590" };
