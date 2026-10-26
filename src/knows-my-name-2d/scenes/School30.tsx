// Сцены 10–12 у школы («Эртеси эртең менен»). В школу сына везёт папа на
// своей машине; BalaGo здесь нет.
// 10. Синий рюкзак крупно (склейка по цвету с машинкой вечером) → общий план:
//     школа, ворота, машина семьи у тротуара, папа с сыном во дворе у
//     ворот. Средний план: папа поправляет перекрученную лямку — кисть на
//     лямке, лямка расправляется и остаётся на месте.
// 11. Крупно сын: думает, появляется улыбка, K05. Папа присел на его
//     уровень: F02. Сын кивает.
// 12. Общий план: сын идёт к основному входу (несколько спокойных шагов),
//     папа остаётся у ворот и смотрит вслед; у крыльца сын оборачивается и
//     коротко машет.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { CarSide } from "../props/Car";
import { clamp, cruise, keys, lerp } from "../rig/motion";
import { box, camMove, Shot, useScene, usePlan, type Cam } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";

import { KM2_TEXT } from "../script";
import { Fence, SCHOOL, SchoolBack, SchoolStreet } from "../sets/School";
import { TimeCaption } from "./Work";

// Рост во дворе у ворот (общий план): сын 360, папа 480; машина — ближе
// к камере (на дороге), её масштаб 1,3 (крыша ниже роста папы).
const KID = 360;
const DAD = 480;
const YARD_Y = SCHOOL.fenceY - 40;
const FAMILY_CAR = { body: "#6E7F94", shade: "#5C6C80", line: "#4E5C6E" };
const MORNING_TONE = "rgba(255,240,215,0.10)";

// Двор школы. Общий план — забор на переднем плане, машина семьи на дороге.
// Средний/крупный план (near): камера во дворе — без забора, фасад дальше
// (масштаб far вокруг точки за героями), чтобы школа и люди сохраняли
// соотношение общего плана (дверь ≈ 1,5 роста ребёнка).
const Yard: React.FC<{ f: number; cam: Cam; children: React.ReactNode; car?: boolean; near?: { x: number; far: number } }> = ({ f, cam, children, car = true, near }) => (
  <Shot f={f} cam={cam} bg="#CFE4F3">
    {near ? (
      <div style={box({ left: 0, top: 0, width: 1, height: 1, transformOrigin: "0 0", transform: `translate(${near.x}px, ${SCHOOL.groundY - 170}px) scale(${near.far}) translate(${-SCHOOL.main.x}px, ${-SCHOOL.groundY}px)` })}>
        <SchoolBack />
      </div>
    ) : (
      <SchoolBack />
    )}
    {near ? <div style={box({ left: -1400, top: SCHOOL.groundY - 170, width: 4400, height: 1400, backgroundColor: "#D8D0C0" })} /> : null}
    {children}
    {near ? null : <Fence open={1} />}
    {near ? null : <SchoolStreet />}
    {car && !near ? <CarSide x={1500} y={SCHOOL.streetY + 150} s={1.3} layer="body" dir={1} paint={FAMILY_CAR} /> : null}
    <div style={box({ left: -1400, top: -1200, width: 4400, height: 4400, backgroundColor: MORNING_TONE })} />
  </Shot>
);

// ---------- 10 ----------
export const morningPlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "morning");
  const pull: [number, number] = [0, 46];
  const strap = Math.max(pull[1] + 30, T.word("N08", "Дарбазанын") - 4);
  const touch = strap + 18;
  const fix: [number, number] = [touch + 4, touch + 22];
  const letGo = fix[1] + 6;
  return { pull, strap, touch, fix, letGo, len: T.len };
};

const BOY_GATE: Place = { x: 360, y: YARD_Y, h: KID };
const DAD_GATE: Place = { x: 210, y: YARD_Y + 10, h: DAD };

export const MorningScene: React.FC = () => {
  const { f } = useScene("morning");
  const p = usePlan(morningPlan);
  if (f < p.strap) {
    const cam = camMove(f, p.pull[0], p.pull[1], { x: BOY_GATE.x + 34, y: BOY_GATE.y - 0.6 * KID, zoom: 4.2 }, { x: 640, y: 1430, zoom: 0.95 });
    return (
      <>
        <Yard f={f} cam={cam}>
          <Actor uid="m10-dad" look="km2Dad" f={f} place={() => DAD_GATE} face={() => 0.5} pose={() => ({ expr: "softSmile", lookY: 0.2 })} role="father" seed={2} />
          <Actor uid="m10-boy" look="km2BoySchool" f={f} place={() => BOY_GATE} face={() => -0.6} pose={() => ({ expr: "calm", strapTug: 0.9 })} role="boy" seed={9} />
        </Yard>
        <TimeCaption text={KM2_TEXT.nextMorning} t={f - 30} out={70} />
      </>
    );
  }
  // средний план: папа справа от сына поправляет правую на экране лямку
  const boy: Place = { x: 470, y: 1560, h: 600 };
  const dad: Place = { x: 700, y: 1580, h: 800 };
  const k = boy.h / 1000;
  const strapMid = { x: boy.x + 34 * k, y: boy.y - 640 * k };
  const hand = (t: number) => {
    const rest = { x: dad.x - 40, y: dad.y - 380 };
    const on = { x: strapMid.x + 8, y: strapMid.y - 6 };
    const lifted = { x: strapMid.x + 10, y: strapMid.y - 22 };
    if (t < p.touch) return { x: lerp(rest.x, on.x, clamp((t - p.strap) / (p.touch - p.strap))), y: lerp(rest.y, on.y, clamp((t - p.strap) / (p.touch - p.strap))) };
    if (t < p.fix[1]) return { x: lerp(on.x, lifted.x, Math.sin(Math.PI * clamp((t - p.fix[0]) / (p.fix[1] - p.fix[0])))), y: lerp(on.y, lifted.y, Math.sin(Math.PI * clamp((t - p.fix[0]) / (p.fix[1] - p.fix[0])))) };
    if (t < p.letGo) return on;
    return { x: lerp(on.x, rest.x, clamp((t - p.letGo) / 16)), y: lerp(on.y, rest.y, clamp((t - p.letGo) / 16)) };
  };
  const dadPose = (t: number): PoseIn => ({
    expr: "softSmile",
    lean: keys(t, [[p.strap, 0], [p.touch, 38], [p.letGo, 38], [p.letGo + 16, 6]]),
    nod: keys(t, [[p.strap, 0], [p.touch, 8], [p.letGo, 8], [p.letGo + 16, 0]]),
    lookY: 0.45,
    armL: t >= p.strap && t < p.letGo + 16 ? { target: hand(t), shape: t >= p.touch && t < p.letGo ? "pinch" : "open", elbow: "down", behind: false } : undefined,
  });
  const boyPose = (t: number): PoseIn => ({
    expr: "softSmile",
    lookY: -0.2,
    // перекрученная лямка расправляется под рукой и остаётся ровной
    strapTug: keys(t, [[p.fix[0], 0.9], [p.fix[1], 0]]),
    shoulders: keys(t, [[p.fix[0], 0], [p.fix[0] + 8, 0.15], [p.fix[1], 0]]),
  });
  return (
    <Yard f={f} cam={{ x: 590, y: 1180, zoom: 1.5 }} near={{ x: 420, far: 1.25 }}>
      <Actor uid="m10-boy2" look="km2BoySchool" f={f} place={() => boy} face={() => 0.5} pose={boyPose} role="boy" seed={9} />
      <Actor uid="m10-dad2" look="km2Dad" f={f} place={() => dad} face={() => -0.55} pose={dadPose} role="father" seed={2} />
    </Yard>
  );
};

// ---------- 11 ----------
export const introducePlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "introduce");
  const k05 = T.from("K05");
  const smile = k05 - 16;
  const two = T.to("K05") + 4;
  const nod = T.to("F02") + 6;
  return { k05, smile, two, nod, f02: T.from("F02"), len: T.len };
};

export const IntroduceScene: React.FC = () => {
  const { f } = useScene("introduce");
  const p = usePlan(introducePlan);
  const boy: Place = { x: 470, y: 1560, h: 600 };
  const dad: Place = { x: 700, y: 1580, h: 800 };
  const boyPose = (t: number): PoseIn => ({
    expr: t < p.smile ? "thinking" : t < p.smile + 10 ? "softSmile" : { browIn: 3, browOut: 3, lid: 0.1, smile: 0.6 },
    lookY: t < p.smile ? 0.3 : -0.25,
    nod: keys(t, [[p.nod, 0], [p.nod + 5, 7], [p.nod + 11, 0], [p.nod + 16, 5], [p.nod + 22, 0]]),
  });
  const dadPose = (t: number): PoseIn => ({
    expr: t > p.f02 - 6 ? "smile" : "softSmile",
    lean: 44,
    nod: 12,
    lookY: 0.2,
    armL: { target: { x: dad.x - 150, y: dad.y - 300 }, shape: "relax", elbow: "down", behind: false },
  });
  const scene = (cam: Cam) => (
    <Yard f={f} cam={cam} near={{ x: 420, far: 1.25 }}>
      <Actor uid="i11-boy" look="km2BoySchool" f={f} place={() => boy} face={(t) => keys(t, [[p.smile - 20, 0.15], [p.smile, 0.5]])} pose={boyPose} role="boy" seed={9} />
      <Actor uid="i11-dad" look="km2Dad" f={f} place={() => dad} face={() => -0.55} pose={dadPose} role="father" seed={2} />
    </Yard>
  );
  if (f < p.two) return scene({ x: 500, y: 1100, zoom: 2.6 });
  return scene({ x: 590, y: 1230, zoom: 1.75 });
};

// ---------- 12 ----------
export const entrancePlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "entrance");
  const walk: [number, number] = [10, 84];
  const turn = walk[1] + 4;
  const wave = turn + 10;
  return { walk, turn, wave, len: T.len };
};

export const EntranceScene: React.FC = () => {
  const { f } = useScene("entrance");
  const p = usePlan(entrancePlan);
  // от ворот по дорожке к крыльцу основного входа; дальше от камеры — меньше
  const boyPlace = (t: number): Place => {
    const u = cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3);
    return { x: lerp(BOY_GATE.x, SCHOOL.main.x - 150, u), y: lerp(YARD_Y, SCHOOL.groundY + 26, u), h: lerp(KID, KID * 0.86, u) };
  };
  const boyPose = (t: number): PoseIn => ({
    expr: "softSmile",
    armR: t > p.wave && t < p.wave + 30 ? { target: { x: boyPlace(t).x + 50 + 6 * Math.sin((t - p.wave) / 3), y: boyPlace(t).y - KID * 0.86 * 0.95 }, shape: "wave", elbow: "out" } : undefined,
  });
  return (
    <Yard f={f} cam={camMove(f, 0, p.len, { x: 600, y: 1430, zoom: 1.0 }, { x: 610, y: 1420, zoom: 1.04 })}>
      <Actor uid="e12-boy" look="km2BoySchool" f={f} place={boyPlace} face={(t) => keys(t, [[p.turn, 0.6], [p.turn + 12, -0.35]])} pose={boyPose} seed={9} walkFrom={0} />
      <Actor uid="e12-dad" look="km2Dad" f={f} place={() => DAD_GATE} face={() => 0.45} pose={() => ({ expr: "softSmile", lookY: 0 })} seed={2} />
    </Yard>
  );
};
