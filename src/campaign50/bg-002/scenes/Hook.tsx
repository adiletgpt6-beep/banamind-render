// Сцена 1 (0–6,2 с): «Жыйынга 03:00». Папа за рабочим столом листает
// материалы к совещанию; коллега проходит к переговорной. Телефон на
// столе загорается — папа замечает его (глаза → голова). Крупно: на
// экране «Уулум: Сабактан кийин ким алып кетет?»
import { useCurrentFrame } from "remotion";
import { anticipate, keys, keysV } from "../rig/motion";
import { NotifyScreen, PhoneFrame } from "../screens";
import { OFFICE } from "../sets/Office";
import { box, camMove, Shot } from "../shots";
import { H, onDesk, placeAt, seatedDad, seatOf } from "./common";
import { OfficeWorld, type Walker } from "./OfficeWorld";

export const HOOK = { buzz: 66, eyes: 76, head: 84, phone: 116 } as const;
const phoneShake = (t: number) => (t >= HOOK.buzz && t < HOOK.buzz + 30 ? Math.sin(t * 2.6) * 4 * (Math.floor((t - HOOK.buzz) / 10) % 3 === 2 ? 0 : 1) : 0);

// Коллега с блокнотом идёт к переговорной.
export const HOOK_WALKER: Walker = {
  uid: "hook-col",
  look: "teacher",
  place: (t) => placeAt(keys(t, [[0, 700], [186, 1560]], (x) => x), 1490, H.colleagueA),
  pose: () => ({ expr: "calm", armL: { target: null, shape: "fist", item: "notebook" } }),
  seed: 5,
};

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const dad = seatedDad();
  const page = (t: number) => (t % 40) / 40;
  const dadPose = (t: number) => {
    const flip = page(t);
    return {
      expr: t < HOOK.eyes ? ("thinking" as const) : ("worried" as const),
      sit: 1,
      seat: seatOf(dad),
      lean: keys(t, [[0, 8], [HOOK.head, 8], [HOOK.head + 12, 3]]),
      lookY: keys(t, [[0, 0.55], [HOOK.eyes, 0.55], [HOOK.eyes + 6, 0.5]]),
      lookX: keys(t, [[HOOK.eyes - 2, 0], [HOOK.eyes + 4, -0.8], [HOOK.head + 10, -0.2]]),
      armR: {
        target: t < HOOK.head ? onDesk(OFFICE.folder.x + 70 - 120 * Math.sin(Math.PI * flip), -10 - 40 * Math.sin(Math.PI * flip)) : keysV(t, [[HOOK.head, onDesk(OFFICE.folder.x + 70, -10)], [HOOK.head + 20, onDesk(OFFICE.folder.x + 40, -4)]], anticipate),
        shape: t < HOOK.head ? ("pinch" as const) : ("relax" as const),
        elbow: "down" as const,
        behind: false,
      },
      armL: { target: onDesk(dad.x - 0.13 * dad.h, -4), shape: "relax" as const, elbow: "down" as const },
    };
  };
  const dadFace = (t: number) => keys(t, [[0, 0.1], [HOOK.head, 0.1], [HOOK.head + 10, -0.45]]);
  const world = (
    <OfficeWorld
      f={f}
      dad={() => dad}
      dadFace={dadFace}
      dadPose={dadPose}
      walkers={[HOOK_WALKER]}
      sitters={1}
      doorOpen={keys(f, [[96, 0], [116, 1]])}
      phone={{ glow: f >= HOOK.buzz ? 1 : 0, shake: phoneShake(f) }}
    />
  );
  return (
    <>
      <Shot f={f} from={0} to={HOOK.phone} cam={camMove(f, 0, HOOK.phone, { x: 840, y: 1060, zoom: 1.45 }, { x: 790, y: 1080, zoom: 1.7 })}>
        {world}
      </Shot>
      <Shot
        f={f}
        from={HOOK.phone}
        to={200}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 45%, #FFFFFF, #DCE3EE)" })}>
            <PhoneFrame x={250} y={520 - 30 * Math.min(1, (f - HOOK.phone) / 40)} w={580}>
              <NotifyScreen f={f - HOOK.phone} at={6} />
            </PhoneFrame>
          </div>
        }
      >
        {null}
      </Shot>
    </>
  );
};
