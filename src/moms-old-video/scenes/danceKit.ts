// Танец в сценах: поза танцующего персонажа (стопы, таз, корпус, руки FK,
// голова, волосы, подол) для Actor. Поза складывается с остальными полями
// сцены (мимика, взгляд). Время танца t можно «искривлять» (пауза,
// замедление) — хореография сама по себе детерминирована.
import type { Place, PoseIn } from "../rig/Actor";
import { danceAt, hipVelocity, tuckTarget, type DanceSeg } from "../rig/dance";
import { LOOKS, type LookId } from "../rig/looks";

export const danceTurn = (t: number, segs: readonly DanceSeg[], look: LookId) => danceAt(t, segs, LOOKS[look].build).turn;

export const dancePose = (t: number, segs: readonly DanceSeg[], look: LookId, place: Place): PoseIn => {
  const b = LOOKS[look].build;
  const d = danceAt(t, segs, b);
  const k = place.h / 1000;
  const rest = { x: 60, y: b.shoulderY + b.upperArm + b.forearm - 30 };
  const tuck = tuckTarget(b, d.tuck, rest);
  const v = hipVelocity(t, segs, b);
  return {
    feet: d.feet,
    hipShift: d.hipShift,
    hipTilt: d.hipTilt,
    torsoTilt: d.torsoTilt,
    crouch: d.crouch,
    lean: d.lean,
    nod: d.nod,
    headTilt: d.headTilt,
    lookY: d.lookY,
    hemSway: -v * 0.35,
    hairSway: -v * 0.5,
    armL: { target: null, fk: d.armL, shape: "soft" },
    armR: d.tuck > 0.01 ? { target: { x: place.x + tuck.x * k, y: place.y + tuck.y * k }, shape: "soft", elbow: "down", behind: d.tuck > 0.5 } : { target: null, fk: d.armR, shape: "soft" },
  };
};

// Есть ли в момент t активное движение (иначе — обычная стойка/ходьба).
export const dancing = (t: number, segs: readonly DanceSeg[]) => segs.some((s) => t >= s.from && t < s.from + s.dur);

// Кадры, в которые стопа встаёт на пол (для тихих шагов в звуке): по
// хореографии — по уменьшению подъёма стопы до нуля.
export const danceContacts = (segs: readonly DanceSeg[], look: LookId, from: number, to: number): number[] => {
  const b = LOOKS[look].build;
  const out: number[] = [];
  let prev = danceAt(from - 1, segs, b).feet.map((p) => p.y);
  for (let t = from; t <= to; t++) {
    const cur = danceAt(t, segs, b).feet.map((p) => p.y);
    for (let i = 0; i < 2; i++) if (prev[i] < -15.5 && cur[i] >= -14.5) out.push(t);
    prev = cur;
  }
  return out;
};
