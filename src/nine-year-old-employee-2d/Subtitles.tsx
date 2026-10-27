// Субтитры (кыргызча) совпадают с тем, что звучит. Длинная реплика делится
// на короткие смысловые части (обычно до двух строк); части сменяются по
// фактическим таймингам слов — без прыжков и смены цвета каждого слова.
// Живой речи — короткая подпись говорящего. Обычно субтитры внизу (над
// нижним безопасным полем); в крупных планах листа и рисунка — вверху.
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { clamp, easeOut } from "./rig/motion";
import { NY2_VIDEO, lineById } from "./script";
import { C, F, SUB } from "./theme";

const FPS = NY2_VIDEO.fps;
const MAX = 46; // символов в части (≈ 2 строки по 58 px)

// Реплики, во время которых субтитры уходят наверх (крупный план листа).
const TOP: ReadonlySet<string> = new Set(["N01"]);

export const chunksOf = (text: string): string[] => {
  const parts = text.match(/[^.!?…,]+[.!?…,»]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    const next = cur ? `${cur} ${p}` : p;
    if (next.length <= MAX || (cur && cur.length <= 8)) cur = next;
    else {
      if (cur) out.push(cur);
      cur = p;
    }
  }
  if (cur) out.push(cur);
  return out;
};

const LABEL: Record<string, { text: string; color: string; ink: string } | null> = {
  narrator: null,
  father: { text: "Ата", color: C.blue, ink: C.white },
  mother: { text: "Апа", color: C.pink, ink: C.ink },
  son: { text: "Бектур", color: C.yellow, ink: C.ink },
};

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  if (f >= tl.contactFrom) return null;
  const started = tl.cues.filter((c) => t >= c.from - 0.1);
  const cue = started[started.length - 1];
  if (!cue || t > cue.to + 0.35) return null;
  const line = lineById(cue.line);
  const parts = chunksOf(line.text);
  // начало каждой части — по слову озвучки (слова файла = слова spoken)
  const words = cue.words;
  const counts = parts.map((p) => p.split(/\s+/).filter(Boolean).length);
  const spokenWords = (line.spoken ?? line.text).split(/\s+/).filter(Boolean).length;
  const textWords = line.text.split(/\s+/).filter(Boolean).length;
  const scale = spokenWords / Math.max(1, textWords);
  let idx = 0;
  let wi = 0;
  const startAt = counts.map((n) => {
    const s = Math.round(wi * scale);
    wi += n;
    return words[s]?.start ?? cue.from;
  });
  for (let k = 1; k < parts.length; k++) if (t >= startAt[k] - 0.08) idx = k;
  const partStart = idx === 0 ? cue.from - 0.1 : startAt[idx] - 0.08;
  const a = easeOut((t - partStart) / 0.14) * (1 - easeOut((t - (cue.to + 0.2)) / 0.15));
  const card = easeOut((t - (cue.from - 0.1)) / 0.16) * (1 - easeOut((t - (cue.to + 0.2)) / 0.15));
  const lab = LABEL[line.role];
  const top = TOP.has(cue.id);
  return (
    <div
      style={{
        position: "absolute",
        left: SUB.x,
        width: SUB.w,
        ...(top ? { top: SUB.topY } : { bottom: 1920 - SUB.bottomY }),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: clamp(card),
        pointerEvents: "none",
      }}
    >
      {lab ? (
        <div style={{ alignSelf: "center", backgroundColor: lab.color, color: lab.ink, fontFamily: F.text, fontWeight: 800, fontSize: 30, padding: "6px 18px 8px", marginBottom: -2, opacity: a }}>{lab.text}</div>
      ) : null}
      <div
        style={{
          backgroundColor: "rgba(17,17,17,0.86)",
          color: C.paper,
          fontFamily: F.text,
          fontWeight: 800,
          fontSize: 56,
          lineHeight: 1.22,
          padding: "16px 34px 20px",
          textAlign: "center",
          maxWidth: SUB.w,
          boxSizing: "border-box",
        }}
      >
        <span style={{ opacity: a, display: "inline-block", transform: `translateY(${(1 - a) * 6}px)` }}>{parts[idx]}</span>
      </div>
    </div>
  );
};
