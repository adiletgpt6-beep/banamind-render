// Белая легковая машина (вид сбоку, едет вправо) с жёлтой полосой бренда.
// В заднем окне — ребёнок, пристёгнутый ремнём; водитель держит руль
// обеими руками и смотрит на дорогу. Без надписей «такси» и без GPS.
import { C, STROKE } from "../palette";
import { Kid } from "./ui";

const st = {
  stroke: C.navy,
  strokeWidth: STROKE,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

const Wheel: React.FC<{ readonly cx: number; readonly rot: number }> = ({
  cx,
  rot,
}) => (
  <g transform={`translate(${cx} -40)`}>
    <circle r={40} fill="#2D3142" {...st} />
    <circle r={22} fill="#D9DEE8" stroke={C.navy} strokeWidth={3} />
    <g transform={`rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d="M 0 0 L 0 -19"
          transform={`rotate(${a})`}
          stroke="#8A93A8"
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}
    </g>
    <circle r={6} fill="#8A93A8" />
  </g>
);

// (x, y) — точка на дороге под серединой машины; rot — поворот колёс.
export const Car: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly rot?: number;
  readonly bounce?: number;
}> = ({ x, y, s = 1, rot = 0, bounce = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={236} ry={14} fill="rgba(20,40,90,0.14)" />
    <g transform={`translate(0 ${bounce})`}>
      {/* салон за стёклами: ребёнок сзади, водитель впереди */}
      <path d="M -112 -102 L -74 -168 L 92 -168 L 146 -102 Z" fill="#DCEBF8" />
      <g>
        <Kid x={-46} y={-134} s={0.68} girl />
        {/* водитель: смотрит на дорогу, обе руки на руле */}
        <path
          d="M 28 -100 C 30 -120 46 -128 66 -128 C 86 -128 98 -120 100 -100 Z"
          fill="#7C8FB8"
          stroke={C.navy}
          strokeWidth={3}
        />
        <circle
          cx={66}
          cy={-138}
          r={15}
          fill={C.skin}
          stroke={C.navy}
          strokeWidth={3}
        />
        <path
          d="M 50 -140 C 49 -160 84 -162 82 -144 C 74 -150 60 -150 50 -140 Z"
          fill={C.hair}
        />
        <circle cx={74} cy={-139} r={2.3} fill={C.navy} />
        <path
          d="M 72 -130 Q 76 -128 79 -131"
          fill="none"
          stroke="#8E3E3E"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          d="M 108 -136 A 20 20 0 0 1 114 -102"
          fill="none"
          stroke="#3B4458"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d="M 84 -114 Q 96 -118 108 -124 M 80 -108 Q 96 -108 110 -110"
          fill="none"
          stroke={C.skin}
          strokeWidth={8}
          strokeLinecap="round"
        />
      </g>
      {/* кузов с вырезами окон */}
      <path
        d="M -228 -40 C -230 -72 -220 -92 -196 -96 L -122 -100 L -82 -164 C -76 -172 -66 -176 -54 -176 L 92 -176 C 106 -176 116 -172 124 -164 L 172 -104 L 208 -98 C 224 -94 232 -80 232 -62 L 232 -40 C 232 -30 226 -24 214 -24 L -212 -24 C -224 -24 -228 -30 -228 -40 Z M -110 -102 L -74 -160 L -12 -160 L -12 -102 Z M 2 -102 L 2 -160 L 90 -160 C 98 -160 104 -156 110 -150 L 150 -102 Z"
        fill="#FFFFFF"
        fillRule="evenodd"
        {...st}
      />
      <path
        d="M -112 -102 L -74 -160 L -12 -160 L -12 -102 Z M 2 -102 L 2 -160 L 90 -160 C 98 -160 104 -156 110 -150 L 150 -102 Z"
        fill="rgba(170,205,235,0.18)"
        stroke={C.navy}
        strokeWidth={3.5}
      />
      <path
        d="M -60 -156 L -84 -114 M 40 -156 L 18 -116"
        stroke="#FFFFFF"
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* жёлтая полоса и детали */}
      <path d="M -224 -66 L 230 -66" stroke={C.yellow} strokeWidth={12} />
      <path
        d="M -6 -100 L -6 -30 M 152 -100 L 160 -32"
        stroke={C.navy}
        strokeWidth={3}
      />
      <rect x={-46} y={-90} width={26} height={7} rx={3.5} fill={C.navy} />
      <rect x={110} y={-90} width={26} height={7} rx={3.5} fill={C.navy} />
      <ellipse
        cx={222}
        cy={-82}
        rx={10}
        ry={8}
        fill={C.yellow}
        stroke={C.navy}
        strokeWidth={3}
      />
      <rect
        x={-232}
        y={-86}
        width={10}
        height={16}
        rx={4}
        fill={C.coral}
        stroke={C.navy}
        strokeWidth={3}
      />
      <path
        d="M -190 -24 A 52 52 0 0 1 -94 -24 M 94 -24 A 52 52 0 0 1 190 -24"
        fill="#FFFFFF"
        stroke={C.navy}
        strokeWidth={STROKE}
      />
      <Wheel cx={-142} rot={rot} />
      <Wheel cx={142} rot={rot} />
    </g>
  </g>
);
