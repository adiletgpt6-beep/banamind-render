// Гостиная вечером: тёплый свет торшера, диван с подушкой в орнаменте,
// тушкийиз (вышитое панно) на стене, журнальный столик, ковёр, окно с
// вечерним городом и горами.
import { box } from "../shots";
import { Mountains, Ornament } from "./Apartment";

export const LIVING = {
  floorY: 1520,
  sofa: { x: 230, y: 1300, w: 980 }, // верх подушек сиденья — y + 110
  seatTop: 1420,
  table: { x: 420, y: 1640, w: 640 }, // столешница
  phone: { x: 712, y: 1404 }, // телефон папы на диване между родителями
  momPhone: { x: 1030, y: 1404 }, // телефон мамы на диване справа от неё
  notebook: { x: 800, y: 1622 },
  pack: { x: 980, y: 1560 }, // рюкзак на столике (открыт)
} as const;

export const LivingRoom: React.FC<{ readonly phoneOnTable?: boolean; readonly momPhone?: boolean }> = ({ phoneOnTable = true, momPhone = false }) => (
  <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
    <div style={box({ left: -200, top: 0, width: 2400, height: LIVING.floorY, background: "linear-gradient(180deg, #E9D2B6, #F1DFC6)" })} />
    {/* окно: вечерний город и горы */}
    <div style={box({ left: 1260, top: 420, width: 520, height: 700, borderRadius: 12, overflow: "hidden", background: "linear-gradient(180deg, #24305A, #4C4F7A 70%, #C98B6A)", border: "14px solid #F8EFE2", boxSizing: "border-box" })}>
      <Mountains x={-30} y={300} w={560} h={170} evening={1} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={box({ left: i * 140 - 10, top: 430 + (i % 2) * 40, width: 110, height: 300, backgroundColor: "#2E3456" })}>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <div key={k} style={box({ left: 16 + (k % 2) * 46, top: 20 + Math.floor(k / 2) * 50, width: 26, height: 26, backgroundColor: (i + k) % 3 ? "#F6D48A" : "#4A5078" })} />
          ))}
        </div>
      ))}
      <div style={box({ left: 240, top: 0, width: 12, height: 700, backgroundColor: "#F8EFE2" })} />
    </div>
    {/* шторы */}
    <div style={box({ left: 1200, top: 380, width: 110, height: 820, borderRadius: "0 0 30px 30px", backgroundColor: "#C77B58" })} />
    <div style={box({ left: 1730, top: 380, width: 110, height: 820, borderRadius: "0 0 30px 30px", backgroundColor: "#C77B58" })} />
    {/* тушкийиз — вышитое панно с орнаментом */}
    <div style={box({ left: 340, top: 480, width: 760, height: 380, borderRadius: 18, backgroundColor: "#7E2B2F", border: "10px solid #C9A043", boxSizing: "border-box" })}>
      <svg width={740} height={360} viewBox="0 0 740 360" style={box({ left: 0, top: 0 })}>
        <Ornament x={370} y={180} s={1.5} color="#F1D58C" />
        <Ornament x={150} y={180} s={0.95} color="#E8A0A0" />
        <Ornament x={590} y={180} s={0.95} color="#E8A0A0" />
        {[60, 680].map((x) => (
          <g key={x}>
            <circle cx={x} cy={80} r={22} fill="#E8A0A0" />
            <circle cx={x} cy={280} r={22} fill="#9CCB8E" />
          </g>
        ))}
      </svg>
    </div>
    {/* торшер */}
    <div style={box({ left: 90, top: 620, width: 200, height: 160, borderRadius: "40px 40px 10px 10px", backgroundColor: "#F7E3B5" })} />
    <div style={box({ left: 182, top: 780, width: 16, height: 740, backgroundColor: "#5B4636" })} />
    <div style={box({ left: 130, top: 1500, width: 120, height: 24, borderRadius: 12, backgroundColor: "#5B4636" })} />
    {/* пол и ковёр */}
    <div style={box({ left: -200, top: LIVING.floorY, width: 2400, height: 1100, background: "linear-gradient(180deg, #A97E5C, #96694A)" })} />
    <div style={box({ left: 120, top: 1760, width: 1300, height: 420, borderRadius: 20, backgroundColor: "#9E3B36", border: "16px solid #E1C38A", boxSizing: "border-box" })} />
    {/* диван */}
    <div style={box({ left: LIVING.sofa.x, top: LIVING.sofa.y - 300, width: LIVING.sofa.w, height: 330, borderRadius: "70px 70px 20px 20px", backgroundColor: "#4F6F8F" })} />
    <div style={box({ left: LIVING.sofa.x - 60, top: LIVING.sofa.y - 120, width: 120, height: 400, borderRadius: 50, backgroundColor: "#46647F" })} />
    <div style={box({ left: LIVING.sofa.x + LIVING.sofa.w - 60, top: LIVING.sofa.y - 120, width: 120, height: 400, borderRadius: 50, backgroundColor: "#46647F" })} />
    <div style={box({ left: LIVING.sofa.x, top: LIVING.seatTop - 12, width: LIVING.sofa.w, height: 120, borderRadius: 30, backgroundColor: "#5A7C9E" })} />
    <div style={box({ left: LIVING.sofa.x + 10, top: LIVING.seatTop + 100, width: LIVING.sofa.w - 20, height: 150, borderRadius: "10px 10px 20px 20px", backgroundColor: "#46647F" })} />
    {phoneOnTable ? <div style={box({ left: LIVING.phone.x - 30, top: LIVING.phone.y - 10, width: 60, height: 20, borderRadius: 6, backgroundColor: "#1E2235" })} /> : null}
    {momPhone ? <div style={box({ left: LIVING.momPhone.x - 30, top: LIVING.momPhone.y - 10, width: 60, height: 20, borderRadius: 6, backgroundColor: "#2B2F45" })} /> : null}
    {/* подушка с орнаментом */}
    <div style={box({ left: LIVING.sofa.x + 40, top: LIVING.sofa.y - 220, width: 190, height: 170, borderRadius: 30, backgroundColor: "#E8C26A", rotate: "-8deg" })}>
      <svg width={190} height={170} viewBox="0 0 190 170" style={box({ left: 0, top: 0 })}>
        <Ornament x={95} y={85} s={0.75} color="#7E2B2F" />
      </svg>
    </div>
  </div>
);

// Журнальный столик (на переднем плане).
export const CoffeeTable: React.FC<{ notebook?: boolean; packOpen?: boolean }> = ({ notebook, packOpen = true }) => (
  <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
    {/* рюкзак дочки на столике, открыт */}
    <div style={box({ left: LIVING.pack.x - 90, top: LIVING.pack.y - 120, width: 180, height: 190, borderRadius: "50px 50px 26px 26px", backgroundColor: "#FFC90E" })} />
    <div style={box({ left: LIVING.pack.x - 60, top: LIVING.pack.y - 20, width: 120, height: 70, borderRadius: 18, backgroundColor: "#E5A800" })} />
    {packOpen ? <div style={box({ left: LIVING.pack.x - 70, top: LIVING.pack.y - 130, width: 140, height: 28, borderRadius: 14, backgroundColor: "#14285A" })} /> : null}
    <div style={box({ left: LIVING.table.x, top: LIVING.table.y, width: LIVING.table.w, height: 34, borderRadius: 12, backgroundColor: "#C79A6E" })} />
    <div style={box({ left: LIVING.table.x + 40, top: LIVING.table.y + 34, width: 22, height: 150, backgroundColor: "#A97D55" })} />
    <div style={box({ left: LIVING.table.x + LIVING.table.w - 62, top: LIVING.table.y + 34, width: 22, height: 150, backgroundColor: "#A97D55" })} />
    {/* пиалы и чайник — вечерний чай */}
    <div style={box({ left: LIVING.table.x + 40, top: LIVING.table.y - 56, width: 92, height: 60, borderRadius: "46px 46px 20px 20px", backgroundColor: "#FFFFFF" })} />
    <div style={box({ left: LIVING.table.x + 50, top: LIVING.table.y - 30, width: 72, height: 8, backgroundColor: "#2F62A8" })} />
    <div style={box({ left: LIVING.table.x + 150, top: LIVING.table.y - 26, width: 56, height: 28, borderRadius: "0 0 28px 28px", backgroundColor: "#FFFFFF" })} />
    {notebook ? <div style={box({ left: LIVING.notebook.x - 40, top: LIVING.notebook.y - 12, width: 80, height: 22, borderRadius: 4, backgroundColor: "#3E7CC0" })} /> : null}
  </div>
);

// Передняя стенка рюкзака ниже горловины — поверх руки дочки: то, что
// опускают в рюкзак, скрывается внутри (рисуется теми же цветами).
export const PackFront: React.FC = () => (
  <div style={box({ left: LIVING.pack.x - 90, top: LIVING.pack.y - 102, width: 180, height: 172, overflow: "hidden" })}>
    <div style={box({ left: 0, top: -18, width: 180, height: 190, borderRadius: "50px 50px 26px 26px", backgroundColor: "#FFC90E" })} />
    <div style={box({ left: 30, top: 82, width: 120, height: 70, borderRadius: 18, backgroundColor: "#E5A800" })} />
  </div>
);

// Тёплый вечерний свет торшера.
export const WarmLight: React.FC = () => (
  <div style={box({ left: -200, top: 0, width: 2400, height: 2600, background: "radial-gradient(circle at 10% 30%, rgba(255,200,120,0.32), transparent 55%)", pointerEvents: "none" })} />
);
