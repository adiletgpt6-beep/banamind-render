// BalaGo-50 • выпуск №16 • BG-015 «Прогулка после работы».
// Сцены идут подряд; длина каждой — по фактической озвучке (timeline.ts).
// Персонажи и часть декораций переиспользуются из 2D-ролика №12
// (src/two-schedules-2d) только через импорты, без изменений.
import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "../../two-schedules-2d/context";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { Bg15Audio } from "./Audio";
import { TimelineContext } from "./context";
import { BG15_VIDEO, type Bg15SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildTimeline, type Manifest } from "./timeline";
import { HookScene } from "./scenes/Hook";
import { DayScene } from "./scenes/Day";
import { ThinkScene } from "./scenes/Think";
import { SearchScene } from "./scenes/Search";
import { StepsScene } from "./scenes/Steps";
import { CtaScene } from "./scenes/Cta";

export type BalaGoBG015Props = {
  readonly manifest: Manifest;
};

const SCENES: Record<Bg15SceneId, React.FC> = {
  hook: HookScene,
  day: DayScene,
  think: ThinkScene,
  search: SearchScene,
  steps: StepsScene,
  cta: CtaScene,
};

export const BalaGoBG015: React.FC<BalaGoBG015Props> = ({ manifest }) => {
  const tl = useMemo(() => buildTimeline(manifest), [manifest]);
  const fps = BG15_VIDEO.fps;
  return (
    <TimelineContext.Provider value={tl}>
      {/* губы персонажей (rig из ролика №12) читают реплики отсюда */}
      <CuesContext.Provider value={tl.cues as unknown as Ts2Cue[]}>
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
          {tl.scenes.map((sc) => {
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
          <Bg15Audio />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
