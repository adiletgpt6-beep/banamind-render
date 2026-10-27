// Реестр анимированных схем: kind из сценария → компонент.
import type React from "react";
import { FlyScene, LifeMix, OneMaker, Pharmacy } from "./causes";
import { Doctor, Goodbye, OneRoot, Recap, Spring, Village, WatchPen, WorldTree } from "./end";
import { BigQuestion, HookPharmacy, JourneyStart, Teaser, Trailer } from "./hook";
import { Ayah, BookScene, Chapter, FourRoads, Hello, ThreePhrases } from "./intro";
import { Atoms, Domes, Printing } from "./itself";
import type { VisualProps } from "./kit";
import { ArmyThreads, ArtNotArtist, FlowerPot, PalaceBook, PineSeed, RoadOpen, SoldierScene, Suns } from "./nature";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hello: Hello,
  hookPharmacy: HookPharmacy,
  teaser: Teaser,
  bigQuestion: BigQuestion,
  trailer: Trailer,
  journeyStart: JourneyStart,
  book: BookScene,
  ayah: Ayah,
  threePhrases: ThreePhrases,
  fourRoads: FourRoads,
  chapter: Chapter,
  pharmacy: Pharmacy,
  lifeMix: LifeMix,
  fly: FlyScene,
  oneMaker: OneMaker,
  atoms: Atoms,
  domes: Domes,
  printing: Printing,
  suns: Suns,
  flowerPot: FlowerPot,
  soldier: SoldierScene,
  pineSeed: PineSeed,
  palaceBook: PalaceBook,
  armyThreads: ArmyThreads,
  artNotArtist: ArtNotArtist,
  roadOpen: RoadOpen,
  watchPen: WatchPen,
  village: Village,
  worldTree: WorldTree,
  doctor: Doctor,
  oneRoot: OneRoot,
  spring: Spring,
  recap: Recap,
  goodbye: Goodbye,
};
