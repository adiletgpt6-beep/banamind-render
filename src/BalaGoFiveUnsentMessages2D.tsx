import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { ChromeFront, PanelBack } from "./five-unsent-messages-2d/Chrome";
import { CuesContext, SceneContext } from "./five-unsent-messages-2d/context";
import { Fu2Audio } from "./five-unsent-messages-2d/Fu2Audio";
import { Narrator } from "./five-unsent-messages-2d/Narrator";
import { Subtitles } from "./five-unsent-messages-2d/Subtitles";
import { FU2_SCENES, FU2_VIDEO, type Fu2SceneId } from "./five-unsent-messages-2d/script";
import { C } from "./five-unsent-messages-2d/theme";
import { buildFu2Cues, type Fu2Manifest } from "./five-unsent-messages-2d/timing";
import { BeforeScene, IntroScene } from "./five-unsent-messages-2d/scenes/Intro";
import { CarScene, GateScene } from "./five-unsent-messages-2d/scenes/Gate";
import { WeekScene } from "./five-unsent-messages-2d/scenes/Week";
import { SaturdayScene, WhyScene } from "./five-unsent-messages-2d/scenes/Saturday";
import { ListenScene } from "./five-unsent-messages-2d/scenes/Listen";
import { ContactScene, DinnerScene, RequestScene, RouteScene } from "./five-unsent-messages-2d/scenes/Evening";

export type BalaGoFiveUnsentMessages2DProps = {
  // Заполняется в calculateMetadata из public/audio/five-unsent-messages-2d/manifest.json.
  readonly manifest: Fu2Manifest;
};

const SCENES: Record<Fu2SceneId, React.FC> = {
  intro: IntroScene,
  before: BeforeScene,
  gate: GateScene,
  car: CarScene,
  week: WeekScene,
  saturday: SaturdayScene,
  why: WhyScene,
  listen: ListenScene,
  route: RouteScene,
  request: RequestScene,
  dinner: DinnerScene,
  contact: ContactScene,
};

// «Беш жөнөтүлбөгөн үн билдирүү» — ровно 120 с. Сцены на фиксированной
// шкале (script.ts), речь — по фактической озвучке. Карточная подача:
// строка метаданных и прогресс, заголовок, основная панель, маленький
// рассказчик, карточка субтитров.
export const BalaGoFiveUnsentMessages2D: React.FC<BalaGoFiveUnsentMessages2DProps> = ({ manifest }) => {
  const cues = useMemo(() => buildFu2Cues(manifest), [manifest]);
  const fps = FU2_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* рассказчик под панелью: при её увеличении он уходит за неё */}
        <Narrator mood={(t) => (t > 104 ? 1 : t > 66 ? 0.6 : 0.3)} />
        <PanelBack />
        {FU2_SCENES.map((sc) => {
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
        <ChromeFront />
        <Subtitles />
        <Fu2Audio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
