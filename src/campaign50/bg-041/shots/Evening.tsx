// Сцена 1 «evening» — АЯГЫ: спокойный вечер семьи в Бишкеке (следствие).
// Снятая анимация (вперёд, E_LEN кадров): мама вовремя закрывает ноутбук
// и с улыбкой поворачивается к семье; сын ставит последний жёлтый кубик
// на башню из конструктора, папа придерживает основание; все радуются.
// Монтаж сцены:
//   ▶ анимация вперёд + заголовок, набирающийся с конца («АЯГЫНАН
//     БАШТАЙЛЫ»); диктор: «Кечинде шашпай отурууга кантип жетишти?» →
//     вопрос «Бул эмнеден башталды?»;
//   ❚❚ короткая пауза → ◀◀ перемотка ×3: кубик прыгает обратно в руку,
//     крышка ноутбука открывается, мама снова за работой;
//   ◀◀ дальше назад: стрелки часов бегут обратно (19:30 → 13:50), за окном
//     светлеет, лампа гаснет, камера въезжает в жёлтый рюкзак на крючке —
//     склейка с рюкзаком сына в следующей сцене.
import { fontFamily } from "../../../fonts";
import { box, easeInOut, easeOut, NAVY, NAVY_SOFT, prog, YELLOW, YELLOW_DEEP } from "../art";
import { cueFrames, local, tapeAt, type SceneProps, type TapeSeg } from "../kit";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, keys, keysV, lerp, type Vec } from "../rig/motion";
import { BG41_TEXT } from "../script";
import { ADULT_H, BlockTower, Cam, CHILD_H, Cube, DeskFront, FLOOR_Y, LaptopProfile, Room, ROOM, tableTop, TOP_CUBE_COLOR, TOWER_TOP } from "../sets";
import { CHAPTER_POS, type HudState } from "../tape";
import type { Bg41Timeline } from "../timing";

const T = BG41_TEXT.evening;
const H = ADULT_H;
const TOP = tableTop(H);
const SEAT = 0.27 * H;

// Снятая анимация (кадры e).
export const E_LEN = 150;
const POS = { dad: 215, tower: 398, son: 560, hinge: 662, mom: 885 } as const;
const LAPTOP_S = 1.2;
const LID = 190 * LAPTOP_S;
// крышка: 1 — открыта, 0 — закрыта
const lidAt = (e: number) => 1 - easeInOut(prog(e, 16, 18));
const lidTip = (e: number): Vec => {
  const a = (-108 * lidAt(e) * Math.PI) / 180;
  return { x: POS.hinge + Math.cos(a) * LID, y: TOP + Math.sin(a) * LID - 12 };
};
// жёлтый кубик: в руке сына → дуга → на башне
const CUBE_PLACE = [70, 94] as const;
const towerTop = TOWER_TOP(POS.tower, TOP);
const sonPlace: Place = { x: POS.son, y: FLOOR_Y, h: CHILD_H };
const handHold = (e: number): Vec => ({ x: POS.son - 70 + Math.sin(e / 11) * 6, y: 1092 + Math.sin(e / 9) * 5 });
const cubeAt = (e: number): { p: Vec; rot: number } => {
  if (e <= CUBE_PLACE[0]) return { p: { x: handHold(e).x - 6, y: handHold(e).y + 30 }, rot: -8 + Math.sin(e / 10) * 4 };
  const u = prog(e, CUBE_PLACE[0], CUBE_PLACE[1] - CUBE_PLACE[0]);
  const a = { x: handHold(CUBE_PLACE[0]).x - 6, y: handHold(CUBE_PLACE[0]).y + 30 };
  const b = { x: towerTop.x, y: towerTop.y };
  const k = easeInOut(u);
  const arc = -110 * Math.sin(Math.PI * k);
  // маленький отскок после касания
  const bounce = e > CUBE_PLACE[1] ? -10 * Math.max(0, Math.sin(((e - CUBE_PLACE[1]) / 8) * Math.PI)) * Math.exp(-(e - CUBE_PLACE[1]) / 10) : 0;
  return { p: { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) + arc + bounce }, rot: lerp(-8, 0, k) };
};

// Ключи монтажа сцены (кадры сцены).
export const eveningKeys = (tl: Bg41Timeline) => {
  const n01 = cueFrames(tl, "n01");
  const len = Math.round((tl.scenes[0].to - tl.scenes[0].from) * 30);
  const pause = Math.max(E_LEN, n01.to + 12);
  const rew = pause + 9;
  const rewEnd = rew + Math.ceil(E_LEN / 3);
  return { n01, len, pause, rew, rewEnd, question: n01.to + 4 };
};

const segsOf = (k: ReturnType<typeof eveningKeys>): TapeSeg[] => [
  { at: 0, mode: "play", from: 0 },
  { at: k.pause, mode: "pause", from: E_LEN },
  { at: k.rew, mode: "rew", from: E_LEN, speed: 3 },
];

const hhmm = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
// часы эпизода: 19:30 вечера; при «глубокой» перемотке бегут к 13:50
const EVENING_MIN = 19 * 60 + 30;
const AFTERNOON_MIN = 13 * 60 + 50;
const clockMin = (k: ReturnType<typeof eveningKeys>, f: number, e: number) =>
  f < k.rew ? EVENING_MIN + e * 0.02 : lerp(EVENING_MIN + E_LEN * 0.02, AFTERNOON_MIN, easeInOut(prog(f, k.rew, k.len - k.rew)));

export const eveningHud = (tl: Bg41Timeline, f: number): HudState => {
  const k = eveningKeys(tl);
  const { mode, speed } = tapeAt(segsOf(k), f, E_LEN);
  const e = tapeAt(segsOf(k), f, E_LEN).shot;
  return {
    mode: f >= k.rew ? "rew" : mode,
    speed: f >= k.rew ? Math.max(3, speed) : speed,
    clock: hhmm(clockMin(k, f, e)),
    pos: lerp(CHAPTER_POS.evening, 0.92, easeInOut(prog(f, k.rew, k.len - k.rew))),
  };
};

// Заголовок набирается с конца: буквы появляются справа налево.
const ReverseType: React.FC<{ readonly text: string; readonly u: number; readonly size: number; readonly color: string }> = ({ text, u, size, color }) => {
  const chars = [...text];
  const shown = Math.round(u * chars.length);
  return (
    <div style={{ fontSize: size, fontWeight: 1000, color, letterSpacing: 2, lineHeight: 1.05, whiteSpace: "nowrap" }}>
      {chars.map((c, i) => {
        const vis = i >= chars.length - shown;
        const age = vis ? Math.min(1, (shown - (chars.length - 1 - i)) / 3) : 0;
        return (
          <span key={i} style={{ opacity: vis ? 1 : 0, display: "inline-block", transform: `translateY(${(1 - easeOut(age)) * -14}px)` }}>
            {c === " " ? "\u00A0" : c}
          </span>
        );
      })}
    </div>
  );
};

export const Evening: React.FC<SceneProps> = ({ t, tl }) => {
  const { f } = local(tl, "evening", t);
  const k = eveningKeys(tl);
  const { shot: e } = tapeAt(segsOf(k), f, E_LEN);
  // «глубокая» перемотка после конца снятой анимации: свет дня возвращается
  const deep = easeInOut(prog(f, k.rewEnd - 6, k.len - k.rewEnd + 6));
  const evening = 1 - 0.75 * deep;
  const lamp = 1 - deep;
  // камера: лёгкий наезд, в конце — въезд в рюкзак на крючке
  const zoomIn = easeInOut(prog(f, k.rewEnd - 4, k.len - k.rewEnd + 4));
  const pack = { x: ROOM.hook.x, y: ROOM.hook.y + 85 };
  const z = keys(f, [[0, 1.26], [k.pause, 1.3]]) * (1 + zoomIn * 8.8);
  const cx = lerp(keys(f, [[0, 548], [k.pause, 556]]), pack.x, easeInOut(Math.min(1, zoomIn * 1.6)));
  const cy = lerp(keys(f, [[0, 871], [k.pause, 880]]), pack.y, easeInOut(Math.min(1, zoomIn * 1.6)));
  const lid = lidAt(e);
  const cube = cubeAt(e);
  const holding = e <= CUBE_PLACE[0] + 6;
  const happy = e >= 100;
  const title = prog(f, 4, 34);
  const titleOut = easeInOut(prog(f, k.n01.to - 2, 12));
  const q = easeOut(prog(f, k.question, 12)) * (1 - easeInOut(prog(f, k.rew + 14, 12)));
  return (
    <div style={box({ inset: 0, overflow: "hidden", fontFamily })}>
      <Cam cx={cx} cy={cy} z={z}>
        <Room evening={evening} lamp={lamp} clockMin={clockMin(k, f, e)} clockBlur={f >= k.rew ? 1 : 0} />
        {/* папа: сидит слева, придерживает основание башни */}
        <Actor
          uid="ev-dad"
          look="dad"
          f={e}
          sceneLen={E_LEN}
          seed={41}
          place={() => ({ x: POS.dad, y: FLOOR_Y, h: H })}
          face={(t2) => keys(t2, [[0, 0.5], [60, 0.45], [96, 0.35], [112, 0.75]])}
          pose={(t2) => ({
            sit: 1,
            seat: SEAT,
            lean: keys(t2, [[0, 6], [80, 10], [100, 4]]),
            expr: t2 >= 98 ? ("smile" as const) : ("calm" as const),
            lookY: keys(t2, [[0, 0.45], [96, 0.35], [112, 0.05]]),
            headTilt: t2 >= 100 ? 5 : 0,
            armR: { target: { x: POS.tower - 128, y: TOP - 18 }, shape: "open" as const, elbow: "down" as const, behind: false },
            armL: {
              target: keysV(t2, [[0, { x: POS.dad + 70, y: TOP - 6 }], [100, { x: POS.dad + 70, y: TOP - 6 }], [108, { x: POS.dad + 110, y: TOP - 90 }], [120, { x: POS.dad + 92, y: TOP - 70 }]], anticipate),
              shape: t2 >= 104 ? ("open" as const) : ("relax" as const),
              elbow: "down" as const,
              behind: false,
            },
          })}
        />
        {/* сын: стоит за столом с жёлтым кубиком */}
        <Actor
          uid="ev-son"
          look="son"
          f={e}
          sceneLen={E_LEN}
          seed={42}
          place={() => sonPlace}
          face={(t2) => keys(t2, [[0, -0.35], [80, -0.45], [100, -0.1], [114, 0.55]])}
          pose={(t2) => ({
            packOff: true,
            expr: t2 >= 96 ? ("smile" as const) : t2 >= 60 ? ("thinking" as const) : ("calm" as const),
            lookY: keys(t2, [[0, 0.5], [86, 0.6], [100, 0.2], [114, 0.0]]),
            lean: keys(t2, [[0, 4], [80, 12], [100, 2]]),
            armR: {
              target: keysV(
                t2,
                [
                  [0, handHold(0)],
                  [CUBE_PLACE[0], handHold(CUBE_PLACE[0])],
                  [CUBE_PLACE[1] - 4, { x: towerTop.x + 8, y: towerTop.y - 52 }],
                  [CUBE_PLACE[1] + 10, { x: towerTop.x + 20, y: towerTop.y - 74 }],
                  [114, { x: POS.son - 96, y: 1010 }],
                  [124, { x: POS.son - 104, y: 996 }],
                ],
                anticipate,
              ),
              shape: t2 <= CUBE_PLACE[1] ? ("pinch" as const) : t2 < 112 ? ("open" as const) : ("open" as const),
              elbow: "down" as const,
              behind: false,
            },
            armL: {
              target: keysV(t2, [[0, { x: POS.son + 60, y: TOP - 8 }], [104, { x: POS.son + 60, y: TOP - 8 }], [114, { x: POS.son + 96, y: 1010 }], [124, { x: POS.son + 104, y: 996 }]], anticipate),
              shape: "open" as const,
              elbow: "down" as const,
              behind: false,
            },
          })}
        />
        {/* мама: сидит справа, закрывает ноутбук и поворачивается к семье */}
        <Actor
          uid="ev-mom"
          look="momHome"
          f={e}
          sceneLen={E_LEN}
          seed={43}
          place={() => ({ x: POS.mom, y: FLOOR_Y, h: H })}
          face={(t2) => keys(t2, [[0, -0.45], [34, -0.5], [48, -0.75], [100, -0.8]])}
          pose={(t2) => ({
            sit: 1,
            seat: SEAT,
            expr: t2 >= 36 ? ("softSmile" as const) : ("thinking" as const),
            lean: keys(t2, [[0, 8], [30, 12], [52, 4], [100, 6]]),
            lookY: keys(t2, [[0, 0.45], [30, 0.5], [48, 0.2], [96, 0.35], [116, 0.2]]),
            exhale: keys(t2, [[30, 0], [44, 1], [70, 0.4]]),
            headTilt: t2 >= 48 ? -4 : 0,
            armL: {
              target: keysV(
                t2,
                [
                  [0, { x: POS.hinge + 120, y: TOP - 24 }],
                  [10, { x: lidTip(10).x + 10, y: lidTip(10).y + 6 }],
                  [16, { x: lidTip(16).x + 10, y: lidTip(16).y + 6 }],
                  [34, { x: lidTip(34).x + 14, y: lidTip(34).y - 6 }],
                  [46, { x: POS.hinge + 110, y: TOP - 30 }],
                ],
                anticipate,
              ),
              shape: t2 >= 8 && t2 < 40 ? ("open" as const) : ("relax" as const),
              elbow: "down" as const,
              behind: false,
            },
            armR: {
              target: keysV(t2, [[0, { x: POS.hinge + 170, y: TOP - 20 }], [44, { x: POS.hinge + 170, y: TOP - 20 }], [56, { x: POS.hinge + 150, y: TOP - 14 }]], anticipate),
              shape: "relax" as const,
              elbow: "down" as const,
              behind: false,
            },
          })}
        />
        <DeskFront x={30} w={1020} top={TOP} />
        <LaptopProfile x={POS.hinge} y={TOP} open={lid} s={LAPTOP_S} />
        <BlockTower x={POS.tower} y={TOP} />
        <Cube x={cube.p.x} y={cube.p.y} color={TOP_CUBE_COLOR} rot={cube.rot} />
        {/* пальцы сына поверх кубика, пока он в руке */}
        {holding ? <div style={box({ left: cube.p.x - 30, top: cube.p.y - 70, width: 28, height: 22, borderRadius: 11, backgroundColor: "#E8B48D" })} /> : null}
        {happy ? (
          <svg width={1} height={1} style={{ position: "absolute", left: towerTop.x, top: towerTop.y - 80, overflow: "visible", opacity: 1 - prog(e, 128, 20) }}>
            {[-50, -20, 20, 50].map((dx, i) => (
              <path key={i} d={`M ${dx * 0.6} ${-6 - Math.abs(dx) * 0.2} L ${dx} ${-34 - Math.abs(dx) * 0.4 - prog(e, 100, 20) * 18}`} stroke={YELLOW_DEEP} strokeWidth={8} strokeLinecap="round" opacity={prog(e, 98, 6)} />
            ))}
          </svg>
        ) : null}
      </Cam>
      {/* заголовок, набирающийся с конца */}
      {f < k.n01.to + 12 ? (
        <div
          style={box({
            left: 60,
            right: 60,
            top: 398,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "22px 24px 26px",
            borderRadius: 36,
            backgroundColor: "rgba(255,255,255,0.93)",
            boxShadow: "0 12px 30px rgba(20,40,75,0.18)",
            opacity: Math.min(1, title * 4) * (1 - titleOut),
            transform: `scale(${1 - 0.06 * titleOut}) translateY(${-titleOut * 30}px)`,
          })}
        >
          <ReverseType text={T.kicker} u={easeOut(prog(f, 4, 16))} size={46} color={NAVY_SOFT} />
          <div style={{ padding: "4px 22px 8px", borderRadius: 20, backgroundColor: YELLOW }}>
            <ReverseType text={T.title} u={easeOut(prog(f, 14, 26))} size={70} color={NAVY} />
          </div>
        </div>
      ) : null}
      {/* вопрос: «Бул эмнеден башталды?» */}
      {q > 0 ? (
        <div style={box({ left: 0, right: 0, top: 430, display: "flex", justifyContent: "center", opacity: q })}>
          <div
            style={{
              transform: `scale(${0.9 + 0.1 * q})`,
              padding: "20px 38px 24px",
              borderRadius: 40,
              backgroundColor: NAVY,
              color: "#FFFFFF",
              fontSize: 64,
              fontWeight: 1000,
              boxShadow: "0 14px 30px rgba(20,40,75,0.28)",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            {T.question}
            <span style={{ display: "inline-flex", width: 70, height: 70, borderRadius: 35, backgroundColor: YELLOW, color: NAVY, alignItems: "center", justifyContent: "center", fontSize: 54, transform: `rotate(${Math.sin(f / 5) * 8}deg)` }}>?</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Эффекты вечера (во время ▶): крышка ноутбука, кубик на башне, радость.
export const eveningSfx = (tl: Bg41Timeline) => {
  const s = tl.scenes[0].from;
  return [
    { src: "audio/sfx-tap.mp3", at: s + 32 / 30, volume: 0.35 },
    { src: "audio/sfx-pop.mp3", at: s + CUBE_PLACE[1] / 30, volume: 0.32 },
    { src: "audio/sfx-chime.mp3", at: s + 100 / 30, volume: 0.12 },
  ];
};
