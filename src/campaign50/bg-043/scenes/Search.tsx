// Сцена 3 (≈00:20–00:35): тот же офис, что в конце сцены 2.
// 1) «Эскертме өзү баланы жеткирбейт.» — будильники на полке наперебой
//    звенят и показывают на свои стикеры (они — «напоминания»). Мама
//    поднимает глаза от блокнота, по-доброму улыбается и чуть качает
//    головой; часы замолкают, переглядываются и смущённо пожимают плечами
//    (звонок сам по себе ребёнка не довозит).
// 2) «Ошондуктан…» — страница блокнота переворачивается: «Кайталанган жол»,
//    мама дописывает строки (вставка-блокнот, почерк проявляется).
// 3) Камера ускоряясь въезжает в крышку ноутбука — монтажный стык на план
//    «через плечо»: большой экран с браузером, мама со спины, будильники
//    выглядывают у неё с плеч. Мама набирает запрос, курсор жмёт «Издөө»,
//    загружаются результаты; результат BalaGo с логотипом появляется только
//    как итог ЕЁ поиска, курсор выбирает его (подсветка, без «заказ
//    оформлен»). Часы радуются: «Жумуш сааты» — большой палец, «Мектеп
//    сааты» — прыжок.
// Надпись: «Эскертме эмес — каттамды пландоо» (с «Ошондуктан» до конца).
// Все биты — от фактических таймингов реплики n01.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  appear,
  clamp,
  easeIn,
  easeInOut,
  easeOut,
  hopArc,
  keys,
  keysV,
  lerp,
  pop,
  squashPulse,
} from "../anim";
import { timeToDeg, type ClockArm, type ClockHand } from "../chars/Clock";
import { ClockActor, exprKeys } from "../chars/ClockActor";
import { useScene, useTimeline } from "../context";
import { Caption } from "../parts";
import { C } from "../palette";
import { Actor, type PoseIn } from "../rig/Actor";
import { hash01, type Vec } from "../rig/motion";
import { BG43_TEXT } from "../script";
import {
  DeskNotebook,
  LaptopBack,
  OFFICE,
  OfficeBack,
  OfficeDesk,
} from "../sets/Office";
import type { SceneSfx, SfxName } from "../sfxCues";
import { camKeys, camMove, Shot, type Cam } from "../shots";
import { cueFrames, sceneOf, wordFrame, type Bg43Timeline } from "../timing";
import { ALIGN_CAM_END, ALIGN_END, alignBeats, MOM_HOME } from "./Align";
import {
  Browser,
  LaptopFront,
  MomBack,
  OTS,
  OtsBackground,
} from "./search-ots";

// план «через плечо»: мама и часы выше, чтобы субтитры их не закрывали
const OTS_RAISE = 100;

const W8 = timeToDeg(8, 0);
const S13 = timeToDeg(13, 0);

// Камера офиса: медленный наезд, затем ускоряющийся въезд в крышку ноутбука.
const CAM_PRE: Cam = { x: 556, y: 1046, zoom: 1.2 };
const CAM_LID: Cam = { x: 900, y: 1158, zoom: 3.7 };
const PUSH = 22; // кадров въезда
// План «через плечо»: камера продолжает движение вперёд и мягко садится.
const OTS_IN: Cam = { x: 540, y: 930, zoom: 0.9 };
const OTS_CAM: Cam = { x: 540, y: 960, zoom: 1 };
const OTS_READ: Cam = { x: 540, y: 950, zoom: 1.03 };

const QUERY = BG43_TEXT.search.query;
// Набор запроса: у каждой буквы свой вес (пробел — короткая пауза),
// детерминированно по номеру буквы.
const TYPE_W = [...QUERY].map(
  (ch, i) =>
    1 +
    hash01(i * 3.7 + 1) * 0.6 +
    (i > 0 && QUERY[i - 1] === " " ? 1.3 : 0) +
    (ch === " " ? 0.2 : 0),
);
const TYPE_CUM = TYPE_W.reduce<number[]>(
  (acc, w) => [...acc, (acc[acc.length - 1] ?? 0) + w],
  [],
);
const TYPE_TOTAL = TYPE_CUM[TYPE_CUM.length - 1];

export const searchBeats = (
  tl: Bg43Timeline,
  sceneFrom: number,
  frames: number,
) => {
  const n = cueFrames(tl, "n01");
  const n0 = n.from - sceneFrom;
  const n1 = n.to - sceneFrom;
  const w = (i: number) => wordFrame(tl, "n01", i) - sceneFrom;
  // 1-е предложение: «Эскертме өзү баланы жеткирбейт.»
  const ring0 = 4;
  const look = ring0 + 8;
  const shake0 = Math.max(look + 16, w(2) - 2); // «баланы»
  const shake1 = Math.max(shake0 + 26, w(3) + 10); // «жеткирбейт»
  const stop = shake0 + 6;
  const glance = stop + 9;
  const shrug = glance + 12;
  // 2-е предложение: «Ошондуктан…» — переворот страницы
  const flip = Math.max(w(4) - 2, shrug + 16);
  const title = flip + 16;
  const lines = [flip + 32, flip + 50, flip + 68] as const;
  const linesDone = lines[2] + 18;
  const leap = linesDone - 4;
  // въезд в ноутбук и план «через плечо»
  const push = linesDone + 6;
  const ots = push + 12;
  const otsFull = push + PUSH;
  const popW = otsFull + 2;
  const popS = otsFull + 7;
  const type0 = otsFull + 16;
  // набор: не дольше 62 кадров и так, чтобы реакция часов успела до стыка
  const typeDur = Math.round(clamp(frames - 14 - 118 - type0, 34, 62));
  const typeEnd = type0 + typeDur;
  const click1 = typeEnd + 18;
  const r1 = click1 + 16;
  const r3 = click1 + 22;
  const brand = click1 + 32;
  const click2 = brand + 30;
  const hop = click2 + 8;
  return {
    n0,
    n1,
    cap: w(4),
    ring0,
    look,
    shake0,
    shake1,
    stop,
    glance,
    shrug,
    flip,
    title,
    lines,
    linesDone,
    leap,
    push,
    ots,
    otsFull,
    popW,
    popS,
    type0,
    typeDur,
    typeEnd,
    click1,
    r1,
    r3,
    brand,
    click2,
    hop,
    frames,
  };
};
type SearchBeats = ReturnType<typeof searchBeats>;

// Кадр, когда напечатана буква i запроса.
const typedAt = (b: SearchBeats, i: number) =>
  b.type0 + (b.typeDur * TYPE_CUM[i]) / TYPE_TOTAL;
const typedCount = (b: SearchBeats, f: number) => {
  let k = 0;
  while (k < QUERY.length && typedAt(b, k) <= f) k++;
  return k;
};

// Рука будильника: от покоя к цели с весом w (локальные единицы рисунка).
const REST_L = { x: -128, y: -72 };
const REST_R = { x: 128, y: -72 };
const armTo = (
  rest: Vec,
  to: { x: number; y: number; shape: ClockHand },
  w: number,
): ClockArm =>
  w <= 0.02
    ? null
    : {
        x: lerp(rest.x, to.x, w),
        y: lerp(rest.y, to.y, w),
        shape: w > 0.35 ? to.shape : "relax",
      };
const lerpV2 = (a: Vec, b: Vec, k: number): Vec => ({
  x: lerp(a.x, b.x, k),
  y: lerp(a.y, b.y, k),
});

export const SearchScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, frames } = useScene();
  const b = searchBeats(tl, from, frames);
  return (
    <>
      {f < b.otsFull + 1 ? <OfficePart f={f} b={b} tl={tl} /> : null}
      {f >= b.ots ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: easeInOut((f - b.ots) / (b.otsFull - b.ots)),
          }}
        >
          <OtsPart f={f} b={b} />
        </div>
      ) : null}
      {/* надпись сцены 2 тает, надпись сцены 3 — со слова «Ошондуктан» */}
      <Caption
        f={f}
        at={-60}
        out={b.ring0 + 6}
        text={BG43_TEXT.align.caption}
      />
      <Caption f={f} at={b.cap} text={BG43_TEXT.search.caption} size={40} />
    </>
  );
};

// ---------------------------------------------------------------------
// Офис: часы-«напоминания», мама, блокнот (продолжение сцены 2)
// ---------------------------------------------------------------------
const OfficePart: React.FC<{
  readonly f: number;
  readonly b: SearchBeats;
  readonly tl: Bg43Timeline;
}> = ({ f, b, tl }) => {
  // продолжение сцены 2: время её кадров (для фаз дыхания, моргания, пера)
  const al = sceneOf(tl, "align");
  const A = al.frames;
  const ab = alignBeats(tl, al.from, A);
  const u = f + A;
  const m = OFFICE.mom;
  const nb = OFFICE.notebook;
  const y = OFFICE.clocks.work.y;
  const size = OFFICE.clocks.size;

  const cam =
    f < b.push
      ? camKeys(f, [
          [0, ALIGN_CAM_END],
          [b.push, CAM_PRE],
        ])
      : camMove(f, b.push, b.push + PUSH, CAM_PRE, CAM_LID, easeIn);

  // ---- часы-«напоминания» ----
  const ringAmt =
    0.8 * clamp((f - b.ring0) / 5) * (1 - clamp((f - b.stop) / 6));
  const pointW =
    clamp((f - b.ring0) / 5) * (1 - easeInOut((f - b.stop - 2) / 8));
  const shrugW = keys(f, [
    [b.shrug - 2, 0],
    [b.shrug + 5, 1],
    [b.shrug + 18, 1],
    [b.shrug + 26, 0],
  ]);
  const cheerW = keys(f, [
    [b.leap - 6, 0],
    [b.leap, 1],
  ]);
  const ringHop = (ph: number) =>
    (ringAmt / 0.8) * Math.abs(Math.sin((f - b.ring0) * 0.42 + ph)) * 16;
  const leapX = keys(f, [
    [b.leap, 0],
    [b.leap + 14, 44],
  ]);
  const leapLift = hopArc(f, b.leap, 14, 34) / 0.7;
  const wave = (ph: number) => Math.sin(f * 0.9 + ph) * 16;
  const clockArms = (side: -1 | 1, ph: number) => {
    const outer = side < 0 ? "L" : "R";
    const outRest = side < 0 ? REST_L : REST_R;
    const inRest = side < 0 ? REST_R : REST_L;
    let out: ClockArm = null;
    let inn: ClockArm = null;
    if (pointW > 0.02) {
      out = armTo(outRest, { x: side * 112, y: -296, shape: "point" }, pointW);
      inn = armTo(
        inRest,
        { x: -side * 142, y: -226 + wave(ph), shape: "wave" },
        pointW,
      );
    } else if (shrugW > 0.02) {
      out = armTo(outRest, { x: side * 158, y: -168, shape: "open" }, shrugW);
      inn = armTo(inRest, { x: -side * 158, y: -168, shape: "open" }, shrugW);
    } else if (cheerW > 0.02) {
      out = armTo(outRest, { x: side * 140, y: -250, shape: "open" }, cheerW);
      inn = armTo(inRest, { x: -side * 140, y: -250, shape: "open" }, cheerW);
    }
    return outer === "L" ? { armL: out, armR: inn } : { armL: inn, armR: out };
  };
  const wArms = clockArms(-1, 0);
  const sArms = clockArms(1, 1.7);
  const wExpr = exprKeys(f, [
    [0, "soft"],
    [b.ring0, "excited"],
    [b.stop, "surprised"],
    [b.glance + 2, "sheepish"],
    [b.flip + 6, "curious"],
    [b.title + 6, "happy"],
    [b.leap - 6, "excited"],
  ]);
  const sExpr = exprKeys(f, [
    [0, "soft"],
    [b.ring0 + 1, "excited"],
    [b.stop + 1, "surprised"],
    [b.glance + 3, "sheepish"],
    [b.flip + 8, "curious"],
    [b.title + 8, "excited"],
    [b.leap - 6, "excited"],
  ]);
  const wFace = keys(f, [
    [b.ring0, 0.2],
    [b.ring0 + 6, -0.05],
    [b.stop, -0.05],
    [b.stop + 5, 0.55],
    [b.glance, 0.55],
    [b.glance + 5, 0.75],
    [b.shrug - 2, 0.75],
    [b.shrug + 4, 0],
    [b.flip, 0],
    [b.flip + 8, 0.45],
    [b.leap - 8, 0.45],
    [b.leap, 0.75],
  ]);
  const sFace = keys(f, [
    [b.ring0 + 1, 0.3],
    [b.ring0 + 7, 0.05],
    [b.stop + 1, 0.05],
    [b.stop + 6, 0.6],
    [b.glance + 1, 0.6],
    [b.glance + 6, -0.7],
    [b.shrug - 1, -0.7],
    [b.shrug + 5, 0],
    [b.flip + 2, 0],
    [b.flip + 10, -0.15],
    [b.leap - 8, -0.15],
    [b.leap, 0.75],
  ]);
  const look = (o: number, toEach: number, toBook: number) => ({
    x: keys(f, [
      [b.ring0 + o, 0],
      [b.ring0 + 5 + o, -0.15 * toEach],
      [b.stop + o, -0.15 * toEach],
      [b.stop + 4 + o, 0.85],
      [b.glance + o, 0.85],
      [b.glance + 4 + o, 0.95 * toEach],
      [b.shrug + o, 0.95 * toEach],
      [b.shrug + 4 + o, 0],
      [b.flip + 2 + o, 0],
      [b.flip + 8 + o, toBook],
      [b.leap - 6, toBook],
      [b.leap, 0.9],
    ]),
    y: keys(f, [
      [b.ring0 + o, 0],
      [b.ring0 + 5 + o, -0.85],
      [b.stop + o, -0.85],
      [b.stop + 4 + o, 0.05],
      [b.shrug + 4 + o, 0],
      [b.flip + 2 + o, 0],
      [b.flip + 8 + o, 0.85],
      [b.leap - 6, 0.85],
      [b.leap, 0],
    ]),
  });
  const wLook = look(0, 1, 0.55);
  const sLook = look(1, -1, -0.25);
  const wTilt =
    Math.sin((f - b.ring0) * 0.7) * 4 * (ringAmt / 0.8) +
    keys(f, [
      [b.glance, 0],
      [b.glance + 6, 5],
      [b.shrug, 5],
      [b.shrug + 6, 0],
      [b.flip + 4, 0],
      [b.flip + 12, 5],
      [b.leap - 6, 5],
      [b.leap, 8],
      [b.leap + 14, 0],
    ]);
  const sTilt =
    Math.sin((f - b.ring0) * 0.7 + 1.3) * 4 * (ringAmt / 0.8) +
    keys(f, [
      [b.glance + 1, 0],
      [b.glance + 7, -5],
      [b.shrug + 1, -5],
      [b.shrug + 7, 0],
      [b.flip + 5, 0],
      [b.flip + 13, 3],
      [b.leap - 6, 3],
      [b.leap, 8],
      [b.leap + 14, 0],
    ]);
  const sq = (o: number) =>
    squashPulse(f, b.ring0 + o, 8, -0.7) +
    squashPulse(f, b.stop + o, 8, 0.5) +
    squashPulse(f, b.shrug + o, 12, -0.6) +
    squashPulse(f, b.title + 4 + o * 3, 10, -0.4) +
    squashPulse(f, b.leap - 5, 5, 0.7) +
    squashPulse(f, b.leap + 14, 8, 0.8);

  // ---- мама за столом ----
  const desk = OFFICE.desk.top + 4;
  // перо из сцены 2 (продолжение строки), затем покачивание затухает
  const calmFrom = Math.max(A, ab.lines[2] + 22);
  const alignPen = (t: number): Vec => {
    const tu = t + A;
    const line = ab.lines.findIndex((l) => tu < l + 22);
    const li = line < 0 ? 2 : line;
    const prog = clamp((tu - ab.lines[li]) / 22);
    const wig = 1 - clamp((tu - calmFrom) / 10);
    return {
      x: nb.x - 70 + prog * 120 + Math.sin(tu * 1.3) * 5 * wig,
      y: nb.y - 34 + li * 9 + Math.abs(Math.sin(tu * 0.9)) * -6 * wig,
    };
  };
  // новая страница: заголовок и три строки
  const rows = [
    [b.title, 14],
    [b.lines[0], 18],
    [b.lines[1], 18],
    [b.lines[2], 18],
  ] as const;
  const rowStart = (i: number): Vec => ({ x: nb.x - 70, y: nb.y - 34 + i * 9 });
  const rowEnd = (i: number): Vec => ({
    x: nb.x + (i === 0 ? 40 : 50),
    y: nb.y - 34 + i * 9,
  });
  const pagePen = (t: number): Vec => {
    const pts: [number, Vec][] = [];
    rows.forEach(([s, d], i) => {
      pts.push([s, rowStart(i)]);
      pts.push([s + d, rowEnd(i)]);
    });
    const p = keysV(t, pts);
    const on = rows.some(([s, d]) => t >= s && t <= s + d) ? 1 : 0;
    return {
      x: p.x + Math.sin(t * 1.3) * 5 * on,
      y: p.y - Math.abs(Math.sin(t * 0.9)) * 6 * on,
    };
  };
  const H_LIFT = { x: nb.x + 6, y: nb.y - 78 };
  const H_CORNER = { x: nb.x + 104, y: nb.y - 22 };
  const H_SWEEP = { x: nb.x - 86, y: nb.y - 40 };
  const KEY_L = { x: OFFICE.laptop.x - 62, y: desk - 6 };
  const KEY_R = { x: OFFICE.laptop.x + 52, y: desk - 6 };
  const penHand = (t: number): Vec => {
    let p = lerpV2(alignPen(t), H_LIFT, easeInOut((t - b.look - 2) / 12));
    // лёгкое покачивание карандашом в такт «нет-нет»
    if (t > b.shake0 && t < b.shake1)
      p = {
        x:
          p.x +
          Math.sin(((t - b.shake0) / (b.shake1 - b.shake0)) * Math.PI * 4) * 10,
        y: p.y,
      };
    if (t >= b.flip - 12)
      p = keysV(t, [
        [b.flip - 12, H_LIFT],
        [b.flip - 2, H_CORNER],
        [b.flip + 12, H_SWEEP],
        [b.title, rowStart(0)],
      ]);
    if (t >= b.title) p = pagePen(t);
    if (t >= b.linesDone)
      p = lerpV2(
        pagePen(b.linesDone),
        KEY_L,
        easeInOut((t - b.linesDone) / 10),
      );
    return p;
  };
  const faceL = (t: number) => {
    const base = keys(t, [
      [b.look, -0.15],
      [b.look + 8, -0.8],
      [b.flip - 12, -0.8],
      [b.flip - 2, -0.2],
      [b.linesDone, -0.2],
      [b.linesDone + 10, 0.35],
    ]);
    const k = (t - b.shake0) / (b.shake1 - b.shake0);
    const shakeV =
      k > 0 && k < 1
        ? 0.17 * Math.sin(k * Math.PI * 4) * Math.sin(k * Math.PI)
        : 0;
    return base + shakeV;
  };
  const place = () => ({ x: MOM_HOME, y: m.y, h: m.h });
  const pose = (tu: number): PoseIn => {
    const t = tu - A;
    const pen = penHand(t);
    const toKeys = easeInOut((t - b.linesDone) / 10);
    const armR =
      toKeys > 0
        ? lerpV2({ x: nb.x + 120, y: desk + 4 }, KEY_R, toKeys)
        : { x: nb.x + 120, y: desk + 4 };
    return {
      armL: {
        target: pen,
        shape: t < b.linesDone + 8 ? "pinch" : "relax",
        item: t < b.linesDone + 8 ? "pencil" : undefined,
        elbow: "down",
        behind: false,
      },
      armR: { target: armR, shape: "relax", elbow: "down", behind: false },
      expr:
        t < b.look
          ? "thinking"
          : t < b.look + 8
            ? "surprised"
            : t < b.shake1 + 4
              ? "smile"
              : t < b.flip - 6
                ? "softSmile"
                : t < b.linesDone
                  ? "calm"
                  : "smile",
      lookY: keys(t, [
        [b.look, 0.55],
        [b.look + 6, -0.15],
        [b.flip - 12, -0.15],
        [b.flip - 4, 0.55],
        [b.linesDone, 0.55],
        [b.linesDone + 8, 0.4],
      ]),
      lean: keys(t, [
        [b.look, 4],
        [b.look + 8, 1],
        [b.flip - 12, 1],
        [b.flip - 2, 4],
        [b.linesDone, 4],
        [b.linesDone + 10, 3],
      ]),
      headTilt: keys(t, [
        [b.shake0 - 4, 0],
        [b.shake0 + 4, 4],
        [b.shake1, 4],
        [b.shake1 + 8, 0],
      ]),
      nod: keys(t, [
        [b.linesDone - 2, 0],
        [b.linesDone + 5, 7],
        [b.linesDone + 12, 0],
      ]),
      turnBody: keys(t, [
        [b.look, 0.8],
        [b.look + 8, 0.45],
      ]),
    };
  };
  const face = (tu: number) => faceL(tu - A);

  // блокнот на столе: переворот страницы и новые строки
  const nbFlip =
    f >= b.flip && f < b.flip + 14 ? easeInOut((f - b.flip) / 14) : 0;
  const nbLines =
    f < b.flip + 7
      ? u < ab.lines[0]
        ? 0
        : u < ab.lines[1]
          ? 1
          : u < ab.lines[2]
            ? 2
            : 3
      : rows.filter(([s]) => f >= s).length;
  const noteGlow = { work: pointW, school: pointW };

  return (
    <>
      <Shot cam={cam} bg={C.wall}>
        <OfficeBack noteGlow={noteGlow} />
        <ClockActor
          kind="work"
          role="work"
          mute
          seed={3}
          f={u}
          x={ALIGN_END.work + leapX}
          y={y}
          size={size}
          hourDeg={W8.hourDeg}
          minDeg={W8.minDeg}
          expr={wExpr}
          face={wFace}
          lookX={wLook.x}
          lookY={wLook.y}
          ring={ringAmt}
          tilt={wTilt}
          squash={sq(0)}
          lift={ringHop(0) + leapLift}
          armL={wArms.armL}
          armR={wArms.armR}
          blinks={[b.stop + 2 + A, b.shrug + 20 + A]}
        />
        <ClockActor
          kind="school"
          role="school"
          mute
          seed={7}
          f={u}
          x={ALIGN_END.school + leapX}
          y={y}
          size={size}
          hourDeg={S13.hourDeg}
          minDeg={S13.minDeg}
          expr={sExpr}
          face={sFace}
          lookX={sLook.x}
          lookY={sLook.y}
          ring={ringAmt}
          tilt={sTilt}
          squash={sq(1)}
          lift={ringHop(1.4) + leapLift * 1.15}
          armL={sArms.armL}
          armR={sArms.armR}
          blinks={[b.stop + 3 + A, b.shrug + 21 + A]}
        />
        <Actor
          uid="mom"
          look="mom"
          f={u}
          place={place}
          face={face}
          pose={pose}
          seed={11}
          layer="body"
          walkFrom={A}
        />
        <OfficeDesk>
          <DeskNotebook x={nb.x} y={nb.y} lines={nbLines} flip={nbFlip} />
        </OfficeDesk>
        <Actor
          uid="mom"
          look="mom"
          f={u}
          place={place}
          face={face}
          pose={pose}
          seed={11}
          layer="arms"
          walkFrom={A}
        />
        {/* крышка ноутбука поверх рук: ладони уходят на клавиатуру за ней */}
        <LaptopBack x={OFFICE.laptop.x} y={OFFICE.laptop.y} />
      </Shot>
      <NotebookInsert f={f} b={b} u={u} alignLines={ab.lines} />
    </>
  );
};

// ---------------------------------------------------------------------
// Вставка-блокнот: страница «Бүгүн» (из сцены 2) переворачивается,
// под ней — «Кайталанган жол»; почерк проявляется слева направо.
// ---------------------------------------------------------------------
const PAGE: React.CSSProperties = {
  padding: "24px 30px 26px",
  borderRadius: 22,
  backgroundColor: "#FFFFFF",
  backgroundImage:
    "repeating-linear-gradient(180deg, transparent 0 55px, #E3EAF4 55px 58px)",
  fontFamily,
  color: C.navy,
};
const ROW: React.CSSProperties = {
  display: "table",
  fontSize: 35,
  fontWeight: 800,
  lineHeight: "58px",
  whiteSpace: "nowrap",
};
const reveal = (p: number): React.CSSProperties => ({
  clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
});

const NotebookInsert: React.FC<{
  readonly f: number;
  readonly b: SearchBeats;
  readonly u: number;
  readonly alignLines: readonly number[];
}> = ({ f, b, u, alignLines }) => {
  if (f > b.push + 16) return null;
  const flipT = clamp((f - b.flip) / 16);
  const ang = -180 * easeInOut(flipT);
  const lift = Math.sin(flipT * Math.PI);
  // уход из кадра вместе с въездом камеры
  const e = easeIn(clamp((f - b.push) / 16));
  const bump = squashPulse(f, b.flip + 2, 12, 0.025);
  const notes = BG43_TEXT.align.notes;
  const s = BG43_TEXT.search;
  const tP = clamp((f - b.title) / 14);
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 1010,
        transform: `translate(${-240 * e}px, ${400 * e}px) rotate(${-3 - 6 * e}deg) scale(${1 + bump + 0.45 * e})`,
        opacity: 1 - e,
      }}
    >
      {/* нижняя страница (новая) — она же задаёт размер карточки */}
      <div
        style={{
          ...PAGE,
          width: 540,
          boxShadow: "0 18px 40px rgba(20,40,90,0.18)",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            marginBottom: 4,
            whiteSpace: "nowrap",
            ...reveal(tP),
          }}
        >
          <span
            style={{
              backgroundImage: `linear-gradient(180deg, transparent 58%, ${C.yellow} 58%, ${C.yellow} 92%, transparent 92%)`,
              padding: "0 6px",
            }}
          >
            ↻ {s.page}
          </span>
        </div>
        {s.pageLines.map((n, i) => (
          <div
            key={n}
            style={{ ...ROW, ...reveal(clamp((f - b.lines[i]) / 18)) }}
          >
            {"• "}
            {i === 2 ? (
              <>
                {n.slice(0, -1)}
                <span style={{ color: C.yellowDeep }}>?</span>
              </>
            ) : (
              n
            )}
          </div>
        ))}
      </div>
      {/* верхняя страница «Бүгүн» переворачивается вокруг левого края */}
      {ang > -179.5 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            transformOrigin: "0 50%",
            transform: `perspective(1700px) rotateY(${ang}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              ...PAGE,
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              boxShadow:
                lift > 0.01
                  ? `${-18 * lift}px 14px 30px rgba(20,40,90,${0.16 * lift})`
                  : "none",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 4 }}>
              {BG43_TEXT.align.noteTitle}:
            </div>
            {notes.map((n, i) => (
              <div
                key={n}
                style={{ ...ROW, ...reveal(clamp((u - alignLines[i]) / 22)) }}
              >
                {i === 2 ? "↻ " : "• "}
                {n}
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background:
                  "linear-gradient(90deg, rgba(20,40,90,0) 40%, rgba(20,40,90,0.14) 100%)",
                opacity: lift,
              }}
            />
          </div>
          <div
            style={{
              ...PAGE,
              position: "absolute",
              inset: 0,
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              backgroundColor: "#F7F9FD",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background:
                  "linear-gradient(270deg, rgba(20,40,90,0) 30%, rgba(20,40,90,0.12) 100%)",
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------
// План «через плечо»: экран ноутбука, мама со спины, часы на плечах
// ---------------------------------------------------------------------
const OtsPart: React.FC<{ readonly f: number; readonly b: SearchBeats }> = ({
  f,
  b,
}) => {
  const cam =
    f < b.otsFull + 14
      ? camMove(f, b.ots, b.otsFull + 14, OTS_IN, OTS_CAM, easeOut)
      : camKeys(f, [
          [b.click1, OTS_CAM],
          [b.brand + 20, OTS_READ],
          [b.frames, { ...OTS_READ, zoom: OTS_READ.zoom + 0.015 }],
        ]);

  // ---- браузер ----
  const typed = typedCount(b, f);
  const typing = f >= b.type0 && f < b.typeEnd + 2;
  const caret =
    f < b.click1 + 3 &&
    (typing || Math.floor((f - b.type0 + 80) / 9) % 2 === 0);
  const click = (at: number) =>
    keys(f, [
      [at - 2, 0],
      [at, 1],
      [at + 4, 0],
    ]);
  const cursorPos = keysV(f, [
    [b.typeEnd - 2, { x: 770, y: 930 }],
    [b.click1 - 3, { x: 552, y: 758 }],
    [b.brand + 14, { x: 552, y: 758 }],
    [b.click2 - 4, { x: 478, y: 800 }],
  ]);
  const ripple = (at: number) => clamp((f - at) / 14);
  const brandPop = pop(f, b.brand, 14);
  const s = {
    f,
    typed,
    caret,
    focus: appear(f, b.type0 - 12, 8),
    morph: easeInOut((f - b.click1 - 3) / 12),
    hover: clamp((f - b.click1 + 5) / 4) * (1 - clamp((f - b.click1 - 4) / 4)),
    press: click(b.click1),
    skeleton: appear(f, b.click1 + 5, 6),
    r1: appear(f, b.r1, 8),
    r3: appear(f, b.r3, 8),
    brand: brandPop,
    brandAt: b.brand,
    brandHover: clamp((f - b.click2 + 8) / 4),
    picked: appear(f, b.click2, 8),
    pickedAt: b.click2,
    cursor: {
      x: cursorPos.x,
      y: cursorPos.y,
      show: appear(f, b.typeEnd - 4, 6),
      press: Math.max(click(b.click1), click(b.click2)),
      ripple: f < b.click2 ? ripple(b.click1) : ripple(b.click2),
    },
  };

  // ---- мама со спины ----
  const typeEnv =
    clamp((f - b.type0 + 4) / 6) * (1 - clamp((f - b.typeEnd) / 6));
  const caretX = OTS.fieldHome.x + 28 + 33 + 14 + typed * 17.4;
  const mom = {
    f,
    typing: typeEnv,
    headTurn: keys(f, [
      [b.type0, -0.15],
      [b.typeEnd, 0.3],
      [b.click1 + 10, 0],
      [b.brand, -0.1],
      [b.brand + 10, -0.3],
      [b.frames, -0.25],
    ]),
    headTilt: keys(f, [
      [b.r1 - 4, 0],
      [b.r1 + 8, -3],
      [b.brand, -3],
      [b.brand + 10, 2],
      [b.click2 + 10, 0],
    ]),
    nod: Math.max(
      squashPulse(f, b.click1, 10, 0.5),
      squashPulse(f, b.click2 + 2, 14, 1),
    ),
    breath: Math.sin(f / 26),
  };
  const bob = mom.breath * 2.2;

  // ---- часы на плечах ----
  // куда смотрят: на курсор набора, затем на указатель мыши и результаты
  const focusX =
    f < b.typeEnd
      ? caretX
      : f < b.brand
        ? s.cursor.x
        : keys(f, [
            [b.brand, 400],
            [b.click2 - 6, 400],
            [b.click2, s.cursor.x],
          ]);
  const P = OTS.perch;
  const L_HIDE = -340;
  const entry = (at: number) =>
    f < at
      ? L_HIDE
      : keys(f, [
          [at, L_HIDE],
          [at + 8, 28],
          [at + 13, 0],
        ]);
  const ringJoy =
    0.55 * clamp((f - b.brand - 1) / 3) * (1 - clamp((f - b.brand - 14) / 6));
  const thumbW = keys(f, [
    [b.click2 + 2, 0],
    [b.click2 + 9, 1],
    [b.frames - 30, 1],
    [b.frames - 18, 0.85],
  ]);
  const waveW = keys(f, [
    [b.hop - 4, 0],
    [b.hop + 4, 1],
    [b.frames - 30, 1],
    [b.frames - 18, 0.85],
  ]);
  const lean = keys(f, [
    [b.type0 - 6, 0],
    [b.type0 + 6, 1],
    [b.typeEnd + 6, 1],
    [b.click1 + 8, 0.4],
    [b.brand, 0.4],
    [b.brand + 6, 1.2],
    [b.click2 + 6, 0.6],
  ]);
  const wExpr = exprKeys(f, [
    [b.popW, "curious"],
    [b.click1 + 4, "worried"],
    [b.r1 + 2, "curious"],
    [b.brand + 1, "surprised"],
    [b.brand + 10, "excited"],
    [b.click2 + 4, "happy"],
  ]);
  const sExpr = exprKeys(f, [
    [b.popS, "excited"],
    [b.popS + 14, "curious"],
    [b.click1 + 4, "worried"],
    [b.r1 + 3, "curious"],
    [b.brand + 2, "surprised"],
    [b.brand + 11, "excited"],
    [b.click2 + 6, "happy"],
  ]);
  const lookFor = (cx: number) => clamp((focusX - cx) / 420, -1, 1);
  const lookUp = keys(f, [
    [b.brand + 6, -0.9],
    [b.brand + 12, -0.2],
    [b.brand + 22, -0.2],
    [b.brand + 28, -0.85],
    [b.click2 + 6, -0.85],
    [b.click2 + 12, -0.1],
  ]);
  // смотрят друг на друга (через голову мамы) на появлении BalaGo
  const toEach = keys(f, [
    [b.brand + 8, 0],
    [b.brand + 12, 1],
    [b.brand + 22, 1],
    [b.brand + 26, 0],
    [b.click2 + 8, 0],
    [b.click2 + 14, 1],
  ]);

  return (
    <Shot cam={cam} bg={C.wall}>
      <OtsBackground f={f} />
      <LaptopFront>
        <Browser s={s} />
      </LaptopFront>
      {/* мама и часы на плечах подняты над полосой субтитров (низ ≈ 1310) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translateY(${-OTS_RAISE}px)`,
        }}
      >
        {f >= b.popW - 1 ? (
          <ClockActor
            kind="work"
            role="work"
            mute
            seed={5}
            x={P.work.x}
            y={P.work.y + bob}
            size={56}
            hourDeg={W8.hourDeg}
            minDeg={W8.minDeg}
            expr={wExpr}
            face={lerp(0.45, 0.7, toEach)}
            lookX={lerp(lookFor(P.work.x), 1, toEach)}
            lookY={
              lerp(-0.9, 0, toEach) * (lookUp < -0.5 ? 1 : 0.4) + lookUp * 0.1
            }
            tilt={
              7 * lean +
              Math.sin(f / 17) * 1.5 +
              (typing ? Math.sin(f * 0.8) * 1.2 : 0)
            }
            squash={
              squashPulse(f, b.popW + 8, 9, 0.8) +
              squashPulse(f, b.click1, 8, 0.4) +
              squashPulse(f, b.brand + 1, 8, -0.7)
            }
            lift={entry(b.popW) + hopArc(f, b.brand + 1, 12, 26)}
            ring={ringJoy}
            armL={armTo(
              REST_L,
              { x: -150, y: -206, shape: "open" },
              keys(f, [
                [b.brand + 2, 0],
                [b.brand + 8, 1],
                [b.brand + 20, 1],
                [b.brand + 28, 0],
              ]),
            )}
            armR={
              armTo(REST_R, { x: 150, y: -200, shape: "thumb" }, thumbW) ??
              armTo(
                REST_R,
                { x: 136, y: -120, shape: "open" },
                lean > 0.9 ? 0.6 : 0,
              )
            }
            shadow={false}
            blinks={[b.click1 + 1, b.brand - 4]}
          />
        ) : null}
        {f >= b.popS - 1 ? (
          <ClockActor
            kind="school"
            role="school"
            mute
            seed={9}
            x={P.school.x}
            y={P.school.y + bob}
            size={56}
            hourDeg={S13.hourDeg}
            minDeg={S13.minDeg}
            expr={sExpr}
            face={lerp(-0.45, -0.7, toEach)}
            lookX={lerp(lookFor(P.school.x), -1, toEach)}
            lookY={
              lerp(-0.9, 0, toEach) * (lookUp < -0.5 ? 1 : 0.4) + lookUp * 0.1
            }
            tilt={
              -7 * lean -
              Math.sin(f / 15 + 1) * 1.5 -
              (typing ? Math.sin(f * 0.8 + 1) * 1.2 : 0)
            }
            squash={
              squashPulse(f, b.popS + 8, 9, 0.8) +
              squashPulse(f, b.click1 + 1, 8, 0.4) +
              squashPulse(f, b.brand + 2, 8, -0.7) +
              squashPulse(f, b.hop - 3, 4, 0.7) +
              squashPulse(f, b.hop + 18, 8, 0.9)
            }
            lift={
              entry(b.popS) +
              hopArc(f, b.brand + 2, 12, 30) +
              hopArc(f, b.hop, 18, 64)
            }
            ring={ringJoy}
            armL={armTo(
              REST_L,
              {
                x: -150,
                y: -226 + Math.sin(f * 0.7) * 16 * waveW,
                shape: "wave",
              },
              waveW,
            )}
            armR={armTo(
              REST_R,
              { x: 150, y: -206, shape: "open" },
              keys(f, [
                [b.brand + 3, 0],
                [b.brand + 9, 1],
                [b.brand + 21, 1],
                [b.brand + 29, 0],
              ]),
            )}
            shadow={false}
            blinks={[b.click1 + 2, b.brand - 3]}
          />
        ) : null}
        <MomBack s={mom} />
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------------
// Звуки: по тем же битам
// ---------------------------------------------------------------------
export const searchSfx: SceneSfx = (tl, from, frames) => {
  const b = searchBeats(tl, from, frames);
  const out: ReturnType<SceneSfx> = [];
  const at = (k: number, src: SfxName, volume: number) =>
    out.push({ at: from + Math.round(k), src, volume });
  // напоминания звенят наперебой и замолкают
  at(b.ring0, "ring", 0.16);
  at(b.ring0 + 24, "ringShort", 0.12);
  at(b.stop, "tick", 0.14);
  at(b.shrug, "pop", 0.1);
  // страница и почерк
  at(b.flip, "page", 0.26);
  at(b.title, "pen", 0.2);
  for (const l of b.lines) at(l, "pen", 0.2);
  at(b.leap + 14, "step", 0.14);
  // въезд в ноутбук
  at(b.push + 4, "whoosh", 0.14);
  // часы выглядывают с плеч
  at(b.popW + 6, "pop", 0.12);
  at(b.popS + 6, "pop", 0.12);
  // набор запроса
  for (let k = b.type0, i = 0; k < b.typeEnd - 2; k += 11 + (i % 3), i++)
    at(k, "type", i % 2 ? 0.13 : 0.17);
  at(b.click1, "click", 0.24);
  at(b.r1, "tick", 0.07);
  at(b.r3, "tick", 0.07);
  // результат BalaGo
  at(b.brand, "ding", 0.22);
  at(b.brand + 2, "ringShort", 0.08);
  at(b.click2, "click", 0.24);
  at(b.click2 + 2, "chime", 0.12);
  at(b.hop, "boing", 0.14);
  at(b.hop + 18, "step", 0.12);
  return out;
};
