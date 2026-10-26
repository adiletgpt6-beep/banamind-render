// Школа (одна география во всех планах; мир, px):
//
//   основное здание x −300…1060: в центре ОСНОВНОЙ ВХОД (x 540) — козырёк,
//     три ступени, двустворчатая дверь: петли у внешних краёв створок,
//     ручки-скобы у середины, двери открываются наружу; над козырьком
//     вывеска «Мектеп»;
//   правое крыло x 1060…1700 — СПОРТ ЗАЛ: ниже, большие окна под крышей,
//     отдельная одностворчатая дверь (x 1380) без ступеней: петли справа,
//     ручка слева, табличка «Спорт зал»;
//   двор между фасадом (y 1560) и забором (y 1800); ворота-дарбаза
//     (x 40…300) слева, от них дорожка по диагонали к крыльцу основного
//     входа; улица и машина семьи — перед забором (справа от ворот).
// Масштаб людей во дворе: у забора рост мальчика ≈ 360 px, у крыльца
// ≈ 0,85 от этого (дальше от камеры); дверь ≈ 1,5 роста ребёнка.
// Те же размеры используются в схеме школы (SchoolMap) — стороны входов
// не меняются.
import { box } from "../kit";
import { C, F } from "../theme";

export const SCHOOL = {
  groundY: 1560, // линия фасада (низ ступеней)
  main: { x: 540, w: 300, top: 1150 }, // проём основной двери
  steps: 3,
  gym: { x0: 1060, x1: 1700, roofY: 760, door: { x: 1380, w: 170, top: 1250 } },
  fenceY: 1800,
  gate: { x0: 40, x1: 300 },
  streetY: 1920, // линия тротуара перед забором
} as const;

const S = SCHOOL;

export const SchoolBack: React.FC<{ readonly morning?: number }> = ({ morning = 1 }) => {
  const m = S.main;
  const g = S.gym;
  return (
    <div style={box({ left: 0, top: 0 })}>
      {/* небо утром */}
      <div style={box({ left: -1200, top: -800, width: 4400, height: 2400, background: morning ? "linear-gradient(180deg, #CFE4F3 0%, #EAF3F8 70%)" : "#CFE0EE" })} />
      {/* основное здание */}
      <div style={box({ left: -300, top: 420, width: 1360, height: S.groundY - 420, backgroundColor: "#E8E1D3" })} />
      <div style={box({ left: -300, top: 380, width: 1360, height: 50, backgroundColor: "#7E98B5" })} />
      {[0, 1].map((r) =>
        [-200, 20, 240, 760, 980].map((x) => (
          <div key={`${r}${x}`} style={box({ left: x - 70, top: 520 + r * 300, width: 140, height: 190, backgroundColor: C.glass, border: `10px solid ${C.white}`, boxSizing: "border-box" })} />
        )),
      )}
      {/* вывеска над основным входом */}
      <div style={box({ left: m.x - 200, top: 860, width: 400, height: 96, backgroundColor: C.navy, color: C.white, fontFamily: F.display, fontWeight: 900, fontSize: 72, textAlign: "center", lineHeight: "96px", borderRadius: 10 })}>Мектеп</div>
      {/* козырёк */}
      <div style={box({ left: m.x - m.w / 2 - 60, top: m.top - 70, width: m.w + 120, height: 40, backgroundColor: "#7E98B5", borderRadius: 6 })} />
      {/* проём и двустворчатая дверь */}
      <div style={box({ left: m.x - m.w / 2 - 14, top: m.top - 14, width: m.w + 28, height: S.groundY - 3 * 26 - m.top + 14, backgroundColor: C.white })} />
      {[-1, 1].map((sd) => (
        <div key={sd} style={box({ left: sd < 0 ? m.x - m.w / 2 : m.x + 2, top: m.top, width: m.w / 2 - 2, height: S.groundY - 3 * 26 - m.top, backgroundColor: "#4F7FB0" })}>
          <div style={box({ left: 18, top: 24, width: m.w / 2 - 38, height: 210, backgroundColor: C.glass, opacity: 0.9 })} />
          {/* ручка-скоба у середины */}
          <div style={box({ left: sd < 0 ? m.w / 2 - 30 : 14, top: 250, width: 10, height: 80, borderRadius: 5, backgroundColor: "#D8DEE6" })} />
        </div>
      ))}
      {/* петли у внешних краёв */}
      {[-1, 1].map((sd) => [0.15, 0.75].map((k) => <div key={`${sd}${k}`} style={box({ left: m.x + sd * (m.w / 2) - 4, top: m.top + (S.groundY - 78 - m.top) * k, width: 8, height: 36, backgroundColor: "#3A5F86" })} />))}
      {/* ступени (три) */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: m.x - m.w / 2 - 60 - (2 - i) * 30, top: S.groundY - (3 - i) * 26, width: m.w + 120 + (2 - i) * 60, height: 26, backgroundColor: i % 2 ? "#CFC6B6" : "#D9D1C2", borderTop: "3px solid #BDB3A2", boxSizing: "border-box" })} />
      ))}
      {/* крыло спортзала: ниже, большие окна под крышей */}
      <div style={box({ left: g.x0, top: g.roofY, width: g.x1 - g.x0, height: S.groundY - g.roofY, backgroundColor: "#DCD3C2" })} />
      <div style={box({ left: g.x0, top: g.roofY - 36, width: g.x1 - g.x0, height: 40, backgroundColor: "#E2884A" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: g.x0 + 50 + i * 200, top: g.roofY + 40, width: 170, height: 150, backgroundColor: C.glass, border: `8px solid ${C.white}`, boxSizing: "border-box" })} />
      ))}
      {/* табличка и дверь спортзала: петли справа, ручка слева, без ступеней */}
      <div style={box({ left: g.door.x - 140, top: g.door.top - 100, width: 280, height: 66, backgroundColor: "#E2884A", color: C.white, fontFamily: F.display, fontWeight: 900, fontSize: 44, textAlign: "center", lineHeight: "66px", borderRadius: 8 })}>Спорт зал</div>
      <div style={box({ left: g.door.x - g.door.w / 2 - 12, top: g.door.top - 12, width: g.door.w + 24, height: S.groundY - g.door.top + 12, backgroundColor: C.white })} />
      <div style={box({ left: g.door.x - g.door.w / 2, top: g.door.top, width: g.door.w, height: S.groundY - g.door.top, backgroundColor: "#C9733F" })}>
        <div style={box({ left: 22, top: 26, width: g.door.w - 44, height: 120, backgroundColor: C.glass, opacity: 0.85 })} />
        <div style={box({ left: 16, top: 150, width: 34, height: 10, borderRadius: 5, backgroundColor: "#E9E2D6" })} />
      </div>
      {[0.15, 0.75].map((k) => <div key={k} style={box({ left: g.door.x + g.door.w / 2 - 4, top: g.door.top + (S.groundY - g.door.top) * k, width: 8, height: 34, backgroundColor: "#8E4E2A" })} />)}
      {/* двор: плитка до забора */}
      <div style={box({ left: -1200, top: S.groundY, width: 4400, height: S.fenceY - S.groundY + 10, backgroundColor: "#D8D0C0" })} />
      {/* дорожка от ворот по диагонали к крыльцу */}
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <path d={`M ${S.gate.x0 + 10} ${S.fenceY} L ${S.gate.x1 - 10} ${S.fenceY} L ${m.x + m.w / 2 + 40} ${S.groundY} L ${m.x - m.w / 2 - 40} ${S.groundY} Z`} fill="#E6DFD1" />
      </svg>
      {/* деревья у крыла */}
      <div style={box({ left: 920, top: 1180, width: 150, height: 150, borderRadius: "50%", backgroundColor: "#8DBA7A" })} />
      <div style={box({ left: 986, top: 1320, width: 18, height: 240, backgroundColor: "#8A6A52" })} />
    </div>
  );
};

// Забор с воротами (передний план двора). open — 0…1: створки ворот
// раскрыты внутрь двора.
export const Fence: React.FC<{ readonly open?: number }> = ({ open = 1 }) => {
  const posts: number[] = [];
  for (let x = -1100; x <= 2600; x += 120) if (x < S.gate.x0 - 30 || x > S.gate.x1 + 30) posts.push(x);
  const leaf = (S.gate.x1 - S.gate.x0) / 2;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <rect x={-1100} y={S.fenceY - 190} width={S.gate.x0 - 20 + 1100} height={12} fill="#3E5878" />
      <rect x={S.gate.x1 + 20} y={S.fenceY - 190} width={2600 - S.gate.x1} height={12} fill="#3E5878" />
      <rect x={-1100} y={S.fenceY - 60} width={S.gate.x0 - 20 + 1100} height={12} fill="#3E5878" />
      <rect x={S.gate.x1 + 20} y={S.fenceY - 60} width={2600 - S.gate.x1} height={12} fill="#3E5878" />
      {posts.map((x) => (
        <rect key={x} x={x - 6} y={S.fenceY - 220} width={12} height={220} rx={4} fill="#3E5878" />
      ))}
      {/* столбы ворот */}
      {[S.gate.x0 - 20, S.gate.x1 + 20].map((x) => (
        <rect key={x} x={x - 14} y={S.fenceY - 270} width={28} height={270} rx={6} fill="#2E4462" />
      ))}
      {/* створки (сжимаются при открытии внутрь) */}
      {[-1, 1].map((sd) => {
        const w = leaf * (1 - 0.8 * open);
        const x0 = sd < 0 ? S.gate.x0 - 6 : S.gate.x1 + 6 - w;
        return (
          <g key={sd}>
            <rect x={x0} y={S.fenceY - 200} width={w} height={10} fill="#3E5878" />
            <rect x={x0} y={S.fenceY - 70} width={w} height={10} fill="#3E5878" />
            {Array.from({ length: 5 }).map((_, i) => (
              <rect key={i} x={x0 + (w * i) / 4 - 3} y={S.fenceY - 205} width={6} height={150} fill="#3E5878" />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

// Тротуар и дорога перед школой.
export const SchoolStreet: React.FC = () => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: -1200, top: S.fenceY, width: 4400, height: S.streetY - S.fenceY + 60, backgroundColor: "#CFC8BA" })} />
    <div style={box({ left: -1200, top: S.streetY + 60, width: 4400, height: 24, backgroundColor: "#B5AE9F" })} />
    <div style={box({ left: -1200, top: S.streetY + 84, width: 4400, height: 900, backgroundColor: "#9AA0A8" })} />
  </div>
);

// Схема школы (рисунок на листе блокнота папы, вид сверху-спереди):
// основной вход в центре, выход спортзала справа — как на фасаде.
// hi: 0 — нет выделения, 1 — выход спортзала обведён.
export const SchoolMap: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly hi?: number; readonly labels?: boolean }> = ({ x, y, w, hi = 0, labels = true }) => {
  const k = w / 900;
  const ink = C.navy;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        {/* здание и крыло */}
        <rect x={0} y={60} width={560} height={300} rx={8} fill="none" stroke={ink} strokeWidth={8} />
        <rect x={560} y={150} width={340} height={210} rx={8} fill="none" stroke={ink} strokeWidth={8} />
        {/* основной вход (центр здания) и ступени */}
        <rect x={240} y={250} width={80} height={110} fill={ink} opacity={0.85} />
        <line x1={220} y1={372} x2={340} y2={372} stroke={ink} strokeWidth={6} />
        {/* выход спортзала (правое крыло) */}
        <rect x={760} y={265} width={64} height={95} fill="#C9733F" />
        {hi > 0 ? <ellipse cx={792} cy={312} rx={92 * hi} ry={84 * hi} fill="none" stroke="#E2574C" strokeWidth={9} strokeDasharray="22 14" /> : null}
        {labels ? (
          <>
            <text x={280} y={440} textAnchor="middle" fontFamily={F.kid} fontWeight={800} fontSize={44} fill={ink}>Мектеп</text>
            <text x={730} y={130} textAnchor="middle" fontFamily={F.kid} fontWeight={800} fontSize={44} fill={ink}>Спорт зал</text>
          </>
        ) : null}
      </g>
    </svg>
  );
};
