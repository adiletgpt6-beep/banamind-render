import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg1Audio } from "./Bg1Audio";
import { CuesContext, SceneContext } from "./context";
import { BG1_SCENES, BG1_VIDEO, type Bg1SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg1Cues, type Bg1Manifest } from "./timing";
import { HookScene } from "./scenes/Hook";
import { TabsScene } from "./scenes/Tabs";
import { ParallelScene } from "./scenes/Parallel";
import { BridgeScene } from "./scenes/Bridge";
import { RouteScene } from "./scenes/Route";
import { StepsScene } from "./scenes/Steps";
import { CtaScene } from "./scenes/Cta";

export type BalaGoBG001Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-001/manifest.json.
  readonly manifest: Bg1Manifest;
};

const SCENES: Record<Bg1SceneId, React.FC> = {
  hook: HookScene,
  tabs: TabsScene,
  parallel: ParallelScene,
  bridge: BridgeScene,
  route: RouteScene,
  steps: StepsScene,
  cta: CtaScene,
};

// BG-001 «Восемь открытых вкладок» — 72 с, 1080×1920, 30 fps.
// Сцены стоят на фиксированной шкале (script.ts), реплики — в моменты at.
export const BalaGoBG001: React.FC<BalaGoBG001Props> = ({ manifest }) => {
  const cues = useMemo(() => buildBg1Cues(manifest), [manifest]);
  const fps = BG1_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {BG1_SCENES.map((sc) => {
          const Scene = SCENES[sc.id];
          const from = Math.round(sc.from * fps);
          return (
            <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={Math.round(sc.to * fps) - from} premountFor={fps}>
              <SceneContext.Provider value={from}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <Bg1Audio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
