// Динамические кыргызские субтитры: короткие фрагменты (≤ 4 слова,
// ≤ 26 символов) по фактическим таймингам слов ElevenLabs. Слово, которое
// звучит, подсвечивается; акцентные слова — цветом бренда. Позиция —
// безопасная зона Reels: выше нижних 420 px (подпись, кнопки) и левее
// правой колонки иконок (≈ 140 px).
import { useCurrentFrame } from "remotion";
import { CONTENT, FPS, SCENES } from "../content";
import { sans } from "../fonts";
import { CUES, type Cue, type VoiceWord } from "../voice";
import { easeOut } from "./anim";

const P = CONTENT.brand.palette;
const DEEP: readonly (keyof typeof SCENES)[] = ["showcase"];

const chunk = (words: VoiceWord[]) => {
  const out: VoiceWord[][] = [];
  let cur: VoiceWord[] = [];
  for (const w of words) {
    const len = [...cur, w].map((x) => x.text).join(" ").length;
    const gap = cur.length ? w.start - cur[cur.length - 1].end : 0;
    if (cur.length && (cur.length >= 4 || len > 26 || gap > 0.35 || /[.!?,]$/.test(cur[cur.length - 1].text))) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
};

const clean = (s: string) => s.replace(/[.,!?«»"]/g, "");

export const Subtitles: React.FC = () => {
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue: Cue | undefined = CUES.find((c) => t >= c.from - 0.1 && t <= c.to + 0.4);
  if (!cue) return null;
  const groups = chunk(cue.words);
  const gi = groups.findLastIndex((g) => t >= g[0].start - 0.08);
  if (gi < 0) return null;
  const g = groups[gi];
  const next = groups[gi + 1];
  const endT = next ? next[0].start - 0.08 : cue.to + 0.4;
  const appear = easeOut((t - (g[0].start - 0.08)) / 0.16);
  const leave = next ? 0 : easeOut((t - (endT - 0.2)) / 0.2);
  const scene = (Object.keys(SCENES) as (keyof typeof SCENES)[]).find((k) => t >= SCENES[k].from && t < SCENES[k].from + SCENES[k].dur) ?? "hook";
  const deep = DEEP.includes(scene);
  const base = deep ? "#FFFFFF" : P.ink;
  const halo = deep ? "0 3px 18px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6)" : "0 0 18px rgba(255,255,255,0.95), 0 0 6px rgba(255,255,255,0.9)";
  return (
    <div style={{ position: "absolute", left: 70, right: 150, bottom: 450, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 18,
          transform: `translateY(${(1 - appear) * 26}px) scale(${0.94 + appear * 0.06})`,
          opacity: appear * (1 - leave),
        }}
      >
        {g.map((w, i) => {
          const on = t >= w.start - 0.05;
          const isAccent = (cue.line.accent ?? []).some((a) => clean(w.text).toLowerCase() === a.toLowerCase());
          const pop = easeOut((t - (w.start - 0.05)) / 0.12);
          return (
            <span
              key={i}
              style={{
                fontFamily: sans,
                fontWeight: 800,
                fontSize: 64,
                lineHeight: 1.15,
                color: isAccent ? P.accent : base,
                opacity: on ? 1 : 0.38,
                transform: `scale(${on ? 1 + 0.06 * (1 - pop) : 1})`,
                textShadow: halo,
                display: "inline-block",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
