// Рисунки реквизита фильма 80-1-8: карточка с ответом (текст набирается
// шрифтом с кириллицей и проявляется по мере движения карандаша), открытая
// папка «Наши вопросы», стопка чистых листов, карандаш, закрытый Коран на
// небольшой подставке (без букв и псевдоарабских строк). Рисунок Земли и
// бумажная лодочка — те же модели, что в 80-1-7 и 80-1-5.
import { fontFamily } from "../../fonts";
import { box } from "../core/shots";
import { BlankSheetContent, EARTH_TOTAL, EarthSheetContent, SHEET_H, SHEET_W } from "../film-1-7/drawings";
import { CARD_FONT, CARD_LAYOUT, CARD_UNITS, cardReveal } from "./card";

const PENCIL_INK = "#2E2D38";

// Содержимое карточки (единицы 300 × 200): чистая до начала письма; строки
// проявляются слева направо ровно до кончика карандаша (clipPath).
export const CardContent: React.FC<{ readonly progress: number; readonly uid: string }> = ({ progress, uid }) => {
  const reveal = cardReveal(progress);
  return (
    <>
      <rect x={0} y={0} width={CARD_UNITS.w} height={CARD_UNITS.h} rx={6} fill="#FFFDF6" stroke="#D8D0BE" strokeWidth={2} />
      <rect x={8} y={8} width={CARD_UNITS.w - 16} height={CARD_UNITS.h - 16} rx={4} fill="none" stroke="#EDE6D6" strokeWidth={1.5} />
      {CARD_LAYOUT.map((l, i) =>
        reveal[i] > 0.5 ? (
          <g key={i}>
            <clipPath id={`${uid}-line${i}`}>
              <rect x={l.x - 2} y={l.y - CARD_FONT} width={reveal[i] + 3} height={CARD_FONT * 1.4} />
            </clipPath>
            <text
              x={l.x}
              y={l.y}
              fontFamily={fontFamily}
              fontSize={CARD_FONT}
              fontWeight={700}
              fill={PENCIL_INK}
              textLength={l.len}
              lengthAdjust="spacingAndGlyphs"
              clipPath={`url(#${uid}-line${i})`}
            >
              {l.text}
            </text>
          </g>
        ) : null,
      )}
    </>
  );
};

// Открытая папка «Наши вопросы» (единицы 420 × 300): левая обложка с
// надписью и правая часть, куда кладут рисунки и карточку.
export const FOLDER_W = 420;
export const FOLDER_H = 300;
export const FolderContent: React.FC = () => (
  <>
    <rect x={0} y={0} width={FOLDER_W / 2} height={FOLDER_H} rx={8} fill="#C9A87C" stroke="#A9895F" strokeWidth={3} />
    <rect x={FOLDER_W / 2 - 4} y={0} width={FOLDER_W / 2 + 4} height={FOLDER_H} rx={8} fill="#D9BC92" stroke="#A9895F" strokeWidth={3} />
    <rect x={26} y={92} width={158} height={118} rx={10} fill="#FBF6EA" stroke="#A9895F" strokeWidth={2} />
    <text x={105} y={140} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={800} fill="#4B3A2A">
      Наши
    </text>
    <text x={105} y={184} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={800} fill="#4B3A2A">
      вопросы
    </text>
  </>
);

// Лист/карточка/папка в мире: w — ширина в px мира; flat 0…1 — сплющен
// перспективой (лежит на столе) или вертикален (в руках).
export const FlatSheet: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly units: { readonly w: number; readonly h: number };
  readonly flat?: number;
  readonly rot?: number;
  readonly shadow?: boolean;
  readonly children: React.ReactNode;
}> = ({ x, y, w, units, flat = 1, rot = 0, shadow = true, children }) => {
  const k = w / units.w;
  const h = units.h * k * (1 - 0.74 * flat);
  return (
    <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`, transformOrigin: "50% 50%" })}>
      <svg width={w} height={h} viewBox={`0 0 ${units.w} ${units.h}`} preserveAspectRatio="none" style={{ display: "block", filter: shadow ? "drop-shadow(0 2px 2px rgba(0,0,0,0.18))" : undefined }}>
        {children}
      </svg>
    </div>
  );
};

export const SHEET_UNITS = { w: SHEET_W, h: SHEET_H } as const;

export const EarthDrawing: React.FC<{ x: number; y: number; w: number; flat: number; rot: number }> = (p) => (
  <FlatSheet x={p.x} y={p.y} w={p.w} units={SHEET_UNITS} flat={p.flat} rot={p.rot}>
    <EarthSheetContent len={EARTH_TOTAL} />
  </FlatSheet>
);

export const BlankSheet: React.FC<{ x: number; y: number; w: number; flat: number; rot: number }> = (p) => (
  <FlatSheet x={p.x} y={p.y} w={p.w} units={SHEET_UNITS} flat={p.flat} rot={p.rot}>
    <BlankSheetContent />
  </FlatSheet>
);

// Стопка чистых листов на ковре (лежит плоско, видна сверху-сбоку).
export const Stack: React.FC<{ x: number; y: number; w: number; count: number }> = ({ x, y, w, count }) => (
  <div style={box({ left: 0, top: 0 })}>
    {Array.from({ length: Math.max(0, count) }, (_, i) => (
      <FlatSheet key={i} x={x + (i % 2) * 2} y={y - i * 2.2} w={w} units={SHEET_UNITS} flat={1} rot={(i % 2 ? -1 : 1) * 2} shadow={i === 0}>
        <BlankSheetContent />
      </FlatSheet>
    ))}
  </div>
);

// Карандаш в мире: кончик в точке (x, y); angle — наклон корпуса (градусы, 0 — вертикально).
export const Pencil: React.FC<{ x: number; y: number; angle: number }> = ({ x, y, angle }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <g transform={`rotate(${angle})`}>
      <rect x={-3} y={-54} width={6} height={50} fill="#F2C53D" stroke="#B88A1C" strokeWidth={1} />
      <path d="M -3 -4 L 0 4 L 3 -4 Z" fill="#E6CFA3" />
      <path d="M -1 1 L 0 4 L 1 1 Z" fill="#2B2B2B" />
      <rect x={-3} y={-58} width={6} height={5} fill="#E88B8B" />
    </g>
  </svg>
);

// Закрытый Коран: зелёная обложка с геометрической рамкой (без букв).
// tilt 0 — лежит плоско; 1 — стоит на подставке обложкой к зрителю.
export const QuranBook: React.FC<{ x: number; y: number; w: number; tilt: number }> = ({ x, y, w, tilt }) => {
  const hFlat = w * 0.34;
  const hUp = w * 0.72;
  const h = hFlat + (hUp - hFlat) * tilt;
  const r = w * 0.04;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      {/* страницы (срез) */}
      <rect x={-w / 2 + 3} y={-h / 2 + 4 * (1 - tilt)} width={w - 6} height={h} rx={r} fill="#F2E8D2" />
      <rect x={-w / 2} y={-h / 2 - 3} width={w} height={h} rx={r} fill="#2F6B4F" stroke="#245140" strokeWidth={1.5} />
      <rect x={-w / 2 + w * 0.1} y={-h / 2 - 3 + h * 0.12} width={w * 0.8} height={h * 0.76} rx={r} fill="none" stroke="#C9A961" strokeWidth={1.6} opacity={0.9} />
      <path d={`M 0 ${-h / 2 - 3 + h * 0.3} L ${w * 0.12} ${-h / 2 - 3 + h * 0.5} L 0 ${-h / 2 - 3 + h * 0.7} L ${-w * 0.12} ${-h / 2 - 3 + h * 0.5} Z`} fill="none" stroke="#C9A961" strokeWidth={1.4} opacity={0.9} />
      <rect x={-w / 2 + w * 0.08} y={-h / 2 - 3} width={4} height={h} fill="#245140" opacity={0.7} />
    </svg>
  );
};

// Небольшая подставка для книги (рехаль): две скрещённые дощечки.
export const BookStand: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <ellipse cx={0} cy={2} rx={w * 0.55} ry={5} fill="#000" opacity={0.12} />
    <path d={`M ${-w / 2} ${-w * 0.02} L ${w * 0.46} ${-w * 0.74} L ${w * 0.5} ${-w * 0.68} L ${-w * 0.46} ${0.04 * w} Z`} fill="#8A6240" stroke="#6E4C31" strokeWidth={1.2} />
    <path d={`M ${w / 2} ${-w * 0.02} L ${-w * 0.46} ${-w * 0.74} L ${-w * 0.5} ${-w * 0.68} L ${w * 0.46} ${0.04 * w} Z`} fill="#9A7050" stroke="#6E4C31" strokeWidth={1.2} />
  </svg>
);
