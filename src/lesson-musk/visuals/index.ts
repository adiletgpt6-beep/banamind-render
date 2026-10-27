// Реестр анимированных сцен BM-029: kind из сценария → компонент.
import type React from "react";
import { BankBuild, CodeRewrite, ControlTrade, Exit, Manage, MoneyBurn, Ouster, Versions, Zip2Map } from "./biz";
import { BatteryPack, Budget, Decisions, Founders, FundingChain, Gigafactory, Prototype, SalesTurn, Supercharger } from "./car";
import { Access, Blastar, Caution, Journey, Lawsuit, Seeds, Voices } from "./early";
import { Balance, Critics, FieldTheory, Letter2013, Mars, PeopleCost } from "./horizon";
import type { VisualProps } from "./kit";
import { Assemble, Conclusion, Desks, Finale, Forecasts, Hook } from "./model";
import { Blame, Choice, Dragon, InHouse, Island, Launches, NoDemand, Oasis, Pressure, PriceCut, Rescue, Spreadsheet, TestStand } from "./space";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  hook: Hook,
  desks: Desks,
  assemble: Assemble,
  access: Access,
  voices: Voices,
  lawsuit: Lawsuit,
  blastar: Blastar,
  caution: Caution,
  journey: Journey,
  seeds: Seeds,
  zip2map: Zip2Map,
  codeRewrite: CodeRewrite,
  controlTrade: ControlTrade,
  manage: Manage,
  exit: Exit,
  bankBuild: BankBuild,
  moneyBurn: MoneyBurn,
  ouster: Ouster,
  versions: Versions,
  oasis: Oasis,
  spreadsheet: Spreadsheet,
  inhouse: InHouse,
  testStand: TestStand,
  island: Island,
  launches: Launches,
  blame: Blame,
  founders: Founders,
  batteryPack: BatteryPack,
  budget: Budget,
  choice: Choice,
  rescue: Rescue,
  priceCut: PriceCut,
  pressure: Pressure,
  noDemand: NoDemand,
  dragon: Dragon,
  prototype: Prototype,
  fundingChain: FundingChain,
  decisions: Decisions,
  supercharger: Supercharger,
  salesTurn: SalesTurn,
  fieldTheory: FieldTheory,
  letter2013: Letter2013,
  mars: Mars,
  gigafactory: Gigafactory,
  peopleCost: PeopleCost,
  balance: Balance,
  critics: Critics,
  conclusion: Conclusion,
  forecasts: Forecasts,
  finale: Finale,
};
