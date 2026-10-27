// Сцены ролика по порядку (см. TE2_SCENE_SPECS в script.ts).
import type { Te2SceneId } from "../script";
import { NamesScene } from "./Names";
import { MemoryScene } from "./Memory";
import { OfficeScene } from "./Office";
import { DaysScene } from "./Days";
import { DinnerScene } from "./Dinner";
import { NoteScene } from "./Note";
import { HeardScene } from "./Heard";
import { SitScene } from "./Sit";
import { PeopleScene } from "./People";
import { CalendarsScene } from "./Calendars";
import { SearchScene } from "./Search";
import { FormScene } from "./Form";
import { BoxScene } from "./Box";
import { PromiseScene } from "./Promise";
import { ContactScene } from "./Contact";

export const SCENES: Record<Te2SceneId, React.FC> = {
  names: NamesScene,
  memory: MemoryScene,
  office: OfficeScene,
  days: DaysScene,
  dinner: DinnerScene,
  note: NoteScene,
  heard: HeardScene,
  sit: SitScene,
  people: PeopleScene,
  calendars: CalendarsScene,
  search: SearchScene,
  form: FormScene,
  box: BoxScene,
  promise: PromiseScene,
  contact: ContactScene,
};
