import type { WfhSceneId } from "../script";
import { ParadoxScene } from "./Paradox";
import { WorkScene } from "./Work";
import { MorningScene } from "./Morning";
import { KeysScene } from "./Keys";
import { ContextScene } from "./Context";
import { LateScene } from "./Late";
import { DadPickupScene } from "./DadPickup";
import { FocusScene } from "./Focus";
import { ClosingScene } from "./Closing";
import { NotebookScene } from "./Notebook";
import { CalendarsScene } from "./Calendars";
import { SearchScene } from "./Search";
import { BookScene } from "./Book";
import { CardScene } from "./Card";

// Сцены фильма по порядку шкалы.
export const SCENES: Record<WfhSceneId, React.FC> = {
  paradox: ParadoxScene,
  work: WorkScene,
  morning: MorningScene,
  keys: KeysScene,
  context: ContextScene,
  late: LateScene,
  dadPickup: DadPickupScene,
  focus: FocusScene,
  closing: ClosingScene,
  notebook: NotebookScene,
  calendars: CalendarsScene,
  search: SearchScene,
  book: BookScene,
  card: CardScene,
};
