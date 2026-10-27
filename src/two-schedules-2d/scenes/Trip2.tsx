// Сцена 6 (69,5–82 с): вторая поездка ощущается иначе. Другой ракурс —
// вид в салон через лобовое стекло, планы длиннее и тише. Сын на заднем
// сиденье устал и задрёмывает. На телефоне в держателе — сообщение дочери
// «Апа, сен алыстасыңбы?». На парковке мама берёт телефон и отвечает
// голосовым: «Жакындап калдык, кызым. Мугалимиңдин жанында күтүп тур.»
// Те же школьные ворота (часы — 13:24): дочь рядом с учительницей замечает
// маму и подходит; мама берёт её рюкзак.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, cruise, keys, keysV, lerp, type Vec } from "../rig/motion";
import type { Expression } from "../rig/pose";
import { ChatScreen, PhoneFrame } from "../screens";
import { CabinBack, CabinFront, FrontSeats } from "../sets/CarViews";
import { SchoolBack, SchoolFence, SidewalkTrees } from "../sets/School";
import { box, camMove, Shot } from "../shots";
import type { Ts2Cue } from "../timing";
import { H, lineFrames, placeAt } from "./common";

const SLEEPY: Expression = { browIn: 2, browOut: -3, lid: 0.72, smile: -0.05 };

const walk = (t: number, t0: number, t1: number, a: Vec, b: Vec, h: number, acc = 0.25): Place => {
  const u = cruise((t - t0) / (t1 - t0), acc);
  return placeAt(lerp(a.x, b.x, u), lerp(a.y, b.y, u), h);
};

// Начало плана у ворот (кадр сцены): после голосового сообщения.
export const trip2Gate = (cues: readonly Ts2Cue[]) => lineFrames(cues, "m06", "trip2").to + 6 + 36;
export const T2_GIRL = (gate: number) => (t: number) => walk(t - gate, 14, 54, { x: 940, y: 1734 }, { x: 760, y: 1846 }, H.daughter, 0.3);
export const T2_MOM = (gate: number) => (t: number) => walk(t - gate, 0, 42, { x: 260, y: 1884 }, { x: 560, y: 1884 }, H.mom, 0.3);

export const T2 = {
  buzz: 74, // сообщение приходит
  insert: 92,
  park: 132, // машина стоит, мама берёт телефон
};

export const Trip2Scene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const m06 = lineFrames(cues, "m06", "trip2");
  const sentAt = m06.to + 6;
  const gate = trip2Gate(cues); // ворота школы
  const moving = f < T2.park;
  // путь машины (для отражений): плавная остановка на парковке
  const pass = keys(f, [[0, 0], [T2.park - 30, 110], [T2.park, 118]], (x) => x) + (f >= T2.park ? 0 : 0);

  // ---------- салон ----------
  const momDrive: Place = { x: 830, y: 1980, h: 1180 };
  const sonBack: Place = { x: 520, y: 1330, h: 610 };
  const holder: Vec = { x: 300, y: 1470 };
  const mouth: Vec = { x: 770, y: 1110 };
  const momPose = (t: number) => ({
    expr: t < T2.buzz ? ("thinking" as const) : t < m06.from ? ("calm" as const) : ("softSmile" as const),
    sit: 1,
    seat: 780,
    lookX: keys(t, [[T2.buzz + 4, 0], [T2.buzz + 10, -0.7], [T2.buzz + 34, -0.7], [T2.buzz + 42, 0], [T2.park, 0], [T2.park + 10, -0.3]]),
    lookY: keys(t, [[T2.buzz + 4, 0], [T2.buzz + 10, 0.5], [T2.buzz + 34, 0.5], [T2.buzz + 42, 0], [T2.park + 10, 0.4]]),
    armL: {
      target: keysV(t, [[0, { x: 660, y: 1258 }], [T2.park - 12, { x: 660, y: 1258 }], [T2.park, holder], [m06.from - 2, mouth], [sentAt, mouth], [sentAt + 16, { x: 680, y: 1300 }]], anticipate),
      shape: t >= T2.park && t < sentAt + 14 ? ("phone" as const) : ("fist" as const),
      item: t >= T2.park && t < sentAt + 14 ? ("phone" as const) : ("none" as const),
      glow: 1,
      itemTilt: 10,
      elbow: "down" as const,
      behind: false,
    },
    armR: { target: { x: 982, y: 1258 }, shape: "fist" as const, elbow: "down" as const },
  });
  const momFace = (t: number) => keys(t, [[0, 0], [40, 0], [52, 0.12], [64, 0], [T2.buzz + 20, -0.2], [T2.buzz + 44, 0], [T2.park + 8, -0.25]]);
  const sonPose = (t: number) => ({
    expr: t < 30 ? ("tired" as const) : SLEEPY,
    sit: 1,
    seat: 300,
    packOff: true,
    headTilt: keys(t, [[0, 0], [30, 0], [70, 9], [T2.buzz + 6, 9], [T2.buzz + 14, 4], [T2.buzz + 40, 10]]),
    nod: keys(t, [[20, 0], [60, 6], [T2.buzz + 6, 6], [T2.buzz + 12, 1], [T2.buzz + 40, 7]]),
    exhale: 0.9,
    armL: { target: { x: 480, y: 1105 }, shape: "relax" as const },
    armR: { target: { x: 565, y: 1110 }, shape: "relax" as const },
  });
  // сын смотрит в окно, потом голова опускается
  const sonFace = (t: number) => keys(t, [[0, -0.7], [40, -0.7], [70, -0.35]]);
  const cabin = (
    <>
      <CabinBack />
      {/* в боковом окне — улица проплывает, пока едем */}
      <div style={box({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={box({ left: ((i * 260 - pass * 10) % 1300) + (i * 260 - pass * 10 < 0 ? 1300 : 0) - 200, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#E3D3C1", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"][i], borderRadius: i % 2 ? 80 : 6 })} />
        ))}
      </div>
      <Actor uid="t2-son" look="son" f={f} place={() => sonBack} face={sonFace} pose={sonPose} seed={4} />
      {/* подушка заднего сиденья перед ногами сына */}
      <div style={box({ left: 370, top: 1120, width: 340, height: 220, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
      <FrontSeats />
      <Actor uid="t2-mom" look="mom" f={f} place={() => momDrive} face={momFace} pose={momPose} role="mother" seed={1} />
      <CabinFront pass={pass} wheel={moving ? Math.sin(f * 0.05) * 3 : 0} />
      {/* телефон в держателе (пока его не взяли) */}
      {f < T2.park ? (
        <div style={box({ left: holder.x - 40, top: holder.y - 70, width: 80, height: 140, borderRadius: 14, backgroundColor: "#1E2235", border: "4px solid #11131A" })}>
          <div style={box({ left: 5, top: 6, right: 5, bottom: 6, borderRadius: 9, backgroundColor: f >= T2.buzz ? "#DDEBFA" : "#2C3B5C" })} />
          {f >= T2.buzz ? <div style={box({ left: 12, top: 30, width: 48, height: 22, borderRadius: 8, backgroundColor: "#FFFFFF" })} /> : null}
        </div>
      ) : null}
      <div style={box({ left: holder.x - 14, top: holder.y + 64, width: 28, height: 60, backgroundColor: "#11131A" })} />
    </>
  );

  // ---------- школьные ворота ----------
  const e = (t: number) => t - gate;
  const G_GIRL = T2_GIRL(gate);
  const G_MOM = T2_MOM(gate);
  const teacher = placeAt(800, 1716, H.teacher);
  const give = gate + 64;
  const meet = (t: number): Vec => {
    const m = G_MOM(t);
    return { x: m.x + 0.14 * m.h, y: m.y - 0.44 * m.h };
  };
  const girlPose = (t: number) => {
    const p = G_GIRL(t);
    return {
      expr: e(t) < 10 ? ("calm" as const) : ("softSmile" as const),
      packOff: true,
      armL: {
        target: keysV(t, [[gate, { x: p.x - 0.13 * p.h, y: p.y - 0.44 * p.h }], [give - 14, { x: G_GIRL(give - 14).x - 0.13 * H.daughter, y: G_GIRL(give - 14).y - 0.44 * H.daughter }], [give, meet(give)], [give + 14, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }]], anticipate),
        shape: t < give ? ("fist" as const) : ("relax" as const),
        item: t < give ? ("backpack" as const) : ("none" as const),
        itemColor: LOOKS.daughter.backpack,
        elbow: "down" as const,
        behind: false,
      },
    };
  };
  const momGatePose = (t: number) => {
    const p = G_MOM(t);
    return {
      expr: "softSmile" as const,
      bagOnShoulder: 1,
      armR: {
        target: keysV(t, [[gate, { x: p.x + 0.12 * p.h, y: p.y - 0.44 * p.h }], [give - 14, { x: p.x + 0.12 * p.h, y: p.y - 0.44 * p.h }], [give, meet(give)], [give + 18, { x: p.x + 0.13 * p.h, y: p.y - 0.46 * p.h }]], anticipate),
        shape: t >= give ? ("fist" as const) : t > give - 14 ? ("open" as const) : ("relax" as const),
        item: t >= give ? ("backpack" as const) : ("none" as const),
        itemColor: LOOKS.daughter.backpack,
        elbow: "down" as const,
        behind: false,
      },
      armL: { target: keysV(t, [[give + 10, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }], [give + 24, { x: p.x + 0.02 * p.h, y: p.y - 0.62 * p.h }]]), shape: "open" as const, behind: false },
    };
  };
  const school = (
    <>
      <SchoolBack minutes={13 * 60 + 24 + e(f) / 300} />
      <Actor uid="t2-teacher" look="teacher" f={f} place={() => teacher} face={() => -0.3} pose={() => ({ expr: "softSmile" as const, armL: { target: { x: teacher.x - 0.08 * teacher.h, y: teacher.y - 0.5 * teacher.h }, shape: "fist" as const, item: "notebook" as const, elbow: "down" as const } })} seed={5} />
      {e(f) < 40 ? <Actor uid="t2-girl" look="daughter" f={f} place={G_GIRL} face={(t) => keys(e(t), [[0, 0.1], [6, -0.45]])} pose={girlPose} seed={3} walkFrom={gate} /> : null}
      <SchoolFence />
      {e(f) >= 40 ? <Actor uid="t2-girl" look="daughter" f={f} place={G_GIRL} face={(t) => keys(e(t), [[0, 0.1], [6, -0.45]])} pose={girlPose} seed={3} walkFrom={gate} /> : null}
      <Actor uid="t2-mom-g" look="mom" f={f} place={G_MOM} face={() => 0.4} pose={momGatePose} seed={1} walkFrom={gate} />
      <SidewalkTrees />
    </>
  );
  const shake = f >= T2.buzz && f < T2.buzz + 20 ? Math.sin(f * 2.4) * 4 : 0;
  return (
    <>
      <Shot f={f} from={0} to={T2.insert} cam={{ x: 560, y: 1000 + Math.sin(f * 0.3) * 1.5, zoom: 1.02 }}>
        {cabin}
      </Shot>
      {/* сообщение дочери крупно (телефон в держателе) */}
      <Shot
        f={f}
        from={T2.insert}
        to={T2.park}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "linear-gradient(180deg, #8FA9C2, #3B414D)" })}>
            <PhoneFrame x={190} y={150} w={700} shake={shake}>
              <ChatScreen f={f} msgAt={T2.insert + 6} recFrom={99999} sentAt={99999} voiceSec={4} />
            </PhoneFrame>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={T2.park} to={sentAt} cam={camMove(f, T2.park, sentAt, { x: 700, y: 1150, zoom: 1.35 }, { x: 710, y: 1150, zoom: 1.42 })}>
        {cabin}
      </Shot>
      <Shot
        f={f}
        from={sentAt}
        to={gate}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "linear-gradient(180deg, #8FA9C2, #3B414D)" })}>
            <PhoneFrame x={190} y={150} w={700}>
              <ChatScreen f={f} msgAt={-100} recFrom={m06.from} sentAt={sentAt + 4} voiceSec={Math.max(1, Math.round((m06.to - m06.from) / 30))} />
            </PhoneFrame>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={gate} to={375} cam={camMove(f, gate, 375, { x: 760, y: 1450, zoom: 1.25 }, { x: 740, y: 1460, zoom: 1.3 })}>
        {school}
      </Shot>
    </>
  );
};
