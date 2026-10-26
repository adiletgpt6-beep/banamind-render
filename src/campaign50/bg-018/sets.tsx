// Декорации BG-018: офис папы (окно на Бишкек и горы), рабочий уголок мамы
// дома, комната сына. Мир каждой комнаты — px, пол y = FLOOR. Камера
// панели — точка мира в центре панели и масштаб.
import { Mountains, Ornament } from "../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Tree } from "../../two-schedules-2d/sets/Outdoor";
import { abs } from "./ui";

export const FLOOR = 1000;
export const ADULT_H = 760;
export const deskTop = (h = ADULT_H) => FLOOR - 0.395 * h;
export const seatHeight = (h = ADULT_H) => 0.27 * h;

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

// Панель кадра (часть экрана) со своим миром и камерой.
export const Panel: React.FC<{
  readonly top: number;
  readonly height: number;
  readonly left?: number;
  readonly width?: number;
  readonly cam: Cam;
  readonly radius?: number;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}> = ({ top, height, left = 0, width = 1080, cam, radius = 0, style, children }) => (
  <div style={abs({ left, top, width, height, overflow: "hidden", borderRadius: radius, ...style })}>
    <div
      style={abs({
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        transformOrigin: "0 0",
        transform: `translate(${width / 2 - cam.x * cam.zoom}px, ${height / 2 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
      })}
    >
      {children}
    </div>
  </div>
);

// Офис папы: светлая стена, большое окно на панельные дома и Ала-Тоо.
export const OfficeBack: React.FC<{ f: number }> = ({ f }) => (
  <div style={abs({ left: -400, top: -200, width: 1880, height: 1400 })}>
    <div style={abs({ left: 0, top: 0, width: 1880, height: 1400, background: "linear-gradient(180deg, #EEF2F7, #E2E8F0)" })} />
    {/* окно */}
    <div style={abs({ left: 560, top: 260, width: 960, height: 620, borderRadius: 10, overflow: "hidden", background: "linear-gradient(180deg, #CFE6F7 0%, #EAF3FA 70%)" })}>
      <Mountains x={-40} y={150} w={1060} h={220} />
      <div style={abs({ left: (f * 0.15) % 40, top: 0, width: 1, height: 1 })} />
      <PanelHouse x={20} y={660} w={360} floors={3} color="#E7DED2" seed={3} />
      <PanelHouse x={560} y={660} w={420} floors={3} color="#DCD3C8" seed={5} />
      <Tree x={460} y={640} s={0.9} kind="poplar" />
      <Tree x={980} y={650} s={0.7} kind="poplar" />
    </div>
    <div style={abs({ left: 548, top: 248, width: 984, height: 644, borderRadius: 14, border: "14px solid #FFFFFF", boxSizing: "border-box" })} />
    <div style={abs({ left: 1033, top: 262, width: 14, height: 620, background: "#FFFFFF" })} />
    {/* полка с папками */}
    <div style={abs({ left: 180, top: 420, width: 300, height: 14, background: "#C9D2DE" })} />
    {["#5C86D6", "#FFC72C", "#9DB2CC", "#5C86D6"].map((c, i) => (
      <div key={i} style={abs({ left: 200 + i * 52, top: 318, width: 40, height: 102, borderRadius: 4, background: c })} />
    ))}
    <div style={abs({ left: 0, top: 1200, width: 1880, height: 200, background: "#C9CFD9" })} />
  </div>
);

// Стол офиса (передний план): столешница и тумба.
export const OfficeDesk: React.FC<{ x: number; w?: number }> = ({ x, w = 820 }) => (
  <>
    <div style={abs({ left: x - w / 2, top: deskTop(), width: w, height: 26, borderRadius: 8, background: "#F5F7FA", boxShadow: "0 6px 0 #D5DCE6" })} />
    <div style={abs({ left: x - w / 2 + 20, top: deskTop() + 26, width: w - 40, height: FLOOR - deskTop() + 60, background: "linear-gradient(180deg, #DCE3EC, #CBD3DF)" })} />
  </>
);

// Офисное кресло (за сидящим).
export const OfficeChair: React.FC<{ x: number }> = ({ x }) => (
  <>
    <div style={abs({ left: x - 120, top: FLOOR - 600, width: 240, height: 330, borderRadius: "70px 70px 30px 30px", background: "#34405A" })} />
    <div style={abs({ left: x - 14, top: FLOOR - 270, width: 28, height: 200, background: "#2A3246" })} />
  </>
);

// Дом мамы: тёплая стена, полка с растением, ширдак-панно, светильник.
export const MomBack: React.FC<{ f: number }> = () => (
  <div style={abs({ left: -400, top: -200, width: 1880, height: 1400 })}>
    <div style={abs({ left: 0, top: 0, width: 1880, height: 1400, background: "linear-gradient(180deg, #FBF3E6, #F3E6D2)" })} />
    {/* окно со шторой */}
    <div style={abs({ left: 1180, top: 300, width: 420, height: 520, borderRadius: 8, overflow: "hidden", background: "linear-gradient(180deg, #D5E9F6, #F2F0E6)" })}>
      <Mountains x={-60} y={180} w={560} h={160} />
      <Tree x={150} y={560} s={0.9} />
    </div>
    <div style={abs({ left: 1168, top: 288, width: 444, height: 544, borderRadius: 12, border: "12px solid #FFFFFF", boxSizing: "border-box" })} />
    <div style={abs({ left: 1110, top: 250, width: 110, height: 640, borderRadius: 30, background: "#F2B36B" })} />
    {/* панно с орнаментом */}
    <svg width={260} height={260} viewBox="-130 -130 260 260" style={abs({ left: 520, top: 300 })}>
      <rect x={-120} y={-120} width={240} height={240} rx={24} fill="#C8483D" />
      <rect x={-104} y={-104} width={208} height={208} rx={18} fill="none" stroke="#F6E6C8" strokeWidth={5} strokeDasharray="18 9" />
      <Ornament x={0} y={0} s={1.25} color="#F6E6C8" />
    </svg>
    {/* полка с растением и книгами */}
    <div style={abs({ left: 260, top: 520, width: 220, height: 14, background: "#C9A27A" })} />
    <div style={abs({ left: 290, top: 440, width: 70, height: 80, borderRadius: "10px 10px 22px 22px", background: "#E07A5F" })} />
    <div style={abs({ left: 270, top: 360, width: 110, height: 100, borderRadius: 60, background: "#7FAF63" })} />
    {["#5C86D6", "#FFC72C", "#5BB98B"].map((c, i) => (
      <div key={i} style={abs({ left: 390 + i * 26, top: 436, width: 22, height: 84, borderRadius: 3, background: c })} />
    ))}
    <div style={abs({ left: 0, top: 1200, width: 1880, height: 200, background: "#D9B98E" })} />
  </div>
);

// Деревянный стол мамы.
export const MomDesk: React.FC<{ x: number; w?: number }> = ({ x, w = 820 }) => (
  <>
    <div style={abs({ left: x - w / 2, top: deskTop(), width: w, height: 28, borderRadius: 8, background: "#D7A774", boxShadow: "0 6px 0 #B98953" })} />
    <div style={abs({ left: x - w / 2 + 30, top: deskTop() + 28, width: 30, height: FLOOR - deskTop() + 60, background: "#B98953" })} />
    <div style={abs({ left: x + w / 2 - 60, top: deskTop() + 28, width: 30, height: FLOOR - deskTop() + 60, background: "#B98953" })} />
  </>
);

export const WoodChair: React.FC<{ x: number }> = ({ x }) => (
  <>
    <div style={abs({ left: x - 110, top: FLOOR - 560, width: 220, height: 300, borderRadius: "40px 40px 12px 12px", background: "#A8774C" })} />
    <div style={abs({ left: x - 90, top: FLOOR - 530, width: 180, height: 240, borderRadius: "30px 30px 8px 8px", background: "#BE8B5C" })} />
  </>
);

// Комната сына: обои с горошком, кровать, полка, плакат с горами.
export const SonBack: React.FC = () => (
  <div style={abs({ left: -400, top: -200, width: 1880, height: 1400 })}>
    <div style={abs({ left: 0, top: 0, width: 1880, height: 1400, background: "#EAF4FB", backgroundImage: "radial-gradient(rgba(92,134,214,0.18) 6px, transparent 7px)", backgroundSize: "70px 70px" })} />
    <div style={abs({ left: 1040, top: 330, width: 300, height: 210, borderRadius: 14, background: "#FFFFFF", padding: 14, boxSizing: "border-box" })}>
      <Mountains x={14} y={40} w={272} h={150} />
    </div>
    <div style={abs({ left: 220, top: 760, width: 560, height: 260, borderRadius: 30, background: "#7FA6E0" })} />
    <div style={abs({ left: 240, top: 720, width: 200, height: 90, borderRadius: 40, background: "#FFFFFF" })} />
    <div style={abs({ left: 1180, top: 640, width: 260, height: 14, background: "#C9A27A" })} />
    {["#E07A5F", "#FFC72C", "#5BB98B", "#5C86D6"].map((c, i) => (
      <div key={i} style={abs({ left: 1200 + i * 30, top: 560, width: 26, height: 80, borderRadius: 3, background: c })} />
    ))}
    <div style={abs({ left: 0, top: 1200, width: 1880, height: 200, background: "#C7B08C" })} />
  </div>
);

// Рюкзак сына, стоящий открытым (вид спереди).
export const OpenBackpack: React.FC<{ x: number; y: number; s?: number; open?: number }> = ({ x, y, s = 1, open = 1 }) => (
  <svg width={1} height={1} style={abs({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={100} ry={12} fill="rgba(20,25,40,0.18)" />
      <rect x={-90} y={-200} width={180} height={200} rx={40} fill="#3E8E5E" />
      <rect x={-60} y={-90} width={120} height={70} rx={16} fill="#357A51" />
      <rect x={-90} y={-206 - 30 * open} width={180} height={40} rx={20} fill="#46A06A" transform={`rotate(${-8 * open} 90 ${-206})`} />
      <rect x={-20} y={-80} width={40} height={10} rx={5} fill={"#FFC72C"} />
    </g>
  </svg>
);
