import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg46Audio } from "./Bg46Audio";
import { SceneContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { FutureScene } from "./scenes/Future";
import { HookScene } from "./scenes/Hook";
import { MorningScene } from "./scenes/Morning";
import { NoteScene } from "./scenes/Note";
import { RepeatScene } from "./scenes/Repeat";
import type { Bg46SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { ZipWipe } from "./Transition";
import { SampleTag } from "./scenes/common";
import { BG46_TEXT } from "./script";
import { buildBg46Timeline, type Bg46Manifest } from "./timing";

export type BalaGoBG046Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-046/voice/manifest.json.
  readonly manifest: Bg46Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg46SceneId, React.FC> = {
  hook: HookScene,
  morning: MorningScene,
  repeat: RepeatScene,
  note: NoteScene,
  future: FutureScene,
  cta: CtaScene,
};

// BG-046 «Мектеп сумкасынын монологу»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG046: React.FC<BalaGoBG046Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg46Timeline(manifest), [manifest]);
  const future = tl.scenes.find((x) => x.id === "future")!;
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
        {/* переходы «молния» на смене места действия */}
        <ZipWipe at={tl.scenes.find((x) => x.id === "morning")!.from} />
        <ZipWipe at={tl.scenes.find((x) => x.id === "future")!.from} />
        {/* «Шарттуу мисал» — всё время, пока виден условный пример (и на переходе) */}
        <Sequence name="Шарттуу мисал" from={future.from} durationInFrames={future.frames}>
          <SampleTag text={BG46_TEXT.future.sample} top={200} />
        </Sequence>
        <Subtitles />
        <Bg46Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
