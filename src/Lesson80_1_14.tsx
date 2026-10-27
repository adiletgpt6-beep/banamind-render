// Проект lesson-80, урок 1 «Аллах — наш Создатель», мини-фильм 14
// «Можно ли посчитать дары?» (80-1-14). 1920 × 1080, 30 к/с.
// Сцены, реплики, паузы и действия — по фактической озвучке
// (src/lesson80/timeline.ts); каждый кадр — чистая функция номера кадра.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "./fonts";
import { World } from "./lesson80/art/World";
import { SheetInsert } from "./lesson80/art/Insert";
import { buildShots, camTransform, shotAt } from "./lesson80/shots";
import { computeState, drawsOf } from "./lesson80/state";
import { buildCues, cueAt } from "./lesson80/subtitles";
import { buildTimeline, type L80Manifest } from "./lesson80/timeline";
import { L80_VIDEO } from "./lesson80/script";
import { l80Sounds } from "./lesson80/sound";

export type Lesson80Props = { readonly manifest: L80Manifest; readonly marks?: Record<string, number> };

const Subtitle: React.FC<{ text: string; age: number }> = ({ text, age }) => {
  const o = interpolate(age, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 46,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          padding: "10px 30px 12px",
          borderRadius: 18,
          background: "rgba(24, 32, 48, 0.58)",
          color: "#FFFFFF",
          fontFamily,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.22,
          textAlign: "center",
          textShadow: "0 2px 4px rgba(0,0,0,0.35)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Title: React.FC<{ frame: number }> = ({ frame }) => {
  const o = interpolate(frame, [12, 28, 120, 145], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 70, top: 52, opacity: o, fontFamily }}>
      <div style={{ fontSize: 50, fontWeight: 900, color: "#2E4F80", textShadow: "0 2px 0 rgba(255,255,255,0.7)" }}>{L80_VIDEO.title}</div>
    </div>
  );
};

export const Lesson80_1_14: React.FC<Lesson80Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tl = useMemo(() => buildTimeline(manifest), [manifest]);
  const shots = useMemo(() => buildShots(tl, drawsOf(tl)), [tl]);
  const cues = useMemo(() => buildCues(tl), [tl]);
  const sounds = useMemo(() => l80Sounds(tl), [tl]);
  const st = computeState(tl, frame);
  const { shot, start, end } = shotAt(shots, frame);
  const cue = cueAt(cues, frame);
  const t = Number.isFinite(end) ? (frame - start) / (end - start) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#F2E5CF" }}>
      {shot.kind === "world" ? (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
          <g transform={camTransform(shot.cam!, shot.push ?? 0, t, width, height)}>
            <World st={st} />
          </g>
        </svg>
      ) : (
        <SheetInsert
          view={shot.kind}
          st={st.sheetState}
          pointer={shot.kind === "pov" ? st.pov : st.camside}
          frame={frame}
          who={shot.kind === "pov" ? "bilal" : frame >= tl.marks["s8.take"] ? "teacher" : "yusuf"}
        />
      )}
      <Title frame={frame} />
      {cue ? <Subtitle text={cue.text} age={frame - cue.from} /> : null}
      {/* голоса */}
      {Object.entries(tl.lines).map(([id, l]) =>
        l.line.file ? (
          <Sequence key={id} from={l.from} durationInFrames={l.to - l.from + 6} name={`реплика ${id}`}>
            <Audio src={staticFile(`${L80_VIDEO.voiceDir}/${l.line.file}`)} />
          </Sequence>
        ) : null,
      )}
      {/* тихий фон комнаты и звуки действий */}
      <Audio src={staticFile(`${L80_VIDEO.voiceDir}/sfx/room.mp3`)} loop volume={0.55} />
      {sounds.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={s.len} name={s.name}>
          <Audio src={staticFile(`${L80_VIDEO.voiceDir}/sfx/${s.name}.mp3`)} volume={s.gain} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
