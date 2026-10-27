import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CuesContext, SceneContext } from "./no-backup-2d/context";
import { Nb2Audio } from "./no-backup-2d/Nb2Audio";
import { NB2_SCENES, NB2_VIDEO, type Nb2SceneId } from "./no-backup-2d/script";
import { buildNb2Cues, type Nb2Manifest } from "./no-backup-2d/timing";
import { PrologueScene, ReflectionScene } from "./no-backup-2d/scenes/Home";

import { SearchScene } from "./no-backup-2d/scenes/Search";
import { DriveScene } from "./no-backup-2d/scenes/Drive";
import { SchoolScene } from "./no-backup-2d/scenes/School";
import { DecisionScene, EveningScene } from "./no-backup-2d/scenes/Evening";
import { CtaScene } from "./no-backup-2d/scenes/Cta";
import { Nb2Subtitles } from "./no-backup-2d/Subtitles";

export type BalaGoNoBackup2DProps = {
  // Заполняется в calculateMetadata из public/audio/no-backup-2d/manifest.json.
  readonly manifest: Nb2Manifest;
  readonly preview?: boolean;
};

const SCENES: Record<Nb2SceneId, React.FC> = {
  prologue: PrologueScene,
  reassure: EveningScene,
  search: SearchScene,
  drive: DriveScene,
  school: SchoolScene,
  evening: ReflectionScene,
  decision: DecisionScene,
  cta: CtaScene,
};

// Одиннадцатый ролик в 2D: «Бүгүн алмаштыра турган киши жок» — ровно 120 с.
// Сцены стоят на фиксированной шкале (script.ts), реплики — в моменты at.
export const BalaGoNoBackup2D: React.FC<BalaGoNoBackup2DProps> = ({ manifest, preview = false }) => {
  const cues = useMemo(() => buildNb2Cues(manifest), [manifest]);
  const fps = NB2_VIDEO.fps;
  return (
    <CuesContext.Provider value={cues}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {NB2_SCENES.map((sc) => {
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
        <Nb2Audio cues={cues} />
        {/* субтитры — в обычном финальном рендере */}
        <Nb2Subtitles cues={cues} />
        {/* служебная метка — только в черновом просмотре */}
        {preview ? <div style={{ position: "absolute", top: 164, left: 72, right: 72, background: "rgba(20,35,65,0.82)", borderRadius: 20, padding: "14px 20px", color: "#FFFFFF", textAlign: "center", fontFamily: "Nunito, sans-serif", fontSize: 34, fontWeight: 700 }}>Алдын ала көрүнүш · Үн даярдалууда</div> : null}
      </AbsoluteFill>
    </CuesContext.Provider>
  );
};
