// Кыргызские субтитры всех реплик: короткие куски, смена по фактическим
// таймингам слов озвучки, текущее слово подсвечено жёлтым. Над нижней
// зоной интерфейса Reels (≈ 330 px снизу), ниже лиц и финальной карточки.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../../two-schedules-2d/rig/motion";
import { FPS, useTimeline } from "./context";
import { PAL } from "./Kitchen";
import { wordTime } from "./timeline";

const ROLE_LABEL: Record<string, string | null> = { son: "Бала", mother: "Апа", narrator: null };

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = tl.cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.4);
  if (!cue) return null;
  const chunks = cue.line.chunks;
  let idx = 0;
  for (let k = 1; k < chunks.length; k++) if (t >= wordTime(cue, chunks[k].w) - 0.08) idx = k;
  const chunk = chunks[idx];
  const chunkStart = idx === 0 ? cue.from - 0.12 : wordTime(cue, chunk.w) - 0.08;
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.25)) / 0.15));
  const enter = easeOut((t - chunkStart) / 0.16);
  // подсветка: слово по доле прошедшего куска (тексты и произношение
  // совпадают по числу слов в каждом куске, кроме номера телефона)
  const words = chunk.text.split(/\s+/);
  const nextW = idx + 1 < chunks.length ? chunks[idx + 1].w : Infinity;
  const spokenIdx = cue.words.length ? cue.words.filter((w, i) => i >= chunk.w && i < nextW && w.start <= t).length - 1 : -1;
  const spokenTotal = cue.words.length ? cue.words.filter((_, i) => i >= chunk.w && i < nextW).length : words.length;
  const hi = spokenIdx < 0 ? -1 : Math.min(words.length - 1, Math.floor(((spokenIdx + 0.5) / Math.max(1, spokenTotal)) * words.length));
  const label = ROLE_LABEL[cue.role];
  return (
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 330, display: "flex", justifyContent: "center", pointerEvents: "none", opacity: a }}>
      <div
        style={{
          maxWidth: 940,
          padding: "16px 30px 18px",
          borderRadius: 28,
          backgroundColor: "rgba(30,47,92,0.86)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          textAlign: "center",
          transform: `translateY(${(1 - enter) * 10}px)`,
        }}
      >
        {label ? <div style={{ fontFamily, fontWeight: 900, fontSize: 26, color: PAL.yellow, letterSpacing: 1, marginBottom: 2 }}>{label}</div> : null}
        <div style={{ fontFamily, fontWeight: 800, fontSize: 46, lineHeight: 1.22, color: "#FFFFFF", opacity: clamp(enter * 1.5) }}>
          {words.map((w, i) => (
            <span key={i} style={{ color: i === hi ? PAL.yellow : "#FFFFFF" }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
