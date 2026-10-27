// BalaGo-50, выпуск №03 / BG-002 — «Үч мүнөт жыйынга чейин».
// Сцены стоят на шкале script.ts, реплики — в моменты at; финал длится
// до конца ролика (последнее слово + ≥ 3,2 с).
import { useMemo } from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { CuesContext, SceneContext } from "./context";
import { Bg2Audio } from "./Bg2Audio";
import { Subtitles } from "./Subtitles";
import { Timer } from "./Timer";
import { BG2_SCENES, BG2_VIDEO, type Bg2SceneId } from "./script";
import { buildBg2Cues, type Bg2Manifest } from "./timing";
import { HookScene } from "./scenes/Hook";
import { CallScene } from "./scenes/Call";
import { CalendarScene } from "./scenes/Calendar";
import { AppScene } from "./scenes/App";
import { TermsScene } from "./scenes/Terms";
import { CtaScene, CTA } from "./scenes/Cta";

export type Bg002Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-002/manifest.json.
  readonly manifest: Bg2Manifest;
  // Черновик без озвучки (только для локальных контрольных кадров).
  readonly silent?: boolean;
};

const SCENES: Record<Bg2SceneId, React.FC> = {
  hook: HookScene,
  call: CallScene,
  calendar: CalendarScene,
  app: AppScene,
  terms: TermsScene,
  cta: CtaScene,
};

export const Bg002: React.FC<Bg002Props> = ({ manifest, silent }) => {
  const cues = useMemo(() => buildBg2Cues(manifest), [manifest]);
  const { durationInFrames } = useVideoConfig();
  const fps = BG2_VIDEO.fps;
  const ctaFrom = Math.round(BG2_SCENES[BG2_SCENES.length - 1].from * fps);
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {BG2_SCENES.map((sc) => {
          const Scene = SCENES[sc.id];
          const from = Math.round(sc.from * fps);
          const to = sc.id === "cta" ? durationInFrames : Math.round(sc.to * fps);
          return (
            <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={to - from} premountFor={fps}>
              <SceneContext.Provider value={from}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Timer hideFrom={ctaFrom + CTA.wipeTo} />
        <Subtitles />
        {silent ? null : <Bg2Audio cues={cues} />}
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
