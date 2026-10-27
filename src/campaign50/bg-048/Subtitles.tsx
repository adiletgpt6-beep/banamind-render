// Субтитры реплик (кыргызча) короткими фразами по фактическим таймингам
// слов озвучки: фраза ≤ ~34 знаков, не заканчивается союзом. Позиция — по
// сценам, в безопасной зоне Reels (x 90…930, y 250…1520): в фантазии —
// в полосе над головами героев, на кухне — внизу, над телефоном — сверху.
// На финальном экране субтитров нет (там все надписи призыва).
import { interpolate, useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { fontFamily } from "./fonts";
import { NAVY } from "./palette";
import { B48_VIDEO, type B48Role } from "./script";
import { chunkCue } from "./subtitleChunks";
import type { B48Cue } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ROLE_COLOR: Record<B48Role, string> = {
  father: "#24407A",
  mother: "#F4C430",
  daughter: "#FF8FC7",
  narrator: "#9AA8C4",
};

// Позиция: top (px) или bottom (px от низа кадра).
const placeOf = (c: B48Cue): { top?: number; bottom?: number } => {
  if (c.scene === "hook" || c.scene === "buttons") return { top: 492 };
  if (c.scene === "site" && c.id === "n01") return { top: 262 };
  if (c.scene === "example") return { top: 1346 };
  return { bottom: 1920 - 1515 };
};

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const t = useCurrentFrame() / B48_VIDEO.fps;
  // при смене говорящего побеждает последняя начавшаяся реплика
  const cue = [...tl.cues].reverse().find((c) => c.subtitle && t >= c.from - 0.12 && t <= c.to + 0.5);
  if (!cue) return null;
  const chunks = chunkCue(cue);
  const ch = chunks.find((k) => t >= k.from - 0.12 && t < k.to) ?? (t >= cue.to ? chunks[chunks.length - 1] : chunks[0]);
  const o = Math.min(interpolate(t, [cue.from - 0.12, cue.from + 0.05], [0, 1], clamp), interpolate(t, [cue.to + 0.3, cue.to + 0.5], [1, 0], clamp));
  const pop = interpolate(t, [ch.from - 0.12, ch.from + 0.08], [0.94, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 150,
        ...placeOf(cue),
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 44,
          lineHeight: 1.22,
          color: NAVY,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 26,
          padding: "14px 30px 16px",
          textAlign: "center",
          boxShadow: "0 10px 28px rgba(20,25,50,0.22)",
          borderLeft: `10px solid ${ROLE_COLOR[cue.role]}`,
          transform: `scale(${pop})`,
          maxWidth: 840,
        }}
      >
        {ch.text}
      </div>
    </div>
  );
};
