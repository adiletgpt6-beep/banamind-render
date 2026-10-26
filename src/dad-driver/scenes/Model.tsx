// Сцена 6. Макет (VO07 рассказчик, VO08 папа).
// План А — папа кладёт ладонь на плечо сына, два лёгких похлопывания; на
// «текчеден» встаёт (с подготовкой) и идёт к полке.
// План Б — полка крупно: рука подходит к макету, пальцы обхватывают
// деревянное основание, макет поднимается вместе с рукой (с полки исчез).
// План В — макет уже на столе перед сыном, руки папы отпускают его; мягкий
// тёплый свет за макетом. В паузе и на вопросе папа приглашающе смотрит на
// сына, сын поднимает взгляд от макета и подаётся вперёд.
import { AbsoluteFill } from "remotion";
import { localCue, useCue, useSceneFrame, wordAt } from "../context";
import { C, Vignette } from "../kit";
import { Conveyor } from "../props/Conveyor";
import { Actor } from "../rig/Actor";
import { cruise, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { ChairBacks, HOME, HomeRoom, HomeTable } from "../sets/Home";
import { Shot } from "../shots";
import type { DdTimeline } from "../timing";
import { FORM_ON_TABLE } from "./Ask";
import { Bodies, FAM, SEAT, shoulderW, TableForm, WarmGlow, type ActorSpec } from "./HomeKit";
import { H, restOnTable, standUp } from "./common";

const beatsOf = (n: ReturnType<typeof useCue>, q: ReturnType<typeof useCue>) => {
  const w = (i: number) => wordAt(n, i);
  const stand = w(4) - 12; // «текчеден»
  const walk0 = stand + 22;
  const walk1 = walk0 + 44;
  const grab = walk1 + 12;
  return {
    pat: w(2) - 6, // «ийнинен сылап»
    stand,
    walk0,
    walk1,
    cutB: walk1 - 4,
    grab,
    cutC: grab + 18,
    place: grab + 24,
    ask: q.from,
  };
};

export const modelBeats = (tl: DdTimeline) => {
  const sc = tl.scenes.find((s) => s.id === "model")!;
  const b = beatsOf(localCue(tl, sc.from, "vo07"), localCue(tl, sc.from, "vo08"));
  return { grab: b.grab, place: b.place };
};

const SHELF_STAND = 1100; // левее макета: лицо папы не перекрывает его на полке
const GRIP = { x: HOME.modelOnShelf.x + 110, y: HOME.modelOnShelf.y + 4 }; // середина основания макета на полке
const MODEL_S = 0.3;
const MODEL_ON_TABLE = { x: 600, y: HOME.table.top - 6 };

export const ModelScene: React.FC = () => {
  const t = useSceneFrame();
  const n = useCue("vo07");
  const q = useCue("vo08");
  const b = beatsOf(n, q);
  if (t < b.cutB) return <ShotPat t={t} b={b} />;
  if (t < b.cutC) return <ShotShelf t={t} b={b} />;
  return <ShotTable t={t} b={b} />;
};

type Beats = ReturnType<typeof beatsOf>;

const dadPlaceA = (b: Beats) => (t: number) => {
  const u = cruise((t - b.walk0) / (b.walk1 - b.walk0));
  return { x: lerp(FAM.dad.x, SHELF_STAND, u), y: FAM.dad.y, h: H.dad };
};

const ShotPat: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const sonShoulder = shoulderW("son", FAM.son, 1, { sit: 1, seat: SEAT.son, bodyTurn: 0.3 });
  const pat = (f: number) => Math.max(0, Math.sin(((f - b.pat - 8) / 9) * Math.PI)) * (f > b.pat + 8 && f < b.pat + 26 ? 1 : 0);
  const su = (f: number) => standUp(f, b.stand, 26);
  const cast: ActorSpec[] = [
    {
      id: "md-mom",
      look: "mom",
      f: t,
      place: () => FAM.mom,
      face: () => 0.45,
      seed: 87,
      pose: () => ({ expr: EXPR.softSmile, sit: 1, seat: SEAT.mom, lookY: 0.25, lookX: 0.45, armL: restOnTable(FAM.mom, -1), armR: restOnTable(FAM.mom, 1) }),
    },
    {
      id: "md-son",
      look: "son",
      f: t,
      place: () => FAM.son,
      face: (f) => keys(f, [[b.pat, 0.3], [b.stand + 10, 0.55]]),
      seed: 88,
      pose: (f) => ({
        expr: mixExpr(EXPR.softSmile, EXPR.smile, easeInOut((f - b.pat - 6) / 12)),
        sit: 1,
        seat: SEAT.son,
        lookY: keys(f, [[b.pat, -0.3], [b.stand + 10, -0.55]]),
        lookX: keys(f, [[b.stand, 0.3], [b.walk0 + 10, 0.8]]),
        headTilt: keys(f, [[b.pat + 6, 0], [b.pat + 14, 6], [b.stand, 2]]),
        armL: restOnTable(FAM.son, -1, 0.08),
        armR: restOnTable(FAM.son, 1, 0.08),
      }),
    },
    {
      id: "md-dad",
      look: "dad",
      f: t,
      place: dadPlaceA(b),
      walkFrom: b.walk0 - 2,
      face: (f) => keys(f, [[b.stand, -0.55], [b.stand + 16, 0.2]]),
      seed: 89,
      pose: (f) => {
        const s = su(f);
        return {
          expr: EXPR.smile,
          sit: s.sit,
          seat: SEAT.dad,
          lean: f < b.stand ? 10 : s.lean,
          lookY: f < b.stand ? 0.35 : 0,
          lookX: -0.3,
          armL:
            f < b.stand - 2
              ? { target: keysV(f, [[b.pat - 4, { x: FAM.dad.x - 120, y: HOME.table.top + 30 }], [b.pat + 6, { x: sonShoulder.x + 6, y: sonShoulder.y + 4 - pat(f) * 8 }]]), shape: "relax" as const, elbow: "down" as const, behind: false }
              : { target: null, shape: "relax" as const },
          armR: f < b.stand ? restOnTable(FAM.dad, 1) : { target: null, shape: "relax" as const },
        };
      },
    },
  ];
  const cam = { x: lerp(860, 980, easeInOut((t - b.stand) / 40)), y: 1060, zoom: lerp(1.85, 1.55, easeInOut((t - b.stand) / 40)) };
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall }}>
      <Shot f={t} from={-30} to={b.cutB} cam={cam} bg={C.wall}>
        <HomeRoom t={t} />
        <ChairBacks xs={[HOME.seat.mom, HOME.seat.son, HOME.seat.dad]} />
        <Bodies cast={cast} layer="body" />
        <HomeTable />
        <TableForm s={{ dad: 1 }} f={FORM_ON_TABLE} />
        <Bodies cast={cast} layer="arms" />
        <Vignette strength={0.25} />
      </Shot>
    </AbsoluteFill>
  );
};

// Полка крупно: рука берёт макет за основание.
const ShotShelf: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const held = t >= b.grab;
  // снять с полки (чуть вверх) и опустить к груди — ниже лица, к зрителю
  const reach = keysV(t, [[b.cutB, { x: GRIP.x - 70, y: GRIP.y + 60 }], [b.grab, GRIP], [b.grab + 5, { x: GRIP.x + 22, y: GRIP.y - 6 }], [b.grab + 16, { x: GRIP.x + 40, y: GRIP.y + 100 }]]);
  const dad = { x: SHELF_STAND, y: FAM.dad.y, h: H.dad };
  const cam = { x: 1240, y: 940, zoom: lerp(2.5, 2.6, easeInOut((t - b.cutB) / 20)) };
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall }}>
      <Shot f={t} from={b.cutB} to={b.cutC} cam={cam} bg={C.wall}>
        <HomeRoom t={t} modelOnShelf={!held} />
        <Actor
          uid="md-dad-shelf"
          look="dad"
          f={t}
          place={() => dad}
          face={() => 0.7}
          seed={89}
          pose={() => ({
            expr: EXPR.calm,
            lookY: 0.2,
            lookX: 0.5,
            armR: { target: reach, shape: held ? ("fist" as const) : ("open" as const), elbow: "down" as const, behind: false },
            armL: { target: null, shape: "relax" as const },
          })}
        />
        {held ? (
          <div style={{ position: "absolute", left: reach.x - 110, top: reach.y - 4 }}>
            <Conveyor mode="model" scale={MODEL_S} t={t} />
          </div>
        ) : null}
        <Vignette strength={0.25} />
      </Shot>
    </AbsoluteFill>
  );
};

// Стол: макет перед сыном, приглашение папы.
const ShotTable: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const dad = { x: 885, y: FAM.dad.y - 10, h: H.dad };
  const set = easeInOut((t - b.cutC) / (b.place - b.cutC));
  const modelY = lerp(MODEL_ON_TABLE.y - 60, MODEL_ON_TABLE.y, set);
  const release = easeInOut((t - b.place - 4) / 14);
  const cast: ActorSpec[] = [
    {
      id: "md-mom2",
      look: "mom",
      f: t,
      place: () => FAM.mom,
      face: () => 0.4,
      seed: 87,
      pose: () => ({ expr: EXPR.smile, sit: 1, seat: SEAT.mom, lookY: 0.45, lookX: 0.4, armL: restOnTable(FAM.mom, -1), armR: restOnTable(FAM.mom, 1) }),
    },
    {
      id: "md-son2",
      look: "son",
      f: t,
      place: () => FAM.son,
      face: (f) => keys(f, [[b.ask - 10, 0.1], [b.ask + 4, 0.5]]),
      seed: 88,
      pose: (f) => ({
        expr: mixExpr({ browIn: 4, browOut: 5, lid: 0.02, smile: 0.35 }, EXPR.smile, easeInOut((f - b.ask - 20) / 20)),
        sit: 1,
        seat: SEAT.son,
        lean: keys(f, [[b.place, 3], [b.place + 14, 10], [b.ask + 10, 12]]),
        lookY: keys(f, [[b.ask - 6, 0.7], [b.ask + 6, -0.7]]),
        lookX: keys(f, [[b.ask - 6, 0], [b.ask + 6, 0.45]]),
        armL: restOnTable(FAM.son, -1, 0.1),
        armR: restOnTable(FAM.son, 1, 0.1),
      }),
    },
    {
      id: "md-dad2",
      look: "dad",
      f: t,
      place: () => dad,
      face: () => -0.5,
      role: "father",
      seed: 89,
      pose: (f) => ({
        expr: mixExpr(EXPR.softSmile, EXPR.smile, easeInOut((f - b.ask) / 12)),
        lean: lerp(16, 9, release),
        crouch: 0.12,
        lookY: keys(f, [[b.place + 6, 0.75], [b.ask - 6, 0.4]]),
        lookX: -0.4,
        headTilt: -4,
        armL: { target: { x: lerp(MODEL_ON_TABLE.x + 250, dad.x - 100, release), y: lerp(modelY - 40, HOME.table.top + 22, release) }, shape: release < 0.5 ? ("pinch" as const) : ("relax" as const), elbow: "down" as const, behind: false },
        armR: { target: { x: lerp(MODEL_ON_TABLE.x + 280, dad.x + 80, release), y: lerp(modelY - 40, HOME.table.top + 26, release) }, shape: "relax" as const, elbow: "down" as const, behind: false },
      }),
    },
  ];
  const cam = { x: 770, y: 1070, zoom: lerp(1.95, 2.02, easeInOut((t - b.cutC) / 80)) };
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall }}>
      <Shot f={t} from={b.cutC} to={99999} cam={cam} bg={C.wall}>
        <HomeRoom t={t} modelOnShelf={false} />
        <ChairBacks xs={[HOME.seat.mom, HOME.seat.son, HOME.seat.dad]} />
        <Bodies cast={cast} layer="body" />
        <HomeTable />
        {/* лист отодвинут к маме — перед сыном место для макета */}
        <TableForm s={{ dad: 1 }} f={{ ...FORM_ON_TABLE, x: 455, rot: 4 }} />
        <WarmGlow x={MODEL_ON_TABLE.x + 130} y={MODEL_ON_TABLE.y - 60} r={230} o={0.8 * set} />
        <div style={{ position: "absolute", left: MODEL_ON_TABLE.x, top: modelY }}>
          <Conveyor mode="model" scale={0.32} t={t} />
        </div>
        <Bodies cast={cast} layer="arms" />
        <Vignette strength={0.25} />
      </Shot>
    </AbsoluteFill>
  );
};
