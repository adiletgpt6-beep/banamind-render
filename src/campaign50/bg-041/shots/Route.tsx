// Сцена 2 «route» — КИЙИН: УЮШУЛГАН КАТТАМ. Плёнка перематывает день назад.
// Две снятые анимации (вперёд) на бишкекской улице, обе перематываются:
//   A — после уроков (13:30 → 13:50): сын выходит из школы, со стороны
//       тротуара садится в белую машину BalaGo (в салоне ещё двое детей,
//       все пристёгнуты), машина везёт его к дому, он выходит к маме у
//       подъезда, оба машут водителю;
//   M — утром (07:40 → 08:00): мама провожает сына у подъезда, он садится в
//       ту же машину, машина едет к школе, сын заходит в школьные ворота.
// В сцене: ◀◀ A от конца к началу (машина едет назад от дома к школе —
// явно под плашкой перемотки), смена дня на утро у школы, ◀◀ M от конца к
// началу (утренняя дорога назад), ❚❚ на утреннем кадре у подъезда: мама,
// сын с жёлтым рюкзаком, машина ждёт → подпись «Кийин: уюшулган каттам» →
// въезд в рюкзак (склейка с жёлтой папкой следующей сцены).
// Машина всегда стоит носом влево у бордюра: тротуар за ней, дети садятся
// и выходят со стороны тротуара (невидимой зрителю), не на проезжую часть.
import { fontFamily } from "../../../fonts";
import { BalaGoCar, box, easeInOut, easeOut, mix, NAVY, prog, YELLOW } from "../art";
import { local, tapeAt, wordFrame, type SceneProps, type TapeSeg } from "../kit";
import { Actor, type Place } from "../rig/Actor";
import { cruise, keys } from "../rig/motion";
import { BG41_TEXT } from "../script";
import { Cam, CAR_W, CAR_Y, HangingBackpack, PinLabel, SIDEWALK_Y, Street, STREET_ADULT_H, STREET_CHILD_H } from "../sets";
import { ChapterLabel, CHAPTER_POS, type HudState } from "../tape";
import type { Bg41Timeline } from "../timing";

const T = BG41_TEXT.route;
const AH = STREET_ADULT_H;
const CH = STREET_CHILD_H;
// заднее (детское) сиденье — правее центра машины (нос слева)
const DOOR_OFF = 58;
const WHEEL_R = 21 * (CAR_W / 300);
const wheelDeg = (dist: number) => (dist / WHEEL_R) * 57.3;

// ---------- Снятая анимация M (утро, дом справа, школа слева) ----------
export const M_LEN = 260;
const MW = { homeX: 0, schoolX: -2900, from: -3800, to: 1600 } as const;
const M_CAR_HOME = 110;
const M_CAR_SCHOOL = -2690;
const M_GATE = MW.schoolX + 450;
const M_MOM = 545;
const M_SON0 = 470;
const mCarX = (m: number) => mix(M_CAR_HOME, M_CAR_SCHOOL, cruise(prog(m, 86, 150), 0.3));
const mSon = (m: number): Place => {
  if (m < 236) return { x: keys(m, [[20, M_SON0], [62, M_CAR_HOME + DOOR_OFF]]), y: SIDEWALK_Y, h: CH };
  return { x: keys(m, [[236, M_CAR_SCHOOL + DOOR_OFF], [256, M_GATE - 10]]), y: SIDEWALK_Y, h: CH };
};
const mSonAlpha = (m: number) => (m < 150 ? 1 - prog(m, 62, 12) : prog(m, 232, 10) * (1 - prog(m, 254, 6)));
const mSonInCar = (m: number) => prog(m, 64, 12) * (1 - prog(m, 230, 10));
const mCam = (m: number) => keys(m, [[0, 300], [84, 300], [100, M_CAR_HOME - 40], [236, M_CAR_SCHOOL + 120], [252, M_CAR_SCHOOL + 260]]);

// ---------- Снятая анимация A (после уроков, школа справа, дом слева) ----------
export const A_LEN = 280;
const AW = { schoolX: 0, homeX: -2900, from: -3800, to: 1600 } as const;
const A_GATE = AW.schoolX + 450;
const A_CAR_SCHOOL = 250;
const A_CAR_HOME = -2770;
const A_MOM = -2440;
const aCarX = (a: number) => mix(A_CAR_SCHOOL, A_CAR_HOME, cruise(prog(a, 46, 160), 0.3));
const aSon = (a: number): Place => {
  if (a < 120) return { x: keys(a, [[4, A_GATE - 10], [32, A_CAR_SCHOOL + DOOR_OFF]]), y: SIDEWALK_Y, h: CH };
  return { x: keys(a, [[222, A_CAR_HOME + DOOR_OFF], [258, A_MOM - 92]]), y: SIDEWALK_Y, h: CH };
};
const aSonAlpha = (a: number) => (a < 120 ? prog(a, 0, 6) * (1 - prog(a, 32, 12)) : prog(a, 210, 10));
const aSonInCar = (a: number) => prog(a, 34, 12) * (1 - prog(a, 208, 12));
const aCam = (a: number) => keys(a, [[0, 330], [44, 330], [60, A_CAR_SCHOOL - 60], [206, A_CAR_HOME + 140], [222, A_MOM - 140]]);

// Сын несёт жёлтый рюкзак в руке (как на крючке дома): кисть и центр
// рюкзака (мировые px) — для въезда/выезда камеры по рюкзаку.
const BAG_S = 0.42;
const bagHand = (p: Place) => ({ x: p.x + 0.13 * p.h, y: p.y - 0.4 * p.h });
const packOf = (p: Place) => ({ x: bagHand(p).x, y: bagHand(p).y + 83 * BAG_S });

const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(Math.round(min % 60)).padStart(2, "0")}`;

export const routeKeys = (tl: Bg41Timeline) => {
  const s = tl.scenes.find((x) => x.id === "route")!;
  const len = Math.round((s.to - s.from) * 30);
  const switchAt = Math.max(80, wordFrame(tl, "n02", "эртең", 0.42) - 8);
  const pauseAt = Math.max(switchAt + 40, wordFrame(tl, "n02", "уюшулган", 0.7) - 4);
  const label = wordFrame(tl, "n02", "уюшулган", 0.7);
  const sA = Math.min(6, Math.max(2, A_LEN / (switchAt - 6)));
  const sM = Math.min(7, Math.max(2, M_LEN / (pauseAt - switchAt - 4)));
  return { len, switchAt, pauseAt, label, sA, sM, zoomOut: len - 24 };
};

const segsA = (k: ReturnType<typeof routeKeys>): TapeSeg[] => [{ at: 4, mode: "rew", from: A_LEN, speed: k.sA }];
const segsM = (k: ReturnType<typeof routeKeys>): TapeSeg[] => [
  { at: k.switchAt, mode: "rew", from: M_LEN, speed: k.sM },
  { at: k.pauseAt, mode: "pause", from: 0 },
];

export const routeHud = (tl: Bg41Timeline, f: number): HudState => {
  const k = routeKeys(tl);
  const pos = mix(0.92, CHAPTER_POS.route, easeInOut(prog(f, 0, k.pauseAt)));
  if (f < k.switchAt) {
    const a = tapeAt(segsA(k), f, A_LEN).shot;
    return { mode: "rew", speed: k.sA, clock: hhmm(13 * 60 + 30 + (a / A_LEN) * 20), pos };
  }
  const tm = tapeAt(segsM(k), f, M_LEN);
  return { mode: f >= k.pauseAt ? "pause" : "rew", speed: k.sM, clock: hhmm(7 * 60 + 40 + (tm.shot / M_LEN) * 20), pos };
};

// Улица с машиной и людьми в кадре e снятой анимации.
const StreetShot: React.FC<{
  readonly kind: "A" | "M";
  readonly e: number;
  readonly cam: { cx: number; cy: number; z: number };
}> = ({ kind, e, cam }) => {
  const isA = kind === "A";
  const W = isA ? AW : MW;
  const carX = isA ? aCarX(e) : mCarX(e);
  const carStart = isA ? A_CAR_SCHOOL : M_CAR_HOME;
  const son = isA ? aSon : mSon;
  const sonA = isA ? aSonAlpha(e) : mSonAlpha(e);
  const inCar = isA ? aSonInCar(e) : mSonInCar(e);
  const momX = isA ? A_MOM : M_MOM;
  const len = isA ? A_LEN : M_LEN;
  const homeDoor = W.homeX + 410;
  // мама видна только у дома
  const showMom = Math.abs(cam.cx - momX) < 1400;
  return (
    <Cam cx={cam.cx} cy={cam.cy} z={cam.z}>
      <Street tod={isA ? 1 : 0} camX={cam.cx} homeX={W.homeX} schoolX={W.schoolX} from={W.from} to={W.to} />
      <PinLabel x={homeDoor - 120} y={780} label={T.home} dark={false} />
      {showMom ? (
        <Actor
          uid={`${kind}-mom`}
          look="mom"
          f={e}
          sceneLen={len}
          seed={isA ? 61 : 62}
          place={() => ({ x: momX, y: SIDEWALK_Y, h: AH })}
          face={(t2) => (isA ? keys(t2, [[200, -0.7], [262, -0.55], [272, -0.75]]) : keys(t2, [[0, -0.55], [70, -0.75]]))}
          pose={(t2) => {
            const sonP = son(t2);
            const shoulder = { x: sonP.x + 0.1 * CH, y: SIDEWALK_Y - 0.7 * CH };
            const handOn = isA ? t2 >= 252 : t2 < 24;
            const waving = isA ? t2 >= 266 : t2 >= 60 && t2 < 150;
            const wave = Math.sin(t2 / 3.2) * 26;
            return {
              expr: "softSmile" as const,
              lookY: 0.15,
              armL: handOn
                ? { target: shoulder, shape: "open" as const, elbow: "down" as const, behind: false }
                : waving
                  ? { target: { x: momX - 70 + wave, y: SIDEWALK_Y - 0.98 * AH }, shape: "wave" as const, elbow: "out" as const, behind: false }
                  : { target: null, shape: "relax" as const },
              armR: { target: null, shape: "relax" as const },
              bagOnShoulder: isA ? 0 : 1,
            };
          }}
        />
      ) : null}
      <Actor
        uid={`${kind}-son`}
        look="son"
        f={e}
        sceneLen={len}
        seed={isA ? 63 : 64}
        opacity={sonA}
        place={son}
        face={(t2) => (isA ? (t2 >= 258 ? keys(t2, [[258, 0.55], [268, -0.6]]) : 0) : t2 < 20 ? -0.55 : 0)}
        pose={(t2) => {
          const waving = isA && t2 >= 268;
          return {
            expr: "smile" as const,
            packOff: true,
            armL: waving
              ? { target: { x: son(t2).x - 40 + Math.sin(t2 / 3) * 18, y: SIDEWALK_Y - 0.98 * CH }, shape: "wave" as const, elbow: "out" as const, behind: false }
              : { target: null, shape: "relax" as const },
            armR: { target: bagHand(son(t2)), shape: "fist" as const, elbow: "down" as const, behind: false },
          };
        }}
      />
      <HangingBackpack x={bagHand(son(e)).x} y={bagHand(son(e)).y} s={BAG_S} hook={false} opacity={sonA} swing={Math.sin(e / 4) * 4} />
      <BalaGoCar uid={`${kind}-car`} x={carX} y={CAR_Y} width={CAR_W} wheelTurn={wheelDeg(Math.abs(carStart - carX))} son={inCar} kids={2} />
    </Cam>
  );
};

const TodChip: React.FC<{ readonly text: string; readonly u: number }> = ({ text, u }) =>
  u > 0 ? (
    <div style={box({ left: 0, right: 0, top: 410, display: "flex", justifyContent: "center", opacity: u })}>
      <div style={{ padding: "12px 30px", borderRadius: 30, backgroundColor: "rgba(255,255,255,0.95)", color: NAVY, fontSize: 44, fontWeight: 1000, boxShadow: "0 8px 20px rgba(20,40,75,0.18)", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: YELLOW, boxShadow: `0 0 0 4px ${NAVY}` }} />
        {text}
      </div>
    </div>
  ) : null;

export const Route: React.FC<SceneProps> = ({ t, tl }) => {
  const { f } = local(tl, "route", t);
  const k = routeKeys(tl);
  const base = { cy: 960, z: 1 };
  // A: перемотка от дома к школе
  const a = tapeAt(segsA(k), f, A_LEN).shot;
  // M: перемотка утренней дороги, стоп на кадре у подъезда
  const m = tapeAt(segsM(k), f, M_LEN).shot;
  const showA = f < k.switchAt + 8;
  const mixM = easeInOut(prog(f, k.switchAt, 8));
  // въезд/выезд камеры по рюкзаку
  const packA = packOf(aSon(a));
  const packM = packOf(mSon(m));
  const zOut = 1 - easeOut(prog(f, 0, 16));
  const camA = { cx: mix(aCam(a), packA.x, zOut), cy: mix(base.cy, packA.y, zOut), z: 1 + 22 * Math.pow(zOut, 1.6) };
  // ❚❚ стоп-кадр: камера «рассматривает» его — наезд на заднее окно
  // машины (дети пристёгнуты, водитель за рулём), затем обратно к сыну
  // и въезд в его жёлтый рюкзак (склейка со следующей сценой).
  const zIn = easeInOut(prog(f, k.zoomOut, k.len - k.zoomOut));
  const win = { x: M_CAR_HOME + 68, y: CAR_Y - 196 };
  const span = k.zoomOut - k.pauseAt;
  const kp = [k.pauseAt + 6, k.pauseAt + 0.42 * span, k.pauseAt + 0.7 * span, k.zoomOut] as const;
  const camM0 =
    f < k.pauseAt
      ? { cx: mCam(m), cy: base.cy, z: 1 }
      : {
          cx: keys(f, [[kp[0], mCam(0)], [kp[1], win.x], [kp[2], win.x], [kp[3], 420]]),
          cy: keys(f, [[kp[0], base.cy], [kp[1], win.y], [kp[2], win.y], [kp[3], 1010]]),
          z: keys(f, [[kp[0], 1], [kp[1], 2.3], [kp[2], 2.4], [kp[3], 1.18]]),
        };
  const camM = { cx: mix(camM0.cx, packM.x, Math.min(1, zIn * 1.4)), cy: mix(camM0.cy, packM.y, Math.min(1, zIn * 1.4)), z: camM0.z * (1 + 20 * Math.pow(zIn, 1.5)) };
  const chipA = easeOut(prog(f, 8, 10)) * (1 - prog(f, k.switchAt - 6, 6));
  const chipM = easeOut(prog(f, k.switchAt + 2, 10)) * (1 - prog(f, k.label - 8, 6));
  return (
    <div style={box({ inset: 0, overflow: "hidden", fontFamily, backgroundColor: "#EAF1FB" })}>
      {mixM < 1 ? (
        <div style={box({ inset: 0 })}>
          <StreetShot kind="A" e={a} cam={camA} />
        </div>
      ) : null}
      {!showA || mixM > 0 ? (
        <div style={box({ inset: 0, opacity: showA ? mixM : 1 })}>
          <StreetShot kind="M" e={m} cam={camM} />
        </div>
      ) : null}
      <TodChip text={T.afternoon} u={chipA} />
      <TodChip text={T.morning} u={chipM} />
      <ChapterLabel text={T.label} u={prog(f, k.label, 14)} out={prog(f, k.zoomOut + 4, 8)} />
    </div>
  );
};

