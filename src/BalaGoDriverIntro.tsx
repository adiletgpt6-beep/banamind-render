import {
  DRIVER_SCENE_PLAN,
  DRIVER_SFX_CUES,
  DRIVER_TEXT,
  VIDEOS,
} from "./config";
import { SpeechVideo, type SceneDef } from "./SpeechVideo";
import { IntroScene } from "./driver-intro/IntroScene";
import { KidsScene } from "./driver-intro/KidsScene";
import { CarScene } from "./scenes/CarScene";
import { CtaScene } from "./scenes/CtaScene";
import type { NarrationManifest } from "./timeline";

export type BalaGoDriverIntroProps = {
  // Заполняется в calculateMetadata из public/audio/driver-intro/manifest.json.
  readonly manifest: NarrationManifest;
};

const CareScene: React.FC = () => (
  <CarScene sceneId="care" features={DRIVER_TEXT.care.features} />
);

const SCENES: Record<string, SceneDef> = {
  intro: { component: IntroScene, name: "Вопрос и знакомство: Адилет, 5000+" },
  kids: { component: KidsScene, name: "Опыт с детьми: 120 000+" },
  care: { component: CareScene, name: "Машина и салон" },
  cta: { component: CtaScene, name: "Призыв: Баланы каттоо" },
};

// Второй ролик: «Кто стоит за BalaGo» — знакомство с водителем.
export const BalaGoDriverIntro: React.FC<BalaGoDriverIntroProps> = ({
  manifest,
}) => (
  <SpeechVideo
    manifest={manifest}
    plan={DRIVER_SCENE_PLAN}
    scenes={SCENES}
    voiceDir={VIDEOS["driver-intro"].voiceDir}
    sfxCues={DRIVER_SFX_CUES}
  />
);
