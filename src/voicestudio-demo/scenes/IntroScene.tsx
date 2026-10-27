import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppWindow, Check, Chip, Cursor, VSLogo, Waveform, clamp, typed, useEnter } from "../components/ui";
import { C, FONT, GRAD, wordFrame } from "../theme";

const SAMPLE = "Привет! Этот текст сейчас станет живой речью.";

// 7–15 с: знакомство с VoiceStudio — интерфейс и превращение текста в аудио.
export const IntroScene: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (needle: string, fb = 0) => wordFrame("intro", needle, fb) - offset;

  const logo = useEnter(at("VoiceStudio", 0.8) - 6, 10);
  const title = useEnter(at("VoiceStudio", 0.8), 14);
  const win = useEnter(at("Open", 2) - 4, 16);
  const typeStart = at("Open", 2) + 8;
  const press = at("превращает", 4.5);
  const pressAnim = interpolate(frame, [press, press + 4, press + 10], [1, 0.9, 1], clamp);
  const gen = interpolate(frame, [press + 8, press + 70], [0, 1], clamp);
  const done = interpolate(frame, [press + 70, press + 82], [0, 1], clamp);
  const arrow = interpolate(frame, [press + 2, press + 16], [0, 1], clamp);
  const chips: Array<[string, string, string]> = [
    ["open source", "Open", C.violet],
    ["локально", "Локально", C.orange],
    ["без облака", "облака", C.blue],
  ];

  return (
    <>
      <div style={{ position: "absolute", top: 214, left: 0, right: 0, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: FONT.text,
            fontWeight: 800,
            fontSize: 34,
            color: C.ink,
            padding: "10px 26px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.8)",
            border: `1.5px solid ${C.soft}`,
            opacity: useEnter(0, 16),
          }}
        >
          знакомься
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 28,
        }}
      >
        <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -40}deg)` }}>
          <VSLogo size={120} />
        </div>
        <div
          data-fit="title"
          style={{
            fontFamily: FONT.display,
            fontWeight: 900,
            fontSize: 88,
            letterSpacing: -2,
            color: C.navy,
            opacity: title,
            transform: `translateX(${(1 - title) * 60}px)`,
            whiteSpace: "nowrap",
          }}
        >
          Voice
          <span style={{ background: GRAD.brand, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Studio
          </span>
        </div>
      </div>

      <div style={{ position: "absolute", top: 462, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
        {chips.map(([label, needle, color], i) => {
          const f = at(needle, 2 + i * 2);
          const p = spring({ frame: frame - f + 3, fps, config: { damping: 12, mass: 0.7 } });
          return (
            <div key={label} style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
              <Chip color={color} active={interpolate(frame, [f, f + 8], [0, 1], clamp) + 0.0001} size={32}>
                {label}
              </Chip>
            </div>
          );
        })}
      </div>

      <div style={{ opacity: win, transform: `translateY(${(1 - win) * 80}px)` }}>
        <AppWindow title="VoiceStudio — Studio" style={{ top: 580, left: 80, width: 920, height: 650 }}>
          <div style={{ padding: "34px 40px" }}>
            <div style={{ fontFamily: FONT.text, fontWeight: 700, fontSize: 26, color: "#8792AE", marginBottom: 14 }}>Текст</div>
            <div
              data-fit="text"
              style={{
                minHeight: 128,
                padding: "22px 26px",
                borderRadius: 24,
                background: "#F5F7FC",
                border: `1.5px solid ${C.soft}`,
                fontFamily: FONT.text,
                fontWeight: 700,
                fontSize: 38,
                lineHeight: 1.3,
                color: C.navy,
              }}
            >
              {typed(SAMPLE, frame, typeStart, 30)}
              {frame < press ? <Cursor h={36} /> : null}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 26 }}>
              <div
                style={{
                  padding: "16px 34px",
                  borderRadius: 999,
                  background: GRAD.orange,
                  color: "#FFF",
                  fontFamily: FONT.text,
                  fontWeight: 800,
                  fontSize: 32,
                  transform: `scale(${pressAnim})`,
                  boxShadow: `0 12px 30px ${C.orange}55`,
                }}
              >
                ▶ Озвучить
              </div>
              <svg width="170" height="40" style={{ opacity: arrow }}>
                <path d={`M 6 20 L ${6 + 140 * arrow} 20`} stroke={C.muted} strokeWidth="6" strokeLinecap="round" />
                <path d={`M ${132 * arrow} 8 L ${148 * arrow} 20 L ${132 * arrow} 32`} stroke={C.muted} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: C.violet, opacity: arrow }}>речь.wav</div>
            </div>
            <div
              style={{
                marginTop: 30,
                height: 150,
                borderRadius: 26,
                background: "linear-gradient(180deg, #FFFFFF 0%, #F6F4FF 100%)",
                border: `1.5px solid ${C.soft}`,
                display: "flex",
                alignItems: "center",
                padding: "0 28px",
                gap: 22,
                position: "relative",
              }}
            >
              <Waveform width={640} height={100} bars={44} progress={gen} seed={5} live={gen > 0 && gen < 1} />
              <div style={{ opacity: done, transform: `scale(${0.5 + 0.5 * done})` }}>
                <Check size={70} p={done} />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 28 + 640 * gen,
                  top: 18,
                  bottom: 18,
                  width: 4,
                  borderRadius: 2,
                  background: C.orange,
                  opacity: gen > 0 && gen < 1 ? 1 : 0,
                }}
              />
            </div>
          </div>
        </AppWindow>
      </div>
    </>
  );
};
