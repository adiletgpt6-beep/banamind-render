import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { B6Audio } from "./B6Audio";
import { CuesContext, SceneContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { HookScene } from "./scenes/Hook";
import { ListenScene } from "./scenes/Listen";
import { SearchScene } from "./scenes/Search";
import { TalkScene } from "./scenes/Talk";
import { TermsScene } from "./scenes/Terms";
import { B6_SCENES, B6_VIDEO, type B6SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildB6Cues, type B6Manifest } from "./timing";

export type BalaGoBG006Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-006/manifest.json.
  readonly manifest: B6Manifest;
};

const SCENES: Record<B6SceneId, React.FC> = {
  hook: HookScene,
  listen: ListenScene,
  talk: TalkScene,
  search: SearchScene,
  terms: TermsScene,
  cta: CtaScene,
};

// Выпуск №07 / BG-006 «Незаконченная презентация» — 72 с, 2D.
// Сцены стоят на фиксированной шкале (script.ts), реплики — в моменты at.
export const BalaGoBG006: React.FC<BalaGoBG006Props> = ({ manifest }) => {
  const cues = useMemo(() => buildB6Cues(manifest), [manifest]);
  const fps = B6_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {B6_SCENES.map((sc) => {
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
        <B6Audio cues={cues} />
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
