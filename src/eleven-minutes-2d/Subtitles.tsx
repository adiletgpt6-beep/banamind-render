// Субтитры (кыргызча) совпадают с тем, что звучит. Длинная реплика делится
// на короткие смысловые части (обычно 1–2 строки); части сменяются по
// фактическим таймингам слов. Белый текст; жёлтым — ключевые числа и
// слова, коралловым (умеренно) — возникшие задержки. Без караоке.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { CuesContext } from "./context";
import { easeOut } from "./rig/motion";
import { EM2_VIDEO, lineById } from "./script";
import { C, LAYOUT } from "./theme";

const FPS = EM2_VIDEO.fps;
const MAX = 46; // символов в части (≈ 2 строки по 60 px)

// Акценты: фраза → цвет.
const ACCENTS: readonly [string, string][] = [
  ["он бир мүнөт", C.yellow],
  ["он бир эле мүнөт", C.yellow],
  ["бир сааттан ашык", C.yellow],
  ["жыйырма мүнөт", C.yellow],
  ["BalaGo’го", C.yellow],
  ["жетиштүү убакыт", C.yellow],
  ["көбүрөөк убакыт", C.yellow],
  ["токтой турган жер жок", C.coral],
  ["алысыраак", C.coral],
  ["кеч чыгышты", C.coral],
  ["спорттук кийимим", C.coral],
  ["Кайра киришти", C.coral],
  ["узакка созулду", C.coral],
  ["Эми түшүндүм", C.warm],
  ["Мен угуп жатам", C.warm],
];

export const chunksOf = (text: string): string[] => {
  const parts = text.match(/[^.!?…,—]+[.!?…,—]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    const next = cur ? `${cur} ${p}` : p;
    if (next.length <= MAX) cur = next;
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

export const Subtitles: React.FC<{ readonly top?: number }> = ({ top = LAYOUT.subtitleTop }) => {
  const cues = useContext(CuesContext);
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.1 && t <= c.to + 0.35);
  if (!cue) return null;
  const line = lineById(cue.id);
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
  const who = cue.role === "narrator" ? null : cue.role;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily, pointerEvents: "none" }}>
      {who ? <div style={{ fontSize: 28, fontWeight: 800, color: C.dim, opacity: a, letterSpacing: 1 }}>{({ father: "Ата", mother: "Апа", daughter: "Кызы" } as const)[who]}</div> : null}
      <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1.22, color: C.text, textAlign: "center", opacity: a, translate: `0 ${(1 - a) * 10}px`, textShadow: "0 4px 18px rgba(0,0,0,0.85)", maxWidth: 940 }}>{colorize(parts[idx])}</div>
    </div>
  );
};
