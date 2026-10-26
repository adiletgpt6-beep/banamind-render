// Служебная композиция Lesson80-1-9-PoseLab: проверка поз рига до постановки
// (учитель стоя / в приседе / сидя, Билал с подносом и в шаге, Юсуф и еда).
import { useCurrentFrame } from "remotion";
import { nestingBirdPose } from "../../bird/birdPose";
import { Shot } from "../../core/shots";
import { Actor, type Place } from "../../rig/Actor";
import { RoomBack } from "../../sets/Classroom";
import { castById, heightAt, TEACHER, TEACHER_H } from "../../film-1-8/cast";
import { depth } from "../../sets/roomLayout";
import { Table } from "../../film-1-8/set";

export const PoseLab: React.FC = () => {
  const frame = useCurrentFrame();
  const mode = Math.floor(frame / 30);
  const f = frame;
  const y = castById("yusuf");
  const b = castById("bilal");
  const a = castById("amir");
  const yP: Place = { x: 2140, y: 1340, h: heightAt(y.age, 1340) };
  const aP: Place = { x: 1790, y: 1342, h: heightAt(a.age, 1342) };
  const tY = 1336;
  const tP: Place = { x: mode === 2 ? 2310 : 2380, y: tY, h: TEACHER_H * depth(tY) };
  const bY = 1235;
  const bP = (t: number): Place => ({ x: mode === 1 ? 900 + t * 6 : 1300, y: bY, h: heightAt(b.age, bY) });
  const bp = bP(f);
  const k = bp.h / 1000;
  const tk = tP.h / 1000;
  const yk = yP.h / 1000;
  return (
    <Shot f={f} from={-1} to={99999} cam={{ x: 1700, y: 960, zoom: 0.95 }} bg="#F1E7D6">
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} />
      <Actor uid="lab-b" look={b.look} f={f} place={bP} face={() => (mode === 1 ? 0.6 : -0.2)} walkFrom={0} seed={3}
        pose={() => mode === 2
          ? { expr: "softSmile", lean: 8, armR: { target: { x: bp.x + 0.22 * bp.h, y: bp.y - 0.38 * bp.h }, shape: "pinch", elbow: "out" }, armL: { target: { x: bp.x - 0.05 * bp.h, y: bp.y - 0.5 * bp.h }, shape: "open", elbow: "down" } }
          : { expr: "calm", armL: { target: { x: bp.x - 120 * k, y: bp.y - 470 * k }, shape: "open", elbow: "down" }, armR: { target: { x: bp.x + 120 * k, y: bp.y - 470 * k }, shape: "open", elbow: "down" } }} />
      <Actor uid="lab-a" look={a.look} f={f} place={() => aP} face={() => 0.3} pose={() => ({ floorSit: 1, expr: "listening" })} seed={4} />
      <Actor uid="lab-t" look={TEACHER.look} f={f} place={() => tP} face={() => -0.45} seed={5}
        pose={() => mode === 0
          ? { expr: "calm", armL: { target: { x: tP.x - 160 * tk, y: tP.y - 520 * tk }, shape: "open", elbow: "down" }, armR: { target: { x: tP.x - 40 * tk, y: tP.y - 500 * tk }, shape: "open", elbow: "down" } }
          : mode === 1
            ? { expr: "calm", crouch: 0.75, lean: 10, armL: { target: { x: 2160, y: 1296 }, shape: "open", elbow: "out" } }
            : { floorSit: 1, expr: "softSmile", lean: 6 }} />
      <Actor uid="lab-y" look={y.look} f={f} place={() => yP} face={() => (mode === 2 ? 0.05 : 0.45)} seed={6}
        pose={() => mode === 2
          ? { floorSit: 1, expr: "calm", armL: { target: { x: yP.x - 0.02 * yP.h, y: yP.y - 0.66 * yP.h }, shape: "pinch", elbow: "down" } }
          : { floorSit: 1, expr: "curious", armL: { target: { x: yP.x - 90 * yk, y: yP.y - 160 * yk }, shape: "relax", elbow: "in" } }} />
      <Table />
    </Shot>
  );
};
