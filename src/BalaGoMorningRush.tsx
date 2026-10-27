import {
  MORNING_MUSIC,
  MORNING_SCENE_PLAN,
  MORNING_SFX_CUES,
  VIDEOS,
} from "./config";
import { SpeechVideo, type SceneDef } from "./SpeechVideo";
import { AlarmScene } from "./morning-rush/AlarmScene";
import { BusyScene } from "./morning-rush/BusyScene";
import { LaunchScene } from "./morning-rush/LaunchScene";
import { MorningCtaScene } from "./morning-rush/MorningCtaScene";
import { PlanScene } from "./morning-rush/PlanScene";
import type { NarrationManifest } from "./timeline";

export type BalaGoMorningRushProps = {
  // Заполняется в calculateMetadata из public/audio/morning-rush/manifest.json.
  readonly manifest: NarrationManifest;
};

const SCENES: Record<string, SceneDef> = {
  alarm: {
    component: AlarmScene,
    name: "Будильник: Эртең менен шашып жатасызбы?",
  },
  busy: { component: BusyScene, name: "Жумуш · Мектеп · Жол" },
  launch: { component: LaunchScene, name: "BalaGo: даярданып жатабыз" },
  plan: { component: PlanScene, name: "Үй → Мектеп → Үй" },
  cta: { component: MorningCtaScene, name: "Призыв: алдын ала каттоо" },
};

const spec = VIDEOS["morning-rush"];

// Четвёртый ролик: «Утро родителей» — предварительная запись перед запуском.
export const BalaGoMorningRush: React.FC<BalaGoMorningRushProps> = ({
  manifest,
}) => (
  <SpeechVideo
    manifest={manifest}
    plan={MORNING_SCENE_PLAN}
    scenes={SCENES}
    voiceDir={spec.voiceDir}
    sfxCues={MORNING_SFX_CUES}
    timing={spec.timing}
    music={MORNING_MUSIC}
  />
);
