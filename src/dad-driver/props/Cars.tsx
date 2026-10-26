// Машины ролика (вид сбоку, плоско с мягким объёмом):
//   white    — белый седан BalaGo (силуэт Volkswagen Polo седан ~2010):
//              без «такси»-раскраски, без жёлтого;
//   graphite — личная машина папы, нейтральный графитовый седан.
// Нос машины смотрит вправо (flip — влево). (0, 0) — точка на дороге
// посередине между колёсами; длина ≈ 300 единиц × scale. Колёса вращаются
// по пройденному пути (dist), а не по времени.
import { C } from "../kit";

export type CarKind = "white" | "graphite";

const PAL = {
  white: { body: "#F7F8FA", shade: "#D9DEE6", line: "#AEB7C4", glass: "#2D4766", glassHi: "#5C7FA3" },
  graphite: { body: "#4A515E", shade: "#3A404B", line: "#2A2F38", glass: "#22344A", glassHi: "#4C6788" },
} as const;

export const SideCar: React.FC<{
  readonly kind: CarKind;
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly flip?: boolean;
  readonly dist?: number; // пройденный путь (единицы рисунка) — для колёс
  readonly people?: { readonly driver?: boolean; readonly back?: boolean; readonly front?: boolean };
  readonly glow?: number; // мягкий светящийся контур (на тёмной доске)
}> = ({ kind, x, y, scale = 1, flip = false, dist = 0, people, glow = 0 }) => {
  const p = PAL[kind];
  const R = 26; // радиус колеса
  const rot = ((dist / (2 * Math.PI * R)) * 360) % 360;
  const wheel = (cx: number) => (
    <g key={cx}>
      <circle cx={cx} cy={-R} r={R} fill="#1E2230" />
      <circle cx={cx} cy={-R} r={R * 0.58} fill="#C9D0DA" />
      <g transform={`rotate(${rot} ${cx} ${-R})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <rect key={a} x={cx - 2.5} y={-R - R * 0.55} width={5} height={R * 0.5} rx={2} fill="#8D97A6" transform={`rotate(${a} ${cx} ${-R})`} />
        ))}
      </g>
      <circle cx={cx} cy={-R} r={R * 0.16} fill="#6F7988" />
    </g>
  );
  // кузов седана: капот, лобовое, крыша, багажник
  const body = "M -150 -30 C -152 -54 -146 -66 -128 -70 L -96 -74 L -60 -112 C -50 -122 -40 -124 -26 -124 L 52 -124 C 66 -124 74 -120 84 -110 L 112 -80 L 140 -74 C 152 -70 156 -60 154 -44 L 152 -30 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <ellipse cx={0} cy={2} rx={160} ry={10} fill="rgba(10,15,30,0.28)" />
      {glow > 0 ? <path d={body} fill="none" stroke={C.cyan} strokeWidth={10} strokeOpacity={0.25 * glow} /> : null}
      <path d={body} fill={p.body} stroke={p.line} strokeWidth={3} strokeLinejoin="round" />
      {/* нижняя часть кузова темнее */}
      <path d="M -150 -30 L 152 -30 L 154 -50 L -151 -50 Z" fill={p.shade} />
      {/* окна */}
      <path d="M -54 -108 C -46 -116 -38 -118 -28 -118 L 6 -118 L 6 -80 L -84 -80 Z" fill={p.glass} />
      <path d="M 14 -118 L 50 -118 C 62 -118 68 -114 76 -106 L 100 -80 L 14 -80 Z" fill={p.glass} />
      <path d="M -40 -110 L -14 -110 L -30 -84 L -56 -84 Z" fill={p.glassHi} opacity={0.55} />
      {/* люди в салоне: водитель спереди, ребёнок сзади (пристёгнут) */}
      {people?.driver ? (
        <g>
          <circle cx={58} cy={-100} r={11} fill="#DCAA84" />
          <path d="M 46 -104 C 48 -116 70 -116 70 -104 Z" fill="#1F1A19" />
        </g>
      ) : null}
      {people?.front ? (
        <g>
          <circle cx={36} cy={-100} r={10.5} fill="#E6B590" />
          <path d="M 25 -103 C 27 -116 47 -116 47 -101 L 47 -92 L 44 -98 Z" fill="#2A201D" />
        </g>
      ) : null}
      {people?.back ? (
        <g>
          <circle cx={-30} cy={-95} r={9} fill="#E8B48D" />
          <path d="M -39 -98 C -37 -108 -22 -108 -21 -98 Z" fill="#221B19" />
          {/* диагональ ремня */}
          <path d="M -40 -86 L -22 -80" stroke="#8A93A3" strokeWidth={3} />
        </g>
      ) : null}
      {/* стойки, ручки, фары */}
      <rect x={6} y={-120} width={8} height={42} fill={p.body} />
      <rect x={-34} y={-70} width={18} height={5} rx={2.5} fill={p.line} />
      <rect x={36} y={-70} width={18} height={5} rx={2.5} fill={p.line} />
      <path d="M 140 -70 L 154 -64 L 152 -54 L 136 -58 Z" fill="#F4F1E6" />
      <path d="M -148 -64 L -138 -66 L -136 -54 L -150 -52 Z" fill="#D9705F" />
      {wheel(-92)}
      {wheel(94)}
    </g>
  );
};

// Значки маршрута (дом, школа) — светлые объёмные иконки для тёмной доски
// и финала. (x, y) — середина основания, s — масштаб (≈ 120 единиц ширины).
export const HouseIcon: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={70} ry={10} fill="rgba(0,0,0,0.25)" />
    <path d="M -52 0 L -52 -62 L 0 -104 L 52 -62 L 52 0 Z" fill="#F6F7F9" />
    <path d="M 0 -104 L 52 -62 L 52 0 L 30 0 L 30 -60 L 0 -86 Z" fill="#DDE3EA" />
    <path d="M -64 -56 L 0 -112 L 64 -56" fill="none" stroke={C.yellow} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={-14} y={-36} width={28} height={36} rx={4} fill={C.tealDeep} />
    <rect x={-40} y={-56} width={20} height={18} rx={3} fill={C.cyan} />
  </g>
);

export const SchoolIcon: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={90} ry={11} fill="rgba(0,0,0,0.25)" />
    <rect x={-80} y={-76} width={160} height={76} rx={6} fill="#F6F7F9" />
    <rect x={-80} y={-76} width={160} height={14} fill="#DDE3EA" />
    <path d="M -30 -76 L 0 -110 L 30 -76 Z" fill="#F6F7F9" />
    <circle cx={0} cy={-90} r={9} fill={C.yellow} />
    {[-58, -30, 30, 58].map((wx) => (
      <rect key={wx} x={wx - 10} y={-56} width={20} height={20} rx={3} fill={C.cyan} />
    ))}
    <rect x={-13} y={-34} width={26} height={34} rx={4} fill={C.tealDeep} />
    {/* флажок */}
    <rect x={70} y={-140} width={4} height={64} fill="#AEB7C4" />
    <path d="M 74 -140 L 104 -132 L 74 -124 Z" fill={C.yellow} />
  </g>
);
