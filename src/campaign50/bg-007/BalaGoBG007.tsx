import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg7Audio } from "./Bg7Audio";
import { SceneContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { HookScene } from "./scenes/Hook";
import { LaneScene } from "./scenes/Lane";
import { PauseScene } from "./scenes/Pause";
import { ShuffleScene } from "./scenes/Shuffle";
import { StepsScene } from "./scenes/Steps";
import type { Bg7SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg7Timeline, type Bg7Manifest } from "./timing";

export type BalaGoBG007Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-007/voice/manifest.json.
  readonly manifest: Bg7Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg7SceneId, React.FC> = {
  hook: HookScene,
  shuffle: ShuffleScene,
  pause: PauseScene,
  lane: LaneScene,
  steps: StepsScene,
  cta: CtaScene,
};

// BG-007 «Календарь наизнанку»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG007: React.FC<BalaGoBG007Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg7Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id];
          return (
            <Sequence key={sc.id} name={sc.title} from={sc.from} durationInFrames={sc.frames} premountFor={30}>
              <SceneContext.Provider value={{ from: sc.from, frames: sc.frames }}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <Bg7Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
