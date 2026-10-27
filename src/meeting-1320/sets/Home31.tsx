// Домашние места №31: лестничная площадка у квартиры бабушки (сцена 6a),
// офис мамы в другом районе (6b) и вечерняя квартира семьи (сцены 9–10).
// Перспектива с одной точкой схода у каждого места: s — масштаб глубины
// (1 — у камеры), рост героя — H × s.
import { box } from "../kit";
import { clamp, easeInOut, hash01, lerp } from "../rig/motion";
import { C } from "../theme";
import { CityView, ink, mix } from "./Office31";

const Svg: React.FC<{ readonly children: React.ReactNode; readonly blur?: number }> = ({ children, blur = 0 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", filter: blur ? `blur(${blur}px)` : undefined })}>
    {children}
  </svg>
);

// ======================================================================
// Площадка у квартиры бабушки: стена подъезда, дверь (открывается внутрь
// квартиры, шарнир слева), за ней тёплая прихожая; коврик, окно подъезда.
// ======================================================================
export const GD = { horizon: 860, floorF: 1900, vpx: 540, wallS: 0.7 } as const;
export const gdY = (s: number) => GD.horizon + (GD.floorF - GD.horizon) * s;
export const gdX = (X: number, s: number) => GD.vpx + (X - GD.vpx) * s;
const DOOR = { X: 600, w: 420, h: 940 }; // px при s = 1
export const gdS = (y: number) => (y - GD.horizon) / (GD.floorF - GD.horizon);
export const GD_POS = {
  doorX: gdX(DOOR.X, GD.wallS),
  doorL: gdX(DOOR.X, GD.wallS) - (DOOR.w * GD.wallS) / 2,
  doorR: gdX(DOOR.X, GD.wallS) + (DOOR.w * GD.wallS) / 2,
  doorTop: gdY(GD.wallS) - DOOR.h * GD.wallS,
  floorWall: gdY(GD.wallS),
  // бабушка в проёме (внутри, чуть глубже стены)
  grandma: { x: gdX(DOOR.X + 60, 0.66), y: gdY(0.66), s: 0.66 },
  // в прихожей (куда уходит внук)
  hall: { x: gdX(DOOR.X + 40, 0.58), y: gdY(0.58), s: 0.58 },
  // на площадке
  son: { x: gdX(DOOR.X - 40, 0.8), y: gdY(0.8), s: 0.8 },
  father: { x: gdX(DOOR.X - 420, 0.9), y: gdY(0.9), s: 0.9 },
} as const;

export const GrandmaDoor: React.FC<{ readonly open: number; readonly inside?: React.ReactNode; readonly front?: React.ReactNode }> = ({ open, inside, front }) => {
  const s = GD.wallS;
  const y0 = gdY(s);
  const dx = gdX(DOOR.X, s);
  const dw = DOOR.w * s;
  const dh = DOOR.h * s;
  const o = easeInOut(clamp(open));
  const wall = "#DCE3D6";
  const wallLow = "#B9C7B3";
  return (
    <>
      <Svg>
        {/* стена подъезда: светлая сверху, крашеная панель снизу */}
        <rect x={-2000} y={-2000} width={5000} height={y0 + 2000} fill={wall} />
        <rect x={-2000} y={y0 - 420 * s} width={5000} height={420 * s} fill={wallLow} />
        <rect x={-2000} y={y0 - 426 * s} width={5000} height={10 * s} fill={ink(wallLow, 0.8)} />
        {/* окно подъезда с дневным светом */}
        <rect x={gdX(-260, s) - 170} y={y0 - 1250 * s} width={300} height={420} rx={10} fill="#F6F7F2" stroke={ink(wall, 0.7)} strokeWidth={4} />
        <rect x={gdX(-260, s) - 152} y={y0 - 1250 * s + 18} width={264} height={384} fill="#CFE6F5" />
        <path d={`M ${gdX(-260, s) - 152} ${y0 - 1250 * s + 300} L ${gdX(-260, s) - 20} ${y0 - 1250 * s + 18} L ${gdX(-260, s) + 40} ${y0 - 1250 * s + 18} L ${gdX(-260, s) - 152} ${y0 - 1250 * s + 402}`} fill="#FFFFFF" opacity={0.35} />
        {/* пол площадки (плитка) */}
        <rect x={-2000} y={y0} width={5000} height={1200} fill="#C9B79C" />
        {Array.from({ length: 10 }).map((_, i) => {
          const ss = s + (i + 1) * 0.05;
          return <line key={i} x1={-2000} y1={gdY(ss)} x2={3000} y2={gdY(ss)} stroke="#B5A386" strokeWidth={3} />;
        })}
        {/* проём: тёплая прихожая */}
        <rect x={dx - dw / 2} y={y0 - dh} width={dw} height={dh} fill="#F3D9B4" />
        <rect x={dx - dw / 2} y={y0 - dh} width={dw} height={dh * 0.62} fill="#F6E3C6" />
        <rect x={dx - dw / 2 + dw * 0.55} y={y0 - dh + 60 * s} width={dw * 0.3} height={dh * 0.45} rx={10} fill="#E9C99B" stroke="#C9A77A" strokeWidth={3} />
        <rect x={dx - dw / 2} y={y0 - 70 * s} width={dw} height={70 * s} fill="#C99A68" />
      </Svg>
      {/* внутри квартиры видно только через проём */}
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, clipPath: `polygon(${dx - dw / 2}px ${y0 - dh}px, ${dx + dw / 2}px ${y0 - dh}px, ${dx + dw / 2}px ${y0 + 60}px, ${dx - dw / 2}px ${y0 + 60}px)` })}>{inside}</div>
      <Svg>
        {/* дверь открывается внутрь: шарнир слева, полотно сужается */}
        {(() => {
          const w = dw * (1 - 0.82 * o);
          const shrink = 18 * o * s;
          return (
            <g>
              <path d={`M ${dx - dw / 2} ${y0 - dh} L ${dx - dw / 2 + w} ${y0 - dh + shrink} L ${dx - dw / 2 + w} ${y0 - shrink} L ${dx - dw / 2} ${y0} Z`} fill={mix("#7A5238", "#5E3E2A", o)} stroke="#4A3020" strokeWidth={4} />
              {w > 30 ? <circle cx={dx - dw / 2 + w - 30 * s * (1 - o)} cy={y0 - dh * 0.47} r={9} fill="#D9C27A" stroke="#8C7440" strokeWidth={2} /> : null}
              {o < 0.4 ? <rect x={dx - dw / 2 + w * 0.2} y={y0 - dh * 0.8} width={w * 0.6} height={dh * 0.25} rx={8} fill="none" stroke="#5E3E2A" strokeWidth={4} /> : null}
            </g>
          );
        })()}
        {/* наличник и номер квартиры (без текста-адреса) */}
        <rect x={dx - dw / 2 - 26 * s} y={y0 - dh - 26 * s} width={dw + 52 * s} height={dh + 26 * s} fill="none" stroke="#EDE6D8" strokeWidth={22 * s} />
        {/* коврик */}
        <path d={`M ${dx - 200 * s} ${y0 + 8} L ${dx + 200 * s} ${y0 + 8} L ${dx + 240 * s} ${y0 + 70} L ${dx - 240 * s} ${y0 + 70} Z`} fill="#8C5A4A" stroke="#6B4236" strokeWidth={3} />
      </Svg>
      {front}
    </>
  );
};

// ======================================================================
// Офис мамы в другом районе: её стол сбоку (монитор к ней — экран видим
// с её стороны в три четверти), за окном — другая часть города с горами,
// настенные часы показывают начало третьего (после обеда).
// ======================================================================
export const MO = { floor: 1700 } as const;
export const MO_POS = {
  mom: { x: 440, y: 1700 }, // сидит, лицом вправо — к монитору
  monitor: { x: 760, y: 1210 }, // центр экрана
  colleague: { x: 900, y: 1720 },
  desk: { top: 1330, x0: 300, x1: 1100 },
  keyboard: { x: 590, y: 1322 },
  clock: { x: 960, y: 560 },
  folder: { x: 880, y: 1318 }, // куда коллега кладёт папку
} as const;
export const MomOffice: React.FC<{ readonly back?: React.ReactNode; readonly mid?: React.ReactNode; readonly front?: React.ReactNode; readonly typing?: number }> = ({ back, mid, front, typing = 0 }) => {
  const D = MO_POS.desk;
  return (
    <>
      <Svg>
        <rect x={-1000} y={-1000} width={3200} height={MO.floor + 1000} fill="#E7E2EC" />
        {/* окно: другой район — ниже дома, ближе горы */}
        <rect x={60} y={280} width={800} height={760} rx={12} fill="#F4F2F6" />
      </Svg>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, clipPath: "inset(304px 244px 904px 84px)" })}>
        <CityView id="mo-view" x0={0} x1={1080} y0={300} y1={1020} base={760} k={1.8} />
      </div>
      <Svg>
        <rect x={453} y={304} width={14} height={712} fill="#F4F2F6" />
        <rect x={84} y={640} width={752} height={10} fill="#F4F2F6" opacity={0.8} />
        {/* настенные часы ≈ 14:05 (после обеда) */}
        <circle cx={MO_POS.clock.x} cy={MO_POS.clock.y} r={62} fill="#FFFFFF" stroke="#4B4658" strokeWidth={6} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={MO_POS.clock.x + Math.sin(a) * 48} y1={MO_POS.clock.y - Math.cos(a) * 48} x2={MO_POS.clock.x + Math.sin(a) * 54} y2={MO_POS.clock.y - Math.cos(a) * 54} stroke="#4B4658" strokeWidth={i % 3 ? 2 : 4} />;
        })}
        <line x1={MO_POS.clock.x} y1={MO_POS.clock.y} x2={MO_POS.clock.x + 30} y2={MO_POS.clock.y + 14} stroke="#2B2733" strokeWidth={8} strokeLinecap="round" />
        <line x1={MO_POS.clock.x} y1={MO_POS.clock.y} x2={MO_POS.clock.x + 5} y2={MO_POS.clock.y - 44} stroke="#2B2733" strokeWidth={5} strokeLinecap="round" />
        <circle cx={MO_POS.clock.x} cy={MO_POS.clock.y} r={6} fill="#2B2733" />
        {/* стеллаж с папками слева */}
        <rect x={-40} y={760} width={140} height={940} fill="#C7B9A6" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={-40} y={800 + i * 220} width={140} height={10} fill="#A8988A" />
            {[0, 1, 2].map((j) => (
              <rect key={j} x={-30 + j * 40} y={830 + i * 220} width={32} height={170} rx={4} fill={["#7A3F66", "#5E9A93", "#E9C46A"][(i + j) % 3]} />
            ))}
          </g>
        ))}
        <rect x={-1000} y={MO.floor} width={3200} height={600} fill="#BFB6C6" />
      </Svg>
      {back}
      <Svg>
        {/* монитор: экран к маме (вид в три четверти) */}
        <rect x={MO_POS.monitor.x - 10} y={D.top - 170} width={20} height={170} fill="#8E949E" />
        <path d={`M ${MO_POS.monitor.x - 170} ${MO_POS.monitor.y - 120} L ${MO_POS.monitor.x + 120} ${MO_POS.monitor.y - 150} L ${MO_POS.monitor.x + 120} ${MO_POS.monitor.y + 110} L ${MO_POS.monitor.x - 170} ${MO_POS.monitor.y + 90} Z`} fill="#2B2F38" stroke="#1B1E25" strokeWidth={4} />
        <path d={`M ${MO_POS.monitor.x - 156} ${MO_POS.monitor.y - 106} L ${MO_POS.monitor.x + 106} ${MO_POS.monitor.y - 134} L ${MO_POS.monitor.x + 106} ${MO_POS.monitor.y + 96} L ${MO_POS.monitor.x - 156} ${MO_POS.monitor.y + 78} Z`} fill="#DCE7F2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${MO_POS.monitor.x - 130} ${MO_POS.monitor.y - 70 + i * 34} L ${MO_POS.monitor.x + lerp(10, 80, hash01(i + typing * 3))} ${MO_POS.monitor.y - 82 + i * 34}`} stroke={i === 0 ? "#7A3F66" : "#9AA6B6"} strokeWidth={12} strokeLinecap="round" />
        ))}
      </Svg>
      {mid}
      <Svg>
        {/* стол (передний край к зрителю) */}
        <rect x={D.x0} y={D.top} width={D.x1 - D.x0} height={26} fill="#E6DCCC" stroke={ink("#E6DCCC", 0.75)} strokeWidth={3} />
        <rect x={D.x0 + 20} y={D.top + 26} width={D.x1 - D.x0 - 40} height={MO.floor - D.top - 26} fill="#D2C6B3" stroke={ink("#D2C6B3", 0.75)} strokeWidth={3} />
        <rect x={D.x0 + 90} y={D.top - 14} width={130} height={14} rx={3} fill="#FFFFFF" stroke="#C9CED6" strokeWidth={2} transform={`rotate(-3 ${D.x0 + 150} ${D.top - 8})`} />
        <rect x={D.x0 + 20} y={D.top - 26} width={60} height={28} rx={6} fill="#7A3F66" />
        {/* клавиатура */}
        <path d={`M ${MO_POS.keyboard.x - 110} ${MO_POS.keyboard.y + 6} L ${MO_POS.keyboard.x + 110} ${MO_POS.keyboard.y + 6} L ${MO_POS.keyboard.x + 100} ${MO_POS.keyboard.y - 8} L ${MO_POS.keyboard.x - 100} ${MO_POS.keyboard.y - 8} Z`} fill="#E9ECF1" stroke="#9AA3B0" strokeWidth={3} strokeLinejoin="round" />
      </Svg>
      {front}
    </>
  );
};

// ======================================================================
// Вечерняя квартира семьи (сцены 9–10). Камера на уровне глаз сидящих,
// чуть сверху на стол: стол ближе к зрителю, чем сидящие (их ступни выше
// по кадру, чем передние ножки стола); видна столешница. За ними — окно с
// ночным городом, слева на стене календарь, справа дверной проём в коридор
// (оттуда приходит сын). late 0…1 — поздний вечер: лампа ярче, края темнее.
// Глубина: s(y) = (y − horizon)/(floor − horizon), floor — ступни сидящих.
// ======================================================================
export const HM = { horizon: 1000, floor: 1640, wall: 1500, tableBack: 1316, tableFront: 1408, apron: 1446, tableFloor: 1800 } as const;
export const hmS = (y: number) => (y - HM.horizon) / (HM.floor - HM.horizon);
export const HM_POS = {
  mother: { x: 360, y: 1640 }, // сидит за столом лицом к зрителю (слева)
  motherNear: { x: 470, y: 1640 }, // придвинулась к мужу
  father: { x: 640, y: 1640 },
  sonChair: { x: 900, y: 1640 }, // стул справа от отца (свободен)
  sonStand: { x: 960, y: 1652 }, // сын стоит у стула
  doorway: { x: 1030, y: 1500 }, // порог проёма справа (s = wallS)
  table: { x0: 130, x1: 1070, top: 1316 },
  papers: { x: 640, y: 1362 }, // стопка бумаг отца (перед ним)
  aside: { x: 430, y: 1350 }, // куда отец отодвигает бумаги
  free: { x: 820, y: 1368 }, // освободившееся место (рисунок сына)
  calendar: { x: 40, y: 560 },
} as const;
export const HM_WALL_S = hmS(HM.wall);

// Стул (вид спереди): спинка за сидящим, сиденье на высоте seat от пола.
const Chair: React.FC<{ readonly x: number; readonly seat: number; readonly y?: number }> = ({ x, seat, y: fy = HM.floor }) => {
  const y = fy - seat;
  const w = 220;
  return (
    <g>
      <rect x={x - w / 2 + 14} y={y - 330} width={w - 28} height={300} rx={22} fill={C.woodDark} stroke={ink(C.woodDark, 0.7)} strokeWidth={3} />
      <rect x={x - w / 2 + 34} y={y - 300} width={w - 68} height={46} rx={12} fill={C.wood} opacity={0.7} />
      <rect x={x - w / 2 + 18} y={y} width={18} height={seat} fill={ink(C.woodDark, 0.85)} />
      <rect x={x + w / 2 - 36} y={y} width={18} height={seat} fill={ink(C.woodDark, 0.85)} />
      <rect x={x - w / 2} y={y - 10} width={w} height={34} rx={8} fill={C.wood} stroke={ink(C.wood, 0.7)} strokeWidth={3} />
    </g>
  );
};

export const HomeRoom: React.FC<{
  readonly late?: number;
  readonly chairs?: readonly { readonly x: number; readonly seat: number }[];
  readonly back?: React.ReactNode;
  readonly seated?: React.ReactNode;
  readonly onTable?: React.ReactNode;
  readonly arms?: React.ReactNode;
  readonly front?: React.ReactNode;
}> = ({ late = 0, chairs = [], back, seated, onTable, arms, front }) => {
  const L = clamp(late);
  const wall = mix(C.wallHome, "#D9B990", 0.35 * L);
  const T = HM_POS.table;
  const ws = HM_WALL_S;
  const doorL = 930;
  const doorTop = HM.wall - 900 * ws;
  return (
    <>
      <Svg>
        <defs>
          <radialGradient id="hm-lamp" cx="0.5" cy="0.32" r="0.62">
            <stop offset="0" stopColor="#FFE7B8" stopOpacity={0.85} />
            <stop offset="1" stopColor="#FFE7B8" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={-1000} y={-1000} width={3200} height={HM.wall + 1000} fill={wall} />
        {/* плинтус */}
        <rect x={-1000} y={HM.wall - 22} width={3200} height={22} fill={ink(wall, 0.86)} />
        {/* окно: ночной город */}
        <rect x={230} y={330} width={560} height={640} rx={10} fill="#F2E3CF" />
        <rect x={250} y={350} width={520} height={600} fill={C.night} />
        {Array.from({ length: 9 }).map((_, i) => {
          const bx = 250 + i * 60;
          const bh = 120 + 200 * hash01(i * 3.1);
          return (
            <g key={i}>
              <rect x={bx} y={950 - bh} width={56} height={bh} fill="#3B4466" />
              {Array.from({ length: Math.floor(bh / 40) }).map((__, j) => (hash01(i * 7 + j) > 0.45 ? <rect key={j} x={bx + 10 + (j % 2) * 20} y={950 - bh + 14 + j * 36} width={12} height={14} fill="#F6C66A" opacity={0.85} /> : null))}
            </g>
          );
        })}
        <rect x={506} y={350} width={10} height={600} fill="#F2E3CF" />
        {/* шторы */}
        <path d="M 180 300 Q 240 650 200 1000 L 280 1000 Q 280 650 260 300 Z" fill="#C98B6A" opacity={0.9} />
        <path d="M 840 300 Q 780 650 820 1000 L 740 1000 Q 740 650 760 300 Z" fill="#C98B6A" opacity={0.9} />
        {/* календарь на стене (сетка месяца) */}
        <g>
          <rect x={HM_POS.calendar.x} y={HM_POS.calendar.y} width={170} height={210} rx={8} fill="#FFFFFF" stroke="#B49B7E" strokeWidth={3} />
          <rect x={HM_POS.calendar.x} y={HM_POS.calendar.y} width={170} height={44} rx={8} fill="#D9534A" />
          {Array.from({ length: 20 }).map((_, i) => (
            <rect key={i} x={HM_POS.calendar.x + 14 + (i % 5) * 30} y={HM_POS.calendar.y + 60 + Math.floor(i / 5) * 34} width={20} height={20} rx={3} fill={i === 9 ? C.yellow : "#E8E2D8"} />
          ))}
        </g>
        {/* дверной проём справа (коридор темнее) */}
        <rect x={doorL} y={doorTop} width={300} height={HM.wall - doorTop} fill={mix("#7A6452", "#3E3229", L)} />
        <rect x={doorL - 18} y={doorTop - 18} width={18} height={HM.wall - doorTop + 18} fill="#EAD8BE" />
        <rect x={doorL - 18} y={doorTop - 18} width={330} height={18} fill="#EAD8BE" />
        {/* пол */}
        <rect x={-1000} y={HM.wall} width={3200} height={1000} fill={C.floorHome} />
        {Array.from({ length: 16 }).map((_, i) => {
          const x = -400 + i * 120;
          return <line key={i} x1={540 + (x - 540) * ws} y1={HM.wall} x2={540 + (x - 540) * 1.6} y2={HM.wall + (HM.floor - HM.horizon) * 0.82 + 300} stroke={ink(C.floorHome, 0.86)} strokeWidth={3} />;
        })}
        {/* свет лампы на стене */}
        <rect x={-1000} y={-1000} width={3200} height={HM.wall + 1000} fill="url(#hm-lamp)" opacity={0.5 + 0.4 * L} />
      </Svg>
      {back}
      <Svg>
        {chairs.map((c, i) => (
          <Chair key={i} x={c.x} seat={c.seat} />
        ))}
      </Svg>
      {seated}
      <Svg>
        {/* стол ближе сидящих: столешница сверху (дальний край уже), царга, ножки до пола у камеры */}
        <path d={`M ${T.x0 + 50} ${HM.tableBack} L ${T.x1 - 50} ${HM.tableBack} L ${T.x1} ${HM.tableFront} L ${T.x0} ${HM.tableFront} Z`} fill={C.woodLight} stroke={ink(C.woodLight, 0.72)} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M ${T.x0 + 70} ${HM.tableBack + 16} L ${T.x1 - 70} ${HM.tableBack + 16}`} stroke="#FFFFFF" strokeWidth={6} opacity={0.25} strokeLinecap="round" />
        <rect x={T.x0} y={HM.tableFront} width={T.x1 - T.x0} height={HM.apron - HM.tableFront} fill={C.wood} stroke={ink(C.wood, 0.7)} strokeWidth={3} />
        <rect x={T.x0 + 26} y={HM.apron} width={32} height={HM.tableFloor - HM.apron} fill={C.woodDark} />
        <rect x={T.x1 - 58} y={HM.apron} width={32} height={HM.tableFloor - HM.apron} fill={C.woodDark} />
        <ellipse cx={(T.x0 + T.x1) / 2} cy={HM.tableFloor + 4} rx={(T.x1 - T.x0) / 2 + 30} ry={16} fill="#000000" opacity={0.08} />
      </Svg>
      {onTable}
      {arms}
      <Svg>
        {/* лампа над столом */}
        <line x1={540} y1={-200} x2={540} y2={150} stroke="#5A4636" strokeWidth={6} />
        <path d="M 400 260 Q 540 120 680 260 Z" fill="#F0B35C" stroke={ink("#F0B35C", 0.7)} strokeWidth={4} />
        <ellipse cx={540} cy={262} rx={140} ry={16} fill="#FFE2A6" />
      </Svg>
      {/* поздний вечер: по краям темнее */}
      {L > 0 ? <div style={box({ left: -500, top: -500, width: 2080, height: 2920, background: `radial-gradient(ellipse 48% 42% at 50% 45%, rgba(0,0,0,0), rgba(40,22,10,${0.42 * L}))` })} /> : null}
      {front}
    </>
  );
};
