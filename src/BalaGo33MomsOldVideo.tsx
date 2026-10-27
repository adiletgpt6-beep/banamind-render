import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "./moms-old-video/context";
import { MOV_SCENES, MOV_VIDEO, type MovSceneId } from "./moms-old-video/script";
import { buildMovCues, type MovManifest } from "./moms-old-video/timing";
import { Subtitles } from "./moms-old-video/Subtitles";
import { MovAudio } from "./moms-old-video/MovAudio";
import { HookScene } from "./moms-old-video/scenes/Hook";
import { MovesScene } from "./moms-old-video/scenes/Moves";
import { WorkdayScene } from "./moms-old-video/scenes/Workday";
import { EveningScene } from "./moms-old-video/scenes/Evening";
import { RememberScene } from "./moms-old-video/scenes/Remember";
import { WishScene } from "./moms-old-video/scenes/Wish";
import { ScheduleScene } from "./moms-old-video/scenes/Schedule";
import { RouteScene } from "./moms-old-video/scenes/Route";
import { BalagoScene } from "./moms-old-video/scenes/Balago";
import { PickScene } from "./moms-old-video/scenes/Pick";
import { PackingScene } from "./moms-old-video/scenes/Packing";
import { StudioScene } from "./moms-old-video/scenes/Studio";
import { NewVideoScene } from "./moms-old-video/scenes/NewVideo";
import { CtaScene } from "./moms-old-video/scenes/Cta";

export type BalaGo33MomsOldVideoProps = {
  // Заполняется в calculateMetadata из public/audio/moms-old-video/manifest.json.
  readonly manifest: MovManifest;
  // Черновой просмотр (Studio, черновые кадры): без готовой озвучки —
  // оценочные тайминги. Финальный рендер — только с полной озвучкой.
  readonly preview: boolean;
};

const SCENES: Record<MovSceneId, React.FC> = {
  hook: HookScene,
  workday: WorkdayScene,
  evening: EveningScene,
  remember: RememberScene,
  moves: MovesScene,
  wish: WishScene,
  schedule: ScheduleScene,
  route: RouteScene,
  balago: BalagoScene,
  pick: PickScene,
  packing: PackingScene,
  studio: StudioScene,
  newVideo: NewVideoScene,
  cta: CtaScene,
};

// Фильм №33 «Мама на старом видео». Сцены стоят на шкале script.ts,
// реплики — в моменты lineAt (по фактической озвучке).
export const BalaGo33MomsOldVideo: React.FC<BalaGo33MomsOldVideoProps> = ({ manifest }) => {
  const cues = useMemo(() => buildMovCues(manifest), [manifest]);
  const fps = MOV_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {MOV_SCENES.map((sc) => {
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
        <MovAudio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
