import {
  FOUNDER_MUSIC,
  FOUNDER_SCENE_PLAN,
  FOUNDER_SFX_CUES,
  VIDEOS,
} from "./config";
import { SpeechVideo, type SceneDef } from "./SpeechVideo";
import { ChatScene } from "./founder-story/ChatScene";
import { ContactScene } from "./founder-story/ContactScene";
import { FamilyScene } from "./founder-story/FamilyScene";
import { FormatScene } from "./founder-story/FormatScene";
import { FounderScene } from "./founder-story/FounderScene";
import { IdeaScene } from "./founder-story/IdeaScene";
import { PrelaunchScene } from "./founder-story/PrelaunchScene";
import { TrustScene } from "./founder-story/TrustScene";
import type { NarrationManifest } from "./timeline";

export type BalaGoFounderStoryProps = {
  // Заполняется в calculateMetadata из public/audio/founder-story/manifest.json.
  readonly manifest: NarrationManifest;
};

const SCENES: Record<string, SceneDef> = {
  family: { component: FamilyScene, name: "Төрт чоң киши" },
  chat: { component: ChatScene, name: "Баары бош эмес: чат → расписание" },
  trust: { component: TrustScene, name: "Кимге ишенсе болот?" },
  founder: { component: FounderScene, name: "Мен — Адилет" },
  idea: { component: IdeaScene, name: "Идея: BalaGo" },
  format: { component: FormatScene, name: "Үй → Мектеп → Үй" },
  prelaunch: { component: PrelaunchScene, name: "Даярданып жатабыз" },
  contact: { component: ContactScene, name: "Финал: шилтеме + WhatsApp" },
};

const spec = VIDEOS["founder-story"];

// Пятый ролик: «Почему я создаю BalaGo» — личная история основателя, 60 с.
export const BalaGoFounderStory: React.FC<BalaGoFounderStoryProps> = ({
  manifest,
}) => (
  <SpeechVideo
    manifest={manifest}
    plan={FOUNDER_SCENE_PLAN}
    scenes={SCENES}
    voiceDir={spec.voiceDir}
    sfxCues={FOUNDER_SFX_CUES}
    timing={spec.timing}
    music={FOUNDER_MUSIC}
  />
);
