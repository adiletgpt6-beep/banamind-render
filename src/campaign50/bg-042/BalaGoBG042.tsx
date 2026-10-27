// BalaGo-50 №42 / BG-042 «Кеңседен шашылыш кабар» — сборка ролика.
// Сцены идут подряд по шкале озвучки (timeline.ts). Стыки «студия ↔ офис»
// закрывает телевизионная шторка (середина — ровно на стыке), остальные
// стыки непрерывны: последний кадр сцены совпадает с первым кадром следующей.
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Bg42Audio } from "./Bg42Audio";
import { STINGER_SEC } from "./beats";
import { FPS, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { HookScene } from "./scenes/Hook";
import { InterviewScene } from "./scenes/Interview";
import { RulesScene } from "./scenes/Rules";
import { SearchScene } from "./scenes/Search";
import { TrialScene } from "./scenes/Trial";
import type { Bg42SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildTimeline, estimateManifest, type Manifest } from "./timeline";
import { Stinger } from "./ui";

export type BalaGoBG042Props = {
  // Заполняется calculateMetadata из public/audio/campaign50/bg-042/manifest.json.
  readonly manifest: Manifest | null;
};

const SCENES: Record<Bg42SceneId, React.FC> = {
  hook: HookScene,
  interview: InterviewScene,
  search: SearchScene,
  rules: RulesScene,
  trial: TrialScene,
  cta: CtaScene,
};

// Шторки на стыках «студия → офис» (1→2) и «офис → студия» (3→4).
const STINGER_AT: readonly Bg42SceneId[] = ["interview", "rules"];

const Stingers: React.FC<{ readonly at: readonly number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const half = (STINGER_SEC / 2) * FPS;
  return (
    <>
      {at.map((s) => {
        const c = s * FPS;
        const p = (f - (c - half)) / (2 * half);
        return p > 0 && p < 1 ? <Stinger key={s} progress={p} /> : null;
      })}
    </>
  );
};

export const BalaGoBG042: React.FC<BalaGoBG042Props> = ({ manifest }) => {
  const tl = useMemo(() => buildTimeline(manifest ?? estimateManifest()), [manifest]);
  const stingers = tl.scenes.filter((s) => STINGER_AT.indexOf(s.id) >= 0).map((s) => s.from);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {tl.scenes.map((sc) => {
          const from = Math.round(sc.from * FPS);
          const durationInFrames = Math.round(sc.to * FPS) - from;
          const Scene = SCENES[sc.id];
          return (
            <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={durationInFrames} premountFor={FPS}>
              <Scene />
            </Sequence>
          );
        })}
        <Stingers at={stingers} />
        <Subtitles tl={tl} />
        <Bg42Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
