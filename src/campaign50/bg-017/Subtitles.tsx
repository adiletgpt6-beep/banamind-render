// Субтитры реплик (кыргызча) вверху кадра, над листом альбома: низ кадра
// (интерфейс Reels/Shorts, руки и телефон) остаётся свободным. У реплик
// героев — короткая метка, кто говорит. На финальном экране субтитров нет:
// там все надписи призыва.
import { interpolate, useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { fontFamily } from "./fonts";
import { NAVY, YELLOW } from "./props";
import { B17_ROLE_LABEL, B17_VIDEO } from "./script";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const t = useCurrentFrame() / B17_VIDEO.fps;
  const cue = tl.cues.find((c) => c.subtitle && t >= c.from - 0.15 && t <= c.to + 0.45);
  if (!cue) return null;
  const o = Math.min(interpolate(t, [cue.from - 0.15, cue.from], [0, 1], clamp), interpolate(t, [cue.to + 0.25, cue.to + 0.45], [1, 0], clamp));
  const label = B17_ROLE_LABEL[cue.role];
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 170,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: o,
        transform: `translateY(${(1 - o) * -10}px)`,
        fontFamily,
      }}
    >
      {label ? (
        <div style={{ fontSize: 30, fontWeight: 1000, color: NAVY, background: YELLOW, borderRadius: 20, padding: "4px 20px", marginBottom: -14, zIndex: 1 }}>{label}</div>
      ) : null}
      <div
        style={{
          fontWeight: 800,
          fontSize: 46,
          lineHeight: 1.25,
          color: NAVY,
          background: "rgba(255,255,255,0.94)",
          borderRadius: 28,
          padding: label ? "24px 32px 16px" : "16px 32px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(60,30,10,0.22)",
          maxWidth: 940,
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
