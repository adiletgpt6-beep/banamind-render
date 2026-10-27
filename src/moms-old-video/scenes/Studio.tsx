// Сцена 12 «Жаңы кыймыл» (≈ 11,2 с).
// Пробное занятие: камера за ученицами — мама и тренер видны со спины,
// их лица — в зеркальной стене (отражение — та же поза кадр в кадр, дальше
// и меньше, ближе к центру по перспективе). Тренер показывает шаг, мама
// внимательно повторяет, потом уже вместе с тренером. Крупно — отражение
// мамы; на переносе веса — переход по движению в гостиную после занятия:
// тот же шаг, та же фаза, то же место и размер в кадре. Сын смотрит, хватает
// телефон с сиденья дивана: «Токтой тур. Муну да тартып коюш керек!» — и
// передаёт папе (непрерывная передача: обе кисти несколько кадров в одной
// точке). Папа встаёт с дивана и выбирает положение для съёмки; мама и сын
// становятся рядом — так начинается сцена 13.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import type { DanceSeg } from "../rig/dance";
import { anticipate, cruise, keys, keysV, lerp, type Vec } from "../rig/motion";
import type { ExprId } from "../rig/pose";
import { ChairBack, LIV, LivingBack, Rug, Sofa, WorkTable } from "../sets/Living";
import { NewStudioBack, STUDIO } from "../sets/Places";
import { box, type Cam, camMove, Shot } from "../shots";
import { H, lineFrames, placeAt, sceneLen, sofaPlace, sofaSeatH, standUp } from "./common";
import { dancePose, danceTurn, dancing } from "./danceKit";
import { FAMILY_DAD, FAMILY_MOM, FAMILY_SON } from "./familyDance";

export const ST = { cut: 115, grab: [186, 202] as const, give: [236, 262] as const, hand: [262, 272] as const, dadUp: 276, dadWalk: [304, 330] as const };
// студия: тренер показывает, мама повторяет; второй раз — вместе
export const COACH_SEGS: readonly DanceSeg[] = [
  { move: "A", from: 0, dur: 78 },
  { move: "A", from: 92, dur: 78 },
];
// та же вторая фраза шага продолжается в гостиной после склейки
export const ST_MOM_SEGS: readonly DanceSeg[] = [
  { move: "A", from: 14, dur: 78 },
  { move: "A", from: 92, dur: 78 },
];

// ---------- студия ----------
const MOM_S: Place = placeAt(1290, 1760, H.mom);
const COACH_S: Place = placeAt(620, 1650, H.adult);
// отражение: дальше (выше по полу), меньше, ближе к центру
const reflect = (p: Place, k: number): Place => ({ x: 960 + (p.x - 960) * k, y: STUDIO.floorY - (p.y - STUDIO.floorY) * 0.35, h: p.h * k });
const MOM_R = reflect(MOM_S, 0.62);
const COACH_R = reflect(COACH_S, 0.72);

// ---------- гостиная ----------
export const MOM_L = (t: number): Place => {
  const u = cruise((t - 280) / 36, 0.3);
  return placeAt(lerp(950, FAMILY_MOM.x, u), 1600, H.mom);
};
const SON_SPOT = { x: 1355, y: 1622 };
const SON_GIVE = { x: 1555, y: 1608 };
export const SON_L = (t: number): Place => {
  if (t < ST.give[0]) return placeAt(SON_SPOT.x, SON_SPOT.y, H.son);
  if (t < 280) {
    const u = cruise((t - ST.give[0]) / (ST.give[1] - 6 - ST.give[0]), 0.3);
    return placeAt(lerp(SON_SPOT.x, SON_GIVE.x, u), lerp(SON_SPOT.y, SON_GIVE.y, u), H.son);
  }
  const u = cruise((t - 280) / 44, 0.3);
  return placeAt(lerp(SON_GIVE.x, FAMILY_SON.x, u), lerp(SON_GIVE.y, FAMILY_SON.y, u), H.son);
};
const DAD_SEAT = sofaPlace("dad");
export const DAD_L = (t: number): Place => {
  if (t < ST.dadWalk[0]) return DAD_SEAT;
  const u = cruise((t - ST.dadWalk[0]) / (ST.dadWalk[1] - ST.dadWalk[0]), 0.3);
  return placeAt(lerp(DAD_SEAT.x, FAMILY_DAD.x, u), lerp(DAD_SEAT.y, FAMILY_DAD.y, u), H.dad);
};
const PHONE_ARM: Vec = { x: 1472, y: 1280 }; // телефон лежит на сиденье дивана, у подушки
const HANDOFF: Vec = { x: 1676, y: 1246 };
// телефон переходит из руки в руку в один кадр, когда обе кисти сомкнуты на нём
const HAND_SWAP = ST.hand[0] + 5;

export const StudioScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("studio");
  const s05 = lineFrames(cues, "s05");

  // ---------- студия: актёры ----------
  const momExprS = (t: number): ExprId => (t < 84 ? "focused" : t < 100 ? "softSmile" : "focused");
  const studioMom = (back: boolean, place: Place) => (
    <Actor
      uid={back ? "s12-mom-b" : "s12-mom-r"}
      look="momDance"
      f={f}
      place={() => place}
      face={(t) => danceTurn(t, ST_MOM_SEGS, "momDance") + (back ? 0 : 0.08)}
      pose={(t) => ({ ...dancePose(t, ST_MOM_SEGS, "momDance", place), expr: momExprS(t), lookY: back ? 0 : -0.1 })}
      seed={1}
      lead="body"
      back={back}
    />
  );
  const studioCoach = (back: boolean, place: Place) => (
    <Actor
      uid={back ? "s12-coach-b" : "s12-coach-r"}
      look="coach"
      f={f}
      place={() => place}
      face={(t) => danceTurn(t, COACH_SEGS, "coach") + (back ? 0 : 0.42)}
      pose={(t) => ({ ...dancePose(t, COACH_SEGS, "coach", place), expr: "smile" as ExprId })}
      seed={6}
      lead="body"
      back={back}
    />
  );
  // тренер стоит к группе лицом (видна спереди), в зеркале — её спина;
  // мама стоит к зеркалу — видна со спины, в зеркале — лицо
  const reflection = (
    <>
      {studioCoach(true, COACH_R)}
      {studioMom(false, MOM_R)}
    </>
  );
  const studio = (
    <>
      <NewStudioBack reflection={reflection} />
      {studioCoach(false, COACH_S)}
      {studioMom(true, MOM_S)}
    </>
  );

  // ---------- гостиная: актёры ----------
  const momPoseL = (t: number): PoseIn => {
    const p = MOM_L(t);
    if (dancing(t, ST_MOM_SEGS) || t < 176) return { ...dancePose(t, ST_MOM_SEGS, "momDance", p), expr: t < 168 ? "focused" : "proud" };
    return {
      expr: t < s05.from ? "proud" : t < ST.hand[1] ? "laugh" : "smile",
      ...(t < 282 ? { ...dancePose(t, ST_MOM_SEGS, "momDance", p) } : {}),
      armL: { target: { x: p.x - 0.14 * p.h, y: p.y - 0.44 * p.h }, shape: "relax" },
      armR: { target: { x: p.x + 0.14 * p.h, y: p.y - 0.44 * p.h }, shape: "relax" },
      feetMix: t < 282 ? 1 : 0,
    };
  };
  const momFaceL = (t: number) => (t < 170 ? danceTurn(t, ST_MOM_SEGS, "momDance") : keys(t, [[170, 0.1], [182, 0.45], [ST.hand[0], 0.6], [300, 0.3]]));

  // сын: смотрит → хватает телефон → передаёт папе → идёт к маме
  const grip = (t: number): Vec => {
    const p = SON_L(t);
    const chest = { x: p.x + 0.08 * p.h, y: p.y - 0.56 * p.h };
    return keysV(t, [[ST.grab[0], { x: p.x + 0.16 * p.h, y: p.y - 0.42 * p.h }], [ST.grab[0] + 10, PHONE_ARM], [ST.grab[1], PHONE_ARM], [ST.grab[1] + 8, chest], [ST.give[0], chest], [ST.give[1] - 4, HANDOFF], [ST.hand[1], HANDOFF], [ST.hand[1] + 12, { x: p.x + 0.14 * p.h, y: p.y - 0.44 * p.h }]], anticipate);
  };
  const sonHas = (t: number) => t >= ST.grab[1] - 2 && t < HAND_SWAP;
  const sonPose = (t: number): PoseIn => {
    const p = SON_L(t);
    return {
      expr: t < ST.grab[0] ? "amazed" : t < ST.hand[1] ? "curious" : "proud",
      lookY: t >= ST.grab[0] && t < ST.grab[1] + 4 ? 0.5 : 0,
      armR: { target: t >= ST.grab[0] ? grip(t) : { x: p.x + 0.14 * p.h, y: p.y - 0.44 * p.h }, shape: sonHas(t) ? "fist" : t >= ST.grab[0] && t < ST.grab[1] ? "open" : "relax", item: sonHas(t) ? "phoneSide" : "none", elbow: "down", behind: false },
      armL: { target: { x: p.x - 0.14 * p.h, y: p.y - 0.44 * p.h }, shape: "relax" },
      shoulders: t >= s05.from && t < s05.to ? 0.25 : 0,
    };
  };
  const sonFace = (t: number) => keys(t, [[ST.cut, -0.4], [ST.grab[0] - 6, -0.45], [ST.grab[0] + 2, 0.55], [ST.grab[1] + 6, 0.3], [s05.from, 0.6], [ST.hand[1] + 6, 0.6], [ST.hand[1] + 18, -0.3]]);

  // папа: смотрит с дивана → тянется за телефоном → встаёт → снимает
  const dadHas = (t: number) => t >= HAND_SWAP;
  const dadPose = (t: number): PoseIn => {
    const p = DAD_L(t);
    const su = standUp(t, ST.dadUp, 28);
    const filmPt = { x: p.x - 0.2 * p.h, y: p.y - 0.7 * p.h };
    const hold = { x: p.x - 0.1 * p.h, y: p.y - 0.5 * p.h };
    const target =
      t < ST.give[0] + 10
        ? { x: p.x - 0.12 * p.h, y: p.y - 0.3 * p.h }
        : t < ST.hand[1]
          ? keysV(t, [[ST.give[0] + 10, { x: p.x - 0.12 * p.h, y: p.y - 0.3 * p.h }], [ST.hand[0] - 2, HANDOFF], [ST.hand[1], HANDOFF]], anticipate)
          : keysV(t, [[ST.hand[1], HANDOFF], [ST.hand[1] + 12, hold], [ST.dadWalk[1] - 4, hold], [len - 8, filmPt]], anticipate);
    return {
      expr: t < s05.from ? "softSmile" : t < ST.hand[1] ? "curious" : "smile",
      sit: t < ST.dadUp ? 1 : su.sit,
      seat: sofaSeatH(),
      lean: t < ST.dadUp ? keys(t, [[ST.give[0] + 6, 0], [ST.hand[0], 14], [ST.hand[1] + 6, 14], [ST.dadUp, 6]]) : su.lean,
      // ближняя к зрителю рука берёт телефон и дальше держит его (как в сцене 13)
      armR: { target, shape: dadHas(t) ? "fist" : t > ST.give[0] + 12 ? "open" : "relax", item: dadHas(t) ? "phoneSide" : "none", itemTilt: 0, elbow: "down", behind: false },
      armL: t < ST.dadWalk[1] - 4 ? { target: { x: p.x - 0.02 * p.h, y: p.y - (t < ST.dadUp + 20 ? 0.3 : 0.44) * p.h }, shape: "relax" } : { target: keysV(t, [[ST.dadWalk[1] - 4, { x: p.x - 0.02 * p.h, y: p.y - 0.44 * p.h }], [len - 8, { x: filmPt.x + 10, y: filmPt.y + 14 }]], anticipate), shape: "fist", elbow: "down", behind: true },
      lookY: 0.15,
    };
  };
  const dadFace = (t: number) => keys(t, [[ST.cut, -0.4], [s05.from, -0.45], [ST.give[0], -0.6], [ST.dadWalk[1], -0.72]]);

  const living = (
    <>
      <LivingBack light="day" f={f} />
      <Sofa light="day" />
      <Rug />
      <ChairBack x={LIV.chair.x - 90} light="day" />
      <WorkTable light="day" />
      {/* телефон на сиденье, пока его не взяли */}
      {f < ST.grab[1] - 2 ? <div style={box({ left: PHONE_ARM.x - 40, top: PHONE_ARM.y - 10, width: 80, height: 11, borderRadius: 5, backgroundColor: "#1E2235", transform: "skewX(-20deg)" })} /> : null}
      <Actor uid="s12-dad" look="dad" f={f} place={DAD_L} face={dadFace} pose={dadPose} seed={2} walkFrom={ST.dadWalk[0]} />
      <Actor uid="s12-mom-l" look="momDance" f={f} place={MOM_L} face={momFaceL} pose={momPoseL} seed={1} lead={f < 176 ? "body" : "head"} walkFrom={280} />
      <Actor uid="s12-son" look="son" f={f} place={SON_L} face={sonFace} pose={sonPose} role="son" seed={4} walkFrom={ST.give[0]} />
    </>
  );

  // камера: студия со спины → отражение мамы крупно → (склейка по шагу) гостиная
  const zR = 2.0;
  const camR: Cam = { x: MOM_R.x, y: MOM_R.y - 0.5 * MOM_R.h + 70, zoom: zR };
  // в гостиной мама в том же месте и того же размера, что её отражение
  const zL = (zR * MOM_R.h) / MOM_L(ST.cut).h;
  const feetScreenY = 960 + (MOM_R.y - camR.y) * zR;
  const camL0: Cam = { x: MOM_L(ST.cut).x, y: MOM_L(ST.cut).y - (feetScreenY - 960) / zL, zoom: zL };
  const cam = (t: number): Cam => {
    if (t < 62) return camMove(t, 0, 62, { x: 960, y: 1240, zoom: 0.92 }, { x: 975, y: 1220, zoom: 0.98 });
    if (t < ST.cut) return camMove(t, 62, ST.cut, { ...camR, zoom: zR * 0.94 }, camR);
    if (t < ST.grab[0] - 6) return camMove(t, ST.cut + 20, ST.grab[0] - 6, camL0, { x: 1190, y: 1215, zoom: 1.0 });
    if (t < 272) return camMove(t, ST.grab[0] - 6, 272, { x: 1630, y: 1228, zoom: 1.28 }, { x: 1645, y: 1220, zoom: 1.34 });
    return camMove(t, 272, len, { x: 1420, y: 1210, zoom: 0.9 }, { x: 1310, y: 1188, zoom: 0.9 });
  };
  const cuts = [0, 62, ST.cut, ST.grab[0] - 6, 272, len];
  return (
    <>
      {cuts.slice(0, -1).map((a, i) => (
        <Shot key={a} f={f} from={a} to={cuts[i + 1]} cam={cam(f)} bg={a < ST.cut ? "#E9EEF5" : "#F1E4D1"}>
          {a < ST.cut ? studio : living}
        </Shot>
      ))}
    </>
  );
};
