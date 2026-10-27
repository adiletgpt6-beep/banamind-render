// Субтитры реплик (кыргызча): одна реплика за раз, крупно, с хорошим
// контрастом, над нижней зоной интерфейса Reels (≈ 400 px снизу).
// Длинная реплика делится на части ≤ 2 строк; части сменяются по
// фактическим таймингам слов озвучки. На финальном экране субтитров нет:
// там те же слова написаны крупно (Бишкек, профиль, WhatsApp и номер).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { useTimeline } from "./context";
import { easeOut } from "./rig/motion";
import { BG45_VIDEO, lineById } from "./script";

const FPS = BG45_VIDEO.fps;
// Не больше ≈ 2 строк на экране: часть ≤ MAX символов. Длинное
// предложение делится на равные по длине части по границам слов —
// без «висящих» одиночных слов в конце.
const MAX = 50;

const balanced = (words: string[], k: number): string[] => {
  // длина строки до слова j (без пробела в конце)
  const cum = words.reduce<number[]>((acc, w, i) => [...acc, (acc[i] ?? -1) + 1 + w.length], [0]).map((x, i) => (i === 0 ? 0 : x));
  const total = cum[words.length];
  const cuts: number[] = [0];
  for (let c = 1; c < k; c++) {
    const target = (c * total) / k;
    let best = -1;
    let bestScore = Infinity;
    for (let j = cuts[c - 1] + 1; j <= words.length - (k - c); j++) {
      const prev = words[j - 1];
      // лучше резать после запятой/тире, нельзя разрывать «алдын ала»
      // нельзя разрывать «алдын ала», «каттам уюштурууга» и причастный оборот
      const glued = (prev === "алдын" && words[j] === "ала") || (prev === "каттам" && words[j].startsWith("уюштур")) || words[j].startsWith("макулдашыл");
      const score = Math.abs(cum[j] - target) - (/[,—:]$/.test(prev) ? 14 : 0) + (glued ? 40 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = j;
      }
    }
    cuts.push(best);
  }
  cuts.push(words.length);
  return cuts.slice(1).map((e, i) => words.slice(cuts[i], e).join(" "));
};

const chunks = (text: string): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((x) => x.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  const split = (s: string): string[] => {
    const words = s.split(/\s+/).filter(Boolean);
    const k = Math.ceil(s.length / MAX);
    if (k <= 1 || words.length < 2) return [s];
    return balanced(words, k).flatMap((part) => (part.length > MAX && part !== s ? split(part) : [part]));
  };
  for (const s of sentences) out.push(...split(s));
  return out;
};

export const Subtitles: React.FC = () => {
  const { cues } = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.45);
  if (!cue || cue.scene === "cta") return null;
  const line = lineById(cue.id);
  const parts = chunks(line.text);
  // слова как в таймингах озвучки (без отдельных тире и знаков)
  const tok = (x: string) => x.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  const words = tok(line.text);
  let idx = 0;
  if (parts.length > 1) {
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += tok(p).length;
      return s;
    });
    // начало слова в разметке может включать паузу: сдвиг к первому кадру,
    // где голос слышен (огибающая файла)
    const heard = (s: number) => {
      let k = Math.max(0, Math.floor((s - cue.audioFrom) * FPS));
      while (k < cue.env.length && cue.env[k] < 0.05) k++;
      return Math.max(s, cue.audioFrom + k / FPS);
    };
    const wt = (i: number) => (cue.words.length === words.length ? heard(cue.words[i].start) : cue.from + ((cue.to - cue.from) * i) / words.length);
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
          fontSize: 44,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          textWrap: "balance",
          opacity: a,
          boxShadow: "0 10px 30px rgba(10,15,30,0.25)",
        }}
      >
        {parts[idx]}
      </div>
    </div>
  );
};
