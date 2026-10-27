// Сцена 4 «Ал кайда барат?».
// 4a. Крупно: настольные часы директора 13:19 → 13:20.
// 4b. N05: стол сверху — рука берёт ключи (звук ключей в момент касания)
//     и поднимает их.
// 4c. Общий план офиса: директор идёт к выходу мимо стола помощницы, она
//     поднимает взгляд и провожает его глазами.
// 4d. Склейка по действию: рука с ключами → ручка двери машины, дверь
//     открывается (крупно, бок машины).
// 4e. N06: боковое сопровождение — машина едет слева направо по зелёной
//     улице, башня «Бизнес-борбор» остаётся позади.
// 4f. Вид сверху: машина поворачивает в ворота двора. Школьного входа ещё
//     не видно.
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { Shot, box, camMove, usePlan, useScene } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, glide, lerp } from "../rig/motion";
import { CAR_SCALE, H, seatOf } from "./common";
import { DIRF, DIRF_CAM, DirectorFront, O31_CAM, O31_POS, o31S, OfficeWide } from "../sets/Office31";
import { DigitalClock } from "../props/CalendarUI";
import { CarKeys, DeskTopDown, KeysPickup, KEYS_TOUCH_U, keysPickupAt } from "../props/DeskProps";
import { CarSide, carSeatPlace, doorHandleAt } from "../props/Car";
import { CloseHand } from "../props/CloseHand";
import { M13_HANDS } from "../props/hands";
import { CityStreet, STREET, YardTurnTop } from "../sets/City";
import { sfxAt, type M13Sfx } from "./sfx";

export const drivePlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "drive");
  const n5 = T.from("N05");
  const n6 = T.from("N06");
  const wKeys = T.word("N05", "ачкычын");
  // 4b: касание ключей — на слове «ачкычын»
  const keysA = Math.max(n5 - 2, wKeys - Math.round(KEYS_TOUCH_U * 92));
  const keysB = keysA + 92;
  const cutB = Math.max(20, n5 - 4);
  const cutC = Math.min(keysB - 8, T.to("N05") + 2);
  const cutD = cutC + 40;
  const cutE = Math.max(cutD + 40, n6 + 14);
  const cutF = Math.max(cutE + 40, T.word("N06", "мектептин") - 4);
  return {
    len: T.len,
    flip: [4, 16] as const,
    cutB,
    keysA,
    keysB,
    touch: wKeys,
    cutC,
    cutD,
    gripDoor: cutD + 14,
    doorA: cutD + 18,
    doorB: cutD + 34,
    cutE,
    cutF,
    turn: [cutF + 4, T.len - 6] as const,
  };
};

export const driveSfx = (tl: M13Timeline): M13Sfx[] => {
  const P = drivePlan(tl);
  return [sfxAt(tl, "drive", P.touch, "keys-pickup", 0.5), sfxAt(tl, "drive", P.touch + 10, "keys-jingle", 0.22), sfxAt(tl, "drive", P.doorA, "car-door-open", 0.45)];
};

export const driveSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  const P = drivePlan(tl);
  const T = sceneTools(tl, "drive");
  // стол сверху: ключи в нижней половине кадра — субтитры наверх
  return [[T.start + P.cutB, T.start + P.cutC]];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));

export const DriveScene: React.FC = () => {
  const { f } = useScene("drive");
  const P = usePlan(drivePlan);

  // 4a: часы на столе директора (директор за кадром)
  const S = DIRF.seat;
  const dirPose = (): PoseIn => ({ sit: 1, seat: seatOf(H.dad), expr: "calm", lookY: 0.4, armL: { target: { x: S.x - 58, y: DIRF.deskBack + 46 }, elbow: "hang" }, armR: { target: { x: S.x + 64, y: DIRF.deskBack + 48 }, elbow: "hang" } });

  // 4c: директор идёт к выходу мимо помощницы
  const path = O31_POS.exitPath.slice(3);
  const walkAt = (t: number) => glide(t, P.cutC - 10, P.cutD + 20, path, (x) => cruise(x, 0.12));
  const walkPlace = (t: number) => {
    const p = walkAt(t);
    return { x: p.x, y: p.y, h: H.dad * o31S(p.y) };
  };
  const walker = (
    <Actor uid="d-w" look="m13Director" f={f} place={walkPlace} face={() => -0.85} pose={() => ({ expr: "calm", armR: { target: null, item: "keys" } })} seed={3} blinkShift={5} walkFrom={P.cutC - 10} />
  );
  const A = O31_POS.assistant;
  const kb = O31_POS.asstKeys;
  const follow = (t: number) => clamp((walkAt(t).x - A.x) / 320, -0.7, 0.85);
  const asPose = (): PoseIn => ({ sit: 1, seat: seatOf(H.assistant), expr: "calm", lookY: -0.1, armL: { target: { x: kb.x - 24, y: kb.y + 2 }, elbow: "down" }, armR: { target: { x: kb.x + 28, y: kb.y + 6 }, elbow: "down" } });
  const asst = (layer: "body" | "arms") => <Actor uid="d-a" look="m13Assistant" f={f} place={() => ({ x: A.x, y: A.y, h: H.assistant })} face={follow} pose={asPose} seed={7} blinkShift={11} layer={layer} />;

  // 4d: ручка двери машины крупно (водительский бок, нос влево)
  const ds = 4.6;
  const dcx = 540 + 30 * ds;
  const dcy = 960 + 176 * ds + 40;
  const doorA = 58 * easeInOut(ramp(f, P.doorA, P.doorB));
  const handle = doorHandleAt(dcx, dcy, ds, doorA, 1, "front");
  const reach = easeInOut(ramp(f, P.cutD, P.gripDoor));
  const handAt = { x: lerp(handle.x + 420, handle.x + 38, reach), y: lerp(handle.y + 420, handle.y + 46, reach) };
  const hand = M13_HANDS.director;

  // 4e: улица — машина едет вправо, фон уходит влево
  const streetT = ramp(f, P.cutE - 10, P.cutF + 10);
  const scroll = 1700 * streetT;
  const cs = CAR_SCALE * 0.5;
  const carX = 470;
  const carY = STREET.road;
  const bounce = Math.sin(f * 0.9) * 0.9;
  const fr = carSeatPlace(carX, carY, cs, "front", -1, bounce);
  const driver: PoseIn = { sit: 1, seat: fr.seat, expr: "calm", lookY: 0.05, armL: { target: { x: fr.x + 120 * 0.5, y: fr.y - 300 * 0.5 }, elbow: "down" }, armR: { target: { x: fr.x + 130 * 0.5, y: fr.y - 290 * 0.5 }, elbow: "down" } };

  return (
    <>
      {/* 4a: 13:19 → 13:20 */}
      <Shot f={f} from={0} to={P.cutB} cam={DIRF_CAM.clock}>
        <DirectorFront
          clock={<DigitalClock x={DIRF.clock.x} y={DIRF.clock.y} scale={DIRF.clock.scale} flip={ramp(f, P.flip[0], P.flip[1])} />}
          body={<Actor uid="d-d" look="m13Director" f={f} place={() => ({ x: S.x, y: S.y, h: H.dad })} face={() => 0.2} pose={dirPose} seed={3} layer="body" />}
          arms={<Actor uid="d-d" look="m13Director" f={f} place={() => ({ x: S.x, y: S.y, h: H.dad })} face={() => 0.2} pose={dirPose} seed={3} layer="arms" />}
        />
      </Shot>
      {/* 4b: ключи со стола */}
      <Shot f={f} from={P.cutB} to={P.cutC} cam={camMove(f, P.cutB, P.cutC, { x: 540, y: 1000, zoom: 1.02 }, { x: 560, y: 1060, zoom: 1.08 })}>
        <DeskTopDown>
          <KeysPickup {...keysPickupAt(ramp(f, P.keysA, P.keysB))} />
        </DeskTopDown>
      </Shot>
      {/* 4c: к выходу мимо помощницы */}
      <Shot f={f} from={P.cutC} to={P.cutD} cam={camMove(f, P.cutC, P.cutD, O31_CAM.wide, { x: 560, y: 1400, zoom: 1.08 })}>
        <OfficeWide door={1} mid={walker} assistant={asst("body")} assistantArms={asst("arms")} />
      </Shot>
      {/* 4d: рука с ключами → дверь машины */}
      <Shot f={f} from={P.cutD} to={P.cutE} cam={{ x: 540, y: 960, zoom: 1 }} bg="#C9D2DC">
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "linear-gradient(180deg, #B9CEE0 0%, #DCE5EE 55%, #9AA3AE 56%, #8E96A3 100%)" })} />
        <CarSide x={dcx} y={dcy} s={ds} layer="back" dir={1} frontOpen={doorA} shadow={false} />
        <CarSide x={dcx} y={dcy} s={ds} layer="body" dir={1} frontOpen={doorA} shadow={false} />
        <CarSide x={dcx} y={dcy} s={ds} layer="door" dir={1} frontOpen={doorA} shadow={false} />
        <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
          {/* связка ключей висит из пальцев (кольцо — в точке захвата) */}
          <CarKeys x={handAt.x - 96} y={handAt.y - 115 + 96} angle={6 + 8 * Math.sin(f * 0.45)} k={0.8} swing={10 * Math.sin(f * 0.5)} shadow={0} />
          <CloseHand {...hand} x={handAt.x} y={handAt.y} angle={140 - 10 * reach} size={250} shape={reach > 0.85 ? "grip" : "pinch"} armLen={3.6} />
        </svg>
      </Shot>
      {/* 4e: улица, башня бизнес-центра остаётся позади */}
      <Shot f={f} from={P.cutE} to={P.cutF} cam={{ x: 540, y: 960, zoom: 1 }}>
        <CityStreet
          scroll={scroll}
          bcX={760}
          car={
            <>
              <CarSide x={carX} y={carY} s={cs} layer="back" wheel={scroll * 1.2} bounce={bounce} />
              <Actor uid="d-drv" look="m13Director" f={f} place={() => ({ x: fr.x, y: fr.y, h: H.dad * 0.5 })} face={() => 0.9} pose={() => driver} seed={3} />
              <CarSide x={carX} y={carY} s={cs} layer="body" wheel={scroll * 1.2} bounce={bounce} />
            </>
          }
        />
      </Shot>
      {/* 4f: сверху — поворот во двор */}
      <Shot f={f} from={P.cutF} to={P.len} cam={{ x: 540, y: 960, zoom: 1 }}>
        <YardTurnTop u={ramp(f, P.turn[0], P.turn[1])} />
      </Shot>
    </>
  );
};
