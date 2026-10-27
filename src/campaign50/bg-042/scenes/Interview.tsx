// 2. Интервью «с выезда». Новости переходят «на место событий»: настоящая
// офисная мама за столом, на её мониторе всплывает окно шуточных новостей,
// мини-репортёр тянет микрофон — и микрофон проходит сквозь экран и
// высовывается из монитора прямо к её лицу. Мама честно отвечает про самый
// трудный момент: время забирать ребёнка из школы наступает раньше, чем
// кончается «Жыйын» (взгляд на переговорную, на часы, напоминание телефона).
// Камера: средний план офиса → на ответе мягкий наезд на «двойку» мама +
// монитор → к концу сцены ровно OFFICE_WIDE (стык со сценой «search»).
import React from "react";
import { AbsoluteFill } from "remotion";
import { EXPR, mixExpr, type ExprId, type Expression } from "../../../two-schedules-2d/rig/pose";
import type { PoseIn, WorldArm } from "../Actor";
import { beats } from "../beats";
import { Camera, mixCam, type Cam } from "../Camera";
import { useScene } from "../context";
import { BG42_TEXT } from "../script";
import { C, clamp01, drift, easeInOut, keys, pop, ramp } from "../theme";
import { LowerThird, NewsTopBar } from "../ui";
import { MugStudio, OfficeWorld, momKeys } from "./common";
import { BEZEL_L, InterviewMonitor, MIC_ANG, MIC_R, PhoneReminder, PokeMic, micHeadX, type MicPose } from "./InterviewParts";
import { OFFICE_WIDE, officeMinutes } from "./shots";

/** Начало сцены: чуть шире OFFICE_WIDE (мама и монитор целиком). */
const CAM_OPEN: Cam = { x: 652, y: 920, zoom: 1.3 };
/** «Двойка» на ответе: лицо мамы, микрофон, репортёр и табличка «Жыйын». */
const CAM_TWO: Cam = { x: 645, y: 855, zoom: 1.5 };

/** Микрофон снаружи: головка в ≈ 72 px от рамки, рукоять наклонена ко рту мамы. */
const MIC_OUT_R = 163;
const MIC_OUT_ANG = -12;

/** Плавная смена выражений лица: каждая метка перетекает за blend кадров. */
const exprAt = (t: number, list: readonly (readonly [number, ExprId])[], blend = 7): Expression => {
  let e: Expression = EXPR[list[0][1]];
  for (let i = 1; i < list.length; i++) {
    const [s, id] = list[i];
    if (t <= s) break;
    e = mixExpr(e, EXPR[id], easeInOut((t - s) / blend));
  }
  return e;
};

export const InterviewScene: React.FC = () => {
  const { f, abs, at, len, word, cue, tl } = useScene("interview");
  const b = beats(tl).interview;
  const WIN = at(b.window);
  const MO = at(b.micOut);
  const MB = at(b.micBack);
  const TURN = at(b.momTurn);
  const GM = at(b.glanceMeeting);
  const GC = at(b.glanceClock);
  const BR = at(b.backToReporter);
  const CP = at(b.camPush);
  const LAST = at(cue("m1").to); // конец ответа мамы
  const END = len - 1; // последний кадр сцены
  const SETTLE = END - 14; // к этому кадру мама в позе стыка
  const W8 = word("m1", 8); // «келгенде»
  const R1Q = word("r1", 3); // «качан?»

  // ---------- микрофон ----------
  // 1) в окне: рука репортёра тянет микрофон к левому краю экрана;
  // 2) сквозь экран: тот же микрофон уходит за край и высовывается из рамки;
  // 3) обратно тем же путём, рука возвращается.
  const T_IN = MO + 8; // микрофон у края экрана
  const T_OUT = MB + 9; // микрофон снова целиком в окне
  const micIn = easeInOut(ramp(f, MO, T_IN, (x) => x)) * (1 - easeInOut(ramp(f, T_OUT + 1, T_OUT + 9, (x) => x)));
  const micAt = (t: number): MicPose | null => {
    if (t < T_IN || t >= T_OUT) return null;
    const out = pop(t, T_IN, 13, 150) * (1 - easeInOut(ramp(t, MB, T_OUT, (x) => x)));
    const k = clamp01(out);
    // короткий «тычок» на «качан?» и лёгкая дрожь руки
    const jab = keys(t, [
      [R1Q - 2, 0],
      [R1Q + 4, 1],
      [R1Q + 14, 0],
    ]);
    const live = Math.sin(t / 7) * 1.5;
    return { r: MIC_R + (MIC_OUT_R - MIC_R) * out + (9 * jab + live) * k, ang: MIC_ANG + (MIC_OUT_ANG - MIC_ANG) * k };
  };
  const mic = micAt(f);
  // «рябь» стекла на рамке: в кадры, когда головка проходит под рамкой
  const ripple: number[] = [];
  const mid = BEZEL_L + 7;
  let prevX = Infinity;
  for (let t = T_IN; t < Math.min(T_OUT + 1, f + 1); t++) {
    const p = micAt(t);
    const x = p ? micHeadX(p) : Infinity;
    if ((prevX >= mid && x < mid) || (prevX < mid && x >= mid)) {
      ripple.push(ramp(f, t - 1, t + 13, (u) => u), ramp(f, t + 3, t + 17, (u) => u));
    }
    prevX = x;
  }

  // ---------- мама ----------
  const face = (t: number) =>
    keys(t, [
      [0, 0.15],
      [TURN - 2, 0.15],
      [TURN + 7, 0.5],
      [GM - 3, 0.5],
      [GM + 8, 0.85],
      [GC - 5, 0.85],
      [GC + 6, 0.35],
      [BR - 4, 0.35],
      [BR + 6, 0.5],
      [Math.max(BR + 7, LAST), 0.5],
      [Math.max(BR + 20, SETTLE), 0.45],
    ]);
  const pose = (t: number): PoseIn => {
    // печатает: лёгкие удары по клавишам до поворота к монитору
    const typing = 1 - ramp(t, TURN - 6, TURN + 2);
    const tapL = typing * 3 * Math.max(0, Math.sin(t * 0.95));
    const tapR = typing * 3 * Math.max(0, Math.sin(t * 0.95 + 2.1));
    // открытая ладонь в сторону переговорной (рука справа на экране)
    const g = keys(t, [
      [GM - 2, 0],
      [GM + 10, 1],
      [GC - 8, 1],
      [GC + 5, 0],
    ]);
    const gx = keys(t, [
      [GM + 10, 0],
      [GM + 22, 1],
      [GC - 8, 0],
    ]);
    const armR: WorldArm = {
      target: {
        x: momKeys.r.x + (590 + 8 * gx - momKeys.r.x) * g,
        y: momKeys.r.y - tapR + (1036 - 8 * gx - momKeys.r.y) * g,
      },
      shape: g > 0.35 ? "open" : "relax",
      elbow: "hang",
      wrist: 14 * g,
    };
    const armL: WorldArm = { target: { x: momKeys.l.x, y: momKeys.l.y - tapL }, shape: "relax", elbow: "hang" };
    const out: PoseIn = {
      expr: exprAt(t, [
        [0, "neutral"],
        [TURN - 3, "surprised"],
        [TURN + 22, "thinking"],
        [GM - 5, "tired"],
        [GC - 3, "worried"],
        [BR - 2, "apologetic"],
        [Math.max(BR + 12, LAST + 4), "neutral"],
      ]),
      lookY: keys(t, [
        [0, 0.35],
        [TURN - 2, 0.35],
        [TURN + 6, 0],
        [GM - 2, 0],
        [GM + 7, -0.6],
        [GC - 4, -0.6],
        [GC + 6, -1],
        [BR - 4, -1],
        [BR + 6, 0],
      ]),
      // испуг от микрофона: отклоняется назад и обратно
      lean: keys(t, [
        [TURN - 2, 0],
        [TURN + 6, -3],
        [TURN + 26, 0],
        [BR - 2, 0],
        [BR + 8, 2],
        [Math.max(BR + 9, SETTLE - 12), 2],
        [Math.max(BR + 20, SETTLE), 0],
      ]),
      headTilt: keys(t, [
        [GM - 2, 0],
        [GM + 9, 4],
        [GC - 4, 4],
        [GC + 8, -3],
        [BR - 2, -3],
        [BR + 8, 2],
        [Math.max(BR + 9, LAST), 2],
        [Math.max(BR + 20, SETTLE), 0],
      ]),
      nod: keys(t, [
        [BR - 2, 0],
        [BR + 5, 3],
        [BR + 14, 0],
        [W8 - 1, 0],
        [W8 + 6, 2.5],
        [W8 + 16, 0],
      ]),
      // «келгенде» — беспомощно приподнимает плечи
      shoulders: keys(t, [
        [W8 - 2, 0],
        [W8 + 7, 0.45],
        [W8 + 22, 0],
      ]),
    };
    return g > 0 || typing > 0 ? { ...out, armR, armL } : out;
  };
  const phoneGlow = keys(f, [
    [GC, 0],
    [GC + 6, 1],
    [GC + 22, 1],
    [GC + 32, 0],
  ]);

  // ---------- камера ----------
  const push = easeInOut(ramp(f, CP - 4, CP + 30, (x) => x));
  const back = easeInOut(ramp(f, END - 30, END, (x) => x));
  const creep = 1 + 0.025 * ramp(f, CP + 30, END - 30, (x) => x);
  const two = { ...CAM_TWO, zoom: CAM_TWO.zoom * creep };
  const base = mixCam(mixCam(CAM_OPEN, two, push), OFFICE_WIDE, back);
  const dr = drift(f, 3, 4);
  const dk = 1 - ramp(f, END - 40, END - 10);
  const cam: Cam = f >= END ? OFFICE_WIDE : { x: base.x + dr.x * dk, y: base.y + dr.y * dk, zoom: base.zoom };

  return (
    <AbsoluteFill style={{ background: C.wall }}>
      <Camera cam={cam}>
        <OfficeWorld
          f={f}
          abs={abs}
          uid="int-of"
          minutes={officeMinutes(abs / 30)}
          monitor={<InterviewMonitor f={f} abs={abs} win={WIN} micOut={micIn} mic={mic} />}
          mug={<MugStudio f={f} abs={abs} uid="int-mug" />}
          face={face}
          pose={pose}
          phoneGlow={phoneGlow}
          overMonitor={
            mic || (f >= GC && f < BR + 20) ? (
              <>
                {mic ? <PokeMic p={mic} ripple={ripple} /> : null}
                <PhoneReminder f={f} at={GC + 2} out={BR + 8} />
              </>
            ) : null
          }
        />
      </Camera>
      <NewsTopBar f={f} at={-30} plate={BG42_TEXT.jokePlate} />
      <LowerThird f={f} at={at(b.lower)} out={GC - 8} tag={BG42_TEXT.channel} text={BG42_TEXT.interview} y={1244} />
    </AbsoluteFill>
  );
};
