// Офисы родителей: светлая рабочая среда (голубые стены, большие окна,
// столы с мониторами, растения, коллеги в глубине). Папин новый офис и
// офис мамы — одна архитектура разного цвета, чтобы не путались.
// Фронтальный план: человек стоит или сидит за столом лицом к зрителю,
// монитор — сбоку, повернут к нему (мы видим его заднюю крышку).
import { box, Svg } from "../kit";
import { C, F } from "../theme";

export const OFFICE = {
  floor: 1560,
  desk: { top: 1268, front: 1300, x0: 230, x1: 850 },
  personX: 540,
  monitor: { x: 760, y: 1268 },
} as const;

// Задний план: окна с городом, стены, дальние столы.
export const OfficeBack: React.FC<{ readonly tone?: "dad" | "mom" }> = ({ tone = "dad" }) => {
  const wall = tone === "dad" ? "#E3ECF5" : "#E8EEE6";
  return (
    <div style={box({ left: -700, top: -500 })}>
      <div style={box({ left: 0, top: 0, width: 2600, height: OFFICE.floor + 500, backgroundColor: wall })} />
      {/* большие окна: дневной город (горы на горизонте) */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: 520 + i * 560, top: 640, width: 500, height: 560, background: "linear-gradient(180deg, #CFE4F4, #EAF2F8)", border: "14px solid #FFFFFF", boxSizing: "border-box", overflow: "hidden" })}>
          <div style={box({ left: -40, top: 300, width: 600, height: 160, background: "linear-gradient(180deg, #B9C9DA, #A9BCCF)", clipPath: "polygon(0 100%, 12% 40%, 26% 70%, 40% 20%, 55% 60%, 70% 30%, 86% 65%, 100% 35%, 100% 100%)" })} />
          {[0, 1, 2, 3].map((k) => (
            <div key={k} style={box({ left: 20 + k * 120, top: 380 - (k % 2) * 60, width: 90, height: 300, backgroundColor: k % 2 ? "#C3D0DD" : "#B4C3D2" })} />
          ))}
        </div>
      ))}
      {/* дальняя стойка с папками и растение */}
      <div style={box({ left: 300, top: 1400, width: 2000, height: 18, backgroundColor: "#C9D3DE" })} />
      <div style={box({ left: 2060, top: 1180, width: 90, height: 140, borderRadius: "45px 45px 10px 10px", backgroundColor: C.green })} />
      <div style={box({ left: 2075, top: 1300, width: 60, height: 80, backgroundColor: "#D9CBB2", borderRadius: 8 })} />
      <div style={box({ left: 0, top: OFFICE.floor + 500, width: 2600, height: 1200, backgroundColor: tone === "dad" ? "#C9D3DE" : "#CFD8CB" })} />
    </div>
  );
};

// Рабочий стол (фронтальный план): столешница, передняя панель; монитор
// сбоку, повернут к сидящему — видна задняя крышка.
export const OfficeDesk: React.FC<{ readonly monitor?: boolean; readonly children?: React.ReactNode }> = ({ monitor = true, children }) => {
  const d = OFFICE.desk;
  const m = OFFICE.monitor;
  return (
    <>
      {monitor ? (
        <div style={box({ left: m.x - 120, top: m.y - 240, width: 240, height: 170, backgroundColor: "#3A4256", borderRadius: 12 })}>
          <div style={box({ left: 100, top: 170, width: 40, height: 60, backgroundColor: "#2E3446" })} />
        </div>
      ) : null}
      <Svg>
        <rect x={d.x0} y={d.top} width={d.x1 - d.x0} height={36} fill="#F2F4F7" />
        <rect x={d.x0} y={d.top + 36} width={d.x1 - d.x0} height={OFFICE.floor - d.top - 36} fill="#D5DCE5" />
        <rect x={d.x0 + 20} y={d.top + 70} width={d.x1 - d.x0 - 40} height={6} fill="#C3CBD6" />
      </Svg>
      {children}
    </>
  );
};

// Экран монитора крупно со списком встреч дня.
export const MeetingsScreen: React.FC<{ readonly title: string; readonly items: readonly string[]; readonly hi?: number }> = ({ title, items, hi = -1 }) => (
  <div style={box({ left: 120, top: 380, width: 840, height: 600, backgroundColor: "#2E3446", borderRadius: 24, padding: 26, boxSizing: "border-box" })}>
    <div style={box({ left: 26, top: 26, width: 788, height: 548, backgroundColor: "#FBF9F5", borderRadius: 10, overflow: "hidden" })}>
      <div style={box({ left: 0, top: 0, width: 788, height: 90, backgroundColor: C.blue })} />
      <div style={box({ left: 32, top: 22, fontFamily: F.text, fontWeight: 800, fontSize: 40, color: "#FFFFFF" })}>{title}</div>
      {items.map((t, i) => (
        <div key={t} style={box({ left: 32, top: 130 + i * 128, width: 724, height: 100, borderRadius: 14, backgroundColor: i === hi ? "#FFF3C4" : "#EEF2F7", border: i === hi ? `4px solid ${C.yellow}` : "4px solid transparent", boxSizing: "border-box" })}>
          <div style={box({ left: 26, top: 26, fontFamily: F.text, fontWeight: 800, fontSize: 38, color: C.ink, whiteSpace: "nowrap" })}>{t}</div>
        </div>
      ))}
    </div>
  </div>
);

// Картонная коробка с рабочими вещами (переезд): папки, кружка, рамка.
// (0, 0) — центр нижнего края; w — ширина.
export const MovingBox: React.FC<{ readonly x: number; readonly y: number; readonly w?: number }> = ({ x, y, w = 300 }) => {
  const h = w * 0.62;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${x} ${y})`}>
        <ellipse cx={0} cy={4} rx={w * 0.55} ry={12} fill="rgba(30,40,60,0.18)" />
        {/* содержимое над краем */}
        <rect x={-w * 0.36} y={-h - 70} width={w * 0.26} height={90} rx={4} fill={C.blue} />
        <rect x={-w * 0.08} y={-h - 50} width={w * 0.2} height={70} rx={4} fill="#FFFFFF" stroke="#C9D3DE" strokeWidth={3} />
        <rect x={w * 0.16} y={-h - 40} width={w * 0.18} height={60} rx={10} fill={C.coral} />
        <rect x={-w / 2} y={-h} width={w} height={h} rx={6} fill={C.cardboard} />
        <rect x={-w / 2} y={-h} width={w} height={18} fill={C.cardboardDark} />
        <rect x={-w * 0.16} y={-h * 0.6} width={w * 0.32} height={h * 0.18} rx={6} fill="#E7D3B5" />
      </g>
    </svg>
  );
};
