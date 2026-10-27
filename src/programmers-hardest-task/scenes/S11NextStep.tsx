// Сцена 11. Мама предлагает следующий шаг (VO24).
// Мама подходит (шаг продолжается из сцены 10) и садится рядом. Первая
// часть «Күн тартибин түзүү жеңилдеди.» — она смотрит в приложение на экране
// и кивает: признаёт пользу. Вторая «Эми барып-келүүгө жардам табалы.» —
// переводит взгляд на папу, тепло улыбается. Папа кивает, сын остаётся
// рядом и смотрит то на маму, то на папу. Без спора и упрёка.
import { useCurrentFrame } from "remotion";
import { useLine, usePlan } from "../context";
import { anticipate, keys, keysV } from "../rig/motion";
import { PHT_VIDEO } from "../script";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { TS2 } from "../sound";
import { sceneSpan } from "../timing";
import { onTable, seated, seatOf, sitDown } from "./common";
import { dadSeat, EVE, EveningRoom, sonStand } from "./evening";
import { MOM_WALK, momApproach, questionBeats } from "./S10Question";

export const NextStepScene: React.FC = () => {
  const f = useCurrentFrame();
  const plan = usePlan();
  const vo24 = useLine("vo24");
  // сколько кадров мама уже шла в конце сцены 10
  const q = sceneSpan(plan, "question");
  const c22 = plan.cues.find((c) => c.id === "vo22")!;
  const c23 = plan.cues.find((c) => c.id === "vo23")!;
  const fps = PHT_VIDEO.fps;
  const qb = questionBeats({ from: Math.floor(c22.from * fps) - q.from, to: Math.ceil(c22.to * fps) - q.from }, { from: Math.floor(c23.from * fps) - q.from, to: Math.ceil(c23.to * fps) - q.from });
  const walked = q.to - q.from - qb.momIn; // кадров пути до начала сцены 11
  const sitAt = Math.max(0, MOM_WALK.frames - walked); // мама дошла до стула
  const seat = seated("mom", EVE.mom);
  const momPlace = (t: number) => (t < sitAt + 2 ? { ...momApproach(t + walked, 0), y: seat.y } : seat);
  const turn = vo24.word(4) - 6; // «Эми …» — взгляд на папу
  const dad = dadSeat();
  const son = sonStand();

  const momPose = (t: number) => {
    const sd = sitDown(t, sitAt, 26);
    return {
      expr: t < turn ? ("calm" as const) : ("smile" as const),
      sit: sd.sit,
      seat: seatOf(seat),
      lean: t < sitAt + 34 ? sd.lean : keys(t, [[sitAt + 34, 0], [sitAt + 50, 6]]),
      armL: { target: keysV(t, [[sitAt + 10, { x: seat.x - 70, y: 1330 }], [sitAt + 30, onTable(seat.x - 0.12 * seat.h, -4)]], anticipate), shape: "relax" as const, elbow: "down" as const, behind: false },
      armR: {
        target: keysV(t, [[sitAt + 10, { x: seat.x + 70, y: 1330 }], [sitAt + 30, onTable(seat.x + 0.12 * seat.h, -4)], [turn - 4, onTable(seat.x + 0.12 * seat.h, -4)], [turn + 12, onTable(seat.x + 0.2 * seat.h, -8)]], anticipate),
        shape: t > turn + 6 ? ("open" as const) : ("relax" as const),
        elbow: "down" as const,
        behind: false,
      },
      lookY: keys(t, [[0, 0.1], [sitAt + 20, 0.35], [turn, 0.35], [turn + 10, -0.02]]),
      nod: keys(t, [[vo24.word(2), 0], [vo24.word(2) + 8, 4], [vo24.word(3) + 6, 0]]),
      headTilt: keys(t, [[turn, 0], [turn + 14, 4]]),
    };
  };
  // мама: на экран ноутбука (вправо) → на папу (ещё правее, выше)
  const momFace = (t: number) => keys(t, [[0, 0.55], [turn, 0.5], [turn + 10, 0.72]]);
  const dadPose = (t: number) => ({
    expr: "softSmile" as const,
    sit: 1,
    seat: seatOf(dad),
    lean: 4,
    armL: { target: onTable(EVE.laptop.x - 42, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: { target: onTable(EVE.laptop.x + 50, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
    lookY: keys(t, [[0, -0.05], [vo24.from, -0.05], [vo24.from + 12, 0.1]]),
    // кивает на предложение
    nod: keys(t, [[vo24.to - 14, 0], [vo24.to - 4, 5], [vo24.to + 8, 0], [vo24.to + 14, 3], [vo24.to + 24, 0]]),
  });
  const dadFace = (t: number) => keys(t, [[0, -0.55], [vo24.from, -0.62]]);
  const sonPose = (t: number) => ({
    expr: t < turn + 20 ? ("calm" as const) : ("softSmile" as const),
    lean: 3,
    lookY: -0.1,
    armL: { target: null, shape: "relax" as const },
    armR: { target: onTable(EVE.son + 34, 8), shape: "relax" as const, elbow: "hang" as const, behind: false },
  });
  // сын: на маму (она говорит) → на папу (ждёт ответа)
  const sonFace = (t: number) => keys(t, [[0, 0.5], [vo24.from - 6, 0.5], [vo24.from + 4, -0.55], [vo24.to - 10, -0.55], [vo24.to, 0.55]]);

  const room = (
    <EveningRoom
      state={{ f }}
      actors={[
        { uid: "n11-mom", look: "mom", place: momPlace, face: momFace, pose: momPose, role: "mother", chair: EVE.mom, seed: 1, walkFrom: 0 },
        { uid: "n11-son", look: "son", place: () => son, face: sonFace, pose: sonPose, seed: 4 },
        { uid: "n11-dad", look: "dad", place: () => dad, face: dadFace, pose: dadPose, chair: EVE.dad, seed: 2, under: () => true },
      ]}
    />
  );
  const cut = turn - 2;
  return (
    <>
      <Shot f={f} from={0} to={cut} cam={camMove(f, 0, cut, { x: 920, y: 1110, zoom: 1.45 }, { x: 910, y: 1105, zoom: 1.52 })} bg="#2A2E44">
        {room}
      </Shot>
      <Shot f={f} from={cut} to={9999} cam={camMove(f, cut, cut + 80, { x: 905, y: 1090, zoom: 1.78 }, { x: 912, y: 1088, zoom: 1.84 })} bg="#2A2E44">
        {room}
      </Shot>
    </>
  );
};

export const sound: SceneSound = () => [{ at: 6, src: TS2("chair"), volume: 0.16 }];
