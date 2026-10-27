import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./fonts";
import { SceneContext, TimelineContext } from "./extra-line-34/context";
import { El34Audio } from "./extra-line-34/El34Audio";
import { Subtitles } from "./extra-line-34/Subtitles";
import { C } from "./extra-line-34/theme";
import { buildElTimeline, type ElManifest } from "./extra-line-34/timing";
import { SCENES } from "./extra-line-34/scenes";

export type BalaGo34ExtraLineProps = {
  // Заполняется в calculateMetadata из public/audio/extra-line-34/manifest.json.
  readonly manifest: ElManifest;
  // Только черновые кадры (готовые реплики + оценка недостающих).
  readonly preview: boolean;
};

// №34 «Жарыядагы ашыкча сап» (Лишняя строка в объявлении). Живые 2D-сцены
// семьи чередуются с графическими эпизодами объявления, карточек и сайта.
// Длительность — по фактической речи (timing.ts).
export const BalaGo34ExtraLine: React.FC<BalaGo34ExtraLineProps> = ({ manifest }) => {
  const tl = useMemo(() => buildElTimeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id];
          return (
            <Sequence key={sc.id} name={sc.title} from={sc.from} durationInFrames={sc.to - sc.from} premountFor={30}>
              <SceneContext.Provider value={{ from: sc.from, to: sc.to }}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <El34Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
