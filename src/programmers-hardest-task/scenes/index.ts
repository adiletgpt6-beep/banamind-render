// Реестр сцен фильма №35: компонент и звуковые события каждой сцены.
import type { PhtSceneId } from "../script";
import type { SceneSound } from "../sound";
import { HookScene, sound as hookSound } from "./S01Hook";
import { ParentsScene, sound as parentsSound } from "./S02Parents";
import { DemoScene, sound as demoSound } from "./S03Demo";
import { MondayScene, sound as mondaySound } from "./S04Monday";
import { TuesdayScene, sound as tuesdaySound } from "./S05Tuesday";
import { WednesdayScene, sound as wednesdaySound } from "./S06Wednesday";
import { ThursdayScene, sound as thursdaySound } from "./S07Thursday";
import { LoadScene, sound as loadSound } from "./S08Load";
import { FridayScene, sound as fridaySound } from "./S09Friday";
import { QuestionScene, sound as questionSound } from "./S10Question";
import { NextStepScene, sound as nextStepSound } from "./S11NextStep";
import { BalaGoPageScene, sound as balagoSound } from "./S12BalaGo";
import { RequestScene, sound as requestSound } from "./S13Request";
import { TaskScene, sound as taskSound } from "./S14Task";
import { GameScene, sound as gameSound } from "./S15Game";
import { CtaScene, sound as ctaSound } from "./S16Cta";

export const SCENES: Record<PhtSceneId, { readonly component: React.FC; readonly sound: SceneSound }> = {
  hook: { component: HookScene, sound: hookSound },
  parents: { component: ParentsScene, sound: parentsSound },
  demo: { component: DemoScene, sound: demoSound },
  monday: { component: MondayScene, sound: mondaySound },
  tuesday: { component: TuesdayScene, sound: tuesdaySound },
  wednesday: { component: WednesdayScene, sound: wednesdaySound },
  thursday: { component: ThursdayScene, sound: thursdaySound },
  load: { component: LoadScene, sound: loadSound },
  friday: { component: FridayScene, sound: fridaySound },
  question: { component: QuestionScene, sound: questionSound },
  nextStep: { component: NextStepScene, sound: nextStepSound },
  balago: { component: BalaGoPageScene, sound: balagoSound },
  request: { component: RequestScene, sound: requestSound },
  task: { component: TaskScene, sound: taskSound },
  game: { component: GameScene, sound: gameSound },
  cta: { component: CtaScene, sound: ctaSound },
};

export const SOUNDS: Record<PhtSceneId, SceneSound> = Object.fromEntries(Object.entries(SCENES).map(([k, v]) => [k, v.sound])) as Record<PhtSceneId, SceneSound>;
