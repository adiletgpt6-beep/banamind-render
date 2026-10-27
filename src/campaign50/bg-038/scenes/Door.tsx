// Сцена 6: мама несёт рюкзак сына к двери и ставит его на полку для обуви
// — к будущему учебному дню (без обещаний новой поездки). За окном —
// дворы и горы Бишкека. Диктор: «BalaGo — Бишкектеги балдар үчүн такси.»
// В конце камера приближается к зелёному рюкзаку: его круглая форма
// переходит в логотип финального экрана (match-cut).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import type { Place, PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, clamp, cruise, easeIn, easeOut, keys, keysV, lerp } from "../../../two-schedules-2d/rig/motion";
import { HOME } from "../../../two-schedules-2d/sets/Home";
import { box, useLine, useSceneFrames, World, type Cam } from "../context";
import { BG38_TEXT } from "../script";
import { ExampleTag, NAVY, PACK } from "../sets";
import { at, HomeWorld } from "./home";
import { mixCam } from "./Scale";

export const DOOR = {
  walkFrom: 4,
  walkTo: 46,
  reach: 50,
  place: 64, // рюкзак на полке
} as const;

// петля рюкзака на полке у двери (ShoeBench, рюкзак сына)
export const BENCH_PACK = { x: HOME.bench.x + 80, y: HOME.bench.y - 150 - 176 } as const;
const CAM_A: Cam = { x: 610, y: 1150, zoom: 1.18 };
const CAM_B: Cam = { x: 570, y: 1175, zoom: 1.28 };

const MOM_Y = 1720;
const momPlace = (t: number): Place => ({ x: lerp(905, 600, cruise((t - DOOR.walkFrom) / (DOOR.walkTo - DOOR.walkFrom))), y: MOM_Y, h: 1000 });

export const DoorScene: React.FC = () => {
  const f = useCurrentFrame();
  const total = useSceneFrames("door");
  const n5 = useLine("n5");
  const cut = total - 12;

  const momPose = (t: number): PoseIn => {
    const p = momPlace(t);
    const held = t < DOOR.place;
    const carry = at(p, -0.13, -0.5);
    const target = keysV(
      t,
      [
        [DOOR.walkTo - 2, carry],
        [DOOR.place - 2, { x: BENCH_PACK.x, y: BENCH_PACK.y + 4 }],
        [DOOR.place + 4, { x: BENCH_PACK.x + 10, y: BENCH_PACK.y + 10 }],
        [DOOR.place + 20, at(p, -0.11, -0.5)],
      ],
      anticipate,
    );
    return {
      expr: t < DOOR.place + 6 ? "calm" : "softSmile",
      lean: keys(t, [[DOOR.reach - 4, 0], [DOOR.place - 4, 10], [DOOR.place + 12, 0]]),
      crouch: keys(t, [[DOOR.reach - 4, 0], [DOOR.place - 4, 0.16], [DOOR.place + 12, 0]]),
      lookY: keys(t, [[DOOR.reach - 6, 0.1], [DOOR.reach + 4, 0.45], [DOOR.place + 8, 0.45], [DOOR.place + 22, -0.05]]),
      armL: held
        ? { target, shape: "fist", item: "backpack", itemColor: PACK, elbow: "down", behind: false }
        : t < DOOR.place + 22
          ? { target, shape: "relax", elbow: "down", behind: false }
          : { target: null, shape: "relax" },
      armR: { target: null, shape: "relax" },
    };
  };
  const momFace = (t: number) => keys(t, [[DOOR.walkTo - 4, -0.6], [DOOR.place + 10, -0.6], [DOOR.place + 26, 0.05], [n5.to, 0.05], [n5.to + 14, -0.25]]);

  let cam = mixCam(CAM_A, CAM_B, easeOut(f / Math.max(1, cut)));
  // match-cut: к рюкзаку на полке
  const d = easeIn((f - cut) / 12);
  cam = mixCam(cam, { x: BENCH_PACK.x, y: BENCH_PACK.y + 95, zoom: 4.4 }, d);
  const pin = easeOut((f - n5.from - 6) / 12) * (1 - d);
  return (
    <>
      <World cam={cam} bg="#EFE3D0">
        <HomeWorld f={f} dust={900} uid="d6" momPlace={momPlace} momPose={momPose} momFace={momFace} walkFrom={DOOR.walkFrom} pack={false} benchPack={f >= DOOR.place} />
        {/* деликатная метка «Бишкек» у окна во двор */}
        <div style={box({ left: HOME.window.x + 230, top: HOME.window.y + 330, display: "flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 10px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.86)", fontFamily, fontSize: 30, fontWeight: 900, color: NAVY, opacity: pin })}>
          <svg width={26} height={26} viewBox="0 0 24 24">
            <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#D9483B" />
          </svg>
          {BG38_TEXT.city}
        </div>
      </World>
      {/* круг рюкзака раскрывается в финальный экран */}
      {d > 0.6 ? <div style={box({ inset: 0, backgroundColor: PACK, opacity: clamp((d - 0.6) / 0.4) })} /> : null}
      <ExampleTag a={d > 0.6 ? 1 - clamp((d - 0.6) / 0.4) : 1} />
    </>
  );
};
