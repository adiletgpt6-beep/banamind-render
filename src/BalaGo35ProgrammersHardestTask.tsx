import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { PlanContext, SceneContext } from "./programmers-hardest-task/context";
import { PhtAudio } from "./programmers-hardest-task/PhtAudio";
import { SCENES, SOUNDS } from "./programmers-hardest-task/scenes";
import { PHT_VIDEO } from "./programmers-hardest-task/script";
import { Subtitles } from "./programmers-hardest-task/Subtitles";
import { planPht, type PhtManifest } from "./programmers-hardest-task/timing";

export type BalaGo35ProgrammersHardestTaskProps = {
  // Заполняется в calculateMetadata из public/audio/programmers-hardest-task/manifest.json.
  readonly manifest: PhtManifest;
};

// Фильм №35 «Программисттин эң татаал тапшырмасы». Длина сцен и фильма —
// по фактической озвучке (timing.ts → planPht).
export const BalaGo35ProgrammersHardestTask: React.FC<BalaGo35ProgrammersHardestTaskProps> = ({ manifest }) => {
  const plan = useMemo(() => planPht(manifest), [manifest]);
  return (
    <PlanContext.Provider value={plan}>
      <AbsoluteFill style={{ backgroundColor: "#F7F6F1" }}>
        {plan.scenes.map((sc) => {
          const Scene = SCENES[sc.id].component;
          return (
            <Sequence key={sc.id} name={sc.title} from={sc.from} durationInFrames={sc.to - sc.from} premountFor={PHT_VIDEO.fps}>
              <SceneContext.Provider value={{ from: sc.from, to: sc.to }}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <PhtAudio plan={plan} sounds={SOUNDS} />
      </AbsoluteFill>
    </PlanContext.Provider>
  );
};
