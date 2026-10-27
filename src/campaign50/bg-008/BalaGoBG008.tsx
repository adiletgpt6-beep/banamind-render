import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg8Audio } from "./Bg8Audio";
import { CuesContext, SceneContext } from "./context";
import { BG8_SCENES, BG8_VIDEO, type Bg8SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg8Cues, type Bg8Manifest } from "./timing";
import { HookScene } from "./scenes/Hook";
import { OfficeScene } from "./scenes/Office";
import { DriveScene } from "./scenes/Drive";
import { SchoolScene } from "./scenes/School";
import { DecideScene } from "./scenes/Decide";
import { HowScene } from "./scenes/How";
import { CtaScene } from "./scenes/Cta";

export type BalaGoBG008Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-008/manifest.json.
  readonly manifest: Bg8Manifest;
};

const SCENES: Record<Bg8SceneId, React.FC> = {
  hook: HookScene,
  office: OfficeScene,
  drive: DriveScene,
  school: SchoolScene,
  decide: DecideScene,
  how: HowScene,
  cta: CtaScene,
};

// BG-008 «Один пропущенный звонок» — 72 с, 1080×1920, 30 fps.
// Сцены стоят на фиксированной шкале (script.ts), реплики — в моменты at.
export const BalaGoBG008: React.FC<BalaGoBG008Props> = ({ manifest }) => {
  const cues = useMemo(() => buildBg8Cues(manifest), [manifest]);
  const fps = BG8_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {BG8_SCENES.map((sc) => {
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
        <Bg8Audio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
