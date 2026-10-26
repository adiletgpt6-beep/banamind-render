// Офис мамы — светлый современный: стеклянная перегородка, экран на стене
// для обсуждения, круглые часы, стол мамы у окна с ноутбуком (наружная
// крышка к зрителю), открытым блокнотом и настольной лампой. Одно и то же
// место в сценах 4, 5 и 7 (узнаётся по часам, лампе и блокноту).
import { box } from "../kit";
import { C, F } from "../theme";
import { KM2_TEXT } from "../script";

export const MOM_OFFICE = {
  floorY: 1560,
  screen: { x: 120, y: 640, w: 520, h: 330 },
  clock: { x: 900, y: 560, r: 74 },
  desk: { x0: 1320, x1: 1980, top: 1180 },
  laptop: { x: 1430, y: 1176, w: 240 },
  notebook: { x: 1800, y: 1172 },
  lamp: { x: 1910 },
  momSeat: 1620,
  chairs: [860, 1080] as const, // коллеги (сидят лицом к экрану)
} as const;

// Часы: h, m — время на циферблате.
export const WallClock: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly h: number; readonly m: number }> = ({ x, y, r, h, m }) => {
  const am = (m / 60) * Math.PI * 2 - Math.PI / 2;
  const ah = (((h % 12) + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <circle cx={x} cy={y} r={r} fill={C.white} stroke={C.navy} strokeWidth={r * 0.12} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={x + Math.cos(a) * r * 0.78} y1={y + Math.sin(a) * r * 0.78} x2={x + Math.cos(a) * r * 0.88} y2={y + Math.sin(a) * r * 0.88} stroke={C.navy} strokeWidth={r * 0.05} />;
      })}
      <line x1={x} y1={y} x2={x + Math.cos(ah) * r * 0.5} y2={y + Math.sin(ah) * r * 0.5} stroke={C.ink} strokeWidth={r * 0.09} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + Math.cos(am) * r * 0.75} y2={y + Math.sin(am) * r * 0.75} stroke={C.ink} strokeWidth={r * 0.06} strokeLinecap="round" />
      <circle cx={x} cy={y} r={r * 0.07} fill={C.orange} />
    </svg>
  );
};

export const MomOfficeBack: React.FC<{ readonly h?: number; readonly m?: number }> = ({ h = 12, m = 50 }) => {
  const o = MOM_OFFICE;
  return (
    <div style={box({ left: -500, top: -300 })}>
      <div style={box({ left: 0, top: 0, width: 3000, height: o.floorY + 300, backgroundColor: C.wallOffice })} />
      {/* окно во всю стену справа */}
      <div style={box({ left: 1760, top: 480, width: 760, height: 900, background: "linear-gradient(180deg, #CFE2F1, #E8EEF2)", border: `14px solid ${C.white}`, boxSizing: "border-box" })} />
      <div style={box({ left: 1800, top: 1000, width: 200, height: 380, backgroundColor: "#AFC3D3" })} />
      <div style={box({ left: 2040, top: 880, width: 150, height: 500, backgroundColor: "#BACCDA" })} />
      <div style={box({ left: 2230, top: 960, width: 220, height: 420, backgroundColor: "#A9BED0" })} />
      {/* экран для обсуждения */}
      <div style={box({ left: o.screen.x + 500, top: o.screen.y + 300, width: o.screen.w, height: o.screen.h, backgroundColor: C.navy, borderRadius: 12, border: "10px solid #2A2F3A", boxSizing: "border-box" })}>
        <div style={box({ left: 30, top: 24, fontFamily: F.text, fontWeight: 800, fontSize: 34, color: C.white })}>{KM2_TEXT.doc.title}</div>
        {KM2_TEXT.doc.rows.map((r, i) => (
          <div key={r} style={box({ left: 30, top: 92 + i * 66, width: 440, height: 50, borderRadius: 8, backgroundColor: i === 1 ? C.orange : "rgba(255,255,255,0.14)", fontFamily: F.text, fontWeight: 800, fontSize: 28, lineHeight: "50px", paddingLeft: 16, boxSizing: "border-box", color: C.white })}>{r}</div>
        ))}
      </div>
      <WallClock x={o.clock.x + 500} y={o.clock.y + 300} r={o.clock.r} h={h} m={m} />
      {/* растение */}
      <div style={box({ left: 1690, top: 1600, width: 110, height: 150, backgroundColor: C.white, borderRadius: "0 0 20px 20px" })} />
      {[-36, 0, 36].map((a) => (
        <div key={a} style={box({ left: 1722, top: 1400, width: 46, height: 220, backgroundColor: C.green, borderRadius: "50%", transform: `rotate(${a}deg)`, transformOrigin: "50% 100%" })} />
      ))}
      <div style={box({ left: 0, top: o.floorY + 300, width: 3000, height: 900, backgroundColor: C.floorOffice })} />
      <div style={box({ left: 0, top: o.floorY + 296, width: 3000, height: 8, backgroundColor: "#B7BCC4" })} />
    </div>
  );
};

// Кресло мамы (спинка за ней).
export const MomChairBack: React.FC<{ readonly x: number }> = ({ x }) => <div style={box({ left: x - 95, top: MOM_OFFICE.desk.top - 250, width: 190, height: 250, backgroundColor: "#3A3F4C", borderRadius: "40px 40px 12px 12px" })} />;

// Кресла коллег (слева), спинки за сидящими.
export const GuestChair: React.FC<{ readonly x: number; readonly color?: string }> = ({ x, color = C.blue }) => (
  <div style={box({ left: x - 90, top: MOM_OFFICE.floorY - 520, width: 180, height: 300, backgroundColor: color, borderRadius: "34px 34px 10px 10px" })} />
);
export const GuestSeat: React.FC<{ readonly x: number; readonly color?: string }> = ({ x, color = C.blue }) => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: x - 104, top: MOM_OFFICE.floorY - 200, width: 208, height: 32, backgroundColor: color, borderRadius: 12 })} />
    <div style={box({ left: x - 8, top: MOM_OFFICE.floorY - 168, width: 16, height: 150, backgroundColor: C.ink })} />
    <div style={box({ left: x - 70, top: MOM_OFFICE.floorY - 22, width: 140, height: 14, borderRadius: 7, backgroundColor: C.ink })} />
  </div>
);

// Блокнот на столе (вид спереди: тонкий разворот).
export const NotebookOnDesk: React.FC<{ readonly x: number; readonly y: number; readonly open?: boolean }> = ({ x, y, open = true }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) scale(1 0.24)`}>
      {open ? (
        <>
          <rect x={-120} y={-80} width={240} height={160} fill="#FFFDF6" stroke="#CFC8BA" strokeWidth={6} />
          <line x1={0} y1={-80} x2={0} y2={80} stroke="#CFC8BA" strokeWidth={6} />
        </>
      ) : (
        <rect x={-70} y={-80} width={140} height={160} fill={C.orange} />
      )}
    </g>
  </svg>
);

// Стол мамы: столешница и панель, лампа (on — свет 0…1).
export const MomDesk: React.FC<{ readonly lamp?: number }> = ({ lamp = 1 }) => {
  const d = MOM_OFFICE.desk;
  const lx = MOM_OFFICE.lamp.x;
  return (
    <div style={box({ left: 0, top: 0 })}>
      {lamp > 0 ? <div style={box({ left: lx - 260, top: d.top - 200, width: 420, height: 260, background: "radial-gradient(ellipse at 60% 0%, rgba(255,214,140,0.55), rgba(255,214,140,0) 70%)", opacity: lamp })} /> : null}
      <div style={box({ left: lx, top: d.top - 230, width: 12, height: 230, backgroundColor: C.ink })} />
      <div style={box({ left: lx - 80, top: d.top - 250, width: 120, height: 40, backgroundColor: C.ink, borderRadius: "40px 40px 6px 6px", transform: "rotate(-12deg)" })} />
      <div style={box({ left: lx - 70, top: d.top - 214, width: 96, height: 10, borderRadius: 5, backgroundColor: lamp > 0.5 ? "#FFE3A6" : "#5A5F6A", transform: "rotate(-12deg)" })} />
      <div style={box({ left: d.x0, top: d.top, width: d.x1 - d.x0, height: 26, backgroundColor: C.white, borderBottom: "6px solid #D6DAE0" })} />
      <div style={box({ left: d.x0 + 30, top: d.top + 32, width: d.x1 - d.x0 - 60, height: MOM_OFFICE.floorY - d.top - 32, backgroundColor: "#D9DEE5" })} />
    </div>
  );
};
