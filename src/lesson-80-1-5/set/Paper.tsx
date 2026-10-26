// Бумага и лодочки: лист на столе, заготовка в стадиях складывания, готовая
// лодочка (сухая и на воде), стопка листов, ёмкость с водой и рябью,
// полотенце. Всё — SVG в мировых px; формы меняются только от переданных
// параметров (кадр → состояние), поэтому предпросмотр и рендер совпадают.
import { clamp, lerp, type Vec } from "../rig/motion";

const PAPER = "#FBFAF6";
const PAPER_SHADE = "#E7E3D8";
const PAPER_LINE = "#C9C4B8";

// Складывание угла: точка p за линией сгиба a–b поворачивается на линию:
// t = 0 — лежит, t = 1 — лежит на другой стороне; между — чуть приподнята
// (бумага встаёт на ребро).
export const foldPoint = (p: Vec, a: Vec, b: Vec, t: number): Vec => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const dist = (p.x - a.x) * nx + (p.y - a.y) * ny;
  const k = Math.cos(Math.PI * t);
  const lift = Math.sin(Math.PI * t) * Math.abs(dist) * 0.55;
  return { x: p.x - dist * nx + dist * k * nx, y: p.y - dist * ny + dist * k * ny - lift };
};
const poly = (pts: readonly Vec[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ") + " Z";

// Обычный прямоугольный лист на столе (вид сверху-спереди: ближний край
// шире — лёгкая перспектива). w — ширина, d — глубина на экране.
// fold — 0…1: ближняя половина поворачивается на дальнюю по средней линии
// (первый сгиб); pressed — линия сгиба прижата (видна складка).
export const Sheet: React.FC<{ x: number; y: number; w?: number; d?: number; rot?: number; lift?: number; shadow?: boolean; fold?: number; pressed?: boolean }> = ({ x, y, w = 150, d = 96, rot = 0, lift = 0, shadow = true, fold = 0, pressed = false }) => {
  const far = { l: { x: -w / 2, y: -d / 2 }, r: { x: w / 2, y: -d / 2 } };
  const near = { l: { x: -w / 2 - 6, y: d / 2 }, r: { x: w / 2 + 6, y: d / 2 } };
  const midL = { x: -w / 2 - 3, y: 0 };
  const midR = { x: w / 2 + 3, y: 0 };
  const flap = fold > 0 ? [midL, near.l, near.r, midR].map((p) => foldPoint(p, midL, midR, fold)) : null;
  return (
    <g transform={`translate(${x} ${y - lift}) rotate(${rot})`}>
      {shadow ? <path d={`M ${far.l.x + 4 + lift * 0.3} ${far.l.y + 6 + lift} L ${far.r.x + 4 + lift * 0.3} ${far.r.y + 6 + lift} L ${near.r.x + 4 + lift * 0.3} ${near.r.y + 6 + lift} L ${near.l.x + 4 + lift * 0.3} ${near.l.y + 6 + lift} Z`} fill="rgba(40,35,60,0.16)" /> : null}
      {flap ? (
        <>
          {/* дальняя половина остаётся на столе */}
          <path d={`M ${far.l.x} ${far.l.y} L ${far.r.x} ${far.r.y} L ${midR.x} ${midR.y} L ${midL.x} ${midL.y} Z`} fill={PAPER} stroke={PAPER_LINE} strokeWidth={1.5} />
          <path d={poly(flap)} fill={fold < 0.5 ? PAPER : PAPER_SHADE} stroke={PAPER_LINE} strokeWidth={1.5} strokeLinejoin="round" />
          {pressed ? <line x1={midL.x} y1={midL.y} x2={midR.x} y2={midR.y} stroke={PAPER_LINE} strokeWidth={2} /> : null}
        </>
      ) : (
        <path d={`M ${far.l.x} ${far.l.y} L ${far.r.x} ${far.r.y} L ${near.r.x} ${near.r.y} L ${near.l.x} ${near.l.y} Z`} fill={PAPER} stroke={PAPER_LINE} strokeWidth={1.5} />
      )}
    </g>
  );
};

// Стопка листов.
export const Stack: React.FC<{ x: number; y: number; n?: number }> = ({ x, y, n = 6 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <Sheet key={i} x={x + (i % 2) * 2 - 1} y={y - i * 2.2} w={150} d={96} rot={(i % 3) - 1} shadow={i === 0} />
    ))}
  </g>
);

// Заготовка лодочки в последних стадиях (мировые px, центр в x, y).
//   stage "diamond": ромб (квадрат с загнутыми бортами) лежит плоско;
//   fold — 0…1: нижний угол подворачивается вверх по линии (последний сгиб);
//   open — 0…1: верхние углы разводятся — ромб раскрывается в лодочку;
//   hull — 0…1: борта расправлены, лодочка объёмная.
// Геометрия заготовки (локальные px при s = 1) — для целей рук.
export const FORM = { W: 96, H: 62, band: 22, hullTopX: 118, hullTopY: -6, hullBotX: 72, hullBotY: 40, peakY: -66 } as const;

export const BoatForm: React.FC<{ x: number; y: number; s?: number; fold: number; open: number; hull: number; lift?: number }> = ({ x, y, s = 1, fold, open, hull, lift = 0 }) => {
  // ромб
  const W = 96;
  const H = 62;
  const top = { x: 0, y: -H };
  const left = { x: -W, y: 0 };
  const right = { x: W, y: 0 };
  const bot = { x: 0, y: H };
  const bandY = 22;
  // нижний угол: клапан ниже линии bandY подворачивается наверх
  const la = { x: -W * (1 - bandY / H), y: bandY };
  const lb = { x: W * (1 - bandY / H), y: bandY };
  const flap = [la, bot, lb].map((p) => foldPoint(p, la, lb, fold));
  // раскрытие: ромб → силуэт лодочки
  const o = clamp(open);
  const hullTopL = { x: lerp(left.x, -118, o), y: lerp(left.y, -6, o) };
  const hullTopR = { x: lerp(right.x, 118, o), y: lerp(right.y, -6, o) };
  const hullBotL = { x: lerp(la.x, -72, o), y: lerp(la.y, 40, o) };
  const hullBotR = { x: lerp(lb.x, 72, o), y: lerp(lb.y, 40, o) };
  const peak = { x: 0, y: lerp(top.y, -66, o) };
  const body = o < 0.02 ? [top, right, lb, la, left] : [peak, hullTopR, hullBotR, hullBotL, hullTopL];
  const h = clamp(hull);
  // при раскрытом корпусе виден внутренний борт
  const inner = o > 0.5 ? [hullTopL, { x: lerp(hullTopL.x, -50, 0.5), y: lerp(hullTopL.y, 10, h) }, { x: lerp(hullTopR.x, 50, 0.5), y: lerp(hullTopR.y, 10, h) }, hullTopR] : null;
  return (
    <g transform={`translate(${x} ${y - lift}) scale(${s})`}>
      <path d={poly(body.map((p) => ({ x: p.x + 5, y: p.y + 7 + lift * 0.6 })))} fill="rgba(40,35,60,0.16)" />
      <path d={poly(body)} fill={PAPER} stroke={PAPER_LINE} strokeWidth={1.5} strokeLinejoin="round" />
      {o < 0.98 ? <path d={poly(flap)} fill={fold < 0.5 ? PAPER : PAPER_SHADE} stroke={PAPER_LINE} strokeWidth={1.5} strokeLinejoin="round" opacity={1 - o} /> : null}
      {/* линия борта на ромбе */}
      {o < 0.98 ? <line x1={la.x} y1={la.y} x2={lb.x} y2={lb.y} stroke={PAPER_LINE} strokeWidth={1.5} opacity={1 - o} /> : null}
      {/* вертикальный сгиб (парус) */}
      <line x1={0} y1={peak.y + 4} x2={0} y2={lerp(bandY, 2, o)} stroke={PAPER_LINE} strokeWidth={1.5} />
      {inner ? <path d={poly(inner)} fill={PAPER_SHADE} stroke={PAPER_LINE} strokeWidth={1.5} strokeLinejoin="round" opacity={h} /> : null}
      {o > 0.5 ? <path d={`M ${hullTopL.x} ${hullTopL.y} L ${hullBotL.x} ${hullBotL.y} L ${hullBotR.x} ${hullBotR.y} L ${hullTopR.x} ${hullTopR.y}`} fill="none" stroke={PAPER_LINE} strokeWidth={1.5} opacity={o} /> : null}
    </g>
  );
};

// Готовая лодочка (сухая): корпус с двумя носами, борт, парус-треугольник.
export const Boat: React.FC<{ x: number; y: number; s?: number; rot?: number; lift?: number; shadow?: boolean; creases?: boolean }> = ({ x, y, s = 1, rot = 0, lift = 0, shadow = true, creases = false }) => (
  <g transform={`translate(${x} ${y - lift}) rotate(${rot}) scale(${s})`}>
    {shadow ? <path d={`M -112 ${4 + lift * 0.7} L 112 ${4 + lift * 0.7} L 70 ${46 + lift * 0.7} L -64 ${46 + lift * 0.7} Z`} fill="rgba(40,35,60,0.16)" /> : null}
    {/* дальний борт (внутренний) */}
    <path d={`M -118 -6 L 118 -6 L 64 -22 L -58 -22 Z`} fill={PAPER_SHADE} stroke={PAPER_LINE} strokeWidth={1.5} strokeLinejoin="round" />
    {/* парус */}
    <path d={`M 0 -68 L 44 -8 L -44 -8 Z`} fill={PAPER} stroke={PAPER_LINE} strokeWidth={1.5} strokeLinejoin="round" />
    <line x1={0} y1={-62} x2={0} y2={-10} stroke={PAPER_LINE} strokeWidth={1.5} />
    {/* ближний борт */}
    <path d={`M -118 -6 L 118 -6 L 72 40 L -72 40 Z`} fill={PAPER} stroke={PAPER_LINE} strokeWidth={1.5} strokeLinejoin="round" />
    <path d={`M -118 -6 L 118 -6 L 72 40 L -72 40 Z`} fill="#000000" opacity={0.04} />
    {creases ? (
      <g>
        <line x1={-96} y1={2} x2={96} y2={2} stroke="#9FA7B8" strokeWidth={2} strokeDasharray="6 5" />
        <line x1={-60} y1={34} x2={60} y2={34} stroke="#9FA7B8" strokeWidth={2} strokeDasharray="6 5" />
      </g>
    ) : null}
  </g>
);

export const BASIN = { rx: 140, ry: 50 } as const;

// Широкая неглубокая ёмкость с водой. Лодочка внутри рисуется через
// children (в координатах центра воды) и обрезается по поверхности.
export const Basin: React.FC<{ x: number; y: number; uid: string; ripple?: number; rippleAt?: Vec; f: number; children?: React.ReactNode }> = ({ x, y, uid, ripple = 0, rippleAt, f, children }) => {
  const RX = BASIN.rx;
  const RY = BASIN.ry;
  const id = `${uid}-water`;
  const rip = clamp(ripple);
  const rp = rippleAt ?? { x: 0, y: 0 };
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={6} cy={10} rx={RX + 12} ry={RY + 8} fill="rgba(40,35,60,0.14)" />
      {/* внешняя стенка */}
      <ellipse cx={0} cy={6} rx={RX + 12} ry={RY + 10} fill="#B9C6CF" />
      <ellipse cx={0} cy={0} rx={RX + 12} ry={RY + 8} fill="#D5DEE4" />
      {/* вода */}
      <clipPath id={id}>
        <ellipse cx={0} cy={2} rx={RX} ry={RY} />
      </clipPath>
      <ellipse cx={0} cy={2} rx={RX} ry={RY} fill="#8FC2D8" />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={0} cy={6} rx={RX} ry={RY} fill="#A5D1E2" />
        {/* спокойные блики */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-100 + i * 70 + Math.sin(f / 40 + i) * 6} ${-20 + i * 18} q 18 -4 36 0`} stroke="#FFFFFF" strokeWidth={2.5} fill="none" opacity={0.45} strokeLinecap="round" />
        ))}
        {/* рябь от касания: расходится и затухает */}
        {rip > 0 && rip < 1
          ? [0, 1, 2].map((i) => {
              const r = rip * (60 + i * 18) + i * 8;
              return <ellipse key={i} cx={rp.x} cy={rp.y} rx={r} ry={r * 0.42} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={(1 - rip) * (0.55 - i * 0.12)} />;
            })
          : null}
        {children}
      </g>
      {/* ближний бортик поверх */}
      <path d={`M ${-RX - 12} 0 A ${RX + 12} ${RY + 8} 0 0 0 ${RX + 12} 0 A ${RX} ${RY} 0 0 1 ${-RX} 2 Z`} fill="#C7D2DA" opacity={0.9} />
      <path d={`M ${-RX - 12} 0 A ${RX + 12} ${RY + 8} 0 0 0 ${RX + 12} 0`} fill="none" stroke="#AEBBC5" strokeWidth={2} />
    </g>
  );
};


export const Towel: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M -62 -24 L 62 -24 L 70 24 L -54 24 Z`} fill="rgba(40,35,60,0.12)" transform="translate(4 6)" />
    <path d={`M -62 -24 L 62 -24 L 70 24 L -54 24 Z`} fill="#E8C98C" />
    <path d={`M -62 -24 L 62 -24 L 66 0 L -58 0 Z`} fill="#F1D7A3" />
    <path d={`M -58 0 L 66 0`} stroke="#D9B472" strokeWidth={2} />
    <path d={`M -56 12 L 68 12`} stroke="#D9B472" strokeWidth={2} />
  </g>
);
