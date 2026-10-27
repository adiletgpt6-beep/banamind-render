// Вшитые субтитры (по умолчанию выключены; prop subtitles). Одна реплика за
// раз, не более двух строк, контраст и безопасный отступ; субтитр начинается
// вместе с речью и исчезает после неё, не захватывая зрительские паузы.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { FPS } from "../core/video";
import { lineById } from "./script";
import type { L80Timeline } from "./timeline";

const MAX = 46;
const chunks = (text: string): string[] => {
  const sentences = text.match(/[^.!?…]+[.!?…]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    const next = cur ? `${cur} ${s}` : s;
    if (next.length <= MAX * 2) cur = next;
    else {
      if (cur) out.push(cur);
      cur = s;
    }
  }
  if (cur) out.push(cur);
  return out;
};

export const Subtitles: React.FC<{ readonly tl: L80Timeline }> = ({ tl }) => {
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = tl.cues.find((c) => t >= c.from - 0.08 && t <= c.to + 0.35);
  if (!cue) return null;
  const line = lineById(cue.id);
  const parts = chunks(line.text);
  let idx = 0;
  if (parts.length > 1) {
    const words = line.text.split(/\s+/).filter(Boolean);
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).filter(Boolean).length;
      return s;
    });
    const wt = (i: number) => cue.words[i]?.start ?? cue.from + ((cue.to - cue.from) * i) / words.length;
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.1) idx = k;
  }
  return (
    <div style={{ position: "absolute", left: 160, right: 160, bottom: 56, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ maxWidth: 1400, padding: "10px 26px", borderRadius: 16, backgroundColor: "rgba(16,24,48,0.72)", color: "#FFFFFF", fontFamily, fontSize: 40, fontWeight: 700, lineHeight: 1.25, textAlign: "center" }}>{parts[idx]}</div>
    </div>
  );
};
