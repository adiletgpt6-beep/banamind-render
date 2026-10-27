import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg45Audio } from "./Bg45Audio";
import { SceneContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { DecideScene } from "./scenes/Decide";
import { GroupScene } from "./scenes/Group";
import { HookScene } from "./scenes/Hook";
import { SplitScene } from "./scenes/Split";
import { TrialScene } from "./scenes/Trial";
import type { Bg45SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg45Timeline, type Bg45Manifest } from "./timing";

export type BalaGoBG045Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-045/voice/manifest.json.
  readonly manifest: Bg45Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg45SceneId, React.FC> = {
  hook: HookScene,
  split: SplitScene,
  decide: DecideScene,
  group: GroupScene,
  trial: TrialScene,
  cta: CtaScene,
};

// BG-045 «Бир дүйшөмбүнүн эки көрүнүшү»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG045: React.FC<BalaGoBG045Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg45Timeline(manifest), [manifest]);
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
        <Bg45Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
