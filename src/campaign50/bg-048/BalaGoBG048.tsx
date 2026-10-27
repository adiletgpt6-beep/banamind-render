// BalaGo-50 №48 / BG-048 «Үй-бүлөлүк диспетчердик» — комедия о семейном
// «диспетчерском центре» на кухне. Сцены идут по шкале, построенной по
// фактической озвучке.
import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { B48Audio } from "./B48Audio";
import { SceneContext, TimelineContext } from "./context";
import "./fonts";
import { B48_VIDEO, type B48SceneId } from "./script";
import { ButtonsScene } from "./scenes/Buttons";
import { CtaScene } from "./scenes/Cta";
import { ExampleScene } from "./scenes/Example";
import { HookScene } from "./scenes/Hook";
import { RevealScene } from "./scenes/Reveal";
import { SiteScene } from "./scenes/Site";
import { Subtitles } from "./Subtitles";
import { buildB48Timeline, type B48Manifest } from "./timing";

export type BalaGoBG048Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-048/voice/manifest.json.
  readonly manifest: B48Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<B48SceneId, React.FC> = {
  hook: HookScene,
  buttons: ButtonsScene,
  reveal: RevealScene,
  site: SiteScene,
  example: ExampleScene,
  cta: CtaScene,
};

export const BalaGoBG048: React.FC<BalaGoBG048Props> = ({ manifest }) => {
  const tl = useMemo(() => buildB48Timeline(manifest), [manifest]);
  const fps = B48_VIDEO.fps;
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FBEFD9" }}>
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
        <B48Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
