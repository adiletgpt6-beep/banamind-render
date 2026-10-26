// Крупные планы рук (вид сверху на стол): детская рука с карандашом и
// рука папы, берущая лист. Нарисованы отдельно от рига — в крупном плане
// нужны пальцы, ногти, манжета; цвета кожи и одежды те же, что у рига.
import { LOOKS } from "../rig/looks";
import { Pencil } from "./Form";

const SON = LOOKS.son;
const DAD = LOOKS.dad;

// Детская рука держит карандаш (правша, вид сверху): кончик карандаша —
// в точке (x, y), карандаш смотрит вверх-вправо (к плечу), подушечки
// большого и указательного пальцев — у заточки, средний палец под
// карандашом, безымянный и мизинец поджаты, ребро ладони лежит на листе
// справа-ниже, рукав толстовки уходит за край кадра. lift — карандаш
// приподнят над бумагой.
export const KidWritingHand: React.FC<{ readonly x: number; readonly y: number; readonly lift?: number; readonly s?: number; readonly sleeve?: string }> = ({
  x,
  y,
  lift = 0,
  s = 1,
  sleeve = SON.topColor,
}) => {
  const sk = SON.skin;
  const sh = SON.skinShade;
  const st = { stroke: sh, strokeWidth: 2.4, strokeLinejoin: "round" as const };
  return (
    <g transform={`translate(${x} ${y - lift * 22 * s}) scale(${s})`}>
      {/* тень кисти на бумаге */}
      <ellipse cx={120} cy={118 + lift * 22} rx={105} ry={50} fill="rgba(60,40,20,0.13)" transform="rotate(32 120 118)" />
      {/* рукав и манжета */}
      <path d="M 150 150 C 210 150 300 210 360 280 L 300 420 C 230 330 170 260 120 222 Z" fill={sleeve} />
      <path d="M 120 222 C 140 190 150 170 150 150 L 176 152 C 178 180 166 206 146 238 Z" fill="#C7863A" />
      {/* ладонь с поджатыми безымянным и мизинцем */}
      <path d="M 52 64 C 60 34 98 26 130 40 C 168 56 186 104 172 150 C 160 188 120 206 92 188 C 64 170 46 110 52 64 Z" fill={sk} {...st} />
      <path d="M 70 150 C 66 128 84 118 100 126 C 112 132 112 152 100 160 C 88 168 74 164 70 150 Z" fill={sk} {...st} />
      <path d="M 96 176 C 94 158 110 150 124 158 C 134 166 132 182 120 188 C 110 192 98 188 96 176 Z" fill={sk} {...st} />
      {/* карандаш */}
      <Pencil x={0} y={0} angle={36} len={250} />
      {/* средний палец под карандашом */}
      <path d="M 34 30 C 30 14 44 4 58 10 C 76 18 90 40 82 54 C 74 66 46 56 34 30 Z" fill={sk} {...st} />
      {/* большой палец слева от карандаша */}
      <path d="M 14 -4 C 4 -20 18 -38 36 -34 C 58 -28 72 -6 66 12 C 60 26 30 22 14 -4 Z" fill={sk} {...st} />
      <ellipse cx={20} cy={-14} rx={8} ry={6} fill="#F2CBB0" transform="rotate(-30 20 -14)" />
      {/* указательный палец сверху на карандаше */}
      <path d="M 26 -40 C 22 -60 46 -76 70 -64 C 104 -48 126 -6 112 18 C 100 36 74 22 62 2 C 52 -14 32 -24 26 -40 Z" fill={sk} {...st} />
      <ellipse cx={36} cy={-50} rx={9} ry={6.5} fill="#F2CBB0" transform="rotate(-50 36 -50)" />
    </g>
  );
};

// Рука папы сверху: пальцы сверху листа у края, большой палец под листом,
// синяя манжета рубашки и часы. Точка (x, y) — кончики пальцев на листе.
// angle — направление руки (откуда пришла), градусы.
export const DadGripHand: React.FC<{ readonly x: number; readonly y: number; readonly angle?: number; readonly s?: number }> = ({ x, y, angle = 35, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}>
    {/* предплечье в рукаве, манжета, часы */}
    <path d="M -70 -150 L -80 -420 L 110 -420 L 90 -150 Z" fill={DAD.topColor} />
    <path d="M 40 -150 L 50 -420 L 110 -420 L 90 -150 Z" fill={DAD.topShade} opacity={0.6} />
    <rect x={-74} y={-170} width={166} height={34} rx={8} fill={DAD.inner} />
    <path d="M -58 -136 L 78 -136 L 70 -60 L -50 -60 Z" fill={DAD.skin} />
    <rect x={-56} y={-128} width={132} height={22} rx={6} fill="#2A2A34" />
    <rect x={-4} y={-136} width={34} height={38} rx={9} fill="#E6C15A" />
    {/* кисть */}
    <path d="M -64 -70 C -70 -20 -40 10 0 12 C 50 14 84 -10 80 -64 Z" fill={DAD.skin} stroke={DAD.skinShade} strokeWidth={3} />
    {/* четыре пальца лежат на листе */}
    {[-48, -18, 12, 42].map((fx, i) => (
      <g key={fx}>
        <rect x={fx - 13} y={-10} width={28} height={66 - Math.abs(i - 1.5) * 8} rx={14} fill={DAD.skin} stroke={DAD.skinShade} strokeWidth={3} />
        <rect x={fx - 8} y={36 - Math.abs(i - 1.5) * 8} width={18} height={14} rx={7} fill="#EBC3A5" />
      </g>
    ))}
  </g>
);

// Мелочи на столе (вид сверху): ластик, линейка, пенал.
export const DeskThings: React.FC = () => (
  <g>
    <g transform="translate(860 300) rotate(12)">
      <rect x={0} y={0} width={420} height={70} rx={10} fill="#F4F0E6" stroke="#D5CBB8" strokeWidth={3} />
      {Array.from({ length: 20 }, (_, i) => (
        <line key={i} x1={14 + i * 20} y1={0} x2={14 + i * 20} y2={i % 5 === 0 ? 30 : 18} stroke="#8D8473" strokeWidth={3} />
      ))}
    </g>
    <g transform="translate(-120 1180) rotate(-18)">
      <rect x={0} y={0} width={420} height={130} rx={60} fill="#5C88BC" />
      <rect x={0} y={56} width={420} height={18} fill="#4A74A6" />
      <circle cx={380} cy={65} r={14} fill="#E6C15A" />
    </g>
    <g transform="translate(900 1500) rotate(-8)">
      <rect x={0} y={0} width={110} height={60} rx={12} fill="#E58A8A" />
      <rect x={70} y={0} width={40} height={60} rx={10} fill="#5C88BC" />
    </g>
  </g>
);

const MOM = LOOKS.mom;

// Рука мамы сверху: указательный палец касается точки (x, y), остальные
// пальцы поджаты; светлый тёплый рукав кардигана и коралловая манжета
// блузки. angle — направление, откуда пришла рука (градусы, 0 — снизу).
export const MomPointHand: React.FC<{ readonly x: number; readonly y: number; readonly angle?: number; readonly s?: number; readonly who?: "mom" | "dad" }> = ({ x, y, angle = -60, s = 1, who = "mom" }) => {
  const L = who === "dad" ? { ...DAD, topShade: DAD.topShade, inner: DAD.inner } : MOM;
  const st = { stroke: L.skinShade, strokeWidth: 2.6, strokeLinejoin: "round" as const };
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}>
      <ellipse cx={18} cy={150} rx={70} ry={120} fill="rgba(60,40,20,0.12)" />
      {/* рукав кардигана и манжета блузки */}
      <path d="M -62 170 L -70 460 L 92 460 L 84 170 Z" fill={L.topColor} />
      <path d="M 40 170 L 48 460 L 92 460 L 84 170 Z" fill={L.topShade} opacity={0.7} />
      <rect x={-60} y={150} width={140} height={30} rx={10} fill={L.inner} />
      {/* кисть */}
      <path d="M -50 160 C -62 110 -46 70 -8 62 C 34 54 70 80 72 120 C 74 150 64 164 54 168 Z" fill={L.skin} {...st} />
      {/* поджатые пальцы (костяшки) */}
      {[-30, -2, 26].map((fx, i) => (
        <path key={fx} d={`M ${fx - 14} ${78 - i * 2} C ${fx - 16} ${50 - i * 2} ${fx + 14} ${48 - i * 2} ${fx + 14} ${78 - i * 2} Z`} fill={L.skin} {...st} />
      ))}
      {/* большой палец */}
      <path d="M 54 120 C 76 100 92 84 86 70 C 80 58 62 66 50 86 Z" fill={L.skin} {...st} />
      {/* указательный палец — до точки (0, 0) */}
      <path d="M -12 66 C -14 40 -10 14 -6 2 C -3 -6 6 -6 9 2 C 13 16 16 40 16 64 Z" fill={L.skin} {...st} />
      <ellipse cx={1.5} cy={6} rx={6} ry={5} fill="#F3CDB2" />
      {who === "dad" ? (
        <g>
          <rect x={-52} y={136} width={128} height={20} rx={6} fill="#2A2A34" />
          <rect x={4} y={130} width={30} height={32} rx={8} fill="#E6C15A" />
        </g>
      ) : null}
    </g>
  );
};
