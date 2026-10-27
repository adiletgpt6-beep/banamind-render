// Сцена 7 «Кеңсеге кайтуу».
// 7a. Парковка бизнес-центра: машина подъезжает справа налево (обратный
//     путь) и ОСТАНАВЛИВАЕТСЯ на месте; к зрителю — водительский бок.
// 7b. N10: в салоне — вибрирует телефон, отец смотрит на экран и отвечает
//     (телефон у уха); слушает: «кардар келип калыптыр».
// 7c. N11: заканчивает разговор, опускает телефон и убирает его во
//     внутренний карман; общий план — закрывает водительскую дверь и идёт
//     ко входу.
// 7d. N12: переговорная — заказчик, двое сотрудников и помощница
//     обсуждают «Долбоордун планы»; директор входит, кивает заказчику,
//     садится и сразу включается — жест к экрану, заказчик кивает.
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { Shot, camMove, usePlan, useScene } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, glide, keys, lerp } from "../rig/motion";
import { CAR_SCALE, H, seatOf, sitDown } from "./common";
import { ParkingLot, PK_CAM, PK_POS, pkS } from "../sets/Parking";
import { CarSide, carSeatPlace, doorHandleAt } from "../props/Car";
import { MEET_CAM, MEET_POS, MeetingRoom } from "../sets/Office31";
import { sfxAt, type M13Sfx } from "./sfx";

export const backPlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "back");
  const n10 = T.from("N10");
  const n11 = T.from("N11");
  const n11End = T.to("N11");
  const arriveB = Math.max(36, n10 - 6);
  const cutB = Math.max(arriveB + 14, T.word("N10", "телефон") - 16);
  const cutC = Math.max(T.wordEnd("N11", "бүтүрүп") + 6, cutB + 100);
  const cutD = Math.max(cutC + 50, n11End + 4);
  return {
    len: T.len,
    arriveB,
    cutB,
    vibrate: cutB + 6,
    answer: [cutB + 22, cutB + 36] as const,
    hangUp: [n11 + 4, n11 + 18] as const,
    pocket: [n11 + 24, n11 + 44] as const,
    cutC,
    closeDoor: [cutC + 2, cutC + 16] as const,
    walk: [cutC + 18, cutD + 8] as const,
    cutD,
    enter: [cutD - 4, cutD + 40] as const,
    nod: cutD + 26,
    sit: cutD + 42,
    join: Math.max(cutD + 80, T.word("N12", "талкууга")),
  };
};

export const backSfx = (tl: M13Timeline): M13Sfx[] => {
  const P = backPlan(tl);
  return [
    sfxAt(tl, "back", P.vibrate, "phone-vibrate", 0.4),
    sfxAt(tl, "back", P.hangUp[1] - 4, "phone-tap", 0.3),
    sfxAt(tl, "back", P.closeDoor[1] - 1, "car-door-close", 0.5),
    sfxAt(tl, "back", P.sit + 18, "chair", 0.25),
  ];
};

export const backSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  void tl;
  return [];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));

export const BackScene: React.FC = () => {
  const { f } = useScene("back");
  const P = usePlan(backPlan);
  const c = PK_POS.car;
  const S = CAR_SCALE * c.s;

  // 7a: подъезд и остановка (едет влево)
  const arrive = cruise(ramp(f, 0, P.arriveB), 0.05);
  const carX = lerp(c.x + 1500, c.x, Math.min(1, arrive * 1.0));
  const speed = 1 - ramp(f, P.arriveB - 14, P.arriveB);
  const wheel = -(c.x + 1500 - carX) * 0.9;
  const bounce = speed * Math.sin(f * 0.9) * 0.8 + (f > P.arriveB ? 1.5 * Math.exp(-(f - P.arriveB) / 5) * Math.sin((f - P.arriveB) * 0.9) : 0);
  const fr = carSeatPlace(carX, c.y, S, "front", 1, bounce);
  const h = H.dad * c.s;

  // телефон: достаёт (виден над окном) → смотрит на экран → к уху →
  // опускает, нажимает «завершить» → во внутренний карман пиджака
  // (сидя: таз ≈ fr.y − 48, центр головы ≈ fr.y − 305; подоконник ≈ fr.y − 200)
  const lap = { x: fr.x - 70, y: fr.y - 150 };
  const look = { x: fr.x - 64, y: fr.y - 238 };
  const ear = { x: fr.x + 28, y: fr.y - 300 };
  const inPocket = { x: fr.x - 16, y: fr.y - 226 };
  const wheelAt = { x: carX - 176 * S + 14, y: c.y - 212 * S + bounce * S };
  const take = easeInOut(ramp(f, P.vibrate, P.vibrate + 12));
  const toEar = easeInOut(ramp(f, P.answer[0], P.answer[1]));
  const down = easeInOut(ramp(f, P.hangUp[0], P.hangUp[1]));
  const pocket = easeInOut(ramp(f, P.pocket[0], P.pocket[1]));
  const mixP = (a1: { x: number; y: number }, b1: { x: number; y: number }, t: number) => ({ x: lerp(a1.x, b1.x, t), y: lerp(a1.y, b1.y, t) });
  // от уха телефон опускается вдоль щеки вниз, затем вперёд — не через лицо
  const below = { x: fr.x + 34, y: fr.y - 236 };
  const ph = toEar < 1 ? mixP(mixP(lap, look, take), ear, toEar) : down < 1 ? (down < 0.5 ? mixP(ear, below, down * 2) : mixP(below, look, down * 2 - 1)) : mixP(look, inPocket, pocket);
  const shake = f >= P.vibrate && f < P.answer[0] ? 3 * Math.sin(f * 2.6) : 0;
  const atEar = toEar > 0.6 && down < 0.4;
  const armPhone: PoseIn["armR"] =
    f < P.vibrate
      ? { target: { x: wheelAt.x + 34, y: wheelAt.y + 24 }, elbow: "down", shape: "fist" }
      : pocket >= 1
        ? { target: { x: wheelAt.x + 34, y: wheelAt.y + 24 }, elbow: "down", shape: "fist" }
        : { target: ph, elbow: atEar ? "front" : "down", shape: "phone", item: pocket > 0.8 ? "none" : "phone", glow: atEar ? 0 : 1, shake, itemTilt: atEar ? 0 : 18 };
  const driverPose = (): PoseIn => ({
    sit: 1,
    seat: fr.seat,
    expr: atEar ? "calm" : "softSmile",
    lookY: atEar ? 0 : (f >= P.vibrate && f < P.answer[0] + 4) || (f >= P.hangUp[0] && f < P.pocket[0]) ? 0.45 : 0.1,
    nod: atEar ? 4 * Math.max(0, Math.sin((f - P.answer[1]) * 0.18)) : 0,
    armL: { target: wheelAt, elbow: "down", shape: "fist" },
    armR: armPhone,
  });
  const driver = <Actor uid="b-drv" look="m13Director" f={f} place={() => ({ x: fr.x, y: fr.y, h })} face={() => -0.9} pose={driverPose} seed={3} blinkShift={5} />;
  const car = (open: number) => (
    <>
      <CarSide x={carX} y={c.y} s={S} layer="back" dir={1} wheel={wheel} bounce={bounce} frontOpen={open} />
      {f < P.cutC ? driver : null}
      <CarSide x={carX} y={c.y} s={S} layer="body" dir={1} wheel={wheel} bounce={bounce} frontOpen={open} />
      <CarSide x={carX} y={c.y} s={S} layer="door" dir={1} wheel={wheel} bounce={bounce} frontOpen={open} />
    </>
  );

  // 7c: закрывает дверь и идёт ко входу
  const doorAng = 58 * (1 - easeInOut(ramp(f, P.closeDoor[0], P.closeDoor[1])));
  const handle = doorHandleAt(c.x, c.y, S, doorAng, 1, "front");
  const standAt = { x: handle.x - 70, y: c.y + 70 };
  const walkPts = [standAt, ...PK_POS.walk.slice(1)];
  const walkAt = (t: number) => glide(t, P.walk[0], P.walk[1], walkPts, (x) => cruise(x, 0.15));
  const walker = (
    <Actor
      uid="b-walk"
      look="m13Director"
      f={f}
      place={(t) => {
        const p = walkAt(t);
        return { x: p.x, y: p.y, h: H.dad * pkS(p.y) };
      }}
      face={(t) => (t < P.walk[0] ? -0.6 : 0.7)}
      pose={() => ({ expr: "calm", armL: f < P.closeDoor[1] + 2 ? { target: handle, shape: "fist", elbow: "down" } : { target: null } })}
      seed={3}
      blinkShift={5}
      walkFrom={P.walk[0]}
    />
  );

  // 7d: переговорная
  const M = MEET_POS;
  const tableY = (p: { s: number }) => M.tableTop.near + ((M.tableTop.far - M.tableTop.near) * (1.04 - p.s)) / 0.4;
  const listen = (t: number) => 0.06 * Math.sin(t * 0.05);
  const seated = (p: typeof M.client, look: "m13Client" | "m13Assistant" | "m13ColleagueW" | "m13ColleagueM", uid: string, layer: "body" | "arms", seed: number, faceFn: (t: number) => number, extra?: (t: number) => PoseIn) => {
    const pose = (t: number): PoseIn => ({
      sit: 1,
      seat: seatOf(p.h / p.s) * p.s,
      expr: "calm",
      lookY: 0.05,
      armL: { target: { x: p.x + p.face * 150 * p.s - 30 * p.s, y: tableY(p) + 6 }, elbow: "hang" },
      armR: { target: { x: p.x + p.face * 150 * p.s + 30 * p.s, y: tableY(p) + 8 }, elbow: "hang" },
      ...extra?.(t),
    });
    return <Actor key={uid + layer} uid={uid} look={look} f={f} place={() => ({ x: p.x, y: p.y, h: p.h })} face={faceFn} pose={pose} seed={seed} blinkShift={seed} layer={layer} />;
  };
  const D = M.director;
  const enterAt = (t: number) => glide(t, P.enter[0], P.enter[1], M.enterPath, (x) => cruise(x, 0.18));
  const sd = sitDown(f, P.sit);
  const joinG = keys(f, [
    [P.join, 0],
    [P.join + 10, 1],
    [P.join + 40, 1],
    [P.join + 52, 0],
  ]);
  const dirPlace = (t: number) => {
    if (t < P.sit) {
      const p = enterAt(t);
      return { x: p.x, y: p.y, h: H.dad * (p.y > 0 ? (p.y - 860) / 1040 : 0.9) };
    }
    return { x: D.x, y: D.y, h: D.h };
  };
  const dirPose = (layer: "body" | "arms") => () => {
    void layer;
    const seat = seatOf(H.dad) * D.s;
    return {
      sit: sd.sit,
      seat,
      lean: sd.lean,
      expr: "calm" as const,
      nod: keys(f, [
        [P.nod, 0],
        [P.nod + 6, 1],
        [P.nod + 14, 0],
      ]) * 8,
      lookY: 0.05,
      armL: f > P.sit + 20 ? { target: { x: D.x - 150 * D.s - 30 * D.s, y: tableY(D) + 6 }, elbow: "hang" as const } : { target: null },
      armR:
        f > P.sit + 20
          ? joinG > 0.02
            ? { target: { x: lerp(D.x - 120 * D.s, M.screen.x + M.screen.w * 0.8, 0.35 * joinG), y: lerp(tableY(D) + 8, M.screen.y + M.screen.h, 0.3 * joinG) }, shape: "point" as const, elbow: "out" as const }
            : { target: { x: D.x - 150 * D.s + 30 * D.s, y: tableY(D) + 8 }, elbow: "hang" as const }
          : { target: null },
    } satisfies PoseIn;
  };
  const dirFace = (t: number) => (t < P.sit ? -0.8 : -0.85);
  const director = (layer: "body" | "arms") => (
    <Actor key={`md${layer}`} uid="b-md" look="m13Director" f={f} place={dirPlace} face={dirFace} pose={dirPose(layer)} seed={3} blinkShift={5} walkFrom={P.enter[0]} layer={f < P.sit ? "all" : layer} />
  );
  const towardDir = (t: number) => (t > P.enter[0] + 6 ? 0.85 : 0.7);
  const clientNod = (t: number): PoseIn => ({ nod: keys(t, [[P.join + 30, 0], [P.join + 38, 1], [P.join + 48, 0]]) * 7 });
  const all = (layer: "body" | "arms") => [
    seated(M.client, "m13Client", "mc", layer, 11, towardDir, clientNod),
    seated(M.assistant, "m13Assistant", "ma", layer, 7, (t) => 0.85 + listen(t)),
    seated(M.colleagueW, "m13ColleagueW", "mw", layer, 13, (t) => (t > P.enter[0] + 10 ? 0.6 : -0.85)),
    f >= P.sit ? director(layer) : null,
  ];

  return (
    <>
      {/* 7a: подъезд и остановка */}
      <Shot f={f} from={0} to={P.cutB} cam={camMove(f, 0, P.cutB, PK_CAM.wide, { x: 520, y: 1270, zoom: 0.92 })}>
        <ParkingLot mid={car(0)} />
      </Shot>
      {/* 7b–7c: звонок в салоне */}
      <Shot f={f} from={P.cutB} to={P.cutC} cam={camMove(f, P.cutB, P.cutC, { x: c.x - 78 * S + 20, y: c.y - 560 * c.s, zoom: 2.3 }, { x: c.x - 78 * S + 30, y: c.y - 570 * c.s, zoom: 2.45 })}>
        <ParkingLot mid={car(0)} />
      </Shot>
      {/* 7c: закрыл дверь, идёт ко входу */}
      <Shot f={f} from={P.cutC} to={P.cutD} cam={camMove(f, P.cutC, P.cutD, { x: 560, y: 1270, zoom: 0.92 }, { x: 640, y: 1220, zoom: 0.98 })}>
        <ParkingLot mid={<>{car(doorAng)}{walker}</>} />
      </Shot>
      {/* 7d: переговорная */}
      <Shot f={f} from={P.cutD} to={P.len} cam={camMove(f, P.cutD, P.len, MEET_CAM.wide, { x: 600, y: 1260, zoom: 1.02 })}>
        <MeetingRoom
          hi={f > P.join ? 1 : -1}
          head={<>{seated(M.colleagueM, "m13ColleagueM", "mm", "body", 17, () => 0)}{seated(M.colleagueM, "m13ColleagueM", "mm", "arms", 17, () => 0)}</>}
          seated={<>{all("body")}</>}
          arms={<>{all("arms")}</>}
          front={f < P.sit ? director("body") : null}
        />
      </Shot>
    </>
  );
};
