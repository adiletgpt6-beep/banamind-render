// Лаборатория рига фильма №33 (только для проверки, в фильм не входит):
// персонажи в разных поворотах головы и корпуса, танцевальные фазы мамы и
// сына, жест «прядь за ухо», поклон. Кадры этой композиции смотрят на
// стыки тела (шея, уши, плечи, кисти) и на стопы (без скольжения).
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { Actor, type Place } from "../rig/Actor";
import { danceAt, hipVelocity, tuckTarget, type DanceSeg } from "../rig/dance";
import { H, LOOKS, type LookId } from "../rig/looks";

const ROUTINE: readonly DanceSeg[] = [
  { move: "A", from: 10, dur: 84 },
  { move: "B", from: 100, dur: 54 },
  { move: "tuck", from: 160, dur: 40 },
  { move: "bow", from: 205, dur: 50 },
];
const SON_ROUTINE: readonly DanceSeg[] = [
  { move: "Amirror", from: 10, dur: 84 },
  { move: "A", from: 100, dur: 84, size: 0.9 },
  { move: "B", from: 190, dur: 54, size: 0.9 },
];

const Dancer: React.FC<{ uid: string; look: LookId; place: Place; segs: readonly DanceSeg[]; f: number }> = ({ uid, look, place, segs, f }) => {
  const b = LOOKS[look].build;
  return (
    <Actor
      uid={uid}
      look={look}
      f={f}
      place={() => place}
      lead="body"
      face={(t) => danceAt(t, segs, b).turn}
      pose={(t) => {
        const d = danceAt(t, segs, b);
        const k = place.h / 1000;
        const rest = { x: 60, y: b.shoulderY + b.upperArm + b.forearm - 30 };
        const tuck = tuckTarget(b, d.tuck, rest);
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
          hemSway: -hipVelocity(t, segs, b) * 0.35,
          hairSway: -hipVelocity(t, segs, b) * 0.5,
          expr: "smile",
          armL: { target: null, fk: d.armL, shape: "soft" },
          armR:
            d.tuck > 0.01
              ? { target: { x: place.x + tuck.x * k, y: place.y + tuck.y * k }, shape: "soft", elbow: "out" }
              : { target: null, fk: d.armR, shape: "soft" },
        };
      }}
    />
  );
};

export const RigLab: React.FC = () => {
  const f = useCurrentFrame();
  const turns = [-0.9, -0.5, 0, 0.5, 0.9];
  const looks: LookId[] = ["momHome", "son", "dad", "youngMom"];
  return (
    <AbsoluteFill style={{ backgroundColor: "#F3EEE6", fontFamily }}>
      {looks.map((lk, row) =>
        turns.map((tn, i) => {
          const h = lk === "son" ? H.son * 0.42 : H.mom * 0.42;
          const place: Place = { x: 120 + i * 210, y: 330 + row * 330, h };
          return <Actor key={`${lk}${i}`} uid={`lab-${lk}-${i}`} look={lk} f={f} place={() => place} face={() => tn} pose={() => ({ expr: "softSmile", armL: { target: null }, armR: { target: null } })} seed={row * 5 + i} />;
        }),
      )}
      <div style={{ position: "absolute", left: 0, top: 1360, width: 1080, height: 560, backgroundColor: "#E6DDCF" }} />
      <Dancer uid="lab-mom" look="momDance" place={{ x: 360, y: 1840, h: H.mom * 0.62 }} segs={ROUTINE} f={f} />
      <Dancer uid="lab-son" look="son" place={{ x: 780, y: 1840, h: H.son * 0.62 }} segs={SON_ROUTINE} f={f} />
      <div style={{ position: "absolute", left: 20, top: 1370, fontSize: 30, fontWeight: 800, color: "#14285A" }}>кадр {f}</div>
    </AbsoluteFill>
  );
};

// Крупные головы и плечи во всех поворотах: стыки шеи, ушей, плеч.
export const HeadLab: React.FC = () => {
  const f = useCurrentFrame();
  const turns = [-0.9, -0.45, 0, 0.45, 0.9];
  const looks: LookId[] = ["momHome", "momDance", "son", "dad", "youngMom", "momOffice"];
  return (
    <AbsoluteFill style={{ backgroundColor: "#F3EEE6", overflow: "hidden" }}>
      {looks.map((lk, row) =>
        turns.map((tn, i) => {
          const h = lk === "son" ? 1150 : 1100;
          const place: Place = { x: 110 + i * 215, y: 230 + row * 315 + h * 0.86, h };
          return (
            <div key={`${lk}${i}`} style={{ position: "absolute", left: i * 215, top: row * 315, width: 215, height: 315, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: -i * 215, top: -row * 315 }}>
                <Actor uid={`hl-${lk}-${i}`} look={lk} f={f} place={() => place} face={() => tn} pose={() => ({ expr: row % 2 ? "laugh" : "softSmile" })} seed={row * 5 + i} />
              </div>
            </div>
          );
        }),
      )}
    </AbsoluteFill>
  );
};
