// Офис в Бишкеке: светлая стена, большое окно на город (панельные дома,
// тополя, горы Ала-Тоо со снегом), стол мамы с ноутбуком, кружка, папки,
// доска с жёлтыми стикерами, часы на стене. Координаты мира — px;
// пол (низ стены) — y = 1500; ступни сидящей мамы — y = 1540.
import { box } from "../shots";
import { Mountains, WallClock } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

const TOP = 1232; // столешница

export const OFFICE = {
  floorY: 1500,
  seatY: 1540,
  window: { x: 110, y: 330, w: 640, h: 620 },
  board: { x: 790, y: 420, w: 250, h: 330 },
  clock: { x: 915, y: 860, r: 62 },
  desk: { x: 60, top: TOP, w: 960, front: TOP + 30, bottom: 1580 },
  seat: { mom: 430 },
  laptop: { x: 600, y: TOP + 14 },
  mug: { x: 790, y: TOP + 12 },
  phone: { x: 880, y: TOP + 18 },
  folders: { x: 180, y: TOP + 8 },
} as const;

export const seatH = (h: number) => 0.27 * h;

// Вид из окна: город днём (к вечеру — теплее).
const CityView: React.FC<{ w: number; h: number; warm: number }> = ({ w, h, warm }) => (
  <div style={box({ left: 0, top: 0, width: w, height: h, overflow: "hidden" })}>
    <div style={box({ left: 0, top: 0, width: w, height: h, background: `linear-gradient(180deg, ${warm > 0.5 ? "#CFE0F0" : "#BFDDF3"} 0%, #E6F0F6 60%, ${warm > 0.5 ? "#F8DDBE" : "#FBE7CF"} 100%)` })} />
    <Mountains x={-40} y={h * 0.18} w={w + 80} h={h * 0.42} />
    <div style={box({ left: 0, top: 0, width: w, height: h })}>
      <PanelHouse x={-30} y={h + 10} w={300} floors={4} color="#E9DCC9" seed={3} />
      <PanelHouse x={300} y={h + 30} w={260} floors={5} color="#DCE3E8" seed={5} />
      <PanelHouse x={560} y={h + 10} w={240} floors={3} color="#EADBCB" seed={8} />
      <Tree x={270} y={h + 40} s={0.75} kind="poplar" />
      <Tree x={560} y={h + 50} s={0.62} kind="poplar" tone={1} />
    </div>
  </div>
);

export const OfficeBack: React.FC<{ readonly minutes: number; readonly warm?: number }> = ({ minutes, warm = 0 }) => {
  const w = OFFICE.window;
  const b = OFFICE.board;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      {/* стена и пол */}
      <div style={box({ left: -600, top: -400, width: 2400, height: OFFICE.floorY + 400, backgroundColor: "#F6F7F9" })} />
      <div style={box({ left: -600, top: OFFICE.floorY, width: 2400, height: 1200, backgroundColor: "#DADFE6" })} />
      <div style={box({ left: -600, top: OFFICE.floorY - 14, width: 2400, height: 14, backgroundColor: "#C9D0DA" })} />
      {/* жёлтая полоса — фирменный акцент */}
      <div style={box({ left: -600, top: 1090, width: 2400, height: 16, backgroundColor: "#FFD23F", opacity: 0.85 })} />
      {/* окно */}
      <div style={box({ left: w.x - 18, top: w.y - 18, width: w.w + 36, height: w.h + 36, borderRadius: 14, backgroundColor: "#FFFFFF", boxShadow: "0 8px 22px rgba(20,30,60,0.10)" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, borderRadius: 6, overflow: "hidden" })}>
        <CityView w={w.w} h={w.h} warm={warm} />
      </div>
      <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x - 30, top: w.y + w.h + 14, width: w.w + 60, height: 22, borderRadius: 6, backgroundColor: "#FFFFFF", boxShadow: "0 4px 10px rgba(20,30,60,0.10)" })} />
      {/* жалюзи сверху */}
      <div style={box({ left: w.x - 10, top: w.y - 10, width: w.w + 20, height: 58, borderRadius: 8, backgroundImage: "repeating-linear-gradient(180deg, #E8ECF2 0 8px, #D6DCE5 8px 11px)" })} />
      {/* доска с жёлтыми стикерами */}
      <div style={box({ left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 14, backgroundColor: "#FFFFFF", border: "6px solid #D9DEE6", boxSizing: "border-box" })} />
      {[
        [24, 34, -4],
        [128, 30, 3],
        [30, 150, 2],
        [134, 160, -3],
      ].map(([x, y, r], i) => (
        <div key={i} style={box({ left: b.x + x, top: b.y + y, width: 86, height: 84, backgroundColor: i === 2 ? "#BFD7F2" : "#FFD23F", transform: `rotate(${r}deg)`, boxShadow: "0 3px 6px rgba(0,0,0,0.08)" })}>
          <div style={box({ left: 12, top: 22, width: 56, height: 6, borderRadius: 3, backgroundColor: "rgba(20,40,90,0.45)" })} />
          <div style={box({ left: 12, top: 40, width: 44, height: 6, borderRadius: 3, backgroundColor: "rgba(20,40,90,0.35)" })} />
        </div>
      ))}
      <WallClock x={OFFICE.clock.x} y={OFFICE.clock.y} r={OFFICE.clock.r} minutes={minutes} />
      {/* растение у окна */}
      <svg width={220} height={420} viewBox="-110 -420 220 420" style={box({ left: -40, top: OFFICE.floorY - 420 })}>
        <path d="M -60 -120 L 60 -120 L 46 0 L -46 0 Z" fill="#FFFFFF" stroke="#D5DBE4" strokeWidth={4} />
        <path d="M 0 -120 C -20 -220 -90 -260 -96 -330 C -40 -300 -10 -240 0 -160 Z" fill="#6FA35F" />
        <path d="M 0 -120 C 18 -240 70 -300 84 -380 C 30 -330 4 -260 -4 -170 Z" fill="#7FB36C" />
        <path d="M 0 -120 C -6 -200 10 -270 40 -300 C 22 -240 14 -190 8 -130 Z" fill="#5E9150" />
      </svg>
    </div>
  );
};

// Спинка офисного кресла за сидящей (рисуется до персонажа).
export const OfficeChair: React.FC<{ x: number }> = ({ x }) => (
  <div style={box({ left: x - 120, top: OFFICE.seatY - 640, width: 240, height: 640 })}>
    <div style={box({ left: 40, top: 40, width: 160, height: 280, borderRadius: 44, backgroundColor: "#C9D2DE" })} />
    <div style={box({ left: 112, top: 310, width: 18, height: 200, backgroundColor: "#B4BECC" })} />
  </div>
);

// Стол: столешница (поверх тел сидящих) и передняя панель до пола.
export const DeskFront: React.FC = () => {
  const d = OFFICE.desk;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      <div style={box({ left: d.x, top: d.top - 4, width: d.w, height: d.front - d.top + 8, borderRadius: 8, backgroundColor: "#FFFFFF", boxShadow: "0 2px 0 #E1E5EC" })} />
      <div style={box({ left: d.x + 20, top: d.front, width: d.w - 40, height: d.bottom - d.front, backgroundColor: "#EEF1F5", borderRadius: "0 0 10px 10px" })} />
      <div style={box({ left: d.x + 20, top: d.front + 60, width: d.w - 40, height: 12, backgroundColor: "#FFD23F" })} />
    </div>
  );
};

// Ноутбук в профиль: экран повернут к маме (влево), светится.
export const LaptopSide: React.FC<{ x: number; y: number; glow?: number; tint?: string }> = ({ x, y, glow = 1, tint = "170,210,250" }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <rect x={x - 90} y={y - 10} width={180} height={12} rx={4} fill="#AEB6C4" />
    <g transform={`translate(${x + 86} ${y - 6}) rotate(78)`}>
      <rect x={-176} y={-6} width={176} height={12} rx={4} fill="#9AA3B2" />
      <rect x={-172} y={-9} width={166} height={4} fill={`rgba(${tint},${0.85 * glow})`} />
    </g>
    {glow > 0 ? <path d={`M ${x + 66} ${y - 22} L ${x + 44} ${y - 170} L ${x - 110} ${y - 50} Z`} fill={`rgba(${tint},${0.16 * glow})`} /> : null}
  </svg>
);

// Кружка (белая с жёлтой полосой) и папки на столе.
export const Mug: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={90} height={90} viewBox="0 0 90 90" style={box({ left: x - 40, top: y - 80 })}>
    <path d="M 66 30 Q 88 32 84 52 Q 80 66 64 62" fill="none" stroke="#E8ECF2" strokeWidth={8} />
    <rect x={8} y={14} width={60} height={66} rx={10} fill="#FFFFFF" stroke="#DCE1E8" strokeWidth={3} />
    <rect x={8} y={40} width={60} height={12} fill="#FFD23F" />
  </svg>
);

export const Folders: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={box({ left: x - 90, top: y - 54, width: 180, height: 54 })}>
    <div style={box({ left: 0, top: 36, width: 180, height: 18, borderRadius: 4, backgroundColor: "#2E4170" })} />
    <div style={box({ left: 8, top: 18, width: 170, height: 18, borderRadius: 4, backgroundColor: "#FFD23F" })} />
    <div style={box({ left: 2, top: 0, width: 174, height: 18, borderRadius: 4, backgroundColor: "#F2F4F7", border: "2px solid #D5DBE4", boxSizing: "border-box" })} />
  </div>
);
