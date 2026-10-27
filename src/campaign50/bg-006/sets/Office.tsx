// Переговорная бишкекского офиса: слева большое окно (горы Ала-Тоо,
// панельные дома, тополя), на стене часы, справа — настенный экран с
// презентацией мамы. Коллеги сидят за длинным столом лицом к камере.
// Мир — px; пол (низ стены) — y = 1500; сидящие стоят ступнями на y = 1540.
// Координаты одинаковы во всех офисных планах (предметы не «прыгают»).
import { box } from "../shots";
import { Mountains, PanelHouse, Tree, WallClock } from "./City";

const TOP = 1240; // столешница

export const OFFICE = {
  floorY: 1500,
  seatY: 1540,
  window: { x: 90, y: 330, w: 720, h: 780 },
  clock: { x: 1010, y: 470, r: 62 },
  screen: { x: 1460, y: 380, w: 600, h: 338 },
  table: { x: 400, top: TOP, w: 960, front: TOP + 28, bottom: 1560 },
  // места за столом (x центра сидящего)
  seat: { b: 660, colleague: 900, c: 1140 },
  mom: { x: 1400, y: 1600 }, // мама стоит у экрана
  plant: { x: 2140, y: 1500 },
} as const;

export const seatH = (h: number) => 0.27 * h;

export const OfficeBack: React.FC<{ readonly minutes: number }> = ({ minutes }) => {
  const w = OFFICE.window;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: -600, top: -900, width: 3400, height: OFFICE.floorY + 900, backgroundColor: "#EEF0F2" })} />
      {/* потолок с лампами */}
      <div style={box({ left: -600, top: -900, width: 3400, height: 980, backgroundColor: "#F7F8F9" })} />
      {[300, 1000, 1700].map((x) => (
        <div key={x} style={box({ left: x - 160, top: 60, width: 320, height: 26, borderRadius: 8, backgroundColor: "#FFFDF4", boxShadow: "0 18px 50px rgba(255,236,170,0.65)" })} />
      ))}
      {/* стеновая панель снизу */}
      <div style={box({ left: -600, top: 1150, width: 3400, height: OFFICE.floorY - 1150, backgroundColor: "#DDE3EA" })} />
      <div style={box({ left: -600, top: 1146, width: 3400, height: 8, backgroundColor: "#C9D1DB" })} />
      {/* окно: Бишкек днём */}
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, borderRadius: 10, overflow: "hidden", background: "linear-gradient(180deg, #BFDDF3, #E9F1F6 60%, #F6EBDA)", border: "18px solid #FBFCFD", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(40,60,90,0.12)" })}>
        <div style={box({ left: -w.x, top: -w.y })}>
          <Mountains x={w.x - 80} y={w.y + 70} w={w.w + 160} h={200} />
          <PanelHouse x={w.x - 60} y={w.y + 690} w={330} floors={3} color="#E6D3C0" seed={3} />
          <PanelHouse x={w.x + 300} y={w.y + 720} w={300} floors={3} color="#DCCDBB" seed={7} />
          <PanelHouse x={w.x + 560} y={w.y + 700} w={260} floors={3} color="#E3D8CB" seed={5} />
          <Tree x={w.x + 280} y={w.y + 800} s={0.8} kind="poplar" />
          <Tree x={w.x + 560} y={w.y + 820} s={0.7} kind="poplar" />
        </div>
        <div style={box({ left: w.w / 2 - 27, top: 0, width: 18, height: w.h, backgroundColor: "#FBFCFD" })} />
        <div style={box({ left: 0, top: w.h * 0.42, width: w.w, height: 14, backgroundColor: "#FBFCFD" })} />
      </div>
      {/* жалюзи-валик над окном */}
      <div style={box({ left: w.x - 20, top: w.y - 40, width: w.w + 40, height: 44, borderRadius: 8, backgroundColor: "#D5DBE2" })} />
      <WallClock x={OFFICE.clock.x} y={OFFICE.clock.y} r={OFFICE.clock.r} minutes={minutes} />
      {/* доска с заметками */}
      <div style={box({ left: 920, top: 640, width: 200, height: 260, borderRadius: 8, backgroundColor: "#FFFFFF", border: "6px solid #C9D1DB" })}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={box({ left: 24 + (i % 2) * 70, top: 26 + i * 70, width: 70, height: 56, rotate: `${(i - 1) * 4}deg`, backgroundColor: ["#FFE58A", "#BFE3F7", "#FFD1B8"][i] })} />
        ))}
      </div>
      {/* плинтус и пол */}
      <div style={box({ left: -600, top: OFFICE.floorY - 16, width: 3400, height: 16, backgroundColor: "#C3CAD3" })} />
      <div style={box({ left: -600, top: OFFICE.floorY, width: 3400, height: 1600, background: "linear-gradient(180deg, #B9C1CA, #A9B2BC)" })} />
      <div style={box({ left: -600, top: OFFICE.floorY, width: 3400, height: 1600, backgroundImage: "repeating-linear-gradient(90deg, rgba(60,70,90,0.08) 0 2px, transparent 2px 180px)" })} />
      {/* растение у стены */}
      <div style={box({ left: OFFICE.plant.x - 70, top: OFFICE.plant.y - 160, width: 140, height: 160, borderRadius: "10px 10px 24px 24px", backgroundColor: "#F4F1EA" })} />
      <svg width={360} height={420} viewBox="-180 -420 360 420" style={box({ left: OFFICE.plant.x - 180, top: OFFICE.plant.y - 150 - 420, overflow: "visible" })}>
        {[-60, -30, 0, 25, 55].map((a, i) => (
          <ellipse key={i} cx={0} cy={-200} rx={34} ry={200} fill={i % 2 ? "#5D8C4E" : "#7FAF63"} transform={`rotate(${a} 0 0)`} />
        ))}
      </svg>
    </div>
  );
};

// Настенный экран: рамка и содержимое (дети) — в координатах мира.
export const WallScreen: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const s = OFFICE.screen;
  return (
    <>
      <div style={box({ left: s.x - 22, top: s.y - 22, width: s.w + 44, height: s.h + 44, borderRadius: 16, backgroundColor: "#2A2F3A", boxShadow: "0 24px 50px rgba(30,40,60,0.25)" })} />
      <div style={box({ left: s.x, top: s.y, width: s.w, height: s.h, overflow: "hidden", backgroundColor: "#FFFFFF" })}>{children}</div>
      <div style={box({ left: s.x + s.w / 2 - 70, top: s.y + s.h + 22, width: 140, height: 16, borderRadius: 8, backgroundColor: "#3A404C" })} />
    </>
  );
};

// Спинка офисного стула за сидящим (рисуется до персонажа).
export const OfficeChair: React.FC<{ x: number; h?: number }> = ({ x, h = 760 }) => {
  const s = h / 760;
  return (
    <div style={box({ left: x - 105 * s, top: OFFICE.seatY - 560 * s, width: 210 * s, height: 560 * s })}>
      <div style={box({ left: 10 * s, top: 0, width: 190 * s, height: 300 * s, borderRadius: 40 * s, backgroundColor: "#3D4556" })} />
      <div style={box({ left: 30 * s, top: 20 * s, width: 150 * s, height: 250 * s, borderRadius: 30 * s, backgroundColor: "#4A5367" })} />
      <div style={box({ left: 92 * s, top: 300 * s, width: 26 * s, height: 200 * s, backgroundColor: "#2E3442" })} />
    </div>
  );
};

// Стол переговорной: столешница поверх сидящих и передняя панель.
export const OfficeTable: React.FC = () => {
  const t = OFFICE.table;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: t.x - 10, top: t.top - 4, width: t.w + 20, height: t.front - t.top + 8, borderRadius: 10, backgroundColor: "#F7F4EE" })} />
      <div style={box({ left: t.x - 10, top: t.front, width: t.w + 20, height: 26, backgroundColor: "#D9D2C6" })} />
      <div style={box({ left: t.x + 40, top: t.front + 26, width: 34, height: t.bottom - t.front - 26, backgroundColor: "#8C95A3" })} />
      <div style={box({ left: t.x + t.w - 74, top: t.front + 26, width: 34, height: t.bottom - t.front - 26, backgroundColor: "#8C95A3" })} />
      <div style={box({ left: t.x + 40, top: t.front + 120, width: t.w - 80, height: 18, backgroundColor: "#A2AAB6" })} />
    </div>
  );
};

// Блокнот и ручка на столе (вид спереди-сверху).
export const Notepad: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = -4 }) => (
  <div style={box({ left: x - 60, top: y - 14, width: 120, height: 24, borderRadius: 4, backgroundColor: "#FFFFFF", rotate: `${rot}deg`, boxShadow: "0 3px 6px rgba(40,50,70,0.2)" })}>
    <div style={box({ left: 14, top: 8, width: 80, height: 4, backgroundColor: "#C9D3E3" })} />
    <div style={box({ left: 96, top: -6, width: 10, height: 34, borderRadius: 3, backgroundColor: "#2F4A7A", rotate: "30deg" })} />
  </div>
);

// Телефон на столе плашмя (экран может светиться).
export const PhoneOnTable: React.FC<{ x: number; y: number; glow?: number; shake?: number }> = ({ x, y, glow = 0, shake = 0 }) => (
  <div style={box({ left: x - 46 + shake, top: y - 10, width: 92, height: 18, borderRadius: 6, backgroundColor: "#1E2235", boxShadow: glow > 0 ? `0 -6px 26px rgba(255,214,90,${0.7 * glow})` : "0 3px 5px rgba(30,30,50,0.25)" })}>
    <div style={box({ left: 6, top: 3, width: 80, height: 6, borderRadius: 3, backgroundColor: glow > 0 ? `rgba(255,236,170,${glow})` : "#2E3448" })} />
  </div>
);
