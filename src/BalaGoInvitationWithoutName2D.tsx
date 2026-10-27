import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./invitation-without-name-2d/fonts";
import { SceneContext, TimelineContext } from "./invitation-without-name-2d/context";
import { Iw2Audio } from "./invitation-without-name-2d/Iw2Audio";
import { Subtitles } from "./invitation-without-name-2d/Subtitles";
import { Transitions } from "./invitation-without-name-2d/Transitions";
import { type Iw2SceneId } from "./invitation-without-name-2d/script";
import { C } from "./invitation-without-name-2d/theme";
import { buildIw2Timeline, type Iw2Manifest } from "./invitation-without-name-2d/timing";
import { HookScene } from "./invitation-without-name-2d/scenes/Hook";
import { BlankScene } from "./invitation-without-name-2d/scenes/Blank";
import { CareersScene } from "./invitation-without-name-2d/scenes/Careers";
import { ProudScene } from "./invitation-without-name-2d/scenes/Proud";
import { RouteScene } from "./invitation-without-name-2d/scenes/Route";
import { BackpackScene } from "./invitation-without-name-2d/scenes/Backpack";
import { AskScene } from "./invitation-without-name-2d/scenes/Ask";
import { WhyScene } from "./invitation-without-name-2d/scenes/Why";
import { NameScene } from "./invitation-without-name-2d/scenes/Name";
import { IdeaScene } from "./invitation-without-name-2d/scenes/Idea";
import { TestScene } from "./invitation-without-name-2d/scenes/Test";
import { ListScene } from "./invitation-without-name-2d/scenes/List";
import { ClassScene } from "./invitation-without-name-2d/scenes/Class";
import { DemoScene } from "./invitation-without-name-2d/scenes/Demo";
import { PhotoScene } from "./invitation-without-name-2d/scenes/Photo";
import { ParentsScene } from "./invitation-without-name-2d/scenes/Parents";
import { BalagoScene } from "./invitation-without-name-2d/scenes/Balago";
import { BedtimeScene } from "./invitation-without-name-2d/scenes/Bedtime";
import { ContactScene } from "./invitation-without-name-2d/scenes/Contact";

export type BalaGoInvitationWithoutName2DProps = {
  // Заполняется в calculateMetadata из public/audio/invitation-without-name-2d/manifest.json.
  readonly manifest: Iw2Manifest;
  // Только черновые кадры по оценочным таймингам (без озвучки).
  readonly preview: boolean;
};

const SCENES: Record<Iw2SceneId, React.FC> = {
  hook: HookScene,
  blank: BlankScene,
  careers: CareersScene,
  proud: ProudScene,
  route: RouteScene,
  backpack: BackpackScene,
  ask: AskScene,
  why: WhyScene,
  name: NameScene,
  idea: IdeaScene,
  test: TestScene,
  list: ListScene,
  class: ClassScene,
  demo: DemoScene,
  photo: PhotoScene,
  parents: ParentsScene,
  balago: BalagoScene,
  bedtime: BedtimeScene,
  contact: ContactScene,
};

// «Аты жок чакыруу». Сцены — живые 2D-эпизоды во весь кадр; короткие
// графические связки в языке референса (светлая бумага, тяжёлая
// типографика, карточки с тонким контуром, монтажные совпадения формы);
// рассказчик — только голос. Длительность — по фактической речи,
// контакты — последние 150 кадров.
export const BalaGoInvitationWithoutName2D: React.FC<BalaGoInvitationWithoutName2DProps> = ({ manifest }) => {
  const tl = useMemo(() => buildIw2Timeline(manifest), [manifest]);
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
        <Iw2Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
