import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg22Audio } from "./Bg22Audio";
import { SceneContext, TimelineContext } from "./context";
import { AfternoonScene } from "./scenes/Afternoon";
import { CtaScene } from "./scenes/Cta";
import { HookScene } from "./scenes/Hook";
import { MergeScene } from "./scenes/Merge";
import { MorningScene } from "./scenes/Morning";
import { PriceScene } from "./scenes/Price";
import type { Bg22SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg22Timeline, type Bg22Manifest } from "./timing";

export type BalaGoBG022Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-022/voice/manifest.json.
  readonly manifest: Bg22Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg22SceneId, React.FC> = {
  hook: HookScene,
  morning: MorningScene,
  afternoon: AfternoonScene,
  merge: MergeScene,
  price: PriceScene,
  cta: CtaScene,
};

// BG-022 «Что означает одна поездка?»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG022: React.FC<BalaGoBG022Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg22Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
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
        <Bg22Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
