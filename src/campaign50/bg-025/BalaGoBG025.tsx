import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg25Audio } from "./Bg25Audio";
import { SceneContext, TimelineContext } from "./context";
import { SCENES } from "./scenes";
import { Subtitles } from "./Subtitles";
import { buildBg25Timeline, type Bg25Manifest } from "./timing";
import { Transition } from "./Transition";

export type BalaGoBG025Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-025/voice/manifest.json.
  readonly manifest: Bg25Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

// BG-025 «Арыздан кийин эмне болот?»: сцены идут подряд по шкале
// timing.ts; стык сцен — мягкий бумажный сгиб, проходящий через кадр
// (продолжение одной и той же ленты).
export const BalaGoBG025: React.FC<BalaGoBG025Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg25Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id].Scene;
          return (
            <Sequence key={sc.id} name={sc.title} from={sc.from} durationInFrames={sc.frames} premountFor={30}>
              <SceneContext.Provider value={{ from: sc.from, to: sc.from + sc.frames, frames: sc.frames }}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        {tl.scenes.slice(1).map((sc) => (
          <Sequence key={`tr-${sc.id}`} name={`Переход → ${sc.id}`} from={sc.from - 9} durationInFrames={18}>
            <Transition />
          </Sequence>
        ))}
        <Subtitles />
        <Bg25Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
