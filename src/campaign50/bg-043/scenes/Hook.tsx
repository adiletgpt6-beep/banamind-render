// Сцена 1 (00:00–≈00:07): полка офиса крупно. Два добрых будильника
// спорят «нос к носу»: над ними заклинивают и искрят их шестерёнки.
// «Жумуш сааты» отступает, указывает рукой и минутной стрелкой на стикер
// «ЖУМУШ 08:00»: «Мен жумушту эскертем!». «Мектеп сааты» подпрыгивает,
// крутит стрелку и указывает на «МЕКТЕП 13:00»: «Мен мектептен алып кетүү
// убактысын эскертем!». В конце оба снова сходятся и звенят наперебой.
// Надписи: «СААТТАР ТАЛАШЫ» и «Ойдон чыгарылган тамаша».
// Камера медленно наезжает; конечное положение камеры = начало сцены 2.
import { useCurrentFrame } from "remotion";
import { appear, clamp, hopArc, keys, squashPulse } from "../anim";
import { ClockActor, exprKeys } from "../chars/ClockActor";
import { timeToDeg } from "../chars/Clock";
import { useScene, useTimeline } from "../context";
import { Caption, Chip, Gear, Sparks } from "../parts";
import { C, CLOCK_COLORS } from "../palette";
import { BG43_TEXT } from "../script";
import { DeskNotebook, OFFICE, OfficeBack, OfficeDesk } from "../sets/Office";
import type { SceneSfx } from "../sfxCues";
import { camKeys, Shot, type Cam } from "../shots";
import { cueFrames, type Bg43Timeline } from "../timing";

export const HOOK_CAM_START: Cam = { x: 402, y: 742, zoom: 1.84 };
export const HOOK_CAM_END: Cam = { x: 400, y: 745, zoom: 1.98 };
// Конечные положения часов (сцена 2 начинается с них).
export const HOOK_END = { work: 336, school: 464 } as const;

const W8 = timeToDeg(8, 0);
const S13 = timeToDeg(13, 0);
// Углы от центра циферблата к стикерам (минутная стрелка «указывает»).
const WORK_TO_NOTE = -26;
const SCHOOL_TO_NOTE = 377; // полный оборот и к стикеру

export const hookBeats = (tl: Bg43Timeline, sceneFrom: number, frames: number) => {
  const w = cueFrames(tl, "w01");
  const s = cueFrames(tl, "s01");
  const w0 = w.from - sceneFrom;
  const w1 = w.to - sceneFrom;
  const s0 = s.from - sceneFrom;
  const s1 = s.to - sceneFrom;
  return {
    w0,
    w1,
    s0,
    s1,
    workStep: Math.max(4, w0 - 8),
    schoolHop: s0 - 10,
    clash: Math.min(frames - 22, s1 + 4),
    // заклинивание шестерёнок (искры)
    jams: [6, 18, 30, Math.min(frames - 22, s1 + 4) + 6, Math.min(frames - 22, s1 + 4) + 16],
    frames,
  };
};

const Jam: React.FC<{ f: number; jams: readonly number[]; fadeAt: number }> = ({ f, jams, fadeAt }) => {
  // две шестерёнки над часами упираются зубцами: дрожь и искры
  const jitter = jams.reduce((acc, j) => acc + (f >= j && f < j + 8 ? Math.sin((f - j) * 2.4) * 4 * (1 - (f - j) / 8) : 0), 0);
  const show = 1 - clamp((f - fadeAt) / 10);
  const rotA = 18 * Math.sin(f / 9) + jitter * 2;
  const rotB = -18 * Math.sin(f / 9) - jitter * 2;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: show }}>
      <Gear x={372 - jitter} y={612} r={34} rot={rotA} fill={CLOCK_COLORS.work.gear} />
      <Gear x={430 + jitter} y={600} r={30} rot={rotB} fill={CLOCK_COLORS.school.gear} />
      {jams.map((j) => (
        <Sparks key={j} x={401} y={606} f={f} at={j} n={6} spread={46} />
      ))}
    </div>
  );
};

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, frames } = useScene();
  const b = hookBeats(tl, from, frames);
  const cam = camKeys(f, [
    [0, HOOK_CAM_START],
    [frames, HOOK_CAM_END],
  ]);
  const y = OFFICE.clocks.work.y;
  const size = OFFICE.clocks.size;

  // ---- Жумуш сааты ----
  const wx = keys(f, [
    [b.workStep, 324],
    [b.workStep + 10, 304],
    [b.clash - 2, 304],
    [b.clash + 8, HOOK_END.work],
  ]);
  const wFace = keys(f, [
    [0, 0.65],
    [b.workStep, 0.65],
    [b.workStep + 8, -0.55],
    [b.w1 + 6, -0.55],
    [b.w1 + 14, 0.5],
    [b.clash, 0.5],
    [b.clash + 6, 0.7],
  ]);
  const wPoint = keys(f, [
    [b.workStep + 2, 0],
    [b.workStep + 10, 1],
    [b.w1 + 4, 1],
    [b.w1 + 14, 0],
  ]);
  const wMin = keys(f, [
    [b.w0 - 2, 0],
    [b.w0 + 8, WORK_TO_NOTE],
    [b.w1 + 2, WORK_TO_NOTE],
    [b.w1 + 12, 0],
  ]);
  const wExpr = exprKeys(f, [
    [0, "angry"],
    [b.workStep + 2, "proud"],
    [b.s0 - 4, "stubborn"],
    [b.s0 + 18, { browIn: -8, browOut: 3, lid: 0.45, smile: -0.2 }],
    [b.clash, "angry"],
  ]);
  // во время реплики «Мектеп сааты» — закатывает глаза
  const roll = clamp((f - b.s0 - 10) / 18) * (1 - clamp((f - b.s1) / 8));
  const wLookX = f < b.workStep ? 0.7 : f < b.w1 ? -0.4 : roll > 0 ? lerpRoll(roll) : 0.6;
  const wLookY = f < b.w1 && f >= b.workStep ? -0.5 : roll > 0 ? -0.85 * Math.sin(roll * Math.PI) : 0;
  const wTilt = keys(f, [
    [0, 7],
    [b.workStep, 7],
    [b.workStep + 10, -4],
    [b.w1 + 10, 0],
    [b.clash, 0],
    [b.clash + 8, 8],
  ]) + (f < b.workStep ? Math.sin(f / 4) * 1.5 : 0);
  const wSq = squashPulse(f, b.workStep + 9, 9, 0.8) + squashPulse(f, b.w0, 8, -0.5);

  // ---- Мектеп сааты ----
  const sHop = hopArc(f, b.schoolHop, 16, 44) + hopArc(f, b.clash - 2, 12, 22);
  const sx = keys(f, [
    [b.schoolHop, 478],
    [b.schoolHop + 16, 500],
    [b.clash - 2, 500],
    [b.clash + 10, HOOK_END.school],
  ]);
  const sFace = keys(f, [
    [0, -0.65],
    [b.schoolHop, -0.65],
    [b.schoolHop + 10, 0.6],
    [b.s1 + 6, 0.6],
    [b.s1 + 12, -0.5],
    [b.clash, -0.5],
    [b.clash + 6, -0.7],
  ]);
  const sPoint = keys(f, [
    [b.schoolHop + 6, 0],
    [b.schoolHop + 16, 1],
    [b.s1 + 4, 1],
    [b.s1 + 14, 0],
  ]);
  const sMin = keys(f, [
    [b.s0 - 2, 0],
    [b.s0 + 18, SCHOOL_TO_NOTE],
    [b.s1 + 2, SCHOOL_TO_NOTE],
    [b.s1 + 14, 360],
  ]);
  const sExpr = exprKeys(f, [
    [0, "angry"],
    [b.w0 - 2, "stubborn"],
    [b.schoolHop, "excited"],
    [b.clash, "angry"],
  ]);
  const tap = f > b.w0 && f < b.w1 + 4 ? 0.5 : 0;
  const sTilt = keys(f, [
    [0, -7],
    [b.schoolHop, -7],
    [b.schoolHop + 12, 4],
    [b.s1 + 10, 0],
    [b.clash, 0],
    [b.clash + 8, -8],
  ]) - (f < b.workStep ? Math.sin(f / 4) * 1.5 : 0);
  const sSq = squashPulse(f, b.schoolHop - 3, 6, 0.9) + squashPulse(f, b.schoolHop + 16, 9, 1);
  const ringBoth = clamp((f - b.clash - 4) / 5);
  const sRing = Math.max(ringBoth, clamp((f - b.s1 + 4) / 4) * (1 - clamp((f - b.s1 - 10) / 6)) * 0.7);

  const noteGlow = { work: wPoint * clamp((f - b.w0 + 4) / 6), school: sPoint * clamp((f - b.s0 + 4) / 6) };

  return (
    <>
      <Shot cam={cam} bg={C.wall}>
        <OfficeBack noteGlow={noteGlow} />
        {/* стол мамы внизу (тот же, что в сцене 2): склейка без «появлений» */}
        <OfficeDesk>
          <DeskNotebook x={OFFICE.notebook.x} y={OFFICE.notebook.y} lines={0} />
        </OfficeDesk>
        <Jam f={f} jams={b.jams} fadeAt={frames - 12} />
        <ClockActor
          kind="work"
          role="work"
          seed={3}
          x={wx}
          y={y}
          size={size}
          hourDeg={W8.hourDeg}
          minDeg={wMin}
          expr={wExpr}
          face={wFace}
          lookX={wLookX}
          lookY={wLookY}
          tilt={wTilt}
          squash={wSq}
          ring={ringBoth}
          armL={wPoint > 0.05 ? { x: -96 - 96 * wPoint, y: -150 - 120 * wPoint, shape: "point" } : null}
          armR={f < b.workStep ? { x: 150, y: -120 + Math.sin(f / 3) * 8, shape: "fist" } : f >= b.clash ? { x: 150, y: -110, shape: "fist" } : null}
          gear={0}
        />
        <ClockActor
          kind="school"
          role="school"
          seed={7}
          x={sx}
          y={y}
          size={size}
          hourDeg={S13.hourDeg}
          minDeg={sMin}
          expr={sExpr}
          face={sFace}
          lookX={f > b.schoolHop && f < b.s1 + 6 ? 0.45 : -0.7}
          lookY={f > b.schoolHop && f < b.s1 + 6 ? -0.5 : 0}
          tilt={sTilt}
          squash={sSq}
          lift={sHop / 0.7}
          ring={sRing}
          step={f / 9}
          stepAmt={tap}
          armR={sPoint > 0.05 ? { x: 96 + 90 * sPoint, y: -150 - 125 * sPoint, shape: "point" } : null}
          armL={f < b.workStep ? { x: -150, y: -120 + Math.sin(f / 3 + 1) * 8, shape: "fist" } : f >= b.clash ? { x: -150, y: -110, shape: "fist" } : null}
          gear={0}
        />
      </Shot>
      <Caption f={f} at={-12} out={frames - 12} text={BG43_TEXT.hook.title} size={60} />
      <div style={{ position: "absolute", left: 60, right: 150, top: 384, display: "flex", justifyContent: "center", opacity: appear(f, 4, 10) * (1 - clamp((f - frames + 12) / 10)) }}>
        <Chip text={BG43_TEXT.hook.fiction} top={0} />
      </div>
    </>
  );
};

// Закатывание глаз: взгляд проходит дугой слева направо.
const lerpRoll = (t: number) => -0.8 + 1.6 * t;

export const hookSfx: SceneSfx = (tl, from, frames) => {
  const b = hookBeats(tl, from, frames);
  const out: ReturnType<SceneSfx> = [];
  for (let k = 0; k < frames; k += 15) out.push({ at: from + k, src: (k / 15) % 2 ? "tock" : "tick", volume: 0.14 });
  for (const j of b.jams) out.push({ at: from + j, src: "gear", volume: 0.2 });
  out.push({ at: from + b.workStep + 8, src: "step", volume: 0.3 });
  out.push({ at: from + b.w0 + 2, src: "pop", volume: 0.14 });
  for (let k = b.w0 + 2; k < b.w1; k += 9) out.push({ at: from + k, src: "step", volume: 0.12 });
  out.push({ at: from + b.schoolHop, src: "boing", volume: 0.22 });
  out.push({ at: from + b.schoolHop + 16, src: "step", volume: 0.3 });
  out.push({ at: from + b.s0 + 4, src: "tick", volume: 0.2 });
  out.push({ at: from + b.s1 - 4, src: "ringShort", volume: 0.16 });
  out.push({ at: from + b.clash + 4, src: "ring", volume: 0.2 });
  return out;
};
