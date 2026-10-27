import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "./eleven-minutes-2d/context";
import { Em2Audio } from "./eleven-minutes-2d/Em2Audio";
import { Narrator } from "./eleven-minutes-2d/Narrator";
import { Subtitles } from "./eleven-minutes-2d/Subtitles";
import { EM2_SCENES, EM2_VIDEO, type Em2SceneId } from "./eleven-minutes-2d/script";
import { C } from "./eleven-minutes-2d/theme";
import { buildEm2Cues, type Em2Manifest } from "./eleven-minutes-2d/timing";
import { QuestionScene, UsualScene } from "./eleven-minutes-2d/scenes/Opening";
import { PlanScene } from "./eleven-minutes-2d/scenes/Plan";
import { LeaveScene, ParkingScene } from "./eleven-minutes-2d/scenes/Drive";
import { FormScene, WaitingScene } from "./eleven-minutes-2d/scenes/School";
import { CarScene, RoadScene } from "./eleven-minutes-2d/scenes/Car";
import { GrandmaScene, Same11Scene } from "./eleven-minutes-2d/scenes/Return";
import { ConfessScene, CraftScene } from "./eleven-minutes-2d/scenes/Evening";
import { FinalScene } from "./eleven-minutes-2d/scenes/Final";

export type BalaGoElevenMinutes2DProps = {
  // Заполняется в calculateMetadata из public/audio/eleven-minutes-2d/manifest.json.
  readonly manifest: Em2Manifest;
};

const SCENES: Record<Em2SceneId, React.FC> = {
  question: QuestionScene,
  usual: UsualScene,
  plan: PlanScene,
  leave: LeaveScene,
  parking: ParkingScene,
  waiting: WaitingScene,
  form: FormScene,
  car: CarScene,
  road: RoadScene,
  grandma: GrandmaScene,
  same11: Same11Scene,
  confess: ConfessScene,
  craft: CraftScene,
  final: FinalScene,
};

// «Он бир мүнөт» — ровно 120 с. Сцены на фиксированной шкале (script.ts),
// реплики — по фактической озвучке; поверх — субтитры и рассказчик.
export const BalaGoElevenMinutes2D: React.FC<BalaGoElevenMinutes2DProps> = ({ manifest }) => {
  const cues = useMemo(() => buildEm2Cues(manifest), [manifest]);
  const fps = EM2_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {EM2_SCENES.map((sc) => {
          const Scene = SCENES[sc.id];
          const from = Math.round(sc.from * fps);
          return (
            <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={Math.round(sc.to * fps) - from} premountFor={fps}>
              <SceneContext.Provider value={from}>
                <AbsoluteFill>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <Narrator mood={(t) => (t > 100 ? 1 : t > 90 ? 0.6 : 0.3)} />
        <Em2Audio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
