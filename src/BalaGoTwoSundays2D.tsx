import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./two-sundays-2d/fonts";
import { SceneContext, TimelineContext } from "./two-sundays-2d/context";
import { Su2Audio } from "./two-sundays-2d/Su2Audio";
import { Subtitles } from "./two-sundays-2d/Subtitles";
import { Transitions } from "./two-sundays-2d/Transitions";
import { type Su2SceneId } from "./two-sundays-2d/script";
import { C } from "./two-sundays-2d/theme";
import { buildSu2Timeline, type Su2Manifest } from "./two-sundays-2d/timing";
import { SCENES } from "./two-sundays-2d/scenes";

export type BalaGoTwoSundays2DProps = {
  // Заполняется в calculateMetadata из public/audio/two-sundays-2d/manifest.json.
  readonly manifest: Su2Manifest;
  // Только черновые кадры (готовые реплики + оценка недостающих).
  readonly preview: boolean;
};

// «Эмне үчүн анын эки жекшембиси бар?» Живые 2D-эпизоды во весь кадр;
// планы меняются по смыслу (предметный, сверху, через плечо, с высоты
// ребёнка, общий); короткие графические связки по форме предметов;
// рассказчик — только голос. Длительность — по фактической речи, контакты —
// последние 150 кадров.
export const BalaGoTwoSundays2D: React.FC<BalaGoTwoSundays2DProps> = ({ manifest }) => {
  const tl = useMemo(() => buildSu2Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.paper }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id as Su2SceneId];
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
        <Transitions />
        <Subtitles />
        <Su2Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
