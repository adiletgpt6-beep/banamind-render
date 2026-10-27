import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg44Audio } from "./Bg44Audio";
import { SceneContext, TimelineContext } from "./context";
import { CardsScene } from "./scenes/Cards";
import { CtaScene } from "./scenes/Cta";
import { DecisionScene } from "./scenes/Decision";
import { GroupScene } from "./scenes/Group";
import { HookScene } from "./scenes/Hook";
import { TrialScene } from "./scenes/Trial";
import type { Bg44SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg44Timeline, type Bg44Manifest } from "./timing";
import { Transition, TRANSITION_FRAMES } from "./Transition";

export type BalaGoBG044Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-044/voice/manifest.json.
  readonly manifest: Bg44Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg44SceneId, React.FC> = {
  hook: HookScene,
  cards: CardsScene,
  group: GroupScene,
  trial: TrialScene,
  decision: DecisionScene,
  cta: CtaScene,
};

// BG-044 «Деңгээл: мектептен алып кетүү»: сцены идут подряд по шкале
// timing.ts; стык сцен — пиксельная «загрузка уровня» (Transition.tsx).
export const BalaGoBG044: React.FC<BalaGoBG044Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg44Timeline(manifest), [manifest]);
  const half = Math.floor(TRANSITION_FRAMES / 2);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id];
          return (
            <Sequence key={sc.id} name={sc.title} from={sc.from} durationInFrames={sc.frames} premountFor={30}>
              <SceneContext.Provider value={{ from: sc.from, frames: sc.frames }}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        {tl.scenes.slice(1).map((sc) => (
          <Sequence key={`tr-${sc.id}`} name={`Переход → ${sc.id}`} from={sc.from - half} durationInFrames={TRANSITION_FRAMES}>
            <Transition />
          </Sequence>
        ))}
        <Bg44Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
