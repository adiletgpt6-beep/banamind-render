import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./third-b-meeting-2d/fonts";
import { SceneContext, TimelineContext } from "./third-b-meeting-2d/context";
import { T3bAudio } from "./third-b-meeting-2d/T3bAudio";
import { Subtitles } from "./third-b-meeting-2d/Subtitles";
import { Transitions } from "./third-b-meeting-2d/Transitions";
import { type T3bSceneId } from "./third-b-meeting-2d/script";
import { C } from "./third-b-meeting-2d/theme";
import { buildT3bTimeline, type T3bManifest } from "./third-b-meeting-2d/timing";
import { HookScene } from "./third-b-meeting-2d/scenes/Hook";
import { StudioScene } from "./third-b-meeting-2d/scenes/Studio";
import { CalendarScene } from "./third-b-meeting-2d/scenes/Calendar";
import { DadScene } from "./third-b-meeting-2d/scenes/Dad";
import { ParkedScene } from "./third-b-meeting-2d/scenes/Parked";
import { DaughterScene } from "./third-b-meeting-2d/scenes/Daughter";
import { PresentScene } from "./third-b-meeting-2d/scenes/Present";
import { DrawingScene } from "./third-b-meeting-2d/scenes/Drawing";
import { JokeScene } from "./third-b-meeting-2d/scenes/Joke";
import { ApprovedScene } from "./third-b-meeting-2d/scenes/Approved";
import { QuestionScene } from "./third-b-meeting-2d/scenes/Question";
import { DriveScene } from "./third-b-meeting-2d/scenes/Drive";
import { SearchScene } from "./third-b-meeting-2d/scenes/Search";
import { SignScene } from "./third-b-meeting-2d/scenes/Sign";
import { ContactScene } from "./third-b-meeting-2d/scenes/Contact";

export type BalaGoThirdBMeeting2DProps = {
  // Заполняется в calculateMetadata из public/audio/third-b-meeting-2d/manifest.json.
  readonly manifest: T3bManifest;
  // Только черновые кадры по оценочным таймингам (без озвучки).
  readonly preview: boolean;
};

const SCENES: Record<T3bSceneId, React.FC> = {
  hook: HookScene,
  studio: StudioScene,
  calendar: CalendarScene,
  dad: DadScene,
  parked: ParkedScene,
  daughter: DaughterScene,
  present: PresentScene,
  drawing: DrawingScene,
  joke: JokeScene,
  approved: ApprovedScene,
  question: QuestionScene,
  drive: DriveScene,
  search: SearchScene,
  sign: SignScene,
  contact: ContactScene,
};

// «Переговоры в третьем "Б"». Сцены — живые 2D-эпизоды во весь кадр;
// короткие предметные переходы между сценами (Transitions.tsx); рассказчик
// — только голос. Длительность — по фактической речи, контакты — последние
// 150 кадров.
export const BalaGoThirdBMeeting2D: React.FC<BalaGoThirdBMeeting2DProps> = ({ manifest }) => {
  const tl = useMemo(() => buildT3bTimeline(manifest), [manifest]);
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
        <T3bAudio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
