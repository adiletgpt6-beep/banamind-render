// Субтитры реплик (кыргызча): короткие смысловые куски из script.ts
// (subs), сменяются по фактическим таймингам слов озвучки; крупно, белым
// по тёмно-синей полупрозрачной плашке, над нижней зоной интерфейса Reels
// (≈ 400 px снизу). На финальном экране субтитров нет: там те же слова
// написаны крупно (Бишкек, профиль, WhatsApp и номер).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "../../two-schedules-2d/rig/motion";
import { useTimeline } from "./context";
import { BG31_VIDEO, lineById } from "./script";

const FPS = BG31_VIDEO.fps;

export const Subtitles: React.FC = () => {
  const { cues } = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.45);
  if (!cue || cue.scene === "cta") return null;
  const line = lineById(cue.id);
  const parts = line.subs ?? [line.text];
  const words = line.text.split(/\s+/).filter((w) => /\p{L}|\p{N}/u.test(w));
  let idx = 0;
  if (parts.length > 1) {
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).filter((w) => /\p{L}|\p{N}/u.test(w)).length;
      return s;
    });
    const wt = (i: number) => (cue.words.length === words.length ? cue.words[i].start : cue.from + ((cue.to - cue.from) * i) / words.length);
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.1) idx = k;
  }
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.3)) / 0.15));
  return (
    <div style={{ position: "absolute", left: 60, right: 150, bottom: 400, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 870,
          padding: "14px 28px",
          borderRadius: 24,
          backgroundColor: "rgba(16,24,48,0.82)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 44,
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
