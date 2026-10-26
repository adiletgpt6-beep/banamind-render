// Сцены ролика по порядку шкалы (script.ts → KM2_SCENE_SPECS).
import type { Km2SceneId } from "../script";
import { HookScene } from "./Hook";
import { WorkScene } from "./Work";
import { NannyScene } from "./Nanny";
import { EveningScene } from "./Evening";
import { PhoneDownScene } from "./PhoneDown";
import { ThirdBScene } from "./ThirdB";
import { BalagoScene } from "./Balago";
import { RequestScene } from "./Request";
import { ToyCarScene } from "./ToyCar";
import { EntranceScene, IntroduceScene, MorningScene } from "./School30";
import { ContactScene } from "./Contact";

export const SCENES: Record<Km2SceneId, React.FC> = {
  hook: HookScene,
  work: WorkScene,
  nanny: NannyScene,
  evening: EveningScene,
  phoneDown: PhoneDownScene,
  thirdB: ThirdBScene,
  balago: BalagoScene,
  request: RequestScene,
  toyCar: ToyCarScene,
  morning: MorningScene,
  introduce: IntroduceScene,
  entrance: EntranceScene,
  contact: ContactScene,
};
