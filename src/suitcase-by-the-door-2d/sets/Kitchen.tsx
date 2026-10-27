// Кухня-столовая семьи — вечер (S05 ужин, S06 вопрос на три дня, S07
// календари). Фронтальный план: тёплая вечерняя стена с зерном бумаги,
// слева — навесной шкафчик с посудой, справа — окно с вечерним небом и
// горами, над столом — подвесная лампа с тёплым светом. Стол для троих
// под льняной скатертью; сидящие за дальней стороной стола — за скатертью
// (стопы и стулья скрыты), видны спинки стульев. Предметы на столе — вид
// спереди чуть сверху (миски-пиалы, лепёшка, чайник, телефоны, лист
// расписания, ноутбук). KitchenTableTop — та же скатерть сверху для
// предметных вставок.
// Координаты — px мира; сидящие за столом: стопы на y = KITCHEN.seatY.
import { C } from "../theme";
import { Grain, HatchDefs, PlusMark, roughPath, roughRect, Svg } from "../kit";
import { clamp, lerp } from "../rig/motion";
import { ScheduleSheet } from "../props/Calendar";

export const KITCHEN = {
  ceiling: 150, // карниз под потолком
  wallBase: 1430, // плинтус (за столом, скрыт скатертью)
  seatY: 1483, // стопы сидящих за дальней стороной стола
  table: { x: 150, w: 780, back: 1150, front: 1222, hem: 1515 },
  window: { x: 640, y: 380, w: 290, h: 420 },
  lamp: { x: 540, y: 640 }, // нижний край абажура
  cabinet: { x: 90, y: 430, w: 330, h: 250 },
} as const;

const T = KITCHEN.table;
// Перспектива столешницы: доля глубины по вертикали.
export const TABLE_SQ = 0.3;
// Точка на столешнице: u — 0…1 слева направо, v — 0 (дальний край) … 1
// (передний край).
export const onTable = (u: number, v: number) => {
  const xl = lerp(T.x + 20, T.x, v);
  const xr = lerp(T.x + T.w - 20, T.x + T.w, v);
  return { x: lerp(xl, xr, u), y: lerp(T.back, T.front, v) };
};

const LINEN = "#F3E6CC";
const LINEN_SHADE = "#E4D2B0";
const BORDER = "#C98463";
const PIALA = "#FBF7EE";
const PIALA_BLUE = "#4F78A8";

// ---------- Задник ----------
export const KitchenBack: React.FC<{ readonly ink: number; readonly uid: string; readonly lampOn?: number }> = ({ ink, uid, lampOn = 1 }) => {
  const w = KITCHEN.window;
  const cb = KITCHEN.cabinet;
  const L = KITCHEN.lamp;
  return (
    <>
      <div style={{ position: "absolute", left: -700, top: -600, width: 2500, height: KITCHEN.wallBase + 600, backgroundColor: C.wallEvening, overflow: "hidden" }}>
        <Grain opacity={0.45} w={2500} h={KITCHEN.wallBase + 600} />
      </div>
      <div style={{ position: "absolute", left: -700, top: KITCHEN.wallBase, width: 2500, height: 1200, backgroundColor: C.floor, overflow: "hidden" }}>
        <Grain opacity={0.55} w={2500} h={1200} />
      </div>
      <Svg>
        <HatchDefs id={`${uid}-h`} />
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8C9FBC" />
            <stop offset="0.5" stopColor="#C8B3B0" />
            <stop offset="1" stopColor="#F0C690" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFE2A6" stopOpacity={0.75} />
            <stop offset="0.45" stopColor="#FFD996" stopOpacity={0.28} />
            <stop offset="1" stopColor="#FFD996" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* карниз под потолком и тёплая полоса света на стене */}
        <rect x={-700} y={KITCHEN.ceiling - 600} width={2500} height={600} fill="#E2CCA6" />
        <rect x={-700} y={KITCHEN.ceiling - 8} width={2500} height={22} fill="#EADBBF" stroke={C.ink} strokeWidth={ink * 0.7} />
        {/* плинтус */}
        <rect x={-700} y={KITCHEN.wallBase - 24} width={2500} height={24} fill="#E2D0AE" stroke={C.ink} strokeWidth={ink * 0.7} />
        {/* ---- окно с вечерним небом ---- */}
        <rect x={w.x} y={w.y} width={w.w} height={w.h} fill={`url(#${uid}-sky)`} />
        {/* дальние горы и крыши города */}
        <path
          d={`M ${w.x} ${w.y + w.h * 0.72} L ${w.x + w.w * 0.12} ${w.y + w.h * 0.6} L ${w.x + w.w * 0.26} ${w.y + w.h * 0.66} L ${w.x + w.w * 0.44} ${w.y + w.h * 0.5} L ${w.x + w.w * 0.62} ${w.y + w.h * 0.63} L ${w.x + w.w * 0.8} ${w.y + w.h * 0.55} L ${w.x + w.w} ${w.y + w.h * 0.66} L ${w.x + w.w} ${w.y + w.h} L ${w.x} ${w.y + w.h} Z`}
          fill="#A9B2C3"
        />
        <path d={`M ${w.x + w.w * 0.38} ${w.y + w.h * 0.54} L ${w.x + w.w * 0.44} ${w.y + w.h * 0.5} L ${w.x + w.w * 0.5} ${w.y + w.h * 0.54} L ${w.x + w.w * 0.46} ${w.y + w.h * 0.555} Z`} fill="#E9E4E6" opacity={0.9} />
        <path d={`M ${w.x + w.w * 0.75} ${w.y + w.h * 0.58} L ${w.x + w.w * 0.8} ${w.y + w.h * 0.55} L ${w.x + w.w * 0.85} ${w.y + w.h * 0.58} Z`} fill="#E9E4E6" opacity={0.85} />
        {[
          [0, 0.82, 0.16],
          [0.14, 0.78, 0.12],
          [0.27, 0.85, 0.2],
          [0.48, 0.8, 0.14],
          [0.63, 0.76, 0.17],
          [0.81, 0.83, 0.19],
        ].map(([u, v, ww], i) => (
          <g key={i}>
            <rect x={w.x + w.w * u} y={w.y + w.h * v} width={w.w * ww} height={w.h * (1 - v)} fill="#8C93A6" />
            {[0, 1].map((k) => (
              <rect key={k} x={w.x + w.w * (u + 0.03 + k * 0.06)} y={w.y + w.h * (v + 0.05)} width={9} height={11} fill="#F7D98F" opacity={(i + k) % 3 === 0 ? 0.25 : 0.9} />
            ))}
          </g>
        ))}
        {/* рама: переплёт */}
        <path d={roughRect(w.x, w.y, w.w, w.h, 3, 71, ink * 0.5)} fill="none" stroke={C.woodLight} strokeWidth={18} />
        <path d={roughRect(w.x - 9, w.y - 9, w.w + 18, w.h + 18, 3, 72, ink * 0.5)} fill="none" stroke={C.ink} strokeWidth={ink} />
        <path d={roughRect(w.x + 9, w.y + 9, w.w - 18, w.h - 18, 3, 73, ink * 0.5)} fill="none" stroke={C.ink} strokeWidth={ink * 0.8} />
        <rect x={w.x + w.w / 2 - 6} y={w.y + 9} width={12} height={w.h - 18} fill={C.woodLight} stroke={C.ink} strokeWidth={ink * 0.7} />
        <rect x={w.x + 9} y={w.y + w.h * 0.42 - 6} width={w.w - 18} height={12} fill={C.woodLight} stroke={C.ink} strokeWidth={ink * 0.7} />
        {/* подоконник и растение */}
        <rect x={w.x - 30} y={w.y + w.h + 6} width={w.w + 60} height={20} rx={4} fill={C.woodLight} stroke={C.ink} strokeWidth={ink} />
        <rect x={w.x - 30} y={w.y + w.h + 6} width={w.w + 60} height={20} rx={4} fill={`url(#${uid}-h)`} />
        <path d={`M ${w.x + w.w - 70} ${w.y + w.h + 6} L ${w.x + w.w - 78} ${w.y + w.h - 34} L ${w.x + w.w - 22} ${w.y + w.h - 34} L ${w.x + w.w - 30} ${w.y + w.h + 6} Z`} fill="#D99A74" stroke={C.ink} strokeWidth={ink * 0.8} />
        {[-26, -6, 12, 30].map((a, i) => (
          <ellipse key={i} cx={w.x + w.w - 50 + a * 0.8} cy={w.y + w.h - 62 - (i % 2) * 12} rx={11} ry={26} fill={i % 2 ? C.treeDark : C.tree} stroke={C.ink} strokeWidth={ink * 0.6} transform={`rotate(${a} ${w.x + w.w - 50 + a * 0.8} ${w.y + w.h - 62})`} />
        ))}
        {/* шторы */}
        {[-1, 1].map((s) => {
          const x0 = s < 0 ? w.x - 70 : w.x + w.w + 70;
          const x1 = s < 0 ? w.x + 18 : w.x + w.w - 18;
          return (
            <g key={s}>
              <path
                d={`M ${x0} ${w.y - 40} L ${x1} ${w.y - 40} Q ${x1 - s * 6} ${w.y + w.h * 0.45} ${x1 - s * 46} ${w.y + w.h * 0.78} Q ${x1 - s * 30} ${w.y + w.h + 30} ${x1 - s * 22} ${w.y + w.h + 120} L ${x0} ${w.y + w.h + 120} Z`}
                fill="#D7A584"
                stroke={C.ink}
                strokeWidth={ink * 0.9}
                strokeLinejoin="round"
              />
              <path d={`M ${x0} ${w.y - 40} L ${(x0 + x1) / 2} ${w.y - 40} L ${(x0 + x1) / 2 - s * 10} ${w.y + w.h + 120} L ${x0} ${w.y + w.h + 120} Z`} fill={`url(#${uid}-h)`} opacity={0.8} />
              {[0.3, 0.6].map((k) => (
                <path key={k} d={`M ${lerp(x0, x1, k)} ${w.y - 30} Q ${lerp(x0, x1, k) - s * 8} ${w.y + w.h * 0.5} ${lerp(x0, x1, k) - s * 18} ${w.y + w.h + 110}`} stroke="#B98767" strokeWidth={ink * 0.7} fill="none" />
              ))}
            </g>
          );
        })}
        <rect x={w.x - 100} y={w.y - 52} width={w.w + 200} height={14} rx={7} fill={C.woodDark} stroke={C.ink} strokeWidth={ink * 0.8} />
        {/* ---- навесной шкафчик с посудой ---- */}
        <path d={roughRect(cb.x, cb.y, cb.w, cb.h, 6, 74, ink * 0.5)} fill={C.woodLight} stroke={C.ink} strokeWidth={ink} />
        <path d={roughRect(cb.x, cb.y, cb.w, cb.h, 6, 74, ink * 0.5)} fill={`url(#${uid}-h)`} opacity={0.45} />
        {/* левая дверца — стекло, видны пиалы и тарелки */}
        <rect x={cb.x + 18} y={cb.y + 18} width={cb.w / 2 - 27} height={cb.h - 36} rx={4} fill="#E8EEEA" stroke={C.ink} strokeWidth={ink * 0.8} />
        <path d={`M ${cb.x + 22} ${cb.y + cb.h / 2} L ${cb.x + cb.w / 2 - 13} ${cb.y + cb.h / 2}`} stroke={C.woodDark} strokeWidth={ink * 1.2} />
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <path d={`M ${cb.x + 34 + k * 40} ${cb.y + cb.h / 2 - 32} L ${cb.x + 64 + k * 40} ${cb.y + cb.h / 2 - 32} L ${cb.x + 58 + k * 40} ${cb.y + cb.h / 2 - 6} L ${cb.x + 40 + k * 40} ${cb.y + cb.h / 2 - 6} Z`} fill={PIALA} stroke={C.ink} strokeWidth={ink * 0.6} />
            <path d={`M ${cb.x + 36 + k * 40} ${cb.y + cb.h / 2 - 24} L ${cb.x + 62 + k * 40} ${cb.y + cb.h / 2 - 24}`} stroke={PIALA_BLUE} strokeWidth={ink * 0.9} />
          </g>
        ))}
        {[0, 1, 2, 3].map((k) => (
          <ellipse key={k} cx={cb.x + 50 + k * 26} cy={cb.y + cb.h - 56} rx={14} ry={44} fill={k % 2 ? "#F4F0E6" : PIALA} stroke={C.ink} strokeWidth={ink * 0.6} />
        ))}
        {/* правая дверца — дерево */}
        <rect x={cb.x + cb.w / 2 + 9} y={cb.y + 18} width={cb.w / 2 - 27} height={cb.h - 36} rx={4} fill="none" stroke={C.woodDark} strokeWidth={ink * 0.9} />
        <rect x={cb.x + cb.w / 2 + 30} y={cb.y + 40} width={cb.w / 2 - 69} height={cb.h - 80} rx={4} fill="none" stroke={C.woodDark} strokeWidth={ink * 0.6} opacity={0.7} />
        {[cb.x + cb.w / 2 - 22, cb.x + cb.w / 2 + 22].map((x) => (
          <circle key={x} cx={x} cy={cb.y + cb.h / 2} r={6} fill="#B9B3A6" stroke={C.ink} strokeWidth={ink * 0.5} />
        ))}
        {/* полка под шкафчиком с банками */}
        <rect x={cb.x + 10} y={cb.y + cb.h + 120} width={cb.w - 20} height={14} rx={4} fill={C.woodLight} stroke={C.ink} strokeWidth={ink * 0.8} />
        {[
          [cb.x + 40, 58, "#E6B66A"],
          [cb.x + 96, 46, "#B98A5A"],
          [cb.x + 146, 64, "#C9D1B5"],
        ].map(([x, hh, col], i) => (
          <g key={i}>
            <rect x={x as number} y={cb.y + cb.h + 120 - (hh as number)} width={38} height={hh as number} rx={6} fill={col as string} stroke={C.ink} strokeWidth={ink * 0.6} />
            <rect x={(x as number) - 2} y={cb.y + cb.h + 112 - (hh as number)} width={42} height={10} rx={3} fill="#D26F4F" stroke={C.ink} strokeWidth={ink * 0.5} />
          </g>
        ))}
        {/* ---- подвесная лампа ---- */}
        <circle cx={L.x} cy={L.y + 10} r={420 * lampOn + 1} fill={`url(#${uid}-glow)`} />
        <path d={`M ${L.x} ${KITCHEN.ceiling - 200} L ${L.x} ${L.y - 92}`} stroke={C.ink} strokeWidth={ink * 0.9} />
        <path d={`M ${L.x - 16} ${L.y - 92} L ${L.x + 16} ${L.y - 92} L ${L.x + 12} ${L.y - 78} L ${L.x - 12} ${L.y - 78} Z`} fill="#3D3A3A" />
        <path
          d={`M ${L.x - 70} ${L.y} Q ${L.x - 60} ${L.y - 70} ${L.x} ${L.y - 82} Q ${L.x + 60} ${L.y - 70} ${L.x + 70} ${L.y} Z`}
          fill="#E7B65A"
          stroke={C.ink}
          strokeWidth={ink}
          strokeLinejoin="round"
        />
        <path d={`M ${L.x - 50} ${L.y - 30} Q ${L.x} ${L.y - 42} ${L.x + 50} ${L.y - 30}`} stroke="#C99A3E" strokeWidth={ink * 0.8} fill="none" />
        <ellipse cx={L.x} cy={L.y} rx={70} ry={12} fill={lampOn > 0.5 ? "#FFF0C4" : "#E8D9B8"} stroke={C.ink} strokeWidth={ink * 0.8} />
        <PlusMark x={460} y={300} />
        <PlusMark x={980} y={1000} />
      </Svg>
    </>
  );
};

// Спинка стула за сидящим (рисуется до персонажа): x — центр; child —
// стул сына (тот же стул, на сиденье подушка).
export const KitchenChair: React.FC<{ readonly x: number; readonly ink: number; readonly child?: boolean }> = ({ x, ink, child = false }) => {
  const seat = KITCHEN.seatY - 216;
  const top = seat - (child ? 200 : 214);
  const hw = child ? 78 : 88;
  return (
    <g>
      {[-1, 1].map((s) => (
        <rect key={s} x={x + s * hw - 9} y={top} width={18} height={seat - top + 30} rx={6} fill={C.woodDark} stroke={C.ink} strokeWidth={ink} />
      ))}
      <path d={roughRect(x - hw - 12, top - 8, hw * 2 + 24, 34, 12, 81 + x, ink * 0.4)} fill={C.wood} stroke={C.ink} strokeWidth={ink} />
      <rect x={x - hw + 8} y={top + 52} width={hw * 2 - 16} height={14} rx={6} fill={C.wood} stroke={C.ink} strokeWidth={ink * 0.8} />
    </g>
  );
};

// Стол под скатертью (передняя часть: столешница и свисающая скатерть) —
// поверх сидящих за дальней стороной стола; предметы сцена кладёт сверху.
export const KitchenTable: React.FC<{ readonly ink: number; readonly uid: string; readonly lampOn?: number }> = ({ ink, uid, lampOn = 1 }) => {
  const xl = T.x;
  const xr = T.x + T.w;
  return (
    <Svg>
      <HatchDefs id={`${uid}-th`} color="rgba(120,80,40,0.16)" step={10} />
      {/* скатерть спереди со складками */}
      <path
        d={`M ${xl} ${T.front} L ${xr} ${T.front} L ${xr + 14} ${T.hem} Q ${(xl + xr) / 2} ${T.hem + 10} ${xl - 14} ${T.hem} Z`}
        fill={LINEN}
        stroke={C.ink}
        strokeWidth={ink}
        strokeLinejoin="round"
      />
      <rect x={xl} y={T.front} width={T.w} height={46} fill={`url(#${uid}-th)`} />
      {[0.12, 0.3, 0.5, 0.7, 0.88].map((k, i) => (
        <path key={k} d={roughPath([[lerp(xl, xr, k), T.front + 40], [lerp(xl, xr, k) + (k - 0.5) * 26, T.hem - 6]], 90 + i, 2)} stroke={LINEN_SHADE} strokeWidth={ink * 1.1} fill="none" />
      ))}
      <path d={`M ${xl - 9} ${T.hem - 52} Q ${(xl + xr) / 2} ${T.hem - 44} ${xr + 9} ${T.hem - 52}`} stroke={BORDER} strokeWidth={12} fill="none" opacity={0.85} />
      <path d={`M ${xl - 11} ${T.hem - 30} Q ${(xl + xr) / 2} ${T.hem - 22} ${xr + 11} ${T.hem - 30}`} stroke={BORDER} strokeWidth={4} fill="none" opacity={0.7} />
      {/* столешница (скатерть сверху) */}
      <path d={`M ${xl} ${T.front} L ${xl + 20} ${T.back} L ${xr - 20} ${T.back} L ${xr} ${T.front} Z`} fill={LINEN} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <ellipse cx={KITCHEN.lamp.x} cy={(T.back + T.front) / 2} rx={330} ry={36} fill="#FFF4D2" opacity={0.55 * lampOn} />
      <path d={`M ${xl + 26} ${T.back + 10} L ${xr - 26} ${T.back + 10}`} stroke={BORDER} strokeWidth={ink * 0.8} opacity={0.4} />
    </Svg>
  );
};

// ---------- Посуда и предметы на столе (вид спереди чуть сверху) ----------
// Пиала-миска с супом на блюдце: cx — центр, y — линия стола, w — ширина.
export const Bowl: React.FC<{ readonly cx: number; readonly y: number; readonly w: number; readonly ink: number; readonly full?: number }> = ({ cx, y, w, ink, full = 1 }) => {
  const h = w * 0.42;
  const ry = w * 0.14;
  return (
    <g>
      <ellipse cx={cx} cy={y - 2} rx={w * 0.7} ry={w * 0.13} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink * 0.8} />
      <ellipse cx={cx + 4} cy={y + 2} rx={w * 0.5} ry={w * 0.07} fill={C.shadow} />
      <path d={`M ${cx - w / 2} ${y - h} Q ${cx - w * 0.48} ${y - 4} ${cx} ${y - 4} Q ${cx + w * 0.48} ${y - 4} ${cx + w / 2} ${y - h} Z`} fill={PIALA} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <path d={`M ${cx - w * 0.47} ${y - h * 0.72} Q ${cx} ${y - h * 0.5} ${cx + w * 0.47} ${y - h * 0.72}`} stroke={PIALA_BLUE} strokeWidth={ink * 1.3} fill="none" />
      {[-0.25, 0, 0.25].map((k) => (
        <circle key={k} cx={cx + k * w} cy={y - h * 0.42} r={w * 0.03} fill={PIALA_BLUE} />
      ))}
      <ellipse cx={cx} cy={y - h} rx={w / 2} ry={ry} fill={PIALA} stroke={C.ink} strokeWidth={ink} />
      {full > 0 ? <ellipse cx={cx} cy={y - h + ry * 0.15} rx={w * 0.44} ry={ry * 0.72} fill="#E2A15C" /> : null}
      {full > 0 ? (
        <g>
          <circle cx={cx - w * 0.14} cy={y - h + ry * 0.05} r={w * 0.05} fill="#8FB070" />
          <circle cx={cx + w * 0.12} cy={y - h + ry * 0.25} r={w * 0.045} fill="#F2D27A" />
        </g>
      ) : null}
    </g>
  );
};

// Пиала с чаем.
export const Cup: React.FC<{ readonly cx: number; readonly y: number; readonly w: number; readonly ink: number }> = ({ cx, y, w, ink }) => {
  const h = w * 0.58;
  return (
    <g>
      <ellipse cx={cx + 3} cy={y + 1} rx={w * 0.5} ry={w * 0.09} fill={C.shadow} />
      <path d={`M ${cx - w / 2} ${y - h} L ${cx - w * 0.3} ${y} L ${cx + w * 0.3} ${y} L ${cx + w / 2} ${y - h} Z`} fill={PIALA} stroke={C.ink} strokeWidth={ink * 0.9} strokeLinejoin="round" />
      <path d={`M ${cx - w * 0.45} ${y - h * 0.7} L ${cx + w * 0.45} ${y - h * 0.7}`} stroke={PIALA_BLUE} strokeWidth={ink * 1.1} />
      <ellipse cx={cx} cy={y - h} rx={w / 2} ry={w * 0.13} fill="#B5713E" stroke={C.ink} strokeWidth={ink * 0.9} />
    </g>
  );
};

// Круглая лепёшка на блюде.
export const Bread: React.FC<{ readonly cx: number; readonly y: number; readonly w: number; readonly ink: number }> = ({ cx, y, w, ink }) => (
  <g>
    <ellipse cx={cx} cy={y - 4} rx={w * 0.62} ry={w * 0.13} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink * 0.8} />
    <ellipse cx={cx} cy={y - 14} rx={w / 2} ry={w * 0.12} fill="#D9A15F" stroke={C.ink} strokeWidth={ink * 0.9} />
    <ellipse cx={cx} cy={y - 18} rx={w * 0.3} ry={w * 0.06} fill="#E9C089" />
    {[-0.16, -0.05, 0.06, 0.17].map((k) => (
      <circle key={k} cx={cx + k * w} cy={y - 18 + Math.abs(k) * 6} r={2.2} fill="#9C6A3A" />
    ))}
  </g>
);

// Чайник.
export const Teapot: React.FC<{ readonly cx: number; readonly y: number; readonly s: number; readonly ink: number }> = ({ cx, y, s, ink }) => (
  <g>
    <ellipse cx={cx + 4} cy={y + 1} rx={s * 0.6} ry={s * 0.1} fill={C.shadow} />
    <path d={`M ${cx + s * 0.4} ${y - s * 0.35} Q ${cx + s * 0.72} ${y - s * 0.42} ${cx + s * 0.8} ${y - s * 0.72}`} stroke={C.ink} strokeWidth={s * 0.11 + ink * 2} fill="none" strokeLinecap="round" />
    <path d={`M ${cx + s * 0.4} ${y - s * 0.35} Q ${cx + s * 0.72} ${y - s * 0.42} ${cx + s * 0.8} ${y - s * 0.72}`} stroke={PIALA} strokeWidth={s * 0.11} fill="none" strokeLinecap="round" />
    <path d={`M ${cx - s * 0.42} ${y - s * 0.62} Q ${cx - s * 0.72} ${y - s * 0.5} ${cx - s * 0.42} ${y - s * 0.22}`} stroke={C.ink} strokeWidth={ink * 3.2} fill="none" />
    <path d={`M ${cx - s * 0.5} ${y - s * 0.4} Q ${cx - s * 0.5} ${y} ${cx} ${y} Q ${cx + s * 0.5} ${y} ${cx + s * 0.5} ${y - s * 0.4} Q ${cx + s * 0.46} ${y - s * 0.72} ${cx} ${y - s * 0.74} Q ${cx - s * 0.46} ${y - s * 0.72} ${cx - s * 0.5} ${y - s * 0.4} Z`} fill={PIALA} stroke={C.ink} strokeWidth={ink} />
    <path d={`M ${cx - s * 0.48} ${y - s * 0.36} Q ${cx} ${y - s * 0.24} ${cx + s * 0.48} ${y - s * 0.36}`} stroke={PIALA_BLUE} strokeWidth={ink * 1.4} fill="none" />
    <ellipse cx={cx} cy={y - s * 0.74} rx={s * 0.22} ry={s * 0.06} fill={PIALA} stroke={C.ink} strokeWidth={ink * 0.8} />
    <circle cx={cx} cy={y - s * 0.84} r={s * 0.06} fill={PIALA_BLUE} stroke={C.ink} strokeWidth={ink * 0.6} />
  </g>
);

// Ложка, лежащая на столе: (x, y) — точка у черенка, dir — 1 черпак вправо.
export const SpoonFlat: React.FC<{ readonly x: number; readonly y: number; readonly len: number; readonly ink: number; readonly dir?: number }> = ({ x, y, len, ink, dir = 1 }) => (
  <g>
    <path d={`M ${x} ${y} L ${x + dir * len * 0.68} ${y - len * 0.06}`} stroke={C.ink} strokeWidth={len * 0.09 + ink * 1.4} strokeLinecap="round" />
    <path d={`M ${x} ${y} L ${x + dir * len * 0.68} ${y - len * 0.06}`} stroke="#C9CFD8" strokeWidth={len * 0.09} strokeLinecap="round" />
    <ellipse cx={x + dir * len * 0.82} cy={y - len * 0.07} rx={len * 0.18} ry={len * 0.07} fill="#DDE2EA" stroke={C.ink} strokeWidth={ink * 0.7} />
  </g>
);

// Телефон, лежащий на столе экраном вверх.
export const PhoneFlat: React.FC<{ readonly cx: number; readonly y: number; readonly w: number; readonly ink: number; readonly color?: string; readonly glow?: number }> = ({ cx, y, w, ink, color = "#2E3443", glow = 0 }) => {
  const d = w * 1.9 * TABLE_SQ;
  return (
    <g>
      <path d={`M ${cx - w / 2} ${y} L ${cx - w / 2 + 6} ${y - d} L ${cx + w / 2 + 6} ${y - d} L ${cx + w / 2} ${y} Z`} fill={color} stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <path d={`M ${cx - w / 2 + 5} ${y - 3} L ${cx - w / 2 + 9} ${y - d + 3} L ${cx + w / 2 + 3} ${y - d + 3} L ${cx + w / 2 - 3} ${y - 3} Z`} fill={glow > 0 ? `rgba(190,220,245,${0.4 + glow * 0.6})` : "#3E4C6A"} />
    </g>
  );
};

// Лист расписания, лежащий на столе: вид сверху, сжатый перспективой.
// (cx, cy) — центр, rot — поворот на столе (°).
export const SheetOnTable: React.FC<{ readonly cx: number; readonly cy: number; readonly w: number; readonly rot?: number; readonly ink: number; readonly hi?: readonly number[] }> = ({ cx, cy, w, rot = 0, ink, hi }) => {
  const h = w * 0.68;
  return (
    <g transform={`translate(${cx} ${cy}) scale(1 ${TABLE_SQ}) rotate(${rot})`}>
      <rect x={-w / 2 + 4} y={-h / 2 + 10} width={w} height={h} rx={10} fill={C.shadow} />
      <ScheduleSheet x={-w / 2} y={-h / 2} w={w} h={h} ink={ink * 1.6} hi={hi} />
    </g>
  );
};

// Ноутбук папы: вид спереди, крышка обращена к камере тыльной стороной
// (экран смотрит на сидящих). cx — центр, y — передний край на столе,
// open — 0 закрыт … 1 открыт.
export const Laptop: React.FC<{ readonly cx: number; readonly y: number; readonly w: number; readonly open: number; readonly ink: number }> = ({ cx, y, w, open, ink }) => {
  const o = clamp(open);
  const base = 8;
  const hingeY = y - base;
  const depth = w * 0.64; // глубина крышки (реальная)
  const th = (o * 104 * Math.PI) / 180;
  const freeY = hingeY - depth * (Math.cos(th) * TABLE_SQ + Math.sin(th));
  const narrow = 6 * Math.cos(th);
  return (
    <g>
      <ellipse cx={cx + 6} cy={y + 2} rx={w * 0.56} ry={8} fill={C.shadow} />
      <path d={`M ${cx - w / 2} ${y} L ${cx + w / 2} ${y} L ${cx + w / 2 + 2} ${hingeY} L ${cx - w / 2 - 2} ${hingeY} Z`} fill="#9EA5B0" stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <path
        d={`M ${cx - w / 2 - 2} ${hingeY} L ${cx - w / 2 + narrow} ${freeY} L ${cx + w / 2 - narrow} ${freeY} L ${cx + w / 2 + 2} ${hingeY} Z`}
        fill="#C8CED7"
        stroke={C.ink}
        strokeWidth={ink}
        strokeLinejoin="round"
      />
      {o > 0.4 ? <circle cx={cx} cy={(hingeY + freeY) / 2} r={w * 0.045} fill="#DDE2E9" stroke="#AEB5C0" strokeWidth={ink * 0.5} /> : null}
      {o > 0.6 ? <path d={`M ${cx - w / 2 + narrow + 8} ${freeY + 2} L ${cx + w / 2 - narrow - 8} ${freeY + 2}`} stroke="rgba(220,236,255,0.9)" strokeWidth={ink * 1.2} /> : null}
    </g>
  );
};

// ---------- Скатерть сверху (предметные вставки) ----------
export const KitchenTableTop: React.FC<{ readonly ink: number; readonly uid: string; readonly w?: number; readonly h?: number }> = ({ ink, uid, w = 1500, h = 2600 }) => (
  <>
    <div style={{ position: "absolute", left: -210, top: -340, width: w, height: h, backgroundColor: LINEN, overflow: "hidden" }}>
      <Grain opacity={0.55} w={w} h={h} />
    </div>
    <Svg>
      <HatchDefs id={`${uid}-tt`} color="rgba(150,110,70,0.07)" step={12} angle={0} />
      <HatchDefs id={`${uid}-tt2`} color="rgba(150,110,70,0.06)" step={12} angle={90} />
      <rect x={-210} y={-340} width={w} height={h} fill={`url(#${uid}-tt)`} />
      <rect x={-210} y={-340} width={w} height={h} fill={`url(#${uid}-tt2)`} />
      {/* кайма скатерти */}
      <path d={`M -210 1700 L ${w - 210} 1700`} stroke={BORDER} strokeWidth={18} opacity={0.7} />
      <path d={`M -210 1736 L ${w - 210} 1736`} stroke={BORDER} strokeWidth={6} opacity={0.6} />
      {/* тёплое пятно света лампы */}
      <ellipse cx={540} cy={760} rx={720} ry={620} fill="#FFF3D0" opacity={0.35} />
      <path d={roughPath([[-210, 1688], [w - 210, 1690]], 95, 2)} stroke={C.ink} strokeWidth={ink * 0.3} opacity={0.2} fill="none" />
    </Svg>
  </>
);
