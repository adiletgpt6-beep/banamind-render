// Сцена 7. Уверенная презентация. M03.
// B. Звонок начался: экран через плечо — слайд «БУЛАК», клиент, партнёр,
//    крупное окно Айжан.
// A. Айжан говорит спокойно; на «Материалдардын…» — один жест: поднимает
//    образец к камере.
// B. Тот же момент на экране: образец в её окне, на слайде отмечены
//    материалы.
// D. Лицо клиента: заинтересованно слушает, кивает.
// A. Дочка видит, что мама разговаривает, и тихо достаёт альбом из
//    рюкзака — без скуки и без желания сорвать встречу.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, keysV } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { callPlan } from "./callPlan";
import { CallA, kyzSeatPose, momCallPose } from "./callA";
import { DFace, ShotB } from "./callShots";
import { MOM_KEYS } from "./cabinA";

export const PresentScene: React.FC = () => {
  const { f, from, to, word, start } = useScene("present");
  const c = usePlan(callPlan);
  const m03 = from("M03");
  const sample = word("M03", "Материалдардын");
  const m03End = to("M03");
  const albumAt = m03End + 70;
  const shot = f < m03 - 8 ? "B0" : f < sample + 6 ? "A1" : f < m03End + 10 ? "B1" : f < m03End + 58 ? "D" : "A2";
  const sampleUp = easeInOut(clamp((f - sample + 10) / 14)) * (1 - easeInOut(clamp((f - m03End - 20) / 14)));
  if (shot === "B0" || shot === "B1") return <ShotB f={f} c={c} uid="s7b" zoom={shot === "B1" ? 1.06 : 1} tap={-1} />;
  if (shot === "D") return <DFace f={f} c={c} uid="s7d" />;
  // A: мама говорит, жест к образцу; дочка достаёт альбом
  const mom = (t: number) =>
    momCallPose({
      expr: "calm",
      lookY: 0.3,
      nod: keys(t, [[m03 + 10, 0], [m03 + 20, 3], [m03 + 32, 0]]),
      armR: { target: t >= sample - 12 ? keysV(t, [[sample - 12, MOM_KEYS.r], [sample + 2, { x: 900, y: 1150 }], [m03End + 20, { x: 900, y: 1150 }], [m03End + 34, MOM_KEYS.r]]) : MOM_KEYS.r, shape: t >= sample - 4 && t < m03End + 24 ? "pinch" : "relax", elbow: "down", behind: false },
    });
  const albumU = easeInOut(clamp((f - albumAt) / 24));
  const kyz = (t: number) =>
    kyzSeatPose(0, {
      expr: "calm",
      lookY: t < albumAt - 30 ? 0.1 : 0.6,
      armL: { target: t >= albumAt - 14 && t < albumAt + 24 ? keysV(t, [[albumAt - 14, { x: 270, y: 1300 }], [albumAt - 2, { x: 200, y: 1440 }], [albumAt + 20, { x: 280, y: 1300 }]]) : { x: 270, y: 1300 }, shape: t >= albumAt - 2 && t < albumAt + 20 ? "fist" : "relax", elbow: "down", behind: false },
    });
  const kyzFace = (t: number) => keys(t, [[start - 1e9, 0.45], [albumAt - 40, 0.45], [albumAt - 28, -0.2]]);
  return (
    <AbsoluteFill>
      <CallA f={f} uid="s7a" mom={mom} momFace={() => 0.02} kyz={kyz} kyzFace={kyzFace} album={f >= albumAt + 8 ? albumU : 0} sample={shot === "A1" ? sampleUp : 0} cam={shot === "A2" ? { x: 470, y: 1060, zoom: 1.12 + 0.05 * clamp((f - m03End - 58) / 90) } : { x: 560, y: 1000, zoom: 1.05 }} />
    </AbsoluteFill>
  );
};
