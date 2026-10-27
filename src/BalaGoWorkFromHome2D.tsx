import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "./work-from-home-2d/context";
import { WfhAudio } from "./work-from-home-2d/WfhAudio";
import { Subtitles } from "./work-from-home-2d/Subtitles";
import { WFH_SCENES, WFH_VIDEO } from "./work-from-home-2d/script";
import { buildWfhCues, type WfhManifest } from "./work-from-home-2d/timing";
import { SCENES } from "./work-from-home-2d/scenes";

export type BalaGoWorkFromHome2DProps = {
  // Заполняется в calculateMetadata из public/audio/work-from-home-2d/manifest.json.
  readonly manifest: WfhManifest;
  // Только для черновых кадров без озвучки (финальный рендер — false).
  readonly allowEstimate?: boolean;
};

// Сценарий №28 в 2D: «Почему мама задерживалась дома?». Сцены стоят на
// шкале script.ts (по измеренной озвучке), реплики — в моменты at.
export const BalaGoWorkFromHome2D: React.FC<BalaGoWorkFromHome2DProps> = ({ manifest }) => {
  const cues = useMemo(() => buildWfhCues(manifest), [manifest]);
  const fps = WFH_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: "#F7F4EE" }}>
        {WFH_SCENES.map((sc) => {
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
        <WfhAudio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
