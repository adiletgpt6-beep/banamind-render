import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg29Audio } from "./Bg29Audio";
import { SceneContext, TimelineContext } from "./context";
import { C } from "./palette";
import { BeltScene } from "./scenes/Belt";
import { CtaScene } from "./scenes/Cta";
import { DayScene } from "./scenes/Day";
import { HOOK_ITEMS, HookScene } from "./scenes/Hook";
import { PickupScene } from "./scenes/Pickup";
import { WaterScene } from "./scenes/Water";
import type { Bg29SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg29Timeline, type Bg29Manifest } from "./timing";
import { Transition, TRANSITION_FRAMES } from "./Transition";

export type BalaGoBG029Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-029/voice/manifest.json.
  readonly manifest: Bg29Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg29SceneId, React.FC> = {
  hook: HookScene,
  belt: BeltScene,
  water: WaterScene,
  pickup: PickupScene,
  day: DayScene,
  cta: CtaScene,
};

// Стык «через предмет»: цвет предмета, точка в конце прежней сцены и
// точка, где предмет оказывается в новой.
const JOINS: Partial<Record<Bg29SceneId, { color: string; from: readonly [number, number]; to: readonly [number, number] }>> = {
  belt: { color: C.metal, from: [HOOK_ITEMS[0].x, HOOK_ITEMS[0].y], to: [540, 960] },
  water: { color: C.water, from: [540, 960], to: [170, 1180] },
  pickup: { color: "#FFFFFF", from: [540, 960], to: [540, 960] },
  day: { color: C.yellowSoft, from: [420, 1300], to: [540, 1040] },
  cta: { color: C.yellowSoft, from: [540, 1040], to: [540, 960] },
};

// BG-029 «Чоң сапардын майда деталдары»: сцены идут подряд по шкале
// timing.ts, переходы — через движение предметов (Transition.tsx).
export const BalaGoBG029: React.FC<BalaGoBG029Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg29Timeline(manifest), [manifest]);
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
        {tl.scenes.slice(1).map((sc) => {
          const j = JOINS[sc.id];
          return j ? (
            <Sequence key={`tr-${sc.id}`} name={`Переход → ${sc.id}`} from={sc.from - TRANSITION_FRAMES / 2} durationInFrames={TRANSITION_FRAMES}>
              <Transition color={j.color} from={j.from} to={j.to} />
            </Sequence>
          ) : null;
        })}
        <Subtitles />
        <Bg29Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
