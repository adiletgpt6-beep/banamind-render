import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "../../two-schedules-2d/context";
import { Bg38Audio } from "./Bg38Audio";
import { TimelineContext } from "./context";
import { BG38_VIDEO, type Bg38SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg38Timeline, type Bg38Manifest } from "./timing";
import { HookScene } from "./scenes/Hook";
import { RulesScene } from "./scenes/Rules";
import { Scale1Scene, Scale2Scene } from "./scenes/Scale";
import { FoldersScene } from "./scenes/Folders";
import { DoorScene } from "./scenes/Door";
import { CtaScene } from "./scenes/Cta";

export type BalaGoBG038Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-038/manifest.json.
  readonly manifest: Bg38Manifest;
  // Черновые кадры без озвучки (оценочные тайминги). Финальный рендер — false.
  readonly allowEstimate: boolean;
};

const SCENES: Record<Bg38SceneId, React.FC> = {
  hook: HookScene,
  rules: RulesScene,
  scale1: Scale1Scene,
  scale2: Scale2Scene,
  folders: FoldersScene,
  door: DoorScene,
  cta: CtaScene,
};

// Выпуск №38 / BG-038 «Бала ооруп калсачы?». Длительности сцен — по
// фактической озвучке (timing.ts). Губы мамы — общий риг 2D-ролика №12,
// ему передаются реплики этого ролика (CuesContext) и начало сцены
// (SceneContext).
export const BalaGoBG038: React.FC<BalaGoBG038Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg38Timeline(manifest), [manifest]);
  const fps = BG38_VIDEO.fps;
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
          <Bg38Audio tl={tl} />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
