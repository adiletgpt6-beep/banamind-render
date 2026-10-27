import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg24Audio } from "./Bg24Audio";
import { SceneContext, TimelineContext } from "./context";
import { CalendarScene } from "./scenes/Calendar";
import { CtaScene } from "./scenes/Cta";
import { HookScene } from "./scenes/Hook";
import { MatchScene } from "./scenes/Match";
import { PuzzleScene } from "./scenes/Puzzle";
import { TrialScene } from "./scenes/Trial";
import type { Bg24SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg24Timeline, type Bg24Manifest } from "./timing";
import { Transition } from "./Transition";

export type BalaGoBG024Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-024/voice/manifest.json.
  readonly manifest: Bg24Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg24SceneId, React.FC> = {
  hook: HookScene,
  puzzle: PuzzleScene,
  calendar: CalendarScene,
  match: MatchScene,
  trial: TrialScene,
  cta: CtaScene,
};

// BG-024 «Почему не сразу завтра?»: сцены идут подряд по шкале timing.ts,
// стык сцен — мягкая жёлтая «деталь пазла», проходящая через кадр.
export const BalaGoBG024: React.FC<BalaGoBG024Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg24Timeline(manifest), [manifest]);
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
        {tl.scenes.slice(1).map((sc) => (
          <Sequence key={`tr-${sc.id}`} name={`Переход → ${sc.id}`} from={sc.from - 8} durationInFrames={18}>
            <Transition />
          </Sequence>
        ))}
        <Subtitles />
        <Bg24Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
