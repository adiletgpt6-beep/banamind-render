// Сцены фильма по порядку (см. EL_SCENE_SPECS в script.ts).
import type { ElSceneId } from "../script";
import { ArrivalScene } from "./Arrival";
import { AskScene } from "./Ask";
import { LineScene } from "./Line";
import { FamilyScene } from "./Family";
import { BlockScene } from "./Block";
import { CandidatesScene } from "./Candidates";
import { DeleteScene } from "./Delete";
import { ReadingScene } from "./Reading";
import { ToyScene } from "./Toy";
import { QuestionScene } from "./Question";
import { SplitScene } from "./Split";
import { BalagoScene } from "./Balago";
import { TrialScene } from "./Trial";
import { BookmarkScene } from "./Bookmark";
import { CtaScene } from "./Cta";

export const SCENES: Record<ElSceneId, React.FC> = {
  line: LineScene,
  family: FamilyScene,
  block: BlockScene,
  candidates: CandidatesScene,
  arrival: ArrivalScene,
  ask: AskScene,
  reading: ReadingScene,
  toy: ToyScene,
  question: QuestionScene,
  split: SplitScene,
  balago: BalagoScene,
  trial: TrialScene,
  delete: DeleteScene,
  bookmark: BookmarkScene,
  cta: CtaScene,
};
