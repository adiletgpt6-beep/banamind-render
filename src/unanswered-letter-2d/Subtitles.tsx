// Субтитры (кыргызча) — постоянная полоса под карточкой (LAYOUT.subs):
// слева портрет говорящего (Speaker.tsx: свой у каждой роли, у
// рассказчика — логотип BalaGo), над фразой — имя («BalaGo», «Айжан»,
// «Жолдошу», «Кызы», «Кесиптеши»), ниже — короткий смысловой фрагмент до
// двух строк. Длинная реплика делится на части по знакам препинания; части
// сменяются по фактическим таймингам слов и держатся до конца реплики.
// Текст совпадает с тем, что звучит; при внутреннем чтении письма — текст
// мамы курсивом с иконкой карандаша. Без речи — тихая подпись сцены.
// Полоса не двигается и не заходит на карточку.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { CuesContext } from "./context";
import { Icon } from "./graphics/Icons";
import { sceneOf } from "./layout";
import { easeOut } from "./rig/motion";
import { UL2_SPEAKER, UL2_VIDEO, lineById } from "./script";
import { ROLE_COLOR, SpeakerAvatar } from "./Speaker";
import { C, LAYOUT } from "./theme";

const FPS = UL2_VIDEO.fps;
const MAX = 40; // символов в части (≈ 2 строки по 52 px)


// Акценты: фраза → цвет (умеренно).
const ACCENTS: readonly [string, string][] = [
  ["эки жыл", C.yellow],
  ["үч күндөн", C.yellow],
  ["Абдан каалайм", C.yellow],
  ["каалайм", C.yellow],
  ["BalaGo’ну", C.yellow],
  ["алдын ала арыз", C.yellow],
  ["талкуулагым келет", C.yellow],
  ["Бишкекте", C.yellow],
  ["Профилдеги шилтемеге", C.yellow],
  ["WhatsApp’ка", "#5BD68A"],
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

const AVATAR = 132;

export const Subtitles: React.FC = () => {
  const cues = useContext(CuesContext);
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const out = 1;
  const S = LAYOUT.subs;
  const sc = sceneOf(t);
  // последний начавшийся сегмент, если он ещё звучит
  const started = cues.filter((c) => t >= c.from - 0.12);
  const last = started[started.length - 1];
  const cue = last && t <= last.to + 0.35 ? last : null;
  if (cue) {
    const line = lineById(cue.line);
    const parts = chunksOf(line.text);
    const words = line.text.split(/\s+/).filter(Boolean);
    let idx = 0;
    let wi = 0;
    const startOf = parts.map((p) => {
      const s0 = wi;
      wi += p.split(/\s+/).filter(Boolean).length;
      return s0;
    });
    const wt = (i: number) => cue.words[i]?.start ?? cue.from + ((cue.to - cue.from) * i) / words.length;
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.08) idx = k;
    const partStart = idx === 0 ? cue.from - 0.12 : wt(startOf[idx]) - 0.08;
    const tail = 1 - easeOut((t - (cue.to + 0.2)) / 0.15);
    const a = easeOut((t - partStart) / 0.12) * tail;
    const head = easeOut((t - cue.from + 0.12) / 0.12) * tail;
    const color = ROLE_COLOR[cue.role];
    const inner = cue.mode === "inner";
    const text = parts[idx];
    const cueScene = sceneOf(cue.from).id;
    return (
      <div style={{ position: "absolute", left: S.x, top: S.y, width: S.w, height: S.h, display: "flex", alignItems: "center", gap: 28, fontFamily, opacity: out, pointerEvents: "none" }}>
        <div style={{ opacity: head, scale: `${0.9 + 0.1 * head}` }}>
          <SpeakerAvatar role={cue.role} scene={cueScene} f={f} size={AVATAR} inner={inner} smile={cue.role === "colleague" ? 0.8 : 0.4} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 34, fontWeight: 900, color, letterSpacing: 0.5, marginBottom: 6, opacity: head }}>
            {UL2_SPEAKER[cue.role]}
            {inner ? <Icon id="pencil" size={32} color={color} stroke={4} /> : null}
          </div>
          <div style={{ fontSize: text.length > MAX ? 48 : 52, fontWeight: 900, lineHeight: 1.18, color: C.text, opacity: a, translate: `0 ${(1 - a) * 6}px`, fontStyle: inner ? "italic" : "normal" }}>
            {colorize(text)}
          </div>
        </div>
      </div>
    );
  }
  // без речи — тихая подпись сцены
  const title = sc.title.replace(/^\d+\.\s*/, "");
  const age = t - Math.max(sc.from, last ? last.to + 0.35 : 0);
  const a = easeOut((age - 0.1) / 0.3) * (1 - easeOut((t - sc.to + 0.2) / 0.2));
  if (sc.id === "intro" || sc.id === "service" || sc.id === "contact") return null;
  return (
    <div style={{ position: "absolute", left: S.x, top: S.y, width: S.w, height: S.h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily, opacity: out, pointerEvents: "none" }}>
      <div style={{ fontSize: 44, fontWeight: 800, color: C.dim, opacity: a * 0.9, textAlign: "center" }}>{title}</div>
    </div>
  );
};
