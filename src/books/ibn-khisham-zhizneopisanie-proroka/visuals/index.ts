// Реестр иллюстраций: kind из сценария → компонент. Список ключей — visuals/list.ts.
import type React from "react";
import type { VisualProps } from "./kit";
import { BookIntro, BlackStone, Chapter, ElephantScene, Hook, Landscape, Nomads, Zamzam } from "./scenes1";
import { BigWord, Boycott, Cards, Garden, Isra, MapScene, Quote, SunMoon } from "./scenes2";
import { Adhan, Aqaba, Bonds, Cave, DocumentScene, HorseScene, Mosque, NightRoom, Qibla } from "./scenes3";
import { Fires, Growth, KaabaIdols, Kneel, Necklace, Numbers, PledgeTree, Trench, Uhud } from "./scenes4";
import { Arafat, Curtain, Finale, Lamp, Recap } from "./scenes5";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hook: Hook,
  bookIntro: BookIntro,
  chapter: Chapter,
  landscape: Landscape,
  zamzam: Zamzam,
  elephant: ElephantScene,
  nomads: Nomads,
  cards: Cards,
  blackStone: BlackStone,
  cave: Cave,
  quote: Quote,
  sunMoon: SunMoon,
  bigWord: BigWord,
  map: MapScene,
  boycott: Boycott,
  garden: Garden,
  isra: Isra,
  aqaba: Aqaba,
  nightRoom: NightRoom,
  horse: HorseScene,
  mosque: Mosque,
  bonds: Bonds,
  document: DocumentScene,
  adhan: Adhan,
  qibla: Qibla,
  numbers: Numbers,
  necklace: Necklace,
  uhud: Uhud,
  trench: Trench,
  kneel: Kneel,
  pledgeTree: PledgeTree,
  growth: Growth,
  fires: Fires,
  kaabaIdols: KaabaIdols,
  arafat: Arafat,
  curtain: Curtain,
  lamp: Lamp,
  recap: Recap,
  finale: Finale,
};
