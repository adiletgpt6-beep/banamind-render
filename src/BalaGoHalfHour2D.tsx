import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "./half-hour-2d/context";
import { Hh2Audio } from "./half-hour-2d/Hh2Audio";
import { HH2_SCENES, HH2_VIDEO, type Hh2SceneId } from "./half-hour-2d/script";
import { buildHh2Cues, type Hh2Manifest } from "./half-hour-2d/timing";
import { BackScene, DelayScene, OfficeScene } from "./half-hour-2d/scenes/Office";
import { SchoolScene } from "./half-hour-2d/scenes/School";
import { RoadScene } from "./half-hour-2d/scenes/Road";
import { MeetScene } from "./half-hour-2d/scenes/Meet";
import { EveningScene, FormScene } from "./half-hour-2d/scenes/Home";
import { CtaScene } from "./half-hour-2d/scenes/Cta";

export type BalaGoHalfHour2DProps = {
  // Заполняется в calculateMetadata из public/audio/half-hour-2d/manifest.json.
  readonly manifest: Hh2Manifest;
};

const SCENES: Record<Hh2SceneId, React.FC> = {
  office: OfficeScene,
  delay: DelayScene,
  school: SchoolScene,
  road: RoadScene,
  meet: MeetScene,
  back: BackScene,
  evening: EveningScene,
  form: FormScene,
  cta: CtaScene,
};

// Десятый ролик в 2D: «Жумуштан жарым саатка» — ровно 120 с.
// Сцены стоят на фиксированной шкале (script.ts), реплики — в моменты at.
export const BalaGoHalfHour2D: React.FC<BalaGoHalfHour2DProps> = ({ manifest }) => {
  const cues = useMemo(() => buildHh2Cues(manifest), [manifest]);
  const fps = HH2_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {HH2_SCENES.map((sc) => {
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
        <Hh2Audio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
