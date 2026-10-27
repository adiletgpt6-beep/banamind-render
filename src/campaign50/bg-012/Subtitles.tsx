// Субтитры реплик (кыргызча) внизу безопасной зоны: над интерфейсом
// Reels/Shorts (нижние 400 px свободны). На финальном экране не нужны —
// там все надписи призыва.
import { interpolate, useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { fontFamily } from "./fonts";
import { B12_VIDEO } from "./script";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const t = useCurrentFrame() / B12_VIDEO.fps;
  const cue = tl.cues.find((c) => c.subtitle && t >= c.from - 0.15 && t <= c.to + 0.45);
  if (!cue) return null;
  const o = Math.min(interpolate(t, [cue.from - 0.15, cue.from], [0, 1], clamp), interpolate(t, [cue.to + 0.25, cue.to + 0.45], [1, 0], clamp));
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        // в хуке альбом занимает низ кадра — субтитр сверху
        top: cue.scene === "hook" ? 300 : 1350,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${(1 - o) * 10}px)`,
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 800,
          fontSize: 44,
          lineHeight: 1.25,
          color: "#1E3A6E",
          background: "rgba(255,255,255,0.93)",
          borderRadius: 28,
          padding: "16px 30px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(60,30,10,0.18)",
          maxWidth: 940,
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
