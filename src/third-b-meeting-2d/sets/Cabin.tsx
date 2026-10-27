// Салон белого седана изнутри — ракурс A: камера между передними
// сиденьями смотрит назад. Задний ряд: справа в кадре — левое заднее место
// (мама во время звонка), слева в кадре — правое заднее место (дочка на
// бустере, у тротуара). Сверху — заднее стекло, по бокам — боковые окна.
// Ремень дочки: верхнее крепление у её внешнего плеча (слева в кадре),
// замок — у бедра со стороны середины. Ремень идёт поперёк груди и
// плеча, не через шею и лицо.
import { box } from "../kit";
import { C } from "../theme";

export const CABIN = {
  cushionY: 1360, // верх подушки заднего сиденья
  // Рост в мире ракурса: сидя голова мамы — на уровне подголовника.
  mom: { x: 735, floor: 1790, h: 1540 },
  // Дочка (≈ 1,3 м при маме ≈ 1,65 м) на бустере: ноги не достают пола.
  kyz: { x: 330, floor: 1655, h: 1210 },
  boosterTop: 1290, // верх подушки бустера
  beltAnchor: { x: 120, y: 880 },
  buckle: { x: 470, y: 1350 },
  momBuckle: { x: 600, y: 1352 },
} as const;

// Высота сиденья (мировые px от «пола» точки персонажа).
export const seatH = (floor: number, top: number) => floor - top;

export const CabinRearBack: React.FC<{ readonly light?: number; readonly street?: number }> = ({ light = 1, street = 0 }) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: -40, top: -40, width: 1160, height: 2000, backgroundColor: C.cabin })} />
    {/* заднее стекло: за ним — школьный двор (или проплывающая улица) */}
    <div style={box({ left: 150, top: 300, width: 780, height: 330, borderRadius: "90px 90px 24px 24px", overflow: "hidden", background: `linear-gradient(180deg, #CFE2F0, #EDE4D2)` })}>
      {[0, 1, 2, 3].map((i) => {
        const x = (((i * 260 - street * 6) % 1040) + 1040) % 1040 - 130;
        return <div key={i} style={box({ left: x, top: 150 + (i % 2) * 30, width: 150, height: 220, backgroundColor: i % 2 ? "#9DBB8C" : "#E7D8C2", borderRadius: i % 2 ? 75 : 6 })} />;
      })}
    </div>
    {/* боковые окна: слева — тротуар и школа, справа — дорога */}
    <div style={box({ left: -60, top: 420, width: 160, height: 420, borderRadius: "0 60px 30px 0", background: "linear-gradient(180deg, #D5E6F2, #E9DECB)" })} />
    <div style={box({ left: 980, top: 420, width: 160, height: 420, borderRadius: "60px 0 0 30px", background: "linear-gradient(180deg, #D5E6F2, #D9D6CF)" })} />
    {/* спинка заднего дивана и подголовники */}
    <div style={box({ left: 40, top: 640, width: 1000, height: 760, borderRadius: "70px 70px 20px 20px", backgroundColor: "#59606E" })} />
    <div style={box({ left: 90, top: 690, width: 400, height: 680, borderRadius: 54, backgroundColor: "#626A79" })} />
    <div style={box({ left: 590, top: 690, width: 400, height: 680, borderRadius: 54, backgroundColor: "#626A79" })} />
    <div style={box({ left: 640, top: 560, width: 190, height: 130, borderRadius: 40, backgroundColor: "#6A7281" })} />
    {/* верхнее крепление ремня (стойка у правого окна) */}
    <div style={box({ left: 60, top: 820, width: 90, height: 120, borderRadius: 20, backgroundColor: "#4A505D" })} />
    <div style={box({ left: 92, top: 860, width: 40, height: 40, borderRadius: 8, backgroundColor: "#2A2E36" })} />
    {/* мягкий дневной свет из окон */}
    <div style={box({ left: 0, top: 300, width: 1080, height: 900, background: `radial-gradient(ellipse at 50% 0%, rgba(255,246,220,${0.22 * light}), rgba(255,246,220,0) 70%)` })} />
  </div>
);

// Подушка дивана и бустер дочки — перед ногами персонажей не рисуются,
// персонажи сидят «на» подушке (рисуются после неё).
export const CabinCushion: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: 30, top: CABIN.cushionY - 10, width: 1020, height: 220, borderRadius: 40, backgroundColor: "#565D6B" })} />
    {/* бустер: подушка с подлокотниками (зелёная окантовка) */}
    <div style={box({ left: 150, top: CABIN.boosterTop - 6, width: 360, height: 110, borderRadius: 26, backgroundColor: "#3D434F", borderTop: `10px solid ${C.green}`, boxSizing: "border-box" })} />
    <div style={box({ left: 0, top: CABIN.cushionY + 200, width: 1080, height: 400, backgroundColor: "#2D323B" })} />
  </div>
);

// Передний план ракурса A: края передних сидений и центральная консоль.
export const CabinFrontEdges: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    {/* спинки передних сидений (камера между ними) и консоль */}
    <div style={box({ left: -80, top: 1530, width: 560, height: 520, borderRadius: "120px 120px 0 0", backgroundColor: "#474D5A" })} />
    <div style={box({ left: -40, top: 1560, width: 480, height: 40, borderRadius: 20, backgroundColor: "#525967" })} />
    <div style={box({ left: 600, top: 1530, width: 560, height: 520, borderRadius: "120px 120px 0 0", backgroundColor: "#474D5A" })} />
    <div style={box({ left: 640, top: 1560, width: 480, height: 40, borderRadius: 20, backgroundColor: "#525967" })} />
    <div style={box({ left: 440, top: 1700, width: 200, height: 260, borderRadius: "30px 30px 0 0", backgroundColor: "#2A2E36" })} />
  </div>
);

// Ремень безопасности: лента от крепления через плечо к замку (+ поясная).
export const Belt: React.FC<{ readonly anchor: { x: number; y: number }; readonly via?: { x: number; y: number }; readonly to: { x: number; y: number }; readonly lap?: { x: number; y: number } }> = ({ anchor, via, to, lap }) => {
  const d = via ? `M ${anchor.x} ${anchor.y} Q ${via.x} ${via.y} ${to.x} ${to.y}` : `M ${anchor.x} ${anchor.y} L ${to.x} ${to.y}`;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <path d={d} stroke="#1F2228" strokeWidth={24} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#3A3F4A" strokeWidth={10} fill="none" strokeLinecap="round" />
      {lap ? <path d={`M ${lap.x} ${lap.y} L ${to.x} ${to.y}`} stroke="#1F2228" strokeWidth={24} strokeLinecap="round" /> : null}
      <rect x={to.x - 16} y={to.y - 11} width={32} height={22} rx={5} fill="#9AA3B2" />
    </svg>
  );
};
