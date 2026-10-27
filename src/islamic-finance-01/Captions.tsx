// Word-aligned English captions. One compact chunk (≤ 4 words) at a time, in
// the lower third but above the Shorts UI. Spoken words light up as they are
// said; key financial words are green or yellow.
import { useCurrentFrame } from "remotion";
import { buildChunks, type Chunk } from "./captions";
import { fontFamily } from "./fonts";
import { type If01Manifest } from "./manifest";
import { FPS, prog } from "./motion";
import { PALETTE, ZONE } from "./theme";

export const Captions: React.FC<{ readonly manifest: If01Manifest; readonly chunks?: Chunk[] }> = ({ manifest, chunks }) => {
  const frame = useCurrentFrame();
  const t = (frame + 0.5) / FPS;
  const list = chunks ?? buildChunks(manifest);
  const c = list.find((x) => t >= x.from - 0.08 && t <= x.to);
  if (!c) return null;
  const a = prog(frame, (c.from - 0.08) * FPS, (c.from - 0.08) * FPS + 4);
  const o = 1 - prog(frame, c.to * FPS - 3, c.to * FPS);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: ZONE.captionTop, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          gap: "0 0.32em",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 940,
          padding: "18px 34px",
          borderRadius: 30,
          backgroundColor: "rgba(17,27,50,0.86)",
          fontFamily,
          fontSize: 52,
          fontWeight: 800,
          lineHeight: 1.2,
          color: "#FFFFFF",
          opacity: a * o,
          transform: `translateY(${(1 - a) * 14}px)`,
          boxShadow: "0 12px 34px rgba(17,27,50,0.18)",
        }}
      >
        {c.words.map((w, i) => {
          const spoken = t >= w.start - 0.02;
          const color = w.key ? (w.money ? PALETTE.yellow : PALETTE.green) : "#FFFFFF";
          return (
            <span key={i} style={{ color, opacity: spoken ? 1 : 0.42, display: "inline-block", transform: `scale(${spoken && t < w.end + 0.08 ? 1.04 : 1})`, transformOrigin: "50% 100%" }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
