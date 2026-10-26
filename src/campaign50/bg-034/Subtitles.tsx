// Субтитры реплик (кыргызча): одна реплика за раз, крупно, с хорошим
// контрастом, над нижней зоной интерфейса Reels (≈ 400 px снизу).
// Длинная реплика делится на части ≤ 2 строк; части сменяются по
// фактическим таймингам слов озвучки. На финальном экране субтитров нет:
// там те же слова написаны крупно (Бишкек, профиль, WhatsApp и номер).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "../../two-schedules-2d/rig/motion";
import { useTimeline } from "./context";
import { BG34_VIDEO, lineById } from "./script";

const FPS = BG34_VIDEO.fps;
const MAX_CHARS = 30;

// Делит реплику на куски ≤ 2 строк (≈ MAX_CHARS × 2 символов) примерно
// равной длины; конец предложения — предпочтительное место разреза.
const chunks = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const total = text.length;
  const n = Math.max(1, Math.ceil(total / (MAX_CHARS * 2)));
  if (n === 1) return [words.join(" ")];
  const target = total / n;
  const out: string[] = [];
  let cur = "";
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = cur ? `${cur} ${w}` : w;
    const left = n - out.length - 1;
    const sentenceEnd = /[.!?,—]$/.test(cur) && cur.length >= target * 0.7;
    if (
      cur &&
      left > 0 &&
      (next.length > MAX_CHARS * 2 ||
        next.length > target * 1.12 ||
        sentenceEnd)
    ) {
      out.push(cur);
      cur = w;
    } else cur = next;
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
        left: 60,
        right: 150,
        bottom: 400,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 870,
          padding: "14px 28px",
          borderRadius: 24,
          backgroundColor: "rgba(16,24,48,0.82)",
          color: "#FFFFFF",
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
