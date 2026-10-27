import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg33Audio } from "./Bg33Audio";
import { SceneContext, TimelineContext } from "./context";
import { ChoiceScene } from "./scenes/Choice";
import { CtaScene } from "./scenes/Cta";
import { HookScene } from "./scenes/Hook";
import { RuleScene } from "./scenes/Rule";
import { TrialScene } from "./scenes/Trial";
import { WaitScene } from "./scenes/Wait";
import type { Bg33SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg33Timeline, type Bg33Manifest } from "./timing";

export type BalaGoBG033Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-033/voice/manifest.json.
  readonly manifest: Bg33Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

export const SCENES: Record<Bg33SceneId, React.FC> = {
  hook: HookScene,
  rule: RuleScene,
  wait: WaitScene,
  trial: TrialScene,
  choice: ChoiceScene,
  cta: CtaScene,
};

// BG-033 «Алгач сынап көрүңүз»: сцены идут подряд по шкале timing.ts;
// переходы — совпадением формы (квадрат-чекбокс) внутри самих сцен.
export const BalaGoBG033: React.FC<BalaGoBG033Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg33Timeline(manifest), [manifest]);
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
        <Bg33Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
