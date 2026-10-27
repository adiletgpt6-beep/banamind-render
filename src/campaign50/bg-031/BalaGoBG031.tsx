import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg31Audio } from "./Bg31Audio";
import { SceneContext, TimelineContext } from "./context";
import { BeyondScene } from "./scenes/Beyond";
import { CtaScene } from "./scenes/Cta";
import { HookScene } from "./scenes/Hook";
import { MemoScene } from "./scenes/Memo";
import { TripScene } from "./scenes/Trip";
import { UnfoldScene } from "./scenes/Unfold";
import type { Bg31SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg31Timeline, type Bg31Manifest } from "./timing";

export type BalaGoBG031Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-031/voice/manifest.json.
  readonly manifest: Bg31Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg31SceneId, React.FC> = {
  hook: HookScene,
  unfold: UnfoldScene,
  trip: TripScene,
  beyond: BeyondScene,
  memo: MemoScene,
  cta: CtaScene,
};

// BG-031 «1000 сом — эмнеге?»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG031: React.FC<BalaGoBG031Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg31Timeline(manifest), [manifest]);
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
        <Bg31Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
