import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "../../two-schedules-2d/context";
import { Bg27Audio } from "./Bg27Audio";
import { TimelineContext } from "./context";
import { BG27_VIDEO, type Bg27SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg27Timeline, type Bg27Manifest } from "./timing";
import { HookScene } from "./scenes/Hook";
import { MomScene } from "./scenes/Mom";
import { CardScene } from "./scenes/Card";
import { HandoverScene } from "./scenes/Handover";
import { CalmScene } from "./scenes/Calm";
import { CtaScene } from "./scenes/Cta";

export type BalaGoBG027Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-027/manifest.json.
  readonly manifest: Bg27Manifest;
  // Черновые кадры без озвучки (оценочные тайминги). Финальный рендер — false.
  readonly allowEstimate: boolean;
};

const SCENES: Record<Bg27SceneId, React.FC> = {
  hook: HookScene,
  mom: MomScene,
  card: CardScene,
  handover: HandoverScene,
  calm: CalmScene,
  cta: CtaScene,
};

// Выпуск №28 / BG-027 «Баланы ким тосуп алат?». Длительности сцен — по
// фактической озвучке (timing.ts). Губы мамы — общий риг 2D-ролика №12,
// ему передаются реплики этого ролика (CuesContext) и начало сцены (SceneContext).
export const BalaGoBG027: React.FC<BalaGoBG027Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg27Timeline(manifest), [manifest]);
  const fps = BG27_VIDEO.fps;
  return (
    <TimelineContext.Provider value={tl}>
      <CuesContext.Provider value={tl.cues as never}>
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
          {tl.scenes.map((sc) => {
            const Scene = SCENES[sc.id];
            const from = Math.round(sc.from * fps);
            return (
              <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={Math.round(sc.to * fps) - from} premountFor={fps}>
                <SceneContext.Provider value={from}>
                  <AbsoluteFill style={{ overflow: "hidden" }}>
                    <Scene />
                  </AbsoluteFill>
                </SceneContext.Provider>
              </Sequence>
            );
          })}
          <Subtitles />
          <Bg27Audio tl={tl} />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
