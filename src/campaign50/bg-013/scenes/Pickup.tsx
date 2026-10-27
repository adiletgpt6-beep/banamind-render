// Сцена 2: как устроен вторник мамы — четыре коротких плана, связанных
// часами (диктор: «Апасы иштен чыгып, баласын мектептен алып келет. Анан
// үйгө жетип, бүткөрүлбөгөн иштерине кайра киришет.»).
//   A. Офис, 12:40: напоминание «13:00 • Мектеп»; мама вежливо прощается
//      с участниками встречи, закрывает ноутбук, встаёт и уходит.
//   B. Школа, 13:00 — вовремя: её собственная машина (не BalaGo) подъезжает,
//      сын с учительницей у входа, садится, пристёгивается (вставка).
//   C. Дом, 13:30: мама и сын заходят, сын идёт к себе.
//   D. Мама снова садится за работу: часы ускоряются (13:30 → 18:40),
//      за окном вечереет, бумаг становится больше, взгляд устаёт.
// Камера всё время на высоте глаз ребёнка.
import { CheckIcon, easeInOut, easeOut, NAVY, popScale, prog, WA_GREEN, YELLOW } from "../art";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, cruise, keys, keysV, lerp } from "../rig/motion";
import { local, wordFrame, type SceneProps } from "../kit";
import { BG13_TEXT } from "../script";
import {
  ADULT_H,
  box,
  Cam,
  CHILD_H,
  CityWindow,
  DeskFront,
  FLOOR_Y,
  Kitchen,
  KITCHEN,
  LaptopBack,
  MomCar,
  Papers,
  SchoolFacade,
  StretchClock,
  Street,
  tableTop,
} from "./sets";

const H = ADULT_H;
const TOP = tableTop(H);
const seat = 0.27 * H;

export const pickupKeys = (tl: SceneProps["tl"]) => {
  const school = Math.max(70, wordFrame(tl, "n01", "баласын", 0.2) - 6);
  const home = Math.max(school + 75, wordFrame(tl, "n01", "анан", 0.5) - 4);
  const work = Math.max(home + 40, wordFrame(tl, "n01", "бүткөрүлбөгөн", 0.7) - 10);
  return { school, home, work };
};

// Подпись места и времени (детский ракурс — крупно, сверху слева).
const Tag: React.FC<{ readonly text: string; readonly time: string; readonly f: number }> = ({ text, time, f }) => {
  const u = easeOut(prog(f, 2, 8));
  return (
    <div style={box({ left: 46, top: 200, display: "flex", alignItems: "center", gap: 14, padding: "10px 26px 10px 12px", borderRadius: 40, backgroundColor: "#FFFFFF", boxShadow: "0 8px 20px rgba(20,40,75,0.16)", opacity: u, transform: `translateY(${(1 - u) * -18}px)` })}>
      <div style={{ padding: "6px 16px", borderRadius: 30, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 34, fontWeight: 1000 }}>{time}</div>
      <div style={{ fontSize: 38, fontWeight: 1000, color: NAVY }}>{text}</div>
    </div>
  );
};

const T = BG13_TEXT.pickup;

// A. Офис.
const Office: React.FC<{ readonly f: number; readonly len: number; readonly end: number }> = ({ f, len, end }) => {
  const mom = (t2: number): Place => ({ x: lerp(400, 1380, cruise(prog(t2, 64, end - 64), 0.25)), y: FLOOR_Y, h: H });
  const close = prog(f, 30, 10);
  const remind = popScale(prog(f, 2, 10)) * (1 - prog(f, 40, 8));
  const done = popScale(prog(f, 40, 10));
  const z = keys(f, [[0, 1.08], [end, 1.0]]);
  return (
    <Cam cx={540} cy={960} z={z}>
      <div style={box({ inset: -200, backgroundColor: "#EAF0F7" })} />
      <CityWindow x={70} y={240} w={440} h={520} />
      <StretchClock x={820} y={380} r={120} minutes={12 * 60 + 40 + f * 0.03} stretch={0.25 + 0.2 * Math.sin(f / 14)} />
      <div style={box({ left: -200, right: -200, top: FLOOR_Y - 220, height: 700, backgroundColor: "#DCE4EE" })} />
      <Actor
        uid="office-mom"
        look="mom"
        f={f}
        sceneLen={len}
        seed={41}
        walkFrom={60}
        place={mom}
        face={(t2) => keys(t2, [[0, 0.55], [28, 0.55], [36, 0.2], [58, 0.3], [64, 0.9]])}
        pose={(t2) => ({
          expr: t2 < 40 ? ("calm" as const) : ("softSmile" as const),
          sit: keys(t2, [[46, 1], [62, 0]]),
          seat,
          lookY: keys(t2, [[0, 0.1], [30, 0.3], [44, 0]]),
          bagOnShoulder: keys(t2, [[50, 0], [60, 1]]),
          armR: {
            target:
              t2 < 30
                ? { x: 400 + 0.24 * H + Math.sin(t2 / 2.2) * (t2 > 8 && t2 < 26 ? 22 : 0), y: FLOOR_Y - 0.66 * H }
                : { x: lerp(400 + 0.22 * H, 640, easeInOut(prog(t2, 28, 8))), y: lerp(FLOOR_Y - 0.62 * H, TOP - 140 * (1 - close), easeInOut(prog(t2, 28, 8))) },
            shape: t2 < 30 ? ("wave" as const) : ("open" as const),
            elbow: "down" as const,
            behind: false,
          },
          armL: { target: t2 < 46 ? { x: 400 - 0.1 * H, y: TOP + 4 } : null, shape: "relax" as const, elbow: "down" as const, behind: false },
        })}
      />
      <DeskFront x={120} w={760} top={TOP} color="#FFFFFF" edge="#C9D3E1" />
      <LaptopBack x={640} y={TOP} open={1 - easeInOut(close)} />
      {remind > 0 ? (
        <div style={box({ left: 560, top: 760, padding: "14px 22px", borderRadius: 24, backgroundColor: "#FFFFFF", boxShadow: "0 10px 24px rgba(20,40,75,0.2)", border: `4px solid ${YELLOW}`, transform: `scale(${remind})`, fontSize: 36, fontWeight: 1000, color: NAVY })}>
          13:00 • {T.school}
        </div>
      ) : null}
      {done > 0 ? (
        <div style={box({ left: 560, top: 760, display: "flex", alignItems: "center", gap: 10, padding: "12px 22px", borderRadius: 24, backgroundColor: "#E7F7EC", border: `4px solid ${WA_GREEN}`, transform: `scale(${done})`, fontSize: 34, fontWeight: 1000, color: NAVY, opacity: 1 - prog(f, 58, 8) })}>
          <CheckIcon size={36} color={WA_GREEN} /> {T.meetingEnd}
        </div>
      ) : null}
      <Tag text={T.office} time="12:40" f={f} />
    </Cam>
  );
};

// B. Школа, 13:00: мама приезжает вовремя.
const School: React.FC<{ readonly f: number; readonly len: number; readonly dur: number }> = ({ f, len, dur }) => {
  const arrive = 28;
  const walkTo = [arrive + 4, arrive + 34] as const;
  const inCar = walkTo[1] + 4;
  const leave = Math.max(inCar + 30, dur - 24);
  const carX = f < leave ? lerp(-420, 330, easeOut(prog(f, 0, arrive))) : lerp(330, 1600, Math.pow(prog(f, leave, 30), 2));
  const moving = f < arrive || f >= leave;
  const wheel = moving ? f * 22 : 0;
  const son = (t2: number): Place => ({ x: lerp(650, 380, cruise(prog(t2, walkTo[0], walkTo[1] - walkTo[0]), 0.25)), y: 1400, h: CHILD_H * 0.86 });
  const teacher: Place = { x: 820, y: 1400, h: ADULT_H * 0.86 };
  const belt = prog(f, inCar + 4, 16);
  const inset = easeOut(prog(f, inCar, 8)) * (1 - prog(f, leave + 4, 8));
  return (
    <Cam cx={540} cy={960} z={keys(f, [[0, 1.0], [dur, 1.05]])}>
      <div style={box({ inset: -200, background: "linear-gradient(180deg, #CFE4FA 0%, #EEF5FC 60%)" })} />
      <SchoolFacade minutes={13 * 60 + f * 0.02} stretch={0.2} />
      <Street offset={0} />
      <Actor
        uid="school-teacher"
        look="colleague"
        f={f}
        sceneLen={len}
        seed={42}
        place={() => teacher}
        face={(t2) => keys(t2, [[0, -0.3], [arrive, -0.6]])}
        pose={(t2) => ({
          expr: "softSmile" as const,
          armR: { target: t2 > arrive + 6 && t2 < inCar + 20 ? { x: teacher.x + 0.24 * teacher.h, y: 1400 - 0.82 * teacher.h + Math.sin(t2 / 2.4) * 16 } : null, shape: "wave" as const, elbow: "down" as const },
          armL: { target: t2 < walkTo[0] + 6 ? { x: teacher.x - 0.16 * teacher.h, y: 1400 - 0.48 * teacher.h } : null, shape: "relax" as const, elbow: "down" as const },
        })}
      />
      {f < inCar ? (
        <Actor
          uid="school-son"
          look="son"
          f={f}
          sceneLen={len}
          seed={43}
          walkFrom={walkTo[0] - 2}
          place={son}
          face={(t2) => keys(t2, [[0, 0.3], [arrive - 6, -0.6]])}
          pose={(t2) => ({
            expr: t2 < arrive - 4 ? ("calm" as const) : ("smile" as const),
            strapTug: 0.6,
            armL: { target: t2 > arrive - 4 && t2 < walkTo[0] + 4 ? { x: son(t2).x - 0.3 * son(t2).h, y: 1400 - 0.9 * son(t2).h + Math.sin(t2 / 2.2) * 12 } : null, shape: "wave" as const, elbow: "down" as const },
            armR: { target: t2 < walkTo[0] ? { x: teacher.x - 0.2 * teacher.h, y: 1400 - 0.46 * teacher.h } : null, shape: "relax" as const, elbow: "down" as const },
          })}
        />
      ) : null}
      <MomCar x={carX} y={1530} s={2.1} wheel={wheel} kid={f >= inCar ? 1 : 0} bounce={moving ? Math.sin(f) * 1.5 : 0} />
      {/* вставка: ремень безопасности защёлкнут */}
      {inset > 0 ? (
        <div style={box({ left: 680, top: 560, width: 320, height: 320, borderRadius: 160, overflow: "hidden", backgroundColor: "#3D4A63", boxShadow: `0 0 0 10px #FFFFFF, 0 14px 30px rgba(20,40,75,0.3)`, transform: `scale(${inset})` })}>
          <div style={box({ left: 30, top: -40, width: 46, height: 420, backgroundColor: "#1F2533", transform: `rotate(${-38 + 10 * (1 - belt)}deg)`, transformOrigin: "50% 0" })} />
          <div style={box({ left: 150, top: 190, width: 90, height: 60, borderRadius: 12, backgroundColor: "#C9D2E0", border: "5px solid #1F2533" })} />
          <div style={box({ left: lerp(40, 118, easeInOut(belt)), top: lerp(110, 196, easeInOut(belt)), width: 64, height: 48, borderRadius: 10, backgroundColor: "#AEB8C8", border: "5px solid #1F2533" })} />
          {belt >= 1 ? (
            <div style={box({ left: 112, top: 70, width: 96, height: 96, borderRadius: 48, backgroundColor: WA_GREEN, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${popScale(prog(f, inCar + 20, 8))})` })}>
              <CheckIcon size={60} color="#FFFFFF" />
            </div>
          ) : null}
        </div>
      ) : null}
      <Tag text={T.onTime} time="13:00" f={f} />
    </Cam>
  );
};

// C + D. Дом: мама и сын заходят; мама снова садится за работу.
const Home: React.FC<{ readonly f: number; readonly len: number; readonly work: number; readonly dur: number }> = ({ f, len, work, dur }) => {
  const sitAt = Math.max(36, work - 14);
  const mom = (t2: number): Place => ({ x: lerp(-130, 330, cruise(prog(t2, 0, sitAt - 8), 0.25)), y: FLOOR_Y, h: H });
  const son = (t2: number): Place => ({ x: lerp(-200, 1400, cruise(prog(t2, 10, 60), 0.2)), y: FLOOR_Y + 40, h: CHILD_H * 1.05 });
  // время ускоряется: 13:30 → 18:40
  const lapse = easeInOut(prog(f, work, Math.max(30, dur - work - 6)));
  const minutes = 13 * 60 + 30 + f * 0.05 + lapse * 305;
  const typing = f > sitAt + 14;
  // живые паузы в таймлапсе: взгляд на часы, рука к шее
  const glance = work + Math.round((dur - work) * 0.3);
  const stretchAt = work + Math.round((dur - work) * 0.62);
  const neck = { x: 330 + 0.02 * H, y: FLOOR_Y - 0.6 * H };
  const key = (side: number) => (typing ? Math.abs(Math.sin(f / 2.3 + side * 1.7)) * 10 : 0);
  return (
    <Cam cx={540} cy={960} z={keys(f, [[0, 1.0], [work, 1.0], [dur, 1.08]])}>
      <Kitchen minutes={minutes} stretch={0.2 + lapse * 0.8} evening={lapse * 0.85} lamp={prog(lapse, 0.6, 0.4)} drift={-f * 0.4} />
      <Actor
        uid="home-mom"
        look="mom"
        f={f}
        sceneLen={len}
        seed={44}
        walkFrom={0}
        place={mom}
        face={(t2) => keys(t2, [[sitAt - 10, 0.4], [sitAt, 0.55], [glance, 0.55], [glance + 8, 0.75], [glance + 30, 0.75], [glance + 40, 0.55]])}
        pose={(t2) => ({
          expr: lapse > 0.55 ? ("tired" as const) : t2 < sitAt ? ("calm" as const) : ("thinking" as const),
          sit: keys(t2, [[sitAt - 6, 0], [sitAt + 8, 1]]),
          seat,
          lean: keys(t2, [[sitAt + 8, 0], [sitAt + 16, 5]]),
          lookY: keys(t2, [[sitAt + 6, 0], [sitAt + 14, 0.35], [glance, 0.35], [glance + 8, -0.7], [glance + 30, -0.7], [glance + 40, 0.35]]),
          headTilt: keys(t2, [[stretchAt, 0], [stretchAt + 8, -10], [stretchAt + 26, -10], [stretchAt + 34, 0]]),
          bagOnShoulder: keys(t2, [[sitAt - 12, 1], [sitAt - 4, 0]]),
          exhale: lapse,
          armR: { target: t2 > sitAt ? { x: KITCHEN.laptopX - 40, y: TOP - 4 - key(0) } : null, shape: "relax" as const, elbow: "down" as const, behind: false },
          armL: {
            target: keysV(
              t2,
              [
                [sitAt, { x: KITCHEN.laptopX - 110, y: TOP - 4 - key(1) }],
                [stretchAt, { x: KITCHEN.laptopX - 110, y: TOP - 4 - key(1) }],
                [stretchAt + 8, neck],
                [stretchAt + 26, neck],
                [stretchAt + 34, { x: KITCHEN.laptopX - 110, y: TOP - 4 - key(1) }],
              ],
              anticipate,
            ),
            shape: "relax" as const,
            elbow: "down" as const,
            behind: false,
          },
        })}
      />
      <DeskFront x={KITCHEN.tableX} w={KITCHEN.tableW} top={TOP} color="#FFFFFF" edge="#E3CDB0" />
      <LaptopBack x={KITCHEN.laptopX} y={TOP} open={easeInOut(prog(f, sitAt + 4, 10))} />
      <Papers x={720} y={TOP} n={2 + lapse * 7} />
      <Actor
        uid="home-son"
        look="son"
        f={f}
        sceneLen={len}
        seed={45}
        walkFrom={8}
        place={son}
        face={() => 0.9}
        pose={(t2) => ({
          expr: "smile" as const,
          strapTug: 0.5,
          armL: { target: t2 > 30 && t2 < 50 ? { x: son(t2).x - 0.32 * son(t2).h, y: FLOOR_Y + 40 - 0.9 * son(t2).h + Math.sin(t2 / 2) * 10 } : null, shape: "wave" as const, elbow: "down" as const },
        })}
      />
      <Tag text={f < work ? T.home : T.work} time={f < work ? "13:30" : `${Math.floor(minutes / 60)}:${String(Math.floor(minutes % 60)).padStart(2, "0")}`} f={f} />
    </Cam>
  );
};

export const Pickup: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, len } = local(tl, "pickup", t);
  const k = pickupKeys(tl);
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: "#FFFFFF" })}>
      {f < k.school ? <Office f={f} len={len} end={k.school} /> : null}
      {f >= k.school && f < k.home ? <School f={f - k.school} len={len} dur={k.home - k.school} /> : null}
      {f >= k.home ? <Home f={f - k.home} len={len} work={k.work - k.home} dur={len - k.home} /> : null}
      {/* шторка-переход между планами: стрелка часов */}
      {[k.school, k.home].map((at) => {
        const u = prog(f, at - 6, 12);
        return u > 0 && u < 1 ? <div key={at} style={box({ inset: 0, backgroundColor: YELLOW, opacity: 0.5 * Math.sin(Math.PI * u) })} /> : null;
      })}
    </div>
  );
};
