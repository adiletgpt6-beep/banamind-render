import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg14Audio } from "./Bg14Audio";
import { SceneContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { DecideScene } from "./scenes/Decide";
import { HookScene } from "./scenes/Hook";
import { LacesScene } from "./scenes/Laces";
import { MatchScene } from "./scenes/Match";
import { PlanScene } from "./scenes/Plan";
import type { Bg14SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg14Timeline, type Bg14Manifest } from "./timing";

export type BalaGoBG014Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-014/voice/manifest.json.
  readonly manifest: Bg14Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg14SceneId, React.FC> = {
  hook: HookScene,
  plan: PlanScene,
  match: MatchScene,
  decide: DecideScene,
  laces: LacesScene,
  cta: CtaScene,
};

// BG-014 «Красные кроссовки»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG014: React.FC<BalaGoBG014Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg14Timeline(manifest), [manifest]);
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
        <Bg14Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
