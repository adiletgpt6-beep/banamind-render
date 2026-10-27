import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { AUDIO, SCENES, TRANSITION_FRAMES } from "./config";
import { Background } from "./components/Background";
import { CarScene } from "./scenes/CarScene";
import { CtaScene } from "./scenes/CtaScene";
import { DriverScene } from "./scenes/DriverScene";
import { HookScene } from "./scenes/HookScene";
import { RouteScene } from "./scenes/RouteScene";

export const BalaGoPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries name="Сцены">
        <TransitionSeries.Sequence
          name="0–5 с: вопрос и логотип"
          durationInFrames={SCENES.hook}
          premountFor={fps}
        >
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name="5–10 с: маршрут"
          durationInFrames={SCENES.route}
          premountFor={fps}
        >
          <RouteScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name="10–15 с: водитель"
          durationInFrames={SCENES.driver}
          premountFor={fps}
        >
          <DriverScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name="15–20 с: машина и салон"
          durationInFrames={SCENES.car}
          premountFor={fps}
        >
          <CarScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name="20–25 с: призыв"
          durationInFrames={SCENES.cta}
          premountFor={fps}
        >
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {AUDIO.src ? (
        <Audio src={staticFile(AUDIO.src)} volume={AUDIO.volume} />
      ) : null}
    </AbsoluteFill>
  );
};
