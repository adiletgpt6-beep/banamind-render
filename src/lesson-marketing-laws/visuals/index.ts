// Реестр анимированных схем фильма BM-011: kind из сценария → компонент.
import type React from "react";
import type { VisualProps } from "../../lesson-traktat/visuals/kit";
import { BakeryFail, EgoBalloon, FailFast, Forecast, Frontline, XeroxResearch } from "./ego";
import { Epilogue, Finale, FiveQuestions, Limits, Recap } from "./final";
import { AltairApple, BakeryCategory, CategoryMind, Dwarfs, Earhart, FirstVsBest, Generic, MindLock } from "./first";
import { Amoeba, BakeryTent, Beetle, Closet, LineSauce, Sacrifice, TargetMarket } from "./focus";
import { BakeryHype, Fuel, HypeMeter, WaveTide } from "./hype";
import { Atlantic, BookIntro, LawsBoardV, Teaser } from "./intro";
import { Attributes, BakeryLadder, Ladder, Opposite, Seven, TwoHorses } from "./ladder";
import { BakeryCandor, BakeryDiscount, Candor, OneMove, SaleYoyo } from "./time";
import { BakeryWord, BurgerFast, HondaTwo, OneWord, QualityEveryone, RealityScale, TasteTest, WordTaken } from "./word";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  atlantic: Atlantic, teaser: Teaser, bookIntro: BookIntro, lawsBoard: LawsBoardV,
  firstVsBest: FirstVsBest, generic: Generic, earhart: Earhart, dwarfs: Dwarfs, categoryMind: CategoryMind, bakeryCategory: BakeryCategory, altairApple: AltairApple, mindLock: MindLock,
  hondaTwo: HondaTwo, tasteTest: TasteTest, realityScale: RealityScale, oneWord: OneWord, qualityEveryone: QualityEveryone, bakeryWord: BakeryWord, wordTaken: WordTaken, burgerFast: BurgerFast,
  ladder: Ladder, seven: Seven, twoHorses: TwoHorses, opposite: Opposite, attributes: Attributes, bakeryLadder: BakeryLadder,
  amoeba: Amoeba, beetle: Beetle, closet: Closet, lineSauce: LineSauce, bakeryTent: BakeryTent, sacrifice: Sacrifice, targetMarket: TargetMarket,
  saleYoyo: SaleYoyo, bakeryDiscount: BakeryDiscount, candor: Candor, bakeryCandor: BakeryCandor, oneMove: OneMove,
  forecast: Forecast, xeroxResearch: XeroxResearch, egoBalloon: EgoBalloon, frontline: Frontline, failFast: FailFast, bakeryFail: BakeryFail,
  hypeMeter: HypeMeter, waveTide: WaveTide, fuel: Fuel, bakeryHype: BakeryHype,
  epilogue: Epilogue, limits: Limits, recap: Recap, fiveQuestions: FiveQuestions, finale: Finale,
};
