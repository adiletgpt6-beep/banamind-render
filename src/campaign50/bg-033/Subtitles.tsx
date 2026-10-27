// Субтитры реплик (кыргызча): одна реплика за раз, крупно, с хорошим
// контрастом, над нижней зоной интерфейса Reels (≈ 400 px снизу).
// Длинная реплика делится на части ≤ 2 строк по словам; части сменяются по
// фактическим таймингам слов озвучки. На финальном экране субтитров нет:
// там те же слова написаны крупно (Бишкек, профиль, WhatsApp и номер).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "./anim";
import { useTimeline } from "./context";
import { SAFE } from "./palette";
import { BG33_VIDEO, lineById } from "./script";

const FPS = BG33_VIDEO.fps;
const MAX_CHARS = 30;

const chunks = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    const endsSentence = /[.!?]$/.test(cur);
    if (
      next.length <= MAX_CHARS * 2 &&
      !(endsSentence && cur.length > MAX_CHARS * 0.8)
    )
      cur = next;
    else {
      out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  return out;
};

export const Subtitles: React.FC = () => {
  const { cues } = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.45);
  if (!cue || cue.scene === "cta") return null;
  const line = lineById(cue.id);
  const parts = chunks(line.text);
  const words = line.text.split(/\s+/).filter(Boolean);
  let idx = 0;
  if (parts.length > 1) {
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).filter(Boolean).length;
      return s;
    });
    const wt = (i: number) =>
      cue.words.length === words.length
        ? cue.words[i].start
        : cue.from + ((cue.to - cue.from) * i) / words.length;
    for (let k = 1; k < parts.length; k++)
      if (t >= wt(startOf[k]) - 0.1) idx = k;
  }
  const a =
    easeOut((t - (cue.from - 0.12)) / 0.18) *
    (1 - easeOut((t - (cue.to + 0.3)) / 0.15));
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left - 30,
        right: SAFE.right,
        bottom: SAFE.bottom,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 860,
          padding: "14px 28px",
          borderRadius: 24,
          backgroundColor: "rgba(20,40,90,0.86)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 46,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          opacity: a,
          boxShadow: "0 10px 30px rgba(10,15,30,0.22)",
        }}
      >
        {parts[idx]}
      </div>
    </div>
  );
};
