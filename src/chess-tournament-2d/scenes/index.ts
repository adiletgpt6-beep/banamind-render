// Сцены ролика по порядку (см. CH2_SCENE_SPECS в script.ts).
import type { Ch2SceneId } from "../script";
import { HookScene } from "./Hook";
import { ClubScene } from "./Club";
import { OfferScene } from "./Offer";
import { RoutineScene } from "./Routine";
import { TimeScene } from "./Time";
import { MessageScene } from "./Message";
import { DinnerScene } from "./Dinner";
import { LightScene } from "./Light";
import { ReasonScene } from "./Reason";
import { HeardScene } from "./Heard";
import { CalendarsScene } from "./Calendars";
import { SearchScene } from "./Search";
import { CoachScene } from "./Coach";
import { MoveScene } from "./Move";
import { ContactScene } from "./Contact";

export const SCENES: Record<Ch2SceneId, React.FC> = {
  hook: HookScene,
  club: ClubScene,
  offer: OfferScene,
  routine: RoutineScene,
  time: TimeScene,
  message: MessageScene,
  dinner: DinnerScene,
  light: LightScene,
  reason: ReasonScene,
  heard: HeardScene,
  calendars: CalendarsScene,
  search: SearchScene,
  coach: CoachScene,
  move: MoveScene,
  contact: ContactScene,
};
