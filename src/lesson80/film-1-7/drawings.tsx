// Рисунки Юсуфа: один и тот же дом днём и ночью (та же форма, дверь, окна и
// расположение; меняются небо и детали), чистый лист, и итоговый рисунок
// Земли, который появляется по мере движения карандаша. Солнце на бумаге —
// просто круг с лучами, без лица. Единицы листа: 300 × 220.
import { getLength } from "@remotion/paths";
import { box } from "../core/shots";


const HOUSE = {
  body: "M 90 150 L 90 95 L 150 55 L 210 95 L 210 150 Z",
  roof: "M 80 100 L 150 48 L 220 100",
  door: "M 138 150 L 138 118 L 162 118 L 162 150",
  win1: "M 104 110 h 22 v 20 h -22 Z",
  win2: "M 174 110 h 22 v 20 h -22 Z",
  chimney: "M 186 72 h 12 v 18",
  ground: "M 20 152 H 280",
  tree: "M 250 150 L 250 120 M 250 122 C 232 122 232 96 250 96 C 268 96 268 122 250 122",
};
const PENCIL = "#3B3A44";

// Карандашная линия: немного неровная, тёмно-серая.
const Line: React.FC<{ d: string; w?: number; color?: string; fill?: string }> = ({ d, w = 2.6, color = PENCIL, fill = "none" }) => (
  <path d={d} fill={fill} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
);

const SheetPaper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <rect x={0} y={0} width={SHEET_W} height={SHEET_H} rx={4} fill="#FBF8F1" stroke="#D9D2C4" strokeWidth={2} />
    {children}
  </>
);

// Содержимое листа «дом днём».
export const DaySheetContent: React.FC = () => (
  <SheetPaper>
    {/* небо: лёгкий голубой тон восковым мелком */}
    <rect x={6} y={6} width={SHEET_W - 12} height={70} fill="#CFE6F6" opacity={0.7} />
    {/* солнце без лица */}
    <circle cx={52} cy={44} r={16} fill="#F7D04B" stroke="#E0B22C" strokeWidth={2.4} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <line key={a} x1={52 + Math.cos((a * Math.PI) / 180) * 22} y1={44 + Math.sin((a * Math.PI) / 180) * 22} x2={52 + Math.cos((a * Math.PI) / 180) * 30} y2={44 + Math.sin((a * Math.PI) / 180) * 30} stroke="#E0B22C" strokeWidth={2.4} strokeLinecap="round" />
    ))}
    <path d="M 200 36 q 10 -14 24 -6 q 12 -10 22 4 q 12 2 6 12 h -56 q -8 -6 4 -10" fill="#FFFFFF" stroke="#BFD4E4" strokeWidth={2} />
    <Line d={HOUSE.body} fill="#F6D9A8" />
    <Line d={HOUSE.roof} w={3} color="#B5553F" />
    <path d="M 80 100 L 150 48 L 220 100 Z" fill="#D9705A" opacity={0.85} />
    <Line d={HOUSE.chimney} />
    <Line d={HOUSE.door} fill="#B07A4A" />
    <Line d={HOUSE.win1} fill="#DDF0FF" />
    <Line d={HOUSE.win2} fill="#DDF0FF" />
    <Line d={HOUSE.ground} w={3} color="#6FA85C" />
    <Line d={HOUSE.tree} color="#4F8A3C" fill="#8DC774" />
    <path d="M 30 170 q 6 -10 12 0 M 60 176 q 6 -10 12 0 M 236 172 q 6 -10 12 0" stroke="#6FA85C" strokeWidth={2} fill="none" />
  </SheetPaper>
);

// Содержимое листа «дом ночью»: та же форма, тёмное небо, луна, звёзды, свет в окнах.
export const NightSheetContent: React.FC = () => (
  <SheetPaper>
    <rect x={6} y={6} width={SHEET_W - 12} height={90} fill="#3A4A7A" opacity={0.85} />
    <path d="M 62 46 a 18 18 0 1 0 14 -30 a 13 13 0 1 1 -14 30 Z" fill="#F4E7B5" stroke="#E3CF86" strokeWidth={2} />
    {[[110, 24], [150, 40], [190, 20], [230, 50], [260, 28], [30, 70], [120, 70]].map(([x, y], i) => (
      <path key={i} d={`M ${x} ${y - 5} L ${x + 1.5} ${y - 1.5} L ${x + 5} ${y} L ${x + 1.5} ${y + 1.5} L ${x} ${y + 5} L ${x - 1.5} ${y + 1.5} L ${x - 5} ${y} L ${x - 1.5} ${y - 1.5} Z`} fill="#FFF4C2" />
    ))}
    <Line d={HOUSE.body} fill="#C9B18C" />
    <path d="M 80 100 L 150 48 L 220 100 Z" fill="#9A4A3C" opacity={0.9} />
    <Line d={HOUSE.roof} w={3} color="#7A3A2E" />
    <Line d={HOUSE.chimney} />
    <Line d={HOUSE.door} fill="#7F5634" />
    <Line d={HOUSE.win1} fill="#FFE08A" />
    <Line d={HOUSE.win2} fill="#FFE08A" />
    <Line d={HOUSE.ground} w={3} color="#4E7A42" />
    <Line d={HOUSE.tree} color="#355E2A" fill="#5F8E4D" />
  </SheetPaper>
);

export const BlankSheetContent: React.FC = () => (
  <SheetPaper>
    <rect x={6} y={6} width={SHEET_W - 12} height={SHEET_H - 12} fill="#FBF8F1" />
  </SheetPaper>
);

// ---------- Итоговый рисунок Земли (появляется по мере движения карандаша) ----------
// Этапы по порядку: круг → условные детали поверхности → светлая/ночная
// области → точка города на светлой стороне → короткая стрелка вращения.
// Вид сверху (как во вставке модели): лампа справа, светлая сторона справа,
// стрелка против часовой стрелки.
import { EARTH_STROKES, pencilTip, strokeStart, EARTH_TOTAL, EARTH_CENTER, EARTH_R, SHEET_H, SHEET_W } from "./earthPath";
export { EARTH_STROKES, pencilTip, strokeStart, EARTH_TOTAL, EARTH_CENTER, EARTH_R, SHEET_H, SHEET_W };

export const EarthSheetContent: React.FC<{ readonly len: number }> = ({ len }) => {
  let acc = 0;
  return (
    <SheetPaper>
      {EARTH_STROKES.map((s) => {
        const L = getLength(s.d);
        const done = Math.max(0, Math.min(L, len - acc));
        acc += L;
        if (done <= 0) return null;
        const complete = done >= L - 0.5;
        return (
          <path
            key={s.id}
            d={s.d}
            fill={complete && s.fill ? s.fill : "none"}
            fillOpacity={0.8}
            stroke={s.color}
            strokeWidth={s.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={complete ? undefined : `${done} ${L + 10}`}
          />
        );
      })}
    </SheetPaper>
  );
};

// Лист в мире (на столе — flat: сплющен перспективой; в руках — вертикально).
export const HouseSheet: React.FC<{ kind: "day" | "night" | "blank"; x: number; y: number; w: number; rot?: number; flat?: boolean; earthLen?: number }> = ({ kind, x, y, w, rot = 0, flat = false, earthLen = 0 }) => {
  const k = w / SHEET_W;
  const h = SHEET_H * k * (flat ? 0.26 : 1);
  return (
    <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`, transformOrigin: "50% 50%" })}>
      <svg width={w} height={h} viewBox={`0 0 ${SHEET_W} ${SHEET_H}`} preserveAspectRatio="none" style={{ display: "block", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.18))" }}>
        {kind === "day" ? <DaySheetContent /> : kind === "night" ? <NightSheetContent /> : earthLen > 0 ? <EarthSheetContent len={earthLen} /> : <BlankSheetContent />}
      </svg>
    </div>
  );
};
