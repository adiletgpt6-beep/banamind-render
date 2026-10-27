// Бишкек за окном: панельные дома с балконами, тополя и карагачи с
// побелёнными стволами; белая легковая машина для финала.
import { box } from "../shots";

// Небо: утро — мягкое и светлое.
export const Sky: React.FC<{ w: number; h: number; evening?: boolean }> = ({ w, h, evening }) => (
  <div style={box({ left: -400, top: -400, width: w + 800, height: h + 800, background: evening ? "linear-gradient(180deg, #2B3560, #6B5A7E 70%, #E3A170)" : "linear-gradient(180deg, #BFDDF3 0%, #E3EEF5 55%, #FBE7CF 100%)" })} />
);

// Панельный дом: этажи, окна, балконы (часть застеклена), кондиционеры.
export const PanelHouse: React.FC<{ x: number; y: number; w: number; floors: number; color: string; seed?: number; door?: number }> = ({ x, y, w, floors, color, seed = 1, door }) => {
  const fh = 150;
  const h = floors * fh + 40;
  const cols = Math.floor(w / 150);
  const cw = w / cols;
  const r = (i: number) => {
    const s = Math.sin(i * 91.7 + seed * 13.1) * 43758.5;
    return s - Math.floor(s);
  };
  return (
    <div style={box({ left: x, top: y - h, width: w, height: h })}>
      <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: color })} />
      <div style={box({ left: 0, top: 0, width: w, height: h, backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 3px, transparent 3px ${fh}px), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 3px, transparent 3px ${cw}px)` })} />
      <div style={box({ left: -10, top: -20, width: w + 20, height: 24, backgroundColor: "#8E8A86" })} />
      {Array.from({ length: floors }).map((_, fl) =>
        Array.from({ length: cols }).map((__, c) => {
          const i = fl * cols + c;
          const bx = c * cw + cw * 0.18;
          const by = 30 + fl * fh;
          const balcony = (c + fl + seed) % 3 === 0;
          const glazed = r(i) > 0.45;
          const lit = r(i + 7) > 0.8;
          if (fl === floors - 1 && door !== undefined && Math.abs(c * cw + cw / 2 - door) < cw / 2) return null;
          return (
            <div key={i}>
              <div style={box({ left: bx, top: by + 18, width: cw * 0.64, height: 78, borderRadius: 4, backgroundColor: lit ? "#F8E7B8" : "#9FB6CE", border: "5px solid #F4F1EC", boxSizing: "border-box" })} />
              {balcony ? (
                <div style={box({ left: bx - 10, top: by + 62, width: cw * 0.64 + 20, height: 64, borderRadius: 3, backgroundColor: glazed ? "rgba(214,232,243,0.92)" : "#D8CFC4", border: `4px solid ${glazed ? "#EEF3F6" : "#B9AEA2"}`, boxSizing: "border-box" })} />
              ) : null}
              {r(i + 3) > 0.84 ? <div style={box({ left: bx + cw * 0.66, top: by + 34, width: 34, height: 26, backgroundColor: "#ECEDEF", borderRadius: 3 })} /> : null}
            </div>
          );
        }),
      )}
      {door !== undefined ? (
        <>
          <div style={box({ left: door - 70, top: h - 190, width: 140, height: 190, backgroundColor: "#5A4A40" })} />
          <div style={box({ left: door - 100, top: h - 214, width: 200, height: 26, backgroundColor: "#9A9590", borderRadius: 4 })} />
          <div style={box({ left: door - 40, top: h - 250, width: 80, height: 26, borderRadius: 6, backgroundColor: "#3A6EA5", color: "#FFFFFF", fontSize: 18, fontWeight: 900, textAlign: "center", lineHeight: "26px" })}>2</div>
        </>
      ) : null}
    </div>
  );
};

// Дерево: тополь (узкий) или карагач (круглый), побелённый ствол.
export const Tree: React.FC<{ x: number; y: number; s?: number; kind?: "poplar" | "round"; tone?: number }> = ({ x, y, s = 1, kind = "round", tone = 0 }) => {
  const g1 = tone ? "#6E9E5C" : "#7FAF63";
  const g2 = tone ? "#5D8C4E" : "#6B9C55";
  return (
    <svg width={320 * s} height={620 * s} viewBox="-160 -600 320 620" style={box({ left: x - 160 * s, top: y - 600 * s, overflow: "visible" })}>
      <ellipse cx={8} cy={8} rx={70} ry={14} fill="rgba(30,40,30,0.15)" />
      <rect x={-13} y={-260} width={26} height={265} rx={10} fill="#7A5B45" />
      <rect x={-14} y={-90} width={28} height={95} rx={6} fill="#F4F2EC" />
      {kind === "poplar" ? (
        <>
          <ellipse cx={0} cy={-390} rx={72} ry={220} fill={g2} />
          <ellipse cx={-14} cy={-410} rx={52} ry={190} fill={g1} />
        </>
      ) : (
        <>
          <circle cx={-60} cy={-300} r={95} fill={g2} />
          <circle cx={60} cy={-310} r={100} fill={g2} />
          <circle cx={0} cy={-390} r={115} fill={g1} />
          <circle cx={-30} cy={-420} r={60} fill="#8DBA70" opacity={0.6} />
        </>
      )}
    </svg>
  );
};

// Легковая машина (вид сбоку). color — кузов; wheel — угол колёс (градусы).
export const Car: React.FC<{ x: number; y: number; s?: number; color: string; wheel?: number; dir?: 1 | -1; driver?: boolean; kid?: boolean; openRear?: number }> = ({ x, y, s = 1, color, wheel = 0, dir = 1, driver, kid, openRear = 0 }) => (
  <svg width={520 * s} height={200 * s} viewBox="-260 -190 520 200" style={box({ left: x - 260 * s, top: y - 190 * s, overflow: "visible" })}>
    <g transform={`scale(${dir} 1)`}>
      <ellipse cx={0} cy={4} rx={240} ry={14} fill="rgba(20,25,40,0.22)" />
      <path d="M -240 -40 Q -244 -92 -200 -100 L -130 -108 Q -90 -170 -10 -172 L 70 -170 Q 130 -166 170 -110 L 220 -100 Q 250 -92 248 -48 L 246 -22 L -238 -22 Z" fill={color} />
      <path d="M -112 -110 Q -78 -158 -12 -160 L 62 -158 Q 112 -154 146 -112 Z" fill="#9FC1DD" />
      <rect x={14} y={-160} width={10} height={50} fill={color} />
      {driver ? <circle cx={-40} cy={-128} r={20} fill="#3A2E2A" /> : null}
      {kid ? <circle cx={70} cy={-122} r={15} fill="#2E2422" /> : null}
      <path d="M -240 -50 L 248 -50" stroke="rgba(0,0,0,0.12)" strokeWidth={4} />
      <rect x={-190} y={-78} width={22} height={6} rx={3} fill="rgba(0,0,0,0.25)" />
      <rect x={40} y={-78} width={22} height={6} rx={3} fill="rgba(0,0,0,0.25)" />
      <rect x={232} y={-80} width={14} height={18} rx={4} fill="#FFE7A8" />
      <rect x={-242} y={-80} width={10} height={18} rx={4} fill="#E25B4E" />
      {[-150, 150].map((wx) => (
        <g key={wx} transform={`translate(${wx} -22) rotate(${wheel})`}>
          <circle r={38} fill="#23262E" />
          <circle r={20} fill="#B8BEC8" />
          <rect x={-3} y={-20} width={6} height={40} fill="#8C929C" />
          <rect x={-20} y={-3} width={40} height={6} fill="#8C929C" />
        </g>
      ))}
      {openRear > 0 ? <path d={`M 20 -160 L 20 -22 L ${20 + 120 * openRear} -10 L ${20 + 110 * openRear} -150 Z`} fill={color} opacity={0.95} /> : null}
    </g>
  </svg>
);
