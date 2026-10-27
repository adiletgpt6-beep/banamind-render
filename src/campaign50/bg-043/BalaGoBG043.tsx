import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg43Audio } from "./Bg43Audio";
import { SceneContext, TimelineContext } from "./context";
import { AlignScene } from "./scenes/Align";
import { CtaScene } from "./scenes/Cta";
import { FieldsScene } from "./scenes/Fields";
import { HookScene } from "./scenes/Hook";
import { SearchScene } from "./scenes/Search";
import { TrialScene } from "./scenes/Trial";
import type { Bg43SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg43Timeline, type Bg43Manifest } from "./timing";
import { GEAR_FRAMES, GearWipe, IRIS_IN, IRIS_OUT, Iris } from "./Transition";

export type BalaGoBG043Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-043/voice/manifest.json.
  readonly manifest: Bg43Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg43SceneId, React.FC> = {
  hook: HookScene,
  align: AlignScene,
  search: SearchScene,
  fields: FieldsScene,
  trial: TrialScene,
  cta: CtaScene,
};

// Стык перед сценой: hook → align → search — один офис и непрерывная
// камера (без перехода); search → fields и fields → trial — прокат
// шестерёнки; trial → cta — шестерёнки замирают и превращаются в жёлтый
// круг финала.
const INTO: Partial<Record<Bg43SceneId, "gearL" | "gearR" | "iris">> = {
  fields: "gearL",
  trial: "gearR",
  cta: "iris",
};

// BG-043 «Сүйлөгөн сааттар»: сцены идут подряд по шкале timing.ts.
export const BalaGoBG043: React.FC<BalaGoBG043Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg43Timeline(manifest), [manifest]);
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
        {tl.scenes.map((sc) => {
          const kind = INTO[sc.id];
          if (!kind) return null;
          if (kind === "iris")
            return (
              <Sequence key={`tr-${sc.id}`} name={`Переход → ${sc.id}`} from={sc.from - IRIS_IN} durationInFrames={IRIS_IN + IRIS_OUT}>
                <Iris />
              </Sequence>
            );
          return (
            <Sequence key={`tr-${sc.id}`} name={`Переход → ${sc.id}`} from={sc.from - Math.floor(GEAR_FRAMES / 2)} durationInFrames={GEAR_FRAMES}>
              {kind === "gearL" ? <GearWipe dir={-1} /> : <GearWipe dir={1} fill="#CFE3F7" ring="#9FB0CF" />}
            </Sequence>
          );
        })}
        <Subtitles />
        <Bg43Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
