// Комната Аяна вечером — одна декорация для сцен 1, 2, 6–8, 13, 14.
//
// Два согласованных вида одного стола:
//   • фронтальный план (FRONT): Аян сидит за письменным столом лицом к
//     зрителю, мама стоит справа (позже садится рядом на второй стул);
//     на стене за ним — окно, детские рисунки и календарь, справа — дверь;
//   • вид сверху (TOP): та же столешница с конвертами, коробкой, ручкой и
//     комиксом — для крупных планов рук.
// Предметы задаются ОДИН раз в координатах вида сверху (ox, oy): oy = 0 —
// дальний от Аяна край (к зрителю фронтального плана), ox = 0 — слева от
// Аяна (во фронтальном плане это правая сторона кадра). toFront переводит
// их во фронтальный план, поэтому раскладка не меняется между склейками.
import { box, Svg } from "../kit";
import { C, F } from "../theme";
import { ENVELOPES, TE2_TEXT, type Envelope } from "../script";
import { EnvelopeArt } from "../props/Envelope";

// ---------- Вид сверху ----------
export const TOP = {
  w: 2400,
  h: 1900,
  env: 300, // ширина конверта
  // клетка раскладки 5×5
  grid: (row: number, col: number) => ({ x: 450 + col * 330, y: 380 + row * 235 }),
  box: { x: 2120, y: 640, w: 430, h: 330 }, // деревянная коробка (центр)
  pen: { x: 2010, y: 1260 },
  comic: { x: 2140, y: 1560 },
  drawingSpot: { x: 1560, y: 1640 }, // где лежит рисунок, когда его достали
  noteSpot: { x: 1100, y: 1520 }, // записка в финале (центр листа)
} as const;

// ---------- Фронтальный план ----------
export const FRONT = {
  wallBottom: 1250,
  floor: 1600, // пол у переднего края стола (мама стоит здесь)
  ayanFloor: 1540, // пол под стулом Аяна (за столом)
  desk: { backY: 1215, frontY: 1405, bottomY: 1600, back: [170, 910] as const, front: [110, 970] as const },
  ayanX: 545,
  momStandX: 935,
  momSeatX: 820,
  window: { x: 120, y: 560, w: 300, h: 420 },
  door: { x: 1120, y: 520, w: 270, h: 1080 },
  calendar: { x: 520, y: 600, w: 250, h: 270 },
  lamp: { x: 300, y: 1236 },
} as const;

// Перевод точки стола (вид сверху) во фронтальный план.
export const toFront = (ox: number, oy: number) => {
  const d = Math.max(0, Math.min(1, oy / TOP.h));
  const s = 1 - 0.14 * d;
  return { x: 540 + (1200 - ox) * 0.358 * s, y: FRONT.desk.frontY - (FRONT.desk.frontY - FRONT.desk.backY) * d, s };
};

// Состояние одного конверта на столе.
export type EnvState = {
  readonly env: Envelope;
  readonly x: number; // вид сверху
  readonly y: number;
  readonly rot?: number;
  readonly turn?: number; // 0 — лицом вверх
  readonly open?: number;
  readonly out?: number;
  readonly empty?: boolean;
  readonly hidden?: boolean; // в руке или в коробке (рисуется отдельно)
};
export const gridLayout = (): EnvState[] =>
  ENVELOPES.map((env) => {
    const p = TOP.grid(env.row, env.col);
    // лёгкая неровность раскладки ребёнка (постоянная)
    const rot = ((env.row * 5 + env.col) % 3) - 1;
    return { env, x: p.x, y: p.y, rot: rot * 1.4 };
  });

// ---------- Комната: стена, окно, рисунки, календарь, дверь ----------
const Calendar: React.FC = () => {
  const c = FRONT.calendar;
  const T = TE2_TEXT.homeCalendar;
  return (
    <div style={box({ left: c.x, top: c.y, width: c.w, height: c.h, backgroundColor: "#FFFFFF", borderRadius: 8, boxShadow: "0 6px 12px rgba(60,40,20,0.18)", overflow: "hidden" })}>
      <div style={box({ left: 0, top: 0, width: c.w, height: 52, backgroundColor: C.blue })} />
      <div style={box({ left: 0, top: 8, width: c.w, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 30, color: "#FFFFFF" })}>{T.month}</div>
      {T.days.map((d, i) => (
        <div key={d} style={box({ left: 10 + i * 33, top: 62, width: 32, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 15, color: i >= 5 ? C.coral : C.inkSoft })}>
          {d}
        </div>
      ))}
      {Array.from({ length: 31 }).map((_, i) => {
        const col = (i + 2) % 7;
        const row = Math.floor((i + 2) / 7);
        return (
          <div key={i} style={box({ left: 10 + col * 33, top: 88 + row * 34, width: 32, height: 30, textAlign: "center", fontFamily: F.text, fontWeight: 500, fontSize: 18, lineHeight: "30px", color: col >= 5 ? C.coral : C.ink, borderRadius: 6, backgroundColor: i === 9 ? C.blueSoft : "transparent" })}>
            {i + 1}
          </div>
        );
      })}
    </div>
  );
};

const WallDrawings: React.FC = () => (
  <>
    {/* три детских рисунка на скотче */}
    {[
      { x: 800, y: 600, r: -3, sky: "#9FD0F0", sun: true },
      { x: 330, y: 1040, r: 2, sky: "#F3C7BC", sun: false },
      { x: 805, y: 820, r: 4, sky: "#D6E4F5", sun: false },
    ].map((d, i) => (
      <div key={i} style={box({ left: d.x, top: d.y, width: 150, height: 120, backgroundColor: "#FFFFFF", transform: `rotate(${d.r}deg)`, boxShadow: "0 3px 6px rgba(60,40,20,0.15)" })}>
        <div style={box({ left: 0, top: 0, width: 150, height: 50, backgroundColor: d.sky, opacity: 0.7 })} />
        <div style={box({ left: 0, top: 92, width: 150, height: 28, backgroundColor: "#8CCB6E" })} />
        {d.sun ? <div style={box({ left: 108, top: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: C.yellow })} /> : <div style={box({ left: 40 + i * 10, top: 50, width: 50, height: 42, backgroundColor: i === 1 ? C.blue : C.coral, borderRadius: 4 })} />}
        <div style={box({ left: 60, top: -8, width: 34, height: 14, backgroundColor: "rgba(255,240,180,0.85)" })} />
      </div>
    ))}
  </>
);

export const RoomBack: React.FC<{ readonly door?: number; readonly lamp?: number }> = ({ door = 0, lamp = 1 }) => {
  const w = FRONT.window;
  const d = FRONT.door;
  return (
    <div style={box({ left: -600, top: -400 })}>
      <div style={box({ left: 0, top: 0, width: 2600, height: FRONT.wallBottom + 400 + 40, backgroundColor: C.wallNight })} />
      {/* лёгкая фактура стены */}
      <div style={box({ left: 0, top: 0, width: 2600, height: FRONT.wallBottom + 440, backgroundImage: "radial-gradient(rgba(120,90,50,0.05) 1.5px, transparent 2px)", backgroundSize: "14px 14px" })} />
      <div style={box({ left: 600 })}>
        <div style={box({ left: 0, top: 400 })}>
          {/* окно: вечер, огни соседних домов */}
          <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, background: "linear-gradient(180deg, #24304E, #3D4670 70%, #8E6F79)", border: `16px solid ${C.paper}`, boxSizing: "border-box" })} />
          <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: C.paper })} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={box({ left: w.x + 40 + (i % 2) * 150, top: w.y + 200 + Math.floor(i / 2) * 80, width: 24, height: 20, backgroundColor: "#F6D48A", opacity: 0.8 })} />
          ))}
          <Calendar />
          <WallDrawings />
          {/* полка с книгами */}
          <div style={box({ left: 120, top: 470, width: 330, height: 14, backgroundColor: C.woodDark })} />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={box({ left: 140 + i * 38, top: 380 + (i % 2) * 14, width: 30, height: 90 - (i % 2) * 14, backgroundColor: [C.blue, C.coral, C.yellow, C.green, "#7C8BA3"][i] })} />
          ))}
          {/* дверь: закрыта или открыта в светлый коридор */}
          <div style={box({ left: d.x - 18, top: d.y - 18, width: d.w + 36, height: d.h + 18, backgroundColor: C.paper, borderRadius: "6px 6px 0 0" })} />
          <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, background: door > 0 ? "linear-gradient(90deg, #F5DDB0, #EFD2A0)" : "#3A3346" })} />
          {door > 0 ? <div style={box({ left: d.x, top: d.y + d.h - 240, width: d.w, height: 240, backgroundColor: "#D8BE96" })} /> : null}
          <div style={box({ left: d.x + (door > 0 ? d.w - 34 : 0), top: d.y, width: door > 0 ? 34 : d.w, height: d.h, backgroundColor: "#9C7A5C" })} />
          {door > 0 ? null : <div style={box({ left: d.x + d.w - 46, top: d.y + d.h * 0.5, width: 24, height: 10, borderRadius: 5, backgroundColor: C.yellowDeep })} />}
          {/* тёплое пятно лампы на стене */}
          <div style={box({ left: FRONT.lamp.x - 420, top: FRONT.lamp.y - 640, width: 840, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,200,110,0.36), rgba(255,200,110,0) 70%)", opacity: lamp })} />
        </div>
      </div>
      {/* пол */}
      <div style={box({ left: 0, top: FRONT.wallBottom + 400 + 40, width: 2600, height: 1200, backgroundColor: C.floorNight })} />
      <div style={box({ left: 0, top: FRONT.wallBottom + 400 + 30, width: 2600, height: 14, backgroundColor: "#9C8060" })} />
    </div>
  );
};

// Стул (спинка видна за сидящим). x — центр сиденья, floor — пол под ним.
export const ChairFront: React.FC<{ readonly x: number; readonly floor?: number; readonly h?: number; readonly color?: string }> = ({ x, floor = FRONT.ayanFloor, h = 520, color = "#8E6A4A" }) => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: x - 110, top: floor - h, width: 220, height: 140, backgroundColor: color, borderRadius: "18px 18px 6px 6px" })} />
    <div style={box({ left: x - 100, top: floor - h + 130, width: 22, height: h - 130, backgroundColor: "#6E5038" })} />
    <div style={box({ left: x + 78, top: floor - h + 130, width: 22, height: h - 130, backgroundColor: "#6E5038" })} />
  </div>
);

// Столешница и передняя стенка письменного стола. top — предметы на
// столешнице (рисуются после тел сидящих и до их кистей).
export const DeskFront: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => {
  const k = FRONT.desk;
  return (
    <>
      <Svg>
        <polygon points={`${k.back[0]},${k.backY} ${k.back[1]},${k.backY} ${k.front[1]},${k.frontY} ${k.front[0]},${k.frontY}`} fill={C.wood} />
        <polygon points={`${k.back[0]},${k.backY} ${k.back[1]},${k.backY} ${k.front[1]},${k.frontY} ${k.front[0]},${k.frontY}`} fill="url(#te2-desk-light)" />
        <defs>
          <radialGradient id="te2-desk-light" cx="0.75" cy="0.2" r="0.8">
            <stop offset="0" stopColor="rgba(255,214,140,0.45)" />
            <stop offset="1" stopColor="rgba(255,214,140,0)" />
          </radialGradient>
        </defs>
        <rect x={k.front[0]} y={k.frontY} width={k.front[1] - k.front[0]} height={22} fill={C.woodDark} />
        <rect x={k.front[0] + 10} y={k.frontY + 22} width={k.front[1] - k.front[0] - 20} height={k.bottomY - k.frontY - 22} fill="#B88A5A" />
        <rect x={k.front[0] + 60} y={k.frontY + 50} width={300} height={90} rx={8} fill="#A97C50" />
        <rect x={k.front[0] + 180} y={k.frontY + 88} width={60} height={14} rx={7} fill={C.yellowDeep} />
      </Svg>
      {children}
    </>
  );
};

// Конверты на столе во фронтальном плане (сильно в перспективе): светлые
// плоские прямоугольники с синей строкой имени. Дальние — раньше ближних.
export const FrontEnvelopes: React.FC<{ readonly items: readonly EnvState[] }> = ({ items }) => (
  <Svg>
    {[...items]
      .filter((e) => !e.hidden)
      .sort((a, b) => b.y - a.y)
      .map((e) => {
        const p = toFront(e.x, e.y);
        const w = TOP.env * 0.358 * p.s;
        const h = 21 * p.s;
        const tilt = (e.rot ?? 0) * 0.5;
        return (
          <g key={e.env.id} transform={`translate(${p.x} ${p.y}) skewX(${tilt})`}>
            <rect x={-w / 2 + 2} y={-h / 2 + 3} width={w} height={h} rx={2} fill="rgba(60,40,20,0.22)" />
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill={(e.turn ?? 0) > 0.5 ? C.envelopeShade : C.envelope} stroke={C.envelopeLine} strokeWidth={1} />
            {(e.turn ?? 0) > 0.5 ? null : <rect x={-w * 0.22} y={-1.5} width={w * 0.44} height={3} rx={1.5} fill={C.pencil} opacity={0.6} />}
          </g>
        );
      })}
  </Svg>
);

// Деревянная коробка (фронтальный план): видна передняя стенка и верхний
// край; inside — сколько конвертов уже лежит (пачки видны над краем).
export const BoxFront: React.FC<{ readonly inside: number }> = ({ inside }) => {
  const p = toFront(TOP.box.x, TOP.box.y);
  const w = TOP.box.w * 0.358 * p.s;
  const h = 70;
  const fill = Math.min(1, inside / 24);
  return (
    <Svg>
      <rect x={p.x - w / 2} y={p.y - h - 8} width={w} height={14} rx={4} fill={C.boxWoodDark} />
      {fill > 0 ? <rect x={p.x - w / 2 + 8} y={p.y - h - 8 - 10 * fill} width={w - 16} height={14} rx={2} fill={C.envelope} stroke={C.envelopeLine} /> : null}
      <rect x={p.x - w / 2} y={p.y - h + 2} width={w} height={h} rx={6} fill={C.boxWood} />
      <rect x={p.x - w / 2} y={p.y - h + 2} width={w} height={10} fill={C.boxWoodLight} />
      <rect x={p.x - w / 2 + 14} y={p.y - h + 26} width={w - 28} height={4} fill={C.boxWoodDark} opacity={0.5} />
    </Svg>
  );
};

// Настольная лампа (фронтальный план), тёплый свет.
export const LampFront: React.FC = () => {
  const l = FRONT.lamp;
  return (
    <Svg>
      <ellipse cx={l.x} cy={l.y + 4} rx={46} ry={10} fill="#2E3D5C" />
      <path d={`M ${l.x} ${l.y} L ${l.x + 20} ${l.y - 150} L ${l.x + 70} ${l.y - 210}`} stroke="#2E3D5C" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={`M ${l.x + 120} ${l.y - 200} L ${l.x + 40} ${l.y - 250} L ${l.x + 20} ${l.y - 200} Z`} fill={C.yellow} />
      <ellipse cx={l.x + 70} cy={l.y - 196} rx={40} ry={10} fill="#FFF3C4" />
    </Svg>
  );
};

// Комикс и ручка во фронтальном плане (плоские, в перспективе).
export const ComicFront: React.FC<{ readonly ox?: number; readonly oy?: number }> = ({ ox = TOP.comic.x, oy = TOP.comic.y }) => {
  const p = toFront(ox, oy);
  const w = 240 * 0.358 * p.s;
  return (
    <Svg>
      <rect x={p.x - w / 2 + 2} y={p.y - 8} width={w} height={18} rx={3} fill="rgba(60,40,20,0.2)" />
      <rect x={p.x - w / 2} y={p.y - 10} width={w} height={16} rx={3} fill={C.blue} />
      <rect x={p.x - w / 2 + 6} y={p.y - 8} width={w * 0.5} height={6} rx={2} fill={C.yellow} />
    </Svg>
  );
};
export const PenFront: React.FC<{ readonly ox?: number; readonly oy?: number }> = ({ ox = TOP.pen.x, oy = TOP.pen.y }) => {
  const p = toFront(ox, oy);
  return (
    <Svg>
      <rect x={p.x - 30} y={p.y - 3} width={60} height={6} rx={3} fill={C.navy} />
      <rect x={p.x + 18} y={p.y - 3} width={12} height={6} rx={3} fill={C.yellow} />
    </Svg>
  );
};

// ---------- Вид сверху: столешница и предметы ----------
export const DeskTopSurface: React.FC = () => (
  <div style={box({ left: -700, top: -900, width: TOP.w + 1400, height: TOP.h + 1800 })}>
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #B98B5D, #C99A68 45%, #D3A876)" })} />
    {Array.from({ length: 16 }).map((_, i) => (
      <div key={i} style={box({ left: 0, top: 120 + i * 240, width: TOP.w + 1400, height: 5, backgroundColor: "rgba(120,80,45,0.16)", transform: `rotate(${((i * 7) % 5) * 0.3 - 0.6}deg)` })} />
    ))}
    {/* тёплый свет лампы сверху слева */}
    <div style={box({ left: 300, top: 400, width: 2200, height: 2000, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.32), rgba(255,214,140,0) 70%)" })} />
  </div>
);

export const TopEnvelopes: React.FC<{ readonly items: readonly EnvState[] }> = ({ items }) => (
  <Svg>
    {items
      .filter((e) => !e.hidden)
      .map((e) => (
        <g key={e.env.id} transform={`translate(${e.x} ${e.y}) rotate(${e.rot ?? 0})`}>
          <EnvelopeArt w={TOP.env} name={e.env.name} turn={e.turn} open={e.open} out={e.out} content={e.env.content} empty={e.empty} />
        </g>
      ))}
  </Svg>
);

// Коробка сверху: открытая, стенки и дно; inside — сколько конвертов уже
// лежит (ровные пачки по 6, видны верхние края).
export const BoxTop: React.FC<{ readonly inside: number }> = ({ inside }) => {
  const b = TOP.box;
  const stacks = Math.ceil(inside / 6);
  return (
    <Svg>
      <rect x={b.x - b.w / 2 + 14} y={b.y - b.h / 2 + 20} width={b.w} height={b.h} rx={10} fill="rgba(40,28,14,0.25)" />
      <rect x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h} rx={10} fill={C.boxWood} />
      <rect x={b.x - b.w / 2 + 26} y={b.y - b.h / 2 + 26} width={b.w - 52} height={b.h - 52} rx={6} fill={C.boxWoodDark} />
      {Array.from({ length: stacks }).map((_, k) => {
        const n = Math.min(6, inside - k * 6);
        return (
          <g key={k} transform={`translate(${b.x - 4 + (k % 2) * 6} ${b.y - 8 + k * 7})`}>
            {Array.from({ length: n }).map((__, i) => (
              <rect key={i} x={-150 + i * 1.5} y={-92 - i * 2} width={300} height={182} rx={6} fill={i === n - 1 ? C.envelope : "#EFE6D2"} stroke={C.envelopeLine} strokeWidth={3} />
            ))}
          </g>
        );
      })}
      <rect x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={26} rx={8} fill={C.boxWoodLight} />
    </Svg>
  );
};

export const ComicTop: React.FC<{ readonly x?: number; readonly y?: number; readonly rot?: number }> = ({ x = TOP.comic.x, y = TOP.comic.y, rot = -6 }) => (
  <div style={box({ left: x - 150, top: y - 200, width: 300, height: 400, transform: `rotate(${rot}deg)`, backgroundColor: C.blue, borderRadius: 8, boxShadow: "8px 12px 0 rgba(40,28,14,0.22)", overflow: "hidden" })}>
    <div style={box({ left: 16, top: 16, width: 268, height: 70, backgroundColor: C.yellow, borderRadius: 6 })} />
    <div style={box({ left: 16, top: 26, width: 268, textAlign: "center", fontFamily: F.hand, fontWeight: 700, fontSize: 42, color: C.navy })}>{TE2_TEXT.comic}</div>
    {/* три кадра комикса: нарисованные рамки и герой */}
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 16 + (i % 2) * 138, top: 104 + Math.floor(i / 2) * 140, width: i === 2 ? 268 : 130, height: 130, backgroundColor: "#FFFFFF", borderRadius: 4 })}>
        <div style={box({ left: i === 2 ? 110 : 40, top: 30, width: 50, height: 50, borderRadius: 25, backgroundColor: i === 1 ? C.coral : C.yellow })} />
        <div style={box({ left: i === 2 ? 100 : 30, top: 84, width: 70, height: 30, borderRadius: 8, backgroundColor: i === 1 ? "#7C8BA3" : C.green })} />
      </div>
    ))}
  </div>
);

export { ENVELOPES };
