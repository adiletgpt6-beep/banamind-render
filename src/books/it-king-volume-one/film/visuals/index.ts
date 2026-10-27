// Реестр сцен BM-020: kind из сценария → компонент.
import type React from "react";
import { Cycle, Homes, Manuscript, MemoryInvasion, Silence1741, SixCalls } from "./calls";
import { ChainConfess, Dam, Domino, Evidence, FiveNodes, Interrupted } from "./dam";
import type { VisualProps } from "./dots";
import { BoatDetail, BoatGuilt, BridgeNoHelp, Cellar, HumanCruelty, LookAway, Witnesses } from "./early";
import { Answer, BigQuestion, BoatHook, FinalMap, TownMap, TwoTimelines, VolumeBorder } from "./hook";
import { Bike, BrotherRoom, FearMasks, IceCouch, Library, LoneFigure, Newspaper, OrderCrack, PassingCar, Secret, Simultaneity, ThreeLaugh } from "./kids";
import { Club, Conclusion, Generations, GoodAndSilence, Hushed, MirrorRepeat, PhoneHangup, Sink, Traces } from "./late";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  boatHook: BoatHook,
  townMap: TownMap,
  volumeBorder: VolumeBorder,
  bigQuestion: BigQuestion,
  twoTimelines: TwoTimelines,
  boatDetail: BoatDetail,
  boatGuilt: BoatGuilt,
  lookAway: LookAway,
  cellar: Cellar,
  bridgeNoHelp: BridgeNoHelp,
  humanCruelty: HumanCruelty,
  witnesses: Witnesses,
  sixCalls: SixCalls,
  memoryInvasion: MemoryInvasion,
  homes: Homes,
  manuscript: Manuscript,
  cycle: Cycle,
  silence1741: Silence1741,
  loneFigure: LoneFigure,
  passingCar: PassingCar,
  secret: Secret,
  library: Library,
  bike: Bike,
  iceCouch: IceCouch,
  brotherRoom: BrotherRoom,
  threeLaugh: ThreeLaugh,
  newspaper: Newspaper,
  fearMasks: FearMasks,
  simultaneity: Simultaneity,
  orderCrack: OrderCrack,
  dam: Dam,
  fiveNodes: FiveNodes,
  chainConfess: ChainConfess,
  interrupted: Interrupted,
  domino: Domino,
  evidence: Evidence,
  sink: Sink,
  traces: Traces,
  mirrorRepeat: MirrorRepeat,
  phoneHangup: PhoneHangup,
  club: Club,
  hushed: Hushed,
  generations: Generations,
  goodAndSilence: GoodAndSilence,
  conclusion: Conclusion,
  answer: Answer,
  finalMap: FinalMap,
};

