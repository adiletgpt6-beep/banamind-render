// Пять сохранённых записей сына: нейтральный диктофон «Үн жазуулары»,
// папка «Атама». Это локальные записи, не чат: нет пузырей и отметок
// доставки, у каждой — «Жөнөтүлгөн эмес». Волна строится по фактической
// громкости файла (огибающая из manifest); у активной строки шкала идёт от
// начала до конца файла, волна дышит по звуку и затихает в паузах.
import { useContext } from "react";
import { fontFamily } from "../../fonts";
import { CuesContext } from "../context";
import { clamp, easeOut, lerp } from "../rig/motion";
import { FU2_RECORDS, FU2_TEXT, FU2_VIDEO, type Fu2RecordId } from "../script";
import type { Fu2Cue } from "../timing";
import { C } from "../theme";

const FPS = FU2_VIDEO.fps;
const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

export type MemoState = "idle" | "playing" | "done";
export type MemoView = {
  readonly state: MemoState;
  readonly progress: number; // 0…1 по файлу
  readonly level: number; // громкость в этот момент 0…1
  readonly warm: number; // 0 — холодный голубой, 1 — тёплый жёлтый (дослушано)
  readonly heard: boolean;
};

// Огибающая речевого файла записи (одна и та же для всех воспроизведений).
export const useRecordCue = (id: Fu2RecordId): Fu2Cue => {
  const cues = useContext(CuesContext);
  const line = FU2_RECORDS.find((r) => r.id === id)!.line;
  return cues.find((c) => c.line === line)!;
};

// Состояние воспроизведения сегмента в момент t (с ролика).
export const playView = (cue: Fu2Cue, t: number): { state: MemoState; progress: number; level: number } => {
  const a = cue.audioFrom;
  const b = cue.audioFrom + cue.durationSec;
  if (t < a) return { state: "idle", progress: 0, level: 0 };
  if (t >= b) return { state: "done", progress: 1, level: 0 };
  const k = Math.floor((t - a) * FPS);
  const level = Math.max(cue.env[k] ?? 0, 0);
  return { state: "playing", progress: clamp((t - a) / (b - a)), level };
};

const BARS = 34;
// Статичная форма волны: максимум огибающей на участке файла.
const barsOf = (env: readonly number[]) =>
  Array.from({ length: BARS }, (_, i) => {
    const a = Math.floor((i * env.length) / BARS);
    const b = Math.max(a + 1, Math.floor(((i + 1) * env.length) / BARS));
    let m = 0;
    for (let k = a; k < b; k++) m = Math.max(m, env[k] ?? 0);
    return m;
  });

export const Wave: React.FC<{ env: readonly number[]; w: number; h: number; view: Pick<MemoView, "state" | "progress" | "level" | "warm">; f: number }> = ({ env, w, h, view, f }) => {
  const bars = barsOf(env);
  const gap = w / BARS;
  const cold = C.blue;
  const hot = C.yellow;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      {bars.map((v, i) => {
        const pos = (i + 0.5) / BARS;
        const played = view.state === "done" || (view.state === "playing" && pos <= view.progress);
        // у точки воспроизведения столбики дышат по текущей громкости
        const near = view.state === "playing" ? Math.max(0, 1 - Math.abs(pos - view.progress) * 9) : 0;
        const live = near * view.level * (0.7 + 0.3 * Math.sin(f * 0.9 + i * 1.7));
        const hh = Math.max(4, h * (0.14 + 0.78 * v) * (1 + 0.45 * live));
        const color = played ? (view.state === "playing" ? hot : lerpColor(cold, hot, view.warm)) : view.warm > 0.5 ? lerpColor(cold, hot, view.warm * 0.6) : cold;
        return <rect key={i} x={i * gap + gap * 0.22} y={(h - hh) / 2} width={gap * 0.56} height={hh} rx={gap * 0.28} fill={color} opacity={played ? 1 : 0.42} />;
      })}
      {view.state === "playing" ? <rect x={view.progress * w - 1.5} y={0} width={3} height={h} rx={1.5} fill={C.text} /> : null}
    </svg>
  );
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const lerpColor = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  const u = clamp(t);
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], u))).join(",")})`;
};

const fmt = (sec: number) => `0:${String(Math.max(1, Math.round(sec))).padStart(2, "0")}`;

// Кнопка: ▶ готова к воспроизведению / ❚❚ пауза во время воспроизведения.
export const PlayButton: React.FC<{ playing: boolean; size: number; color: string; press?: number }> = ({ playing, size, color, press = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", scale: `${1 - 0.08 * press}` }}>
    <circle cx={50} cy={50} r={48} fill={playing ? color : "rgba(169,208,236,0.14)"} stroke={color} strokeWidth={4} />
    {playing ? (
      <g fill={C.bg}>
        <rect x={34} y={30} width={11} height={40} rx={3} />
        <rect x={55} y={30} width={11} height={40} rx={3} />
      </g>
    ) : (
      <path d="M 40 29 L 72 50 L 40 71 Z" fill={color} />
    )}
  </svg>
);

// Строка записи в списке.
export const MemoRow: React.FC<{
  id: Fu2RecordId;
  w: number;
  view: MemoView;
  f: number;
  showDay?: boolean; // в начале названия дней ещё не раскрываются
  scale?: number;
  press?: number;
  compact?: boolean;
}> = ({ id, w, view, f, showDay = true, scale = 1, press = 0, compact = false }) => {
  const cue = useRecordCue(id);
  const rec = FU2_RECORDS.find((r) => r.id === id)!;
  const active = view.state === "playing";
  const accent = active ? C.yellow : lerpColor(C.blue, C.yellow, view.warm);
  const h = compact ? 80 : 118;
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: 22,
        backgroundColor: active ? "rgba(255,211,61,0.10)" : "rgba(5,11,23,0.55)",
        border: `2px solid ${active ? C.yellow : view.warm > 0.5 ? "rgba(255,211,61,0.55)" : C.lineSoft}`,
        scale: `${scale}`,
        transformOrigin: "50% 50%",
        fontFamily,
        boxSizing: "border-box",
      }}
    >
      <div style={box({ left: 18, top: (h - (compact ? 54 : 72)) / 2 })}>
        <PlayButton playing={active} size={compact ? 54 : 72} color={accent} press={press} />
      </div>
      <div style={box({ left: compact ? 92 : 108, top: compact ? 6 : 14, fontSize: compact ? 28 : 36, fontWeight: 900, color: showDay ? C.text : C.dim, whiteSpace: "nowrap" })}>{showDay ? rec.day : "· · ·"}</div>
      <div style={box({ left: compact ? 92 : 108, bottom: compact ? 10 : 16 })}>
        <Wave env={cue.env} w={w - (compact ? 92 : 108) - (compact ? 196 : 236)} h={compact ? 26 : 38} view={view} f={f} />
      </div>
      <div style={box({ right: 20, top: compact ? 12 : 16, fontSize: compact ? 24 : 28, fontWeight: 800, color: C.dim })}>{fmt(cue.durationSec)}</div>
      <div style={box({ right: 20, bottom: compact ? 12 : 16, fontSize: compact ? 20 : 22, fontWeight: 800, color: view.heard ? C.yellow : C.dim, whiteSpace: "nowrap", opacity: 0.95 })}>{view.heard ? FU2_TEXT.heard : FU2_TEXT.notSent}</div>
    </div>
  );
};

// Шапка диктофона: «Үн жазуулары › Атама».
export const MemoHeader: React.FC<{ w: number; size?: number }> = ({ w, size = 1 }) => (
  <div style={{ width: w, display: "flex", alignItems: "baseline", gap: 14 * size, fontFamily }}>
    <svg width={30 * size} height={40 * size} viewBox="0 0 30 40">
      <rect x={8} y={2} width={14} height={24} rx={7} fill={C.blue} />
      <path d="M 4 18 Q 4 32 15 32 Q 26 32 26 18" stroke={C.blue} strokeWidth={3} fill="none" />
      <rect x={13.5} y={32} width={3} height={6} fill={C.blue} />
    </svg>
    <span style={{ fontSize: 34 * size, fontWeight: 900, color: C.text }}>{FU2_TEXT.voiceMemos}</span>
    <span style={{ fontSize: 30 * size, fontWeight: 800, color: C.dim }}>›</span>
    <span style={{ fontSize: 32 * size, fontWeight: 900, color: C.blue }}>{FU2_TEXT.folder}</span>
  </div>
);

// Счётчик совместного прослушивания «Угулду n/5» (не доставка).
export const HeardCounter: React.FC<{ n: number; pulse: number; size?: number }> = ({ n, pulse, size = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 * size, padding: `${10 * size}px ${22 * size}px`, borderRadius: 999, border: `2px solid ${n > 0 ? C.yellow : C.line}`, backgroundColor: "rgba(5,11,23,0.7)", fontFamily }}>
    <span style={{ fontSize: 30 * size, fontWeight: 800, color: C.dim }}>{FU2_TEXT.heard}</span>
    <span style={{ fontSize: 44 * size, fontWeight: 900, color: n > 0 ? C.yellow : C.text, scale: `${1 + 0.12 * pulse}` }}>{n}/5</span>
  </div>
);

export const idleView: MemoView = { state: "idle", progress: 0, level: 0, warm: 0, heard: false };
export const fadeUp = (t: number, at: number, d = 0.35) => easeOut((t - at) / d);
