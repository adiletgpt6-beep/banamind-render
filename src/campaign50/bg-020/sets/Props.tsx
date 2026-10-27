// Предметы на столе в общем плане (вид спереди, чуть сверху): книга сына,
// блокнот мамы, рабочий календарь папы. Крупные планы — в Inserts.tsx.
import { box } from "../../../two-schedules-2d/shots";

// Книга сына: open 0…1 (0 — закрыта), flip 0…1 — переворачиваемая страница.
// Обложка белая с жёлтой полосой (в финале она становится карточкой).
export const BookSide: React.FC<{ readonly x: number; readonly y: number; readonly open: number; readonly flip?: number; readonly s?: number }> = ({ x, y, open, flip = 0, s = 1 }) => {
  // правая половина лежит почти плашмя, левая при закрытии ложится сверху
  const right = 10 * Math.min(1, open * 3);
  const left = 3 + (167 - 3 + 10) * open - 10 * open;
  const flipA = right + (left - right) * flip;
  const half = (ang: number, cover: boolean) => (
    <g transform={`rotate(${-ang})`}>
      <rect x={0} y={-5} width={92} height={10} rx={3} fill={cover ? "#FFFFFF" : "#FFFDF6"} stroke="#D9D2C2" strokeWidth={2} />
      {cover ? <rect x={30} y={-5} width={18} height={10} fill="#F2C230" /> : null}
    </g>
  );
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${x} ${y - 4}) scale(${s})`}>
        <ellipse cx={0} cy={6} rx={110} ry={7} fill="rgba(80,50,30,0.12)" />
        {/* левая и правая половины (страницы + обложка) */}
        {half(right, false)}
        {half(left, left < 90)}
        {flip > 0 && flip < 1 ? (
          <g transform={`rotate(${-flipA})`}>
            <rect x={0} y={-3} width={90} height={6} rx={2} fill="#FFFFFF" stroke="#E2DBCB" strokeWidth={1.5} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// Блокнот мамы на столе: лежит плашмя (вид спереди — тонкая стопка).
export const NotebookSide: React.FC<{ readonly x: number; readonly y: number; readonly lift?: number }> = ({ x, y, lift = 0 }) => (
  <div style={box({ left: x - 80, top: y - 18 - lift * 6, width: 160, height: 18, borderRadius: 4, backgroundColor: "#5E9A93", boxShadow: "0 3px 6px rgba(60,40,20,0.18)" })}>
    <div style={box({ left: 4, top: 2, width: 152, height: 8, borderRadius: 3, backgroundColor: "#FFFDF6" })} />
  </div>
);

// Рабочий календарь папы: открытый ежедневник синего цвета.
export const PlannerSide: React.FC<{ readonly x: number; readonly y: number; readonly open: number }> = ({ x, y, open }) => (
  <div style={box({ left: x - 95, top: y - 22, width: 190, height: 22 })}>
    <div style={box({ left: 0, top: 8, width: 190, height: 14, borderRadius: 4, backgroundColor: "#2F4A7A" })} />
    <div style={box({ left: 6, top: 2 + (1 - open) * 6, width: 178, height: 10, borderRadius: 3, backgroundColor: "#FFFDF6", opacity: 0.4 + 0.6 * open })} />
  </div>
);

// Телефон мамы плашмя на столе.
export const PhoneOnTable: React.FC<{ readonly x: number; readonly y: number; readonly glow?: number }> = ({ x, y, glow = 0 }) => (
  <div style={box({ left: x - 46, top: y - 10, width: 92, height: 10, borderRadius: 4, backgroundColor: "#2A2F3A" })}>
    <div style={box({ left: 4, top: 1, width: 84, height: 3, borderRadius: 2, backgroundColor: `rgba(255,214,90,${0.25 + 0.75 * glow})` })} />
  </div>
);
