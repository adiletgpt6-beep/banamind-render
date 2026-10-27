// Сцена 5 «Два движения» (≈ 16,9 с).
// Мама встаёт, отодвигает стул, выходит из-за стола на ковёр и проверяет,
// хватит ли места. Показывает два простых движения: приставной шаг с
// переносом веса и плавное движение рук с поворотом корпуса. Сын пробует
// вместе с ней, но начинает другой ногой — они идут навстречу друг другу;
// сын замечает ошибку: «Ой!» — оба смеются (без падений). Со второй
// попытки шаг получается вместе. Папа заглядывает в комнату: «Бул жерде
// репетиция болуп жатабы?» Сын: «Апам сахнада бийлептир! Сен билчү белең?»
// Папа улыбается.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import type { DanceSeg } from "../rig/dance";
import { anticipate, clamp, cruise, glide, keys, keysV, lerp } from "../rig/motion";
import type { ExprId } from "../rig/pose";
import { ChairBack, ChairSeat, LaptopBack, LIV, LivingBack, Rug, Sofa, WorkTable } from "../sets/Living";
import { box, type Cam, camMove, Shot } from "../shots";
import { chairSeat, H, lineFrames, placeAt, sceneLen, standUp } from "./common";
import { dancePose, danceTurn, dancing } from "./danceKit";

export const MOVES = {
  stand: 0,
  walk: [24, 72] as const,
  check: [72, 96] as const,
  laugh: [300, 334] as const,
  dadIn: [326, 362] as const,
};
export const MOM_SEGS: readonly DanceSeg[] = [
  { move: "A", from: 98, dur: 78 },
  { move: "B", from: 178, dur: 56 },
  { move: "A", from: 242, dur: 78 },
  { move: "A", from: 336, dur: 78 },
];
// сын: первая попытка — с другой ноги (навстречу маме), вторая — верно
export const SON_SEGS: readonly DanceSeg[] = [
  { move: "Amirror", from: 242, dur: 78, size: 0.75 },
  { move: "A", from: 336, dur: 78, size: 0.9 },
];

const SEAT: Place = placeAt(LIV.chair.x, LIV.seatFeetY, H.mom);
export const MOVES_MOM_SPOT: Place = placeAt(950, 1600, H.mom);
export const MOVES_SON_FROM: Place = placeAt(1235, 1640, H.son);
export const MOVES_SON_SPOT: Place = placeAt(1355, 1622, H.son);
// мама выходит из-за стола: вдоль стола вправо, затем вперёд на ковёр
export const MOVES_MOM = (t: number): Place => {
  if (t <= MOVES.walk[0]) return SEAT;
  if (t >= MOVES.walk[1]) return MOVES_MOM_SPOT;
  const p = glide(t, MOVES.walk[0], MOVES.walk[1], [SEAT, { x: 960, y: 1528 }, MOVES_MOM_SPOT], (x) => cruise(x, 0.3));
  return placeAt(p.x, p.y, H.mom);
};
export const MOVES_SON = (t: number): Place => {
  const u = cruise((t - 18) / 40, 0.3);
  return placeAt(lerp(MOVES_SON_FROM.x, MOVES_SON_SPOT.x, u), lerp(MOVES_SON_FROM.y, MOVES_SON_SPOT.y, u), H.son);
};
// папа входит в проём из прихожей (он за плоскостью стены — виден в проёме)
export const MOVES_DAD = (t: number): Place => {
  const u = cruise((t - MOVES.dadIn[0]) / (MOVES.dadIn[1] - MOVES.dadIn[0]), 0.3);
  return placeAt(lerp(40, 290, u), 1478, H.dad);
};

export const MovesScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("moves");
  const oy = lineFrames(cues, "s06");
  const f01 = lineFrames(cues, "f01");
  const s03 = lineFrames(cues, "s03");
  const toDad = f01.to - 4;

  // ---------- мама ----------
  const momExpr = (t: number): ExprId =>
    t < MOVES.walk[1] ? "softSmile" : t < MOVES.check[1] ? "curious" : t < 242 ? "proud" : t < oy.from + 6 ? "focused" : t < MOVES.laugh[1] + 4 ? "laugh" : t < toDad ? "smile" : "softSmile";
  const momFace = (t: number) => {
    if (t < MOVES.walk[1]) return keys(t, [[0, 0.1], [MOVES.walk[0], 0.55]]);
    if (t < MOVES.check[1]) return keys(t, [[MOVES.check[0], -0.45], [MOVES.check[0] + 12, 0.45], [MOVES.check[1], 0]]);
    if (dancing(t, MOM_SEGS)) return danceTurn(t, MOM_SEGS, "momHome") + (t >= 242 && t < 320 ? 0.25 : 0);
    if (t < toDad) return keys(t, [[MOVES.laugh[0], 0.45], [MOVES.laugh[1], 0.3]]);
    return keys(t, [[toDad, 0.3], [toDad + 10, -0.55]]);
  };
  const momPose = (t: number): PoseIn => {
    const p = MOVES_MOM(t);
    if (t < MOVES.walk[0] + 4) {
      const su = standUp(t, 0, 26);
      return {
        expr: momExpr(t),
        sit: su.sit,
        lean: su.lean,
        seat: chairSeat(H.mom),
        // ладони отталкиваются от стола
        armL: { target: { x: SEAT.x - 70, y: LIV.table.top - 4 }, shape: "open", elbow: "down" },
        armR: { target: keysV(t, [[0, { x: SEAT.x + 70, y: LIV.table.top - 4 }], [20, { x: SEAT.x + 70, y: LIV.table.top - 4 }], [28, { x: p.x + 0.14 * p.h, y: p.y - 0.42 * p.h }]]), shape: "open", elbow: "down" },
      };
    }
    if (t < 96) {
      return {
        expr: momExpr(t),
        lookY: t >= MOVES.check[0] ? 0.6 : 0.1,
        nod: t >= MOVES.check[0] ? 6 : 0,
        armL: { target: { x: p.x - 0.14 * p.h, y: p.y - 0.43 * p.h }, shape: "relax" },
        armR: { target: { x: p.x + 0.14 * p.h, y: p.y - 0.43 * p.h }, shape: "relax" },
      };
    }
    const d = dancePose(t, MOM_SEGS, "momHome", p);
    const laughing = t >= oy.from + 6 && t < MOVES.laugh[1];
    return {
      ...d,
      feetMix: clamp((t - 96) / 10),
      expr: momExpr(t),
      lookY: t >= 242 && t < 320 ? 0.3 : d.lookY,
      shoulders: laughing ? 0.15 + 0.15 * Math.sin(t * 0.9) : 0,
      nod: (d.nod ?? 0) + (laughing ? 3 + 2 * Math.sin(t * 0.9) : 0),
      // после попытки — ладонь у груди, смеётся
      armR: laughing ? { target: { x: p.x + 0.05 * p.h, y: p.y - 0.66 * p.h }, shape: "open", elbow: "down" } : d.armR,
    };
  };

  // ---------- сын ----------
  const sonExpr = (t: number): ExprId =>
    t < 96 ? "amazed" : t < 242 ? "curious" : t < oy.from - 4 ? "focused" : t < oy.to + 8 ? "oops" : t < MOVES.laugh[1] + 4 ? "laugh" : t < 414 ? "proud" : t < s03.from ? "curious" : "amazed";
  const sonFace = (t: number) => {
    if (dancing(t, SON_SEGS)) return danceTurn(t, SON_SEGS, "son") - (t < 320 ? 0.3 : 0.15);
    if (t < 242) return keys(t, [[0, -0.6], [40, -0.5], [100, -0.45], [200, -0.45], [236, -0.3]]);
    if (t < 414) return keys(t, [[MOVES.laugh[0], -0.5], [MOVES.laugh[1], -0.4]]);
    return keys(t, [[414, -0.4], [424, -0.75]]);
  };
  const sonPose = (t: number): PoseIn => {
    const p = MOVES_SON(t);
    if (t < 236) {
      // убирает телефон в карман, смотрит на маму, повторяет кивком ритм
      const pocket = { x: p.x - 0.13 * p.h, y: p.y - 0.42 * p.h };
      return {
        expr: sonExpr(t),
        lookY: 0.05,
        nod: t > 98 && t < 232 ? 2 * Math.sin((t - 98) / 6.2) : 0,
        armL: { target: keysV(t, [[0, { x: p.x - 0.08 * p.h, y: p.y - 0.56 * p.h }], [14, pocket], [26, pocket], [40, { x: p.x - 0.14 * p.h, y: p.y - 0.45 * p.h }]], anticipate), shape: t < 22 ? "phone" : "relax", item: t < 22 ? "phone" : "none", elbow: "down" },
        armR: { target: keysV(t, [[0, { x: p.x + 0.04 * p.h, y: p.y - 0.56 * p.h }], [12, { x: p.x + 0.14 * p.h, y: p.y - 0.45 * p.h }]]), shape: "relax" },
      };
    }
    const d = dancePose(t, SON_SEGS, "son", p);
    const laughing = t >= oy.to && t < MOVES.laugh[1];
    return {
      ...d,
      feetMix: clamp((t - 236) / 8),
      expr: sonExpr(t),
      lookY: t >= oy.from - 8 && t < oy.to + 6 ? 0.7 : d.lookY,
      nod: (d.nod ?? 0) + (t >= oy.from - 8 && t < oy.to + 6 ? 8 : 0) + (laughing ? 3 + 2 * Math.sin(t * 1.0) : 0),
      shoulders: laughing ? 0.2 + 0.2 * Math.sin(t * 1.0) : 0,
    };
  };

  // ---------- папа ----------
  const dadPose = (t: number): PoseIn => {
    const p = MOVES_DAD(t);
    const lean = t > MOVES.dadIn[1] - 4;
    return {
      expr: t < f01.from ? "curious" : t < s03.to ? "smile" : "proud",
      armL: lean ? { target: { x: 404, y: p.y - 0.62 * p.h }, shape: "open", elbow: "out" } : { target: null, shape: "relax" },
      armR: { target: { x: p.x + 0.12 * p.h, y: p.y - 0.43 * p.h }, shape: "relax" },
      headTilt: keys(t, [[f01.from, 0], [f01.from + 12, -5], [s03.to, -5], [s03.to + 14, 2]]),
      nod: keys(t, [[s03.to + 4, 0], [s03.to + 12, 6], [s03.to + 22, 0]]),
    };
  };
  const dadFace = (t: number) => keys(t, [[MOVES.dadIn[0], 0.6], [MOVES.dadIn[1], 0.45]]);

  const chairX = keys(f, [[8, LIV.chair.x], [30, LIV.chair.x - 90]], anticipate);
  const seated = f < MOVES.walk[0] + 4;
  const momActor = (layer?: "body" | "arms") => <Actor uid="m5-mom" look="momHome" f={f} place={MOVES_MOM} face={momFace} pose={momPose} seed={1} lead={f >= 96 ? "body" : "head"} layer={layer} />;
  const world = (
    <>
      <LivingBack light="evening" f={f} />
      <Sofa light="evening" />
      {/* папа в прихожей — виден только в проёме */}
      <div style={box({ left: LIV.door.x, top: LIV.door.y, width: LIV.door.w, height: LIV.door.h, overflow: "hidden" })}>
        <div style={box({ left: -LIV.door.x, top: -LIV.door.y })}>
          {f >= MOVES.dadIn[0] ? <Actor uid="m5-dad" look="dad" f={f} place={MOVES_DAD} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={MOVES.dadIn[0]} /> : null}
        </div>
      </div>
      {/* рука папы на косяке — поверх стены */}
      <Rug />
      <ChairBack x={chairX} light="evening" />
      {seated ? momActor("body") : null}
      {!seated ? <ChairSeat x={chairX} light="evening" /> : null}
      <WorkTable light="evening" />
      <LaptopBack open={0.12} glow={0} />
      {seated ? momActor("arms") : momActor()}
      <Actor uid="m5-son" look="son" f={f} place={MOVES_SON} face={sonFace} pose={sonPose} role="son" seed={4} lead={f >= 236 ? "body" : "head"} />
    </>
  );
  const cam = (t: number): Cam => {
    if (t < 98) return camMove(t, 0, 98, { x: 850, y: 1170, zoom: 1.24 }, { x: 1010, y: 1200, zoom: 1.16 });
    if (t < 242) return camMove(t, 98, 242, { x: 1110, y: 1235, zoom: 1.08 }, { x: 1120, y: 1232, zoom: 1.1 });
    if (t < 336) return camMove(t, 262, 320, { x: 1130, y: 1250, zoom: 1.12 }, { x: 1140, y: 1150, zoom: 1.34 });
    if (t < f01.from) return camMove(t, 336, f01.from, { x: 1110, y: 1235, zoom: 1.08 }, { x: 1100, y: 1230, zoom: 1.1 });
    if (t < toDad + 4) return camMove(t, f01.from, toDad + 4, { x: 330, y: 1090, zoom: 1.55 }, { x: 330, y: 1080, zoom: 1.62 });
    return camMove(t, toDad + 4, len, { x: 790, y: 1165, zoom: 0.86 }, { x: 800, y: 1160, zoom: 0.9 });
  };
  const cuts = [0, 98, 242, 336, f01.from, toDad + 4, len];
  return (
    <>
      {cuts.slice(0, -1).map((a, i) => (
        <Shot key={a} f={f} from={a} to={cuts[i + 1]} cam={cam(f)} bg="#3B3149">
          {world}
        </Shot>
      ))}
    </>
  );
};

export const movesSceneLen = () => sceneLen("moves");
export const clampFrame = (t: number) => clamp(t, 0, sceneLen("moves"));
