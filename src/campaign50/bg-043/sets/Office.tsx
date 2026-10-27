// Светлый офис в Бишкеке. Слева на стене — полка с двумя будильниками и
// стикерами «ЖУМУШ 08:00» / «МЕКТЕП 13:00», справа окно с видом на
// заснеженный хребет Ала-Тоо и городские дома, внизу — высокий рабочий
// стол мамы (ноутбук, блокнот, ручка, растение). Мир — px 1080×1920;
// сцены 1–3 снимают его камерой (shots.tsx) с разных точек.
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { box, Depth } from "../shots";

export const OFFICE = {
  shelf: { x0: 140, x1: 650, y: 860 },
  window: { x: 660, y: 230, w: 360, h: 560 },
  notes: {
    work: { x: 205, y: 548, rot: -5 },
    school: { x: 565, y: 536, rot: 4 },
  },
  clocks: {
    work: { x: 300, y: 860 },
    school: { x: 500, y: 860 },
    size: 70,
  },
  desk: { x0: 300, top: 1236, front: 1296 },
  laptop: { x: 900, y: 1250 },
  notebook: { x: 520, y: 1262 },
  mom: { x: 790, y: 1830, h: 1180 },
} as const;

// Вид из окна: небо, хребет Ала-Тоо со снежными вершинами, дома города.
export const BishkekView: React.FC<{ readonly w: number; readonly h: number; readonly sun?: number }> = ({ w, h, sun = 1 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
    <defs>
      <linearGradient id="bg43-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#BFDDF7" />
        <stop offset="1" stopColor="#EEF6FD" />
      </linearGradient>
    </defs>
    <rect width={w} height={h} fill="url(#bg43-sky)" />
    <circle cx={w * 0.78} cy={h * 0.16} r={34} fill="#FFF3B8" opacity={0.9 * sun} />
    {/* дальний хребет */}
    <path
      d={`M 0 ${h * 0.5} L ${w * 0.12} ${h * 0.36} L ${w * 0.22} ${h * 0.42} L ${w * 0.36} ${h * 0.27} L ${w * 0.5} ${h * 0.39} L ${w * 0.63} ${h * 0.3} L ${w * 0.78} ${h * 0.41} L ${w * 0.9} ${h * 0.33} L ${w} ${h * 0.4} L ${w} ${h} L 0 ${h} Z`}
      fill={C.mountainFar}
    />
    {/* снежные шапки */}
    <path d={`M ${w * 0.3} ${h * 0.32} L ${w * 0.36} ${h * 0.27} L ${w * 0.43} ${h * 0.33} L ${w * 0.39} ${h * 0.32} L ${w * 0.36} ${h * 0.345} L ${w * 0.33} ${h * 0.325} Z`} fill={C.snow} />
    <path d={`M ${w * 0.58} ${h * 0.335} L ${w * 0.63} ${h * 0.3} L ${w * 0.69} ${h * 0.345} L ${w * 0.65} ${h * 0.34} L ${w * 0.62} ${h * 0.355} Z`} fill={C.snow} />
    <path d={`M ${w * 0.86} ${h * 0.36} L ${w * 0.9} ${h * 0.33} L ${w * 0.95} ${h * 0.37} L ${w * 0.91} ${h * 0.365} Z`} fill={C.snow} />
    {/* ближний хребет */}
    <path
      d={`M 0 ${h * 0.6} L ${w * 0.18} ${h * 0.47} L ${w * 0.32} ${h * 0.55} L ${w * 0.48} ${h * 0.45} L ${w * 0.66} ${h * 0.56} L ${w * 0.84} ${h * 0.48} L ${w} ${h * 0.55} L ${w} ${h} L 0 ${h} Z`}
      fill={C.mountain}
    />
    <path d={`M ${w * 0.42} ${h * 0.48} L ${w * 0.48} ${h * 0.45} L ${w * 0.54} ${h * 0.49} L ${w * 0.5} ${h * 0.485} L ${w * 0.47} ${h * 0.5} Z`} fill={C.snow} opacity={0.9} />
    {/* город: панельные дома и зелень */}
    {[
      [0.02, 0.66, 0.13, 0.34],
      [0.17, 0.72, 0.1, 0.28],
      [0.3, 0.62, 0.15, 0.38],
      [0.49, 0.7, 0.12, 0.3],
      [0.64, 0.6, 0.14, 0.4],
      [0.82, 0.68, 0.16, 0.32],
    ].map(([x, y, bw, bh], i) => (
      <g key={i}>
        <rect x={w * x} y={h * y} width={w * bw} height={h * bh} fill={i % 2 ? "#E7EEF7" : "#DCE6F2"} />
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 3 }, (_, c) => (
            <rect key={`${r}-${c}`} x={w * x + 8 + c * ((w * bw - 16) / 3)} y={h * y + 10 + r * 26} width={(w * bw - 16) / 3 - 7} height={13} fill="#BCCDE3" opacity={0.8} />
          )),
        )}
      </g>
    ))}
    {[0.12, 0.27, 0.46, 0.6, 0.79, 0.97].map((x, i) => (
      <ellipse key={`t${i}`} cx={w * x} cy={h * 0.93} rx={34} ry={46} fill={i % 2 ? "#A7CFA0" : "#97C391"} />
    ))}
  </svg>
);

const Note: React.FC<{ readonly x: number; readonly y: number; readonly rot: number; readonly color: string; readonly label: string; readonly time: string; readonly icon: "bag" | "school"; readonly glow?: number }> = ({
  x,
  y,
  rot,
  color,
  label,
  time,
  icon,
  glow = 0,
}) => (
  <div
    style={box({
      left: x - 92,
      top: y - 78,
      width: 184,
      height: 156,
      transform: `rotate(${rot}deg) scale(${1 + glow * 0.06})`,
      backgroundColor: color,
      borderRadius: 8,
      boxShadow: `0 8px 16px rgba(20,40,90,0.12), 0 0 0 ${glow * 8}px rgba(255,201,14,${0.45 * glow})`,
      fontFamily,
      color: C.navy,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    })}
  >
    <div style={box({ left: 66, top: -12, width: 52, height: 22, backgroundColor: "rgba(255,255,255,0.65)", transform: "rotate(-3deg)" })} />
    <svg width={44} height={36} viewBox="0 0 44 36">
      {icon === "bag" ? (
        <>
          <rect x={4} y={10} width={36} height={24} rx={5} fill={C.navy} />
          <rect x={15} y={3} width={14} height={9} rx={3} fill="none" stroke={C.navy} strokeWidth={4} />
          <rect x={4} y={19} width={36} height={4} fill={color} opacity={0.6} />
        </>
      ) : (
        <>
          <path d="M 4 16 L 22 4 L 40 16 Z" fill={C.navy} />
          <rect x={7} y={16} width={30} height={18} fill={C.navy} />
          <rect x={18} y={22} width={8} height={12} fill={color} />
          <circle cx={22} cy={11} r={3} fill={color} />
        </>
      )}
    </svg>
    <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 1, lineHeight: 1 }}>{label}</div>
    <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>{time}</div>
  </div>
);

// Стена, окно, стикеры и полка (за персонажами).
export const OfficeBack: React.FC<{ readonly noteGlow?: { readonly work?: number; readonly school?: number } }> = ({ noteGlow }) => {
  const w = OFFICE.window;
  const s = OFFICE.shelf;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      <div style={box({ left: -600, top: -600, width: 2400, height: 3200, background: "linear-gradient(180deg, #FFFFFF 0%, #FBF5EA 62%, #F5EBDA 100%)" })} />
      <div style={box({ left: -600, top: -600, width: 2400, height: 3200, backgroundImage: "repeating-linear-gradient(90deg, rgba(20,40,90,0.022) 0 4px, transparent 4px 96px)" })} />
      <div style={box({ left: -600, top: 1130, width: 2400, height: 14, backgroundColor: C.yellowSoft })} />
      {/* окно с видом на Бишкек и горы */}
      <div style={box({ left: w.x - 22, top: w.y - 22, width: w.w + 44, height: w.h + 44, backgroundColor: "#FFFFFF", borderRadius: 8, boxShadow: "0 0 0 2px #ECE4D6" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", borderRadius: 4 })}>
        <Depth depth={0.55}>
          <div style={box({ left: -60, top: -40, width: w.w + 120, height: w.h + 80 })}>
            <BishkekView w={w.w + 120} h={w.h + 80} />
          </div>
        </Depth>
      </div>
      <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x, top: w.y + w.h * 0.42, width: w.w, height: 14, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x - 40, top: w.y + w.h + 18, width: w.w + 80, height: 26, borderRadius: 6, backgroundColor: "#FFFFFF", boxShadow: "0 6px 10px rgba(20,40,90,0.08)" })} />
      {/* стикеры на стене над полкой */}
      <Note {...OFFICE.notes.work} color="#FFE27A" label="ЖУМУШ" time="08:00" icon="bag" glow={noteGlow?.work ?? 0} />
      <Note {...OFFICE.notes.school} color="#CFE3F7" label="МЕКТЕП" time="13:00" icon="school" glow={noteGlow?.school ?? 0} />
      {/* полка */}
      <div style={box({ left: s.x0 + 40, top: s.y + 20, width: 22, height: 70, borderRadius: 4, backgroundColor: C.woodShade })} />
      <div style={box({ left: s.x1 - 62, top: s.y + 20, width: 22, height: 70, borderRadius: 4, backgroundColor: C.woodShade })} />
      <div style={box({ left: s.x0, top: s.y, width: s.x1 - s.x0, height: 28, borderRadius: 6, background: `linear-gradient(180deg, ${C.wood}, ${C.woodShade})`, boxShadow: "0 10px 14px rgba(60,40,20,0.16)" })} />
      {/* книги и растение на краю полки */}
      {[
        [s.x0 + 14, 92, "#2B4C8F"],
        [s.x0 + 40, 104, "#FFC90E"],
        [s.x0 + 66, 86, "#9FB0CF"],
      ].map(([x, hh, col], i) => (
        <div key={i} style={box({ left: x as number, top: s.y - (hh as number), width: 24, height: hh as number, borderRadius: 3, backgroundColor: col as string, boxShadow: "inset -4px 0 0 rgba(0,0,0,0.08)" })} />
      ))}
      <svg width={110} height={140} style={box({ left: s.x1 - 110, top: s.y - 136 })} viewBox="0 0 110 140">
        <path d="M 55 100 C 30 70 18 50 22 24 C 40 40 50 64 55 100 Z" fill="#7DBA84" />
        <path d="M 55 100 C 76 72 90 50 88 22 C 70 40 60 62 55 100 Z" fill="#8FCB93" />
        <path d="M 55 100 C 52 70 54 40 58 12 C 66 40 62 70 55 100 Z" fill="#6AAE74" />
        <path d="M 30 96 L 80 96 L 74 138 L 36 138 Z" fill="#FFFFFF" stroke="#E2D8C6" strokeWidth={3} />
      </svg>
    </div>
  );
};

// Ноутбук, вид со стороны крышки (экран — к маме).
export const LaptopBack: React.FC<{ readonly x: number; readonly y: number; readonly open?: number }> = ({ x, y, open = 1 }) => (
  <svg width={300} height={220} viewBox="0 0 300 220" style={box({ left: x - 150, top: y - 210 })}>
    <rect x={30} y={200 - 170 * open} width={240} height={170 * open} rx={14} fill="#C7D0E0" stroke="#AEB9CC" strokeWidth={4} />
    <circle cx={150} cy={200 - 85 * open} r={16 * open} fill="#E9EEF6" />
    <rect x={8} y={198} width={284} height={16} rx={8} fill="#B7C1D3" />
  </svg>
);

// Блокнот на столе (видна верхняя страница, слегка в перспективе).
export const DeskNotebook: React.FC<{ readonly x: number; readonly y: number; readonly lines: number; readonly page?: "notes" | "route"; readonly flip?: number }> = ({
  x,
  y,
  lines,
  flip = 0,
}) => (
  <svg width={240} height={90} viewBox="0 0 240 90" style={box({ left: x - 120, top: y - 60 })}>
    <path d="M 26 8 L 214 8 L 236 78 L 4 78 Z" fill="#FFFFFF" stroke="#C9D3E6" strokeWidth={3} />
    {Array.from({ length: 4 }, (_, i) => (
      <path key={i} d={`M ${30 + i * 0} ${22 + i * 14} L ${210 + i * 5} ${22 + i * 14}`} stroke="#DCE6F2" strokeWidth={2.5} />
    ))}
    {Array.from({ length: Math.min(4, lines) }, (_, i) => (
      <path key={`w${i}`} d={`M ${36 - i * 2} ${21 + i * 14} q 30 -5 ${60 + (i % 2) * 40} -1`} stroke={C.navy} strokeWidth={3} fill="none" strokeLinecap="round" />
    ))}
    {flip > 0 ? <path d={`M 120 8 Q ${120 + 90 * (1 - flip)} ${-30 * Math.sin(flip * Math.PI)} ${236 - 232 * flip} 78 L 120 78 Z`} fill="#F7F9FD" stroke="#C9D3E6" strokeWidth={2} /> : null}
    <rect x={116} y={8} width={8} height={70} fill="#E1E7F1" />
  </svg>
);

// Стол (передний план): столешница и передняя панель, растение.
export const OfficeDesk: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => {
  const d = OFFICE.desk;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      <div style={box({ left: d.x0, top: d.top, width: 1200, height: d.front - d.top, background: `linear-gradient(180deg, #F2E1C6, ${C.desk})` })} />
      <div style={box({ left: d.x0, top: d.front - 6, width: 1200, height: 22, backgroundColor: C.deskEdge, borderRadius: 4 })} />
      <div style={box({ left: d.x0 + 40, top: d.front + 16, width: 1200, height: 700, background: "linear-gradient(180deg, #EAD8BC, #E0CAA8)" })} />
      <div style={box({ left: d.x0 + 40, top: d.front + 16, width: 26, height: 700, backgroundColor: "rgba(120,90,50,0.08)" })} />
      {children}
    </div>
  );
};
