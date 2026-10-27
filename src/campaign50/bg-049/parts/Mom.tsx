// Мама — персонаж ролика: тонкий тёмно-синий контур с мягкой заливкой
// (стиль «рисунок линией», в паре с жёлтой линией). Живая мимика: взгляд,
// моргание, брови, улыбка, рот по огибающей голоса; голова наклоняется
// вокруг шеи, без «ломающихся» поворотов. Позы рук: у подбородка (думает)
// или вне кадра (руки рисует сцена: письмо, мышь, телефон).
import { C, STROKE } from "../palette";

export type MomProps = {
  readonly x: number; // центр головы в кадре
  readonly y: number;
  readonly s?: number;
  readonly tilt?: number; // наклон головы, градусы
  readonly look?: readonly [number, number]; // взгляд −1…1
  readonly eyes?: number; // открытость глаз 0…1 (моргание)
  readonly brow?: number; // −1 (хмурится) … 1 (приподняты)
  readonly smile?: number; // 0…1
  readonly mouth?: number; // открытость рта 0…1
  readonly pose?: "chin" | "none";
  readonly opacity?: number;
  readonly lean?: number; // лёгкий наклон корпуса, px
  readonly uid?: string; // уникальный id (две мамы в кадре на стыке сцен)
};

const VB = { x: -270, y: -215, w: 540, h: 840 } as const;

const Eye: React.FC<{
  readonly cx: number;
  readonly look: readonly [number, number];
  readonly open: number;
  readonly side: 1 | -1;
  readonly uid: string;
}> = ({ cx, look, open, side, uid }) => {
  const ry = Math.max(0.6, 15 * open);
  const ix = cx + look[0] * 6;
  const iy = 7 + look[1] * 3.5;
  const id = `bg49-eye-${uid}-${side}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={cx} cy={7} rx={18} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={7} rx={18} ry={ry} fill="#FFFFFF" />
      <g clipPath={`url(#${id})`}>
        <circle cx={ix} cy={iy} r={11} fill="#4A3226" />
        <circle cx={ix} cy={iy} r={5.5} fill={C.navy} />
        <circle cx={ix + 3.5} cy={iy - 4} r={3} fill="#FFFFFF" />
      </g>
      {/* верхнее веко по краю глаза и ресницы */}
      <path
        d={`M ${cx - 20} ${8} Q ${cx} ${7 - 2 * ry - 1} ${cx + 20} ${8}`}
        fill="none"
        stroke={C.navy}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path
        d={`M ${cx + side * 19} ${5} l ${side * 8} -6`}
        stroke={C.navy}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </g>
  );
};

export const Mom: React.FC<MomProps> = ({
  x,
  y,
  s = 1,
  tilt = 0,
  look = [0, 0],
  eyes = 1,
  brow = 0,
  smile = 0.3,
  mouth = 0,
  pose = "none",
  opacity = 1,
  lean = 0,
  uid = "m",
}) => {
  const m = Math.max(0, Math.min(1, mouth));
  const sm = Math.max(0, Math.min(1, smile));
  const browY = -32 - brow * 7;
  const browIn = -brow * 5; // внутренний край бровей выше при «задумчивости»
  const stroke = {
    stroke: C.navy,
    strokeWidth: STROKE,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };
  return (
    <svg
      width={VB.w * s}
      height={VB.h * s}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      style={{
        position: "absolute",
        left: x - (0 - VB.x) * s,
        top: y - (0 - VB.y) * s,
        opacity,
        overflow: "visible",
      }}
    >
      <g transform={`translate(${lean} 0)`}>
        {/* корпус: светлая футболка, голубой кардиган */}
        <path
          d="M -246 960 C -240 400 -182 236 -66 202 C -30 224 30 224 66 202 C 182 236 240 400 246 960 Z"
          fill={C.cardigan}
          {...stroke}
        />
        <path
          d="M -150 330 C -160 420 -168 520 -170 960 M 150 330 C 160 420 168 520 170 960"
          fill="none"
          stroke={C.cardiganShade}
          strokeWidth={3}
          opacity={0.7}
        />
        <path
          d="M -58 206 L 58 206 L 44 960 L -44 960 Z"
          fill={C.top}
          {...stroke}
        />
        <path d="M -40 208 Q 0 262 40 208 Z" fill={C.skinShade} />
        <circle
          cx={-66}
          cy={380}
          r={6}
          fill={C.yellow}
          stroke={C.navy}
          strokeWidth={2}
        />
        <circle
          cx={-62}
          cy={470}
          r={6}
          fill={C.yellow}
          stroke={C.navy}
          strokeWidth={2}
        />
      </g>
      {/* шея */}
      <path
        d="M -34 86 L -36 200 C -12 214 12 214 36 200 L 34 86 Z"
        fill={C.skin}
        {...stroke}
      />
      <path
        d="M -32 118 Q 0 142 32 118"
        fill="none"
        stroke={C.skinShade}
        strokeWidth={6}
        opacity={0.55}
      />
      <g transform={`rotate(${tilt} 0 150)`}>
        {/* пучок и волосы сзади */}
        <circle cx={20} cy={-150} r={52} fill={C.hair} {...stroke} />
        <path
          d="M -16 -112 Q 20 -96 58 -110"
          fill="none"
          stroke={C.yellow}
          strokeWidth={9}
          strokeLinecap="round"
        />
        <path
          d="M -114 46 C -134 -60 -92 -146 0 -146 C 92 -146 134 -60 114 46 L 96 70 L -96 70 Z"
          fill={C.hair}
          {...stroke}
        />
        {/* уши */}
        <ellipse cx={-101} cy={16} rx={16} ry={24} fill={C.skin} {...stroke} />
        <ellipse cx={101} cy={16} rx={16} ry={24} fill={C.skin} {...stroke} />
        <circle
          cx={-103}
          cy={46}
          r={7}
          fill={C.yellow}
          stroke={C.navy}
          strokeWidth={2}
        />
        <circle
          cx={103}
          cy={46}
          r={7}
          fill={C.yellow}
          stroke={C.navy}
          strokeWidth={2}
        />
        {/* лицо */}
        <ellipse cx={0} cy={0} rx={102} ry={122} fill={C.skin} {...stroke} />
        {/* чёлка с пробором */}
        <path
          d="M -30 -122 C 26 -128 96 -100 106 -16 C 84 -60 40 -84 -22 -90 Z"
          fill={C.hair}
          {...stroke}
        />
        <path
          d="M -30 -122 C -78 -114 -104 -74 -106 -16 C -90 -58 -66 -82 -40 -94 Z"
          fill={C.hair}
          {...stroke}
        />
        {/* румянец */}
        <circle cx={-62} cy={52} r={19} fill={C.blush} opacity={0.32} />
        <circle cx={62} cy={52} r={19} fill={C.blush} opacity={0.32} />
        {/* брови */}
        <path
          d={`M -66 ${browY + 6} Q -46 ${browY - 6} -22 ${browY + browIn}`}
          fill="none"
          stroke={C.hair}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d={`M 66 ${browY + 6} Q 46 ${browY - 6} 22 ${browY + browIn}`}
          fill="none"
          stroke={C.hair}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <Eye cx={-40} look={look} open={eyes} side={-1} uid={uid} />
        <Eye cx={40} look={look} open={eyes} side={1} uid={uid} />
        {/* нос */}
        <path
          d="M -3 30 Q -12 52 2 56"
          fill="none"
          stroke={C.skinShade}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
        {/* рот: улыбка или открытый рот по голосу */}
        {m > 0.06 ? (
          <g>
            <path
              d={`M ${-22 - 4 * m} ${78} Q 0 ${74 - 2 * sm} ${22 + 4 * m} ${78} Q ${14} ${84 + 22 * m} 0 ${86 + 22 * m} Q ${-14} ${84 + 22 * m} ${-22 - 4 * m} ${78} Z`}
              fill="#7E3434"
              {...stroke}
              strokeWidth={3.5}
            />
            <path
              d={`M -10 ${82 + 18 * m} Q 0 ${76 + 10 * m} 10 ${82 + 18 * m}`}
              fill="#E07A72"
              opacity={m > 0.3 ? 1 : 0}
            />
            <path
              d={`M -14 79 L 14 79`}
              stroke="#FFFFFF"
              strokeWidth={4}
              opacity={m > 0.25 ? 0.9 : 0}
              strokeLinecap="round"
            />
          </g>
        ) : (
          <path
            d={`M -24 ${78 - 3 * sm} Q 0 ${80 + 16 * sm} 24 ${78 - 3 * sm}`}
            fill="none"
            stroke="#8E3E3E"
            strokeWidth={5}
            strokeLinecap="round"
          />
        )}
      </g>
      {pose === "chin" ? (
        <g>
          {/* рука у подбородка: предплечье спереди корпуса, кулак под
              подбородком, указательный палец вдоль щеки — «задумалась» */}
          <path
            d="M 128 520 C 124 430 96 340 66 262"
            fill="none"
            stroke={C.navy}
            strokeWidth={88}
            strokeLinecap="round"
          />
          <path
            d="M 128 520 C 124 430 96 340 66 262"
            fill="none"
            stroke={C.cardigan}
            strokeWidth={79}
            strokeLinecap="round"
          />
          <path
            d="M 140 510 C 136 430 108 350 86 300"
            fill="none"
            stroke={C.cardiganShade}
            strokeWidth={4}
            opacity={0.6}
          />
          <ellipse cx={62} cy={232} rx={40} ry={18} fill={C.top} {...stroke} />
          <path
            d="M 18 196 C 14 168 34 148 62 148 C 92 148 106 170 102 198 C 98 222 76 230 56 228 C 34 226 20 216 18 196 Z"
            fill={C.skin}
            {...stroke}
          />
          <path
            d="M 70 156 C 74 132 80 110 84 92"
            stroke={C.navy}
            strokeWidth={25}
            strokeLinecap="round"
          />
          <path
            d="M 70 156 C 74 132 80 110 84 92"
            stroke={C.skin}
            strokeWidth={17}
            strokeLinecap="round"
          />
          <path
            d="M 30 186 Q 46 180 60 184 M 32 204 Q 48 198 64 202"
            fill="none"
            stroke={C.skinShade}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <path
            d="M 22 168 Q 40 160 56 166"
            fill="none"
            stroke={C.navy}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </g>
      ) : null}
    </svg>
  );
};
