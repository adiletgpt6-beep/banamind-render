// Нынешняя школа Аяна (воспоминания): обычный светлый класс — доска,
// окно, полка с проектами, парты. Тёплые зелёные и коралловые детали.
// Фронтальный план, пол — y = FLOOR.
import { box, Svg } from "../kit";
import { C, F } from "../theme";
import { TE2_TEXT } from "../script";

export const SCHOOL = { floor: 1560, desk: { top: 1290, x0: 250, x1: 830 } } as const;

export const ClassBack: React.FC<{ readonly board?: boolean }> = ({ board = true }) => (
  <div style={box({ left: -700, top: -500 })}>
    <div style={box({ left: 0, top: 0, width: 2600, height: SCHOOL.floor + 500, backgroundColor: "#E6EFDF" })} />
    <div style={box({ left: 0, top: SCHOOL.floor + 500 - 300, width: 2600, height: 300, backgroundColor: "#D5E3CC" })} />
    {board ? (
      <div style={box({ left: 860, top: 920, width: 760, height: 380, backgroundColor: "#3E6B57", border: "14px solid #B98B5D", boxSizing: "border-box" })}>
        <div style={box({ left: 40, top: 40, fontFamily: F.hand, fontWeight: 700, fontSize: 64, color: "#F4F1EA" })}>12 + 7 =</div>
        <div style={box({ left: 40, top: 150, width: 300, height: 6, backgroundColor: "rgba(244,241,234,0.6)" })} />
      </div>
    ) : null}
    {/* окно и растение */}
    <div style={box({ left: 1740, top: 900, width: 360, height: 460, background: "linear-gradient(180deg, #CFE4F4, #EEF5EA)", border: `16px solid ${C.paper}`, boxSizing: "border-box" })} />
    <div style={box({ left: 440, top: 1000, width: 260, height: 14, backgroundColor: C.woodDark })} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 456 + i * 80, top: 930, width: 60, height: 70, borderRadius: 6, backgroundColor: [C.coral, C.yellow, C.green][i] })} />
    ))}
    <div style={box({ left: 0, top: SCHOOL.floor + 500, width: 2600, height: 1200, backgroundColor: "#C8B79C" })} />
  </div>
);

// Парта (фронтальный план).
export const SchoolDesk: React.FC<{ readonly x0?: number; readonly x1?: number; readonly top?: number }> = ({ x0 = SCHOOL.desk.x0, x1 = SCHOOL.desk.x1, top = SCHOOL.desk.top }) => (
  <Svg>
    <rect x={x0} y={top} width={x1 - x0} height={30} fill="#DCC29C" />
    <rect x={x0 + 14} y={top + 30} width={x1 - x0 - 28} height={150} fill="#7FA3C4" />
    <rect x={x0 + 24} y={top + 180} width={18} height={SCHOOL.floor - top - 180} fill="#5A6B80" />
    <rect x={x1 - 42} y={top + 180} width={18} height={SCHOOL.floor - top - 180} fill="#5A6B80" />
  </Svg>
);

// Тетрадь на парте (вид спереди-сверху, плоская): rot — поворот к соседу.
export const NotebookFlat: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number; readonly written?: number }> = ({ x, y, rot = 0, written = 0 }) => (
  <Svg>
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1 0.32)`}>
      <rect x={-110 + 4} y={-80 + 8} width={220} height={160} rx={6} fill="rgba(40,40,60,0.2)" />
      <rect x={-110} y={-80} width={220} height={160} rx={6} fill="#FFFFFF" stroke="#C9D3DE" strokeWidth={3} />
      <line x1={0} y1={-80} x2={0} y2={80} stroke="#C9D3DE" strokeWidth={3} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={-96} y={-56 + k * 36} width={k === 1 ? 80 * (0.4 + written * 0.6) : 80} height={10} rx={4} fill={k === 1 ? C.pencil : "#9AA6BC"} />
      ))}
    </g>
  </Svg>
);

// Макет «Биздин шаар» на общем столе: картонная основа, дорога, домики.
// placed — сколько домиков уже стоит (последний ставят в кадре).
export const CityModel: React.FC<{ readonly x: number; readonly y: number; readonly placed: number }> = ({ x, y, placed }) => (
  <Svg>
    <g transform={`translate(${x} ${y})`}>
      <path d="M -220 0 L 220 0 L 190 -60 L -190 -60 Z" fill="#E7D3B5" stroke="#A9865C" strokeWidth={4} />
      <path d="M -150 -6 L 160 -54" stroke="#9AA6BC" strokeWidth={14} />
      <rect x={-210} y={0} width={420} height={24} fill="#C8A57A" />
      {[
        { dx: -150, dy: -40, c: C.coral },
        { dx: -60, dy: -48, c: C.yellow },
        { dx: 40, dy: -30, c: C.blue },
        { dx: 130, dy: -44, c: C.green },
      ]
        .slice(0, placed)
        .map((h, i) => (
          <g key={i} transform={`translate(${h.dx} ${h.dy})`}>
            <rect x={-26} y={-50} width={52} height={50} fill={h.c} stroke="#8A5A3C" strokeWidth={3} />
            <path d="M -32 -50 L 0 -78 L 32 -50 Z" fill="#8A5A3C" />
            <rect x={-8} y={-36} width={16} height={16} fill="#BFE3F7" />
          </g>
        ))}
      <text x={0} y={60} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={36} fill={C.navy}>
        {TE2_TEXT.project}
      </text>
    </g>
  </Svg>
);
