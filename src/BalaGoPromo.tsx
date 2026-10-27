import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { TIMING, type SceneId } from "./config";
import { Soundtrack } from "./Soundtrack";
import { TimelineContext } from "./TimelineContext";
import { Background } from "./components/Background";
import { BrandScene } from "./scenes/BrandScene";
import { CarScene } from "./scenes/CarScene";
import { CtaScene } from "./scenes/CtaScene";
import { DriverScene } from "./scenes/DriverScene";
import { HookScene } from "./scenes/HookScene";
import { PromiseScene } from "./scenes/PromiseScene";
import { RouteScene } from "./scenes/RouteScene";
import { buildTimeline, type NarrationManifest } from "./timeline";

export type BalaGoPromoProps = {
  // Заполняется в calculateMetadata из public/audio/voice/manifest.json.
  readonly manifest: NarrationManifest;
};

const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: HookScene,
  brand: BrandScene,
  route: RouteScene,
  driver: DriverScene,
  car: CarScene,
  promise: PromiseScene,
  cta: CtaScene,
};

const SCENE_NAMES: Record<SceneId, string> = {
  hook: "Крючок: утро родителя",
  brand: "БалаГо — балдар үчүн такси",
  route: "Маршрут ҮЙ → МЕКТЕП → ҮЙ",
  driver: "Водитель: опыт",
  car: "Машина и салон",
  promise: "Тынчтык жана камкордук",
  cta: "Призыв: Баланы каттоо",
};

export const BalaGoPromo: React.FC<BalaGoPromoProps> = ({ manifest }) => {
  const { fps } = useVideoConfig();
  const timeline = useMemo(() => buildTimeline(manifest, fps), [manifest, fps]);

  // Сцены и переходы строятся по таймингам речи (src/timeline.ts),
  // поэтому повторяются программно, одним шаблоном.
  const items: React.ReactNode[] = [];
  timeline.scenes.forEach((scene, i) => {
    const Scene = SCENE_COMPONENTS[scene.id];
    if (i > 0) {
      items.push(
        <TransitionSeries.Transition
          key={`t-${scene.id}`}
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TIMING.transitionFrames })}
        />,
      );
    }
    items.push(
      <TransitionSeries.Sequence
        key={scene.id}
        name={SCENE_NAMES[scene.id]}
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
        <Soundtrack timeline={timeline} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
