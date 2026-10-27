// BalaGo-50 №13 / BG-012 «О чём поговорим сегодня?» — уютный мини-фильм
// в гостиной. Сцены идут по шкале, построенной по фактической озвучке.
import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { B12Audio } from "./B12Audio";
import { SceneContext, TimelineContext } from "./context";
import "./fonts";
import { B12_VIDEO, type B12SceneId } from "./script";
import { DrawingScene } from "./scenes/Drawing";
import { HookScene } from "./scenes/Hook";
import { PlansScene } from "./scenes/Plans";
import { RouteScene } from "./scenes/Route";
import { StoryScene } from "./scenes/Story";
import { TurnScene } from "./scenes/Turn";
import { Subtitles } from "./Subtitles";
import { buildB12Timeline, type B12Manifest } from "./timing";

export type BalaGoBG012Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-012/manifest.json.
  readonly manifest: B12Manifest;
};

const SCENES: Record<B12SceneId, React.FC> = {
  hook: HookScene,
  plans: PlansScene,
  drawing: DrawingScene,
  turn: TurnScene,
  route: RouteScene,
  story: StoryScene,
};

export const BalaGoBG012: React.FC<BalaGoBG012Props> = ({ manifest }) => {
  const tl = useMemo(() => buildB12Timeline(manifest), [manifest]);
  const fps = B12_VIDEO.fps;
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#F3E3CC" }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id];
          const from = Math.round(sc.from * fps);
          return (
            <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={Math.round(sc.to * fps) - from} premountFor={fps}>
              <SceneContext.Provider value={sc.id}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <B12Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
