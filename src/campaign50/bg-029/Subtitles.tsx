// Субтитры реплик (кыргызча): одна реплика за раз, крупно, с хорошим
// контрастом, над нижней зоной интерфейса Reels (≈ 400 px снизу).
// Длинная реплика делится на части ≤ 2 строк; части сменяются по
// фактическим таймингам слов озвучки. На финальном экране субтитров нет:
// там те же слова написаны крупно (Бишкек, профиль, WhatsApp и номер).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { useTimeline } from "./context";
import { easeOut } from "./anim";
import { BG29_VIDEO, lineById } from "./script";

const FPS = BG29_VIDEO.fps;
const MAX_CHARS = 32;

// Деление на части ≤ 2 строк: число частей по длине, границы — у конца
// предложения или у слова, ближайшего к равной доле (без «висящих» хвостов).
const chunks = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const n = Math.ceil(text.length / (MAX_CHARS * 2));
  if (n <= 1) return [text];
  const out: string[] = [];
  let from = 0;
  for (let k = 1; k < n; k++) {
    const target = (text.length * k) / n;
    let best = from + 1;
    let bestCost = Infinity;
    let pos = 0;
    for (let i = 0; i < words.length; i++) {
      pos += words[i].length + 1;
      if (i < from || i >= words.length - 1) continue;
      const cost = Math.abs(pos - target) - (/[.!?,]$/.test(words[i]) ? 14 : 0);
      if (cost < bestCost) {
        bestCost = cost;
        best = i + 1;
      }
    }
    out.push(words.slice(from, best).join(" "));
    from = best;
  }
  out.push(words.slice(from).join(" "));
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
    const wt = (i: number) => (cue.words.length === words.length ? cue.words[i].start : cue.from + ((cue.to - cue.from) * i) / words.length);
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.1) idx = k;
  }
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.3)) / 0.15));
  return (
    <div style={{ position: "absolute", left: 70, right: 150, bottom: 400, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 860,
          padding: "16px 30px",
          borderRadius: 26,
          backgroundColor: "rgba(16,24,48,0.8)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 48,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          opacity: a,
          boxShadow: "0 10px 30px rgba(10,15,30,0.25)",
        }}
      >
        {parts[idx].split(" ").map((w, i) => (
          <span key={i}>
            {i ? " " : ""}
            <span style={{ whiteSpace: "nowrap" }}>{w}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
