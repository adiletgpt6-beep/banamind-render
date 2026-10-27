// Сцена 7. Мама не прерывает встречу.
// A. Тот же офис, похожий час (часы — около 13:00), но собираться не нужно:
//    коллега рассказывает, мама спокойно слушает и кивает.
// B. Блокнот сверху: она делает отметку — задача закрыта.
// C. Позже: у стола мама выключает лампу и уходит. Свет мягче и теплее.
import { clamp, easeInOut, keys } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { TINT } from "../theme";
import { MOM_OFFICE } from "../sets/MomOffice";
import { MeetingWide, MomAtDesk, NotebookTop } from "./OfficeShared";
import { standUp } from "./common";

const O = MOM_OFFICE;

export const meetingPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "meeting");
  const note = Math.max(80, T.word("N07", "өткөрүп") - 6);
  const mark: [number, number] = [note + 12, note + 30];
  const desk = mark[1] + 22;
  const lamp = desk + 26;
  const rise = lamp + 20;
  return { note, mark, desk, lamp, rise, len: T.len };
};

export const MeetingScene: React.FC = () => {
  const { f } = useScene("meeting");
  const p = usePlan(meetingPlan);
  if (f < p.note) {
    const momPose = (t: number) => ({ expr: "calm" as const, lookY: 0.05, nod: keys(t, [[30, 0], [36, 5], [44, 0], [62, 0], [68, 4], [76, 0]]), armL: { target: { x: 330, y: O.floorY - 360 }, shape: "fist" as const, item: "notebook" as const, elbow: "down" as const, behind: false } });
    return <MeetingWide f={f} cam={{ x: 640, y: 1060, zoom: 1.1 }} clock={[13, 5]} mom={{ x: 380, pose: momPose, face: () => 0.55 }} colleagueTalk={(t) => clamp(Math.sin(t / 9) * 0.6 + 0.6)} tint={TINT.warm} />;
  }
  if (f < p.desk) {
    const k = easeInOut(clamp((f - p.mark[0]) / (p.mark[1] - p.mark[0])));
    const pen = { x: 600 + 48 * k, y: 958 - (k > 0.4 ? (k - 0.4) * 60 : -k * 30) };
    return <NotebookTop f={f} mark={k} pen={pen} tint={TINT.warm} />;
  }
  const lampK = 1 - clamp((f - p.lamp) / 4);
  const su = standUp(f, p.rise, 30);
  const pose = () => ({
    sit: su.sit,
    seat: 250,
    lean: su.lean,
    expr: "softSmile" as const,
    lookY: 0.2,
    armR: f < p.rise ? { target: { x: O.lamp.x - 30, y: O.desk.top - 210 + 30 * clamp((f - p.lamp) / 6) }, shape: "point" as const, elbow: "down" as const, behind: false } : undefined,
    armL: f < p.rise ? { target: { x: O.momSeat - 90, y: O.desk.top + 4 }, shape: "relax" as const, elbow: "down" as const, behind: false } : undefined,
  });
  const walk = p.rise + 34;
  return <MomAtDesk f={f} cam={{ x: O.momSeat + 120, y: 1000, zoom: 1.5 }} lid={0} lamp={lampK} pose={pose} face={(t) => (t < walk ? 0.4 : keys(t, [[walk, 0.4], [walk + 8, 0.8]]))} clock={[16, 40]} tint={TINT.warm} momX={(t) => O.momSeat + keys(t, [[walk, 0], [walk + 50, 520]])} walkFrom={walk} />;
};
