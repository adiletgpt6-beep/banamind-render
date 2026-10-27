// Бумажный мост: две одинаковые стопки книг (опоры), одинаковый пролёт и
// лист бумаги того же размера в обоих опытах.
//   • flat   — плоский лист: под машинкой прогибается (тем сильнее, чем
//              ближе машинка к середине пролёта);
//   • folded — тот же лист со сгибами вдоль пролёта: ровная центральная
//              дорожка и поднятые боковые бортики (жёлоб); почти не гнётся.
// Вид сбоку, мировые px. Лист опирается на обе стопки (края лежат на
// книгах), машинка стоит колёсами на дорожке и наклоняется по ней.
import { C } from "../theme";
import { ToyCar } from "./ToyCar";

export type BridgeGeo = {
  readonly cx: number; // середина пролёта
  readonly tableY: number; // поверхность стола
  readonly span: number; // расстояние между внутренними краями опор
  readonly bookW: number; // ширина стопки
  readonly stackH: number; // высота стопки
};

export const BRIDGE_SPINES = [C.navy, C.coral, C.blue] as const;

export const BookStack: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number }> = ({ x, y, w, h }) => {
  const n = 3;
  const bh = h / n;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const by = y - (i + 1) * bh;
        const inset = [0, 0.04, 0.02][i] * w;
        return (
          <g key={i}>
            <rect x={x + inset} y={by} width={w - inset * 2} height={bh} rx={bh * 0.12} fill={BRIDGE_SPINES[i]} />
            <rect x={x + inset + w * 0.08} y={by + bh * 0.22} width={(w - inset * 2) * 0.84} height={bh * 0.14} fill="#FFFFFF" opacity={0.35} />
            <rect x={x + inset + w * 0.08} y={by + bh * 0.62} width={(w - inset * 2) * 0.84} height={bh * 0.08} fill="#FFFFFF" opacity={0.22} />
          </g>
        );
      })}
    </g>
  );
};

// Прогиб плоского листа в точке x при машинке в carX (доля пролёта 0…1).
export const deckY = (g: BridgeGeo, mode: "flat" | "folded", x: number, carX: number | null, sag: number) => {
  const top = g.tableY - g.stackH;
  const x0 = g.cx - g.span / 2;
  const x1 = g.cx + g.span / 2;
  if (x <= x0 || x >= x1) return top;
  const u = (x - x0) / g.span;
  const a = carX === null ? 0.5 : Math.max(0.02, Math.min(0.98, (carX - x0) / g.span));
  // форма прогиба под сосредоточенной нагрузкой (две ветви, плавно)
  const shape = u <= a ? Math.sin((Math.PI / 2) * (u / a)) : Math.sin((Math.PI / 2) * ((1 - u) / (1 - a)));
  const load = carX === null ? 0 : Math.sin(Math.PI * a);
  const amp = (mode === "flat" ? sag : sag * 0.06) * load;
  return top + amp * shape;
};

export const BridgeSide: React.FC<{
  readonly g: BridgeGeo;
  readonly mode: "flat" | "folded";
  readonly sag: number; // наибольший прогиб (px) под машинкой в середине
  readonly carX?: number | null; // положение машинки (середина), мировые px
  readonly carLen: number;
  readonly carRoll?: number;
  readonly carLift?: number; // машинку подняли рукой (px над дорожкой)
  readonly carTiltExtra?: number;
  readonly showDeck?: boolean;
  readonly deckOpacity?: number;
}> = ({ g, mode, sag, carX = null, carLen, carRoll = 0, carLift = 0, carTiltExtra = 0, showDeck = true, deckOpacity = 1 }) => {
  const over = g.bookW * 0.62; // лист лежит на книгах
  const xa = g.cx - g.span / 2 - over;
  const xb = g.cx + g.span / 2 + over;
  // на пролёте (между опорами) лист прогибается под машинкой; на стопках —
  // машинка стоит на краю листа, лежащем на книгах; дальше — на столе
  const x0 = g.cx - g.span / 2;
  const x1 = g.cx + g.span / 2;
  const carOnDeck = carX !== null && carX > x0 && carX < x1 && carLift < 1;
  const onSupport = carX !== null && carX >= x0 - g.bookW && carX <= x1 + g.bookW;
  const yAt = (x: number) => deckY(g, mode, x, carOnDeck ? carX : null, sag);
  const N = 40;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const x = xa + ((xb - xa) * i) / N;
    return [x, yAt(x)] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const th = Math.max(0.5, g.span * 0.011); // толщина листа
  const sw = Math.max(0.25, g.span * 0.0038); // контур
  const wall = mode === "folded" ? carLen * 0.13 : 0;
  const deck = pts.map(([x, y]) => `${x.toFixed(2)},${(y - 0.5).toFixed(2)}`).join(" ") + " " + [...pts].reverse().map(([x, y]) => `${x.toFixed(2)},${(y + th).toFixed(2)}`).join(" ");
  const wallPoly = pts.map(([x, y]) => `${x.toFixed(2)},${(y - wall).toFixed(2)}`).join(" ") + " " + [...pts].reverse().map(([x, y]) => `${x.toFixed(2)},${(y + th).toFixed(2)}`).join(" ");
  let car: React.ReactNode = null;
  if (carX !== null) {
    const y0 = yAt(carX - carLen * 0.29);
    const y1 = yAt(carX + carLen * 0.29);
    const tilt = (Math.atan2(y1 - y0, carLen * 0.58) * 180) / Math.PI;
    const base = onSupport ? (y0 + y1) / 2 : g.tableY;
    car = <ToyCar x={carX} y={base - carLift} len={carLen} tilt={tilt * (1 - Math.min(1, carLift / 20)) + carTiltExtra} roll={carRoll} />;
  }
  return (
    <g>
      <BookStack x={g.cx - g.span / 2 - g.bookW} y={g.tableY} w={g.bookW} h={g.stackH} />
      <BookStack x={g.cx + g.span / 2} y={g.tableY} w={g.bookW} h={g.stackH} />
      {showDeck ? (
        <g opacity={deckOpacity}>
          {/* дальний бортик (за машинкой) */}
          {wall ? <polygon points={wallPoly} fill="#ECE7DB" stroke={C.sheetEdge} strokeWidth={sw} strokeLinejoin="round" /> : null}
          <polygon points={deck} fill={C.sheet} stroke={C.sheetEdge} strokeWidth={sw} strokeLinejoin="round" />
          <path d={line} fill="none" stroke="#CFC8B8" strokeWidth={sw * 0.7} />
        </g>
      ) : null}
      {car}
      {showDeck && wall ? (
        <g opacity={deckOpacity}>
          {/* ближний бортик: перед колёсами, линия сгиба внизу */}
          <polygon points={wallPoly} fill={C.sheet} stroke={C.sheetEdge} strokeWidth={sw} strokeLinejoin="round" opacity={0.96} />
          <path d={pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(2)} ${(y + th * 0.25).toFixed(2)}`).join(" ")} fill="none" stroke="#D7D0BF" strokeWidth={sw * 0.8} strokeDasharray={`${g.span * 0.015} ${g.span * 0.012}`} />
        </g>
      ) : null}
    </g>
  );
};

// Разрез сложенного листа (жёлоб): ровная дорожка и бортики — на карточке-
// выноске. (0, 0) — центр, ширина w.
export const ChannelSection: React.FC<{ readonly w: number; readonly fold: number }> = ({ w, fold }) => {
  const k = w / 100;
  const a = (fold * 80 * Math.PI) / 180; // угол подъёма бортика
  const side = 26;
  const lx = -26 - Math.cos(a) * side;
  const ly = -Math.sin(a) * side;
  return (
    <g transform={`scale(${k})`}>
      <path d={`M ${lx} ${ly} L -26 0 L 26 0 L ${-lx} ${ly}`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={-26} cy={0} r={3} fill={C.blue} />
      <circle cx={26} cy={0} r={3} fill={C.blue} />
    </g>
  );
};

// Лист сверху во время сгибания: центральная дорожка и две боковые полосы
// поднимаются по линиям сгиба (fold 0…1). (0, 0) — центр листа, размер
// w × h (длина листа — по горизонтали). Возвращает и точки краёв, за
// которые держат руки.
export const foldEdges = (w: number, h: number, fold: number) => {
  const band = h * 0.24;
  const a = (fold * 80 * Math.PI) / 180;
  const proj = band * Math.cos(a);
  const lift = band * Math.sin(a) * 0.35; // лёгкая перспектива: край «ближе»
  return { top: -h / 2 + band - proj - lift, bottom: h / 2 - band + proj + lift * 0.4, band, proj };
};

export const FoldSheetTop: React.FC<{ readonly w: number; readonly h: number; readonly fold: number; readonly guides?: number }> = ({ w, h, fold, guides = 1 }) => {
  const { top, bottom, band } = foldEdges(w, h, fold);
  const shade = Math.round(255 - 26 * fold);
  const sideFill = `rgb(${shade},${shade - 2},${shade - 10})`;
  return (
    <g>
      <rect x={-w / 2 + 6} y={top + 8} width={w} height={bottom - top} fill="rgba(23,23,23,0.12)" />
      {/* боковые полосы (бортики) */}
      <rect x={-w / 2} y={top} width={w} height={-h / 2 + band - top} fill={sideFill} stroke={C.sheetEdge} strokeWidth={2} />
      <rect x={-w / 2} y={h / 2 - band} width={w} height={bottom - (h / 2 - band)} fill={sideFill} stroke={C.sheetEdge} strokeWidth={2} />
      {/* дорожка */}
      <rect x={-w / 2} y={-h / 2 + band} width={w} height={h - band * 2} fill={C.sheet} stroke={C.sheetEdge} strokeWidth={2} />
      {/* линии сгиба */}
      {[-h / 2 + band, h / 2 - band].map((y) => (
        <line key={y} x1={-w / 2 + 4} y1={y} x2={w / 2 - 4} y2={y} stroke={C.blue} strokeWidth={3} strokeDasharray="14 10" opacity={guides} />
      ))}
    </g>
  );
};
