// Сцена 06 «Дагы бир аз». Вечер. Папа вернулся из офиса и останавливается
// в дверях рабочей комнаты: «Жакында бүтүрөсүңбү?» Мама перестаёт печатать,
// убирает руки с клавиатуры и поворачивается к нему: «Дагы бир аз.»
// Кухня с другого ракурса: ужин мамы остыл (без пара), сын собирает со стола
// тарелки; мама выходит из комнаты, когда стол уже начали освобождать.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, keys, keysV } from "../rig/motion";
import { HOME, Plate } from "../sets/Home";
import { WORK } from "../sets/WorkRoom";
import { camMove, Shot } from "../shots";
import { CuesContext } from "../context";
import { H, lineFrames, onTable, placeAt, restOnTable, sceneLen, seated, seatOf, typingBursts } from "./common";
import { walkLine } from "./Paradox";
import { DESK_FACE, momAtDesk } from "./Work";
import { KitchenWorld, WorkWorld } from "./worlds";

export const LATE_SHOTS = { door: [0, 168], plate: [168, 236] } as const;

export const LateScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("late");
  const F01 = lineFrames(cues, "F01", "late");
  const M01 = lineFrames(cues, "M01", "late");
  const S = LATE_SHOTS;
  const p = { x: WORK.chairX, y: WORK.seatY, h: H.mom };
  const stop = F01.from - 14; // мама перестаёт печатать
  const momPose = (t: number) => {
    const base = momAtDesk(t, typingBursts(t, 0, stop, 40, 24));
    const lap = { x: p.x + 0.16 * p.h, y: p.y - 0.36 * p.h };
    return {
      ...base,
      lean: keys(t, [[stop, 12], [stop + 20, 3]]),
      expr: t < M01.from - 4 ? ("tired" as const) : ("softSmile" as const),
      lookX: keys(t, [[stop, 0.55], [stop + 10, -0.5]]),
      lookY: keys(t, [[stop, 0.32], [stop + 10, 0]]),
      armR: { ...base.armR, target: keysV(t, [[stop, base.armR.target], [stop + 18, lap]], anticipate) },
      armL: { ...base.armL, target: keysV(t, [[stop + 2, base.armL.target], [stop + 20, { ...lap, x: lap.x - 30 }]], anticipate) },
    };
  };
  const momFace = (t: number) => keys(t, [[stop + 4, DESK_FACE], [stop + 22, -0.75]]);
  // папа в проёме двери (за порогом, рука на косяке)
  const dad = placeAt(WORK.door.x + 150, 1505, H.dad);
  const dadPose = (t: number) => ({
    expr: "calm" as const,
    armL: { target: keysV(t, [[6, { x: dad.x - 0.14 * dad.h, y: dad.y - 0.45 * dad.h }], [26, { x: WORK.door.x + 30, y: dad.y - 0.6 * dad.h }]], anticipate), shape: "open" as const, behind: false },
    headTilt: keys(t, [[F01.to, 0], [F01.to + 10, -3]]),
  });
  // кухня: сын собирает тарелки, мама выходит позже
  const dadT = seated("dad", HOME.seat.dad);
  const son = placeAt(1300, 1610, H.son);
  const pick = S.plate[1] + 30;
  const momOut = len - 92;
  const momPlace = (t: number) => walkLine(t, momOut + 14, momOut + 66, { x: 2040, y: 1508 }, { x: 1880, y: 1600 }, H.mom, 0.3);
  const inside = momPlace(f).y < 1532;
  const momSpec = {
    uid: "l6-momK",
    look: "mom" as const,
    f,
    place: momPlace,
    face: (t: number) => keys(t, [[momOut + 30, -0.4], [momOut + 70, -0.55]]),
    pose: () => ({ expr: "tired" as const, exhale: 0.6 }),
    seed: 1,
    walkFrom: momOut + 14,
  };
  const sonPose = (t: number) => ({
    expr: "calm" as const,
    packOff: true,
    lean: keys(t, [[pick - 16, 0], [pick, 16], [pick + 8, 16], [pick + 20, 0]]),
    armR: {
      target: keysV(t, [[pick - 18, { x: son.x + 0.14 * son.h, y: son.y - 0.42 * son.h }], [pick, onTable(HOME.plates.son, 12)], [pick + 4, onTable(HOME.plates.son, 12)], [pick + 22, { x: son.x + 0.18 * son.h, y: son.y - 0.5 * son.h }]], anticipate),
      shape: t >= pick ? ("fist" as const) : ("open" as const),
      item: t >= pick ? ("plate" as const) : ("none" as const),
      behind: false,
    },
    lookY: keys(t, [[pick - 20, 0], [pick - 6, 0.5], [pick + 16, 0]]),
  });
  return (
    <>
      <Shot f={f} from={S.door[0]} to={S.door[1]} cam={camMove(f, S.door[0], S.door[1], { x: 500, y: 1080, zoom: 0.98 }, { x: 520, y: 1060, zoom: 1.04 })}>
        <WorkWorld
          minutes={19 * 60 + 40}
          evening={1}
          doorOpen={clamp(f / 18)}
          inDoor={<Actor uid="l6-dad" look="dad" f={f} place={() => dad} face={() => 0.45} pose={dadPose} role="father" seed={2} />}
          mom={{ uid: "l6-mom", look: "mom", f, place: () => p, face: momFace, pose: momPose, role: "mother", seed: 1 }}
        />
      </Shot>
      <Shot f={f} from={S.plate[0]} to={S.plate[1]} cam={camMove(f, S.plate[0], S.plate[1], { x: HOME.plates.mom, y: 1180, zoom: 2.0 }, { x: HOME.plates.mom, y: 1190, zoom: 2.1 })}>
        <KitchenWorld minutes={19 * 60 + 52} evening={1} items={<Plate x={HOME.plates.mom} y={onTable(0).y + 16} food={1} />} lamp={1} />
      </Shot>
      <Shot f={f} from={S.plate[1]} to={len} cam={camMove(f, S.plate[1], len, { x: 1380, y: 1170, zoom: 0.78 }, { x: 1460, y: 1170, zoom: 0.8 })}>
        <KitchenWorld
          minutes={19 * 60 + 58 + (f - S.plate[1]) / 300}
          evening={1}
          doorOpen={clamp((f - momOut) / 14)}
          inDoor={inside ? <Actor {...momSpec} /> : null}
          seated={[{ uid: "l6-dadT", look: "dad", f, place: () => dadT, face: (t) => keys(t, [[0, 0.3], [momOut + 10, 0.3], [momOut + 26, 0.75]]), pose: () => ({ sit: 1, seat: seatOf(dadT), expr: "calm" as const, armL: restOnTable(dadT, -1), armR: restOnTable(dadT, 1) }), seed: 2 }]}
          items={
            <>
              {f < pick ? <Plate x={HOME.plates.son} y={onTable(0).y + 16} food={0.05} /> : null}
              <Plate x={HOME.plates.mom} y={onTable(0).y + 16} food={1} />
            </>
          }
          standing={[{ uid: "l6-son", look: "son", f, place: () => son, face: (t) => keys(t, [[0, 0.1], [pick + 20, 0.5]]), pose: sonPose, seed: 4 }, ...(inside ? [] : [momSpec])]}
          lamp={1}
        />
      </Shot>
    </>
  );
};
