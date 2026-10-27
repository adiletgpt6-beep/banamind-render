// Переговорная в офисе папы (S04; при необходимости — S07). Вид спереди:
// ровная светлая стена с зерном бумаги, слева окно на город с далёкими
// горами, на стене круглые часы и экран со спокойной схемой (без текста),
// в углу растение. Длинный стол встречи с передней панелью (ноги сидящих
// скрыты), за ним — офисные стулья. Координаты — px мира; при камере
// { x: 540, y: 960, zoom: 1 } мир совпадает с кадром.
//   OFFICE.floor         — линия пола у стены (стопы сидящих за столом);
//   OFFICE.table         — стол { x, w, top, back, apron };
//   OFFICE.seats         — x мест за столом (слева направо);
//   OFFICE.clock/screen  — часы { x, y, r } и экран { x, y, w, h };
//   <OfficeBack ink uid minutes /> — стена, окно, часы (minutes — время
//                                    в минутах от полуночи, 750 = 12:30);
//   <OfficeChair x ink seat />     — спинка стула (до сидящего);
//   <OfficeTable ink uid />        — стол (после тел сидящих, до их рук).
import { C } from "../theme";
import { Grain, HatchDefs, PlusMark, roughPath, roughRect, Svg } from "../kit";

export const OFFICE = {
  floor: 1500,
  table: { x: 60, w: 960, top: 1186, back: 1118, apron: 44 },
  seats: [250, 545, 835],
  clock: { x: 214, y: 600, r: 64 },
  screen: { x: 470, y: 470, w: 470, h: 280 },
  window: { x: -40, y: 470, w: 160, h: 560 },
} as const;

// Круглые настенные часы: minutes — минуты от полуночи.
export const WallClock: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly minutes: number; readonly ink: number }> = ({ x, y, r, minutes, ink }) => {
  const m = minutes % 60;
  const h = (minutes / 60) % 12;
  const ma = (m / 60) * 360;
  const ha = (h / 12) * 360;
  return (
    <g>
      <circle cx={x + 5} cy={y + 7} r={r} fill={C.shadow} />
      <circle cx={x} cy={y} r={r} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink * 1.4} />
      <circle cx={x} cy={y} r={r - ink * 2.2} fill="none" stroke="#C9CED3" strokeWidth={ink * 0.6} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r0 = r * (i % 3 === 0 ? 0.7 : 0.78);
        return <path key={i} d={`M ${x + Math.sin(a) * r0} ${y - Math.cos(a) * r0} L ${x + Math.sin(a) * r * 0.86} ${y - Math.cos(a) * r * 0.86}`} stroke={C.ink} strokeWidth={ink * (i % 3 === 0 ? 1 : 0.6)} strokeLinecap="round" />;
      })}
      <path d={`M ${x} ${y} L ${x} ${y - r * 0.46}`} stroke={C.ink} strokeWidth={ink * 1.4} strokeLinecap="round" transform={`rotate(${ha} ${x} ${y})`} />
      <path d={`M ${x} ${y + r * 0.1} L ${x} ${y - r * 0.68}`} stroke={C.ink} strokeWidth={ink * 0.9} strokeLinecap="round" transform={`rotate(${ma} ${x} ${y})`} />
      <circle cx={x} cy={y} r={ink * 1.3} fill={C.yellowDeep} stroke={C.ink} strokeWidth={ink * 0.5} />
    </g>
  );
};

export const OfficeBack: React.FC<{ readonly ink: number; readonly uid: string; readonly minutes?: number }> = ({ ink, uid, minutes = 750 }) => {
  const O = OFFICE;
  const w = O.window;
  const s = O.screen;
  return (
    <>
      <div style={{ position: "absolute", left: -600, top: -400, width: 2400, height: O.floor + 400, backgroundColor: C.wallOffice, overflow: "hidden" }}>
        <Grain opacity={0.45} w={2400} h={O.floor + 400} />
      </div>
      <div style={{ position: "absolute", left: -600, top: O.floor, width: 2400, height: 1200, backgroundColor: "#CBD0CF", overflow: "hidden" }}>
        <Grain opacity={0.5} w={2400} h={1200} />
      </div>
      <Svg>
        <HatchDefs id={`${uid}-h`} />
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C9DFEA" />
            <stop offset="1" stopColor="#EEF3EE" />
          </linearGradient>
        </defs>
        {/* окно: небо, горы, крыши */}
        <rect x={w.x} y={w.y} width={w.w} height={w.h} fill={`url(#${uid}-sky)`} />
        <path d={roughPath([[w.x, w.y + 250], [w.x + 40, w.y + 190], [w.x + 80, w.y + 230], [w.x + 120, w.y + 170], [w.x + w.w, w.y + 220]], 501, 3) + ` L ${w.x + w.w} ${w.y + w.h} L ${w.x} ${w.y + w.h} Z`} fill={C.mountain} stroke={C.ink} strokeWidth={ink * 0.5} />
        <path d={`M ${w.x + 106} ${w.y + 182} L ${w.x + 120} ${w.y + 170} L ${w.x + 136} ${w.y + 186} Z`} fill="#FBFCFB" stroke={C.ink} strokeWidth={ink * 0.4} />
        <rect x={w.x} y={w.y + 330} width={90} height={w.h - 330} fill="#E5DCCB" stroke={C.ink} strokeWidth={ink * 0.5} />
        {[0, 1, 2, 3].map((r) => (
          <rect key={r} x={w.x + 50} y={w.y + 350 + r * 50} width={24} height={26} fill="#C7D8E0" stroke={C.ink} strokeWidth={ink * 0.4} />
        ))}
        <ellipse cx={w.x + 130} cy={w.y + 420} rx={40} ry={70} fill={C.tree} stroke={C.ink} strokeWidth={ink * 0.5} />
        <path d={roughRect(w.x, w.y, w.w, w.h, 4, 503, ink * 0.4)} fill="none" stroke="#FFFFFF" strokeWidth={22} />
        <path d={roughRect(w.x - 11, w.y - 11, w.w + 22, w.h + 22, 4, 504, ink * 0.4)} fill="none" stroke={C.ink} strokeWidth={ink} />
        <path d={`M ${w.x + w.w / 2} ${w.y} L ${w.x + w.w / 2} ${w.y + w.h}`} stroke="#FFFFFF" strokeWidth={14} />
        <rect x={w.x - 24} y={w.y + w.h + 8} width={w.w + 48} height={16} fill="#F4F4F0" stroke={C.ink} strokeWidth={ink * 0.7} />
        {/* часы */}
        <WallClock x={O.clock.x} y={O.clock.y} r={O.clock.r} minutes={minutes} ink={ink} />
        {/* экран на стене: спокойная схема из блоков и столбиков */}
        <rect x={s.x + 8} y={s.y + 10} width={s.w} height={s.h} rx={10} fill={C.shadow} />
        <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={10} fill="#2E3A52" stroke={C.ink} strokeWidth={ink} />
        <rect x={s.x + 14} y={s.y + 14} width={s.w - 28} height={s.h - 28} rx={4} fill="#EEF2F4" />
        <rect x={s.x + 34} y={s.y + 34} width={150} height={14} rx={7} fill="#9FB3C8" />
        {[0.42, 0.62, 0.5, 0.8].map((v, i) => (
          <rect key={i} x={s.x + 40 + i * 52} y={s.y + s.h - 40 - v * 150} width={34} height={v * 150} rx={3} fill={i === 3 ? C.yellow : "#A9C3DA"} stroke={C.ink} strokeWidth={ink * 0.5} />
        ))}
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <rect x={s.x + 280} y={s.y + 70 + k * 56} width={150} height={36} rx={8} fill={k === 1 ? C.yellowSoft : "#DCE6EE"} stroke={C.ink} strokeWidth={ink * 0.5} />
            <rect x={s.x + 294} y={s.y + 84 + k * 56} width={90 - k * 16} height={8} rx={4} fill="#9FB3C8" />
          </g>
        ))}
        <rect x={s.x + s.w / 2 - 30} y={s.y + s.h} width={60} height={18} fill="#9AA3AD" stroke={C.ink} strokeWidth={ink * 0.6} />
        {/* растение в углу */}
        <path d={`M 950 ${O.floor} L 935 ${O.floor - 120} L 1035 ${O.floor - 120} L 1020 ${O.floor} Z`} fill="#D9D2C6" stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
        {[-40, -20, 0, 18, 36].map((a, i) => (
          <ellipse key={i} cx={985 + a * 1.2} cy={O.floor - 200 - (i % 2) * 40} rx={20} ry={64} fill={i % 2 ? C.treeDark : C.tree} stroke={C.ink} strokeWidth={ink * 0.6} transform={`rotate(${a} ${985 + a * 1.2} ${O.floor - 150})`} />
        ))}
        {/* плинтус */}
        <rect x={-600} y={O.floor - 18} width={2400} height={18} fill="#DADFDD" stroke={C.ink} strokeWidth={ink * 0.7} />
        <PlusMark x={380} y={380} />
        <PlusMark x={1000} y={330} />
      </Svg>
    </>
  );
};

// Спинка офисного стула (видна над плечами сидящего): x — середина,
// seat — высота сиденья (y мира).
export const OfficeChair: React.FC<{ readonly x: number; readonly seat: number; readonly ink: number; readonly h?: number }> = ({ x, seat, ink, h = 300 }) => (
  <g>
    <path d={roughRect(x - 92, seat - h, 184, h - 30, 30, x, ink * 0.4)} fill="#4A5468" stroke={C.ink} strokeWidth={ink} />
    <path d={roughRect(x - 74, seat - h + 18, 148, h - 70, 24, x + 1, ink * 0.3)} fill="#56617A" />
    <rect x={x - 110} y={seat - 24} width={220} height={30} rx={12} fill="#3E475A" stroke={C.ink} strokeWidth={ink * 0.8} />
  </g>
);

// Стол встречи: столешница узкой полосой, кромка и передняя панель.
export const OfficeTable: React.FC<{ readonly ink: number; readonly uid: string }> = ({ ink, uid }) => {
  const t = OFFICE.table;
  return (
    <Svg>
      <HatchDefs id={`${uid}-th`} />
      <path d={`M ${t.x - 14} ${t.top} L ${t.x + 22} ${t.back} L ${t.x + t.w - 22} ${t.back} L ${t.x + t.w + 14} ${t.top} Z`} fill="#F2EEE6" stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <rect x={t.x - 14} y={t.top} width={t.w + 28} height={t.apron * 0.5} rx={4} fill="#DCD5C8" stroke={C.ink} strokeWidth={ink} />
      <rect x={t.x + 10} y={t.top + t.apron * 0.5} width={t.w - 20} height={OFFICE.floor - t.top - t.apron * 0.5 - 26} fill="#C9C2B4" stroke={C.ink} strokeWidth={ink} />
      <rect x={t.x + 10} y={t.top + t.apron * 0.5} width={t.w - 20} height={OFFICE.floor - t.top - t.apron * 0.5 - 26} fill={`url(#${uid}-th)`} opacity={0.6} />
      {[t.x + 20, t.x + t.w - 60].map((x) => (
        <rect key={x} x={x} y={OFFICE.floor - 30} width={40} height={30} fill="#9AA3AD" stroke={C.ink} strokeWidth={ink * 0.8} />
      ))}
    </Svg>
  );
};
