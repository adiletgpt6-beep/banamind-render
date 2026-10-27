// Реестр анимированных сцен BM-031: kind из сценария → компонент.
import type React from "react";
import { Compare, DotsQ, Phrase } from "./generic";
import type { VisualProps } from "./kit";
import { Board, BookIntro, Chain, Chapters, CompassScene, Fear, Finale, Gifts, House, Labels, Letters, Mirror, Outro, PartTitle, Points, Scale, SceneCard, Tokens, Trio } from "./scenes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  labels: Labels,
  compass: CompassScene,
  bookIntro: BookIntro,
  chapters: Chapters,
  partTitle: PartTitle,
  house: House,
  letters: Letters,
  card: SceneCard,
  scale: Scale,
  tokens: Tokens,
  board: Board,
  mirror: Mirror,
  gifts: Gifts,
  chain: Chain,
  trio: Trio,
  fear: Fear,
  points: Points,
  finale: Finale,
  outro: Outro,
  phrase: Phrase,
  compare: Compare,
  dotsQ: DotsQ,
};
