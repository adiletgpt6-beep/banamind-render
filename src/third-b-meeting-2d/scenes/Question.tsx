// Сцена 11. «Я не помешала?» Тихо, без рассказчика и переходов.
// A. Средний план двоих: ноутбук закрыт, альбом у дочки.
// A крупно: лицо дочки — G02, мягкий настоящий вопрос.
// A, двое: мама убирает руки с ноутбука, поворачивается к дочке — M06.
// Реакция: дочка прижимает альбом к коленям и улыбается; мама тепло
// смотрит на неё.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { useScene } from "../kit";
import { CallA, kyzSeatPose, momCallPose } from "./callA";
import { KYZ_A } from "./cabinA";

export const QuestionScene: React.FC = () => {
  const { f, from, to } = useScene("question");
  const g02 = from("G02");
  const g02End = to("G02");
  const m06End = to("M06");
  const close = f >= g02 - 10 && f < g02End + 8;
  const turn = (t: number) => easeInOut(clamp((t - (g02End - 4)) / 14));
  const mom = (t: number) =>
    momCallPose({
      expr: t < g02End ? "calm" : t < m06End ? "softSmile" : "smile",
      lookY: lerp(0.3, 0.12, turn(t)),
      armL: { target: { x: lerp(640, 600, turn(t)), y: lerp(1440, 1420, turn(t)) }, elbow: "down" },
    });
  const momFace = (t: number) => keys(t, [[g02 - 30, 0], [g02 - 10, -0.15], [g02End, -0.3], [g02End + 14, -0.6]]);
  const press = easeInOut(clamp((f - m06End - 6) / 16));
  const kyz = (t: number) =>
    kyzSeatPose(0, {
      expr: t < g02 - 4 ? "calm" : t < m06End + 4 ? "apologetic" : "smile",
      lookY: t < g02 - 20 ? 0.45 : 0.05,
      lookX: t >= g02 - 20 && t < m06End + 20 ? 0.45 : 0.2,
      shoulders: t >= g02 - 6 && t < g02End + 10 ? 0.3 : 0,
      nod: keys(t, [[m06End, 0], [m06End + 8, 4], [m06End + 18, 0]]),
      armL: { target: { x: KYZ_A.x - 60, y: lerp(1300, 1320, press) }, shape: "relax", elbow: "down" },
      armR: { target: { x: KYZ_A.x + 40, y: lerp(1300, 1318, press) }, shape: "relax", elbow: "down" },
    });
  const kyzFace = (t: number) => keys(t, [[g02 - 30, 0.1], [g02 - 14, 0.5], [m06End + 30, 0.45]]);
  const cam = close ? { x: KYZ_A.x + 40, y: 820, zoom: 2.0 + 0.08 * clamp((f - g02 + 10) / 70) } : f < g02 ? { x: 540, y: 1060, zoom: 1.12 } : { x: 520, y: 880, zoom: 1.45 };
  return (
    <AbsoluteFill>
      <CallA f={f} uid="s11" laptop={0} mom={mom} momFace={momFace} kyz={kyz} kyzFace={kyzFace} album={1} cam={cam} />
    </AbsoluteFill>
  );
};
