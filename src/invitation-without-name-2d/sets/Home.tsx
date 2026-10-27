// Дом: стол в общей комнате (вид спереди) — сцены 6–12 и 16; детская с
// письменным столом и доской над ним — сцена 18. Вечером фон теплее.
// Порядок слоёв за столом: стена → спинки стульев → тела сидящих
// (layer "body") → столешница и передняя панель → предметы на столе →
// руки (layer "arms").
import { box } from "../kit";
import { C } from "../theme";

export const HOME = {
  floorY: 1540,
  tableTop: 1236, // задний край столешницы
  tableFront: 1300, // передний край
  table: { x0: 90, x1: 990 },
  seatY: 1540, // ступни сидящих
} as const;

// Высота сиденья стула (px мира от пола).
export const CHAIR_SEAT = 186;

export const HomeWall: React.FC<{ readonly warm?: number }> = ({ warm = 1 }) => (
  <div style={box({ left: -500, top: -300, width: 2100, height: 2600 })}>
    <div style={box({ left: 0, top: 0, width: 2100, height: HOME.floorY + 300, backgroundColor: C.wallWarm })} />
    {/* окно: вечер */}
    <div style={box({ left: 500 + 620, top: 300 + 470, width: 420, height: 470, backgroundColor: C.night, border: `16px solid ${C.paper}`, boxSizing: "border-box" })} />
    <div style={box({ left: 500 + 822, top: 300 + 470, width: 16, height: 470, backgroundColor: C.paper })} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 500 + 660 + i * 110, top: 300 + 560 + (i % 2) * 70, width: 22, height: 22, borderRadius: "50%", backgroundColor: C.yellow, opacity: 0.85 })} />
    ))}
    {/* полка с цветком и рамкой */}
    <div style={box({ left: 500 + 70, top: 300 + 740, width: 360, height: 16, backgroundColor: C.woodDark })} />
    <div style={box({ left: 500 + 110, top: 300 + 640, width: 90, height: 100, backgroundColor: C.coral, borderRadius: "0 0 14px 14px" })} />
    {[-30, 0, 30].map((a) => (
      <div key={a} style={box({ left: 500 + 140, top: 300 + 540, width: 34, height: 120, backgroundColor: C.green, borderRadius: "50%", transform: `rotate(${a}deg)`, transformOrigin: "50% 100%" })} />
    ))}
    <div style={box({ left: 500 + 270, top: 300 + 620, width: 120, height: 120, backgroundColor: C.paper, border: `8px solid ${C.navy}`, boxSizing: "border-box" })} />
    {/* лампа над столом */}
    <div style={box({ left: 500 + 536, top: 0, width: 8, height: 300 + 430, backgroundColor: C.ink })} />
    <div style={box({ left: 500 + 440, top: 300 + 420, width: 200, height: 86, backgroundColor: C.yellow, borderRadius: "100px 100px 0 0" })} />
    <div style={box({ left: 500 + 240, top: 300 + 500, width: 600, height: 760, background: "radial-gradient(ellipse at 50% 0%, rgba(255,212,59,0.28), rgba(255,212,59,0) 70%)", opacity: warm })} />
    <div style={box({ left: 0, top: HOME.floorY + 300, width: 2100, height: 900, backgroundColor: C.floorWarm })} />
  </div>
);

// Спинка стула (за сидящим): x — середина стула.
export const ChairBack: React.FC<{ readonly x: number; readonly color?: string }> = ({ x, color = C.woodDark }) => (
  <div style={box({ left: x - 74, top: HOME.seatY - CHAIR_SEAT - 220, width: 148, height: 230, backgroundColor: color, borderRadius: "26px 26px 6px 6px" })}>
    <div style={box({ left: 18, top: 20, width: 112, height: 80, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.12)" })} />
  </div>
);

// Стол: столешница с видимой глубиной и передняя панель (закрывает ноги).
export const HomeTable: React.FC = () => {
  const { x0, x1 } = HOME.table;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: x0, top: HOME.tableTop, width: x1 - x0, height: HOME.tableFront - HOME.tableTop, backgroundColor: "#D9B27F" })} />
      <div style={box({ left: x0 - 8, top: HOME.tableFront, width: x1 - x0 + 16, height: 30, backgroundColor: C.woodDark })} />
      <div style={box({ left: x0 + 30, top: HOME.tableFront + 30, width: 30, height: HOME.floorY - HOME.tableFront - 30, backgroundColor: "#8E6A40" })} />
      <div style={box({ left: x1 - 60, top: HOME.tableFront + 30, width: 30, height: HOME.floorY - HOME.tableFront - 30, backgroundColor: "#8E6A40" })} />
    </div>
  );
};

// Предмет на столешнице (вид спереди-сверху: сильно сжат по вертикали).
// y — точка на столешнице между tableTop и tableFront.
export const OnTable: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number; readonly squash?: number; readonly children: React.ReactNode }> = ({ x, y, rot = 0, squash = 0.26, children }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) scale(1 ${squash}) rotate(${rot})`}>{children}</g>
  </svg>
);

// Детская: письменный стол Эмира, пробковая доска над ним.
export const ROOM = { floorY: 1560, deskTop: 1250, desk: { x0: 420, x1: 1000 }, board: { x: 470, y: 520, w: 500, h: 560 } } as const;

export const RoomBack: React.FC = () => {
  const b = ROOM.board;
  return (
    <div style={box({ left: -500, top: -300, width: 2100, height: 2600 })}>
      <div style={box({ left: 0, top: 0, width: 2100, height: ROOM.floorY + 300, backgroundColor: "#F4E4C6" })} />
      {/* окно детской (ночь) */}
      <div style={box({ left: 500 - 330, top: 300 + 460, width: 380, height: 520, backgroundColor: C.night, border: `16px solid ${C.paper}`, boxSizing: "border-box" })} />
      <div style={box({ left: 500 - 260, top: 300 + 560, width: 70, height: 70, borderRadius: "50%", backgroundColor: "#F6E7B0", opacity: 0.9 })} />
      {/* пробковая доска */}
      <div style={box({ left: 500 + b.x, top: 300 + b.y, width: b.w, height: b.h, backgroundColor: "#D3B07E", border: "14px solid #A97F4E", boxSizing: "border-box" })} />
      {/* настольная лампа */}
      <div style={box({ left: 500 + 900, top: 300 + 1070, width: 14, height: 190, backgroundColor: C.ink, transform: "rotate(-16deg)" })} />
      <div style={box({ left: 500 + 840, top: 300 + 1020, width: 130, height: 70, backgroundColor: C.yellow, borderRadius: "70px 70px 0 0", transform: "rotate(-16deg)" })} />
      <div style={box({ left: 500 + 560, top: 300 + 1060, width: 520, height: 300, background: "radial-gradient(ellipse at 70% 20%, rgba(255,212,59,0.3), rgba(255,212,59,0) 70%)" })} />
      <div style={box({ left: 0, top: ROOM.floorY + 300, width: 2100, height: 900, backgroundColor: C.floorWarm })} />
    </div>
  );
};

export const RoomDesk: React.FC = () => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: ROOM.desk.x0, top: ROOM.deskTop, width: ROOM.desk.x1 - ROOM.desk.x0, height: 34, backgroundColor: C.navy })} />
    <div style={box({ left: ROOM.desk.x0 + 24, top: ROOM.deskTop + 34, width: 24, height: ROOM.floorY - ROOM.deskTop - 34, backgroundColor: "#0F1C33" })} />
    <div style={box({ left: ROOM.desk.x1 - 48, top: ROOM.deskTop + 34, width: 24, height: ROOM.floorY - ROOM.deskTop - 34, backgroundColor: "#0F1C33" })} />
  </div>
);
