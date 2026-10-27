// Субтитры (кыргызча) совпадают с тем, что звучит. Длинная реплика делится
// на короткие смысловые части (одна-две строки); части сменяются по
// фактическим таймингам слов — без прыжков и смены цвета каждого слова.
// Живой речи — короткая подпись говорящего: отец в офисе — «Директор», с
// сыном и дома — «Ата» (до раскрытия зритель знает его только директором).
// Обычно субтитры внизу безопасной зоны (низ плашки y = 1580); в планах,
// где низ кадра занят действием (ремень, руки, рисунок), — вверху
// (интервалы SUB_TOP из сцен).
import { Fragment } from "react";
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { clamp, easeOut } from "./rig/motion";
import { M13_VIDEO, lineById, type M13SceneId } from "./script";
import { C, F, SUB } from "./theme";
import { subTopIntervals } from "./scenes";

const FPS = M13_VIDEO.fps;
const MAX = 38; // символов в части (≤ 2 строки по 52 px в ширине 810)

// Длинная часть без знаков препинания делится по словам на почти равные
// куски (каждый ≤ MAX символов) — не больше двух строк на экране.
const splitLong = (p: string): string[] => {
  if (p.length <= MAX) return [p];
  const words = p.split(/\s+/);
  const n = Math.ceil(p.length / MAX);
  const target = p.length / n;
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && next.length > target + 4 && out.length < n - 1) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
};

export const chunksOf = (text: string): string[] => {
  const parts = (text.match(/[^.!?…,:]+[.!?…,:»]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text]).flatMap(splitLong);
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    const next = cur ? `${cur} ${p}` : p;
    if (next.length <= MAX || (cur && cur.length <= 8 && next.length <= MAX + 8)) cur = next;
    else {
      if (cur) out.push(cur);
      cur = p;
    }
  }
  if (cur) out.push(cur);
  return out;
};

const OFFICE: ReadonlySet<M13SceneId> = new Set<M13SceneId>(["calendar", "notice", "ask", "drive", "back", "evening"]);
const labelOf = (role: string, scene: M13SceneId) => {
  if (role === "father") return OFFICE.has(scene) ? { text: "Директор", color: C.navy, ink: C.white } : { text: "Ата", color: C.blue, ink: C.white };
  if (role === "assistant") return { text: "Жардамчы", color: C.officeTeal, ink: C.white };
  if (role === "son") return { text: "Уулу", color: C.yellow, ink: C.navy };
  return null;
};

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const started = tl.cues.filter((c) => t >= c.from - 0.1);
  const cue = started[started.length - 1];
  if (!cue || t > cue.to + 0.35) return null;
  const line = lineById(cue.line);
  const parts = line.subs ? [...line.subs] : chunksOf(line.text);
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
  const lab = labelOf(line.role, cue.scene);
  const top = subTopIntervals(tl).some(([x, y]) => f >= x && f < y);
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
        <div style={{ alignSelf: "center", backgroundColor: lab.color, color: lab.ink, fontFamily: F.text, fontWeight: 800, fontSize: 30, padding: "6px 18px 8px", marginBottom: -2, borderRadius: "10px 10px 0 0", opacity: a }}>{lab.text}</div>
      ) : null}
      <div
        style={{
          backgroundColor: "rgba(16,22,38,0.84)",
          color: "#FFFFFF",
          fontFamily: F.text,
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.22,
          padding: "14px 32px 18px",
          borderRadius: 18,
          textAlign: "center",
          maxWidth: SUB.w,
          boxSizing: "border-box",
        }}
      >
        <span style={{ opacity: a, display: "inline-block", transform: `translateY(${(1 - a) * 6}px)` }}>
          {/* слова с дефисом (бизнес-борбордун, аты-жөнү) не переносятся внутри */}
          {parts[idx].split(" ").map((w, i) => (
            <Fragment key={i}>
              {i ? " " : ""}
              <span style={{ whiteSpace: "nowrap" }}>{w}</span>
            </Fragment>
          ))}
        </span>
      </div>
    </div>
  );
};
