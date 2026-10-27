// Сцена 9. Шутка и ответ. Та же запись C01, что во вступлении.
// D. Лицо клиента: заметил лист — C01.
// C. Кадр веб-камеры: Айжан замирает (≈ 0,5 с), смотрит на рисунок,
//    улыбается и уверенно отвечает (M04).
// A. На «кызым» — короткий жест к дочке; дочка смущённо улыбается.
// D. Клиент замечает мальчика с огромным карандашом, улыбается — C02.
// A. Дочка чувствует доброжелательность, расслабляется и опускает лист;
//    мама возвращается к работе.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, keysV } from "../rig/motion";
import { useAbs, useScene, usePlan } from "../kit";
import { callPlan, liftAt } from "./callPlan";
import { CallA, kyzSeatPose, momCallPose } from "./callA";
import { DFace, ShotC } from "./callShots";
import { MOM_KEYS } from "./cabinA";

export const JokeScene: React.FC = () => {
  const { f, start } = useScene("joke");
  const c = usePlan(callPlan);
  const abs = useAbs();
  const r = (t: number) => t - start;
  const c01End = r(c.j.c01[1]);
  const kyzWord = r(c.j.kyz);
  const m04End = r(c.j.m04[1]);
  const c02 = r(c.j.c02[0]);
  const lower = r(c.j.lower[0]);
  if (f < c01End + 3) return <DFace f={f} c={c} uid="s9d" />;
  if (f < kyzWord - 4) return <ShotC f={f} c={c} uid="s9c" s={1.15 + 0.06 * easeInOut(clamp((f - c01End) / 60))} cx={440} />;
  if (f >= c02 - 4 && f < lower - 4) return <DFace f={f} c={c} uid="s9d2" />;
  // A: жест к дочке на «кызым»; позже — лист опускается
  const lift = liftAt(c, abs(f));
  const mom = (t: number) =>
    momCallPose({
      expr: "smile",
      lookY: 0.2,
      armL: { target: t >= kyzWord - 6 && t < m04End + 16 ? keysV(t, [[kyzWord - 6, MOM_KEYS.l], [kyzWord + 4, { x: 560, y: 1180 }], [m04End + 4, { x: 560, y: 1180 }], [m04End + 16, MOM_KEYS.l]]) : MOM_KEYS.l, shape: t >= kyzWord && t < m04End + 8 ? "open" : "relax", elbow: "down", behind: false },
    });
  const momFace = (t: number) => keys(t, [[kyzWord - 6, 0], [kyzWord + 4, -0.5], [m04End + 6, -0.5], [m04End + 18, 0]]);
  const kyz = (t: number) => {
    const L = liftAt(c, abs(t));
    return kyzSeatPose(L > 0.001 ? L : 0.001, { expr: t < lower ? "softSmile" : "smile", lookY: 0.1, headTilt: t >= kyzWord && t < m04End + 20 ? -5 : 0, shoulders: t >= kyzWord && t < m04End + 10 ? 0.4 : 0 });
  };
  const kyzFace = (t: number) => keys(t, [[kyzWord, 0.45], [kyzWord + 8, 0.6], [lower + 30, 0.4]]);
  return (
    <AbsoluteFill>
      <CallA f={f} uid="s9a" lift={lift > 0.001 ? lift : 0.001} mom={mom} momFace={momFace} kyz={kyz} kyzFace={kyzFace} album={1} cam={{ x: 560, y: 1040, zoom: 1.1 }} />
    </AbsoluteFill>
  );
};
