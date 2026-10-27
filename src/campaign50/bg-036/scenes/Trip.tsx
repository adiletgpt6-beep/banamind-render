// Сцена 2 (≈6,5–18,5 с). Лента 40 + 5 лежит на столе и медленно «едет»
// (её тянут); палец мамы прижимает ячейку 15 — лента останавливается с
// маленькой отдачей. Ячейка, как отрывной билет по перфорации, поднимается
// над лентой и раскрывается в большую бумажную карточку: два мини-кадра
// условного маршрута (Бишкек) — утром машина везёт пристёгнутого ребёнка
// ҮЙ → МЕКТЕП, после уроков МЕКТЕП → ҮЙ, где его встречает мама.
// Заголовок собирается по словам диктора: «1 толук сапар = ҮЙ → МЕКТЕП → ҮЙ».
// После реплики карточка складывается обратно в свою ячейку, лента
// возвращается в GRID, камера — к {540, 955, 1}: начальное состояние bonus.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { cruise } from "../../../two-schedules-2d/rig/motion";
import type { SfxPlan } from "../Bg36Audio";
import { Desk } from "../art/Desk";
import { TopHand, mixPose } from "../art/Hand";
import { clamp, easeIn, easeInOut, easeOut, hash01, lerp, prog, spring } from "../art/motion";
import { CELL_H, CELL_W, FanTape, FlatTape, TripStamp, cellCenter, cellXY } from "../art/Tape";
import {
  CAR_HALF,
  CAR_S,
  CityChip,
  DoneMark,
  FR,
  HOME_X,
  SCHOOL_DOOR,
  SCHOOL_X,
  SunIcon,
  TripFrame,
} from "../art/trip-frames";
import { ExampleTag, Headline, Pill, Txt } from "../art/ui";
import { type Cam, World, camKeys } from "../art/World";
import { useTimeline } from "../context";
import { C } from "../palette";
import { BG36_TEXT } from "../script";
import { sceneOf } from "../timing";
import { type ScenePlanArgs, lineF, useSceneArgs, wordF } from "./common";
import { hookPlan } from "./Hook";

const CELL = 15; // выбранная ячейка (ряд 2, ближе к центру)
const CAM_START: Cam = { x: 540, y: 955, zoom: 1 };
const CARD = { x: 60, y: 374, w: 960, h: 912 } as const; // карточка на экране
// Внутри карточки (координаты карточки): ряды подписей и мини-кадры.
const ROW_M = 92;
const FRAME_M = 152;
const ROW_A = 462;
const FRAME_A = 522;
const TAG_Y = 836;
const FRAME_X = (CARD.w - FR.w) / 2;

// Лента «едет»: плавный разгон до скорости V (px/кадр).
const V = 2.4;
const RAMP = 22;
const travel = (t: number) => (t <= 0 ? 0 : t < RAMP ? (V * t * t) / (2 * RAMP) : V * (t - RAMP / 2));
// Отдача после нажатия: бумага по инерции проходит ≈ 5 px и возвращается
// (скорость в момент касания совпадает со скоростью ленты).
const settle = (t: number) => (t <= 0 ? 0 : V * 6 * Math.exp(-t / 6) * Math.sin(t / 6));

// План сцены (кадры от начала сцены) — общий для движения и звука.
export const tripPlan = (a: ScenePlanArgs) => {
  const w = (i: number) => wordF(a, "n02", i);
  const line = lineF(a, "n02");
  const frames = a.sc.frames;
  const drift0 = 8;
  const press = Math.max(drift0 + 34, w(2) - 3); // «бир сапар»
  const lift = press + 8;
  const grow0 = press + 14;
  const grow1 = grow0 + 22;
  // содержимое карточки (и метка «Шарттуу мисал») проявляется, когда
  // карточка раскрыта на ≈ 70 % — метка сразу читается
  const ready = grow0 + 15;
  const title = grow0 + 6; // «1 толук сапар =»
  // утро: «эртең менен мектепке жеткирүү»
  const m0 = Math.max(w(5), grow1 - 2);
  const mArr = Math.max(w(8) + 2, m0 + 34);
  const mDone = mArr + 26;
  const segSchool = Math.min(mArr, Math.max(w(7), m0 + 10));
  // после уроков: «сабактан кийин кайра үйгө алып келүү»
  const a0 = Math.max(w(10), mArr + 18);
  const aArr = Math.max(w(13) + 2, a0 + 36);
  const meet = Math.max(w(15), aArr + 22);
  const caption = Math.max(w(14), aArr + 4);
  const segHome = Math.max(w(13) - 2, a0 + 10);
  // обратно в ячейку: после реплики, но так, чтобы успеть до конца сцены
  const out = Math.max(meet + 8, Math.min(line.to + 8, frames - 46));
  const land = out + 22; // карточка снова ячейка
  const ret0 = out + 18; // лента и камера возвращаются
  const ret1 = Math.max(ret0 + 22, frames - 2);
  const D = travel(press - drift0);
  return { frames, drift0, press, lift, grow0, grow1, ready, title, m0, mArr, mDone, segSchool, a0, aArr, meet, caption, segHome, out, land, ret0, ret1, D };
};
type TripPlan = ReturnType<typeof tripPlan>;

export const SFX_TRIP: SfxPlan = (a) => {
  const p = tripPlan(a);
  return [
    { at: p.drift0 + 2, src: "audio/sfx-paper.mp3", volume: 0.14 },
    { at: p.press - 1, src: "audio/sfx-tap.mp3", volume: 0.36 },
    { at: p.lift, src: "audio/sfx-paper.mp3", volume: 0.24 },
    { at: p.grow0 + 2, src: "audio/sfx-whoosh.mp3", volume: 0.16 },
    { at: p.m0, src: "audio/sfx-car.mp3", volume: 0.09 },
    { at: p.a0, src: "audio/sfx-car.mp3", volume: 0.08 },
    { at: p.meet - 2, src: "audio/sfx-chime.mp3", volume: 0.14 },
    { at: p.out + 4, src: "audio/sfx-paper.mp3", volume: 0.22 },
  ];
};

// Смещение ленты по x (мир).
const tapeDx = (f: number, p: TripPlan) => {
  if (f < p.press) return travel(f - p.drift0);
  if (f < p.ret0) return p.D + settle(f - p.press);
  return lerp(p.D, 0, easeInOut((f - p.ret0) / (p.ret1 - p.ret0)));
};

// Точка мира → экран (камера без поворота).
const toScreen = (cam: Cam, x: number, y: number) => ({
  x: (x - cam.x) * cam.zoom + 540,
  y: (y - cam.y) * cam.zoom + 960,
});

type Rect = { x: number; y: number; w: number; h: number };
const mixRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

const STAMP_ROT = (hash01(CELL * 3.7) - 0.5) * 26; // как у штампа в Cell

// Бумажная карточка-ячейка: при grow = 0 — жёлтая ячейка со штампом,
// при grow = 1 — кремовая карточка с жёлтой рамкой. Пока ячейка растёт,
// штамп растворяется, затем внутри проявляется кремовый лист, а жёлтое
// поле сужается до рамки.
const CardShell: React.FC<{
  readonly r: Rect;
  readonly grow: number;
  readonly lift: number;
  readonly rot: number;
  readonly zoom: number;
  readonly children?: React.ReactNode;
}> = ({ r, grow, lift, rot, zoom, children }) => {
  const m = Math.min(r.w, r.h);
  const stampO = 1 - clamp((grow - 0.04) / 0.22);
  const creamO = clamp((grow - 0.14) / 0.22);
  const open = easeInOut(clamp((grow - 0.14) / 0.62));
  const border = lerp(m * 0.1, 14, open);
  const radius = lerp(1, 34, easeOut(clamp(grow / 0.6)));
  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        transform: `rotate(${rot}deg)`,
        borderRadius: radius,
        backgroundColor: C.yellowCell,
        boxShadow: `0 ${4 + 26 * lift}px ${8 + 40 * lift}px rgba(40,48,70,${0.14 + 0.12 * lift}), 0 ${2 + 6 * lift}px ${4 + 10 * lift}px rgba(40,48,70,0.12)`,
        overflow: "hidden",
      }}
    >
      {/* перфорация справа (как у ячейки ленты) */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 2 * zoom,
          backgroundImage: `repeating-linear-gradient(180deg, rgba(150,105,0,0.35) 0 ${6 * zoom}px, transparent ${6 * zoom}px ${10 * zoom}px)`,
          opacity: stampO,
        }}
      />
      {creamO > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: border,
            top: border,
            right: border,
            bottom: border,
            borderRadius: Math.max(0, radius - 10),
            backgroundColor: C.paper,
            boxShadow: `inset 0 0 0 ${3 * open}px rgba(233,168,0,0.55)`,
            backgroundImage: "repeating-linear-gradient(115deg, rgba(200,160,60,0.05) 0 2px, transparent 2px 11px)",
            opacity: creamO,
          }}
        />
      ) : null}
      {stampO > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: r.w / 2 - (0.66 * m) / 2,
            top: r.h / 2 - (0.66 * m) / 2,
            opacity: stampO,
          }}
        >
          <TripStamp size={0.66 * m} rot={STAMP_ROT} />
        </div>
      ) : null}
      {children}
    </div>
  );
};

// Подпись мини-кадра: плашка времени суток, маршрут, галочка.
const RowLabel: React.FC<{
  readonly late?: boolean;
  readonly badge: string;
  readonly route: string;
  readonly done: number;
  readonly extra?: React.ReactNode;
}> = ({ late, badge, route, done, extra }) => (
  <div style={{ position: "absolute", left: FRAME_X, right: FRAME_X, display: "flex", alignItems: "center", gap: 16, height: 52 }}>
    <Pill tone={late ? "navy" : "yellow"} size={32}>
      <SunIcon size={34} late={late} />
      {badge}
    </Pill>
    <div style={{ fontFamily, fontSize: 40, fontWeight: 1000, color: C.navy, whiteSpace: "nowrap", lineHeight: 1 }}>
      <Txt>{route}</Txt>
    </div>
    <div style={{ width: 44, height: 44, transform: `scale(${0.6 + 0.4 * spring(done * 1.4, 6)})` }}>
      {done > 0 ? <DoneMark size={44} draw={done} /> : null}
    </div>
    <div style={{ flex: 1 }} />
    {extra}
  </div>
);

// Подпись внутри мини-кадра (вверху, по центру).
const FrameCaption: React.FC<{ readonly a: number; readonly children: React.ReactNode }> = ({ a, children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 12,
      display: "flex",
      justifyContent: "center",
      opacity: a,
      transform: `translateY(${(1 - a) * -12}px)`,
    }}
  >
    <div
      style={{
        padding: "6px 22px 8px",
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.95)",
        border: `3px solid ${C.green}`,
        color: "#1F7A45",
        fontFamily,
        fontSize: 31,
        fontWeight: 900,
        whiteSpace: "nowrap",
        boxShadow: "0 6px 14px rgba(20,40,90,0.12)",
      }}
    >
      {children}
    </div>
  </div>
);

// Машина едет от x0 к x1 за [t0, t1] (плавный разгон и торможение).
const carState = (f: number, t0: number, t1: number, x0: number, x1: number, dir: 1 | -1) => {
  const u = cruise((f - t0) / Math.max(1, t1 - t0));
  const x = lerp(x0, x1, u);
  const moving = f > t0 && f < t1 ? Math.sin(Math.PI * clamp((f - t0) / (t1 - t0))) : 0;
  return {
    x,
    dir,
    wheel: (((x - x0) / (37 * CAR_S)) * 180) / Math.PI,
    bob: Math.sin(f * 1.3) * 1.8 * moving,
  };
};

// Содержимое раскрытой карточки (координаты карточки CARD.w × CARD.h).
const CardContent: React.FC<{ readonly f: number; readonly p: TripPlan }> = ({ f, p }) => {
  // --- утро: дом → школа
  const M_X0 = HOME_X + 172;
  const M_X1 = SCHOOL_DOOR - 34 - CAR_HALF;
  const mCar = carState(f, p.m0, p.mArr, M_X0, M_X1, 1);
  // группа: в машине трое пристёгнутых детей; у школы выходят все трое
  const mKidOut = p.mArr + 5;
  const kidFrom = M_X1 + CAR_HALF - 24;
  const COATS = ["#E85D75", "#4E7BC7", "#2E8B57"];
  const mKids =
    f >= mKidOut
      ? [0, 1, 2].map((i) => {
          const t0 = mKidOut + 2 + i * 4;
          const walk = prog(f, t0, p.mDone - 6 + i * 2, easeInOut);
          const gone = clamp((f - (p.mDone - 6 + i * 2)) / 7);
          return {
            x: lerp(kidFrom - i * 16, SCHOOL_DOOR + (i - 1) * 10, walk),
            step: walk * 9 + i,
            o: f < t0 ? 0 : 1 - gone,
            s: (1 - 0.08 * gone) * (1 - 0.04 * i),
            wave: 0,
            coat: COATS[i],
          };
        })
      : [];
  const momWaveM = clamp((f - (p.m0 - 6)) / 8) * (1 - clamp((f - (p.mArr - 4)) / 10));
  const mMom = { x: HOME_X + 30, wave: momWaveM * (0.55 + 0.45 * Math.sin(f / 3.2)) };

  // --- после уроков: школа → дом, мама встречает
  const A_X0 = SCHOOL_X - 150;
  const momX = HOME_X + 22;
  const A_X1 = momX + 64 + CAR_HALF;
  const aCar = carState(f, p.a0, p.aArr, A_X0, A_X1, -1);
  const aKidOut = p.aArr + 5;
  const aKidFrom = A_X1 - CAR_HALF + 20;
  const aWalk = prog(f, aKidOut + 2, p.meet, easeInOut);
  // у этого дома выходит один ребёнок (к маме), двое едут к своим домам
  const aKids = f >= aKidOut ? [{ x: lerp(aKidFrom, momX + 40, aWalk), step: aWalk * 7, wave: clamp((f - p.meet) / 8) * 0.6, coat: COATS[0] }] : [];
  const momWaveA = clamp((f - (p.aArr - 10)) / 8) * (1 - clamp((f - p.meet - 4) / 10) * 0.4);
  const aMom = { x: momX, wave: momWaveA * (0.6 + 0.4 * Math.sin(f / 3)) };

  const activeA = prog(f, p.a0 - 10, p.a0, easeInOut);
  const mDoneP = clamp((f - p.mDone) / 10);
  const aDoneP = clamp((f - p.meet) / 10);
  const capA = easeOut((f - p.caption) / 10);
  const glowM = clamp((f - p.ready) / 8) * (1 - activeA);
  const ring = (g: number) => (g > 0.01 ? `0 0 0 ${6 * g}px rgba(255,201,14,${0.9 * g}), 0 10px 26px rgba(20,40,90,0.12)` : "0 6px 16px rgba(20,40,90,0.10)");

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: CARD.w, height: CARD.h }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: ROW_M }}>
        <RowLabel badge={BG36_TEXT.trip.morning} route={BG36_TEXT.trip.morningRoute} done={mDoneP} extra={<CityChip size={30} />} />
      </div>
      <div style={{ position: "absolute", left: FRAME_X, top: FRAME_M, borderRadius: 22, boxShadow: ring(glowM) }}>
        <TripFrame f={f} car={{ ...mCar, kids: f < mKidOut ? 3 : 0 }} kids={mKids} mom={mMom} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: ROW_A, opacity: lerp(0.5, 1, activeA) }}>
        <RowLabel late badge={BG36_TEXT.trip.afternoon} route={BG36_TEXT.trip.afternoonRoute} done={aDoneP} />
      </div>
      <div
        style={{
          position: "absolute",
          left: FRAME_X,
          top: FRAME_A,
          borderRadius: 22,
          boxShadow: ring(activeA * (1 - clamp((f - p.meet - 10) / 12) * 0.6)),
          opacity: lerp(0.5, 1, activeA),
        }}
      >
        <TripFrame f={f} afternoon car={{ ...aCar, kids: f < aKidOut ? 3 : 2 }} kids={aKids} mom={aMom}>
          {capA > 0 ? <FrameCaption a={capA}>{BG36_TEXT.trip.meet}</FrameCaption> : null}
        </TripFrame>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: TAG_Y, display: "flex", justifyContent: "center" }}>
        <ExampleTag text={BG36_TEXT.example} size={30} />
      </div>
    </div>
  );
};

// Заголовок «40 + 5 = 45» — та же разметка, что в конце сцены hook
// (чтобы при наложении сцен не было скачка), затем он гаснет.
const HookHeadline: React.FC<{ readonly f: number }> = ({ f }) => (
  <Headline f={f} at={-12} out={2} top={290} size={96}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 18, fontFamily }}>
      <span style={{ display: "inline-block", minWidth: 120, textAlign: "center" }}>{BG36_TEXT.hook.paid}</span>
      <span style={{ display: "inline-block", padding: "2px 22px 6px", borderRadius: 24, backgroundColor: C.yellow }}>{BG36_TEXT.hook.plus}</span>
      <span style={{ display: "inline-block" }}>{BG36_TEXT.hook.total}</span>
    </span>
  </Headline>
);

// Заголовок-уравнение собирается по частям; место под все части
// зарезервировано сразу, поэтому плашка не меняет размер.
const EquationHeadline: React.FC<{ readonly f: number; readonly p: TripPlan }> = ({ f, p }) => {
  const [title, route] = BG36_TEXT.trip.equation.split(" = ");
  const [home, school, back] = route.split(" → ");
  // ещё не сказанная часть — бледная «заготовка», сказанная — проявляется с пружиной
  const seg = (at: number): React.CSSProperties => {
    const a = clamp((f - at) / 6);
    return {
      display: "inline-block",
      opacity: lerp(0.16, 1, a),
      transform: `scale(${f < at ? 1 : 0.82 + 0.18 * spring((f - at) / 14, 6)})`,
    };
  };
  return (
    <Headline f={f} at={p.title} out={p.out} top={290} size={58}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily }}>
        <div>{`${title} =`}</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={seg(p.m0)}>{home}</span>
          <span style={seg(p.segSchool)}>
            <Txt>{`→ ${school}`}</Txt>
          </span>
          <span style={seg(p.segHome)}>
            <Txt>{`→ ${back}`}</Txt>
          </span>
        </div>
      </div>
    </Headline>
  );
};

// Рука в конце хука приподнята так же (см. Hook.tsx: 0,22 после касаний).
const HOOK_END_LIFT = 0.22;

export const TripScene: React.FC = () => {
  const f = useCurrentFrame();
  const args = useSceneArgs("trip");
  const p = tripPlan(args);
  const tl = useTimeline();

  // конец сцены hook: рука указывает на ячейку 44, бонусы пульсируют
  const hookSc = sceneOf(tl, "hook");
  const hp = hookPlan({ tl, sc: hookSc });
  const hookGlow = (g: number) => {
    const hf = hookSc.frames + g;
    return clamp((hf - hp.plus - 6) / 10) * (0.75 + 0.25 * Math.sin((hf - hp.plus) / 6));
  };

  const dx = tapeDx(f, p);
  const c0 = cellCenter(CELL);
  const stopX = c0.x + p.D; // где ячейка остановится
  const cam = camKeys(f, [
    [8, CAM_START],
    // камера наезжает, но не «едет» вместе с лентой — движение ленты видно
    [p.press + 4, { x: lerp(540, stopX, 0.55), y: c0.y + 64, zoom: 1.42 }],
    [p.ret0, { x: stopX, y: c0.y + 40, zoom: 1.56 }],
    [p.ret1, CAM_START],
  ]);

  // подсветка бонусов: продолжение пульса hook → ровно 0.75 → 0.6 к концу
  const glowB = lerp(lerp(hookGlow(f), 0.75, easeInOut(f / 24)), 0.6, prog(f, p.ret0, p.ret1));
  const glow = (n: number) => (n > 40 ? glowB : 0);

  // --- рука мамы: от ячейки 45 (там её оставил хук) к ячейке 15, нажим, уход вниз
  const h45 = cellCenter(45);
  const h41 = cellCenter(41);
  const HAND0 = { x: h45.x + 8, y: h41.y + 44 };
  const pressPt = { x: stopX + 4, y: c0.y + 30 };
  const hover = p.press - 7;
  let hand: { x: number; y: number; lift: number; angle: number; pose: number } | null = null;
  if (f < 8) hand = { ...HAND0, lift: HOOK_END_LIFT, angle: -14, pose: 0 };
  else if (f < hover) {
    const u = easeInOut((f - 8) / (hover - 8));
    hand = {
      x: lerp(HAND0.x, pressPt.x, u),
      y: lerp(HAND0.y, pressPt.y, u),
      lift: lerp(HOOK_END_LIFT, 0.3, u) + 0.35 * Math.sin(Math.PI * u),
      angle: lerp(-14, -6, u),
      pose: 0,
    };
  } else if (f < p.press + 3) {
    const u = easeIn((f - hover) / (p.press - hover));
    hand = { x: pressPt.x + (f >= p.press ? settle(f - p.press) : 0), y: pressPt.y - 3 * u, lift: 0.3 * (1 - u), angle: -6, pose: 0 };
  } else if (f < p.press + 26) {
    // палец отпускает ячейку и рука уходит вниз, за край кадра
    const u = easeInOut((f - p.press - 3) / 23);
    hand = {
      x: pressPt.x + settle(f - p.press) + 70 * u,
      y: pressPt.y - 3 + 720 * u,
      lift: 0.55 * easeOut((f - p.press - 3) / 7),
      angle: -6 + 8 * u,
      pose: 0.5 * u,
    };
  }

  // --- карточка: подъём ячейки, раскрытие, возврат
  const cellW = { x: cellXY(CELL).x + dx, y: cellXY(CELL).y };
  const s0 = toScreen(cam, cellW.x, cellW.y);
  const lifted = clamp((f - p.lift) / 8) * (1 - clamp((f - (p.land - 8)) / 8));
  const ls = 1 + 0.1 * easeOut(lifted);
  const base: Rect = {
    x: s0.x + (CELL_W * cam.zoom * (1 - ls)) / 2,
    y: s0.y + (CELL_H * cam.zoom * (1 - ls)) / 2 - 14 * lifted,
    w: CELL_W * cam.zoom * ls,
    h: CELL_H * cam.zoom * ls,
  };
  // раскрытие: плавно, в конце бумага чуть «дышит» (≈ 2 %)
  const growIn = easeInOut((f - p.grow0) / (p.grow1 - p.grow0)) + 0.022 * Math.sin(Math.PI * clamp((f - p.grow1 + 5) / 12));
  const grow = f < p.out + 2 ? growIn : 1 - easeInOut((f - p.out - 2) / (p.land - p.out - 2));
  const r = mixRect(base, CARD, grow);
  const showCard = f >= p.lift && f < p.land;
  // при сворачивании содержимое уменьшается вместе с карточкой и гаснет
  // только когда карточка стала меньше ≈ 60 % (большой пустой карточки нет)
  const contentO = easeOut((f - p.ready) / 8) * (f < p.out + 2 ? 1 : clamp((grow - 0.42) / 0.2));
  const k = Math.min(r.w / CARD.w, r.h / CARD.h);
  const veil = 0.6 * (prog(f, p.grow0, p.grow1) - prog(f, p.out + 2, p.land));

  return (
    <>
      <World cam={cam}>
        <Desk />
        {f < p.grow1 + 10 ? (
          <FanTape x={140 + dx} fold={[0, 0, 0, 0]} glow={glow} />
        ) : (
          <FlatTape x={140 + dx} glow={glow} />
        )}
        {showCard ? (
          // пустое место оторванной ячейки: виден стол
          <div
            style={{
              position: "absolute",
              left: cellW.x,
              top: cellW.y,
              width: CELL_W,
              height: CELL_H,
              backgroundColor: C.desk,
              boxShadow: "inset 0 3px 8px rgba(40,48,70,0.22)",
              outline: `2px dashed ${C.yellowDeep}`,
              outlineOffset: -2,
            }}
          />
        ) : null}
        {hand ? (
          <TopHand x={hand.x} y={hand.y} pose={mixPose("point", "rest", hand.pose)} angle={hand.angle} lift={hand.lift} s={1.05} />
        ) : null}
      </World>
      {veil > 0.001 ? <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(247,243,234,${veil})` }} /> : null}
      {showCard ? (
        <CardShell r={r} grow={grow} lift={Math.max(lifted, grow)} rot={-2.2 * lifted * (1 - grow)} zoom={cam.zoom}>
          {contentO > 0.001 ? (
            <div
              style={{
                position: "absolute",
                left: (r.w - CARD.w * k) / 2,
                top: (r.h - CARD.h * k) / 2,
                width: CARD.w,
                height: CARD.h,
                transform: `scale(${k})`,
                transformOrigin: "0 0",
                opacity: contentO,
              }}
            >
              <CardContent f={f} p={p} />
            </div>
          ) : null}
        </CardShell>
      ) : null}
      {f < 14 ? <HookHeadline f={f} /> : null}
      {f >= p.title - 2 ? <EquationHeadline f={f} p={p} /> : null}
    </>
  );
};
