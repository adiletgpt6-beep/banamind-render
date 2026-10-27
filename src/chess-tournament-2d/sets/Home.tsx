// Дом семьи. Три декорации, одинаковые во всех сценах:
//   • комната дочки вечером — боковой план стола: дочка слева (сторона
//     белых), стул папы справа, за ним свободный стул (на его спинку
//     ложится пиджак), дверь в коридор справа на дальней стене, окно
//     слева, настольная лампа с тёплым светом;
//   • коридор — тёмный, из приоткрытой двери справа падает тёплый свет;
//   • кухня — фронтальный план стола (ужин, календари, разговор).
// Порядок слоёв задают сцены: фон → персонажи (body) → стол → предметы →
// передние руки (arms).
import { box, Svg } from "../kit";
import { C } from "../theme";
import { Board, type BoardPiece, type BoardQuad } from "../props/Chess";
import type { Vec } from "../rig/motion";

// ---------- Комната ----------
export const ROOM = {
  floorY: 1560,
  table: { x0: 330, x1: 770, top: 1270, surf: 22, thick: 24 },
  girlChair: 290,
  dadChair: 850,
  spareChair: 1010,
  seat: 236, // высота сиденья (px от пола); стол — 290 (детский письменный)
  door: { x0: 900, x1: 1110, top: 760 },
  lamp: { x: 735, y: 1270 },
  notebook: { x: 392, y: 1280 },
} as const;

// Доска на столе в боковом плане: дочка слева (1-й ряд у неё), поле a —
// дальний край, h — ближний (у неё справа). a1 тёмное, h1 светлое.
export const ROOM_BOARD: BoardQuad = {
  a1: { x: 462, y: 1257 },
  a8: { x: 638, y: 1257 },
  h1: { x: 450, y: 1284 },
  h8: { x: 650, y: 1284 },
};

const Chair: React.FC<{ x: number; facing: 1 | -1; color?: string }> = ({ x, facing, color = "#8E6A4A" }) => {
  const y = ROOM.floorY;
  const sy = y - ROOM.seat;
  const backX = x - facing * 96;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: backX - 12, top: sy - 300, width: 24, height: 300 + ROOM.seat, backgroundColor: color, borderRadius: 8 })} />
      <div style={box({ left: backX - 14, top: sy - 300, width: 28, height: 120, backgroundColor: color, borderRadius: 10 })} />
      <div style={box({ left: x - 110, top: sy - 6, width: 220, height: 26, backgroundColor: color, borderRadius: 8 })} />
      <div style={box({ left: x + facing * 92 - 9, top: sy + 18, width: 18, height: ROOM.seat - 18, backgroundColor: "#6E5038" })} />
    </div>
  );
};

// Стул дочки и папы (спинки за ними). spare — свободный стул справа.
export const RoomChairs: React.FC<{ readonly spare?: boolean }> = ({ spare = true }) => (
  <>
    {spare ? <Chair x={ROOM.spareChair} facing={-1} color="#9A765A" /> : null}
    <Chair x={ROOM.girlChair} facing={1} />
    <Chair x={ROOM.dadChair} facing={-1} />
  </>
);

export const RoomBack: React.FC<{ readonly doorLight?: number; readonly lamp?: number }> = ({ doorLight = 0, lamp = 1 }) => (
  <div style={box({ left: -400, top: -300 })}>
    <div style={box({ left: 0, top: 0, width: 2000, height: ROOM.floorY + 300, backgroundColor: C.wallNight })} />
    {/* окно: вечер */}
    <div style={box({ left: 520, top: 980, width: 340, height: 420, backgroundColor: C.night, border: `16px solid ${C.paper}`, boxSizing: "border-box" })} />
    <div style={box({ left: 682, top: 980, width: 14, height: 420, backgroundColor: C.paper })} />
    {[0, 1].map((i) => (
      <div key={i} style={box({ left: 560 + i * 180, top: 1060 + i * 70, width: 18, height: 18, backgroundColor: C.yellow, borderRadius: "50%", opacity: 0.8 })} />
    ))}
    {/* полка с книгами */}
    <div style={box({ left: 940, top: 1020, width: 300, height: 14, backgroundColor: C.woodDark })} />
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={box({ left: 952 + i * 40, top: 930 + (i % 2) * 14, width: 32, height: 90 - (i % 2) * 14, backgroundColor: [C.blue, C.coral, C.yellow, "#7C8BA3"][i] })} />
    ))}
    {/* дверь в коридор: проём справа */}
    <div style={box({ left: ROOM.door.x0 + 400, top: ROOM.door.top + 300, width: ROOM.door.x1 - ROOM.door.x0, height: ROOM.floorY - ROOM.door.top, backgroundColor: "#3A3346" })} />
    <div style={box({ left: ROOM.door.x0 + 400, top: ROOM.door.top + 300, width: ROOM.door.x1 - ROOM.door.x0, height: ROOM.floorY - ROOM.door.top, background: "linear-gradient(90deg, rgba(255,214,150,0.0), rgba(255,214,150,0.18))", opacity: doorLight })} />
    <div style={box({ left: ROOM.door.x0 + 400 - 18, top: ROOM.door.top + 300 - 18, width: ROOM.door.x1 - ROOM.door.x0 + 36, height: ROOM.floorY - ROOM.door.top + 18, border: `18px solid ${C.paper}`, borderBottom: "none", boxSizing: "border-box" })} />
    {/* пол */}
    <div style={box({ left: 0, top: ROOM.floorY + 300, width: 2000, height: 900, backgroundColor: C.floorNight })} />
    {/* тёплое пятно лампы на стене */}
    <div style={box({ left: ROOM.lamp.x + 400 - 420, top: ROOM.lamp.y + 300 - 560, width: 840, height: 760, background: `radial-gradient(ellipse at 50% 70%, ${C.amberGlow}, rgba(255,190,90,0) 68%)`, opacity: lamp })} />
  </div>
);

// Стол сбоку: столешница (видна узкая верхняя плоскость), торец, ножки.
export const RoomTable: React.FC = () => {
  const t = ROOM.table;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: t.x0, top: t.top - t.surf, width: t.x1 - t.x0, height: t.surf, backgroundColor: "#D8AE7E" })} />
      <div style={box({ left: t.x0, top: t.top, width: t.x1 - t.x0, height: t.thick, backgroundColor: C.woodDark })} />
      <div style={box({ left: t.x0 + 96, top: t.top + t.thick, width: 22, height: ROOM.floorY - t.top - t.thick, backgroundColor: "#8C6440" })} />
      <div style={box({ left: t.x1 - 46, top: t.top + t.thick, width: 22, height: ROOM.floorY - t.top - t.thick, backgroundColor: "#8C6440" })} />
    </div>
  );
};

// Настольная лампа на дальнем краю стола и тёплый конус света.
export const Lamp: React.FC<{ readonly on?: number }> = ({ on = 1 }) => {
  const { x, y } = ROOM.lamp;
  return (
    <Svg>
      <polygon points={`${x - 30},${y - 200} ${x - 200},${y - 22} ${x + 60},${y - 22}`} fill="rgba(255,200,110,0.22)" opacity={on} />
      <ellipse cx={x} cy={y - 24} rx={34} ry={8} fill="#2E3446" />
      <path d={`M ${x} ${y - 26} L ${x + 6} ${y - 150} L ${x - 30} ${y - 196}`} stroke="#2E3446" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M ${x - 72} ${y - 176} Q ${x - 30} ${y - 236} ${x + 8} ${y - 206} L ${x - 20} ${y - 168} Z`} fill={C.yellow} />
      <ellipse cx={x - 44} cy={y - 172} rx={26} ry={9} fill="#FFF3C4" opacity={on} />
    </Svg>
  );
};

// Тетрадь на столе (сбоку: сильно сжата), раскрыта.
export const NotebookFlat: React.FC<{ readonly x?: number; readonly y?: number; readonly rot?: number }> = ({ x = ROOM.notebook.x, y = ROOM.notebook.y - 10, rot = 0 }) => (
  <Svg>
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1 0.24)`}>
      <rect x={-62} y={-44} width={124} height={88} fill="#FFFDF6" stroke="#CFC6B4" strokeWidth={4} />
      <line x1={0} y1={-44} x2={0} y2={44} stroke="#CFC6B4" strokeWidth={4} />
      <rect x={-52} y={-30} width={40} height={40} fill="none" stroke={C.navy} strokeWidth={4} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={10} y={-26 + k * 22} width={40} height={6} fill={C.navy} opacity={0.6} />
      ))}
    </g>
  </Svg>
);

// Доска на столе комнаты (боковой план).
export const RoomBoard: React.FC<{ readonly pieces: readonly BoardPiece[]; readonly glow?: number }> = ({ pieces, glow = 1 }) => (
  <Svg>
    <Board q={ROOM_BOARD} pieces={pieces} scale={1.15} thickness={5} glow={glow} />
  </Svg>
);

// Пиджак на спинке свободного стула (после того как папа его повесил).
export const JacketOnChair: React.FC<{ readonly color?: string; readonly shade?: string }> = ({ color = "#2E3D5C", shade = "#24314B" }) => {
  const x = ROOM.spareChair + 96; // спинка стула (facing −1 → справа)
  const y = ROOM.floorY - ROOM.seat - 300;
  return (
    <Svg>
      <path d={`M ${x - 44} ${y + 8} Q ${x} ${y - 14} ${x + 44} ${y + 8} L ${x + 52} ${y + 230} Q ${x} ${y + 244} ${x - 52} ${y + 230} Z`} fill={color} />
      <path d={`M ${x - 44} ${y + 8} Q ${x - 70} ${y + 120} ${x - 62} ${y + 210}`} stroke={shade} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d={`M ${x - 10} ${y - 2} L ${x + 4} ${y + 90} L ${x + 26} ${y + 6}`} stroke={shade} strokeWidth={6} fill="none" />
      <path d={`M ${x - 44} ${y + 8} Q ${x} ${y - 14} ${x + 44} ${y + 8}`} stroke={shade} strokeWidth={8} fill="none" />
    </Svg>
  );
};

// ---------- Коридор ----------
export const CORRIDOR = { floorY: 1560, door: { x0: 760, x1: 1000, top: 760 } } as const;

export const CorridorBack: React.FC<{ readonly light?: number }> = ({ light = 1 }) => {
  const d = CORRIDOR.door;
  return (
    <div style={box({ left: -400, top: -300 })}>
      <div style={box({ left: 0, top: 0, width: 2000, height: CORRIDOR.floorY + 300, backgroundColor: "#6E6A7E" })} />
      {/* фото в рамке на стене */}
      <div style={box({ left: 520, top: 1060, width: 140, height: 110, backgroundColor: "#8B86A0", border: "8px solid #57536A" })} />
      {/* проём в комнату дочки: тёплый свет */}
      <div style={box({ left: d.x0 + 400, top: d.top + 300, width: d.x1 - d.x0, height: CORRIDOR.floorY - d.top, backgroundColor: "#F2C985" })} />
      <div style={box({ left: d.x0 + 400 - 16, top: d.top + 300 - 16, width: d.x1 - d.x0 + 32, height: CORRIDOR.floorY - d.top + 16, border: "16px solid #8E8AA0", borderBottom: "none", boxSizing: "border-box" })} />
      {/* пол и полоса света из двери */}
      <div style={box({ left: 0, top: CORRIDOR.floorY + 300, width: 2000, height: 900, backgroundColor: "#5A5468" })} />
      <div style={box({ left: d.x0 + 400 - 260, top: CORRIDOR.floorY + 300, width: d.x1 - d.x0 + 200, height: 600, background: "linear-gradient(180deg, rgba(255,200,120,0.55), rgba(255,200,120,0))", transform: "skewX(30deg)", opacity: light })} />
    </div>
  );
};

// ---------- Кухня (фронтальный план стола) ----------
export const KITCHEN = { floorY: 1520, tableTop: 1250, table: { x0: 110, x1: 970 } } as const;

export const KitchenBack: React.FC<{ readonly evening?: boolean }> = ({ evening = true }) => (
  <div style={box({ left: -400, top: -300 })}>
    <div style={box({ left: 0, top: 0, width: 2000, height: KITCHEN.floorY + 300, backgroundColor: evening ? "#EFDDBD" : C.wall })} />
    {/* окно */}
    <div style={box({ left: 640, top: 780, width: 420, height: 400, backgroundColor: evening ? C.night : C.glass, border: `16px solid ${C.paper}`, boxSizing: "border-box" })} />
    <div style={box({ left: 842, top: 780, width: 16, height: 400, backgroundColor: C.paper })} />
    {/* шкафчики */}
    <div style={box({ left: 1180, top: 760, width: 420, height: 280, backgroundColor: "#E2D3B5" })} />
    <div style={box({ left: 1180, top: 1260, width: 420, height: 560, backgroundColor: "#D6C4A2" })} />
    <div style={box({ left: 140, top: 760, width: 360, height: 280, backgroundColor: "#E2D3B5" })} />
    {/* подвесной светильник над столом */}
    <div style={box({ left: 938, top: 300, width: 6, height: 420, backgroundColor: C.navy })} />
    <div style={box({ left: 850, top: 700, width: 182, height: 80, backgroundColor: C.coral, borderRadius: "90px 90px 0 0" })} />
    {evening ? <div style={box({ left: 640, top: 780, width: 600, height: 760, background: `radial-gradient(ellipse at 50% 0%, ${C.amberGlow}, rgba(255,190,90,0) 70%)` })} /> : null}
    <div style={box({ left: 0, top: KITCHEN.floorY + 300, width: 2000, height: 900, backgroundColor: "#CDB894" })} />
  </div>
);

export const KitchenTable: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => {
  const t = KITCHEN.table;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: t.x0, top: KITCHEN.tableTop - 40, width: t.x1 - t.x0, height: 44, backgroundColor: "#F4ECDD" })} />
      <div style={box({ left: t.x0, top: KITCHEN.tableTop, width: t.x1 - t.x0, height: 40, backgroundColor: C.wood })} />
      <div style={box({ left: t.x0 + 20, top: KITCHEN.tableTop + 40, width: t.x1 - t.x0 - 40, height: 60, backgroundColor: C.woodDark })} />
      <div style={box({ left: t.x0 + 40, top: KITCHEN.tableTop + 100, width: 26, height: KITCHEN.floorY - KITCHEN.tableTop - 100, backgroundColor: C.woodDark })} />
      <div style={box({ left: t.x1 - 66, top: KITCHEN.tableTop + 100, width: 26, height: KITCHEN.floorY - KITCHEN.tableTop - 100, backgroundColor: C.woodDark })} />
      {children}
    </div>
  );
};

// Спинка стула за сидящим (кухня, фронтальный план).
export const KitchenChairBack: React.FC<{ readonly x: number }> = ({ x }) => (
  <div style={box({ left: x - 100, top: KITCHEN.floorY - 560, width: 200, height: 330, backgroundColor: "#9A765A", borderRadius: "30px 30px 8px 8px" })} />
);

// Тарелка с едой и ложка на столе (ужин).
export const Plate: React.FC<{ readonly x: number; readonly spoon?: Vec }> = ({ x, spoon }) => (
  <Svg>
    <ellipse cx={x} cy={KITCHEN.tableTop - 20} rx={78} ry={16} fill="#FFFFFF" stroke="#DCD3C2" strokeWidth={3} />
    <ellipse cx={x} cy={KITCHEN.tableTop - 24} rx={46} ry={8} fill="#E3A35C" />
    {spoon ? <path d={`M ${spoon.x - 34} ${spoon.y + 4} L ${spoon.x + 30} ${spoon.y - 2}`} stroke="#A9AFB8" strokeWidth={6} strokeLinecap="round" /> : null}
  </Svg>
);
