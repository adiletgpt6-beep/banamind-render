// Гостиная семьи — вечер (S09, S11). Фронтальный план, тот же рисованный
// стиль, что и прихожая (sets/Home.tsx): ровная тёплая стена с зерном
// бумаги, деревянный пол, тонкий тёмный контур, штриховка в тенях.
// Слева — окно с вечерним небом и горами, в центре — терракотовый диван у
// стены, над ним — картина, справа — торшер с тёплым светом; перед диваном
// — низкий журнальный столик на ковре.
//
// Как пользоваться (координаты — px мира):
//   <Shot cam=… tint={LIVING_TINT}>
//     <LivingBack ink uid />            — стена, окно, картина, торшер, пол, ковёр
//     <LivingSofa ink uid />            — диван целиком (спинка, подушки, подлокотники)
//     <Actor … place={() => ({ x: LIVING.pair.mom, y: LIVING.feetY, h: H.mom })}
//            pose={() => ({ sit: 1, seat: LIVING.seat, … })} />
//     <CoffeeTable ink uid cups />      — столик перед диваном (закрывает голени)
//     <LampGlow />                      — тёплый свет торшера поверх всего
//   </Shot>
// • Сидящие на диване: place.y = LIVING.feetY (стопы на полу перед
//   диваном), pose.sit = 1, pose.seat = LIVING.seat (высота сиденья над
//   стопами — одна для всех: таз взрослых и ребёнка на одной подушке).
// • Места на диване (place.x): LIVING.seats.left | center | right; для двух
//   взрослых рядом — LIVING.pair.mom (слева) и LIVING.pair.dad (справа).
//   Любое x в LIVING.sofa.inner подходит.
// • Подлокотники: LIVING.armL / LIVING.armR — верх подлокотника (куда можно
//   положить руку или телефон).
// • Столешница столика: LIVING.table (top — дальний край, front — ближний).
// • Хороший общий план двоих на диване: cam { x: 540, y: 1250, zoom: 1.25 };
//   средний план: cam { x: 505, y: 1235, zoom: 1.9 }.
import { C } from "../theme";
import { Grain, HatchDefs, PlusMark, roughPath, roughRect, Svg } from "../kit";

export const LIVING = {
  floor: 1500, // стык стены и пола (за диваном)
  feetY: 1625, // стопы сидящих на диване (place.y)
  seat: 205, // высота сиденья над стопами (pose.seat)
  sofa: {
    x: 150,
    w: 700,
    backTop: 1165, // верх спинки
    seatY: 1420, // передний верхний край сидений
    baseY: 1600, // низ корпуса (ножки на полу)
    arm: 84, // ширина подлокотника
    armTop: 1290, // верх подлокотников
    inner: { from: 250, to: 750 }, // где можно сидеть (центр таза)
  },
  seats: { left: 325, center: 500, right: 675 },
  pair: { mom: 418, dad: 594 }, // двое взрослых рядом
  armL: { x: 192, y: 1296 }, // верх левого подлокотника (середина)
  armR: { x: 808, y: 1296 },
  table: { x: 300, w: 440, top: 1505, front: 1545, apron: 30, floorY: 1705 },
  lamp: { x: 900, floorY: 1612, shadeTop: 960, shadeBottom: 1066 },
  window: { x: 150, y: 560, w: 220, h: 400 },
  picture: { x: 560, y: 770, w: 210, h: 160 },
} as const;

// Тёплый вечерний тон кадра (Shot tint).
export const LIVING_TINT = "rgba(255,186,110,0.07)";

const SOFA = "#C98A6A";
const SOFA_LIGHT = "#D59C7C";
const SOFA_SHADE = "#B07458";
const RUG = "#E6D2AE";

// Стена, окно, картина, торшер, пол, ковёр (всё, что за диваном).
// lamp — 0…1 торшер горит; dusk — 0…1 насколько стемнело за окном.
export const LivingBack: React.FC<{ readonly ink: number; readonly uid: string; readonly lamp?: number; readonly dusk?: number }> = ({ ink, uid, lamp = 1, dusk = 1 }) => {
  const L = LIVING;
  const w = L.window;
  const p = L.picture;
  const lp = L.lamp;
  const skyTop = dusk > 0.5 ? "#55688E" : "#9FB8CF";
  const skyLow = dusk > 0.5 ? "#E7B58A" : "#E8EEF0";
  return (
    <>
      <div style={{ position: "absolute", left: -600, top: -400, width: 2400, height: L.floor + 400, backgroundColor: C.wallEvening, overflow: "hidden" }}>
        <Grain opacity={0.45} w={2400} h={L.floor + 400} />
      </div>
      <div style={{ position: "absolute", left: -600, top: L.floor, width: 2400, height: 1400, backgroundColor: C.floor, overflow: "hidden" }}>
        <Grain opacity={0.55} w={2400} h={1400} />
      </div>
      <Svg>
        <HatchDefs id={`${uid}-hatch`} />
        <defs>
          <linearGradient id={`${uid}-sky`} x1={0} y1={0} x2={0} y2={1}>
            <stop offset="0" stopColor={skyTop} />
            <stop offset="0.72" stopColor="#9C8FA6" />
            <stop offset="1" stopColor={skyLow} />
          </linearGradient>
          <radialGradient id={`${uid}-wallglow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFE2A8" stopOpacity={0.55 * lamp} />
            <stop offset="1" stopColor="#FFE2A8" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* тёплое пятно света торшера на стене */}
        <ellipse cx={lp.x - 20} cy={lp.shadeTop + 10} rx={330} ry={300} fill={`url(#${uid}-wallglow)`} />
        {/* доски пола */}
        {Array.from({ length: 20 }, (_, i) => {
          const x0 = -500 + i * 120;
          return <path key={i} d={`M ${x0} ${L.floor} L ${540 + (x0 - 540) * 2.6} ${L.floor + 1200}`} stroke={C.floorShade} strokeWidth={ink * 0.6} />;
        })}
        {[1580, 1690, 1830, 2000].map((y) => (
          <path key={y} d={`M -600 ${y} L 1900 ${y}`} stroke={C.floorShade} strokeWidth={ink * 0.4} opacity={0.6} />
        ))}
        {/* плинтус */}
        <rect x={-600} y={L.floor - 24} width={2400} height={24} fill="#E2D0AE" stroke={C.ink} strokeWidth={ink * 0.8} />
        {/* окно: вечернее небо, горы, рама, шторы */}
        <rect x={w.x} y={w.y} width={w.w} height={w.h} fill={`url(#${uid}-sky)`} />
        <path
          d={`M ${w.x} ${w.y + w.h * 0.78} L ${w.x + w.w * 0.18} ${w.y + w.h * 0.64} L ${w.x + w.w * 0.32} ${w.y + w.h * 0.72} L ${w.x + w.w * 0.52} ${w.y + w.h * 0.56} L ${w.x + w.w * 0.72} ${w.y + w.h * 0.7} L ${w.x + w.w * 0.86} ${w.y + w.h * 0.62} L ${w.x + w.w} ${w.y + w.h * 0.72} L ${w.x + w.w} ${w.y + w.h} L ${w.x} ${w.y + w.h} Z`}
          fill="#7C86A2"
        />
        <path d={`M ${w.x + w.w * 0.46} ${w.y + w.h * 0.6} L ${w.x + w.w * 0.52} ${w.y + w.h * 0.56} L ${w.x + w.w * 0.58} ${w.y + w.h * 0.6}`} fill="none" stroke="#E9E4EC" strokeWidth={ink * 1.2} strokeLinecap="round" opacity={0.8} />
        <path d={`M ${w.x} ${w.y + w.h * 0.9} L ${w.x + w.w} ${w.y + w.h * 0.88} L ${w.x + w.w} ${w.y + w.h} L ${w.x} ${w.y + w.h} Z`} fill="#69738F" />
        {/* редкие огоньки домов вдали */}
        {[0.14, 0.3, 0.55, 0.7, 0.88].map((k, i) => (
          <rect key={k} x={w.x + w.w * k} y={w.y + w.h * (0.92 + (i % 2) * 0.03)} width={6} height={5} rx={1} fill="#F7D894" opacity={0.85 * dusk} />
        ))}
        <circle cx={w.x + w.w * 0.76} cy={w.y + w.h * 0.18} r={12} fill="#F4EBD6" opacity={0.85 * dusk} />
        <path d={roughRect(w.x, w.y, w.w, w.h, 4, 61, ink * 0.5)} fill="none" stroke={C.ink} strokeWidth={ink} />
        <path d={`M ${w.x + w.w / 2} ${w.y} L ${w.x + w.w / 2} ${w.y + w.h} M ${w.x} ${w.y + w.h * 0.42} L ${w.x + w.w} ${w.y + w.h * 0.42}`} stroke="#F2E7D2" strokeWidth={10} />
        <path d={`M ${w.x + w.w / 2} ${w.y} L ${w.x + w.w / 2} ${w.y + w.h} M ${w.x} ${w.y + w.h * 0.42} L ${w.x + w.w} ${w.y + w.h * 0.42}`} stroke={C.ink} strokeWidth={ink * 0.5} opacity={0.5} />
        <rect x={w.x - 18} y={w.y + w.h} width={w.w + 36} height={18} rx={4} fill="#F2E7D2" stroke={C.ink} strokeWidth={ink * 0.9} />
        {/* шторы */}
        {[
          [w.x - 52, -1],
          [w.x + w.w + 4, 1],
        ].map(([cx, s]) => (
          <g key={cx}>
            <path
              d={`M ${cx} ${w.y - 40} L ${cx + 48} ${w.y - 40} Q ${cx + 48 + s * 6} ${w.y + w.h * 0.5} ${cx + 52} ${L.floor - 40} L ${cx - 6} ${L.floor - 40} Q ${cx - 2 - s * 6} ${w.y + w.h * 0.5} ${cx} ${w.y - 40} Z`}
              fill="#B9C3AE"
              stroke={C.ink}
              strokeWidth={ink * 0.9}
              strokeLinejoin="round"
            />
            <path d={`M ${cx + 16} ${w.y - 30} Q ${cx + 18} ${w.y + w.h * 0.6} ${cx + 14} ${L.floor - 48} M ${cx + 32} ${w.y - 30} Q ${cx + 30} ${w.y + w.h * 0.6} ${cx + 34} ${L.floor - 48}`} stroke="#9AA78F" strokeWidth={ink * 0.8} fill="none" />
          </g>
        ))}
        <rect x={w.x - 70} y={w.y - 52} width={w.w + 140} height={12} rx={6} fill={C.woodDark} stroke={C.ink} strokeWidth={ink * 0.8} />
        {/* картина над диваном: горы и солнце (без надписей) */}
        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={4} fill={C.woodLight} stroke={C.ink} strokeWidth={ink} />
        <rect x={p.x + 14} y={p.y + 14} width={p.w - 28} height={p.h - 28} fill="#F3EAD6" stroke={C.ink} strokeWidth={ink * 0.6} />
        <circle cx={p.x + p.w * 0.7} cy={p.y + p.h * 0.36} r={16} fill={C.yellowSoft} stroke={C.ink} strokeWidth={ink * 0.5} />
        <path d={`M ${p.x + 14} ${p.y + p.h - 14} L ${p.x + p.w * 0.36} ${p.y + p.h * 0.42} L ${p.x + p.w * 0.52} ${p.y + p.h * 0.6} L ${p.x + p.w * 0.66} ${p.y + p.h * 0.48} L ${p.x + p.w - 14} ${p.y + p.h - 14} Z`} fill="#A9B8C4" stroke={C.ink} strokeWidth={ink * 0.6} strokeLinejoin="round" />
        <path d={`M ${p.x + p.w * 0.29} ${p.y + p.h * 0.5} L ${p.x + p.w * 0.36} ${p.y + p.h * 0.42} L ${p.x + p.w * 0.43} ${p.y + p.h * 0.5}`} fill="#F7F3EA" stroke={C.ink} strokeWidth={ink * 0.5} strokeLinejoin="round" />
        <path d={`M ${p.x + 14} ${p.y + p.h - 30} Q ${p.x + p.w * 0.5} ${p.y + p.h - 52} ${p.x + p.w - 14} ${p.y + p.h - 34} L ${p.x + p.w - 14} ${p.y + p.h - 14} L ${p.x + 14} ${p.y + p.h - 14} Z`} fill={C.tree} stroke={C.ink} strokeWidth={ink * 0.5} />
        {/* торшер: основание, стойка, абажур */}
        <ellipse cx={lp.x} cy={lp.floorY + 4} rx={60} ry={12} fill={C.shadow} />
        <ellipse cx={lp.x} cy={lp.floorY - 4} rx={46} ry={11} fill="#5B5248" stroke={C.ink} strokeWidth={ink * 0.9} />
        <rect x={lp.x - 5} y={lp.shadeBottom - 6} width={10} height={lp.floorY - lp.shadeBottom} fill="#6E655A" stroke={C.ink} strokeWidth={ink * 0.7} />
        <path
          d={`M ${lp.x - 56} ${lp.shadeTop} L ${lp.x + 56} ${lp.shadeTop} L ${lp.x + 84} ${lp.shadeBottom} L ${lp.x - 84} ${lp.shadeBottom} Z`}
          fill={lamp > 0.5 ? "#FBE6B4" : "#EADCC0"}
          stroke={C.ink}
          strokeWidth={ink}
          strokeLinejoin="round"
        />
        <path d={`M ${lp.x - 84} ${lp.shadeBottom} L ${lp.x + 84} ${lp.shadeBottom}`} stroke="#E8B868" strokeWidth={ink * 2} opacity={0.8 * lamp} />
        <path d={`M ${lp.x + 20} ${lp.shadeTop + 6} L ${lp.x + 34} ${lp.shadeBottom - 6}`} stroke="#E9C98A" strokeWidth={ink * 1.6} opacity={0.6} />
        {/* ковёр под столиком */}
        <path d={roughRect(120, 1640, 800, 210, 40, 63, ink * 0.5)} fill={RUG} stroke={C.ink} strokeWidth={ink * 0.8} />
        <path d={roughRect(150, 1660, 740, 170, 30, 64, ink * 0.4)} fill="none" stroke="#C9AE80" strokeWidth={ink * 1.4} strokeDasharray={`${ink * 3} ${ink * 2.4}`} />
        <PlusMark x={460} y={640} />
        <PlusMark x={880} y={720} />
      </Svg>
    </>
  );
};

// Диван целиком (рисуется ЗА сидящими: таз и спина на подушках).
export const LivingSofa: React.FC<{ readonly ink: number; readonly uid: string }> = ({ ink, uid }) => {
  const s = LIVING.sofa;
  const x1 = s.x + s.w;
  const ia = s.x + s.arm; // внутренний край левого подлокотника
  const ib = x1 - s.arm;
  const mid = s.x + s.w / 2;
  const hatch = `${uid}-sofahatch`;
  return (
    <Svg>
      <HatchDefs id={hatch} color="rgba(90,40,20,0.16)" step={10} />
      {/* тень на стене и полу */}
      <ellipse cx={mid} cy={s.baseY + 6} rx={s.w * 0.56} ry={18} fill={C.shadow} />
      {/* спинка */}
      <path d={roughRect(s.x + 14, s.backTop, s.w - 28, s.seatY - s.backTop + 30, 44, 71, ink * 0.5)} fill={SOFA} stroke={C.ink} strokeWidth={ink} />
      {/* подушки спинки */}
      {[
        [ia + 4, mid - 4],
        [mid + 4, ib - 4],
      ].map(([a, b], i) => (
        <g key={i}>
          <path d={roughRect(a, s.backTop + 26, b - a, s.seatY - s.backTop - 30, 30, 72 + i, ink * 0.5)} fill={SOFA_LIGHT} stroke={C.ink} strokeWidth={ink * 0.9} />
          <path d={roughRect(a + 6, s.seatY - 92, b - a - 12, 80, 24, 74 + i, ink * 0.3)} fill={`url(#${hatch})`} />
        </g>
      ))}
      {/* сиденья: верхняя плоскость и передняя грань подушек */}
      <path d={`M ${ia - 4} ${s.seatY} L ${ia + 8} ${s.seatY - 26} L ${ib - 8} ${s.seatY - 26} L ${ib + 4} ${s.seatY} Z`} fill={SOFA_LIGHT} stroke={C.ink} strokeWidth={ink * 0.9} strokeLinejoin="round" />
      {[
        [ia - 4, mid],
        [mid, ib + 4],
      ].map(([a, b], i) => (
        <path key={i} d={roughRect(a, s.seatY - 2, b - a, 62, 16, 76 + i, ink * 0.4)} fill={SOFA} stroke={C.ink} strokeWidth={ink * 0.9} />
      ))}
      {/* корпус под сиденьями */}
      <path d={roughRect(ia - 4, s.seatY + 58, ib - ia + 8, s.baseY - s.seatY - 66, 10, 78, ink * 0.4)} fill={SOFA_SHADE} stroke={C.ink} strokeWidth={ink * 0.9} />
      <path d={roughRect(ia - 4, s.seatY + 58, ib - ia + 8, s.baseY - s.seatY - 66, 10, 78, ink * 0.4)} fill={`url(#${hatch})`} />
      {/* декоративные подушки по краям */}
      <g transform={`rotate(-10 ${ia + 52} ${s.seatY - 70})`}>
        <path d={roughRect(ia + 4, s.seatY - 132, 100, 96, 26, 79, ink * 0.5)} fill="#EFE3CB" stroke={C.ink} strokeWidth={ink * 0.9} />
        <path d={`M ${ia + 14} ${s.seatY - 84} L ${ia + 94} ${s.seatY - 84}`} stroke="#C9B48E" strokeWidth={ink * 2.4} />
      </g>
      <g transform={`rotate(9 ${ib - 52} ${s.seatY - 70})`}>
        <path d={roughRect(ib - 104, s.seatY - 132, 100, 96, 26, 80, ink * 0.5)} fill="#8FA7B8" stroke={C.ink} strokeWidth={ink * 0.9} />
        <circle cx={ib - 54} cy={s.seatY - 84} r={9} fill="#7590A3" stroke={C.ink} strokeWidth={ink * 0.5} />
      </g>
      {/* подлокотники: валик сверху и передняя сторона */}
      {[s.x, ib].map((ax, i) => (
        <g key={ax}>
          <path d={roughRect(ax, s.armTop, s.arm, s.baseY - s.armTop - 8, 30, 81 + i, ink * 0.5)} fill={SOFA} stroke={C.ink} strokeWidth={ink} />
          <path d={roughRect(ax + 4, s.armTop + 4, s.arm - 8, 34, 16, 83 + i, ink * 0.3)} fill={SOFA_LIGHT} stroke={C.ink} strokeWidth={ink * 0.7} />
          <path d={roughRect(ax + 8, s.armTop + 120, s.arm - 16, s.baseY - s.armTop - 140, 12, 85 + i, ink * 0.3)} fill={`url(#${hatch})`} />
        </g>
      ))}
      {/* ножки */}
      {[s.x + 24, ia + 30, ib - 40, x1 - 34].map((lx) => (
        <path key={lx} d={`M ${lx} ${s.baseY - 10} L ${lx + 10} ${s.baseY - 10} L ${lx + 8} ${s.baseY + 10} L ${lx + 2} ${s.baseY + 10} Z`} fill={C.woodDark} stroke={C.ink} strokeWidth={ink * 0.7} strokeLinejoin="round" />
      ))}
      {/* шов по спинке */}
      <path d={roughPath([[s.x + 40, s.backTop + 12], [x1 - 40, s.backTop + 12]], 87, 1.2)} stroke={SOFA_SHADE} strokeWidth={ink * 0.8} fill="none" opacity={0.7} />
    </Svg>
  );
};

// Кружка на столике (вид спереди чуть сверху): x — центр, y — дно.
const Mug: React.FC<{ x: number; y: number; ink: number; color: string; flip?: boolean }> = ({ x, y, ink, color, flip }) => (
  <g>
    <ellipse cx={x} cy={y + 2} rx={26} ry={6} fill={C.shadow} />
    <path d={`M ${x + (flip ? -22 : 22)} ${y - 36} q ${flip ? -20 : 20} 4 ${flip ? -16 : 16} 18 q ${flip ? 2 : -2} 8 ${flip ? 14 : -14} 6`} fill="none" stroke={C.ink} strokeWidth={ink * 2.4} />
    <path d={`M ${x + (flip ? -22 : 22)} ${y - 36} q ${flip ? -20 : 20} 4 ${flip ? -16 : 16} 18 q ${flip ? 2 : -2} 8 ${flip ? 14 : -14} 6`} fill="none" stroke={color} strokeWidth={ink * 1.2} />
    <path d={`M ${x - 22} ${y - 46} L ${x + 22} ${y - 46} L ${x + 19} ${y - 2} Q ${x} ${y + 4} ${x - 19} ${y - 2} Z`} fill={color} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
    <ellipse cx={x} cy={y - 46} rx={22} ry={6} fill="#8A5A3C" stroke={C.ink} strokeWidth={ink * 0.8} />
  </g>
);

// Журнальный столик (рисуется ПЕРЕД сидящими — закрывает голени).
// cups — две кружки чая на столешнице; children — свои предметы сверху.
export const CoffeeTable: React.FC<{ readonly ink: number; readonly uid: string; readonly cups?: boolean; readonly children?: React.ReactNode }> = ({ ink, uid, cups = true, children }) => {
  const t = LIVING.table;
  return (
    <Svg>
      <HatchDefs id={`${uid}-cthatch`} color="rgba(90,50,20,0.14)" step={11} />
      <ellipse cx={t.x + t.w / 2} cy={t.floorY + 6} rx={t.w * 0.55} ry={16} fill={C.shadow} />
      {/* ножки */}
      {[t.x + 22, t.x + t.w - 44].map((lx) => (
        <rect key={lx} x={lx} y={t.front + t.apron - 6} width={22} height={t.floorY - t.front - t.apron + 6} rx={4} fill={C.woodDark} stroke={C.ink} strokeWidth={ink} />
      ))}
      <rect x={t.x + 34} y={t.floorY - 70} width={t.w - 68} height={12} rx={4} fill={C.wood} stroke={C.ink} strokeWidth={ink * 0.8} />
      {/* столешница и царга */}
      <path d={`M ${t.x - 12} ${t.front} L ${t.x + 14} ${t.top} L ${t.x + t.w - 14} ${t.top} L ${t.x + t.w + 12} ${t.front} Z`} fill={C.woodLight} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <rect x={t.x - 12} y={t.front} width={t.w + 24} height={t.apron} rx={5} fill={C.wood} stroke={C.ink} strokeWidth={ink} />
      <rect x={t.x - 12} y={t.front} width={t.w + 24} height={t.apron} rx={5} fill={`url(#${uid}-cthatch)`} />
      {cups ? (
        <>
          <Mug x={t.x + 120} y={t.front - 10} ink={ink} color="#E9E1D0" />
          <Mug x={t.x + t.w - 130} y={t.front - 14} ink={ink} color="#9DB5C4" flip />
        </>
      ) : null}
      {children}
    </Svg>
  );
};

// Тёплый свет торшера поверх кадра (мягкое пятно, без контура).
export const LampGlow: React.FC<{ readonly uid: string; readonly k?: number }> = ({ uid, k = 1 }) => {
  const lp = LIVING.lamp;
  return (
    <Svg>
      <defs>
        <radialGradient id={`${uid}-lampglow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFD58E" stopOpacity={0.32 * k} />
          <stop offset="0.5" stopColor="#FFD58E" stopOpacity={0.12 * k} />
          <stop offset="1" stopColor="#FFD58E" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={lp.x - 40} cy={lp.shadeBottom + 40} rx={560} ry={520} fill={`url(#${uid}-lampglow)`} />
    </Svg>
  );
};
