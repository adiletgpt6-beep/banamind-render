// Сцена 11 «Туруктуу жол керек». После ужина родители сидят рядом на
// диване и сравнивают расписание папы на два дня: во вторник в 13:00 у
// него встреча, в среду — свободно; мама отмечает время окончания уроков.
// Сын неподалёку выбирает книгу на полке. Спокойный разговор, без спора.
import { useCurrentFrame } from "remotion";
import { anticipate, clamp, easeInOut, keys, keysV } from "../rig/motion";
import { HoldingHand, PhoneFrame, TapFinger, TwoDays } from "../screens";
import { HOME } from "../sets/Home";
import { box, camMove, Shot } from "../shots";
import { H, placeAt, sceneLen, seated } from "./common";
import { KitchenWorld } from "./worlds";

export const CAL_SHOTS = { sofa: [0, 110], phone: [110, 290] } as const;
export const SOFA = { dad: -330, mom: -90, son: 150 } as const;

export const sofaSeat = (who: "dad" | "mom" | "son") => seated(who, SOFA[who], HOME.sofaY);
export const sofaPose = (p: { y: number }) => ({ sit: 1, seat: p.y - HOME.sofa.seat - 10 });

export const CalendarsScene: React.FC = () => {
  const f = useCurrentFrame();
  const len = sceneLen("calendars");
  const S = CAL_SHOTS;
  const dad = sofaSeat("dad");
  const mom = sofaSeat("mom");
  const son = placeAt(560, 1640, H.son);
  const phone = { x: dad.x + 0.2 * dad.h, y: dad.y - 0.5 * dad.h };
  const grab = 50;
  const sonPose = (t: number) => ({
    expr: "calm" as const,
    packOff: true,
    armR: {
      target: keysV(t, [[0, { x: son.x + 0.12 * son.h, y: son.y - 0.42 * son.h }], [30, { x: son.x + 40, y: 1130 }], [grab, { x: son.x + 40, y: 1130 }], [grab + 24, { x: son.x - 0.04 * son.h, y: son.y - 0.5 * son.h }]], anticipate),
      shape: t >= grab ? ("fist" as const) : ("open" as const),
      item: t >= grab ? ("notebook" as const) : ("none" as const),
      itemColor: "#C2533F",
      behind: false,
    },
    lookY: keys(t, [[0, 0], [20, -0.6], [grab + 6, -0.6], [grab + 20, 0.3]]),
  });
  const dadPose = (t: number) => ({
    ...sofaPose(dad),
    expr: "calm" as const,
    lookY: 0.45,
    armR: { target: phone, shape: "phone" as const, item: "phone" as const, flat: 0.4, elbow: "down" as const, behind: false },
    armL: { target: { x: dad.x - 0.04 * dad.h, y: dad.y - 0.37 * dad.h }, shape: "relax" as const, elbow: "down" as const },
    nod: keys(t, [[S.phone[1] + 20, 0], [S.phone[1] + 28, 5], [S.phone[1] + 38, 0]]),
  });
  const momPose = (t: number) => ({
    ...sofaPose(mom),
    expr: t < S.phone[1] ? ("thinking" as const) : ("calm" as const),
    lean: 8,
    lookY: t < S.phone[1] ? 0.5 : 0.1,
    armL: { target: keysV(t, [[0, { x: mom.x - 0.03 * mom.h, y: mom.y - 0.37 * mom.h }], [40, { x: phone.x + 20, y: phone.y - 10 }], [S.phone[1], { x: phone.x + 20, y: phone.y - 10 }], [S.phone[1] + 20, { x: mom.x - 0.03 * mom.h, y: mom.y - 0.37 * mom.h }]], anticipate), shape: "point" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: mom.x + 0.04 * mom.h, y: mom.y - 0.37 * mom.h }, shape: "relax" as const, elbow: "down" as const },
  });
  const world = (
    <KitchenWorld
      minutes={19 * 60 + 2 + f / 600}
      evening={1}
      workLight={0}
      sofa={[
        { uid: "c11-dad", look: "dad", f, place: () => dad, face: (t) => keys(t, [[0, 0.3], [S.phone[1] + 10, 0.3], [S.phone[1] + 24, 0.6]]), pose: dadPose, seed: 2 },
        { uid: "c11-mom", look: "mom", f, place: () => mom, face: (t) => keys(t, [[0, -0.2], [S.phone[1] + 10, -0.2], [S.phone[1] + 24, -0.55]]), pose: momPose, seed: 1 },
      ]}
      standing={[{ uid: "c11-son", look: "son", f, place: () => son, face: (t) => keys(t, [[0, 0.1], [grab + 20, 0.1], [grab + 40, -0.5]]), pose: sonPose, seed: 4 }]}
    />
  );
  const mark = easeInOut((f - S.phone[0] - 70) / 50);
  const fingerX = 800;
  return (
    <>
      <Shot f={f} from={S.sofa[0]} to={S.sofa[1]} cam={camMove(f, S.sofa[0], S.sofa[1], { x: 60, y: 1250, zoom: 0.82 }, { x: 40, y: 1250, zoom: 0.86 })}>
        {world}
      </Shot>
      <Shot
        f={f}
        from={S.phone[0]}
        to={S.phone[1]}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "linear-gradient(180deg, #6E8FB6, #5B7BA2)" })}>
            <PhoneFrame x={170} y={330} w={740}>
              <TwoDays f={f} mark={mark} w={560} />
            </PhoneFrame>
            <HoldingHand x={170} y={330} w={740} sleeve="#6D7FA3" skin="#DCAA84" side={-1} />
            <TapFinger x={fingerX} y={356 + (160 + 132) * 1.22 + 6} press={clamp((f - S.phone[0] - 60) / 8) * (1 - clamp((f - S.phone[0] - 130) / 8))} skin="#E6B590" sleeve="#5E9A93" a={clamp((f - S.phone[0] - 40) / 10) * (1 - clamp((f - S.phone[0] - 150) / 10))} />
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={S.phone[1]} to={len} cam={camMove(f, S.phone[1], len, { x: -200, y: 1150, zoom: 1.3 }, { x: -200, y: 1150, zoom: 1.36 })}>
        {world}
      </Shot>
    </>
  );
};
