// Сцена 1 «Бул чын эле сенсиңби?» (≈ 8,8 с).
// Кадр начинается внутри старой записи: крупно стопа молодой мамы, шаг
// ещё не завершён (короткое замедленное «зависание»), стопа встаёт на
// пол, камера поднимается по движению к рукам и улыбающемуся лицу. Затем
// непрерывный отъезд: запись — это экран телефона в руках сына. Сын
// смотрит на экран, потом на маму: «Апа, бул чын эле сенсиңби? Ушинтип
// бийлей аласыңбы?» Мама за ноутбуком поднимает взгляд — замечает его
// удивление. Конец — круглая маска (переход во времени к утру мамы).
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place } from "../rig/Actor";
import type { DanceSeg } from "../rig/dance";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { KineticWords, OldVideo, Phone, SCREEN_W, VideoPlayer } from "../screens";
import { MOV_TEXT } from "../script";
import { ChairBack, LaptopBack, LIV, LivingBack, Rug, Sofa, WorkTable } from "../sets/Living";
import { box, type Cam, camMove, Shot } from "../shots";
import { chairSeat, H, lineFrames, placeAt, sceneLen } from "./common";

// Хореография старой записи (время танца td): шаг вправо и назад, затем
// рука вверх, жест «прядь за ухо».
export const OLD_SEGS: readonly DanceSeg[] = [
  { move: "A", from: 0, dur: 56 },
  { move: "B", from: 58, dur: 56 },
  { move: "tuck", from: 116, dur: 40 },
];
// Время танца по кадру сцены: сначала стопа «висит» перед касанием пола
// (медленно), затем обычная скорость.
export const hookDanceT = (f: number) => (f < 22 ? lerp(10.6, 12.4, easeInOut(f / 22)) : 12.4 + (f - 22));

// Мир сцены (гостиная, вечер): мама за столом, сын справа с телефоном.
export const HOOK_MOM: Place = { x: LIV.chair.x, y: LIV.seatFeetY, h: H.mom };
export const HOOK_SON: Place = placeAt(1235, 1640, H.son);
// телефон сына — одинаковый во всех сценах (≈ 10 % роста ребёнка)
export const SON_PHONE_W = 58;
const PHONE_W = SON_PHONE_W;
// телефон у груди сына, чуть левее середины (повёрнут к маме и к зрителю)
const phoneAt = (t: number) => ({ x: HOOK_SON.x - 0.07 * HOOK_SON.h + Math.sin(t / 40) * 1.2, y: HOOK_SON.y - 0.56 * HOOK_SON.h + Math.sin(t / 33) * 1.0 });
const PH_H = PHONE_W * (1170 / 540) + PHONE_W * 0.08;

// Камера внутри записи (мир сцены записи).
const oldCam = (f: number): Cam => {
  if (f < 24) return camMove(f, 0, 24, { x: 1000, y: 1470, zoom: 3.4 }, { x: 1008, y: 1474, zoom: 3.6 });
  if (f < 46) return camMove(f, 24, 46, { x: 1008, y: 1474, zoom: 3.6 }, { x: 960, y: 1130, zoom: 1.45 });
  if (f < 66) return camMove(f, 46, 66, { x: 960, y: 1130, zoom: 1.45 }, { x: 948, y: 700, zoom: 2.7 });
  // внутри телефона: медленно шире — видна вся фигура
  return camMove(f, 66, 150, { x: 948, y: 700, zoom: 2.7 }, { x: 930, y: 1060, zoom: 1.25 });
};

// Экран записи в телефоне повторяет полноэкранный кадр: зум камеры мира
// подобран так, что область видео (540 × 960 в системе экрана) = 1080 × 1920.
const PULL = { from: 74, to: 112 };
const sonShotCam = (f: number): Cam => {
  const p = phoneAt(PULL.from);
  const k = (PHONE_W * 0.92) / SCREEN_W;
  const zStart = 2 / k;
  const start: Cam = { x: p.x, y: p.y, zoom: zStart };
  const mid: Cam = { x: 1120, y: 1210, zoom: 1.72 };
  if (f < PULL.to) {
    // отъезд: зум по логарифму (равномерное ощущение скорости)
    const u = easeInOut((f - PULL.from) / (PULL.to - PULL.from));
    const z = Math.exp(lerp(Math.log(zStart), Math.log(mid.zoom), u));
    const w = (1 / z - 1 / zStart) / (1 / mid.zoom - 1 / zStart);
    return { x: lerp(start.x, mid.x, w), y: lerp(start.y, mid.y, w), zoom: z };
  }
  return camMove(f, PULL.to, 176, mid, { x: 1165, y: 1185, zoom: 1.95 });
};

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const s01 = lineFrames(cues, "s01");
  const len = sceneLen("hook");
  const td = hookDanceT(f);
  // реплика сына: «…сенсиңби?» — на экран; «Ушинтип…» — на маму
  const turnToMom = s01.from + Math.round((s01.to - s01.from) * 0.48);
  const momShot = s01.to - 26;
  const momLookUp = s01.from + 34;

  const sonPose = (t: number) => {
    const p = phoneAt(t);
    const corner = (side: -1 | 1) => ({ x: p.x + side * PHONE_W * 0.46, y: p.y + PH_H * 0.47 });
    return {
      expr: t < turnToMom ? ("amazed" as const) : ("curious" as const),
      lookY: keys(t, [[0, 0.75], [turnToMom - 6, 0.75], [turnToMom + 4, 0.05]]),
      headTilt: keys(t, [[PULL.to, 0], [PULL.to + 20, -4], [turnToMom, -4], [turnToMom + 10, 3]]),
      nod: keys(t, [[0, 6], [turnToMom - 4, 6], [turnToMom + 6, 0]]),
      armL: { target: corner(-1), shape: "fist" as const, elbow: "down" as const, behind: false },
      armR: { target: corner(1), shape: "fist" as const, elbow: "down" as const, behind: false },
      shoulders: keys(t, [[s01.from - 4, 0], [s01.from + 6, 0.35], [s01.to, 0.2]]),
    };
  };
  const sonFace = (t: number) => keys(t, [[0, -0.22], [turnToMom - 6, -0.22], [turnToMom + 6, -0.62]]);
  const momPose = (t: number) => ({
    expr: t < momLookUp ? ("focused" as const) : t < momLookUp + 26 ? ("surprised" as const) : ("softSmile" as const),
    sit: 1,
    seat: chairSeat(H.mom),
    lookY: keys(t, [[0, 0.55], [momLookUp, 0.55], [momLookUp + 8, 0]]),
    lookX: keys(t, [[momLookUp, 0], [momLookUp + 6, 0.5], [momLookUp + 40, 0.3]]),
    headTilt: keys(t, [[momLookUp + 20, 0], [momLookUp + 40, 4]]),
    // руки на клавиатуре за крышкой ноутбука; на удивлении — замирают
    armL: { target: { x: LIV.laptop.x - 58 + (t < momLookUp ? Math.sin(t * 0.9) * 3 : 0), y: LIV.laptop.y - 12 }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: { x: LIV.laptop.x + 34 + (t < momLookUp ? Math.sin(t * 0.8 + 2) * 3 : 0), y: LIV.laptop.y - 12 }, shape: "relax" as const, elbow: "down" as const },
  });
  const momFace = (t: number) => keys(t, [[0, 0.12], [momLookUp, 0.12], [momLookUp + 10, 0.42]]);

  const p = phoneAt(f);
  const world = (
    <>
      <LivingBack light="evening" f={f} />
      <Sofa light="evening" />
      <Rug />
      <ChairBack x={HOOK_MOM.x} light="evening" />
      <Actor uid="h1-mom" look="momHome" f={f} place={() => HOOK_MOM} face={momFace} pose={momPose} seed={1} />
      <WorkTable light="evening" />
      <LaptopBack open={1} />
      <Actor uid="h1-son" look="son" f={f} place={() => HOOK_SON} face={sonFace} pose={sonPose} role="son" seed={4} layer="body" />
      <Actor uid="h1-son" look="son" f={f} place={() => HOOK_SON} face={sonFace} pose={sonPose} role="son" seed={4} layer="armsNoHands" />
      <Phone x={p.x} y={p.y} w={PHONE_W} rot={keys(f, [[PULL.from, 0], [PULL.to, -4]])} shadow={false}>
        <VideoPlayer progress={0.08 + f / 900}>
          <OldVideo f={f} t={td} segs={OLD_SEGS} cam={{ ...oldCam(f), zoom: oldCam(f).zoom / 2 }} w={540} h={960} id="hook-phone" exprAt={exprOld} soft={false} />
        </VideoPlayer>
      </Phone>
      <Actor uid="h1-son" look="son" f={f} place={() => HOOK_SON} face={sonFace} pose={sonPose} role="son" seed={4} layer="hands" />
    </>
  );
  // круглая маска в конце (переход ко второй сцене)
  const irisR = keys(f, [[len - 10, 1300], [len, 0]]);
  const iris = f >= len - 10 ? `circle(${irisR}px at 560px 820px)` : undefined;
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4EDE2" })}>
      <div style={box({ inset: 0, clipPath: iris })}>
        {f < PULL.from ? (
          <OldVideo f={f} t={td} segs={OLD_SEGS} cam={oldCam(f)} id="hook-full" exprAt={exprOld} />
        ) : (
          <>
            <Shot f={f} from={PULL.from} to={momShot} cam={sonShotCam(f)} bg="#3B3149">
              {world}
            </Shot>
            <Shot f={f} from={momShot} to={len} cam={camMove(f, momShot, len, { x: 700, y: 1040, zoom: 2.25 }, { x: 706, y: 1036, zoom: 2.35 })}>
              {world}
            </Shot>
          </>
        )}
        {/* кинетический акцент: короткий вопрос сына */}
        {f >= s01.from && f < momShot ? <KineticWords f={f} at={s01.from + 2} text={MOV_TEXT.hookAccent} size={104} top={190} bg="#FFC90E" out={turnToMom + 14} /> : null}
      </div>
    </div>
  );
};

// Молодая мама улыбается залу; в конце жеста — тёплая улыбка.
const exprOld = (t: number) => (t < 40 ? ("focused" as const) : ("smile" as const));

export const hookPhoneScreenGlow = (f: number) => clamp((f - PULL.from) / 10);
