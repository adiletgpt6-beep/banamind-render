import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FeatureHeader } from "../components/Header";
import { BigNumber, Card, Check, Connector, Label, PopCard, Spark, VSLogo, Waveform, clamp, typed } from "../components/ui";
import { C, FONT, wordFrame } from "../theme";

const CMD = [
  "claude mcp add --transport http \\",
  "  voicestudio \\",
  "  http://localhost:3900/mcp/",
];

const Node: React.FC<{
  delay: number;
  x: number;
  y: number;
  w: number;
  h: number;
  lit: number;
  color: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}> = ({ delay, x, y, w, h, lit, color, icon, title, sub }) => (
  <PopCard delay={delay} from="scale" style={{ left: x, top: y, width: w, height: h, padding: "0 26px" }}>
    <div
      style={{
        position: "absolute",
        inset: -5,
        borderRadius: 45,
        border: `5px solid ${color}`,
        opacity: lit,
      }}
    />
    <div style={{ height: "100%", display: "flex", alignItems: "center", gap: 20 }}>
      {icon}
      <div>
        <div data-fit="node" style={{ fontFamily: FONT.text, fontWeight: 800, fontSize: 36, color: C.navy, whiteSpace: "nowrap" }}>
          {title}
        </div>
        <Label size={24}>{sub}</Label>
      </div>
    </div>
  </PopCard>
);

// 26–39 с: возможность №2 — Claude Code → MCP → VoiceStudio → WAV.
export const McpScene: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const at = (needle: string, fb = 0) => wordFrame("mcp", needle, fb) - offset;
  const head = 26;
  const code = at("строка", 2) - 6;
  const nodes = at("подключён", 5) - 14;
  const write = at("пишет", 7);
  const call = at("вызывает", 8.3);
  const get = at("получает", 10);
  const seg = (s: number, len = 16) => interpolate(frame, [s, s + len], [0, 1], clamp);
  const a2b = seg(write);
  const b2c = seg(call);
  const c2d = seg(get);
  const done = seg(get + 14, 10);

  return (
    <>
      <BigNumber n={2} color={C.blue} start={0} end={head} />
      <FeatureHeader n={2} title="MCP для Claude Code" color={C.blue} icon={<Spark size={40} />} delay={head - 4} />

      <PopCard dark delay={code} style={{ top: 345, left: 80, width: 920, height: 220, padding: "26px 34px" }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 24, color: "#7F8DB8", marginBottom: 12 }}>терминал · одна строка</div>
        {CMD.map((line, i) => {
          const before = CMD.slice(0, i).join("").length;
          const shown = typed(CMD.join(""), frame, code + 6, 60).slice(before, before + line.length);
          return (
            <div key={i} data-fit="code" style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, lineHeight: 1.45, color: "#E6ECFF", whiteSpace: "pre" }}>
              {i === 0 ? <span style={{ color: C.orange2 }}>$ </span> : null}
              {shown.replace("voicestudio", "\u0000").split("\u0000").map((part, k, arr) => (
                <React.Fragment key={k}>
                  {part}
                  {k < arr.length - 1 ? <span style={{ color: C.cyan }}>voicestudio</span> : null}
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </PopCard>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Connector d="M 480 690 L 600 690" length={120} progress={a2b} color={C.orange} />
        <Connector d="M 800 750 L 800 900" length={150} progress={b2c} color={C.blue} />
        <Connector d="M 600 985 L 480 985" length={120} progress={c2d} color={C.violet} />
      </svg>

      <Node delay={nodes} x={80} y={605} w={400} h={170} lit={a2b} color={C.orange} icon={<Spark size={66} spin={frame * 1.5} />} title="Claude Code" sub="пишет текст" />
      <PopCard delay={nodes + 6} from="scale" style={{ left: 600, top: 630, width: 400, height: 120 }}>
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 44,
              color: "#FFF",
              background: C.navy,
              padding: "8px 22px",
              borderRadius: 18,
              boxShadow: b2c > 0 ? `0 0 0 ${6 + 4 * Math.sin(frame / 3)}px ${C.blue}33` : "none",
            }}
          >
            MCP
          </div>
          <Label size={26}>протокол</Label>
        </div>
      </PopCard>
      <Node delay={nodes + 12} x={600} y={900} w={400} h={170} lit={b2c} color={C.blue} icon={<VSLogo size={74} />} title="VoiceStudio" sub="синтез речи" />
      <Node
        delay={nodes + 18}
        x={80}
        y={900}
        w={400}
        h={170}
        lit={done}
        color={C.green}
        icon={
          <div style={{ position: "relative" }}>
            <svg width="66" height="78" viewBox="0 0 33 39">
              <path d="M 3 3 H 21 L 30 12 V 36 H 3 Z" fill="#EEF2FB" stroke={C.violet} strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 21 3 V 12 H 30" fill="none" stroke={C.violet} strokeWidth="2.5" strokeLinejoin="round" />
              <text x="16.5" y="29" textAnchor="middle" fontSize="8" fontWeight="800" fill={C.violet} fontFamily="sans-serif">
                WAV
              </text>
            </svg>
            <div style={{ position: "absolute", right: -14, bottom: -8, opacity: done }}>
              <Check size={36} p={done} />
            </div>
          </div>
        }
        title="voice.wav"
        sub="готовый файл"
      />

      {/* Вызов инструмента и результат */}
      <Card
        style={{
          top: 1110,
          left: 80,
          width: 920,
          height: 150,
          padding: "0 30px",
          opacity: seg(call - 4, 10),
          transform: `translateY(${(1 - seg(call - 4, 10)) * 40}px)`,
        }}
      >
        <div style={{ height: "100%", display: "flex", alignItems: "center", gap: 20 }}>
          <div data-fit="tool" style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: C.ink, whiteSpace: "nowrap" }}>
            <span style={{ color: C.blue }}>generate_speech</span>(<span style={{ color: C.orange }}>«Привет!»</span>)
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", opacity: c2d }}>
            <Waveform width={300} height={70} bars={20} seed={11} live={c2d > 0} colors={[C.green, C.blue]} />
          </div>
        </div>
      </Card>
    </>
  );
};
