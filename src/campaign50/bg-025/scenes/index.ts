// Реестр сцен: компонент и звуковые эффекты (кадры от начала сцены).
import type { Bg25SceneId } from "../script";
import type { SceneSfx } from "../sfx";
import { CtaScene, ctaSfx } from "./Cta";
import { HookScene, hookSfx } from "./Hook";
import { Step1Scene, step1Sfx } from "./Step1";
import { Step2Scene, step2Sfx } from "./Step2";
import { Step3Scene, step3Sfx } from "./Step3";
import { Step4Scene, step4Sfx } from "./Step4";
import { Step56Scene, step56Sfx } from "./Step56";

export const SCENES: Record<Bg25SceneId, { readonly Scene: React.FC; readonly sfx: SceneSfx }> = {
  hook: { Scene: HookScene, sfx: hookSfx },
  step1: { Scene: Step1Scene, sfx: step1Sfx },
  step2: { Scene: Step2Scene, sfx: step2Sfx },
  step3: { Scene: Step3Scene, sfx: step3Sfx },
  step4: { Scene: Step4Scene, sfx: step4Sfx },
  step56: { Scene: Step56Scene, sfx: step56Sfx },
  cta: { Scene: CtaScene, sfx: ctaSfx },
};
