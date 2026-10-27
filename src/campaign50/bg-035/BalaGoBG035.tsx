import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  CuesContext,
  SceneContext as RigSceneContext,
} from "../../two-schedules-2d/context";
import { Bg35Audio } from "./Bg35Audio";
import { SceneContext, TimelineContext } from "./context";
import { AskScene } from "./scenes/Ask";
import { CtaScene } from "./scenes/Cta";
import { FillScene } from "./scenes/Fill";
import { FullScene } from "./scenes/Full";
import { HookScene } from "./scenes/Hook";
import { TrialScene } from "./scenes/Trial";
import type { Bg35SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg35Timeline, type Bg35Manifest } from "./timing";

export type BalaGoBG035Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-035/voice/manifest.json.
  readonly manifest: Bg35Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg35SceneId, React.FC> = {
  hook: HookScene,
  ask: AskScene,
  fill: FillScene,
  full: FullScene,
  trial: TrialScene,
  cta: CtaScene,
};

// BG-035 «20 + 2 толук сапар»: сцены идут подряд по шкале timing.ts.
// Губы мамы — общий риг 2D-ролика №12 (только чтение): ему передаются
// реплики этого ролика (CuesContext, роль "mother") и начало сцены.
export const BalaGoBG035: React.FC<BalaGoBG035Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg35Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <CuesContext.Provider value={tl.cues as never}>
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
          {tl.scenes.map((sc) => {
            const Scene = SCENES[sc.id];
            return (
              <Sequence
                key={sc.id}
                name={sc.title}
                from={sc.from}
                durationInFrames={sc.frames}
                premountFor={30}
              >
                <SceneContext.Provider
                  value={{ from: sc.from, frames: sc.frames }}
                >
                  <RigSceneContext.Provider value={sc.from}>
                    <AbsoluteFill style={{ overflow: "hidden" }}>
                      <Scene />
                    </AbsoluteFill>
                  </RigSceneContext.Provider>
                </SceneContext.Provider>
              </Sequence>
            );
          })}
          <Subtitles />
          <Bg35Audio tl={tl} />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
