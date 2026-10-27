import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { easeInOut } from "./art/motion";
import { Bg36Audio } from "./Bg36Audio";
import { SceneContext, TimelineContext } from "./context";
import { C } from "./palette";
import { ApplyScene } from "./scenes/Apply";
import { BonusScene } from "./scenes/Bonus";
import { CtaScene } from "./scenes/Cta";
import { HookScene } from "./scenes/Hook";
import { TrialScene } from "./scenes/Trial";
import { TripScene } from "./scenes/Trip";
import { BG36_XFADE, type Bg36SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg36Timeline, type Bg36Manifest } from "./timing";

export type BalaGoBG036Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-036/voice/manifest.json.
  readonly manifest: Bg36Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg36SceneId, React.FC> = {
  hook: HookScene,
  trip: TripScene,
  bonus: BonusScene,
  trial: TrialScene,
  apply: ApplyScene,
  cta: CtaScene,
};

// Проявление сцены поверх предыдущей (первые BG36_XFADE кадров).
const FadeIn: React.FC<{ readonly first: boolean; readonly children: React.ReactNode }> = ({ first, children }) => {
  const f = useCurrentFrame();
  const o = first ? 1 : easeInOut(f / BG36_XFADE);
  return <AbsoluteFill style={{ overflow: "hidden", opacity: o }}>{children}</AbsoluteFill>;
};

// BG-036 «Кыркка дагы беш»: сцены идут подряд по шкале timing.ts;
// предыдущая сцена держит последний кадр, пока следующая проявляется.
export const BalaGoBG036: React.FC<BalaGoBG036Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg36Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.desk }}>
        {tl.scenes.map((sc, i) => {
          const Scene = SCENES[sc.id];
          const last = i === tl.scenes.length - 1;
          return (
            <Sequence
              key={sc.id}
              name={sc.title}
              from={sc.from}
              durationInFrames={sc.frames + (last ? 0 : BG36_XFADE)}
              premountFor={30}
            >
              <SceneContext.Provider value={{ from: sc.from, frames: sc.frames }}>
                <FadeIn first={i === 0}>
                  <Scene />
                </FadeIn>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <Bg36Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
