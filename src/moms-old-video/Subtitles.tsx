// Субтитры фильма №33 (кыргызча): одна реплика за раз, не больше двух
// строк, белый текст на тёмной плашке. Поля интерфейса Reels: 90 px по
// бокам, 140 px сверху, 260 px снизу — плашка стоит над нижним полем
// (низ плашки — 300 px от края кадра) или, если внизу в этот момент ноги
// танцующих, под верхним полем (subTop). Длинная реплика делится на части
// по предложениям и словам; части сменяются по фактическим таймингам слов.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { CuesContext } from "./context";
import { easeOut } from "./rig/motion";
import { lineById, MOV_VIDEO } from "./script";
import { chunkStarts, subChunks } from "./subtitleChunks";

const FPS = MOV_VIDEO.fps;
export const SUB = { side: 90, top: 140, bottom: 260, boxBottom: 300, boxTop: 170 } as const;

export const Subtitles: React.FC = () => {
  const cues = useContext(CuesContext);
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.4);
  if (!cue) return null;
  const line = lineById(cue.id);
  if (line.subtitle === false) return null;
  const parts = subChunks(line.text);
  const words = line.text.split(/\s+/).filter(Boolean);
  let idx = 0;
  if (parts.length > 1) {
    const starts = chunkStarts(parts, cue.words.map((w) => w.text));
    const wt = (i: number) => cue.words[i]?.start ?? cue.from + ((cue.to - cue.from) * i) / words.length;
    for (let k = 1; k < parts.length; k++) if (t >= wt(starts[k]) - 0.08) idx = k;
  }
  const a = easeOut((t - (cue.from - 0.12)) / 0.16) * (1 - easeOut((t - (cue.to + 0.26)) / 0.14));
  const pos: React.CSSProperties = line.subTop ? { top: SUB.boxTop } : { bottom: SUB.boxBottom };
  return (
    <div style={{ position: "absolute", left: SUB.side, right: SUB.side, ...pos, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 900,
          padding: "14px 28px",
          borderRadius: 24,
          backgroundColor: "rgba(16,24,48,0.8)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 52,
          fontWeight: 800,
          lineHeight: 1.2,
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
