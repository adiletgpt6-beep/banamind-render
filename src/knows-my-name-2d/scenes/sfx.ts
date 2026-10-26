// Эффекты по видимым действиям (кадр ролика). Только тихие бытовые звуки:
// штрих ручки, телефон ложится на стол, машинка касается стола, шорох лямки
// рюкзака, одно мягкое касание кнопки. Не озвучиваются буквы, склейки и
// ракурсы; во время K01, M01, K05 и F02 эффектов нет. Шагов нет.
import type { Km2SceneId } from "../script";
import type { Km2Timeline } from "../timing";
import { hookPlan } from "./Hook";
import { phoneDownPlan } from "./PhoneDown";
import { thirdBPlan } from "./ThirdB";
import { balagoPlan } from "./Balago";
import { requestPlan } from "./Request";
import { toyCarPlan } from "./ToyCar";
import { morningPlan } from "./School30";

export type Km2Sfx = { readonly frame: number; readonly src: string; readonly volume: number; readonly dur?: number };
export const KM2_SFX_FILES = ["pen", "phone-down", "toy", "bag", "tap"] as const;
type SfxName = (typeof KM2_SFX_FILES)[number];

const src = (n: SfxName) => `audio/knows-my-name-2d/sfx/${n}.mp3`;

export const km2Sfx = (tl: Km2Timeline): Km2Sfx[] => {
  const at = (id: Km2SceneId, f: number) => tl.scenes.find((s) => s.id === id)!.from + f;
  const s = (id: Km2SceneId, f: number, n: SfxName, volume: number): Km2Sfx => ({ frame: at(id, f), src: src(n), volume });
  const Ho = hookPlan(tl);
  const Pd = phoneDownPlan(tl);
  const Tb = thirdBPlan(tl);
  const Ba = balagoPlan(tl);
  const Rq = requestPlan(tl);
  const Tc = toyCarPlan(tl);
  const Mo = morningPlan(tl);
  const out: Km2Sfx[] = [
    s("hook", Ho.write[0], "pen", 0.45),
    s("phoneDown", Pd.contact - 1, "phone-down", 0.5),
    s("thirdB", Tb.writeExit[0], "pen", 0.4),
    s("balago", Ba.tap, "tap", 0.4),
    s("request", Rq.tap, "tap", 0.45),
    s("request", Rq.q[0], "pen", 0.35),
    s("request", Rq.q[2], "pen", 0.35),
    s("toyCar", Tc.contact - 1, "toy", 0.5),
    s("toyCar", Tc.write[0], "pen", 0.35),
    s("morning", Mo.fix[0], "bag", 0.45),
  ];
  // ни один эффект не звучит поверх ключевых реплик
  const quiet = tl.cues.filter((c) => ["K01", "M01", "K05", "F02"].includes(c.id)).map((c) => [Math.round(c.from * 30) - 6, Math.round(c.to * 30) + 6]);
  return out.filter((x) => !quiet.some(([a, b]) => x.frame >= a && x.frame <= b)).sort((a, b) => a.frame - b.frame);
};
