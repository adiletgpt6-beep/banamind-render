// Встроенные субтитры (по требованию): одна реплика, максимум две короткие
// строки, простой шрифт, контраст без массивной плашки, внизу кадра (не
// закрывают стол и руки — зона стола заканчивается выше). Ответы на
// обязательные паузы появляются только с началом своей реплики.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { TimelineContext } from "./context";
import { easeOut } from "./rig/motion";
import { L815_ROLE_NAMES } from "./script";

const MAX = 44;

export const splitLines = (text: string): string[] => {
  if (text.length <= MAX) return [text];
  const words = text.split(" ");
  let best = -1;
  let bestDiff = Infinity;
  let len = 0;
  for (let i = 0; i < words.length - 1; i++) {
    len += words[i].length + (i ? 1 : 0);
    const diff = Math.abs(len - (text.length - len - 1));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best + 1).join(" "), words.slice(best + 1).join(" ")];
};

export const Subtitles: React.FC = () => {
  const tl = useContext(TimelineContext);
  const f = useCurrentFrame();
  const cue = tl.cues.find((c) => f >= c.fromFrame - 2 && f <= c.toFrame + 12);
  if (!cue) return null;
  const a = easeOut((f - (cue.fromFrame - 2)) / 5) * (1 - easeOut((f - (cue.toFrame + 8)) / 4));
  const lines = splitLines(cue.text);
  return (
    <div style={{ position: "absolute", left: 120, right: 120, bottom: 36, display: "flex", justifyContent: "center", pointerEvents: "none", opacity: a }}>
      <div style={{ fontFamily, fontSize: 40, fontWeight: 700, color: "#FFFFFF", textShadow: "0 2px 6px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)", textAlign: "center", lineHeight: 1.25, backgroundColor: "rgba(20,24,40,0.42)", padding: "6px 22px", borderRadius: 12 }}>
        <span style={{ opacity: 0.75, fontSize: 30 }}>{L815_ROLE_NAMES[cue.role]}: </span>
        {lines.map((l, i) => (
          <span key={i}>
            {i ? <br /> : null}
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};
