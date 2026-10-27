import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg50Audio } from "./Bg50Audio";
import { SceneContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { EveningScene } from "./scenes/Evening";
import { HomeScene } from "./scenes/Home";
import { HookScene } from "./scenes/Hook";
import { MosaicScene } from "./scenes/Mosaic";
import { SearchScene } from "./scenes/Search";
import { StudioScene } from "./scenes/Studio";
import { WorkScene } from "./scenes/Work";
import type { Bg50SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg50Timeline, type Bg50Manifest } from "./timing";

export type BalaGoBG050Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-050/voice/manifest.json.
  readonly manifest: Bg50Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg50SceneId, React.FC> = {
  hook: HookScene,
  work: WorkScene,
  evening: EveningScene,
  studio: StudioScene,
  mosaic: MosaicScene,
  home: HomeScene,
  search: SearchScene,
  cta: CtaScene,
};

// BG-050 «Бир гана суроо»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG050: React.FC<BalaGoBG050Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg50Timeline(manifest), [manifest]);
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
        <Bg50Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
