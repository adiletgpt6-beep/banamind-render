// Сцена 3 «decision» — ЧЕЧИМ СЫНООДОН КИЙИН. Вид сверху на семейный стол,
// тёплый вечерний свет.
// Снятая анимация (вперёд, кадры e 0…SHOT_LEN): на раскрытой жёлтой папке
// «Биздин чечим» карточка первой полной пробной поездки (утром ҮЙ → МЕКТЕП,
// после уроков МЕКТЕП → ҮЙ, «акысыз»); палец мамы проходит по обоим
// отрезкам, папа ручкой ставит галочку «Улантабыз», мама закрывает папку
// (обложка поворачивается в 3D вокруг корешка).
// В сцене: кадр 0 — закрытая папка во весь кадр (склейка с жёлтым
// рюкзаком) → отъезд → ◀◀ перемотка снятой анимации ≈ ×2 (папка
// открывается, галочка стирается, руки уходят) → ❚❚ на реплике n03:
// камера наезжает на карточку пробы — белая машина проезжает утренний и
// дневной отрезки, отметки, штамп «акысыз» → на «улантууну» стрелка от
// пробы к пустому квадрату «Улантабыз» и подпись главы → въезд в
// мини-карту маршрута до полного кадра (склейка с картой следующей сцены).
import { fontFamily } from "../../../fonts";
import { box, easeIn, easeInOut, mix, prog } from "../art";
import { cueFrames, local, tapeAt, wordFrame, type SceneProps, type TapeSeg } from "../kit";
import { BG41_TEXT } from "../script";
import { Cam } from "../sets";
import { ChapterLabel, CHAPTER_POS, type HudState } from "../tape";
import type { Bg41Timeline } from "../timing";
import {
  along,
  CARD_C,
  CARD_WORLD,
  CHECKBOX,
  coverEdge,
  DAD_ARM,
  DecisionArrow,
  DecisionPage,
  FOLDER_CY,
  FolderCover,
  LEG_POLY,
  MOM_ARM,
  PAGE_W,
  SPINE,
  STRIP,
  Table,
  TapRing,
  tickPoint,
  TopArm,
  wristFor,
  type CardState,
  type HandPose,
  type Pt,
} from "./decision-parts";

const T = BG41_TEXT.decision;

// ---------- Снятая анимация (вперёд) ----------
export const SHOT_LEN = 134;

// палец мамы проводит по маршрутам на мини-картах (утро, затем после уроков)
const onLeg = (leg: 1 | 2, u: number): Pt => {
  const p = along(LEG_POLY[leg], u);
  return { x: CARD_WORLD.x + STRIP.x + p.x, y: CARD_WORLD.y + (leg === 1 ? STRIP.y1 : STRIP.y2) + p.y };
};
const TRACE = { 1: [0.12, 0.78], 2: [0.16, 0.8] } as const;
const P1 = onLeg(1, TRACE[1][0]);
const P2 = onLeg(2, TRACE[2][0]);
const GRIP_Y = 1160;

type Arm = { readonly x: number; readonly y: number; readonly angle: number; readonly pose: HandPose; readonly s: number; readonly lift: number } | null;

const lerpPt = (a: Pt, b: Pt, u: number): Pt => ({ x: mix(a.x, b.x, u), y: mix(a.y, b.y, u) });

// касание: палец чуть «нажимает» (кисть уменьшается к кончику пальца)
const press = (e: number, at: number) => 1 - 0.045 * Math.sin(Math.PI * prog(e, at, 5));

const momArm = (e: number): Arm => {
  if (e < 6 || e >= 126) return null;
  const off1: Pt = { x: -200, y: 2010 };
  const t1End = onLeg(1, TRACE[1][1]);
  const g0 = coverEdge(0, GRIP_Y);
  const wg = wristFor("grip", g0, 72);
  if (e < 22) {
    const u = easeInOut(prog(e, 6, 16));
    return { ...lerpPt(off1, wristFor("point", P1, 18), u), angle: mix(26, 18, u), pose: "point", s: 1, lift: 1 - u };
  }
  if (e < 34) {
    const s = press(e, 22);
    const tip = onLeg(1, mix(TRACE[1][0], TRACE[1][1], easeInOut(prog(e, 23, 11))));
    return { ...wristFor("point", tip, 18, s), angle: 18, pose: "point", s, lift: 0 };
  }
  if (e < 42) {
    const u = easeInOut(prog(e, 34, 8));
    return { ...lerpPt(wristFor("point", t1End, 18), wristFor("point", P2, 14), u), angle: mix(18, 14, u), pose: "point", s: 1, lift: 0.5 * Math.sin(Math.PI * u) };
  }
  if (e < 54) {
    const s = press(e, 42);
    const tip = onLeg(2, mix(TRACE[2][0], TRACE[2][1], easeInOut(prog(e, 43, 11))));
    return { ...wristFor("point", tip, 14, s), angle: 14, pose: "point", s, lift: 0 };
  }
  if (e < 84) {
    const u = easeInOut(prog(e, 54, 26));
    return { ...lerpPt(wristFor("point", onLeg(2, TRACE[2][1]), 14), wg, u), angle: mix(14, 72, u), pose: e < 66 ? "point" : "grip", s: 1, lift: 0.6 * Math.sin(Math.PI * u) };
  }
  if (e < 104) {
    const th = coverTheta(e);
    const edge = coverEdge(th, GRIP_Y);
    const ang = mix(72, 36, easeInOut(prog(e, 84, 20)));
    return { ...wristFor("grip", edge, ang, edge.k), angle: ang, pose: "grip", s: edge.k, lift: (edge.k - 1) * 3 };
  }
  // отпустила обложку — рука уходит
  const edge = coverEdge(coverTheta(104), GRIP_Y);
  const wr = wristFor("grip", edge, 36, edge.k);
  const u = easeInOut(prog(e, 104, 22));
  return { ...lerpPt(wr, { x: -240, y: 1980 }, u), angle: 36, pose: "grip", s: mix(edge.k, 1, u), lift: mix((edge.k - 1) * 3, 1, u) };
};

const dadArm = (e: number): Arm => {
  if (e < 28 || e >= 90) return null;
  const off: Pt = { x: 1260, y: 2060 };
  if (e < 50) {
    const u = easeInOut(prog(e, 28, 22));
    const s = mix(1.05, 1, u);
    const w0 = wristFor("pen", tickPoint(0), -30, s);
    return { ...lerpPt(off, w0, u), angle: mix(-36, -30, u), pose: "pen", s, lift: 1 - u };
  }
  if (e < 68) {
    const u = tickU(e);
    return { ...wristFor("pen", tickPoint(u), -30 + 4 * u), angle: -30 + 4 * u, pose: "pen", s: 1, lift: 0 };
  }
  const u = easeInOut(prog(e, 68, 22));
  const s = mix(1, 1.05, u);
  const w1 = wristFor("pen", tickPoint(1), -26, 1);
  return { ...lerpPt(w1, { x: 1300, y: 2020 }, u), angle: mix(-26, -36, u), pose: "pen", s, lift: u };
};

const tickU = (e: number) => easeInOut(prog(e, 50, 14));

// обложка: подъём рукой мамы, затем падает сама и чуть подпрыгивает
function coverTheta(e: number) {
  if (e < 84) return 0;
  if (e < 104) return 112 * easeInOut(prog(e, 84, 20));
  if (e < 116) return 112 + 68 * easeIn(prog(e, 104, 12));
  if (e < 126) return 180 - 6 * Math.sin(Math.PI * prog(e, 116, 10));
  return 180;
}

const shot = (e: number) => ({
  theta: coverTheta(e),
  mom: momArm(e),
  dad: dadArm(e),
  tick: tickU(e),
  tap1: prog(e, 22, 12),
  tap2: prog(e, 42, 12),
  card: {
    check1: prog(e, 0, 7),
    check2: prog(e, 4, 7),
    stamp: prog(e, 6, 8),
    route1: prog(e, 0, 8),
    route2: prog(e, 3, 8),
  },
});

// ---------- Ключевые кадры сцены (по фактической речи) ----------
export const decisionKeys = (tl: Bg41Timeline) => {
  const len = local(tl, "decision", tl.scenes.find((s) => s.id === "decision")!.from).len;
  const n03 = cueFrames(tl, "n03");
  const rewStart = 6;
  const rewEnd = Math.max(rewStart + 40, n03.from - 2);
  const speed = SHOT_LEN / (rewEnd - rewStart);
  const pushA = rewEnd;
  const pushB = rewEnd + 24;
  const wTol = wordFrame(tl, "n03", "толук", 0.3);
  const wUlan = wordFrame(tl, "n03", "улантууну", 0.82);
  const m0 = Math.max(pushB, wTol - 24);
  const m1 = m0 + 30;
  const n0 = m1 + 6;
  const n1 = n0 + 30;
  const stampAt = n1 + 6;
  const pullA = Math.max(stampAt + 12, wUlan - 16);
  const pullB = pullA + 24;
  const arrowA = Math.max(pullA + 10, wUlan - 2);
  const zoomA = len - 32;
  return { len, n03, rewStart, rewEnd, speed, pushA, pushB, m0, m1, n0, n1, stampAt, pullA, pullB, arrowA, wUlan, zoomA, zoomB: len - 1 };
};

const segs = (k: ReturnType<typeof decisionKeys>): TapeSeg[] => [
  { at: 0, mode: "pause", from: SHOT_LEN },
  { at: k.rewStart, mode: "rew", from: SHOT_LEN, speed: k.speed },
];

export const decisionHud = (tl: Bg41Timeline, f: number): HudState | null => {
  const k = decisionKeys(tl);
  const pos = mix(CHAPTER_POS.route, CHAPTER_POS.decision, easeInOut(prog(f, 0, k.rewEnd)));
  return { mode: f < k.rewEnd ? "rew" : "pause", speed: k.speed, pos };
};

// ---------- Камера ----------
type CamV = { readonly x: number; readonly y: number; readonly z: number };
const lerpCam = (a: CamV, b: CamV, u: number): CamV => ({ x: mix(a.x, b.x, u), y: mix(a.y, b.y, u), z: Math.exp(mix(Math.log(a.z), Math.log(b.z), u)) });

const STRIP1_C: Pt = { x: CARD_WORLD.x + STRIP.x + STRIP.w / 2, y: CARD_WORLD.y + STRIP.y1 + STRIP.h / 2 };

const camAt = (f: number, k: ReturnType<typeof decisionKeys>): CamV => {
  const start: CamV = { x: SPINE + PAGE_W / 2, y: FOLDER_CY, z: 2.85 };
  const over: CamV = { x: 540, y: 962, z: 1 + 0.035 * easeInOut(prog(f, 16, k.rewEnd - 16)) };
  const card: CamV = { x: CARD_C.x, y: CARD_C.y + 24, z: 1.5 * (1 + 0.03 * easeInOut(prog(f, k.pushB, k.pullA - k.pushB))) };
  const pull: CamV = { x: 540, y: 921, z: 1.12 * (1 + 0.025 * easeInOut(prog(f, k.pullB, k.zoomA - k.pullB))) };
  const map: CamV = { x: STRIP1_C.x, y: STRIP1_C.y, z: 3.0 };
  let c = lerpCam(start, over, easeInOut(prog(f, 0, 16)));
  if (f >= k.pushA) c = lerpCam(c, card, easeInOut(prog(f, k.pushA, k.pushB - k.pushA)));
  if (f >= k.pullA) c = lerpCam(c, pull, easeInOut(prog(f, k.pullA, k.pullB - k.pullA)));
  if (f >= k.zoomA) c = lerpCam(c, map, easeInOut(prog(f, k.zoomA, k.zoomB - k.zoomA)));
  return c;
};

// ---------- Сцена ----------
export const Decision: React.FC<SceneProps> = ({ t, tl }) => {
  const { f } = local(tl, "decision", t);
  const k = decisionKeys(tl);
  const e = tapeAt(segs(k), f, SHOT_LEN).shot;
  const sh = shot(e);
  const paused = f >= k.rewEnd;
  const cam = camAt(f, k);

  // ❚❚: карточка пробы «оживает» (машина, отметки, штамп)
  const r1 = easeInOut(prog(f, k.m0, k.m1 - k.m0));
  const r2 = easeInOut(prog(f, k.n0, k.n1 - k.n0));
  const push = easeInOut(prog(f, k.pushA, k.pushB - k.pushA));
  const pull = easeInOut(prog(f, k.pullA, k.pullB - k.pullA));
  const grow = easeInOut(prog(f, k.zoomA + 2, k.zoomB - k.zoomA - 9));
  const card: CardState = paused
    ? {
        check1: prog(f, k.m1, 8),
        check2: prog(f, k.n1, 8),
        stamp: prog(f, k.stampAt, 12),
        route1: r1,
        route2: r2,
        car1: { u: r1, alpha: prog(f, k.m0 - 4, 5) * (1 - prog(f, k.m1 + 2, 6)) },
        car2: { u: r2, alpha: prog(f, k.n0 - 4, 5) * (1 - prog(f, k.zoomA, 8)) },
        lift: push - pull,
        grow,
      }
    : sh.card;

  const frost = 0.9 * (push - pull);
  const arrow = easeInOut(prog(f, k.arrowA, 18));
  const fadeEnd = 1 - prog(f, k.zoomA, 10);
  const pulse = f >= k.arrowA + 16 ? (0.55 + 0.45 * Math.sin((f - k.arrowA - 16) / 4.2)) * fadeEnd : 0;
  const cb: Pt = { x: CHECKBOX.x + 30, y: CHECKBOX.y - 16 };

  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: "#F1DFC2", fontFamily })}>
      <Cam cx={cam.x} cy={cam.y} z={cam.z}>
        <Table />
        <DecisionPage tick={paused ? 0 : sh.tick} pulse={pulse} />
        {frost > 0 ? <div style={box({ left: -900, top: -900, width: 2880, height: 3900, backgroundColor: `rgba(255,249,238,${frost})` })} /> : null}
        <FolderCover theta={paused ? 0 : sh.theta} card={card} />
        {!paused ? (
          <>
            <TapRing x={P1.x} y={P1.y} u={sh.tap1} />
            <TapRing x={P2.x} y={P2.y} u={sh.tap2} />
          </>
        ) : null}
        {!paused && sh.dad ? <TopArm uid="dec-dad" {...sh.dad} look={DAD_ARM} /> : null}
        {!paused && sh.mom ? <TopArm uid="dec-mom" {...sh.mom} look={MOM_ARM} /> : null}
        <DecisionArrow
          from={{ x: CARD_C.x + 100, y: CARD_WORLD.y + 136 }}
          c1={{ x: CARD_C.x + 230, y: CARD_WORLD.y + 40 }}
          c2={{ x: cb.x + 30, y: cb.y - 160 }}
          to={cb}
          draw={arrow}
          opacity={fadeEnd}
        />
      </Cam>
      <ChapterLabel text={T.label} small={T.pay} u={prog(f, k.wUlan - 4, 16)} out={prog(f, k.zoomA, 10)} />
    </div>
  );
};
