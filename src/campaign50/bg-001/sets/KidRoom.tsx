// Комната сына (Бишкек, после уроков): светлая стена, окно во двор с
// тополями и горами, полка с книгами, письменный стол с жёлтой лампой;
// на столе открытый жёлтый рюкзак, тетради, пенал и телефон на подставке
// (видеозвонок маме). Пол — y = 1560 (ступни сына).
import { box } from "../shots";
import { Mountains } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

export const ROOM = {
  floorY: 1560,
  window: { x: 80, y: 520, w: 420, h: 520 },
  shelf: { x: 620, y: 700, w: 380 },
  desk: { x: 470, top: 1268, w: 600 },
  son: { x: 470 },
  pack: { x: 650, y: 1268 }, // низ рюкзака на столе
  pencil: { x: 590, y: 1270 }, // пенал перед рюкзаком
  phone: { x: 860, y: 1268 },
} as const;

export const RoomBack: React.FC = () => {
  const w = ROOM.window;
  const s = ROOM.shelf;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      <div style={box({ left: -600, top: 0, width: 2400, height: ROOM.floorY, backgroundColor: "#EEF4FB" })} />
      <div style={box({ left: -600, top: ROOM.floorY, width: 2400, height: 800, backgroundColor: "#E7D6BF" })} />
      <div style={box({ left: -600, top: ROOM.floorY - 16, width: 2400, height: 16, backgroundColor: "#D7E2EE" })} />
      {/* окно во двор */}
      <div style={box({ left: w.x - 16, top: w.y - 16, width: w.w + 32, height: w.h + 32, borderRadius: 12, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", borderRadius: 4 })}>
        <div style={box({ left: 0, top: 0, width: w.w, height: w.h, background: "linear-gradient(180deg, #BFDDF3 0%, #E6F0F6 65%, #FBE7CF 100%)" })} />
        <Mountains x={-30} y={w.h * 0.22} w={w.w + 60} h={w.h * 0.4} />
        <PanelHouse x={-20} y={w.h + 20} w={260} floors={3} color="#E9DCC9" seed={2} />
        <PanelHouse x={250} y={w.h + 40} w={220} floors={3} color="#DCE3E8" seed={6} />
        <Tree x={230} y={w.h + 30} s={0.7} kind="poplar" />
      </div>
      <div style={box({ left: w.x + w.w / 2 - 6, top: w.y, width: 12, height: w.h, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x - 26, top: w.y + w.h + 12, width: w.w + 52, height: 20, borderRadius: 6, backgroundColor: "#FFFFFF" })} />
      {/* полка с книгами и жёлтой машинкой-игрушкой */}
      <div style={box({ left: s.x, top: s.y, width: s.w, height: 18, borderRadius: 6, backgroundColor: "#C9A57E" })} />
      {["#2E4170", "#FFD23F", "#4C9A5F", "#E0884A", "#8A68C9", "#4C7BD9"].map((c, i) => (
        <div key={c} style={box({ left: s.x + 20 + i * 34, top: s.y - [120, 104, 126, 96, 116, 108][i], width: 28, height: [120, 104, 126, 96, 116, 108][i], borderRadius: 4, backgroundColor: c })} />
      ))}
      <div style={box({ left: s.x + 250, top: s.y - 48, width: 100, height: 40, borderRadius: "18px 18px 8px 8px", backgroundColor: "#FFFFFF", border: "4px solid #D5DBE4", boxSizing: "border-box" })} />
      {/* рисунок ребёнка на стене */}
      <div style={box({ left: 650, top: 860, width: 200, height: 150, backgroundColor: "#FFFFFF", border: "6px solid #FFD23F", boxSizing: "border-box", transform: "rotate(-3deg)" })}>
        <svg width={188} height={138} viewBox="0 0 188 138">
          <path d="M 0 110 L 40 60 L 70 90 L 110 40 L 150 100 L 188 70 L 188 138 L 0 138 Z" fill="#9DB2CC" />
          <circle cx={150} cy={34} r={16} fill="#FFD23F" />
        </svg>
      </div>
    </div>
  );
};

// Стол (поверх ног сына не нужен — сын стоит перед столом сбоку).
export const KidDesk: React.FC = () => {
  const d = ROOM.desk;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      <div style={box({ left: d.x, top: d.top - 4, width: d.w, height: 30, borderRadius: 8, backgroundColor: "#FFFFFF", boxShadow: "0 3px 0 #DCE2EA" })} />
      <div style={box({ left: d.x + 20, top: d.top + 26, width: 26, height: ROOM.floorY - d.top - 26, backgroundColor: "#DCE2EA" })} />
      <div style={box({ left: d.x + d.w - 46, top: d.top + 26, width: 26, height: ROOM.floorY - d.top - 26, backgroundColor: "#DCE2EA" })} />
      <div style={box({ left: d.x + 60, top: d.top + 26, width: d.w - 120, height: 120, backgroundColor: "#F2F5F9", borderRadius: "0 0 10px 10px" })} />
      {/* лампа */}
      <svg width={160} height={260} viewBox="0 0 160 260" style={box({ left: d.x + d.w - 170, top: d.top - 256 })}>
        <rect x={50} y={244} width={70} height={14} rx={6} fill="#2E4170" />
        <path d="M 84 244 L 70 120 L 120 60" fill="none" stroke="#2E4170" strokeWidth={9} strokeLinecap="round" />
        <path d="M 96 30 L 150 70 L 120 96 Z" fill="#FFD23F" />
      </svg>
    </div>
  );
};

// Открытый жёлтый рюкзак на столе. fill 0…1 — сколько уже уложено.
export const OpenBackpack: React.FC<{ x: number; y: number; fill: number; zip?: number }> = ({ x, y, fill, zip = 0 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={100} ry={10} fill="rgba(20,30,60,0.12)" />
      {/* задняя стенка и уложенные тетради */}
      <path d="M -88 -4 L -92 -170 Q -90 -206 -50 -210 L 50 -210 Q 90 -206 92 -170 L 88 -4 Z" fill="#E0A800" />
      {fill > 0.05 ? <rect x={-62} y={-190 + 12 * (1 - fill)} width={110} height={40} rx={4} fill="#4C7BD9" transform="rotate(-4)" /> : null}
      {fill > 0.55 ? <rect x={-40} y={-196} width={96} height={30} rx={10} fill="#3FA27A" transform="rotate(6)" /> : null}
      {/* передняя стенка, клапан закрывается при zip */}
      <path d="M -94 -4 L -96 -140 Q -40 -128 0 -128 Q 40 -128 96 -140 L 94 -4 Z" fill="#F2B705" />
      <rect x={-60} y={-96} width={120} height={60} rx={14} fill="#FFD23F" />
      <path d={`M -92 ${-150 + 30 * zip} Q 0 ${-224 + 100 * zip} 92 ${-150 + 30 * zip}`} fill="none" stroke="#2E4170" strokeWidth={5} opacity={0.6} />
      <path d="M -60 -210 Q 0 -262 60 -210" fill="none" stroke="#2E4170" strokeWidth={10} strokeLinecap="round" />
    </g>
  </svg>
);

// Пенал на столе (пока не уложен).
export const PencilCase: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={box({ left: x - 50, top: y - 24, width: 100, height: 24, borderRadius: 12, backgroundColor: "#3FA27A" })} />
);

// Телефон на подставке: видеозвонок маме (экран к сыну, виден в профиль),
// рядом подпись.
export const PhoneStand: React.FC<{ x: number; y: number; glow: number }> = ({ x, y, glow }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y})`}>
      <path d="M -30 0 L 20 0 L 4 -40 Z" fill="#B9C0CC" />
      <g transform="rotate(-14)">
        <rect x={-32} y={-150} width={22} height={140} rx={7} fill="#1E2235" />
        <rect x={-35} y={-144} width={5} height={128} rx={2} fill={`rgba(200,225,250,${0.3 + 0.7 * glow})`} />
      </g>
    </g>
  </svg>
);
