// Зрительный таймер «Жыйынга 03:00». В начале — крупно по центру, затем
// компактной плашкой в верхнем левом углу (ниже зоны интерфейса Reels).
// Внутри сцены идёт секунда в секунду; на склейках время «перескакивает»
// (монтажный пропуск). У открытой переговорной таймер останавливается
// на 00:10 и становится зелёным: «Убагында».
import { useCurrentFrame } from "remotion";
import { COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { clamp, easeInOut, easeOut } from "./rig/motion";
import { BG2_SCENES, BG2_TEXT, BG2_TIMER, BG2_VIDEO, type Bg2SceneId } from "./script";

const FPS = BG2_VIDEO.fps;
// Значение таймера в начале каждой сцены (секунды до совещания).
const START: Partial<Record<Bg2SceneId, number>> = { hook: 180, call: 165, calendar: 140, app: 105, terms: 22 };

export const timerValue = (t: number): number => {
  if (t >= BG2_TIMER.stopAt) return BG2_TIMER.stopValue;
  const sc = [...BG2_SCENES].reverse().find((s) => t >= s.from)!;
  const v0 = START[sc.id] ?? BG2_TIMER.stopValue;
  return Math.max(BG2_TIMER.stopValue, Math.ceil(v0 - (t - sc.from) - 1e-6));
};

const mmss = (v: number) => `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;

// Кадры, где меняется цифра таймера (для тиканья), в пределах [from, to) с.
export const timerTicks = (from: number, to: number): number[] => {
  const out: number[] = [];
  for (let f = Math.round(from * FPS) + 1; f < Math.round(to * FPS); f++) {
    if (timerValue(f / FPS) !== timerValue((f - 1) / FPS)) out.push(f);
  }
  return out;
};

export const Timer: React.FC<{ readonly hideFrom: number }> = ({ hideFrom }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (f >= hideFrom) return null;
  const v = timerValue(t);
  const stopped = t >= BG2_TIMER.stopAt;
  // крупно → в угол (3,3–4,0 с)
  const k = easeInOut((t - 3.3) / 0.7);
  const big = { x: 540, y: 430, s: 1 };
  const small = { x: 250, y: 330, s: 0.42 };
  const x = big.x + (small.x - big.x) * k;
  const y = big.y + (small.y - big.y) * k;
  const s = (big.s + (small.s - big.s) * k) * (1 + 0.04 * Math.max(0, 1 - ((f % FPS) / 6)) * (stopped ? 0 : 1));
  const low = v <= 30 && !stopped;
  const bg = stopped ? "#2E8B57" : low ? "#E2554B" : COLORS.navy;
  const pop = stopped ? easeOut((t - BG2_TIMER.stopAt) / 0.3) : 0;
  const a = clamp(f / 4) * (1 - clamp((f - hideFrom + 8) / 8));
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: `${s * (1 + 0.15 * pop * (1 - pop) * 4)}`, opacity: a, fontFamily, pointerEvents: "none" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "26px 60px 30px", borderRadius: 60, backgroundColor: bg, color: "#FFFFFF", boxShadow: "0 24px 50px rgba(20,30,60,0.35)", minWidth: 520 }}>
        <div style={{ fontSize: 70, fontWeight: 900, letterSpacing: 1, color: stopped ? "#FFFFFF" : COLORS.yellow }}>{stopped ? `✓ ${BG2_TEXT.timer.done}` : BG2_TEXT.timer.label}</div>
        <div style={{ fontSize: 230, fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{mmss(v)}</div>
      </div>
    </div>
  );
};
