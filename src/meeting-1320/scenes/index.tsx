// Сцены ролика по порядку шкалы (script.ts → M13_SCENE_SPECS).
import type { M13SceneId } from "../script";
import type { M13Timeline } from "../timing";
import { CalendarScene, calendarSubTop } from "./Calendar";
import { NoticeScene, noticeSubTop } from "./Notice";
import { AskScene, askSubTop } from "./Ask";
import { DriveScene, driveSubTop } from "./Drive";
import { RevealScene, revealSubTop } from "./Reveal";
import { GrandmaScene, grandmaSubTop } from "./Grandma";
import { BackScene, backSubTop } from "./Back";
import { EveningScene, eveningSubTop } from "./Evening";
import { HomeScene, homeSubTop } from "./Home";
import { DrawingScene, drawingSubTop } from "./Drawing";
import { BrandScene, brandSubTop } from "./Brand";

export const SCENES: Record<M13SceneId, React.FC> = {
  calendar: CalendarScene,
  notice: NoticeScene,
  ask: AskScene,
  drive: DriveScene,
  reveal: RevealScene,
  grandma: GrandmaScene,
  back: BackScene,
  evening: EveningScene,
  home: HomeScene,
  drawing: DrawingScene,
  brand: BrandScene,
};

// Интервалы (абсолютные кадры), где субтитры стоят вверху кадра.
export const subTopIntervals = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => [
  ...calendarSubTop(tl),
  ...noticeSubTop(tl),
  ...askSubTop(tl),
  ...driveSubTop(tl),
  ...revealSubTop(tl),
  ...grandmaSubTop(tl),
  ...backSubTop(tl),
  ...eveningSubTop(tl),
  ...homeSubTop(tl),
  ...drawingSubTop(tl),
  ...brandSubTop(tl),
];
