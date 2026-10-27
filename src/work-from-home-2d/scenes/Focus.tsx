// Сцена 08 «Иш үзгүлтүксүз». Параллельный монтаж: папа сидит с сыном на
// кухне (сын обедает, потом показывает строку в тетради, папа смотрит и
// кивает — без имитации разговора), а мама в рабочей комнате спокойно
// продолжает анализ: таблица заполняется, график обновляется после ввода.
import { useCurrentFrame } from "remotion";
import { anticipate, clamp, keys, keysV, lerp } from "../rig/motion";
import { LaptopCloseup } from "../screens";
import { HOME, Plate } from "../sets/Home";
import { NotebookOnTable } from "../sets/Props";
import { camMove, Shot } from "../shots";
import { onTable, restOnTable, sceneLen, seated, seatOf, typingBursts } from "./common";
import { KitchenWorld } from "./worlds";

export const FOCUS_SHOTS = { kitchen: [0, 96], screen: [96, 196] } as const;

export const FocusScene: React.FC = () => {
  const f = useCurrentFrame();
  const len = sceneLen("focus");
  const S = FOCUS_SHOTS;
  const son = seated("son", HOME.seat.son);
  const dad = seated("dad", HOME.seat.dad + 60);
  const nb = onTable(HOME.plates.son - 150, 8);
  const point = S.screen[1] + 20;
  const spoon = (t: number) => {
    if (t >= S.screen[0]) return 0;
    const ph = (t % 52) / 52;
    return ph < 0.45 ? Math.sin((Math.PI * ph) / 0.45) : 0;
  };
  const sonPose = (t: number) => {
    const e = spoon(t);
    const mouth = { x: son.x + 0.05 * son.h, y: son.y - 0.36 * son.h - 0.22 * son.h };
    const bowl = onTable(HOME.plates.son + 20, 4);
    const later = t >= S.screen[1];
    return {
      sit: 1,
      seat: seatOf(son),
      packOff: true,
      expr: later ? ("smile" as const) : ("calm" as const),
      lean: later ? keys(t, [[point - 10, 0], [point, 10]]) : 4 + 4 * e,
      armR: later
        ? { target: keysV(t, [[S.screen[1], restOnTable(son, 1).target!], [point, { x: nb.x + 30, y: nb.y - 6 }]], anticipate), shape: "point" as const, elbow: "down" as const, behind: false }
        : { target: { x: lerp(bowl.x, mouth.x + 10, e), y: lerp(bowl.y - 6, mouth.y + 22, e) }, shape: "fist" as const, item: "spoon" as const, elbow: "down" as const, behind: false },
      armL: restOnTable(son, -1),
      lookY: later ? keys(t, [[point - 10, 0], [point, 0.55], [point + 30, 0.55], [point + 40, 0]]) : 0.4 * (1 - e),
    };
  };
  const sonFace = (t: number) => (t < S.screen[1] ? 0.1 : keys(t, [[point - 10, -0.3], [point + 34, -0.3], [point + 44, -0.6]]));
  const dadPose = (t: number) => ({
    sit: 1,
    seat: seatOf(dad),
    expr: "softSmile" as const,
    lean: t >= S.screen[1] ? keys(t, [[point, 0], [point + 12, 8]]) : 0,
    armL: restOnTable(dad, -1),
    armR: { target: onTable(dad.x + 0.12 * dad.h, -4), shape: "relax" as const, elbow: "down" as const },
    lookY: t >= S.screen[1] ? keys(t, [[point, 0.1], [point + 10, 0.5]]) : 0.2,
    nod: keys(t, [[point + 24, 0], [point + 30, 6], [point + 38, 0], [point + 44, 5], [point + 52, 0]]),
  });
  const typing = typingBursts(f, S.screen[0] + 4, S.screen[1], 34, 22);
  const kitchen = (
    <KitchenWorld
      minutes={13 * 60 + 40 + f / 60}
      chairs={[dad.x, son.x, HOME.seat.mom]}
      seated={[
        { uid: "f8-son", look: "son", f, place: () => son, face: sonFace, pose: sonPose, seed: 4 },
        { uid: "f8-dad", look: "dad", f, place: () => dad, face: (t) => keys(t, [[0, 0.35], [S.screen[1], 0.35], [point - 6, 0.55]]), pose: dadPose, seed: 2 },
      ]}
      items={
        <>
          <Plate x={HOME.plates.son + 20} y={onTable(0).y + 16} food={f < S.screen[0] ? 1 - 0.6 * (f / S.screen[0]) : 0.1} />
          <NotebookOnTable x={nb.x} y={nb.y} />
        </>
      }
    />
  );
  return (
    <>
      <Shot f={f} from={S.kitchen[0]} to={S.kitchen[1]} cam={camMove(f, S.kitchen[0], S.kitchen[1], { x: 1220, y: 1230, zoom: 1.25 }, { x: 1230, y: 1230, zoom: 1.3 })}>
        {kitchen}
      </Shot>
      <Shot f={f} from={S.screen[0]} to={S.screen[1]} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<LaptopCloseup f={f} view={{ doc: { filled: clamp((f - S.screen[0] - 6) / 84) * 2, cursorRow: f < S.screen[0] + 48 ? 2 : 3 }, clock: "14:35" }} hands={1} typing={typing} />}>
        {null}
      </Shot>
      <Shot f={f} from={S.screen[1]} to={len} cam={camMove(f, S.screen[1], len, { x: 1230, y: 1250, zoom: 1.4 }, { x: 1230, y: 1250, zoom: 1.45 })}>
        {kitchen}
      </Shot>
    </>
  );
};
