import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { TIMING, type SceneId, type SfxCue, type Timing } from "./config";
import { Soundtrack, type MusicSpec } from "./Soundtrack";
import { TimelineContext } from "./TimelineContext";
import { Background } from "./components/Background";
import {
  buildTimeline,
  type NarrationManifest,
  type ScenePlan,
} from "./timeline";

export type SceneDef = {
  readonly component: React.FC;
  readonly name: string;
};

// Общий каркас роликов «монтаж под речь»: фон, сцены с плавными
// переходами (начала сцен — по таймингам озвучки), музыка, эффекты, голос.
export const SpeechVideo: React.FC<{
  readonly manifest: NarrationManifest;
  readonly plan: ScenePlan;
  readonly scenes: Partial<Record<SceneId, SceneDef>>;
  readonly voiceDir: string;
  readonly sfxCues: SfxCue[];
  readonly timing?: Timing;
  readonly music?: MusicSpec;
}> = ({
  manifest,
  plan,
  scenes,
  voiceDir,
  sfxCues,
  timing = TIMING,
  music,
}) => {
  const { fps } = useVideoConfig();
  const timeline = useMemo(
    () => buildTimeline(manifest, fps, plan, timing),
    [manifest, fps, plan, timing],
  );

  // Сцены и переходы строятся по таймингам речи (src/timeline.ts),
  // поэтому повторяются программно, одним шаблоном.
  const items: React.ReactNode[] = [];
  timeline.scenes.forEach((scene, i) => {
    const def = scenes[scene.id];
    if (!def) {
      throw new Error(`Для сцены «${scene.id}» нет компонента.`);
    }
    const Scene = def.component;
    if (i > 0) {
      items.push(
        <TransitionSeries.Transition
          key={`t-${scene.id}`}
          presentation={fade()}
          timing={linearTiming({
            durationInFrames: timeline.timing.transitionFrames,
          })}
        />,
      );
    }
    items.push(
      <TransitionSeries.Sequence
        key={scene.id}
        name={def.name}
        durationInFrames={scene.durationInFrames}
        premountFor={fps}
      >
        <Scene />
      </TransitionSeries.Sequence>,
    );
  });

  return (
    <TimelineContext.Provider value={timeline}>
      <AbsoluteFill>
        <Background />
        <TransitionSeries name="Сцены">{items}</TransitionSeries>
        <Soundtrack
          timeline={timeline}
          voiceDir={voiceDir}
          sfxCues={sfxCues}
          music={music}
        />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
