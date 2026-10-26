import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "../../two-schedules-2d/context";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { Bg18Audio } from "./Audio";
import { FPS, TimelineContext } from "./context";
import type { Bg18SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg18Timeline, type Bg18Manifest } from "./timing";
import { HookScene } from "./scenes/Hook";
import { ChatScene } from "./scenes/Chat";
import { ScrollScene } from "./scenes/Scroll";
import { LinkScene } from "./scenes/Link";
import { StepsScene } from "./scenes/Steps";
import { CtaScene } from "./scenes/Cta";

export type BalaGoBG018Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-018/manifest.json.
  readonly manifest: Bg18Manifest;
};

const SCENES: Record<Bg18SceneId, React.FC> = {
  hook: HookScene,
  chat: ChatScene,
  scroll: ScrollScene,
  link: LinkScene,
  steps: StepsScene,
  cta: CtaScene,
};

// Выпуск №19 / BG-018 «Семейный чат». Сцены идут подряд, длительность —
// по фактической озвучке (timing.ts).
export const BalaGoBG018: React.FC<BalaGoBG018Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg18Timeline(manifest), [manifest]);
  // Губы персонажей считает общий rig two-schedules-2d по тем же репликам.
  const lipCues = tl.cues as unknown as Ts2Cue[];
  return (
    <TimelineContext.Provider value={tl}>
      <CuesContext.Provider value={lipCues}>
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
          {tl.scenes.map((sc) => {
            const Scene = SCENES[sc.id];
            const from = Math.round(sc.from * FPS);
            return (
              <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={Math.round(sc.to * FPS) - from} premountFor={FPS}>
                <SceneContext.Provider value={from}>
                  <AbsoluteFill style={{ overflow: "hidden" }}>
                    <Scene />
                  </AbsoluteFill>
                </SceneContext.Provider>
              </Sequence>
            );
          })}
          <Subtitles />
          <Bg18Audio />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
