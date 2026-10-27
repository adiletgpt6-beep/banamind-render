import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Robot } from "../components/Robot";
import { Spark, VSLogo, Waveform, clamp } from "../components/ui";
import { C, FONT, GRAD, SHADOW, levelAt, wordFrame } from "../theme";

const ORBIT: Array<{ key: string; color: string }> = [
  { key: "vs", color: C.violet },
  { key: "spark", color: C.orange },
  { key: "mic", color: C.pink },
  { key: "book", color: C.violet },
  { key: "film", color: C.blue },
  { key: "wave", color: C.cyan },
];

const OrbitIcon: React.FC<{ kind: string; color: string }> = ({ kind, color }) => {
  if (kind === "vs") {
    return <VSLogo size={86} />;
  }
  if (kind === "spark") {
    return <Spark size={70} />;
  }
  return (
    <svg width="64" height="64" viewBox="0 0 40 40">
      {kind === "mic" ? (
        <>
          <rect x="14" y="5" width="12" height="20" rx="6" fill={color} />
          <path d="M 9 18 A 11 11 0 0 0 31 18" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <line x1="20" y1="29" x2="20" y2="35" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : kind === "book" ? (
        <>
          <path d="M 4 9 Q 12 6 20 10 V 33 Q 12 29 4 32 Z" fill={color} />
          <path d="M 36 9 Q 28 6 20 10 V 33 Q 28 29 36 32 Z" fill={color} opacity="0.7" />
        </>
      ) : kind === "film" ? (
        <>
          <rect x="4" y="8" width="32" height="24" rx="6" fill={color} />
          <path d="M 17 14 L 26 20 L 17 26 Z" fill="#FFF" />
        </>
      ) : (
        [6, 12, 18, 24, 30].map((x, i) => <rect key={x} x={x} y={20 - [5, 11, 15, 9, 6][i]} width="4" height={[10, 22, 30, 18, 12][i]} rx="2" fill={color} />)
      )}
    </svg>
  );
};

// 52–60 с: финал — всё собирается в одну композицию.
export const FinaleScene: React.FC<{ offset: number; duration: number }> = ({ offset, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (needle: string, fb = 0) => wordFrame("finale", needle, fb) - offset;
  const lvl = levelAt(frame + offset);
  const gather = spring({ frame, fps, config: { damping: 16, mass: 1 } });
  const t1 = spring({ frame: frame - at("VoiceStudio", 0) + 2, fps, config: { damping: 12 } });
  const tPlus = spring({ frame: frame - at("плюс", 0.6), fps, config: { damping: 9 } });
  const t2 = spring({ frame: frame - at("Claude", 0.9) + 2, fps, config: { damping: 12 } });
  const slogan: Array<[string, string, string]> = [
    ["Создавай.", "Создавай", C.orange],
    ["Озвучивай.", "Озвучивай", C.blue],
    ["Анимируй.", "Анимируй", C.violet],
  ];
  // Плавное завершение: мягкое высветление в последние ~1.3 с.
  const outro = interpolate(frame, [duration - 40, duration - 2], [0, 1], clamp);

  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + outro * 0.05})` }}>
        <div style={{ position: "absolute", top: 210, left: 60, right: 60, textAlign: "center" }}>
          <div
            data-fit="title"
            style={{
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 96,
              letterSpacing: -2,
              color: C.navy,
              opacity: t1,
              transform: `translateY(${(1 - t1) * 50}px)`,
            }}
          >
            Voice
            <span style={{ background: GRAD.brand, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Studio</span>
          </div>
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 90,
              lineHeight: 1,
              color: C.orange,
              opacity: tPlus,
              transform: `scale(${tPlus}) rotate(${(1 - tPlus) * 90}deg)`,
              margin: "6px 0",
            }}
          >
            +
          </div>
          <div
            data-fit="title"
            style={{
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 96,
              letterSpacing: -2,
              color: C.navy,
              opacity: t2,
              transform: `translateY(${(1 - t2) * 50}px)`,
            }}
          >
            Claude Code
          </div>
        </div>

        {/* Орбита элементов вокруг робота */}
        {ORBIT.map((o, i) => {
          const base = (i / ORBIT.length) * Math.PI * 2 + frame * 0.012;
          const r = interpolate(gather, [0, 1], [760, 300]);
          const x = 540 + Math.cos(base) * r;
          const y = 990 + Math.sin(base) * r * 0.62;
          const s = spring({ frame: frame - 4 - i * 3, fps, config: { damping: 14 } });
          return (
            <div
              key={o.key}
              style={{
                position: "absolute",
                left: x - 66,
                top: y - 66,
                width: 132,
                height: 132,
                borderRadius: 40,
                background: "rgba(255,255,255,0.95)",
                border: `1.5px solid ${C.soft}`,
                boxShadow: SHADOW.card,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: s,
                transform: `scale(${s * (0.92 + 0.08 * Math.sin(frame / 10 + i))})`,
              }}
            >
              <OrbitIcon kind={o.key} color={o.color} />
            </div>
          );
        })}

        <div style={{ position: "absolute", left: 540 - 300, top: 1150, opacity: 0.9 }}>
          <Waveform width={600} height={90} bars={40} seed={21} colors={[C.orange2, C.violet]} />
        </div>
        <div style={{ position: "absolute", left: 540 - 140, top: 830 }}>
          <Robot size={280} level={lvl} mood={frame > at("Создавай", 3) ? "heart" : "star"} wave={30 + 35 * Math.sin(frame / 5)} point={-20} id="fin" />
        </div>

        <div style={{ position: "absolute", top: 1290, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          {slogan.map(([word, needle, color]) => {
            const p = spring({ frame: frame - at(needle, 3) + 3, fps, config: { damping: 10, mass: 0.6 } });
            return (
              <div
                key={word}
                data-fit="slogan"
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 900,
                  fontSize: 62,
                  lineHeight: 1.12,
                  color,
                  opacity: Math.min(1, p * 1.3),
                  transform: `translateY(${(1 - p) * 40}px) scale(${0.7 + 0.3 * p})`,
                }}
              >
                {word}
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 55%, rgba(255,255,255,0.75) 0%, #FFFFFF 70%)",
          opacity: outro,
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", opacity: interpolate(outro, [0.4, 1], [0, 1], clamp) }}>
        <VSLogo size={150} />
      </div>
    </>
  );
};
