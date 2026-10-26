import { AUDIO, SCENE_PLAN, SFX_CUES } from "./config";
import { SpeechVideo, type SceneDef } from "./SpeechVideo";
import { BrandScene } from "./scenes/BrandScene";
import { CarScene } from "./scenes/CarScene";
import { CtaScene } from "./scenes/CtaScene";
import { DriverScene } from "./scenes/DriverScene";
import { HookScene } from "./scenes/HookScene";
import { PromiseScene } from "./scenes/PromiseScene";
import { RouteScene } from "./scenes/RouteScene";
import type { NarrationManifest } from "./timeline";

export type BalaGoPromoProps = {
  // Заполняется в calculateMetadata из public/audio/voice/manifest.json.
  readonly manifest: NarrationManifest;
};

const SCENES: Record<string, SceneDef> = {
  hook: { component: HookScene, name: "Крючок: утро родителя" },
  brand: { component: BrandScene, name: "БалаГо — балдар үчүн такси" },
  route: { component: RouteScene, name: "Маршрут ҮЙ → МЕКТЕП → ҮЙ" },
  driver: { component: DriverScene, name: "Водитель: опыт" },
  car: { component: CarScene, name: "Машина и салон" },
  promise: { component: PromiseScene, name: "Тынчтык жана камкордук" },
  cta: { component: CtaScene, name: "Призыв: Баланы каттоо" },
};

export const BalaGoPromo: React.FC<BalaGoPromoProps> = ({ manifest }) => (
  <SpeechVideo
    manifest={manifest}
    plan={SCENE_PLAN}
    scenes={SCENES}
    voiceDir={AUDIO.voiceDir}
    sfxCues={SFX_CUES}
  />
);
