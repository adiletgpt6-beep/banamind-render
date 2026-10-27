// Сцены ролика по порядку шкалы (script.ts → SU2_SCENE_SPECS).
import type { Su2SceneId } from "../script";
import { CalendarScene } from "./Calendar";
import { SpecialScene } from "./Special";
import { MorningScene } from "./Morning";
import { OfficeScene } from "./Office";
import { GrandmaScene } from "./Grandma";
import { WednesdayScene } from "./Wednesday";
import { MeetingScene } from "./Meeting";
import { DinnerScene } from "./Dinner";
import { WhyScene } from "./Why";
import { ShowDadScene } from "./ShowDad";
import { MemoryScene } from "./Memory";
import { SearchScene } from "./Search";
import { SharedScene } from "./Shared";
import { FridgeScene } from "./Fridge";
import { ContactScene } from "./Contact";

export const SCENES: Record<Su2SceneId, React.FC> = {
  calendar: CalendarScene,
  special: SpecialScene,
  morning: MorningScene,
  office: OfficeScene,
  grandma: GrandmaScene,
  wednesday: WednesdayScene,
  meeting: MeetingScene,
  dinner: DinnerScene,
  why: WhyScene,
  showDad: ShowDadScene,
  memory: MemoryScene,
  search: SearchScene,
  shared: SharedScene,
  fridge: FridgeScene,
  contact: ContactScene,
};
