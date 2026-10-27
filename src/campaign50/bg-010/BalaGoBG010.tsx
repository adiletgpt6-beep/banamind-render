import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg10Audio } from "./Bg10Audio";
import { SceneContext, TimelineContext } from "./context";
import { BackScene } from "./scenes/Back";
import { CallScene } from "./scenes/Call";
import { CtaScene } from "./scenes/Cta";
import { DecideScene } from "./scenes/Decide";
import { HookScene } from "./scenes/Hook";
import { RouteScene } from "./scenes/Route";
import type { Bg10SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg10Timeline, type Bg10Manifest } from "./timing";

export type BalaGoBG010Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-010/voice/manifest.json.
  readonly manifest: Bg10Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg10SceneId, React.FC> = {
  hook: HookScene,
  call: CallScene,
  back: BackScene,
  decide: DecideScene,
  route: RouteScene,
  cta: CtaScene,
};

// BG-010 «Сколько стоит переключение?»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG010: React.FC<BalaGoBG010Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg10Timeline(manifest), [manifest]);
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
        <Bg10Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
