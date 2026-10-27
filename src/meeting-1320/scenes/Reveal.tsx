// Сцена 5 «Мектептин короосу» — раскрытие.
// 5a. Общий план: школьный вход, табличка «Мектеп», дети выходят; у левого
//     края — нос машины семьи, отец рядом смотрит на вход. В двери
//     появляется СЫН с оранжевым рюкзаком и замечает отца.
// 5b. S01 «Ата!»: средний план сына — поднимает руку, зовёт.
// 5c. Пауза: крупно отец — узнаёт, тёплая улыбка.
// 5d. S02: сын подбегает, останавливается перед отцом и радостно
//     рассказывает (жест рукой и стоп); отец наклоняется к нему.
// 5e. Посадка несколькими планами: отец открывает заднюю дверь (сын
//     подходит) → в салоне сын садится, рука отца ведёт ремень через плечо
//     и грудь к замку → крупно защёлка «щёлк».
// 5f. F02 «Айтып берчи.»: отец у открытой двери смотрит на сына.
// 5g. N07: машина едет; сын оживлённо рассказывает руками (рты закрыты —
//     говорит рассказчик), отец слушает; затем тот же пункт календаря
//     13:20 — в пустом поле впервые пишется «Уулум — мектеп».
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { Shot, box, camMove, usePlan, useScene } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, glide, keys } from "../rig/motion";
import { CAR_SCALE, H } from "./common";
import { SchoolYard, SchoolYardFront, syS, syX, syY } from "../sets/SchoolYard";
import { CarSide, carSeatPlace, doorHandleAt } from "../props/Car";
import { BeltClose, BuckleClose } from "../props/CarInterior";
import { CityStreet, STREET } from "../sets/City";
import { CalendarBackdrop, CalendarDay, DAY_POS } from "../props/CalendarUI";
import { sfxAt, type M13Sfx } from "./sfx";

// География двора (мир плана SchoolYard): дверь школы — X 900 на фасаде;
// машина семьи — у левого края, носом вправо; отец — у её носа.
const CAR = { X: -900, s: 0.66 };
const FATHER = { X: 200, s: 0.7 };

export const revealPlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "reveal");
  const s1 = T.from("S01");
  const s2 = T.from("S02");
  const s2End = T.to("S02");
  const f2 = T.from("F02");
  const f2End = T.to("F02");
  const n7 = T.from("N07");
  const n7End = T.to("N07");
  const cutB = Math.max(40, s1 - 8);
  const cutC = Math.max(cutB + 18, T.to("S01") + 4);
  const cutD = Math.max(cutC + 20, s2 - 8);
  const cutE = Math.max(cutD + 50, s2End + 12); // дверь
  const cutE2 = cutE + 44; // салон: садится и ремень
  const cutE3 = cutE2 + 46; // защёлка крупно
  const cutF = Math.max(cutE3 + 28, f2 - 12); // «Айтып берчи»
  const cutG = Math.max(cutF + 30, Math.min(n7 - 4, f2End + 18)); // едут
  const cutH = Math.max(cutG + 40, n7End - 26); // 13:20 с подписью
  return {
    len: T.len,
    door: [16, 34] as const,
    sonOut: 30, // сын появляется в двери
    spot: cutB - 6, // замечает отца
    cutB,
    wave: [s1 - 6, s1 + 18] as const,
    cutC,
    smile: cutC + 4,
    cutD,
    run: [cutD - 2, cutD + 26] as const,
    gesture: [T.word("S02", "тажрыйбабыз"), T.wordEnd("S02", "ийгиликтүү")] as const,
    cutE,
    open: [cutE + 6, cutE + 22] as const,
    cutE2,
    pull: [cutE2 + 12, cutE2 + 40] as const,
    cutE3,
    insert: [cutE3 + 4, cutE3 + 22] as const,
    click: cutE3 + 20,
    release: [cutE3 + 28, cutE3 + 44] as const,
    cutF,
    cutG,
    cutH,
    meaning: [cutH + 8, cutH + 34] as const,
  };
};

export const revealSfx = (tl: M13Timeline): M13Sfx[] => {
  const P = revealPlan(tl);
  return [
    sfxAt(tl, "reveal", P.open[0] + 2, "car-door-open", 0.45),
    sfxAt(tl, "reveal", P.pull[0], "belt-pull", 0.4),
    sfxAt(tl, "reveal", P.click, "belt-click", 0.6),
  ];
};

export const revealSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  const P = revealPlan(tl);
  const T = sceneTools(tl, "reveal");
  // салон и защёлка: низ кадра занят ремнём — субтитры наверх
  return [[T.start + P.cutE2, T.start + P.cutF]];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));

export const RevealScene: React.FC = () => {
  const { f } = useScene("reveal");
  const P = usePlan(revealPlan);

  // ---------- двор ----------
  const carX = syX(CAR.X, CAR.s);
  const carY = syY(CAR.s);
  const carS = CAR_SCALE * CAR.s;
  const fa = { x: syX(FATHER.X, FATHER.s), y: syY(FATHER.s) };
  const door = { x: syX(900, 0.41), y: syY(0.41) };
  // сын выходит из двери на верхнюю ступень
  const sonPath = [
    { x: door.x + 20, y: door.y - 6 },
    { x: door.x - 10, y: door.y + 8 },
  ];
  const sonAt = (t: number) => glide(t, P.sonOut, P.sonOut + 16, sonPath);
  const sonPlace = (t: number) => {
    const p = sonAt(t);
    return { x: p.x, y: p.y, h: H.son * syS(p.y) };
  };
  const wave = keys(f, [
    [P.wave[0], 0],
    [P.wave[0] + 6, 1],
    [P.wave[1], 1],
    [P.wave[1] + 10, 0],
  ]);
  const sonDoorPose = (): PoseIn => {
    const p = sonAt(f);
    const k = H.son * syS(p.y) / 1000;
    return {
      expr: f > P.spot ? "smile" : "calm",
      lookX: -0.3,
      armL: wave > 0.02 ? { target: { x: p.x - 160 * k, y: p.y - (1020 + 120 * wave) * k }, shape: "wave", elbow: "out" } : { target: null },
      strapTug: wave > 0.02 ? 0 : 0.6,
    };
  };
  const son = <Actor uid="r-son" look="m13Son" f={f} place={sonPlace} face={(t) => (t < P.spot ? 0 : -0.7)} pose={sonDoorPose} role="son" seed={5} blinkShift={2} walkFrom={P.sonOut} />;
  // другие дети уходят к воротам
  const kid = (uid: string, look: "friendA" | "friendB", from: { x: number; y: number }, to: { x: number; y: number }, t0: number, seed: number) => {
    const at = (t: number) => glide(t, t0, t0 + 120, [from, to], (x) => cruise(x, 0.15));
    return (
      <Actor
        uid={uid}
        look={look}
        f={f}
        place={(t) => {
          const p = at(t);
          return { x: p.x, y: p.y, h: 560 * syS(p.y) };
        }}
        face={() => (to.x > from.x ? 0.85 : -0.85)}
        seed={seed}
        walkFrom={t0}
        opacity={clamp((f - t0 + 4) / 6)}
      />
    );
  };
  const father = (look: number, extra?: PoseIn) => (
    <Actor
      uid="r-fa"
      look="m13Director"
      f={f}
      place={() => ({ x: fa.x, y: fa.y, h: H.dad * FATHER.s })}
      face={() => look}
      pose={() => ({ expr: f > P.spot + 4 ? "smile" : "calm", lookY: -0.05, armR: { target: null, item: "keys" }, ...extra })}
      role="father"
      seed={3}
      blinkShift={5}
    />
  );
  const yardMid = (withSon: boolean) => (
    <>
      {kid("r-k1", "friendA", { x: syX(1040, 0.43), y: syY(0.43) }, { x: syX(2100, 0.5), y: syY(0.5) }, 6, 21)}
      {kid("r-k2", "friendB", { x: syX(780, 0.43), y: syY(0.43) }, { x: syX(1900, 0.52), y: syY(0.52) }, 16, 23)}
      {withSon && f >= P.sonOut ? son : null}
      <CarSide x={carX} y={carY} s={carS} layer="back" />
      <CarSide x={carX} y={carY} s={carS} layer="body" />
      {father(0.55)}
    </>
  );

  // ---------- 5d: подбегает ----------
  const meetY = syY(0.7);
  const runFrom = { x: fa.x + 900, y: meetY + 10 };
  const runTo = { x: fa.x + 250, y: meetY + 6 };
  const runAt = (t: number) => glide(t, P.run[0], P.run[1], [runFrom, runTo], (x) => cruise(x, 0.25));
  const g = keys(f, [
    [P.gesture[0], 0],
    [P.gesture[0] + 8, 1],
    [P.gesture[1], 1],
    [P.gesture[1] + 10, 0],
  ]);
  const runPose = (): PoseIn => {
    const p = runAt(f);
    const k = (H.son * FATHER.s) / 1000;
    return {
      expr: "smile",
      lookY: -0.25,
      armL: g > 0.02 ? { target: { x: p.x - 230 * k, y: p.y - (640 + 120 * g) * k }, shape: "open", elbow: "out" } : { target: null },
    };
  };
  const lean = keys(f, [
    [P.cutD + 18, 0],
    [P.cutD + 34, 1],
  ]);

  // ---------- 5e: задняя дверь (бок машины, ближе) ----------
  const s2c = 1.0; // масштаб глубины машины в этом плане
  const cs = CAR_SCALE * s2c;
  const c2 = { x: 1240, y: 1640 };
  const doorAng = 72 * easeInOut(ramp(f, P.open[0], P.open[1]));
  const handle = doorHandleAt(c2.x, c2.y, cs, doorAng, -1, "rear");
  const faDoor = { x: c2.x - 690, y: c2.y + 40 };
  const sonApproach = (t: number) => glide(t, P.cutE - 10, P.open[1] + 10, [{ x: c2.x - 1250, y: c2.y + 60 }, { x: c2.x - 470, y: c2.y + 60 }], (x) => cruise(x, 0.2));
  const seat = carSeatPlace(c2.x, c2.y, cs, "rear");

  // ---------- 5g: едут ----------
  const drive = ramp(f, P.cutG - 10, P.cutH + 10);
  const scroll = 1400 * drive + 900;
  const ds = CAR_SCALE * 0.5;
  const dx = 470;
  const bounce = Math.sin(f * 0.9) * 0.9;
  const fr = carSeatPlace(dx, STREET.road, ds, "front", -1, bounce);
  const rr = carSeatPlace(dx, STREET.road, ds, "rear", -1, bounce);
  const tell = Math.sin(f * 0.35);

  return (
    <>
      {/* 5a: общий план входа */}
      <Shot f={f} from={0} to={P.cutB} cam={camMove(f, 0, P.cutB, { x: 600, y: 1190, zoom: 0.84 }, { x: 590, y: 1170, zoom: 0.9 })}>
        <SchoolYard door={ramp(f, P.door[0], P.door[1])} mid={yardMid(true)} />
        <SchoolYardFront />
      </Shot>
      {/* 5b: «Ата!» */}
      <Shot f={f} from={P.cutB} to={P.cutC} cam={{ x: door.x - 30, y: door.y - 190, zoom: 2.6 }}>
        <SchoolYard door={1} mid={yardMid(true)} />
      </Shot>
      {/* 5c: отец узнаёт — крупно */}
      <Shot f={f} from={P.cutC} to={P.cutD} cam={camMove(f, P.cutC, P.cutD, { x: fa.x + 10, y: fa.y - 470, zoom: 2.9 }, { x: fa.x + 10, y: fa.y - 480, zoom: 3.05 })}>
        <SchoolYard door={1} mid={yardMid(false)} />
      </Shot>
      {/* 5d: подбежал и рассказывает */}
      <Shot f={f} from={P.cutD} to={P.cutE} cam={{ x: fa.x + 170, y: meetY - 330, zoom: 1.75 }}>
        <SchoolYard door={1} mid={<>
          <CarSide x={carX} y={carY} s={carS} layer="back" />
          <CarSide x={carX} y={carY} s={carS} layer="body" />
          <Actor uid="r-fa2" look="m13Director" f={f} place={() => ({ x: fa.x, y: meetY, h: H.dad * FATHER.s })} face={() => 0.6} pose={() => ({ expr: "smile", lean: 10 * lean, lookY: 0.2 * lean, armR: { target: null, item: "keys" } })} role="father" seed={3} blinkShift={5} />
          <Actor uid="r-run" look="m13Son" f={f} place={(t) => ({ ...runAt(t), h: H.son * FATHER.s })} face={() => -0.75} pose={runPose} role="son" seed={5} blinkShift={2} walkFrom={P.run[0]} />
        </>} />
      </Shot>
      {/* 5e: задняя дверь открывается, сын подходит */}
      <Shot f={f} from={P.cutE} to={P.cutE2} cam={{ x: 640, y: 1250, zoom: 0.92 }}>
        <SchoolYard door={1} />
        <CarSide x={c2.x} y={c2.y} s={cs} layer="back" open={doorAng} />
        <CarSide x={c2.x} y={c2.y} s={cs} layer="body" open={doorAng} />
        <CarSide x={c2.x} y={c2.y} s={cs} layer="door" open={doorAng} />
        <Actor
          uid="r-fa3"
          look="m13Director"
          f={f}
          place={() => ({ x: faDoor.x, y: faDoor.y, h: H.dad })}
          face={() => 0.7}
          pose={() => ({ expr: "softSmile", lookY: 0.25, armR: f < P.open[1] + 4 ? { target: { x: handle.x, y: handle.y }, shape: "fist", elbow: "down" } : { target: null } })}
          seed={3}
          blinkShift={5}
        />
        <Actor uid="r-son3" look="m13Son" f={f} place={(t) => ({ ...sonApproach(t), h: H.son })} face={() => 0.8} pose={() => ({ expr: "smile", lean: 8 * ramp(f, P.open[1], P.open[1] + 12) })} seed={5} blinkShift={2} walkFrom={P.cutE - 10} />
      </Shot>
      {/* 5e-2: в салоне — ремень через плечо */}
      <Shot f={f} from={P.cutE2} to={P.cutE3} cam={{ x: 540, y: 960, zoom: 1 }}>
        <BeltClose f={f} pull={ramp(f, P.pull[0], P.pull[1])} click={0} release={0} look={ramp(f, P.pull[0] + 6, P.pull[0] + 20) * 0.9} />
      </Shot>
      {/* 5e-3: защёлка */}
      <Shot f={f} from={P.cutE3} to={P.cutF} cam={{ x: 540, y: 960, zoom: 1 }}>
        <BuckleClose insert={ramp(f, P.insert[0], P.insert[1]) * 1.1} release={ramp(f, P.release[0], P.release[1])} />
      </Shot>
      {/* 5f: «Айтып берчи.» — отец у открытой двери */}
      <Shot f={f} from={P.cutF} to={P.cutG} cam={camMove(f, P.cutF, P.cutG, { x: c2.x - 330, y: 1200, zoom: 1.35 }, { x: c2.x - 320, y: 1190, zoom: 1.42 })}>
        <SchoolYard door={1} />
        <CarSide x={c2.x} y={c2.y} s={cs} layer="back" open={72} />
        <Actor uid="r-son4" look="m13Son" f={f} place={() => ({ x: seat.x, y: seat.y, h: H.son })} face={() => 0.85} pose={() => ({ sit: 1, seat: seat.seat, packOff: true, expr: "smile", lookX: -0.9, armL: { target: { x: seat.x + 110, y: seat.y - 250 }, elbow: "hang" }, armR: { target: { x: seat.x + 150, y: seat.y - 240 }, elbow: "hang" } })} seed={5} blinkShift={2} />
        <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
          {/* ремень сына (виден сбоку): от плеча к бедру */}
          <path d={`M ${seat.x - 30} ${seat.y - 470} L ${seat.x + 70} ${seat.y - 250}`} stroke="#3B404B" strokeWidth={22} strokeLinecap="round" />
        </svg>
        <CarSide x={c2.x} y={c2.y} s={cs} layer="body" open={72} />
        <CarSide x={c2.x} y={c2.y} s={cs} layer="door" open={72} />
        <Actor uid="r-fa4" look="m13Director" f={f} place={() => ({ x: faDoor.x + 90, y: faDoor.y, h: H.dad })} face={() => 0.75} pose={() => ({ expr: "softSmile", lean: 14, lookY: 0.3, nod: 4 })} role="father" seed={3} blinkShift={5} />
      </Shot>
      {/* 5g: едут — сын рассказывает руками */}
      <Shot f={f} from={P.cutG} to={P.cutH} cam={{ x: 540, y: 960, zoom: 1 }}>
        <CityStreet
          scroll={scroll}
          bcX={-3000}
          car={
            <>
              <CarSide x={dx} y={STREET.road} s={ds} layer="back" wheel={scroll * 1.2} bounce={bounce} />
              <Actor uid="r-drv" look="m13Director" f={f} place={() => ({ x: fr.x, y: fr.y, h: H.dad * 0.5 })} face={() => 0.9} pose={() => ({ sit: 1, seat: fr.seat, expr: "softSmile", armL: { target: { x: fr.x + 60, y: fr.y - 150 }, elbow: "down" }, armR: { target: { x: fr.x + 65, y: fr.y - 145 }, elbow: "down" } })} seed={3} />
              <Actor
                uid="r-pas"
                look="m13Son"
                f={f}
                place={() => ({ x: rr.x, y: rr.y, h: H.son * 0.5 })}
                face={() => 0.8}
                pose={() => ({ sit: 1, seat: rr.seat, packOff: true, expr: "smile", armL: { target: { x: rr.x + 70 + 12 * tell, y: rr.y - 170 - 14 * Math.abs(tell) }, shape: "open", elbow: "out" } })}
                seed={5}
              />
              <CarSide x={dx} y={STREET.road} s={ds} layer="body" wheel={scroll * 1.2} bounce={bounce} />
            </>
          }
        />
      </Shot>
      {/* 5h: тот же пункт 13:20 — теперь с подписью */}
      <Shot f={f} from={P.cutH} to={P.len} cam={camMove(f, P.cutH, P.len, { x: 540, y: 980, zoom: 1.02 }, { x: 540, y: 1000, zoom: 1.08 })}>
        <CalendarBackdrop warm={0.5} />
        <CalendarDay x={DAY_POS.x} y={DAY_POS.y} day={0} glow={0.5 + 0.5 * easeOut(ramp(f, P.cutH, P.cutH + 14))} meaning={ramp(f, P.meaning[0], P.meaning[1])} />
      </Shot>
    </>
  );
};
