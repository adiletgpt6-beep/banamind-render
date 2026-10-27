// Субтитры (кыргызча) рядом с верхним кругом ведущей — как в референсе:
// маленькая подпись говорящего («BalaGo», «Айжан», «Жолдошу», «Кызы»,
// «Кесиптеши») и короткий смысловой фрагмент до двух строк. Длинная
// реплика делится на части по знакам препинания; части сменяются по
// фактическим таймингам слов. Текст совпадает с тем, что звучит; при
// внутреннем чтении письма — текст мамы (с иконкой карандаша). Без речи —
// тихая подпись сцены. В начале (ведущая в центре) субтитры под кругом.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { CuesContext } from "./context";
import { Icon } from "./graphics/Icons";
import { hostDockAt, sceneById, sceneOf } from "./layout";
import { easeOut, lerp } from "./rig/motion";
import { UL2_SPEAKER, UL2_VIDEO, lineById, type Ul2Role } from "./script";
import { C, LAYOUT } from "./theme";

const FPS = UL2_VIDEO.fps;
const MAX = 40; // символов в части (≈ 2 строки по 54 px)
const CONTACT = sceneById("contact").from;

const ROLE_COLOR: Record<Ul2Role, string> = {
  narrator: C.yellow,
  mother: "#7FD6CD", // бирюзовый — цвет кардигана Айжан
  father: "#A9C3F0",
  daughter: "#F5A8BC",
  colleague: "#B9D7A8",
};

// Акценты: фраза → цвет (умеренно).
const ACCENTS: readonly [string, string][] = [
  ["эки жыл", C.yellow],
  ["үч күн", C.yellow],
  ["Абдан каалайм", C.yellow],
  ["каалайм", C.yellow],
  ["BalaGo’го", C.yellow],
  ["алдын ала арыз", C.yellow],
  ["талкуулагым келет", C.yellow],
];

export const chunksOf = (text: string): string[] => {
  const parts = text.match(/[^.!?…,]+[.!?…,»]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    const next = cur ? `${cur} ${p}` : p;
    // короткое обращение («Апа,») не остаётся отдельной частью
    if (next.length <= MAX || (cur && cur.length <= 6)) cur = next;
    else {
      if (cur) out.push(cur);
      cur = p;
    }
  }
  if (cur) out.push(cur);
  // слишком длинная часть делится по словам примерно пополам
  return out.flatMap((p) => {
    if (p.length <= MAX + 8) return [p];
    const w = p.split(" ");
    let best = 1;
    for (let i = 1; i < w.length; i++) if (Math.abs(w.slice(0, i).join(" ").length - p.length / 2) < Math.abs(w.slice(0, best).join(" ").length - p.length / 2)) best = i;
    return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
  });
};

const colorize = (s: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let rest = s;
  let k = 0;
  while (rest.length) {
    let best: { i: number; p: string; c: string } | null = null;
    for (const [p, c] of ACCENTS) {
      const i = rest.toLowerCase().indexOf(p.toLowerCase());
      if (i >= 0 && (!best || i < best.i || (i === best.i && p.length > best.p.length))) best = { i, p, c };
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

export const Subtitles: React.FC = () => {
  const cues = useContext(CuesContext);
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const out = 1 - easeOut((t - CONTACT + 0.35) / 0.35);
  if (out <= 0) return null;
  const dock = hostDockAt(t);
  const S = LAYOUT.speech;
  // в начале, пока ведущая в центре, — под кругом по центру
  const x = lerp(70, S.x, dock);
  const y = lerp(LAYOUT.hostBig.cy + LAYOUT.hostBig.r + 40, S.y, dock);
  const w = lerp(940, S.w, dock);
  const align = dock > 0.5 ? "left" : "center";
  // последний начавшийся сегмент, если он ещё звучит
  const started = cues.filter((c) => t >= c.from - 0.1);
  const last = started[started.length - 1];
  const cue = last && t <= last.to + 0.4 ? last : null;
  let label: React.ReactNode = null;
  let body: React.ReactNode = null;
  let a = 1;
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
    a = easeOut((t - partStart) / 0.16) * (1 - easeOut((t - (cue.to + 0.25)) / 0.15));
    const color = ROLE_COLOR[cue.role];
    const inner = cue.mode === "inner";
    label = (
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: align === "center" ? "center" : "flex-start", fontSize: 28, fontWeight: 900, color, letterSpacing: 0.5, marginBottom: 6, opacity: easeOut((t - cue.from + 0.1) / 0.15) * (1 - easeOut((t - (cue.to + 0.25)) / 0.15)) }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
        {UL2_SPEAKER[cue.role]}
        {inner ? <Icon id="pencil" size={28} color={color} stroke={4} /> : null}
      </div>
    );
    const text = parts[idx];
    body = (
      <div style={{ fontSize: text.length > MAX ? 48 : 54, fontWeight: 900, lineHeight: 1.18, color: C.text, opacity: a, translate: `0 ${(1 - a) * 8}px`, textAlign: align, fontStyle: inner ? "italic" : "normal" }}>
        {colorize(text)}
      </div>
    );
  } else {
    // без речи — тихая подпись сцены
    const sc = sceneOf(t);
    const title = sc.title.replace(/^\d+\.\s*/, "");
    const age = t - Math.max(sc.from, last ? last.to + 0.4 : 0);
    a = easeOut((age - 0.1) / 0.3) * (1 - easeOut((t - sc.to + 0.2) / 0.2));
    body = sc.id === "intro" ? null : <div style={{ fontSize: 44, fontWeight: 800, color: C.dim, opacity: a * 0.9, textAlign: align }}>{title}</div>;
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: S.h, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily, opacity: out, pointerEvents: "none" }}>
      {label}
      {body}
    </div>
  );
};
