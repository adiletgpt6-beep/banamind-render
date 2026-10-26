// Вставка «Сад» фильма 80-1-9 (сцена 2): обычный яблоневый сад днём.
// "tree" — общий план выросшей яблони со спелыми красными яблоками;
// "worker" — ближе: садовник правой рукой срывает одно яблоко и кладёт его
// в плетёную корзину у ног. Никакого роста, лучей и свечения — дерево уже
// выросло, человек спокойно трудится. Мир — px, одни и те же координаты в
// обоих планах; всё детерминированно по кадру f (кадры от начала вставки).
// Свет — дневной, справа сверху (как окно в комнате серии).
import { SceneContext } from "../core/context";
import { camMove, Shot, type Cam } from "../core/shots";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { twoBone } from "../rig/Figure";
import { ADULT, shadeOf, type Look } from "../rig/looks";
import { clamp, easeInOut, easeOut, hash01, keys, lerp, rad, soften, type Vec } from "../rig/motion";
import { EXPR, mixExpr, type HandShape } from "../rig/pose";

export type GardenVariant = "tree" | "worker";

// Кадры действия садовника (от начала плана "worker") — для мягких звуков.
export const GARDEN_TIMING = {
  look: 0, // стоит у дерева, смотрит на низкую ветку
  reach: 7, // тянется правой рукой вверх
  grab: 14, // кисть сомкнулась на яблоке
  detach: 17, // яблоко отделилось от ветки (тихий щелчок плодоножки)
  lower: 17, // опускает яблоко и приседает к корзине
  place: 37, // яблоко легло на другие яблоки в корзине (мягкий стук)
  release: 39, // пальцы разжались
  rest: 50, // рука вернулась, спокойно смотрит на корзину
  stand: 66, // выпрямился
} as const;

// ---------- мир сада ----------
export const GARDEN = {
  horizonY: 905, // низ дальней полосы деревьев
  fenceY: 1000, // низ невысокого забора
  trunk: { x: 1482, baseY: 1258 },
  // садовник: точка между ступнями и рост
  man: { x: 1830, y: 1262, h: 500 },
  // корзина: середина дна (чуть ближе к камере, чем ступни), ширина, высота
  basket: { x: 1746, y: 1288, w: 168, h: 158 },
} as const;

const APPLE_R = 14.5;

const SKY_TOP = "#BFD9EC";
const SKY_MID = "#DCE9EF";
const SKY_LOW = "#EEEBDA";
const BARK = "#6B4E3A";
const BARK_DARK = "#54392A";
const BARK_LIGHT = "#86664F";
// листва: тёмная (низ и тень) → светлая (верх справа, к солнцу)
const LEAF_BACK = ["#4A7238", "#527E3F", "#5E8A47", "#68934E"];
const LEAF_MID = ["#5E8A47", "#6F9A52", "#7FAF63", "#8DBA6E"];
const LEAF_FRONT = ["#6F9A52", "#7FAF63", "#8DBA6E", "#9CC67B"];
const WOOD = "#B48C62";
const WOOD_DARK = "#93704D";
const WOOD_LIGHT = "#CDA97D";

// ---------- садовник ----------
// Обычный взрослый (40–50 лет): светлая рубашка, оливковый рабочий жилет,
// рабочие брюки и ботинки, короткая борода с проседью, тёмная кепка.
export const GARDENER: Look = {
  build: ADULT,
  skin: "#D9A47C",
  skinShade: "#C28A63",
  hair: "#3E3631",
  hairStyle: "manShort",
  top: "vest",
  topColor: "#6E6B3E",
  topShade: shadeOf("#6E6B3E", 0.82),
  inner: "#E9E0CB",
  bottom: "#4F4A3F",
  socks: "#4E3829",
  brow: "#3A322D",
  lips: "#A86A5C",
  beard: "#6F665E",
};
const CAP = "#4B4F3A";
const CAP_SHADE = "#3A3D2C";

// ---------- покачивание листвы ----------
const swayAt = (f: number, seed: number) => Math.sin((f + seed * 13) / 41) * 0.55 + Math.sin((f + seed * 7) / 97) * 0.4;

// ---------- яблоко ----------
// Центр (x, y), радиус r; плодоножка вверх (поворот rot).
export const Apple: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly rot?: number; readonly stem?: boolean; readonly leaf?: boolean; readonly tone?: number }> = ({ x, y, r = APPLE_R, rot = 0, stem = true, leaf = false, tone = 0 }) => {
  const base = tone === 1 ? "#B93328" : tone === 2 ? "#CF4431" : "#C63A2D";
  const body = `M 0 ${-0.74 * r} C ${0.34 * r} ${-1.04 * r} ${1.04 * r} ${-0.96 * r} ${1.02 * r} ${-0.08 * r} C ${1.0 * r} ${0.62 * r} ${0.52 * r} ${1.0 * r} 0 ${0.93 * r} C ${-0.52 * r} ${1.0 * r} ${-1.0 * r} ${0.62 * r} ${-1.02 * r} ${-0.08 * r} C ${-1.04 * r} ${-0.96 * r} ${-0.34 * r} ${-1.04 * r} 0 ${-0.74 * r} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={body} fill={base} />
      {/* тень слева снизу (свет справа сверху) */}
      <path d={`M ${-1.0 * r} ${-0.2 * r} C ${-0.98 * r} ${0.62 * r} ${-0.5 * r} ${0.98 * r} 0 ${0.92 * r} C ${-0.42 * r} ${0.7 * r} ${-0.7 * r} ${0.3 * r} ${-1.0 * r} ${-0.2 * r} Z`} fill="#9C2A22" opacity={0.75} />
      {/* жёлто-красный румянец и блик справа сверху */}
      <ellipse cx={0.42 * r} cy={-0.3 * r} rx={0.42 * r} ry={0.34 * r} fill="#E0644C" opacity={0.85} />
      <ellipse cx={0.5 * r} cy={-0.42 * r} rx={0.16 * r} ry={0.11 * r} fill="#FFF3E0" opacity={0.7} transform={`rotate(-30 ${0.5 * r} ${-0.42 * r})`} />
      <path d={`M ${-0.16 * r} ${-0.74 * r} Q 0 ${-0.6 * r} ${0.16 * r} ${-0.74 * r}`} stroke="#7E2019" strokeWidth={Math.max(1, r * 0.08)} fill="none" strokeLinecap="round" opacity={0.7} />
      {stem ? <path d={`M 0 ${-0.66 * r} Q ${0.06 * r} ${-0.95 * r} ${0.2 * r} ${-1.2 * r}`} stroke="#5A3E2B" strokeWidth={Math.max(1.4, r * 0.14)} fill="none" strokeLinecap="round" /> : null}
      {leaf ? <path d={`M ${0.14 * r} ${-1.05 * r} Q ${0.62 * r} ${-1.5 * r} ${1.05 * r} ${-1.18 * r} Q ${0.6 * r} ${-0.86 * r} ${0.14 * r} ${-1.05 * r} Z`} fill="#6F9A52" /> : null}
    </g>
  );
};

// ---------- небо, дальние деревья, забор, трава ----------
const Backdrop: React.FC<{ readonly f: number }> = ({ f }) => {
  const H = GARDEN.horizonY;
  // мягкие облака медленно плывут влево
  const clouds = [
    { x: 520, y: 210, s: 1.0 },
    { x: 1560, y: 120, s: 0.8 },
    { x: 2600, y: 240, s: 1.15 },
  ];
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="l819-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SKY_TOP} />
          <stop offset="0.62" stopColor={SKY_MID} />
          <stop offset="1" stopColor={SKY_LOW} />
        </linearGradient>
        <linearGradient id="l819-lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A5C47E" />
          <stop offset="0.35" stopColor="#8FB46A" />
          <stop offset="1" stopColor="#729A57" />
        </linearGradient>
      </defs>
      <rect x={-600} y={-400} width={4200} height={H + 420} fill="url(#l819-sky)" />
      {clouds.map((c, i) => {
        const cx = c.x - f * 0.08;
        return (
          <g key={i} opacity={0.85} transform={`translate(${cx} ${c.y}) scale(${c.s})`}>
            <ellipse cx={0} cy={0} rx={120} ry={34} fill="#F7FAFB" />
            <ellipse cx={-50} cy={-18} rx={62} ry={38} fill="#F7FAFB" />
            <ellipse cx={34} cy={-26} rx={70} ry={46} fill="#F7FAFB" />
            <ellipse cx={10} cy={8} rx={110} ry={20} fill="#E9F1F5" />
          </g>
        );
      })}
      {/* дальние холмы и полоса деревьев (воздушная дымка) */}
      <path d={`M -600 ${H - 90} Q 300 ${H - 170} 1100 ${H - 110} T 2600 ${H - 120} T 3600 ${H - 100} L 3600 ${H + 20} L -600 ${H + 20} Z`} fill="#C9D8C0" />
      {Array.from({ length: 30 }, (_, i) => {
        const x = -560 + i * 140 + hash01(i * 3.1) * 60;
        const r = 70 + hash01(i * 5.7) * 50;
        return <ellipse key={i} cx={x} cy={H - r * 0.55} rx={r} ry={r * 0.72} fill={i % 3 === 0 ? "#AFC6A0" : i % 3 === 1 ? "#B8CDA8" : "#A6BF97"} />;
      })}
      {/* луг */}
      <rect x={-600} y={H - 10} width={4200} height={1100} fill="url(#l819-lawn)" />
      <path d={`M -600 ${H - 6} Q 1200 ${H - 26} 3600 ${H - 4} L 3600 ${H + 14} L -600 ${H + 14} Z`} fill="#9BBE76" />
      {/* светлые и тёмные пятна травы */}
      {Array.from({ length: 16 }, (_, i) => {
        const x = -500 + i * 260 + hash01(i * 2.3) * 120;
        const y = H + 60 + hash01(i * 4.9) * 420;
        return <ellipse key={i} cx={x} cy={y} rx={180 + hash01(i) * 120} ry={22 + hash01(i * 7.7) * 16} fill={i % 2 ? "#9CC07A" : "#7CA45E"} opacity={0.45} />;
      })}
      {/* ряды яблонь сада вдали, за забором */}
      {[
        { x: 260, y: H + 40, s: 0.42 },
        { x: 640, y: H + 30, s: 0.36 },
        { x: 2420, y: H + 50, s: 0.46 },
        { x: 2840, y: H + 34, s: 0.38 },
        { x: 3180, y: H + 44, s: 0.42 },
      ].map((t, i) => (
        <FarAppleTree key={i} x={t.x} y={t.y} s={t.s} seed={i * 11 + 3} />
      ))}
    </svg>
  );
};

// Дальняя яблоня (бледнее и проще, без покачивания).
const FarAppleTree: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly seed: number }> = ({ x, y, s, seed }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
    <ellipse cx={0} cy={4} rx={260} ry={26} fill="#6F955A" opacity={0.35} />
    <path d="M -26 0 C -20 -120 -16 -220 -12 -300 L 14 -300 C 18 -220 22 -120 30 0 Z" fill="#8C7462" />
    <ellipse cx={-10} cy={-470} rx={330} ry={250} fill="#93B486" />
    <ellipse cx={-120} cy={-420} rx={190} ry={150} fill="#8AAD7C" />
    <ellipse cx={110} cy={-500} rx={200} ry={160} fill="#A0BF92" />
    {Array.from({ length: 9 }, (_, i) => {
      const a = hash01(seed + i * 2.1) * Math.PI * 2;
      const d = Math.sqrt(hash01(seed + i * 4.3)) * 230;
      return <circle key={i} cx={Math.cos(a) * d} cy={-460 + Math.sin(a) * d * 0.7} r={16} fill="#C9776A" />;
    })}
  </g>
);

// Невысокий деревянный забор на середине луга.
const Fence: React.FC = () => {
  const y = GARDEN.fenceY;
  const posts = Array.from({ length: 30 }, (_, i) => -560 + i * 150);
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <rect x={-600} y={y - 2} width={4200} height={10} fill="#6F955A" opacity={0.35} />
      {[y - 96, y - 52].map((ry, i) => (
        <g key={i}>
          <rect x={-600} y={ry} width={4200} height={13} rx={4} fill={WOOD} />
          <rect x={-600} y={ry} width={4200} height={4} rx={2} fill={WOOD_LIGHT} opacity={0.8} />
          <rect x={-600} y={ry + 10} width={4200} height={3} fill={WOOD_DARK} opacity={0.6} />
        </g>
      ))}
      {posts.map((x, i) => (
        <g key={i}>
          <path d={`M ${x - 9} ${y + 4} L ${x - 9} ${y - 112} L ${x} ${y - 122} L ${x + 9} ${y - 112} L ${x + 9} ${y + 4} Z`} fill={WOOD} />
          <path d={`M ${x - 9} ${y + 4} L ${x - 9} ${y - 112} L ${x - 3} ${y - 118} L ${x - 3} ${y + 4} Z`} fill={WOOD_DARK} opacity={0.75} />
          <path d={`M ${x + 4} ${y + 4} L ${x + 4} ${y - 117} L ${x + 9} ${y - 112} L ${x + 9} ${y + 4} Z`} fill={WOOD_LIGHT} opacity={0.7} />
        </g>
      ))}
    </svg>
  );
};

// Кустики травы (мягко качаются).
const Tufts: React.FC<{ readonly f: number; readonly items: readonly { readonly x: number; readonly y: number; readonly s: number }[] }> = ({ f, items }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {items.map((t, i) => {
      const k = Math.sin((f + i * 23) / 37) * 3;
      return (
        <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
          {[-16, -7, 2, 11, 19].map((dx, j) => (
            <path key={j} d={`M ${dx} 2 q ${dx * 0.25 + k * 0.4} -20 ${dx * 0.7 + k} -${30 + ((j * 7) % 13)}`} stroke={j % 2 ? "#5F8A47" : "#6E9A52"} strokeWidth={3.2} fill="none" strokeLinecap="round" />
          ))}
        </g>
      );
    })}
  </svg>
);

const BACK_TUFTS = Array.from({ length: 34 }, (_, i) => ({ x: -500 + i * 118 + hash01(i * 1.9) * 60, y: GARDEN.horizonY + 40 + hash01(i * 6.1) * 260, s: 0.7 + hash01(i * 2.7) * 0.3 }));
const FRONT_TUFTS = [
  { x: 1390, y: 1268, s: 1.1 },
  { x: 1580, y: 1272, s: 1.0 },
  { x: 1660, y: 1302, s: 1.05 },
  { x: 1952, y: 1290, s: 1.15 },
  { x: 2120, y: 1330, s: 1.2 },
  { x: 1240, y: 1340, s: 1.2 },
  { x: 900, y: 1300, s: 1.1 },
  { x: 2400, y: 1300, s: 1.1 },
  { x: 1880, y: 1380, s: 1.3 },
  { x: 1500, y: 1400, s: 1.3 },
];

// ---------- яблоня ----------
type Pt = { readonly x: number; readonly y: number };
const qAt = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

// Ветка с плавным сужением (контур по квадратичной кривой).
const Limb: React.FC<{ readonly a: Pt; readonly c: Pt; readonly b: Pt; readonly w0: number; readonly w1: number; readonly col?: string }> = ({ a, c, b, w0, w1, col = BARK }) => {
  const N = 12;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = qAt(a, c, b, t);
    const d = {
      x: 2 * (1 - t) * (c.x - a.x) + 2 * t * (b.x - c.x),
      y: 2 * (1 - t) * (c.y - a.y) + 2 * t * (b.y - c.y),
    };
    const len = Math.hypot(d.x, d.y) || 1;
    const nx = -d.y / len;
    const ny = d.x / len;
    const w = lerp(w0, w1, t) / 2;
    L.push({ x: p.x + nx * w, y: p.y + ny * w });
    R.push({ x: p.x - nx * w, y: p.y - ny * w });
  }
  const pts = [...L, ...R.reverse()];
  const d = `M ${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")} Z`;
  // светлая кромка сверху справа
  const hi = L.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
  return (
    <g>
      <path d={d} fill={col} stroke={col} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={`M ${hi}`} stroke={BARK_LIGHT} strokeWidth={Math.max(2, w0 * 0.14)} fill="none" strokeLinecap="round" opacity={0.5} />
      <circle cx={b.x} cy={b.y} r={w1 / 2} fill={col} />
    </g>
  );
};

type ClumpDef = { readonly x: number; readonly y: number; readonly r: number; readonly seed: number; readonly apples?: readonly (readonly [number, number])[] };

// Масса листвы: тёмная основа и листья-эллипсы; к солнцу (вправо вверх)
// листья светлее. Яблоки этой массы качаются вместе с ней.
const Clump: React.FC<{ readonly c: ClumpDef; readonly f: number; readonly pal: readonly string[]; readonly amp?: number }> = ({ c, f, pal, amp = 1 }) => {
  const { x, y, r, seed } = c;
  const n = Math.round(12 + r / 10);
  const sway = swayAt(f, seed) * amp;
  return (
    <g transform={`rotate(${sway.toFixed(3)} ${x} ${y + r})`}>
      <ellipse cx={x} cy={y + r * 0.04} rx={r * 0.9} ry={r * 0.78} fill={pal[0]} />
      {Array.from({ length: n }, (_, i) => {
        const a = hash01(seed + i * 1.7) * Math.PI * 2;
        const d = Math.sqrt(hash01(seed + i * 3.3)) * r * 0.82;
        const lx = x + Math.cos(a) * d;
        const ly = y + Math.sin(a) * d * 0.82;
        const lit = ((lx - x) * 0.55 - (ly - y)) / r + (hash01(seed + i * 9.1) - 0.5) * 0.5;
        const col = pal[clamp(Math.floor((lit + 0.7) * 2.2), 0, pal.length - 1)];
        const rot = hash01(seed + i * 5.1) * 180;
        return <ellipse key={i} cx={lx.toFixed(1)} cy={ly.toFixed(1)} rx={r * 0.28} ry={r * 0.15} fill={col} transform={`rotate(${rot.toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})`} />;
      })}
      {(c.apples ?? []).map(([dx, dy], i) => (
        <Apple key={i} x={x + dx} y={y + dy} rot={(hash01(seed + i * 2.9) - 0.5) * 30} tone={i % 3} leaf={i % 3 === 1} />
      ))}
    </g>
  );
};

// Кроны: задний слой (тень), средний и нижняя кайма.
const CROWN_BACK: readonly ClumpDef[] = [
  { x: 1180, y: 560, r: 220, seed: 3 },
  { x: 1480, y: 420, r: 260, seed: 7 },
  { x: 1790, y: 520, r: 230, seed: 11 },
  { x: 1320, y: 320, r: 190, seed: 13 },
  { x: 1660, y: 330, r: 200, seed: 17 },
  { x: 990, y: 700, r: 150, seed: 19 },
  { x: 1960, y: 640, r: 140, seed: 23 },
];
const CROWN_MID: readonly ClumpDef[] = [
  { x: 1500, y: 450, r: 200, seed: 29, apples: [[-80, 40], [60, -30], [120, 70]] },
  { x: 1250, y: 420, r: 160, seed: 31, apples: [[-40, 50], [60, 10]] },
  { x: 1730, y: 410, r: 160, seed: 37, apples: [[30, 50], [-60, -20]] },
  { x: 1130, y: 690, r: 170, seed: 41, apples: [[-60, 40], [50, 80], [-10, -40]] },
  { x: 1360, y: 610, r: 190, seed: 43, apples: [[-30, 90], [70, 20], [-90, -10]] },
  { x: 1610, y: 600, r: 185, seed: 47, apples: [[40, 80], [-50, 30], [90, -40]] },
  { x: 1860, y: 610, r: 150, seed: 53, apples: [[20, 60], [-40, -30]] },
];
const CROWN_FRONT: readonly ClumpDef[] = [
  { x: 1020, y: 790, r: 115, seed: 59, apples: [[10, 40]] },
  { x: 1250, y: 790, r: 125, seed: 61, apples: [[-30, 50], [50, 30]] },
  { x: 1490, y: 770, r: 120, seed: 67, apples: [[20, 55]] },
];

// Низкая ветка справа (садовник стоит под ней): основание у развилки.
const LOW = { a: { x: 1500, y: 884 }, c: { x: 1646, y: 690 }, b: { x: 1950, y: 676 } } as const;
const LOW_PIVOT = LOW.a;
// Место плодоножки сорванного яблока на ветке (t = 0,55 по кривой).
const PICK_T = 0.55;
const PICK_STEM = 8; // длина плодоножки до верха яблока

// Поворот низкой ветки (градусы, по часовой — вниз справа): лёгкое
// покачивание; при срыве садовник чуть тянет её вниз, после отрыва ветка
// мягко пружинит и успокаивается.
const lowLimbRot = (f: number) => {
  const T = GARDEN_TIMING;
  const sway = Math.sin((f + 40) / 47) * 0.12 + Math.sin(f / 89) * 0.08;
  const pull = f < T.grab ? 0 : f < T.detach ? 0.9 * easeInOut((f - T.grab) / (T.detach - T.grab)) : 0;
  const s = f - T.detach;
  const spring = f < T.detach ? 0 : 0.9 * Math.exp(-s / 6) * Math.cos(s * 0.75);
  return sway + pull + spring;
};
const rotAbout = (p: Pt, o: Pt, deg: number): Pt => {
  const a = rad(deg);
  const dx = p.x - o.x;
  const dy = p.y - o.y;
  return { x: o.x + dx * Math.cos(a) - dy * Math.sin(a), y: o.y + dx * Math.sin(a) + dy * Math.cos(a) };
};
// Центр яблока на ветке (до срыва) в кадре f.
const appleOnBranch = (f: number): Vec => {
  const p = qAt(LOW.a, LOW.c, LOW.b, PICK_T);
  const top = rotAbout(p, LOW_PIVOT, lowLimbRot(f));
  return { x: top.x, y: top.y + PICK_STEM + APPLE_R * 0.95 };
};

// Листва и яблоки на низкой ветке (относительно точки на кривой).
const LOW_LEAVES: readonly { readonly t: number; readonly dx: number; readonly dy: number; readonly r: number; readonly seed: number }[] = [
  { t: 0.3, dx: -6, dy: -40, r: 70, seed: 71 },
  { t: 0.68, dx: 10, dy: -44, r: 66, seed: 73 },
  { t: 0.86, dx: 4, dy: -36, r: 72, seed: 79 },
  { t: 1.0, dx: 26, dy: -10, r: 64, seed: 83 },
  { t: 0.97, dx: 10, dy: 22, r: 44, seed: 89 },
];
const LOW_APPLES: readonly { readonly t: number; readonly dx: number }[] = [
  { t: 0.4, dx: -4 },
  { t: 0.93, dx: 8 },
];

const LowBranch: React.FC<{ readonly f: number; readonly picked: boolean }> = ({ f, picked }) => {
  const rot = lowLimbRot(f);
  const pick = qAt(LOW.a, LOW.c, LOW.b, PICK_T);
  return (
    <g transform={`rotate(${rot.toFixed(3)} ${LOW_PIVOT.x} ${LOW_PIVOT.y})`}>
      {LOW_LEAVES.map((l, i) => {
        const p = qAt(LOW.a, LOW.c, LOW.b, l.t);
        return <Clump key={i} c={{ x: p.x + l.dx, y: p.y + l.dy, r: l.r, seed: l.seed }} f={f} pal={LEAF_MID} amp={0.6} />;
      })}
      <Limb a={LOW.a} c={LOW.c} b={LOW.b} w0={30} w1={8} />
      {/* короткий сучок-плодушка, на котором висит яблоко */}
      <path d={`M ${pick.x - 2} ${pick.y - 2} L ${pick.x} ${pick.y + 6}`} stroke={BARK_DARK} strokeWidth={5} strokeLinecap="round" />
      {LOW_APPLES.map((a, i) => {
        const p = qAt(LOW.a, LOW.c, LOW.b, a.t);
        return (
          <g key={i}>
            <path d={`M ${p.x + a.dx * 0.3} ${p.y} L ${p.x + a.dx} ${p.y + PICK_STEM + 2}`} stroke="#5A3E2B" strokeWidth={2.4} strokeLinecap="round" />
            <Apple x={p.x + a.dx} y={p.y + PICK_STEM + APPLE_R * 0.95} stem={false} tone={i + 1} />
          </g>
        );
      })}
      {!picked ? (
        <g>
          <path d={`M ${pick.x} ${pick.y + 4} L ${pick.x} ${pick.y + PICK_STEM + 3}`} stroke="#5A3E2B" strokeWidth={2.6} strokeLinecap="round" />
          <Apple x={pick.x} y={pick.y + PICK_STEM + APPLE_R * 0.95} stem={false} />
        </g>
      ) : null}
      {/* пара листьев у плодушки, перед веткой */}
      <ellipse cx={pick.x + 16} cy={pick.y - 4} rx={17} ry={8} fill="#7FAF63" transform={`rotate(-24 ${pick.x + 16} ${pick.y - 4})`} />
      <ellipse cx={pick.x - 15} cy={pick.y - 2} rx={15} ry={7} fill="#6F9A52" transform={`rotate(28 ${pick.x - 15} ${pick.y - 2})`} />
    </g>
  );
};

const AppleTree: React.FC<{ readonly f: number; readonly picked: boolean }> = ({ f, picked }) => {
  const T = GARDEN.trunk;
  const trunk = `M ${T.x - 72} ${T.baseY + 6} C ${T.x - 42} ${T.baseY - 20} ${T.x - 36} ${T.baseY - 120} ${T.x - 36} ${T.baseY - 220} C ${T.x - 36} ${T.baseY - 300} ${T.x - 42} ${T.baseY - 340} ${T.x - 34} ${T.baseY - 392} L ${T.x + 34} ${T.baseY - 394} C ${T.x + 32} ${T.baseY - 330} ${T.x + 30} ${T.baseY - 290} ${T.x + 34} ${T.baseY - 210} C ${T.x + 36} ${T.baseY - 110} ${T.x + 42} ${T.baseY - 24} ${T.x + 76} ${T.baseY + 6} Z`;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {/* мягкая тень кроны на траве */}
      <ellipse cx={T.x + 40} cy={T.baseY + 6} rx={430} ry={42} fill="#4E7340" opacity={0.22} />
      {CROWN_BACK.map((c) => (
        <Clump key={c.seed} c={c} f={f} pal={LEAF_BACK} amp={0.7} />
      ))}
      {/* ствол и скелетные ветви */}
      <Limb a={{ x: T.x - 6, y: 900 }} c={{ x: 1350, y: 760 }} b={{ x: 1170, y: 690 }} w0={42} w1={14} />
      <Limb a={{ x: T.x, y: 890 }} c={{ x: 1470, y: 700 }} b={{ x: 1500, y: 520 }} w0={40} w1={12} />
      <Limb a={{ x: T.x + 6, y: 890 }} c={{ x: 1640, y: 760 }} b={{ x: 1780, y: 560 }} w0={34} w1={11} />
      <Limb a={{ x: T.x - 10, y: 910 }} c={{ x: 1240, y: 800 }} b={{ x: 1000, y: 820 }} w0={28} w1={9} />
      <path d={trunk} fill={BARK} />
      <path d={`M ${T.x - 14} ${T.baseY - 6} C ${T.x - 16} ${T.baseY - 140} ${T.x - 20} ${T.baseY - 280} ${T.x - 14} ${T.baseY - 380}`} stroke={BARK_DARK} strokeWidth={9} fill="none" opacity={0.45} strokeLinecap="round" />
      <path d={`M ${T.x + 16} ${T.baseY - 10} C ${T.x + 14} ${T.baseY - 150} ${T.x + 12} ${T.baseY - 280} ${T.x + 18} ${T.baseY - 370}`} stroke={BARK_LIGHT} strokeWidth={7} fill="none" opacity={0.45} strokeLinecap="round" />
      <path d={`M ${T.x - 24} ${T.baseY - 160} q 10 -14 22 -4`} stroke={BARK_DARK} strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
      {CROWN_MID.map((c) => (
        <Clump key={c.seed} c={c} f={f} pal={LEAF_MID} />
      ))}
      {CROWN_FRONT.map((c) => (
        <Clump key={c.seed} c={c} f={f} pal={LEAF_FRONT} amp={1.2} />
      ))}
      <LowBranch f={f} picked={picked} />
    </svg>
  );
};

// ---------- корзина ----------
// Плетёная корзина: середина дна (x, y), ширина w, высота h. Внутри горка
// яблок; extra — яблоко, уже положенное садовником (лежит сверху горки).
const HEAP: readonly (readonly [number, number, number])[] = [
  [-0.3, 0.02, 0],
  [0.02, 0.03, 1],
  [0.31, 0.02, 2],
  [-0.15, -0.09, 2],
  [0.17, -0.1, 0],
];
// Место, куда ложится сорванное яблоко (центр, мир).
export const BASKET_SPOT: Vec = { x: GARDEN.basket.x - 4, y: GARDEN.basket.y - GARDEN.basket.h - APPLE_R * 2.55 };

const Basket: React.FC<{ readonly extra: boolean }> = ({ extra }) => {
  const { x, y, w, h } = GARDEN.basket;
  const top = y - h;
  const rx = w / 2;
  const ry = w * 0.13;
  const bx = w * 0.38; // полуширина дна
  const body = `M ${x - rx} ${top} L ${x - bx} ${y - 6} Q ${x} ${y + 12} ${x + bx} ${y - 6} L ${x + rx} ${top} A ${rx} ${ry} 0 0 1 ${x - rx} ${top} Z`;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <clipPath id="l819-basket">
          <path d={body} />
        </clipPath>
      </defs>
      <ellipse cx={x + 10} cy={y + 2} rx={w * 0.62} ry={14} fill="#3F5E30" opacity={0.3} />
      {/* задний край и тёмная глубина */}
      <ellipse cx={x} cy={top} rx={rx} ry={ry} fill="#9C7442" />
      <ellipse cx={x} cy={top + 2} rx={rx - 7} ry={ry - 4} fill="#5C3F25" />
      {/* горка яблок */}
      {HEAP.map(([dx, dy, tone], i) => (
        <Apple key={i} x={x + dx * w} y={top + dy * w - APPLE_R * 0.35} rot={(i - 2) * 14} tone={tone} stem={i % 2 === 0} />
      ))}
      {extra ? <Apple x={BASKET_SPOT.x} y={BASKET_SPOT.y} rot={-8} /> : null}
      {/* плетёный бок: полосы и прутья */}
      <path d={body} fill="#B88A52" />
      <g clipPath="url(#l819-basket)">
        {Array.from({ length: 8 }, (_, i) => {
          const yy = top + 10 + i * ((h - 6) / 7);
          return <path key={i} d={`M ${x - rx - 4} ${yy} Q ${x} ${yy + ry * 1.3} ${x + rx + 4} ${yy}`} stroke={i % 2 ? "#A97C47" : "#C99A5E"} strokeWidth={10} fill="none" />;
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const u = -1 + (i + 0.5) * (2 / 9);
          return <path key={i} d={`M ${x + u * rx} ${top + ry * Math.sqrt(1 - u * u)} L ${x + u * bx} ${y}`} stroke="#8E6638" strokeWidth={2.4} opacity={0.55} />;
        })}
        {/* тень слева (свет справа) */}
        <rect x={x - rx - 10} y={top - 10} width={w * 0.34} height={h + 30} fill="#5C3F25" opacity={0.22} />
        <rect x={x + rx * 0.45} y={top - 10} width={w * 0.2} height={h + 30} fill="#FFF1D6" opacity={0.12} />
      </g>
      {/* передний обод */}
      <path d={`M ${x - rx} ${top} A ${rx} ${ry} 0 0 0 ${x + rx} ${top}`} stroke="#A0723E" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={`M ${x - rx + 6} ${top + 1} A ${rx} ${ry} 0 0 0 ${x + rx - 6} ${top + 1}`} stroke="#D2A66B" strokeWidth={2.5} fill="none" opacity={0.7} />
      {/* боковые ручки */}
      <path d={`M ${x - rx + 4} ${top - 2} q -16 -2 -16 14 q 2 10 14 8`} stroke="#9C7442" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={`M ${x + rx - 4} ${top - 2} q 16 -2 16 14 q -2 10 -14 8`} stroke="#A97C47" strokeWidth={6} fill="none" strokeLinecap="round" />
    </svg>
  );
};

// ---------- садовник: постановка ----------
const B = GARDENER.build;
const MAN = GARDEN.man;
const K = MAN.h / 1000;
const SEED = 7;
const TURN_BODY = 0.8;
const GRIP = 0.6; // центр яблока от запястья вдоль кисти (доли длины кисти)
const ELBOW_DOWN: Vec = { x: -0.5, y: 1 }; // локоть вниз (рука слева на экране)
const T = GARDEN_TIMING;

const placeMan = (): Place => MAN;
const faceAt = (t: number) => keys(t, [[0, -0.28], [12, -0.34], [30, -0.3], [56, -0.26]]);
const crouchAt = (t: number) => keys(t, [[19, 0], [34, 0.48], [44, 0.48], [66, 0]]);
const leanAt = (t: number) => keys(t, [[19, 0], [34, 8], [44, 8], [66, 0]]);
const breathAt = (t: number) => Math.sin((t + SEED * 17) / 26);
const bodyTurnAt = (t: number) => clamp(soften(faceAt, t - 6, 4) * TURN_BODY, -0.85, 0.85);

// Плечо руки слева на экране (правая рука садовника) — тот же расчёт, что
// в Figure для стоящего на месте персонажа (стопы в обычной стойке).
const shoulderAt = (t: number): Vec => {
  const bt = bodyTurnAt(t);
  const at = Math.abs(bt);
  const ws = 1 - 0.36 * at;
  const dy = 14 + crouchAt(t) * B.thigh * 1.05;
  const sy = B.shoulderY + dy + (1 - at) * leanAt(t) * 1.6 - breathAt(t) * 1.5;
  return { x: MAN.x + (-(B.shoulderHalf - B.limb * 0.45) * ws + bt * 6) * K, y: MAN.y + (sy + B.limb * 0.45) * K };
};
// Свободно опущенная рука (как REST в Figure).
const restWristAt = (t: number): Vec => {
  const S = shoulderAt(t);
  const at = Math.abs(bodyTurnAt(t));
  return { x: S.x - 16 * (1 - at) * K, y: S.y + (B.upperArm + B.forearm - 16) * K };
};
// Локоть и фактическое запястье для цели W (двухзвенная рука, как в Figure).
const armIK = (S: Vec, W: Vec) => {
  const toL = (p: Vec) => ({ x: (p.x - MAN.x) / K, y: (p.y - MAN.y) / K });
  const toW = (p: Vec) => ({ x: MAN.x + p.x * K, y: MAN.y + p.y * K });
  const r = twoBone(toL(S), toL(W), B.upperArm, B.forearm, ELBOW_DOWN);
  return { E: toW(r.mid), W: toW(r.end) };
};
// Точка хвата (центр яблока в кисти) для цели запястья W и доворота кисти.
const gripOf = (S: Vec, W: Vec, wrist: number): Vec => {
  const ik = armIK(S, W);
  const a = Math.atan2(ik.W.y - ik.E.y, ik.W.x - ik.E.x) + rad(wrist);
  const d = B.hand * GRIP * K;
  return { x: ik.W.x + Math.cos(a) * d, y: ik.W.y + Math.sin(a) * d };
};
// Обратная задача: куда поставить запястье, чтобы хват пришёлся в точку A.
const wristFor = (S: Vec, A: Vec, wrist: number): Vec => {
  let W: Vec = { x: A.x, y: A.y + B.hand * GRIP * K };
  for (let i = 0; i < 8; i++) {
    const g = gripOf(S, W, wrist);
    W = { x: W.x + (A.x - g.x), y: W.y + (A.y - g.y) };
  }
  return W;
};

// Путь яблока в руке после отрыва: рука опускается дугой вокруг плеча
// (садовник одновременно приседает) и останавливается над корзиной, затем
// яблоко мягко ложится на горку.
const ABOVE: Vec = { x: BASKET_SPOT.x + 3, y: BASKET_SPOT.y - 28 };
const appleCarry = (f: number, a0: Vec): Vec => {
  if (f <= 32) {
    const s0 = shoulderAt(T.detach);
    const s1 = shoulderAt(32);
    const S = shoulderAt(f);
    const u = easeInOut((f - T.detach) / (32 - T.detach));
    let ang0 = Math.atan2(a0.y - s0.y, a0.x - s0.x);
    if (ang0 < 0) ang0 += Math.PI * 2;
    const ang1 = Math.atan2(ABOVE.y - s1.y, ABOVE.x - s1.x);
    const d = lerp(Math.hypot(a0.x - s0.x, a0.y - s0.y), Math.hypot(ABOVE.x - s1.x, ABOVE.y - s1.y), u) * (1 - 0.08 * Math.sin(Math.PI * u));
    const ang = lerp(ang0, ang1, u);
    return { x: S.x + Math.cos(ang) * d, y: S.y + Math.sin(ang) * d };
  }
  const u = easeOut((f - 32) / (T.place - 32));
  return { x: lerp(ABOVE.x, BASKET_SPOT.x, u), y: lerp(ABOVE.y, BASKET_SPOT.y, u) };
};

type ArmPlan = { readonly W: Vec; readonly shape: HandShape; readonly wrist: number; readonly apple: Vec | null };

// Правая рука садовника по кадрам: цель запястья, форма кисти, яблоко в кисти.
const armPlan = (f: number): ArmPlan => {
  const S = shoulderAt(f);
  const rest = restWristAt(f);
  if (f < T.reach) return { W: rest, shape: "relax", wrist: 0, apple: null };
  if (f < T.grab) {
    // рука поднимается дугой вокруг плеча (локоть чуть согнут); ладонь раскрыта
    const u = easeInOut((f - T.reach) / (T.grab - T.reach));
    const goal = wristFor(S, appleOnBranch(f), -6);
    const a0 = Math.atan2(rest.y - S.y, rest.x - S.x);
    let a1 = Math.atan2(goal.y - S.y, goal.x - S.x);
    if (a1 < a0) a1 += Math.PI * 2;
    const d = lerp(Math.hypot(rest.x - S.x, rest.y - S.y), Math.hypot(goal.x - S.x, goal.y - S.y), u) * (1 - 0.1 * Math.sin(Math.PI * u));
    const ang = lerp(a0, a1, u);
    const p = { x: S.x + Math.cos(ang) * d, y: S.y + Math.sin(ang) * d };
    return { W: p, shape: f >= T.reach + 2 ? "open" : "relax", wrist: -6 * u, apple: null };
  }
  if (f < T.detach) {
    // сомкнул пальцы, чуть повернул кисть и потянул вниз — ветка следует
    const tw = -6 + 22 * easeInOut((f - T.grab) / (T.detach - T.grab));
    const A = appleOnBranch(f);
    const W = wristFor(S, A, tw);
    return { W, shape: "fist", wrist: tw, apple: gripOf(S, W, tw) };
  }
  if (f < T.release) {
    const a0 = gripOf(shoulderAt(T.detach), wristFor(shoulderAt(T.detach), appleOnBranch(T.detach), 16), 16);
    const tw = keys(f, [[T.detach, 16], [26, 0], [T.place, 0]]);
    const A = appleCarry(Math.min(f, T.place), a0);
    const W = wristFor(S, A, tw);
    return { W, shape: "fist", wrist: tw, apple: gripOf(S, W, tw) };
  }
  // разжал пальцы, приподнял кисть и вернул руку вниз
  const Wp = wristFor(shoulderAt(T.place), BASKET_SPOT, 0);
  const lifted = { x: Wp.x + 4, y: Wp.y - 16 };
  if (f < 41) {
    const u = easeOut((f - T.release) / 2);
    return { W: { x: lerp(Wp.x, lifted.x, u), y: lerp(Wp.y, lifted.y, u) }, shape: "open", wrist: 0, apple: null };
  }
  const u = easeInOut((f - 41) / (T.rest - 41));
  return { W: { x: lerp(lifted.x, rest.x, u), y: lerp(lifted.y, rest.y, u) }, shape: u > 0.6 ? "relax" : "open", wrist: 0, apple: null };
};

const poseMan = (f: number): PoseIn => {
  const plan = armPlan(f);
  const smile = clamp((f - 40) / 12);
  return {
    armL: { target: plan.W, shape: plan.shape, wrist: plan.wrist, elbow: "down" },
    expr: mixExpr(EXPR.focused, EXPR.softSmile, smile),
    lookX: keys(f, [[0, -0.45], [16, -0.45], [30, -0.1]]),
    lookY: keys(f, [[0, -1], [16, -1], [28, 0.7], [40, 0.8]]),
    nod: keys(f, [[0, -12], [16, -12], [30, 9], [60, 7]]),
    headTilt: keys(f, [[0, -5], [16, -5], [30, 1], [40, 2]]),
    crouch: crouchAt(f),
    lean: leanAt(f),
    turnBody: TURN_BODY,
  };
};

// Кепка садовника поверх волос (тот же расчёт положения головы, что в Figure).
// f — кадр действия, bf — кадр рига (дыхание).
const Cap: React.FC<{ readonly f: number; readonly bf: number }> = ({ f, bf }) => {
  const bt = bodyTurnAt(f);
  const at = Math.abs(bt);
  const sgn = bt >= 0 ? 1 : -1;
  const head = soften(faceAt, f - 2, 2);
  const turn = clamp(head, -0.9, 0.9);
  const p = poseMan(f);
  const lean = p.lean ?? 0;
  const nod = p.nod ?? 0;
  const dy = 14 + crouchAt(f) * B.thigh * 1.05;
  const leanY = (1 - at) * lean * 1.6;
  const shy = -breathAt(bf) * 1.5;
  const neckX = bt * 8;
  const cx = neckX + bt * 4;
  const cy = B.headY + dy + leanY * 1.15 + shy * 0.8 + nod * 0.6;
  const neckTop = B.neckTop + dy + leanY + shy * 0.8;
  const rot = (p.headTilt ?? 0) + sgn * at * lean * 0.2;
  const rx = B.headRx;
  const ry = B.headRy;
  const s = turn * rx * 0.3;
  const dome = `M ${cx - rx * 1.04} ${cy - ry * 0.5} C ${cx - rx * 1.06} ${cy - ry * 1.42} ${cx + rx * 1.06} ${cy - ry * 1.42} ${cx + rx * 1.04} ${cy - ry * 0.5} Q ${cx} ${cy - ry * 0.62} ${cx - rx * 1.04} ${cy - ry * 0.5} Z`;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g transform={`translate(${MAN.x} ${MAN.y}) scale(${K}) rotate(${rot} ${neckX} ${neckTop})`}>
        <clipPath id="l819-cap">
          <path d={dome} />
        </clipPath>
        {/* купол кепки, тень слева (свет справа) */}
        <path d={dome} fill={CAP} />
        <g clipPath="url(#l819-cap)">
          <ellipse cx={cx - rx * 0.95 + s * 0.5} cy={cy - ry * 0.8} rx={rx * 0.55} ry={ry * 0.7} fill={CAP_SHADE} opacity={0.55} />
          <path d={`M ${cx - rx * 0.2 + s} ${cy - ry * 1.3} Q ${cx + s * 1.1} ${cy - ry * 0.9} ${cx + rx * 0.1 + s} ${cy - ry * 0.56}`} stroke={CAP_SHADE} strokeWidth={3} fill="none" opacity={0.7} />
        </g>
        <circle cx={cx + s * 0.35} cy={cy - ry * 1.16} r={5} fill={CAP_SHADE} />
        {/* короткий козырёк над лбом */}
        <path d={`M ${cx - rx * 0.78 + s} ${cy - ry * 0.6} Q ${cx + s} ${cy - ry * 0.7} ${cx + rx * 0.78 + s} ${cy - ry * 0.6} Q ${cx + s} ${cy - ry * 0.3} ${cx - rx * 0.78 + s} ${cy - ry * 0.6} Z`} fill={CAP_SHADE} />
        <path d={`M ${cx - rx * 0.74 + s} ${cy - ry * 0.6} Q ${cx + s} ${cy - ry * 0.68} ${cx + rx * 0.74 + s} ${cy - ry * 0.6}`} stroke="#6A6E50" strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// Садовник с корзиной: тело → кепка → корзина (перед ступнями) → яблоко в
// кисти → руки поверх яблока (пальцы обхватывают его).
// f — кадр рига (дыхание, моргание), off — сдвиг кадра действия: в общем
// плане садовник просто стоит (действие ещё не началось).
const GardenerAt: React.FC<{ readonly f: number; readonly off: number }> = ({ f, off }) => {
  const a = f - off;
  const plan = armPlan(a);
  const face = (t: number) => faceAt(t - off);
  const pose = (t: number) => poseMan(t - off);
  return (
    <>
      <Actor uid="l819-gardener" look={GARDENER} f={f} place={placeMan} face={face} pose={pose} seed={SEED} layer="body" />
      <Cap f={a} bf={f} />
      <Basket extra={a >= T.release} />
      {plan.apple ? (
        <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <Apple x={plan.apple.x} y={plan.apple.y} rot={lerp(0, -8, clamp((f - T.detach) / 20))} />
        </svg>
      ) : null}
      <Actor uid="l819-gardener" look={GARDENER} f={f} place={placeMan} face={face} pose={pose} seed={SEED} layer="arms" />
    </>
  );
};

// ---------- камера ----------
const CAM_TREE_A: Cam = { x: 1470, y: 712, zoom: 0.82 };
const CAM_TREE_B: Cam = { x: 1500, y: 700, zoom: 0.86 };
const CAM_WORK_A: Cam = { x: 1748, y: 1000, zoom: 1.3 };
const CAM_WORK_B: Cam = { x: 1740, y: 1006, zoom: 1.36 };
export const gardenCam = (f: number, variant: GardenVariant): Cam =>
  variant === "tree" ? camMove(f, 0, 180, CAM_TREE_A, CAM_TREE_B) : camMove(f, 0, 210, CAM_WORK_A, CAM_WORK_B);

// Длина «сцены» для риг-контекста (моргание, план шагов).
const SCENE_LEN = 300;
// Сдвиг кадра действия для садовника, который просто стоит.
const IDLE = 100000;

// План вставки целиком (1920×1080). f — кадры от начала плана; variant —
// "tree" (общий план яблони; gardener — показать садовника в исходной
// позе для монтажной связки с "worker") или "worker" (садовник срывает
// яблоко и кладёт его в корзину, см. GARDEN_TIMING).
export const GardenShot: React.FC<{ readonly f: number; readonly variant: GardenVariant; readonly gardener?: boolean }> = ({ f, variant, gardener = false }) => {
  const showMan = variant === "worker" || gardener;
  // в общем плане садовник (если показан) стоит в исходной позе
  const off = variant === "worker" ? 0 : IDLE;
  const picked = showMan && f - off >= T.grab;
  return (
    <SceneContext.Provider value={{ from: 0, len: SCENE_LEN }}>
      <Shot f={f} from={-1} to={Number.MAX_SAFE_INTEGER} cam={gardenCam(f, variant)} bg={SKY_MID}>
        <Backdrop f={f} />
        <Tufts f={f} items={BACK_TUFTS} />
        <Fence />
        <AppleTree f={f} picked={picked} />
        {showMan ? <GardenerAt f={f} off={off} /> : null}
        <Tufts f={f} items={FRONT_TUFTS} />
      </Shot>
    </SceneContext.Provider>
  );
};
