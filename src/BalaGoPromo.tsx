import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { SCENES, TRANSITION_FRAMES } from "./config";
import { Soundtrack, type VoiceClip } from "./Soundtrack";
import { Background } from "./components/Background";
import { CarScene } from "./scenes/CarScene";
import { CtaScene } from "./scenes/CtaScene";
import { DriverScene } from "./scenes/DriverScene";
import { HookScene } from "./scenes/HookScene";
import { RouteScene } from "./scenes/RouteScene";

export type BalaGoPromoProps = {
  // Заполняется в calculateMetadata из public/audio/voice/manifest.json.
  readonly voice: VoiceClip[];
};

export const BalaGoPromo: React.FC<BalaGoPromoProps> = ({ voice }) => {
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
      <Soundtrack voice={voice} />
    </AbsoluteFill>
  );
};
