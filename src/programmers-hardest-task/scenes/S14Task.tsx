// Сцена 14. Запись в семейном списке (VO27, папа).
// Сплит: сверху список «Үй-бүлөнүн иштери» — папа печатает новую задачу
// «Мектепке барып-келүүнү тактоо» синхронно со своими словами; чекбокс
// остаётся пустым (задача не выполнена). Снизу папа средним планом:
// печатает и негромко читает вслух, мама рядом смотрит в экран.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { keys } from "../rig/motion";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { OWN } from "../sound";
import { abs, C, Card, Paper } from "../ui/kit";
import { TaskList } from "../ui/screens";
import { onTable, seatOf } from "./common";
import { dadSeat, EVE, EveningRoom, momSeat } from "./evening";

const SPLIT = 880;

export const TaskScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo27 = useLine("vo27");
  const dad = dadSeat();
  const mom = momSeat();
  const typing = (t: number) => t > vo27.from - 8 && t < vo27.to + 2;
  const dadPose = (t: number) => {
    const k = typing(t) ? 1 : 0;
    return {
      expr: "calm" as const,
      sit: 1,
      seat: seatOf(dad),
      lean: 9,
      armL: { target: onTable(EVE.laptop.x - 42 + Math.sin(t / 2.2) * 4 * k, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
      armR: { target: onTable(EVE.laptop.x + 44 - Math.sin(t / 1.9) * 4 * k, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
      lookY: 0.45,
      nod: keys(t, [[vo27.to, 0], [vo27.to + 8, 3], [vo27.to + 18, 0]]),
    };
  };
  const momPose = () => ({
    expr: "softSmile" as const,
    sit: 1,
    seat: seatOf(mom),
    lean: 8,
    armL: { target: onTable(mom.x - 0.1 * mom.h, -4), shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: { target: onTable(mom.x + 0.12 * mom.h, -4), shape: "relax" as const, elbow: "hang" as const, behind: false },
    lookY: 0.4,
  });
  return (
    <>
      <div style={abs({ left: 0, top: 0, width: 1080, height: SPLIT, overflow: "hidden" })}>
        <Paper tone="#E9E6F0">
          <Card style={abs({ left: 70, top: 140, width: 940, overflow: "hidden" })}>
            <TaskList w={940} f={f} typeFrom={vo27.word(0) - 2} typeTo={vo27.to - 4} />
          </Card>
        </Paper>
      </div>
      <Shot f={f} from={0} to={9999} view={{ top: SPLIT, height: 1920 - SPLIT }} cam={camMove(f, 0, 90, { x: 960, y: 1170, zoom: 1.75 }, { x: 965, y: 1168, zoom: 1.82 })} bg="#2A2E44">
        <EveningRoom
          state={{ f }}
          actors={[
            { uid: "t14-mom", look: "mom", place: () => mom, face: () => 0.6, pose: momPose, chair: EVE.mom, seed: 1 },
            { uid: "t14-dad", look: "dad", place: () => dad, face: () => -0.05, pose: dadPose, role: "father", chair: EVE.dad, seed: 2, under: () => true },
          ]}
        />
      </Shot>
      <div style={abs({ left: 0, top: SPLIT - 3, width: 1080, height: 6, backgroundColor: C.white })} />
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const vo27 = ctx.line("vo27");
  return [{ at: vo27.from - 4, src: OWN("keyboard"), volume: 0.09, dur: (vo27.to - vo27.from + 6) / 30, fade: 0.1 }];
};
