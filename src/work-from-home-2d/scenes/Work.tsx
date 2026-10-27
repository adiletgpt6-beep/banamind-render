// Сцена 02 «Чыныгы жумуш күнү». Утро. Крупно — экран ноутбука с
// правильной стороны: документ «Айлык талдоо», таблица, график, окно
// календаря «Команда менен жолугушуу»; мама отмечает строку мышью. Затем
// — мама за столом печатает короткими сериями (кисти на клавиатуре).
// Папа на кухне собирается в офис: допивает чай, берёт свои ключи.
import { useCurrentFrame } from "remotion";
import { anticipate, clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { LaptopCloseup } from "../screens";
import { HOME, Piala, Plate } from "../sets/Home";
import { WORK } from "../sets/WorkRoom";
import { camMove, Shot } from "../shots";
import { H, onTable, placeAt, restOnTable, sceneLen, seated, seatOf, typingBursts } from "./common";
import { keyAt, KitchenWorld, WorkWorld } from "./worlds";

export const WORK_SHOTS = { screen: [0, 120], desk: [120, 225] } as const;

// Мама за ноутбуком (общая поза для рабочих сцен): typing 0…1.
// Голова в три четверти к камере (face), корпус — в профиль к столу
// (turnBody), глаза — на экран (lookX).
export const DESK_FACE = 0.55;
export const momAtDesk = (t: number, typing: number, extra: Record<string, unknown> = {}) => ({
  sit: 1,
  seat: 0.27 * H.mom,
  lean: 12,
  turnBody: 1.55,
  expr: "thinking" as const,
  lookX: 0.55,
  lookY: 0.32,
  armR: { target: keyAt(2, t, typing), shape: "relax" as const, elbow: "down" as const, behind: false },
  armL: { target: keyAt(0, t + 7, typing), shape: "relax" as const, elbow: "down" as const },
  ...extra,
});
export const MOM_DESK = { x: WORK.chairX, y: WORK.seatY, h: H.mom };

export const WorkScene: React.FC = () => {
  const f = useCurrentFrame();
  const len = sceneLen("work");
  const [s0, s1] = WORK_SHOTS.screen;
  const [, d1] = WORK_SHOTS.desk;
  // курсор: от графика к строке «Август», щелчок
  const click = 78;
  const ptr = keysV(f, [[s0, { x: 760, y: 420 }], [40, { x: 760, y: 420 }], [click, { x: 230, y: 268 }]], anticipate);
  const dad = placeAt(2080, 1610, H.dad);
  const son = seated("son", HOME.seat.son);
  const sip = 290;
  const dadPose = (t: number) => ({
    expr: "calm" as const,
    armR: {
      target: keysV(t, [[d1, { x: dad.x + 0.14 * dad.h, y: dad.y - 0.5 * dad.h }], [sip, { x: dad.x + 0.08 * dad.h, y: dad.y - 0.82 * dad.h }], [sip + 24, { x: dad.x + 0.08 * dad.h, y: dad.y - 0.82 * dad.h }], [sip + 44, onTable(HOME.plates.mom + 60, 8)], [sip + 58, { x: dad.x + 0.12 * dad.h, y: dad.y - 0.42 * dad.h }]], anticipate),
      shape: "fist" as const,
      item: t < sip + 46 ? ("cup" as const) : ("none" as const),
      behind: false,
    },
    armL: { target: { x: dad.x - 0.06 * dad.h, y: dad.y - 0.5 * dad.h }, shape: "relax" as const, wrist: -60, behind: false },
    lookY: keys(t, [[d1, 0], [d1 + 20, 0.4], [d1 + 60, 0.4], [d1 + 80, 0]]),
  });
  const spoon = (t: number) => {
    const ph = ((t - d1) % 50) / 50;
    return ph < 0.45 ? Math.sin((Math.PI * ph) / 0.45) : 0;
  };
  const sonPose = (t: number) => {
    const e = spoon(t);
    const mouth = { x: son.x + 0.05 * son.h, y: son.y - 0.36 * son.h - 0.22 * son.h };
    const bowl = onTable(HOME.plates.son, 4);
    return {
      sit: 1,
      seat: seatOf(son),
      packOff: true,
      expr: "calm" as const,
      lean: 4 + 4 * e,
      armR: { target: { x: lerp(bowl.x, mouth.x + 10, e), y: lerp(bowl.y - 6, mouth.y + 22, e) }, shape: "fist" as const, item: "spoon" as const, elbow: "down" as const, behind: false },
      armL: restOnTable(son, -1),
      lookY: 0.4 * (1 - e),
    };
  };
  return (
    <>
      <Shot f={f} from={s0} to={s1} cam={{ x: 540, y: 960, zoom: 1 }} overlay={
        <LaptopCloseup
          f={f}
          view={{ doc: { filled: 0, highlightRow: f >= click ? 1 : undefined }, calendar: easeInOut((f - 12) / 16), pointer: { ...ptr, click: clamp(1 - Math.abs(f - click) / 4) }, clock: "09:12" }}
          hands={0}
        />
      }>
        {null}
      </Shot>
      <Shot f={f} from={WORK_SHOTS.desk[0]} to={d1} cam={camMove(f, WORK_SHOTS.desk[0], d1, { x: 820, y: 1160, zoom: 1.12 }, { x: 840, y: 1150, zoom: 1.18 })}>
        <WorkWorld
          minutes={9 * 60 + 12 + f / 600}
          mom={{ uid: "w2-mom", look: "mom", f, place: () => MOM_DESK, face: () => DESK_FACE, pose: (t) => momAtDesk(t, typingBursts(t, 130, 220, 40, 22)), seed: 1 }}
        />
      </Shot>
      <Shot f={f} from={d1} to={len} cam={camMove(f, d1, len, { x: 1680, y: 1170, zoom: 0.9 }, { x: 1700, y: 1160, zoom: 0.93 })}>
        <KitchenWorld
          minutes={8 * 60 + 5 + f / 600}
          chairs={[HOME.seat.dad, HOME.seat.son, HOME.seat.mom]}
          seated={[{ uid: "w2-son", look: "son", f, place: () => son, face: () => 0.2, pose: sonPose, seed: 4 }]}
          items={
            <>
              <Plate x={HOME.plates.son} y={onTable(0).y + 16} food={0.7} />
              {f >= sip + 46 ? <Piala x={HOME.plates.mom + 60} y={onTable(0).y + 18} /> : null}
            </>
          }
          standing={[{ uid: "w2-dad", look: "dad", f, place: () => dad, face: (t) => keys(t, [[d1, -0.4], [sip + 60, -0.4], [sip + 80, -0.7]]), pose: dadPose, seed: 2 }]}
        />
      </Shot>
    </>
  );
};
