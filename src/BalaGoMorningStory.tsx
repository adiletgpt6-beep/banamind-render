import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { fontFamily } from "./fonts";
import { STORY_SFX } from "./morning-story/sfx";
import { MS_SCENES, type StorySceneId } from "./morning-story/script";
import { StoryAudio } from "./morning-story/StoryAudio";
import { StoryContext } from "./morning-story/StoryContext";
import {
  buildStoryTimeline,
  type StoryManifest,
} from "./morning-story/storyTimeline";
import { MorningScene, PlanScene } from "./morning-story/scenes/Home";
import {
  FirstTaxiScene,
  OrderScene,
  SecondTaxiScene,
} from "./morning-story/scenes/Order";
import { RideScene, TrafficScene } from "./morning-story/scenes/Road";
import { SchoolScene } from "./morning-story/scenes/School";
import { IdeaScene, OfficeScene } from "./morning-story/scenes/Office";
import { CallScene, CtaScene, FinalScene } from "./morning-story/scenes/Final";

export type BalaGoMorningStoryProps = {
  // Заполняется в calculateMetadata из public/audio/morning-story/manifest.json.
  readonly manifest: StoryManifest;
};

const Placeholder: React.FC<{ readonly title: string }> = ({ title }) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#F6F8FB",
      alignItems: "center",
      justifyContent: "center",
      fontFamily,
      fontSize: 64,
      fontWeight: 900,
      color: "#14285A",
      textAlign: "center",
      padding: 120,
    }}
  >
    {title}
  </AbsoluteFill>
);

const SCENES: Partial<Record<StorySceneId, React.FC>> = {
  s01Morning: MorningScene,
  s02Plan: PlanScene,
  s03Order: OrderScene,
  s04First: FirstTaxiScene,
  s05Second: SecondTaxiScene,
  s06Traffic: TrafficScene,
  s07Ride: RideScene,
  s08School: SchoolScene,
  s09Office: OfficeScene,
  s10Idea: IdeaScene,
  s11Call: CallScene,
  s12Final: FinalScene,
  s13Cta: CtaScene,
};

// Переходы «через действие»: камера проезжает дальше (сдвиг кадра) —
// обе сцены непрозрачные, без наплывов и полупрозрачных двойников.
// Остальные стыки — монтажные склейки на совпадающем кадре.
const SLIDES: Partial<Record<StorySceneId, "from-right" | "from-bottom">> = {
  s05Second: "from-right",
  s06Traffic: "from-right",
  s07Ride: "from-right",
  s08School: "from-right",
};
export const SLIDE_FRAMES = 14;

// Седьмой ролик: «Бир таң» — анимационная история одного утра, ≈3 мин.
export const BalaGoMorningStory: React.FC<BalaGoMorningStoryProps> = ({
  manifest,
}) => {
  const { fps } = useVideoConfig();
  const timeline = useMemo(
    () => buildStoryTimeline(manifest, fps),
    [manifest, fps],
  );
  const items: React.ReactNode[] = [];
  timeline.scenes.forEach((scene, i) => {
    const next = timeline.scenes[i + 1];
    const extend = next && SLIDES[next.id] ? SLIDE_FRAMES : 0;
    const Scene = SCENES[scene.id];
    const title = MS_SCENES.find((s) => s.id === scene.id)?.title ?? scene.id;
    if (SLIDES[scene.id]) {
      items.push(
        <TransitionSeries.Transition
          key={`t-${scene.id}`}
          presentation={slide({ direction: SLIDES[scene.id] })}
          timing={linearTiming({ durationInFrames: SLIDE_FRAMES })}
        />,
      );
    }
    items.push(
      <TransitionSeries.Sequence
        key={scene.id}
        name={title}
        durationInFrames={scene.durationInFrames + extend}
        premountFor={fps}
      >
        {Scene ? <Scene /> : <Placeholder title={title} />}
      </TransitionSeries.Sequence>,
    );
  });

  return (
    <StoryContext.Provider value={timeline}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        <TransitionSeries name="История">{items}</TransitionSeries>
        <StoryAudio timeline={timeline} sfx={STORY_SFX(timeline)} />
      </AbsoluteFill>
    </StoryContext.Provider>
  );
};
