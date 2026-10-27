// Квартира семьи в Бишкеке: кухня-прихожая одной комнатой.
// Слева — белый холодильник боком к зрителю; на его боковой стенке —
// магнитный крючок с яркой связкой ключей (никакой еды в кадре). Правее —
// комод с папками и пробковая доска с записками, входная дверь, окно на
// горы Ала-Тоо и панельные дома, справа — стол, где вечером родители
// составляют план. Пол (низ стены) — y = 1520; стоящие — ступнями на
// y = 1600. Координаты одинаковы во всех сценах (предметы не «прыгают»).
import { box } from "../shots";
import { clamp, lerp } from "../rig/motion";
import { fontFamily } from "../../../fonts";
import { BG11_TEXT } from "../script";

export const C = {
  yellow: "#FFC414",
  yellowSoft: "#FFF1BF",
  navy: "#14285A",
  ink: "#1E2235",
  white: "#FFFFFF",
} as const;

export const K = {
  floorY: 1520,
  standY: 1600,
  seatY: 1600, // ступни сидящих за столом
  fridge: { x: 110, w: 300, top: 520, bottom: 1560 },
  hook: { x: 262, y: 1036 },
  dresser: { x: 600, w: 410, top: 1252, bottom: 1560 },
  board: { x: 616, y: 716, w: 340, h: 290 },
  door: { x: 1120, y: 630, w: 220, h: 930 },
  window: { x: 1470, y: 560, w: 320, h: 450 },
  clock: { x: 1405, y: 470, r: 56 },
  table: { x: 1520, w: 640, top: 1262, front: 1290, bottom: 1590 },
  seat: { mom: 1700, dad: 1980 },
  lamp: { x: 1840 },
} as const;

// Масштаб крючка и связки на холодильнике (чуть крупнее жизни — ключи
// должны читаться на общем плане).
export const HOOK_S = 1.35;
export const KEYS_S = 1.5;

// Высота сиденья стула (px от пола) для роста h.
export const seatH = (h: number) => 0.27 * h;

// ---------- Связка ключей на магнитном крючке ----------
// Рисуется вокруг точки подвеса кольца (0, 0) в единицах ~1 px мира.
// swing — угол качания (градусы).
export const KeyBunch: React.FC<{ readonly swing?: number; readonly s?: number }> = ({ swing = 0, s = 1 }) => (
  <g transform={`scale(${s}) rotate(${swing})`}>
    {/* кольцо */}
    <circle cx={0} cy={16} r={15} fill="none" stroke="#9AA3B2" strokeWidth={4.5} />
    <circle cx={0} cy={16} r={15} fill="none" stroke="#E6EAF0" strokeWidth={1.5} />
    {/* жёлтая звёздочка-брелок */}
    <g transform="translate(-20 30) rotate(18)">
      <line x1={0} y1={-12} x2={6} y2={-2} stroke="#9AA3B2" strokeWidth={2} />
      <path d="M 0 0 L 6 12 L 19 13 L 9 21 L 13 34 L 0 26 L -13 34 L -9 21 L -19 13 L -6 12 Z" fill={C.yellow} stroke="#E0A400" strokeWidth={1.5} />
    </g>
    {/* золотистый ключ */}
    <g transform="translate(-4 30) rotate(12)">
      <circle cx={0} cy={6} r={9} fill="#E7B843" stroke="#C99A2A" strokeWidth={1.5} />
      <circle cx={0} cy={4} r={3} fill="#FFFFFF" />
      <path d="M -3 14 L 3 14 L 3 58 L 9 58 L 9 64 L 3 64 L 3 70 L 7 70 L 7 76 L -3 76 Z" fill="#E7B843" stroke="#C99A2A" strokeWidth={1.2} />
    </g>
    {/* серебристый ключ с синей головкой */}
    <g transform="translate(6 30) rotate(-8)">
      <rect x={-9} y={0} width={18} height={18} rx={6} fill="#4C7BD9" />
      <path d="M -3 16 L 3 16 L 3 62 L 8 62 L 8 67 L 3 67 L 3 72 L 6 72 L 6 77 L -3 77 Z" fill="#CDD3DC" stroke="#9AA3B2" strokeWidth={1.2} />
    </g>
    {/* брелок машины */}
    <g transform="translate(14 28) rotate(-22)">
      <rect x={-10} y={4} width={22} height={40} rx={9} fill="#2B2F3A" />
      <circle cx={1} cy={16} r={3.5} fill="#5B6275" />
      <circle cx={1} cy={28} r={3.5} fill="#5B6275" />
      <rect x={-4} y={40} width={10} height={20} rx={2} fill="#B8BFCA" />
    </g>
    {/* коралловая кисточка */}
    <g transform="translate(22 26) rotate(-34)">
      <rect x={-4} y={0} width={8} height={8} rx={2} fill="#E5677A" />
      <path d="M -6 8 L 6 8 L 9 40 L -9 40 Z" fill="#F07A8C" />
      <path d="M -4 14 L -5 38 M 0 14 L 0 39 M 4 14 L 5 38" stroke="#D4566A" strokeWidth={1.4} />
    </g>
  </g>
);

// Магнитный крючок (тёмно-синий круглый магнит и хромированный крючок).
// (0, 0) — центр магнита; кольцо ключей висит в точке (0, 30).
export const MagnetHook: React.FC<{ readonly s?: number; readonly hookColor?: string; readonly glow?: number }> = ({ s = 1, hookColor = "#B9C1CD", glow = 0 }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={2} cy={3} rx={20} ry={20} fill="rgba(30,40,60,0.15)" />
    <circle cx={0} cy={0} r={19} fill={C.navy} />
    <circle cx={-5} cy={-6} r={6} fill="rgba(255,255,255,0.25)" />
    <path d="M 0 8 L 0 26 Q 0 38 10 38 Q 18 38 18 28" stroke={hookColor} strokeWidth={6} fill="none" strokeLinecap="round" />
    {glow > 0 ? <path d="M 0 8 L 0 26 Q 0 38 10 38 Q 18 38 18 28" stroke={C.yellow} strokeWidth={10} fill="none" strokeLinecap="round" opacity={glow} /> : null}
  </g>
);

// Боковая стенка холодильника с крючком; ключи висят, пока keys = true.
export const Fridge: React.FC<{ readonly keys: boolean; readonly swing?: number; readonly evening?: number }> = ({ keys, swing = 0, evening = 0 }) => {
  const fr = K.fridge;
  const side = evening > 0.5 ? "#E9E6E0" : "#FBFBFA";
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      {/* тень на стене */}
      <div style={box({ left: fr.x + fr.w - 8, top: fr.top + 20, width: 60, height: fr.bottom - fr.top - 30, background: "linear-gradient(90deg, rgba(60,50,40,0.16), transparent)" })} />
      {/* боковая стенка */}
      <div style={box({ left: fr.x, top: fr.top, width: fr.w, height: fr.bottom - fr.top, borderRadius: "18px 10px 6px 6px", backgroundColor: side, border: "3px solid #D5DAE2", boxSizing: "border-box", boxShadow: "inset -14px 0 0 rgba(200,206,215,0.55), inset 0 -18px 0 rgba(170,176,186,0.35)" })} />
      {/* узкая передняя кромка с ручкой */}
      <div style={box({ left: fr.x - 26, top: fr.top + 4, width: 28, height: fr.bottom - fr.top - 4, borderRadius: "14px 0 0 6px", backgroundColor: "#E8EBF0" })} />
      <div style={box({ left: fr.x - 26, top: fr.top + 330, width: 28, height: 6, backgroundColor: "#CBD1DA" })} />
      {/* декоративная полоска и магнит-рисунок ребёнка */}
      <div style={box({ left: fr.x + 40, top: fr.top + 120, width: 120, height: 90, rotate: "-4deg", backgroundColor: "#FFFFFF", boxShadow: "0 3px 8px rgba(40,50,70,0.15)" })}>
        <svg width={120} height={90} viewBox="0 0 120 90">
          <circle cx={92} cy={22} r={12} fill={C.yellow} />
          <path d="M 8 80 L 40 40 L 62 66 L 80 50 L 112 80 Z" fill="#8EC5FF" />
          <path d="M 30 52 L 40 40 L 48 50 Z" fill="#FFFFFF" />
        </svg>
      </div>
      <div style={box({ left: fr.x + 92, top: fr.top + 110, width: 16, height: 16, borderRadius: 8, backgroundColor: "#E5677A" })} />
      {/* крючок и ключи */}
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`translate(${K.hook.x} ${K.hook.y})`}>
          <MagnetHook s={HOOK_S} />
          {keys ? (
            <g transform={`translate(${14 * HOOK_S} ${30 * HOOK_S})`}>
              <KeyBunch swing={swing} s={KEYS_S} />
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
};

// Горы Ала-Тоо и панельные дома за окном.
const WindowView: React.FC<{ readonly w: number; readonly h: number; readonly evening: number }> = ({ w, h, evening }) => {
  const e = evening > 0.5;
  return (
    <svg width={w} height={h} viewBox="0 0 320 450" preserveAspectRatio="none">
      <rect width={320} height={450} fill={e ? "#2E3A63" : "#CFE6FA"} />
      {e ? null : <circle cx={250} cy={70} r={26} fill="#FFF3C4" />}
      <path d="M 0 250 L 40 190 L 80 220 L 130 140 L 170 200 L 220 130 L 270 210 L 320 170 L 320 450 L 0 450 Z" fill={e ? "#3B4672" : "#B9C9DE"} />
      {e ? null : <path d="M 118 158 L 130 140 L 144 162 L 132 158 L 126 166 Z M 208 148 L 220 130 L 236 154 L 224 150 L 216 158 Z" fill="#FFFFFF" />}
      <path d="M 0 300 L 70 262 L 150 292 L 230 258 L 320 290 L 320 450 L 0 450 Z" fill={e ? "#2C3456" : "#9DB2CC"} />
      {/* панельные дома */}
      <rect x={20} y={300} width={110} height={150} fill={e ? "#4A4F6E" : "#E8DCC8"} />
      <rect x={170} y={320} width={120} height={130} fill={e ? "#454A68" : "#DCCDB6"} />
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((__, c) => (
          <rect key={`a${r}${c}`} x={30 + c * 25} y={312 + r * 32} width={14} height={18} fill={e ? ((r + c) % 3 === 0 ? "#FFD27A" : "#5D6385") : "#9FB6CF"} />
        )),
      )}
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 4 }).map((__, c) => (
          <rect key={`b${r}${c}`} x={182 + c * 27} y={334 + r * 34} width={15} height={19} fill={e ? ((r * 2 + c) % 3 === 1 ? "#FFD27A" : "#5D6385") : "#9FB6CF"} />
        )),
      )}
      {/* тополь */}
      <path d="M 145 450 Q 132 360 146 290 Q 160 360 150 450 Z" fill={e ? "#2B4A3E" : "#6FA57A"} />
    </svg>
  );
};

const WallClock: React.FC<{ x: number; y: number; r: number; minutes: number }> = ({ x, y, r, minutes }) => {
  const h = ((minutes / 60) % 12) * 30;
  const m = (minutes % 60) * 6;
  return (
    <svg width={r * 2} height={r * 2} viewBox="-100 -100 200 200" style={box({ left: x - r, top: y - r })}>
      <circle r={96} fill="#FFFFFF" stroke={C.navy} strokeWidth={10} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={0} y1={-80} x2={0} y2={i % 3 === 0 ? -62 : -71} stroke={C.navy} strokeWidth={i % 3 === 0 ? 7 : 4} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={8} x2={0} y2={-44} stroke={C.navy} strokeWidth={9} strokeLinecap="round" transform={`rotate(${h})`} />
      <line x1={0} y1={10} x2={0} y2={-68} stroke={C.navy} strokeWidth={6} strokeLinecap="round" transform={`rotate(${m})`} />
      <circle r={8} fill={C.yellow} />
    </svg>
  );
};

// Записка на доске (крупный вариант — для крупного плана).
export const Note: React.FC<{
  readonly day: string;
  readonly q: string;
  readonly color: string;
  readonly w: number;
  readonly rot?: number;
  readonly hi?: number;
}> = ({ day, q, color, w, rot = 0, hi = 0 }) => (
  <div
    style={{
      position: "relative",
      width: w,
      height: w * 0.86,
      backgroundColor: color,
      rotate: `${rot}deg`,
      boxShadow: `0 ${w * 0.03}px ${w * 0.07}px rgba(60,40,20,0.25)${hi > 0 ? `, 0 0 0 ${w * 0.03}px rgba(255,196,20,${hi})` : ""}`,
      fontFamily,
      color: C.ink,
      padding: `${w * 0.12}px ${w * 0.07}px 0`,
      boxSizing: "border-box",
      textAlign: "center",
    }}
  >
    <div style={{ position: "absolute", left: w / 2 - w * 0.05, top: -w * 0.03, width: w * 0.1, height: w * 0.1, borderRadius: w, backgroundColor: "#D8434F", boxShadow: "0 2px 3px rgba(0,0,0,0.25)" }} />
    <div style={{ fontSize: w * 0.15, fontWeight: 900, lineHeight: 1.05 }}>{day}</div>
    <div style={{ fontSize: w * 0.12, fontWeight: 800, lineHeight: 1.1, marginTop: w * 0.06, color: "#3A3550" }}>{q}</div>
  </div>
);

export const NOTE_COLORS = ["#FFB3C2", "#A9D3FF", "#B8EDB0"] as const;

// Пробковая доска с тремя записками.
export const Board: React.FC<{ readonly hi?: readonly number[]; readonly notes?: number }> = ({ hi = [0, 0, 0], notes = 1 }) => {
  const b = K.board;
  return (
    <div style={box({ left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 10, backgroundColor: "#D7A86F", border: "12px solid #A9784A", boxSizing: "border-box", boxShadow: "0 8px 16px rgba(60,40,20,0.18)" })}>
      <div style={box({ inset: 0, backgroundImage: "radial-gradient(rgba(120,80,40,0.25) 1.5px, transparent 1.6px)", backgroundSize: "14px 14px" })} />
      {BG11_TEXT.notes.map((n, i) => (
        <div key={n.day} style={box({ left: 12 + i * 102, top: 28 + (i % 2) * 26, opacity: notes })}>
          <Note day={n.day} q={n.q} color={NOTE_COLORS[i]} w={92} rot={[-5, 3, -2][i]} hi={hi[i]} />
        </div>
      ))}
    </div>
  );
};

// Папка (вид сбоку на столешнице): open 0…1 — приоткрыта, внутри пусто.
export const Folder: React.FC<{ x: number; y: number; color: string; lift?: number; rot?: number; w?: number }> = ({ x, y, color, lift = 0, rot = 0, w = 200 }) => (
  <div style={box({ left: x - w / 2, top: y - 16 - lift, width: w, height: 16, rotate: `${rot}deg`, transformOrigin: "10% 100%" })}>
    <div style={box({ left: 0, top: 0, width: w, height: 16, borderRadius: 4, backgroundColor: color, boxShadow: "0 2px 3px rgba(40,30,20,0.2)" })} />
    <div style={box({ left: w * 0.08, top: -8, width: w * 0.3, height: 10, borderRadius: "5px 5px 0 0", backgroundColor: color })} />
  </div>
);

// Рабочий портфель папы (на комоде): open 0…1 — крышка откинута.
export const Briefcase: React.FC<{ x: number; y: number; open?: number; papers?: number }> = ({ x, y, open = 0, papers = 0 }) => {
  const lid = lerp(0, -112, clamp(open));
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${x} ${y})`}>
        {/* бумаги, выглядывающие из портфеля */}
        {papers > 0 ? (
          <g opacity={papers}>
            <rect x={-70} y={-130 - 20 * papers} width={110} height={80} rx={4} fill="#FFFFFF" stroke="#D9DEE6" strokeWidth={2} transform={`rotate(${-10 * papers} -20 -90)`} />
            <rect x={-40} y={-120 - 36 * papers} width={110} height={80} rx={4} fill="#FFFDF4" stroke="#D9DEE6" strokeWidth={2} transform={`rotate(${12 * papers} 10 -90)`} />
          </g>
        ) : null}
        <rect x={-100} y={-96} width={200} height={96} rx={12} fill="#7A5236" />
        <rect x={-100} y={-96} width={200} height={12} rx={6} fill="#68452D" />
        <rect x={-14} y={-60} width={28} height={12} rx={3} fill="#D6B25E" />
        <g transform={`translate(-100 -96) rotate(${lid})`}>
          <rect x={0} y={-16} width={200} height={20} rx={8} fill="#8A5E40" />
        </g>
        <path d="M -30 -98 Q 0 -126 30 -98" stroke="#5B3B26" strokeWidth={8} fill="none" />
      </g>
    </svg>
  );
};

// Комод с папками (на нём ищут ключи).
export const Dresser: React.FC<{ readonly evening?: number; readonly children?: React.ReactNode }> = ({ evening = 0, children }) => {
  const d = K.dresser;
  const wood = evening > 0.5 ? "#B88A60" : "#CFA273";
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      <div style={box({ left: d.x, top: d.top, width: d.w, height: 22, borderRadius: 6, backgroundColor: "#B5865A" })} />
      <div style={box({ left: d.x + 10, top: d.top + 22, width: d.w - 20, height: d.bottom - d.top - 40, backgroundColor: wood })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: d.x + 26, top: d.top + 40 + i * 82, width: d.w - 52, height: 66, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.12)", border: "3px solid rgba(110,70,40,0.25)", boxSizing: "border-box" })}>
          <div style={box({ left: (d.w - 52) / 2 - 24, top: 26, width: 48, height: 9, borderRadius: 5, backgroundColor: "#7A5236" })} />
        </div>
      ))}
      <div style={box({ left: d.x + 22, top: d.bottom - 18, width: 22, height: 18, backgroundColor: "#7A5236" })} />
      <div style={box({ left: d.x + d.w - 44, top: d.bottom - 18, width: 22, height: 18, backgroundColor: "#7A5236" })} />
      {children}
    </div>
  );
};

// Стена, пол, окно, дверь, часы, доска, холодильник, комод.
export const KitchenBack: React.FC<{
  readonly minutes: number;
  readonly evening?: number;
  readonly keys?: boolean;
  readonly swing?: number;
  readonly boardHi?: readonly number[];
  readonly notes?: number;
  readonly dresserTop?: React.ReactNode;
}> = ({ minutes, evening = 0, keys = true, swing = 0, boardHi, notes = 1, dresserTop }) => {
  const e = evening > 0.5;
  const wall = e ? "#E6D2B8" : "#F6F0E6";
  const w = K.window;
  const d = K.door;
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      <div style={box({ left: -600, top: -600, width: 3600, height: K.floorY + 600, backgroundColor: wall })} />
      {/* нижняя панель стены с плинтусом */}
      <div style={box({ left: -600, top: 1210, width: 3600, height: K.floorY - 1210, backgroundColor: e ? "#DCC3A3" : "#EEE4D4" })} />
      <div style={box({ left: -600, top: 1204, width: 3600, height: 8, backgroundColor: e ? "#C9A983" : "#DCCBB2" })} />
      <div style={box({ left: -600, top: K.floorY - 14, width: 3600, height: 14, backgroundColor: e ? "#B99B78" : "#D6C2A4" })} />
      {/* пол */}
      <div style={box({ left: -600, top: K.floorY, width: 3600, height: 1400, backgroundColor: e ? "#B98F66" : "#D9B98F" })} />
      <div style={box({ left: -600, top: K.floorY, width: 3600, height: 1400, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,40,0.12) 0 2px, transparent 2px 190px)" })} />
      {/* полка с цветком над холодильником */}
      <div style={box({ left: 90, top: 380, width: 360, height: 16, borderRadius: 6, backgroundColor: "#B5865A" })} />
      <div style={box({ left: 140, top: 300, width: 64, height: 80, borderRadius: "10px 10px 18px 18px", backgroundColor: "#E5677A" })} />
      <div style={box({ left: 124, top: 236, width: 96, height: 80, borderRadius: "50% 50% 40% 40%", backgroundColor: "#6FA57A" })} />
      <div style={box({ left: 300, top: 318, width: 110, height: 62, borderRadius: 8, backgroundColor: "#8EC5FF" })} />
      {/* окно */}
      <div style={box({ left: w.x - 16, top: w.y - 16, width: w.w + 32, height: w.h + 32, borderRadius: 10, backgroundColor: "#FFFFFF", boxShadow: "0 6px 14px rgba(60,40,20,0.15)" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", borderRadius: 4 })}>
        <WindowView w={w.w} h={w.h} evening={evening} />
      </div>
      <div style={box({ left: w.x + w.w / 2 - 6, top: w.y, width: 12, height: w.h, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x - 30, top: w.y + w.h + 14, width: w.w + 60, height: 18, borderRadius: 6, backgroundColor: "#FFFFFF" })} />
      {/* дверь в подъезд и крючок с курткой */}
      <div style={box({ left: d.x - 14, top: d.y - 14, width: d.w + 28, height: d.h + 14, borderRadius: "10px 10px 0 0", backgroundColor: "#E0D2BE" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, borderRadius: "6px 6px 0 0", backgroundColor: e ? "#A88A6E" : "#BC9C7C" })} />
      <div style={box({ left: d.x + 24, top: d.y + 40, width: d.w - 48, height: 320, borderRadius: 6, border: "4px solid rgba(80,50,30,0.2)", boxSizing: "border-box" })} />
      <div style={box({ left: d.x + 24, top: d.y + 420, width: d.w - 48, height: 420, borderRadius: 6, border: "4px solid rgba(80,50,30,0.2)", boxSizing: "border-box" })} />
      <div style={box({ left: d.x + d.w - 46, top: d.y + 470, width: 26, height: 12, borderRadius: 6, backgroundColor: "#D6B25E" })} />
      <div style={box({ left: d.x - 60, top: K.floorY + 10, width: d.w + 120, height: 50, borderRadius: 10, backgroundColor: "#6C7FA8" })} />
      {/* часы */}
      <WallClock x={K.clock.x} y={K.clock.y} r={K.clock.r} minutes={minutes} />
      {/* доска с записками */}
      <Board hi={boardHi} notes={notes} />
      <Fridge keys={keys} swing={swing} evening={evening} />
      <Dresser evening={evening}>{dresserTop}</Dresser>
    </div>
  );
};

// Спинка стула за сидящим (рисуется до персонажа).
export const ChairBack: React.FC<{ x: number; h?: number; evening?: number }> = ({ x, h = 760, evening = 0 }) => {
  const s = h / 760;
  const c = evening > 0.5 ? "#7A5A44" : "#9A7353";
  return (
    <div style={box({ left: x - 95 * s, top: K.seatY - 540 * s, width: 190 * s, height: 540 * s })}>
      <div style={box({ left: 10 * s, top: 0, width: 170 * s, height: 40 * s, borderRadius: 14 * s, backgroundColor: c })} />
      <div style={box({ left: 18 * s, top: 30 * s, width: 22 * s, height: 510 * s, backgroundColor: c })} />
      <div style={box({ left: 150 * s, top: 30 * s, width: 22 * s, height: 510 * s, backgroundColor: c })} />
      <div style={box({ left: 30 * s, top: 110 * s, width: 130 * s, height: 22 * s, backgroundColor: c })} />
    </div>
  );
};

// Столешница и скатерть (поверх тел сидящих).
export const TableFront: React.FC<{ evening?: number }> = ({ evening = 0 }) => {
  const t = K.table;
  const e = evening > 0.5;
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      <div style={box({ left: t.x - 10, top: t.top - 4, width: t.w + 20, height: t.front - t.top + 8, borderRadius: 10, backgroundColor: e ? "#ECE0CC" : "#F6EEE1" })} />
      <div style={box({ left: t.x - 10, top: t.front, width: t.w + 20, height: t.bottom - t.front - 40, backgroundColor: e ? "#DCCAAE" : "#EADDC8", borderRadius: "0 0 14px 14px" })} />
      <div style={box({ left: t.x - 10, top: t.bottom - 120, width: t.w + 20, height: 26, backgroundImage: "repeating-linear-gradient(90deg, #2F62A8 0 18px, transparent 18px 36px)", opacity: 0.45 })} />
      <div style={box({ left: t.x + 40, top: t.bottom - 40, width: 26, height: 40, backgroundColor: "#7A5A44" })} />
      <div style={box({ left: t.x + t.w - 66, top: t.bottom - 40, width: 26, height: 40, backgroundColor: "#7A5A44" })} />
    </div>
  );
};

// Тёплая лампа над столом (вечер).
export const WarmLamp: React.FC<{ on?: number }> = ({ on = 1 }) => (
  <>
    <div style={box({ left: K.lamp.x - 4, top: -600, width: 8, height: 1180, backgroundColor: "#5B4636" })} />
    <div style={box({ left: K.lamp.x - 120, top: 560, width: 240, height: 110, borderRadius: "120px 120px 16px 16px", backgroundColor: "#F2C27A" })} />
    <div style={box({ left: -600, top: -600, width: 3600, height: 3200, background: `radial-gradient(circle at ${K.lamp.x + 600}px 1320px, rgba(255,205,130,${0.4 * on}), transparent 900px)`, pointerEvents: "none" })} />
  </>
);

// Листок плана на столе (мелко, общий план).
export const PlanSheet: React.FC<{ x: number; y: number; rot?: number; lines?: number }> = ({ x, y, rot = -4, lines = 1 }) => (
  <div style={box({ left: x - 80, top: y - 22, width: 160, height: 30, backgroundColor: "#FFFDF6", borderRadius: 4, rotate: `${rot}deg`, boxShadow: "0 3px 6px rgba(60,40,20,0.15)" })}>
    <div style={box({ left: 12, top: 5, width: 40, height: 6, borderRadius: 3, backgroundColor: C.yellow })} />
    {[0, 1].map((i) => (
      <div key={i} style={box({ left: 14, top: 14 + i * 7, width: (110 - i * 30) * clamp(lines * 2 - i), height: 4, borderRadius: 2, backgroundColor: "#9AA6BC" })} />
    ))}
  </div>
);

// Маленькая записка на столе (общий план вечерней сцены).
export const NoteOnTable: React.FC<{ x: number; y: number; color: string; rot?: number }> = ({ x, y, color, rot = 0 }) => (
  <div style={box({ left: x - 28, top: y - 14, width: 56, height: 20, backgroundColor: color, rotate: `${rot}deg`, boxShadow: "0 2px 4px rgba(60,40,20,0.2)" })} />
);
