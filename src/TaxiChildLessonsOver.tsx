import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SlotContext, TimelineContext } from "./taxi-child/context";
import { Subtitles, TcAudio } from "./taxi-child/overlay";
import {
  GroupScene,
  HookScene,
  ServiceScene,
  WhatsappScene,
} from "./taxi-child/scenes-a";
import {
  CtaScene,
  HandoffScene,
  PriceScene,
  TrialScene,
} from "./taxi-child/scenes-b";
import { TC_VIDEO, type TcSceneId } from "./taxi-child/script";
import { buildTcTimeline, type TcManifest } from "./taxi-child/timing";

export type TaxiChildLessonsOverProps = {
  // Заполняется в calculateMetadata из public/audio/taxi-child/manifest.json.
  readonly manifest: TcManifest;
  // Только контрольные кадры до озвучки: оценочная шкала без голоса.
  readonly preview?: boolean;
};

const SCENES: Record<TcSceneId, React.FC> = {
  hook: HookScene,
  service: ServiceScene,
  group: GroupScene,
  whatsapp: WhatsappScene,
  handoff: HandoffScene,
  price: PriceScene,
  trial: TrialScene,
  cta: CtaScene,
};

// Taxi Child — «Сабак бүттү»: ровно 60 с, 1080×1920, 30 fps. Границы сцен
// — по естественной озвучке диктора (timing.ts → buildTcTimeline).
export const TaxiChildLessonsOver: React.FC<TaxiChildLessonsOverProps> = ({
  manifest,
}) => {
  const tl = useMemo(() => buildTcTimeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#F5F8FC" }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id];
          return (
            <Sequence
              key={sc.id}
              name={sc.title}
              from={sc.from}
              durationInFrames={sc.to - sc.from}
              premountFor={TC_VIDEO.fps}
            >
              <SlotContext.Provider value={sc}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SlotContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <TcAudio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
