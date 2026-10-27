import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "../../two-schedules-2d/context";
import { Bg020Audio } from "./Audio";
import { TimelineContext } from "./context";
import { CtaScene, HabitScene, HookScene, OpenScene, RealizeScene, StepsScene } from "./Scenes";
import { BG020_SCENES, BG020_VIDEO, type Bg020SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg020Timeline, type Bg020Manifest } from "./timeline";

export type BalaGoBG020Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-020/manifest.json.
  readonly manifest: Bg020Manifest | null;
  // Только для черновых кадров без озвучки (оценочные тайминги).
  readonly allowEstimate: boolean;
};

const SCENES: Record<Bg020SceneId, React.FC> = {
  hook: HookScene,
  habit: HabitScene,
  realize: RealizeScene,
  open: OpenScene,
  steps: StepsScene,
  cta: CtaScene,
};

// Выпуск №21 / BG-020 «Тихий вечер пятницы». Сцены идут по шкале,
// построенной по фактической озвучке (timeline.ts).
export const BalaGoBG020: React.FC<BalaGoBG020Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg020Timeline(manifest ?? { version: 1, kind: "bg020", estimated: true, lines: [] }), [manifest]);
  const fps = BG020_VIDEO.fps;
  return (
    <TimelineContext.Provider value={tl}>
      {/* риг персонажей берёт губы из общего контекста реплик */}
      <CuesContext.Provider value={[...tl.cues]}>
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
          {tl.scenes.map((sc) => {
            const Scene = SCENES[sc.id];
            const from = Math.round(sc.from * fps);
            const title = BG020_SCENES.find((x) => x.id === sc.id)!.title;
            return (
              <Sequence key={sc.id} name={title} from={from} durationInFrames={Math.round(sc.to * fps) - from} premountFor={fps}>
                <SceneContext.Provider value={from}>
                  <AbsoluteFill style={{ overflow: "hidden" }}>
                    <Scene />
                  </AbsoluteFill>
                </SceneContext.Provider>
              </Sequence>
            );
          })}
          <Subtitles />
          <Bg020Audio />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
