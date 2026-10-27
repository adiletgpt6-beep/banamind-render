// Субтитры реплик (кыргызча): одна реплика за раз, крупно, над нижней
// зоной интерфейса Reels (≈ 400 px снизу). Голоса героев — на тёмной
// плашке, диктор — на светлой. Финальная реплика диктора не дублируется:
// на финальном экране уже есть город и оба контакта.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { CuesContext } from "./context";
import { easeOut } from "./rig/motion";
import { B6_CTA_FROM, b6LineById, B6_VIDEO } from "./script";

const FPS = B6_VIDEO.fps;
const MAX_CHARS = 32;

const chunks = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= MAX_CHARS * 2) cur = next;
    else {
      out.push(cur);
      cur = w;
    }
    if (/[.!?]$/.test(w) && cur.length > MAX_CHARS) {
      out.push(cur);
      cur = "";
    }
  }
  if (cur) out.push(cur);
  return out;
};

export const Subtitles: React.FC = () => {
  const cues = useContext(CuesContext);
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.45);
  if (!cue || cue.from >= B6_CTA_FROM) return null;
  const line = b6LineById(cue.id);
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
    const wt = (i: number) => cue.words[i]?.start ?? cue.from + ((cue.to - cue.from) * i) / words.length;
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.1) idx = k;
  }
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.3)) / 0.15));
  const narrator = cue.role === "narrator";
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 400, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 900,
          padding: "16px 30px",
          borderRadius: 26,
          backgroundColor: narrator ? "rgba(255,255,255,0.94)" : "rgba(16,24,48,0.8)",
          color: narrator ? "#14285A" : "#FFFFFF",
          border: narrator ? "4px solid #FFC90E" : "none",
          fontFamily,
          fontSize: 48,
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
