// Субтитры в финальном рендере: спокойная контрастная подложка, без
// пословного мигания. Положение зависит от плана: над крупной вставкой
// телефона в сцене решения, светлая компактная строка на финальной
// карточке; запас снизу — для интерфейса соцсетей.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { NB2_SCENES, NB2_VIDEO } from "./script";
import type { Nb2Cue } from "./timing";
import { buildNb2Subtitles } from "./subtitles";
import { clamp } from "./rig/motion";

const scene = (id: string) => NB2_SCENES.find((s) => s.id === id)!;

export const Nb2Subtitles: React.FC<{ readonly cues: readonly Nb2Cue[] }> = ({ cues }) => {
  const t = useCurrentFrame() / NB2_VIDEO.fps;
  const sub = buildNb2Subtitles(cues).find((s) => t >= s.from && t < s.to);
  if (!sub) return null;
  const a = clamp((t - sub.from) / 0.12) * clamp((sub.to - t) / 0.12);
  const onCard = t >= scene("cta").from;
  const overPhone = t >= scene("decision").from + 1.2 && !onCard;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, ...(overPhone ? { top: 676 } : { bottom: onCard ? 250 : 290 }), display: "flex", justifyContent: "center", opacity: a, pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 900,
          padding: onCard ? "10px 26px" : "14px 30px",
          borderRadius: 24,
          backgroundColor: onCard ? "rgba(240,244,250,0.92)" : "rgba(18,26,48,0.8)",
          color: onCard ? "#1C2B55" : "#FFFFFF",
          fontFamily,
          fontSize: onCard ? 44 : 52,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
        }}
      >
        {sub.text}
      </div>
    </div>
  );
};
