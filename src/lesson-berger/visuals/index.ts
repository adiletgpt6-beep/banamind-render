// Реестр анимированных сцен BM-038: kind из сценария → компонент.
import type React from "react";
import type { VisualProps } from "./kit";
import { Blender, BookIntro, ChamberScene, Hook, Joke, Lab, Names, Seven, Steak, TalkStats } from "./scenesA";
import { Booth, Coffee, Curves, Fat, Holes, Invite, Limit, Mars, Money, Roaches, Secret, SelfTalk, Status, ThreeWays, Tray, Weekly } from "./scenesB";
import { Arousal, Awe, Backfire, Guitar, Lecture, Mustache, Nyt, Proof, Running, Search, Signature, Visible } from "./scenesC";
import { Barn, Corn, Deals, Dove, Finale, Fire, Horse, Mistakes, Narrow, Panda, Pool, Recap, Salon, Takeaways, Telephone, Truth, Vessel } from "./scenesD";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hook: Hook, steak: Steak, names: Names, bookIntro: BookIntro, talkStats: TalkStats, seven: Seven, joke: Joke, blender: Blender, lab: Lab, chamber: ChamberScene,
  booth: Booth, secret: Secret, selfTalk: SelfTalk, roaches: Roaches, threeWays: ThreeWays, invite: Invite, status: Status, money: Money, limit: Limit,
  curves: Curves, weekly: Weekly, mars: Mars, coffee: Coffee, tray: Tray, fat: Fat, holes: Holes,
  nyt: Nyt, awe: Awe, arousal: Arousal, search: Search, guitar: Guitar, running: Running,
  visible: Visible, proof: Proof, lecture: Lecture, mustache: Mustache, signature: Signature, backfire: Backfire,
  corn: Corn, barn: Barn, narrow: Narrow, deals: Deals, truth: Truth,
  horse: Horse, vessel: Vessel, dove: Dove, pool: Pool, panda: Panda, telephone: Telephone,
  salon: Salon, recap: Recap, fire: Fire, mistakes: Mistakes, finale: Finale, takeaways: Takeaways,
};
