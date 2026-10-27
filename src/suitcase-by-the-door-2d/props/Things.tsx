// Вещи из чемодана и мелочи на столе для сцен возвращения мамы (S12–S15).
//  • KnitLying / KnitHeld — сложенный вязаный свитер: лежит (вид спереди
//    чуть сверху) или висит в руке, взятый за середину верхнего края.
//  • Pouch — косметичка на молнии (flat — лежит, сплющена по высоте).
//  • BadgeTilted — бейдж (BadgeCard), наклонённый к столу: s = 1 — стоит
//    вертикально, s ≈ 0,3 — лежит (вид спереди чуть сверху); поворот
//    вокруг нижнего края — так карточка поднимается со стола за шнурок.
//  • LanyardLoop — шнурок, лежащий петлёй (в чемодане, на столе, сверху).
//  • LanyardDrape — шнурок крупно: от зажима переходит через верхний край
//    карточки, свисает за ней и выглядывает снизу мягкой петлёй.
//  • BadgeBack — оборот карточки (виден со стороны камеры) со шнурком.
//  • PhotoLying — школьная фотография в рамке лежит на столе (вид спереди).
//  • FolderFlatOpen — та же охристая папка на столе (вид спереди), обложка
//    поворачивается вокруг корешка и ложится влево.
//  • shoulderOf / wristFor — где плечо персонажа и куда ставить запястье,
//    чтобы точка хвата кисти пришлась на предмет.
import { C } from "../theme";
import { roughRect } from "../kit";
import { clamp, lerp, type Vec } from "../rig/motion";
import { LOOKS, type LookId } from "../rig/looks";
import { BADGE_RATIO, BadgeCard } from "./Badge";

export const KNIT = { body: "#E4D2AE", shade: "#CDB68C", rib: "#B59C72" } as const;
export const POUCH = { body: "#D58E7E", shade: "#B97363", zip: "#6E534C" } as const;

// ---------- свитер ----------
export const KnitLying: React.FC<{
  readonly cx: number;
  readonly y: number; // нижний край передней грани
  readonly w: number;
  readonly depth?: number;
  readonly thick?: number;
  readonly skew?: number;
  readonly ink: number;
}> = ({ cx, y, w, depth = w * 0.24, thick = w * 0.1, skew = 0, ink }) => {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const yt = y - thick;
  const yb = yt - depth;
  const ins = depth * 0.22;
  const top = `M ${x0} ${yt} L ${x0 + ins + skew} ${yb} L ${x1 - ins + skew} ${yb} L ${x1} ${yt} Z`;
  return (
    <g>
      <path d={roughRect(x0, yt, w, thick, Math.min(6, thick / 2), 71, ink * 0.4)} fill={KNIT.shade} stroke={C.ink} strokeWidth={ink * 0.8} />
      {Array.from({ length: Math.max(3, Math.round(w / 9)) }, (_, i) => {
        const xx = x0 + ((i + 0.5) / Math.max(3, Math.round(w / 9))) * w;
        return <path key={i} d={`M ${xx} ${yt + thick * 0.2} L ${xx} ${y - thick * 0.2}`} stroke={KNIT.rib} strokeWidth={ink * 0.45} opacity={0.8} />;
      })}
      <path d={top} fill={KNIT.body} stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      {/* линия сгиба и вырез горловины */}
      <path d={`M ${x0 + ins * 0.5 + skew * 0.5} ${yt - depth * 0.5} L ${x1 - ins * 0.5 + skew * 0.5} ${yt - depth * 0.5}`} stroke={KNIT.rib} strokeWidth={ink * 0.5} opacity={0.7} />
      <path d={`M ${cx + skew - w * 0.12} ${yb} Q ${cx + skew} ${yb + depth * 0.45} ${cx + skew + w * 0.12} ${yb}`} fill={KNIT.shade} stroke={C.ink} strokeWidth={ink * 0.6} />
    </g>
  );
};

// Свитер в руке: взят за середину верхнего края (p), углы провисают.
export const KnitHeld: React.FC<{ readonly p: Vec; readonly w: number; readonly h: number; readonly sway?: number; readonly ink: number }> = ({ p, w, h, sway = 0, ink }) => {
  const d = `M ${p.x - w / 2} ${p.y + 16} Q ${p.x - w * 0.24} ${p.y + 2} ${p.x} ${p.y} Q ${p.x + w * 0.24} ${p.y + 2} ${p.x + w / 2} ${p.y + 16} L ${p.x + w / 2 - 4} ${p.y + h} Q ${p.x} ${p.y + h + 7} ${p.x - w / 2 + 4} ${p.y + h} Z`;
  return (
    <g transform={`rotate(${sway} ${p.x} ${p.y})`}>
      {/* рукав выглядывает из сгиба и висит сбоку */}
      <path d={`M ${p.x + w / 2 - 14} ${p.y + h * 0.35} q 10 ${h * 0.4} 6 ${h * 0.78} q -2 8 -12 6 q -6 -${h * 0.36} -8 -${h * 0.72} Z`} fill={KNIT.shade} stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <path d={d} fill={KNIT.body} stroke={C.ink} strokeWidth={ink * 0.9} strokeLinejoin="round" />
      <path d={`M ${p.x - w / 2 + 3} ${p.y + h * 0.5} Q ${p.x} ${p.y + h * 0.54} ${p.x + w / 2 - 3} ${p.y + h * 0.5}`} stroke={KNIT.rib} strokeWidth={ink * 0.5} fill="none" opacity={0.75} />
      {/* резинка по низу */}
      <path d={`M ${p.x - w / 2 + 4} ${p.y + h - 10} Q ${p.x} ${p.y + h - 3} ${p.x + w / 2 - 4} ${p.y + h - 10}`} stroke={KNIT.rib} strokeWidth={ink * 0.6} fill="none" />
      {Array.from({ length: Math.max(3, Math.round(w / 10)) }, (_, i) => {
        const xx = p.x - w / 2 + 6 + ((i + 0.5) / Math.max(3, Math.round(w / 10))) * (w - 12);
        return <path key={i} d={`M ${xx} ${p.y + h - 9} L ${xx} ${p.y + h + 1}`} stroke={KNIT.rib} strokeWidth={ink * 0.4} />;
      })}
    </g>
  );
};

// ---------- косметичка ----------
export const Pouch: React.FC<{ readonly cx: number; readonly cy: number; readonly w: number; readonly flat?: number; readonly tilt?: number; readonly ink: number }> = ({ cx, cy, w, flat = 0, tilt = 0, ink }) => {
  const h = w * 0.62 * (1 - flat * 0.45);
  const x = -w / 2;
  const y = -h / 2;
  const d = `M ${x + w * 0.1} ${y} L ${x + w * 0.9} ${y} Q ${x + w + 2} ${y + h * 0.1} ${x + w} ${y + h * 0.75} Q ${x + w} ${y + h} ${x + w * 0.82} ${y + h} L ${x + w * 0.18} ${y + h} Q ${x} ${y + h} ${x} ${y + h * 0.75} Q ${x - 2} ${y + h * 0.1} ${x + w * 0.1} ${y} Z`;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${tilt})`}>
      <path d={d} fill={POUCH.body} stroke={C.ink} strokeWidth={ink * 0.9} strokeLinejoin="round" />
      <path d={`M ${x + w * 0.5} ${y + h * 0.3} L ${x + w * 0.96} ${y + h * 0.3} L ${x + w} ${y + h * 0.75} Q ${x + w} ${y + h} ${x + w * 0.82} ${y + h} L ${x + w * 0.5} ${y + h} Z`} fill={POUCH.shade} opacity={0.35} />
      <path d={`M ${x + w * 0.08} ${y + h * 0.2} L ${x + w * 0.92} ${y + h * 0.2}`} stroke={POUCH.zip} strokeWidth={ink * 0.9} strokeDasharray={`${ink * 0.9} ${ink * 0.7}`} />
      <path d={`M ${x + w * 0.74} ${y + h * 0.2} l 3 ${h * 0.34}`} stroke={POUCH.zip} strokeWidth={ink * 1.1} strokeLinecap="round" />
    </g>
  );
};

// ---------- бейдж: наклон к столу ----------
// (cx, bottom) — середина нижнего края; s — видимая доля высоты.
export const BadgeTilted: React.FC<{ readonly cx: number; readonly bottom: number; readonly w: number; readonly s: number; readonly ink: number }> = ({ cx, bottom, w, s, ink }) => {
  const h = w * BADGE_RATIO;
  return (
    <g transform={`translate(0 ${bottom}) scale(1 ${clamp(s, 0.05, 1)}) translate(0 ${-bottom})`}>
      <BadgeCard cx={cx} cy={bottom - h / 2} w={w} ink={ink} />
    </g>
  );
};
// Отверстие наклонённого бейджа (мировые координаты).
export const tiltedHole = (cx: number, bottom: number, w: number, s: number): Vec => ({ x: cx, y: bottom - w * BADGE_RATIO * (1 - 0.085) * clamp(s, 0.05, 1) });

// Синяя лента с контуром по пути d.
const Strap: React.FC<{ readonly d: string; readonly width: number; readonly ink: number }> = ({ d, width, ink }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={C.ink} strokeWidth={width + ink * 2} />
    <path d={d} stroke={C.lanyard} strokeWidth={width} />
  </g>
);

// Шнурок, лежащий петлёй от точки hole; ang — направление петли (°,
// 0 — вправо), len — длина петли, wide — ширина, sq — сжатие по высоте
// (вид спереди на плоскость стола).
export const LanyardLoop: React.FC<{ readonly hole: Vec; readonly ang: number; readonly len: number; readonly wide: number; readonly sq?: number; readonly width: number; readonly ink: number }> = ({
  hole,
  ang,
  len,
  wide,
  sq = 1,
  width,
  ink,
}) => {
  const r = (ang * Math.PI) / 180;
  const P = (u: number, v: number) => {
    const x = Math.cos(r) * u - Math.sin(r) * v;
    const y = (Math.sin(r) * u + Math.cos(r) * v) * sq;
    return `${(hole.x + x).toFixed(1)} ${(hole.y + y).toFixed(1)}`;
  };
  const d = `M ${P(0, -2)} C ${P(len * 0.35, -wide * 0.7)} ${P(len * 0.95, -wide * 0.75)} ${P(len, 0)} C ${P(len * 1.02, wide * 0.6)} ${P(len * 0.4, wide * 0.65)} ${P(0, 2)}`;
  return (
    <g>
      <Strap d={d} width={width} ink={ink} />
      <circle cx={hole.x} cy={hole.y} r={width * 0.7} fill="#B9BEC8" stroke={C.ink} strokeWidth={ink * 0.6} />
    </g>
  );
};

// Шнурок крупно: зажим в отверстии, ленты через верхний край за карточку
// и петля внизу. Рисуется в два слоя: back — до карточки, front — после.
// sway — смещение низа петли (px), card: центр и размеры карточки.
export const LanyardDrape: React.FC<{
  readonly hole: Vec;
  readonly top: number; // верхний край карточки (y)
  readonly bottom: number; // нижний край карточки (y)
  readonly cx: number;
  readonly loop: number; // насколько петля ниже карточки
  readonly sway?: number;
  readonly width: number;
  readonly ink: number;
  readonly part: "back" | "front";
}> = ({ hole, top, bottom, cx, loop, sway = 0, width, ink, part }) => {
  const g = width * 0.9; // расстояние между лентами
  if (part === "front") {
    // зажим: от отверстия до верхнего края, ленты уходят за карточку
    return (
      <g>
        <Strap d={`M ${hole.x - g * 0.5} ${top - width * 0.6} Q ${hole.x - g * 0.9} ${top - width * 2.2} ${hole.x - g * 1.6} ${top - width * 1.6}`} width={width} ink={ink} />
        <Strap d={`M ${hole.x + g * 0.5} ${top - width * 0.6} Q ${hole.x + g * 0.9} ${top - width * 2.2} ${hole.x + g * 1.6} ${top - width * 1.6}`} width={width} ink={ink} />
        <rect x={hole.x - width * 0.6} y={top - width * 1.2} width={width * 1.2} height={hole.y - top + width * 1.5} rx={width * 0.5} fill="#B9BEC8" stroke={C.ink} strokeWidth={ink * 0.7} />
        <circle cx={hole.x} cy={hole.y} r={width * 0.32} fill="#7E8592" />
      </g>
    );
  }
  const bx = cx + sway;
  const by = bottom + loop;
  const d = `M ${hole.x - g * 1.6} ${top - width * 1.6} C ${hole.x - g * 3} ${top + width} ${cx - g * 1.2} ${bottom - loop * 0.4} ${cx - g * 1.1} ${bottom} C ${cx - g * 1.1 + sway * 0.3} ${by - loop * 0.25} ${bx - g * 1.4} ${by} ${bx} ${by} C ${bx + g * 1.4} ${by} ${cx + g * 1.1 + sway * 0.3} ${by - loop * 0.25} ${cx + g * 1.1} ${bottom} C ${cx + g * 1.2} ${bottom - loop * 0.4} ${hole.x + g * 3} ${top + width} ${hole.x + g * 1.6} ${top - width * 1.6}`;
  return <Strap d={d} width={width} ink={ink} />;
};

// Оборот карточки: светлый пластик, синяя полоса сверху, зажим; шнурок
// лежит поверх оборота (со стороны камеры) и свисает петлёй ниже.
export const BadgeBack: React.FC<{ readonly cx: number; readonly cy: number; readonly w: number; readonly rot?: number; readonly loop?: number; readonly sway?: number; readonly width: number; readonly ink: number }> = ({
  cx,
  cy,
  w,
  rot = 0,
  loop = 30,
  sway = 0,
  width,
  ink,
}) => {
  const h = w * BADGE_RATIO;
  const x = -w / 2;
  const y = -h / 2;
  const holeY = y + h * 0.085;
  const g = width * 0.9;
  const strand = (s: -1 | 1) =>
    `M ${s * g * 0.5} ${holeY} C ${s * g * 1.4} ${y + h * 0.3} ${s * g * 1.6} ${y + h * 0.75} ${s * g * 1.2} ${y + h} C ${s * g * 1.1 + sway * 0.3} ${y + h + loop * 0.7} ${s * g * 1.4 + sway} ${y + h + loop} ${sway} ${y + h + loop}`;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <rect x={x + 4} y={y + 6} width={w} height={h} rx={w * 0.06} fill={C.shadow} />
      <path d={roughRect(x, y, w, h, w * 0.06, 64, ink * 0.5)} fill="#F4F1E8" stroke={C.ink} strokeWidth={ink} />
      <rect x={x + ink} y={y + ink} width={w - ink * 2} height={h * 0.12} rx={w * 0.04} fill={C.lanyard} opacity={0.85} />
      <rect x={-w * 0.12} y={y + h * 0.06} width={w * 0.24} height={h * 0.05} rx={h * 0.025} fill="#F4F1E8" stroke={C.ink} strokeWidth={ink * 0.6} />
      <Strap d={strand(-1)} width={width} ink={ink} />
      <Strap d={strand(1)} width={width} ink={ink} />
      <rect x={-width * 0.6} y={holeY - width * 0.6} width={width * 1.2} height={width * 1.4} rx={width * 0.5} fill="#B9BEC8" stroke={C.ink} strokeWidth={ink * 0.7} />
    </g>
  );
};

// ---------- лежащие на столе предметы (вид спереди) ----------
// Фотография в рамке лежит: (cx, y) — середина переднего края.
export const PhotoLying: React.FC<{ readonly cx: number; readonly y: number; readonly w: number; readonly depth?: number; readonly ink: number }> = ({ cx, y, w, depth = w * 0.32, ink }) => {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const ins = depth * 0.2;
  const q = (a: number, b: number, c: number, e: number) => `M ${a} ${y - c} L ${a + ins * (e / depth)} ${y - e} L ${b - ins * (e / depth)} ${y - e} L ${b} ${y - c} Z`;
  return (
    <g>
      <path d={`M ${x0} ${y} L ${x1} ${y} L ${x1} ${y + 3} L ${x0} ${y + 3} Z`} fill={C.woodDark} stroke={C.ink} strokeWidth={ink * 0.6} />
      <path d={q(x0, x1, 0, depth)} fill={C.woodLight} stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <path d={q(x0 + w * 0.1, x1 - w * 0.1, depth * 0.1, depth * 0.88)} fill="#DDE9F0" stroke={C.ink} strokeWidth={ink * 0.5} />
      {/* голова и плечи мальчика на снимке (очень мелко) */}
      <ellipse cx={cx} cy={y - depth * 0.58} rx={w * 0.11} ry={depth * 0.18} fill="#E8B48D" />
      <path d={`M ${cx - w * 0.12} ${y - depth * 0.7} Q ${cx} ${y - depth * 0.86} ${cx + w * 0.12} ${y - depth * 0.7}`} stroke="#231A17" strokeWidth={depth * 0.12} fill="none" />
      <path d={`M ${cx - w * 0.24} ${y - depth * 0.14} Q ${cx} ${y - depth * 0.42} ${cx + w * 0.24} ${y - depth * 0.14} Z`} fill="#2F4A7A" />
    </g>
  );
};

// Папка на столе, вид спереди чуть сверху (как FolderFlat): (x, y) —
// передний левый угол закрытой папки (у корешка). open 0…1 — обложка
// поворачивается вокруг корешка и ложится слева внутренней стороной вверх.
export const folderCoverEdge = (x: number, y: number, w: number, open: number, depth = 0.22): Vec => {
  const d = w * depth;
  const th = clamp(open) * Math.PI;
  // середина свободного края обложки
  return { x: x + w * Math.cos(th) + d * 0.25, y: y - d * 0.5 - w * Math.sin(th) * 0.85 };
};
export const FolderFlatOpen: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly open: number; readonly depth?: number; readonly ink: number }> = ({ x, y, w, open, depth = 0.22, ink }) => {
  const d = w * depth;
  const th = clamp(open) * Math.PI;
  const P = (u: number, v: number, z = 0) => `${(x + u + v * d * 0.5).toFixed(1)} ${(y - v * d - z * 0.85).toFixed(1)}`;
  const quad = (pts: readonly (readonly [number, number, number])[]) => `M ${pts.map((p) => P(p[0], p[1], p[2])).join(" L ")} Z`;
  const cu = w * Math.cos(th);
  const cz = w * Math.sin(th);
  const cover = quad([
    [0, 0, 0],
    [0, 1, 0],
    [cu, 1, cz],
    [cu, 0, cz],
  ]);
  const inside = th > Math.PI / 2;
  return (
    <g>
      {/* задняя обложка с листами (видна, когда обложка поднята) */}
      <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + 7} L ${x} ${y + 7} Z`} fill={C.folderShade} stroke={C.ink} strokeWidth={ink * 0.8} />
      <path d={quad([[0, 0, 0], [0, 1, 0], [w, 1, 0], [w, 0, 0]])} fill={C.folderInside} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <path d={quad([[w * 0.08, 0.1, 0], [w * 0.08, 0.9, 0], [w * 0.92, 0.9, 0], [w * 0.92, 0.1, 0]])} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.5} />
      {[0.3, 0.5, 0.7].map((v, i) => (
        <path key={v} d={`M ${P(w * 0.2, v)} L ${P(w * (i === 2 ? 0.55 : 0.8), v)}`} stroke={C.inkSoft} strokeWidth={ink * 0.6} opacity={0.55} />
      ))}
      <path d={`M ${P(w * 0.62, 0.62)} L ${P(w * 0.74, 0.62)} L ${P(w * 0.74, 0.3)} L ${P(w * 0.62, 0.3)} Z`} fill={C.yellowSoft} stroke={C.ink} strokeWidth={ink * 0.4} />
      {/* обложка: снаружи охра, внутри светлая; на развороте — свой лист */}
      {Math.abs(cu) > 1 || cz > 1 ? (
        <g>
          <path d={cover} fill={inside ? C.folderInside : C.folder} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
          {!inside && cu > w * 0.4 ? (
            <path d={`M ${P(cu * 0.4, 0.55, cz * 0.4)} L ${P(cu * 0.8, 0.55, cz * 0.8)}`} stroke={C.paper} strokeWidth={ink * 2.2} strokeLinecap="round" />
          ) : null}
          {inside && -cu > w * 0.5 ? (
            <path d={quad([[cu * 0.08, 0.1, cz * 0.08], [cu * 0.08, 0.9, cz * 0.08], [cu * 0.92, 0.9, cz * 0.92], [cu * 0.92, 0.1, cz * 0.92]])} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.5} />
          ) : null}
        </g>
      ) : null}
      {/* корешок */}
      <path d={`M ${P(0, 0)} L ${P(0, 1)}`} stroke={C.folderShade} strokeWidth={ink * 2} strokeLinecap="round" />
    </g>
  );
};

// ---------- геометрия хвата ----------
// Плечевой сустав стоящего персонажа (приближённо, без поворота корпуса).
export const shoulderOf = (look: LookId, p: { readonly x: number; readonly y: number; readonly h: number }, side: -1 | 1, lean = 0): Vec => {
  const b = LOOKS[look].build;
  const k = p.h / 1000;
  return { x: p.x + side * (b.shoulderHalf - b.limb * 0.45) * k, y: p.y + (b.shoulderY + 14 + b.limb * 0.45 + lean * 1.6) * k };
};
// Запястье так, чтобы точка хвата (доля kk длины кисти) пришлась на grip;
// кисть направлена от плеча к предмету (или по заданному углу dirDeg).
export const wristFor = (look: LookId, h: number, grip: Vec, shoulder: Vec, kk = 0.5, dirDeg?: number): Vec => {
  const L = (LOOKS[look].build.hand * h) / 1000;
  let dx = grip.x - shoulder.x;
  let dy = grip.y - shoulder.y;
  if (dirDeg !== undefined) {
    dx = Math.cos((dirDeg * Math.PI) / 180);
    dy = Math.sin((dirDeg * Math.PI) / 180);
  }
  const n = Math.hypot(dx, dy) || 1;
  return { x: grip.x - (dx / n) * L * kk, y: grip.y - (dy / n) * L * kk };
};

export const mixV = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
