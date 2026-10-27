// Офис папы: светлое помещение, окна на город и горы, стол лицом к камере.
// Монитор повёрнут к папе — со стороны камеры видна только его задняя
// панель; календарь показывается отдельной вставкой экрана.
import { fontFamily } from "../../fonts";
import { WFH_TEXT } from "../script";
import { box } from "../shots";
import { Mountains } from "./Clock";
import { PanelHouse } from "./Outdoor";

export const OFFICE = { floorY: 1500, seatY: 1540, desk: { x: 330, w: 760, top: 1220 }, dadX: 620, monitor: { x: 860 } } as const;

export const OfficeBack: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1500, height: 2600 })}>
    <div style={box({ left: -600, top: -900, width: 2800, height: OFFICE.floorY + 900, backgroundColor: "#E7EDF3" })} />
    {[0, 1].map((i) => (
      <div key={i} style={box({ left: -80 + i * 760, top: 300, width: 620, height: 760, borderRadius: 6, overflow: "hidden", border: "18px solid #F7F9FB", boxSizing: "border-box", background: "linear-gradient(180deg, #BFDDF3, #E8F0F6)" })}>
        <div style={box({ left: 80 - i * 760, top: -300 })}>
          <Mountains x={-200} y={420} w={1700} h={260} />
          <PanelHouse x={-140} y={1100} w={520} floors={5} color="#DCCDBB" seed={2} />
          <PanelHouse x={520} y={1140} w={600} floors={6} color="#E6D3C0" seed={5} />
        </div>
      </div>
    ))}
    <div style={box({ left: -600, top: 1180, width: 2800, height: 320, backgroundColor: "#D9E2EC" })} />
    {/* растение */}
    <div style={box({ left: 1180, top: 1240, width: 120, height: 150, borderRadius: "10px 10px 30px 30px", backgroundColor: "#C9644F" })} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 1150 + i * 40, top: 1000 + (i % 2) * 40, width: 70, height: 260, borderRadius: 35, backgroundColor: "#6FA45A", rotate: `${(i - 1) * 18}deg` })} />
    ))}
    <div style={box({ left: -600, top: OFFICE.floorY, width: 2800, height: 1100, backgroundColor: "#B9C3CF" })} />
  </div>
);

// Стол офиса: столешница поверх тела, монитор (задняя панель к камере).
export const OfficeDesk: React.FC = () => {
  const d = OFFICE.desk;
  return (
    <div style={box({ left: 0, top: 0, width: 1500, height: 2600 })}>
      {/* монитор: задняя панель */}
      <div style={box({ left: OFFICE.monitor.x - 170, top: d.top - 330, width: 340, height: 230, borderRadius: 14, backgroundColor: "#4A5163" })} />
      <div style={box({ left: OFFICE.monitor.x - 20, top: d.top - 110, width: 40, height: 110, backgroundColor: "#3A3F4C" })} />
      <div style={box({ left: d.x, top: d.top - 6, width: d.w, height: 36, borderRadius: 8, backgroundColor: "#E9E3D9" })} />
      <div style={box({ left: d.x + 20, top: d.top + 30, width: d.w - 40, height: OFFICE.seatY - d.top - 30, backgroundColor: "#D3CBBF" })} />
    </div>
  );
};

// Бумажный ежедневник на столе (вид чуть сверху): open 1 — раскрыт, 0 — закрыт.
export const Planner: React.FC<{ x: number; y: number; open: number }> = ({ x, y, open }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <rect x={x - 90} y={y - 30} width={180} height={34} rx={4} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
    {/* левая половина — обложка, складывается вправо */}
    <path d={`M ${x} ${y - 30} L ${x - 90 + 180 * (1 - open)} ${y - 30 - 26 * Math.sin(Math.PI * (1 - open))} L ${x - 90 + 180 * (1 - open)} ${y + 4 - 26 * Math.sin(Math.PI * (1 - open))} L ${x} ${y + 4} Z`} fill={open > 0.5 ? "#FFFFFF" : "#172A46"} stroke="#D5DCE6" strokeWidth={2} />
    {open > 0.5 ? <path d={`M ${x + 14} ${y - 18} L ${x + 76} ${y - 18} M ${x + 14} ${y - 8} L ${x + 60} ${y - 8}`} stroke="#9AA6BC" strokeWidth={4} /> : null}
  </svg>
);

// Календарь папы на мониторе (вставка): последняя встреча закончилась.
export const DadCalendar: React.FC<{ done: number }> = ({ done }) => {
  const c = WFH_TEXT.dadCal;
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #DCE6F0, #C9D6E3)", fontFamily, color: "#172A46" })}>
      <div style={box({ left: 46, top: 360, width: 988, height: 700, borderRadius: 26, backgroundColor: "#2A2F3A", padding: 22, boxSizing: "border-box" })}>
        <div style={box({ left: 22, top: 22, right: 22, bottom: 22, borderRadius: 10, backgroundColor: "#FFFFFF" })}>
          <div style={box({ left: 30, top: 24, fontSize: 52, fontWeight: 900 })}>{WFH_TEXT.calendar.title}</div>
          {[10, 11, 12, 13].map((h, i) => (
            <div key={h} style={box({ left: 30, right: 30, top: 110 + i * 120, height: 2, backgroundColor: "#E4EAF2" })}>
              <div style={box({ left: 0, top: -16, fontSize: 32, fontWeight: 700, color: "#8A97AA" })}>{h}:00</div>
            </div>
          ))}
          <div style={box({ left: 130, right: 40, top: 226, height: 128, borderRadius: 14, backgroundColor: done > 0.5 ? "#EEF1F4" : "#DCE7F6", borderLeft: `10px solid ${done > 0.5 ? "#9AA6BC" : "#3E7CC0"}`, padding: "14px 22px", boxSizing: "border-box" })}>
            <div style={{ fontSize: 44, fontWeight: 900, textDecoration: done > 0.5 ? "line-through" : "none", color: done > 0.5 ? "#8A97AA" : "#172A46" }}>{c.last}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#6B7A90" }}>{c.lastTime}</div>
          </div>
          <div style={box({ left: 130, right: 40, top: 360, height: 200, borderRadius: 14, backgroundColor: "#E6F4EA", borderLeft: "10px solid #3C8C5A", padding: "14px 22px", boxSizing: "border-box", opacity: done })}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#2E6E46" }}>{c.free}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
