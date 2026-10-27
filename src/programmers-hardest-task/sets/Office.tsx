// Офисы родителей (вид спереди, сидящий за столом смотрит в камеру):
//   • папа — open space айти-компании: окно на Бишкек (дома, тополя,
//     горы), два монитора к нему (к камере — задние крышки), дверь справа;
//   • мама — переговорная зона: доска со стикерами, стеклянная перегородка,
//     ноутбук. Без вывесок и названий компаний.
// Пол — y = 1500, сидящие ступнями на y = 1540, столешница — y = 1240
// (те же правила посадки, что дома).
import { Mountains, WallClock } from "../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Tree } from "../../two-schedules-2d/sets/Outdoor";
import { box } from "../shots";

const TOP = 1240;

export const OFFICE = {
  floorY: 1500,
  seatY: 1540,
  desk: { x: 640, top: TOP, w: 880, front: TOP + 28, bottom: 1560 },
  seat: 1080, // x сидящего за столом
  door: { x: 1720, y: 560, w: 280, h: 940 },
  clock: { x: 1500, y: 470, r: 58 },
  board: { x: 380, y: 520, w: 560, h: 420 },
  laptop: { x: 1080, y: TOP + 14 },
  phone: { x: 1240, y: TOP + 22 },
  keys: { x: 880, y: TOP + 18 },
  monitorL: { x: 960, y: TOP + 8 },
  monitorR: { x: 1200, y: TOP + 8 },
} as const;

export const OfficeBack: React.FC<{ readonly who: "dad" | "mom"; readonly minutes: number; readonly evening?: number; readonly doorOpen?: number }> = ({ who, minutes, evening = 0, doorOpen = 0 }) => {
  const ev = evening > 0.5;
  const wall = who === "dad" ? "#EDF0F3" : "#F2EFEA";
  const d = OFFICE.door;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: -400, top: 0, width: 3000, height: OFFICE.floorY, backgroundColor: wall })} />
      {/* широкое окно на город */}
      <div style={box({ left: who === "dad" ? 120 : 1080, top: 320, width: who === "dad" ? 1380 : 560, height: 720, borderRadius: 8, overflow: "hidden", border: "16px solid #DCE2E8", boxSizing: "border-box", background: ev ? "linear-gradient(180deg, #2A3560, #6B5A7E 70%, #D99A6C)" : "linear-gradient(180deg, #C9E0F2, #EEF2F2)" })}>
        <div style={box({ left: who === "dad" ? -120 : -1080, top: -320 })}>
          <Mountains x={-200} y={420} w={2400} h={220} evening={evening} />
          <PanelHouse x={100} y={1080} w={420} floors={4} color={ev ? "#3A3F62" : "#E3D5C6"} seed={2} />
          <PanelHouse x={600} y={1100} w={460} floors={4} color={ev ? "#353A5C" : "#D9CFC2"} seed={5} />
          <PanelHouse x={1120} y={1080} w={420} floors={4} color={ev ? "#3A3F62" : "#E1D3C1"} seed={9} />
          <Tree x={560} y={1060} s={0.9} kind="poplar" tone={ev ? 1 : 0} />
          <Tree x={1080} y={1060} s={0.85} kind="poplar" tone={ev ? 1 : 0} />
        </div>
        {[0.33, 0.66].map((k) => (
          <div key={k} style={box({ left: `${k * 100}%`, top: 0, width: 12, height: "100%", backgroundColor: "#DCE2E8" })} />
        ))}
      </div>
      {who === "mom" ? <Whiteboard /> : null}
      {who === "mom" ? (
        // стеклянная перегородка переговорной
        <div style={box({ left: 300, top: 260, width: 10, height: 1240, backgroundColor: "#C9D3DE" })} />
      ) : null}
      <WallClock x={OFFICE.clock.x + (who === "mom" ? -600 : 0)} y={OFFICE.clock.y} r={OFFICE.clock.r} minutes={minutes} />
      {/* дверь (папа выходит из офиса) */}
      {who === "dad" ? (
        <>
          <div style={box({ left: d.x - 16, top: d.y - 16, width: d.w + 32, height: d.h + 16, backgroundColor: "#D3DAE2" })} />
          <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#5C6B80" })} />
          <div style={box({ left: d.x, top: d.y, width: d.w * (1 - 0.8 * doorOpen), height: d.h, backgroundColor: "#8796AB", boxShadow: "inset -10px 0 0 rgba(0,0,0,0.08)" })}>
            <div style={box({ right: 24, top: 470, width: 14, height: 70, borderRadius: 7, backgroundColor: "#D7DCE3", opacity: 1 - doorOpen })} />
          </div>
          {/* вешалка с курткой */}
          <div style={box({ left: d.x - 210, top: 700, width: 12, height: 800, backgroundColor: "#4A4E5C" })} />
          <div style={box({ left: d.x - 250, top: 690, width: 92, height: 14, borderRadius: 7, backgroundColor: "#4A4E5C" })} />
        </>
      ) : null}
      {/* растение */}
      <div style={box({ left: who === "dad" ? 300 : 1760, top: 1330, width: 120, height: 170, borderRadius: "10px 10px 26px 26px", backgroundColor: "#E7E2DA" })} />
      <div style={box({ left: who === "dad" ? 250 : 1710, top: 1120, width: 220, height: 240, borderRadius: 110, backgroundColor: "#6E9E5C" })} />
      <div style={box({ left: who === "dad" ? 290 : 1750, top: 1080, width: 150, height: 150, borderRadius: 75, backgroundColor: "#7FAF63" })} />
      {/* пол */}
      <div style={box({ left: -400, top: OFFICE.floorY, width: 3000, height: 1100, background: "linear-gradient(180deg, #C9CDD3, #B9BEC6)" })} />
      <div style={box({ left: -400, top: OFFICE.floorY, width: 3000, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(40,50,70,0.06) 0 2px, transparent 2px 220px)" })} />
    </div>
  );
};

// Доска со стикерами (мамин проект).
const Whiteboard: React.FC = () => {
  const b = OFFICE.board;
  const notes = ["#FFE59A", "#CFE3F5", "#D5EDD9", "#FFE59A", "#F6D3D0", "#CFE3F5", "#FFE59A"];
  return (
    <div style={box({ left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 12, backgroundColor: "#FFFFFF", border: "12px solid #C9D3DE", boxSizing: "border-box" })}>
      {[0, 1, 2].map((c) => (
        <div key={c} style={box({ left: 18 + c * 176, top: 18, width: 160, height: 20, borderRadius: 6, backgroundColor: "#DCE3EC" })} />
      ))}
      {notes.map((c, i) => (
        <div key={i} style={box({ left: 24 + (i % 3) * 176, top: 60 + Math.floor(i / 3) * 104, width: 120, height: 86, borderRadius: 6, backgroundColor: c, rotate: `${(i % 2 ? 1 : -1) * 3}deg`, boxShadow: "0 4px 8px rgba(20,36,59,0.12)" })} />
      ))}
    </div>
  );
};

// Рабочий стол: столешница поверх тел, передняя панель.
export const DeskFront: React.FC = () => {
  const t = OFFICE.desk;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: t.x - 10, top: t.top - 6, width: t.w + 20, height: t.front - t.top + 10, borderRadius: 8, backgroundColor: "#F4F5F7" })} />
      <div style={box({ left: t.x, top: t.front, width: t.w, height: t.bottom - t.front - 30, backgroundColor: "#D9DEE5", borderRadius: "0 0 10px 10px" })} />
      <div style={box({ left: t.x + 30, top: t.front + 40, width: t.w - 60, height: 8, borderRadius: 4, backgroundColor: "#C6CDD6" })} />
    </div>
  );
};

// Офисный стул (спинка за сидящим).
export const OfficeChair: React.FC<{ readonly x: number }> = ({ x }) => (
  <div style={box({ left: x - 105, top: OFFICE.seatY - 560, width: 210, height: 560 })}>
    <div style={box({ left: 10, top: 0, width: 190, height: 250, borderRadius: 40, backgroundColor: "#2E3646" })} />
    <div style={box({ left: 95, top: 240, width: 20, height: 280, backgroundColor: "#1F2531" })} />
  </div>
);

// Монитор спиной к камере (смотрит на сидящего).
export const MonitorBackSimple: React.FC<{ readonly x: number; readonly y: number; readonly w?: number }> = ({ x, y, w = 230 }) => (
  <div style={box({ left: x - w / 2, top: y - w * 0.95, width: w, height: w * 0.95 })}>
    <div style={box({ left: w * 0.43, top: w * 0.62, width: w * 0.14, height: w * 0.3, backgroundColor: "#4C5466" })} />
    <div style={box({ left: w * 0.27, top: w * 0.9, width: w * 0.46, height: w * 0.06, borderRadius: 6, backgroundColor: "#3C4252" })} />
    <div style={box({ left: 0, top: 0, width: w, height: w * 0.64, borderRadius: 10, backgroundColor: "#353C4C", boxShadow: "0 0 30px rgba(170,205,255,0.22)" })} />
  </div>
);
