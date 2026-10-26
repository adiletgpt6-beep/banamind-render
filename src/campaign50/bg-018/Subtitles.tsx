// Кыргызские титры: короткие фразы по 2–5 слов по фактическим таймингам
// слов, текущее слово — жёлтым. Позиция задаётся по сцене (не перекрывать
// лица, чат и контакты). В финальной сцене титров нет — там те же слова
// крупно на карточке контактов (не дублируем текст вторым слоем).
import { interpolate, useCurrentFrame } from "remotion";
import { FPS, useTimeline } from "./context";
import type { Bg18SceneId } from "./script";
import type { Bg18Cue } from "./timing";
import { abs, C, clamp, font } from "./ui";

const Y: Record<Bg18SceneId, number | null> = {
  hook: 1390,
  chat: 1660,
  scroll: 1500,
  link: 1660,
  steps: 1580,
  cta: null,
};

type Chunk = { words: { text: string; start: number; end: number }[]; from: number; to: number };

// Слова титров (text) с таймингами произнесённых слов (spoken).
const wordsOf = (c: Bg18Cue) => {
  const shown = c.text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  const said = c.words;
  if (said.length === shown.length) return shown.map((text, i) => ({ text, start: said[i].start, end: said[i].end }));
  const span = c.to - c.from;
  const total = shown.reduce((a, w) => a + w.length, 0);
  let t = c.from;
  return shown.map((text) => {
    const d = (span * text.length) / total;
    const w = { text, start: t, end: t + d };
    t += d;
    return w;
  });
};

export const chunksOf = (c: Bg18Cue): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Chunk["words"] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, from: cur[0].start, to: cur[cur.length - 1].end });
    cur = [];
  };
  for (const w of wordsOf(c)) {
    const chars = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    if (cur.length >= 2 && (cur.length >= 5 || chars > 24)) flush();
    cur.push(w);
    if (/[.,!?—]$/.test(w.text) && cur.length >= 2) flush();
  }
  flush();
  // одинокое последнее слово — к предыдущей фразе
  const last = out[out.length - 1];
  const prev = out[out.length - 2];
  if (last && prev && last.words.length === 1 && [...prev.words, ...last.words].reduce((a, x) => a + x.text.length + 1, 0) <= 34) {
    out.splice(-2, 2, { words: [...prev.words, ...last.words], from: prev.from, to: last.to });
  }
  return out;
};

export const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const t = f / FPS;
  for (const c of tl.cues) {
    const y = Y[c.scene];
    if (y === null || t < c.from - 0.1 || t > c.to + 0.5) continue;
    const chunks = chunksOf(c);
    const idx = chunks.findIndex((k, i) => t < (chunks[i + 1]?.from ?? Infinity) - 0.02);
    const k = chunks[Math.max(0, idx)];
    const appear = interpolate(t, [k.from - 0.1, k.from + 0.08], [0, 1], clamp);
    const leave = interpolate(t, [c.to + 0.25, c.to + 0.5], [1, 0], clamp);
    const o = Math.min(appear, leave);
    return (
      <div style={abs({ left: 60, right: 60, top: y, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - appear) * 18}px) scale(${0.96 + 0.04 * appear})` })}>
        <div
          style={{
            ...font(58, 900, C.white),
            textAlign: "center",
            padding: "10px 24px",
            borderRadius: 22,
            background: "rgba(22,52,107,0.88)",
            textShadow: "0 3px 10px rgba(10,20,45,0.55), 0 0 2px rgba(10,20,45,0.8)",
          }}
        >
          {k.words.map((w, i) => (
            <span key={i} style={{ color: t >= w.start - 0.03 && t <= w.end + 0.08 ? C.yellow : C.white }}>
              {w.text}
              {i < k.words.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
