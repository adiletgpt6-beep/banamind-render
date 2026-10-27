// Сцена 10 «Биринчи кадам» (≈ 6,4 с).
// Мама снова открывает расписание студии и выбирает пробное занятие:
// тап по строке «Сыноо сабагы» — галочка; один спокойный акцент «Ишемби»
// (без часа на экране). Затем она на диване перекладывает с колен небольшую
// спортивную сумку на сиденье рядом — к субботе всё готово.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type PoseIn } from "../rig/Actor";
import { easeInOut, keys, keysV, type Vec } from "../rig/motion";
import { DayAccent, HoldingHands, Phone, ScheduleScreen } from "../screens";
import { LIV, LivingBack, Rug, Sofa, SportBag, WorkTable, ChairBack } from "../sets/Living";
import { box, camMove, Shot } from "../shots";
import type { MovCue } from "../timing";
import { sceneLen, sofaSeatH, wordFrame } from "./common";
import { phoneGeom, PointingHand } from "./EveningParts";
import { EveningBack } from "./Schedule";
import { SOFA_MOM } from "./sofaKit";

const INS = { x: 540, y: 1050, w: 470 } as const;
const G = phoneGeom(INS.x, INS.y, INS.w);
const SKIN = { mom: "#E6B590", momShade: "#D29B74", sleeve: "#C47A62" };
// сумка: на коленях → на сиденье слева от мамы (там её найдёт сцена 11)
export const BAG_S = 0.6;
export const BAG_SEAT: Vec = { x: 1500, y: 1290 };
const BAG_LAP: Vec = { x: 1640, y: 1296 };
const HANDLE = (-186 + 25) * BAG_S; // ручка относительно низа сумки

// Моменты сцены по словам диктора (их же берёт звук).
export const pickBeats = (cues: readonly MovCue[]) => {
  const dayAt = wordFrame(cues, "n10", 3); // «ишембидеги»
  const pickAt = wordFrame(cues, "n10", 4) + 4; // «сыноо сабагын»
  const S2 = Math.max(pickAt + 30, wordFrame(cues, "n10", 6) + 6);
  const move = [S2 + 14, S2 + 34] as const;
  const pat = S2 + 44;
  return { dayAt, pickAt, S2, move, pat };
};

export const PickScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("pick");
  const { dayAt, pickAt, S2, move, pat } = pickBeats(cues);

  // ---------- вставка: левая рука держит телефон, правая выбирает ----------
  const row = G.at(270, 655);
  const tip = keysV(f, [
    [pickAt - 22, { x: 1060, y: 1820 }],
    [pickAt - 6, { x: row.x + 70, y: row.y + 80 }],
    [pickAt - 1, row],
    [pickAt + 3, row],
    [pickAt + 18, { x: 1080, y: 1840 }],
  ]);
  const insert = (
    <div style={box({ inset: 0, transformOrigin: `${INS.x}px ${INS.y}px`, scale: `${1 + 0.04 * Math.min(1, f / S2)}` })}>
      <div style={box({ inset: 0, clipPath: `inset(0 ${1080 - INS.x}px 0 0)` })}>
        <HoldingHands x={INS.x} y={INS.y} w={INS.w} skin={SKIN.mom} shade={SKIN.momShade} sleeve={SKIN.sleeve} />
      </div>
      <Phone x={INS.x} y={INS.y} w={INS.w}>
        <ScheduleScreen f={f} at={-30} pick={2} pickAt={pickAt} noTime />
      </Phone>
      {f > pickAt - 22 && f < pickAt + 18 ? <PointingHand x={tip.x} y={tip.y} ang={26} s={0.9} skin={SKIN.mom} shade={SKIN.momShade} sleeve={SKIN.sleeve} /> : null}
    </div>
  );

  // ---------- мама на диване: сумка с колен на сиденье ----------
  const bagAt = (t: number): Vec => keysV(t, [[move[0], BAG_LAP], [move[0] + 8, { x: 1590, y: 1240 }], [move[1], BAG_SEAT]], easeInOut);
  const grip = (t: number): Vec => {
    const b = bagAt(t);
    return { x: b.x, y: b.y + HANDLE };
  };
  const holding = (t: number) => t >= move[0] - 2 && t < move[1] + 2;
  const momPose = (t: number): PoseIn => {
    const lapRest: Vec = { x: SOFA_MOM.x - 0.04 * SOFA_MOM.h, y: 1278 };
    const patPt: Vec = { x: BAG_SEAT.x + 10, y: BAG_SEAT.y - 58 };
    const armL =
      t < move[0] - 8
        ? { target: { x: BAG_LAP.x - 30, y: BAG_LAP.y - 40 }, shape: "relax" as const, elbow: "down" as const }
        : t < move[1] + 2
          ? { target: t < move[0] ? keysV(t, [[move[0] - 8, { x: BAG_LAP.x - 30, y: BAG_LAP.y - 40 }], [move[0] - 2, grip(move[0])]]) : grip(t), shape: holding(t) ? ("fist" as const) : ("relax" as const), elbow: "down" as const, behind: false }
          : { target: keysV(t, [[move[1] + 2, grip(move[1])], [pat - 4, patPt], [pat, { x: patPt.x, y: patPt.y + 6 }], [pat + 4, patPt], [pat + 8, { x: patPt.x, y: patPt.y + 6 }], [pat + 20, lapRest]]), shape: "relax" as const, elbow: "down" as const };
    return {
      expr: t < pat ? "calm" : "proud",
      sit: 1,
      seat: sofaSeatH(),
      lean: keys(t, [[move[0] - 6, 0], [move[0] + 4, 6], [move[1] + 4, 6], [pat + 14, 0]]),
      lookY: keys(t, [[S2, 0.3], [move[0] - 4, 0.5], [pat + 8, 0.5], [pat + 18, 0.05]]),
      lookX: keys(t, [[S2, 0], [move[0], -0.5], [pat + 10, -0.5], [pat + 18, 0]]),
      headTilt: keys(t, [[pat + 8, 0], [pat + 18, 4]]),
      armL,
      armR: { target: { x: SOFA_MOM.x + 0.1 * SOFA_MOM.h, y: 1262 }, shape: "fist", item: "phoneSide", itemTilt: -70, elbow: "down" },
    };
  };
  const momFace = (t: number) => keys(t, [[S2, 0.05], [move[0] - 4, -0.32], [pat + 10, -0.32], [pat + 20, 0.05]]);
  const b = bagAt(f);
  const world = (
    <>
      <LivingBack light="evening" f={f} />
      <Sofa light="evening" />
      <Rug />
      <ChairBack x={LIV.chair.x} light="evening" />
      <WorkTable light="evening" />
      <Actor uid="p10-mom" look="momHome" f={f} place={() => SOFA_MOM} face={momFace} pose={momPose} seed={1} layer="body" />
      <Actor uid="p10-mom" look="momHome" f={f} place={() => SOFA_MOM} face={momFace} pose={momPose} seed={1} layer="armsNoHands" />
      <SportBag x={b.x} y={b.y} s={BAG_S} />
      <Actor uid="p10-mom" look="momHome" f={f} place={() => SOFA_MOM} face={momFace} pose={momPose} seed={1} layer="hands" />
      <div style={box({ left: -400, top: 0, width: 3400, height: 2600, backgroundColor: "rgba(40,36,80,0.16)", mixBlendMode: "multiply", pointerEvents: "none" })} />
    </>
  );
  return (
    <div style={box({ inset: 0, backgroundColor: "#3A3E62" })}>
      {f < S2 ? (
        <>
          <EveningBack />
          {insert}
          <DayAccent f={f} at={dayAt} />
        </>
      ) : (
        <Shot f={f} from={S2} to={len} cam={camMove(f, S2, len, { x: 1600, y: 1130, zoom: 1.85 }, { x: 1590, y: 1135, zoom: 1.95 })} bg="#3B3149">
          {world}
        </Shot>
      )}
    </div>
  );
};
