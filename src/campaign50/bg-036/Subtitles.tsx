// Субтитры реплик (кыргызча): одна реплика за раз, крупно, с хорошим
// контрастом, над нижней зоной интерфейса Reels (≈ 400 px снизу) и левее
// правых кнопок. Длинная реплика делится на части ≤ 2 строк (по
// предложениям, затем по запятой/тире или слову у середины); части
// сменяются по фактическим таймингам слов озвучки. На финальном экране
// субтитров нет: там те же слова крупно.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "./art/motion";
import { useTimeline } from "./context";
import { C } from "./palette";
import { BG36_VIDEO, lineById } from "./script";

const FPS = BG36_VIDEO.fps;
const MAX_CHARS = 56; // ≈ 2 строки по 46 px

// Делит длинную фразу по запятой/тире ближе к середине, иначе по слову у
// середины (рекурсивно, пока части не короче MAX_CHARS).
const splitPhrase = (p: string): string[] => {
  if (p.length <= MAX_CHARS) return [p];
  const words = p.split(" ");
  let best = -1;
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const left = words.slice(0, i).join(" ");
    const punct = /[,—]$/.test(left) || words[i] === "—";
    // не обрывать строку на союзе или определении («жана», «кырк беш …»)
    const glued = /^(жана|же|бул|бир|беш|кырк|толук|биринчи)$/iu.test(words[i - 1]);
    const score = Math.abs(left.length - p.length / 2) - (punct ? p.length * 0.3 : 0) + (glued ? p.length : 0);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  // тире остаётся в конце первой части
  const cut = words[best] === "—" ? best + 1 : best;
  return [...splitPhrase(words.slice(0, cut).join(" ")), ...splitPhrase(words.slice(cut).join(" "))];
};

// Части субтитра: предложения, длинные — по смысловым паузам.
export const chunks = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .flatMap(splitPhrase);

export const Subtitles: React.FC = () => {
  const { cues } = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.45);
  if (!cue || cue.scene === "cta") return null;
  const line = lineById(cue.id);
  const parts = chunks(line.text);
  const words = line.text.split(/\s+/).filter(Boolean);
  // индекс слова субтитров → индекс слова с таймингом (тире пропущены)
  const timed = words.map((w) => /[\p{L}\d]/u.test(w));
  const timedIndex = (wi: number) => timed.slice(0, wi).filter(Boolean).length;
  let idx = 0;
  if (parts.length > 1) {
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).filter(Boolean).length;
      return s;
    });
    const wt = (i: number) => {
      const k = Math.min(timedIndex(i), cue.words.length - 1);
      return cue.words[k]?.start ?? cue.from;
    };
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.1) idx = k;
  }
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.3)) / 0.15));
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 150,
        bottom: 400,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 880,
          padding: "14px 28px 16px",
          borderRadius: 26,
          backgroundColor: "rgba(20,40,90,0.88)",
          borderBottom: `5px solid ${C.yellow}`,
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
