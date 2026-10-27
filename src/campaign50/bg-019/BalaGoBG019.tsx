import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "../../two-schedules-2d/context";
import { Bg19Audio } from "./Bg19Audio";
import { TimelineContext } from "./context";
import { BG19_VIDEO, type Bg19SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg19Timeline, type Bg19Manifest } from "./timing";
import { BellScene, WorldsScene } from "./scenes/Worlds";
import { CallScene } from "./scenes/Call";
import { PlanScene } from "./scenes/Plan";
import { RouteScene } from "./scenes/Route";
import { CtaScene } from "./scenes/Cta";

export type BalaGoBG019Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-019/manifest.json.
  readonly manifest: Bg19Manifest;
  // Черновые кадры без озвучки (оценочные тайминги). Финальный рендер — false.
  readonly allowEstimate: boolean;
};

const SCENES: Record<Bg19SceneId, React.FC> = {
  bell: BellScene,
  worlds: WorldsScene,
  call: CallScene,
  plan: PlanScene,
  route: RouteScene,
  cta: CtaScene,
};

// Выпуск №20 / BG-019 «Школьный звонок». Длительности сцен — по фактической
// озвучке (timing.ts). Губы персонажей — общий риг 2D-ролика №12, ему
// передаются реплики этого ролика (CuesContext) и начало сцены (SceneContext).
export const BalaGoBG019: React.FC<BalaGoBG019Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg19Timeline(manifest), [manifest]);
  const fps = BG19_VIDEO.fps;
  return (
    <TimelineContext.Provider value={tl}>
      <CuesContext.Provider value={tl.cues as never}>
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
          <Bg19Audio tl={tl} />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
