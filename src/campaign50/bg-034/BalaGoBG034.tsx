import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg34Audio } from "./Bg34Audio";
import { SceneContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { DistanceScene } from "./scenes/Distance";
import { HookScene } from "./scenes/Hook";
import { OrderScene } from "./scenes/Order";
import { TenScene } from "./scenes/Ten";
import { TicketScene } from "./scenes/Ticket";
import type { Bg34SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg34Timeline, type Bg34Manifest } from "./timing";

export type BalaGoBG034Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-034/voice/manifest.json.
  readonly manifest: Bg34Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg34SceneId, React.FC> = {
  hook: HookScene,
  ticket: TicketScene,
  ten: TenScene,
  distance: DistanceScene,
  order: OrderScene,
  cta: CtaScene,
};

// BG-034 «10 толук сапар»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG034: React.FC<BalaGoBG034Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg34Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FFFDF7" }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id];
          return (
            <Sequence
              key={sc.id}
              name={sc.title}
              from={sc.from}
              durationInFrames={sc.frames}
              premountFor={30}
            >
              <SceneContext.Provider
                value={{ from: sc.from, frames: sc.frames }}
              >
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <Bg34Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
