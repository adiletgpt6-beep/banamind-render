// Субтитры реплик (кыргызча): одна реплика за раз, крупно, белым по
// тёмно-синей плашке; слово, которое звучит сейчас, подсвечено жёлтым
// (по фактическим таймингам озвучки). Над нижней зоной интерфейса Reels
// (≈ 400 px снизу), правее не заходят под кнопки (≥ 150 px). Длинная
// реплика делится на части ≤ 2 строк — по смыслу (subs в script.ts), без
// отрыва вспомогательного глагола от сказуемого. В хуке и в финале субтитров нет:
// там те же слова написаны в кадре крупно (вопрос; Бишкек, профиль,
// WhatsApp и номер) — без дублирования вторым слоем.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { useTimeline } from "./context";
import { C } from "./palette";
import { easeOut } from "./rig/motion";
import { BG50_VIDEO, lineById } from "./script";

const FPS = BG50_VIDEO.fps;
const MAX_CHARS = 26;

export const subtitleChunks = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    const endsSentence = /[.!?]$/.test(cur);
    if (next.length <= MAX_CHARS * 2 && !(endsSentence && cur.length > MAX_CHARS * 0.6)) cur = next;
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
  if (!cue || cue.scene === "cta" || cue.scene === "hook") return null;
  const line = lineById(cue.id);
  const parts = line.subs ? [...line.subs] : subtitleChunks(line.text);
  const words = line.text.split(/\s+/).filter(Boolean);
  const wt = (i: number) => (cue.words.length === words.length ? cue.words[i].start : cue.from + ((cue.to - cue.from) * i) / words.length);
  const we = (i: number) => (cue.words.length === words.length ? cue.words[i].end : cue.from + ((cue.to - cue.from) * (i + 1)) / words.length);
  let idx = 0;
  let wi = 0;
  const startOf = parts.map((p) => {
    const s = wi;
    wi += p.split(/\s+/).filter(Boolean).length;
    return s;
  });
  for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.1) idx = k;
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.3)) / 0.15));
  const partWords = parts[idx].split(/\s+/).filter(Boolean);
  return (
    <div style={{ position: "absolute", left: 60, right: 150, bottom: 400, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 870,
          padding: "16px 30px 18px",
          borderRadius: 28,
          backgroundColor: "rgba(16,26,56,0.84)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          opacity: a,
          translate: `0 ${(1 - a) * 12}px`,
          boxShadow: "0 12px 30px rgba(10,15,30,0.28)",
        }}
      >
        {partWords.map((w, j) => {
          const gi = startOf[idx] + j;
          const now = t >= wt(gi) - 0.04 && t < we(gi) + 0.06;
          return (
            <span key={j} style={{ color: now ? C.yellow : "#FFFFFF" }}>
              {w}
              {j < partWords.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
