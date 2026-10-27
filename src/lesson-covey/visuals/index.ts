// Реестр анимированных сцен BM-022: kind из сценария → компонент.
import type React from "react";
import { GlassesView, GooseScene, MapScene, Maturity, Plaster, Venn } from "./frame";
import { Circles, Corridor, Gap, Language, Stick, Weather } from "./h1";
import { Centers, Compass, Jubilee, Jungle, Ladder, Twice } from "./h2";
import { Delegate, Matrix, Week, YesNo } from "./h3";
import { Ethos, Levels, Optician, Oxygen, Talk } from "./h5";
import { Animals, Forces, Synergy, Triangle, Trust } from "./h6";
import { Experiment, Finale, Four, Limits, Questions, Sand, Saw, Spiral } from "./h7";
import type { VisualProps } from "./kit";
import { BigQuestion, Lanes, Rush } from "./lanes";
import { Agreement, Bank, Courage, Horses, NoDeal, Paradigms } from "./trust";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  rush: Rush, bigQuestion: BigQuestion, lanes: Lanes,
  plaster: Plaster, map: MapScene, glassesView: GlassesView, venn: Venn, maturity: Maturity, goose: GooseScene,
  gap: Gap, weather: Weather, language: Language, circles: Circles, corridor: Corridor, stick: Stick,
  ladder: Ladder, jungle: Jungle, twice: Twice, jubilee: Jubilee, compass: Compass, centers: Centers,
  matrix: Matrix, yesno: YesNo, week: Week, delegate: Delegate,
  bank: Bank, paradigms: Paradigms, horses: Horses, courage: Courage, nodeal: NoDeal, agreement: Agreement,
  optician: Optician, levels: Levels, talk: Talk, oxygen: Oxygen, ethos: Ethos,
  synergy: Synergy, trust: Trust, triangle: Triangle, forces: Forces, animals: Animals,
  saw: Saw, four: Four, sand: Sand, spiral: Spiral, limits: Limits, experiment: Experiment, questions: Questions, finale: Finale,
};
