// Титры реплик (кыргызча): белая карточка с тёмно-синим текстом и жёлтой
// меткой говорящего. Над нижней зоной интерфейса Reels (400 px снизу),
// ниже лиц. Длинная реплика делится на части ≤ 2 строк; части сменяются по
// фактическим таймингам слов озвучки. В финале текст уже крупно на экране.
import { useCurrentFrame } from "remotion";
import { COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { easeOut } from "../../two-schedules-2d/rig/motion";
import { useTimeline } from "./context";
import { BG020_VIDEO, bg020LineById, ROLE_LABEL } from "./script";

const FPS = BG020_VIDEO.fps;
const MAX = 30; // символов в строке

const chunks = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    // новая часть — после конца предложения или при переполнении 2 строк
    if (next.length > MAX * 2 || (cur && /[.!?]$/.test(cur) && cur.length > 18)) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
};

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = tl.cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.4);
  if (!cue) return null;
  const line = bg020LineById(cue.id);
  if (line.subtitle === false) return null;
  const parts = chunks(line.text);
  let idx = 0;
  if (parts.length > 1) {
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).length;
      return s;
    });
    const total = wi;
    const wt = (i: number) => cue.words[i]?.start ?? cue.from + ((cue.to - cue.from) * i) / total;
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.08) idx = k;
  }
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.25)) / 0.15));
  return (
    <div style={{ position: "absolute", left: 90, right: 150, bottom: 410, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "relative",
          maxWidth: 840,
          padding: "18px 32px 20px",
          borderRadius: 28,
          backgroundColor: "rgba(255,255,255,0.94)",
          color: COLORS.navy,
          fontFamily,
          fontSize: 46,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          opacity: a,
          translate: `0 ${(1 - a) * 10}px`,
          boxShadow: "0 12px 30px rgba(20,30,60,0.22)",
          borderBottom: `6px solid ${COLORS.yellow}`,
        }}
      >
        <div style={{ position: "absolute", left: 28, top: -26, padding: "4px 16px", borderRadius: 999, backgroundColor: COLORS.yellow, fontSize: 28, fontWeight: 900 }}>{ROLE_LABEL[line.role]}</div>
        {parts[idx]}
      </div>
    </div>
  );
};
