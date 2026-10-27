// Квартира семьи — одна и та же во всех домашних сценах (S01, S08, S12–S15).
// Фронтальный план (вид спереди): слева — дверной проём в комнату сына,
// в центре — прихожий стол у стены, над ним полка со школьной фотографией
// сына, справа — входная дверь с вешалкой. Пол — деревянный, стены —
// тёплые кремовые с лёгким зерном бумаги. Координаты — px мира, пол
// (стоящие у стены) — y = HOME.floor.
//
// TableTop — тот же стол в виде сверху (предметные планы S01/S08):
// столешница из досок во весь кадр.
import { C } from "../theme";
import { Grain, HatchDefs, PlusMark, roughPath, roughRect, Svg } from "../kit";
import { Head } from "../rig/Head";
import { CLOSED } from "../context";
import { EXPR } from "../rig/pose";
import { LOOKS } from "../rig/looks";

export const HOME = {
  floor: 1500, // линия пола у стены
  // проём в комнату сына
  doorway: { x: 120, w: 230, top: 760 },
  // прихожий стол
  table: { x: 360, w: 560, top: 1150, back: 1108, apron: 56 },
  // входная дверь
  door: { x: 1010, w: 270, top: 700 },
  // полка с фотографией
  shelf: { x: 470, w: 330, y: 820 },
  photo: { x: 690, y: 700, w: 92, h: 118 },
  // где стоит мама за столом (стопы скрыты столом)
  momBehind: { x: 690, y: 1440 },
} as const;

// Фотография сына в рамке (тот же рисованный мальчик: голова из рига).
// x, y — левый верхний угол рамки; s — масштаб головы.
export const SchoolPhoto: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly ink: number; readonly uid: string; readonly stand?: boolean }> = ({ x, y, w, h, ink, uid, stand = true }) => {
  const look = LOOKS.sonSchool;
  const k = (h * 0.62) / (look.build.headRy * 2.4);
  const cx = x + w / 2;
  const cy = y + h * 0.44;
  return (
    <g>
      {stand ? <path d={`M ${x + w * 0.7} ${y + h} L ${x + w * 0.85} ${y + h + 10}`} stroke={C.woodDark} strokeWidth={ink * 1.5} /> : null}
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.woodLight} stroke={C.ink} strokeWidth={ink} />
      <rect x={x + w * 0.1} y={y + h * 0.08} width={w * 0.8} height={h * 0.84} fill="#DDE9F0" stroke={C.ink} strokeWidth={ink * 0.6} />
      <clipPath id={`${uid}-ph`}>
        <rect x={x + w * 0.1} y={y + h * 0.08} width={w * 0.8} height={h * 0.84} />
      </clipPath>
      <g clipPath={`url(#${uid}-ph)`}>
        {/* плечи в школьном пиджаке с белым воротником */}
        <path d={`M ${cx - w * 0.42} ${y + h} Q ${cx - w * 0.4} ${cy + h * 0.26} ${cx} ${cy + h * 0.24} Q ${cx + w * 0.4} ${cy + h * 0.26} ${cx + w * 0.42} ${y + h} Z`} fill={look.topColor} stroke={C.ink} strokeWidth={ink * 0.6} />
        <path d={`M ${cx - w * 0.1} ${cy + h * 0.25} L ${cx} ${cy + h * 0.36} L ${cx + w * 0.1} ${cy + h * 0.25} Z`} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink * 0.4} />
        <g transform={`translate(${cx} ${cy}) scale(${k}) translate(${0} ${0})`}>
          <Head uid={`${uid}-head-b`} look={look} cx={0} cy={0} turn={0.08} lookX={0} lookY={0} nod={0} expr={EXPR.smile} mouth={CLOSED} blink={0} hairSway={0} part="back" ink={ink / k} />
          <Head uid={`${uid}-head`} look={look} cx={0} cy={0} turn={0.08} lookX={0} lookY={0} nod={0} expr={EXPR.smile} mouth={CLOSED} blink={0} hairSway={0} part="front" ink={ink / k} />
        </g>
      </g>
    </g>
  );
};

// Задник: стена, плинтус, пол, проём, полка, входная дверь, вешалка.
// sonRoomLit — свет в комнате сына; evening — тёплый вечерний свет.
export const HomeBack: React.FC<{ readonly ink: number; readonly uid: string; readonly evening?: number; readonly photoOnShelf?: boolean; readonly doorOpen?: number }> = ({ ink, uid, evening = 0, photoOnShelf = true, doorOpen = 0 }) => {
  const d = HOME.doorway;
  const dr = HOME.door;
  const sh = HOME.shelf;
  const wall = evening > 0.5 ? C.wallEvening : C.wall;
  return (
    <>
      {/* стена и пол — HTML-слои с зерном бумаги */}
      <div style={{ position: "absolute", left: -600, top: -400, width: 2600, height: HOME.floor + 400, backgroundColor: wall, overflow: "hidden" }}>
        <Grain opacity={0.45} w={2600} h={HOME.floor + 400} />
      </div>
      <div style={{ position: "absolute", left: -600, top: HOME.floor, width: 2600, height: 1400, backgroundColor: C.floor, overflow: "hidden" }}>
        <Grain opacity={0.55} w={2600} h={1400} />
      </div>
      <Svg>
        <HatchDefs id={`${uid}-hatch`} />
        {/* доски пола (перспектива к стене) */}
        {Array.from({ length: 22 }, (_, i) => {
          const x0 = -500 + i * 120;
          return <path key={i} d={`M ${x0} ${HOME.floor} L ${540 + (x0 - 540) * 2.6} ${HOME.floor + 1200}`} stroke={C.floorShade} strokeWidth={ink * 0.6} />;
        })}
        {[1560, 1650, 1780, 1950].map((y) => (
          <path key={y} d={`M -600 ${y} L 2000 ${y}`} stroke={C.floorShade} strokeWidth={ink * 0.4} opacity={0.6} />
        ))}
        {/* плинтус */}
        <rect x={-600} y={HOME.floor - 26} width={2600} height={26} fill="#E9DDC4" stroke={C.ink} strokeWidth={ink * 0.8} />
        {/* проём в комнату сына: комната видна внутри */}
        <rect x={d.x} y={d.top} width={d.w} height={HOME.floor - d.top} fill="#D8E4E6" />
        <path d={roughPath([[d.x, HOME.floor - 120], [d.x + d.w, HOME.floor - 150]], 4, 1)} stroke="#C2D1D4" strokeWidth={ink} />
        <rect x={d.x} y={HOME.floor - 90} width={d.w} height={90} fill="#C9B590" />
        {/* уголок кровати и плакат в комнате сына */}
        <rect x={d.x + 10} y={HOME.floor - 220} width={110} height={130} rx={10} fill="#9FC0CE" stroke={C.ink} strokeWidth={ink * 0.7} />
        <rect x={d.x + 140} y={d.top + 120} width={64} height={84} rx={4} fill="#F5C642" stroke={C.ink} strokeWidth={ink * 0.6} opacity={0.85} />
        <path d={`M ${d.x + 150} ${d.top + 180} L ${d.x + 172} ${d.top + 140} L ${d.x + 194} ${d.top + 180} Z`} fill="#A7B89A" stroke={C.ink} strokeWidth={ink * 0.5} />
        {/* наличник проёма */}
        <path d={roughRect(d.x - 18, d.top - 18, d.w + 36, HOME.floor - d.top + 18, 4, 9, ink * 0.5)} fill="none" stroke={C.woodDark} strokeWidth={22} />
        <path d={roughRect(d.x - 29, d.top - 29, d.w + 58, HOME.floor - d.top + 29, 4, 10, ink * 0.5)} fill="none" stroke={C.ink} strokeWidth={ink} />
        <path d={roughRect(d.x - 7, d.top - 7, d.w + 14, HOME.floor - d.top + 7, 4, 11, ink * 0.5)} fill="none" stroke={C.ink} strokeWidth={ink * 0.8} />
        {/* полка над столом */}
        <rect x={sh.x} y={sh.y} width={sh.w} height={18} rx={4} fill={C.woodLight} stroke={C.ink} strokeWidth={ink} />
        <rect x={sh.x} y={sh.y} width={sh.w} height={18} rx={4} fill={`url(#${uid}-hatch)`} />
        {/* книги */}
        {[
          [sh.x + 20, 92, "#B4785C"],
          [sh.x + 48, 104, "#7FA3B5"],
          [sh.x + 80, 86, "#A7B89A"],
          [sh.x + 108, 98, "#D9B66A"],
        ].map(([x, hgt, col], i) => (
          <rect key={i} x={x as number} y={sh.y - (hgt as number)} width={26} height={hgt as number} rx={3} fill={col as string} stroke={C.ink} strokeWidth={ink * 0.7} />
        ))}
        {/* небольшое растение */}
        <path d={`M ${sh.x + 170} ${sh.y} L ${sh.x + 160} ${sh.y - 40} L ${sh.x + 210} ${sh.y - 40} L ${sh.x + 200} ${sh.y} Z`} fill="#D99A74" stroke={C.ink} strokeWidth={ink * 0.8} />
        {[-30, -8, 14, 34].map((a, i) => (
          <ellipse key={i} cx={sh.x + 185 + a * 0.9} cy={sh.y - 66 - (i % 2) * 14} rx={14} ry={30} fill={i % 2 ? C.treeDark : C.tree} stroke={C.ink} strokeWidth={ink * 0.6} transform={`rotate(${a} ${sh.x + 185 + a * 0.9} ${sh.y - 66})`} />
        ))}
        {/* школьная фотография сына на полке */}
        {photoOnShelf ? <SchoolPhoto x={HOME.photo.x} y={HOME.photo.y} w={HOME.photo.w} h={HOME.photo.h} ink={ink * 0.8} uid={`${uid}-photo`} /> : null}
        {/* входная дверь справа */}
        <rect x={dr.x - 16} y={dr.top - 16} width={dr.w + 32} height={HOME.floor - dr.top + 16} fill={C.woodDark} stroke={C.ink} strokeWidth={ink} />
        <path d={roughRect(dr.x, dr.top, dr.w * (1 - doorOpen * 0.7), HOME.floor - dr.top, 3, 12, ink * 0.5)} fill={C.door} stroke={C.ink} strokeWidth={ink} />
        <rect x={dr.x + 34} y={dr.top + 60} width={(dr.w - 68) * (1 - doorOpen * 0.7)} height={300} rx={6} fill="none" stroke={C.woodDark} strokeWidth={ink * 0.9} />
        <rect x={dr.x + 34} y={dr.top + 420} width={(dr.w - 68) * (1 - doorOpen * 0.7)} height={300} rx={6} fill="none" stroke={C.woodDark} strokeWidth={ink * 0.9} />
        <rect x={dr.x + 24} y={dr.top + 380} width={16} height={46} rx={6} fill="#B9B3A6" stroke={C.ink} strokeWidth={ink * 0.7} />
        {/* вешалка с курткой */}
        <rect x={dr.x - 150} y={dr.top + 40} width={110} height={14} rx={5} fill={C.woodDark} stroke={C.ink} strokeWidth={ink * 0.7} />
        <path d={`M ${dr.x - 120} ${dr.top + 54} Q ${dr.x - 150} ${dr.top + 180} ${dr.x - 132} ${dr.top + 300} L ${dr.x - 62} ${dr.top + 300} Q ${dr.x - 50} ${dr.top + 170} ${dr.x - 80} ${dr.top + 54} Z`} fill="#6F8CA8" stroke={C.ink} strokeWidth={ink * 0.9} />
        <PlusMark x={300} y={420} />
        <PlusMark x={940} y={360} />
      </Svg>
    </>
  );
};

// Прихожий стол (передняя часть: столешница, царга, ножки) — рисуется
// поверх стоящей за столом мамы. Предметы на столе сцена кладёт поверх.
export const HomeTable: React.FC<{ readonly ink: number; readonly uid: string }> = ({ ink, uid }) => {
  const t = HOME.table;
  return (
    <Svg>
      <HatchDefs id={`${uid}-thatch`} />
      {/* ножки */}
      {[t.x + 26, t.x + t.w - 52].map((x) => (
        <rect key={x} x={x} y={t.top + t.apron - 6} width={26} height={HOME.floor - t.top - t.apron + 20} rx={4} fill={C.woodDark} stroke={C.ink} strokeWidth={ink} />
      ))}
      {/* нижняя полка с корзиной */}
      <rect x={t.x + 30} y={HOME.floor - 112} width={t.w - 60} height={16} rx={4} fill={C.wood} stroke={C.ink} strokeWidth={ink} />
      <path d={roughRect(t.x + 70, HOME.floor - 200, 170, 88, 10, 51, ink * 0.5)} fill="#D7B98C" stroke={C.ink} strokeWidth={ink * 0.9} />
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M ${t.x + 78} ${HOME.floor - 180 + k * 24} L ${t.x + 232} ${HOME.floor - 180 + k * 24}`} stroke={C.woodDark} strokeWidth={ink * 0.6} opacity={0.6} />
      ))}
      {/* столешница (видна сверху узкой полосой) и царга с ящиком */}
      <path d={`M ${t.x - 10} ${t.top} L ${t.x + 18} ${t.back} L ${t.x + t.w - 18} ${t.back} L ${t.x + t.w + 10} ${t.top} Z`} fill={C.woodLight} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <rect x={t.x - 10} y={t.top} width={t.w + 20} height={t.apron} rx={4} fill={C.wood} stroke={C.ink} strokeWidth={ink} />
      <rect x={t.x - 10} y={t.top} width={t.w + 20} height={t.apron} rx={4} fill={`url(#${uid}-thatch)`} />
      <rect x={t.x + t.w * 0.3} y={t.top + 8} width={t.w * 0.4} height={t.apron - 14} rx={4} fill="none" stroke={C.woodDark} strokeWidth={ink * 0.8} />
      <circle cx={t.x + t.w * 0.5} cy={t.top + t.apron * 0.55} r={5} fill="#B9B3A6" stroke={C.ink} strokeWidth={ink * 0.5} />
    </Svg>
  );
};

// Столешница сверху (предметный план): доски во весь кадр, лёгкая
// штриховка теней и зерно бумаги. Сцена кладёт предметы поверх.
export const TableTop: React.FC<{ readonly ink: number; readonly uid: string; readonly w?: number; readonly h?: number }> = ({ ink, uid, w = 1400, h = 2400 }) => (
  <>
    <div style={{ position: "absolute", left: -160, top: -240, width: w, height: h, backgroundColor: C.woodLight, overflow: "hidden" }}>
      <Grain opacity={0.6} w={w} h={h} />
    </div>
    <Svg>
      <HatchDefs id={`${uid}-tt`} color="rgba(120,80,40,0.10)" step={14} />
      {Array.from({ length: 9 }, (_, i) => {
        const x = -160 + i * 175;
        return (
          <g key={i}>
            <path d={roughPath([[x, -240], [x + 6, 2160]], 40 + i, 3)} stroke={C.woodDark} strokeWidth={ink * 0.9} fill="none" opacity={0.55} />
            {/* волокна дерева */}
            {[0.2, 0.5, 0.8].map((k, j) => (
              <path key={j} d={`M ${x + 40 + j * 40} ${-200 + ((i * 230 + j * 410) % 900)} q 12 120 -4 260 q -14 120 6 240`} stroke={C.woodDark} strokeWidth={ink * 0.5} fill="none" opacity={0.3} />
            ))}
          </g>
        );
      })}
      <rect x={-160} y={-240} width={w} height={h} fill={`url(#${uid}-tt)`} opacity={0.6} />
    </Svg>
  </>
);
