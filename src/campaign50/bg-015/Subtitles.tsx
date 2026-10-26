// Кыргызские субтитры реплик: одна фраза за раз, до двух строк, над нижней
// зоной интерфейса Reels (≈ 400 px снизу). Длинная реплика делится по
// предложениям/словам и сменяется по фактическим таймингам слов.
// В финале (CTA) субтитров нет — там весь текст уже крупно на экране.
import { useCurrentFrame } from "remotion";
import { COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { easeOut } from "../../two-schedules-2d/rig/motion";
import { useTimeline } from "./context";
import { BG15_VIDEO, lineById } from "./script";

const FPS = BG15_VIDEO.fps;
const MAX = 34;

const chunks = (text: string): string[] => {
  const out: string[] = [];
  const sentences = text.match(/[^.!?…]+[.!?…]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  for (const s of sentences) {
    if (s.length <= MAX * 2) {
      out.push(s);
      continue;
    }
    // по словам; после запятой/тире — перенос, если строка уже не короткая
    let cur = "";
    for (const w of s.split(/\s+/)) {
      const next = cur ? `${cur} ${w}` : w;
      if ((next.length > MAX * 2 - 4 || (/[,—]$/.test(cur) && cur.length >= 24)) && cur) {
        out.push(cur);
        cur = w;
      } else cur = next;
    }
    if (cur) out.push(cur);
  }
  return out;
};

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = tl.cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.4);
  if (!cue) return null;
  const line = lineById(cue.id);
  if (line.subtitle === false) return null;
  const parts = chunks(line.text);
  let idx = 0;
  if (parts.length > 1) {
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).filter(Boolean).length;
      return s;
    });
    const total = wi;
    const wt = (i: number) => (cue.words.length === total ? cue.words[i].start : cue.from + ((cue.to - cue.from) * i) / total);
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.1) idx = k;
  }
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.25)) / 0.15));
  const narrator = cue.role === "narrator";
  return (
    <div style={{ position: "absolute", left: 70, right: 150, bottom: 410, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 860,
          padding: "16px 30px",
          borderRadius: 26,
          backgroundColor: narrator ? "rgba(255,255,255,0.95)" : "rgba(20,40,90,0.84)",
          color: narrator ? COLORS.navy : "#FFFFFF",
          borderLeft: narrator ? `10px solid ${COLORS.yellow}` : "none",
          fontFamily,
          fontSize: 46,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          opacity: a,
          boxShadow: "0 10px 30px rgba(10,15,30,0.25)",
        }}
      >
        {parts[idx]}
      </div>
    </div>
  );
};
