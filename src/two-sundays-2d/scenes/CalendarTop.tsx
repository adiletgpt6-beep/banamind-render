// Общий план «лист сверху»: столешница, календарь, карандаши. Используется
// в сценах 1, 2, 9, 10, 11 (тот же лист, те же предметы).
import { CalendarArt, CAL_H, CAL_POINTS, CAL_W } from "../props/Calendar";
import { box, Svg } from "../kit";
import { C } from "../theme";

// Положение листа в мире плана сверху (левый верхний угол) и ширина.
export const TOP = { x: 90, y: 360, w: 900 } as const;
export const topK = TOP.w / CAL_W;
// Точка листа (единицы листа) → мир плана.
export const onSheet = (pt: { x: number; y: number }) => ({ x: TOP.x + pt.x * topK, y: TOP.y + pt.y * topK });
export const SHEET_CENTER = onSheet(CAL_POINTS.center);
export const SHEET_H = CAL_H * topK;

export const Desk: React.FC<{ readonly wood?: string; readonly grain?: string }> = ({ wood = C.woodLight, grain = "rgba(150,105,60,0.12)" }) => (
  <div style={box({ left: -1200, top: -1200, width: 3500, height: 4400, backgroundColor: wood, backgroundImage: `repeating-linear-gradient(0deg, ${grain} 0 3px, transparent 3px 90px)` })} />
);

// Карандаши на столе (сверху): лежат справа от листа.
export const Pencils: React.FC<{ readonly x?: number; readonly y?: number }> = ({ x = TOP.x + TOP.w + 30, y = TOP.y + 200 }) => (
  <Svg>
    {[C.kidRed, C.kidBlue, C.kidGreen, C.orange].map((c, i) => (
      <g key={c} transform={`translate(${x + i * 34} ${y + i * 60}) rotate(${80 + i * 4})`}>
        <rect x={-110} y={-11} width={190} height={22} fill={c} />
        <path d="M 80 -11 L 112 0 L 80 11 Z" fill="#E8C89A" />
        <path d="M 102 -4 L 112 0 L 102 4 Z" fill={C.ink} />
      </g>
    ))}
  </Svg>
);

export const SheetTop: React.FC<{ readonly ring3?: number; readonly ring7?: number; readonly ray?: number; readonly play?: number }> = (p) => (
  <Svg>
    <g transform={`translate(${TOP.x} ${TOP.y})`}>
      <CalendarArt w={TOP.w} {...p} />
    </g>
  </Svg>
);

// Карандаш в руке сверху: tip — кончик (мир), ang — наклон (градусы).
export const PencilTop: React.FC<{ readonly tip: { x: number; y: number }; readonly ang?: number; readonly color?: string; readonly scale?: number }> = ({ tip, ang = -60, color = C.orange, scale = 1 }) => (
  <Svg>
    <g transform={`translate(${tip.x} ${tip.y}) rotate(${ang}) scale(${scale})`}>
      <path d="M 0 0 L 34 -12 L 34 12 Z" fill="#E8C89A" />
      <path d="M 0 0 L 12 -4 L 12 4 Z" fill={C.ink} />
      <rect x={34} y={-12} width={260} height={24} fill={color} />
      <rect x={294} y={-12} width={30} height={24} fill="#F4C8D0" />
    </g>
  </Svg>
);
