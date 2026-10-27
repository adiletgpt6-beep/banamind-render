import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext as RigSceneContext } from "../../two-schedules-2d/context";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { Bg26Audio } from "./Bg26Audio";
import { ExampleBadge } from "./parts";
import { SceneContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { GroupScene } from "./scenes/Group";
import { HookScene } from "./scenes/Hook";
import { LocationScene } from "./scenes/Location";
import { OrderScene } from "./scenes/Order";
import { PlanScene } from "./scenes/Plan";
import { BG26_SEAMLESS, type Bg26SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg26Timeline, sceneOf, type Bg26Manifest } from "./timing";
import { Transition } from "./Transition";

export type BalaGoBG026Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-026/voice/manifest.json.
  readonly manifest: Bg26Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg26SceneId, React.FC> = {
  hook: HookScene,
  plan: PlanScene,
  group: GroupScene,
  location: LocationScene,
  order: OrderScene,
  cta: CtaScene,
};


// BG-026 «Балам азыр кайда?»: сцены идут подряд по шкале timing.ts. Стык
// сцен — большой светлый стикер с рабочего стола, мягко проходящий через
// кадр (без вспышек). Губы отца считает общий rig two-schedules-2d по тем
// же репликам (формат реплик совместим с Ts2Cue).
export const BalaGoBG026: React.FC<BalaGoBG026Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg26Timeline(manifest), [manifest]);
  const lipCues = tl.cues as unknown as Ts2Cue[];
  return (
    <TimelineContext.Provider value={tl}>
      <CuesContext.Provider value={lipCues}>
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
          {tl.scenes.map((sc) => {
            const Scene = SCENES[sc.id];
            return (
              <Sequence key={sc.id} name={sc.title} from={sc.from} durationInFrames={sc.frames} premountFor={30}>
                <SceneContext.Provider value={{ from: sc.from, frames: sc.frames }}>
                  <RigSceneContext.Provider value={sc.from}>
                    <AbsoluteFill style={{ overflow: "hidden" }}>
                      <Scene />
                    </AbsoluteFill>
                  </RigSceneContext.Provider>
                </SceneContext.Provider>
              </Sequence>
            );
          })}
          {tl.scenes.slice(1).map((sc, i) =>
            BG26_SEAMLESS.indexOf(sc.id) >= 0 ? null : (
              <Sequence key={`tr-${sc.id}`} name={`Переход → ${sc.id}`} from={sc.from - 9} durationInFrames={20}>
                <Transition variant={i} />
              </Sequence>
            ),
          )}
          {/* «Шарттуу мисал» — один бейдж на весь условный пример (group,
              location, order), поверх переходов, без мерцания на стыках */}
          <Sequence name="Шарттуу мисал" from={sceneOf(tl, "group").from} durationInFrames={sceneOf(tl, "cta").from - sceneOf(tl, "group").from}>
            <ExampleBadge />
          </Sequence>
          <Subtitles />
          <Bg26Audio tl={tl} />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
