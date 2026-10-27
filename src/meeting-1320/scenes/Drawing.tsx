// Сцена 10 «Сүрөт» — поздний вечер, тот же стол.
// 10a. N17: общий — отец один за столом с рабочими бумагами; из коридора
//      выходит сын с рисунком в руках и останавливается у стола.
// 10b. S03: средний на сына — «Машинада баарын айтып үлгүргөн жокмун. Азыр
//      айтып берсем болобу?»; затем средний на отца — пауза после вопроса:
//      он поднимает глаза от бумаг на сына.
// 10c. N18: стол сверху — руки отца отодвигают стопку бумаг, освобождается
//      место. Общий: отец похлопывает спинку соседнего стула, F04 «Жаныма
//      отур…»; сын садится и кладёт рисунок на освободившееся место.
// 10d. Тихая пауза: рисунок сверху — палец сына на скрепках, рука отца рядом;
//      общий тёплый план — отец смотрит на рисунок и слушает.
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { Shot, box, camMove, usePlan, useScene } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, glide, keys, lerp } from "../rig/motion";
import { H, seatOf, sitDown } from "./common";
import { hmS, HM_POS, HomeRoom } from "../sets/Home31";
import { DrawingArt, DrawingFront, PapersFront, PapersTop, TableTop } from "../props/HomeProps";
import { CloseHand } from "../props/CloseHand";
import { M13_HANDS } from "../props/hands";
import { sfxAt, type M13Sfx } from "./sfx";

export const drawingPlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "drawing");
  const n17 = T.from("N17");
  const s3 = T.from("S03");
  const s3e = T.to("S03");
  const n18 = T.from("N18");
  const n18e = T.to("N18");
  const f4 = T.from("F04");
  const f4e = T.to("F04");
  const aside = T.word("N18", "четке");
  const space = T.word("N18", "столдон");
  const sitW = T.word("F04", "отур");
  const cutB = Math.max(s3 - 10, 90);
  const cutC = Math.max(cutB + 50, T.word("S03", "Азыр") - 4);
  const cutD = Math.max(cutC + 40, n18 + 6);
  const cutE = Math.max(cutD + 50, n18e + 2);
  const sit = Math.max(cutE + 16, sitW + 8);
  const place = sit + 38;
  const cutF = Math.min(T.len - 70, Math.max(place + 18, f4e + 8));
  const cutG = Math.min(T.len - 40, cutF + 52);
  return {
    len: T.len,
    walk: [Math.max(10, n17 - 8), Math.max(n17 + 50, T.to("N17") - 16)] as const,
    cutB,
    cutC,
    lookUp: [s3e + 6, s3e + 22] as const,
    warm: s3e + 30,
    cutD,
    touch: cutD + 12,
    push: [Math.max(cutD + 16, aside - 6), Math.max(cutD + 40, space + 2)] as const,
    lift: [Math.max(cutD + 44, space + 8), Math.max(cutD + 60, space + 22)] as const,
    cutE,
    pat: [cutE + 4, f4 + 10] as const,
    sit,
    place,
    cutF,
    cutG,
  };
};

export const drawingSfx = (tl: M13Timeline): M13Sfx[] => {
  const P = drawingPlan(tl);
  return [sfxAt(tl, "drawing", P.push[0], "paper-slide", 0.4, 1.2), sfxAt(tl, "drawing", P.sit + 22, "chair", 0.22), sfxAt(tl, "drawing", P.place + 14, "paper-place", 0.35)];
};

export const drawingSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  void tl;
  return [];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));
const pulse = (f: number, a: number, b: number) => Math.sin(Math.PI * ramp(f, a, b));

export const DrawingScene: React.FC = () => {
  const { f } = useScene("drawing");
  const P = usePlan(drawingPlan);
  const T = HM_POS.table;
  const fa = HM_POS.father;
  const dH = H.dad;
  const chairX = HM_POS.sonChair.x;

  // бумаги: до толчка — перед отцом, после — сбоку
  const pushed = f >= P.cutE;
  const papers = pushed ? HM_POS.aside : HM_POS.papers;
  const drawOnTable = f >= P.place + 14;

  // ---- сын: выход из коридора → у стола → садится → кладёт рисунок
  const path = [
    { x: 1110, y: HM_POS.doorway.y + 4 },
    { x: 1040, y: 1560 },
    { x: HM_POS.sonStand.x, y: HM_POS.sonStand.y },
  ];
  const sonPlace = (t: number) => {
    const p = glide(t, P.walk[0], P.walk[1], path, (x) => cruise(x, 0.22));
    const x = lerp(p.x, chairX, easeInOut(ramp(t, P.sit, P.sit + 26)));
    const y = lerp(p.y, HM_POS.sonChair.y, easeInOut(ramp(t, P.sit, P.sit + 26)));
    return { x, y, h: H.son * hmS(y) };
  };
  const sonPose = (t: number): PoseIn => {
    const q = sonPlace(t);
    const sd = sitDown(t, P.sit, 34);
    const at = (dx: number, dy: number) => ({ x: q.x + (dx * q.h) / 1000, y: q.y + (dy * q.h) / 1000 });
    const pl = easeInOut(ramp(t, P.place, P.place + 14));
    const holding = t < P.place + 14;
    const show = pulse(t, P.cutB + 8, P.cutC - 4) * 0.6;
    const after = t > P.cutF;
    const free = HM_POS.free;
    const hold = (dx: number) => {
      const a = at(dx * 1.05, -500 - 50 * show);
      return { x: lerp(a.x, free.x + dx * 0.9, pl), y: lerp(a.y, free.y - 6, pl) };
    };
    const pointAt = { x: free.x - 20 + 12 * Math.sin(t * 0.12), y: free.y - 6 };
    return {
      expr: t > P.warm ? "smile" : "softSmile",
      sit: sd.sit,
      lean: sd.lean + (after ? 6 : 0),
      seat: seatOf(dH),
      lookY: after ? 0.35 : t > P.place - 6 ? 0.5 : 0.1,
      armL: holding ? { target: hold(-64), shape: "pinch", item: "drawing", facing: "camera", elbow: "hang", behind: false } : { target: { x: q.x - 40, y: T.top + 40 }, elbow: "hang" },
      armR: holding ? { target: hold(64), shape: "pinch", elbow: "hang", behind: false } : after ? { target: pointAt, elbow: "front", shape: "point" } : { target: { x: q.x + 46, y: T.top + 42 }, elbow: "hang" },
    };
  };
  const sonFace = (t: number) => (t < P.walk[1] - 4 ? -0.85 : keys(t, [[P.walk[1] - 4, -0.85], [P.walk[1] + 8, -0.55], [P.cutF, -0.55], [P.cutF + 10, -0.3], [P.cutG + 10, -0.3], [P.cutG + 20, -0.55]]));
  const son = (layer?: "body" | "arms") => <Actor uid="d-son" look="m13SonHome" f={f} place={sonPlace} face={sonFace} pose={sonPose} role="son" seed={5} blinkShift={7} walkFrom={P.walk[0] - 2} layer={layer} />;

  // ---- отец
  const dadPose = (t: number): PoseIn => {
    const up = easeInOut(ramp(t, P.lookUp[0], P.lookUp[1]));
    const pat = pulse(t, P.pat[0], P.pat[1]);
    const patTap = Math.max(0, Math.sin(t * 0.9)) * 8 * pat;
    const pp = t >= P.cutE ? HM_POS.aside : HM_POS.papers;
    const reading = t < P.cutD;
    const listen = t > P.cutF;
    return {
      sit: 1,
      seat: seatOf(dH),
      expr: t > P.warm ? "softSmile" : t > P.lookUp[0] ? "calm" : "thinking",
      lookY: reading ? lerp(0.6, 0.1, up) : listen ? keys(t, [[P.cutF, 0.45], [P.cutG + 10, 0.45], [P.cutG + 22, 0.05]]) : 0.2,
      nod: pulse(t, P.cutG + 26, P.cutG + 40) * 0.8,
      armL: { target: reading ? { x: pp.x - 40, y: pp.y - 4 } : { x: fa.x - 56, y: T.top + 42 }, elbow: "hang" },
      armR: pat > 0.05 ? { target: { x: lerp(fa.x + 70, chairX - 70, pat), y: lerp(T.top + 40, 1110 - patTap, pat) }, elbow: "front", shape: "open" } : { target: reading ? { x: pp.x + 50, y: pp.y - 2 } : { x: fa.x + 66, y: T.top + 44 }, elbow: "hang" },
    };
  };
  const dadFace = (t: number) => (t < P.lookUp[0] ? 0 : t < P.cutF ? 0.5 : keys(t, [[P.cutF, 0.35], [P.cutG + 10, 0.35], [P.cutG + 22, 0.55]]));
  const dad = (layer: "body" | "arms") => <Actor uid="d-dad" look="m13DirectorHome" f={f} place={() => ({ x: fa.x, y: fa.y, h: dH })} face={dadFace} pose={dadPose} role="father" seed={3} blinkShift={2} layer={layer} />;

  const sonSeated = f >= P.sit;
  const room = (late: number) => (
    <HomeRoom
      late={late}
      chairs={[{ x: HM_POS.mother.x, seat: seatOf(H.mom) }, { x: fa.x, seat: seatOf(dH) }, { x: chairX, seat: seatOf(dH) }]}
      back={!sonSeated && sonPlace(f).y < 1600 ? son() : null}
      seated={
        <>
          {dad("body")}
          {sonSeated ? son("body") : !sonSeated && sonPlace(f).y >= 1600 ? son("body") : null}
        </>
      }
      onTable={
        <>
          <PapersFront x={papers.x} y={papers.y} w={230} angle={pushed ? -10 : -3} />
          {drawOnTable ? <DrawingFront x={HM_POS.free.x} y={HM_POS.free.y} w={250} angle={4} /> : null}
        </>
      }
      arms={
        <>
          {dad("arms")}
          {sonPlace(f).y >= 1600 || sonSeated ? son("arms") : null}
        </>
      }
    />
  );

  // ---- 10c-1: руки отодвигают бумаги (сверху)
  const handIn = easeInOut(ramp(f, P.cutD, P.touch));
  const pushU = easeInOut(ramp(f, P.push[0], P.push[1]));
  const liftU = easeInOut(ramp(f, P.lift[0], P.lift[1]));
  const px = lerp(600, 250, pushU);
  const pa = lerp(-4, -13, pushU);
  const hx = px + (1 - handIn) * 520 + liftU * 560;
  const hand = M13_HANDS.directorHome;

  // ---- 10d-1: рисунок сверху
  const sonHand = M13_HANDS.sonHome;
  const tap = Math.max(0, Math.sin(f * 0.22));

  return (
    <>
      {/* 10a: сын выходит с рисунком */}
      <Shot f={f} from={0} to={P.cutB} cam={camMove(f, 0, P.cutB, { x: 720, y: 1220, zoom: 1.24 }, { x: 740, y: 1230, zoom: 1.3 })}>
        {room(0.85)}
      </Shot>
      {/* 10b-1: сын спрашивает */}
      <Shot f={f} from={P.cutB} to={P.cutC} cam={camMove(f, P.cutB, P.cutC, { x: 860, y: 1230, zoom: 1.7 }, { x: 870, y: 1220, zoom: 1.78 })}>
        {room(0.9)}
      </Shot>
      {/* 10b-2: отец — пауза, поднимает глаза */}
      <Shot f={f} from={P.cutC} to={P.cutD} cam={camMove(f, P.cutC, P.cutD, { x: 620, y: 1210, zoom: 1.76 }, { x: 625, y: 1200, zoom: 1.86 })}>
        {room(0.9)}
      </Shot>
      {/* 10c-1: руки отодвигают бумаги */}
      <Shot f={f} from={P.cutD} to={P.cutE} cam={{ x: 540, y: 960, zoom: 1 }}>
        <TableTop late={1}>
          <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
            <PapersTop x={px} y={900} w={520} angle={pa} />
            <CloseHand {...hand} x={hx + 300} y={1010} angle={104} size={230} shape="open" armLen={3} />
            <CloseHand {...hand} x={hx + 250} y={760} angle={116} size={230} shape="open" armLen={3} mirror />
          </svg>
        </TableTop>
      </Shot>
      {/* 10c-2: «Жаныма отур» — сын садится и кладёт рисунок */}
      <Shot f={f} from={P.cutE} to={P.cutF} cam={camMove(f, P.cutE, P.cutF, { x: 760, y: 1240, zoom: 1.46 }, { x: 760, y: 1250, zoom: 1.52 })}>
        {room(1)}
      </Shot>
      {/* 10d-1: рисунок сверху — палец сына, рука отца рядом */}
      <Shot f={f} from={P.cutF} to={P.cutG} cam={camMove(f, P.cutF, P.cutG, { x: 560, y: 900, zoom: 1.02 }, { x: 570, y: 900, zoom: 1.1 })}>
        <TableTop late={1}>
          <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
            <PapersTop x={-150} y={760} w={520} angle={-13} />
            <g transform="translate(600 860) rotate(4)">
              <DrawingArt w={600} line={6} />
            </g>
            <CloseHand {...hand} x={70} y={1330} angle={-118} size={230} shape="open" armLen={3} />
            <CloseHand {...sonHand} x={900 + 6 * tap} y={1260 + 10 * tap} angle={140} size={190} shape="point" armLen={3} />
          </svg>
        </TableTop>
      </Shot>
      {/* 10d-2: тёплая тихая пауза */}
      <Shot f={f} from={P.cutG} to={P.len} cam={camMove(f, P.cutG, P.len, { x: 760, y: 1230, zoom: 1.5 }, { x: 760, y: 1220, zoom: 1.58 })}>
        {room(1)}
      </Shot>
    </>
  );
};
