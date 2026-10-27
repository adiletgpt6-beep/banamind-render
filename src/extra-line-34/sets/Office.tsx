// Короткие вставки сцены 2: мама в офисе компании (возвращается к работе) и
// папа ведёт совещание отдела. Мир — px; пол у стены y = 1500, стопы y = 1540.
// Без логотипов и читаемого текста: на мониторе и доске — абстрактные блоки.
import { box, Depth, Svg } from "../kit";
import { C } from "../theme";

export const OFFICE = {
  floorY: 1500,
  feetY: 1540,
  desk: { x: 260, w: 700, top: 1230 },
  // мама сидит у левого края стола лицом вправо, к монитору
  momSeat: { x: 360, seat: 205 },
  monitor: { x: 720, y: 1230 },
  keyboard: { x: 560, y: 1226 },
  bag: { x: 860, y: 1230 },
  colleague: { x: 1180, y: 1470, h: 560 },
} as const;

export const MEETING = {
  floorY: 1500,
  feetY: 1540,
  board: { x: 560, y: 640, w: 440, h: 330 },
  table: { x: 60, w: 560, top: 1290 },
  seats: [180, 420], // коллеги за столом лицом вправо
  dad: { x: 960 }, // у правого края доски, указывает на диаграмму левой рукой
  chart: [0.45, 0.7, 0.55, 0.9], // высоты столбцов (доли)
} as const;

const O = OFFICE;
const M = MEETING;

// Город за окном офиса: средняя этажность, тополя, горы.
const CityView: React.FC<{ readonly w: number; readonly h: number }> = ({ w, h }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={box({ left: 0, top: 0 })}>
    <defs>
      <linearGradient id="el34-osky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D3E5F2" />
        <stop offset="1" stopColor="#EEF2F2" />
      </linearGradient>
    </defs>
    <rect width={w} height={h} fill="url(#el34-osky)" />
    <path d={`M 0 ${h * 0.4} L ${w * 0.15} ${h * 0.26} L ${w * 0.32} ${h * 0.36} L ${w * 0.5} ${h * 0.18} L ${w * 0.66} ${h * 0.32} L ${w * 0.84} ${h * 0.22} L ${w} ${h * 0.34} L ${w} ${h * 0.6} L 0 ${h * 0.6} Z`} fill="#BCCBDD" />
    <path d={`M ${w * 0.47} ${h * 0.205} L ${w * 0.5} ${h * 0.18} L ${w * 0.535} ${h * 0.215} Z M ${w * 0.82} ${h * 0.235} L ${w * 0.84} ${h * 0.22} L ${w * 0.87} ${h * 0.245} Z`} fill="#FFFFFF" />
    {[
      [0.02, 0.46, 0.16, 6],
      [0.2, 0.52, 0.14, 5],
      [0.36, 0.42, 0.18, 8],
      [0.58, 0.5, 0.15, 6],
      [0.76, 0.44, 0.2, 7],
    ].map(([x, y, ww, fl], i) => (
      <g key={i}>
        <rect x={x * w} y={y * h} width={ww * w} height={h} fill={i % 2 ? "#E2D7C8" : "#D6DDE6"} />
        {Array.from({ length: fl }).map((_, r) =>
          Array.from({ length: 3 }).map((__, c) => <rect key={`${r}-${c}`} x={x * w + 10 + c * ((ww * w - 20) / 3)} y={y * h + 14 + r * 36} width={(ww * w - 40) / 3} height={20} rx={2} fill="#B7C9DA" />),
        )}
      </g>
    ))}
    {[0.18, 0.55, 0.74].map((x, i) => (
      <ellipse key={i} cx={x * w} cy={h * 0.86} rx={18} ry={70} fill={C.green} />
    ))}
  </svg>
);

export const OfficeBack: React.FC = () => (
  <div style={box({ left: -600, top: -900, width: 2600, height: 4200 })}>
    <div style={box({ left: 0, top: 0, width: 2600, height: 900 + O.floorY, backgroundColor: C.office })} />
    {/* окно-витраж */}
    <div style={box({ left: 600 + 80, top: 900 + 330, width: 1040, height: 700, borderRadius: 8, overflow: "hidden", border: "14px solid #F7F9FB", boxSizing: "border-box" })}>
      <CityView w={1012} h={672} />
      {[0.33, 0.66].map((k) => (
        <div key={k} style={box({ left: 1012 * k - 6, top: 0, width: 12, height: 672, backgroundColor: "#F7F9FB" })} />
      ))}
    </div>
    <div style={box({ left: 0, top: 900 + O.floorY - 12, width: 2600, height: 12, backgroundColor: "#F5F7F9" })} />
    <div style={box({ left: 0, top: 900 + O.floorY, width: 2600, height: 1800, background: "linear-gradient(180deg, #C9CFD6, #B9C0C8 60%)" })} />
    <div style={box({ left: 0, top: 900 + O.floorY, width: 2600, height: 1800, backgroundImage: "repeating-linear-gradient(90deg, rgba(60,70,90,0.06) 0 2px, transparent 2px 160px)" })} />
  </div>
);

// Коллега за дальним столом (меньше, на дальнем слое).
export const OfficeFar: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => (
  <Depth depth={0.7}>
    <Svg>
      <rect x={1000} y={1300} width={420} height={18} rx={6} fill="#E9EDF1" />
      <rect x={1020} y={1318} width={12} height={160} fill="#AEB6C0" />
      <rect x={1390} y={1318} width={12} height={160} fill="#AEB6C0" />
      <rect x={1240} y={1196} width={110} height={78} rx={6} fill="#3A4256" />
      <rect x={1288} y={1274} width={14} height={26} fill="#3A4256" />
    </Svg>
    {children}
  </Depth>
);

// Стол мамы: столешница, монитор (экран к маме и к камере), клавиатура,
// рабочая сумка, растение. Рисуется после тела мамы (её колени под столом).
export const OfficeDesk: React.FC<{ readonly typing?: number }> = ({ typing = 0 }) => {
  const d = O.desk;
  const m = O.monitor;
  return (
    <Svg>
      <ellipse cx={d.x + d.w / 2} cy={O.feetY - 4} rx={d.w / 2 + 30} ry={16} fill="rgba(30,40,60,0.10)" />
      {[d.x + 30, d.x + d.w - 46].map((x) => (
        <rect key={x} x={x} y={d.top + 20} width={16} height={O.floorY + 30 - d.top - 20} rx={4} fill="#9AA3AE" />
      ))}
      <rect x={d.x} y={d.top} width={d.w} height={26} rx={8} fill="#E4E7EB" />
      <rect x={d.x - 6} y={d.top - 8} width={d.w + 12} height={14} rx={7} fill="#F6F7F9" />
      {/* монитор ¾: экран к маме и к камере, абстрактный интерфейс */}
      <rect x={m.x - 10} y={m.y - 70} width={20} height={64} fill="#5A6272" />
      <rect x={m.x - 50} y={m.y - 12} width={100} height={10} rx={5} fill="#5A6272" />
      <polygon points={`${m.x - 130},${m.y - 250} ${m.x + 110},${m.y - 236} ${m.x + 110},${m.y - 70} ${m.x - 130},${m.y - 60}`} fill="#2B3142" />
      <polygon points={`${m.x - 120},${m.y - 240} ${m.x + 100},${m.y - 227} ${m.x + 100},${m.y - 79} ${m.x - 120},${m.y - 70}`} fill="#F4F7FB" />
      <rect x={m.x - 108} y={m.y - 226} width={56} height={142} rx={4} fill="#DDE5EF" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={m.x - 40} y={m.y - 220 + i * 32} width={120 - i * 18} height={14} rx={6} fill={i === 0 ? "#9FB3CC" : "#C9D3DF"} />
      ))}
      <rect x={m.x - 40} y={m.y - 106} width={60 + 40 * typing} height={14} rx={6} fill="#FFD447" opacity={0.85} />
      {/* клавиатура */}
      <polygon points={`${O.keyboard.x - 70},${O.keyboard.y - 4} ${O.keyboard.x + 70},${O.keyboard.y - 8} ${O.keyboard.x + 84},${O.keyboard.y + 2} ${O.keyboard.x - 60},${O.keyboard.y + 4}`} fill="#C9CED8" />
      {/* рабочая сумка мамы */}
      <g transform={`translate(${O.bag.x} ${O.bag.y})`}>
        <path d="M -36 -84 Q 0 -128 36 -84" stroke="#2B3142" strokeWidth={7} fill="none" />
        <rect x={-62} y={-90} width={124} height={88} rx={14} fill="#3A4256" />
        <rect x={-62} y={-90} width={124} height={20} rx={10} fill="#465068" />
        <rect x={-14} y={-60} width={28} height={6} rx={3} fill="#FFD447" opacity={0.8} />
      </g>
      {/* растение */}
      <path d={`M ${d.x + d.w - 30} ${d.top - 4} L ${d.x + d.w + 22} ${d.top - 4} L ${d.x + d.w + 14} ${d.top - 60} L ${d.x + d.w - 22} ${d.top - 60} Z`} fill="#E9E2D6" />
      {[-40, -10, 20, 45].map((a, i) => (
        <ellipse key={i} cx={d.x + d.w - 4} cy={d.top - 110} rx={14} ry={46} fill={i % 2 ? C.greenDark : C.green} transform={`rotate(${a} ${d.x + d.w - 4} ${d.top - 60})`} />
      ))}
    </Svg>
  );
};

export const OfficeChair: React.FC<{ readonly x: number }> = ({ x }) => (
  <Svg>
    <rect x={x - 70} y={O.feetY - 205 - 210} width={30} height={220} rx={14} fill="#3A4256" />
    <rect x={x - 80} y={O.feetY - 214} width={170} height={30} rx={12} fill="#465068" />
    <rect x={x - 6} y={O.feetY - 184} width={12} height={150} fill="#8C94A2" />
    <rect x={x - 70} y={O.feetY - 36} width={140} height={10} rx={5} fill="#8C94A2" />
  </Svg>
);

// ---------- Переговорная ----------
export const MeetingBack: React.FC<{ readonly point?: number }> = ({ point = 0 }) => {
  const b = M.board;
  return (
    <div style={box({ left: -600, top: -900, width: 2600, height: 4200 })}>
      <div style={box({ left: 0, top: 0, width: 2600, height: 900 + M.floorY, backgroundColor: "#EDF0F3" })} />
      {/* стеклянная стена с видом на офис (размыто) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={box({ left: 600 - 420 + i * 300, top: 900 + 300, width: 290, height: 1180, backgroundColor: "rgba(190,214,232,0.35)", border: "6px solid #DDE4EA", boxSizing: "border-box" })} />
      ))}
      <div style={box({ left: 600 - 420, top: 900 + 820, width: 1500, height: 200, background: "linear-gradient(180deg, rgba(160,175,190,0.25), rgba(160,175,190,0.05))" })} />
      {/* доска с абстрактной диаграммой */}
      <div style={box({ left: 600 + b.x, top: 900 + b.y, width: b.w, height: b.h, backgroundColor: "#FFFFFF", borderRadius: 14, boxShadow: "0 12px 30px rgba(30,40,60,0.12)", border: "8px solid #D9DFE6", boxSizing: "border-box" })}>
        <div style={box({ left: 30, top: 30, width: 160, height: 16, borderRadius: 8, backgroundColor: "#9FB3CC" })} />
        <div style={box({ left: 30, top: 58, width: 110, height: 12, borderRadius: 6, backgroundColor: "#C9D3DF" })} />
        {M.chart.map((k, i) => (
          <div key={i} style={box({ left: 60 + i * 86, bottom: 34, width: 54, height: 200 * k, borderRadius: "8px 8px 2px 2px", backgroundColor: i === 3 ? "#FFD447" : "#8FA6C2", opacity: i === 3 ? 0.6 + 0.4 * point : 1 })} />
        ))}
        <div style={box({ left: 40, right: 40, bottom: 30, height: 4, backgroundColor: "#C9D3DF" })} />
      </div>
      <div style={box({ left: 0, top: 900 + M.floorY - 12, width: 2600, height: 12, backgroundColor: "#F5F7F9" })} />
      <div style={box({ left: 0, top: 900 + M.floorY, width: 2600, height: 1800, background: "linear-gradient(180deg, #C4CAD2, #B5BCC5 60%)" })} />
    </div>
  );
};

export const MeetingTable: React.FC = () => {
  const t = M.table;
  return (
    <Svg>
      <ellipse cx={t.x + t.w / 2} cy={M.feetY + 6} rx={t.w / 2 + 30} ry={18} fill="rgba(30,40,60,0.10)" />
      {[t.x + 40, t.x + t.w - 56].map((x) => (
        <rect key={x} x={x} y={t.top + 20} width={16} height={M.floorY + 40 - t.top - 20} rx={4} fill="#9AA3AE" />
      ))}
      <rect x={t.x} y={t.top} width={t.w} height={30} rx={10} fill="#DCE1E7" />
      <rect x={t.x - 8} y={t.top - 10} width={t.w + 16} height={16} rx={8} fill="#F4F6F8" />
      {/* блокноты и стаканы с водой */}
      <rect x={t.x + 90} y={t.top - 18} width={70} height={10} rx={3} fill="#FFFFFF" />
      <rect x={t.x + 330} y={t.top - 18} width={70} height={10} rx={3} fill="#FFFFFF" />
      <rect x={t.x + 200} y={t.top - 46} width={22} height={38} rx={5} fill="rgba(190,214,232,0.7)" />
      <rect x={t.x + 440} y={t.top - 46} width={22} height={38} rx={5} fill="rgba(190,214,232,0.7)" />
    </Svg>
  );
};
