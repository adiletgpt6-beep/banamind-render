// Звуковые события фильма (кадры фильма). Моменты берутся из тех же
// констант, что и анимация сцен: ключи звенят, когда рука берёт связку,
// крышка — когда закрывается, страница — когда книга открывается.
// Звуки очень тихие; шагов нет ни отдельно, ни в фоне; без уведомлений.
import { WFH_SCENES, WFH_VIDEO, type WfhSceneId } from "./script";
import type { WfhCue } from "./timing";
import { lineFrames, sceneLen, wordFrame } from "./scenes/common";
import { BOOK_SHOTS } from "./scenes/Book";
import { CAL_SHOTS } from "./scenes/Calendars";
import { CLOSING_SHOTS, LID } from "./scenes/Closing";
import { CONTEXT_SHOTS } from "./scenes/Context";
import { DAD_SHOTS } from "./scenes/DadPickup";
import { FOCUS_SHOTS } from "./scenes/Focus";
import { KEYS_GRAB, KEYS_SHOTS } from "./scenes/Keys";
import { NOTEBOOK_SHOTS } from "./scenes/Notebook";
import { TAPS } from "./scenes/Search";
import { WORK_SHOTS } from "./scenes/Work";

export type WfhSfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };

const S = (id: WfhSceneId) => Math.round(WFH_SCENES.find((s) => s.id === id)!.from * WFH_VIDEO.fps);
const OWN = (n: string) => `audio/two-schedules-2d/sfx/${n}.mp3`; // общие бытовые звуки проекта
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;

export const wfhSfx = (cues: readonly WfhCue[]): WfhSfx[] => {
  const door1 = wordFrame(cues, "N01", "Болгону", "paradox") - 6;
  const F01 = lineFrames(cues, "F01", "late");
  const lateOut = sceneLen("late") - 92;
  const stand9 = LID.to + 14;
  const k4 = S("keys");
  return [
    // 01: тарелка на столешницу, дверь рабочей комнаты
    { at: S("paradox") + 146, src: OWN("plate"), volume: 0.12 },
    { at: S("paradox") + door1, src: OWN("door-open"), volume: 0.14 },
    // 02: щелчок мышью по строке, пиала на стол
    { at: S("work") + 78, src: COMMON("tap"), volume: 0.08 },
    { at: S("work") + WORK_SHOTS.desk[0] + 14, src: COMMON("typing"), volume: 0.05, dur: 2.6, fade: 0.3 },
    { at: S("work") + 290 + 44, src: OWN("cup"), volume: 0.1 },
    // 04: ключи, ремень, дверь машины, двигатель, тарелка
    { at: k4 + KEYS_GRAB, src: OWN("keys"), volume: 0.14 },
    { at: k4 + KEYS_SHOTS.belt[0] + 34, src: OWN("belt"), volume: 0.1 },
    { at: k4 + KEYS_SHOTS.drive[0] + 2, src: OWN("car-door"), volume: 0.1 },
    { at: k4 + KEYS_SHOTS.drive[0] + 8, src: COMMON("car"), volume: 0.1, dur: 1.4, fade: 0.4 },
    { at: k4 + KEYS_SHOTS.drive[1] + 34, src: OWN("plate"), volume: 0.12 },
    // 05: печать начинается только после чтения переписки
    { at: S("context") + CONTEXT_SHOTS.face[1] + 26, src: COMMON("typing"), volume: 0.05, dur: 1.6, fade: 0.3 },
    // 06: дверь, короткая печать до вопроса, тарелка, дверь
    { at: S("late") + 2, src: OWN("door-open"), volume: 0.1 },
    { at: S("late") + 4, src: COMMON("typing"), volume: 0.04, dur: Math.max(0.3, (F01.from - 18) / 30), fade: 0.2 },
    { at: S("late") + 236 + 30, src: OWN("plate"), volume: 0.1 },
    { at: S("late") + lateOut, src: OWN("door-open"), volume: 0.1 },
    // 07: ежедневник закрыт, ключи
    { at: S("dadPickup") + DAD_SHOTS.office[0] + 12, src: COMMON("paper"), volume: 0.1 },
    { at: S("dadPickup") + DAD_SHOTS.office[0] + 34, src: OWN("keys"), volume: 0.12 },
    // 08: непрерывная печать
    { at: S("focus") + FOCUS_SHOTS.screen[0] + 4, src: COMMON("typing"), volume: 0.05, dur: 3, fade: 0.3 },
    // 09: крышка ноутбука, кресло, дверь
    { at: S("closing") + LID.to - 2, src: OWN("laptop-close"), volume: 0.16 },
    { at: S("closing") + stand9 + 8, src: OWN("chair"), volume: 0.08 },
    { at: S("closing") + CLOSING_SHOTS.lid[1] - 4, src: OWN("door-open"), volume: 0.08 },
    // 10: тетрадь на стол, тетрадь придвинута
    { at: S("notebook") + 30, src: COMMON("paper"), volume: 0.1 },
    { at: S("notebook") + NOTEBOOK_SHOTS.top[0] + 22, src: COMMON("paper"), volume: 0.08 },
    // 11: отметка в календаре
    { at: S("calendars") + CAL_SHOTS.phone[0] + 62, src: COMMON("tap"), volume: 0.06 },
    // 12: касания экрана
    ...Object.values(TAPS).map((t) => ({ at: S("search") + t.at, src: COMMON("tap"), volume: 0.06 })),
    // 13: книга в руках, страница
    { at: S("book") + BOOK_SHOTS.take[0] + 6, src: COMMON("paper"), volume: 0.08 },
    { at: S("book") + BOOK_SHOTS.open[0] + 20, src: COMMON("paper"), volume: 0.1 },
  ];
};
