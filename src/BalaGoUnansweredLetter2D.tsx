import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CardBack, TopicBar } from "./unanswered-letter-2d/Chrome";
import { CuesContext, SceneContext } from "./unanswered-letter-2d/context";
import { Subtitles } from "./unanswered-letter-2d/Subtitles";
import { Ul2Audio } from "./unanswered-letter-2d/Ul2Audio";
import { UL2_SCENES, UL2_VIDEO, type Ul2SceneId } from "./unanswered-letter-2d/script";
import { C } from "./unanswered-letter-2d/theme";
import { buildUl2Cues, type Ul2Manifest } from "./unanswered-letter-2d/timing";
import { IntroScene } from "./unanswered-letter-2d/scenes/Intro";
import { DraftScene, OfferScene } from "./unanswered-letter-2d/scenes/Office";
import { CarScene, DaysScene } from "./unanswered-letter-2d/scenes/Car";
import { CalendarScene, HusbandScene, OptionsScene } from "./unanswered-letter-2d/scenes/Evening";
import { DrawingScene } from "./unanswered-letter-2d/scenes/Drawing";
import { ContactScene, ReplyScene, RequestScene, ServiceScene } from "./unanswered-letter-2d/scenes/Reply";

export type BalaGoUnansweredLetter2DProps = {
  // Заполняется в calculateMetadata из public/audio/unanswered-letter-2d/manifest.json.
  readonly manifest: Ul2Manifest;
};

const SCENES: Record<Ul2SceneId, React.FC> = {
  intro: IntroScene,
  offer: OfferScene,
  draft: DraftScene,
  car: CarScene,
  days: DaysScene,
  husband: HusbandScene,
  calendar: CalendarScene,
  options: OptionsScene,
  drawing: DrawingScene,
  request: RequestScene,
  reply: ReplyScene,
  service: ServiceScene,
  contact: ContactScene,
};

// «Жооп берилбеген кат» — ровно 120 с. Сцены на фиксированной шкале
// (script.ts), речь — по фактической озвучке. Кадр для телефона: строка
// темы и дня, одна крупная карточка с действием, под ней постоянная полоса
// субтитров с портретом говорящего.
export const BalaGoUnansweredLetter2D: React.FC<BalaGoUnansweredLetter2DProps> = ({ manifest }) => {
  const cues = useMemo(() => buildUl2Cues(manifest), [manifest]);
  const fps = UL2_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <CardBack />
        {UL2_SCENES.map((sc) => {
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
        <TopicBar />
        <Subtitles />
        <Ul2Audio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
