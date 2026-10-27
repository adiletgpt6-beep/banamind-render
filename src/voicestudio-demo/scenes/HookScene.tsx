import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Robot } from "../components/Robot";
import { Card, Cursor, Waveform, clamp, typed, useEnter } from "../components/ui";
import { C, FONT, GRAD, levelAt } from "../theme";

const LINES: Array<{ text: string; gradient?: boolean }> = [
  { text: "Claude Code" },
  { text: "может" },
  { text: "говорить!", gradient: true },
];

// 0–7 с: хук. Заголовок «Claude Code может говорить!», терминал, волна, робот.
export const HookScene: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const abs = frame + offset;
  const robotIn = useEnter(18, 11);
  const term = useEnter(30, 15);
  const speakStart = 64;
  const speak = interpolate(frame, [speakStart, speakStart + 12], [0, 1], clamp);
  const lvl = levelAt(abs);

  return (
    <>
      {LINES.map((l, i) => {
        const p = spring({ frame: frame - i * 7, fps, config: { damping: 12, mass: 0.7 } });
        return (
          <div
            key={l.text}
            data-fit="title"
            style={{
              position: "absolute",
              top: 210 + i * 118,
              left: 60,
              right: 60,
              textAlign: "center",
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 100,
              lineHeight: 1.1,
              letterSpacing: -2,
              color: C.navy,
              opacity: Math.min(1, p * 1.5),
              transform: `translateY(${(1 - p) * 80}px) scale(${0.85 + 0.15 * p})`,
            }}
          >
            {l.gradient ? (
              <span
                style={{
                  background: GRAD.brand,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {l.text}
              </span>
            ) : (
              l.text
            )}
          </div>
        );
      })}

      <Card
        dark
        style={{
          top: 600,
          left: 110,
          width: 860,
          height: 230,
          padding: "30px 40px",
          opacity: term,
          transform: `translateY(${(1 - term) * 60}px)`,
        }}
      >
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {["#FF6159", "#FFBD2E", "#28C941"].map((c) => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
          ))}
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 36, color: "#DDE6FF" }}>
          <span style={{ color: C.orange2 }}>›</span> {typed("скажи привет голосом", frame, 36, 26)}
          {frame < speakStart ? <Cursor h={38} /> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 22, opacity: speak }}>
          <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: C.cyan }}>♪ говорю</div>
          <Waveform width={520} height={60} bars={30} colors={[C.cyan, C.violet]} seed={3} />
        </div>
      </Card>

      {/* Звуковые кольца вокруг робота */}
      {[0, 1, 2].map((k) => {
        const t = ((frame - speakStart + k * 18) % 54) / 54;
        const visible = frame > speakStart;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 540 - 220,
              top: 1080 - 220,
              width: 440,
              height: 440,
              borderRadius: "50%",
              border: `5px solid ${[C.orange2, C.cyan, C.violet][k]}`,
              opacity: visible ? (1 - t) * 0.45 : 0,
              transform: `scale(${0.6 + t * 0.9})`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 540 - 150,
          top: 880,
          opacity: robotIn,
          transform: `translateY(${(1 - robotIn) * 200}px) scale(${0.5 + 0.5 * robotIn})`,
        }}
      >
        <Robot size={300} level={lvl} wave={frame > 30 ? 40 + 30 * Math.sin(frame / 5) : 0} mood={frame < 64 ? "happy" : "star"} id="hook" />
      </div>
    </>
  );
};
