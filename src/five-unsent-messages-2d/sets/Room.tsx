// Детская комната сына (суббота, совместное прослушивание, будничные
// записи), коридор у её двери и рабочий кабинет отца. Мир — px; пол
// (низ стены) — y = 1500; ступни сидящих — y = 1540; столешница письменного
// стола — на высоте общего стола (HOME.table.top), чтобы работали общие
// помощники посадки и рук.
import { box } from "../shots";
import { HOME } from "./Home";
import { Mountains, WallClock } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

const TOP = HOME.table.top;

export const ROOM = {
  floorY: 1500,
  seatY: HOME.seatY,
  door: { x: 60, y: 560, w: 260, h: 940 },
  window: { x: 1120, y: 420, w: 420, h: 520 },
  desk: { x: 340, w: 640, top: TOP, front: TOP + 26, bottom: 1560 },
  boy: 640, // x сидящего сына
  stool: 1090, // x табурета, куда присаживается отец
  phone: { x: 800, y: TOP + 18 }, // телефон сына на столе
  dadPhone: { x: 925, y: TOP + 20 }, // рабочий телефон отца экраном вниз
  lamp: { x: 370 },
} as const;

// Стена, дверь (открыта в коридор), окно, полка с книгами, рисунки.
export const RoomBack: React.FC<{ readonly evening?: number }> = ({ evening = 0 }) => {
  const d = ROOM.door;
  const w = ROOM.window;
  const wall = evening > 0.5 ? "#C9D5D8" : "#DCE8EA";
  return (
    <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
      <div style={box({ left: -400, top: 0, width: 2800, height: ROOM.floorY, backgroundColor: wall })} />
      <div style={box({ left: -400, top: ROOM.floorY - 30, width: 2800, height: 30, backgroundColor: "#B9C7CC" })} />
      <div style={box({ left: -400, top: ROOM.floorY, width: 2800, height: 1100, backgroundColor: "#C7A983" })} />
      <div style={box({ left: -400, top: ROOM.floorY, width: 2800, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 3px, transparent 3px 160px)" })} />
      {/* дверь в коридор: открыта */}
      <div style={box({ left: d.x - 18, top: d.y - 18, width: d.w + 36, height: d.h + 18, backgroundColor: "#F4F1EA" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#E8DCC8" })} />
      <div style={box({ left: d.x, top: d.y, width: 60, height: d.h, backgroundColor: "#B7946F" })} />
      {/* окно: двор */}
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, borderRadius: 10, overflow: "hidden", background: evening > 0.5 ? "linear-gradient(180deg, #2B3963, #8D6E78)" : "linear-gradient(180deg, #CFE4F4, #F4E8D6)", border: "14px solid #FBF7F0", boxSizing: "border-box" })}>
        <div style={box({ left: -w.x, top: -w.y })}>
          {evening > 0.5 ? null : <Mountains x={w.x - 60} y={w.y + 60} w={w.w + 120} h={150} />}
          <PanelHouse x={w.x - 60} y={w.y + 470} w={300} floors={3} color={evening > 0.5 ? "#3A3F62" : "#E6D3C0"} seed={4} />
          <Tree x={w.x + 320} y={w.y + 520} s={0.7} kind="poplar" tone={evening > 0.5 ? 1 : 0} />
        </div>
        <div style={box({ left: w.w / 2 - 20, top: 0, width: 12, height: w.h, backgroundColor: "#FBF7F0" })} />
      </div>
      <div style={box({ left: w.x - 24, top: w.y + w.h - 6, width: w.w + 48, height: 22, borderRadius: 6, backgroundColor: "#FBF7F0" })} />
      {/* полка с книгами над столом */}
      <div style={box({ left: 420, top: 700, width: 420, height: 18, borderRadius: 4, backgroundColor: "#9A7353" })} />
      {["#3E6FB0", "#E0A43A", "#4E9A6B", "#C2574A", "#7B6BB5", "#3E6FB0", "#E0A43A"].map((c, i) => (
        <div key={i} style={box({ left: 440 + i * 46, top: 700 - (96 + (i % 3) * 12), width: 36, height: 96 + (i % 3) * 12, borderRadius: 4, backgroundColor: c })} />
      ))}
      {/* рисунки сына на стене */}
      <div style={box({ left: 880, top: 560, width: 150, height: 120, backgroundColor: "#FFFDF6", rotate: "3deg", border: "6px solid #E9E1D2", boxSizing: "border-box" })}>
        <div style={box({ left: 20, top: 26, width: 50, height: 50, borderRadius: 25, backgroundColor: "#FFD33D" })} />
        <div style={box({ left: 10, top: 74, width: 120, height: 22, borderRadius: "40px 40px 0 0", backgroundColor: "#7FAF63" })} />
      </div>
      <WallClock x={1700} y={560} r={58} minutes={evening > 0.5 ? 19 * 60 + 10 : 11 * 60 + 20} />
      {/* кровать справа (край) */}
      <div style={box({ left: 1560, top: 1170, width: 600, height: 120, borderRadius: 20, backgroundColor: "#6E8FB8" })} />
      <div style={box({ left: 1560, top: 1260, width: 600, height: 240, backgroundColor: "#5A7AA0" })} />
      <div style={box({ left: 1600, top: 1110, width: 200, height: 90, borderRadius: 30, backgroundColor: "#F4F1EA" })} />
    </div>
  );
};

// Передняя часть стола (поверх тел сидящих) и вещи на нём: лампа, стопка
// книг, тетрадь. Телефоны рисуются отдельно.
export const DeskFront: React.FC<{ readonly evening?: number; readonly lampOn?: number }> = ({ evening = 0, lampOn = 0 }) => {
  const k = ROOM.desk;
  return (
    <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
      {/* лампа */}
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <ellipse cx={ROOM.lamp.x} cy={k.top + 4} rx={44} ry={10} fill="#4A5163" />
        <path d={`M ${ROOM.lamp.x} ${k.top} L ${ROOM.lamp.x + 20} ${k.top - 170} L ${ROOM.lamp.x + 90} ${k.top - 220}`} stroke="#4A5163" strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d={`M ${ROOM.lamp.x + 60} ${k.top - 250} L ${ROOM.lamp.x + 150} ${k.top - 190} L ${ROOM.lamp.x + 104} ${k.top - 150} Z`} fill="#3E9C6B" />
        {lampOn > 0 ? <path d={`M ${ROOM.lamp.x + 125} ${k.top - 170} L ${ROOM.lamp.x + 240} ${k.top} L ${ROOM.lamp.x + 30} ${k.top} Z`} fill={`rgba(255,226,150,${0.22 * lampOn})`} /> : null}
      </svg>
      {/* стопка книг и тетрадь */}
      <div style={box({ left: 470, top: k.top - 46, width: 120, height: 22, borderRadius: 4, backgroundColor: "#C2574A" })} />
      <div style={box({ left: 476, top: k.top - 26, width: 110, height: 24, borderRadius: 4, backgroundColor: "#3E6FB0" })} />
      <div style={box({ left: 600, top: k.top - 6, width: 70, height: 10, borderRadius: 2, backgroundColor: "#FFFDF6", rotate: "-4deg" })} />
      {/* столешница и передняя панель */}
      <div style={box({ left: k.x - 10, top: k.top - 4, width: k.w + 20, height: k.front - k.top + 8, borderRadius: 8, backgroundColor: evening > 0.5 ? "#C79E72" : "#D9B488" })} />
      <div style={box({ left: k.x, top: k.front, width: k.w, height: k.bottom - k.front - 30, backgroundColor: evening > 0.5 ? "#B88D60" : "#C9A276", borderRadius: "0 0 10px 10px" })} />
      <div style={box({ left: k.x + 40, top: k.front + 40, width: k.w - 80, height: 70, borderRadius: 8, border: "5px solid rgba(0,0,0,0.08)", boxSizing: "border-box" })} />
      <div style={box({ left: k.x + k.w / 2 - 30, top: k.front + 68, width: 60, height: 12, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.18)" })} />
    </div>
  );
};

// Табурет у стола (для отца) — сиденье ниже стула.
export const Stool: React.FC<{ x: number }> = ({ x }) => (
  <div style={box({ left: x - 90, top: ROOM.seatY - 220, width: 180, height: 220 })}>
    <div style={box({ left: 0, top: 0, width: 180, height: 26, borderRadius: 12, backgroundColor: "#8A6A4E" })} />
    <div style={box({ left: 20, top: 20, width: 18, height: 200, backgroundColor: "#7A5A44" })} />
    <div style={box({ left: 142, top: 20, width: 18, height: 200, backgroundColor: "#7A5A44" })} />
  </div>
);

// Стул сына с подушкой (спинка — до персонажа): сидит выше, виден по грудь.
export const BOY_BOOST = 80;
export const KidChair: React.FC<{ x: number }> = ({ x }) => (
  <div style={box({ left: x - 80, top: ROOM.seatY - 470, width: 160, height: 470 })}>
    <div style={box({ left: 6, top: 0, width: 148, height: 40, borderRadius: 14, backgroundColor: "#4E9A6B" })} />
    <div style={box({ left: 14, top: 30, width: 20, height: 440, backgroundColor: "#3F7F58" })} />
    <div style={box({ left: 126, top: 30, width: 20, height: 440, backgroundColor: "#3F7F58" })} />
  </div>
);

// Телефон, лежащий на столе: вид сверху-сбоку; caseColor — чехол.
// screen: 0 — тёмный, 1 — светится; faceDown — экраном вниз.
export const PhoneOnDesk: React.FC<{ x: number; y: number; caseColor: string; screen?: number; faceDown?: boolean; rot?: number; s?: number }> = ({ x, y, caseColor, screen = 0, faceDown = false, rot = 0, s = 1 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-56} y={-14} width={112} height={18} rx={8} fill={caseColor} />
      {faceDown ? <rect x={-50} y={-16} width={100} height={6} rx={3} fill="rgba(0,0,0,0.25)" /> : <rect x={-50} y={-17} width={100} height={7} rx={3} fill={screen > 0 ? `rgba(170,215,255,${0.5 + 0.5 * screen})` : "#1C2638"} />}
    </g>
  </svg>
);

// Коридор у двери детской: стена, открытая дверь, свет из комнаты.
export const Corridor: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
    <div style={box({ left: -400, top: 0, width: 3000, height: 1500, backgroundColor: "#EFE3D0" })} />
    <div style={box({ left: -400, top: 1180, width: 3000, height: 320, backgroundColor: "#E6D5BE" })} />
    <div style={box({ left: -400, top: 1500, width: 3000, height: 1100, backgroundColor: "#B9976F" })} />
    {/* картины */}
    <div style={box({ left: 1300, top: 640, width: 200, height: 150, backgroundColor: "#7FA7C9", border: "10px solid #FBF7F0", boxSizing: "border-box" })} />
    <div style={box({ left: 1560, top: 600, width: 140, height: 190, backgroundColor: "#D98E6A", border: "10px solid #FBF7F0", boxSizing: "border-box" })} />
    {/* дверь детской: открыта, видна часть комнаты */}
    <div style={box({ left: 520 - 18, top: 560 - 18, width: 300, height: 958, backgroundColor: "#FBF7F0" })} />
    <div style={box({ left: 520, top: 560, width: 264, height: 940, overflow: "hidden", backgroundColor: "#DCE8EA" })}>
      <div style={box({ left: 30, top: 640, width: 260, height: 300, backgroundColor: "#C9A276" })} />
      <div style={box({ left: 40, top: 300, width: 200, height: 260, background: "radial-gradient(circle at 60% 60%, rgba(255,226,150,0.6), transparent 70%)" })} />
      <div style={box({ left: 0, top: 940 - 60, width: 264, height: 60, backgroundColor: "#C7A983" })} />
    </div>
    <div style={box({ left: 784, top: 560, width: 60, height: 940, backgroundColor: "#B7946F", transform: "skewY(-8deg)", transformOrigin: "0 0" })} />
  </div>
);

// Кабинет отдела продаж: стена, окно с городом, стеклянная перегородка,
// стол (передняя панель — поверх сидящего), ноутбук задней крышкой к нам.
export const OfficeBack: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
    <div style={box({ left: -400, top: 0, width: 2800, height: 1500, background: "linear-gradient(180deg, #DDE4EC, #E9EDF2)" })} />
    <div style={box({ left: 180, top: 380, width: 620, height: 560, borderRadius: 8, overflow: "hidden", background: "linear-gradient(180deg, #BFD6EA, #E8EEF3)", border: "14px solid #B6C2D0", boxSizing: "border-box" })}>
      <div style={box({ left: -180, top: -380 })}>
        <Mountains x={150} y={470} w={700} h={140} />
        <PanelHouse x={200} y={900} w={260} floors={4} color="#D9CBB9" seed={2} />
        <PanelHouse x={500} y={920} w={280} floors={3} color="#CFC2B4" seed={5} />
      </div>
    </div>
    <div style={box({ left: 1000, top: 360, width: 700, height: 1140, backgroundColor: "rgba(170,200,225,0.35)", border: "10px solid #B6C2D0", boxSizing: "border-box" })} />
    <div style={box({ left: 1080, top: 520, width: 520, height: 260, borderRadius: 10, backgroundColor: "#FFFFFF", border: "6px solid #B6C2D0", boxSizing: "border-box" })}>
      {/* доска плана продаж: столбики без чисел */}
      {[0.5, 0.7, 0.45, 0.85, 0.6].map((v, i) => (
        <div key={i} style={box({ left: 40 + i * 90, bottom: 30, width: 50, height: 180 * v, borderRadius: 6, backgroundColor: i === 3 ? "#3E8E5E" : "#7FA7C9" })} />
      ))}
    </div>
    <div style={box({ left: -400, top: 1500, width: 2800, height: 1100, backgroundColor: "#AEB8C4" })} />
  </div>
);

export const OfficeDesk: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
    {/* ноутбук: задняя крышка к зрителю */}
    <div style={box({ left: 780, top: TOP - 250, width: 360, height: 240, borderRadius: 14, backgroundColor: "#AEB6C4" })} />
    <div style={box({ left: 930, top: TOP - 150, width: 60, height: 40, borderRadius: 20, backgroundColor: "#C7CDD6" })} />
    <div style={box({ left: 300, top: TOP - 4, width: 1300, height: 34, borderRadius: 8, backgroundColor: "#5C6678" })} />
    <div style={box({ left: 320, top: TOP + 30, width: 1260, height: 300, backgroundColor: "#4A5263" })} />
    {/* кружка */}
    <div style={box({ left: 1240, top: TOP - 70, width: 56, height: 66, borderRadius: "8px 8px 14px 14px", backgroundColor: "#FFFFFF" })} />
  </div>
);

