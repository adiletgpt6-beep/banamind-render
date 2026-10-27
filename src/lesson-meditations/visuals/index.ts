// Реестр анимированных схем фильма BM-012: kind из сценария → компонент.
import type React from "react";
import type { VisualProps } from "../../lesson-traktat/visuals/kit";
import { CriticScale, EmeraldSpring, HandsTogether, KindShield, LookInside, MeetingCritic, MirrorAnger, RulesList } from "./anger";
import { BedMorning, HonestPain, InnerCitadel, JudgeFilter, RainBus, ReturnSwing, TwoCircles } from "./control";
import { DanubeMap, LifeLine, ModestRuler, RulerDeeds, StoaColumns, TeachersTree, TwelveScrolls, Voices } from "./diary";
import { BeGood, Finale, NightNotebook, Recap, TwoRules } from "./end";
import { CaesarNot, EarthPoint, EmeraldPraise, LikesPhone, OpinionScale, PleaseWhom, PurpleRobe } from "./fame";
import { BookIntro, DayMap, TabletQuote, Teaser, TentNight } from "./intro";
import { CucumberThorns, FireLamp, MedicineReturn, ObstacleWay, OneStep, PlanCrash, WallHelp, WrestlerDancer } from "./obstacle";
import { BranchGraft, BusyExcuse, EyeFeet, HiveBee, PassBy, VineHorseBee, VirtuesNotice } from "./service";
import { BreadCracks, EveningCall, FullAttention, FutureBridge, LampShine, PresentDot, RiverTime } from "./time";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  tentNight: TentNight, tabletQuote: TabletQuote, teaser: Teaser, bookIntro: BookIntro, dayMap: DayMap,
  twelveScrolls: TwelveScrolls, danubeMap: DanubeMap, lifeLine: LifeLine, rulerDeeds: RulerDeeds, voices: Voices, stoaColumns: StoaColumns, teachersTree: TeachersTree, modestRuler: ModestRuler,
  bedMorning: BedMorning, rainBus: RainBus, twoCircles: TwoCircles, judgeFilter: JudgeFilter, honestPain: HonestPain, innerCitadel: InnerCitadel, returnSwing: ReturnSwing,
  meetingCritic: MeetingCritic, handsTogether: HandsTogether, mirrorAnger: MirrorAnger, rulesList: RulesList, kindShield: KindShield, criticScale: CriticScale, lookInside: LookInside, emeraldSpring: EmeraldSpring,
  passBy: PassBy, busyExcuse: BusyExcuse, vineHorseBee: VineHorseBee, hiveBee: HiveBee, branchGraft: BranchGraft, virtuesNotice: VirtuesNotice, eyeFeet: EyeFeet,
  likesPhone: LikesPhone, emeraldPraise: EmeraldPraise, earthPoint: EarthPoint, purpleRobe: PurpleRobe, caesarNot: CaesarNot, opinionScale: OpinionScale, pleaseWhom: PleaseWhom,
  planCrash: PlanCrash, obstacleWay: ObstacleWay, fireLamp: FireLamp, cucumberThorns: CucumberThorns, medicineReturn: MedicineReturn, wallHelp: WallHelp, wrestlerDancer: WrestlerDancer, oneStep: OneStep,
  eveningCall: EveningCall, presentDot: PresentDot, riverTime: RiverTime, fullAttention: FullAttention, futureBridge: FutureBridge, breadCracks: BreadCracks, lampShine: LampShine,
  nightNotebook: NightNotebook, recap: Recap, twoRules: TwoRules, beGood: BeGood, finale: Finale,
};
