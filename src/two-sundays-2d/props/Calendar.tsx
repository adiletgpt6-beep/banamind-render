// Детский календарь — один постоянный ассет для всего фильма.
// Лист 1000 × 1320 единиц (портрет): заголовок «Менин аптам», ровно семь
// клеток по порядку дней — четыре в верхнем ряду и три (шире) в нижнем,
// без восьмой рамки. Третья клетка — «Биздин жекшемби» на месте среды:
// детский рисунок трёх человек за столом и оранжевый солнечный кружок-
// наклейка (отличительный штрих, по нему лист узнаётся в финале). Седьмая
// клетка — настоящее «Жекшемби».
// Управляемые слои (0…1):
//   ring3 / ring7 — карандашный контур вокруг «Биздин жекшемби» / «Жекшемби»;
//   ray   — последний луч солнышка (дорисовывается в первой сцене);
//   play  — короткое «Оюн» рядом с рисунком (дописывает папа в конце).
// Надписи появляются только по ходу штриха (клип по ширине), кончик
// карандаша — calPencilTip().
import { SU2_TEXT } from "../script";
import { C, F } from "../theme";

export const CAL_W = 1000;
export const CAL_H = 1320;

// Клетки (единицы листа).
const TOP_Y = 190;
const ROW_H = 520;
const GAP = 24;
const PAD = 40;
const cellsTop = Array.from({ length: 4 }, (_, i) => {
  const w = (CAL_W - 2 * PAD - 3 * GAP) / 4;
  return { x: PAD + i * (w + GAP), y: TOP_Y, w, h: ROW_H };
});
const cellsBottom = Array.from({ length: 3 }, (_, i) => {
  const w = (CAL_W - 2 * PAD - 2 * GAP) / 3;
  return { x: PAD + i * (w + GAP), y: TOP_Y + ROW_H + GAP, w, h: ROW_H };
});
export const CAL_CELLS = [...cellsTop, ...cellsBottom];

const DAY_COLORS = [C.kidRed, C.kidBlue, C.kidOrange, C.kidGreen, C.kidPurple, C.kidTeal, C.kidPink];

// Важные точки листа (единицы листа) — для камеры и рук.
const c3 = CAL_CELLS[2];
const c7 = CAL_CELLS[6];
export const CAL_POINTS = {
  ourSunday: { x: c3.x + c3.w / 2, y: c3.y + 88 },
  drawing: { x: c3.x + c3.w / 2, y: c3.y + 290 },
  sun: { x: c3.x + c3.w - 48, y: c3.y + 190 },
  play: { x: c3.x + c3.w / 2, y: c3.y + c3.h - 52 },
  sunday: { x: c7.x + c7.w / 2, y: c7.y + 70 },
  dadFigure: { x: c3.x + c3.w / 2 + 52, y: c3.y + 270 },
  center: { x: CAL_W / 2, y: CAL_H / 2 },
} as const;

// Ширина «Оюн» при письме и кончик карандаша (единицы листа).
const PLAY_W = 120;
export const calPencilTip = (play: number) => ({
  x: CAL_POINTS.play.x - PLAY_W / 2 + PLAY_W * Math.max(0, Math.min(1, play)),
  y: CAL_POINTS.play.y + 6 + 8 * Math.sin(play * 30),
});

// Контур «как обведено карандашом»: эллипс, рисуется по длине.
const Ring: React.FC<{ cx: number; cy: number; rx: number; ry: number; k: number; color: string }> = ({ cx, cy, rx, ry, k, color }) => {
  if (k <= 0) return null;
  const len = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry))) * 1.08;
  const d = `M ${cx - rx} ${cy + 4} C ${cx - rx} ${cy - ry * 1.3} ${cx + rx} ${cy - ry * 1.25} ${cx + rx} ${cy} C ${cx + rx} ${cy + ry * 1.3} ${cx - rx * 1.05} ${cy + ry * 1.2} ${cx - rx * 0.98} ${cy - ry * 0.2}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${len * k} ${len}`} opacity={0.85} />;
};

// Детский рисунок: стол и трое за ним (папа, мама, дочка), солнышко.
const FamilyDrawing: React.FC<{ x: number; y: number; ray: number }> = ({ x, y, ray }) => {
  const line = { stroke: C.ink, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const person = (px: number, h: number, color: string, hair: string, skirt = false, braids = false) => (
    <g>
      {/* волосы и голова */}
      <circle cx={px} cy={y - h} r={24} fill="#F2C9A5" stroke={C.ink} strokeWidth={4} />
      <path d={`M ${px - 24} ${y - h - 4} Q ${px} ${y - h - 38} ${px + 24} ${y - h - 4}`} fill={hair} stroke={C.ink} strokeWidth={3} />
      {braids ? (
        <>
          <path d={`M ${px - 24} ${y - h} q -12 18 -6 34`} {...line} stroke={hair} strokeWidth={8} />
          <path d={`M ${px + 24} ${y - h} q 12 18 6 34`} {...line} stroke={hair} strokeWidth={8} />
        </>
      ) : null}
      <circle cx={px - 8} cy={y - h - 2} r={3} fill={C.ink} />
      <circle cx={px + 8} cy={y - h - 2} r={3} fill={C.ink} />
      <path d={`M ${px - 9} ${y - h + 9} Q ${px} ${y - h + 17} ${px + 9} ${y - h + 9}`} {...line} strokeWidth={3} />
      {/* туловище */}
      <path d={skirt ? `M ${px - 20} ${y - h + 26} L ${px + 20} ${y - h + 26} L ${px + 30} ${y - 10} L ${px - 30} ${y - 10} Z` : `M ${px - 24} ${y - h + 26} L ${px + 24} ${y - h + 26} L ${px + 24} ${y - 10} L ${px - 24} ${y - 10} Z`} fill={color} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* руки на столе */}
      <path d={`M ${px - 22} ${y - h + 34} L ${px - 34} ${y - 4}`} {...line} />
      <path d={`M ${px + 22} ${y - h + 34} L ${px + 34} ${y - 4}`} {...line} />
    </g>
  );
  return (
    <g>
      {/* мама — слева, дочка — в центре, папа — справа (как за настоящим столом) */}
      {person(x - 78, 118, C.navy, "#2A201D")}
      {person(x, 92, C.kidOrange, "#2A1F1C", true, true)}
      {person(x + 78, 124, "#5E8FB8", "#1F1A19")}
      {/* стол */}
      <path d={`M ${x - 128} ${y} L ${x + 128} ${y}`} {...line} stroke={C.woodDark} strokeWidth={12} />
      <path d={`M ${x - 110} ${y + 4} L ${x - 110} ${y + 70} M ${x + 110} ${y + 4} L ${x + 110} ${y + 70}`} {...line} stroke={C.woodDark} strokeWidth={8} />
      {/* тарелки */}
      {[-62, 0, 62].map((dx) => (
        <ellipse key={dx} cx={x + dx} cy={y - 8} rx={20} ry={6} fill="#FFFFFF" stroke={C.ink} strokeWidth={3} />
      ))}
      {/* солнышко-наклейка (отличительный штрих): оранжевый кружок, неровные лучи */}
      <g transform={`translate(${x + 112} ${y - 205})`}>
        <circle r={28} fill={C.orange} stroke="#C9531A" strokeWidth={3} />
        {[0, 1, 2, 3, 4, 5, 6].map((k) => {
          const a = (k / 8) * Math.PI * 2 - Math.PI / 2;
          const l = 18 + (k % 2) * 6;
          return <path key={k} d={`M ${Math.cos(a) * 36} ${Math.sin(a) * 36} L ${Math.cos(a) * (36 + l)} ${Math.sin(a) * (36 + l)}`} stroke={C.orange} strokeWidth={6} strokeLinecap="round" />;
        })}
        {ray > 0 ? (
          (() => {
            const a = (7 / 8) * Math.PI * 2 - Math.PI / 2;
            const l = 22 * Math.min(1, ray);
            return <path d={`M ${Math.cos(a) * 36} ${Math.sin(a) * 36} L ${Math.cos(a) * (36 + l)} ${Math.sin(a) * (36 + l)}`} stroke={C.orange} strokeWidth={6} strokeLinecap="round" />;
          })()
        ) : null}
      </g>
    </g>
  );
};

// Маленькие рисунки других дней (детские значки).
const Doodle: React.FC<{ i: number; x: number; y: number }> = ({ i, x, y }) => {
  const st = { stroke: C.ink, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (i) {
    case 0: // рюкзак
      return (
        <g>
          <rect x={x - 40} y={y - 50} width={80} height={96} rx={18} fill={C.yellow} {...st} />
          <rect x={x - 26} y={y} width={52} height={30} rx={8} fill="#F4B92E" {...st} />
          <path d={`M ${x - 20} ${y - 50} q 20 -28 40 0`} fill="none" {...st} />
        </g>
      );
    case 1: // книжка
      return (
        <g>
          <path d={`M ${x} ${y - 30} L ${x - 60} ${y - 44} L ${x - 60} ${y + 34} L ${x} ${y + 48} L ${x + 60} ${y + 34} L ${x + 60} ${y - 44} Z`} fill="#FFFFFF" {...st} />
          <path d={`M ${x} ${y - 30} L ${x} ${y + 48}`} {...st} />
          <path d={`M ${x - 46} ${y - 14} l 34 8 M ${x + 12} ${y - 6} l 34 -8`} {...st} strokeWidth={3} stroke={C.kidBlue} />
        </g>
      );
    case 3: // карандаш
      return (
        <g transform={`rotate(-30 ${x} ${y})`}>
          <rect x={x - 70} y={y - 14} width={110} height={28} fill={C.kidGreen} {...st} />
          <path d={`M ${x + 40} ${y - 14} L ${x + 76} ${y} L ${x + 40} ${y + 14} Z`} fill="#E8C89A" {...st} />
        </g>
      );
    case 4: // звёздочка
      return <path d={`M ${x} ${y - 52} L ${x + 15} ${y - 14} L ${x + 54} ${y - 12} L ${x + 22} ${y + 12} L ${x + 34} ${y + 50} L ${x} ${y + 28} L ${x - 34} ${y + 50} L ${x - 22} ${y + 12} L ${x - 54} ${y - 12} L ${x - 15} ${y - 14} Z`} fill={C.yellow} {...st} />;
    case 5: // цветок
      return (
        <g>
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k / 5) * Math.PI * 2;
            return <circle key={k} cx={x + Math.cos(a) * 26} cy={y - 10 + Math.sin(a) * 26} r={18} fill={C.kidPink} {...st} />;
          })}
          <circle cx={x} cy={y - 10} r={14} fill={C.yellow} {...st} />
          <path d={`M ${x} ${y + 24} L ${x} ${y + 64}`} {...st} stroke={C.kidGreen} strokeWidth={6} />
        </g>
      );
    case 6: // облачко и мяч — настоящее воскресенье
      return (
        <g>
          <path d={`M ${x - 70} ${y + 10} q -6 -40 34 -40 q 12 -34 50 -20 q 40 -6 42 34 q 26 8 10 30 Z`} fill="#FFFFFF" {...st} />
          <circle cx={x + 40} cy={y + 70} r={30} fill={C.kidRed} {...st} />
          <path d={`M ${x + 12} ${y + 64} q 28 12 56 0`} fill="none" {...st} stroke="#FFFFFF" />
        </g>
      );
    default:
      return null;
  }
};

export const CalendarArt: React.FC<{
  readonly w: number; // ширина листа в px мира
  readonly detail?: boolean; // false — упрощённо (лист в руке издали)
  readonly ring3?: number;
  readonly ring7?: number;
  readonly ray?: number;
  readonly play?: number;
  readonly shadow?: boolean;
}> = ({ w, detail = true, ring3 = 0, ring7 = 0, ray = 1, play = 0, shadow = true }) => {
  const k = w / CAL_W;
  const days = SU2_TEXT.days;
  const playW = PLAY_W * Math.max(0, Math.min(1, play));
  return (
    <g transform={`scale(${k})`}>
      {shadow ? <rect x={10} y={16} width={CAL_W} height={CAL_H} rx={14} fill="rgba(20,20,30,0.16)" /> : null}
      <rect x={0} y={0} width={CAL_W} height={CAL_H} rx={14} fill="#FFFEFA" stroke="#DCD6C8" strokeWidth={4} />
      {/* дырочки от скрепления / неровный край сверху */}
      {[0.2, 0.5, 0.8].map((p) => (
        <circle key={p} cx={CAL_W * p} cy={34} r={10} fill="#E8E2D6" />
      ))}
      {detail ? (
        <text x={CAL_W / 2} y={140} textAnchor="middle" fontFamily={F.kid} fontWeight={900} fontSize={78} fill={C.navy}>
          Менин аптам
        </text>
      ) : (
        <rect x={CAL_W / 2 - 220} y={86} width={440} height={56} rx={14} fill={C.navy} opacity={0.75} />
      )}
      {CAL_CELLS.map((c, i) => {
        const our = i === 2;
        return (
          <g key={i}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={18} fill={our ? "#FFF3E2" : "#FFFFFF"} stroke={our ? C.orange : "#2B2B33"} strokeWidth={our ? 7 : 5} />
            {detail ? (
              our ? (
                <text x={c.x + c.w / 2} y={c.y + 70} textAnchor="middle" fontFamily={F.kid} fontWeight={900} fontSize={38} fill={DAY_COLORS[i]}>
                  <tspan x={c.x + c.w / 2}>{SU2_TEXT.ourSunday[0]}</tspan>
                  <tspan x={c.x + c.w / 2} dy={44}>
                    {SU2_TEXT.ourSunday[1]}
                  </tspan>
                </text>
              ) : (
                <text x={c.x + c.w / 2} y={c.y + 76} textAnchor="middle" fontFamily={F.kid} fontWeight={900} fontSize={i >= 4 ? 50 : 35} fill={DAY_COLORS[i]}>
                  {days[i]}
                </text>
              )
            ) : (
              <rect x={c.x + c.w * 0.15} y={c.y + 40} width={c.w * 0.7} height={our ? 70 : 36} rx={10} fill={DAY_COLORS[i]} opacity={0.8} />
            )}
            {our ? <FamilyDrawing x={c.x + c.w / 2} y={c.y + 400} ray={ray} /> : <Doodle i={i} x={c.x + c.w / 2} y={c.y + (i >= 4 ? 300 : 300)} />}
          </g>
        );
      })}
      {/* «Оюн» — дописано папой, раскрывается по ходу штриха */}
      {play > 0 ? (
        <g>
          <clipPath id="su2-play-clip">
            <rect x={CAL_POINTS.play.x - PLAY_W / 2 - 4} y={CAL_POINTS.play.y - 50} width={playW + 8} height={80} />
          </clipPath>
          <text x={CAL_POINTS.play.x} y={CAL_POINTS.play.y + 14} textAnchor="middle" fontFamily={F.kid} fontWeight={800} fontSize={46} fill={C.navy} clipPath="url(#su2-play-clip)" fontStyle="italic">
            {SU2_TEXT.play}
          </text>
        </g>
      ) : null}
      <Ring cx={CAL_POINTS.ourSunday.x} cy={CAL_POINTS.ourSunday.y - 12} rx={c3.w * 0.52} ry={60} k={ring3} color={C.orange} />
      <Ring cx={CAL_POINTS.sunday.x} cy={CAL_POINTS.sunday.y - 10} rx={c7.w * 0.48} ry={48} k={ring7} color={C.orange} />
    </g>
  );
};
