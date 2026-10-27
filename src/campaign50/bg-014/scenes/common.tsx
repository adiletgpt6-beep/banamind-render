// Общее для сцен BG-014: рост и места персонажей в квартире, реквизит
// «утренней суеты» (блокноты, будильник, карточки напоминаний), наклейка
// хука, поиск момента слова в озвучке.
import { fontFamily } from "../../../fonts";
import type { Bg14Cue } from "../timing";
import { C } from "../palette";
import { HOME } from "../sets/Home";
import { clamp, easeOut, hash01 } from "../rig/motion";
import { stopFrame } from "../sneakers";
import { BG14_VIDEO } from "../script";

// Рост персонажей (px мира).
export const H = { dad: 1040, mom: 990, son: 720 } as const;
// Где стоят в квартире (x, пол).
export const SPOT = { son: 560, mom: 1180, momNear: 820, dad: 1790, dadNear: 1080 } as const;
export const FLOOR = HOME.floorY;

// Кадр сцены, когда звучит слово, начинающееся с prefix (по фактическим
// таймингам озвучки), иначе — доля fallback длины реплики.
export const wordFrame = (cue: Bg14Cue, prefix: string, fallback: number, sceneFrom: number) => {
  const w = cue.words.find((x) => x.text.toLowerCase().replace(/[^\p{L}]/gu, "").startsWith(prefix.toLowerCase()));
  const t = w ? w.start : cue.from + (cue.to - cue.from) * fallback;
  return Math.round(t * BG14_VIDEO.fps) - sceneFrom;
};

// Наклейка хука «Мен даярмын!» — жёлтая, с лёгким «стоп-моушн» подскоком.
export const Sticker: React.FC<{ readonly f: number; readonly at: number; readonly text: string; readonly y?: number }> = ({ f, at, text, y = 300 }) => {
  const a = easeOut((f - at) / 6);
  if (a <= 0) return null;
  const pop = 1 + 0.18 * Math.sin(Math.PI * clamp((f - at) / 8));
  const wob = (hash01(stopFrame(f, 4) + 3) - 0.5) * 3;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          padding: "18px 46px 22px",
          borderRadius: 34,
          backgroundColor: C.yellow,
          color: C.navy,
          fontFamily,
          fontSize: 104,
          fontWeight: 900,
          letterSpacing: 1,
          boxShadow: "0 16px 0 #E0A800, 0 26px 40px rgba(20,40,90,0.22)",
          transform: `scale(${a * pop}) rotate(${-3 + wob}deg)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Блокнот, пролетающий через кадр (вид спереди, спираль сверху).
export const Notebook: React.FC<{ readonly x: number; readonly y: number; readonly rot: number; readonly color: string; readonly s?: number }> = ({ x, y, rot, color, s = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 190 * s, height: 250 * s, transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 14px 18px rgba(20,30,60,0.2))" }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 14 * s, backgroundColor: color }} />
    <div style={{ position: "absolute", left: 22 * s, right: 22 * s, top: 70 * s, height: 60 * s, borderRadius: 8 * s, backgroundColor: "rgba(255,255,255,0.85)" }} />
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{ position: "absolute", left: (24 + i * 34) * s, top: -12 * s, width: 14 * s, height: 30 * s, borderRadius: 7 * s, border: `${4 * s}px solid #9AA3B5`, boxSizing: "border-box" }} />
    ))}
  </div>
);

// Будильник: звенит — дрожит, молоточек бьёт по чашкам.
export const AlarmClock: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly ringing: number; readonly s?: number }> = ({ x, y, f, ringing, s = 1 }) => {
  const shake = ringing * Math.sin(f * 2.4) * 9;
  return (
    <svg width={260 * s} height={280 * s} viewBox="-130 -150 260 280" style={{ position: "absolute", left: x - 130 * s, top: y - 150 * s, overflow: "visible" }}>
      <g transform={`rotate(${shake})`}>
        <circle cx={-62} cy={-92} r={34} fill={C.navy} />
        <circle cx={62} cy={-92} r={34} fill={C.navy} />
        <rect x={-6 + ringing * Math.sin(f * 3.1) * 10} y={-126} width={12} height={40} rx={6} fill="#8A93A8" />
        <line x1={-60} y1={90} x2={-80} y2={120} stroke={C.navy} strokeWidth={12} strokeLinecap="round" />
        <line x1={60} y1={90} x2={80} y2={120} stroke={C.navy} strokeWidth={12} strokeLinecap="round" />
        <circle r={100} fill={C.yellow} />
        <circle r={80} fill="#FFFFFF" />
        <line x1={0} y1={0} x2={0} y2={-56} stroke={C.navy} strokeWidth={9} strokeLinecap="round" />
        <line x1={0} y1={0} x2={34} y2={18} stroke={C.navy} strokeWidth={9} strokeLinecap="round" />
        <circle r={8} fill={C.navy} />
      </g>
      {ringing > 0.2
        ? [-1, 1].map((d) => (
            <g key={d} stroke={C.navy} strokeWidth={6} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f)}>
              <line x1={d * 128} y1={-120} x2={d * 150} y2={-140} />
              <line x1={d * 136} y1={-80} x2={d * 164} y2={-84} />
            </g>
          ))
        : null}
    </svg>
  );
};

// Карточка утреннего напоминания (как уведомление телефона).
export const ReminderCard: React.FC<{ readonly x: number; readonly y: number; readonly rot: number; readonly text: string; readonly a: number; readonly s?: number }> = ({ x, y, rot, text, a, s = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s * (0.6 + 0.4 * a)})`,
      opacity: a,
      padding: "18px 28px",
      borderRadius: 26,
      backgroundColor: "#FFFFFF",
      border: "4px solid #DCE3EE",
      boxShadow: "0 14px 30px rgba(20,40,90,0.16)",
      fontFamily,
      fontSize: 40,
      fontWeight: 800,
      color: C.navy,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);
