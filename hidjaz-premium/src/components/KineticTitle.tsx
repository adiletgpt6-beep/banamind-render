// Заголовок по словам: каждое слово выезжает из-под маски с лёгким
// размытием; слова-акценты — курсив цвета акцента.
import { useCurrentFrame } from "remotion";
import { CONTENT } from "../content";
import { serif } from "../fonts";
import { easeOut } from "./anim";

const P = CONTENT.brand.palette;

export const KineticTitle: React.FC<{
  lines: readonly string[];
  accent?: readonly string[];
  start?: number;
  stagger?: number;
  size?: number;
  color?: string;
  align?: "center" | "left";
  exitAt?: number | null;
}> = ({ lines, accent = [], start = 0, stagger = 5, size = 118, color = P.ink, align = "center", exitAt = null }) => {
  const f = useCurrentFrame();
  let k = 0;
  const exit = exitAt === null ? 0 : easeOut((f - exitAt) / 12);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", gap: size * 0.02 }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", columnGap: size * 0.26 }}>
          {line.split(" ").map((w, wi) => {
            const p = easeOut((f - start - k++ * stagger) / 16);
            const isAccent = accent.some((a) => w.replace(/[.,!?]/g, "") === a);
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: serif,
                    fontWeight: isAccent ? 600 : 700,
                    fontStyle: isAccent ? "italic" : "normal",
                    fontSize: size,
                    lineHeight: 1.02,
                    color: isAccent ? P.accent : color,
                    transform: `translateY(${(1 - p) * 105 + exit * -40}%)`,
                    opacity: p * (1 - exit),
                    filter: `blur(${(1 - p) * 6 + exit * 6}px)`,
                  }}
                >
                  {w}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
