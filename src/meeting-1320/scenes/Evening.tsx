// Сцена 8 «Календардагы чындык» — офис ближе к вечеру (тёплый низкий свет
// через жалюзи).
// 8a. N13: общий план — помощница с планшетом подходит к двери кабинета.
// 8b. Планшет: «Ушул жума» — пункт 13:20 в каждом дне (по очереди
//     светятся), отмечено «Эртең».
// 8c. A02: обратный план из-за плеча директора — она спрашивает про завтра.
// 8d. F03: директор спокойно отвечает «Ооба. Уулумду мектептен алып кетем».
// 8e. Короткое понимание: лёгкая улыбка и кивок, взгляд в планшет — и она
//     возвращается к работе (поворачивается к своему столу).
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { Shot, box, camMove, usePlan, useScene } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, glide, keys, lerp } from "../rig/motion";
import { H, seatOf } from "./common";
import { DIRF, DIRR, DirectorFront, DirectorReverse, O31_CAM, O31_POS, o31Pt, o31S, OfficeWide } from "../sets/Office31";
import { CalendarBackdrop, CalendarGlance, TabletScreen, TABLET_W } from "../props/CalendarUI";
import type { M13Sfx } from "./sfx";

export const eveningPlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "evening");
  const n13 = T.from("N13");
  const a2 = T.from("A02");
  const f3 = T.from("F03");
  const f3End = T.to("F03");
  const cutB = Math.max(46, T.word("N13", "жуманын") - 10);
  const cutC = Math.max(cutB + 50, a2 - 8);
  const cutD = Math.max(cutC + 40, f3 - 8);
  const cutE = Math.min(T.len - 40, f3End + 10);
  return {
    len: T.len,
    n13,
    // 8a: помощница идёт к двери
    walk: [0, Math.max(30, cutB - 6)] as const,
    cutB,
    glow: [cutB + 4, cutC - 12] as const,
    cutC,
    a2,
    cutD,
    nodYes: T.word("F03", "Ооба"),
    cutE,
    // 8e: понимание и возвращение к работе
    smile: cutE + 2,
    nod: cutE + 8,
    down: cutE + 22,
    turn: cutE + 30,
  };
};

export const eveningSfx = (tl: M13Timeline): M13Sfx[] => {
  void tl;
  return [];
};

export const eveningSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  void tl;
  return [];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));

export const EveningScene: React.FC = () => {
  const { f } = useScene("evening");
  const P = usePlan(eveningPlan);
  const EV = 1;

  // 8a: общий план — помощница идёт по проходу к двери кабинета
  const din = O31_POS.doorOutside;
  const path = [o31Pt(140, 0.86), o31Pt(560, 0.8), { x: din.x, y: din.y }];
  const walkAt = (t: number) => glide(t, P.walk[0], P.walk[1], path);
  const walkPlace = (t: number) => {
    const p = walkAt(t);
    return { x: p.x, y: p.y, h: H.assistant * o31S(p.y) };
  };
  const walker = (
    <Actor
      uid="e-aw"
      look="m13Assistant"
      f={f}
      place={walkPlace}
      face={(t) => (t < P.walk[1] ? 0.9 : 0.5)}
      pose={() => ({ expr: "calm", lookY: 0.35, armL: { target: { x: walkAt(f).x - 30 * o31S(walkAt(f).y), y: walkAt(f).y - 300 * o31S(walkAt(f).y) }, elbow: "hang", item: "tablet", facing: "self" } })}
      seed={7}
      blinkShift={11}
      walkFrom={0}
    />
  );
  const D = O31_POS.director;
  const dk = O31_POS.dirDeskTop;
  const dirWidePose = (): PoseIn => ({
    sit: 1,
    seat: seatOf(H.dad) * D.s,
    expr: "calm",
    lookY: 0.4,
    armL: { target: { x: D.x - 50 * D.s, y: dk.back + 8 }, elbow: "hang" },
    armR: { target: { x: D.x + 60 * D.s, y: dk.back + 8 }, elbow: "hang" },
  });
  const dirWide = (layer: "body" | "arms") => (
    <Actor uid="e-dw" look="m13Director" f={f} place={() => ({ x: D.x, y: D.y, h: H.dad * D.s })} face={() => -0.3} pose={dirWidePose} seed={3} blinkShift={5} layer={layer} />
  );

  // 8c / 8e: помощница в двери (обратный план)
  const V = DIRR.visitor;
  const smile = ramp(f, P.smile, P.smile + 10);
  const nod = keys(f, [
    [P.nod, 0],
    [P.nod + 7, 1],
    [P.nod + 15, 0],
  ]);
  const down = ramp(f, P.down, P.down + 10);
  const turn = easeInOut(ramp(f, P.turn, P.turn + 14));
  const visitorPose = (): PoseIn => ({
    expr: smile > 0.4 ? "softSmile" : "calm",
    lookY: lerp(0.1, 0.55, down),
    nod: 10 * nod,
    armL: { target: { x: V.x - 30 * V.s, y: V.y - 440 * V.s }, elbow: "down", item: "tablet", facing: "self" },
  });
  const visitor = (
    <Actor uid="e-a" look="m13Assistant" f={f} place={() => ({ x: V.x, y: V.y, h: H.assistant * V.s })} face={() => lerp(-0.3, 0.75, turn)} pose={visitorPose} role="assistant" seed={7} blinkShift={11} />
  );

  // 8d: директор отвечает
  const S = DIRF.seat;
  const yes = keys(f, [
    [P.nodYes, 0],
    [P.nodYes + 6, 1],
    [P.nodYes + 14, 0],
  ]);
  const dirPose = (): PoseIn => ({
    sit: 1,
    seat: seatOf(H.dad),
    expr: f > P.nodYes + 20 ? "softSmile" : "calm",
    lookY: 0.04,
    nod: 7 * yes,
    armL: { target: { x: S.x - 58, y: DIRF.deskBack + 46 }, elbow: "hang", shape: "relax" },
    armR: { target: { x: S.x + 64, y: DIRF.deskBack + 48 }, elbow: "hang", shape: "relax", item: "pen" },
  });
  const dir = (layer: "body" | "arms") => (
    <Actor uid="e-d" look="m13Director" f={f} place={() => ({ x: S.x, y: S.y, h: H.dad })} face={() => -0.05} pose={dirPose} role="father" seed={3} blinkShift={5} layer={layer} />
  );

  return (
    <>
      {/* 8a: вечерний общий план */}
      <Shot f={f} from={0} to={P.cutB} cam={camMove(f, 0, P.cutB, O31_CAM.wide, { x: 760, y: 1360, zoom: 1.12 })}>
        <OfficeWide evening={EV} door={0} director={dirWide("body")} directorArms={dirWide("arms")} mid={walker} />
      </Shot>
      {/* 8b: планшет — 13:20 каждый день */}
      <Shot f={f} from={P.cutB} to={P.cutC} cam={{ x: 540, y: 960, zoom: 1 }}>
        <CalendarBackdrop props={false} warm={0.7} />
        <div style={box({ left: (1080 - TABLET_W * 0.8) / 2, top: 300, width: 1, height: 1 })}>
          <TabletScreen x={0} y={0} scale={0.8} view="week" glowAll={ramp(f, P.glow[0], P.glow[1])} tomorrow={1} tomorrowOn={ramp(f, P.glow[1] - 14, P.glow[1])} />
        </div>
      </Shot>
      {/* 8c и 8e: из-за плеча директора — помощница в двери */}
      <Shot f={f} from={P.cutC} to={P.cutD} cam={camMove(f, P.cutC, P.cutD, { x: 600, y: 1180, zoom: 1.28 }, { x: 620, y: 1160, zoom: 1.34 })}>
        <DirectorReverse evening={EV} door={1} headUp={1} screen={<CalendarGlance glow={0.4} warm={0.6} />} visitor={visitor} />
      </Shot>
      {/* 8d: ответ директора */}
      <Shot f={f} from={P.cutD} to={P.cutE} cam={camMove(f, P.cutD, P.cutE, { x: 556, y: 1228, zoom: 1.66 }, { x: 556, y: 1216, zoom: 1.78 })}>
        <DirectorFront evening={EV} body={dir("body")} arms={dir("arms")} />
      </Shot>
      <Shot f={f} from={P.cutE} to={P.len} cam={camMove(f, P.cutE, P.len, { x: 620, y: 1160, zoom: 1.34 }, { x: 640, y: 1160, zoom: 1.3 })}>
        <DirectorReverse evening={EV} door={1} headUp={1} screen={<CalendarGlance glow={0.4} warm={0.6} />} visitor={visitor} />
      </Shot>
    </>
  );
};
