import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { CuesContext, SceneContext } from "../../two-schedules-2d/context";
import { easeInOut, easeOut } from "../../two-schedules-2d/rig/motion";
import { Bg40Audio } from "./Bg40Audio";
import { box, TimelineContext } from "./context";
import { BG40_VIDEO, type Bg40SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg40Timeline, type Bg40Manifest } from "./timing";
import { HookScene } from "./scenes/Hook";
import { FlowScene } from "./scenes/Flow";
import { RefocusScene } from "./scenes/Refocus";
import { SearchScene } from "./scenes/Search";
import { PlanScene } from "./scenes/Plan";
import { CtaScene } from "./scenes/Cta";

export type BalaGoBG040Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-040/manifest.json.
  readonly manifest: Bg40Manifest;
  // Черновые кадры без озвучки (оценочные тайминги). Финальный рендер — false.
  readonly allowEstimate: boolean;
};

const SCENES: Record<Bg40SceneId, React.FC> = {
  hook: HookScene,
  flow: FlowScene,
  refocus: RefocusScene,
  search: SearchScene,
  plan: PlanScene,
  cta: CtaScene,
};

// Вход сцены (переход): сцена начинается поверх предыдущей, предыдущая
// доигрывает dur кадров под ней. fade — мягкое растворение (кадры связаны
// движением камеры: стрелка хука → часы офиса); paper — новый кадр
// въезжает снизу, как лист из принтера.
type Trans = { readonly kind: "none" | "fade" | "paper"; readonly dur: number };
export const BG40_TRANS: Record<Bg40SceneId, Trans> = {
  hook: { kind: "none", dur: 0 },
  flow: { kind: "fade", dur: 10 },
  refocus: { kind: "paper", dur: 16 },
  search: { kind: "fade", dur: 12 },
  plan: { kind: "paper", dur: 16 },
  cta: { kind: "fade", dur: 12 },
};

const TransitionIn: React.FC<{ readonly t: Trans; readonly children: React.ReactNode }> = ({ t, children }) => {
  const f = useCurrentFrame();
  if (t.kind === "none" || f >= t.dur) return <AbsoluteFill style={{ overflow: "hidden" }}>{children}</AbsoluteFill>;
  if (t.kind === "fade") return <AbsoluteFill style={{ overflow: "hidden", opacity: easeInOut(f / t.dur) }}>{children}</AbsoluteFill>;
  // paper
  const u = easeOut(f / t.dur);
  return (
    <AbsoluteFill style={{ overflow: "visible" }}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", translate: `0 ${(1 - u) * 1960}px`, rotate: `${(1 - u) * -4}deg`, boxShadow: "0 -30px 60px rgba(20,30,60,0.35)", borderRadius: (1 - u) * 24 })}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

// Выпуск №40 / BG-040 «Убакыттын да баасы бар». Длительности сцен — по
// фактической озвучке (timing.ts). Губы мамы — общий риг 2D-ролика №12:
// ему передаются реплики этого ролика (CuesContext) и начало сцены.
export const BalaGoBG040: React.FC<BalaGoBG040Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg40Timeline(manifest), [manifest]);
  const fps = BG40_VIDEO.fps;
  return (
    <TimelineContext.Provider value={tl}>
      <CuesContext.Provider value={tl.cues as never}>
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
          {tl.scenes.map((sc, i) => {
            const Scene = SCENES[sc.id];
            const from = Math.round(sc.from * fps);
            const end = Math.round(sc.to * fps);
            const next = tl.scenes[i + 1];
            const extra = next ? BG40_TRANS[next.id].dur : 0;
            return (
              <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={end - from + extra} premountFor={fps}>
                <SceneContext.Provider value={from}>
                  <TransitionIn t={BG40_TRANS[sc.id]}>
                    <Scene />
                  </TransitionIn>
                </SceneContext.Provider>
              </Sequence>
            );
          })}
          <Subtitles />
          <Bg40Audio tl={tl} />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
