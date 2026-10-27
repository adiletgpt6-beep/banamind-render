// Ноутбук Айжан в плане через её плечо (проектные px карточки 940 × ≈1060).
// Тот же ноутбук, что в общем плане (sets/Office.tsx, LaptopFront): крышка
// с экраном на шарнире, основание с клавиатурой и тачпадом на столе. Слева
// на переднем плане — затылок (каре) и плечо Айжан; её кисти лежат на
// клавиатуре:
//   rest  — кисти спокойно лежат по краям клавиатуры;
//   type  — ладони над клавишами, пальцы короткими сериями нажимают клавиши
//           (нажатая клавиша темнеет), запястья почти неподвижны;
//   pad   — правая кисть на тачпаде: указательный палец ведёт курсор и
//           нажимает (click), левая лежит.
// Содержимое экрана рисуется сценой в координатах SCREEN (940 × 818).
import { LOOKS } from "../rig/looks";
import { clamp, lerp } from "../rig/motion";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
export const SCREEN = { w: 940, h: 818 } as const;

// Геометрия в px карточки.
const LID = { x: 200, y: 64, w: 720, h: 640 };
const SCR = { x: LID.x + 22, y: LID.y + 22, w: LID.w - 44, h: LID.h - 44 };
const SCALE = SCR.w / SCREEN.w;
// основание: задняя кромка (у шарнира) и передняя кромка (к Айжан)
const BASE = { top: LID.y + LID.h, bottom: 968, backL: LID.x, backR: LID.x + LID.w, frontL: 120, frontR: 1000 };
// точка на основании: u — слева направо 0…1, v — от шарнира (0) к краю (1)
const at = (u: number, v: number) => {
  const l = lerp(BASE.backL, BASE.frontL, v);
  const r = lerp(BASE.backR, BASE.frontR, v);
  return { x: lerp(l, r, u), y: lerp(BASE.top, BASE.bottom, v) };
};
const quad = (u: number, v: number, du: number, dv: number) => {
  const p = [at(u, v), at(u + du, v), at(u + du, v + dv), at(u, v + dv)];
  return `M ${p.map((q) => `${q.x} ${q.y}`).join(" L ")} Z`;
};
// клавиши: 5 рядов × 13
const ROWS = 5;
const COLS = 13;
const KEY_V0 = 0.08;
const KEY_DV = 0.105;
const KEY_U0 = 0.07;
const KEY_DU = 0.066;
// тачпад
const PAD = { u: 0.37, v: 0.66, du: 0.26, dv: 0.26 };
// клавиша под кончиком пальца
const keyAt = (u: number, v: number) => ({ c: Math.floor((u - KEY_U0) / KEY_DU), r: Math.floor((v - KEY_V0) / KEY_DV) });

export type HandsState =
  | { readonly mode: "rest" }
  | { readonly mode: "type"; readonly tapL: number; readonly tapR: number; readonly shift?: number }
  | { readonly mode: "pad"; readonly px: number; readonly py: number; readonly press: number }; // px, py — 0…1 по тачпаду

const L = LOOKS.aizhan;

// Кисть, вид сверху-сзади (из-за плеча): тыльная сторона ладони от
// запястья к костяшкам, четыре пальца к экрану — каждый над своей клавишей
// (шаг пальцев ≈ ширина клавиши, как у настоящей руки), большой палец к
// пробелу. Пальцы чуть согнуты (вторая фаланга короче в проекции); при
// нажатии палец опускается на клавишу — в проекции становится короче,
// кончик темнее; соседние пальцы чуть приподнимаются.
// u, v — запястье на основании; tap — номер нажимающего пальца (0 —
// указательный … 3 — мизинец) или −1.
export const FINGER_STEP = 46; // px карточки при v = 0.46
const Hand: React.FC<{ u: number; v: number; side: -1 | 1; tap: number; point?: boolean; press?: number; relaxed?: boolean }> = ({ u, v, side, tap, point = false, press = 0, relaxed = false }) => {
  const w = at(u, v);
  const s = lerp(0.9, 1.12, v); // ближе к краю — крупнее
  const step = FINGER_STEP * s;
  const kn = { y: w.y - 58 * s }; // линия костяшек
  const fingers = [0, 1, 2, 3].map((i) => {
    const k = (1.5 - i) * -side; // 0 — указательный (к центру клавиатуры)
    const isPoint = point && i === 0;
    const base = [44, 49, 46, 36][i] * s * (relaxed ? 0.86 : 1);
    const curl = point && !isPoint ? 0.4 : isPoint ? 1.25 : 1; // остальные поджаты, когда ведёт указательный
    const pressing = isPoint ? press : tap === i ? 1 : 0;
    const lifted = !isPoint && tap >= 0 && tap !== i && Math.abs(tap - i) === 1 ? 1 : 0;
    const len = base * curl * (1 - 0.22 * pressing) + lifted * 4 * s;
    const x0 = w.x + k * step * 0.86;
    const y0 = kn.y + Math.abs(k) * 7 * s; // дуга костяшек
    const x1 = x0 + k * 2 * s; // пальцы почти параллельны
    const y1 = y0 - len;
    return { i, x0, y0, x1, y1, w: [25, 26, 24, 20][i] * s, pressing };
  });
  const back = `M ${w.x - side * 40 * s} ${w.y + 10 * s}
    C ${w.x - side * 62 * s} ${w.y - 20 * s}, ${w.x - side * 82 * s} ${kn.y + 26 * s}, ${w.x - side * 78 * s} ${kn.y + 6 * s}
    Q ${w.x} ${kn.y - 16 * s} ${w.x + side * 78 * s} ${kn.y + 6 * s}
    C ${w.x + side * 74 * s} ${kn.y + 30 * s}, ${w.x + side * 56 * s} ${w.y - 10 * s}, ${w.x + side * 40 * s} ${w.y + 10 * s} Z`;
  // большой палец: от края ладони у запястья к пробелу (к центру)
  const tb = { x: w.x - side * 30 * s, y: w.y - 6 * s };
  const tt = { x: w.x - side * 70 * s, y: w.y - 34 * s };
  return (
    <g>
      {fingers.map((p) => {
        const mid = { x: (p.x0 + p.x1) / 2 + side * 1.5, y: (p.y0 + p.y1) / 2 };
        const d = `M ${p.x0} ${p.y0 + 10 * s} Q ${mid.x} ${mid.y} ${p.x1} ${p.y1}`;
        return (
          <g key={p.i}>
            {/* тень пальца на клавишах */}
            <path d={d} transform={`translate(${-side * 4} 8)`} stroke="rgba(20,24,34,0.25)" strokeWidth={p.w} strokeLinecap="round" fill="none" />
            <path d={d} stroke={L.skinShade} strokeWidth={p.w + 3} strokeLinecap="round" fill="none" />
            <path d={d} stroke={L.skin} strokeWidth={p.w} strokeLinecap="round" fill="none" />
            {/* сгиб второй фаланги */}
            <path d={`M ${lerp(p.x0, p.x1, 0.55) - p.w * 0.28} ${lerp(p.y0, p.y1, 0.55)} q ${p.w * 0.28} 3 ${p.w * 0.56} 0`} stroke={L.skinShade} strokeWidth={2} fill="none" opacity={0.6} />
            {/* ноготь; при нажатии кончик прижат к клавише */}
            <ellipse cx={p.x1} cy={p.y1 + p.w * 0.12} rx={p.w * 0.3} ry={p.w * 0.24} fill={p.pressing > 0.5 ? "#E9B894" : "#F6D9C2"} />
          </g>
        );
      })}
      {/* тыльная сторона ладони */}
      <path d={back} fill={L.skin} stroke={L.skinShade} strokeWidth={2.5} />
      <path d={`M ${tb.x} ${tb.y} Q ${tb.x - side * 30 * s} ${tb.y - 4 * s} ${tt.x} ${tt.y}`} stroke={L.skinShade} strokeWidth={29 * s} strokeLinecap="round" fill="none" />
      <path d={`M ${tb.x} ${tb.y} Q ${tb.x - side * 30 * s} ${tb.y - 4 * s} ${tt.x} ${tt.y}`} stroke={L.skin} strokeWidth={26 * s} strokeLinecap="round" fill="none" />

      {/* костяшки и сухожилия — едва заметно */}
      {fingers.map((p) => (
        <g key={`k${p.i}`} opacity={0.55}>
          <path d={`M ${p.x0} ${p.y0 + 6 * s} L ${lerp(p.x0, w.x, 0.55)} ${lerp(p.y0, w.y, 0.55)}`} stroke={L.skinShade} strokeWidth={1.6} />
          <circle cx={p.x0} cy={p.y0 + 4 * s} r={3 * s} fill={L.skinShade} opacity={0.6} />
        </g>
      ))}
    </g>
  );
};

// Рукав и предплечье от края кадра к запястью.
const Forearm: React.FC<{ u: number; v: number; from: { x: number; y: number } }> = ({ u, v, from }) => {
  const w = at(u, v);
  return (
    <g>
      <path d={`M ${from.x} ${from.y} L ${w.x} ${w.y + 18}`} stroke={L.topShade} strokeWidth={86} strokeLinecap="round" />
      <path d={`M ${from.x} ${from.y} L ${lerp(from.x, w.x, 0.86)} ${lerp(from.y, w.y + 18, 0.86)}`} stroke={L.topColor} strokeWidth={76} strokeLinecap="round" />
      <path d={`M ${lerp(from.x, w.x, 0.78)} ${lerp(from.y, w.y, 0.78)} L ${w.x} ${w.y + 8}`} stroke={L.skinShade} strokeWidth={56} strokeLinecap="round" />
      <path d={`M ${lerp(from.x, w.x, 0.78)} ${lerp(from.y, w.y, 0.78)} L ${w.x} ${w.y + 8}`} stroke={L.skin} strokeWidth={52} strokeLinecap="round" />
    </g>
  );
};

export const LaptopOver: React.FC<{
  readonly screen: React.ReactNode;
  readonly hands: HandsState;
  readonly glow?: number;
}> = ({ screen, hands, glow = 1 }) => {
  // положение кистей
  let lh = { u: 0.25, v: 0.72, tap: -1 };
  let rh = { u: 0.73, v: 0.72, tap: -1, point: false, press: 0 };
  if (hands.mode === "type") {
    const sh = hands.shift ?? 0;
    lh = { u: 0.31 + sh * 0.02, v: 0.66, tap: hands.tapL };
    rh = { u: 0.67 - sh * 0.015, v: 0.66, tap: hands.tapR, point: false, press: 0 };
  } else if (hands.mode === "pad") {
    lh = { u: 0.25, v: 0.72, tap: -1 };
    rh = { u: PAD.u + PAD.du * clamp(hands.px) + 0.03, v: PAD.v + PAD.dv * clamp(hands.py) + 0.2, tap: -1, point: true, press: hands.press };
  }
  // нажатые клавиши под кончиками пальцев
  const pressed: { r: number; c: number }[] = [];
  if (hands.mode === "type") {
    for (const [h, side] of [[lh, -1], [rh, 1]] as const) {
      if (h.tap < 0) continue;
      // кончик нажимающего пальца (как в Hand): над рядом клавиш
      const wpt = at(h.u, h.v);
      const s = lerp(0.9, 1.12, h.v);
      const tipX = wpt.x + (1.5 - h.tap) * -side * FINGER_STEP * s * 0.86;
      const tipY = wpt.y - 58 * s - [44, 49, 46, 36][h.tap] * s * 0.78;
      const vv = (tipY - BASE.top) / (BASE.bottom - BASE.top);
      const l = lerp(BASE.backL, BASE.frontL, vv);
      const r = lerp(BASE.backR, BASE.frontR, vv);
      pressed.push(keyAt((tipX - l) / (r - l), vv));
    }
  }
  const keys: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const on = pressed.some((p) => p.r === r && p.c === c);
      // нижний ряд: пробел шире
      if (r === ROWS - 1 && c > 3 && c < 9) {
        if (c === 4) keys.push(<path key={`${r}-${c}`} d={quad(KEY_U0 + 4 * KEY_DU, KEY_V0 + r * KEY_DV, KEY_DU * 5 - 0.01, KEY_DV - 0.025)} fill={pressed.some((p) => p.r === r && p.c > 3 && p.c < 9) ? "#1F2430" : "#353C4B"} />);
        continue;
      }
      keys.push(<path key={`${r}-${c}`} d={quad(KEY_U0 + c * KEY_DU, KEY_V0 + r * KEY_DV, KEY_DU - 0.01, KEY_DV - 0.025)} fill={on ? "#1F2430" : "#353C4B"} />);
    }
  }
  const padPress = hands.mode === "pad" ? hands.press : 0;
  return (
    <div style={box({ inset: 0, overflow: "hidden", background: "linear-gradient(180deg, #E4E9F0, #EEF1F5)" })}>
      {/* окно кабинета за ноутбуком */}
      <div style={box({ left: 690, top: -30, width: 320, height: 300, borderRadius: 8, background: "linear-gradient(180deg, #BFD6EA, #E8EEF3)", border: "12px solid #C3CDD8" })} />
      {/* стол */}
      <div style={box({ left: 0, top: 760, width: 940, height: 400, background: "linear-gradient(180deg, #D9C3A5, #CDB595)" })} />
      <svg width={940} height={1060} style={box({ left: 0, top: 0, overflow: "visible" })}>
        {/* основание: верх, клавиатура, тачпад, передняя кромка */}
        <path d={`M ${BASE.backL} ${BASE.top} L ${BASE.backR} ${BASE.top} L ${BASE.frontR} ${BASE.bottom} L ${BASE.frontL} ${BASE.bottom} Z`} fill="#C3C9D4" />
        <path d={`M ${BASE.frontL} ${BASE.bottom} L ${BASE.frontR} ${BASE.bottom} L ${BASE.frontR - 6} ${BASE.bottom + 18} L ${BASE.frontL + 6} ${BASE.bottom + 18} Z`} fill="#8E97A8" />
        <path d={quad(0.05, 0.05, 0.9, ROWS * KEY_DV + 0.03)} fill="#A9B1BF" />
        {keys}
        <path d={quad(PAD.u, PAD.v, PAD.du, PAD.dv)} fill={padPress > 0.5 ? "#9AA3B2" : "#AEB6C3"} stroke="#9AA3B2" strokeWidth={2} />
        {/* крышка: рамка экрана и шарнир */}
        <rect x={LID.x} y={LID.y} width={LID.w} height={LID.h} rx={22} fill="#1E2430" />
        <rect x={LID.x + 60} y={LID.y + LID.h - 6} width={LID.w - 120} height={12} rx={6} fill="#7E8798" />
      </svg>
      {/* экран (контент сцены) */}
      <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, overflow: "hidden", borderRadius: 8, opacity: glow })}>
        <div style={box({ left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${SCALE})`, transformOrigin: "0 0" })}>{screen}</div>
      </div>
      {/* затылок и плечо Айжан (передний план слева) */}
      <svg width={940} height={1060} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <Forearm u={lh.u} v={lh.v} from={{ x: 40, y: 1120 }} />
        <Forearm u={rh.u} v={rh.v} from={{ x: 880, y: 1140 }} />
        <Hand u={lh.u} v={lh.v} side={-1} tap={lh.tap} relaxed={hands.mode !== "type"} />
        <Hand u={rh.u} v={rh.v} side={1} tap={rh.tap} point={rh.point} press={rh.press} relaxed={hands.mode === "rest"} />
        {/* плечо и спина в кардигане */}
        <path d="M -120 1080 L -120 660 Q -60 560 70 560 Q 170 570 190 700 Q 200 860 120 1080 Z" fill={L.topColor} />
        <path d="M 60 560 Q 120 600 150 680" stroke={L.topShade} strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* затылок: каре до плеч */}
        <path d="M -150 400 Q -150 150 40 150 Q 210 150 210 380 L 214 560 Q 90 600 -40 590 L -150 560 Z" fill={L.hair} />
        <path d="M 150 250 Q 196 330 196 470" stroke="rgba(255,255,255,0.08)" strokeWidth={10} fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// Экранная точка (0…1) → координаты экрана SCREEN для указателя.
export const screenPoint = (x: number, y: number) => ({ x: x * SCREEN.w, y: y * SCREEN.h });
