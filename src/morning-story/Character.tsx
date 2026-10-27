import { useCurrentFrame } from "remotion";

// Персонажи истории: плоская векторная 2D-графика, вид спереди.
// Риг: голова (мимика, моргание, взгляд, рот по репликам), руки из двух
// звеньев (плечо + локоть), ноги (стоит / идёт / скрыты), наклон и дыхание.
// Координаты рисунка: 400 × 1000, ноги внизу.

export type Kind =
  | "mom"
  | "dad"
  | "girl"
  | "driver"
  | "teacher"
  | "boss"
  | "rep";

export type Expr =
  | "neutral"
  | "smile"
  | "worried"
  | "surprised"
  | "annoyed"
  | "tired"
  | "calm"
  | "apologetic"
  | "embarrassed";

// Поза руки — точка кисти в координатах рисунка ДЛЯ ЛЕВОЙ руки (для правой
// зеркалится), локоть ставится автоматически (2-звенная IK, локоть наружу).
// x — смещение от центра тела (отрицательное = наружу), y — по высоте.
export type Arm = readonly [dx: number, y: number];
export type HandItem = "phone" | "keys" | "cup" | "folder" | "none";

export const ARM = {
  down: [-112, 560],
  relaxed: [-96, 540],
  hip: [-118, 470],
  phoneEar: [-52, 175],
  phoneLook: [-30, 380],
  phoneLookHigh: [-20, 330],
  wave: [-150, 120],
  waveB: [-180, 150],
  hair: [-70, 90],
  reach: [-200, 420],
  jacket: [-40, 300],
  point: [-260, 300],
  chin: [-14, 230],
  watch: [-10, 400],
  behindHead: [-90, 110],
  open: [-170, 470],
  hold: [-40, 470],
} as const satisfies Record<string, Arm>;

type Look = {
  skin: string;
  hair: string;
  top: string;
  topDark: string;
  bottom: string;
  shoes: string;
  child?: boolean;
};

const LOOKS: Record<Kind, Look> = {
  mom: {
    skin: "#EDC5A0",
    hair: "#3A2722",
    top: "#E07A5F",
    topDark: "#C9654B",
    bottom: "#2E3B5E",
    shoes: "#2B2B33",
  },
  dad: {
    skin: "#D8A77D",
    hair: "#231C1A",
    top: "#5D6D82",
    topDark: "#4A586B",
    bottom: "#323D4E",
    shoes: "#22252B",
  },
  girl: {
    skin: "#F2CBA8",
    hair: "#2E1F1B",
    top: "#24365F",
    topDark: "#1B2A4B",
    bottom: "#24365F",
    shoes: "#3A2F2A",
    child: true,
  },
  driver: {
    skin: "#C9996F",
    hair: "#3D3A38",
    top: "#7A5C45",
    topDark: "#634A37",
    bottom: "#3B3F47",
    shoes: "#25272B",
  },
  teacher: {
    skin: "#E6BD98",
    hair: "#4A3128",
    top: "#8E3B4A",
    topDark: "#76303D",
    bottom: "#3F4350",
    shoes: "#2A2A30",
  },
  boss: {
    skin: "#DCAF88",
    hair: "#8C8C8C",
    top: "#26334D",
    topDark: "#1D283E",
    bottom: "#26334D",
    shoes: "#1E2027",
  },
  rep: {
    skin: "#EEC7A3",
    hair: "#2F211D",
    top: "#FFC90E",
    topDark: "#E5B300",
    bottom: "#14285A",
    shoes: "#1E2333",
  },
};

type Geo = {
  headY: number;
  headR: number;
  shoulderY: number;
  shoulderHalf: number;
  waistY: number;
  waistHalf: number;
  hipY: number;
  legTop: number;
  legGap: number;
  upper: number;
  fore: number;
  limb: number;
};

const ADULT: Geo = {
  headY: 158,
  headR: 76,
  shoulderY: 268,
  shoulderHalf: 92,
  waistY: 520,
  waistHalf: 66,
  hipY: 590,
  legTop: 585,
  legGap: 34,
  upper: 150,
  fore: 140,
  limb: 44,
};
// Ребёнок: та же высота рисунка, другие пропорции (крупнее голова);
// на экране рисуется меньше (height).
const CHILD: Geo = {
  headY: 175,
  headR: 92,
  shoulderY: 318,
  shoulderHalf: 80,
  waistY: 560,
  waistHalf: 64,
  hipY: 650,
  legTop: 640,
  legGap: 32,
  upper: 150,
  fore: 136,
  limb: 42,
};

const INK = "#1E2A44";

// Моргание: короткое (3 кадра) примерно раз в 3–4 с, у каждого своё.
const blinkAt = (frame: number, seed: number) => {
  const period = 95 + (seed % 5) * 13;
  const ph = (frame + seed * 37) % period;
  return ph < 3 ? [0.15, 0.05, 0.4][ph] : 1;
};

const Face: React.FC<{
  kind: Kind;
  expr: Expr;
  mouth: number;
  blink: number;
  look: number;
  g: Geo;
}> = ({ kind, expr, mouth, blink, look, g }) => {
  const cx = 200;
  const cy = g.headY;
  const s = g.headR / 66;
  const eyeY = cy - 4 * s;
  const eyeDx = 23 * s;
  const lx = look * 4 * s;
  const tiredLid = expr === "tired" ? 0.55 : 1;
  const ry = 8.5 * s * blink * tiredLid;
  // брови: подъём внутреннего и внешнего края
  const brow: Record<Expr, [number, number]> = {
    neutral: [0, 0],
    smile: [2, 2],
    worried: [8, -3],
    surprised: [10, 9],
    annoyed: [-6, 3],
    tired: [3, -2],
    calm: [1, 1],
    apologetic: [8, -2],
    embarrassed: [7, 0],
  };
  const [bi, bo] = brow[expr];
  const by = eyeY - 22 * s;
  const browPath = (side: -1 | 1) => {
    const inner = cx + side * 10 * s;
    const outer = cx + side * 36 * s;
    return `M ${inner} ${by - bi * s} Q ${(inner + outer) / 2} ${by - (bi + bo) * 0.5 * s - 3 * s} ${outer} ${by - bo * s + 2 * s}`;
  };
  // рот: базовая форма по эмоции + открытие при речи
  const my = cy + 34 * s;
  const curve: Record<Expr, number> = {
    neutral: 2,
    smile: 9,
    worried: -4,
    surprised: 0,
    annoyed: -3,
    tired: -2,
    calm: 5,
    apologetic: -1,
    embarrassed: 3,
  };
  const c = curve[expr] * s;
  const w = (expr === "smile" ? 17 : 13) * s;
  const open = Math.max(mouth, expr === "surprised" ? 0.35 : 0);
  return (
    <g>
      {/* румянец */}
      <ellipse
        cx={cx - 34 * s}
        cy={cy + 18 * s}
        rx={11 * s}
        ry={7 * s}
        fill="#F08A7A"
        opacity={expr === "embarrassed" ? 0.55 : 0.22}
      />
      <ellipse
        cx={cx + 34 * s}
        cy={cy + 18 * s}
        rx={11 * s}
        ry={7 * s}
        fill="#F08A7A"
        opacity={expr === "embarrassed" ? 0.55 : 0.22}
      />
      {/* глаза */}
      {[-1, 1].map((side) => (
        <g key={side}>
          <ellipse
            cx={cx + side * eyeDx + lx}
            cy={eyeY}
            rx={6.5 * s}
            ry={Math.max(1.2, ry)}
            fill={INK}
          />
          {blink > 0.6 && tiredLid === 1 ? (
            <circle
              cx={cx + side * eyeDx + lx + 2 * s}
              cy={eyeY - 3 * s}
              r={1.8 * s}
              fill="#FFFFFF"
            />
          ) : null}
          {expr === "tired" ? (
            <path
              d={`M ${cx + side * eyeDx - 9 * s} ${eyeY - 4 * s} Q ${cx + side * eyeDx} ${eyeY - 7 * s} ${cx + side * eyeDx + 9 * s} ${eyeY - 4 * s}`}
              stroke={INK}
              strokeWidth={2.5 * s}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}
        </g>
      ))}
      {/* брови */}
      {[-1, 1].map((side) => (
        <path
          key={side}
          d={browPath(side as -1 | 1)}
          stroke={kind === "boss" ? "#6E6E6E" : INK}
          strokeWidth={4.5 * s}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {/* нос */}
      <path
        d={`M ${cx - 3 * s} ${cy + 12 * s} Q ${cx + 4 * s} ${cy + 17 * s} ${cx - 1 * s} ${cy + 20 * s}`}
        stroke="#B9805E"
        strokeWidth={3 * s}
        fill="none"
        strokeLinecap="round"
      />
      {/* рот */}
      {open > 0.12 ? (
        <path
          d={`M ${cx - w * 0.85} ${my} Q ${cx} ${my + c * 0.6 - 2 * s} ${cx + w * 0.85} ${my} Q ${cx} ${my + (6 + 16 * open) * s + c * 0.4} ${cx - w * 0.85} ${my} Z`}
          fill="#7A2E33"
        />
      ) : (
        <path
          d={`M ${cx - w} ${my} Q ${cx} ${my + c} ${cx + w} ${my}`}
          stroke="#7A2E33"
          strokeWidth={4 * s}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

// Причёска: задняя часть (за головой) и передняя (чёлка), плюс аксессуары.
const HairBack: React.FC<{ kind: Kind; color: string; g: Geo }> = ({
  kind,
  color,
  g,
}) => {
  const cx = 200;
  const cy = g.headY;
  const r = g.headR;
  if (kind === "mom")
    return (
      <path
        d={`M ${cx - r - 8} ${cy - 10} Q ${cx - r - 14} ${cy + r + 30} ${cx - r + 6} ${cy + r + 38} L ${cx + r - 6} ${cy + r + 38} Q ${cx + r + 14} ${cy + r + 30} ${cx + r + 8} ${cy - 10} Z`}
        fill={color}
      />
    );
  if (kind === "girl")
    return (
      <g fill={color}>
        <ellipse cx={cx - r - 14} cy={cy + 34} rx={22} ry={46} />
        <ellipse cx={cx + r + 14} cy={cy + 34} rx={22} ry={46} />
        <circle cx={cx - r - 4} cy={cy - 6} r={13} fill="#FFC90E" />
        <circle cx={cx + r + 4} cy={cy - 6} r={13} fill="#FFC90E" />
      </g>
    );
  if (kind === "teacher")
    return <circle cx={cx} cy={cy - r - 6} r={30} fill={color} />;
  if (kind === "rep")
    return (
      <path
        d={`M ${cx + r - 10} ${cy - 30} Q ${cx + r + 40} ${cy + 10} ${cx + r + 18} ${cy + 80} Q ${cx + r + 4} ${cy + 30} ${cx + r - 16} ${cy + 4} Z`}
        fill={color}
      />
    );
  return null;
};

const HairFront: React.FC<{ kind: Kind; color: string; g: Geo }> = ({
  kind,
  color,
  g,
}) => {
  const cx = 200;
  const cy = g.headY;
  const r = g.headR;
  const top = cy - r;
  switch (kind) {
    case "mom":
      return (
        <path
          d={`M ${cx - r - 6} ${cy + 4} Q ${cx - r - 8} ${top - 16} ${cx} ${top - 14} Q ${cx + r + 10} ${top - 14} ${cx + r + 6} ${cy + 10} Q ${cx + r - 8} ${cy - 30} ${cx + 10} ${top + 22} Q ${cx - 40} ${top + 34} ${cx - r + 6} ${cy - 6} Z`}
          fill={color}
        />
      );
    case "girl":
      return (
        <path
          d={`M ${cx - r - 2} ${cy - 2} Q ${cx - r} ${top - 14} ${cx} ${top - 12} Q ${cx + r} ${top - 14} ${cx + r + 2} ${cy - 2} Q ${cx + r - 14} ${top + 30} ${cx + 30} ${top + 34} Q ${cx} ${top + 22} ${cx - 30} ${top + 34} Q ${cx - r + 14} ${top + 30} ${cx - r - 2} ${cy - 2} Z`}
          fill={color}
        />
      );
    case "dad":
      return (
        <g>
          <path
            d={`M ${cx - r + 2} ${cy - 12} Q ${cx - r - 2} ${top - 18} ${cx} ${top - 16} Q ${cx + r + 4} ${top - 16} ${cx + r - 2} ${cy - 12} Q ${cx + 30} ${top + 10} ${cx - r + 2} ${cy - 12} Z`}
            fill={color}
          />
          {/* лёгкая щетина */}
          <path
            d={`M ${cx - r + 12} ${cy + 18} Q ${cx} ${cy + r + 22} ${cx + r - 12} ${cy + 18} Q ${cx} ${cy + r + 2} ${cx - r + 12} ${cy + 18} Z`}
            fill={color}
            opacity={0.1}
          />
        </g>
      );
    case "driver":
      return (
        <g>
          {/* кепка */}
          <path
            d={`M ${cx - r - 2} ${cy - 18} Q ${cx} ${top - 34} ${cx + r + 2} ${cy - 18} Z`}
            fill="#4B5563"
          />
          <path
            d={`M ${cx - r - 4} ${cy - 18} L ${cx + r + 34} ${cy - 14} Q ${cx + r + 30} ${cy - 4} ${cx + r - 4} ${cy - 8} L ${cx - r - 4} ${cy - 10} Z`}
            fill="#3A4150"
          />
          {/* усы */}
          <path
            d={`M ${cx - 22} ${cy + 28} Q ${cx} ${cy + 18} ${cx + 22} ${cy + 28} Q ${cx} ${cy + 26} ${cx - 22} ${cy + 28} Z`}
            fill={color}
          />
          <path
            d={`M ${cx - r + 10} ${cy + 18} Q ${cx} ${cy + r + 24} ${cx + r - 10} ${cy + 18} Q ${cx} ${cy + r + 4} ${cx - r + 10} ${cy + 18} Z`}
            fill={color}
            opacity={0.22}
          />
        </g>
      );
    case "teacher":
      return (
        <g>
          <path
            d={`M ${cx - r - 4} ${cy} Q ${cx - r - 6} ${top - 12} ${cx} ${top - 12} Q ${cx + r + 6} ${top - 12} ${cx + r + 4} ${cy} Q ${cx + 30} ${top + 18} ${cx - r - 4} ${cy} Z`}
            fill={color}
          />
          <Glasses cx={cx} cy={cy - 4} />
        </g>
      );
    case "boss":
      return (
        <g>
          <path
            d={`M ${cx - r} ${cy - 14} Q ${cx - r} ${top - 12} ${cx} ${top - 12} Q ${cx + r} ${top - 12} ${cx + r} ${cy - 14} Q ${cx - 10} ${top + 14} ${cx - r} ${cy - 14} Z`}
            fill={color}
          />
          <Glasses cx={cx} cy={cy - 4} />
        </g>
      );
    case "rep":
      return (
        <g>
          <path
            d={`M ${cx - r - 4} ${cy} Q ${cx - r - 4} ${top - 14} ${cx} ${top - 14} Q ${cx + r + 6} ${top - 14} ${cx + r + 4} ${cy} Q ${cx + r - 20} ${top + 20} ${cx - 20} ${top + 24} Q ${cx - r + 10} ${top + 30} ${cx - r - 4} ${cy} Z`}
            fill={color}
          />
          {/* гарнитура */}
          <path
            d={`M ${cx - r - 6} ${cy} Q ${cx} ${top - 40} ${cx + r + 6} ${cy}`}
            stroke={INK}
            strokeWidth={7}
            fill="none"
          />
          <rect
            x={cx - r - 14}
            y={cy - 12}
            width={18}
            height={30}
            rx={8}
            fill={INK}
          />
          <path
            d={`M ${cx - r - 6} ${cy + 16} Q ${cx - r + 4} ${cy + 46} ${cx - 18} ${cy + 40}`}
            stroke={INK}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    default:
      return null;
  }
};

const Glasses: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <g stroke={INK} strokeWidth={4} fill="rgba(255,255,255,0.15)">
    <rect x={cx - 40} y={cy - 12} width={32} height={24} rx={9} />
    <rect x={cx + 8} y={cy - 12} width={32} height={24} rx={9} />
    <path d={`M ${cx - 8} ${cy - 2} L ${cx + 8} ${cy - 2}`} fill="none" />
  </g>
);

const HeldItem: React.FC<{ item: HandItem }> = ({ item }) => {
  switch (item) {
    case "phone":
      return (
        <g>
          <rect x={-20} y={-6} width={40} height={72} rx={9} fill={INK} />
          <rect x={-15} y={0} width={30} height={58} rx={5} fill="#BFD8F2" />
        </g>
      );
    case "keys":
      return (
        <g>
          <circle cx={0} cy={22} r={10} fill="none" stroke="#9AA3B2" strokeWidth={4} />
          <rect x={-5} y={30} width={10} height={30} rx={3} fill="#C8CED8" />
          <rect x={6} y={26} width={16} height={22} rx={5} fill={INK} />
        </g>
      );
    case "cup":
      return (
        <g>
          <rect x={-22} y={-10} width={44} height={50} rx={8} fill="#FFFFFF" stroke="#C9D3E0" strokeWidth={3} />
          <path d="M 22 0 Q 36 2 34 16 Q 32 28 22 26" fill="none" stroke="#C9D3E0" strokeWidth={5} />
        </g>
      );
    case "folder":
      return <rect x={-40} y={-10} width={80} height={100} rx={6} fill="#4F8FCB" />;
    default:
      return null;
  }
};

const Limb: React.FC<{
  x: number;
  y: number;
  side: -1 | 1; // -1 левая (на экране слева), 1 правая
  arm: Arm;
  g: Geo;
  sleeve: string;
  sleeveDark: string;
  skin: string;
  item: HandItem;
}> = ({ x, y, side, arm, g, sleeve, sleeveDark, skin, item }) => {
  // цель кисти (для правой руки — зеркально относительно центра)
  const target = { x: side === -1 ? 200 + arm[0] : 200 - arm[0], y: arm[1] };
  const l1 = g.upper;
  const l2 = g.fore;
  let dx = target.x - x;
  let dy = target.y - y;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 2;
  if (d > maxD) {
    dx *= maxD / d;
    dy *= maxD / d;
    d = maxD;
  }
  d = Math.max(d, Math.abs(l1 - l2) + 2);
  // угол на цель и угол в плече (теорема косинусов)
  const toT = Math.atan2(dy, dx);
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  // локоть — наружу от тела (для левой руки — влево)
  const upperDir = toT + (side === -1 ? -A : A);
  const ex = x + Math.cos(upperDir) * l1;
  const ey = y + Math.sin(upperDir) * l1;
  const foreDir = Math.atan2(dy - (ey - y), dx - (ex - x));
  // rotate() для отрезка, нарисованного вниз (0, +len)
  const deg = (r: number) => (r * 180) / Math.PI - 90;
  return (
    <g>
      <g transform={`translate(${x} ${y}) rotate(${deg(upperDir)})`}>
        <rect
          x={-g.limb / 2}
          y={-10}
          width={g.limb}
          height={l1 + 20}
          rx={g.limb / 2}
          fill={sleeve}
        />
      </g>
      <g transform={`translate(${ex} ${ey}) rotate(${deg(foreDir)})`}>
        <rect
          x={-g.limb / 2 + 2}
          y={-12}
          width={g.limb - 4}
          height={l2 * 0.7}
          rx={(g.limb - 4) / 2}
          fill={sleeveDark}
        />
        <rect
          x={-g.limb / 2 + 6}
          y={l2 * 0.5}
          width={g.limb - 12}
          height={l2 * 0.5}
          rx={(g.limb - 12) / 2}
          fill={skin}
        />
        <circle cx={0} cy={l2} r={g.limb * 0.5} fill={skin} />
      </g>
      {item !== "none" ? (
        <g transform={`translate(${ex + Math.cos(foreDir) * (l2 + 4)} ${ey + Math.sin(foreDir) * (l2 + 4)})`}>
          <HeldItem item={item} />
        </g>
      ) : null}
    </g>
  );
};

export type CharacterProps = {
  readonly kind: Kind;
  readonly height: number;
  readonly expr?: Expr;
  readonly mouth?: number;
  readonly look?: number; // −1…1, взгляд влево/вправо
  readonly armL?: Arm;
  readonly armR?: Arm;
  readonly itemL?: HandItem;
  readonly itemR?: HandItem;
  readonly legs?: "stand" | "walk" | "hidden";
  readonly walk?: number; // фаза шага (кадры)
  readonly tilt?: number; // наклон всего тела, °
  readonly headTilt?: number; // наклон головы, °
  readonly jacket?: string; // цвет куртки поверх одежды
  readonly backpack?: boolean;
  readonly bag?: boolean;
  readonly seed?: number;
  readonly flip?: boolean;
  readonly style?: React.CSSProperties;
};

export const Character: React.FC<CharacterProps> = ({
  kind,
  height,
  expr = "neutral",
  mouth = 0,
  look = 0,
  armL = ARM.down,
  armR = ARM.down,
  itemL = "none",
  itemR = "none",
  legs = "stand",
  walk = 0,
  tilt = 0,
  headTilt = 0,
  jacket,
  backpack = false,
  bag = false,
  seed = 1,
  flip = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const L = LOOKS[kind];
  const g = L.child ? CHILD : ADULT;
  const cx = 200;
  const blink = blinkAt(frame, seed);
  const breathe = Math.sin((frame + seed * 20) / 22) * 2.2;
  const top = jacket ?? L.top;
  const topDark = jacket ? shade(jacket) : L.topDark;
  const swing = legs === "walk" ? Math.sin(walk / 4.2) * 20 : 0;
  const bob = legs === "walk" ? Math.abs(Math.cos(walk / 4.2)) * -8 : 0;
  const sY = g.shoulderY + breathe * 0.5;
  const shoulderL = { x: cx - g.shoulderHalf + 4, y: sY + 18 };
  const shoulderR = { x: cx + g.shoulderHalf - 4, y: sY + 18 };
  const legLen = 975 - g.legTop;
  const skirt = kind === "girl" || kind === "teacher";

  return (
    <svg
      viewBox="0 0 400 1000"
      width={height * 0.4}
      height={height}
      overflow="visible"
      style={{ overflow: "visible", ...style }}
    >
      <g
        transform={`${flip ? "translate(400 0) scale(-1 1) " : ""}translate(0 ${bob}) rotate(${tilt} 200 975)`}
      >
        {/* мягкая тень на полу */}
        {legs !== "hidden" ? (
          <ellipse cx={cx} cy={985} rx={L.child ? 110 : 130} ry={18} fill="rgba(20,40,90,0.13)" />
        ) : null}
        {/* рюкзак за спиной (лямки видны спереди) */}
        {backpack ? (
          <rect
            x={cx - g.shoulderHalf - 6}
            y={sY + 6}
            width={g.shoulderHalf * 2 + 12}
            height={(g.waistY - sY) * 0.95}
            rx={40}
            fill="#FFC90E"
          />
        ) : null}
        {/* ноги */}
        {legs !== "hidden"
          ? [-1, 1].map((side) => (
              <g
                key={side}
                transform={`rotate(${side * swing} ${cx + side * g.legGap} ${g.legTop})`}
              >
                <path
                  d={`M ${cx + side * g.legGap - 27} ${g.legTop - 20} L ${cx + side * g.legGap + 27} ${g.legTop - 20} L ${cx + side * g.legGap + 20} ${g.legTop + legLen - 12} Q ${cx + side * g.legGap} ${g.legTop + legLen + 4} ${cx + side * g.legGap - 20} ${g.legTop + legLen - 12} Z`}
                  fill={
                    kind === "girl"
                      ? "#5E6B85"
                      : kind === "teacher"
                        ? L.skin
                        : L.bottom
                  }
                />
                <ellipse
                  cx={cx + side * g.legGap + side * 10}
                  cy={975}
                  rx={34}
                  ry={17}
                  fill={L.shoes}
                />
              </g>
            ))
          : null}
        {/* задняя часть причёски */}
        <g transform={`rotate(${headTilt} ${cx} ${g.headY + g.headR})`}>
          <HairBack kind={kind} color={L.hair} g={g} />
        </g>
        {/* шея */}
        <rect
          x={cx - 16}
          y={g.headY + g.headR - 14}
          width={32}
          height={sY - g.headY - g.headR + 26}
          fill={L.skin}
        />
        {/* туловище */}
        <path
          d={`M ${cx - g.shoulderHalf} ${sY + 30} Q ${cx - g.shoulderHalf} ${sY} ${cx - g.shoulderHalf + 30} ${sY} L ${cx + g.shoulderHalf - 30} ${sY} Q ${cx + g.shoulderHalf} ${sY} ${cx + g.shoulderHalf} ${sY + 30} L ${cx + g.waistHalf} ${g.waistY} L ${cx - g.waistHalf} ${g.waistY} Z`}
          fill={top}
        />
        {/* низ: юбка / брюки */}
        {skirt ? (
          <path
            d={`M ${cx - g.waistHalf} ${g.waistY - 4} L ${cx + g.waistHalf} ${g.waistY - 4} L ${cx + g.waistHalf + 26} ${g.hipY + 40} L ${cx - g.waistHalf - 26} ${g.hipY + 40} Z`}
            fill={kind === "girl" ? L.bottom : "#3F4350"}
          />
        ) : (
          <rect
            x={cx - g.waistHalf}
            y={g.waistY - 6}
            width={g.waistHalf * 2}
            height={g.hipY - g.waistY + 20}
            rx={12}
            fill={L.bottom}
          />
        )}
        {/* детали одежды */}
        {kind === "girl" && !jacket ? (
          <path
            d={`M ${cx - 44} ${sY} L ${cx} ${sY + 46} L ${cx + 44} ${sY} Z`}
            fill="#FFFFFF"
          />
        ) : null}
        {kind === "dad" || kind === "boss" || jacket ? (
          <g>
            <path
              d={`M ${cx - 30} ${sY} L ${cx} ${sY + 120} L ${cx + 30} ${sY} Z`}
              fill={kind === "girl" ? "#FFFFFF" : "#F4F6FA"}
            />
            {kind === "boss" ? (
              <path
                d={`M ${cx - 9} ${sY + 14} L ${cx + 9} ${sY + 14} L ${cx + 6} ${sY + 110} L ${cx} ${sY + 122} L ${cx - 6} ${sY + 110} Z`}
                fill="#7C8BA6"
              />
            ) : null}
            <path
              d={`M ${cx} ${sY + 120} L ${cx} ${g.waistY}`}
              stroke={topDark}
              strokeWidth={5}
            />
          </g>
        ) : null}
        {kind === "rep" ? (
          <g>
            <path
              d={`M ${cx - 34} ${sY} L ${cx} ${sY + 40} L ${cx + 34} ${sY} Z`}
              fill="#14285A"
            />
            <rect
              x={cx + 26}
              y={sY + 70}
              width={46}
              height={30}
              rx={6}
              fill="#14285A"
            />
          </g>
        ) : null}
        {kind === "mom" || kind === "teacher" ? (
          <path
            d={`M ${cx - 28} ${sY} Q ${cx} ${sY + 36} ${cx + 28} ${sY}`}
            fill={L.skin}
          />
        ) : null}
        {/* лямки рюкзака */}
        {backpack ? (
          <g fill="#E5B300">
            <rect x={cx - 58} y={sY - 2} width={20} height={150} rx={8} />
            <rect x={cx + 38} y={sY - 2} width={20} height={150} rx={8} />
          </g>
        ) : null}
        {/* сумка через плечо */}
        {bag ? (
          <g>
            <path
              d={`M ${cx + g.shoulderHalf - 30} ${sY + 4} L ${cx - g.waistHalf + 10} ${g.waistY + 30}`}
              stroke="#6B4A3A"
              strokeWidth={10}
            />
            <rect
              x={cx - g.waistHalf - 40}
              y={g.waistY + 10}
              width={90}
              height={70}
              rx={14}
              fill="#8A5E48"
            />
          </g>
        ) : null}
        {/* голова */}
        <g transform={`rotate(${headTilt} ${cx} ${g.headY + g.headR})`}>
          <circle cx={cx - g.headR + 2} cy={g.headY + 6} r={12} fill={L.skin} />
          <circle cx={cx + g.headR - 2} cy={g.headY + 6} r={12} fill={L.skin} />
          <ellipse
            cx={cx}
            cy={g.headY}
            rx={g.headR}
            ry={g.headR * 1.08}
            fill={L.skin}
          />
          <Face
            kind={kind}
            expr={expr}
            mouth={mouth}
            blink={blink}
            look={look}
            g={g}
          />
          <HairFront kind={kind} color={L.hair} g={g} />
        </g>
        {/* руки поверх туловища */}
        <Limb
          {...shoulderL}
          side={-1}
          arm={armL}
          g={g}
          sleeve={top}
          sleeveDark={topDark}
          skin={L.skin}
          item={itemL}
        />
        <Limb
          {...shoulderR}
          side={1}
          arm={armR}
          g={g}
          sleeve={top}
          sleeveDark={topDark}
          skin={L.skin}
          item={itemR}
        />
      </g>
    </svg>
  );
};

// Чуть более тёмный оттенок (для рукава/складок).
const shade = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * 0.86);
  const gg = Math.round(((n >> 8) & 255) * 0.86);
  const b = Math.round((n & 255) * 0.86);
  return `#${((r << 16) | (gg << 8) | b).toString(16).padStart(6, "0")}`;
};

// Плавное смешивание поз рук (кисть движется по прямой между позами).
export const mixArm = (a: Arm, b: Arm, t: number): Arm => {
  const k = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
};
