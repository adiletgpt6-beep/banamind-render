// Офис в Бишкеке: светлая стена с жёлтой фирменной полосой, большое окно
// (панельные дома, тополя, горы Ала-Тоо), справа — стеклянная переговорная
// с табличкой «Жыйын бөлмөсү», внутри стол и экран. На первом плане —
// рабочий стол папы: монитор, папка с материалами, телефон, планшет.
// Пол — y = 1500; сидящий за столом стоит ступнями на y = 1540.
// Координаты мира одинаковы во всех офисных планах.
import { box, Depth } from "../shots";
import { BG2_TEXT } from "../script";
import { fontFamily } from "../../../fonts";
import { Mountains } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

const TOP = 1240; // столешница

export const OFFICE = {
  floorY: 1500,
  seatY: 1540,
  window: { x: 90, y: 330, w: 900, h: 740 },
  room: { x: 1240, y: 360, w: 960, h: 1140, doorX: 1290, doorW: 240 },
  desk: { x: 330, top: TOP, w: 880, front: TOP + 30, bottom: 1580 },
  dad: 760, // x сидящего папы
  monitor: { x: 975, y: TOP + 6 },
  phone: { x: 560, y: TOP + 20 },
  folder: { x: 700, y: TOP + 18 },
  tablet: { x: 1150, y: TOP + 20 },
  door: { x: 1410, y: 1500 }, // точка у входа в переговорную
} as const;

export const seatH = (h: number) => 0.27 * h;

// Задний план: стена, окно, переговорная. doorOpen 0…1 — стеклянная дверь
// отъезжает вправо. inRoom — люди внутри переговорной (за стеклом).
export const OfficeBack: React.FC<{ readonly doorOpen?: number; readonly inRoom?: React.ReactNode; readonly screenOn?: number }> = ({ doorOpen = 0, inRoom, screenOn = 1 }) => {
  const w = OFFICE.window;
  const r = OFFICE.room;
  return (
    <>
      <div style={box({ left: -400, top: -200, width: 3000, height: OFFICE.floorY + 200, backgroundColor: "#F1F3F6" })} />
      <div style={box({ left: -400, top: 1180, width: 3000, height: 26, backgroundColor: "#FFC90E", opacity: 0.85 })} />
      {/* окно: город и горы */}
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", borderRadius: 6 })}>
        <Depth depth={0.4}>
          <div style={box({ left: -200, top: -200, width: w.w + 400, height: w.h + 400, background: "linear-gradient(180deg, #BFDDF3 0%, #E6F0F6 60%, #F7E9D6 100%)" })} />
          <Mountains x={-120} y={70} w={w.w + 240} h={260} />
        </Depth>
        <Depth depth={0.6}>
          <PanelHouse x={-40} y={w.h + 30} w={460} floors={5} color="#E9DCC8" seed={3} />
          <PanelHouse x={480} y={w.h + 60} w={520} floors={4} color="#DCE3E8" seed={5} />
          <Tree x={420} y={w.h + 20} s={1.1} kind="poplar" />
          <Tree x={860} y={w.h + 30} s={0.9} kind="poplar" tone={1} />
        </Depth>
      </div>
      <div style={box({ left: w.x - 16, top: w.y - 16, width: w.w + 32, height: w.h + 32, border: "16px solid #FFFFFF", borderRadius: 12, boxShadow: "0 8px 20px rgba(20,40,90,0.12)" })} />
      <div style={box({ left: w.x + w.w / 2 - 8, top: w.y, width: 16, height: w.h, backgroundColor: "#FFFFFF" })} />
      {/* комнатное растение */}
      <div style={box({ left: 1040, top: 1260, width: 120, height: 240, borderRadius: "16px 16px 30px 30px", backgroundColor: "#FFC90E" })} />
      {[-40, 0, 40, -20, 25].map((dx, i) => (
        <div key={i} style={box({ left: 1080 + dx, top: 980 + (i % 3) * 60, width: 70, height: 220, borderRadius: "50% 50% 40% 40%", backgroundColor: i % 2 ? "#5E9E6E" : "#4E8A5F", rotate: `${dx * 0.6}deg`, transformOrigin: "50% 100%" })} />
      ))}
      {/* переговорная */}
      <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, backgroundColor: "#E4EAF2" })}>
        {/* экран на стене */}
        <div style={box({ left: 360, top: 120, width: 420, height: 250, borderRadius: 12, backgroundColor: screenOn > 0.5 ? "#FFFFFF" : "#2B3242", border: "10px solid #2B3242" })}>
          {screenOn > 0.5
            ? [80, 130, 60, 160].map((h, i) => (
                <div key={i} style={box({ left: 50 + i * 85, bottom: 30, width: 50, height: h * 0.9, borderRadius: 6, backgroundColor: i === 3 ? "#FFC90E" : "#9DB2CC" })} />
              ))
            : null}
        </div>
        {inRoom}
        {/* стол переговорной */}
        <div style={box({ left: 160, top: 760, width: 720, height: 40, borderRadius: 12, backgroundColor: "#C9B49A" })} />
        <div style={box({ left: 220, top: 800, width: 600, height: 340, backgroundColor: "#B79E80" })} />
      </div>
      {/* стекло и рамы */}
      <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, background: "linear-gradient(115deg, rgba(255,255,255,0.32) 0%, rgba(214,232,243,0.22) 40%, rgba(255,255,255,0.4) 41%, rgba(214,232,243,0.18) 60%)" })} />
      <div style={box({ left: r.x - 14, top: r.y - 14, width: r.w + 28, height: r.h + 14, border: "14px solid #2B3242", borderBottom: "none", boxSizing: "border-box" })} />
      {[r.x + r.doorW + 60, r.x + 620].map((x) => (
        <div key={x} style={box({ left: x, top: r.y, width: 10, height: r.h, backgroundColor: "#2B3242" })} />
      ))}
      <div style={box({ left: r.x + 40, top: r.y + 520, width: r.w - 80, height: 34, backgroundColor: "rgba(255,255,255,0.55)" })} />
      {/* стеклянная дверь (отъезжает вправо) */}
      <div style={box({ left: r.x + 50 + doorOpen * 260, top: r.y + 20, width: r.doorW, height: r.h - 20, border: "8px solid #2B3242", boxSizing: "border-box", background: "rgba(220,235,245,0.35)" })}>
        <div style={box({ right: 16, top: 520, width: 14, height: 120, borderRadius: 7, backgroundColor: "#2B3242" })} />
      </div>
      {/* табличка */}
      <div style={box({ left: r.x + 330, top: r.y - 120, padding: "14px 34px", borderRadius: 18, backgroundColor: "#14285A", color: "#FFFFFF", fontFamily, fontSize: 44, fontWeight: 900, whiteSpace: "nowrap" })}>{BG2_TEXT.room}</div>
      {/* пол */}
      <div style={box({ left: -400, top: OFFICE.floorY, width: 3000, height: 700, background: "linear-gradient(180deg, #D9DEE6, #C9D0DA)" })} />
      <div style={box({ left: -400, top: OFFICE.floorY, width: 3000, height: 8, backgroundColor: "#B9C1CD" })} />
    </>
  );
};

// Спинка офисного кресла (за сидящим).
export const OfficeChair: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <div style={box({ left: x - 120 * s, top: OFFICE.seatY - 640 * s, width: 240 * s, height: 640 * s })}>
    <div style={box({ left: 20 * s, top: 0, width: 200 * s, height: 300 * s, borderRadius: 50 * s, backgroundColor: "#2B3242" })} />
    <div style={box({ left: 108 * s, top: 290 * s, width: 24 * s, height: 300 * s, backgroundColor: "#4A5263" })} />
  </div>
);

// Стол папы: столешница поверх тел сидящих, тумба до пола.
export const DeskFront: React.FC = () => {
  const d = OFFICE.desk;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: d.x - 10, top: d.top - 4, width: d.w + 20, height: d.front - d.top + 8, borderRadius: 10, backgroundColor: "#FFFFFF", boxShadow: "0 4px 0 #D5DAE2" })} />
      <div style={box({ left: d.x + 10, top: d.front, width: d.w - 20, height: d.bottom - d.front - 60, backgroundColor: "#E7EAF0", borderRadius: "0 0 10px 10px" })} />
      <div style={box({ left: d.x + 10, top: d.front + 20, width: d.w - 20, height: 14, backgroundColor: "#FFC90E", opacity: 0.8 })} />
    </div>
  );
};

// Монитор (вид сбоку-сзади): экран повёрнут к папе.
export const MonitorBack: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const m = OFFICE.monitor;
  return (
    <>
      <div style={box({ left: m.x - 10, top: m.y - 200, width: 20, height: 200, backgroundColor: "#8C94A3" })} />
      <div style={box({ left: m.x - 60, top: m.y - 14, width: 120, height: 16, borderRadius: 6, backgroundColor: "#8C94A3" })} />
      <div style={box({ left: m.x - 100, top: m.y - 380, width: 200, height: 190, borderRadius: 12, backgroundColor: "#3A4150", transform: "skewY(-8deg)" })} />
      <div style={box({ left: m.x - 112, top: m.y - 372, width: 16, height: 180, borderRadius: 5, backgroundColor: `rgba(170,210,250,${0.7 * glow})`, transform: "skewY(-8deg)" })} />
    </>
  );
};

// Папка с материалами на столе (раскрыта на open).
export const Folder: React.FC<{ x: number; y: number; open?: number }> = ({ x, y, open = 1 }) => (
  <>
    <div style={box({ left: x - 110, top: y - 14, width: 220, height: 18, borderRadius: 4, backgroundColor: "#2F4A7A" })} />
    <div style={box({ left: x - 104, top: y - 20 - 8 * open, width: 208, height: 10, borderRadius: 3, backgroundColor: "#FFFFFF", boxShadow: "0 2px 3px rgba(0,0,0,0.12)" })} />
  </>
);

// Планшет на подставке (экран к зрителю), светится.
export const TabletOnDesk: React.FC<{ x: number; y: number; glow?: number; children?: React.ReactNode }> = ({ x, y, glow = 1, children }) => (
  <>
    <div style={box({ left: x - 20, top: y - 50, width: 40, height: 50, backgroundColor: "#8C94A3" })} />
    <div style={box({ left: x - 120, top: y - 230, width: 240, height: 180, borderRadius: 14, backgroundColor: "#1E2235", padding: 8, boxSizing: "border-box", rotate: "-4deg" })}>
      <div style={{ width: "100%", height: "100%", borderRadius: 8, overflow: "hidden", backgroundColor: glow > 0 ? "#FFFFFF" : "#2B3242", position: "relative" }}>{children}</div>
    </div>
  </>
);
