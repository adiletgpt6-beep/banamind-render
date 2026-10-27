// Субтитры живой речи (кыргызча) — строго по расшифровке, слово в слово.
// Фраза делится на части ≤ 2 строк; текущее слово подсвечивается жёлтым
// в момент, когда звучит (караоке). Карточка стоит над нижней зоной
// интерфейса Reels (≈ 400 px снизу) и не заходит на лицо.
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import type { LivePhrase, LiveWord } from "./sync";
import { easeInOut, ramp } from "./sync";
import { LIVE_COLORS as C } from "./theme";

const MAX_CHARS = 30; // символов в строке
const MAX_LINES = 2;

// Части фразы: подряд идущие слова, пока помещаются в 2 строки.
const split = (words: readonly LiveWord[]) => {
  const parts: LiveWord[][] = [];
  let cur: LiveWord[] = [];
  const len = (ws: LiveWord[]) => ws.reduce((s, w) => s + w.text.length + 1, 0);
  for (const w of words) {
    // перенос по длине или после конца предложения (если часть уже не короткая)
    const sentenceEnd = cur.length > 0 && /[.!?:]$/.test(cur[cur.length - 1].text) && len(cur) >= 18;
    if (cur.length && (sentenceEnd || len([...cur, w]) > MAX_CHARS * MAX_LINES - 4)) {
      parts.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) parts.push(cur);
  // одно «висящее» слово в конце присоединяем к предыдущей части
  const last = parts[parts.length - 1];
  const prev = parts[parts.length - 2];
  if (prev && last.length === 1 && len([...prev, ...last]) <= MAX_CHARS * MAX_LINES + 4 && !/[.!?:]$/.test(prev[prev.length - 1].text)) {
    parts.splice(parts.length - 2, 2, [...prev, ...last]);
  }
  return parts;
};

export const Captions: React.FC<{
  readonly phrases: readonly LivePhrase[];
  readonly bottom?: number; // px от низа кадра до низа карточки
  readonly hideFrom?: number; // секунда, после которой субтитры не показываются
  // "karaoke" — подсветка звучащего слова; "calm" — вся часть фразы ровно
  // белым, без пословной смены цвета (спокойнее для живых видео)
  readonly mode?: "karaoke" | "calm";
}> = ({ phrases, bottom = 410, hideFrom = Infinity, mode = "karaoke" }) => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  if (t >= hideFrom) return null;
  // активная часть: от начала первого слова до начала следующей части
  const parts = phrases.flatMap((p) => split(p.words));
  let idx = -1;
  for (let i = 0; i < parts.length; i++) if (t >= parts[i][0].start - 0.12) idx = i;
  if (idx < 0) return null;
  const part = parts[idx];
  const next = parts[idx + 1];
  const end = Math.min(part[part.length - 1].end + 0.7, next ? next[0].start - 0.12 : Infinity);
  if (t > end + 0.2) return null;
  const a = ramp(t, part[0].start - 0.12, 0.16) * (1 - ramp(t, end, 0.2, easeInOut));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 900,
          padding: "14px 30px 16px",
          borderRadius: 26,
          background: "rgba(10, 22, 54, 0.74)",
          border: "1.5px solid rgba(255,255,255,0.14)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
          opacity: a,
          transform: `translateY(${(1 - a) * 18}px) scale(${0.97 + 0.03 * a})`,
          textAlign: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.22,
          color: C.white,
        }}
      >
        {part.map((w, i) => {
          const on = mode === "calm" || t >= w.start - 0.04;
          const now = mode === "karaoke" && on && t <= w.end + 0.12;
          return (
            <span key={i} style={{ color: now ? C.yellow : on ? C.white : "rgba(255,255,255,0.58)" }}>
              {w.text}
              {i < part.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
