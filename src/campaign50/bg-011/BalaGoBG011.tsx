import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg11Audio } from "./Bg11Audio";
import { SceneContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { FoundScene } from "./scenes/Found";
import { HookScene } from "./scenes/Hook";
import { PlanScene } from "./scenes/Plan";
import { RouteScene } from "./scenes/Route";
import { SplitScene } from "./scenes/Split";
import type { Bg11SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg11Timeline, type Bg11Manifest } from "./timing";

export type BalaGoBG011Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-011/voice/manifest.json.
  readonly manifest: Bg11Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg11SceneId, React.FC> = {
  hook: HookScene,
  split: SplitScene,
  found: FoundScene,
  plan: PlanScene,
  route: RouteScene,
  cta: CtaScene,
};

// BG-011 «Ключи на холодильнике»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG011: React.FC<BalaGoBG011Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg11Timeline(manifest), [manifest]);
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
        <Bg11Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
