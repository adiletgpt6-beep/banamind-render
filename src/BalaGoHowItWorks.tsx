import { HOW_SCENE_PLAN, HOW_SFX_CUES, VIDEOS } from "./config";
import { SpeechVideo, type SceneDef } from "./SpeechVideo";
import { RegisterScene } from "./how-it-works/RegisterScene";
import { RouteStepScene } from "./how-it-works/RouteStepScene";
import { StepsScene } from "./how-it-works/StepsScene";
import { CtaScene } from "./scenes/CtaScene";
import type { NarrationManifest } from "./timeline";

export type BalaGoHowItWorksProps = {
  // Заполняется в calculateMetadata из public/audio/how-it-works/manifest.json.
  readonly manifest: NarrationManifest;
};

const ToSchoolScene: React.FC = () => (
  <RouteStepScene
    sceneId="toSchool"
    segment="step2"
    n={2}
    direction="toSchool"
    startWord="үйдөн"
    endWord="жеткиребиз"
  />
);

const ToHomeScene: React.FC = () => (
  <RouteStepScene
    sceneId="toHome"
    segment="step3"
    n={3}
    direction="toHome"
    startWord="кайра"
    endWord="келебиз"
  />
);

const SCENES: Record<string, SceneDef> = {
  steps: { component: StepsScene, name: "BalaGo кантип иштейт? — 3 кадам" },
  register: { component: RegisterScene, name: "1. Баланы каттаңыз" },
  toSchool: { component: ToSchoolScene, name: "2. Үйдөн мектепке" },
  toHome: { component: ToHomeScene, name: "3. Мектептен кайра үйгө" },
  cta: { component: CtaScene, name: "Призыв: Баланы каттоо" },
};

const spec = VIDEOS["how-it-works"];

// Третий ролик: «BalaGo кантип иштейт?» — три шага.
export const BalaGoHowItWorks: React.FC<BalaGoHowItWorksProps> = ({
  manifest,
}) => (
  <SpeechVideo
    manifest={manifest}
    plan={HOW_SCENE_PLAN}
    scenes={SCENES}
    voiceDir={spec.voiceDir}
    sfxCues={HOW_SFX_CUES}
    timing={spec.timing}
  />
);
