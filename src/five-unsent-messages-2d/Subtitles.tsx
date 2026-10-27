// Субтитры (кыргызча) в нижней карточке совпадают с тем, что звучит.
// Длинная реплика делится на короткие смысловые части (1–2 строки); части
// сменяются по фактическим таймингам слов. Подпись говорящего: «Ата»,
// «Уулу»; запись с телефона — «Үн жазуу · <день>» с жёлтым значком.
// Следующая запись не показывается, пока не закончилась текущая.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { CuesContext } from "./context";
import { easeOut } from "./rig/motion";
import { FU2_RECORDS, FU2_SCENES, FU2_TEXT, FU2_VIDEO, lineById } from "./script";
import { C, LAYOUT } from "./theme";

const FPS = FU2_VIDEO.fps;
const MAX = 44; // символов в части (≈ 2 строки по 56 px)
const CONTACT = FU2_SCENES.find((s) => s.id === "contact")!.from;

// Акценты: фраза → цвет (умеренно).
const ACCENTS: readonly [string, string][] = [
  ["беш үн билдирүү", C.yellow],
  ["Бирин да жөнөткөн эмес", C.blue],
  ["Чоңоюп жаткандыр", C.blue],
  ["Өзүм айтып бергим келген", C.yellow],
  ["BalaGo’го", C.yellow],
  ["дароо эле айтып бере алам", C.yellow],
];

export const chunksOf = (text: string): string[] => {
  const parts = text.match(/[^.!?…,—]+[.!?…,—»]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    const next = cur ? `${cur} ${p}` : p;
    // короткое обращение («Ата,») не остаётся отдельной частью
    if (next.length <= MAX || (cur && cur.length <= 6)) cur = next;
    else {
      if (cur) out.push(cur);
      cur = p;
    }
  }
  if (cur) out.push(cur);
  return out;
};

const colorize = (s: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let rest = s;
  let k = 0;
  while (rest.length) {
    let best: { i: number; p: string; c: string } | null = null;
    for (const [p, c] of ACCENTS) {
      const i = rest.toLowerCase().indexOf(p.toLowerCase());
      if (i >= 0 && (!best || i < best.i)) best = { i, p, c };
    }
    if (!best) {
      nodes.push(rest);
      break;
    }
    if (best.i > 0) nodes.push(rest.slice(0, best.i));
    nodes.push(
      <span key={k++} style={{ color: best.c }}>
        {rest.slice(best.i, best.i + best.p.length)}
      </span>,
    );
    rest = rest.slice(best.i + best.p.length);
  }
  return nodes;
};

const Mic: React.FC<{ color: string }> = ({ color }) => (
  <svg width={22} height={30} viewBox="0 0 30 40" style={{ display: "inline-block", verticalAlign: "-4px", marginRight: 10 }}>
    <rect x={8} y={2} width={14} height={24} rx={7} fill={color} />
    <path d="M 4 18 Q 4 32 15 32 Q 26 32 26 18" stroke={color} strokeWidth={3} fill="none" />
  </svg>
);

export const Subtitles: React.FC = () => {
  const cues = useContext(CuesContext);
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const S = LAYOUT.subtitle;
  const cardA = 1 - easeOut((t - CONTACT + 0.4) / 0.4);
  if (cardA <= 0) return null;
  // последний начавшийся сегмент, если он ещё звучит
  const started = cues.filter((c) => t >= c.from - 0.1);
  const last = started[started.length - 1];
  const cue = last && t <= last.to + 0.35 ? last : null;
  let body: React.ReactNode = null;
  if (cue) {
    const line = lineById(cue.line);
    const parts = chunksOf(line.text);
    const words = line.text.split(/\s+/).filter(Boolean);
    let idx = 0;
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).filter(Boolean).length;
      return s;
    });
    const wt = (i: number) => cue.words[i]?.start ?? cue.from + ((cue.to - cue.from) * i) / words.length;
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.08) idx = k;
    const partStart = idx === 0 ? cue.from - 0.1 : wt(startOf[idx]) - 0.08;
    const a = easeOut((t - partStart) / 0.16) * (1 - easeOut((t - (cue.to + 0.2)) / 0.15));
    const rec = cue.record ? FU2_RECORDS.find((r) => r.id === cue.record) : null;
    const label = rec ? `${FU2_TEXT.recording} · ${rec.day}` : cue.role === "father" ? "Ата" : cue.role === "son" ? "Уулу" : null;
    const short = parts[idx].length <= 8;
    body = (
      <>
        {label ? (
          <div style={{ fontSize: 28, fontWeight: 800, color: rec ? C.yellow : C.dim, opacity: a, letterSpacing: 0.5, marginBottom: 6 }}>
            {rec ? <Mic color={C.yellow} /> : null}
            {label}
          </div>
        ) : null}
        <div style={{ fontSize: short ? 72 : parts[idx].length > 44 ? 46 : 56, fontWeight: 900, lineHeight: 1.2, color: C.text, opacity: a, translate: `0 ${(1 - a) * 8}px`, textAlign: "center" }}>{colorize(parts[idx])}</div>
      </>
    );
  }
  return (
    <div style={{ position: "absolute", left: S.x, top: S.y, width: S.w, height: S.h, borderRadius: 30, backgroundColor: "rgba(16,34,57,0.72)", border: `2px solid ${C.lineSoft}`, opacity: cardA, boxSizing: "border-box", padding: "18px 36px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily, pointerEvents: "none" }}>
      {body}
    </div>
  );
};
