// Небольшой IT-офис папы. Фронтальный план стола папы (сцены 1, 5, 7, 8):
// стена с доской и стикерами, стол папы с ноутбуком (наружная крышка к
// зрителю), стул папы за столом, два стула для гостей справа (на дальнем
// сидит Бектур, на ближний к столу потом садится папа — рядом с сыном).
// Спокойный фон: бумажный, синий акцент, немного жёлтого и розового.
import { box } from "../kit";
import { C } from "../theme";

export const OFFICE = {
  floorY: 1440,
  desk: { x0: 120, x1: 700, top: 1150, front: 1205 },
  dadSeat: { x: 410 },
  laptop: { x: 400, y: 1190, w: 270 },
  paper: { x: 570, y: 1178 }, // лист на столе (центр)
  dadChair: { x: 780 }, // ближний к столу стул — на него потом садится папа
  boyChair: { x: 1000 },
  seatY: 1452, // ступни сидящих гостей (чуть ближе к зрителю)
} as const;

export const OfficeWall: React.FC<{ readonly evening?: number }> = ({ evening = 0 }) => (
  <div style={box({ left: -400, top: -200, width: 1900, height: 2400 })}>
    <div style={box({ left: 0, top: 0, width: 1900, height: OFFICE.floorY + 200, backgroundColor: C.wall })} />
    {/* доска со стикерами */}
    <div style={box({ left: 460, top: 760, width: 460, height: 330, backgroundColor: "#FFFFFF", border: `10px solid ${C.blue}` })} />
    {[
      [500, 800, C.yellow],
      [600, 800, C.pink],
      [700, 812, C.yellow],
      [520, 900, C.pink],
      [640, 920, C.yellow],
      [780, 820, C.blueSoft],
    ].map(([x, y, c], i) => (
      <div key={i} style={box({ left: x as number, top: y as number, width: 72, height: 72, backgroundColor: c as string, transform: `rotate(${(i % 3) - 1}deg)` })} />
    ))}
    <div style={box({ left: 520, top: 1010, width: 300, height: 14, backgroundColor: C.inkSoft, opacity: 0.6 })} />
    {/* полка с папками справа */}
    <div style={box({ left: 1160, top: 860, width: 260, height: 18, backgroundColor: C.woodDark })} />
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={box({ left: 1176 + i * 52, top: 760 + (i % 2) * 12, width: 40, height: 100 - (i % 2) * 12, backgroundColor: [C.blue, C.orange, C.yellow, C.blueSoft][i] })} />
    ))}
    {/* растение */}
    <div style={box({ left: 1300, top: 1250, width: 110, height: 140, backgroundColor: C.orange, borderRadius: "0 0 20px 20px" })} />
    {[-40, 0, 40].map((a) => (
      <div key={a} style={box({ left: 1330, top: 1060, width: 50, height: 210, backgroundColor: "#5FA35A", borderRadius: "50%", transform: `rotate(${a}deg)`, transformOrigin: "50% 100%" })} />
    ))}
    {/* пол */}
    <div style={box({ left: 0, top: OFFICE.floorY + 200, width: 1900, height: 800, backgroundColor: C.floor })} />
    <div style={box({ left: 0, top: OFFICE.floorY + 196, width: 1900, height: 10, backgroundColor: "#C7B79B" })} />
    {evening ? <div style={box({ left: 0, top: 0, width: 1900, height: 2400, backgroundColor: "#F2B36B", opacity: 0.18 * evening })} /> : null}
  </div>
);

// Спинка стула папы (за ним).
export const DadChairBack: React.FC = () => (
  <div style={box({ left: OFFICE.dadSeat.x - 120, top: 860, width: 240, height: 330, backgroundColor: "#2B2F38", borderRadius: "40px 40px 12px 12px" })} />
);

// Столешница и передняя панель стола (перекрывает ноги и стул папы).
export const DadDeskFront: React.FC = () => {
  const d = OFFICE.desk;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: d.x0, top: d.top, width: d.x1 - d.x0, height: d.front - d.top, backgroundColor: "#F7F4EC", borderTop: "4px solid #DCD5C6" })} />
      <div style={box({ left: d.x0 - 6, top: d.front, width: d.x1 - d.x0 + 12, height: 22, backgroundColor: "#DCD5C6" })} />
      <div style={box({ left: d.x0 + 20, top: d.front + 22, width: d.x1 - d.x0 - 40, height: OFFICE.floorY - d.front - 22, backgroundColor: C.blue })} />
      <div style={box({ left: d.x0 + 20, top: d.front + 22, width: d.x1 - d.x0 - 40, height: 30, backgroundColor: "#1C2DC4" })} />
    </div>
  );
};

// Стул для гостя (вид спереди): сиденье, спинка за сидящим, ножки.
export const GuestChairBack: React.FC<{ readonly x: number; readonly color?: string }> = ({ x, color = C.orange }) => (
  <div style={box({ left: x - 95, top: OFFICE.seatY - 470, width: 190, height: 300, backgroundColor: color, borderRadius: "34px 34px 10px 10px" })} />
);
export const GuestChairSeat: React.FC<{ readonly x: number; readonly color?: string }> = ({ x, color = C.orange }) => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: x - 108, top: OFFICE.seatY - 182, width: 216, height: 34, backgroundColor: color, borderRadius: 12 })} />
    <div style={box({ left: x - 96, top: OFFICE.seatY - 150, width: 12, height: 150, backgroundColor: C.ink })} />
    <div style={box({ left: x + 84, top: OFFICE.seatY - 150, width: 12, height: 150, backgroundColor: C.ink })} />
  </div>
);

// Лист заявления, лежащий на столе (вид спереди-сверху: сильно сжат).
export const PaperOnDesk: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number }> = ({ x, y, rot = -3 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1 0.22)`}>
      <rect x={-75} y={-100} width={150} height={204} fill="#FFFDF6" stroke="#D8D0C0" strokeWidth={4} />
      <rect x={-34} y={-80} width={68} height={22} fill={C.ink} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-58} y={-30 + i * 34} width={[110, 96, 70][i]} height={12} fill="#1F2A5C" opacity={0.7} />
      ))}
    </g>
  </svg>
);
