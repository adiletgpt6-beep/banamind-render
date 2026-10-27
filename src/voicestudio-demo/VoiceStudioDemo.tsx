import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Background } from "./components/Background";
import { Captions } from "./components/Captions";
import { FitGuard } from "./components/FitGuard";
import { Robot } from "./components/Robot";
import { clamp } from "./components/ui";
import { FinaleScene } from "./scenes/FinaleScene";
import { HookScene } from "./scenes/HookScene";
import { IntroScene } from "./scenes/IntroScene";
import { McpScene } from "./scenes/McpScene";
import { UsesScene } from "./scenes/UsesScene";
import { VoicesScene } from "./scenes/VoicesScene";
import { C, FONT, FPS, TIMING, levelAt, sceneWindows, type SceneId } from "./theme";

const SCENES: Record<SceneId, React.FC<{ offset: number; duration: number }>> = {
  hook: HookScene,
  intro: IntroScene,
  voices: VoicesScene,
  mcp: McpScene,
  uses: UsesScene,
  finale: FinaleScene,
};

// Субтитры: позиция меняется по сценам, не по словам.
const CAPTION_LAYOUT: Record<SceneId, { top: number; robot: boolean; skip: number; hide?: boolean }> = {
  hook: { top: 1300, robot: false, skip: 4 },
  intro: { top: 1300, robot: true, skip: 0 },
  voices: { top: 1300, robot: true, skip: 0 },
  mcp: { top: 1316, robot: true, skip: 0 },
  uses: { top: 1316, robot: true, skip: 0 },
  finale: { top: 0, robot: false, skip: 0, hide: true },
};

export const SFX: Array<{ file: string; at: (w: ReturnType<typeof sceneWindows>) => number; volume: number }> = [
  { file: "whoosh", at: (w) => w[1].from - 8, volume: 0.22 },
  { file: "pop", at: (w) => w[2].from, volume: 0.22 },
  { file: "pop", at: (w) => w[3].from, volume: 0.22 },
  { file: "pop", at: (w) => w[4].from, volume: 0.22 },
  { file: "whoosh", at: (w) => w[5].from - 6, volume: 0.2 },
  { file: "chime", at: (w) => w[5].from + 10, volume: 0.16 },
];

/** Переход сцены: мягкий вход пружиной и лёгкий уход с размытием. */
const SceneShell: React.FC<{ duration: number; first: boolean; last: boolean; children: React.ReactNode }> = ({
  duration,
  first,
  last,
  children,
}) => {
  const frame = useCurrentFrame();
  const enter = first ? 1 : interpolate(frame, [0, 12], [0, 1], clamp);
  const exit = last ? 0 : interpolate(frame, [duration - 9, duration], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - exit),
        transform: `scale(${(0.97 + 0.03 * enter) * (1 + 0.035 * exit)}) translateY(${(1 - enter) * 30}px)`,
        filter: exit > 0 ? `blur(${exit * 8}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Эффектный переход хук → VoiceStudio: оранжевая «диафрагма». */
const Iris: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [at - 12, at], [0, 1], clamp);
  const fade = interpolate(frame, [at, at + 12], [1, 0], clamp);
  if (grow <= 0 || fade <= 0) {
    return null;
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 1200,
          top: 1050 - 1200,
          width: 2400,
          height: 2400,
          borderRadius: "50%",
          background: `radial-gradient(circle, #FFFFFF 0%, #FFF3EA 45%, ${C.orange2} 100%)`,
          transform: `scale(${grow})`,
          opacity: fade,
        }}
      />
    </AbsoluteFill>
  );
};

const CaptionLayer: React.FC<{ windows: ReturnType<typeof sceneWindows> }> = ({ windows }) => {
  const frame = useCurrentFrame();
  const i = windows.findIndex((w) => frame >= w.from && frame < w.to);
  if (i < 0) {
    return null;
  }
  const scene = TIMING.scenes[i];
  const layout = CAPTION_LAYOUT[scene.id];
  if (layout.hide) {
    return null;
  }
  const local = frame - windows[i].from;
  const robotIn = interpolate(local, [4, 16], [0, 1], clamp);
  const robotOut = interpolate(frame, [windows[i].to - 8, windows[i].to], [1, 0], clamp);
  return (
    <>
      {layout.robot ? (
        <div style={{ position: "absolute", left: 50, top: layout.top - 20, opacity: robotIn * robotOut, transform: `scale(${0.7 + 0.3 * robotIn})` }}>
          <Robot size={170} level={levelAt(frame)} wave={Math.max(0, 25 * Math.sin(frame / 7))} id="cap" />
        </div>
      ) : null}
      <Captions
        scene={scene}
        skip={layout.skip}
        top={layout.top}
        left={layout.robot ? 250 : 80}
        width={layout.robot ? 770 : 920}
        align={layout.robot ? "left" : "center"}
        size={62}
      />
    </>
  );
};

export const VoiceStudioDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const windows = sceneWindows();
  const i = Math.max(0, windows.findIndex((w) => frame >= w.from && frame < w.to));
  const w = windows[i];
  const progress = (frame - w.from) / w.duration;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.text }}>
      <Background sceneIndex={i} sceneProgress={progress} />
      <FitGuard>
        {windows.map((win, k) => {
          const Comp = SCENES[win.id];
          return (
            <Sequence key={win.id} from={win.from} durationInFrames={win.duration} name={win.id}>
              <SceneShell duration={win.duration} first={k === 0} last={k === windows.length - 1}>
                <Comp offset={win.from} duration={win.duration} />
              </SceneShell>
            </Sequence>
          );
        })}
        <CaptionLayer windows={windows} />
      </FitGuard>
      <Iris at={windows[1].from} />
      {TIMING.estimated ? (
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT.text,
            fontWeight: 800,
            fontSize: 30,
            color: "#D7263D",
          }}
        >
          ЧЕРНОВИК · без озвучки · тайминг оценочный
        </div>
      ) : (
        <>
          <Audio src={staticFile("voicestudio-demo/voiceover.wav")} />
          {SFX.map((s, k) => (
            <Sequence key={k} from={Math.max(0, s.at(windows))} durationInFrames={FPS * 2} layout="none">
              <Audio src={staticFile(`voicestudio-demo/sfx/${s.file}.wav`)} volume={s.volume} />
            </Sequence>
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
