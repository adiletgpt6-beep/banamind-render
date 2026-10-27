import { TQ_MUSIC, TQ_SCENE_PLAN, TQ_SFX_CUES, VIDEOS } from "./config";
import { SpeechVideo, type SceneDef } from "./SpeechVideo";
import { AdiletScene } from "./trip-questions/AdiletScene";
import { ChangeScene } from "./trip-questions/ChangeScene";
import { IntroScene } from "./trip-questions/IntroScene";
import { InviteScene } from "./trip-questions/InviteScene";
import { RouteScene } from "./trip-questions/RouteScene";
import { WhoScene } from "./trip-questions/WhoScene";
import type { NarrationManifest } from "./timeline";

export type BalaGoTripQuestionsProps = {
  // Заполняется в calculateMetadata из public/audio/trip-questions/manifest.json.
  readonly manifest: NarrationManifest;
};

const SCENES: Record<string, SceneDef> = {
  tqIntro: { component: IntroScene, name: "Мектепке жол: үч суроо" },
  tqWho: { component: WhoScene, name: "1. Баланы ким жеткирет?" },
  tqRoute: { component: RouteScene, name: "2. Кайдан? Кайда? Качан?" },
  tqChange: { component: ChangeScene, name: "3. Кантип байланышасыз?" },
  tqAdilet: { component: AdiletScene, name: "Памятка + Мен — Адилет" },
  tqInvite: { component: InviteScene, name: "Финал: шилтеме + WhatsApp" },
};

const spec = VIDEOS["trip-questions"];

// Шестой ролик: «Мектепке жол: үч суроо» — памятка для родителей, 60 с.
export const BalaGoTripQuestions: React.FC<BalaGoTripQuestionsProps> = ({
  manifest,
}) => (
  <SpeechVideo
    manifest={manifest}
    plan={TQ_SCENE_PLAN}
    scenes={SCENES}
    voiceDir={spec.voiceDir}
    sfxCues={TQ_SFX_CUES}
    timing={spec.timing}
    music={TQ_MUSIC}
  />
);
