// Сцена 10. Проект согласован.
// B. Экран: клиент выбирает показанный 2-й вариант — на «тандайлы» на
//    слайде отмечается вариант (C03), клиент кивает.
// A. Айжан подтверждает (M05).
// B. Курсор → «Бүтүрүү», палец нажимает тачпад → «Чалуу аяктады»: звук
//    конференции прекращается, музыка продолжается.
// A. Она закрывает крышку вокруг шарнира и выдыхает. Без оплат и
//    переводов на экране.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, keysV } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { approvedPlan, callPlan } from "./callPlan";
import { CallA, kyzSeatPose, momCallPose } from "./callA";
import { ShotB } from "./callShots";
import { LAPTOP_A, MOM_KEYS } from "./cabinA";

export const ApprovedScene: React.FC = () => {
  const { f, from, to, start } = useScene("approved");
  const c = usePlan(callPlan);
  const P = approvedPlan(c.endCall - start, from("M05"), to("M05"));
  if (f < P.m05 - 6) return <ShotB f={f} c={c} uid="s10b" zoom={1.04} tap={-1} />;
  if (f >= P.cursor && f < P.ended + 20) {
    const cur = keysV(f, [[P.cursor, { x: 700, y: 400 }], [P.tap - 4, { x: 850, y: 710 }]], easeInOut);
    const press = f >= P.tap && f < P.tap + 4 ? 1 : 0;
    return <ShotB f={f} c={c} uid="s10b2" ended={f >= P.ended ? f - P.ended : -1} press={press} cursor={f < P.ended ? cur : null} tap={press} />;
  }
  const lid = 1 - easeInOut(clamp((f - P.close[0]) / (P.close[1] - P.close[0])));
  const lidTop = { x: LAPTOP_A.x, y: LAPTOP_A.y - LAPTOP_A.w * 0.64 * Math.sin(lid * 1.83) * 0.92 - 10 };
  const mom = (t: number) => {
    const closing = t >= P.close[0] - 8 && t < P.close[1] + 2;
    return momCallPose({
      expr: t >= P.exhale ? "softSmile" : "calm",
      lookY: closing ? 0.5 : 0.3,
      exhale: keys(t, [[P.exhale, 0], [P.exhale + 16, 1], [P.exhale + 46, 0.3]]),
      shoulders: keys(t, [[P.exhale - 4, 0], [P.exhale + 8, 0.5], [P.exhale + 22, 0]]),
      armR: { target: closing ? { x: lidTop.x + 80, y: lidTop.y + 6 } : MOM_KEYS.r, shape: closing ? "pinch" : "relax", elbow: "down", behind: false },
      armL: { target: closing ? { x: lidTop.x - 80, y: lidTop.y + 6 } : MOM_KEYS.l, shape: closing ? "pinch" : "relax", elbow: "down", behind: false },
    });
  };
  return (
    <AbsoluteFill>
      <CallA f={f} uid="s10a" laptop={lid} mom={mom} kyz={() => kyzSeatPose(0.001, { expr: "softSmile", lookY: 0.2 })} kyzFace={() => 0.4} album={1} lift={0.001} cam={{ x: 600, y: 1020, zoom: 1.08 }} />
    </AbsoluteFill>
  );
};
