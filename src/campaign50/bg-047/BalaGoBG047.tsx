import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Bg47Audio } from "./Bg47Audio";
import { SceneStartContext, TimelineContext } from "./context";
import { BG47_VIDEO, type Bg47SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg47Timeline, type Bg47Manifest } from "./timing";
import { easeInOut, prog } from "./art/motion";
import { HookScene } from "./scenes/Hook";
import { FieldsScene } from "./scenes/Fields";
import { MismatchScene } from "./scenes/Mismatch";
import { ApplyScene } from "./scenes/Apply";
import { TrialScene } from "./scenes/Trial";
import { CtaScene } from "./scenes/Cta";

export type BalaGoBG047Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-047/manifest.json.
  readonly manifest: Bg47Manifest;
  // Черновые кадры без озвучки (оценочные тайминги). Финальный рендер — false.
  readonly allowEstimate: boolean;
};

const SCENES: Record<Bg47SceneId, React.FC> = {
  hook: HookScene,
  fields: FieldsScene,
  mismatch: MismatchScene,
  apply: ApplyScene,
  trial: TrialScene,
  cta: CtaScene,
};

// Переход в финал: карточка финала переворачивается, как страница
// pop-up книги, поверх последнего кадра примера (сцена 5 продолжает
// показываться под ней TURN кадров).
const TURN = 16;
const PageTurn: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const p = easeInOut(prog(f, 0, TURN));
  return (
    <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: "0 50%" }}>
      <AbsoluteFill style={{ transformOrigin: "0 50%", transform: `rotateY(${(1 - p) * 92}deg)`, boxShadow: `0 0 80px rgba(20,40,90,${0.35 * (1 - p)})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// Выпуск №47 / BG-047 «Картадагы жандуу чекит». Длительности сцен — по
// фактической озвучке (timing.ts); речь не ускоряется.
export const BalaGoBG047: React.FC<BalaGoBG047Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg47Timeline(manifest), [manifest]);
  const fps = BG47_VIDEO.fps;
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {tl.scenes.map((sc, i) => {
          const Scene = SCENES[sc.id];
          const from = Math.round(sc.from * fps);
          const next = tl.scenes[i + 1];
          // сцена перед финалом остаётся под переворачивающейся карточкой
          const extra = next?.id === "cta" ? TURN : 0;
          const body = (
            <SceneStartContext.Provider value={from}>
              <AbsoluteFill style={{ overflow: "hidden" }}>
                <Scene />
              </AbsoluteFill>
            </SceneStartContext.Provider>
          );
          return (
            <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={Math.round(sc.to * fps) - from + extra} premountFor={fps}>
              {sc.id === "cta" ? <PageTurn>{body}</PageTurn> : body}
            </Sequence>
          );
        })}
        <Subtitles />
        <Bg47Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
