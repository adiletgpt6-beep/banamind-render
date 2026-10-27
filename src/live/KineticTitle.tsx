// Кинетический заголовок: слова появляются точно в момент, когда звучат
// (время из расшифровки), ключевое слово получает плашку — жёлтую (решение),
// красную (проблема) или тёмно-синюю. Плашка «вытягивается» слева направо.
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { easeInOut, easeOut, ramp, springy } from "./sync";
import { LIVE_COLORS as C } from "./theme";

export type TitleWord = {
  readonly text: string;
  readonly at: number; // секунда появления
  readonly accent?: "yellow" | "red" | "navy" | "outline";
};

export type TitleLine = readonly TitleWord[];

const ACCENT_BG: Record<string, string> = { yellow: C.yellow, red: C.red, navy: C.navy };
const ACCENT_FG: Record<string, string> = { yellow: C.navyInk, red: C.white, navy: C.yellow };

export const KineticTitle: React.FC<{
  readonly lines: readonly TitleLine[];
  readonly out: number; // секунда начала исчезновения
  readonly y: number; // центр блока по вертикали (px)
  readonly size?: number;
  readonly align?: "center" | "left";
  readonly x?: number;
  readonly backdrop?: boolean; // мягкая тень под текстом на светлом фоне
}> = ({ lines, out, y, size = 92, align = "center", x = 70, backdrop = true }) => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const first = Math.min(...lines.flat().map((w) => w.at));
  if (t < first - 0.2 || t > out + 0.45) return null;
  const exit = ramp(t, out, 0.32, easeInOut);
  return (
    <div
      style={{
        position: "absolute",
        left: align === "center" ? 40 : x,
        right: align === "center" ? 40 : 150,
        top: y,
        transform: `translateY(-50%) translateY(${-exit * 40}px)`,
        opacity: 1 - exit,
        filter: exit > 0 ? `blur(${exit * 8}px)` : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: size * 0.12,
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: -1,
        textTransform: "uppercase",
      }}
    >
      {backdrop ? (
        <div
          style={{
            position: "absolute",
            inset: `-${size * 0.6}px -40px`,
            background: "radial-gradient(ellipse at center, rgba(6,14,38,0.55) 0%, rgba(6,14,38,0.25) 45%, rgba(6,14,38,0) 72%)",
            opacity: ramp(t, first - 0.1, 0.3),
            zIndex: -1,
          }}
        />
      ) : null}
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", gap: size * 0.24, flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start" }}>
          {line.map((w, wi) => {
            const k = springy(t, w.at, 0.5);
            const a = ramp(t, w.at, 0.18);
            const pill = w.accent && w.accent !== "outline" ? ramp(t, w.at + 0.04, 0.32, easeOut) : 0;
            const outline = w.accent === "outline";
            return (
              <span
                key={wi}
                style={{
                  position: "relative",
                  display: "inline-block",
                  opacity: a,
                  transform: `translateY(${(1 - k) * size * 0.55}px) scale(${0.86 + 0.14 * k})`,
                  filter: a < 1 ? `blur(${(1 - a) * 10}px)` : undefined,
                  color: w.accent && !outline && pill > 0.45 ? ACCENT_FG[w.accent] : C.white,
                  padding: w.accent && !outline ? `0 ${size * 0.16}px` : 0,
                  textShadow: w.accent && !outline && pill > 0.45 ? "none" : "0 6px 28px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.45)",
                  WebkitTextStroke: outline ? `3px ${C.yellow}` : undefined,
                  ...(outline ? { color: "transparent" } : {}),
                }}
              >
                {w.accent && !outline ? (
                  <span
                    style={{
                      position: "absolute",
                      inset: `${size * 0.04}px 0 ${size * 0.0}px 0`,
                      background: ACCENT_BG[w.accent],
                      borderRadius: size * 0.18,
                      transform: `scaleX(${pill})`,
                      transformOrigin: "0% 50%",
                      zIndex: -1,
                      boxShadow: `0 10px 40px ${w.accent === "yellow" ? "rgba(255,201,14,0.45)" : w.accent === "red" ? "rgba(255,77,94,0.45)" : "rgba(6,14,38,0.5)"}`,
                    }}
                  />
                ) : null}
                <span style={{ position: "relative" }}>{w.text}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
