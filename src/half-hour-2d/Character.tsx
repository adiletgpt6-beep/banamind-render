import { interpolateColors, useCurrentFrame } from "remotion";

// Персонажи 2D-версии «Жумуштан жарым саатка». Риг основан на персонажах
// «Бир таң» (с исправлениями движений из PR #12): плоская векторная
// графика, вид спереди. Голова (мимика, моргание, взгляд, поворот),
// руки из двух звеньев (IK, локоть наружу), ноги: стоит / идёт / сидит.
// Координаты рисунка 400 × 1000, ступни на линии y = 975.
//
// Всё, что выше ног, смещается вниз при посадке (sit) — вместе с целями
// кистей (они задаются в координатах тела).

export type Kind =
  | "mom"
  | "son"
  | "husband"
  | "boss"
  | "colleague"
  | "teacher"
  | "extraDad"
  | "extraMom"
  | "kidGirl"
  | "kidBoy";

export type Expr =
  | "neutral"
  | "smile"
  | "worried"
  | "sad"
  | "tired"
  | "calm"
  | "apologetic"
  | "focused";

// Смена выражения лица за несколько кадров (брови, рот и веки плавно
// перетекают из a в b, t = 0…1) — без скачка мимики.
export type ExprMix = { readonly a: Expr; readonly b: Expr; readonly t: number };

// Поза руки: точка кисти ДЛЯ ЛЕВОЙ руки (для правой — зеркально).
// x — смещение от центра тела (отрицательное = наружу), y — по высоте.
export type Arm = readonly [dx: number, y: number];
export type HandItem = "phone" | "handbag" | "folder" | "cup" | "none";

export const ARM = {
  down: [-112, 560],
  relaxed: [-98, 545],
  lap: [-46, 520],
  hip: [-118, 470],
  phoneLook: [-30, 380],
  phoneTalk: [-24, 300],
  watch: [-12, 400],
  watchMouth: [-18, 300],
  desk: [-70, 470],
  keyboard: [-40, 480],
  chin: [-14, 232],
  open: [-170, 470],
  point: [-250, 330],
  hold: [-40, 470],
} as const satisfies Record<string, Arm>;

// Те же позы для ребёнка (плечи и бёдра ниже в рисунке): в анимации рук
// мальчика используются только они, чтобы поза не «перескакивала».
export const CHILD_ARM = {
  down: [-96, 636],
  lap: [-44, 588],
  // часы у подбородка, предплечье ниже лица (лицо не закрыто)
  watchMouth: [-50, 352],
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

export const LOOKS: Record<Kind, Look> = {
  // Айгерим: коралловая блузка, тёмно-синие брюки — одинаково во всех сценах.
  mom: {
    skin: "#EDC5A0",
    hair: "#3A2722",
    top: "#E07A5F",
    topDark: "#C9654B",
    bottom: "#2E3B5E",
    shoes: "#2B2B33",
  },
  // Сын: белая рубашка, тёмно-синий жилет, серые брюки, жёлтый рюкзак.
  son: {
    skin: "#EFC39E",
    hair: "#2A1D19",
    top: "#24365F",
    topDark: "#1B2A4B",
    bottom: "#59657D",
    shoes: "#2F2A28",
    child: true,
  },
  // Муж: домашний свитер.
  husband: {
    skin: "#D8A77D",
    hair: "#231C1A",
    top: "#3E8A86",
    topDark: "#2F6F6C",
    bottom: "#3B4558",
    shoes: "#22252B",
  },
  boss: {
    skin: "#DCAF88",
    hair: "#8C8C8C",
    top: "#26334D",
    topDark: "#1D283E",
    bottom: "#26334D",
    shoes: "#1E2027",
  },
  colleague: {
    skin: "#E3B58E",
    hair: "#2B211E",
    top: "#8FB3DA",
    topDark: "#769CC6",
    bottom: "#3A4357",
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
  extraDad: {
    skin: "#C9996F",
    hair: "#3D3A38",
    top: "#7A8A5C",
    topDark: "#65744B",
    bottom: "#3B3F47",
    shoes: "#25272B",
  },
  extraMom: {
    skin: "#F0CBA8",
    hair: "#5A3A2C",
    top: "#B07CC6",
    topDark: "#9665AC",
    bottom: "#4A4F63",
    shoes: "#2A2A30",
  },
  kidGirl: {
    skin: "#F2CBA8",
    hair: "#2E1F1B",
    top: "#24365F",
    topDark: "#1B2A4B",
    bottom: "#24365F",
    shoes: "#3A2F2A",
    child: true,
  },
  kidBoy: {
    skin: "#D9A986",
    hair: "#1F1714",
    top: "#24365F",
    topDark: "#1B2A4B",
    bottom: "#59657D",
    shoes: "#2F2A28",
    child: true,
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
  thigh: number; // насколько опускается тело при посадке
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
  thigh: 190,
};
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
  thigh: 150,
};

export const INK = "#1E2A44";

// Моргание: 3 кадра примерно раз в 3–4 с, у каждого персонажа свой ритм.
const blinkAt = (frame: number, seed: number) => {
  const period = 97 + (seed % 5) * 13;
  const ph = (((frame + seed * 37) % period) + period) % period;
  return ph < 3 ? [0.15, 0.05, 0.4][ph] : 1;
};

const BROW: Record<Expr, [number, number]> = {
  neutral: [0, 0],
  smile: [2, 2],
  worried: [8, -3],
  sad: [9, -4],
  tired: [3, -2],
  calm: [1, 1],
  apologetic: [8, -2],
  focused: [-3, 1],
};
const CURVE: Record<Expr, number> = {
  neutral: 2,
  smile: 9,
  worried: -4,
  sad: -6,
  tired: -2,
  calm: 5,
  apologetic: -1,
  focused: 0,
};

const LID: Record<Expr, number> = {
  neutral: 1,
  smile: 1,
  worried: 1,
  sad: 0.8,
  tired: 0.6,
  calm: 1,
  apologetic: 1,
  focused: 1,
};

const Face: React.FC<{
  kind: Kind;
  expr: Expr | ExprMix;
  mouth: number;
  blink: number;
  look: number;
  lookY: number;
  turn: number;
  g: Geo;
}> = ({ kind, expr, mouth, blink, look, lookY, turn, g }) => {
  const s = g.headR / 66;
  const cx = 200 + turn * 12 * s;
  const cy = g.headY;
  const eyeY = cy - 4 * s;
  const eyeDx = 23 * s;
  const lx = look * 4 * s;
  const ly = lookY * 3 * s;
  const ex: ExprMix = typeof expr === "string" ? { a: expr, b: expr, t: 0 } : expr;
  const mix = (va: number, vb: number) => va + (vb - va) * ex.t;
  const lid = mix(LID[ex.a], LID[ex.b]);
  const ry = 8.5 * s * blink * lid;
  const bi = mix(BROW[ex.a][0], BROW[ex.b][0]);
  const bo = mix(BROW[ex.a][1], BROW[ex.b][1]);
  const by = eyeY - 22 * s;
  const browPath = (side: -1 | 1) => {
    const inner = cx + side * 10 * s;
    const outer = cx + side * 36 * s;
    return `M ${inner} ${by - bi * s} Q ${(inner + outer) / 2} ${by - (bi + bo) * 0.5 * s - 3 * s} ${outer} ${by - bo * s + 2 * s}`;
  };
  const my = cy + 34 * s;
  const c = mix(CURVE[ex.a], CURVE[ex.b]) * s;
  const w = mix(ex.a === "smile" ? 16 : 12.5, ex.b === "smile" ? 16 : 12.5) * s;
  // верхнее веко проявляется постепенно (усталость, грусть)
  const lidLine = Math.min(1, (1 - lid) * 5);
  return (
    <g>
      {[-1, 1].map((side) => (
        <ellipse
          key={`b${side}`}
          cx={cx + side * 34 * s}
          cy={cy + 18 * s}
          rx={11 * s}
          ry={7 * s}
          fill="#F08A7A"
          opacity={0.22}
        />
      ))}
      {[-1, 1].map((side) => (
        <g key={side}>
          <ellipse
            cx={cx + side * eyeDx + lx}
            cy={eyeY + ly}
            rx={6.5 * s}
            ry={Math.max(1.2, ry)}
            fill={INK}
          />
          {blink > 0.6 && lid > 0.97 ? (
            <circle
              cx={cx + side * eyeDx + lx + 2 * s}
              cy={eyeY + ly - 3 * s}
              r={1.8 * s}
              fill="#FFFFFF"
            />
          ) : null}
          {lidLine > 0.01 ? (
            <path
              opacity={lidLine}
              d={`M ${cx + side * eyeDx - 9 * s} ${eyeY - 4 * s} Q ${cx + side * eyeDx} ${eyeY - 7 * s} ${cx + side * eyeDx + 9 * s} ${eyeY - 4 * s}`}
              stroke={INK}
              strokeWidth={2.5 * s}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}
        </g>
      ))}
      {[-1, 1].map((side) => (
        <path
          key={`br${side}`}
          d={browPath(side as -1 | 1)}
          stroke={kind === "boss" ? "#6E6E6E" : INK}
          strokeWidth={4.5 * s}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path
        d={`M ${cx - 3 * s} ${cy + 12 * s} Q ${cx + 4 * s} ${cy + 17 * s} ${cx - 1 * s} ${cy + 20 * s}`}
        stroke="#B9805E"
        strokeWidth={3 * s}
        fill="none"
        strokeLinecap="round"
      />
      {mouth > 0.1 ? (
        <path
          d={`M ${cx - w * 0.85} ${my} Q ${cx} ${my + c * 0.6 - 2 * s} ${cx + w * 0.85} ${my} Q ${cx} ${my + (5 + 15 * mouth) * s + c * 0.4} ${cx - w * 0.85} ${my} Z`}
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

const HairBack: React.FC<{ kind: Kind; color: string; g: Geo }> = ({
  kind,
  color,
  g,
}) => {
  const cx = 200;
  const cy = g.headY;
  const r = g.headR;
  if (kind === "mom" || kind === "extraMom")
    return (
      <path
        d={`M ${cx - r - 8} ${cy - 10} Q ${cx - r - 14} ${cy + r + 30} ${cx - r + 6} ${cy + r + 38} L ${cx + r - 6} ${cy + r + 38} Q ${cx + r + 14} ${cy + r + 30} ${cx + r + 8} ${cy - 10} Z`}
        fill={color}
      />
    );
  if (kind === "kidGirl")
    return (
      <g fill={color}>
        <ellipse cx={cx - r - 14} cy={cy + 34} rx={22} ry={46} />
        <ellipse cx={cx + r + 14} cy={cy + 34} rx={22} ry={46} />
        <circle cx={cx - r - 4} cy={cy - 6} r={13} fill="#FFFFFF" />
        <circle cx={cx + r + 4} cy={cy - 6} r={13} fill="#FFFFFF" />
      </g>
    );
  if (kind === "teacher")
    return <circle cx={cx} cy={cy - r - 6} r={30} fill={color} />;
  return null;
};

const Glasses: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <g stroke={INK} strokeWidth={4} fill="rgba(255,255,255,0.15)">
    <rect x={cx - 40} y={cy - 12} width={32} height={24} rx={9} />
    <rect x={cx + 8} y={cy - 12} width={32} height={24} rx={9} />
    <path d={`M ${cx - 8} ${cy - 2} L ${cx + 8} ${cy - 2}`} fill="none" />
  </g>
);

const HairFront: React.FC<{ kind: Kind; color: string; g: Geo; turn: number }> = ({
  kind,
  color,
  g,
  turn,
}) => {
  const cx = 200;
  const cy = g.headY;
  const r = g.headR;
  const top = cy - r;
  const gx = cx + turn * 12 * (g.headR / 66);
  switch (kind) {
    case "mom":
    case "extraMom":
      return (
        <path
          d={`M ${cx - r - 6} ${cy + 4} Q ${cx - r - 8} ${top - 16} ${cx} ${top - 14} Q ${cx + r + 10} ${top - 14} ${cx + r + 6} ${cy + 10} Q ${cx + r - 8} ${cy - 30} ${cx + 10} ${top + 22} Q ${cx - 40} ${top + 34} ${cx - r + 6} ${cy - 6} Z`}
          fill={color}
        />
      );
    case "kidGirl":
      return (
        <path
          d={`M ${cx - r - 2} ${cy - 2} Q ${cx - r} ${top - 14} ${cx} ${top - 12} Q ${cx + r} ${top - 14} ${cx + r + 2} ${cy - 2} Q ${cx + r - 14} ${top + 30} ${cx + 30} ${top + 34} Q ${cx} ${top + 22} ${cx - 30} ${top + 34} Q ${cx - r + 14} ${top + 30} ${cx - r - 2} ${cy - 2} Z`}
          fill={color}
        />
      );
    case "son":
    case "kidBoy":
      // короткая стрижка, чёлка набок
      return (
        <path
          d={`M ${cx - r - 2} ${cy - 6} Q ${cx - r - 6} ${top - 20} ${cx - 6} ${top - 16} Q ${cx + r + 8} ${top - 14} ${cx + r + 2} ${cy - 8} Q ${cx + r - 10} ${top + 24} ${cx + 24} ${top + 30} Q ${cx - 6} ${top + 42} ${cx - 36} ${top + 30} Q ${cx - r + 10} ${top + 30} ${cx - r - 2} ${cy - 6} Z`}
          fill={color}
        />
      );
    case "husband":
    case "colleague":
    case "extraDad":
      return (
        <path
          d={`M ${cx - r + 2} ${cy - 12} Q ${cx - r - 2} ${top - 18} ${cx} ${top - 16} Q ${cx + r + 4} ${top - 16} ${cx + r - 2} ${cy - 12} Q ${cx + 30} ${top + 10} ${cx - r + 2} ${cy - 12} Z`}
          fill={color}
        />
      );
    case "teacher":
      return (
        <g>
          <path
            d={`M ${cx - r - 4} ${cy} Q ${cx - r - 6} ${top - 12} ${cx} ${top - 12} Q ${cx + r + 6} ${top - 12} ${cx + r + 4} ${cy} Q ${cx + 30} ${top + 18} ${cx - r - 4} ${cy} Z`}
            fill={color}
          />
          <Glasses cx={gx} cy={cy - 4} />
        </g>
      );
    case "boss":
      return (
        <g>
          <path
            d={`M ${cx - r} ${cy - 14} Q ${cx - r} ${top - 12} ${cx} ${top - 12} Q ${cx + r} ${top - 12} ${cx + r} ${cy - 14} Q ${cx - 10} ${top + 14} ${cx - r} ${cy - 14} Z`}
            fill={color}
          />
          <Glasses cx={gx} cy={cy - 4} />
        </g>
      );
    default:
      return null;
  }
};

// Предмет в руке; (0, 0) — центр кисти. flat — телефон ещё лежит плашмя
// (как на столе) и при подъёме поворачивается экраном к лицу.
const HeldItem: React.FC<{ item: HandItem; side: -1 | 1; flat?: number }> = ({ item, side, flat = 0 }) => {
  switch (item) {
    case "phone": {
      const w = 42 + (109 - 42) * flat;
      const h = 76 + (27 - 76) * flat;
      const cy = -2 + 6 * flat;
      return (
        <g>
          <rect x={-w / 2} y={cy - h / 2} width={w} height={h} rx={9} fill={INK} />
          <rect x={-w / 2 + 5 + 2 * flat} y={cy - h / 2 + 6 - 2.5 * flat} width={w - 10 - 4 * flat} height={h - 14 + 1 * flat} rx={5} fill={interpolateColors(flat, [0, 1], ["#BFD8F2", "#CFE3F5"])} />
        </g>
      );
    }
    case "handbag":
      return (
        <g>
          <path d="M -26 6 Q -26 -30 0 -30 Q 26 -30 26 6" fill="none" stroke="#6B4A3A" strokeWidth={8} />
          <rect x={-52} y={4} width={104} height={82} rx={16} fill="#8A5E48" />
          <rect x={-52} y={4} width={104} height={22} rx={10} fill="#7A513D" />
        </g>
      );
    case "folder":
      return (
        <g transform={`rotate(${side * 8})`}>
          <rect x={-44} y={-20} width={88} height={110} rx={6} fill="#4F8FCB" />
          <rect x={-36} y={-12} width={72} height={96} rx={4} fill="#FFFFFF" opacity={0.25} />
        </g>
      );
    case "cup":
      return (
        <g>
          <rect x={-22} y={-24} width={44} height={50} rx={8} fill="#FFFFFF" stroke="#C9D3E0" strokeWidth={3} />
          <path d={`M ${side * 22} -14 Q ${side * 36} -12 ${side * 34} 2 Q ${side * 32} 14 ${side * 22} 12`} fill="none" stroke="#C9D3E0" strokeWidth={5} />
        </g>
      );
    default:
      return null;
  }
};

const Limb: React.FC<{
  x: number;
  y: number;
  side: -1 | 1;
  arm: Arm;
  g: Geo;
  sleeve: string;
  sleeveDark: string;
  skin: string;
  item: HandItem;
  itemShake: number;
  itemFlat?: number;
  watch: boolean;
  elbowDown?: boolean;
}> = ({ x, y, side, arm, g, sleeve, sleeveDark, skin, item, itemShake, itemFlat = 0, watch, elbowDown = false }) => {
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
  const ux = d > 1e-6 ? dx / d : 0;
  const uy = d > 1e-6 ? dy / d : 1;
  d = Math.max(d, Math.abs(l1 - l2) + 2);
  const cosA = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const sinA = Math.sqrt(1 - cosA * cosA);
  // Локоть наружу от тела; для жестов к соседу (рука на плече) — вниз.
  // Сторона локтя выбирается непрерывно: у границы выбора локоть проходит
  // «перед телом» (руки в проекции короче), а не перескакивает.
  const pref = elbowDown ? [0, 1] : [side, 0];
  const bias = pref[0] * uy - pref[1] * ux;
  const bend = Math.max(-1, Math.min(1, bias / 0.12));
  const ex = x + l1 * cosA * ux + bend * l1 * sinA * uy;
  const ey = y + l1 * cosA * uy - bend * l1 * sinA * ux;
  const hx = x + ux * d;
  const hy = y + uy * d;
  const L1 = Math.hypot(ex - x, ey - y);
  const L2 = Math.hypot(hx - ex, hy - ey);
  const upperDir = Math.atan2(ey - y, ex - x);
  const foreDir = Math.atan2(hy - ey, hx - ex);
  const deg = (r: number) => (r * 180) / Math.PI - 90;
  return (
    <g>
      <g transform={`translate(${x} ${y}) rotate(${deg(upperDir)})`}>
        <rect
          x={-g.limb / 2}
          y={-10}
          width={g.limb}
          height={L1 + 20}
          rx={g.limb / 2}
          fill={sleeve}
        />
      </g>
      <g transform={`translate(${ex} ${ey}) rotate(${deg(foreDir)})`}>
        <rect
          x={-g.limb / 2 + 2}
          y={-12}
          width={g.limb - 4}
          height={L2 * 0.7}
          rx={(g.limb - 4) / 2}
          fill={sleeveDark}
        />
        <rect
          x={-g.limb / 2 + 6}
          y={L2 * 0.5}
          width={g.limb - 12}
          height={L2 * 0.5}
          rx={(g.limb - 12) / 2}
          fill={skin}
        />
        {watch ? (
          <g>
            <rect x={-g.limb / 2 + 4} y={L2 * 0.62} width={g.limb - 8} height={14} rx={4} fill={INK} />
            <rect x={-12} y={L2 * 0.62 - 6} width={24} height={26} rx={6} fill={INK} />
            <rect x={-8} y={L2 * 0.62 - 2} width={16} height={18} rx={3} fill="#FFC90E" />
          </g>
        ) : null}
        <circle cx={0} cy={L2} r={g.limb * 0.5} fill={skin} />
      </g>
      {item !== "none" ? (
        <g transform={`translate(${hx + itemShake} ${hy + 6})`}>
          <HeldItem item={item} side={side} flat={itemFlat} />
          {item === "phone" || item === "cup" ? (
            <ellipse cx={side * -14} cy={8} rx={10} ry={13} fill={skin} />
          ) : null}
        </g>
      ) : null}
    </g>
  );
};

export type CharacterProps = {
  readonly kind: Kind;
  readonly height: number;
  readonly expr?: Expr | ExprMix;
  readonly mouth?: number;
  readonly look?: number; // −1…1 взгляд влево/вправо
  readonly lookY?: number; // −1 вверх … 1 вниз
  readonly turn?: number; // −1…1 лёгкий поворот головы
  readonly armL?: Arm;
  readonly armR?: Arm;
  readonly itemL?: HandItem;
  readonly itemR?: HandItem;
  readonly itemShakeR?: number;
  readonly itemFlatL?: number; // 0…1: телефон в левой руке ещё лежит плашмя
  readonly elbowDownR?: boolean;
  readonly watchL?: boolean; // часы на левой руке
  readonly legs?: "stand" | "walk" | "hidden";
  readonly sit?: number; // 0 — стоит, 1 — сидит
  // Пройденный путь в единицах рисунка (мировые px ÷ рост × 1000): шаги
  // привязаны к перемещению, опорная ступня стоит на месте (не скользит).
  readonly walk?: number;
  // Направление на экране: −1 влево … 1 вправо, 0 — к камере/от неё
  // (плавно меняется на поворотах пути).
  readonly walkDir?: number;
  // 0…1 — размах шага: плавно растёт при старте и гаснет при остановке.
  readonly walkAmount?: number;
  readonly motionFrame?: number;
  readonly tilt?: number;
  readonly headTilt?: number;
  readonly shoulders?: number; // 0…1 опущенные плечи (выдох)
  readonly eyesClosed?: number; // 0…1
  readonly backpack?: boolean;
  readonly bag?: boolean; // сумка через плечо
  readonly seed?: number;
  readonly style?: React.CSSProperties;
};

export const Character: React.FC<CharacterProps> = ({
  kind,
  height,
  expr = "neutral",
  mouth = 0,
  look = 0,
  lookY = 0,
  turn = 0,
  armL,
  armR,
  itemL = "none",
  itemR = "none",
  itemShakeR = 0,
  itemFlatL = 0,
  elbowDownR = false,
  watchL = false,
  legs = "stand",
  sit = 0,
  walk = 0,
  walkDir = 1,
  walkAmount = 1,
  motionFrame,
  tilt = 0,
  headTilt = 0,
  shoulders = 0,
  eyesClosed = 0,
  backpack = false,
  bag = false,
  seed = 1,
  style,
}) => {
  const localFrame = useCurrentFrame();
  const frame = motionFrame ?? localFrame;
  const L = LOOKS[kind];
  const g = L.child ? CHILD : ADULT;
  const cx = 200;
  const blink = Math.min(blinkAt(frame, seed), 1 - eyesClosed * 0.95);
  // спокойное дыхание: 1–2 px, без раскачивания тела
  const breathe = Math.sin((frame + seed * 20) / 26) * 1.6;
  const walking = legs === "walk" && sit === 0 && walkAmount > 0;
  const child = Boolean(L.child);
  // Шаг: опорная нога отходит назад ровно на пройденный путь, переносимая
  // — вперёд с подъёмом стопы; таз опускается, когда опорная нога не под ним.
  const legLen0 = 975 - g.legTop;
  const stepLen = child ? 140 : 170;
  // к камере шаг виден только по подъёму стопы — поднимаем выше
  const side = 1 - Math.min(1, Math.abs(walkDir));
  const liftMax = (child ? 24 : 30) * (1 + 0.8 * side) * walkAmount;
  const reachX = (stepLen / 2) * walkDir * walkAmount;
  const step = (offset: number) => {
    if (!walking) return { dx: 0, lift: 0, stance: true };
    const p = (((walk / (2 * stepLen) + offset) % 1) + 1) % 1;
    if (p < 0.5) {
      const u = p / 0.5;
      return { dx: reachX * (1 - 2 * u), lift: 0, stance: true };
    }
    const u = (p - 0.5) / 0.5;
    const e = u * u * (3 - 2 * u);
    return { dx: reachX * (2 * e - 1), lift: Math.sin(Math.PI * u) * liftMax, stance: false };
  };
  const legSteps = [step(0), step(0.5)]; // левая, правая
  const stanceDx = legSteps.find((s) => s.stance)?.dx ?? 0;
  const bob = walking
    ? legLen0 - Math.sqrt(legLen0 * legLen0 - stanceDx * stanceDx) + legSteps.reduce((m, s) => Math.max(m, s.lift), 0) * 0.15 * side
    : 0;
  // руки — в противофазе ногам
  const walkArm = walking ? -(legSteps[0].dx / (stepLen / 2)) * 16 : 0;
  const drop = sit * g.thigh;
  const sY = g.shoulderY + breathe * 0.4 + shoulders * 8;
  const shoulderL = { x: cx - g.shoulderHalf + 4, y: sY + 18 };
  const shoulderR = { x: cx + g.shoulderHalf - 4, y: sY + 18 };
  const legTop = g.legTop + drop;
  const skirt = kind === "kidGirl" || kind === "teacher";
  // поза покоя рук (если рука не задана) — своя у ребёнка и взрослого
  const rest: Arm = child ? CHILD_ARM.down : ARM.down;
  const swingL = armL === undefined && itemL === "none" ? walkArm : 0;
  const swingR = armR === undefined && itemR === "none" ? -walkArm : 0;
  const aL: Arm = armL ?? [rest[0] + swingL, rest[1]];
  const aR: Arm = armR ?? [rest[0] + swingR, rest[1]];
  const stubble = kind === "husband" || kind === "colleague" || kind === "extraDad";

  return (
    <svg
      viewBox="0 0 400 1000"
      width={height * 0.4}
      height={height}
      overflow="visible"
      style={{ overflow: "visible", ...style }}
    >
      <g transform={`rotate(${tilt} 200 975)`}>
        {legs !== "hidden" ? (
          <ellipse cx={cx} cy={985} rx={child ? 110 : 130} ry={18} fill="rgba(20,40,90,0.13)" />
        ) : null}
        {/* ноги: при посадке видны голени, колени — скруглённым верхом */}
        {legs !== "hidden"
          ? [-1, 1].map((side, i) => {
              const lx = cx + side * (g.legGap + sit * 10);
              const legFill = kind === "kidGirl" ? "#5E6B85" : kind === "teacher" ? L.skin : L.bottom;
              // тазобедренный сустав (с учётом опускания таза при шаге) → стопа
              const hipY = legTop + bob;
              const { dx, lift } = legSteps[i];
              const footY = 975 - lift;
              const legLen = Math.hypot(dx, footY - hipY);
              const ang = (-Math.atan2(dx, footY - hipY) * 180) / Math.PI;
              return (
                <g key={side} transform={`rotate(${ang} ${lx} ${hipY})`}>
                  <path
                    d={`M ${lx - 27 - sit * 4} ${hipY - 20 + sit * 18} L ${lx + 27 + sit * 4} ${hipY - 20 + sit * 18} L ${lx + 20} ${hipY + legLen - 12} Q ${lx} ${hipY + legLen + 4} ${lx - 20} ${hipY + legLen - 12} Z`}
                    fill={legFill}
                  />
                  {sit > 0.05 ? (
                    <ellipse
                      cx={lx}
                      cy={legTop - 4}
                      rx={31 + sit * 4}
                      ry={24 * sit}
                      fill={kind === "teacher" ? "#3F4350" : L.bottom}
                    />
                  ) : null}
                  <ellipse cx={lx + side * 10} cy={hipY + legLen} rx={34} ry={17} fill={L.shoes} />
                </g>
              );
            })
          : null}
        <g transform={`translate(0 ${drop + bob})`}>
          {backpack ? (
            <rect
              x={cx - g.shoulderHalf - 8}
              y={sY + 6}
              width={g.shoulderHalf * 2 + 16}
              height={(g.waistY - sY) * 0.95}
              rx={40}
              fill="#FFC90E"
            />
          ) : null}
          <g transform={`rotate(${headTilt} ${cx} ${g.headY + g.headR})`}>
            <HairBack kind={kind} color={L.hair} g={g} />
          </g>
          <rect
            x={cx - 16}
            y={g.headY + g.headR - 14}
            width={32}
            height={sY - g.headY - g.headR + 26}
            fill={L.skin}
          />
          <path
            d={`M ${cx - g.shoulderHalf} ${sY + 30} Q ${cx - g.shoulderHalf} ${sY} ${cx - g.shoulderHalf + 30} ${sY} L ${cx + g.shoulderHalf - 30} ${sY} Q ${cx + g.shoulderHalf} ${sY} ${cx + g.shoulderHalf} ${sY + 30} L ${cx + g.waistHalf} ${g.waistY} L ${cx - g.waistHalf} ${g.waistY} Z`}
            fill={L.top}
          />
          {skirt ? (
            <path
              d={`M ${cx - g.waistHalf} ${g.waistY - 4} L ${cx + g.waistHalf} ${g.waistY - 4} L ${cx + g.waistHalf + 26} ${g.hipY + 40 - sit * 30} L ${cx - g.waistHalf - 26} ${g.hipY + 40 - sit * 30} Z`}
              fill={kind === "kidGirl" ? L.bottom : "#3F4350"}
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
          {/* бёдра сидящего (вид спереди, в ракурсе): колени шире пояса */}
          {sit > 0.05 ? (
            <g opacity={Math.min(1, sit * 1.4)}>
              {[-1, 1].map((side) => (
                <rect
                  key={side}
                  x={cx + side * (g.legGap + 6) - 40 - sit * 4}
                  y={g.hipY - 34}
                  width={80 + sit * 8}
                  height={62 * sit + 30}
                  rx={34}
                  fill={kind === "teacher" ? "#3F4350" : L.bottom}
                />
              ))}
              <rect x={cx - g.waistHalf - 4} y={g.hipY - 40} width={g.waistHalf * 2 + 8} height={40} rx={18} fill={kind === "teacher" ? "#3F4350" : L.bottom} />
            </g>
          ) : null}
          {kind === "son" || kind === "kidBoy" || kind === "kidGirl" ? (
            <g>
              <path d={`M ${cx - 46} ${sY} L ${cx} ${sY + 70} L ${cx + 46} ${sY} Z`} fill="#FFFFFF" />
              <path
                d={`M ${cx - 20} ${sY} L ${cx - 34} ${sY + 22} L ${cx - 6} ${sY + 16} Z M ${cx + 20} ${sY} L ${cx + 34} ${sY + 22} L ${cx + 6} ${sY + 16} Z`}
                fill="#E8EDF4"
              />
            </g>
          ) : null}
          {kind === "boss" ? (
            <g>
              <path d={`M ${cx - 30} ${sY} L ${cx} ${sY + 120} L ${cx + 30} ${sY} Z`} fill="#F4F6FA" />
              <path
                d={`M ${cx - 9} ${sY + 14} L ${cx + 9} ${sY + 14} L ${cx + 6} ${sY + 110} L ${cx} ${sY + 122} L ${cx - 6} ${sY + 110} Z`}
                fill="#7C8BA6"
              />
              <path d={`M ${cx} ${sY + 120} L ${cx} ${g.waistY}`} stroke={L.topDark} strokeWidth={5} />
            </g>
          ) : null}
          {kind === "colleague" ? (
            <g>
              <path d={`M ${cx - 26} ${sY} L ${cx} ${sY + 30} L ${cx + 26} ${sY} Z`} fill="#F4F6FA" />
              <path d={`M ${cx} ${sY + 30} L ${cx} ${g.waistY}`} stroke={L.topDark} strokeWidth={4} />
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={cx + 8} cy={sY + 70 + i * 60} r={4} fill={L.topDark} />
              ))}
            </g>
          ) : null}
          {kind === "husband" ? (
            <g>
              <path d={`M ${cx - 34} ${sY} Q ${cx} ${sY + 30} ${cx + 34} ${sY}`} fill={L.topDark} />
              <rect x={cx - g.waistHalf} y={g.waistY - 26} width={g.waistHalf * 2} height={22} rx={10} fill={L.topDark} />
            </g>
          ) : null}
          {kind === "extraDad" ? (
            <path d={`M ${cx - 28} ${sY} L ${cx} ${sY + 40} L ${cx + 28} ${sY} Z`} fill="#EDEFF2" />
          ) : null}
          {kind === "mom" || kind === "teacher" || kind === "extraMom" ? (
            <path d={`M ${cx - 28} ${sY} Q ${cx} ${sY + 36} ${cx + 28} ${sY}`} fill={L.skin} />
          ) : null}
          {kind === "teacher" ? (
            <rect x={cx + 20} y={sY + 40} width={40} height={52} rx={6} fill="#FFFFFF" opacity={0.9} />
          ) : null}
          {backpack ? (
            <g fill="#E5B300">
              <rect x={cx - 58} y={sY - 2} width={20} height={150} rx={8} />
              <rect x={cx + 38} y={sY - 2} width={20} height={150} rx={8} />
            </g>
          ) : null}
          {bag ? (
            <g>
              <path
                d={`M ${cx + g.shoulderHalf - 30} ${sY + 4} L ${cx - g.waistHalf + 10} ${g.waistY + 30}`}
                stroke="#6B4A3A"
                strokeWidth={10}
              />
              <rect x={cx - g.waistHalf - 40} y={g.waistY + 10} width={90} height={70} rx={14} fill="#8A5E48" />
              <rect x={cx - g.waistHalf - 40} y={g.waistY + 10} width={90} height={20} rx={10} fill="#7A513D" />
            </g>
          ) : null}
          <g transform={`rotate(${headTilt} ${cx} ${g.headY + g.headR})`}>
            <circle cx={cx - g.headR + 2} cy={g.headY + 6} r={12} fill={L.skin} />
            <circle cx={cx + g.headR - 2} cy={g.headY + 6} r={12} fill={L.skin} />
            <ellipse cx={cx} cy={g.headY} rx={g.headR} ry={g.headR * 1.08} fill={L.skin} />
            {stubble ? (
              <path
                d={`M ${cx - g.headR + 12} ${g.headY + 18} Q ${cx} ${g.headY + g.headR + 22} ${cx + g.headR - 12} ${g.headY + 18} Q ${cx} ${g.headY + g.headR + 2} ${cx - g.headR + 12} ${g.headY + 18} Z`}
                fill={L.hair}
                opacity={0.08}
              />
            ) : null}
            <Face kind={kind} expr={expr} mouth={mouth} blink={blink} look={look} lookY={lookY} turn={turn} g={g} />
            <HairFront kind={kind} color={L.hair} g={g} turn={turn} />
          </g>
          <Limb
            {...shoulderL}
            side={-1}
            arm={aL}
            g={g}
            sleeve={L.top}
            sleeveDark={L.topDark}
            skin={L.skin}
            item={itemL}
            itemShake={0}
            itemFlat={itemFlatL}
            watch={watchL}
          />
          <Limb
            {...shoulderR}
            side={1}
            arm={aR}
            g={g}
            sleeve={L.top}
            sleeveDark={L.topDark}
            skin={L.skin}
            item={itemR}
            itemShake={itemShakeR}
            watch={false}
            elbowDown={elbowDownR}
          />
        </g>
      </g>
    </svg>
  );
};

// Плавное смешивание поз рук (кисть движется по прямой между позами).
export const mixArm = (a: Arm, b: Arm, t: number): Arm => {
  const k = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
};

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Поза руки по ключевым кадрам: [[кадр, поза], …], плавно.
// Выражение по ключам [кадр начала, выражение]: каждая смена занимает
// dur кадров (начинается в указанный кадр) и идёт с плавным ускорением.
export const exprKeys = (
  frame: number,
  pts: readonly (readonly [number, Expr])[],
  dur = 8,
): ExprMix => {
  let a = pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t0, b] = pts[i];
    if (frame < t0) break;
    if (frame < t0 + dur) return { a, b, t: ease((frame - t0) / dur) };
    a = b;
  }
  return { a, b: a, t: 0 };
};

export const armKeys = (frame: number, pts: readonly (readonly [number, Arm])[]): Arm => {
  if (frame <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, a1] = pts[i];
    const [t0, a0] = pts[i - 1];
    if (frame <= t1) return mixArm(a0, a1, ease((frame - t0) / Math.max(1, t1 - t0)));
  }
  return pts[pts.length - 1][1];
};
