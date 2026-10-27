import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "./two-schedules-2d/context";
import { Ts2Audio } from "./two-schedules-2d/Ts2Audio";
import { Subtitles } from "./two-schedules-2d/Subtitles";
import { TS2_SCENES, TS2_VIDEO, type Ts2SceneId } from "./two-schedules-2d/script";
import { buildTs2Cues, type Ts2Manifest } from "./two-schedules-2d/timing";
import { MorningScene } from "./two-schedules-2d/scenes/Morning";
import { Trip1Scene } from "./two-schedules-2d/scenes/Trip1";
import { LunchScene } from "./two-schedules-2d/scenes/Lunch";
import { CallScene } from "./two-schedules-2d/scenes/Call";
import { ReadyScene } from "./two-schedules-2d/scenes/Ready";
import { Trip2Scene } from "./two-schedules-2d/scenes/Trip2";
import { EveningScene } from "./two-schedules-2d/scenes/Evening";
import { PlanScene } from "./two-schedules-2d/scenes/Plan";
import { CtaScene } from "./two-schedules-2d/scenes/Cta";

export type BalaGoTwoSchedules2DProps = {
  // Заполняется в calculateMetadata из public/audio/two-schedules-2d/manifest.json.
  readonly manifest: Ts2Manifest;
};

const SCENES: Record<Ts2SceneId, React.FC> = {
  morning: MorningScene,
  trip1: Trip1Scene,
  lunch: LunchScene,
  call: CallScene,
  ready: ReadyScene,
  trip2: Trip2Scene,
  evening: EveningScene,
  plan: PlanScene,
  cta: CtaScene,
};

// Двенадцатый ролик в 2D: «У двоих детей — разное расписание» — ровно 120 с.
// Сцены стоят на фиксированной шкале (script.ts), реплики — в моменты at.
export const BalaGoTwoSchedules2D: React.FC<BalaGoTwoSchedules2DProps> = ({ manifest }) => {
  const cues = useMemo(() => buildTs2Cues(manifest), [manifest]);
  const fps = TS2_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {TS2_SCENES.map((sc) => {
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
        <Ts2Audio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
