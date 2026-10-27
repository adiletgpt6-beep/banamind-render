// Улица и двор Бишкека: панельные дома с балконами, тополя и карагачи с
// побелёнными стволами, арык вдоль тротуара, остановка с маршруткой,
// светофор, машины, детская площадка, горы на дальнем плане.
import { Depth, box } from "../shots";
import { Mountains } from "./Apartment";

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

// Легковая машина (вид сбоку). color — кузов; wheel — угол колёс (градусы);
// stripe — фирменная жёлтая полоса по борту.
export const Car: React.FC<{ x: number; y: number; s?: number; color: string; wheel?: number; dir?: 1 | -1; driver?: boolean; kid?: boolean; openRear?: number; stripe?: string }> = ({ x, y, s = 1, color, wheel = 0, dir = 1, driver, kid, openRear = 0, stripe }) => (
  <svg width={520 * s} height={200 * s} viewBox="-260 -190 520 200" style={box({ left: x - 260 * s, top: y - 190 * s, overflow: "visible" })}>
    <g transform={`scale(${dir} 1)`}>
      <ellipse cx={0} cy={4} rx={240} ry={14} fill="rgba(20,25,40,0.22)" />
      <path d="M -240 -40 Q -244 -92 -200 -100 L -130 -108 Q -90 -170 -10 -172 L 70 -170 Q 130 -166 170 -110 L 220 -100 Q 250 -92 248 -48 L 246 -22 L -238 -22 Z" fill={color} />
      <path d="M -112 -110 Q -78 -158 -12 -160 L 62 -158 Q 112 -154 146 -112 Z" fill="#9FC1DD" />
      <rect x={14} y={-160} width={10} height={50} fill={color} />
      {driver ? <circle cx={-40} cy={-128} r={20} fill="#3A2E2A" /> : null}
      {kid ? <circle cx={70} cy={-122} r={15} fill="#2E2422" /> : null}
      <path d="M -240 -50 L 248 -50" stroke="rgba(0,0,0,0.12)" strokeWidth={4} />
      {stripe ? <path d="M -238 -62 L 246 -62" stroke={stripe} strokeWidth={12} /> : null}
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

// Маршрутка (белый микроавтобус с номером маршрута).
export const Marshrutka: React.FC<{ x: number; y: number; s?: number; wheel?: number; route?: string }> = ({ x, y, s = 1, wheel = 0, route = "110" }) => (
  <svg width={640 * s} height={330 * s} viewBox="-320 -320 640 330" style={box({ left: x - 320 * s, top: y - 320 * s, overflow: "visible" })}>
    <ellipse cx={0} cy={4} rx={300} ry={16} fill="rgba(20,25,40,0.22)" />
    <path d="M -300 -30 L -300 -260 Q -296 -296 -260 -298 L 200 -298 Q 250 -296 280 -230 L 306 -120 L 306 -30 Z" fill="#F6F6F4" />
    {[-270, -170, -70, 30, 130].map((wx) => (
      <rect key={wx} x={wx} y={-262} width={88} height={86} rx={8} fill="#2E3D52" opacity={0.85} />
    ))}
    <path d="M 226 -262 L 266 -262 L 292 -150 L 226 -150 Z" fill="#2E3D52" opacity={0.85} />
    <rect x={-300} y={-150} width={606} height={18} fill="#F2C14E" />
    <rect x={-260} y={-290} width={110} height={34} rx={6} fill="#14285A" />
    <text x={-205} y={-265} textAnchor="middle" fontSize={26} fontWeight={900} fill="#FFFFFF" fontFamily="Nunito">{route}</text>
    {[-200, 200].map((wx) => (
      <g key={wx} transform={`translate(${wx} -30) rotate(${wheel})`}>
        <circle r={42} fill="#23262E" />
        <circle r={20} fill="#B8BEC8" />
        <rect x={-3} y={-20} width={6} height={40} fill="#8C929C" />
      </g>
    ))}
  </svg>
);

// Светофор: state 0 — красный, 1 — жёлтый, 2 — зелёный (плавное переключение).
export const TrafficLight: React.FC<{ x: number; y: number; s?: number; red: number; yellow: number; green: number }> = ({ x, y, s = 1, red, yellow, green }) => (
  <svg width={120 * s} height={600 * s} viewBox="-60 -600 120 600" style={box({ left: x - 60 * s, top: y - 600 * s, overflow: "visible" })}>
    <rect x={-8} y={-400} width={16} height={400} fill="#5C6270" />
    <rect x={-44} y={-600} width={88} height={240} rx={18} fill="#2B303C" />
    {[
      [-555, "#E2433A", red],
      [-480, "#F2B33C", yellow],
      [-405, "#3FB86A", green],
    ].map(([cy, c, on]) => (
      <g key={String(cy)}>
        <circle cx={0} cy={Number(cy)} r={28} fill="#151820" />
        <circle cx={0} cy={Number(cy)} r={28} fill={String(c)} opacity={0.15 + 0.85 * Number(on)} />
        <circle cx={0} cy={Number(cy)} r={46} fill={String(c)} opacity={0.18 * Number(on)} />
      </g>
    ))}
  </svg>
);

// Остановка: навес, скамейка, табличка.
export const BusStop: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={box({ left: x, top: y - 360, width: 420, height: 360 })}>
    <div style={box({ left: 0, top: 0, width: 420, height: 26, borderRadius: 8, backgroundColor: "#3A6EA5" })} />
    <div style={box({ left: 16, top: 26, width: 10, height: 334, backgroundColor: "#7E8796" })} />
    <div style={box({ left: 394, top: 26, width: 10, height: 334, backgroundColor: "#7E8796" })} />
    <div style={box({ left: 30, top: 40, width: 360, height: 200, backgroundColor: "rgba(205,226,240,0.55)", border: "4px solid #9FB1C4", boxSizing: "border-box" })} />
    <div style={box({ left: 60, top: 250, width: 300, height: 20, borderRadius: 6, backgroundColor: "#8C6A4E" })} />
    <div style={box({ left: 436, top: -40, width: 70, height: 70, borderRadius: 35, backgroundColor: "#FFFFFF", border: "6px solid #3A6EA5", boxSizing: "border-box", color: "#3A6EA5", fontSize: 30, fontWeight: 900, textAlign: "center", lineHeight: "58px", fontFamily: "Nunito" })}>A</div>
    <div style={box({ left: 466, top: 30, width: 8, height: 330, backgroundColor: "#7E8796" })} />
  </div>
);

// Тротуар с арыком: бетонный жёлоб с водой и мостиками, бордюр.
export const Sidewalk: React.FC<{ x: number; y: number; w: number; offset?: number }> = ({ x, y, w, offset = 0 }) => (
  <div style={box({ left: x, top: y, width: w, height: 300 })}>
    <div style={box({ left: 0, top: 0, width: w, height: 150, backgroundColor: "#DAD3C7" })} />
    <div style={box({ left: 0, top: 0, width: w, height: 150, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 3px, transparent 3px 120px)", backgroundPositionX: -offset })} />
    {/* арык */}
    <div style={box({ left: 0, top: 150, width: w, height: 46, backgroundColor: "#A9A39A" })} />
    <div style={box({ left: 0, top: 160, width: w, height: 26, background: "linear-gradient(180deg, #6E9CB8, #8FB8CF)" })} />
    <div style={box({ left: 0, top: 160, width: w, height: 26, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 30px, transparent 30px 90px)", backgroundPositionX: -offset * 1.4 })} />
    {/* бордюр */}
    <div style={box({ left: 0, top: 196, width: w, height: 22, backgroundColor: "#EFECE6" })} />
  </div>
);

// Двор: дома, тополя, скамейка, площадка, припаркованные машины, горы.
export const Courtyard: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 2600, height: 2600 })}>
    <Sky w={2600} h={1200} />
    <Depth depth={0.2}>
      <Mountains x={-200} y={420} w={3000} h={420} />
    </Depth>
    <Depth depth={0.55}>
      <PanelHouse x={1500} y={1250} w={1400} floors={5} color="#E9D6C4" seed={4} />
      <Tree x={1380} y={1260} s={1.1} kind="poplar" tone={1} />
      <Tree x={2200} y={1250} s={1.05} kind="poplar" tone={1} />
    </Depth>
    <PanelHouse x={-100} y={1560} w={1500} floors={5} color="#EADFCF" seed={1} door={660} />
    {/* земля: отмостка, асфальтовая дорожка, газоны с бордюром */}
    <div style={box({ left: -200, top: 1540, width: 3000, height: 1100, backgroundColor: "#A9C98A" })} />
    <div style={box({ left: -200, top: 1540, width: 3000, height: 60, backgroundColor: "#B4AB9E" })} />
    <div style={box({ left: -200, top: 1600, width: 3000, height: 380, backgroundColor: "#C9C2B6", transform: "skewY(4deg)", transformOrigin: "0 0" })} />
    <div style={box({ left: -200, top: 1975, width: 3000, height: 16, backgroundColor: "#EFECE6", transform: "skewY(4deg)", transformOrigin: "0 0" })} />
    <div style={box({ left: 1300, top: 1600, width: 1400, height: 120, borderRadius: 30, backgroundColor: "#9CC07E" })} />
    {[200, 700, 1250].map((x) => (
      <div key={x} style={box({ left: x, top: 2080 + x * 0.07, width: 240, height: 70, borderRadius: 35, backgroundColor: "#7FAF63" })} />
    ))}
    {/* площадка: качели и горка */}
    <svg width={500} height={320} viewBox="0 0 500 320" style={box({ left: 1500, top: 1430 })}>
      <path d="M 40 300 L 110 40 L 180 300 M 320 300 L 250 40 L 180 300" stroke="#D2533F" strokeWidth={12} fill="none" />
      <line x1={110} y1={40} x2={250} y2={40} stroke="#D2533F" strokeWidth={12} />
      <line x1={150} y1={40} x2={150} y2={200} stroke="#6B7280" strokeWidth={4} />
      <line x1={210} y1={40} x2={210} y2={200} stroke="#6B7280" strokeWidth={4} />
      <rect x={140} y={196} width={80} height={14} rx={6} fill="#F2C14E" />
      <path d="M 380 300 L 380 120 L 430 120 L 500 300" stroke="#3E7CC0" strokeWidth={14} fill="none" />
      <path d="M 430 120 Q 470 200 500 290" stroke="#F2C14E" strokeWidth={18} fill="none" />
    </svg>
    <Tree x={1180} y={1640} s={1.05} />
    {/* скамейка */}
    <div style={box({ left: 940, top: 1610, width: 230, height: 22, borderRadius: 6, backgroundColor: "#8C6A4E" })} />
    <div style={box({ left: 940, top: 1650, width: 230, height: 18, borderRadius: 6, backgroundColor: "#8C6A4E" })} />
    <div style={box({ left: 960, top: 1668, width: 12, height: 50, backgroundColor: "#4A4E58" })} />
    <div style={box({ left: 1140, top: 1668, width: 12, height: 50, backgroundColor: "#4A4E58" })} />
    {/* припаркованные машины */}
    <Car x={2080} y={1660} s={0.9} color="#7E95B3" />
    <Car x={2150} y={1900} s={1.15} color="#B9BEC6" dir={-1} />
    {/* утренний свет */}
    <div style={box({ left: -200, top: 0, width: 3000, height: 2600, background: "linear-gradient(200deg, rgba(255,236,200,0.22), transparent 60%)" })} />
  </div>
);
