// Сцена 2 (≈00:07–00:20): камера отъезжает от полки — за столом мама.
// Она подходит и аккуратно ставит оба будильника рядом, ровно в линию.
// Часы переглядываются, отворачиваются и разъезжаются каждый к своему
// стикеру. Мама вздыхает и с улыбкой говорит им: «Экөөңөр тең
// маанилүүсүңөр. Бирок бир эле убакта эки жерде боло албайм да.»
// Часы сначала гордо приосаниваются, потом смущённо переглядываются.
// Вместо паники мама берёт ручку и записывает реальные заботы (вставка-
// блокнот). Надпись: «Бир ата-эне — эки милдет».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, keys, squashPulse } from "../anim";
import { timeToDeg } from "../chars/Clock";
import { ClockActor, exprKeys } from "../chars/ClockActor";
import { useScene, useTimeline } from "../context";
import { Caption } from "../parts";
import { C } from "../palette";
import { Actor, type PoseIn } from "../rig/Actor";
import { BG43_TEXT } from "../script";
import { DeskNotebook, LaptopBack, OFFICE, OfficeBack, OfficeDesk } from "../sets/Office";
import type { SceneSfx } from "../sfxCues";
import { camKeys, Shot, type Cam } from "../shots";
import { cueFrames, wordFrame, type Bg43Timeline } from "../timing";
import { HOOK_CAM_END, HOOK_END } from "./Hook";

export const ALIGN_CAM: Cam = { x: 556, y: 990, zoom: 1.1 };
const ALIGN_CAM_TALK: Cam = { x: 530, y: 950, zoom: 1.22 };
export const ALIGN_CAM_END: Cam = { x: 572, y: 1040, zoom: 1.14 };
// Положения часов в конце сцены (сцена 3 начинается с них).
export const ALIGN_END = { work: 232, school: 584 } as const;
export const MOM_HOME = OFFICE.mom.x;
// мама не подходит: достаёт до правого бока каждых часов со своего места
const MOM_NEAR = MOM_HOME - 24;

const W8 = timeToDeg(8, 0);
const S13 = timeToDeg(13, 0);
// мама берёт часы за правый бок циферблата (она стоит справа от полки)
const GRIP_Y = OFFICE.clocks.work.y - 0.7 * 160;
const GRIP_DX = 0.7 * 100 + 8;
// «ровная линия»: часы рядом, прямо, лицом к зрителю
const ALIGNED = { work: 352, school: 508 } as const;

export const alignBeats = (tl: Bg43Timeline, sceneFrom: number, frames: number) => {
  const m = cueFrames(tl, "m01");
  const m0 = m.from - sceneFrom;
  const m1 = m.to - sceneFrom;
  // «Бирок» — начало второй фразы
  const but = wordFrame(tl, "m01", 3) - sceneFrom;
  const important = wordFrame(tl, "m01", 2) - sceneFrom;
  const write = m1 + 10;
  return {
    m0,
    m1,
    but,
    important,
    walk0: 12,
    walk1: 34,
    grabS: 38,
    slideS: [46, 60] as const,
    grabW: 68,
    slideW: [76, 90] as const,
    release: 94,
    back0: 98,
    back1: 122,
    glance: 104,
    scoot: [114, 140] as const,
    sigh: 146,
    write,
    lines: [write + 12, write + 34, write + 56] as const,
    frames,
  };
};

export const AlignScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, frames } = useScene();
  const b = alignBeats(tl, from, frames);
  const cam = camKeys(f, [
    [0, HOOK_CAM_END],
    [34, ALIGN_CAM],
    [b.m0 - 10, ALIGN_CAM],
    [b.m0 + 30, ALIGN_CAM_TALK],
    [b.m1 + 4, ALIGN_CAM_TALK],
    [frames, ALIGN_CAM_END],
  ]);
  const y = OFFICE.clocks.work.y;
  const size = OFFICE.clocks.size;
  const m = OFFICE.mom;

  // ---- часы ----
  const wx = keys(f, [
    [b.slideW[0], HOOK_END.work],
    [b.slideW[1], ALIGNED.work],
    [b.scoot[0], ALIGNED.work],
    [b.scoot[1], ALIGN_END.work],
  ]);
  const sx = keys(f, [
    [b.slideS[0], HOOK_END.school],
    [b.slideS[1], ALIGNED.school],
    [b.scoot[0] + 2, ALIGNED.school],
    [b.scoot[1] + 2, ALIGN_END.school],
  ]);
  const scooting = (a: number, z: number) => (f > a && f < z ? 1 : 0);
  const wFace = keys(f, [
    [0, 0.7],
    [b.slideW[0], 0.7],
    [b.slideW[1], 0],
    [b.glance, 0],
    [b.glance + 6, 0.55],
    [b.scoot[0] - 2, 0.55],
    [b.scoot[0] + 4, -0.75],
    [b.scoot[1] + 4, -0.75],
    [b.m0 - 4, -0.75],
    [b.m0 + 4, 0.65],
    [b.but, 0.65],
    [b.but + 6, 0.5],
    [b.m1 + 10, 0.5],
    [b.m1 + 18, 0.2],
  ]);
  const sFace = keys(f, [
    [0, -0.7],
    [b.slideS[0], -0.7],
    [b.slideS[1], 0],
    [b.glance + 2, 0],
    [b.glance + 8, -0.55],
    [b.scoot[0], -0.55],
    [b.scoot[0] + 6, 0.75],
    [b.scoot[1] + 6, 0.75],
    [b.m0 - 2, 0.75],
    [b.m0 + 6, 0.6],
    [b.but, 0.6],
    [b.but + 6, -0.5],
    [b.m1 + 10, -0.5],
    [b.m1 + 18, 0.3],
  ]);
  const wExpr = exprKeys(f, [
    [0, "angry"],
    [b.slideW[0], "surprised"],
    [b.slideW[1] + 4, "neutral"],
    [b.glance + 6, "stubborn"],
    [b.scoot[0] + 4, "proud"],
    [b.m0 + 2, "curious"],
    [b.important + 4, "happy"],
    [b.but + 6, "sheepish"],
    [b.m1 + 14, "soft"],
  ]);
  const sExpr = exprKeys(f, [
    [0, "angry"],
    [b.slideS[0], "surprised"],
    [b.slideS[1] + 4, "neutral"],
    [b.glance + 8, "stubborn"],
    [b.scoot[0] + 6, "proud"],
    [b.m0 + 4, "curious"],
    [b.important + 6, "excited"],
    [b.but + 6, "sheepish"],
    [b.m1 + 14, "soft"],
  ]);
  const ring = 0.8 * (1 - clamp(f / 14));
  const lookUpAtMom = f > b.m0 && f < b.but ? -0.45 : 0;

  // ---- мама ----
  const place = (t: number) => ({
    x: keys(t, [
      [b.walk0, MOM_HOME],
      [b.walk1, MOM_NEAR],
      [b.back0, MOM_NEAR],
      [b.back1, MOM_HOME],
    ]),
    y: m.y,
    h: m.h,
  });
  const face = (t: number) =>
    keys(t, [
      [0, -0.35],
      [b.walk0, -0.35],
      [b.walk0 + 6, -0.7],
      [b.release + 6, -0.6],
      [b.back1, -0.45],
      [b.write - 6, -0.45],
      [b.write + 4, -0.15],
    ]);
  const desk = OFFICE.desk.top + 4;
  const pose = (t: number): PoseIn => {
    const p = place(t);
    // пока камера ещё у полки, левая рука у тела (за краем кадра),
    // затем ложится на стол рядом с блокнотом
    const restL = { x: p.x - (0.03 + 0.12 * clamp((t - 18) / 16)) * p.h, y: desk };
    const restR = { x: p.x + 0.12 * p.h, y: desk + 2 };
    // ладонь на боку часов: сначала «Мектеп сааты», потом «Жумуш сааты»
    const onS = keys(t, [
      [b.grabS - 10, 0],
      [b.grabS, 1],
      [b.slideS[1] + 2, 1],
      [b.grabW - 4, 0],
    ]);
    const onW = keys(t, [
      [b.grabW - 6, 0],
      [b.grabW + 4, 1],
      [b.slideW[1] + 2, 1],
      [b.release + 4, 0],
    ]);
    const handW = { x: keys(t, [[b.slideW[0], HOOK_END.work], [b.slideW[1], ALIGNED.work]]) + GRIP_DX, y: GRIP_Y };
    const handS = { x: keys(t, [[b.slideS[0], HOOK_END.school], [b.slideS[1], ALIGNED.school]]) + GRIP_DX, y: GRIP_Y };
    let armL: PoseIn["armL"] = { target: restL, shape: "relax", elbow: t < 22 ? "hang" : "down", behind: false };
    if (onW > 0.01 || onS > 0.01) {
      const tgt = onW >= onS ? handW : handS;
      const k = Math.max(onW, onS);
      armL = { target: { x: restL.x + (tgt.x - restL.x) * k, y: restL.y + (tgt.y - restL.y) * k }, shape: "relax", elbow: "down", behind: false };
    }
    let armR: PoseIn["armR"] = { target: restR, shape: "relax", elbow: "down", behind: false };
    // реплика: ладонь к часам, на второй фразе — обе ладони чуть в стороны
    const g1 = keys(t, [
      [b.m0 - 4, 0],
      [b.m0 + 8, 1],
      [b.but - 2, 1],
      [b.but + 8, 0],
    ]);
    const g2 = keys(t, [
      [b.but - 2, 0],
      [b.but + 10, 1],
      [b.m1 - 4, 1],
      [b.m1 + 8, 0],
    ]);
    if (g1 > 0.01) armL = { target: { x: restL.x + (p.x - 0.23 * p.h - restL.x) * g1, y: restL.y + (1078 - restL.y) * g1 }, shape: "open", elbow: "down", behind: false };
    if (g2 > 0.01) {
      armL = { target: { x: restL.x + (p.x - 0.2 * p.h - restL.x) * g2, y: restL.y + (1118 - restL.y) * g2 }, shape: "open", elbow: "down", behind: false };
      armR = { target: { x: restR.x + (p.x + 0.19 * p.h - restR.x) * g2, y: restR.y + (1124 - restR.y) * g2 }, shape: "open", elbow: "down", behind: false };
    }
    // запись: ручка в руке, мелкие движения по строке
    const w = clamp((t - b.write + 8) / 10);
    if (w > 0) {
      const line = b.lines.findIndex((l) => t < l + 22);
      const li = line < 0 ? 2 : line;
      const prog = clamp((t - b.lines[li]) / 22);
      const pen = { x: OFFICE.notebook.x - 70 + prog * 120 + Math.sin(t * 1.3) * 5, y: OFFICE.notebook.y - 34 + li * 9 + Math.abs(Math.sin(t * 0.9)) * -6 };
      armL = { target: { x: restL.x + (pen.x - restL.x) * w, y: restL.y + (pen.y - restL.y) * w }, shape: "pinch", item: "pencil", elbow: "down", behind: false };
      armR = { target: { x: OFFICE.notebook.x + 120, y: desk + 4 }, shape: "relax", elbow: "down", behind: false };
    }
    const exhale = keys(t, [
      [b.sigh - 4, 0],
      [b.sigh + 8, 1],
      [b.sigh + 22, 0],
    ]);
    return {
      armL,
      armR,
      expr:
        t < b.walk0
          ? "surprised"
          : t < b.release
            ? "softSmile"
            : t < b.scoot[1]
              ? "surprised"
              : t < b.m0
                ? "calm"
                : t < b.but
                  ? "smile"
                  : t < b.m1 + 6
                    ? "apologetic"
                    : t < b.write + 10
                      ? "calm"
                      : "thinking",
      headTilt: keys(t, [
        [b.but, 0],
        [b.but + 10, 6],
        [b.m1 + 4, 6],
        [b.m1 + 16, 0],
      ]),
      shoulders: keys(t, [
        [b.m1 - 16, 0],
        [b.m1 - 6, 0.7],
        [b.m1 + 6, 0],
      ]),
      exhale,
      lookY: t > b.write - 4 ? 0.55 : t > b.grabW - 6 && t < b.release ? -0.2 : 0,
      lean: t > b.write - 4 ? 4 : 0,
    };
  };

  const listOn = appear(f, b.write - 2, 12);
  const notes = BG43_TEXT.align.notes;

  return (
    <>
      <Shot cam={cam} bg={C.wall}>
        <OfficeBack />
        <ClockActor
          kind="work"
          role="work"
          seed={3}
          x={wx}
          y={y}
          size={size}
          hourDeg={W8.hourDeg}
          minDeg={W8.minDeg}
          expr={wExpr}
          face={wFace}
          lookY={lookUpAtMom}
          lookX={f > b.m0 && f < b.but ? 0.6 : 0}
          ring={ring}
          tilt={keys(f, [[0, 8], [b.slideW[0], 8], [b.slideW[1], 0], [b.scoot[0] + 4, 0], [b.scoot[0] + 10, -6], [b.scoot[1], -6], [b.scoot[1] + 8, 0]])}
          squash={squashPulse(f, b.slideW[1], 8, 0.6) + squashPulse(f, b.scoot[1], 8, 0.7) + squashPulse(f, b.important, 10, -0.5)}
          step={f / 7}
          stepAmt={scooting(b.scoot[0] + 4, b.scoot[1])}
          armL={f > b.scoot[0] + 4 && f < b.m0 ? { x: -160, y: -110, shape: "fist" } : null}
          armR={f > b.important && f < b.but ? { x: 150, y: -200, shape: "thumb" } : null}
        />
        <ClockActor
          kind="school"
          role="school"
          seed={7}
          x={sx}
          y={y}
          size={size}
          hourDeg={S13.hourDeg}
          minDeg={S13.minDeg}
          expr={sExpr}
          face={sFace}
          lookY={lookUpAtMom}
          lookX={f > b.m0 && f < b.but ? 0.6 : 0}
          ring={ring}
          tilt={keys(f, [[0, -8], [b.slideS[0], -8], [b.slideS[1], 0], [b.scoot[0] + 6, 0], [b.scoot[0] + 12, 6], [b.scoot[1] + 2, 6], [b.scoot[1] + 10, 0]])}
          squash={squashPulse(f, b.slideS[1], 8, 0.6) + squashPulse(f, b.scoot[1] + 2, 8, 0.7) + squashPulse(f, b.important + 2, 10, -0.6)}
          step={f / 7}
          stepAmt={scooting(b.scoot[0] + 6, b.scoot[1] + 2)}
          armR={f > b.scoot[0] + 6 && f < b.m0 ? { x: 160, y: -110, shape: "fist" } : null}
          armL={f > b.important && f < b.but ? { x: -150, y: -210, shape: "wave" } : null}
        />
        <Actor uid="mom" look="mom" f={f} place={place} face={face} pose={pose} role="mom" seed={11} layer="body" walkFrom={0} />
        <OfficeDesk>
          <LaptopBack x={OFFICE.laptop.x} y={OFFICE.laptop.y} />
          <DeskNotebook x={OFFICE.notebook.x} y={OFFICE.notebook.y} lines={f < b.lines[0] ? 0 : f < b.lines[1] ? 1 : f < b.lines[2] ? 2 : 3} />
        </OfficeDesk>
        <Actor uid="mom" look="mom" f={f} place={place} face={face} pose={pose} role="mom" seed={11} layer="arms" walkFrom={0} />
      </Shot>
      <Caption f={f} at={b.scoot[1] - 6} text={BG43_TEXT.align.caption} />
      {/* вставка: блокнот мамы — то, что она записывает */}
      {listOn > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 1010,
            width: 540,
            padding: "24px 30px 26px",
            borderRadius: 22,
            backgroundColor: "#FFFFFF",
            backgroundImage: "repeating-linear-gradient(180deg, transparent 0 55px, #E3EAF4 55px 58px)",
            boxShadow: "0 18px 40px rgba(20,40,90,0.18)",
            transform: `translateY(${(1 - listOn) * 60}px) rotate(-3deg)`,
            opacity: listOn,
            fontFamily,
            color: C.navy,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 4 }}>{BG43_TEXT.align.noteTitle}:</div>
          {notes.map((n, i) => {
            const p = clamp((f - b.lines[i]) / 22);
            return (
              <div key={n} style={{ display: "table", fontSize: 35, fontWeight: 800, lineHeight: "58px", whiteSpace: "nowrap", clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
                {i === 2 ? "↻ " : "• "}
                {n}
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
};

export const alignSfx: SceneSfx = (tl, from, frames) => {
  const b = alignBeats(tl, from, frames);
  const out: ReturnType<SceneSfx> = [];
  out.push({ at: from + b.slideW[0], src: "slide", volume: 0.22 });
  out.push({ at: from + b.slideS[0], src: "slide", volume: 0.22 });
  out.push({ at: from + b.slideW[1], src: "step", volume: 0.2 });
  out.push({ at: from + b.slideS[1], src: "step", volume: 0.2 });
  for (let k = b.scoot[0] + 4; k < b.scoot[1]; k += 4) out.push({ at: from + k, src: "step", volume: 0.16 });
  out.push({ at: from + b.important + 2, src: "pop", volume: 0.14 });
  for (const l of b.lines) out.push({ at: from + l, src: "pen", volume: 0.22 });
  for (let k = 0; k < b.m0; k += 30) out.push({ at: from + k, src: "tick", volume: 0.07 });
  return out;
};
