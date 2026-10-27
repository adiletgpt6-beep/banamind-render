// Сцена 2 (≈6,5–18,5 с): два понедельника в одно и то же время.
// Часы в обеих половинах идут синхронно (12:27 → 12:36).
// Слева «АЗЫР»: на столе вибрирует телефон — «12:40 • Мектептен алып
// кетүү». Мама извиняется перед коллегами (машет ладонью экрану),
// закрывает крышку ноутбука, берёт телефон, встаёт и уходит — кресло
// ещё немного кружится. Это не насмешка: она сама везёт ребёнка.
// Справа «ЭГЕР КАТТАМ УЮШУЛСА • шарттуу мисал»: та же мама спокойно
// смотрит на часы, кивает и продолжает встречу — руки печатают и
// жестикулируют в то же самое время, когда левая закрывает ноутбук.
// Диктор: «Бир учурда ата-эне мектеп жолун өзү уюштурат. Экинчи
// көрүнүш — каттам алдын ала макулдашылгандагы мүмкүн болгон күн.»
import { useCurrentFrame } from "remotion";
import { useScene, useTimeline } from "../context";
import { CenterChip, LeftPanel, MirrorLine, NowLabel, RightPanel } from "../mirror";
import type { Place, PoseIn } from "../rig/Actor";
import { cruise, easeInOut, keys, keysV, lerp, vec } from "../rig/motion";
import { BG45_TEXT } from "../script";
import { OFFICE } from "../sets/Office";
import { CAM_HALF, H, FLOOR, OFFICE_AXIS, typePose, wordFrame } from "./common";
import { OfficeWorld } from "./OfficeWorld";

// Ключевые кадры левой мамы (от начала сцены).
export const SP = {
  buzz: 14,
  tapPhone: 48,
  wave0: 56,
  wave1: 86,
  lid0: 94,
  lid1: 112,
  grab: 126,
  stand0: 134,
  stand1: 162,
  walk0: 164,
  walk1: 246,
} as const;

export const SPLIT_MIN0 = 12 * 60 + 27;

// Левая мама уходит из офиса (для шагов и звука).
export const splitMomPlace = (t: number): Place => ({ x: lerp(OFFICE.mom.x, -760, cruise((t - SP.walk0) / (SP.walk1 - SP.walk0))), y: FLOOR, h: H.mom });

export const SplitScene: React.FC = () => {
  const f = useCurrentFrame();
  const { from } = useScene();
  const tl = useTimeline();
  const cue = tl.cues.find((c) => c.id === "n02")!;
  const second = wordFrame(cue, "экинчи", 0.55, from);
  const minutes = SPLIT_MIN0 + f / 40;
  const L = OFFICE.laptop;
  const P = OFFICE.phone;

  // ---------- левая мама ----------
  const lid = keys(f, [[SP.lid0 + 2, 1], [SP.lid1, 0]]);
  const leftPlace = splitMomPlace;
  const leftPose = (t: number): PoseIn => {
    const sit = keys(t, [[SP.stand0, 1], [SP.stand1, 0]]);
    const base = typePose(t, 0.15, 0);
    const lidAt = (tt: number) => keys(tt, [[SP.lid0 + 2, 1], [SP.lid1, 0]]);
    // ближняя рука: телефон → ладонь экрану → крышка → телефон в руку
    const handR = keysV(t, [
      [SP.buzz + 20, vec(L.x - 70, L.y - 10)],
      [SP.tapPhone - 4, vec(P.x + 10, P.y - 16)],
      [SP.tapPhone + 4, vec(P.x + 10, P.y - 10)],
      [SP.wave0 + 4, vec(L.x - 110, L.y - 230)],
      [SP.wave1, vec(L.x - 110, L.y - 230)],
      [SP.lid0, vec(L.x - 40, L.y - 190)],
      [SP.lid1, vec(L.x - 40, L.y - 24)],
      [SP.grab - 4, vec(P.x + 10, P.y - 12)],
      [SP.grab + 10, vec(P.x + 80, P.y - 80)],
      [SP.stand1, vec(-10, FLOOR - 0.5 * H.mom)],
    ]);
    const waving = t >= SP.wave0 + 2 && t <= SP.wave1;
    const onLid = t >= SP.lid0 && t <= SP.lid1 + 2;
    const lidY = L.y - 8 - 186 * lidAt(t);
    const holding = t >= SP.grab;
    const p = leftPlace(t);
    const armR = holding
      ? t > SP.stand1
        ? { target: vec(p.x - 0.1 * p.h * (t > SP.walk0 ? 1 : 0) + 0.04 * p.h, p.y - 0.46 * p.h), shape: "phone" as const, item: "phone" as const, elbow: "hang" as const, glow: 0.6, behind: false }
        : { target: handR, shape: "phone" as const, item: "phone" as const, elbow: "down" as const, glow: 0.8, behind: false }
      : {
          target: onLid ? vec(L.x - 40, lidY) : waving ? vec(handR.x + Math.sin(t / 3) * 16, handR.y) : handR,
          shape: waving ? ("wave" as const) : onLid ? ("open" as const) : t > SP.buzz + 20 ? ("point" as const) : ("relax" as const),
          elbow: "down" as const,
          behind: false,
        };
    return {
      ...base,
      sit,
      seat: OFFICE.mom.seat,
      lean: lerp(4, 0, 1 - sit),
      armR,
      armL: sit > 0.5 ? base.armL : { target: null, shape: "relax" },
      lookY: keys(t, [[0, 0.7], [SP.tapPhone + 6, 0.7], [SP.wave0 + 4, 0], [SP.lid1, 0.25], [SP.grab + 10, 0.4], [SP.stand1, 0]]),
      expr: t < SP.wave0 ? "worried" : t < SP.lid1 ? "apologetic" : "thinking",
      nod: keys(t, [[SP.wave0 + 10, 0], [SP.wave0 + 16, 5], [SP.wave0 + 22, 0]]),
    };
  };
  const leftFace = (t: number) =>
    keys(t, [[0, 0.25], [SP.tapPhone + 6, 0.25], [SP.wave0 + 4, 0.6], [SP.grab, 0.6], [SP.stand0 + 6, 0.1], [SP.stand1, -0.8]]);
  const chairSpin = keys(f, [[SP.stand1, 0], [SP.walk0 + 20, 0.55], [SP.walk1 + 40, 0.1]]);

  // ---------- правая (условная) мама ----------
  const glance = SP.buzz + 10;
  const gesture0 = SP.lid0 - 6;
  const rightPose = (t: number): PoseIn => {
    const look = keys(t, [[glance, 0], [glance + 8, 1], [glance + 30, 1], [glance + 40, 0]]);
    const g = keys(t, [[gesture0, 0], [gesture0 + 10, 1], [gesture0 + 50, 1], [gesture0 + 62, 0]]);
    const base = typePose(t, 1 - Math.max(look, g), 3);
    return {
      ...base,
      armR: g > 0.05 ? { target: vec(L.x - 120 + Math.sin(t / 5) * 10 * g, L.y - 110 - 40 * g), shape: "open", elbow: "down", behind: false } : base.armR,
      lookY: lerp(0.22, -0.5, look) - 0.1 * g,
      expr: t < glance ? "calm" : t < second ? "softSmile" : "smile",
      nod: keys(t, [[glance + 30, 0], [glance + 36, 4], [glance + 42, 0], [gesture0 + 20, 0], [gesture0 + 26, 3], [gesture0 + 32, 0]]),
      headTilt: 3 * look,
    };
  };
  const rightFace = (t: number) => keys(t, [[glance, 0.55], [glance + 8, 0.85], [glance + 30, 0.85], [glance + 40, 0.55]]);
  const pulse = keys(f, [[second - 4, 0], [second + 8, 1], [second + 40, 0]]);

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }}>
      <LeftPanel cam={{ ...CAM_HALF, zoom: CAM_HALF.zoom * (1 + 0.07 * easeInOut((f - SP.walk1 + 20) / 90)), y: CAM_HALF.y + 40 * easeInOut((f - SP.walk1 + 20) / 90) }}>
        <OfficeWorld
          f={f}
          minutes={minutes}
          uid="s-l"
          pose={leftPose}
          face={leftFace}
          place={leftPlace}
          walkFrom={SP.walk0 - 2}
          lid={lid}
          buzz={keys(f, [[SP.tapPhone, 1], [SP.tapPhone + 4, 0]])}
          reminder={keys(f, [[SP.lid1, 1], [SP.lid1 + 12, 0]])}
          phoneOnDesk={f < SP.grab}
          chairSpin={chairSpin}
          seed={6}
        />
      </LeftPanel>
      <RightPanel cam={CAM_HALF} mirror={OFFICE_AXIS} open={1} f={f}>
        <OfficeWorld f={f} minutes={minutes} uid="s-r" pose={rightPose} face={rightFace} seed={6} laptopGlow={0} />
      </RightPanel>
      {/* «Экинчи көрүнүш» — правая створка мягко подсвечивается */}
      <div style={{ position: "absolute", left: 546, top: 0, width: 534, height: 1920, pointerEvents: "none", boxShadow: `inset 0 0 ${60 * pulse}px rgba(255,201,14,${0.55 * pulse})` }} />
      <MirrorLine draw={1} glow={0.3 + 0.5 * pulse} />
      <NowLabel a={1} />
      <CenterChip a={keys(f, [[6, 0], [16, 1], [42, 1], [52, 0]])} text={BG45_TEXT.mirror.compare} y={770} />
    </div>
  );
};
