// Реестр экспонатов: kind из сценария → компонент.
import type React from "react";
import { ButtonOffer, EndCard, HallCard, Hypothesis, Museum, Notice, Quote, Recap, RingMirror, Scales, SmallVsBig, Triad } from "./common";
import { BlindSpot, Blindfold, Bridge, Chain, Council, Fellowship, Galadriel, SamPack, Volunteer } from "./council";
import type { VisualProps } from "./kit";
import { Almost, Carry, Crown, Decoy, Doom, Duo, Gardens, Havens, Kneel, Oaths, SamChoice, Stairs, Stew, TwoVoices } from "./quest";
import { Bombadil, Cling, FireRing, GollumStory, Pity, Refuse, RingCall, Shire } from "./shire";
import { Brothers, Escalation, Gears, Orb, Road, TwoMaps, Voice } from "./war";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  button: ButtonOffer,
  ringMirror: RingMirror,
  smallVsBig: SmallVsBig,
  museum: Museum,
  notice: Notice,
  hallCard: HallCard,
  quote: Quote,
  hypothesis: Hypothesis,
  scales: Scales,
  triad: Triad,
  recap: Recap,
  endCard: EndCard,
  shire: Shire,
  pity: Pity,
  cling: Cling,
  fireRing: FireRing,
  gollumStory: GollumStory,
  ringCall: RingCall,
  bombadil: Bombadil,
  refuse: Refuse,
  council: Council,
  chain: Chain,
  blindSpot: BlindSpot,
  volunteer: Volunteer,
  fellowship: Fellowship,
  samPack: SamPack,
  blindfold: Blindfold,
  bridge: Bridge,
  galadriel: Galadriel,
  escalation: Escalation,
  road: Road,
  brothers: Brothers,
  twoMaps: TwoMaps,
  orb: Orb,
  gears: Gears,
  voice: Voice,
  twoVoices: TwoVoices,
  stew: Stew,
  stairs: Stairs,
  almost: Almost,
  samChoice: SamChoice,
  duo: Duo,
  crown: Crown,
  decoy: Decoy,
  oaths: Oaths,
  gardens: Gardens,
  carry: Carry,
  doom: Doom,
  kneel: Kneel,
  havens: Havens,
};
