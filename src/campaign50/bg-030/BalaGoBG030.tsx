import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { easeInOut } from "./anim";
import { Bg30Audio } from "./Bg30Audio";
import { SceneContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { FutureScene } from "./scenes/Future";
import { HookScene } from "./scenes/Hook";
import { SiteScene } from "./scenes/Site";
import { TableScene } from "./scenes/Table";
import { WindowsScene } from "./scenes/Windows";
import type { Bg30SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg30Timeline, type Bg30Manifest } from "./timing";

export type BalaGoBG030Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-030/voice/manifest.json.
  readonly manifest: Bg30Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg30SceneId, React.FC> = {
  hook: HookScene,
  table: TableScene,
  site: SiteScene,
  windows: WindowsScene,
  future: FutureScene,
  cta: CtaScene,
};

// Мягкий заход сцены поверх предыдущей (кадры). Камера в сценах сама
// «входит» в окно и «выходит» из него, заход только сглаживает стык.
const LEAD = 12;

const FadeIn: React.FC<{ readonly lead: number; readonly children: React.ReactNode }> = ({ lead, children }) => {
  const f = useCurrentFrame();
  const a = lead ? easeInOut(f / lead) : 1;
  return <AbsoluteFill style={{ overflow: "hidden", opacity: a }}>{children}</AbsoluteFill>;
};

// BG-030 «Бишкектеги бир каттам»: городской очерк через окна, сцены идут
// подряд по шкале timing.ts.
export const BalaGoBG030: React.FC<BalaGoBG030Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg30Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {tl.scenes.map((sc, i) => {
          const Scene = SCENES[sc.id];
          const lead = i === 0 ? 0 : LEAD;
          return (
            <Sequence key={sc.id} name={sc.title} from={sc.from - lead} durationInFrames={sc.frames + lead} premountFor={30}>
              <SceneContext.Provider value={{ from: sc.from, frames: sc.frames, lead }}>
                <FadeIn lead={lead}>
                  <Scene />
                </FadeIn>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <Bg30Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
