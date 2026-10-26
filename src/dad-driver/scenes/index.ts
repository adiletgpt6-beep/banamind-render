// Сцены ролика №32 и положение субтитров в каждой из них.
import type { SubPlace } from "../Subtitles";
import type { DdSceneId } from "../script";
import type { DdTimeline } from "../timing";
import type { SceneBeats } from "../sound";
import { HookScene } from "./Hook";
import { TaskScene, taskBeats } from "./Task";
import { WhyScene } from "./Why";
import { AskScene } from "./Ask";
import { ReplyScene } from "./Reply";
import { ModelScene, modelBeats } from "./Model";
import { CtaScene } from "./Cta";
import { RewriteScene, rewriteBeats } from "./Rewrite";
import { ReadScene, readBeats } from "./Read";
import { WeekScene } from "./Week";
import { ApplyScene, applyBeats } from "./Apply";
import { BlueprintScene, blueprintBeats } from "./Blueprint";
import { OfficeScene } from "./Office";
import { QuestionScene } from "./Question";

export type SceneDef = {
  readonly C: React.FC;
  // нижний край плашки субтитров (px кадра) в момент t сцены
  readonly sub?: (t: number, tl: DdTimeline) => SubPlace;
};

export const SCENES: Record<DdSceneId, SceneDef> = {
  hook: { C: HookScene },
  task: { C: TaskScene },
  ask: { C: AskScene },
  why: { C: WhyScene },
  reply: { C: ReplyScene },
  model: { C: ModelScene },
  blueprint: { C: BlueprintScene },
  office: { C: OfficeScene },
  question: { C: QuestionScene },
  week: { C: WeekScene },
  apply: { C: ApplyScene },
  rewrite: { C: RewriteScene },
  read: { C: ReadScene },
  cta: { C: CtaScene },
};

// Моменты действий сцен для звука (кадры сцены): сцены, у которых есть
// предметные звуки, отдают их здесь.
export const SCENE_BEATS = (tl: DdTimeline): Partial<Record<DdSceneId, SceneBeats>> => ({
  task: taskBeats(tl),
  model: modelBeats(tl),
  blueprint: blueprintBeats(tl),
  apply: applyBeats(tl),
  rewrite: rewriteBeats(tl),
  read: readBeats(tl),
});
