import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./nine-year-old-employee-2d/fonts";
import { SceneContext, TimelineContext } from "./nine-year-old-employee-2d/context";
import { Ny2Audio } from "./nine-year-old-employee-2d/Ny2Audio";
import { Subtitles } from "./nine-year-old-employee-2d/Subtitles";
import { Transitions } from "./nine-year-old-employee-2d/Transitions";
import { type Ny2SceneId } from "./nine-year-old-employee-2d/script";
import { C } from "./nine-year-old-employee-2d/theme";
import { buildNy2Timeline, type Ny2Manifest } from "./nine-year-old-employee-2d/timing";
import { LetterScene } from "./nine-year-old-employee-2d/scenes/Letter";
import { ParentsScene } from "./nine-year-old-employee-2d/scenes/Parents";
import { RouteScene } from "./nine-year-old-employee-2d/scenes/Route";
import { HelperScene } from "./nine-year-old-employee-2d/scenes/Helper";
import { QuitScene } from "./nine-year-old-employee-2d/scenes/Quit";
import { ShipScene } from "./nine-year-old-employee-2d/scenes/Ship";
import { BadgeScene } from "./nine-year-old-employee-2d/scenes/Badge";
import { EarlyScene } from "./nine-year-old-employee-2d/scenes/Early";
import { YardScene } from "./nine-year-old-employee-2d/scenes/Yard";
import { EveningScene } from "./nine-year-old-employee-2d/scenes/Evening";
import { BalagoScene } from "./nine-year-old-employee-2d/scenes/Balago";
import { DrawingScene } from "./nine-year-old-employee-2d/scenes/Drawing";
import { ContactScene } from "./nine-year-old-employee-2d/scenes/Contact";

export type BalaGoNineYearOldEmployee2DProps = {
  // Заполняется в calculateMetadata из public/audio/nine-year-old-employee-2d/manifest.json.
  readonly manifest: Ny2Manifest;
  // Только черновые кадры по оценочным таймингам (без озвучки).
  readonly preview: boolean;
};

const SCENES: Record<Ny2SceneId, React.FC> = {
  letter: LetterScene,
  parents: ParentsScene,
  route: RouteScene,
  helper: HelperScene,
  quit: QuitScene,
  ship: ShipScene,
  badge: BadgeScene,
  early: EarlyScene,
  yard: YardScene,
  evening: EveningScene,
  balago: BalagoScene,
  drawing: DrawingScene,
  contact: ContactScene,
};

// «Тогуз жаштагы кызматкердин арызы». Сцены — живые 2D-эпизоды во весь
// кадр; короткие графические связки в языке референса (тяжёлая
// типографика, цветовые поля, сохранение формы между планами); рассказчик —
// только голос. Длительность — по фактической речи, контакты — последние
// 150 кадров.
export const BalaGoNineYearOldEmployee2D: React.FC<BalaGoNineYearOldEmployee2DProps> = ({ manifest }) => {
  const tl = useMemo(() => buildNy2Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.paper }}>
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
        <Transitions />
        <Subtitles />
        <Ny2Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
