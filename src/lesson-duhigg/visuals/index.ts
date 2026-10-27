// Реестр анимированных сцен BM-035: kind из сценария → компонент.
import type React from "react";
import { BigQuestion, Compare, DotImage, Finale, Limits, Quote, Steps } from "./core";
import type { VisualProps } from "./kit";
import { City, Diary, Loop, Phone } from "./loop";
import { Anticipation, Brain, Maze, Product, Walk } from "./mind";
import { Boycott, Cart, Keystone, Network, Paper, Plates, Playlist, Pool, Protocol, Truce, Water } from "./world";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  quote: Quote,
  bigQuestion: BigQuestion,
  dots: DotImage,
  compare: Compare,
  limits: Limits,
  steps: Steps,
  finale: Finale,
  loop: Loop,
  phone: Phone,
  city: City,
  diary: Diary,
  brain: Brain,
  maze: Maze,
  walk: Walk,
  anticipation: Anticipation,
  product: Product,
  keystone: Keystone,
  plates: Plates,
  truce: Truce,
  cart: Cart,
  playlist: Playlist,
  network: Network,
  boycott: Boycott,
  paper: Paper,
  water: Water,
  protocol: Protocol,
  pool: Pool,
};
