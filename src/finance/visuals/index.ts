import type React from "react";
import { Alex, Budget, Compare, Equation, Hook, Hour, HourPrice, Roadmap, Standing } from "./partA";
import { Assets, Leaks, Patterns, Quadrant, Trim } from "./partB";
import { Goals, HourUp, Outro, RealActivity, Recap, Scale, Today } from "./partC";

export const VISUALS: Record<string, React.FC> = {
  hook: Hook,
  roadmap: Roadmap,
  alex: Alex,
  standing: Standing,
  budget: Budget,
  equation: Equation,
  hour: Hour,
  hourPrice: HourPrice,
  compare: Compare,
  quadrant: Quadrant,
  assets: Assets,
  patterns: Patterns,
  leaks: Leaks,
  trim: Trim,
  goals: Goals,
  hourUp: HourUp,
  realActivity: RealActivity,
  scale: Scale,
  recap: Recap,
  today: Today,
  outro: Outro,
};
