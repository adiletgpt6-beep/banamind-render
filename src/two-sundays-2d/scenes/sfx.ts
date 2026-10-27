// Эффекты по видимым действиям (кадр ролика). Только тихие бытовые звуки:
// карандаш, лист, застёжка сумки, касание прибора, крышка ноутбука, дверь
// машины, магнит, касание кнопки. Не озвучиваются буквы, склейки и ракурсы;
// во время объяснения дочки (сцена 9) эффектов нет. Шагов нет.
import type { Su2SceneId } from "../script";
import type { Su2Timeline } from "../timing";
import { calendarPlan } from "./Calendar";
import { morningPlan } from "./Morning";
import { officePlan } from "./Office";
import { wednesdayPlan } from "./Wednesday";
import { meetingPlan } from "./Meeting";
import { dinnerPlan } from "./Dinner";
import { showDadPlan } from "./ShowDad";
import { searchPlan } from "./Search";
import { sharedPlan } from "./Shared";
import { fridgePlan } from "./Fridge";
import { seatTimes } from "./CarBits";

export type Su2Sfx = { readonly frame: number; readonly src: string; readonly volume: number; readonly dur?: number };
export const SU2_SFX_FILES = ["paper", "pencil", "bag", "cutlery", "laptop-close", "car-door", "car-cabin", "magnet", "tap"] as const;
type SfxName = (typeof SU2_SFX_FILES)[number];

const src = (n: SfxName) => `audio/two-sundays-2d/sfx/${n}.mp3`;

export const su2Sfx = (tl: Su2Timeline): Su2Sfx[] => {
  const at = (id: Su2SceneId, f: number) => tl.scenes.find((s) => s.id === id)!.from + f;
  const Ca = calendarPlan(tl);
  const Mo = morningPlan(tl);
  const Of = officePlan(tl);
  const We = wednesdayPlan(tl);
  const Me = meetingPlan(tl);
  const Di = dinnerPlan(tl);
  const Sd = showDadPlan(tl);
  const Se = searchPlan(tl);
  const Sh = sharedPlan(tl);
  const Fr = fridgePlan(tl);
  const s = (id: Su2SceneId, f: number, n: SfxName, volume: number, dur?: number): Su2Sfx => ({ frame: at(id, f), src: src(n), volume, ...(dur ? { dur } : {}) });
  const out: Su2Sfx[] = [
    s("calendar", Ca.ray[0], "pencil", 0.45),
    s("morning", Mo.bag[1] - 2, "bag", 0.45),
    s("morning", Mo.doorClose - 2, "car-door", 0.35),
    s("office", Of.lidDone - 2, "laptop-close", 0.45),
    s("office", seatTimes(Of.seat).close[1] - 2, "car-door", 0.35),
    s("wednesday", We.lid[1] - 2, "laptop-close", 0.4),
    s("meeting", Me.mark[0], "pencil", 0.4),
    s("meeting", Me.lamp, "tap", 0.3),
    ...Di.forks.map((t) => s("dinner", t + 24, "cutlery", 0.4)),
    s("showDad", Sd.place - 2, "paper", 0.45),
    s("search", Se.tapCta, "tap", 0.4),
    s("search", Se.send, "tap", 0.5),
    s("shared", Sh.place - 2, "paper", 0.4),
    s("fridge", Fr.mag1, "magnet", 0.45),
    s("fridge", Fr.mag2, "magnet", 0.45),
    s("fridge", Fr.write, "pencil", 0.4),
  ];
  return out.sort((a, b) => a.frame - b.frame);
};
